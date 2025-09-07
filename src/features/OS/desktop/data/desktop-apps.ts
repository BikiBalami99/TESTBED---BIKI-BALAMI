/**
 * Desktop Apps Configuration
 *
 * This file serves as the single source of truth for which apps appear on the desktop
 * and their initial positions. Apps can be repositioned by users, but this defines
 * the default layout.
 */

export interface DesktopAppConfig {
	appId: string;
	x: number;
	y: number;
}

/**
 * Default desktop apps configuration
 * Apps are positioned on a 64px grid for consistent alignment
 */
export const DESKTOP_APPS: DesktopAppConfig[] = [
	{ appId: "javascript-playground", x: 64, y: 64 },
	{ appId: "notes", x: 192, y: 64 },
	{ appId: "settings", x: 320, y: 64 },
];

/**
 * Helper function to get desktop app config by app ID
 */
export const getDesktopAppConfig = (appId: string): DesktopAppConfig | undefined => {
	return DESKTOP_APPS.find((app) => app.appId === appId);
};

/**
 * Helper function to check if an app should appear on desktop by default
 */
export const isDesktopApp = (appId: string): boolean => {
	return DESKTOP_APPS.some((app) => app.appId === appId);
};
