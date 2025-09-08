"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface DevFeatures {
	showWindowDimensions: boolean;
	// Add more dev features here in the future
	showWindowZIndex: boolean;
}

interface DevContextType {
	isDevMode: boolean;
	features: DevFeatures;
	toggleDevMode: () => void;
	toggleFeature: (feature: keyof DevFeatures) => void;
}

const defaultFeatures: DevFeatures = {
	showWindowDimensions: false,
	showWindowZIndex: false,
};

const DevContext = createContext<DevContextType | null>(null);

interface DevProviderProps {
	children: React.ReactNode;
}

export function DevProvider({ children }: DevProviderProps) {
	const [isDevMode, setIsDevMode] = useState(false);
	const [features, setFeatures] = useState<DevFeatures>(defaultFeatures);

	// Load dev settings from localStorage on mount
	useEffect(() => {
		const savedDevMode = localStorage.getItem("devMode");
		const savedFeatures = localStorage.getItem("devFeatures");

		if (savedDevMode === "true") {
			setIsDevMode(true);
		}

		if (savedFeatures) {
			try {
				const parsedFeatures = JSON.parse(savedFeatures);
				setFeatures({ ...defaultFeatures, ...parsedFeatures });
			} catch (error) {
				console.warn("Failed to parse dev features from localStorage");
			}
		}
	}, []);

	// Save dev settings to localStorage when they change
	useEffect(() => {
		localStorage.setItem("devMode", isDevMode.toString());
	}, [isDevMode]);

	useEffect(() => {
		localStorage.setItem("devFeatures", JSON.stringify(features));
	}, [features]);

	const toggleDevMode = () => {
		setIsDevMode((prev) => !prev);
	};

	const toggleFeature = (feature: keyof DevFeatures) => {
		setFeatures((prev) => ({
			...prev,
			[feature]: !prev[feature],
		}));
	};

	const contextValue: DevContextType = {
		isDevMode,
		features,
		toggleDevMode,
		toggleFeature,
	};

	return <DevContext.Provider value={contextValue}>{children}</DevContext.Provider>;
}

export function useDevContext(): DevContextType {
	const context = useContext(DevContext);
	if (!context) {
		throw new Error("useDevContext must be used within a DevProvider");
	}
	return context;
}

// Hook with fallback for components that might be used outside DevProvider
export function useDevContextSafe(): DevContextType | null {
	return useContext(DevContext);
}
