// Main Desktop component
export { default as Desktop } from "./Desktop";

// Sub-components
export { default as DesktopApps } from "./DesktopApps/DesktopApps";
export { default as Dock } from "./Dock/Dock";
export { default as DockItem } from "./Dock/DockItem/DockItem";
export { default as MenuBar } from "./MenuBar/MenuBar";

// Hooks
export { useDragAndDrop } from "./hooks/useDragAndDrop";
export { useContextMenu } from "./hooks/useContextMenu";

// Re-export existing components
// AppLauncher is now a regular app in the apps folder
export { default as ContextMenu } from "./ContextMenu/ContextMenu";
export { default as SystemStatus } from "./MenuBar/SystemStatus/SystemStatus";
export { AppIcon, AVAILABLE_APPS, type AppInfo } from "./AppIcons/AppIcons";
export { default as DockPreview } from "./AppIcons/DockPreview";
