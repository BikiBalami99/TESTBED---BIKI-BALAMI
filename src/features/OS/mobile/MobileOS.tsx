"use client";

import React, { useState, useCallback, useEffect, Suspense } from "react";
import { createPortal } from "react-dom";
import MobileWindow from "../Window/MobileWindow";
import MobileNavigation from "./MobileNavigation";
import MobileRecentApps from "./MobileRecentApps";
import MenuBar from "../desktop/MenuBar/MenuBar";
import Dock from "../desktop/Dock/Dock";
import { WindowData, useWindowManager } from "../OS";
import { AVAILABLE_APPS, AppInfo } from "../desktop/AppIcons/AppIcons";
import { DOCK_APPS } from "../desktop/data/dock-apps";
import { useMobile } from "../MobileContext";
import styles from "./MobileOS.module.css";

interface MobileOSProps {
	children: React.ReactNode; // Desktop component
}

export default function MobileOS({ children }: MobileOSProps) {
	const { isMobile } = useMobile();
	const {
		windows,
		focusedWindowId,
		openOrFocusApp,
		closeWindow,
		minimizeWindow,
		focusWindow,
		restoreWindow,
		getWindowById,
	} = useWindowManager();

	// Mobile-specific state
	const [recentAppsOpen, setRecentAppsOpen] = useState(false);
	const [splitScreenApps, setSplitScreenApps] = useState<{
		app1: WindowData | null;
		app2: WindowData | null;
	}>({ app1: null, app2: null });
	const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
	const [forwardHistory, setForwardHistory] = useState<string[]>([]);
	const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
	const [dockApps] = useState(() => DOCK_APPS.map((app) => ({ appId: app.appId })));

	// Mobile-specific desktop app layout (flex-wrap simulation)
	const getMobileDesktopLayout = useCallback(() => {
		if (!isMobile) return null;

		// Get saved desktop apps from localStorage
		const savedDesktopApps = localStorage.getItem("desktopApps");
		let desktopApps: Array<{ appId: string; x: number; y: number }> = [];

		if (savedDesktopApps) {
			try {
				desktopApps = JSON.parse(savedDesktopApps);
			} catch (error) {
				console.warn("Failed to parse saved desktop apps");
			}
		}

		// Calculate mobile grid layout (flex-wrap simulation)
		const mobileGridCols = 4; // 4 apps per row on mobile
		const currentScreenWidth = window.innerWidth;
		const appSize = Math.min(currentScreenWidth / mobileGridCols - 20, 80); // Responsive app size
		const startX = (currentScreenWidth - mobileGridCols * (appSize + 16)) / 2; // Center the grid
		const startY = 60; // Start below menu bar

		return desktopApps.map((app, index) => {
			const row = Math.floor(index / mobileGridCols);
			const col = index % mobileGridCols;

			return {
				...app,
				mobileX: startX + col * (appSize + 16),
				mobileY: startY + row * (appSize + 16),
				originalX: app.x, // Preserve original position
				originalY: app.y,
			};
		});
	}, [isMobile]);

	// Mobile-specific window management
	const visibleWindows = windows.filter((w) => !w.isMinimized);
	const currentWindow =
		visibleWindows.find((w) => w.id === focusedWindowId) || visibleWindows[0];
	const recentApps = windows
		.slice()
		.sort((a, b) => (b.lastFocused ? 1 : 0) - (a.lastFocused ? 1 : 0));

	// Navigation handlers
	const handleHome = useCallback(() => {
		// Add current state to history before going home
		if (currentWindow) {
			setNavigationHistory((prev) => [...prev.slice(-9), currentWindow.id]); // Keep max 10 items
			setForwardHistory([]); // Clear forward history when making new navigation
		}

		// Minimize all windows to show home screen (app launcher)
		visibleWindows.forEach((window) => {
			minimizeWindow(window.id);
		});
		setSplitScreenApps({ app1: null, app2: null });
	}, [visibleWindows, minimizeWindow, currentWindow]);

	const handleBack = useCallback(() => {
		if (splitScreenApps.app1 || splitScreenApps.app2) {
			// Exit split screen mode
			setSplitScreenApps({ app1: null, app2: null });
			if (currentWindow) {
				focusWindow(currentWindow.id);
			}
			return;
		}

		if (navigationHistory.length > 0) {
			// Add current window to forward history
			if (currentWindow) {
				setForwardHistory((prev) => [...prev.slice(-9), currentWindow.id]); // Keep max 10 items
			}

			// Go back in navigation history
			const previousWindowId = navigationHistory[navigationHistory.length - 1];
			const previousWindow = getWindowById(previousWindowId);

			if (previousWindow) {
				if (previousWindow.isMinimized) {
					restoreWindow(previousWindow.id);
				} else {
					focusWindow(previousWindow.id);
				}
				setNavigationHistory((prev) => prev.slice(0, -1));
			} else {
				// Window no longer exists, go to home
				setNavigationHistory((prev) => prev.slice(0, -1));
				visibleWindows.forEach((window) => {
					minimizeWindow(window.id);
				});
			}
		} else if (currentWindow) {
			// No history, add current to forward history and go home
			setForwardHistory((prev) => [...prev.slice(-9), currentWindow.id]);
			minimizeWindow(currentWindow.id);
		}
	}, [
		splitScreenApps,
		navigationHistory,
		currentWindow,
		focusWindow,
		getWindowById,
		restoreWindow,
		minimizeWindow,
		visibleWindows,
	]);

	const handleRecentApps = useCallback(() => {
		setRecentAppsOpen(true);
	}, []);

	const handleForward = useCallback(() => {
		if (forwardHistory.length > 0) {
			// Add current window to back history
			if (currentWindow) {
				setNavigationHistory((prev) => [...prev.slice(-9), currentWindow.id]); // Keep max 10 items
			}

			// Go forward in history
			const nextWindowId = forwardHistory[forwardHistory.length - 1];
			const nextWindow = getWindowById(nextWindowId);

			if (nextWindow) {
				if (nextWindow.isMinimized) {
					restoreWindow(nextWindow.id);
				} else {
					focusWindow(nextWindow.id);
				}
				setForwardHistory((prev) => prev.slice(0, -1));
			} else {
				// Window no longer exists, remove from forward history
				setForwardHistory((prev) => prev.slice(0, -1));
			}
		}
	}, [forwardHistory, currentWindow, getWindowById, restoreWindow, focusWindow]);

	// App management
	const handleAppSelect = useCallback(
		(windowId: string) => {
			const window = getWindowById(windowId);
			if (!window) return;

			// Add current window to navigation history
			if (currentWindow && currentWindow.id !== windowId) {
				setNavigationHistory((prev) => [...prev.slice(-9), currentWindow.id]); // Keep max 10 items
				setForwardHistory([]); // Clear forward history when making new navigation
			}

			if (window.isMinimized) {
				restoreWindow(windowId);
			} else {
				focusWindow(windowId);
			}
		},
		[currentWindow, getWindowById, restoreWindow, focusWindow]
	);

	const handleAppClose = useCallback(
		(windowId: string) => {
			closeWindow(windowId);
			// Remove from both navigation histories
			setNavigationHistory((prev) => prev.filter((id) => id !== windowId));
			setForwardHistory((prev) => prev.filter((id) => id !== windowId));
		},
		[closeWindow]
	);

	const handleSplitScreen = useCallback(
		(app1Id: string, app2Id: string) => {
			const app1 = getWindowById(app1Id);
			const app2 = getWindowById(app2Id);

			if (app1 && app2) {
				setSplitScreenApps({ app1, app2 });
				// Focus the first app
				focusWindow(app1Id);
			}
		},
		[getWindowById, focusWindow]
	);

	const handleClearAllApps = useCallback(() => {
		windows.forEach((window) => {
			closeWindow(window.id);
		});
		setNavigationHistory([]);
		setForwardHistory([]);
		setSplitScreenApps({ app1: null, app2: null });
	}, [windows, closeWindow]);

	// App launcher
	const handleAppLaunch = useCallback(
		(appId: string) => {
			const app = AVAILABLE_APPS.find((a) => a.id === appId);
			if (!app) return;

			// Add current window to navigation history if launching new app
			if (currentWindow) {
				setNavigationHistory((prev) => [...prev.slice(-9), currentWindow.id]); // Keep max 10 items
				setForwardHistory([]); // Clear forward history when making new navigation
			}

			openOrFocusApp(
				appId,
				app.name,
				<Suspense fallback={<div>Loading...</div>}>
					{React.createElement(app.component)}
				</Suspense>
			);
		},
		[currentWindow, openOrFocusApp]
	);

	// Dock handlers
	const handleDockAppClick = useCallback(
		(app: AppInfo) => {
			// Use the same logic as desktop dock
			openOrFocusApp(
				app.id,
				app.name,
				<Suspense fallback={<div>Loading...</div>}>
					{React.createElement(app.component)}
				</Suspense>
			);
		},
		[openOrFocusApp]
	);

	const handleDockContextMenu = useCallback((e: React.MouseEvent, appId: string) => {
		// For now, prevent default context menu on mobile
		e.preventDefault();
		// Could implement mobile-specific context menu later
	}, []);

	// Handle window focus changes for navigation history
	useEffect(() => {
		if (focusedWindowId && currentWindow?.id !== focusedWindowId) {
			const newWindow = getWindowById(focusedWindowId);
			if (newWindow && currentWindow) {
				setNavigationHistory((prev) => [...prev.slice(-9), currentWindow.id]); // Keep max 10 items
				setForwardHistory([]); // Clear forward history when making new navigation
			}
		}
	}, [focusedWindowId, currentWindow, getWindowById]);

	const canGoBack =
		navigationHistory.length > 0 || Boolean(splitScreenApps.app1 || splitScreenApps.app2);
	const canGoForward = forwardHistory.length > 0;
	const hasRecentApps = recentApps.length > 0;

	// Create portal root for mobile navigation (outside desktop environment)
	useEffect(() => {
		if (typeof window !== "undefined" && isMobile) {
			let root = document.getElementById("mobile-navigation-root");
			if (!root) {
				root = document.createElement("div");
				root.id = "mobile-navigation-root";
				root.style.cssText = `
					position: fixed;
					bottom: 0;
					left: 0;
					right: 0;
					z-index: 10000;
					pointer-events: none;
				`;
				document.body.appendChild(root);
			}
			setPortalRoot(root);

			return () => {
				// Clean up portal root when component unmounts or becomes non-mobile
				if (root && root.parentNode) {
					root.parentNode.removeChild(root);
				}
			};
		}
	}, [isMobile]);

	// Inject mobile desktop layout styles
	useEffect(() => {
		if (isMobile) {
			const mobileLayout = getMobileDesktopLayout();
			if (mobileLayout) {
				// Create CSS rules for mobile desktop app positions
				let styleElement = document.getElementById("mobile-desktop-layout");
				if (!styleElement) {
					styleElement = document.createElement("style");
					styleElement.id = "mobile-desktop-layout";
					document.head.appendChild(styleElement);
				}

				const cssRules = mobileLayout
					.map(
						(app) => `
					[data-app-id="${app.appId}"] {
						transform: translate(${app.mobileX}px, ${app.mobileY}px) !important;
						position: absolute !important;
					}
				`
					)
					.join("\n");

				styleElement.textContent = cssRules;
			}
		} else {
			// Remove mobile styles when not mobile
			const styleElement = document.getElementById("mobile-desktop-layout");
			if (styleElement) {
				styleElement.remove();
			}
		}

		return () => {
			const styleElement = document.getElementById("mobile-desktop-layout");
			if (styleElement) {
				styleElement.remove();
			}
		};
	}, [isMobile, getMobileDesktopLayout]);

	// Helper function to render dock via portal
	const renderMobileDock = () => {
		if (!portalRoot) return null;

		return createPortal(
			<div className={styles.mobileDockWrapper}>
				<Dock
					dockApps={dockApps}
					onAppClick={handleDockAppClick}
					onContextMenu={handleDockContextMenu}
				/>
			</div>,
			portalRoot
		);
	};

	// Helper function to render mobile navigation via portal
	const renderMobileNavigation = () => {
		if (!portalRoot) return null;

		return createPortal(
			<MobileNavigation
				onHome={handleHome}
				onBack={handleBack}
				onForward={handleForward}
				onRecentApps={handleRecentApps}
				canGoBack={canGoBack}
				canGoForward={canGoForward}
				hasRecentApps={hasRecentApps}
				currentApp={currentWindow?.appId}
			/>,
			portalRoot
		);
	};

	// Helper function to render recent apps modal via portal
	const renderRecentAppsModal = () => {
		if (!portalRoot) return null;

		return createPortal(
			<MobileRecentApps
				isOpen={recentAppsOpen}
				onClose={() => setRecentAppsOpen(false)}
				recentApps={recentApps}
				onAppSelect={handleAppSelect}
				onAppClose={handleAppClose}
				onSplitScreen={handleSplitScreen}
				onClearAll={handleClearAllApps}
			/>,
			portalRoot
		);
	};

	// If not mobile, render desktop version
	if (!isMobile) {
		return <>{children}</>;
	}

	// If we have desktop children to render (when no current window), wrap them properly
	if (visibleWindows.length === 0 && !splitScreenApps.app1 && !splitScreenApps.app2) {
		return (
			<>
				<div className={styles.mobileOS}>
					{/* Desktop MenuBar (visible on mobile) */}
					<MenuBar />

					{/* Desktop content scaled for mobile */}
					<div className={styles.desktopWrapper}>{children}</div>
				</div>

				{/* Mobile Dock (rendered via portal) */}
				{renderMobileDock()}

				{/* Mobile Navigation (rendered via portal outside desktop) */}
				{renderMobileNavigation()}

				{/* Recent Apps Modal (rendered via portal) */}
				{renderRecentAppsModal()}
			</>
		);
	}

	return (
		<>
			<div className={styles.mobileOS}>
				{/* Desktop MenuBar (visible on mobile) */}
				<MenuBar />

				{/* Split Screen Mode */}
				{splitScreenApps.app1 && splitScreenApps.app2 && (
					<div className={styles.splitScreenContainer}>
						<div className={styles.splitScreenApp}>
							<MobileWindow
								key={splitScreenApps.app1.id}
								id={splitScreenApps.app1.id}
								onClose={handleAppClose}
								onBack={handleBack}
								onMinimize={minimizeWindow}
								onFocus={focusWindow}
								isFocused={focusedWindowId === splitScreenApps.app1.id}
								zIndex={splitScreenApps.app1.zIndex}
								canGoBack={true}
							>
								{splitScreenApps.app1.content}
							</MobileWindow>
						</div>
						<div className={styles.splitScreenDivider} />
						<div className={styles.splitScreenApp}>
							<MobileWindow
								key={splitScreenApps.app2.id}
								id={splitScreenApps.app2.id}
								onClose={handleAppClose}
								onBack={handleBack}
								onMinimize={minimizeWindow}
								onFocus={focusWindow}
								isFocused={focusedWindowId === splitScreenApps.app2.id}
								zIndex={splitScreenApps.app2.zIndex}
								canGoBack={true}
							>
								{splitScreenApps.app2.content}
							</MobileWindow>
						</div>
					</div>
				)}

				{/* Regular Window Mode */}
				{!splitScreenApps.app1 && !splitScreenApps.app2 && (
					<>
						{/* Show home screen (app launcher) when no windows */}
						{visibleWindows.length === 0 && (
							<div className={styles.homeScreen}>
								<div className={styles.homeScreenContent}>
									<h1 className={styles.homeScreenTitle}>BikiOS Mobile</h1>
									<div className={styles.appGrid}>
										{AVAILABLE_APPS.slice(0, 12).map((app) => (
											<button
												key={app.id}
												className={styles.homeAppIcon}
												onClick={() => handleAppLaunch(app.id)}
											>
												<div className={styles.homeAppIconWrapper}>
													<app.icon size={32} />
												</div>
												<span className={styles.homeAppName}>{app.name}</span>
											</button>
										))}
									</div>
								</div>
							</div>
						)}

						{/* Current Window */}
						{currentWindow && (
							<MobileWindow
								key={currentWindow.id}
								id={currentWindow.id}
								onClose={handleAppClose}
								onBack={handleBack}
								onMinimize={minimizeWindow}
								onFocus={focusWindow}
								isFocused={currentWindow.id === focusedWindowId}
								zIndex={currentWindow.zIndex}
								canGoBack={canGoBack}
							>
								{currentWindow.content}
							</MobileWindow>
						)}
					</>
				)}
			</div>

			{/* Mobile Dock (rendered via portal) */}
			{renderMobileDock()}

			{/* Mobile Navigation (rendered via portal outside desktop) */}
			{renderMobileNavigation()}

			{/* Recent Apps Modal (rendered via portal) */}
			{renderRecentAppsModal()}
		</>
	);
}
