"use client";

import React, { useCallback } from "react";
import { useWindowManager } from "../OS";
import { AVAILABLE_APPS } from "../desktop/AppIcons/AppIcons";
import MobileSystemStatus from "./MobileSystemStatus";
import styles from "./MobileMenuBar.module.css";

export default function MobileMenuBar() {
	const { focusedWindowId, getWindowById } = useWindowManager();

	// Get active app name for menu bar (same logic as desktop)
	const getActiveAppName = useCallback(() => {
		if (!focusedWindowId) {
			return "BikiOS";
		}

		const focusedWindow = getWindowById(focusedWindowId);
		if (!focusedWindow) {
			return "BikiOS";
		}

		// Find the app info for the focused window
		const app = AVAILABLE_APPS.find((a) => a.id === focusedWindow.appId);
		return app ? app.name : "BikiOS";
	}, [focusedWindowId, getWindowById]);

	return (
		<div className={styles.menuBar}>
			<div className={styles.menuBarLeft}>
				<span className={styles.menuItem}>{getActiveAppName()}</span>
			</div>
			<div className={styles.menuBarRight}>
				<MobileSystemStatus />
			</div>
		</div>
	);
}
