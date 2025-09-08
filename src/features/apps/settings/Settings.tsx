"use client";

import React, { useState } from "react";
import { useDevContext } from "../../OS/DevContext";
import styles from "./Settings.module.css";

export default function Settings() {
	const [activeTab, setActiveTab] = useState("developer");
	const { isDevMode, features, toggleDevMode, toggleFeature } = useDevContext();

	const tabs = [{ id: "developer", label: "Developer", icon: "🛠️" }];

	return (
		<div className={styles.settings}>
			<div className={styles.sidebar}>
				<h3 className={styles.title}>Settings</h3>
				<div className={styles.tabs}>
					{tabs.map((tab) => (
						<button
							key={tab.id}
							className={`${styles.tab} ${activeTab === tab.id ? styles.active : ""}`}
							onClick={() => setActiveTab(tab.id)}
						>
							<span className={styles.tabIcon}>{tab.icon}</span>
							<span className={styles.tabLabel}>{tab.label}</span>
						</button>
					))}
				</div>
			</div>

			<div className={styles.content}>
				{activeTab === "developer" && (
					<div className={styles.section}>
						<h2 className={styles.sectionTitle}>Developer Settings</h2>

						<div className={styles.settingGroup}>
							<label className={styles.settingLabel}>
								<span className={styles.settingName}>Developer Mode</span>
								<input
									type="checkbox"
									checked={isDevMode}
									onChange={toggleDevMode}
									className={styles.checkbox}
								/>
							</label>
							<p className={styles.settingDescription}>
								Enable developer tools and debugging features throughout the OS
							</p>
						</div>

						{isDevMode && (
							<>
								<div className={styles.settingGroup}>
									<h3
										style={{
											margin: "0 0 1rem 0",
											fontSize: "1.1rem",
											fontWeight: "600",
										}}
									>
										Debug Features
									</h3>

									<div style={{ marginBottom: "1rem" }}>
										<label className={styles.settingLabel}>
											<span className={styles.settingName}>Show Window Dimensions</span>
											<input
												type="checkbox"
												checked={features.showWindowDimensions}
												onChange={() => toggleFeature("showWindowDimensions")}
												className={styles.checkbox}
											/>
										</label>
										<p className={styles.settingDescription}>
											Display width and height overlay on all windows
										</p>
									</div>

									<div style={{ marginBottom: "1rem" }}>
										<label className={styles.settingLabel}>
											<span className={styles.settingName}>Show Window Z-Index</span>
											<input
												type="checkbox"
												checked={features.showWindowZIndex}
												onChange={() => toggleFeature("showWindowZIndex")}
												className={styles.checkbox}
											/>
										</label>
										<p className={styles.settingDescription}>
											Display z-index values on window title bars
										</p>
									</div>
								</div>

								<div className={styles.settingGroup}>
									<h3
										style={{
											margin: "0 0 1rem 0",
											fontSize: "1.1rem",
											fontWeight: "600",
										}}
									>
										Debug Info
									</h3>
									<div
										style={{
											background: "#f5f5f5",
											padding: "1rem",
											borderRadius: "8px",
											fontFamily: "monospace",
											fontSize: "0.85rem",
										}}
									>
										<div>
											<strong>Dev Mode:</strong> {isDevMode ? "Enabled" : "Disabled"}
										</div>
										<div>
											<strong>Active Features:</strong>{" "}
											{Object.entries(features)
												.filter(([_, enabled]) => enabled)
												.map(([key]) => key)
												.join(", ") || "None"}
										</div>
										<div>
											<strong>Storage:</strong> localStorage
										</div>
									</div>
								</div>
							</>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
