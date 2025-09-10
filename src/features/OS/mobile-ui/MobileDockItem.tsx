"use client";

import React from "react";
import { AppInfo } from "../desktop/AppIcons/AppIcons";
import styles from "./MobileDockItem.module.css";

interface MobileDockItemProps {
	app: AppInfo;
	onClick?: () => void;
	isActive?: boolean;
	onMouseEnter?: () => void;
	onMouseLeave?: () => void;
	showPreview?: boolean;
	previewContent?: React.ReactNode;
}

export default function MobileDockItem({
	app,
	onClick,
	isActive,
	onMouseEnter,
	onMouseLeave,
	showPreview,
	previewContent,
}: MobileDockItemProps) {
	const Icon = app.icon;
	const isFeatured = app.id === "features-checklist";

	return (
		<div
			className={`${styles.mobileDockItem} ${isActive ? styles.active : ""} ${
				isFeatured ? styles.featured : ""
			}`}
			data-app-id={app.id}
			onClick={onClick}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			title={app.name}
		>
			<Icon size={32} className={styles.mobileDockItemSvg} />
			{isActive && <div className={styles.activeIndicator} />}
			{showPreview && previewContent && (
				<div className={styles.previewWrapper}>{previewContent}</div>
			)}
		</div>
	);
}
