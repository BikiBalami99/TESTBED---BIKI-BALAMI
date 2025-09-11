"use client";

import React from "react";
import MobileSystemStatus from "./MobileSystemStatus";
import { Settings2, Check, Palette } from "lucide-react";
import styles from "./MobileMenuBar.module.css";

interface MobileMenuBarProps {
	isJiggleMode: boolean;
	onToggleJiggleMode: () => void;
	showDesktop: boolean;
	onToggleControlCenter: () => void;
}

export default function MobileMenuBar({
	isJiggleMode,
	onToggleJiggleMode,
	showDesktop,
	onToggleControlCenter,
}: MobileMenuBarProps) {
	return (
		<div className={styles.menuBar}>
			<div className={styles.menuBarLeft}>
				<MobileSystemStatus />
			</div>
			<div className={styles.menuBarRight}>
				{showDesktop && (
					<button
						className={`${styles.editButton} ${
							isJiggleMode ? styles.editButtonActive : ""
						}`}
						onClick={onToggleJiggleMode}
						title={isJiggleMode ? "Done" : "Customize Layout"}
					>
						{isJiggleMode ? <Check size={16} /> : <Palette size={16} />}
					</button>
				)}
				<button
					className={styles.controlCenterButton}
					onClick={onToggleControlCenter}
					title="Control Center"
				>
					<Settings2 size={16} />
				</button>
			</div>
		</div>
	);
}
