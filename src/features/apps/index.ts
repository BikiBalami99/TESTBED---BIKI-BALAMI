// Auto-discovery system for apps
import React from "react";
import {
	Monitor,
	Grid3X3,
	LayoutGrid,
	Code,
	Settings,
	FileText,
	Terminal,
} from "lucide-react";

export interface AppInfo {
	id: string;
	name: string;
	icon: React.ComponentType<{ size?: number; className?: string }>;
	component: React.ComponentType;
	category: "development" | "design" | "productivity" | "system";
	description: string;
}

// Lazy load all apps from the apps directory
// This creates a registry of all available apps
export const AVAILABLE_APPS: AppInfo[] = [
	{
		id: "app-launcher",
		name: "App Launcher",
		icon: Grid3X3,
		component: React.lazy(() => import("./app-launcher/AppLauncher")),
		category: "system",
		description: "Launch and manage applications",
	},
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
		icon: LayoutGrid,
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

// Helper function to get app by ID
export const getAppById = (id: string): AppInfo | undefined => {
	return AVAILABLE_APPS.find((app) => app.id === id);
};

// Helper function to get apps by category
export const getAppsByCategory = (category: AppInfo["category"]): AppInfo[] => {
	return AVAILABLE_APPS.filter((app) => app.category === category);
};

// Export for backward compatibility
export { AVAILABLE_APPS as default };
