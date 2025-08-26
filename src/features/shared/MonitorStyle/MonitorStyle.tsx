import styles from "./MonitorStyle.module.css";

export default function MonitorStyle({ children }: { children: React.ReactNode }) {
	return (
		<div className={styles.monitorContainer}>
			{/* MacBook Screen */}
			<div className={styles.screen}>
				{/* macOS Window Chrome */}
				<div className={styles.windowChrome}>
					{/* Traffic Light Buttons */}
					<div className={styles.trafficLights}>
						<div className={`${styles.trafficLight} ${styles.close}`}></div>
						<div className={`${styles.trafficLight} ${styles.minimize}`}></div>
						<div className={`${styles.trafficLight} ${styles.maximize}`}></div>
					</div>

					{/* Window Title */}
					<div className={styles.windowTitle}>Dev Collection</div>

					{/* Empty space for balance */}
					<div style={{ width: "60px" }}></div>
				</div>

				{/* Content Area - Where children render */}
				<div className={styles.contentArea}>{children}</div>
			</div>

			{/* MacBook Base - The laptop body */}
			<div className={styles.laptopBase}></div>
		</div>
	);
}
