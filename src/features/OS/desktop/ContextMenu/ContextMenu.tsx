"use client";

import React, { useEffect, useRef } from "react";
import { Plus, X, Square } from "lucide-react";
import styles from "./ContextMenu.module.css";

export interface ContextMenuItem {
	id: string;
	label: string;
	icon?: React.ComponentType<{ size?: number; className?: string }>;
	shortcut?: string;
	disabled?: boolean;
	onClick?: () => void;
	className?: string;
}

export interface ContextMenuProps {
	isOpen: boolean;
	x: number;
	y: number;
	items: ContextMenuItem[];
	onClose: () => void;
}

export default function ContextMenu({ isOpen, x, y, items, onClose }: ContextMenuProps) {
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!isOpen) return;

		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				onClose();
			}
		};

		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onClose();
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("keydown", handleEscape);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleEscape);
		};
	}, [isOpen, onClose]);

	useEffect(() => {
		if (isOpen && menuRef.current) {
			const menu = menuRef.current;
			const rect = menu.getBoundingClientRect();
			const viewportWidth = window.innerWidth;
			const viewportHeight = window.innerHeight;

			// Adjust position if menu would go off-screen
			let adjustedX = x;
			let adjustedY = y;

			if (x + rect.width > viewportWidth) {
				adjustedX = viewportWidth - rect.width - 10;
			}
			if (y + rect.height > viewportHeight) {
				adjustedY = viewportHeight - rect.height - 10;
			}

			menu.style.left = `${Math.max(10, adjustedX)}px`;
			menu.style.top = `${Math.max(10, adjustedY)}px`;
		}
	}, [isOpen, x, y]);

	if (!isOpen) return null;

	return (
		<div
			ref={menuRef}
			className={styles.contextMenu}
			style={{
				left: x,
				top: y,
				minWidth: "200px",
				width: "auto",
				height: "auto",
			}}
		>
			{items.map((item, index) => {
				if (item.id === "divider") {
					return <div key={index} className={styles.contextMenuDivider} />;
				}

				const Icon = item.icon;

				return (
					<div
						key={item.id}
						className={`${styles.contextMenuItem} ${
							item.disabled ? styles.disabled : ""
						} ${item.className || ""}`}
						onClick={() => {
							if (!item.disabled && item.onClick) {
								item.onClick();
								onClose();
							}
						}}
					>
						{Icon && (
							<div className={styles.contextMenuIcon}>
								<Icon size={16} />
							</div>
						)}
						<span className={styles.contextMenuLabel}>{item.label}</span>
						{item.shortcut && (
							<span className={styles.contextMenuShortcut}>{item.shortcut}</span>
						)}
					</div>
				);
			})}
		</div>
	);
}

// Predefined context menu items for apps
export const createAppContextMenuItems = (
	appId: string,
	onNewWindow: () => void,
	onCloseAll: () => void,
	hasWindows: boolean = false
): ContextMenuItem[] => [
	{
		id: "new-window",
		label: "New Window",
		icon: Plus,
		shortcut: "⌘N",
		onClick: onNewWindow,
		className: styles.newWindow,
	},
	{
		id: "divider-1",
		label: "",
	},
	{
		id: "close-all",
		label: "Close All Windows",
		icon: X,
		shortcut: "⌘⇧W",
		disabled: !hasWindows,
		onClick: onCloseAll,
		className: styles.closeAll,
	},
];

// Predefined context menu items for desktop
export const createDesktopContextMenuItems = (
	onShowDesktop: () => void
): ContextMenuItem[] => [
	{
		id: "show-desktop",
		label: "Show Desktop",
		icon: Square,
		shortcut: "F11",
		onClick: onShowDesktop,
	},
];
