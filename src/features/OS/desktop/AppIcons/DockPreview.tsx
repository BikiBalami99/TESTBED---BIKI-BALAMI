"use client";

import React, { useMemo } from "react";
import { WindowData } from "../../OS";
import { AppInfo } from "./AppIcons";
import styles from "./DockPreview.module.css";

interface DockPreviewProps {
	app: AppInfo;
	windows: WindowData[];
	onWindowClick: (windowId: string) => void;
	onCloseWindow: (windowId: string) => void;
	position: "left" | "center" | "right";
	maxZIndex: number;
}

export default function DockPreview({
	app,
	windows,
	onWindowClick,
	onCloseWindow,
	position,
	maxZIndex,
}: DockPreviewProps) {
	if (windows.length === 0) return null;

	const previewZ = useMemo(() => {
		// Use a high z-index that matches the dock's approach
		const z = Math.max((Number.isFinite(maxZIndex) ? maxZIndex : 100) + 1000, 10001);
		console.log("[DockPreview] computed z-index", {
			maxZIndex,
			previewZ: z,
			windows,
			strategy: "maxWindow+1000 or 10001",
		});
		return z;
	}, [maxZIndex, windows]);

	return (
		<div className={styles.previewInvisibleBackground} style={{ zIndex: previewZ }}>
			<div className={`${styles.previewContainer} ${styles[position]}`}>
				<div className={styles.previewHeader}>
					<div className={styles.appInfo}>
						<app.icon size={16} className={styles.appIcon} />
						<span className={styles.appName}>{app.name}</span>
					</div>
					<span className={styles.windowCount}>
						{windows.length} window{windows.length > 1 ? "s" : ""}
					</span>
				</div>

				<div className={styles.windowsList}>
					{windows.map((window, index) => (
						<div
							key={window.id}
							className={styles.windowCard}
							onClick={() => onWindowClick(window.id)}
							style={{
								zIndex: windows.length - index, // Stack windows properly
							}}
						>
							<div className={styles.windowPreview}>
								<div className={styles.windowTitleBar}>
									<div className={styles.trafficLights}>
										<div className={styles.trafficLight} />
										<div className={styles.trafficLight} />
										<div className={styles.trafficLight} />
									</div>
								</div>
								<div className={styles.windowContent}>
									<div className={styles.contentPlaceholder} />
								</div>
							</div>
							<div className={styles.windowInfo}>
								<span className={styles.windowTitle}>
									{windows.length > 1 && (
										<span className={styles.windowNumber}>{index + 1}</span>
									)}
									{window.title}
								</span>
								<button
									className={styles.closeButton}
									onClick={(e) => {
										e.stopPropagation();
										onCloseWindow(window.id);
									}}
								>
									×
								</button>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
