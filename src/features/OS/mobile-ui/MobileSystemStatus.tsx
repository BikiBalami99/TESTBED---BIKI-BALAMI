"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
	Battery,
	BatteryCharging,
	BatteryFull,
	BatteryLow,
	BatteryMedium,
	Volume2,
	Volume,
	Volume1,
	VolumeX,
	Wifi,
	WifiOff,
	BluetoothOff,
	Bluetooth,
	Cpu,
	HardDrive,
	Clock,
	X,
} from "lucide-react";
import styles from "./MobileSystemStatus.module.css";

interface BatteryInfo {
	level: number;
	charging: boolean;
	chargingTime: number;
	dischargingTime: number;
}

interface NetworkInfo {
	isOnline: boolean;
	connectionType: string;
	effectiveType: string;
	downlink: number;
	rtt: number;
	saveData: boolean;
}

interface BluetoothInfo {
	available: boolean;
	canScan: boolean;
	devices: BluetoothDevice[];
	isScanning: boolean;
}

interface BluetoothDevice {
	id: string;
	name: string;
	connected: boolean;
}

interface SystemInfo {
	memory: {
		used: number;
		total: number;
		percentage: number;
	};
	cores: number;
}

export default function MobileSystemStatus() {
	const [controlCenterMounted, setControlCenterMounted] = useState(false);
	const [controlCenterOpen, setControlCenterOpen] = useState(false);
	const [currentTime, setCurrentTime] = useState(new Date());
	const [batteryInfo, setBatteryInfo] = useState<BatteryInfo>({
		level: 1,
		charging: false,
		chargingTime: Infinity,
		dischargingTime: Infinity,
	});

	const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({
		isOnline: true,
		connectionType: "unknown",
		effectiveType: "4g",
		downlink: 0,
		rtt: 0,
		saveData: false,
	});

	const [bluetoothInfo, setBluetoothInfo] = useState<BluetoothInfo>({
		available: false,
		canScan: false,
		devices: [],
		isScanning: false,
	});

	const [systemInfo, setSystemInfo] = useState<SystemInfo>({
		memory: { used: 0, total: 0, percentage: 0 },
		cores: 4,
	});

	const [volume, setVolume] = useState(75);

	// Mobile detail panel routing
	const [activeDetail, setActiveDetail] = useState<
		null | "bluetooth" | "network" | "memory" | "cpu" | "volume" | "battery" | "time"
	>(null);

	// Update time every second
	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentTime(new Date());
		}, 1000);
		return () => clearInterval(timer);
	}, []);

	// Client-side hydration effect
	useEffect(() => {
		setNetworkInfo((prev) => ({
			...prev,
			isOnline: navigator.onLine,
		}));
		setSystemInfo((prev) => ({
			...prev,
			cores: navigator.hardwareConcurrency || 4,
		}));
	}, []);

	// Battery API
	useEffect(() => {
		if ("getBattery" in navigator) {
			const navigatorWithBattery = navigator as Navigator & {
				getBattery(): Promise<{
					level: number;
					charging: boolean;
					chargingTime: number;
					dischargingTime: number;
					addEventListener(event: string, callback: () => void): void;
					removeEventListener(event: string, callback: () => void): void;
				}>;
			};

			navigatorWithBattery
				.getBattery()
				.then((battery) => {
					const updateBatteryInfo = () => {
						setBatteryInfo({
							level: battery.level,
							charging: battery.charging,
							chargingTime: battery.chargingTime,
							dischargingTime: battery.dischargingTime,
						});
					};

					updateBatteryInfo();
					battery.addEventListener("chargingchange", updateBatteryInfo);
					battery.addEventListener("levelchange", updateBatteryInfo);

					return () => {
						battery.removeEventListener("chargingchange", updateBatteryInfo);
						battery.removeEventListener("levelchange", updateBatteryInfo);
					};
				})
				.catch(() => {
					setBatteryInfo({
						level: 0.85,
						charging: false,
						chargingTime: Infinity,
						dischargingTime: Infinity,
					});
				});
		}
	}, []);

	// Network Connection API
	useEffect(() => {
		const updateNetworkInfo = () => {
			const navigatorWithConnection = navigator as Navigator & {
				connection?: {
					type?: string;
					effectiveType?: string;
					downlink?: number;
					rtt?: number;
					saveData?: boolean;
					addEventListener?(event: string, callback: () => void): void;
					removeEventListener?(event: string, callback: () => void): void;
				};
				mozConnection?: {
					type?: string;
					effectiveType?: string;
					downlink?: number;
					rtt?: number;
					saveData?: boolean;
				};
				webkitConnection?: {
					type?: string;
					effectiveType?: string;
					downlink?: number;
					rtt?: number;
					saveData?: boolean;
				};
			};

			const connection =
				navigatorWithConnection.connection ||
				navigatorWithConnection.mozConnection ||
				navigatorWithConnection.webkitConnection;

			setNetworkInfo({
				isOnline: navigator.onLine,
				connectionType: connection?.type || "unknown",
				effectiveType: connection?.effectiveType || "4g",
				downlink: connection?.downlink || 0,
				rtt: connection?.rtt || 0,
				saveData: connection?.saveData || false,
			});
		};

		updateNetworkInfo();

		const handleOnline = () => setNetworkInfo((prev) => ({ ...prev, isOnline: true }));
		const handleOffline = () => setNetworkInfo((prev) => ({ ...prev, isOnline: false }));

		window.addEventListener("online", handleOnline);
		window.addEventListener("offline", handleOffline);

		const navigatorWithConnection = navigator as Navigator & {
			connection?: {
				addEventListener?(event: string, callback: () => void): void;
				removeEventListener?(event: string, callback: () => void): void;
			};
		};
		const connection = navigatorWithConnection.connection;
		if (connection?.addEventListener) {
			connection.addEventListener("change", updateNetworkInfo);
		}

		return () => {
			window.removeEventListener("online", handleOnline);
			window.removeEventListener("offline", handleOffline);
			if (connection?.removeEventListener) {
				connection.removeEventListener("change", updateNetworkInfo);
			}
		};
	}, []);

	// Memory usage (Performance API)
	useEffect(() => {
		const updateMemoryInfo = () => {
			const performanceWithMemory = performance as Performance & {
				memory?: {
					usedJSHeapSize: number;
					totalJSHeapSize: number;
					jsHeapSizeLimit: number;
				};
			};

			if (performanceWithMemory.memory) {
				const memory = performanceWithMemory.memory;
				setSystemInfo((prev) => ({
					...prev,
					memory: {
						used: memory.usedJSHeapSize,
						total: memory.totalJSHeapSize,
						percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
					},
				}));
			}
		};

		updateMemoryInfo();
		const interval = setInterval(updateMemoryInfo, 5000);
		return () => clearInterval(interval);
	}, []);

	// Bluetooth API
	useEffect(() => {
		if ("bluetooth" in navigator) {
			setBluetoothInfo({
				available: true,
				canScan: true,
				devices: [],
				isScanning: false,
			});
		}
	}, []);

	// Volume simulation
	useEffect(() => {
		const handleKeyPress = (e: KeyboardEvent) => {
			if (e.altKey) {
				if (e.key === "ArrowUp") {
					e.preventDefault();
					setVolume((prev) => Math.min(100, prev + 5));
				} else if (e.key === "ArrowDown") {
					e.preventDefault();
					setVolume((prev) => Math.max(0, prev - 5));
				}
			}
		};

		window.addEventListener("keydown", handleKeyPress);
		return () => window.removeEventListener("keydown", handleKeyPress);
	}, []);

	// Helpers
	const formatBytes = (bytes: number) => {
		if (bytes === 0) return "0 B";
		const k = 1024;
		const sizes = ["B", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
	};

	const formatTime = (seconds: number) => {
		if (!isFinite(seconds) || seconds <= 0) return "Unknown";
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		if (hours > 0) return `${hours}h ${minutes}m`;
		return `${minutes}m`;
	};

	const getBatteryIcon = useCallback(() => {
		const level = batteryInfo.level * 100;
		if (batteryInfo.charging) return BatteryCharging;
		if (level > 80) return BatteryFull;
		if (level > 50) return BatteryMedium;
		if (level > 20) return BatteryLow;
		return Battery;
	}, [batteryInfo]);

	const getVolumeIcon = useCallback(() => {
		if (volume === 0) return VolumeX;
		if (volume < 33) return Volume;
		if (volume < 66) return Volume1;
		return Volume2;
	}, [volume]);

	const getNetworkIcon = useCallback(() => {
		if (!networkInfo.isOnline) return WifiOff;
		return Wifi;
	}, [networkInfo.isOnline]);

	const openControlCenter = () => {
		if (controlCenterMounted && controlCenterOpen) return;
		setControlCenterMounted(true);
		requestAnimationFrame(() => setControlCenterOpen(true));
	};

	const closeControlCenter = () => {
		if (!controlCenterMounted) return;
		setControlCenterOpen(false);
		setActiveDetail(null);
		window.setTimeout(() => setControlCenterMounted(false), 180);
	};

	const timeString = currentTime.toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	});

	// Bluetooth scanning function
	const scanForBluetoothDevices = async () => {
		if (!bluetoothInfo.available || bluetoothInfo.isScanning) return;

		setBluetoothInfo((prev) => ({ ...prev, isScanning: true }));

		try {
			const navigatorWithBluetooth = navigator as Navigator & {
				bluetooth?: {
					requestDevice(options?: {
						acceptAllDevices?: boolean;
						optionalServices?: string[];
					}): Promise<{
						id?: string;
						name?: string;
						gatt?: {
							connected?: boolean;
						};
					}>;
					getAvailability(): Promise<boolean>;
				};
			};

			if (navigatorWithBluetooth.bluetooth) {
				const device = await navigatorWithBluetooth.bluetooth.requestDevice({
					acceptAllDevices: true,
					optionalServices: ["battery_service", "device_information"],
				});

				if (device) {
					const newDevice: BluetoothDevice = {
						id: device.id || Math.random().toString(36),
						name: device.name || "Unknown Device",
						connected: device.gatt?.connected || false,
					};

					setBluetoothInfo((prev) => ({
						...prev,
						devices: [...prev.devices.filter((d) => d.id !== newDevice.id), newDevice],
						isScanning: false,
					}));
				}
			}
		} catch {
			setBluetoothInfo((prev) => ({ ...prev, isScanning: false }));
		}
	};

	return (
		<>
			{/* Time Display */}
			<span className={styles.time}>{timeString}</span>

			{/* Control Center Button */}
			<button
				className={styles.controlCenterButton}
				onClick={() =>
					controlCenterMounted ? closeControlCenter() : openControlCenter()
				}
				title="Control Center"
			>
				<div className={styles.batteryIndicator}>
					{React.createElement(getBatteryIcon(), { size: 16 })}
					<span>{Math.round(batteryInfo.level * 100)}%</span>
				</div>
			</button>

			{/* Control Center Modal */}
			{controlCenterMounted &&
				createPortal(
					<div
						className={`${styles.controlCenterOverlay} ${
							controlCenterOpen ? styles.overlayOpen : styles.overlayClosing
						}`}
						onClick={closeControlCenter}
					>
						<div
							className={`${styles.controlCenter} ${
								controlCenterOpen ? styles.panelOpen : styles.panelClosing
							}`}
							onClick={(e) => e.stopPropagation()}
						>
							{/* First row: Connectivity */}
							<div className={styles.controlRow}>
								<div className={styles.controlGroup}>
									<button
										className={styles.controlButton}
										onClick={() => setActiveDetail("bluetooth")}
									>
										{bluetoothInfo.available ? (
											<Bluetooth size={24} />
										) : (
											<BluetoothOff size={24} />
										)}
										<span>Bluetooth</span>
									</button>

									<button
										className={styles.controlButton}
										onClick={() => setActiveDetail("network")}
									>
										{React.createElement(getNetworkIcon(), { size: 24 })}
										<span>Wi-Fi</span>
									</button>

									<button
										className={styles.controlButton}
										onClick={() => setActiveDetail("memory")}
									>
										<HardDrive size={24} />
										<span>Memory</span>
									</button>

									<button
										className={styles.controlButton}
										onClick={() => setActiveDetail("cpu")}
									>
										<Cpu size={24} />
										<span>CPU</span>
									</button>
								</div>
							</div>

							{/* Second row: Audio and Battery */}
							<div className={styles.controlRow}>
								<div className={styles.controlGroup}>
									<button
										className={styles.controlButton}
										onClick={() => setActiveDetail("volume")}
									>
										{React.createElement(getVolumeIcon(), { size: 24 })}
										<span>Volume</span>
									</button>

									<button
										className={styles.controlButton}
										onClick={() => setActiveDetail("battery")}
									>
										{React.createElement(getBatteryIcon(), { size: 24 })}
										<span>Battery</span>
									</button>

									<button
										className={styles.controlButton}
										onClick={() => setActiveDetail("time")}
									>
										<Clock size={24} />
										<span>Time</span>
									</button>
								</div>
							</div>

							{/* Detail Panel */}
							{activeDetail && (
								<div className={styles.detailPanel}>
									<div className={styles.detailHeader}>
										<span className={styles.detailTitle}>
											{activeDetail === "battery" && "Battery"}
											{activeDetail === "network" && "Network"}
											{activeDetail === "bluetooth" && "Bluetooth"}
											{activeDetail === "memory" && "Memory Usage"}
											{activeDetail === "cpu" && "Processor"}
											{activeDetail === "volume" && "Volume"}
											{activeDetail === "time" && "Date & Time"}
										</span>
										<button
											className={styles.detailClose}
											onClick={() => setActiveDetail(null)}
										>
											<X size={16} />
										</button>
									</div>

									<div className={styles.detailContent}>
										{activeDetail === "battery" && (
											<div className={styles.detailSection}>
												<div className={styles.detailRow}>
													<span>Charge Level</span>
													<span>{Math.round(batteryInfo.level * 100)}%</span>
												</div>
												<div className={styles.progressBar}>
													<div
														className={`${styles.progressFill} ${
															batteryInfo.level < 0.2
																? styles.danger
																: batteryInfo.level < 0.5
																? styles.warning
																: ""
														}`}
														style={{ width: `${batteryInfo.level * 100}%` }}
													/>
												</div>
												<div className={styles.detailRow}>
													<span>Status</span>
													<span>{batteryInfo.charging ? "Charging" : "On Battery"}</span>
												</div>
												<div className={styles.detailRow}>
													<span>Time Remaining</span>
													<span>
														{batteryInfo.charging
															? formatTime(batteryInfo.chargingTime)
															: formatTime(batteryInfo.dischargingTime)}
													</span>
												</div>
											</div>
										)}

										{activeDetail === "network" && (
											<div className={styles.detailSection}>
												<div className={styles.detailRow}>
													<span>Connection Status</span>
													<span>{networkInfo.isOnline ? "Connected" : "Offline"}</span>
												</div>
												<div className={styles.detailRow}>
													<span>Connection Type</span>
													<span>
														{networkInfo.effectiveType?.toUpperCase() || "Unknown"}
													</span>
												</div>
												<div className={styles.detailRow}>
													<span>Speed</span>
													<span>
														{networkInfo.downlink > 0
															? `${networkInfo.downlink} Mbps`
															: "Unknown"}
													</span>
												</div>
												<div className={styles.detailRow}>
													<span>Latency</span>
													<span>
														{networkInfo.rtt > 0 ? `${networkInfo.rtt}ms` : "Unknown"}
													</span>
												</div>
												<div className={styles.detailRow}>
													<span>Data Saver</span>
													<span>{networkInfo.saveData ? "Enabled" : "Disabled"}</span>
												</div>
											</div>
										)}

										{activeDetail === "bluetooth" && (
											<div className={styles.detailSection}>
												<div className={styles.detailRow}>
													<span>Status</span>
													<span>
														{bluetoothInfo.available ? "Available" : "Not Available"}
													</span>
												</div>
												<div className={styles.detailRow}>
													<span>Devices Found</span>
													<span>{bluetoothInfo.devices.length}</span>
												</div>
												<div className={styles.detailRow}>
													<span>Scan Status</span>
													<span>
														{bluetoothInfo.isScanning ? "Scanning..." : "Ready"}
													</span>
												</div>
												{bluetoothInfo.available && (
													<>
														{bluetoothInfo.devices.length > 0 && (
															<div className={styles.detailSubSection}>
																<div className={styles.detailLabel}>
																	Connected Devices
																</div>
																{bluetoothInfo.devices.map((device) => (
																	<div key={device.id} className={styles.detailValue}>
																		{device.name} {device.connected ? "✓" : "○"}
																	</div>
																))}
															</div>
														)}
														<button
															className={styles.actionButton}
															onClick={scanForBluetoothDevices}
															disabled={bluetoothInfo.isScanning}
														>
															{bluetoothInfo.isScanning
																? "Scanning..."
																: "Scan for Devices"}
														</button>
													</>
												)}
											</div>
										)}

										{activeDetail === "memory" && (
											<div className={styles.detailSection}>
												<div className={styles.detailRow}>
													<span>JavaScript Heap</span>
													<span>
														{formatBytes(systemInfo.memory.used)} /{" "}
														{formatBytes(systemInfo.memory.total)}
													</span>
												</div>
												<div className={styles.progressBar}>
													<div
														className={`${styles.progressFill} ${
															systemInfo.memory.percentage > 90
																? styles.danger
																: systemInfo.memory.percentage > 70
																? styles.warning
																: ""
														}`}
														style={{ width: `${systemInfo.memory.percentage}%` }}
													/>
												</div>
												<div className={styles.detailRow}>
													<span>Usage Percentage</span>
													<span>{Math.round(systemInfo.memory.percentage)}%</span>
												</div>
											</div>
										)}

										{activeDetail === "cpu" && (
											<div className={styles.detailSection}>
												<div className={styles.detailRow}>
													<span>Logical Cores</span>
													<span>{systemInfo.cores}</span>
												</div>
												<div className={styles.detailRow}>
													<span>Platform</span>
													<span>{navigator.platform || "Unknown"}</span>
												</div>
												<div className={styles.detailRow}>
													<span>User Agent</span>
													<span className={styles.smallText}>
														{navigator.userAgent.split(" ").slice(0, 3).join(" ")}...
													</span>
												</div>
											</div>
										)}

										{activeDetail === "volume" && (
											<div className={styles.detailSection}>
												<div className={styles.detailRow}>
													<span>System Volume</span>
													<span>{volume}%</span>
												</div>
												<input
													type="range"
													min="0"
													max="100"
													value={volume}
													onChange={(e) => setVolume(parseInt(e.target.value))}
													className={styles.slider}
												/>
												<div className={styles.detailHint}>
													Alt + ↑/↓ to adjust volume
												</div>
											</div>
										)}

										{activeDetail === "time" && (
											<div className={styles.detailSection}>
												<div className={styles.detailRow}>
													<span>Current Time</span>
													<span className={styles.largeText}>
														{currentTime.toLocaleTimeString([], {
															hour: "2-digit",
															minute: "2-digit",
															second: "2-digit",
															hour12: true,
														})}
													</span>
												</div>
												<div className={styles.detailRow}>
													<span>Date</span>
													<span>
														{currentTime.toLocaleDateString([], {
															weekday: "long",
															year: "numeric",
															month: "long",
															day: "numeric",
														})}
													</span>
												</div>
												<div className={styles.detailRow}>
													<span>Timezone</span>
													<span>{Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
												</div>
											</div>
										)}
									</div>
								</div>
							)}
						</div>
					</div>,
					document.body
				)}
		</>
	);
}
