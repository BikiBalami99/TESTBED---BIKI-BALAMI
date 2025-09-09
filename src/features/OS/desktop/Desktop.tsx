"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { createPortal } from "react-dom";
import { AVAILABLE_APPS, AppInfo } from "./AppIcons/AppIcons";
import ContextMenu from "./ContextMenu/ContextMenu";
import { useWindowManager } from "../OS";
import { useContextMenu } from "./hooks/useContextMenu";
import DesktopApps from "./DesktopApps/DesktopApps";
import Dock from "./Dock/Dock";
import MenuBar from "./MenuBar/MenuBar";
import {
	DESKTOP_APPS,
	DOCK_APPS,
	logConfigValidation,
	// type DesktopAppConfig,
	// type DockAppConfig,
} from "./data";
import styles from "./Desktop.module.css";

interface DesktopApp {
	appId: string;
	x: number;
	y: number;
}

interface DockApp {
	appId: string;
}

export default function Desktop() {
	// Validate configuration on component mount
	useEffect(() => {
		logConfigValidation();
	}, []);

	// Snap positions to grid (64px grid)
	const snapToGrid = (x: number, y: number) => {
		const gridSize = 64;
		return {
			x: Math.round(x / gridSize) * gridSize,
			y: Math.round(y / gridSize) * gridSize,
		};
	};

	// Initialize desktop apps from centralized configuration
	const [desktopApps, setDesktopApps] = useState<DesktopApp[]>(() =>
		DESKTOP_APPS.map((app) => ({
			appId: app.appId,
			...snapToGrid(app.x, app.y),
		}))
	);

	// Initialize dock apps from centralized configuration
	const [dockApps, setDockApps] = useState<DockApp[]>(() =>
		DOCK_APPS.map((app) => ({ appId: app.appId }))
	);

	// Defer portal rendering until mounted to avoid hydration mismatch
	const [isMounted, setIsMounted] = useState(false);
	useEffect(() => {
		setIsMounted(true);
	}, []);

	const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set());

	const {
		openOrFocusApp,
		createNewWindowForApp,
		getAllWindowsForApp,
		closeWindow,
		minimizeWindow,
		windows,
	} = useWindowManager();

	// Load user preferences from localStorage and merge with centralized configuration
	useEffect(() => {
		const savedDesktopApps = localStorage.getItem("desktopApps");
		const savedDockApps = localStorage.getItem("dockApps");

		if (savedDesktopApps) {
			try {
				const parsedDesktopApps = JSON.parse(savedDesktopApps);
				// Merge saved positions with centralized configuration
				const mergedDesktopApps = DESKTOP_APPS.map((configApp) => {
					const savedApp = parsedDesktopApps.find(
						(saved: DesktopApp) => saved.appId === configApp.appId
					);
					return savedApp
						? savedApp
						: { appId: configApp.appId, ...snapToGrid(configApp.x, configApp.y) };
				});
				setDesktopApps(mergedDesktopApps);
			} catch {
				console.warn("Failed to parse saved desktop apps, using default configuration");
			}
		}

		if (savedDockApps) {
			try {
				const parsedDockApps = JSON.parse(savedDockApps);
				// Merge saved dock apps with centralized configuration
				const mergedDockApps = DOCK_APPS.map((configApp) => {
					const savedApp = parsedDockApps.find(
						(saved: DockApp) => saved.appId === configApp.appId
					);
					return savedApp ? savedApp : { appId: configApp.appId };
				});
				setDockApps(mergedDockApps);
			} catch {
				console.warn("Failed to parse saved dock apps, using default configuration");
			}
		}
	}, []);

	// Save user preferences to localStorage
	useEffect(() => {
		localStorage.setItem("desktopApps", JSON.stringify(desktopApps));
	}, [desktopApps]);

	useEffect(() => {
		localStorage.setItem("dockApps", JSON.stringify(dockApps));
	}, [dockApps]);

	// Context menu handlers
	const handleNewWindow = useCallback(
		(appId: string) => {
			const app = AVAILABLE_APPS.find((a) => a.id === appId);
			if (app) {
				createNewWindowForApp(
					appId,
					app.name,
					<Suspense fallback={<div>Loading...</div>}>
						{React.createElement(app.component)}
					</Suspense>
				);
			}
		},
		[createNewWindowForApp]
	);

	const handleCloseAllWindows = useCallback(
		(appId: string) => {
			const windows = getAllWindowsForApp(appId);
			windows.forEach((window) => closeWindow(window.id));
		},
		[getAllWindowsForApp, closeWindow]
	);

	// Calculate dock icon position for an app
	const getDockIconPosition = useCallback(
		(appId: string) => {
			// Find the specific dock icon element
			const dockAppIndex = dockApps.findIndex((app) => app.appId === appId);

			// Try to get the actual dock icon element
			const dockElement = document.querySelector(`.${styles.dock}`);
			if (!dockElement) {
				// Fallback position at bottom center
				return {
					x: window.innerWidth / 2,
					y: window.innerHeight - 30,
				};
			}

			const dockRect = dockElement.getBoundingClientRect();

			if (dockAppIndex === -1) {
				// If app not in dock, return center of dock
				return {
					x: dockRect.left + dockRect.width / 2,
					y: dockRect.top + 24, // Half of dock height
				};
			}

			// More accurate calculation based on actual layout
			// Account for launcher icon (48px + 16px gap) and each dock app (48px + 8px margin)
			const launcherOffset = 64; // 48px icon + 16px gap
			const iconSize = 48;
			const iconMargin = 8;
			const dockPadding = 12; // Dock internal padding

			// Calculate the center of the specific icon
			const iconCenterX =
				dockRect.left +
				dockPadding +
				launcherOffset +
				dockAppIndex * (iconSize + iconMargin) +
				iconSize / 2;
			const iconCenterY = dockRect.top + 24; // Center of dock (assuming 48px height)

			return { x: iconCenterX, y: iconCenterY };
		},
		[dockApps]
	);

	// Desktop context menu handlers
	const handleShowDesktop = useCallback(() => {
		// Minimize all visible windows
		const visibleWindows = windows.filter((w) => !w.isMinimized);
		visibleWindows.forEach((window) => {
			const dockPosition = window.appId ? getDockIconPosition(window.appId) : undefined;
			minimizeWindow(window.id, dockPosition);
		});
	}, [windows, getDockIconPosition, minimizeWindow]);

	// Context menu hook
	const { contextMenu, handleContextMenu, closeContextMenu, getContextMenuItems } =
		useContextMenu({
			onNewWindow: handleNewWindow,
			onCloseAllWindows: handleCloseAllWindows,
			onShowDesktop: handleShowDesktop,
			getAllWindowsForApp,
		});

	// App click handlers
	const handleDesktopAppClick = useCallback(
		(app: AppInfo) => {
			if (selectedApps.has(app.id)) {
				setSelectedApps((prev) => {
					const newSet = new Set(prev);
					newSet.delete(app.id);
					return newSet;
				});
			} else {
				// Use the new single instance management
				openOrFocusApp(
					app.id,
					app.name,
					<Suspense fallback={<div>Loading...</div>}>
						{React.createElement(app.component)}
					</Suspense>
				);
			}
		},
		[selectedApps, openOrFocusApp]
	);

	const handleDockAppClick = useCallback(
		(app: AppInfo) => {
			// Use the new single instance management
			openOrFocusApp(
				app.id,
				app.name,
				<Suspense fallback={<div>Loading...</div>}>
					{React.createElement(app.component)}
				</Suspense>
			);
		},
		[openOrFocusApp]
	);

	// App position change handler
	const handleAppPositionChange = useCallback((appId: string, x: number, y: number) => {
		setDesktopApps((prev) =>
			prev.map((app) => (app.appId === appId ? { ...app, x, y } : app))
		);
	}, []);

	// Context menu handlers
	const handleDesktopContextMenu = useCallback(
		(e: React.MouseEvent, app: DesktopApp) => {
			e.stopPropagation();
			handleContextMenu(e, app.appId, "app");
		},
		[handleContextMenu]
	);

	const handleDockContextMenu = useCallback(
		(e: React.MouseEvent, appId: string) => {
			handleContextMenu(e, appId, "dock");
		},
		[handleContextMenu]
	);

	const handleDesktopBackgroundContextMenu = useCallback(
		(e: React.MouseEvent) => {
			handleContextMenu(e, undefined, "desktop");
		},
		[handleContextMenu]
	);

	const handleDesktopDoubleClick = useCallback(
		(e: React.MouseEvent) => {
			// Open app launcher on double click in empty space
			if (e.target === e.currentTarget) {
				const appLauncher = AVAILABLE_APPS.find((app) => app.id === "app-launcher");
				if (appLauncher) {
					openOrFocusApp(
						appLauncher.id,
						appLauncher.name,
						React.createElement(appLauncher.component)
					);
				}
			}
		},
		[openOrFocusApp]
	);

	return (
		<>
			{/* Desktop Layer - Background and desktop icons */}
			<div
				className={styles.desktop}
				onDoubleClick={handleDesktopDoubleClick}
				onContextMenu={handleDesktopBackgroundContextMenu}
			>
				{/* Desktop App Icons */}
				<DesktopApps
					desktopApps={desktopApps}
					selectedApps={selectedApps}
					onAppPositionChange={handleAppPositionChange}
					onAppClick={handleDesktopAppClick}
					onContextMenu={handleDesktopContextMenu}
				/>

				{/* Context Menu */}
				<ContextMenu
					isOpen={contextMenu.isOpen}
					x={contextMenu.x}
					y={contextMenu.y}
					items={getContextMenuItems()}
					onClose={closeContextMenu}
				/>
			</div>

			{/* System UI Layer - Always on top via portal */}
			{isMounted
				? createPortal(
						<>
							{/* Menu Bar */}
							<MenuBar />

							{/* Dock */}
							<Dock
								dockApps={dockApps}
								onAppClick={handleDockAppClick}
								onContextMenu={handleDockContextMenu}
							/>
						</>,
						document.getElementById("system-ui-layer") as HTMLElement
				  )
				: null}
		</>
	);
}
