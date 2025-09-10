import React from "react";
import styles from "./AppIcons.module.css";

// Import the centralized app registry
export { AVAILABLE_APPS, getAppById, getAppsByCategory } from "../../../apps";
export type { AppInfo } from "../../../apps";
import type { AppInfo } from "../../../apps";

interface AppIconProps {
	app: AppInfo;
	size?: "small" | "medium" | "large" | "dock";
	onClick?: () => void;
	className?: string;
	variant?: "default" | "featured";
	showName?: boolean;
	isActive?: boolean;
	onMouseEnter?: () => void;
	onMouseLeave?: () => void;
	showPreview?: boolean;
	previewContent?: React.ReactNode;
}

export function AppIcon({
	app,
	size = "medium",
	onClick,
	className,
	variant = "default",
	showName = true,
	isActive = false,
	onMouseEnter,
	onMouseLeave,
	showPreview = false,
	previewContent,
}: AppIconProps) {
	const Icon = app.icon;

	const iconSize = {
		small: 24,
		medium: 48,
		large: 64,
		dock: 32,
	}[size];

	const isFeatured = variant === "featured" || app.id === "features-checklist";

	return (
		<div
			className={`${styles.appIcon} ${styles[size]} ${
				isFeatured ? styles.featured : ""
			} ${isActive ? styles.active : ""} ${className || ""}`}
			onClick={onClick}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			title={app.description}
		>
			<div className={styles.iconWrapper} data-app-id={app.id}>
				<Icon size={iconSize} className={styles.icon} />
				{isActive && size === "dock" && <div className={styles.activeIndicator} />}
			</div>
			{showName && size !== "dock" && (
				<span className={`${styles.appName} ${isFeatured ? styles.featuredName : ""}`}>
					{app.name}
				</span>
			)}
			{showPreview && previewContent && (
				<div className={styles.previewWrapper}>{previewContent}</div>
			)}
		</div>
	);
}

/* DockIcon moved to DockItem component */
