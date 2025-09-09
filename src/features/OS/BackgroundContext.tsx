"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface BackgroundOption {
	id: string;
	name: string;
	path: string;
	preview: string;
}

export const BACKGROUND_OPTIONS: BackgroundOption[] = [
	{
		id: "milky-way",
		name: "Milky Way",
		path: "/photos/backgrounds/milky-way.webp",
		preview: "/photos/backgrounds/milky-way.webp",
	},
	{
		id: "cats",
		name: "Cats",
		path: "/photos/backgrounds/cats.webp",
		preview: "/photos/backgrounds/cats.webp",
	},
	{
		id: "labrador",
		name: "Labrador",
		path: "/photos/backgrounds/labrador.webp",
		preview: "/photos/backgrounds/labrador.webp",
	},
	{
		id: "water",
		name: "Water",
		path: "/photos/backgrounds/water.webp",
		preview: "/photos/backgrounds/water.webp",
	},
	{
		id: "web",
		name: "Web",
		path: "/photos/backgrounds/web.webp",
		preview: "/photos/backgrounds/web.webp",
	},
];

interface BackgroundContextType {
	selectedBackground: BackgroundOption;
	setSelectedBackground: (background: BackgroundOption) => void;
	backgroundOptions: BackgroundOption[];
}

const BackgroundContext = createContext<BackgroundContextType | null>(null);

interface BackgroundProviderProps {
	children: React.ReactNode;
}

export function BackgroundProvider({ children }: BackgroundProviderProps) {
	const [selectedBackground, setSelectedBackground] = useState<BackgroundOption>(() => {
		// Default to milky-way
		return BACKGROUND_OPTIONS[0];
	});

	// Load background preference from localStorage on mount
	useEffect(() => {
		const savedBackground = localStorage.getItem("selectedBackground");
		if (savedBackground) {
			try {
				const parsed = JSON.parse(savedBackground);
				const found = BACKGROUND_OPTIONS.find((option) => option.id === parsed.id);
				if (found) {
					setSelectedBackground(found);
				}
			} catch {
				console.warn("Failed to parse saved background from localStorage");
			}
		}
	}, []);

	// Save background preference to localStorage when it changes
	useEffect(() => {
		localStorage.setItem("selectedBackground", JSON.stringify(selectedBackground));
	}, [selectedBackground]);

	const contextValue: BackgroundContextType = {
		selectedBackground,
		setSelectedBackground,
		backgroundOptions: BACKGROUND_OPTIONS,
	};

	return (
		<BackgroundContext.Provider value={contextValue}>
			{children}
		</BackgroundContext.Provider>
	);
}

export function useBackgroundContext(): BackgroundContextType {
	const context = useContext(BackgroundContext);
	if (!context) {
		throw new Error("useBackgroundContext must be used within a BackgroundProvider");
	}
	return context;
}

// Hook with fallback for components that might be used outside BackgroundProvider
export function useBackgroundContextSafe(): BackgroundContextType | null {
	return useContext(BackgroundContext);
}
