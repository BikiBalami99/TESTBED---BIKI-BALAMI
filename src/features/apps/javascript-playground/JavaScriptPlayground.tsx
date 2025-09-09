"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
	Play,
	RotateCcw,
	Trash2,
	Copy,
	Download,
	Upload,
	Clock,
	AlertCircle,
	CheckCircle,
	Info,
	Square,
	ChevronRight,
} from "lucide-react";
import styles from "./JavaScriptPlayground.module.css";
import { useWindowDimensions } from "../../OS/Window/WindowContext";

interface OutputEntry {
	id: string;
	type: "log" | "error" | "warn" | "info";
	message: string;
	timestamp: Date;
}

interface Tab {
	id: string;
	name: string;
	code: string;
	output: OutputEntry[];
	executionTime: number;
	isRunning: boolean;
}

const defaultCode = `const msg = "Hello, JavaScript Playground";
console.log(msg);
const add = (a, b) => a + b;
console.log(add(2, 3));`;

export default function JavaScriptPlayground() {
	const { width, height } = useWindowDimensions();

	// Map dimensions to semantic screen sizes (snap at 944px, ultra-compact at 340px)
	const screen = width < 340 ? "xs" : width < 944 ? "sm" : "lg";
	const heightTier = height < 400 ? "short" : "tall";

	const [tabs, setTabs] = useState<Tab[]>([
		{
			id: "tab-1",
			name: "Tab 1",
			code: defaultCode,
			output: [],
			executionTime: 0,
			isRunning: false,
		},
	]);
	const [activeTabId, setActiveTabId] = useState<string>("tab-1");
	const [leftPanelWidth, setLeftPanelWidth] = useState<number>(50); // percentage
	const [isDragging, setIsDragging] = useState(false);
	const [isCollapsed, setIsCollapsed] = useState(false);

	// Dynamic responsive thresholds (snap at 944px)
	const getResponsiveThresholds = useCallback(() => {
		if (!containerRef.current)
			return { minWidth: 20, maxWidth: 95, collapseThreshold: 85 };

		const containerWidth = containerRef.current.offsetWidth;

		if (containerWidth < 944) {
			// Small screens behavior
			return { minWidth: 15, maxWidth: 98, collapseThreshold: 90 };
		}

		// Large screens behavior
		return { minWidth: 20, maxWidth: 95, collapseThreshold: 85 };
	}, []);
	const outputRef = useRef<HTMLDivElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	// Get current active tab
	const activeTab = tabs.find((tab) => tab.id === activeTabId) || tabs[0];
	const { code, output, executionTime, isRunning } = activeTab;

	// Scroll to bottom when output changes
	useEffect(() => {
		if (outputRef.current) {
			outputRef.current.scrollTop = outputRef.current.scrollHeight;
		}
	}, [output]);

	// Handle textarea changes
	const handleCodeChange = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			const newCode = e.target.value;
			setTabs((prevTabs) =>
				prevTabs.map((tab) => (tab.id === activeTabId ? { ...tab, code: newCode } : tab))
			);
		},
		[activeTabId]
	);

	const addOutputEntry = useCallback(
		(type: OutputEntry["type"], message: string) => {
			const entry: OutputEntry = {
				id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
				type,
				message,
				timestamp: new Date(),
			};
			setTabs((prevTabs) =>
				prevTabs.map((tab) =>
					tab.id === activeTabId ? { ...tab, output: [...tab.output, entry] } : tab
				)
			);
		},
		[activeTabId]
	);

	const runCode = async () => {
		// Update running state and clear output for active tab
		setTabs((prevTabs) =>
			prevTabs.map((tab) =>
				tab.id === activeTabId ? { ...tab, isRunning: true, output: [] } : tab
			)
		);
		const startTime = performance.now();

		// Store original console methods
		const originalLog = console.log;
		const originalError = console.error;
		const originalWarn = console.warn;
		const originalInfo = console.info;

		// Override console methods
		console.log = (...args) => {
			const message = args
				.map((arg) =>
					typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)
				)
				.join(" ");
			addOutputEntry("log", message);
			originalLog(...args);
		};

		console.error = (...args) => {
			const message = args
				.map((arg) =>
					typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)
				)
				.join(" ");
			addOutputEntry("error", message);
			originalError(...args);
		};

		console.warn = (...args) => {
			const message = args
				.map((arg) =>
					typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)
				)
				.join(" ");
			addOutputEntry("warn", message);
			originalWarn(...args);
		};

		console.info = (...args) => {
			const message = args
				.map((arg) =>
					typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)
				)
				.join(" ");
			addOutputEntry("info", message);
			originalInfo(...args);
		};

		try {
			// Create async function wrapper for better error handling
			const asyncCode = `
				(async () => {
					${code}
				})()
			`;

			await eval(asyncCode);

			const endTime = performance.now();
			const executionTime = endTime - startTime;
			setTabs((prevTabs) =>
				prevTabs.map((tab) =>
					tab.id === activeTabId ? { ...tab, executionTime, isRunning: false } : tab
				)
			);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			addOutputEntry("error", `⚠ SYSTEM ERROR: ${errorMessage}`);

			// Add stack trace if available
			if (error instanceof Error && error.stack) {
				addOutputEntry("error", `⚡ TRACE LOG:\n${error.stack}`);
			}
		} finally {
			// Restore original console methods
			console.log = originalLog;
			console.error = originalError;
			console.warn = originalWarn;
			console.info = originalInfo;
			setTabs((prevTabs) =>
				prevTabs.map((tab) =>
					tab.id === activeTabId ? { ...tab, isRunning: false } : tab
				)
			);
		}
	};

	const clearOutput = () => {
		setTabs((prevTabs) =>
			prevTabs.map((tab) =>
				tab.id === activeTabId ? { ...tab, output: [], executionTime: 0 } : tab
			)
		);
		addOutputEntry("info", "Output cleared");
	};

	const clearCode = () => {
		setTabs((prevTabs) =>
			prevTabs.map((tab) => (tab.id === activeTabId ? { ...tab, code: "" } : tab))
		);
		addOutputEntry("info", "Code cleared");
	};

	const resetTab = () => {
		setTabs((prevTabs) =>
			prevTabs.map((tab) =>
				tab.id === activeTabId
					? { ...tab, code: defaultCode, output: [], executionTime: 0 }
					: tab
			)
		);
		addOutputEntry("info", "Tab reset to default");
	};

	const copyCode = () => {
		navigator.clipboard.writeText(code);
		addOutputEntry("info", "Code copied to clipboard");
	};

	const downloadCode = () => {
		const blob = new Blob([code], { type: "text/javascript" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "playground.js";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		addOutputEntry("info", "Downloaded: playground.js");
	};

	const uploadCode = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				const content = e.target?.result as string;
				setTabs((prevTabs) =>
					prevTabs.map((tab) =>
						tab.id === activeTabId ? { ...tab, code: content } : tab
					)
				);
				addOutputEntry("info", `Uploaded: ${file.name}`);
			};
			reader.readAsText(file);
		}
	};

	// Tab management functions
	const createNewTab = () => {
		const newTabId = `tab-${Date.now()}`;
		const newTab: Tab = {
			id: newTabId,
			name: `Tab ${tabs.length + 1}`,
			code: "",
			output: [],
			executionTime: 0,
			isRunning: false,
		};
		setTabs((prevTabs) => [...prevTabs, newTab]);
		setActiveTabId(newTabId);
		addOutputEntry("info", "New tab created");
	};

	const closeTab = (tabId: string) => {
		if (tabs.length <= 1) return; // Don't close the last tab

		setTabs((prevTabs) => {
			const newTabs = prevTabs.filter((tab) => tab.id !== tabId);
			// If closing active tab, switch to the first remaining tab
			if (tabId === activeTabId) {
				setActiveTabId(newTabs[0].id);
			}
			return newTabs;
		});
		addOutputEntry("info", "Tab closed");
	};

	const switchTab = (tabId: string) => {
		setActiveTabId(tabId);
	};

	const _renameTab = (tabId: string, newName: string) => {
		setTabs((prevTabs) =>
			prevTabs.map((tab) => (tab.id === tabId ? { ...tab, name: newName } : tab))
		);
	};

	const formatTime = (ms: number) => {
		if (ms < 1) return `${(ms * 1000).toFixed(0)}μs`;
		if (ms < 1000) return `${ms.toFixed(2)}ms`;
		return `${(ms / 1000).toFixed(2)}s`;
	};

	const getOutputIcon = (type: OutputEntry["type"]) => {
		switch (type) {
			case "error":
				return <AlertCircle size={16} />;
			case "warn":
				return <AlertCircle size={16} />;
			case "info":
				return <Info size={16} />;
			default:
				return <CheckCircle size={16} />;
		}
	};

	// Toggle collapse with intelligent behavior
	const toggleCollapse = useCallback(() => {
		const thresholds = getResponsiveThresholds();

		if (isCollapsed) {
			// Expand to a reasonable size
			const targetWidth = Math.min(50, thresholds.maxWidth - 10);
			setLeftPanelWidth(targetWidth);
			setIsCollapsed(false);
		} else {
			// Collapse to maximum width (hide output)
			setLeftPanelWidth(thresholds.maxWidth);
			setIsCollapsed(true);
		}
	}, [isCollapsed, getResponsiveThresholds]);

	// Handle resizer drag with intelligent collapse detection
	const handleMouseDown = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			setIsDragging(true);

			// If collapsed, start expanding immediately
			if (isCollapsed) {
				setIsCollapsed(false);
			}
		},
		[isCollapsed]
	);

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (!isDragging || !containerRef.current) return;

			const containerRect = containerRef.current.getBoundingClientRect();

			if (screen === "sm" || screen === "xs") {
				// Vertical resizing for mobile (top/bottom layout)
				const newTopHeight =
					((e.clientY - containerRect.top) / containerRect.height) * 100;
				const constrainedHeight = Math.max(20, Math.min(80, newTopHeight)); // 20-80% range
				setLeftPanelWidth(constrainedHeight); // Reuse leftPanelWidth state for height on mobile
			} else {
				// Horizontal resizing for desktop (left/right layout)
				const newLeftWidth =
					((e.clientX - containerRect.left) / containerRect.width) * 100;
				const thresholds = getResponsiveThresholds();

				// Constrain to responsive thresholds
				const constrainedWidth = Math.max(
					thresholds.minWidth,
					Math.min(thresholds.maxWidth, newLeftWidth)
				);

				// Auto-collapse detection: if dragging near max width, collapse
				if (constrainedWidth >= thresholds.collapseThreshold) {
					setLeftPanelWidth(thresholds.maxWidth);
					setIsCollapsed(true);
				} else {
					setLeftPanelWidth(constrainedWidth);
					setIsCollapsed(false);
				}
			}
		},
		[isDragging, getResponsiveThresholds, screen]
	);

	const handleMouseUp = useCallback(() => {
		setIsDragging(false);
	}, []);

	// Add global mouse event listeners
	useEffect(() => {
		if (isDragging) {
			document.addEventListener("mousemove", handleMouseMove);
			document.addEventListener("mouseup", handleMouseUp);
			document.body.style.cursor =
				screen === "sm" || screen === "xs" ? "row-resize" : "col-resize";
			document.body.style.userSelect = "none";

			return () => {
				document.removeEventListener("mousemove", handleMouseMove);
				document.removeEventListener("mouseup", handleMouseUp);
				document.body.style.cursor = "";
				document.body.style.userSelect = "";
			};
		}
	}, [isDragging, handleMouseMove, handleMouseUp, screen]);

	// Initialize panel size based on screen mode
	useEffect(() => {
		if (screen === "sm" || screen === "xs") {
			// Mobile: use height percentage (70% for editor)
			setLeftPanelWidth(70);
		} else {
			// Desktop: use width percentage (default 50%)
			setLeftPanelWidth(50);
		}
		setIsCollapsed(false); // Reset collapse state when switching modes
	}, [screen]);

	// Simple textarea ref
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	return (
		<div className={styles.playground} data-screen={screen} data-h={heightTier}>
			{/* Tab Bar */}
			<div className={styles.tabBar}>
				<div className={styles.tabs}>
					{tabs.map((tab) => (
						<div
							key={tab.id}
							className={`${styles.tab} ${
								tab.id === activeTabId ? styles.activeTab : ""
							}`}
							onClick={() => switchTab(tab.id)}
						>
							<span className={styles.tabName}>{tab.name}</span>
							{tabs.length > 1 && (
								<button
									className={styles.closeTabButton}
									onClick={(e) => {
										e.stopPropagation();
										closeTab(tab.id);
									}}
									title="Close Tab"
								>
									×
								</button>
							)}
						</div>
					))}
				</div>
				<button className={styles.newTabButton} onClick={createNewTab} title="New Tab">
					+
				</button>
			</div>

			{/* Header */}
			<div className={styles.header}>
				<div className={styles.titleSection}>
					<h1 className={styles.title}>JavaScript Playground</h1>
					{executionTime > 0 && (
						<div className={styles.executionTime}>
							<Clock size={12} />
							Time: {formatTime(executionTime)}
						</div>
					)}
				</div>

				<div className={styles.controls}>
					<button
						className={`${styles.primaryButton} ${styles.runButton}`}
						onClick={runCode}
						disabled={isRunning}
					>
						<Play size={16} />
						{isRunning ? "Running..." : "Run"}
					</button>

					<div className={styles.buttonGroup}>
						<button
							className={styles.secondaryButton}
							onClick={copyCode}
							title="Copy Code"
						>
							<Copy size={14} />
						</button>
						<button
							className={styles.secondaryButton}
							onClick={downloadCode}
							title="Download Code"
						>
							<Download size={14} />
						</button>
						<label className={styles.secondaryButton} title="Upload Code">
							<Upload size={14} />
							<input
								type="file"
								accept=".js,.ts,.jsx,.tsx"
								onChange={uploadCode}
								style={{ display: "none" }}
							/>
						</label>
					</div>
				</div>
			</div>

			{/* Main content area - resizable panels */}
			<div className={styles.content} data-screen={screen} ref={containerRef}>
				{/* Left panel - Code editor */}
				<div
					className={`${styles.leftPanel} ${isCollapsed ? styles.expanded : ""}`}
					data-screen={screen}
					style={
						screen === "sm" || screen === "xs"
							? {
									height: `${leftPanelWidth}%`,
									transition: isDragging ? "none" : "height 0.2s ease-out",
							  }
							: {
									width: `${leftPanelWidth}%`,
									transition: isDragging ? "none" : "width 0.2s ease-out",
							  }
					}
				>
					<div className={styles.editorHeader}>
						<h3 className={styles.sectionTitle}>Editor</h3>
						<div className={styles.editorControls}>
							<div className={styles.editorInfo}>
								<span className={styles.lineCount}>{code.split("\n").length} LN</span>
								<span className={styles.charCount}>{code.length} CH</span>
							</div>
							<button
								className={styles.clearCodeButton}
								onClick={clearCode}
								disabled={code.length === 0}
								title="Clear Code"
							>
								<Trash2 size={12} />
								CLEAR CODE
							</button>
						</div>
					</div>
					<div className={styles.editor}>
						<textarea
							ref={textareaRef}
							value={code}
							onChange={handleCodeChange}
							className={styles.codeEditor}
							spellCheck={false}
							autoComplete="off"
							autoCorrect="off"
							autoCapitalize="off"
							data-gramm="false"
							placeholder="// Start typing JavaScript..."
						/>
					</div>
				</div>

				{/* Resizer handle - always show, but make it edge-accessible when collapsed */}
				<div
					className={`${styles.resizer} ${isCollapsed ? styles.edgeResizer : ""}`}
					data-screen={screen}
					onMouseDown={handleMouseDown}
					style={{
						cursor:
							screen === "sm" || screen === "xs"
								? isDragging
									? "row-resize"
									: "row-resize"
								: isDragging
								? "col-resize"
								: "col-resize",
						opacity: isCollapsed ? 0.3 : 1,
						transition: isDragging ? "none" : "opacity 0.2s ease-out",
					}}
					title={isCollapsed ? "Drag to expand output panel" : "Resize panels"}
				/>

				{/* Right panel - Output or Collapsed Panel */}
				{isCollapsed ? (
					<div className={styles.collapsedPanel}>
						<button
							className={styles.showOutputButton}
							onClick={toggleCollapse}
							title="Show Output (or drag the resize handle)"
						>
							<ChevronRight size={16} />
						</button>
						<div className={styles.collapsedHint}>
							<span>Output hidden - click button or drag edge to expand</span>
						</div>
					</div>
				) : (
					<div
						className={styles.rightPanel}
						data-screen={screen}
						style={
							screen === "sm" || screen === "xs"
								? {
										height: `${100 - leftPanelWidth}%`,
										transition: isDragging ? "none" : "height 0.2s ease-out",
								  }
								: {
										width: `${100 - leftPanelWidth}%`,
										transition: isDragging ? "none" : "width 0.2s ease-out",
								  }
						}
					>
						<div className={styles.outputHeader}>
							<h3 className={styles.sectionTitle}>Output</h3>
							<div className={styles.outputControls}>
								<button
									className={styles.clearOutputButton}
									onClick={clearOutput}
									disabled={output.length === 0}
									title="Clear Output"
								>
									<Trash2 size={14} />
									CLEAR OUTPUT
								</button>
								<button
									className={styles.resetTabButton}
									onClick={resetTab}
									title="Reset Tab to Default"
								>
									<RotateCcw size={14} />
									RESET TAB
								</button>
								<button className={styles.collapseButton} onClick={toggleCollapse}>
									<Square size={14} />
									HIDE
								</button>
							</div>
						</div>

						<div className={styles.output} ref={outputRef}>
							{output.length === 0 ? (
								<div className={styles.noOutput}>
									<div className={styles.noOutputIcon}></div>
									<p>No output yet. Click &quot;Run&quot; to execute.</p>
									<small>Logs and errors will appear here.</small>
								</div>
							) : (
								<div className={styles.outputContent}>
									{output.map((entry) => (
										<div
											key={entry.id}
											className={`${styles.outputEntry} ${styles[entry.type]}`}
										>
											<div className={styles.outputEntryHeader}>
												{getOutputIcon(entry.type)}
												<span className={styles.outputType}>
													{entry.type.toUpperCase()}
												</span>
												<span className={styles.outputTime}>
													{entry.timestamp.toLocaleTimeString()}
												</span>
											</div>
											<div className={styles.outputMessage}>{entry.message}</div>
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
