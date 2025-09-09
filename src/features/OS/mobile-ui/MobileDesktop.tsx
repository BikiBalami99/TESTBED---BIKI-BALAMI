"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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
	isJiggleMode: boolean;
}

export default function MobileDesktop({ onAppLaunch, isJiggleMode }: MobileDesktopProps) {
	const { getAllWindowsForApp } = useWindowManager();
	// const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set()); // For future features
	const [draggedApp, setDraggedApp] = useState<string | null>(null);
	const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
	const [snapIndicator, setSnapIndicator] = useState({ visible: false, x: 0, y: 0 });
	const dragStartPos = useRef({ x: 0, y: 0 });

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

	const [desktopApps, setDesktopApps] = useState<DesktopApp[]>([]);

	// Handle app position changes
	const handleAppPositionChange = useCallback((appId: string, x: number, y: number) => {
		setDesktopApps((prev) =>
			prev.map((app) => (app.appId === appId ? { ...app, x, y } : app))
		);
	}, []);

	// Save positions to localStorage whenever they change
	useEffect(() => {
		if (desktopApps.length > 0) {
			
			localStorage.setItem("mobileDesktopApps", JSON.stringify(desktopApps));
		}
	}, [desktopApps]);

	// Load saved positions from localStorage on mount
	useEffect(() => {
		
		const savedApps = localStorage.getItem("mobileDesktopApps");

		if (savedApps) {
			try {
				const parsedApps = JSON.parse(savedApps);

				if (Array.isArray(parsedApps) && parsedApps.length > 0) {
					const requiredAppIds = DESKTOP_APPS.map((app) => app.appId);
					const hasAllApps = requiredAppIds.every((appId) =>
						parsedApps.some((app: DesktopApp) => app.appId === appId)
					);

					if (hasAllApps) {
						
						setDesktopApps(parsedApps);
						return; // Don't recalculate if we have valid saved data
					}
				}
			} catch (error) {
				console.warn("Failed to parse saved mobile app positions:", error);
			}
		}

		// Only calculate default positions if no valid saved data
		
		setDesktopApps(calculateMobilePositions());
	}, [calculateMobilePositions]); // Include calculateMobilePositions in dependencies

	// Recalculate positions on resize (but preserve saved positions if they exist)
	useEffect(() => {
		const handleResize = () => {
			// Check if we have saved positions first
			const savedApps = localStorage.getItem("mobileDesktopApps");
			if (savedApps) {
				try {
					const parsedApps = JSON.parse(savedApps);
					if (Array.isArray(parsedApps) && parsedApps.length > 0) {
						// Keep saved positions, don't recalculate
						return;
					}
				} catch {
					// If parsing fails, fall back to calculation
				}
			}

			// Only recalculate if no saved positions
			setDesktopApps(calculateMobilePositions());
		};

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, [calculateMobilePositions]);

	// Jiggle mode drag handlers
	const handleTouchStart = useCallback(
		(e: React.TouchEvent, appId: string) => {
			if (!isJiggleMode) {
				// Normal tap - open app
				onAppLaunch(appId);
				return;
			}

			// Jiggle mode - start drag
			const touch = e.touches[0];
			const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
			const app = desktopApps.find((a) => a.appId === appId);
			if (!app) return;

			setDraggedApp(appId);
			dragStartPos.current = { x: touch.clientX, y: touch.clientY };
			setDragOffset({ x: touch.clientX - rect.left, y: touch.clientY - rect.top });
		},
		[isJiggleMode, onAppLaunch, desktopApps]
	);

	const handleTouchMove = useCallback(
		(e: TouchEvent) => {
			if (!draggedApp) return;

			e.preventDefault();
			const touch = e.touches[0];

			// Calculate position directly from touch position minus offset
			const newX = touch.clientX - dragOffset.x;
			const newY = touch.clientY - dragOffset.y;

			// Update position
			handleAppPositionChange(draggedApp, newX, newY);

			// Show snap indicator
			const iconSize = window.innerWidth < 480 ? 60 : 80;
			const snapX = Math.round(newX / iconSize) * iconSize;
			const snapY = Math.round(newY / iconSize) * iconSize;

			setSnapIndicator({
				visible: true,
				x: Math.max(20, Math.min(snapX, window.innerWidth - iconSize)),
				y: Math.max(64, Math.min(snapY, window.innerHeight - iconSize - 100)),
			});
		},
		[draggedApp, dragOffset, handleAppPositionChange]
	);

	const handleTouchEnd = useCallback(
		(e: TouchEvent) => {
			if (!draggedApp) return;

			// Snap to grid
			const iconSize = window.innerWidth < 480 ? 60 : 80;
			const finalX = e.changedTouches[0].clientX - dragOffset.x;
			const finalY = e.changedTouches[0].clientY - dragOffset.y;

			const snapX = Math.round(finalX / iconSize) * iconSize;
			const snapY = Math.round(finalY / iconSize) * iconSize;

			const constrainedX = Math.max(20, Math.min(snapX, window.innerWidth - iconSize));
			const constrainedY = Math.max(
				64,
				Math.min(snapY, window.innerHeight - iconSize - 100)
			);

			handleAppPositionChange(draggedApp, constrainedX, constrainedY);

			// Reset drag state
			setDraggedApp(null);
			setSnapIndicator({ visible: false, x: 0, y: 0 });
		},
		[draggedApp, dragOffset, handleAppPositionChange]
	);

	// Add global touch event listeners for drag
	useEffect(() => {
		if (draggedApp) {
			document.addEventListener("touchmove", handleTouchMove, { passive: false });
			document.addEventListener("touchend", handleTouchEnd, { passive: false });

			return () => {
				document.removeEventListener("touchmove", handleTouchMove);
				document.removeEventListener("touchend", handleTouchEnd);
			};
		}
	}, [draggedApp, handleTouchMove, handleTouchEnd]);

	return (
		<div className={styles.mobileDesktop}>
			{desktopApps.map((desktopApp) => {
				const app = AVAILABLE_APPS.find((a) => a.id === desktopApp.appId);
				if (!app) return null;

				const appWindows = getAllWindowsForApp(app.id);
				const isActive = appWindows.length > 0;
				// const isSelected = selectedApps.has(app.id); // For future features
				const isDragging = draggedApp === desktopApp.appId;

				return (
					<div
						key={desktopApp.appId}
						className={`${styles.desktopApp} ${isActive ? styles.active : ""} ${
							isDragging ? styles.dragging : ""
						} ${isJiggleMode ? styles.jiggle : ""}`}
						style={{
							left: desktopApp.x,
							top: desktopApp.y,
							cursor: isJiggleMode ? (isDragging ? "grabbing" : "grab") : "pointer",
							zIndex: isDragging ? 1000 : 10,
						}}
						onTouchStart={(e) => handleTouchStart(e, app.id)}
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

			{/* Snap Indicator */}
			{snapIndicator.visible && (
				<div
					className={styles.snapIndicator}
					style={{
						left: snapIndicator.x,
						top: snapIndicator.y,
					}}
				/>
			)}
		</div>
	);
}
