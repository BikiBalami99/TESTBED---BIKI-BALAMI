"use client";

import React from "react";
import styles from "./MobileWindow.module.css";

interface MobileWindowProps {
	children: React.ReactNode;
}

export default function MobileWindow({ children }: MobileWindowProps) {
	return (
		<div className={styles.mobileWindow}>
			{/* Window content - fullscreen */}
			<div className={styles.windowContent}>{children}</div>
		</div>
	);
}
