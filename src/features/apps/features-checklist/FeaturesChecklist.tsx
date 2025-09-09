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
	// Define items in a simple, appendable list so it's easy to add more later.
	const items: ChecklistItem[] = [
		{ id: "open-launcher", text: "Open the App Launcher and start an app" },
		{ id: "move-window", text: "Drag a window by its top bar to move it" },
		{ id: "resize-window", text: "Resize a window from the edges and corners" },
		{ id: "fullscreen", text: "Make a window full screen, then restore it" },
		{ id: "minimize-dock", text: "Minimize a window and bring it back from the Dock" },
		{ id: "dock-hover", text: "Hover the Dock icons to preview windows" },
		{ id: "switch-focus", text: "Click different windows to switch focus" },
		{ id: "desktop-icons", text: "Drag desktop icons to new spots" },
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

	return (
		<div className={styles.checklistContainer}>
			<div className={styles.checklistHeader}>
				<span className={styles.checklistTitle}>Features to try</span>
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
