"use client";

import React, { useState, useMemo } from "react";
import {
	Settings as SettingsIcon,
	Monitor,
	Smartphone,
	ArrowLeft,
	ChevronRight,
} from "lucide-react";
import { useDevContext } from "../../OS/DevContext";
import { useWindowDimensions } from "../../OS/Window/WindowContext";
import WallpaperSelection from "./WallpaperSelection";
import styles from "./Settings.module.css";

export default function Settings() {
	const { width, height } = useWindowDimensions();

	// Follow the convention from other apps
	const screen = useMemo(() => (width < 340 ? "xs" : width < 944 ? "sm" : "lg"), [width]);
	const heightTier = useMemo(() => (height < 400 ? "short" : "tall"), [height]);

	const [activeTab, setActiveTab] = useState("developer");
	const [mobileView, setMobileView] = useState<"list" | "detail">("list"); // iOS-style navigation
	const { isDevMode, features, toggleDevMode, toggleFeature } = useDevContext();

	const tabs = [
		{ id: "display", label: "Display", icon: Monitor },
		{ id: "developer", label: "Developer", icon: Smartphone },
	];

	// Handle tab selection with iOS-style navigation
	const selectTab = (tabId: string) => {
		setActiveTab(tabId);
		if (screen === "xs") {
			setMobileView("detail");
		}
	};

	// Handle back navigation on mobile
	const goBackToList = () => {
		if (screen === "xs") {
			setMobileView("list");
		}
	};

	return (
		<div className={styles.settings} data-screen={screen} data-h={heightTier}>
			{/* iOS-style navigation: show list or detail based on screen size and state */}
			{screen === "xs" ? (
				<>
					{mobileView === "list" ? (
						/* Mobile List View */
						<div className={styles.mobileListView}>
							<div className={styles.sidebarHeader}>
								<h1 className={styles.title}>
									<SettingsIcon size={20} />
									Settings
								</h1>
							</div>
							<div className={styles.tabs}>
								{tabs.map((tab) => {
									const IconComponent = tab.icon;
									return (
										<button
											key={tab.id}
											className={styles.tab}
											onClick={() => selectTab(tab.id)}
										>
											<div className={styles.tabLeft}>
												<IconComponent size={18} className={styles.tabIcon} />
												<span className={styles.tabLabel}>{tab.label}</span>
											</div>
											<ChevronRight size={16} className={styles.chevron} />
										</button>
									);
								})}
							</div>
						</div>
					) : (
						/* Mobile Detail View */
						<div className={styles.mobileDetailView}>
							<div className={styles.mobileDetailHeader}>
								<button
									className={styles.backButton}
									onClick={goBackToList}
									title="Back to Settings"
								>
									<ArrowLeft size={20} />
									Settings
								</button>
							</div>
							<div className={styles.content}>
								

								{activeTab === "display" && (
									<div className={styles.section}>
										<h2 className={styles.sectionTitle}>Display & Appearance</h2>

										<div className={styles.settingGroup}>
											<h3 className={styles.groupTitle}>Desktop Background</h3>
											<p className={styles.settingDescription}>
												Choose a background image for your desktop
											</p>
											<WallpaperSelection />
										</div>
									</div>
								)}

								

								{activeTab === "developer" && (
									<div className={styles.section}>
										<h2 className={styles.sectionTitle}>Developer</h2>

										<div className={styles.settingGroup}>
											<label className={styles.settingLabel}>
												<div className={styles.settingInfo}>
													<span className={styles.settingName}>Developer Mode</span>
													<p className={styles.settingDescription}>
														Enable developer tools and debugging features throughout the
														OS
													</p>
												</div>
												<input
													type="checkbox"
													checked={isDevMode}
													onChange={toggleDevMode}
													className={styles.checkbox}
												/>
											</label>
										</div>

										{isDevMode && (
											<>
												<div className={styles.settingGroup}>
													<h3 className={styles.groupTitle}>Debug Features</h3>

													<div className={styles.settingItem}>
														<label className={styles.settingLabel}>
															<div className={styles.settingInfo}>
																<span className={styles.settingName}>
																	Show Window Dimensions
																</span>
																<p className={styles.settingDescription}>
																	Display width and height overlay on all windows
																</p>
															</div>
															<input
																type="checkbox"
																checked={features.showWindowDimensions}
																onChange={() => toggleFeature("showWindowDimensions")}
																className={styles.checkbox}
															/>
														</label>
													</div>

													<div className={styles.settingItem}>
														<label className={styles.settingLabel}>
															<div className={styles.settingInfo}>
																<span className={styles.settingName}>
																	Show Window Z-Index
																</span>
																<p className={styles.settingDescription}>
																	Display z-index values on window title bars
																</p>
															</div>
															<input
																type="checkbox"
																checked={features.showWindowZIndex}
																onChange={() => toggleFeature("showWindowZIndex")}
																className={styles.checkbox}
															/>
														</label>
													</div>
												</div>

												<div className={styles.settingGroup}>
													<h3 className={styles.groupTitle}>Debug Information</h3>
													<div className={styles.debugInfo}>
														<div className={styles.debugRow}>
															<span className={styles.debugLabel}>Dev Mode:</span>
															<span className={styles.debugValue}>
																{isDevMode ? "Enabled" : "Disabled"}
															</span>
														</div>
														<div className={styles.debugRow}>
															<span className={styles.debugLabel}>Active Features:</span>
															<span className={styles.debugValue}>
																{Object.entries(features)
																	.filter(([, enabled]) => enabled)
																	.map(([key]) => key)
																	.join(", ") || "None"}
															</span>
														</div>
														<div className={styles.debugRow}>
															<span className={styles.debugLabel}>Storage:</span>
															<span className={styles.debugValue}>localStorage</span>
														</div>
													</div>
												</div>
											</>
										)}
									</div>
								)}
							</div>
						</div>
					)}
				</>
			) : (
				/* Desktop/Tablet Layout */
				<>
					<div className={styles.sidebar}>
						<div className={styles.sidebarHeader}>
							<h1 className={styles.title}>
								<SettingsIcon size={20} />
								Settings
							</h1>
						</div>
						<div className={styles.tabs}>
							{tabs.map((tab) => {
								const IconComponent = tab.icon;
								return (
									<button
										key={tab.id}
										className={`${styles.tab} ${
											activeTab === tab.id ? styles.active : ""
										}`}
										onClick={() => selectTab(tab.id)}
									>
										<IconComponent size={18} className={styles.tabIcon} />
										<span className={styles.tabLabel}>{tab.label}</span>
									</button>
								);
							})}
						</div>
					</div>

					<div className={styles.content}>
						

						{activeTab === "display" && (
							<div className={styles.section}>
								<h2 className={styles.sectionTitle}>Display & Appearance</h2>

								<div className={styles.settingGroup}>
									<h3 className={styles.groupTitle}>Desktop Background</h3>
									<p className={styles.settingDescription}>
										Choose a background image for your desktop
									</p>
									<WallpaperSelection />
								</div>
							</div>
						)}

						

						{activeTab === "developer" && (
							<div className={styles.section}>
								<h2 className={styles.sectionTitle}>Developer</h2>

								<div className={styles.settingGroup}>
									<label className={styles.settingLabel}>
										<div className={styles.settingInfo}>
											<span className={styles.settingName}>Developer Mode</span>
											<p className={styles.settingDescription}>
												Enable developer tools and debugging features throughout the OS
											</p>
										</div>
										<input
											type="checkbox"
											checked={isDevMode}
											onChange={toggleDevMode}
											className={styles.checkbox}
										/>
									</label>
								</div>

								{isDevMode && (
									<>
										<div className={styles.settingGroup}>
											<h3 className={styles.groupTitle}>Debug Features</h3>

											<div className={styles.settingItem}>
												<label className={styles.settingLabel}>
													<div className={styles.settingInfo}>
														<span className={styles.settingName}>
															Show Window Dimensions
														</span>
														<p className={styles.settingDescription}>
															Display width and height overlay on all windows
														</p>
													</div>
													<input
														type="checkbox"
														checked={features.showWindowDimensions}
														onChange={() => toggleFeature("showWindowDimensions")}
														className={styles.checkbox}
													/>
												</label>
											</div>

											<div className={styles.settingItem}>
												<label className={styles.settingLabel}>
													<div className={styles.settingInfo}>
														<span className={styles.settingName}>
															Show Window Z-Index
														</span>
														<p className={styles.settingDescription}>
															Display z-index values on window title bars
														</p>
													</div>
													<input
														type="checkbox"
														checked={features.showWindowZIndex}
														onChange={() => toggleFeature("showWindowZIndex")}
														className={styles.checkbox}
													/>
												</label>
											</div>
										</div>

										<div className={styles.settingGroup}>
											<h3 className={styles.groupTitle}>Debug Information</h3>
											<div className={styles.debugInfo}>
												<div className={styles.debugRow}>
													<span className={styles.debugLabel}>Dev Mode:</span>
													<span className={styles.debugValue}>
														{isDevMode ? "Enabled" : "Disabled"}
													</span>
												</div>
												<div className={styles.debugRow}>
													<span className={styles.debugLabel}>Active Features:</span>
													<span className={styles.debugValue}>
														{Object.entries(features)
															.filter(([, enabled]) => enabled)
															.map(([key]) => key)
															.join(", ") || "None"}
													</span>
												</div>
												<div className={styles.debugRow}>
													<span className={styles.debugLabel}>Storage:</span>
													<span className={styles.debugValue}>localStorage</span>
												</div>
											</div>
										</div>
									</>
								)}
							</div>
						)}
					</div>
				</>
			)}
		</div>
	);
}
