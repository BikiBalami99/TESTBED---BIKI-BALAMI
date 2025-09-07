"use client";

import { useState, useCallback, useEffect } from "react";

interface DragState {
	isDragging: boolean;
	draggedAppId: string | null;
	dragStartX: number;
	dragStartY: number;
	appStartX: number;
	appStartY: number;
	offset: { x: number; y: number };
	hasMoved: boolean;
	isPotentialDrag: boolean;
	clickTimeout: NodeJS.Timeout | null;
}

interface SnapIndicator {
	visible: boolean;
	x: number;
	y: number;
}

interface UseDragAndDropProps {
	desktopApps: Array<{ appId: string; x: number; y: number }>;
	onAppPositionChange: (appId: string, x: number, y: number) => void;
	onAppClick: (appId: string) => void;
	gridSize?: number;
}

export function useDragAndDrop({
	desktopApps,
	onAppPositionChange,
	onAppClick,
	gridSize = 64,
}: UseDragAndDropProps) {
	const [dragState, setDragState] = useState<DragState>({
		isDragging: false,
		draggedAppId: null,
		dragStartX: 0,
		dragStartY: 0,
		appStartX: 0,
		appStartY: 0,
		offset: { x: 0, y: 0 },
		hasMoved: false,
		isPotentialDrag: false,
		clickTimeout: null,
	});

	const [snapIndicator, setSnapIndicator] = useState<SnapIndicator>({
		visible: false,
		x: 0,
		y: 0,
	});

	// Snap positions to grid
	const snapToGrid = useCallback(
		(x: number, y: number) => {
			return {
				x: Math.round(x / gridSize) * gridSize,
				y: Math.round(y / gridSize) * gridSize,
			};
		},
		[gridSize]
	);

	// Check if position is occupied by another app
	const isPositionOccupied = useCallback(
		(x: number, y: number, excludeAppId?: string) => {
			return desktopApps.some(
				(app) =>
					app.appId !== excludeAppId &&
					Math.abs(app.x - x) < gridSize / 2 && // Half grid size tolerance
					Math.abs(app.y - y) < gridSize / 2
			);
		},
		[desktopApps, gridSize]
	);

	// Find nearest unoccupied position
	const findNearestUnoccupiedPosition = useCallback(
		(x: number, y: number) => {
			const viewportWidth = window.innerWidth;
			const viewportHeight = window.innerHeight;
			const iconSize = 80;

			let constrainedX = Math.max(20, Math.min(x, viewportWidth - iconSize));
			let constrainedY = Math.max(60, Math.min(y, viewportHeight - iconSize - 100));

			if (
				!isPositionOccupied(
					constrainedX,
					constrainedY,
					dragState.draggedAppId || undefined
				)
			) {
				return { x: constrainedX, y: constrainedY };
			}

			// Try positions in expanding spiral pattern
			const maxAttempts = 50;
			let attempts = 0;

			for (let radius = 1; radius <= 10 && attempts < maxAttempts; radius++) {
				for (let dx = -radius; dx <= radius; dx++) {
					for (let dy = -radius; dy <= radius; dy++) {
						if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue; // Only check perimeter

						const testX = constrainedX + dx * gridSize;
						const testY = constrainedY + dy * gridSize;

						// Check bounds
						if (
							testX >= 20 &&
							testX <= viewportWidth - iconSize &&
							testY >= 60 &&
							testY <= viewportHeight - iconSize - 100
						) {
							if (
								!isPositionOccupied(testX, testY, dragState.draggedAppId || undefined)
							) {
								return { x: testX, y: testY };
							}
						}
						attempts++;
					}
				}
			}

			return { x: constrainedX, y: constrainedY };
		},
		[isPositionOccupied, gridSize, dragState.draggedAppId]
	);

	const handleMouseDown = useCallback(
		(e: React.MouseEvent, appId: string) => {
			const app = desktopApps.find((a) => a.appId === appId);
			if (!app) return;

			// Only start drag on left mouse button
			if (e.button !== 0) return;

			const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
			const offsetX = e.clientX - rect.left;
			const offsetY = e.clientY - rect.top;

			// Clear any existing click timeout
			if (dragState.clickTimeout) {
				clearTimeout(dragState.clickTimeout);
			}

			setDragState({
				isDragging: false, // Don't mark as dragging until movement is detected
				draggedAppId: appId,
				dragStartX: e.clientX,
				dragStartY: e.clientY,
				appStartX: app.x,
				appStartY: app.y,
				offset: { x: offsetX, y: offsetY },
				hasMoved: false,
				isPotentialDrag: true, // Mark as potential drag
				clickTimeout: null,
			});

			// Prevent the default mousedown behavior
			e.preventDefault();
		},
		[desktopApps, dragState.clickTimeout]
	);

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (!dragState.isPotentialDrag || !dragState.draggedAppId) return;

			const deltaX = e.clientX - dragState.dragStartX;
			const deltaY = e.clientY - dragState.dragStartY;

			// Check if we've moved enough to start dragging (10px threshold)
			const hasMovedEnough = Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10;

			if (hasMovedEnough && !dragState.isDragging) {
				// Clear the click timeout since we're now dragging
				if (dragState.clickTimeout) {
					clearTimeout(dragState.clickTimeout);
				}

				// Now we start the actual drag
				setDragState((prev) => ({
					...prev,
					isDragging: true,
					hasMoved: true,
					clickTimeout: null,
				}));

				// Prevent text selection now that we're dragging
				document.body.style.userSelect = "none";
			}

			// Only continue if we're actually dragging
			if (!dragState.isDragging && !hasMovedEnough) return;

			const newX = dragState.appStartX + deltaX;
			const newY = dragState.appStartY + deltaY;

			// Calculate snap position for indicator
			const snapX = Math.round((e.clientX - dragState.offset.x) / gridSize) * gridSize;
			const snapY = Math.round((e.clientY - dragState.offset.y) / gridSize) * gridSize;

			// Constrain snap position to viewport bounds
			const viewportWidth = window.innerWidth;
			const viewportHeight = window.innerHeight;
			const iconSize = 80;

			const constrainedSnapX = Math.max(20, Math.min(snapX, viewportWidth - iconSize));
			const constrainedSnapY = Math.max(
				60,
				Math.min(snapY, viewportHeight - iconSize - 100)
			);

			// Show snap indicator only when actually dragging
			if (dragState.isDragging) {
				setSnapIndicator({
					visible: true,
					x: constrainedSnapX,
					y: constrainedSnapY,
				});
			}

			// Update the app position in real-time
			onAppPositionChange(dragState.draggedAppId, newX, newY);
		},
		[dragState, gridSize, onAppPositionChange]
	);

	const handleMouseUp = useCallback(
		(e: MouseEvent) => {
			if (!dragState.isPotentialDrag) return;

			// Reset user selection
			document.body.style.userSelect = "";

			// Clear any pending click timeout
			if (dragState.clickTimeout) {
				clearTimeout(dragState.clickTimeout);
			}

			// Calculate total movement
			const deltaX = e.clientX - dragState.dragStartX;
			const deltaY = e.clientY - dragState.dragStartY;
			const totalMovement = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

			// If movement is less than 10px and we never started dragging, it's a click!
			if (!dragState.isDragging && totalMovement < 10) {
				// This is a click - open the app
				onAppClick(dragState.draggedAppId!);
			}

			// If we never actually started dragging, just reset state
			if (!dragState.isDragging) {
				setDragState({
					isDragging: false,
					draggedAppId: null,
					dragStartX: 0,
					dragStartY: 0,
					appStartX: 0,
					appStartY: 0,
					offset: { x: 0, y: 0 },
					hasMoved: false,
					isPotentialDrag: false,
					clickTimeout: null,
				});
				return;
			}

			// Snap to grid
			const snapX = Math.round((e.clientX - dragState.offset.x) / gridSize) * gridSize;
			const snapY = Math.round((e.clientY - dragState.offset.y) / gridSize) * gridSize;

			// Find final position
			const finalPosition = findNearestUnoccupiedPosition(snapX, snapY);

			// Update final position with snap
			onAppPositionChange(dragState.draggedAppId, finalPosition.x, finalPosition.y);

			// Hide snap indicator
			setSnapIndicator({ visible: false, x: 0, y: 0 });

			const wasMoving = dragState.hasMoved;

			setDragState({
				isDragging: false,
				draggedAppId: null,
				dragStartX: 0,
				dragStartY: 0,
				appStartX: 0,
				appStartY: 0,
				offset: { x: 0, y: 0 },
				hasMoved: false,
				isPotentialDrag: false,
				clickTimeout: null,
			});

			// Clear the hasMoved flag after a short delay to prevent immediate clicks
			if (wasMoving) {
				setTimeout(() => {
					setDragState((prev) => ({ ...prev, hasMoved: false }));
				}, 200);
			}
		},
		[dragState, gridSize, onAppClick, onAppPositionChange, findNearestUnoccupiedPosition]
	);

	// Add global mouse event listeners for drag
	useEffect(() => {
		if (dragState.isPotentialDrag) {
			document.addEventListener("mousemove", handleMouseMove);
			document.addEventListener("mouseup", handleMouseUp);

			return () => {
				document.removeEventListener("mousemove", handleMouseMove);
				document.removeEventListener("mouseup", handleMouseUp);
			};
		}
	}, [dragState.isPotentialDrag, handleMouseMove, handleMouseUp]);

	return {
		dragState,
		snapIndicator,
		handleMouseDown,
		snapToGrid,
	};
}
