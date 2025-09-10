"use client";

import React, { useState, Suspense } from "react";
import { Search, X } from "lucide-react";
import { AppIcon, AVAILABLE_APPS, AppInfo } from "../../OS/desktop/AppIcons/AppIcons";
import ContextMenu, {
	createAppContextMenuItems,
} from "../../OS/desktop/ContextMenu/ContextMenu";
import { useWindowManager } from "../../OS";
import styles from "./AppLauncher.module.css";

export default function AppLauncher() {
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

	// Filter apps to exclude the app launcher itself
	const filteredApps = AVAILABLE_APPS.filter(
		(app) =>
			app.id !== "app-launcher" && // Exclude self
			(app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				app.description.toLowerCase().includes(searchQuery.toLowerCase()))
	);

	const handleAppClick = (app: AppInfo) => {
		// Use the new single instance management
		openOrFocusApp(
			app.id,
			app.name,
			<Suspense fallback={<div>Loading...</div>}>
				{React.createElement(app.component)}
			</Suspense>
		);
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
			createNewWindowForApp(
				appId,
				app.name,
				<Suspense fallback={<div>Loading...</div>}>
					{React.createElement(app.component)}
				</Suspense>
			);
		}
	};

	const clearSearch = () => {
		setSearchQuery("");
	};

	return (
		<div className={styles.launcher}>
			{/* Search Bar - macOS Tahoe style */}
			<div className={styles.searchContainer}>
				<div className={styles.searchWrapper}>
					<Search size={16} className={styles.searchIcon} />
					<input
						type="text"
						placeholder="Search apps..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className={styles.searchInput}
						autoFocus
					/>
					{searchQuery && (
						<button
							onClick={clearSearch}
							className={styles.clearButton}
							aria-label="Clear search"
						>
							<X size={14} />
						</button>
					)}
				</div>
			</div>

			{/* Apps Grid - iPhone home screen style */}
			<div className={styles.appsGrid}>
				{filteredApps.length > 0 ? (
					filteredApps.map((app) => (
						<div
							key={app.id}
							className={styles.appItem}
							onClick={() => handleAppClick(app)}
							onContextMenu={(e) => handleContextMenu(e, app.id)}
							title={app.name}
						>
							<div className={styles.appIconContainer}>
								<AppIcon app={app} size="large" />
							</div>
						</div>
					))
				) : (
					<div className={styles.noResults}>
						<div className={styles.noResultsIcon}>🔍</div>
						<p>No apps found</p>
						<span>Try a different search term</span>
					</div>
				)}
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
