# OS Simulation - Developer Guide

A macOS-style desktop environment built with React/Next.js for hosting mini-projects and tutorials as individual applications.

## Project Structure

```
src/features/
├── OS/                    # Core OS simulation
│   ├── OS.tsx            # Main OS container with window management
│   ├── Window/           # Draggable/resizable windows
│   └── desktop/          # Desktop environment (dock, menu bar, etc.)
└── apps/                 # Individual applications
    ├── index.ts          # App registry (AVAILABLE_APPS)
    ├── javascript-playground/
    ├── notes/
    └── [your-app]/       # Add new apps here
```

## Adding New Apps

1. **Create app directory**: `src/features/apps/your-app/`
2. **Add to registry**: Update `AVAILABLE_APPS` in `src/features/apps/index.ts`
3. **Configure placement**: Add to `DESKTOP_APPS` or `DOCK_APPS` in `src/features/OS/desktop/data/`

```typescript
// In apps/index.ts
{
  id: "your-app",
  name: "Your App",
  icon: YourIcon,
  component: React.lazy(() => import("./your-app/YourApp")),
  category: "development",
  description: "Your app description"
}
```

### Place the app on Desktop and Dock

Add your app ID to the centralized placement configs:

```ts
// Desktop icon placement (grid-based)
// src/features/OS/desktop/data/desktop-apps.ts
export const DESKTOP_APPS = [
	{ appId: "javascript-playground", x: 64, y: 64 },
	{ appId: "notes", x: 192, y: 64 },
	{ appId: "settings", x: 320, y: 64 },
	{ appId: "your-app-id", x: 448, y: 64 }, // add your app here
];

// Dock apps ordering
// src/features/OS/desktop/data/dock-apps.ts
export const DOCK_APPS = [
	{ appId: "javascript-playground" },
	{ appId: "notes" },
	{ appId: "settings" },
	{ appId: "your-app-id" }, // add your app here
];
```

## Window System

Apps run inside draggable/resizable windows (`Window.tsx`). Each window:

- Has unique ID and manages position/size
- Provides window controls (minimize, maximize, close)
- Handles focus management and z-index stacking
- Supports animations (minimize to dock, etc.)

## Responsive Design in Windows

**Problem**: Media queries don't work inside windows since they use viewport dimensions.

**Solution**: Use `WindowContext` to get current window dimensions, then expose a
`data-screen` (or similar) attribute in your markup and style via CSS using nested
selectors that resemble `@media` query blocks. This keeps responsive rules in CSS
(SOC) instead of inline styles.

```typescript
import { useMemo } from "react";
import { useWindowDimensions } from "@/features/OS/Window/WindowContext";
import styles from "./YourApp.module.css";

function YourApp() {
	const { width, height } = useWindowDimensions();

	// Derive semantic labels from live width/height (recomputed on resize)
	const screen = useMemo(() => (width < 500 ? "sm" : width < 800 ? "md" : "lg"), [width]);
	const hTier = useMemo(
		() => (height < 400 ? "short" : height < 700 ? "medium" : "tall"),
		[height]
	);

	return (
		<div className={styles.container} data-screen={screen} data-h={hTier}>
			{/* Your responsive content */}
		</div>
	);
}
```

```css
/* YourApp.module.css - @media query style with CSS nesting */
.container {
	display: flex;
	transition: padding 120ms ease, gap 120ms ease, flex-direction 120ms ease;
}

/* ===== @media-like (min-width: 800px) - LARGE ===== */
.container[data-screen="lg"] {
	flex-direction: row;
	padding: 1rem;

	&[data-h="tall"] {
		gap: 1rem;
	}
}

/* ===== @media-like (min-width: 500px and max-width: 799px) - MEDIUM ===== */
.container[data-screen="md"] {
	flex-direction: row;
	padding: 0.75rem;
}

/* ===== @media-like (max-width: 499px) - SMALL ===== */
.container[data-screen="sm"] {
	flex-direction: column;
	padding: 0.5rem;

	&[data-h="short"] {
		height: 100%;
		overflow: auto;
	}
}
```

### Usage

