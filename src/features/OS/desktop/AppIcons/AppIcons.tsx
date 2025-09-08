import React from "react";
import styles from "./AppIcons.module.css";

// Import the centralized app registry
export { AVAILABLE_APPS, getAppById, getAppsByCategory } from "../../../apps";
export type { AppInfo } from "../../../apps";
import type { AppInfo } from "../../../apps";

interface AppIconProps {
	app: AppInfo;
	size?: "small" | "medium" | "large";
	onClick?: () => void;
	className?: string;
	variant?: "default" | "featured";
}

export function AppIcon({
	app,
	size = "medium",
	onClick,
	className,
	variant = "default",
}: AppIconProps) {
	const Icon = app.icon;

	const iconSize = {
		small: 24,
		medium: 48,
		large: 64,
	}[size];

	const isFeatured = variant === "featured" || app.id === "features-checklist";

	return (
		<div
			className={`${styles.appIcon} ${styles[size]} ${
				isFeatured ? styles.featured : ""
			} ${className || ""}`}
			onClick={onClick}
			title={app.description}
		>
			<div
				className={`${styles.iconWrapper} ${
					isFeatured ? styles.featuredIconWrapper : ""
				}`}
			>
				<Icon size={iconSize} className={styles.icon} />
			</div>
			<span className={`${styles.appName} ${isFeatured ? styles.featuredName : ""}`}>
				{app.name}
			</span>
		</div>
	);
}

/* DockIcon moved to DockItem component */
