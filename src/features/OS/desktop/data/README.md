# Desktop and Dock App Configuration

This directory contains the centralized configuration for desktop and dock apps in the OS. This serves as the **single source of truth** for which apps appear where in the interface.

## Files

### `desktop-apps.ts`

- **Purpose**: Defines which apps appear on the desktop and their default positions
- **Configuration**: Array of `DesktopAppConfig` objects with `appId`, `x`, and `y` coordinates
- **Grid System**: Apps are positioned on a 64px grid for consistent alignment
- **User Customization**: Users can drag apps to new positions, which are saved to localStorage

### `dock-apps.ts`

- **Purpose**: Defines which apps appear in the dock (bottom toolbar)
- **Configuration**: Array of `DockAppConfig` objects with `appId`
- **Order**: Apps appear in the dock in the order specified in the array
- **Special Cases**: The App Launcher is always shown first in the dock (handled separately)

### `validate-config.ts`

- **Purpose**: Provides utilities to validate that configurations reference valid apps
- **Features**:
  - Validates that all referenced apps exist in the app registry
  - Logs validation results to console
  - Helps catch configuration errors during development

### `index.ts`

- **Purpose**: Centralized exports for all configuration data and utilities
- **Usage**: Import everything from `./data` instead of individual files

## Usage

```typescript
import { DESKTOP_APPS, DOCK_APPS, validateAllConfigs, logConfigValidation } from "./data";

// Validate configuration
const validation = validateAllConfigs();
if (!validation.valid) {
	console.error("Configuration errors:", validation.errors);
}

// Log validation results
logConfigValidation();
```

## Adding New Apps

1. **Add the app** to `/src/features/apps/index.ts` (the app registry)
2. **Add to desktop** by adding an entry to `DESKTOP_APPS` in `desktop-apps.ts`
3. **Add to dock** by adding an entry to `DOCK_APPS` in `dock-apps.ts`
4. **Run validation** to ensure the app exists in the registry

## Migration from Hardcoded Arrays

Previously, desktop and dock apps were hardcoded in the `Desktop.tsx` component. This refactoring:

- ✅ **Centralizes configuration** in dedicated files
- ✅ **Maintains backward compatibility** with localStorage user preferences
- ✅ **Provides validation** to catch configuration errors
- ✅ **Makes it easy** to add/remove/reorder apps
- ✅ **Separates concerns** between app registry and UI placement

## Special Cases

- **App Launcher**: Always shown first in dock, handled separately from configuration
- **User Preferences**: Saved positions and customizations are merged with default configuration
- **Grid Snapping**: All desktop positions are snapped to a 64px grid
