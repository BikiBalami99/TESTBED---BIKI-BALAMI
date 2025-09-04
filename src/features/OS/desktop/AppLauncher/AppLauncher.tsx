"use client";

import React, { useState } from "react";
import { Search, X } from "lucide-react";
import { AppIcon, AVAILABLE_APPS, AppInfo } from "../AppIcons/AppIcons";
import ContextMenu, { createAppContextMenuItems } from "../ContextMenu/ContextMenu";
import { useWindowManager } from "../../OS";
import styles from "./AppLauncher.module.css";

interface AppLauncherProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function AppLauncher({ isOpen, onClose }: AppLauncherProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const { openOrFocusApp, createNewWindowForApp, getAllWindowsForApp } =
		useWindowManager();

	// Context menu state
	const [contextMenu, setContextMenu] = useState<{
		isOpen: boolean;
		x: number;
		y: number;
		appId?: string;
	}>({
		isOpen: false,
		x: 0,
		y: 0,
	});

	const filteredApps = AVAILABLE_APPS.filter(
		(app) =>
			app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			app.description.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const handleAppClick = (app: AppInfo) => {
		// Use the new single instance management
		openOrFocusApp(app.id, app.name, React.createElement(app.component));
		onClose();
	};

	// Context menu handlers
	const handleContextMenu = (e: React.MouseEvent, appId: string) => {
		e.preventDefault();
		e.stopPropagation();
		setContextMenu({
			isOpen: true,
			x: e.clientX,
			y: e.clientY,
			appId,
		});
	};

	const closeContextMenu = () => {
		setContextMenu((prev) => ({ ...prev, isOpen: false }));
	};

	const handleNewWindow = (appId: string) => {
		const app = AVAILABLE_APPS.find((a) => a.id === appId);
		if (app) {
			createNewWindowForApp(appId, app.name, React.createElement(app.component));
		}
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className={styles.overlay} onClick={onClose}>
			<div className={styles.launcher} onClick={(e) => e.stopPropagation()}>
				{/* Header */}
				<div className={styles.header}>
					<h2 className={styles.title}>App Launcher</h2>
					<button className={styles.closeButton} onClick={onClose}>
						<X size={20} />
					</button>
				</div>

				{/* Search Bar */}
				<div className={styles.searchContainer}>
					<div className={styles.searchWrapper}>
						<Search size={18} className={styles.searchIcon} />
						<input
							type="text"
							placeholder="Search apps..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className={styles.searchInput}
							autoFocus
						/>
					</div>
				</div>

				{/* Apps Grid */}
				<div className={styles.appsGrid}>
					{filteredApps.length > 0 ? (
						filteredApps.map((app) => (
							<div
								key={app.id}
								className={styles.appItem}
								onClick={() => handleAppClick(app)}
								onContextMenu={(e) => handleContextMenu(e, app.id)}
							>
								<AppIcon app={app} size="large" />
								<div className={styles.appInfo}>
									<h3 className={styles.appItemTitle}>{app.name}</h3>
									<p className={styles.appItemDescription}>{app.description}</p>
									<span className={styles.appCategory}>{app.category}</span>
								</div>
							</div>
						))
					) : (
						<div className={styles.noResults}>
							<p>No apps found matching &quot;{searchQuery}&quot;</p>
						</div>
					)}
				</div>

				{/* Footer */}
				<div className={styles.footer}>
					<p className={styles.footerText}>{AVAILABLE_APPS.length} apps available</p>
				</div>
			</div>

			{/* Context Menu */}
			<ContextMenu
				isOpen={contextMenu.isOpen}
				x={contextMenu.x}
				y={contextMenu.y}
				items={
					contextMenu.appId
						? createAppContextMenuItems(
								contextMenu.appId,
								() => handleNewWindow(contextMenu.appId!),
								() => {}, // Close all not needed in launcher
								getAllWindowsForApp(contextMenu.appId).length > 0
						  )
						: []
				}
				onClose={closeContextMenu}
			/>
		</div>
	);
}
