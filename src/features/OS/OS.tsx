"use client";

import React, {
	useState,
	useCallback,
	useRef,
	createContext,
	useContext,
	useEffect,
} from "react";
import Window from "./Window/Window";
import styles from "./OS.module.css";

export interface WindowData {
	id: string;
	title: string;
	content: React.ReactNode;
	x: number;
	y: number;
	width: number;
	height: number;
	isMinimized: boolean;
	isMaximized: boolean;
	zIndex: number;
	appId?: string; // Added appId to the interface
	// Original position and size for restore functionality
	originalX?: number;
	originalY?: number;
	originalWidth?: number;
	originalHeight?: number;
	// Window state persistence
	lastFocused?: boolean;
	createdAt: number;
}

interface OSProps {
	children: React.ReactNode;
}

// Create Context for Window Management
interface WindowContextType {
	createWindow: (
		title: string,
		content: React.ReactNode,
		appId?: string,
		x?: number,
		y?: number,
		width?: number,
		height?: number
	) => void;
	windows: WindowData[];
	focusedWindowId: string | null;
	getOpenedApps: () => string[];
	getWindowsForApp: (appId: string) => WindowData[];
	getAllWindowsForApp: (appId: string) => WindowData[];
	closeWindow: (id: string) => void;
	focusWindow: (id: string) => void;
	maximizeWindow: (id: string) => void;
	// New methods for single instance management
	getWindowForApp: (appId: string) => WindowData | null;
	openOrFocusApp: (appId: string, title: string, content: React.ReactNode) => void;
	restoreWindow: (id: string) => void;
	updateWindowPosition: (
		id: string,
		x: number,
		y: number,
		width: number,
		height: number
	) => void;
}

const WindowContext = createContext<WindowContextType | null>(null);

export const useWindowManager = () => {
	const context = useContext(WindowContext);
	if (!context) {
		throw new Error("useWindowManager must be used within an OS component");
	}
	return context;
};

