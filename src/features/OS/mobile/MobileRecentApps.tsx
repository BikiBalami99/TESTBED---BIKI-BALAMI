"use client";

import React, { useState, useCallback } from "react";
import { X, RotateCcw, Copy } from "lucide-react";
import styles from "./MobileRecentApps.module.css";
import { WindowData } from "../OS";
import { AVAILABLE_APPS } from "../desktop/AppIcons/AppIcons";
import { useMobile } from "../MobileContext";

interface MobileRecentAppsProps {
	isOpen: boolean;
	onClose: () => void;
	recentApps: WindowData[];
	onAppSelect: (windowId: string) => void;
	onAppClose: (windowId: string) => void;
	onSplitScreen: (app1Id: string, app2Id: string) => void;
	onClearAll: () => void;
}

export default function MobileRecentApps({
	isOpen,
	onClose,
	recentApps,
	onAppSelect,
	onAppClose,
	onSplitScreen,
	onClearAll,
}: MobileRecentAppsProps) {
	const { screenWidth, screenHeight, orientation } = useMobile();
	const [selectedApps, setSelectedApps] = useState<string[]>([]);
	const [isDragging] = useState<string | null>(null);

	const handleAppSelect = useCallback(
		(windowId: string) => {
			if (selectedApps.length === 1 && !selectedApps.includes(windowId)) {
				// Split screen mode
				onSplitScreen(selectedApps[0], windowId);
				setSelectedApps([]);
			} else {
				// Regular app selection
				onAppSelect(windowId);
			}
			onClose();
		},
		[selectedApps, onAppSelect, onSplitScreen, onClose]
	);

	const handleAppLongPress = useCallback((windowId: string) => {
		// Toggle selection for split screen
		setSelectedApps((prev) => {
			if (prev.includes(windowId)) {
				return prev.filter((id) => id !== windowId);
			} else if (prev.length < 2) {
				return [...prev, windowId];
			}
			return prev;
		});
	}, []);

	const handleAppClose = useCallback(
		(e: React.MouseEvent, windowId: string) => {
			e.stopPropagation();
			onAppClose(windowId);
		},
		[onAppClose]
	);

	const handleClearAll = useCallback(() => {
		onClearAll();
		onClose();
	}, [onClearAll, onClose]);

	if (!isOpen) return null;

	const gridColumns = orientation === "landscape" ? 3 : 2;
	const cardHeight = orientation === "landscape" ? 120 : 160;

	return (
		<div className={styles.recentAppsOverlay} onClick={onClose}>
			<div
				className={styles.recentAppsContainer}
				onClick={(e) => e.stopPropagation()}
				style={{
					width: screenWidth,
					height: screenHeight,
				}}
			>
				{/* Header */}
				<div className={styles.header}>
					<h2 className={styles.title}>Recent Apps</h2>
					<div className={styles.headerActions}>
						{recentApps.length > 0 && (
							<button className={styles.clearButton} onClick={handleClearAll}>
								Clear All
							</button>
						)}
						<button className={styles.closeButton} onClick={onClose}>
							<X size={24} />
						</button>
					</div>
				</div>

				{/* Split Screen Hint */}
				{selectedApps.length > 0 && (
					<div className={styles.splitScreenHint}>
						<Copy size={16} />
						<span>
							{selectedApps.length === 1
								? "Select another app for split screen"
								: "Tap to create split screen"}
						</span>
					</div>
				)}

				{/* Recent Apps Grid */}
				<div className={styles.appsGrid}>
					{recentApps.length === 0 ? (
						<div className={styles.emptyState}>
							<RotateCcw size={48} className={styles.emptyIcon} />
							<h3>No Recent Apps</h3>
							<p>Apps you use will appear here</p>
						</div>
					) : (
						<div
							className={styles.appsContainer}
							style={{
								gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
							}}
						>
							{recentApps.map((app) => {
								const appInfo = AVAILABLE_APPS.find((a) => a.id === app.appId);
								const isSelected = selectedApps.includes(app.id);

								return (
									<div
										key={app.id}
										className={`${styles.appCard} ${isSelected ? styles.selected : ""} ${
											isDragging === app.id ? styles.dragging : ""
										}`}
										onClick={() => handleAppSelect(app.id)}
										onContextMenu={(e) => {
											e.preventDefault();
											handleAppLongPress(app.id);
										}}
										style={{ height: cardHeight }}
									>
										{/* App Preview */}
										<div className={styles.appPreview}>
											<div className={styles.appPreviewHeader}>
												<div className={styles.trafficLights}>
													<div className={styles.trafficLight} />
													<div className={styles.trafficLight} />
													<div className={styles.trafficLight} />
												</div>
												<div className={styles.previewTitle}>{app.title}</div>
											</div>
											<div className={styles.appPreviewContent}>
												{appInfo && <appInfo.icon size={32} className={styles.appIcon} />}
											</div>
										</div>

										{/* App Info */}
										<div className={styles.appInfo}>
											<span className={styles.appName}>{app.title}</span>
											<button
												className={styles.appCloseButton}
												onClick={(e) => handleAppClose(e, app.id)}
											>
												<X size={16} />
											</button>
										</div>

										{/* Selection Indicator */}
										{isSelected && (
											<div className={styles.selectionIndicator}>
												<div className={styles.selectionCheck}>
													{selectedApps.indexOf(app.id) + 1}
												</div>
											</div>
										)}
									</div>
								);
							})}
						</div>
					)}
				</div>

				{/* Instructions */}
				{recentApps.length > 0 && (
					<div className={styles.instructions}>
						<p>Tap to open • Long press to select for split screen</p>
					</div>
				)}
			</div>
		</div>
	);
}
