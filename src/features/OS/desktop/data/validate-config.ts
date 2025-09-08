/**
 * Configuration Validation Utilities
 *
 * This file provides utilities to validate that the desktop and dock configurations
 * are consistent and reference valid apps.
 */

import { AVAILABLE_APPS } from "../../../apps";
import { DESKTOP_APPS } from "./desktop-apps";
import { DOCK_APPS } from "./dock-apps";

/**
 * Validates that all apps referenced in desktop configuration exist
 */
export const validateDesktopConfig = (): { valid: boolean; errors: string[] } => {
	const errors: string[] = [];

	DESKTOP_APPS.forEach((app, index) => {
		const availableApp = AVAILABLE_APPS.find((a) => a.id === app.appId);
		if (!availableApp) {
			errors.push(
				`Desktop app at index ${index} references non-existent app: ${app.appId}`
			);
		}
	});

	return {
		valid: errors.length === 0,
		errors,
	};
};

/**
 * Validates that all apps referenced in dock configuration exist
 */
export const validateDockConfig = (): { valid: boolean; errors: string[] } => {
	const errors: string[] = [];

	DOCK_APPS.forEach((app, index) => {
		const availableApp = AVAILABLE_APPS.find((a) => a.id === app.appId);
		if (!availableApp) {
			errors.push(`Dock app at index ${index} references non-existent app: ${app.appId}`);
		}
	});

	return {
		valid: errors.length === 0,
		errors,
	};
};

/**
 * Validates both desktop and dock configurations
 */
export const validateAllConfigs = (): { valid: boolean; errors: string[] } => {
	const desktopValidation = validateDesktopConfig();
	const dockValidation = validateDockConfig();

	return {
		valid: desktopValidation.valid && dockValidation.valid,
		errors: [...desktopValidation.errors, ...dockValidation.errors],
	};
};

/**
 * Logs configuration validation results to console
 */
export const logConfigValidation = (): void => {
	const validation = validateAllConfigs();

	// Silence success logs; only surface concise warnings on errors in dev
	if (!validation.valid) {
		if (process.env.NODE_ENV !== "production") {
			console.warn("Configuration validation failed:", validation.errors);
		}
	}
};
