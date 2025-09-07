# DockItem Component

The `DockItem` component is a dedicated component for individual dock items in the macOS-style dock. It was migrated from the `DockIcon` component in `AppIcons.tsx` to provide better separation of concerns and maintainability.

## Migration Details

### What Was Moved

- **`DockIcon` function** from `AppIcons.tsx` → `DockItem.tsx`
- **Dock-specific CSS styles** from `AppIcons.module.css` → `DockItem.module.css`
- **DockIconProps interface** → `DockItemProps` interface

### Files Affected

- ✅ **Created**: `DockItem.tsx` - New component file
- ✅ **Created**: `DockItem.module.css` - New styles file
- ✅ **Updated**: `Dock.tsx` - Now imports and uses `DockItem`
- ✅ **Updated**: `AppIcons.tsx` - Removed `DockIcon` function
- ✅ **Updated**: `AppIcons.module.css` - Removed dock-specific styles
- ✅ **Updated**: `index.ts` - Added `DockItem` export

## Component API

### Props

```typescript
interface DockItemProps {
	app: AppInfo; // App information object
	onClick?: () => void; // Click handler
	isActive?: boolean; // Whether the app is currently active
	onMouseEnter?: () => void; // Mouse enter handler
	onMouseLeave?: () => void; // Mouse leave handler
	showPreview?: boolean; // Whether to show window preview
	previewContent?: React.ReactNode; // Preview content component
}
```

### Usage

```tsx
import { DockItem } from "@/features/OS/desktop";

<DockItem
	app={appInfo}
	onClick={() => handleAppClick(appInfo)}
	isActive={isAppActive}
	onMouseEnter={() => handleMouseEnter(appInfo.id)}
	onMouseLeave={handleMouseLeave}
	showPreview={showPreview}
	previewContent={previewComponent}
/>;
```

## Features

### Visual Design

- **macOS-style glassmorphism** with backdrop blur effects
- **Smooth hover animations** with background color changes
- **Active indicator** with pulsing animation for running apps
- **Responsive design** that adapts to different screen sizes

### Functionality

- **Click handling** for app launching/focusing
- **Hover states** for preview functionality
- **Active state** indication for running applications
- **Preview support** for window management

### Styling

- **CSS Modules** for scoped styling
- **Consistent theming** with the rest of the desktop
- **Smooth transitions** for all interactive states
- **Mobile responsive** with appropriate sizing adjustments

## Benefits of Migration

1. **Better Separation of Concerns** - Dock items are now isolated from general app icons
2. **Improved Maintainability** - Easier to modify dock-specific functionality
3. **Cleaner Code Organization** - Related functionality is grouped together
4. **Enhanced Reusability** - DockItem can be used independently
5. **Better Performance** - Smaller, focused component with optimized rendering

## Dependencies

- **AppInfo interface** from `../AppIcons/AppIcons`
- **React** for component functionality
- **CSS Modules** for styling

## Related Components

- **Dock** - Parent component that uses DockItem
- **DockPreview** - Preview component for window management
- **AppIcons** - Contains AppInfo interface and other icon components
