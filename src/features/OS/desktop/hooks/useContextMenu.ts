"use client";

import { useState, useCallback } from "react";
import { AVAILABLE_APPS, AppInfo } from "../AppIcons/AppIcons";
import {
	createAppContextMenuItems,
	createDesktopContextMenuItems,
	ContextMenuItem,
} from "../ContextMenu/ContextMenu";

interface ContextMenuState {
	isOpen: boolean;
	x: number;
	y: number;
	appId?: string;
	type: "desktop" | "dock" | "app";
}

interface UseContextMenuProps {
	onNewWindow: (appId: string) => void;
	onCloseAllWindows: (appId: string) => void;
	onShowDesktop: () => void;
	getAllWindowsForApp: (appId: string) => any[];
}

export function useContextMenu({
	onNewWindow,
	onCloseAllWindows,
	onShowDesktop,
	getAllWindowsForApp,
}: UseContextMenuProps) {
	const [contextMenu, setContextMenu] = useState<ContextMenuState>({
		isOpen: false,
		x: 0,
		y: 0,
		type: "desktop",
	});

	const handleContextMenu = useCallback(
		(
			e: React.MouseEvent,
			appId?: string,
			type: "desktop" | "dock" | "app" = "desktop"
		) => {
			e.preventDefault();
			setContextMenu({
				isOpen: true,
				x: e.clientX,
				y: e.clientY,
				appId,
				type,
			});
		},
		[]
	);

	const closeContextMenu = useCallback(() => {
		setContextMenu((prev) => ({ ...prev, isOpen: false }));
	}, []);

	const getContextMenuItems = useCallback((): ContextMenuItem[] => {
		if (contextMenu.type === "app" && contextMenu.appId) {
			return createAppContextMenuItems(
				contextMenu.appId,
				() => onNewWindow(contextMenu.appId!),
				() => onCloseAllWindows(contextMenu.appId!),
				getAllWindowsForApp(contextMenu.appId).length > 0
			);
		} else if (contextMenu.type === "dock" && contextMenu.appId) {
			return createAppContextMenuItems(
				contextMenu.appId,
				() => onNewWindow(contextMenu.appId!),
				() => onCloseAllWindows(contextMenu.appId!),
				getAllWindowsForApp(contextMenu.appId).length > 0
			);
		} else {
			return createDesktopContextMenuItems(onShowDesktop);
		}
	}, [contextMenu, onNewWindow, onCloseAllWindows, onShowDesktop, getAllWindowsForApp]);

	return {
		contextMenu,
		handleContextMenu,
		closeContextMenu,
		getContextMenuItems,
	};
}
