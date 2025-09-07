"use client";

import React, { useCallback } from "react";
import { useWindowManager } from "../../OS";
import { AVAILABLE_APPS } from "../AppIcons/AppIcons";
import SystemStatus from "../SystemStatus/SystemStatus";
import styles from "./MenuBar.module.css";

export default function MenuBar() {
	const { focusedWindowId, getWindowById } = useWindowManager();

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

	return (
		<div className={styles.menuBar}>
			<div className={styles.menuBarLeft}>
				<span className={styles.menuItem}>{getActiveAppName()}</span>
			</div>
			<div className={styles.menuBarRight}>
				<SystemStatus />
			</div>
		</div>
	);
}
