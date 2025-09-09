"use client";

import React, { useState } from "react";
import { useBackgroundContext, BACKGROUND_OPTIONS } from "../../OS/BackgroundContext";
import styles from "./WallpaperSelection.module.css";

export default function WallpaperSelection() {
	const { selectedBackground, setSelectedBackground } = useBackgroundContext();
	const [previewBackground, setPreviewBackground] = useState<
		(typeof BACKGROUND_OPTIONS)[0] | null
	>(null);

	const handleBackgroundSelect = (background: (typeof BACKGROUND_OPTIONS)[0]) => {
		setSelectedBackground(background);
		setPreviewBackground(null);
	};

	const handleBackgroundHover = (background: (typeof BACKGROUND_OPTIONS)[0] | null) => {
		setPreviewBackground(background);
	};

	return (
		<div className={styles.wallpaperSelection}>
			<div className={styles.previewSection}>
				<div className={styles.previewLabel}>Preview</div>
				<div className={styles.previewContainer}>
					<div
						className={styles.previewImage}
						style={{
							backgroundImage: `url(${(previewBackground || selectedBackground).path})`,
						}}
					/>
					<div className={styles.previewOverlay}>
						<div className={styles.previewInfo}>
							<span className={styles.previewName}>
								{(previewBackground || selectedBackground).name}
							</span>
							{previewBackground && (
								<span className={styles.previewHint}>Click to select</span>
							)}
						</div>
					</div>
				</div>
			</div>

			<div className={styles.wallpaperGrid}>
				{BACKGROUND_OPTIONS.map((background) => (
					<div
						key={background.id}
						className={`${styles.wallpaperCard} ${
							selectedBackground.id === background.id ? styles.selected : ""
						} ${previewBackground?.id === background.id ? styles.previewing : ""}`}
						onClick={() => handleBackgroundSelect(background)}
						onMouseEnter={() => handleBackgroundHover(background)}
						onMouseLeave={() => handleBackgroundHover(null)}
					>
						<div
							className={styles.wallpaperImage}
							style={{
								backgroundImage: `url(${background.preview})`,
							}}
						/>
						{selectedBackground.id === background.id && (
							<div className={styles.selectedIndicator}>
								<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
									<path
										d="M13.5 4.5L6 12L2.5 8.5"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
