"use client";

import React from "react";
import { useBackgroundContext } from "./BackgroundContext";
import styles from "./OS.module.css";

export default function BackgroundDisplay() {
	const { selectedBackground } = useBackgroundContext();

	return (
		<div
			className={styles.backgroundImage}
			style={{
				backgroundImage: `url(${selectedBackground.path})`,
			}}
		/>
	);
}
