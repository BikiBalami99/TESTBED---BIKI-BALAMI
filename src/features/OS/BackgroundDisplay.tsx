"use client";

import React, { useEffect, useRef, useState } from "react";
import { useBackgroundContext } from "./BackgroundContext";
import styles from "./OS.module.css";

export default function BackgroundDisplay() {
	const { selectedBackground } = useBackgroundContext();

	const [baseSrc, setBaseSrc] = useState<string>(selectedBackground.path);
	const [overlaySrc, setOverlaySrc] = useState<string | null>(null);
	const [showOverlay, setShowOverlay] = useState<boolean>(false);
	const currentRef = useRef<string>(selectedBackground.path);

	useEffect(() => {
		const nextSrc = selectedBackground.path;
		if (nextSrc === currentRef.current) return;

		const img = new Image();
		img.src = nextSrc;
		img.onload = () => {
			setOverlaySrc(nextSrc);
			// Defer setting show flag to next frame to ensure CSS transition triggers
			requestAnimationFrame(() => {
				setShowOverlay(true);
			});

			const timer = setTimeout(() => {
				setBaseSrc(nextSrc);
				setShowOverlay(false);
				setOverlaySrc(null);
				currentRef.current = nextSrc;
			}, 320);

			return () => clearTimeout(timer);
		};
	}, [selectedBackground.path]);

	return (
		<>
			<div
				className={styles.backgroundImage}
				style={{ backgroundImage: `url(${baseSrc})` }}
			/>
			{overlaySrc && (
				<div
					className={`${styles.backgroundOverlay} ${showOverlay ? styles.show : ""}`}
					style={{ backgroundImage: `url(${overlaySrc})` }}
				/>
			)}
		</>
	);
}
