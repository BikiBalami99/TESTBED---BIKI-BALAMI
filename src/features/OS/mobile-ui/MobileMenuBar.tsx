"use client";

import React, { useCallback } from "react";
import { useWindowManager } from "../OS";
import { AVAILABLE_APPS } from "../desktop/AppIcons/AppIcons";
import MobileSystemStatus from "./MobileSystemStatus";
import { Settings2, Check } from "lucide-react";
import styles from "./MobileMenuBar.module.css";

interface MobileMenuBarProps {
	isJiggleMode: boolean;
	onToggleJiggleMode: () => void;
}

export default function MobileMenuBar({
	isJiggleMode,
	onToggleJiggleMode,
}: MobileMenuBarProps) {
	const { focusedWindowId, getWindowById } = useWindowManager();

	// Get active app name for menu bar (same logic as desktop)
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
				<button
					className={`${styles.editButton} ${
						isJiggleMode ? styles.editButtonActive : ""
					}`}
					onClick={onToggleJiggleMode}
					title={isJiggleMode ? "Done" : "Customize Layout"}
				>
					{isJiggleMode ? <Check size={16} /> : <Settings2 size={16} />}
				</button>
				<MobileSystemStatus />
			</div>
		</div>
	);
}
