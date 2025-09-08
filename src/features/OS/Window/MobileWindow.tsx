"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import styles from "./MobileWindow.module.css";
import { WindowProvider } from "./WindowContext";
import { useMobile } from "../MobileContext";
import { useDevContextSafe } from "../DevContext";

interface MobileWindowProps {
	id: string;
	children: React.ReactNode;
	onClose: (id: string) => void;
	onBack?: () => void;
	onMinimize: (id: string) => void;
	onFocus: (id: string) => void;
	isFocused: boolean;
	zIndex: number;
	isFullscreen?: boolean;
	canGoBack?: boolean;
}

export default function MobileWindow({
	id,
	children,
	onClose,
	onBack,
	onMinimize,
	onFocus,
	isFocused,
	zIndex,
	isFullscreen = true, // eslint-disable-line @typescript-eslint/no-unused-vars
	canGoBack = false,
}: MobileWindowProps) {
	const { screenWidth, screenHeight, orientation } = useMobile();
	const devContext = useDevContextSafe();
	const windowRef = useRef<HTMLDivElement>(null);
	const [isVisible, setIsVisible] = useState(true);

	// Calculate safe area for mobile devices (accounting for notches, menu bar, etc.)
	const menuBarHeight = 32; // Height of the desktop menu bar
	const safeAreaTop = menuBarHeight; // Account for menu bar
	const safeAreaBottom = 0;
	const mobileHeaderHeight = 0; // Remove mobile header completely

	// Handle window focus
	useEffect(() => {
		if (isFocused) {
			onFocus(id);
		}
	}, [isFocused, onFocus, id]);

	// Handle back gesture (swipe from left edge)
	const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
	const [isSwipeGesture, setIsSwipeGesture] = useState(false);

	const handleTouchStart = useCallback(
		(e: React.TouchEvent) => {
			const touch = e.touches[0];
			const isLeftEdge = touch.clientX < 20; // 20px from left edge

			if (isLeftEdge && canGoBack) {
				setTouchStart({ x: touch.clientX, y: touch.clientY });
				setIsSwipeGesture(true);
			}
		},
		[canGoBack]
	);

	const handleTouchMove = useCallback(
		(e: React.TouchEvent) => {
			if (!touchStart || !isSwipeGesture) return;

			const touch = e.touches[0];
			const deltaX = touch.clientX - touchStart.x;
			const deltaY = Math.abs(touch.clientY - touchStart.y);

			// If swipe is more horizontal than vertical and sufficient distance
			if (deltaX > 50 && deltaY < 30) {
				// Trigger back action
				if (onBack) {
					onBack();
				}
				setIsSwipeGesture(false);
				setTouchStart(null);
			}
		},
		[touchStart, isSwipeGesture, onBack]
	);

	const handleTouchEnd = useCallback(() => {
		setTouchStart(null);
		setIsSwipeGesture(false);
	}, []);

	// Calculate window dimensions
	const windowWidth = screenWidth;
	const windowHeight = screenHeight - safeAreaTop - safeAreaBottom;
	const contentHeight = windowHeight - mobileHeaderHeight; // No header height

	return (
		<WindowProvider initialWidth={windowWidth} initialHeight={windowHeight}>
			<div
				ref={windowRef}
				className={`${styles.mobileWindow} ${!isVisible ? styles.closing : ""} ${
					isFocused ? styles.focused : ""
				}`}
				style={{
					zIndex,
					width: windowWidth,
					height: windowHeight,
					top: safeAreaTop,
					left: 0,
				}}
				onTouchStart={handleTouchStart}
				onTouchMove={handleTouchMove}
				onTouchEnd={handleTouchEnd}
				onClick={() => onFocus(id)}
			>
				{/* Dev Mode Debug Overlay */}
				{devContext?.isDevMode && devContext?.features.showWindowDimensions && (
					<div className={styles.debugOverlay}>
						{windowWidth} × {windowHeight} | {orientation}
					</div>
				)}

				{/* Content Area */}
				<div className={styles.contentArea} style={{ height: contentHeight }}>
					{children}
				</div>

				{/* Swipe indicator for back gesture */}
				{isSwipeGesture && canGoBack && (
					<div className={styles.swipeIndicator}>
						<ArrowLeft size={24} />
					</div>
				)}
			</div>
		</WindowProvider>
	);
}
