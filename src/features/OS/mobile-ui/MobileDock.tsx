"use client";

import React, { useState, useCallback } from "react";
import { AVAILABLE_APPS, AppInfo } from "../desktop/AppIcons/AppIcons";
import { DOCK_APPS } from "../desktop/data";
import { useWindowManager } from "../OS";
import DockItem from "../desktop/Dock/DockItem/DockItem";
import styles from "./MobileDock.module.css";

interface MobileDockProps {
	onAppLaunch: (appId: string) => void;
}

export default function MobileDock({ onAppLaunch }: MobileDockProps) {
	// Removed hoveredApp state since DockItem handles its own hover states
	const { getWindowForApp, focusWindow, restoreWindow, windows } = useWindowManager();

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
						<DockItem
							key={appLauncher.id}
							app={appLauncher}
							onClick={() => handleAppClick(appLauncher)}
							isActive={isActive}
							// Hover states handled by DockItem component
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
						<DockItem
							key={dockApp.appId}
							app={app}
							onClick={() => handleAppClick(app)}
							isActive={isActive}
							// Hover states handled by DockItem component
						/>
					);
				})}
			</div>

			{/* Recent Apps indicator */}
			{windows.some((w) => w.isMinimized) && (
				<div className={styles.recentIndicator}>
					<div className={styles.recentDot} />
				</div>
			)}
		</div>
	);
}
