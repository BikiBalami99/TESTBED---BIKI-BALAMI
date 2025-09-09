"use client";

import React, { useState, useCallback } from "react";
// Removed unused Home import
import { AVAILABLE_APPS, AppInfo } from "../desktop/AppIcons/AppIcons";
import { DOCK_APPS } from "../desktop/data";
import { useWindowManager } from "../OS";
import styles from "./MobileDock.module.css";

interface MobileDockProps {
	onAppLaunch: (appId: string) => void;
}

export default function MobileDock({ onAppLaunch }: MobileDockProps) {
	const [hoveredApp, setHoveredApp] = useState<string | null>(null);
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

	const handleAppHover = useCallback((appId: string) => {
		setHoveredApp(appId);
	}, []);

	const handleAppLeave = useCallback(() => {
		setHoveredApp(null);
	}, []);

	return (
		<div className={styles.mobileDock}>
			<div className={styles.dockScrollContainer}>
				{/* App Launcher (Special Case) */}
				{(() => {
					const appLauncher = AVAILABLE_APPS.find((app) => app.id === "app-launcher");
					if (!appLauncher) return null;

					const existingWindow = getWindowForApp(appLauncher.id);
					const isActive = existingWindow !== null;
					const IconComponent = appLauncher.icon;

					return (
						<button
							key={appLauncher.id}
							className={`${styles.dockItem} ${isActive ? styles.active : ""} ${
								hoveredApp === appLauncher.id ? styles.hovered : ""
							}`}
							onClick={() => handleAppClick(appLauncher)}
							onMouseEnter={() => handleAppHover(appLauncher.id)}
							onMouseLeave={handleAppLeave}
							title={appLauncher.name}
						>
							<div className={styles.appIcon}>
								<IconComponent size={28} />
							</div>
							{isActive && <div className={styles.activeDot} />}
						</button>
					);
				})()}

				{/* Dock Apps */}
				{DOCK_APPS.map((dockApp) => {
					const app = AVAILABLE_APPS.find((a) => a.id === dockApp.appId);
					if (!app) return null;

					const existingWindow = getWindowForApp(app.id);
					const isActive = existingWindow !== null;
					const IconComponent = app.icon;

					return (
						<button
							key={dockApp.appId}
							className={`${styles.dockItem} ${isActive ? styles.active : ""} ${
								hoveredApp === app.id ? styles.hovered : ""
							}`}
							onClick={() => handleAppClick(app)}
							onMouseEnter={() => handleAppHover(app.id)}
							onMouseLeave={handleAppLeave}
							title={app.name}
						>
							<div className={styles.appIcon}>
								<IconComponent size={28} />
							</div>
							{isActive && <div className={styles.activeDot} />}
						</button>
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
