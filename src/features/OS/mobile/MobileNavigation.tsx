"use client";

import React, { useState, useCallback } from "react";
import { Home, ArrowLeft, ArrowRight, Square, Menu } from "lucide-react";
import styles from "./MobileNavigation.module.css";
import { useMobile } from "../MobileContext";

interface MobileNavigationProps {
	onHome: () => void;
	onBack: () => void;
	onForward: () => void;
	onRecentApps: () => void;
	onMenu?: () => void;
	canGoBack?: boolean;
	canGoForward?: boolean;
	hasRecentApps?: boolean;
	currentApp?: string;
}

export default function MobileNavigation({
	onHome,
	onBack,
	onForward,
	onRecentApps,
	onMenu,
	canGoBack = false,
	canGoForward = false,
	hasRecentApps = false,
	currentApp,
}: MobileNavigationProps) {
	const { screenWidth, orientation } = useMobile();
	const [pressedButton, setPressedButton] = useState<string | null>(null);

	const handleButtonPress = useCallback((buttonId: string, action: () => void) => {
		setPressedButton(buttonId);
		// Haptic feedback if available
		if ("vibrate" in navigator) {
			navigator.vibrate(10);
		}
		action();
		// Reset pressed state
		setTimeout(() => setPressedButton(null), 150);
	}, []);

	// Calculate safe area for bottom navigation
	const safeAreaBottom = 0; // Could be enhanced to detect actual safe area

	return (
		<div
			className={styles.mobileNavigation}
			style={{
				bottom: safeAreaBottom,
				width: screenWidth,
			}}
		>
			{/* Navigation Background */}
			<div className={styles.navBackground} />

			{/* Navigation Buttons */}
			<div className={styles.navButtons}>
				{/* Back Button */}
				<button
					className={`${styles.navButton} ${
						pressedButton === "back" ? styles.pressed : ""
					} ${!canGoBack ? styles.disabled : ""}`}
					onClick={() => canGoBack && handleButtonPress("back", onBack)}
					disabled={!canGoBack}
					aria-label="Go back"
				>
					<ArrowLeft
						size={20}
						className={`${styles.navIcon} ${!canGoBack ? styles.disabledIcon : ""}`}
					/>
				</button>

				{/* Forward Button */}
				<button
					className={`${styles.navButton} ${
						pressedButton === "forward" ? styles.pressed : ""
					} ${!canGoForward ? styles.disabled : ""}`}
					onClick={() => canGoForward && handleButtonPress("forward", onForward)}
					disabled={!canGoForward}
					aria-label="Go forward"
				>
					<ArrowRight
						size={20}
						className={`${styles.navIcon} ${!canGoForward ? styles.disabledIcon : ""}`}
					/>
				</button>

				{/* Home Button */}
				<button
					className={`${styles.navButton} ${styles.homeButton} ${
						pressedButton === "home" ? styles.pressed : ""
					}`}
					onClick={() => handleButtonPress("home", onHome)}
					aria-label="Home"
				>
					<div className={styles.homeIndicator}>
						<Home size={22} className={styles.navIcon} />
					</div>
				</button>

				{/* Recent Apps Button */}
				<button
					className={`${styles.navButton} ${
						pressedButton === "recent" ? styles.pressed : ""
					} ${!hasRecentApps ? styles.disabled : ""}`}
					onClick={() => hasRecentApps && handleButtonPress("recent", onRecentApps)}
					disabled={!hasRecentApps}
					aria-label="Recent apps"
				>
					<Square
						size={20}
						className={`${styles.navIcon} ${!hasRecentApps ? styles.disabledIcon : ""}`}
					/>
				</button>
			</div>

			{/* Current App Indicator */}
			{currentApp && (
				<div className={styles.appIndicator}>
					<div className={styles.appIndicatorDot} />
				</div>
			)}

			{/* Gesture Indicator Line (Android 10+ style) */}
			<div className={styles.gestureIndicator} />
		</div>
	);
}
