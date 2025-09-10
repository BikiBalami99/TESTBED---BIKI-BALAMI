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
	Wifi,
	WifiOff,
	BluetoothOff,
	Sun,
	Airplay,
	Flashlight,
	MoonStar,
	AlarmClock,
	Vibrate,
	Bell,
	BellOff,
	Camera,
	SkipBack,
	Play,
	SkipForward,
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

	const [, /* bluetoothInfo */ setBluetoothInfo] = useState<BluetoothInfo>({
		available: false,
		canScan: false,
		devices: [],
		isScanning: false,
	});

	const [, /* systemInfo */ setSystemInfo] = useState<SystemInfo>({
		memory: { used: 0, total: 0, percentage: 0 },
		cores: 4,
	});

	const [volume, setVolume] = useState(75);
	const [brightness, setBrightness] = useState(80);
	const [focusMode, setFocusMode] = useState(false);
	const [flashlightOn, setFlashlightOn] = useState(false);
	const [airplaneMode, setAirplaneMode] = useState(false);
	const [wifiEnabled, setWifiEnabled] = useState(true);
	const [bluetoothEnabled, setBluetoothEnabled] = useState(true);
	const [cellularEnabled, setCellularEnabled] = useState(true);

	// Prevent body scroll when Control Center is mounted (open or animating out)
	useEffect(() => {
		if (!controlCenterMounted) return;
		const originalOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = originalOverflow;
		};
	}, [controlCenterMounted]);

	// Update time every minute
	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentTime(new Date());
		}, 60000);
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

	const getBatteryIcon = useCallback(() => {
		const level = batteryInfo.level * 100;
		if (batteryInfo.charging) return BatteryCharging;
		if (level > 80) return BatteryFull;
		if (level > 50) return BatteryMedium;
		if (level > 20) return BatteryLow;
		return Battery;
	}, [batteryInfo]);

	//	const getVolumeIcon = useCallback(() => {
	//		if (volume === 0) return VolumeX;
	//		if (volume < 33) return Volume;
	//		if (volume < 66) return Volume1;
	//		return Volume2;
	//	}, [volume]);

	const getWifiIcon = useCallback(() => {
		if (!wifiEnabled || !networkInfo.isOnline) return WifiOff;
		// lucide-react does not export WifiHigh/Medium/Low consistently; fallback to Wifi
		return Wifi;
	}, [wifiEnabled, networkInfo]);

	const openControlCenter = () => {
		if (controlCenterMounted && controlCenterOpen) return;
		setControlCenterMounted(true);
		// Next frame to allow CSS transition from initial state
		requestAnimationFrame(() => setControlCenterOpen(true));
	};

	const closeControlCenter = () => {
		if (!controlCenterMounted) return;
		setControlCenterOpen(false);
		// Wait for CSS closing animation before unmounting (match 0.175s)
		window.setTimeout(() => setControlCenterMounted(false), 180);
	};

	const timeString = currentTime.toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	});

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

			{/* Control Center Modal (rendered in portal to avoid clipping) */}
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
										className={`${styles.controlButton} ${
											airplaneMode ? styles.active : ""
										}`}
										onClick={() => setAirplaneMode(!airplaneMode)}
									>
										<Airplay size={24} />
										<span>Airplane</span>
									</button>

									<button
										className={`${styles.controlButton} ${
											cellularEnabled ? styles.active : ""
										}`}
										onClick={() => setCellularEnabled(!cellularEnabled)}
									>
										<div className={styles.cellularIcon}>
											<div className={styles.cellularBar} style={{ height: "20%" }}></div>
											<div className={styles.cellularBar} style={{ height: "40%" }}></div>
											<div className={styles.cellularBar} style={{ height: "60%" }}></div>
											<div className={styles.cellularBar} style={{ height: "80%" }}></div>
										</div>
										<span>Cellular</span>
									</button>

									<button
										className={`${styles.controlButton} ${
											wifiEnabled ? styles.active : ""
										}`}
										onClick={() => setWifiEnabled(!wifiEnabled)}
									>
										{React.createElement(getWifiIcon(), { size: 24 })}
										<span>Wi-Fi</span>
									</button>

									<button
										className={`${styles.controlButton} ${
											bluetoothEnabled ? styles.active : ""
										}`}
										onClick={() => setBluetoothEnabled(!bluetoothEnabled)}
									>
										{false &&
											(bluetoothEnabled ? (
												<BluetoothOff size={24} />
											) : (
												<BluetoothOff size={24} />
											))}
										<span>Bluetooth</span>
									</button>
								</div>
							</div>

							{/* Second row: Audio and Focus */}
							<div className={styles.controlRow}>
								<div className={styles.controlGroup}>
									<div className={styles.sliderControl}>
										<div className={styles.sliderHeader}>
											<Volume2 size={20} />
											<span>Volume</span>
										</div>
										<input
											type="range"
											min="0"
											max="100"
											value={volume}
											onChange={(e) => setVolume(parseInt(e.target.value))}
											className={styles.slider}
										/>
									</div>

									<div className={styles.sliderControl}>
										<div className={styles.sliderHeader}>
											<Sun size={20} />
											<span>Brightness</span>
										</div>
										<input
											type="range"
											min="0"
											max="100"
											value={brightness}
											onChange={(e) => setBrightness(parseInt(e.target.value))}
											className={styles.slider}
										/>
									</div>

									<button
										className={`${styles.controlButton} ${
											focusMode ? styles.active : ""
										}`}
										onClick={() => setFocusMode(!focusMode)}
									>
										<MoonStar size={24} />
										<span>Focus</span>
									</button>

									<button className={`${styles.controlButton}`} onClick={() => {}}>
										<AlarmClock size={24} />
										<span>Timer</span>
									</button>
								</div>
							</div>

							{/* Third row: Media and Utilities */}
							<div className={styles.controlRow}>
								<div className={styles.controlGroup}>
									<button
										className={`${styles.controlButton} ${
											flashlightOn ? styles.active : ""
										}`}
										onClick={() => setFlashlightOn(!flashlightOn)}
									>
										<Flashlight size={24} />
										<span>Flashlight</span>
									</button>

									<button className={`${styles.controlButton}`} onClick={() => {}}>
										<Camera size={24} />
										<span>Camera</span>
									</button>

									<button className={`${styles.controlButton}`} onClick={() => {}}>
										<Vibrate size={24} />
										<span>Silent</span>
									</button>

									<button className={`${styles.controlButton}`} onClick={() => {}}>
										{focusMode ? <BellOff size={24} /> : <Bell size={24} />}
										<span>Sounds</span>
									</button>
								</div>
							</div>

							{/* Media playback controls (simplified) */}
							<div className={styles.mediaControl}>
								<div className={styles.mediaInfo}>
									<div className={styles.mediaTitle}>Not Playing</div>
									<div className={styles.mediaSubtitle}>Music</div>
								</div>
								<div className={styles.mediaButtons}>
									<button className={styles.mediaButton}>
										<SkipBack size={20} />
									</button>
									<button className={styles.mediaButton}>
										<Play size={20} />
									</button>
									<button className={styles.mediaButton}>
										<SkipForward size={20} />
									</button>
								</div>
							</div>
						</div>
					</div>,
					document.body
				)}
		</>
	);
}
