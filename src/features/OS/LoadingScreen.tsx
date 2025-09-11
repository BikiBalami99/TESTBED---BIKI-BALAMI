"use client";

import React, { useState, useEffect } from "react";
import styles from "./LoadingScreen.module.css";

interface LoadingScreenProps {
	onLoadingComplete: () => void;
}

export default function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
	const [isVisible, setIsVisible] = useState(true);
	const [statusText, setStatusText] = useState("Starting up...");
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		// Simple loading animation - always completes in 3 seconds
		const totalTime = 3000; // 3 seconds
		const steps = 100;
		const stepTime = totalTime / steps;

		let currentStep = 0;
		const interval = setInterval(() => {
			currentStep++;
			const progress = Math.min((currentStep / steps) * 100, 100);
			setProgress(progress);

			// Update status text
			if (progress < 20) {
				setStatusText("Starting DoorsOS...");
			} else if (progress < 40) {
				setStatusText("Loading system...");
			} else if (progress < 60) {
				setStatusText("Preparing desktop...");
			} else if (progress < 80) {
				setStatusText("Loading applications...");
			} else {
				setStatusText("DoorsOS ready");
			}

			// Complete loading
			if (currentStep >= steps) {
				clearInterval(interval);
				setTimeout(() => {
					setIsVisible(false);
					setTimeout(onLoadingComplete, 500);
				}, 300);
			}
		}, stepTime);

		return () => clearInterval(interval);
	}, [onLoadingComplete]);

	if (!isVisible) return null;

	return (
		<div className={`${styles.loadingScreen} ${!isVisible ? styles.fadeOut : ""}`}>
			{/* Progress Bar */}
			<div className={styles.progressContainer}>
				<div className={styles.progressBar} style={{ width: `${progress}%` }} />
			</div>

			{/* Status Text */}
			<div className={styles.statusText}>{statusText}</div>
		</div>
	);
}
