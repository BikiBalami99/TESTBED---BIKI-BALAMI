# macOS Desktop Environment

React-based desktop environment with window management.

## Architecture

```
src/features/OS/
├── OS.tsx                   # Master OS component with proper layering
├── Window/                  # Individual draggable/resizable windows
├── desktop/                 # Desktop environment & dock
│   ├── AppIcons/           # App icon components
│   ├── AppLauncher/        # App launcher modal
│   └── Desktop.tsx         # Main desktop interface
└── apps/                    # Individual app implementations
```

## OS Component

Master OS component providing proper z-index layering and window management:

**Z-Index Hierarchy:**

- Desktop background: 1
- Desktop icons: 10
- Windows: 100+ (dynamic stacking)
- Menu bar: 1000
- Dock: 1001
- App launcher: 2000
- Context menus: 3000

**Key Features:**

- Proper layered architecture preventing z-index conflicts
- Window focus management and stacking order
- React Context for global state sharing
- Background gradient and visual effects

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

Individual draggable/resizable windows with macOS-style design:

- **8-way resizing**: Corners and edges for precise window sizing
- **Title bar dragging**: Mouse tracking with smooth movement
- **Traffic lights**: Close, minimize, maximize controls (macOS style)
- **Glassmorphism styling**: Modern translucent window design
- **Focus management**: Proper z-index stacking when clicked
- **Minimum sizes**: Prevents windows from becoming too small

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

Main desktop interface with macOS-inspired design:

- **Desktop app icons**: Positioned with drag-and-drop support
- **Bottom dock**: Glassmorphism dock with app shortcuts
- **Menu bar**: Top menu bar with time display and system info
- **App launcher**: Modal with searchable app grid
- **Local storage**: Persists user preferences and app positions
- **Responsive design**: Adapts to different screen sizes

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

macOS-style bottom dock with enhanced features:

- **Glassmorphism styling**: Translucent background with blur effects
- **Dynamic app icons**: Responsive icons that scale on hover
- **App launcher integration**: Built-in launcher button
- **Hover animations**: Smooth scaling and visual feedback
- **Active indicators**: Shows which apps are currently running
- **Responsive layout**: Adapts to different screen sizes

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

Modern modal with searchable app grid:

- **Search functionality**: Search by app name or description
- **Category filtering**: Filter apps by development, design, or productivity
- **Responsive grid layout**: Adapts to different screen sizes
- **Keyboard navigation**: Full keyboard support for accessibility
- **Glassmorphism design**: Consistent with overall OS aesthetic
- **Auto-focus**: Search input automatically focused when opened

## Key Features

### Window System

Advanced window management with proper layering:

- **Drag & drop title bars**: Smooth window movement with mouse tracking
- **8-way resizing**: Precise window sizing from corners and edges
- **Focus management**: Proper z-index stacking and window focus
- **Traffic light controls**: macOS-style close, minimize, maximize buttons
- **Multiple concurrent windows**: Support for unlimited open windows
- **Minimum size constraints**: Prevents windows from becoming unusable
- **Proper layering**: Windows always appear above desktop elements

### Desktop Features

Complete desktop environment with modern features:

- **Desktop app shortcuts**: Positioned icons with click-to-launch functionality
- **Dynamic dock**: Add/remove apps from dock with visual feedback
- **App launcher modal**: Searchable grid of all available applications
- **Local storage persistence**: Remembers user preferences and app positions
- **Context menus**: Right-click menus for app management
- **Responsive design**: Adapts to mobile and desktop screen sizes
- **Real-time clock**: Menu bar displays current time

### Visual Design

Modern macOS-inspired visual design:

- **Glassmorphism effects**: Translucent components with backdrop blur
- **Big Sur gradient background**: Dynamic animated gradient background
- **Lucide React icons**: Consistent, high-quality iconography
- **CSS transitions and transforms**: Smooth animations throughout
- **Responsive layouts**: Mobile-first design approach
- **macOS-style components**: Traffic lights, dock, menu bar styling
- **Color scheme**: Consistent with macOS design language

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

Comprehensive state management system:

- **React Context**: Global window state sharing across components
- **Local storage**: Persistent user preferences and app positions
- **useState/useEffect**: Component-level state management
- **Mouse event handlers**: Advanced interaction handling
- **Window focus tracking**: Proper focus management and z-index updates
- **Event cleanup**: Proper cleanup of event listeners

### Performance

Optimized for smooth performance:

- **React.lazy()**: App code splitting for faster initial load
- **CSS modules**: Scoped styling to prevent style conflicts
- **Proper useEffect dependencies**: Optimized re-renders
- **Event listener cleanup**: Memory leak prevention
- **Efficient z-index management**: Minimal re-renders for window stacking
- **Optimized animations**: Hardware-accelerated CSS transforms

### Responsive Design

Mobile-first responsive design:

- **Mobile-optimized layouts**: Touch-friendly interface design
- **Touch-friendly targets**: Appropriate sizing for mobile interaction
- **CSS Grid/Flexbox layouts**: Modern layout techniques
- **Media query breakpoints**: Responsive breakpoints for all screen sizes
- **Adaptive dock**: Dock behavior changes on mobile devices
- **Mobile window management**: Optimized window controls for touch

Built with React, TypeScript, Next.js. Follows macOS design patterns with web technologies.
