"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
	Battery,
	BatteryCharging,
	BatteryFull,
	BatteryLow,
	BatteryMedium,
	Volume,
	Volume1,
	Volume2,
	VolumeX,
	Wifi,
	WifiOff,
	Cpu,
	HardDrive,
	Bluetooth,
	BluetoothOff,
	Zap,
	Clock,
	Globe,
	Sun,
	Sunrise,
	Sunset,
	Moon,
} from "lucide-react";
import SystemTooltip from "./SystemTooltip";
import styles from "./SystemStatus.module.css";
import tooltipStyles from "./SystemTooltip.module.css";

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

export default function SystemStatus() {
	const [batteryInfo, setBatteryInfo] = useState<BatteryInfo>({
		level: 1,
		charging: false,
		chargingTime: Infinity,
		dischargingTime: Infinity,
	});

	const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({
		isOnline: true, // Default to online to prevent hydration mismatch
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
		cores: 4, // Default value to prevent hydration mismatch
	});

	const [volume, setVolume] = useState(75);
	const [currentTime, setCurrentTime] = useState(new Date());

	// Client-side hydration effect
	useEffect(() => {
		// Update network info with actual client values
		setNetworkInfo((prev) => ({
			...prev,
			isOnline: navigator.onLine,
		}));
		// Update system info with actual client values
		setSystemInfo((prev) => ({
			...prev,
			cores: navigator.hardwareConcurrency || 4,
		}));
	}, []);

	// Time update effect
	useEffect(() => {
		const updateTime = () => {
			setCurrentTime(new Date());
		};

		// Update immediately
		updateTime();

		// Update every second for smooth time display
		const interval = setInterval(updateTime, 1000);

		return () => clearInterval(interval);
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
					// Fallback for browsers that don't support battery API
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

		// Listen for connection changes
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
		const interval = setInterval(updateMemoryInfo, 5000); // Update every 5 seconds

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
				// Request device with basic filters
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
		} catch (error) {
			
			setBluetoothInfo((prev) => ({ ...prev, isScanning: false }));
		}
	};

	// Volume simulation (since we can't access system volume)
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

	// Tooltip content creators
	const createBatteryTooltip = () => (
		<div className={tooltipStyles.tooltipContent}>
			<div className={tooltipStyles.tooltipHeader}>
				{React.createElement(getBatteryIcon(), {
					size: 16,
					className: tooltipStyles.tooltipIcon,
				})}
				<span className={tooltipStyles.tooltipTitle}>Battery</span>
			</div>

			<div className={tooltipStyles.tooltipSection}>
				<div className={tooltipStyles.tooltipLabel}>Charge Level</div>
				<div className={tooltipStyles.tooltipValue}>
					{Math.round(batteryInfo.level * 100)}%
				</div>
				<div className={tooltipStyles.tooltipProgress}>
					<div
						className={`${tooltipStyles.tooltipProgressBar} ${
							batteryInfo.level < 0.2
								? tooltipStyles.danger
								: batteryInfo.level < 0.5
								? tooltipStyles.warning
								: ""
						}`}
						style={{ width: `${batteryInfo.level * 100}%` }}
					/>
				</div>
			</div>

			<div className={tooltipStyles.tooltipGrid}>
				<div className={tooltipStyles.tooltipGridItem}>
					<div className={tooltipStyles.tooltipLabel}>Status</div>
					<div
						className={`${tooltipStyles.tooltipStatus} ${
							batteryInfo.charging ? tooltipStyles.charging : ""
						}`}
					>
						{batteryInfo.charging ? <Zap size={12} /> : <Battery size={12} />}
						{batteryInfo.charging ? "Charging" : "On Battery"}
					</div>
				</div>
				<div className={tooltipStyles.tooltipGridItem}>
					<div className={tooltipStyles.tooltipLabel}>Time Remaining</div>
					<div className={tooltipStyles.tooltipValue}>
						{batteryInfo.charging
							? formatTime(batteryInfo.chargingTime)
							: formatTime(batteryInfo.dischargingTime)}
					</div>
				</div>
			</div>
		</div>
	);

	const createVolumeTooltip = () => (
		<div className={tooltipStyles.tooltipContent}>
			<div className={tooltipStyles.tooltipHeader}>
				{React.createElement(getVolumeIcon(), {
					size: 16,
					className: tooltipStyles.tooltipIcon,
				})}
				<span className={tooltipStyles.tooltipTitle}>Volume</span>
			</div>

			<div className={tooltipStyles.tooltipSection}>
				<div className={tooltipStyles.tooltipLabel}>System Volume</div>
				<div className={tooltipStyles.tooltipValue}>{volume}%</div>
				<input
					type="range"
					min="0"
					max="100"
					value={volume}
					onChange={(e) => setVolume(parseInt(e.target.value))}
					className={tooltipStyles.tooltipSlider}
				/>
			</div>

			<div className={tooltipStyles.tooltipSection}>
				<div className={tooltipStyles.tooltipLabel}>Keyboard Shortcuts</div>
				<div className={tooltipStyles.tooltipValue}>Alt + ↑/↓ to adjust volume</div>
			</div>
		</div>
	);

	const createNetworkTooltip = () => (
		<div className={tooltipStyles.tooltipContent}>
			<div className={tooltipStyles.tooltipHeader}>
				{React.createElement(getNetworkIcon(), {
					size: 16,
					className: tooltipStyles.tooltipIcon,
				})}
				<span className={tooltipStyles.tooltipTitle}>Network Connection</span>
			</div>

			<div className={tooltipStyles.tooltipSection}>
				<div className={tooltipStyles.tooltipLabel}>Connection Status</div>
				<div
					className={`${tooltipStyles.tooltipStatus} ${
						networkInfo.isOnline ? tooltipStyles.online : tooltipStyles.offline
					}`}
				>
					{networkInfo.isOnline ? <Globe size={12} /> : <WifiOff size={12} />}
					{networkInfo.isOnline ? "Connected" : "Offline"}
				</div>
			</div>

			{networkInfo.isOnline && (
				<>
					<div className={tooltipStyles.tooltipGrid}>
						<div className={tooltipStyles.tooltipGridItem}>
							<div className={tooltipStyles.tooltipLabel}>Connection Type</div>
							<div className={tooltipStyles.tooltipValue}>
								{networkInfo.effectiveType?.toUpperCase() || "Unknown"}
							</div>
						</div>
						<div className={tooltipStyles.tooltipGridItem}>
							<div className={tooltipStyles.tooltipLabel}>Speed</div>
							<div className={tooltipStyles.tooltipValue}>
								{networkInfo.downlink > 0 ? `${networkInfo.downlink} Mbps` : "Unknown"}
							</div>
						</div>
					</div>

					<div className={tooltipStyles.tooltipGrid}>
						<div className={tooltipStyles.tooltipGridItem}>
							<div className={tooltipStyles.tooltipLabel}>Latency</div>
							<div className={tooltipStyles.tooltipValue}>
								{networkInfo.rtt > 0 ? `${networkInfo.rtt}ms` : "Unknown"}
							</div>
						</div>
						<div className={tooltipStyles.tooltipGridItem}>
							<div className={tooltipStyles.tooltipLabel}>Data Saver</div>
							<div className={tooltipStyles.tooltipValue}>
								{networkInfo.saveData ? "Enabled" : "Disabled"}
							</div>
						</div>
					</div>

					<div className={tooltipStyles.tooltipSection}>
						<div className={tooltipStyles.tooltipLabel}>Network Details</div>
						<div
							className={tooltipStyles.tooltipValue}
							style={{ fontSize: "0.7rem", opacity: 0.8 }}
						>
							Type: {networkInfo.connectionType || "Unknown"}
							<br />
							User Agent Platform: {navigator.platform}
							<br />
							Languages: {navigator.languages.slice(0, 2).join(", ")}
						</div>
					</div>
				</>
			)}
		</div>
	);

	const createMemoryTooltip = () => (
		<div className={tooltipStyles.tooltipContent}>
			<div className={tooltipStyles.tooltipHeader}>
				<HardDrive size={16} className={tooltipStyles.tooltipIcon} />
				<span className={tooltipStyles.tooltipTitle}>Memory Usage</span>
			</div>

			<div className={tooltipStyles.tooltipSection}>
				<div className={tooltipStyles.tooltipLabel}>JavaScript Heap</div>
				<div className={tooltipStyles.tooltipValue}>
					{formatBytes(systemInfo.memory.used)} / {formatBytes(systemInfo.memory.total)}
				</div>
				<div className={tooltipStyles.tooltipProgress}>
					<div
						className={`${tooltipStyles.tooltipProgressBar} ${
							systemInfo.memory.percentage > 90
								? tooltipStyles.danger
								: systemInfo.memory.percentage > 70
								? tooltipStyles.warning
								: ""
						}`}
						style={{ width: `${systemInfo.memory.percentage}%` }}
					/>
				</div>
			</div>

			<div className={tooltipStyles.tooltipSection}>
				<div className={tooltipStyles.tooltipLabel}>Usage Percentage</div>
				<div className={tooltipStyles.tooltipValue}>
					{Math.round(systemInfo.memory.percentage)}%
				</div>
			</div>
		</div>
	);

	const createCpuTooltip = () => (
		<div className={tooltipStyles.tooltipContent}>
			<div className={tooltipStyles.tooltipHeader}>
				<Cpu size={16} className={tooltipStyles.tooltipIcon} />
				<span className={tooltipStyles.tooltipTitle}>Processor</span>
			</div>

			<div className={tooltipStyles.tooltipSection}>
				<div className={tooltipStyles.tooltipLabel}>Logical Cores</div>
				<div className={tooltipStyles.tooltipValue}>{systemInfo.cores}</div>
			</div>

			<div className={tooltipStyles.tooltipSection}>
				<div className={tooltipStyles.tooltipLabel}>Architecture</div>
				<div className={tooltipStyles.tooltipValue}>
					{navigator.platform || "Unknown"}
				</div>
			</div>

			<div className={tooltipStyles.tooltipSection}>
				<div className={tooltipStyles.tooltipLabel}>User Agent</div>
				<div
					className={tooltipStyles.tooltipValue}
					style={{ fontSize: "0.7rem", opacity: 0.8 }}
				>
					{navigator.userAgent.split(" ").slice(0, 3).join(" ")}...
				</div>
			</div>
		</div>
	);

	const createBluetoothTooltip = () => (
		<div className={tooltipStyles.tooltipContent}>
			<div className={tooltipStyles.tooltipHeader}>
				{bluetoothInfo.available ? (
					<Bluetooth size={16} className={tooltipStyles.tooltipIcon} />
				) : (
					<BluetoothOff size={16} className={tooltipStyles.tooltipIcon} />
				)}
				<span className={tooltipStyles.tooltipTitle}>Bluetooth</span>
			</div>

			<div className={tooltipStyles.tooltipSection}>
				<div className={tooltipStyles.tooltipLabel}>Status</div>
				<div
					className={`${tooltipStyles.tooltipStatus} ${
						bluetoothInfo.available ? tooltipStyles.online : tooltipStyles.offline
					}`}
				>
					{bluetoothInfo.available ? <Bluetooth size={12} /> : <BluetoothOff size={12} />}
					{bluetoothInfo.available ? "Available" : "Not Available"}
				</div>
			</div>

			{bluetoothInfo.available && (
				<>
					<div className={tooltipStyles.tooltipGrid}>
						<div className={tooltipStyles.tooltipGridItem}>
							<div className={tooltipStyles.tooltipLabel}>Devices Found</div>
							<div className={tooltipStyles.tooltipValue}>
								{bluetoothInfo.devices.length}
							</div>
						</div>
						<div className={tooltipStyles.tooltipGridItem}>
							<div className={tooltipStyles.tooltipLabel}>Scan Status</div>
							<div className={tooltipStyles.tooltipValue}>
								{bluetoothInfo.isScanning ? "Scanning..." : "Ready"}
							</div>
						</div>
					</div>

					{bluetoothInfo.devices.length > 0 && (
						<div className={tooltipStyles.tooltipSection}>
							<div className={tooltipStyles.tooltipLabel}>Connected Devices</div>
							{bluetoothInfo.devices.map((device) => (
								<div
									key={device.id}
									className={tooltipStyles.tooltipValue}
									style={{ fontSize: "0.7rem", marginBottom: "0.25rem" }}
								>
									{device.name} {device.connected ? "✓" : "○"}
								</div>
							))}
						</div>
					)}

					<div className={tooltipStyles.tooltipActions}>
						<button
							className={tooltipStyles.tooltipButton}
							onClick={scanForBluetoothDevices}
							disabled={bluetoothInfo.isScanning}
						>
							{bluetoothInfo.isScanning ? "Scanning..." : "Scan for Devices"}
						</button>
					</div>

					<div className={tooltipStyles.tooltipSection}>
						<div className={tooltipStyles.tooltipLabel}>Capabilities</div>
						<div
							className={tooltipStyles.tooltipValue}
							style={{ fontSize: "0.7rem", opacity: 0.8 }}
						>
							Web Bluetooth API: Supported
							<br />
							Device Discovery: Yes
							<br />
							GATT Services: Available
						</div>
					</div>
				</>
			)}
		</div>
	);

	// Helper function to calculate sunrise/sunset times
	const calculateSunTimes = (date: Date, lat: number = 40.7128) => {
		// Default to NYC coordinates, but could be enhanced to get user's location
		const dayOfYear = Math.floor(
			(date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) /
				(1000 * 60 * 60 * 24)
		);

		// Solar declination angle
		const declination =
			23.45 * Math.sin((((360 * (284 + dayOfYear)) / 365) * Math.PI) / 180);

		// Hour angle
		const latRad = (lat * Math.PI) / 180;
		const declRad = (declination * Math.PI) / 180;
		const hourAngle = Math.acos(-Math.tan(latRad) * Math.tan(declRad));

		// Sunrise and sunset times (in hours)
		const sunriseHour = 12 - (hourAngle * 12) / Math.PI;
		const sunsetHour = 12 + (hourAngle * 12) / Math.PI;

		// Convert to time strings
		const sunrise = new Date(date);
		sunrise.setHours(Math.floor(sunriseHour), (sunriseHour % 1) * 60, 0, 0);

		const sunset = new Date(date);
		sunset.setHours(Math.floor(sunsetHour), (sunsetHour % 1) * 60, 0, 0);

		return {
			sunrise: sunrise.toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
				hour12: true,
			}),
			sunset: sunset.toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
				hour12: true,
			}),
		};
	};

	// Helper function to calculate moon phase
	const calculateMoonPhase = (date: Date) => {
		const knownNewMoon = new Date(2000, 0, 6, 18, 14); // Known new moon date
		const lunarCycle = 29.53059; // Average lunar cycle in days

		const daysSinceKnownNewMoon =
			(date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
		const currentCycle = ((daysSinceKnownNewMoon % lunarCycle) + lunarCycle) % lunarCycle;

		if (currentCycle < 1.84566)
			return { phase: "New Moon", emoji: "🌑", illumination: 0 };
		else if (currentCycle < 5.53699)
			return { phase: "Waxing Crescent", emoji: "🌒", illumination: 0.25 };
		else if (currentCycle < 9.22831)
			return { phase: "First Quarter", emoji: "🌓", illumination: 0.5 };
		else if (currentCycle < 12.91963)
			return { phase: "Waxing Gibbous", emoji: "🌔", illumination: 0.75 };
		else if (currentCycle < 16.61096)
			return { phase: "Full Moon", emoji: "🌕", illumination: 1 };
		else if (currentCycle < 20.30228)
			return { phase: "Waning Gibbous", emoji: "🌖", illumination: 0.75 };
		else if (currentCycle < 23.99361)
			return { phase: "Last Quarter", emoji: "🌗", illumination: 0.5 };
		else return { phase: "Waning Crescent", emoji: "🌘", illumination: 0.25 };
	};

	const createTimeTooltip = () => {
		const now = currentTime;
		const timeString = now.toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			hour12: true,
		});
		const dateString = now.toLocaleDateString([], {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		});
		const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

		// Calculate astronomical data
		const sunTimes = calculateSunTimes(now);
		const moonPhase = calculateMoonPhase(now);

		// Determine if it's day or night
		const currentHour = now.getHours();
		const isDaytime = currentHour >= 6 && currentHour < 18;

		return (
			<div className={tooltipStyles.tooltipContent}>
				<div className={tooltipStyles.tooltipHeader}>
					<Clock size={16} className={tooltipStyles.tooltipIcon} />
					<span className={tooltipStyles.tooltipTitle}>Date & Time</span>
				</div>

				<div className={tooltipStyles.tooltipSection}>
					<div className={tooltipStyles.tooltipLabel}>Current Time</div>
					<div
						className={tooltipStyles.tooltipValue}
						style={{ fontSize: "1.2rem", fontWeight: "600" }}
					>
						{timeString}
					</div>
				</div>

				<div className={tooltipStyles.tooltipSection}>
					<div className={tooltipStyles.tooltipLabel}>Date</div>
					<div className={tooltipStyles.tooltipValue}>{dateString}</div>
				</div>

				<div className={tooltipStyles.tooltipSection}>
					<div className={tooltipStyles.tooltipLabel}>Timezone</div>
					<div className={tooltipStyles.tooltipValue}>{timezone}</div>
				</div>

				<div className={tooltipStyles.tooltipGrid}>
					<div className={tooltipStyles.tooltipGridItem}>
						<div className={tooltipStyles.tooltipLabel}>Sunrise</div>
						<div
							className={tooltipStyles.tooltipValue}
							style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
						>
							<Sunrise size={14} />
							{sunTimes.sunrise}
						</div>
					</div>
					<div className={tooltipStyles.tooltipGridItem}>
						<div className={tooltipStyles.tooltipLabel}>Sunset</div>
						<div
							className={tooltipStyles.tooltipValue}
							style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
						>
							<Sunset size={14} />
							{sunTimes.sunset}
						</div>
					</div>
				</div>

				<div className={tooltipStyles.tooltipSection}>
					<div className={tooltipStyles.tooltipLabel}>Moon Phase</div>
					<div className={tooltipStyles.tooltipValue}>
						{moonPhase.emoji} {moonPhase.phase}
					</div>
				</div>

				<div className={tooltipStyles.tooltipSection}>
					<div className={tooltipStyles.tooltipLabel}>Time of Day</div>
					<div
						className={tooltipStyles.tooltipValue}
						style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
					>
						{isDaytime ? <Sun size={14} /> : <Moon size={14} />}
						{isDaytime ? "Daytime" : "Nighttime"}
					</div>
				</div>
			</div>
		);
	};

	return (
		<div className={styles.systemStatus}>
			{/* Bluetooth */}
			<SystemTooltip content={createBluetoothTooltip()} position="top">
				<div className={styles.statusItem}>
					{bluetoothInfo.available ? (
						<Bluetooth size={12} className={styles.icon} />
					) : (
						<BluetoothOff size={12} className={styles.icon} />
					)}
				</div>
			</SystemTooltip>

			{/* Network */}
			<SystemTooltip content={createNetworkTooltip()} position="top">
				<div className={styles.statusItem}>
					{React.createElement(getNetworkIcon(), { size: 12, className: styles.icon })}
				</div>
			</SystemTooltip>

			{/* Memory Usage */}
			{systemInfo.memory.total > 0 && (
				<SystemTooltip content={createMemoryTooltip()} position="top">
					<div className={styles.statusItem}>
						<HardDrive size={12} className={styles.icon} />
						<span className={styles.text}>
							{Math.round(systemInfo.memory.percentage)}%
						</span>
					</div>
				</SystemTooltip>
			)}

			{/* CPU Cores */}
			<SystemTooltip content={createCpuTooltip()} position="top">
				<div className={styles.statusItem}>
					<Cpu size={12} className={styles.icon} />
					<span className={styles.text}>{systemInfo.cores}</span>
				</div>
			</SystemTooltip>

			{/* Volume */}
			<SystemTooltip content={createVolumeTooltip()} position="top">
				<div className={styles.statusItem}>
					{React.createElement(getVolumeIcon(), { size: 12, className: styles.icon })}
				</div>
			</SystemTooltip>

			{/* Battery */}
			<SystemTooltip content={createBatteryTooltip()} position="top">
				<div className={styles.statusItem}>
					{React.createElement(getBatteryIcon(), { size: 12, className: styles.icon })}
					<span className={styles.text}>{Math.round(batteryInfo.level * 100)}%</span>
				</div>
			</SystemTooltip>

			{/* Time */}
			<SystemTooltip content={createTimeTooltip()} position="top">
				<div className={styles.statusItem}>
					<Clock size={12} className={styles.icon} />
					<span className={styles.text}>
						{currentTime.toLocaleTimeString([], {
							hour: "2-digit",
							minute: "2-digit",
							hour12: true,
						})}
					</span>
				</div>
			</SystemTooltip>
		</div>
	);
}
