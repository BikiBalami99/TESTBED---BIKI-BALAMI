# macOS Desktop Environment

React-based desktop environment with window management.

## Architecture

```
src/features/OS/
├── OS.tsx                   # Master OS component with proper layering
├── Window/                  # Individual windows
├── desktop/                 # Desktop & dock
├── WindowManager/           # Legacy (deprecated)
└── apps/                    # App ecosystem
```

## OS Component

Master OS component providing proper z-index layering:

**Z-Index Hierarchy:**

- Desktop background: 1
- Desktop icons: 10
- Windows: 100+
- Menu bar: 1000
- Dock: 1001
- App launcher: 2000
- Context menus: 3000

Core window system providing:

- Window creation with unique IDs
- Z-index management and focus handling
- Position/size tracking
- React Context for state sharing

```typescript
const createWindow = useCallback(
	(
		title: string,
		content: React.ReactNode,
		x?: number,
		y?: number,
		width?: number,
		height?: number
	) => {
		const id = `window-${nextWindowId.current++}`;
		// Creates window with unique ID and positioning
	},
	[nextZIndex]
);
```

## Window Component

Individual draggable/resizable windows:

- 8-way resizing (corners + edges)
- Title bar dragging with mouse tracking
- Traffic lights (close/minimize/maximize)
- Glassmorphism styling

```typescript
const handleMouseDown = useCallback(
	(e) => {
		onFocus(id);
		setDragState({
			isDragging: true,
			dragStartX: e.clientX,
			dragStartY: e.clientY,
			windowStartX: position.x,
			windowStartY: position.y,
		});
	},
	[position.x, position.y, onFocus, id]
);
```

## Desktop Component

Main desktop interface:

- Desktop app icons with positioning
- Bottom dock with app shortcuts
- Menu bar with time display
- App launcher modal
- Local storage for user preferences

```typescript
// Desktop app rendering
{
	desktopApps.map((desktopApp) => (
		<div key={desktopApp.appId} style={{ left: desktopApp.x, top: desktopApp.y }}>
			<AppIcon app={app} size="medium" onClick={() => handleDesktopAppClick(app)} />
		</div>
	));
}
```

## Dock

- Glassmorphism styling
- Dynamic app icons
- App launcher integration
- Hover animations

## App Ecosystem

### App Structure

```
src/features/apps/[app-name]/
├── [AppName].tsx              # Main component
└── [AppName].module.css       # Scoped styling
```

### App Registration

Apps registered in `AVAILABLE_APPS` array:

```typescript
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
	// ... more apps
];
```

### App Launcher

Modal with searchable app grid:

- Search by name/description
- Category filtering
- Responsive grid layout
- Keyboard navigation

## Key Features

### Window System

- Drag & drop title bars
- 8-way resizing (corners + edges)
- Focus management and z-index stacking
- Traffic light controls (close/minimize/maximize)
- Multiple concurrent windows

### Desktop Features

- Desktop app shortcuts with positioning
- Dynamic dock with add/remove functionality
- App launcher modal with search
- Local storage persistence
- Context menus for management

### Visual Design

- Glassmorphism effects
- Big Sur gradient background
- Lucide React icons
- CSS transitions and transforms
- Responsive layouts

## Usage

### Basic Interaction

1. Click desktop/dock icons to open apps in windows
2. Double-click desktop or click dock launcher for app grid
3. Drag window title bars to move
4. Drag edges/corners to resize
5. Use traffic lights for window controls

### Adding Apps

1. Create `src/features/apps/[app-name]/`
2. Add `[AppName].tsx` and `[AppName].module.css`
3. Register in `AppIcons.tsx` AVAILABLE_APPS array
4. App appears in launcher automatically

### Customization

- Modify `dockApps` array in Desktop.tsx for dock apps
- Edit `desktopApps` array for desktop positioning
- Use CSS modules for component styling
- Add Lucide React icons for app icons

## Technical Details

### State Management

- React Context for window state sharing
- Local storage for user preferences
- useState/useEffect for component state
- Mouse event handlers for interactions

### Performance

- React.lazy() for app code splitting
- CSS modules for scoped styling
- Proper useEffect dependencies
- Event listener cleanup

### Responsive Design

- Mobile-optimized layouts
- Touch-friendly targets
- CSS Grid/Flexbox layouts
- Media query breakpoints

Built with React, TypeScript, Next.js. Follows macOS design patterns with web technologies.
