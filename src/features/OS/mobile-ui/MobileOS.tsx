"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useMobile } from "../MobileContext";
import { useWindowManager } from "../OS";
import { AVAILABLE_APPS } from "../desktop/AppIcons/AppIcons";
import { AppIcon } from "../desktop/AppIcons/AppIcons";
import BackgroundDisplay from "../BackgroundDisplay";
import MobileDesktop from "./MobileDesktop";
import MobileWindow from "./MobileWindow";
import MobileDock from "./MobileDock";
import MobileMenuBar from "./MobileMenuBar";
import MobileNavigation from "./MobileNavigation";
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
		minimizeWindow,
		closeWindow,
		focusWindow,
	} = useWindowManager();

	// Mobile-specific state
	const [mobilePortalRoot, setMobilePortalRoot] = useState<HTMLElement | null>(null);
	const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
	const [showAppExpose, setShowAppExpose] = useState(false);
	const [isJiggleMode, setIsJiggleMode] = useState(false);

	// Get current mobile window (only one at a time on mobile)
	const currentWindow =
		windows.find((w) => w.id === focusedWindowId && !w.isMinimized) || null;

	// Show desktop when no focused window and not in app expose
	const showDesktop = !currentWindow && !showAppExpose;

	// Create mobile portal root
	useEffect(() => {
		if (typeof window !== "undefined" && isMobile) {
			let root = document.getElementById("mobile-os-root");
			if (!root) {
				root = document.createElement("div");
				root.id = "mobile-os-root";
				root.style.cssText = `
					position: fixed;
					top: 0;
					left: 0;
					right: 0;
					bottom: 0;
					z-index: 50000;
					pointer-events: auto;
				`;
				document.body.appendChild(root);
			}
			setMobilePortalRoot(root);

			return () => {
				if (root && root.parentNode) {
					root.parentNode.removeChild(root);
				}
			};
		}
	}, [isMobile]);

	// Mobile navigation handlers
	const handleHome = useCallback(() => {
		// Hide app expose and minimize all windows to show desktop
		setShowAppExpose(false);
		windows.forEach((window) => {
			if (!window.isMinimized) {
				minimizeWindow(window.id);
			}
		});
	}, [windows, minimizeWindow]);

	const handleBack = useCallback(() => {
		if (showAppExpose) {
			setShowAppExpose(false);
			return;
		}

		if (navigationHistory.length > 0) {
			// Go back to previous app
			const previousWindowId = navigationHistory[navigationHistory.length - 1];
			const previousWindow = windows.find((w) => w.id === previousWindowId);

			if (previousWindow && !previousWindow.isMinimized) {
				// Focus the previous window
				setNavigationHistory((prev) => prev.slice(0, -1));
			} else {
				// Window no longer exists or is minimized, go home
				handleHome();
			}
		} else if (currentWindow) {
			// No history but has current window, go home
			handleHome();
		}
	}, [showAppExpose, navigationHistory, windows, currentWindow, handleHome]);

	const handleForward = useCallback(() => {
		// For now, just a placeholder - could implement forward history
		console.log("Forward navigation not implemented yet");
	}, []);

	const handleAppExpose = useCallback(() => {
		setShowAppExpose(!showAppExpose);
	}, [showAppExpose]);

	const handleToggleJiggleMode = useCallback(() => {
		setIsJiggleMode(!isJiggleMode);
	}, [isJiggleMode]);

	const handleAppLaunch = useCallback(
		(appId: string) => {
			const app = AVAILABLE_APPS.find((a) => a.id === appId);
			if (!app) return;

			// Add current window to history if launching new app
			if (currentWindow) {
				setNavigationHistory((prev) => [...prev.slice(-9), currentWindow.id]);
			}

			// Hide app expose
			setShowAppExpose(false);

			// Launch app
			openOrFocusApp(appId, app.name, React.createElement(app.component));
		},
		[currentWindow, openOrFocusApp]
	);

	// If not mobile, render desktop version
	if (!isMobile) {
		return <>{children}</>;
	}

	// Render mobile UI via portal
	if (!mobilePortalRoot) {
		return <>{children}</>;
	}

	return (
		<>
			{/* Keep desktop for context but hidden */}
			<div style={{ display: "none" }}>{children}</div>

			{/* Mobile UI Portal */}
			{createPortal(
				<div className={styles.mobileOS}>
					{/* Background Image Layer */}
					<BackgroundDisplay />

					{/* Mobile Menu Bar */}
					<MobileMenuBar
						isJiggleMode={isJiggleMode}
						onToggleJiggleMode={handleToggleJiggleMode}
					/>

					{/* Main Content Area */}
					<div className={styles.contentArea}>
						{showDesktop && (
							<MobileDesktop onAppLaunch={handleAppLaunch} isJiggleMode={isJiggleMode} />
						)}

						{currentWindow && <MobileWindow>{currentWindow.content}</MobileWindow>}
					</div>

					{/* App Expose - Only open apps, with close control */}
					{showAppExpose && (
						<div className={styles.appExposeContainer}>
							<div className={styles.appExposeGrid}>
								{windows.map((window) => {
									const app = AVAILABLE_APPS.find((a) => a.id === window.appId);
									return (
										<div
											key={window.id}
											className={`${styles.appExposeItem} ${styles.appExposeItemOpen}`}
											onClick={() => {
												if (app) {
													openOrFocusApp(
														app.id,
														app.name,
														React.createElement(app.component)
													);
												}
												setShowAppExpose(false);
											}}
										>
											<button
												className={styles.appExposeCloseButton}
												onClick={(e) => {
													e.stopPropagation();
													closeWindow(window.id);
												}}
												title="Close app"
											/>
											<div className={styles.appExposePreview}>{window.content}</div>
											<div className={styles.appExposeIconContainer}>
												{app && <AppIcon app={app} size="small" />}
											</div>
										</div>
									);
								})}
							</div>
							<div className={styles.clearAllBar}>
								<button
									className={styles.clearAllButton}
									onClick={() => {
										windows.forEach((w) => closeWindow(w.id));
										setShowAppExpose(false);
									}}
								>
									Clear All
								</button>
							</div>
						</div>
					)}

					{/* Mobile Dock (hidden when an app is open or in exposé) */}
					{showDesktop && <MobileDock onAppLaunch={handleAppLaunch} />}
				</div>,
				mobilePortalRoot
			)}

			{/* Mobile Navigation - Outside OS simulation */}
			{isMobile && (
				<MobileNavigation
					onHome={handleHome}
					onBack={handleBack}
					onForward={handleForward}
					onAppExpose={handleAppExpose}
					canGoBack={
						navigationHistory.length > 0 || currentWindow !== null || showAppExpose
					}
					canGoForward={false}
					hasApps={true}
				/>
			)}
		</>
	);
}
