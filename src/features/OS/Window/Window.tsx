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
	onFocus: (id: string) => void;
	isFocused: boolean;
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
	onFocus,
	isFocused,
	zIndex,
}: WindowProps) {
	const [position, setPosition] = useState({ x: initialX, y: initialY });
	const [size, setSize] = useState({ width: initialWidth, height: initialHeight });
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

	// Handle mouse move for dragging and resizing
	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (dragState.isDragging) {
				const deltaX = e.clientX - dragState.dragStartX;
				const deltaY = e.clientY - dragState.dragStartY;
				setPosition({
					x: dragState.windowStartX + deltaX,
					y: dragState.windowStartY + deltaY,
				});
			}

			if (resizeState.isResizing) {
				const deltaX = e.clientX - resizeState.resizeStartX;
				const deltaY = e.clientY - resizeState.resizeStartY;

				let newWidth = resizeState.windowStartWidth;
				let newHeight = resizeState.windowStartHeight;
				let newX = resizeState.windowStartX;
				let newY = resizeState.windowStartY;

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

				setSize({ width: newWidth, height: newHeight });
				setPosition({ x: newX, y: newY });
			}
		},
		[dragState, resizeState]
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

	return (
		<div
			ref={windowRef}
			className={`${styles.window} ${isFocused ? styles.focused : ""}`}
			style={{
				left: position.x,
				top: position.y,
				width: size.width,
				height: size.height,
				zIndex,
			}}
			onMouseDown={handleMouseDown}
		>
			{/* Resize handles */}
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
					<button className={`${styles.trafficLight} ${styles.maximize}`} />
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
