/**
 * Desktop and Dock App Configuration
 *
 * Centralized exports for all desktop and dock app configurations.
 * This serves as the single source of truth for app placement in the OS.
 */

// Desktop apps configuration
export {
	DESKTOP_APPS,
	getDesktopAppConfig,
	isDesktopApp,
	type DesktopAppConfig,
} from "./desktop-apps";

// Dock apps configuration
export {
	DOCK_APPS,
	getDockAppConfig,
	isDockApp,
	getDockAppOrder,
	type DockAppConfig,
} from "./dock-apps";

// Configuration validation utilities
export {
	validateDesktopConfig,
	validateDockConfig,
	validateAllConfigs,
	logConfigValidation,
} from "./validate-config";
