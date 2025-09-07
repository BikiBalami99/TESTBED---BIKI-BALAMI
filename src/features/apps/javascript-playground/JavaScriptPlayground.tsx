"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, Square, RotateCcw } from "lucide-react";
import styles from "./JavaScriptPlayground.module.css";

export default function JavaScriptPlayground() {
	const [code, setCode] = useState(`// Welcome to JavaScript Playground!
// Write your JavaScript code here and click Run

console.log("Hello, World!");

// Try some examples:
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log("Doubled numbers:", doubled);

// Create a simple function
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log("Fibonacci(10):", fibonacci(10));`);

	const [output, setOutput] = useState<string[]>([]);
	const [isRunning, setIsRunning] = useState(false);
	const outputRef = useRef<HTMLDivElement>(null);

	// Scroll to bottom when output changes
	useEffect(() => {
		if (outputRef.current) {
			outputRef.current.scrollTop = outputRef.current.scrollHeight;
		}
	}, [output]);

	const runCode = () => {
		setIsRunning(true);
		setOutput([]);

		// Capture console.log
		const originalLog = console.log;
		const logs: string[] = [];

		console.log = (...args) => {
			logs.push(
				args
					.map((arg) =>
						typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)
					)
					.join(" ")
			);
			originalLog(...args);
		};

		try {
			// Execute the code
			eval(code);
			setOutput(logs);
		} catch (error) {
			setOutput([`Error: ${error instanceof Error ? error.message : String(error)}`]);
		} finally {
			// Restore console.log
			console.log = originalLog;
			setIsRunning(false);
		}
	};

	const clearOutput = () => {
		setOutput([]);
	};

	const resetCode = () => {
		setCode(`// Welcome to JavaScript Playground!
// Write your JavaScript code here and click Run

console.log("Hello, World!");

// Try some examples:
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log("Doubled numbers:", doubled);

// Create a simple function
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log("Fibonacci(10):", fibonacci(10));`);
		setOutput([]);
	};

	return (
		<div className={styles.playground}>
			<div className={styles.header}>
				<div className={styles.title}>JavaScript Playground</div>
				<div className={styles.controls}>
					<button className={styles.runButton} onClick={runCode} disabled={isRunning}>
						<Play size={16} />
						{isRunning ? "Running..." : "Run"}
					</button>
					<button className={styles.clearButton} onClick={clearOutput}>
						<Square size={16} />
						Clear
					</button>
					<button className={styles.resetButton} onClick={resetCode}>
						<RotateCcw size={16} />
						Reset
					</button>
				</div>
			</div>

			<div className={styles.content}>
				<div className={styles.editor}>
					<textarea
						value={code}
						onChange={(e) => setCode(e.target.value)}
						placeholder="Write your JavaScript code here..."
						className={styles.codeInput}
					/>
				</div>

				<div className={styles.output} ref={outputRef}>
					<div className={styles.outputHeader}>Output:</div>
					{output.length === 0 ? (
						<div className={styles.noOutput}>
							No output yet. Click Run to execute your code!
						</div>
					) : (
						output.map((line, index) => (
							<div key={index} className={styles.outputLine}>
								{line}
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
}
