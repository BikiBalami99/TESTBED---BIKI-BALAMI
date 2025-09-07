/**
 * Dock Apps Configuration
 *
 * This file serves as the single source of truth for which apps appear in the dock.
 * The dock shows frequently used apps and running applications.
 */

export interface DockAppConfig {
	appId: string;
}

/**
 * Default dock apps configuration
 * These apps will always appear in the dock, in the order specified
 */
export const DOCK_APPS: DockAppConfig[] = [
	{ appId: "javascript-playground" },
	{ appId: "notes" },
	{ appId: "settings" },
];

/**
 * Helper function to get dock app config by app ID
 */
export const getDockAppConfig = (appId: string): DockAppConfig | undefined => {
	return DOCK_APPS.find((app) => app.appId === appId);
};

/**
 * Helper function to check if an app should appear in dock by default
 */
export const isDockApp = (appId: string): boolean => {
	return DOCK_APPS.some((app) => app.appId === appId);
};

/**
 * Get the order/position of an app in the dock
 */
export const getDockAppOrder = (appId: string): number => {
	const index = DOCK_APPS.findIndex((app) => app.appId === appId);
	return index >= 0 ? index : -1;
};
