"use client";

import React, { useState, useCallback, useRef, createContext, useContext } from "react";
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
}

interface OSProps {
	children: React.ReactNode;
}

// Create Context for Window Management
interface WindowContextType {
	createWindow: (
		title: string,
		content: React.ReactNode,
		x?: number,
		y?: number,
		width?: number,
		height?: number
	) => void;
	windows: WindowData[];
	focusedWindowId: string | null;
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

	// Create a new window
	const createWindow = useCallback(
		(
			title: string,
			content: React.ReactNode,
			x?: number,
			y?: number,
			width: number = 600,
			height: number = 400
		) => {
			const id = `window-${nextWindowId.current++}`;
			const newWindow: WindowData = {
				id,
				title,
				content,
				x: x ?? 50 + windows.length * 30,
				y: y ?? 50 + windows.length * 30,
				width,
				height,
				isMinimized: false,
				isMaximized: false,
				zIndex: nextZIndex,
			};

			setWindows((prev) => [...prev, newWindow]);
			setNextZIndex((prev) => prev + 1);
			setFocusedWindowId(id);
		},
		[windows.length, nextZIndex]
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

	// Focus a window
	const focusWindow = useCallback((id: string) => {
		setFocusedWindowId(id);
		setWindows((prev) => {
			const maxZ = Math.max(...prev.map((w) => w.zIndex));
			return prev.map((w) => (w.id === id ? { ...w, zIndex: maxZ + 1 } : w));
		});
		setNextZIndex((prev) => prev + 1);
	}, []);

	// Get visible (non-minimized) windows
	const visibleWindows = windows.filter((w) => !w.isMinimized);

	// Context value
	const contextValue: WindowContextType = {
		createWindow,
		windows,
		focusedWindowId,
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
							onFocus={focusWindow}
							isFocused={window.id === focusedWindowId}
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
