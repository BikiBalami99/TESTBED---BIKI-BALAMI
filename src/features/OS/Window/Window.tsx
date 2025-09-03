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
	onMinimize: (id: string) => void;
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
	zIndex,
}: WindowProps) {
	const [position, setPosition] = useState({ x: initialX, y: initialY });
	const [size, setSize] = useState({ width: initialWidth, height: initialHeight });
	const [isTransitioning, setIsTransitioning] = useState(false);

	// Sync with prop changes (for maximize/restore)
	useEffect(() => {
		// Only update if the values actually changed (not during drag/resize)
		if (
			initialX !== position.x ||
			initialY !== position.y ||
			initialWidth !== size.width ||
			initialHeight !== size.height
		) {
			setIsTransitioning(true);
			setPosition({ x: initialX, y: initialY });
			setSize({ width: initialWidth, height: initialHeight });
			// Reset transition flag after animation completes
			setTimeout(() => setIsTransitioning(false), 300);
		}
	}, [initialX, initialY, initialWidth, initialHeight]);

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

	const handleClose = useCallback(() => onClose(id), [onClose, id]);
	const handleMinimize = useCallback(() => onMinimize(id), [onMinimize, id]);
	const handleMaximize = useCallback(() => onMaximize(id), [onMaximize, id]);

	return (
		<div
			ref={windowRef}
			className={`${styles.window} ${isFocused ? styles.focused : ""} ${
				isMaximized ? styles.maximized : ""
			} ${dragState.isDragging || resizeState.isResizing ? styles.noTransition : ""}`}
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
