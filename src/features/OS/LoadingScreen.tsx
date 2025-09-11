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
			{/* Apple Logo */}
			<div className={styles.appleLogo}>
				<svg
					width="60"
					height="60"
					viewBox="0 0 60 60"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M30 0C13.4315 0 0 13.4315 0 30C0 46.5685 13.4315 60 30 60C46.5685 60 60 46.5685 60 30C60 13.4315 46.5685 0 30 0Z"
						fill="currentColor"
					/>
					<path
						d="M30 3.75C15.872 3.75 3.75 15.872 3.75 30C3.75 44.128 15.872 56.25 30 56.25C44.128 56.25 56.25 44.128 56.25 30C56.25 15.872 44.128 3.75 30 3.75Z"
						fill="currentColor"
					/>
					<path
						d="M30 7.5C18.3125 7.5 7.5 18.3125 7.5 30C7.5 41.6875 18.3125 52.5 30 52.5C41.6875 52.5 52.5 41.6875 52.5 30C52.5 18.3125 41.6875 7.5 30 7.5Z"
						fill="currentColor"
					/>
					<path
						d="M30 11.25C20.753 11.25 11.25 20.753 11.25 30C11.25 39.247 20.753 48.75 30 48.75C39.247 48.75 48.75 39.247 48.75 30C48.75 20.753 39.247 11.25 30 11.25Z"
						fill="currentColor"
					/>
					<path
						d="M30 15C22.1935 15 15 22.1935 15 30C15 37.8065 22.1935 45 30 45C37.8065 45 45 37.8065 45 30C45 22.1935 37.8065 15 30 15Z"
						fill="currentColor"
					/>
					<path
						d="M30 18.75C23.634 18.75 18.75 23.634 18.75 30C18.75 36.366 23.634 41.25 30 41.25C36.366 41.25 41.25 36.366 41.25 30C41.25 23.634 36.366 18.75 30 18.75Z"
						fill="currentColor"
					/>
					<path
						d="M30 22.5C25.8545 22.5 22.5 25.8545 22.5 30C22.5 34.1455 25.8545 37.5 30 37.5C34.1455 37.5 37.5 34.1455 37.5 30C37.5 25.8545 34.1455 22.5 30 22.5Z"
						fill="currentColor"
					/>
					<path
						d="M30 26.25C28.179 26.25 26.25 28.179 26.25 30C26.25 31.821 28.179 33.75 30 33.75C31.821 33.75 33.75 31.821 33.75 30C33.75 28.179 31.821 26.25 30 26.25Z"
						fill="currentColor"
					/>
				</svg>
			</div>

			{/* Loading Text */}
			<div className={styles.loadingText}>DoorsOS</div>

			{/* Progress Bar */}
			<div className={styles.progressContainer}>
				<div className={styles.progressBar} style={{ width: `${progress}%` }} />
			</div>

			{/* Status Text */}
			<div className={styles.statusText}>{statusText}</div>
		</div>
	);
}
