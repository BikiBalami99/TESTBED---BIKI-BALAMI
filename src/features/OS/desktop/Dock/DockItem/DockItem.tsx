"use client";

import React from "react";
import { AppInfo } from "../../AppIcons/AppIcons";
import styles from "./DockItem.module.css";

interface DockItemProps {
	app: AppInfo;
	onClick?: () => void;
	isActive?: boolean;
	onMouseEnter?: () => void;
	onMouseLeave?: () => void;
	showPreview?: boolean;
	previewContent?: React.ReactNode;
}

export default function DockItem({
	app,
	onClick,
	isActive,
	onMouseEnter,
	onMouseLeave,
	showPreview,
	previewContent,
}: DockItemProps) {
	const Icon = app.icon;

	return (
		<div
			className={`${styles.dockItem} ${isActive ? styles.active : ""}`}
			onClick={onClick}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			title={app.name}
		>
			<div className={styles.dockItemWrapper}>
				<Icon size={32} className={styles.dockItemSvg} />
				{isActive && <div className={styles.activeIndicator} />}
			</div>
			{showPreview && previewContent && (
				<div className={styles.previewWrapper}>{previewContent}</div>
			)}
		</div>
	);
}
