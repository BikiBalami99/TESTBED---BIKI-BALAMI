"use client";

import React, { useState } from "react";
import styles from "./Settings.module.css";

export default function Settings() {
	const [activeTab, setActiveTab] = useState("general");
	const [settings, setSettings] = useState({
		theme: "system",
		notifications: true,
		sound: true,
		autoSave: true,
		compactMode: false,
		animations: true,
	});

	const handleSettingChange = (key: string, value: string | number | boolean) => {
		setSettings((prev) => ({ ...prev, [key]: value }));
	};

	const tabs = [
		{ id: "general", label: "General", icon: "⚙️" },
		{ id: "appearance", label: "Appearance", icon: "🎨" },
		{ id: "notifications", label: "Notifications", icon: "🔔" },
		{ id: "privacy", label: "Privacy", icon: "🔒" },
		{ id: "advanced", label: "Advanced", icon: "🔧" },
	];

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
				{activeTab === "general" && (
					<div className={styles.section}>
						<h2 className={styles.sectionTitle}>General Settings</h2>

						<div className={styles.settingGroup}>
							<label className={styles.settingLabel}>
								<span className={styles.settingName}>Auto-save documents</span>
								<input
									type="checkbox"
									checked={settings.autoSave}
									onChange={(e) => handleSettingChange("autoSave", e.target.checked)}
									className={styles.checkbox}
								/>
							</label>
							<p className={styles.settingDescription}>
								Automatically save your work as you type
							</p>
						</div>

						<div className={styles.settingGroup}>
							<label className={styles.settingLabel}>
								<span className={styles.settingName}>Enable animations</span>
								<input
									type="checkbox"
									checked={settings.animations}
									onChange={(e) => handleSettingChange("animations", e.target.checked)}
									className={styles.checkbox}
								/>
							</label>
							<p className={styles.settingDescription}>
								Use smooth animations throughout the interface
							</p>
						</div>

						<div className={styles.settingGroup}>
							<label className={styles.settingLabel}>
								<span className={styles.settingName}>Compact mode</span>
								<input
									type="checkbox"
									checked={settings.compactMode}
									onChange={(e) => handleSettingChange("compactMode", e.target.checked)}
									className={styles.checkbox}
								/>
							</label>
							<p className={styles.settingDescription}>
								Use a more compact layout to fit more content
							</p>
						</div>
					</div>
				)}

				{activeTab === "appearance" && (
					<div className={styles.section}>
						<h2 className={styles.sectionTitle}>Appearance</h2>

						<div className={styles.settingGroup}>
							<label className={styles.settingLabel}>
								<span className={styles.settingName}>Theme</span>
								<select
									value={settings.theme}
									onChange={(e) => handleSettingChange("theme", e.target.value)}
									className={styles.select}
								>
									<option value="light">Light</option>
									<option value="dark">Dark</option>
									<option value="system">System</option>
								</select>
							</label>
							<p className={styles.settingDescription}>
								Choose your preferred color theme
							</p>
						</div>
					</div>
				)}

				{activeTab === "notifications" && (
					<div className={styles.section}>
						<h2 className={styles.sectionTitle}>Notifications</h2>

						<div className={styles.settingGroup}>
							<label className={styles.settingLabel}>
								<span className={styles.settingName}>Enable notifications</span>
								<input
									type="checkbox"
									checked={settings.notifications}
									onChange={(e) => handleSettingChange("notifications", e.target.checked)}
									className={styles.checkbox}
								/>
							</label>
							<p className={styles.settingDescription}>
								Receive notifications for important updates
							</p>
						</div>

						<div className={styles.settingGroup}>
							<label className={styles.settingLabel}>
								<span className={styles.settingName}>Sound effects</span>
								<input
									type="checkbox"
									checked={settings.sound}
									onChange={(e) => handleSettingChange("sound", e.target.checked)}
									className={styles.checkbox}
								/>
							</label>
							<p className={styles.settingDescription}>
								Play sound effects for user interactions
							</p>
						</div>
					</div>
				)}

				{activeTab === "privacy" && (
					<div className={styles.section}>
						<h2 className={styles.sectionTitle}>Privacy & Security</h2>
						<p className={styles.settingDescription}>
							Your data is stored locally and never sent to external servers.
						</p>
					</div>
				)}

				{activeTab === "advanced" && (
					<div className={styles.section}>
						<h2 className={styles.sectionTitle}>Advanced Settings</h2>
						<p className={styles.settingDescription}>
							Advanced configuration options for power users.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
