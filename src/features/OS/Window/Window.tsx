"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { X, Minus, Maximize2 } from "lucide-react";
import styles from "./Window.module.css";
import { WindowProvider, useWindowContext, WindowContext } from "./WindowContext";
import { useDevContextSafe } from "../DevContext";

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

function WindowContent({
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
	isMaximized: _isMaximized, // Keep prop for compatibility but use internal state
	isRestoring = false,
	dockPosition,
	zIndex,
}: WindowProps) {
	const [position, setPosition] = useState({ x: initialX, y: initialY });
	const [size, setSize] = useState({ width: initialWidth, height: initialHeight });

	// Dev context for debugging features
	const devContext = useDevContextSafe();

	// Get WindowContext to notify about dimension changes
	const windowContext = React.useContext(WindowContext);
	const updateDimensions = windowContext?.updateDimensions;
	const [animationState, setAnimationState] = useState<
		"none" | "closing" | "opening" | "minimizing" | "restoreFromMinimize"
	>("opening");

	// Store original size/position for fullscreen restore
	const [originalSize, setOriginalSize] = useState({
		width: initialWidth,
		height: initialHeight,
	});
	const [originalPosition, setOriginalPosition] = useState({ x: initialX, y: initialY });
	const [isFullscreen, setIsFullscreen] = useState(false);

	// Use refs for values that change during drag (to avoid state updates)
	const positionRef = useRef(position);
	const sizeRef = useRef(size);
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

			// Apply the animation
			windowRef.current.style.animation = `${animationName} 0.3s ease-in-out forwards`;

			// Clean up
			setTimeout(() => {
				document.head.removeChild(styleElement);
			}, 300);
		},
		[id]
	);

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

			// Apply the animation
			windowRef.current.style.animation = `${animationName} 0.3s ease-out forwards`;

			// Clean up
			setTimeout(() => {
				document.head.removeChild(styleElement);
			}, 300);
		},
		[id]
	);

	// Update refs when state changes
	useEffect(() => {
		positionRef.current = position;
		sizeRef.current = size;
	}, [position, size]);

	// Notify WindowContext about dimension changes
	useEffect(() => {
		if (updateDimensions) {
			updateDimensions(size.width, size.height);
		}
	}, [size.width, size.height, updateDimensions]);

	// Trigger opening animation on mount
	useEffect(() => {
		const timer = setTimeout(() => {
			setAnimationState("none");
		}, 300);
		return () => clearTimeout(timer);
	}, []);

	// Handle restore from minimize animation
	useEffect(() => {
		if (isRestoring && dockPosition) {
			setAnimationState("restoreFromMinimize");

			const windowRect = {
				x: position.x,
				y: position.y,
				width: size.width,
				height: size.height,
			};

			createDynamicRestoreAnimation(windowRect, dockPosition);

			// Reset animation state after animation completes
			setTimeout(() => {
				setAnimationState("none");
			}, 300);
		}
	}, [isRestoring, dockPosition, position, size, createDynamicRestoreAnimation]);

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

	// Handle viewport resize to keep windows in bounds
	useEffect(() => {
		const handleResize = () => {
			const viewportWidth = window.innerWidth;
			const viewportHeight = window.innerHeight;

			// Check if window is outside viewport bounds
			const maxX = viewportWidth - sizeRef.current.width;
			const maxY = viewportHeight - sizeRef.current.height - 26;

			if (
				positionRef.current.x > maxX ||
				positionRef.current.y > maxY ||
				positionRef.current.x < 0 ||
				positionRef.current.y < 0
			) {
				// Constrain to viewport
				const newX = Math.max(0, Math.min(maxX, positionRef.current.x));
				const newY = Math.max(0, Math.min(maxY, positionRef.current.y));

				if (newX !== positionRef.current.x || newY !== positionRef.current.y) {
					setPosition({ x: newX, y: newY });
					updatePosition(newX, newY, sizeRef.current.width, sizeRef.current.height);
				}
			}
		};

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, [updatePosition]);

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

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (debouncedPositionUpdate.current) {
				clearTimeout(debouncedPositionUpdate.current);
			}
		};
	}, []);

	// Handle mouse down on title bar for dragging
	const handleMouseDown = useCallback(
		(e: React.MouseEvent) => {
			// Don't allow dragging when in fullscreen
			if (isFullscreen) {
				onFocus(id);
				return;
			}

			// Prevent starting a drag on double-clicks (we'll use double-click to toggle maximize)
			if (e.detail >= 2) {
				onFocus(id);
				return;
			}

			onFocus(id);
			setDragState({
				isDragging: true,
				dragStartX: e.clientX,
				dragStartY: e.clientY,
				windowStartX: positionRef.current.x,
				windowStartY: positionRef.current.y,
			});
		},
		[onFocus, id, isFullscreen]
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
				const minY = 8;
				const maxX = viewportWidth - sizeRef.current.width;
				const maxY = viewportHeight - sizeRef.current.height - 26;

				// Clamp position to viewport bounds
				newX = Math.max(minX, Math.min(maxX, newX));
				newY = Math.max(minY, Math.min(maxY, newY));

				// Update position immediately using ref to avoid state delay
				if (windowRef.current) {
					windowRef.current.style.left = `${newX}px`;
					windowRef.current.style.top = `${newY}px`;
				}

				// Update state for consistency
				setPosition({ x: newX, y: newY });

				// Update position in parent component
				updatePosition(newX, newY, sizeRef.current.width, sizeRef.current.height);
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
				const maxY = viewportHeight - newHeight - 26;

				newX = Math.max(minX, Math.min(maxX, newX));
				newY = Math.max(minY, Math.min(maxY, newY));

				// Update size and position immediately using ref to avoid state delay
				if (windowRef.current) {
					windowRef.current.style.width = `${newWidth}px`;
					windowRef.current.style.height = `${newHeight}px`;
					windowRef.current.style.left = `${newX}px`;
					windowRef.current.style.top = `${newY}px`;
				}

				// Update state for consistency
				setSize({ width: newWidth, height: newHeight });
				setPosition({ x: newX, y: newY });

				// Update position in parent component
				updatePosition(newX, newY, newWidth, newHeight);
			}
		},
		[dragState, resizeState, updatePosition]
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
				windowStartWidth: sizeRef.current.width,
				windowStartHeight: sizeRef.current.height,
				windowStartX: positionRef.current.x,
				windowStartY: positionRef.current.y,
			});
		},
		[onFocus, id]
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

		// Call the minimize callback after animation completes
		setTimeout(() => {
			onMinimize(id, targetDockPosition);
		}, 300); // Wait for animation to complete
	}, [onMinimize, id, dockPosition, position, size, createDynamicMinimizeAnimation]);

	const handleMaximize = useCallback(() => {
		if (isFullscreen) {
			// Restore to original size and position
			setPosition(originalPosition);
			setSize(originalSize);
			setIsFullscreen(false);

			// Update parent component
			updatePosition(
				originalPosition.x,
				originalPosition.y,
				originalSize.width,
				originalSize.height
			);
		} else {
			// Store current size/position for restore
			setOriginalSize(size);
			setOriginalPosition(position);

			// Calculate fullscreen dimensions (entire viewport)
			const fullscreenWidth = window.innerWidth;
			const fullscreenHeight = window.innerHeight;
			const fullscreenPosition = { x: 0, y: 0 };

			// Smoothly resize to fullscreen
			setPosition(fullscreenPosition);
			setSize({ width: fullscreenWidth, height: fullscreenHeight });
			setIsFullscreen(true);

			// Update parent component
			updatePosition(
				fullscreenPosition.x,
				fullscreenPosition.y,
				fullscreenWidth,
				fullscreenHeight
			);
		}
	}, [isFullscreen, originalPosition, originalSize, size, position, updatePosition]);

	return (
		<div
			ref={windowRef}
			className={`${styles.window} ${isFocused ? styles.focused : ""} ${
				(dragState.isDragging || resizeState.isResizing) &&
				animationState !== "minimizing" &&
				animationState !== "restoreFromMinimize"
					? styles.noTransition
					: ""
			} ${animationState !== "none" ? styles[animationState] : ""}`}
			onMouseDown={() => onFocus(id)}
			style={{
				left: position.x,
				top: position.y,
				width: size.width,
				height: size.height,
				zIndex,
			}}
		>
			{/* Resize handles - only show when not in fullscreen */}
			{!isFullscreen && (
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
			<div
				className={`${styles.windowChrome} window-title-bar`}
				onMouseDown={handleMouseDown}
				onDoubleClick={(e) => {
					e.stopPropagation();
					handleMaximize();
				}}
			>
				{/* Traffic Light Buttons */}
				<div className={styles.trafficLights}>
					<button
						className={`${styles.trafficLight} ${styles.close}`}
						onClick={handleClose}
						onMouseDown={(e) => {
							e.stopPropagation();
							onFocus(id);
						}}
					>
						<X className={styles.trafficLightIcon} size={10} />
					</button>
					<button
						className={`${styles.trafficLight} ${styles.minimize}`}
						onClick={handleMinimize}
						onMouseDown={(e) => {
							e.stopPropagation();
							onFocus(id);
						}}
					>
						<Minus className={styles.trafficLightIcon} size={10} />
					</button>
					<button
						className={`${styles.trafficLight} ${styles.maximize}`}
						onClick={handleMaximize}
						onMouseDown={(e) => {
							e.stopPropagation();
							onFocus(id);
						}}
					>
						<Maximize2
							className={`${styles.trafficLightIcon} ${styles.expandIcon}`}
							size={6}
						/>
					</button>
				</div>

				{/* Window Title */}
				<div className={styles.windowTitle}>
					{title}
					{devContext?.isDevMode && devContext?.features.showWindowZIndex && (
						<span
							style={{
								marginLeft: "8px",
								fontSize: "10px",
								color: "rgba(255, 255, 255, 0.6)",
								background: "rgba(255, 255, 255, 0.1)",
								padding: "2px 6px",
								borderRadius: "3px",
								fontFamily: "monospace",
							}}
						>
							z:{zIndex}
						</span>
					)}
				</div>

				{/* Empty space for balance */}
				<div style={{ width: "60px" }}></div>
			</div>

			{/* Dev Mode Debug Overlay */}
			{devContext?.isDevMode && devContext?.features.showWindowDimensions && (
				<div
					style={{
						position: "absolute",
						top: "40px",
						right: "8px",
						background: "rgba(0, 0, 0, 0.8)",
						color: "#00ff00",
						padding: "4px 8px",
						borderRadius: "4px",
						fontSize: "11px",
						fontFamily: "monospace",
						zIndex: 1000,
						pointerEvents: "none",
						border: "1px solid rgba(0, 255, 0, 0.3)",
						backdropFilter: "blur(4px)",
					}}
				>
					{size.width} × {size.height}
				</div>
			)}

			{/* Content Area */}
			<div className={styles.contentArea}>{children}</div>
		</div>
	);
}

export default function Window(props: WindowProps) {
	return (
		<WindowProvider initialWidth={props.initialWidth} initialHeight={props.initialHeight}>
			<WindowContent {...props} />
		</WindowProvider>
	);
}
