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
	const [code, setCode] = useState(`// 🚀 Ultimate JavaScript Playground
// Write your JavaScript code here and click Run

console.log("Hello, World! 👋");

// Try some modern JavaScript features:
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log("Doubled numbers:", doubled);

// Async/await example
async function fetchData() {
  return new Promise(resolve => {
    setTimeout(() => resolve("Data fetched! 🎉"), 1000);
  });
}

// ES6+ features
const fibonacci = (n) => {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
};

console.log("Fibonacci(10):", fibonacci(10));

// Try running: await fetchData()`);

	const [output, setOutput] = useState<OutputEntry[]>([]);
	const [isRunning, setIsRunning] = useState(false);
	const [executionTime, setExecutionTime] = useState<number>(0);
	const [isOutputCollapsed, setIsOutputCollapsed] = useState(false);
	const outputRef = useRef<HTMLDivElement>(null);

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
			addOutputEntry("error", `❌ ${errorMessage}`);

			// Add stack trace if available
			if (error instanceof Error && error.stack) {
				addOutputEntry("error", `📍 Stack trace:\n${error.stack}`);
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

	const resetCode = () => {
		setCode(`// 🚀 Ultimate JavaScript Playground
// Write your JavaScript code here and click Run

console.log("Hello, World! 👋");

// Try some modern JavaScript features:
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log("Doubled numbers:", doubled);

// Async/await example
async function fetchData() {
  return new Promise(resolve => {
    setTimeout(() => resolve("Data fetched! 🎉"), 1000);
  });
}

// ES6+ features
const fibonacci = (n) => {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
};

console.log("Fibonacci(10):", fibonacci(10));

// Try running: await fetchData()`);
		setOutput([]);
		setExecutionTime(0);
	};

	const copyCode = () => {
		navigator.clipboard.writeText(code);
		addOutputEntry("info", "📋 Code copied to clipboard!");
	};

	const downloadCode = () => {
		const blob = new Blob([code], { type: "text/javascript" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "playground-code.js";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		addOutputEntry("info", "💾 Code downloaded as playground-code.js");
	};

	const uploadCode = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				const content = e.target?.result as string;
				setCode(content);
				addOutputEntry("info", `📁 Loaded code from ${file.name}`);
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

	// Simple textarea ref
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	return (
		<div className={styles.playground}>
			{/* Header with modern controls */}
			<div className={styles.header}>
				<div className={styles.titleSection}>
					<h1 className={styles.title}>🚀 Ultimate JavaScript Playground</h1>
					{executionTime > 0 && (
						<div className={styles.executionTime}>
							<Clock size={14} />
							{formatTime(executionTime)}
						</div>
					)}
				</div>

				<div className={styles.controls}>
					<button
						className={`${styles.primaryButton} ${styles.runButton}`}
						onClick={runCode}
						disabled={isRunning}
					>
						<Play size={18} />
						{isRunning ? "Running..." : "Run Code"}
					</button>

					<div className={styles.buttonGroup}>
						<button
							className={styles.secondaryButton}
							onClick={copyCode}
							title="Copy Code"
						>
							<Copy size={16} />
						</button>
						<button
							className={styles.secondaryButton}
							onClick={downloadCode}
							title="Download Code"
						>
							<Download size={16} />
						</button>
						<label className={styles.secondaryButton} title="Upload Code">
							<Upload size={16} />
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
							title="Reset to Default"
						>
							<RotateCcw size={16} />
						</button>
					</div>
				</div>
			</div>

			{/* Main content area - simple side-by-side layout */}
			<div className={styles.content}>
				{/* Left panel - Code editor */}
				<div className={styles.leftPanel}>
					<div className={styles.editorHeader}>
						<h3 className={styles.sectionTitle}>Code Editor</h3>
						<div className={styles.editorInfo}>
							<span className={styles.lineCount}>{code.split("\n").length} lines</span>
							<span className={styles.charCount}>{code.length} characters</span>
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
							placeholder="// Write your JavaScript code here..."
						/>
					</div>
				</div>

				{/* Right panel - Output */}
				{!isOutputCollapsed && (
					<div className={styles.rightPanel}>
						<div className={styles.outputHeader}>
							<h3 className={styles.sectionTitle}>Output</h3>
							<div className={styles.outputControls}>
								<button
									className={styles.clearButton}
									onClick={clearOutput}
									disabled={output.length === 0}
								>
									<Trash2 size={16} />
									Clear Output
								</button>
								<button className={styles.collapseButton} onClick={toggleOutputCollapse}>
									<Square size={16} />
									Hide
								</button>
							</div>
						</div>

						<div className={styles.output} ref={outputRef}>
							{output.length === 0 ? (
								<div className={styles.noOutput}>
									<div className={styles.noOutputIcon}>💻</div>
									<p>
										No output yet. Click &quot;Run Code&quot; to execute your JavaScript!
									</p>
									<small>Try the example code or write your own.</small>
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
							<Square size={16} />
							Show Output
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
