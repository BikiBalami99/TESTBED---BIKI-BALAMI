"use client";

import React, { useState, useEffect, useCallback } from "react";
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
	// Snap positions to grid (64px grid)
	const snapToGrid = (x: number, y: number) => {
		const gridSize = 64;
		return {
			x: Math.round(x / gridSize) * gridSize,
			y: Math.round(y / gridSize) * gridSize,
		};
	};

	const [desktopApps, setDesktopApps] = useState<DesktopApp[]>([
		{ appId: "media-queries", ...snapToGrid(64, 64) },
		{ appId: "css-grid", ...snapToGrid(192, 64) },
		{ appId: "javascript-es6", ...snapToGrid(320, 64) },
	]);

	const [dockApps, setDockApps] = useState<DockApp[]>([
		{ appId: "media-queries" },
		{ appId: "css-grid" },
		{ appId: "javascript-es6" },
	]);

	const [isAppLauncherOpen, setIsAppLauncherOpen] = useState(false);
	const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set());
	const [hoveredDockApp, setHoveredDockApp] = useState<string | null>(null);
	const [dragState, setDragState] = useState<{
		isDragging: boolean;
		draggedAppId: string | null;
		dragStartX: number;
		dragStartY: number;
		appStartX: number;
		appStartY: number;
		offset: { x: number; y: number };
		hasMoved: boolean;
		isPotentialDrag: boolean;
		clickTimeout: NodeJS.Timeout | null;
	}>({
		isDragging: false,
		draggedAppId: null,
		dragStartX: 0,
		dragStartY: 0,
		appStartX: 0,
		appStartY: 0,
		offset: { x: 0, y: 0 },
		hasMoved: false,
		isPotentialDrag: false,
		clickTimeout: null,
	});

	const [snapIndicator, setSnapIndicator] = useState<{
		visible: boolean;
		x: number;
		y: number;
	}>({
		visible: false,
		x: 0,
		y: 0,
	});

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
		getAllWindowsForApp,
		getWindowForApp,
		getWindowById,
		focusWindow,
		restoreWindow,
		closeWindow,
		minimizeWindow,
		windows,
		focusedWindowId,
	} = useWindowManager();

	// Get active app name for menu bar
	const getActiveAppName = useCallback(() => {
		if (!focusedWindowId) {
			return "DoorsOS";
		}

		const focusedWindow = getWindowById(focusedWindowId);
		if (!focusedWindow) {
			return "DoorsOS";
		}

		// Find the app info for the focused window
		const app = AVAILABLE_APPS.find((a) => a.id === focusedWindow.appId);
		return app ? app.name : "BikiOS";
	}, [focusedWindowId, getWindowById]);

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
		// Only prevent click if we actually moved (completed a drag)
		if (dragState.hasMoved) {
			return;
		}

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

	// Handle minimize from dock preview
	const handleMinimizeWindow = (windowId: string) => {
		const window = getWindowById(windowId);
		const dockPosition = window?.appId ? getDockIconPosition(window.appId) : undefined;
		minimizeWindow(windowId, dockPosition);
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
	const handleShowDesktop = () => {
		// Minimize all visible windows
		const visibleWindows = windows.filter((w) => !w.isMinimized);
		visibleWindows.forEach((window) => {
			const dockPosition = window.appId ? getDockIconPosition(window.appId) : undefined;
			minimizeWindow(window.id, dockPosition);
		});
	};

	// Drag and drop handlers for desktop apps
	const handleMouseDown = (e: React.MouseEvent, appId: string) => {
		const app = desktopApps.find((a) => a.appId === appId);
		if (!app) return;

		// Only start drag on left mouse button
		if (e.button !== 0) return;

		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		const offsetX = e.clientX - rect.left;
		const offsetY = e.clientY - rect.top;

		// Clear any existing click timeout
		if (dragState.clickTimeout) {
			clearTimeout(dragState.clickTimeout);
		}

		setDragState({
			isDragging: false, // Don't mark as dragging until movement is detected
			draggedAppId: appId,
			dragStartX: e.clientX,
			dragStartY: e.clientY,
			appStartX: app.x,
			appStartY: app.y,
			offset: { x: offsetX, y: offsetY },
			hasMoved: false,
			isPotentialDrag: true, // Mark as potential drag
			clickTimeout: null,
		});

		// Prevent the default mousedown behavior
		e.preventDefault();
	};

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (!dragState.isPotentialDrag || !dragState.draggedAppId) return;

			const deltaX = e.clientX - dragState.dragStartX;
			const deltaY = e.clientY - dragState.dragStartY;

			// Check if we've moved enough to start dragging (10px threshold)
			const hasMovedEnough = Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10;

			if (hasMovedEnough && !dragState.isDragging) {
				// Clear the click timeout since we're now dragging
				if (dragState.clickTimeout) {
					clearTimeout(dragState.clickTimeout);
				}

				// Now we start the actual drag
				setDragState((prev) => ({
					...prev,
					isDragging: true,
					hasMoved: true,
					clickTimeout: null,
				}));

				// Prevent text selection now that we're dragging
				document.body.style.userSelect = "none";
			}

			// Only continue if we're actually dragging
			if (!dragState.isDragging && !hasMovedEnough) return;

			const newX = dragState.appStartX + deltaX;
			const newY = dragState.appStartY + deltaY;

			// Calculate snap position for indicator
			const gridSize = 64;
			const snapX = Math.round((e.clientX - dragState.offset.x) / gridSize) * gridSize;
			const snapY = Math.round((e.clientY - dragState.offset.y) / gridSize) * gridSize;

			// Constrain snap position to viewport bounds
			const viewportWidth = window.innerWidth;
			const viewportHeight = window.innerHeight;
			const iconSize = 80;

			const constrainedSnapX = Math.max(20, Math.min(snapX, viewportWidth - iconSize));
			const constrainedSnapY = Math.max(
				60,
				Math.min(snapY, viewportHeight - iconSize - 100)
			);

			// Show snap indicator only when actually dragging
			if (dragState.isDragging) {
				setSnapIndicator({
					visible: true,
					x: constrainedSnapX,
					y: constrainedSnapY,
				});
			}

			// Update the app position in real-time
			setDesktopApps((prev) =>
				prev.map((app) =>
					app.appId === dragState.draggedAppId ? { ...app, x: newX, y: newY } : app
				)
			);
		},
		[dragState]
	);

	const handleMouseUp = useCallback(
		(e: MouseEvent) => {
			if (!dragState.isPotentialDrag) return;

			// Reset user selection
			document.body.style.userSelect = "";

			// Clear any pending click timeout
			if (dragState.clickTimeout) {
				clearTimeout(dragState.clickTimeout);
			}

			// Calculate total movement
			const deltaX = e.clientX - dragState.dragStartX;
			const deltaY = e.clientY - dragState.dragStartY;
			const totalMovement = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

			// If movement is less than 10px and we never started dragging, it's a click!
			if (!dragState.isDragging && totalMovement < 10) {
				// This is a click - open the app
				const appInfo = AVAILABLE_APPS.find((a) => a.id === dragState.draggedAppId);
				if (appInfo) {
					handleDesktopAppClick(appInfo);
				}
			}

			// If we never actually started dragging, just reset state
			if (!dragState.isDragging) {
				setDragState({
					isDragging: false,
					draggedAppId: null,
					dragStartX: 0,
					dragStartY: 0,
					appStartX: 0,
					appStartY: 0,
					offset: { x: 0, y: 0 },
					hasMoved: false,
					isPotentialDrag: false,
					clickTimeout: null,
				});
				return;
			}

			// Snap to grid (64px grid)
			const gridSize = 64;
			const snapX = Math.round((e.clientX - dragState.offset.x) / gridSize) * gridSize;
			const snapY = Math.round((e.clientY - dragState.offset.y) / gridSize) * gridSize;

			// Constrain to viewport bounds
			const viewportWidth = window.innerWidth;
			const viewportHeight = window.innerHeight;
			const iconSize = 80; // Approximate icon size including padding

			let constrainedX = Math.max(20, Math.min(snapX, viewportWidth - iconSize));
			let constrainedY = Math.max(60, Math.min(snapY, viewportHeight - iconSize - 100)); // Account for dock

			// Check if position is occupied by another app
			const isPositionOccupied = (x: number, y: number) => {
				return desktopApps.some(
					(app) =>
						app.appId !== dragState.draggedAppId &&
						Math.abs(app.x - x) < 32 && // Half grid size tolerance
						Math.abs(app.y - y) < 32
				);
			};

			// Find nearest unoccupied position if current position is taken
			if (isPositionOccupied(constrainedX, constrainedY)) {
				let foundPosition = false;
				const maxAttempts = 50; // Prevent infinite loop
				let attempts = 0;

				// Try positions in expanding spiral pattern
				for (
					let radius = 1;
					radius <= 10 && !foundPosition && attempts < maxAttempts;
					radius++
				) {
					for (let dx = -radius; dx <= radius && !foundPosition; dx++) {
						for (let dy = -radius; dy <= radius && !foundPosition; dy++) {
							if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue; // Only check perimeter

							const testX = constrainedX + dx * gridSize;
							const testY = constrainedY + dy * gridSize;

							// Check bounds
							if (
								testX >= 20 &&
								testX <= viewportWidth - iconSize &&
								testY >= 60 &&
								testY <= viewportHeight - iconSize - 100
							) {
								if (!isPositionOccupied(testX, testY)) {
									constrainedX = testX;
									constrainedY = testY;
									foundPosition = true;
								}
							}
							attempts++;
						}
					}
				}
			}

			// Update final position with snap
			setDesktopApps((prev) =>
				prev.map((app) =>
					app.appId === dragState.draggedAppId
						? { ...app, x: constrainedX, y: constrainedY }
						: app
				)
			);

			// Hide snap indicator
			setSnapIndicator({ visible: false, x: 0, y: 0 });

			const wasMoving = dragState.hasMoved;

			setDragState({
				isDragging: false,
				draggedAppId: null,
				dragStartX: 0,
				dragStartY: 0,
				appStartX: 0,
				appStartY: 0,
				offset: { x: 0, y: 0 },
				hasMoved: false,
				isPotentialDrag: false,
				clickTimeout: null,
			});

			// Clear the hasMoved flag after a short delay to prevent immediate clicks
			if (wasMoving) {
				setTimeout(() => {
					setDragState((prev) => ({ ...prev, hasMoved: false }));
				}, 200);
			}
		},
		[dragState]
	);

	// Add global mouse event listeners for drag
	useEffect(() => {
		if (dragState.isPotentialDrag) {
			document.addEventListener("mousemove", handleMouseMove);
			document.addEventListener("mouseup", handleMouseUp);

			return () => {
				document.removeEventListener("mousemove", handleMouseMove);
				document.removeEventListener("mouseup", handleMouseUp);
			};
		}
	}, [dragState.isPotentialDrag, handleMouseMove, handleMouseUp]);

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

				const isDragging = dragState.draggedAppId === desktopApp.appId;

				return (
					<div
						key={desktopApp.appId}
						className={`${styles.desktopApp} ${isDragging ? styles.dragging : ""}`}
						style={{
							left: desktopApp.x,
							top: desktopApp.y,
							cursor: isDragging ? "grabbing" : "grab",
							zIndex: isDragging ? 1000 : 10,
						}}
						onMouseDown={(e) => handleMouseDown(e, desktopApp.appId)}
						onContextMenu={(e) => handleDesktopContextMenu(e, desktopApp)}
					>
						<AppIcon app={app} size="medium" />
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

			{/* Dock */}
			<div className={styles.dock}>
				{/* App Launcher Icon */}
				<div
					className={styles.appLauncherIcon}
					onClick={() => setIsAppLauncherOpen(true)}
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
						return createDesktopContextMenuItems(handleShowDesktop);
					}
				})()}
				onClose={closeContextMenu}
			/>

			{/* Menu Bar */}
			<div className={styles.menuBar}>
				<div className={styles.menuBarLeft}>
					<span className={styles.menuItem}>{getActiveAppName()}</span>
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
