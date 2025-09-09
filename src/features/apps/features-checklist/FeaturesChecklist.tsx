"use client";

import React, { useMemo, useEffect, useState } from "react";
import styles from "./FeaturesChecklist.module.css";
import { useWindowDimensions } from "../../OS/Window/WindowContext";

export default function FeaturesChecklist() {
	const { width, height } = useWindowDimensions();

	const screen = useMemo(() => (width < 340 ? "xs" : width < 944 ? "sm" : "lg"), [width]);
	const hTier = useMemo(() => (height < 400 ? "short" : "tall"), [height]);

	// Plain-text, appendable checklist content. Keep this structure simple for future edits.
	// const checklist = `...`; // Removed unused variable

	return (
		<div className={styles.editorShell} data-screen={screen} data-h={hTier}>
			<div className={styles.toolbar}>
				<div className={styles.metaLeft}>
					<div className={styles.filename}>Features Checklist.txt</div>
					<div className={styles.subtitle}>A quick tour of the OS features</div>
				</div>
				<div className={styles.metaRight}>
					<span className={styles.badge}>read‑only</span>
				</div>
			</div>
			<Checklist />
		</div>
	);
}

type ChecklistItem = { id: string; text: string };

function Checklist() {
	// Core features available on both platforms
	const items: ChecklistItem[] = [
		{ id: "open-launcher", text: "Open the App Launcher and start an app" },
		{ id: "switch-focus", text: "Switch between different apps" },
		{ id: "desktop-icons", text: "Interact with desktop app icons" },
		{ id: "try-apps", text: "Try different built-in applications" },
	];

	// Desktop-only features
	const desktopOnlyItems: ChecklistItem[] = [
		{ id: "move-window", text: "Drag a window by its top bar to move it" },
		{ id: "resize-window", text: "Resize a window from the edges and corners" },
		{ id: "fullscreen", text: "Make a window full screen, then restore it" },
		{ id: "minimize-dock", text: "Minimize a window and bring it back from the Dock" },
		{ id: "dock-hover", text: "Hover the Dock icons to preview windows" },
		{ id: "desktop-context-menu", text: "Right-click on desktop for context menu" },
		{ id: "dock-context-menu", text: "Right-click dock icons for app options" },
		{ id: "multiple-windows", text: "Open multiple windows of the same app" },
		{ id: "window-stacking", text: "Stack multiple windows and switch between them" },
		{
			id: "desktop-double-click",
			text: "Double-click empty desktop to open App Launcher",
		},
		{ id: "show-desktop", text: "Right-click dock to minimize all windows" },
		{ id: "window-drag-drop", text: "Drag windows between different positions" },
		{ id: "desktop-icon-arrange", text: "Arrange desktop icons in custom positions" },
	];

	// Mobile-only features
	const mobileOnlyItems: ChecklistItem[] = [
		{
			id: "mobile-navigation",
			text: "Use bottom navigation bar (Back, Home, App Exposé)",
		},
		{ id: "app-expose", text: "Open App Exposé to see all running apps" },
		{ id: "jiggle-mode", text: "Enter jiggle mode to rearrange app icons" },
		{ id: "touch-drag-icons", text: "Touch and drag app icons to new positions" },
		{ id: "mobile-home", text: "Use Home button to return to desktop" },
		{ id: "mobile-back", text: "Use Back button to return to previous app" },
		{ id: "single-window", text: "Experience single-window mobile interface" },
		{ id: "mobile-gestures", text: "Use touch gestures for navigation" },
		{ id: "clear-all-apps", text: "Use 'Clear All' in App Exposé to close all apps" },
	];

	// Secondary checklist: app-oriented quick tries
	const appItems: ChecklistItem[] = [
		{
			id: "try-js-playground",
			text: "JavaScript Playground: run the sample and check the output",
		},
		{ id: "try-notes", text: "Notes: make a quick note" },
		{ id: "try-settings", text: "Settings: explore the preferences" },
	];

	const storageKey = "features-checklist:v1";
	const [completed, setCompleted] = useState<Record<string, boolean>>({});

	useEffect(() => {
		try {
			const raw = localStorage.getItem(storageKey);
			if (raw) setCompleted(JSON.parse(raw));
		} catch {}
	}, []);

	useEffect(() => {
		try {
			localStorage.setItem(storageKey, JSON.stringify(completed));
		} catch {}
	}, [completed]);

	const toggle = (id: string) => {
		setCompleted((prev) => ({ ...prev, [id]: !prev[id] }));
	};

	const doneCount = items.reduce((acc, it) => acc + (completed[it.id] ? 1 : 0), 0);
	const desktopDoneCount = desktopOnlyItems.reduce(
		(acc, it) => acc + (completed[it.id] ? 1 : 0),
		0
	);
	const mobileDoneCount = mobileOnlyItems.reduce(
		(acc, it) => acc + (completed[it.id] ? 1 : 0),
		0
	);

	return (
		<div className={styles.checklistContainer}>
			<div className={styles.checklistHeader}>
				<span className={styles.checklistTitle}>Core Features (All Platforms)</span>
				<span className={styles.checklistProgress}>
					{doneCount}/{items.length}
				</span>
			</div>
			<ul className={styles.checklist}>
				{items.map((item) => (
					<li key={item.id} className={styles.checklistItem}>
						<label className={styles.checkLabel}>
							<input
								type="checkbox"
								className={styles.checkbox}
								checked={!!completed[item.id]}
								onChange={() => toggle(item.id)}
							/>
							<span className={styles.itemText}>{item.text}</span>
						</label>
					</li>
				))}
			</ul>

			<div className={styles.checklistHeader}>
				<span className={styles.checklistTitle}>
					Desktop Only Features
					<span className={styles.platformBadge}>🖥️ Desktop</span>
				</span>
				<span className={styles.checklistProgress}>
					{desktopDoneCount}/{desktopOnlyItems.length}
				</span>
			</div>
			<ul className={styles.checklist}>
				{desktopOnlyItems.map((item) => (
					<li key={item.id} className={styles.checklistItem}>
						<label className={styles.checkLabel}>
							<input
								type="checkbox"
								className={styles.checkbox}
								checked={!!completed[item.id]}
								onChange={() => toggle(item.id)}
							/>
							<span className={styles.itemText}>{item.text}</span>
						</label>
					</li>
				))}
			</ul>

			<div className={styles.checklistHeader}>
				<span className={styles.checklistTitle}>
					Mobile Only Features
					<span className={styles.platformBadge}>📱 Mobile</span>
				</span>
				<span className={styles.checklistProgress}>
					{mobileDoneCount}/{mobileOnlyItems.length}
				</span>
			</div>
			<ul className={styles.checklist}>
				{mobileOnlyItems.map((item) => (
					<li key={item.id} className={styles.checklistItem}>
						<label className={styles.checkLabel}>
							<input
								type="checkbox"
								className={styles.checkbox}
								checked={!!completed[item.id]}
								onChange={() => toggle(item.id)}
							/>
							<span className={styles.itemText}>{item.text}</span>
						</label>
					</li>
				))}
			</ul>

			<div className={styles.checklistHeader}>
				<span className={styles.checklistTitle}>Try these apps</span>
				<span />
			</div>
			<ul className={styles.checklist}>
				{appItems.map((item) => (
					<li key={item.id} className={styles.checklistItem}>
						<label className={styles.checkLabel}>
							<input
								type="checkbox"
								className={styles.checkbox}
								checked={!!completed[item.id]}
								onChange={() => toggle(item.id)}
							/>
							<span className={styles.itemText}>{item.text}</span>
						</label>
					</li>
				))}
			</ul>
		</div>
	);
}
