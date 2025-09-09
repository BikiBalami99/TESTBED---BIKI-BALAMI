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
}

export default function Dock({ dockApps, onAppClick, onContextMenu }: DockProps) {
	const [hoveredDockApp, setHoveredDockApp] = useState<string | null>(null);
	const {
		getWindowForApp,
		getAllWindowsForApp,
		focusWindow,
		restoreWindow,
		closeWindow,
		getCurrentMaxZIndex,
	} = useWindowManager();

	const handleDockAppHover = useCallback(
		(appId: string) => {
			const maxZ = getCurrentMaxZIndex();
			console.log("[Dock] hover app →", { appId, maxZ });
			setHoveredDockApp(appId);
		},
		[getCurrentMaxZIndex]
	);

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
			{/* App Launcher as a DockItem - Special Case: No Preview, Single Instance */}
			{(() => {
				const appLauncher = AVAILABLE_APPS.find((app) => app.id === "app-launcher");
				if (!appLauncher) return null;

				const existingWindow = getWindowForApp(appLauncher.id);
				const isActive = existingWindow !== null;
				// App Launcher special case: Never show preview
				const showPreview = false;

				return (
					<div
						onContextMenu={(e) => {
							e.stopPropagation();
							// App Launcher special case: Only provide basic context menu without "New Window"
							onContextMenu(e, appLauncher.id);
						}}
					>
						<DockItem
							app={appLauncher}
							onClick={() => onAppClick(appLauncher)}
							onMouseEnter={() => handleDockAppHover(appLauncher.id)}
							onMouseLeave={handleDockAppLeave}
							isActive={isActive}
							showPreview={showPreview}
							previewContent={null}
						/>
					</div>
				);
			})()}

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
										maxZIndex={(() => {
											const z = getCurrentMaxZIndex();
											console.log("[Dock] pass maxZIndex to preview", z);
											return z;
										})()}
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
