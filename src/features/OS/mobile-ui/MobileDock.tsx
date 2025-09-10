"use client";

import React, { useCallback } from "react";
import { AVAILABLE_APPS, AppInfo, AppIcon } from "../desktop/AppIcons/AppIcons";
import { DOCK_APPS } from "../desktop/data";
import { useWindowManager } from "../OS";
import styles from "./MobileDock.module.css";

interface MobileDockProps {
	onAppLaunch: (appId: string) => void;
}

export default function MobileDock({ onAppLaunch }: MobileDockProps) {
	// Removed hoveredApp state since DockItem handles its own hover states
	const { getWindowForApp, focusWindow, restoreWindow } = useWindowManager();

	const handleAppClick = useCallback(
		(app: AppInfo) => {
			const existingWindow = getWindowForApp(app.id);

			if (existingWindow) {
				if (existingWindow.isMinimized) {
					restoreWindow(existingWindow.id);
				} else {
					focusWindow(existingWindow.id);
				}
			} else {
				onAppLaunch(app.id);
			}
		},
		[getWindowForApp, restoreWindow, focusWindow, onAppLaunch]
	);

	// Removed hover handlers since DockItem handles its own hover states

	return (
		<div className={styles.mobileDock}>
			<div className={styles.dockScrollContainer}>
				{/* App Launcher (Special Case) */}
				{(() => {
					const appLauncher = AVAILABLE_APPS.find((app) => app.id === "app-launcher");
					if (!appLauncher) return null;

					const existingWindow = getWindowForApp(appLauncher.id);
					const isActive = existingWindow !== null;

					return (
						<AppIcon
							key={appLauncher.id}
							app={appLauncher}
							size="dock"
							onClick={() => handleAppClick(appLauncher)}
							isActive={isActive}
						/>
					);
				})()}

				{/* Dock Apps */}
				{DOCK_APPS.map((dockApp) => {
					const app = AVAILABLE_APPS.find((a) => a.id === dockApp.appId);
					if (!app) return null;

					const existingWindow = getWindowForApp(app.id);
					const isActive = existingWindow !== null;

					return (
						<AppIcon
							key={dockApp.appId}
							app={app}
							size="dock"
							onClick={() => handleAppClick(app)}
							isActive={isActive}
						/>
					);
				})}
			</div>
		</div>
	);
}