- `width`: Current window content width (excluding title bar)
- `height`: Current window content height (excluding title bar)
- Define per-app breakpoints, map to `data-screen`, and style with attribute selectors
- Optional: expose more attributes if needed, e.g. `data-h` tiers

```tsx
// No extra setup: values update automatically during drag/resize/maximize
const { width, height } = useWindowDimensions();
const screen = width < 500 ? "sm" : width < 800 ? "md" : "lg";
const heightTier = height < 400 ? "short" : height < 700 ? "medium" : "tall";
return <div className={styles.container} data-screen={screen} data-h={heightTier} />;
```

Notes

- Values are live: context emits updates on drag, resize, maximize/restore.
- Keep logic minimal in JS; push layout to CSS via attribute selectors.
- Pick thresholds per app; there is no global breakpoint contract.

### Provider & API

- The context is provided by `Window.tsx` per-window. You do not need to wrap anything in `layout.tsx`.
- Import the hook from: `src/features/OS/Window/WindowContext.tsx`.
- API shape:

```ts
type WindowDimensions = {
	width: number;
	height: number;
};

function useWindowDimensions(): WindowDimensions;
```

## Key Features

- **Window Management**: Drag, resize, minimize, maximize, focus
- **Desktop Environment**: Dock, menu bar, desktop icons, context menus
- **App Launcher**: Grid view of all available apps
- **Persistence**: Window positions and user preferences saved to localStorage
- **Animations**: macOS-style minimize/restore animations

## Development

1. **Start dev server**: `npm run dev` (full visuals including blur effects)
2. **Start turbo dev server**: `npm run dev:turbo` (reduced effects for faster reloads)
3. **Add new app**: Create component and update the app registry
4. **Test responsiveness**: Use `useWindowDimensions()` instead of media queries
5. **Validate config**: Check console for desktop/dock config validation logs

## Mobile vs Desktop Differences

The OS simulation automatically adapts between desktop and mobile modes based on device detection and screen size.

### Device Detection

The system distinguishes between actual mobile devices and small desktop windows:

```typescript
// Mobile detection logic in MobileContext.tsx
const isActualMobileDevice =
	typeof window !== "undefined" &&
	(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
		navigator.userAgent
	) ||
		("ontouchstart" in window && navigator.maxTouchPoints > 0));

const isMobile = screenWidth <= 768 && isActualMobileDevice;
const isDesktop = screenWidth > 1024 || (screenWidth <= 768 && !isActualMobileDevice);
```

### Desktop Mode (Default)

- **Window System**: Full desktop experience with draggable/resizable windows
- **Event Handling**: Mouse events (click, drag, hover)
- **UI Components**: Desktop dock, menu bar, desktop icons
- **Interaction**: Click to open apps, drag to move windows

### Mobile Mode (Touch Devices)

- **Window System**: Single-window focus with mobile navigation
- **Event Handling**: Touch events (touchstart, touchmove, touchend)
- **UI Components**: Mobile dock, mobile menu bar, mobile navigation
- **Interaction**: Tap to open apps, swipe gestures for navigation

### Event Handling Strategy

Desktop components handle both mouse and touch events for universal compatibility:

```typescript
// Desktop apps support both interaction types
<div
  onMouseDown={(e) => handleMouseDown(e, appId)}
  onTouchStart={(e) => handleTouchStart(e, appId)}
  onClick={onClick}
>
```

### Responsive Breakpoints

- **Mobile**: ≤ 768px AND actual mobile device
- **Tablet**: 769px - 1024px
- **Desktop**: > 1024px OR small desktop window (≤ 768px but not mobile device)

### Development Considerations

- **Testing**: Use Chrome DevTools responsive mode with touch simulation
- **Event Handling**: Desktop components work in both modes
- **Styling**: Use `useMobile()` hook for mobile-specific styling
- **Navigation**: Mobile mode provides back/forward navigation

## Architecture Notes

- **OS.tsx**: Main container, manages all windows and global state
- **WindowContext**: Provides window dimensions to child apps
- **App Registry**: Centralized list of all available applications
- **Desktop Data**: Configuration for desktop/dock app placement
- **Lazy Loading**: Apps are code-split and loaded on demand
