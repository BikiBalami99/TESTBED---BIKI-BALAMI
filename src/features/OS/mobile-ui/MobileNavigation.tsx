"use client";

import React from "react";
import { ArrowLeft, ArrowRight, Home, AppWindow } from "lucide-react";
import styles from "./MobileNavigation.module.css";

interface MobileNavigationProps {
	onHome: () => void;
	onBack: () => void;
	onForward: () => void;
	onAppExpose: () => void;
	canGoBack: boolean;
	canGoForward: boolean;
	hasApps: boolean;
}

export default function MobileNavigation({
	onHome,
	onBack,
	onForward,
	onAppExpose,
	canGoBack,
	canGoForward,
	hasApps,
}: MobileNavigationProps) {
	return (
		<div className={styles.mobileNavigation}>
			<div className={styles.navContainer}>
				{/* Back Button */}
				<button
					className={`${styles.navButton} ${!canGoBack ? styles.disabled : ""}`}
					onClick={onBack}
					disabled={!canGoBack}
					title="Back"
				>
					<ArrowLeft size={20} />
				</button>

				{/* Forward Button */}
				<button
					className={`${styles.navButton} ${!canGoForward ? styles.disabled : ""}`}
					onClick={onForward}
					disabled={!canGoForward}
					title="Forward"
				>
					<ArrowRight size={20} />
				</button>

				{/* Home Button */}
				<button className={styles.navButton} onClick={onHome} title="Home">
					<Home size={20} />
				</button>

				{/* App Exposé Button */}
				<button className={styles.navButton} onClick={onAppExpose} title="App Exposé">
					<AppWindow size={20} />
				</button>
			</div>
		</div>
	);
}
