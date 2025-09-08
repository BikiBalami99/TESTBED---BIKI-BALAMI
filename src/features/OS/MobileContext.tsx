"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface MobileContextType {
	isMobile: boolean;
	isTablet: boolean;
	isDesktop: boolean;
	screenWidth: number;
	screenHeight: number;
	orientation: "portrait" | "landscape";
}

const MobileContext = createContext<MobileContextType | null>(null);

interface MobileProviderProps {
	children: React.ReactNode;
}

export function MobileProvider({ children }: MobileProviderProps) {
	const [screenWidth, setScreenWidth] = useState(0);
	const [screenHeight, setScreenHeight] = useState(0);
	const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");

	// Update screen dimensions and orientation
	const updateScreenInfo = () => {
		if (typeof window !== "undefined") {
			const width = window.innerWidth;
			const height = window.innerHeight;
			setScreenWidth(width);
			setScreenHeight(height);
			setOrientation(width > height ? "landscape" : "portrait");
		}
	};

	useEffect(() => {
		// Initialize on mount
		updateScreenInfo();

		// Listen for resize events
		const handleResize = () => {
			updateScreenInfo();
		};

		// Listen for orientation changes
		const handleOrientationChange = () => {
			// Delay to allow for screen size to update
			setTimeout(updateScreenInfo, 100);
		};

		window.addEventListener("resize", handleResize);
		window.addEventListener("orientationchange", handleOrientationChange);

		return () => {
			window.removeEventListener("resize", handleResize);
			window.removeEventListener("orientationchange", handleOrientationChange);
		};
	}, []);

	// Determine device type based on screen width
	// Mobile: <= 768px, Tablet: 769px - 1024px, Desktop: > 1024px
	const isMobile = screenWidth <= 768;
	const isTablet = screenWidth > 768 && screenWidth <= 1024;
	const isDesktop = screenWidth > 1024;

	const contextValue: MobileContextType = {
		isMobile,
		isTablet,
		isDesktop,
		screenWidth,
		screenHeight,
		orientation,
	};

	return <MobileContext.Provider value={contextValue}>{children}</MobileContext.Provider>;
}

export function useMobile(): MobileContextType {
	const context = useContext(MobileContext);
	if (!context) {
		// Fallback for SSR or components outside provider
		return {
			isMobile: false,
			isTablet: false,
			isDesktop: true,
			screenWidth: 1200,
			screenHeight: 800,
			orientation: "landscape",
		};
	}
	return context;
}

export function useMobileSafe(): MobileContextType | null {
	return useContext(MobileContext);
}
