"use client";

import React from "react";
import { WindowData } from "../../OS";
import { AppInfo } from "./AppIcons";
import styles from "./DockPreview.module.css";

interface DockPreviewProps {
	app: AppInfo;
	windows: WindowData[];
	onWindowClick: (windowId: string) => void;
	onCloseWindow: (windowId: string) => void;
	position: "left" | "center" | "right";
}

export default function DockPreview({
	app,
	windows,
	onWindowClick,
	onCloseWindow,
	position,
}: DockPreviewProps) {
	if (windows.length === 0) return null;

	return (
		<div className={styles.previewInvisibleBackground}>
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
					{windows.map((window) => (
						<div
							key={window.id}
							className={styles.windowCard}
							onClick={() => onWindowClick(window.id)}
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
								<span className={styles.windowTitle}>{window.title}</span>
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
