"use client";

import React, { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import SystemStatus from "../desktop/MenuBar/SystemStatus/SystemStatus";
import styles from "./MobileSystemStatus.module.css";

export default function MobileSystemStatus() {
	const [controlCenterOpen, setControlCenterOpen] = useState(false);
	const [currentTime, setCurrentTime] = useState(new Date());

	// Update time every minute
	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentTime(new Date());
		}, 60000);
		return () => clearInterval(timer);
	}, []);

	const timeString = currentTime.toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	});

	const handleControlCenter = () => {
		setControlCenterOpen(!controlCenterOpen);
	};

	return (
		<>
			{/* Time Display */}
			<span className={styles.time}>{timeString}</span>

			{/* Control Center Button */}
			<button
				className={styles.controlCenterButton}
				onClick={handleControlCenter}
				title="Control Center"
			>
				<Settings size={16} />
			</button>

			{/* Control Center Modal */}
			{controlCenterOpen && (
				<div
					className={styles.controlCenterOverlay}
					onClick={() => setControlCenterOpen(false)}
				>
					<div className={styles.controlCenter} onClick={(e) => e.stopPropagation()}>
						<div className={styles.controlCenterHeader}>
							<h3>Control Center</h3>
							<button
								className={styles.closeButton}
								onClick={() => setControlCenterOpen(false)}
							>
								×
							</button>
						</div>

						{/* Use the actual SystemStatus component */}
						<div className={styles.systemStatusContainer}>
							<SystemStatus />
						</div>
					</div>
				</div>
			)}
		</>
	);
}
