"use client";

import React from "react";
import { AppIcon, AVAILABLE_APPS, AppInfo } from "../AppIcons/AppIcons";
import { useDragAndDrop } from "../hooks/useDragAndDrop";
import styles from "./DesktopApps.module.css";

interface DesktopApp {
	appId: string;
	x: number;
	y: number;
}

interface DesktopAppsProps {
	desktopApps: DesktopApp[];
	selectedApps: Set<string>;
	onAppPositionChange: (appId: string, x: number, y: number) => void;
	onAppClick: (app: AppInfo) => void;
	onContextMenu: (e: React.MouseEvent, app: DesktopApp) => void;
}

export default function DesktopApps({
	desktopApps,
	selectedApps,
	onAppPositionChange,
	onAppClick,
	onContextMenu,
}: DesktopAppsProps) {
	const { dragState, snapIndicator, handleMouseDown } = useDragAndDrop({
		desktopApps,
		onAppPositionChange,
		onAppClick: (appId) => {
			const app = AVAILABLE_APPS.find((a) => a.id === appId);
			if (app) {
				onAppClick(app);
			}
		},
	});

	return (
		<>
			{/* Desktop App Icons */}
			{desktopApps.map((desktopApp) => {
				const app = AVAILABLE_APPS.find((a) => a.id === desktopApp.appId);
				if (!app) return null;

				const isDragging = dragState.draggedAppId === desktopApp.appId;
				const isSelected = selectedApps.has(desktopApp.appId);

				return (
					<div
						key={desktopApp.appId}
						className={`${styles.desktopApp} ${isDragging ? styles.dragging : ""} ${
							isSelected ? styles.selected : ""
						}`}
						style={{
							left: desktopApp.x,
							top: desktopApp.y,
							cursor: isDragging ? "grabbing" : "grab",
							zIndex: isDragging ? 1000 : 10,
						}}
						onMouseDown={(e) => handleMouseDown(e, desktopApp.appId)}
						onContextMenu={(e) => onContextMenu(e, desktopApp)}
					>
						<AppIcon
							app={app}
							size="medium"
							variant={app.id === "features-checklist" ? "featured" : "default"}
						/>
					</div>
				);
			})}

			{/* Snap Indicator */}
			{snapIndicator.visible && (
				<div
					className={styles.snapIndicator}
					style={{
						left: snapIndicator.x,
						top: snapIndicator.y,
					}}
				/>
			)}
		</>
	);
}
