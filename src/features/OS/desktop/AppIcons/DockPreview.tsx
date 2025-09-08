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
	const previewZ = useMemo(() => {
		// Simple z-index since we're now in the system UI layer which is already above all windows
		const z = 1;
		console.log("[DockPreview] computed z-index", {
			maxZIndex,
			previewZ: z,
			windows,
			strategy: "simple z-index in system UI layer",
		});
		return z;
	}, [maxZIndex, windows]);

	if (windows.length === 0) return null;

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
