import React from "react";
import {
	Monitor,
	Grid3X3,
	Code,
	AppWindow,
	Settings,
	FileText,
	Palette,
	Terminal,
	Database,
	Globe,
} from "lucide-react";
import styles from "./AppIcons.module.css";

export interface AppInfo {
	id: string;
	name: string;
	icon: React.ComponentType<{ size?: number; className?: string }>;
	component: React.ComponentType;
	category: "development" | "design" | "productivity";
	description: string;
}

export const AVAILABLE_APPS: AppInfo[] = [
	{
		id: "media-queries",
		name: "Media & Container Queries",
		icon: Monitor,
		component: React.lazy(
			() => import("./media-and-container-queries/MediaAndContainerQueries")
		),
		category: "design",
		description: "Master responsive design techniques",
	},
	{
		id: "css-grid",
		name: "CSS Grid & Flexbox",
		icon: Grid3X3,
		component: React.lazy(() => import("./css-grid-and-flexbox/CssGridAndFlexbox")),
		category: "design",
		description: "Modern layout techniques",
	},
	{
		id: "javascript-es6",
		name: "JavaScript ES6+",
		icon: Code,
		component: React.lazy(() => import("./javascript-es6-plus/JavaScriptES6Plus")),
		category: "development",
		description: "Modern JavaScript features",
	},
	{
		id: "terminal",
		name: "Terminal",
		icon: Terminal,
		component: React.lazy(() => import("./terminal/Terminal")),
		category: "productivity",
		description: "Command line interface",
	},
	{
		id: "notes",
		name: "Notes",
		icon: FileText,
		component: React.lazy(() => import("./notes/Notes")),
		category: "productivity",
		description: "Quick note taking",
	},
	{
		id: "settings",
		name: "Settings",
		icon: Settings,
		component: React.lazy(() => import("./settings/Settings")),
		category: "productivity",
		description: "System preferences",
	},
];

interface AppIconProps {
	app: AppInfo;
	size?: "small" | "medium" | "large";
	onClick?: () => void;
	className?: string;
}

export function AppIcon({ app, size = "medium", onClick, className }: AppIconProps) {
	const Icon = app.icon;

	const iconSize = {
		small: 24,
		medium: 48,
		large: 64,
	}[size];

	return (
		<div
			className={`${styles.appIcon} ${styles[size]} ${className || ""}`}
			onClick={onClick}
			title={app.description}
		>
			<div className={styles.iconWrapper}>
				<Icon size={iconSize} className={styles.icon} />
			</div>
			<span className={styles.appName}>{app.name}</span>
		</div>
	);
}

interface DockIconProps {
	app: AppInfo;
	onClick?: () => void;
	isActive?: boolean;
}

export function DockIcon({ app, onClick, isActive }: DockIconProps) {
	const Icon = app.icon;

	return (
		<div
			className={`${styles.dockIcon} ${isActive ? styles.active : ""}`}
			onClick={onClick}
			title={app.name}
		>
			<div className={styles.dockIconWrapper}>
				<Icon size={32} className={styles.dockIconSvg} />
				{isActive && <div className={styles.activeIndicator} />}
			</div>
		</div>
	);
}
