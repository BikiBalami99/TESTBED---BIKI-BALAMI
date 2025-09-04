"use client";

import React, { useState, useEffect } from "react";
import {
	AppIcon,
	DockIcon,
	AVAILABLE_APPS,
	AppInfo,
} from "@/features/OS/desktop/AppIcons/AppIcons";
import AppLauncher from "@/features/OS/desktop/AppLauncher/AppLauncher";
import DockPreview from "@/features/OS/desktop/AppIcons/DockPreview";
import ContextMenu, {
	createAppContextMenuItems,
	createDesktopContextMenuItems,
} from "@/features/OS/desktop/ContextMenu/ContextMenu";
import { useWindowManager } from "@/features/OS/OS";
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
	const [desktopApps, setDesktopApps] = useState<DesktopApp[]>([
		{ appId: "media-queries", x: 80, y: 80 },
		{ appId: "css-grid", x: 200, y: 80 },
		{ appId: "javascript-es6", x: 320, y: 80 },
	]);

	const [dockApps, setDockApps] = useState<DockApp[]>([
		{ appId: "media-queries" },
		{ appId: "css-grid" },
		{ appId: "javascript-es6" },
	]);

	const [isAppLauncherOpen, setIsAppLauncherOpen] = useState(false);
	const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set());
	const [hoveredDockApp, setHoveredDockApp] = useState<string | null>(null);

	// Context menu state
	const [contextMenu, setContextMenu] = useState<{
		isOpen: boolean;
		x: number;
		y: number;
		appId?: string;
		type: "desktop" | "dock" | "app";
	}>({
		isOpen: false,
		x: 0,
		y: 0,
		type: "desktop",
	});
	const {
		openOrFocusApp,
		createNewWindowForApp,
		getOpenedApps,
		getWindowsForApp,
		getAllWindowsForApp,
		getWindowForApp,
		getWindowById,
		focusWindow,
		restoreWindow,
		closeWindow,
	} = useWindowManager();

	// Get opened apps for dock state
	const openedApps = getOpenedApps();

	// Load user preferences from localStorage
	useEffect(() => {
		const savedDesktopApps = localStorage.getItem("desktopApps");
		const savedDockApps = localStorage.getItem("dockApps");

		if (savedDesktopApps) {
			setDesktopApps(JSON.parse(savedDesktopApps));
		}
		if (savedDockApps) {
			setDockApps(JSON.parse(savedDockApps));
		}
	}, []);

	// Save user preferences to localStorage
	useEffect(() => {
		localStorage.setItem("desktopApps", JSON.stringify(desktopApps));
	}, [desktopApps]);

	useEffect(() => {
		localStorage.setItem("dockApps", JSON.stringify(dockApps));
	}, [dockApps]);

	const handleDesktopAppClick = (app: AppInfo) => {
		if (selectedApps.has(app.id)) {
			setSelectedApps((prev) => {
				const newSet = new Set(prev);
				newSet.delete(app.id);
				return newSet;
			});
		} else {
			// Use the new single instance management
			openOrFocusApp(app.id, app.name, React.createElement(app.component));
		}
	};

	const handleDockAppClick = (app: AppInfo) => {
		// Use the new single instance management
		openOrFocusApp(app.id, app.name, React.createElement(app.component));
	};

	const handleDockAppHover = (appId: string) => {
		setHoveredDockApp(appId);
	};

	const handleDockAppLeave = () => {
		setHoveredDockApp(null);
	};

	const handleWindowClick = (windowId: string) => {
		// Get the window to check if it's minimized
		const window = getWindowById(windowId);

		if (window?.isMinimized) {
			restoreWindow(windowId);
		} else {
			focusWindow(windowId);
		}
		setHoveredDockApp(null);
	};

	const handleCloseWindow = (windowId: string) => {
		closeWindow(windowId);
	};

	// Context menu handlers
	const handleContextMenu = (
		e: React.MouseEvent,
		appId?: string,
		type: "desktop" | "dock" | "app" = "desktop"
	) => {
		e.preventDefault();
		console.log("Context menu triggered:", {
			appId,
			type,
			clientX: e.clientX,
			clientY: e.clientY,
		});
		setContextMenu({
			isOpen: true,
			x: e.clientX,
			y: e.clientY,
			appId,
			type,
		});
	};

	const closeContextMenu = () => {
		setContextMenu((prev) => ({ ...prev, isOpen: false }));
	};

	const handleNewWindow = (appId: string) => {
		const app = AVAILABLE_APPS.find((a) => a.id === appId);
		if (app) {
			createNewWindowForApp(appId, app.name, React.createElement(app.component));
		}
	};

	const handleCloseAllWindows = (appId: string) => {
		const windows = getAllWindowsForApp(appId);
		windows.forEach((window) => closeWindow(window.id));
	};

	// Desktop context menu handlers
	const handleNewFolder = () => {
		console.log("New folder clicked");
		// TODO: Implement new folder creation
	};

	const handleShowDesktop = () => {
		// Minimize all windows
		const allWindows = getAllWindowsForApp(""); // This won't work, need to get all windows
		// TODO: Implement show desktop functionality
		console.log("Show desktop clicked");
	};

	const handleDesktopContextMenu = (e: React.MouseEvent, app: DesktopApp) => {
		e.stopPropagation();
		handleContextMenu(e, app.appId, "app");
	};

	const handleDesktopDoubleClick = (e: React.MouseEvent) => {
		// Open app launcher on double click in empty space
		if (e.target === e.currentTarget) {
			setIsAppLauncherOpen(true);
		}
	};

	const addToDock = (appId: string) => {
		if (!dockApps.find((dockApp) => dockApp.appId === appId)) {
			setDockApps((prev) => [...prev, { appId }]);
		}
	};

	const removeFromDock = (appId: string) => {
		setDockApps((prev) => prev.filter((dockApp) => dockApp.appId !== appId));
	};

	const addToDesktop = (appId: string) => {
		if (!desktopApps.find((desktopApp) => desktopApp.appId === appId)) {
			setDesktopApps((prev) => [
				...prev,
				{
					appId,
					x: Math.random() * 400 + 100,
					y: Math.random() * 300 + 100,
				},
			]);
		}
	};

	const removeFromDesktop = (appId: string) => {
		setDesktopApps((prev) => prev.filter((desktopApp) => desktopApp.appId !== appId));
	};

	return (
		<div
			className={styles.desktop}
			onDoubleClick={handleDesktopDoubleClick}
			onContextMenu={(e) => handleContextMenu(e, undefined, "desktop")}
		>
			{/* Desktop App Icons */}
			{desktopApps.map((desktopApp) => {
				const app = AVAILABLE_APPS.find((a) => a.id === desktopApp.appId);
				if (!app) return null;

				return (
					<div
						key={desktopApp.appId}
						className={styles.desktopApp}
						style={{
							left: desktopApp.x,
							top: desktopApp.y,
						}}
						onContextMenu={(e) => handleDesktopContextMenu(e, desktopApp)}
					>
						<AppIcon app={app} size="medium" onClick={() => handleDesktopAppClick(app)} />
					</div>
				);
			})}

			{/* Dock */}
			<div className={styles.dock}>
				{/* App Launcher Icon */}
				<div
					className={styles.appLauncherIcon}
					onClick={() => setIsAppLauncherOpen(true)}
					title="App Launcher"
				>
					<div className={styles.launcherGrid}>
						<div className={styles.launcherDot}></div>
						<div className={styles.launcherDot}></div>
						<div className={styles.launcherDot}></div>
						<div className={styles.launcherDot}></div>
					</div>
				</div>

				{/* Dock Apps */}
				{dockApps.map((dockApp) => {
					const app = AVAILABLE_APPS.find((a) => a.id === dockApp.appId);
					if (!app) return null;

					const existingWindow = getWindowForApp(app.id);
					const isActive = existingWindow !== null;
					const appWindows = getAllWindowsForApp(app.id); // Use getAllWindowsForApp to include minimized windows
					const showPreview = hoveredDockApp === app.id && appWindows.length > 0;

					return (
						<div
							key={dockApp.appId}
							onContextMenu={(e) => {
								e.stopPropagation();
								handleContextMenu(e, app.id, "dock");
							}}
						>
							<DockIcon
								app={app}
								onClick={() => handleDockAppClick(app)}
								onMouseEnter={() => handleDockAppHover(app.id)}
								onMouseLeave={handleDockAppLeave}
								isActive={isActive}
								showPreview={showPreview}
								previewContent={
									showPreview ? (
										<DockPreview
											app={app}
											windows={appWindows}
											onWindowClick={handleWindowClick}
											onCloseWindow={handleCloseWindow}
											position="center"
										/>
									) : null
								}
							/>
						</div>
					);
				})}
			</div>

			{/* App Launcher */}
			<AppLauncher
				isOpen={isAppLauncherOpen}
				onClose={() => setIsAppLauncherOpen(false)}
			/>

			{/* Context Menu */}
			<ContextMenu
				isOpen={contextMenu.isOpen}
				x={contextMenu.x}
				y={contextMenu.y}
				items={(() => {
					console.log("Context menu state:", contextMenu);
					if (contextMenu.type === "app" && contextMenu.appId) {
						console.log("Showing app context menu for:", contextMenu.appId);
						return createAppContextMenuItems(
							contextMenu.appId,
							() => handleNewWindow(contextMenu.appId!),
							() => handleCloseAllWindows(contextMenu.appId!),
							getAllWindowsForApp(contextMenu.appId).length > 0
						);
					} else if (contextMenu.type === "dock" && contextMenu.appId) {
						console.log("Showing dock context menu for:", contextMenu.appId);
						return createAppContextMenuItems(
							contextMenu.appId,
							() => handleNewWindow(contextMenu.appId!),
							() => handleCloseAllWindows(contextMenu.appId!),
							getAllWindowsForApp(contextMenu.appId).length > 0
						);
					} else {
						console.log("Showing desktop context menu");
						return createDesktopContextMenuItems(handleNewFolder, handleShowDesktop);
					}
				})()}
				onClose={closeContextMenu}
			/>

			{/* Menu Bar */}
			<div className={styles.menuBar}>
				<div className={styles.menuBarLeft}>
					<span className={styles.menuItem}>Dev Collection</span>
				</div>
				<div className={styles.menuBarRight}>
					<span className={styles.time}>
						{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
					</span>
				</div>
			</div>
		</div>
	);
}
