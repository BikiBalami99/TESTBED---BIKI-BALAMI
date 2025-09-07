// Main Desktop component
export { default as Desktop } from "./Desktop";

// Sub-components
export { default as DesktopApps } from "./DesktopApps/DesktopApps";
export { default as Dock } from "./Dock/Dock";
export { default as MenuBar } from "./MenuBar/MenuBar";

// Hooks
export { useDragAndDrop } from "./hooks/useDragAndDrop";
export { useContextMenu } from "./hooks/useContextMenu";

// Re-export existing components
export { default as AppLauncher } from "./AppLauncher/AppLauncher";
export { default as ContextMenu } from "./ContextMenu/ContextMenu";
export { default as SystemStatus } from "./SystemStatus/SystemStatus";
export { AppIcon, DockIcon, AVAILABLE_APPS, type AppInfo } from "./AppIcons/AppIcons";
export { default as DockPreview } from "./AppIcons/DockPreview";
