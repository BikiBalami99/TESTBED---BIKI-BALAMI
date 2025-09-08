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
} from "lucide-react";
import styles from "./JavaScriptPlayground.module.css";

interface OutputEntry {
	id: string;
	type: "log" | "error" | "warn" | "info";
	message: string;
	timestamp: Date;
}

export default function JavaScriptPlayground() {
	const [code, setCode] = useState(`// ⚡ MATRIX HACKER TERMINAL ⚡
// EXECUTE YOUR CODE IN THE MATRIX

console.log("SYSTEM ONLINE... ACCESS GRANTED");

// HACK THE MATRIX WITH MODERN JS:
const dataStream = [1, 0, 1, 0, 1];
const encrypted = dataStream.map(bit => bit ^ 1);
console.log("ENCRYPTED DATA:", encrypted);

// ASYNC BREACH PROTOCOL
async function infiltrateSystem() {
  return new Promise(resolve => {
    setTimeout(() => resolve("FIREWALL BREACHED ⚡"), 1000);
  });
}

// RECURSIVE ALGORITHM
const hackSequence = (depth) => {
  if (depth <= 1) return depth;
  return hackSequence(depth - 1) + hackSequence(depth - 2);
};

console.log("HACK_SEQUENCE(10):", hackSequence(10));

// EXECUTE: await infiltrateSystem()`);

	const [output, setOutput] = useState<OutputEntry[]>([]);
	const [isRunning, setIsRunning] = useState(false);
	const [executionTime, setExecutionTime] = useState<number>(0);
	const [isOutputCollapsed, setIsOutputCollapsed] = useState(false);
	const [leftPanelWidth, setLeftPanelWidth] = useState<number>(50); // percentage
	const [isDragging, setIsDragging] = useState(false);
	const outputRef = useRef<HTMLDivElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	// Scroll to bottom when output changes
	useEffect(() => {
		if (outputRef.current) {
			outputRef.current.scrollTop = outputRef.current.scrollHeight;
		}
	}, [output]);

	// Handle textarea changes
	const handleCodeChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setCode(e.target.value);
	}, []);

	const addOutputEntry = useCallback((type: OutputEntry["type"], message: string) => {
		const entry: OutputEntry = {
			id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
			type,
			message,
			timestamp: new Date(),
		};
		setOutput((prev) => [...prev, entry]);
	}, []);

	const runCode = async () => {
		setIsRunning(true);
		setOutput([]);
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
			setExecutionTime(endTime - startTime);
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
			setIsRunning(false);
		}
	};

	const clearOutput = () => {
		setOutput([]);
		setExecutionTime(0);
	};

	const clearCode = () => {
		setCode("");
		addOutputEntry("info", "⚡ CODE CLEARED");
	};

	const resetCode = () => {
		setCode(`// ⚡ MATRIX HACKER TERMINAL ⚡
// EXECUTE YOUR CODE IN THE MATRIX

console.log("SYSTEM ONLINE... ACCESS GRANTED");

// HACK THE MATRIX WITH MODERN JS:
const dataStream = [1, 0, 1, 0, 1];
const encrypted = dataStream.map(bit => bit ^ 1);
console.log("ENCRYPTED DATA:", encrypted);

// ASYNC BREACH PROTOCOL
async function infiltrateSystem() {
  return new Promise(resolve => {
    setTimeout(() => resolve("FIREWALL BREACHED ⚡"), 1000);
  });
}

// RECURSIVE ALGORITHM
const hackSequence = (depth) => {
  if (depth <= 1) return depth;
  return hackSequence(depth - 1) + hackSequence(depth - 2);
};

console.log("HACK_SEQUENCE(10):", hackSequence(10));

// EXECUTE: await infiltrateSystem()`);
		setOutput([]);
		setExecutionTime(0);
	};

	const copyCode = () => {
		navigator.clipboard.writeText(code);
		addOutputEntry("info", "⚡ CODE COPIED TO BUFFER");
	};

	const downloadCode = () => {
		const blob = new Blob([code], { type: "text/javascript" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "matrix-hack.js";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		addOutputEntry("info", "⚡ HACK DOWNLOADED: matrix-hack.js");
	};

	const uploadCode = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				const content = e.target?.result as string;
				setCode(content);
				addOutputEntry("info", `⚡ UPLOADED HACK: ${file.name}`);
			};
			reader.readAsText(file);
		}
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

	// Toggle output panel collapse
	const toggleOutputCollapse = useCallback(() => {
		setIsOutputCollapsed((prev) => !prev);
	}, []);

	// Handle resizer drag
	const handleMouseDown = useCallback((e: React.MouseEvent) => {
		e.preventDefault();
		setIsDragging(true);
	}, []);

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (!isDragging || !containerRef.current) return;

			const containerRect = containerRef.current.getBoundingClientRect();
			const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

			// Constrain between 20% and 80%
			const clampedWidth = Math.min(Math.max(newLeftWidth, 20), 80);
			setLeftPanelWidth(clampedWidth);
		},
		[isDragging]
	);

	const handleMouseUp = useCallback(() => {
		setIsDragging(false);
	}, []);

	// Add global mouse event listeners
	useEffect(() => {
		if (isDragging) {
			document.addEventListener("mousemove", handleMouseMove);
			document.addEventListener("mouseup", handleMouseUp);
			document.body.style.cursor = "col-resize";
			document.body.style.userSelect = "none";

			return () => {
				document.removeEventListener("mousemove", handleMouseMove);
				document.removeEventListener("mouseup", handleMouseUp);
				document.body.style.cursor = "";
				document.body.style.userSelect = "";
			};
		}
	}, [isDragging, handleMouseMove, handleMouseUp]);

	// Simple textarea ref
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	return (
		<div className={styles.playground}>
			{/* Header with hacker controls */}
			<div className={styles.header}>
				<div className={styles.titleSection}>
					<h1 className={styles.title}>MATRIX HACKER TERMINAL</h1>
					{executionTime > 0 && (
						<div className={styles.executionTime}>
							<Clock size={12} />
							EXEC: {formatTime(executionTime)}
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
						{isRunning ? "EXECUTING..." : "EXECUTE"}
					</button>

					<div className={styles.buttonGroup}>
						<button
							className={styles.secondaryButton}
							onClick={copyCode}
							title="Copy Hack"
						>
							<Copy size={14} />
						</button>
						<button
							className={styles.secondaryButton}
							onClick={downloadCode}
							title="Download Hack"
						>
							<Download size={14} />
						</button>
						<label className={styles.secondaryButton} title="Upload Hack">
							<Upload size={14} />
							<input
								type="file"
								accept=".js,.ts,.jsx,.tsx"
								onChange={uploadCode}
								style={{ display: "none" }}
							/>
						</label>
						<button
							className={styles.secondaryButton}
							onClick={resetCode}
							title="Reset Terminal"
						>
							<RotateCcw size={14} />
						</button>
					</div>
				</div>
			</div>

			{/* Main content area - resizable panels */}
			<div className={styles.content} ref={containerRef}>
				{/* Left panel - Code editor */}
				<div className={styles.leftPanel} style={{ width: `${leftPanelWidth}%` }}>
					<div className={styles.editorHeader}>
						<h3 className={styles.sectionTitle}>HACK EDITOR</h3>
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
								CLEAR
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
							placeholder="// ENTER YOUR HACK CODE HERE..."
						/>
					</div>
				</div>

				{/* Resizer handle */}
				{!isOutputCollapsed && (
					<div
						className={styles.resizer}
						onMouseDown={handleMouseDown}
						style={{ cursor: isDragging ? "col-resize" : "col-resize" }}
					/>
				)}

				{/* Right panel - Output */}
				{!isOutputCollapsed && (
					<div
						className={styles.rightPanel}
						style={{ width: `${100 - leftPanelWidth}%` }}
					>
						<div className={styles.outputHeader}>
							<h3 className={styles.sectionTitle}>SYSTEM OUTPUT</h3>
							<div className={styles.outputControls}>
								<button
									className={styles.clearButton}
									onClick={clearOutput}
									disabled={output.length === 0}
								>
									<Trash2 size={14} />
									PURGE
								</button>
								<button className={styles.collapseButton} onClick={toggleOutputCollapse}>
									<Square size={14} />
									HIDE
								</button>
							</div>
						</div>

						<div className={styles.output} ref={outputRef}>
							{output.length === 0 ? (
								<div className={styles.noOutput}>
									<div className={styles.noOutputIcon}>⚡</div>
									<p>SYSTEM READY. CLICK &quot;EXECUTE&quot; TO RUN YOUR HACK!</p>
									<small>MATRIX AWAITS YOUR CODE...</small>
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

				{/* Show output button when collapsed */}
				{isOutputCollapsed && (
					<div className={styles.collapsedPanel}>
						<button className={styles.showOutputButton} onClick={toggleOutputCollapse}>
							<Square size={14} />
							SHOW OUTPUT
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
