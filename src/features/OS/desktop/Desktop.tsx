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
	const {
		openOrFocusApp,
		getOpenedApps,
		getWindowsForApp,
		getWindowForApp,
		focusWindow,
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
		focusWindow(windowId);
		setHoveredDockApp(null);
	};

	const handleCloseWindow = (windowId: string) => {
		closeWindow(windowId);
	};

	const handleDesktopContextMenu = (e: React.MouseEvent, app: DesktopApp) => {
		e.preventDefault();
		// Could add context menu here for removing apps from desktop
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
		<div className={styles.desktop} onDoubleClick={handleDesktopDoubleClick}>
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
					const appWindows = getWindowsForApp(app.id);
					const showPreview = hoveredDockApp === app.id && appWindows.length > 0;

					return (
						<DockIcon
							key={dockApp.appId}
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
					);
				})}
			</div>

			{/* App Launcher */}
			<AppLauncher
				isOpen={isAppLauncherOpen}
				onClose={() => setIsAppLauncherOpen(false)}
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
