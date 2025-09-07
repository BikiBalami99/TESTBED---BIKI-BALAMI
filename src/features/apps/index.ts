// Auto-discovery system for apps
import React from "react";
import { Grid3X3, Code, Settings, FileText, Terminal } from "lucide-react";

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
		id: "javascript-playground",
		name: "JavaScript Playground",
		icon: Code,
		component: React.lazy(() => import("./terminal/Terminal")),
		category: "development",
		description: "Write and run JavaScript code",
	},
	{
		id: "app-launcher",
		name: "App Launcher",
		icon: Grid3X3,
		component: React.lazy(() => import("./app-launcher/AppLauncher")),
		category: "system",
		description: "Launch and manage applications",
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
