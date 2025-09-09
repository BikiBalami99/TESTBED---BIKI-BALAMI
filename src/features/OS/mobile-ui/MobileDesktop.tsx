"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AVAILABLE_APPS, AppIcon } from "../desktop/AppIcons/AppIcons";
import { DESKTOP_APPS } from "../desktop/data";
import { useWindowManager } from "../OS";
import styles from "./MobileDesktop.module.css";

interface DesktopApp {
	appId: string;
	x: number;
	y: number;
}

interface MobileDesktopProps {
	onAppLaunch: (appId: string) => void;
}

export default function MobileDesktop({ onAppLaunch }: MobileDesktopProps) {
	const { getAllWindowsForApp } = useWindowManager();
	const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set());

	// Smart responsive grid positioning
	const calculateMobilePositions = useCallback(() => {
		if (typeof window === "undefined")
			return DESKTOP_APPS.map((app) => ({ appId: app.appId, x: app.x, y: app.y }));

		const screenWidth = window.innerWidth;
		const screenHeight = window.innerHeight;
		const menuBarHeight = 44; // Mobile menu bar height
		const dockHeight = 80; // Mobile dock height
		const availableHeight = screenHeight - menuBarHeight - dockHeight;

		// Icon dimensions
		const iconSize = screenWidth < 480 ? 60 : 80;
		const padding = screenWidth < 480 ? 16 : 24;

		// Calculate grid
		const cols = Math.floor((screenWidth - padding * 2) / iconSize);
		const rows = Math.floor((availableHeight - padding * 2) / iconSize);

		// Center the grid
		const totalGridWidth = cols * iconSize;
		const totalGridHeight = rows * iconSize;
		const startX = (screenWidth - totalGridWidth) / 2;
		const startY = menuBarHeight + (availableHeight - totalGridHeight) / 2;

		return DESKTOP_APPS.map((app, index) => {
			const row = Math.floor(index / cols);
			const col = index % cols;

			// If we exceed available rows, wrap to next column set
			if (row >= rows) {
				const newIndex = index % (cols * rows);
				const newRow = Math.floor(newIndex / cols);
				const newCol = newIndex % cols;
				return {
					appId: app.appId,
					x: startX + newCol * iconSize,
					y: startY + newRow * iconSize,
				};
			}

			return {
				appId: app.appId,
				x: startX + col * iconSize,
				y: startY + row * iconSize,
			};
		});
	}, []);

	const [desktopApps, setDesktopApps] = useState<DesktopApp[]>(() =>
		calculateMobilePositions()
	);

	// Recalculate positions on resize
	useEffect(() => {
		const handleResize = () => {
			setDesktopApps(calculateMobilePositions());
		};

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, [calculateMobilePositions]);

	// Load saved positions (merge with calculated positions)
	useEffect(() => {
		const savedApps = localStorage.getItem("mobileDesktopApps");
		if (savedApps) {
			try {
				// For mobile, we'll use calculated positions but could allow customization later
				setDesktopApps(calculateMobilePositions());
			} catch {
				setDesktopApps(calculateMobilePositions());
			}
		}
	}, [calculateMobilePositions]);

	const handleAppClick = useCallback(
		(appId: string) => {
			onAppLaunch(appId);
		},
		[onAppLaunch]
	);

	const handleAppLongPress = useCallback((appId: string) => {
		// Toggle selection for future features (like organizing)
		setSelectedApps((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(appId)) {
				newSet.delete(appId);
			} else {
				newSet.add(appId);
			}
			return newSet;
		});
	}, []);

	return (
		<div className={styles.mobileDesktop}>
			{desktopApps.map((desktopApp) => {
				const app = AVAILABLE_APPS.find((a) => a.id === desktopApp.appId);
				if (!app) return null;

				const appWindows = getAllWindowsForApp(app.id);
				const isActive = appWindows.length > 0;
				const isSelected = selectedApps.has(app.id);

				return (
					<div
						key={desktopApp.appId}
						className={`${styles.desktopApp} ${isActive ? styles.active : ""} ${
							isSelected ? styles.selected : ""
						}`}
						style={{
							left: desktopApp.x,
							top: desktopApp.y,
						}}
						onClick={() => handleAppClick(app.id)}
						onContextMenu={(e) => {
							e.preventDefault();
							handleAppLongPress(app.id);
						}}
					>
						<AppIcon
							app={app}
							size={window.innerWidth < 480 ? "small" : "medium"}
							variant={app.id === "features-checklist" ? "featured" : "default"}
						/>

						{/* Active indicator dot */}
						{isActive && <div className={styles.activeDot} />}
					</div>
				);
			})}
		</div>
	);
}
