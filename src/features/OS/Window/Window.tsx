"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import styles from "./Window.module.css";

interface WindowProps {
	id: string;
	title: string;
	children: React.ReactNode;
	initialX?: number;
	initialY?: number;
	initialWidth?: number;
	initialHeight?: number;
	onClose: (id: string) => void;
	onMinimize: (id: string, dockPosition?: { x: number; y: number }) => void;
	onMaximize: (id: string) => void;
	onFocus: (id: string) => void;
	onPositionUpdate?: (
		id: string,
		x: number,
		y: number,
		width: number,
		height: number
	) => void;
	isFocused: boolean;
	isMaximized: boolean;
	isRestoring?: boolean;
	dockPosition?: { x: number; y: number };
	zIndex: number;
}

interface DragState {
	isDragging: boolean;
	dragStartX: number;
	dragStartY: number;
	windowStartX: number;
	windowStartY: number;
}

interface ResizeState {
	isResizing: boolean;
	resizeHandle: string;
	resizeStartX: number;
	resizeStartY: number;
	windowStartWidth: number;
	windowStartHeight: number;
	windowStartX: number;
	windowStartY: number;
}

export default function Window({
	id,
	title,
	children,
	initialX = 100,
	initialY = 100,
	initialWidth = 600,
	initialHeight = 400,
	onClose,
	onMinimize,
	onMaximize,
	onFocus,
	onPositionUpdate,
	isFocused,
	isMaximized,
	isRestoring = false,
	dockPosition,
	zIndex,
}: WindowProps) {
	const [position, setPosition] = useState({ x: initialX, y: initialY });
	const [size, setSize] = useState({ width: initialWidth, height: initialHeight });
	const [animationState, setAnimationState] = useState<
		"none" | "closing" | "opening" | "minimizing" | "restoreFromMinimize"
	>("opening");

	// Trigger opening animation on mount
	useEffect(() => {
		const timer = setTimeout(() => {
			setAnimationState("none");
		}, 300);
		return () => clearTimeout(timer);
	}, []);

	// Create dynamic restore animation from dock position
	const createDynamicRestoreAnimation = useCallback(
		(
			windowRect: { x: number; y: number; width: number; height: number },
			sourcePos: { x: number; y: number }
		) => {
			if (!windowRef.current) return;

			// Calculate the window center
			const windowCenterX = windowRect.x + windowRect.width / 2;
			const windowCenterY = windowRect.y + windowRect.height / 2;

			// Calculate translation from dock position to window position
			const translateX = sourcePos.x - windowCenterX;
			const translateY = sourcePos.y - windowCenterY;

			// Create dynamic keyframes (reverse of minimize)
			const styleElement = document.createElement("style");
			const animationName = `restore-${id}-${Date.now()}`;

			styleElement.textContent = `
				@keyframes ${animationName} {
					0% {
						opacity: 0;
						transform: translate(${translateX}px, ${translateY}px) scale(0.05);
					}
					100% {
						opacity: 1;
						transform: translate(0, 0) scale(1);
					}
				}
			`;

			document.head.appendChild(styleElement);

			// Apply the animation directly
			windowRef.current.style.animation = `${animationName} 0.3s ease-in-out forwards`;
			windowRef.current.style.transformOrigin = "center center";

			// Clean up after animation
			setTimeout(() => {
				try {
					if (styleElement.parentNode) {
						document.head.removeChild(styleElement);
					}
					if (windowRef.current) {
						windowRef.current.style.animation = "";
						windowRef.current.style.transformOrigin = "";
					}
				} catch (e) {
					console.error("Cleanup error:", e);
				}
			}, 350);
		},
		[id]
	);

	// Trigger restore animation when isRestoring becomes true
	useEffect(() => {
		if (isRestoring && dockPosition) {
			setAnimationState("restoreFromMinimize");

			// Create dynamic restore animation
			const windowRect = {
				x: position.x,
				y: position.y,
				width: size.width,
				height: size.height,
			};
			createDynamicRestoreAnimation(windowRect, dockPosition);

			const timer = setTimeout(() => {
				setAnimationState("none");
			}, 300);
			return () => clearTimeout(timer);
		}
	}, [isRestoring, dockPosition, position, size, createDynamicRestoreAnimation]);

	// Sync with prop changes (for maximize/restore)
	useEffect(() => {
		// Only update if the values actually changed (not during drag/resize)
		if (
			initialX !== position.x ||
			initialY !== position.y ||
			initialWidth !== size.width ||
			initialHeight !== size.height
		) {
			setPosition({ x: initialX, y: initialY });
			setSize({ width: initialWidth, height: initialHeight });
		}
	}, [
		initialX,
		initialY,
		initialWidth,
		initialHeight,
		position.x,
		position.y,
		size.width,
		size.height,
	]);

	// Debounced position update callback
	const debouncedPositionUpdate = useRef<NodeJS.Timeout | null>(null);

	const updatePosition = useCallback(
		(x: number, y: number, width: number, height: number) => {
			if (onPositionUpdate) {
				// Clear previous timeout
				if (debouncedPositionUpdate.current) {
					clearTimeout(debouncedPositionUpdate.current);
				}

				// Set new timeout
				debouncedPositionUpdate.current = setTimeout(() => {
					onPositionUpdate(id, x, y, width, height);
					debouncedPositionUpdate.current = null;
				}, 100);
			}
		},
		[onPositionUpdate, id]
	);

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (debouncedPositionUpdate.current) {
				clearTimeout(debouncedPositionUpdate.current);
			}
		};
	}, []);

	// Handle viewport resize to keep windows in bounds
	useEffect(() => {
		const handleResize = () => {
			const viewportWidth = window.innerWidth;
			const viewportHeight = window.innerHeight;

			// Check if window is outside viewport bounds
			const maxX = viewportWidth - size.width;
			const maxY = viewportHeight - size.height;

			if (position.x > maxX || position.y > maxY || position.x < 0 || position.y < 0) {
				// Constrain to viewport
				const newX = Math.max(0, Math.min(maxX, position.x));
				const newY = Math.max(0, Math.min(maxY, position.y));

				if (newX !== position.x || newY !== position.y) {
					setPosition({ x: newX, y: newY });
					updatePosition(newX, newY, size.width, size.height);
				}
			}
		};

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, [position.x, position.y, size.width, size.height, updatePosition]);

	const [dragState, setDragState] = useState<DragState>({
		isDragging: false,
		dragStartX: 0,
		dragStartY: 0,
		windowStartX: 0,
		windowStartY: 0,
	});
	const [resizeState, setResizeState] = useState<ResizeState>({
		isResizing: false,
		resizeHandle: "",
		resizeStartX: 0,
		resizeStartY: 0,
		windowStartWidth: 0,
		windowStartHeight: 0,
		windowStartX: 0,
		windowStartY: 0,
	});

	const windowRef = useRef<HTMLDivElement>(null);

	// Create dynamic minimize animation targeting specific dock position
	const createDynamicMinimizeAnimation = useCallback(
		(
			windowRect: { x: number; y: number; width: number; height: number },
			targetPos: { x: number; y: number }
		) => {
			if (!windowRef.current) return;

			// Calculate the window center
			const windowCenterX = windowRect.x + windowRect.width / 2;
			const windowCenterY = windowRect.y + windowRect.height / 2;

			// Calculate translation needed to reach dock position
			const translateX = targetPos.x - windowCenterX;
			const translateY = targetPos.y - windowCenterY;

			// Create dynamic keyframes with simplified genie effect
			const styleElement = document.createElement("style");
			const animationName = `minimize-${id}-${Date.now()}`;

			styleElement.textContent = `
				@keyframes ${animationName} {
					0% {
						opacity: 1;
						transform: translate(0, 0) scale(1);
					}
					100% {
						opacity: 0;
						transform: translate(${translateX}px, ${translateY}px) scale(0.05);
					}
				}
			`;

			document.head.appendChild(styleElement);

			// Apply the animation directly
			windowRef.current.style.animation = `${animationName} 0.3s ease-in-out forwards`;
			windowRef.current.style.transformOrigin = "center center";

			// Clean up after animation
			setTimeout(() => {
				try {
					if (styleElement.parentNode) {
						document.head.removeChild(styleElement);
					}
					if (windowRef.current) {
						windowRef.current.style.animation = "";
						windowRef.current.style.transformOrigin = "";
					}
				} catch (e) {
					console.error("Cleanup error:", e);
				}
			}, 350);
		},
		[id]
	);

	// Handle mouse down on title bar for dragging
	const handleMouseDown = useCallback(
		(e: React.MouseEvent) => {
			if (
				e.target !== e.currentTarget &&
				!(e.target as HTMLElement).closest(".window-title-bar")
			) {
				return;
			}

			// Don't allow dragging when maximized
			if (isMaximized) {
				onFocus(id);
				return;
			}

			onFocus(id);
			setDragState({
				isDragging: true,
				dragStartX: e.clientX,
				dragStartY: e.clientY,
				windowStartX: position.x,
				windowStartY: position.y,
			});
		},
		[position.x, position.y, onFocus, id, isMaximized]
	);

	// Handle mouse move for dragging and resizing
	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (dragState.isDragging) {
				const deltaX = e.clientX - dragState.dragStartX;
				const deltaY = e.clientY - dragState.dragStartY;
				let newX = dragState.windowStartX + deltaX;
				let newY = dragState.windowStartY + deltaY;

				// Constrain window position to viewport bounds
				const viewportWidth = window.innerWidth;
				const viewportHeight = window.innerHeight;
				const minX = 0;
				const minY = 0;
				const maxX = viewportWidth - size.width;
				const maxY = viewportHeight - size.height;

				// Clamp position to viewport bounds
				newX = Math.max(minX, Math.min(maxX, newX));
				newY = Math.max(minY, Math.min(maxY, newY));

				setPosition({ x: newX, y: newY });

				// Update position in parent component
				updatePosition(newX, newY, size.width, size.height);
			}

			if (resizeState.isResizing) {
				const deltaX = e.clientX - resizeState.resizeStartX;
				const deltaY = e.clientY - resizeState.resizeStartY;

				let newWidth = resizeState.windowStartWidth;
				let newHeight = resizeState.windowStartHeight;
				let newX = resizeState.windowStartX;
				let newY = resizeState.windowStartY;

				// Get viewport dimensions for boundary constraints
				const viewportWidth = window.innerWidth;
				const viewportHeight = window.innerHeight;

				// Handle different resize directions
				switch (resizeState.resizeHandle) {
					case "nw":
						newWidth = Math.max(300, resizeState.windowStartWidth - deltaX);
						newHeight = Math.max(200, resizeState.windowStartHeight - deltaY);
						newX = resizeState.windowStartX + (resizeState.windowStartWidth - newWidth);
						newY = resizeState.windowStartY + (resizeState.windowStartHeight - newHeight);
						break;
					case "ne":
						newWidth = Math.max(300, resizeState.windowStartWidth + deltaX);
						newHeight = Math.max(200, resizeState.windowStartHeight - deltaY);
						newY = resizeState.windowStartY + (resizeState.windowStartHeight - newHeight);
						break;
					case "sw":
						newWidth = Math.max(300, resizeState.windowStartWidth - deltaX);
						newHeight = Math.max(200, resizeState.windowStartHeight + deltaY);
						newX = resizeState.windowStartX + (resizeState.windowStartWidth - newWidth);
						break;
					case "se":
						newWidth = Math.max(300, resizeState.windowStartWidth + deltaX);
						newHeight = Math.max(200, resizeState.windowStartHeight + deltaY);
						break;
					case "n":
						newHeight = Math.max(200, resizeState.windowStartHeight - deltaY);
						newY = resizeState.windowStartY + (resizeState.windowStartHeight - newHeight);
						break;
					case "s":
						newHeight = Math.max(200, resizeState.windowStartHeight + deltaY);
						break;
					case "w":
						newWidth = Math.max(300, resizeState.windowStartWidth - deltaX);
						newX = resizeState.windowStartX + (resizeState.windowStartWidth - newWidth);
						break;
					case "e":
						newWidth = Math.max(300, resizeState.windowStartWidth + deltaX);
						break;
				}

				// Constrain window size to viewport bounds
				const maxWidth = viewportWidth - newX;
				const maxHeight = viewportHeight - newY;
				newWidth = Math.min(newWidth, maxWidth);
				newHeight = Math.min(newHeight, maxHeight);

				// Ensure minimum sizes are maintained
				newWidth = Math.max(300, newWidth);
				newHeight = Math.max(200, newHeight);

				// Constrain position to viewport bounds
				const minX = 0;
				const minY = 0;
				const maxX = viewportWidth - newWidth;
				const maxY = viewportHeight - newHeight;

				newX = Math.max(minX, Math.min(maxX, newX));
				newY = Math.max(minY, Math.min(maxY, newY));

				setSize({ width: newWidth, height: newHeight });
				setPosition({ x: newX, y: newY });

				// Update position in parent component
				updatePosition(newX, newY, newWidth, newHeight);
			}
		},
		[dragState, resizeState, updatePosition, size.width, size.height]
	);

	// Handle mouse up
	const handleMouseUp = useCallback(() => {
		setDragState((prev) => ({ ...prev, isDragging: false }));
		setResizeState((prev) => ({ ...prev, isResizing: false }));
	}, []);

	// Add global mouse event listeners
	useEffect(() => {
		if (dragState.isDragging || resizeState.isResizing) {
			document.addEventListener("mousemove", handleMouseMove);
			document.addEventListener("mouseup", handleMouseUp);
			return () => {
				document.removeEventListener("mousemove", handleMouseMove);
				document.removeEventListener("mouseup", handleMouseUp);
			};
		}
	}, [dragState.isDragging, resizeState.isResizing, handleMouseMove, handleMouseUp]);

	// Handle resize handle mouse down
	const handleResizeMouseDown = useCallback(
		(handle: string) => (e: React.MouseEvent) => {
			e.stopPropagation();
			onFocus(id);
			setResizeState({
				isResizing: true,
				resizeHandle: handle,
				resizeStartX: e.clientX,
				resizeStartY: e.clientY,
				windowStartWidth: size.width,
				windowStartHeight: size.height,
				windowStartX: position.x,
				windowStartY: position.y,
			});
		},
		[size, position, onFocus, id]
	);

	const handleClose = useCallback(() => {
		setAnimationState("closing");
		setTimeout(() => {
			onClose(id);
		}, 300); // Match animation duration
	}, [onClose, id]);

	const handleMinimize = useCallback(() => {
		// Calculate dock position if not provided
		let targetDockPosition = dockPosition;
		if (!targetDockPosition) {
			// Fallback to bottom center if no dock position available
			targetDockPosition = {
				x: window.innerWidth / 2,
				y: window.innerHeight - 50,
			};
		}

		setAnimationState("minimizing");

		// Create dynamic animation targeting the dock position
		if (targetDockPosition) {
			const windowRect = {
				x: position.x,
				y: position.y,
				width: size.width,
				height: size.height,
			};
			createDynamicMinimizeAnimation(windowRect, targetDockPosition);
		}

		setTimeout(() => {
			onMinimize(id, targetDockPosition);
			setAnimationState("none");
		}, 300); // Match animation duration
	}, [onMinimize, id, dockPosition, position, size, createDynamicMinimizeAnimation]);

	const handleMaximize = useCallback(() => {
		// Use smooth transition instead of animation
		onMaximize(id);
	}, [onMaximize, id]);

	return (
		<div
			ref={windowRef}
			className={`${styles.window} ${isFocused ? styles.focused : ""} ${
				isMaximized ? styles.maximized : ""
			} ${dragState.isDragging || resizeState.isResizing ? styles.noTransition : ""} ${
				animationState !== "none" ? styles[animationState] : ""
			}`}
			style={{
				left: position.x,
				top: position.y,
				width: size.width,
				height: size.height,
				zIndex,
			}}
			onMouseDown={handleMouseDown}
		>
			{/* Resize handles - only show when not maximized */}
			{!isMaximized && (
				<>
					<div
						className={`${styles.resizeHandle} ${styles.nw}`}
						onMouseDown={handleResizeMouseDown("nw")}
					/>
					<div
						className={`${styles.resizeHandle} ${styles.ne}`}
						onMouseDown={handleResizeMouseDown("ne")}
					/>
					<div
						className={`${styles.resizeHandle} ${styles.sw}`}
						onMouseDown={handleResizeMouseDown("sw")}
					/>
					<div
						className={`${styles.resizeHandle} ${styles.se}`}
						onMouseDown={handleResizeMouseDown("se")}
					/>
					<div
						className={`${styles.resizeHandle} ${styles.n}`}
						onMouseDown={handleResizeMouseDown("n")}
					/>
					<div
						className={`${styles.resizeHandle} ${styles.s}`}
						onMouseDown={handleResizeMouseDown("s")}
					/>
					<div
						className={`${styles.resizeHandle} ${styles.w}`}
						onMouseDown={handleResizeMouseDown("w")}
					/>
					<div
						className={`${styles.resizeHandle} ${styles.e}`}
						onMouseDown={handleResizeMouseDown("e")}
					/>
				</>
			)}

			{/* Window Chrome */}
			<div className={`${styles.windowChrome} window-title-bar`}>
				{/* Traffic Light Buttons */}
				<div className={styles.trafficLights}>
					<button
						className={`${styles.trafficLight} ${styles.close}`}
						onClick={handleClose}
					/>
					<button
						className={`${styles.trafficLight} ${styles.minimize}`}
						onClick={handleMinimize}
					/>
					<button
						className={`${styles.trafficLight} ${styles.maximize}`}
						onClick={handleMaximize}
					/>
				</div>

				{/* Window Title */}
				<div className={styles.windowTitle}>{title}</div>

				{/* Empty space for balance */}
				<div style={{ width: "60px" }}></div>
			</div>

			{/* Content Area */}
			<div className={styles.contentArea}>{children}</div>
		</div>
	);
}
