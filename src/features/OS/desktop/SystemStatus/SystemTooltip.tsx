"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import styles from "./SystemTooltip.module.css";

interface TooltipProps {
	children: React.ReactNode;
	content: React.ReactNode;
	position?: "top" | "bottom" | "left" | "right";
}

export default function SystemTooltip({
	children,
	content,
	position = "bottom",
}: TooltipProps) {
	const [isVisible, setIsVisible] = useState(false);
	const [isClosing, setIsClosing] = useState(false);
	const [actualPosition, setActualPosition] = useState(position);
	const tooltipRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLDivElement>(null);

	const toggleTooltip = () => {
		if (isVisible) {
			// Start closing animation
			setIsClosing(true);
			// Hide after animation completes
			setTimeout(() => {
				setIsVisible(false);
				setIsClosing(false);
			}, 250); // Match animation duration
		} else {
			setIsVisible(true);
			setIsClosing(false);
		}
	};

	const hideTooltip = useCallback(() => {
		if (isVisible) {
			setIsClosing(true);
			setTimeout(() => {
				setIsVisible(false);
				setIsClosing(false);
			}, 250);
		}
	}, [isVisible]);

	// Calculate position after tooltip is rendered
	useEffect(() => {
		if (isVisible && triggerRef.current && tooltipRef.current) {
			const trigger = triggerRef.current;
			const tooltip = tooltipRef.current;
			const triggerRect = trigger.getBoundingClientRect();
			const tooltipRect = tooltip.getBoundingClientRect();
			const viewport = {
				width: window.innerWidth,
				height: window.innerHeight,
			};

			const margin = 10; // 0.25rem = 4px
			let newPosition = position;

			// Check vertical positioning first
			if (position === "top" || position === "bottom") {
				const spaceAbove = triggerRect.top;
				const spaceBelow = viewport.height - triggerRect.bottom;

				if (position === "top" && spaceAbove < tooltipRect.height + margin) {
					// Not enough space above, try below
					if (spaceBelow >= tooltipRect.height + margin) {
						newPosition = "bottom";
					}
				} else if (position === "bottom" && spaceBelow < tooltipRect.height + margin) {
					// Not enough space below, try above
					if (spaceAbove >= tooltipRect.height + margin) {
						newPosition = "top";
					}
				}
			}

			setActualPosition(newPosition);

			// Handle horizontal positioning for top/bottom tooltips
			if (newPosition === "top" || newPosition === "bottom") {
				// Remove existing edge classes
				tooltip.classList.remove("rightEdge", "leftEdge");

				// Calculate where tooltip would be positioned
				const triggerCenter = triggerRect.left + triggerRect.width / 2;
				const tooltipHalfWidth = tooltipRect.width / 2;

				let leftPosition = triggerCenter - tooltipHalfWidth;
				let topPosition =
					newPosition === "top"
						? triggerRect.top - tooltipRect.height - 8
						: triggerRect.bottom + 8;

				// Constrain horizontally
				if (leftPosition < margin) {
					leftPosition = margin;
					tooltip.classList.add("leftEdge");
				} else if (leftPosition + tooltipRect.width > viewport.width - margin) {
					leftPosition = viewport.width - tooltipRect.width - margin;
					tooltip.classList.add("rightEdge");
				}

				// Constrain vertically
				if (topPosition < margin) {
					topPosition = margin;
				} else if (topPosition + tooltipRect.height > viewport.height - margin) {
					topPosition = viewport.height - tooltipRect.height - margin;
				}

				// Apply the calculated position
				tooltip.style.left = `${leftPosition}px`;
				tooltip.style.top = `${topPosition}px`;
				tooltip.style.right = "auto";
				tooltip.style.bottom = "auto";
			}
		}
	}, [isVisible, position]);

	// Click outside to close
	useEffect(() => {
		if (!isVisible) return;

		const handleClickOutside = (event: MouseEvent) => {
			if (
				tooltipRef.current &&
				triggerRef.current &&
				!tooltipRef.current.contains(event.target as Node) &&
				!triggerRef.current.contains(event.target as Node)
			) {
				hideTooltip();
			}
		};

		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				hideTooltip();
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("keydown", handleEscape);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleEscape);
		};
	}, [isVisible, hideTooltip]);

	return (
		<div className={styles.tooltipContainer}>
			<div ref={triggerRef} onClick={toggleTooltip} className={styles.trigger}>
				{children}
			</div>
			{isVisible && (
				<div
					ref={tooltipRef}
					className={`${styles.tooltip} ${styles[actualPosition]} ${
						isClosing ? styles.closing : ""
					}`}
				>
					<div className={styles.tooltipContent}>{content}</div>
				</div>
			)}
		</div>
	);
}
