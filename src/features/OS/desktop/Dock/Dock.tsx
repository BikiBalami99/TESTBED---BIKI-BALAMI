"use client";

import React, { useState, useCallback } from "react";
import { AVAILABLE_APPS, AppInfo } from "../AppIcons/AppIcons";
import DockPreview from "../AppIcons/DockPreview";
import DockItem from "./DockItem/DockItem";
import { useWindowManager } from "../../OS";
import styles from "./Dock.module.css";

interface DockApp {
	appId: string;
}

interface DockProps {
	dockApps: DockApp[];
	onAppClick: (app: AppInfo) => void;
	onContextMenu: (e: React.MouseEvent, appId: string) => void;
	onAppLauncherClick: () => void;
}

export default function Dock({
	dockApps,
	onAppClick,
	onContextMenu,
	onAppLauncherClick,
}: DockProps) {
	const [hoveredDockApp, setHoveredDockApp] = useState<string | null>(null);
	const {
		getWindowForApp,
		getAllWindowsForApp,
		focusWindow,
		restoreWindow,
		closeWindow,
	} = useWindowManager();

	const handleDockAppHover = useCallback((appId: string) => {
		setHoveredDockApp(appId);
	}, []);

	const handleDockAppLeave = useCallback(() => {
		setHoveredDockApp(null);
	}, []);

	const handleWindowClick = useCallback(
		(windowId: string) => {
			// Get the window to check if it's minimized
			const window = getWindowForApp(windowId);

			if (window?.isMinimized) {
				restoreWindow(windowId);
			} else {
				focusWindow(windowId);
			}
			setHoveredDockApp(null);
		},
		[getWindowForApp, restoreWindow, focusWindow]
	);

	const handleCloseWindow = useCallback(
		(windowId: string) => {
			closeWindow(windowId);
		},
		[closeWindow]
	);

	return (
		<div className={styles.dock}>
			{/* App Launcher Icon */}
			<div
				className={styles.appLauncherIcon}
				onClick={onAppLauncherClick}
				title="App Launcher"
			>
				<div className={styles.appLauncherIconWrapper}>
					<div className={styles.launcherGrid}>
						<div className={styles.launcherDot}></div>
						<div className={styles.launcherDot}></div>
						<div className={styles.launcherDot}></div>
						<div className={styles.launcherDot}></div>
					</div>
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
							onContextMenu(e, app.id);
						}}
					>
						<DockItem
							app={app}
							onClick={() => onAppClick(app)}
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
	);
}