export default function OS({ children }: OSProps) {
	const [windows, setWindows] = useState<WindowData[]>([]);
	const [nextZIndex, setNextZIndex] = useState(100); // Start windows at z-index 100
	const [focusedWindowId, setFocusedWindowId] = useState<string | null>(null);

	const nextWindowId = useRef(1);

	// Helper function to constrain window position and size to viewport
	const constrainToViewport = useCallback(
		(x: number, y: number, width: number, height: number) => {
			const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1200;
			const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800;

			// Ensure minimum sizes
			const constrainedWidth = Math.max(300, Math.min(width, viewportWidth));
			const constrainedHeight = Math.max(200, Math.min(height, viewportHeight));

			// Constrain position to viewport bounds
			const minX = 0;
			const minY = 0;
			const maxX = viewportWidth - constrainedWidth;
			const maxY = viewportHeight - constrainedHeight;

			const constrainedX = Math.max(minX, Math.min(maxX, x));
			const constrainedY = Math.max(minY, Math.min(maxY, y));

			return {
				x: constrainedX,
				y: constrainedY,
				width: constrainedWidth,
				height: constrainedHeight,
			};
		},
		[]
	);

	// Load window positions from localStorage on mount
	useEffect(() => {
		const savedWindows = localStorage.getItem("windowPositions");
		if (savedWindows) {
			try {
				const parsed = JSON.parse(savedWindows);
				// Only restore positions, not full window state
				setWindows((prev) =>
					prev.map((window) => {
						if (window.appId) {
							const saved = parsed[window.appId];
							if (saved) {
								const constrained = constrainToViewport(
									saved.x || window.x,
									saved.y || window.y,
									saved.width || window.width,
									saved.height || window.height
								);
								return {
									...window,
									x: constrained.x,
									y: constrained.y,
									width: constrained.width,
									height: constrained.height,
								};
							}
						}
						return window;
					})
				);
			} catch (error) {
				console.warn("Failed to load window positions:", error);
			}
		}
	}, [constrainToViewport]);

	// Save window positions to localStorage whenever windows change
	useEffect(() => {
		const windowPositions: Record<
			string,
			{ x: number; y: number; width: number; height: number }
		> = {};
		windows.forEach((window) => {
			if (window.appId) {
				windowPositions[window.appId] = {
					x: window.x,
					y: window.y,
					width: window.width,
					height: window.height,
				};
			}
		});
		localStorage.setItem("windowPositions", JSON.stringify(windowPositions));
	}, [windows]);

	// Create a new window
	const createWindow = useCallback(
		(
			title: string,
			content: React.ReactNode,
			appId?: string,
			x?: number,
			y?: number,
			width: number = 600,
			height: number = 400
		) => {
			const id = `window-${nextWindowId.current++}`;
			const initialX = x ?? 50 + windows.length * 30;
			const initialY = y ?? 50 + windows.length * 30;

			// Constrain initial position and size to viewport
			const constrained = constrainToViewport(initialX, initialY, width, height);

			const newWindow: WindowData = {
				id,
				title,
				content,
				appId,
				x: constrained.x,
				y: constrained.y,
				width: constrained.width,
				height: constrained.height,
				isMinimized: false,
				isMaximized: false,
				zIndex: nextZIndex,
				lastFocused: true,
				createdAt: Date.now(),
			};

			setWindows((prev) => [...prev, newWindow]);
			setNextZIndex((prev) => prev + 1);
			setFocusedWindowId(id);
		},
		[windows.length, nextZIndex, constrainToViewport]
	);

	// Close a window
	const closeWindow = useCallback(
		(id: string) => {
			setWindows((prev) => prev.filter((w) => w.id !== id));
			if (focusedWindowId === id) {
				// Find the window with the highest z-index to focus
				const remainingWindows = windows.filter((w) => w.id !== id);
				if (remainingWindows.length > 0) {
					const highestZ = Math.max(...remainingWindows.map((w) => w.zIndex));
					const nextFocus = remainingWindows.find((w) => w.zIndex === highestZ);
					setFocusedWindowId(nextFocus?.id || null);
				} else {
					setFocusedWindowId(null);
				}
			}
		},
		[focusedWindowId, windows]
	);

	// Minimize a window
	const minimizeWindow = useCallback((id: string) => {
		setWindows((prev) =>
			prev.map((w) => (w.id === id ? { ...w, isMinimized: true } : w))
		);
	}, []);

	// Maximize/Restore a window
	const maximizeWindow = useCallback((id: string) => {
		setWindows((prev) =>
			prev.map((w) => {
				if (w.id === id) {
					const isCurrentlyMaximized = w.isMaximized;
					const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1200;
					const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800;

					return {
						...w,
						isMaximized: !isCurrentlyMaximized,
						// Store original position and size when maximizing
						originalX: isCurrentlyMaximized ? w.originalX : w.x,
						originalY: isCurrentlyMaximized ? w.originalY : w.y,
						originalWidth: isCurrentlyMaximized ? w.originalWidth : w.width,
						originalHeight: isCurrentlyMaximized ? w.originalHeight : w.height,
						// Set maximized position and size
						x: isCurrentlyMaximized ? w.originalX ?? 100 : 0,
						y: isCurrentlyMaximized ? w.originalY ?? 100 : 0,
						width: isCurrentlyMaximized ? w.originalWidth ?? 600 : viewportWidth,
						height: isCurrentlyMaximized ? w.originalHeight ?? 400 : viewportHeight,
					};
				}
				return w;
			})
		);
	}, []);

	// Focus a window
	const focusWindow = useCallback((id: string) => {
		setFocusedWindowId(id);
		setWindows((prev) => {
			const maxZ = Math.max(...prev.map((w) => w.zIndex));
			return prev.map((w) =>
				w.id === id
					? { ...w, zIndex: maxZ + 1, lastFocused: true }
					: { ...w, lastFocused: false }
			);
		});
		setNextZIndex((prev) => prev + 1);
	}, []);

	// Get visible (non-minimized) windows
	const visibleWindows = windows.filter((w) => !w.isMinimized);

	// Get unique opened app IDs (including minimized windows)
	const getOpenedApps = useCallback(() => {
		const appIds = windows
			.filter((w) => w.appId) // Include both visible and minimized windows
			.map((w) => w.appId!)
			.filter((appId, index, arr) => arr.indexOf(appId) === index);
		return appIds;
	}, [windows]);

	// Get all windows for a specific app (visible only)
	const getWindowsForApp = useCallback(
		(appId: string) => {
			return windows.filter((w) => w.appId === appId && !w.isMinimized);
		},
		[windows]
	);

	// Get all windows for a specific app (including minimized)
	const getAllWindowsForApp = useCallback(
		(appId: string) => {
			return windows.filter((w) => w.appId === appId);
		},
		[windows]
	);

	// Get single window for a specific app (for single instance management)
	const getWindowForApp = useCallback(
		(appId: string) => {
			return windows.find((w) => w.appId === appId) || null;
		},
		[windows]
	);

	// Restore a minimized window
	const restoreWindow = useCallback(
		(id: string) => {
			setWindows((prev) =>
				prev.map((w) => (w.id === id ? { ...w, isMinimized: false } : w))
			);
			focusWindow(id);
		},
		[focusWindow]
	);

	// Open or focus an app (single instance management)
	const openOrFocusApp = useCallback(
		(appId: string, title: string, content: React.ReactNode) => {
			const existingWindow = getWindowForApp(appId);

			if (existingWindow) {
				// Window exists - focus it or restore if minimized
				if (existingWindow.isMinimized) {
					restoreWindow(existingWindow.id);
				} else {
					focusWindow(existingWindow.id);
				}
			} else {
				// No window exists - create new one
				// Try to load saved position for this app
				const savedPositions = localStorage.getItem("windowPositions");
				let x = 50 + windows.length * 30;
				let y = 50 + windows.length * 30;
				let width = 800;
				let height = 600;

				if (savedPositions) {
					try {
						const parsed = JSON.parse(savedPositions);
						const saved = parsed[appId];
						if (saved) {
							x = saved.x;
							y = saved.y;
							width = saved.width;
							height = saved.height;
						}
					} catch (error) {
						console.warn("Failed to load saved position for app:", appId);
					}
				}

				// Constrain saved position to current viewport
				const constrained = constrainToViewport(x, y, width, height);
				createWindow(
					title,
					content,
					appId,
					constrained.x,
					constrained.y,
					constrained.width,
					constrained.height
				);
			}
		},
		[
			getWindowForApp,
			restoreWindow,
			focusWindow,
			createWindow,
			windows.length,
			constrainToViewport,
		]
	);

	// Update window position and size
	const updateWindowPosition = useCallback(
		(id: string, x: number, y: number, width: number, height: number) => {
			const constrained = constrainToViewport(x, y, width, height);
			setWindows((prev) =>
				prev.map((w) =>
					w.id === id
						? {
								...w,
								x: constrained.x,
								y: constrained.y,
								width: constrained.width,
								height: constrained.height,
						  }
						: w
				)
			);
		},
		[constrainToViewport]
	);

	// Context value
	const contextValue: WindowContextType = {
		createWindow,
		windows,
		focusedWindowId,
		getOpenedApps,
		getWindowsForApp,
		getAllWindowsForApp,
		closeWindow,
		focusWindow,
		maximizeWindow,
		// New methods
		getWindowForApp,
		openOrFocusApp,
		restoreWindow,
		updateWindowPosition,
	};

	return (
		<WindowContext.Provider value={contextValue}>
			<div className={styles.os}>
				{/* Layer 1: Desktop Background & Apps (z-index: 1-10) */}
				<div className={styles.desktopLayer}>{children}</div>

				{/* Layer 2: Windows (z-index: 100+) */}
				<div className={styles.windowLayer}>
					{visibleWindows.map((window) => (
						<Window
							key={window.id}
							id={window.id}
							title={window.title}
							initialX={window.x}
							initialY={window.y}
							initialWidth={window.width}
							initialHeight={window.height}
							onClose={closeWindow}
							onMinimize={minimizeWindow}
							onMaximize={maximizeWindow}
							onFocus={focusWindow}
							onPositionUpdate={updateWindowPosition}
							isFocused={window.id === focusedWindowId}
							isMaximized={window.isMaximized}
							zIndex={window.zIndex}
						>
							{window.content}
						</Window>
					))}
				</div>

				{/* Layer 3: System UI (Menu Bar, Dock) - handled by children but with proper z-index */}
				{/* These will be rendered by Desktop component but with correct stacking context */}
			</div>
		</WindowContext.Provider>
	);
}
