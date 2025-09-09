"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface WindowDimensions {
	width: number;
	height: number;
}

interface WindowContextType {
	dimensions: WindowDimensions;
	updateDimensions: (width: number, height: number) => void;
}

export const WindowContext = createContext<WindowContextType | null>(null);

interface WindowProviderProps {
	children: React.ReactNode;
	initialWidth?: number;
	initialHeight?: number;
}

export function WindowProvider({
	children,
	initialWidth = 600,
	initialHeight = 400,
}: WindowProviderProps) {
	const [dimensions, setDimensions] = useState<WindowDimensions>(() => {
		// Account for window chrome (title bar is 36px)
		const contentWidth = initialWidth;
		const contentHeight = initialHeight - 36;

		return {
			width: contentWidth,
			height: contentHeight,
		};
	});

	const updateDimensions = useCallback((width: number, height: number) => {
		// Account for window chrome (title bar is 36px)
		const contentWidth = width;
		const contentHeight = height - 36;

		setDimensions({
			width: contentWidth,
			height: contentHeight,
		});
	}, []);

	const contextValue: WindowContextType = {
		dimensions,
		updateDimensions,
	};

	return <WindowContext.Provider value={contextValue}>{children}</WindowContext.Provider>;
}

export function useWindowDimensions(): WindowDimensions {
	const context = useContext(WindowContext);
	if (!context) {
		// Fallback for apps not running in a window (development/testing)
		// Use window dimensions if available, otherwise default values
		if (typeof window !== "undefined") {
			const width = Math.min(window.innerWidth - 100, 800);
			const height = Math.min(window.innerHeight - 100, 600);
			return {
				width,
				height,
			};
		}
		return {
			width: 800,
			height: 600,
		};
	}
	return context.dimensions;
}

export function useWindowContext(): WindowContextType {
	const context = useContext(WindowContext);
	if (!context) {
		throw new Error("useWindowContext must be used within a WindowProvider");
	}
	return context;
}
