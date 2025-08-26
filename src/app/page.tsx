"use client";

import React from "react";
import styles from "./page.module.css";
import { useWindowManager } from "@/features/OS/WindowManager";
import MediaAndContainerQueries from "@/features/media-and-container-queries/MediaAndContainerQueries";
import CssGridAndFlexbox from "@/features/css-grid-and-flexbox/CssGridAndFlexbox";
import JavaScriptES6Plus from "@/features/javascript-es6-plus/JavaScriptES6Plus";

export default function Home() {
	const { createWindow } = useWindowManager();

	const handleOpenMediaQueries = () => {
		console.log("Opening media queries window...");
		createWindow(
			"Media and Container Queries",
			<MediaAndContainerQueries />, // Only the feature component, not the entire page
			Math.random() * 200 + 100,
			Math.random() * 200 + 100,
			700,
			500
		);
	};

	const handleOpenCssGridFlexbox = () => {
		console.log("Opening CSS Grid & Flexbox window...");
		createWindow(
			"CSS Grid & Flexbox",
			<CssGridAndFlexbox />,
			Math.random() * 300 + 50,
			Math.random() * 300 + 50,
			750,
			550
		);
	};

	const handleOpenJavaScriptES6 = () => {
		console.log("Opening JavaScript ES6+ window...");
		createWindow(
			"JavaScript ES6+",
			<JavaScriptES6Plus />,
			Math.random() * 250 + 75,
			Math.random() * 250 + 75,
			700,
			500
		);
	};

	return (
		<div className={styles.desktopContent}>
			<div className={styles.welcomeCard}>
				<h1>Dev Collection</h1>
				<p>Click on any feature to open it in a new window</p>
			</div>

			<ul className={styles.cardList}>
				<li className={styles.cardItem} onClick={handleOpenMediaQueries}>
					<div className={styles.cardContent}>
						<h3>📱 Media and Container Queries</h3>
						<p>
							Master modern responsive design techniques with media queries, container
							queries, and fluid layouts
						</p>
					</div>
				</li>
				<li className={styles.cardItem} onClick={handleOpenCssGridFlexbox}>
					<div className={styles.cardContent}>
						<h3>🎯 CSS Grid & Flexbox</h3>
						<p>
							Explore modern layout techniques with CSS Grid for 2D layouts and Flexbox
							for 1D alignment
						</p>
					</div>
				</li>
				<li className={styles.cardItem} onClick={handleOpenJavaScriptES6}>
					<div className={styles.cardContent}>
						<h3>⚡ JavaScript ES6+</h3>
						<p>
							Discover modern JavaScript features including arrow functions, async/await,
							and destructuring
						</p>
					</div>
				</li>
			</ul>
		</div>
	);
}
