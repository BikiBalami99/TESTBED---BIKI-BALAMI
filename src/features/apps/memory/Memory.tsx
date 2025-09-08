"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Trash2, Database, RefreshCw, AlertTriangle, Search } from "lucide-react";
import styles from "./Memory.module.css";
import { useWindowDimensions } from "../../OS/Window/WindowContext";

interface StorageItem {
	key: string;
	value: string;
	size: number;
	type: "json" | "string" | "number" | "unknown";
}

export default function Memory() {
	const { width, height } = useWindowDimensions();
	const [storageItems, setStorageItems] = useState<StorageItem[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
	const [expanded, setExpanded] = useState<Set<string>>(new Set());

	const screen = useMemo(() => (width < 340 ? "xs" : width < 944 ? "sm" : "lg"), [width]);
	const heightTier = useMemo(() => (height < 400 ? "short" : "tall"), [height]);

	// Load localStorage data
	const loadStorageData = () => {
		const items: StorageItem[] = [];

		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key) {
				const value = localStorage.getItem(key) || "";
				const size = new Blob([value]).size;

				let type: StorageItem["type"] = "string";
				try {
					JSON.parse(value);
					type = "json";
				} catch {
					if (!isNaN(Number(value))) {
						type = "number";
					} else {
						type = "string";
					}
				}

				items.push({ key, value, size, type });
			}
		}

		// Sort by key name
		items.sort((a, b) => a.key.localeCompare(b.key));
		setStorageItems(items);
	};

	// Filter items based on search
	const filteredItems = useMemo(() => {
		if (!searchQuery.trim()) return storageItems;
		const query = searchQuery.toLowerCase();
		return storageItems.filter(
			(item) =>
				item.key.toLowerCase().includes(query) || item.value.toLowerCase().includes(query)
		);
	}, [storageItems, searchQuery]);

	// Calculate total storage size
	const totalSize = useMemo(() => {
		return storageItems.reduce((sum, item) => sum + item.size, 0);
	}, [storageItems]);

	// Format bytes to human readable
	const formatBytes = (bytes: number) => {
		if (bytes === 0) return "0 B";
		const k = 1024;
		const sizes = ["B", "KB", "MB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
	};

	// Delete selected items
	const deleteSelectedItems = () => {
		selectedItems.forEach((key) => {
			localStorage.removeItem(key);
		});
		setSelectedItems(new Set());
		loadStorageData();
	};

	// Delete single item
	const deleteItem = (key: string) => {
		localStorage.removeItem(key);
		loadStorageData();
	};

	// Toggle item selection
	const toggleItemSelection = (key: string) => {
		const newSelection = new Set(selectedItems);
		if (newSelection.has(key)) {
			newSelection.delete(key);
		} else {
			newSelection.add(key);
		}
		setSelectedItems(newSelection);
	};

	// Select all filtered items
	const selectAll = () => {
		const allKeys = new Set(filteredItems.map((item) => item.key));
		setSelectedItems(allKeys);
	};

	// Clear all selections
	const clearSelection = () => {
		setSelectedItems(new Set());
	};

	// Load data on component mount
	useEffect(() => {
		loadStorageData();

		const handleFocus = () => loadStorageData();
		const handleVisibility = () => {
			if (document.visibilityState === "visible") loadStorageData();
		};
		window.addEventListener("focus", handleFocus);
		document.addEventListener("visibilitychange", handleVisibility);
		window.addEventListener("storage", handleFocus);

		return () => {
			window.removeEventListener("focus", handleFocus);
			document.removeEventListener("visibilitychange", handleVisibility);
			window.removeEventListener("storage", handleFocus);
		};
	}, []);

	// Get type icon
	const getTypeIcon = (type: StorageItem["type"]) => {
		switch (type) {
			case "json":
				return "{}";
			case "number":
				return "123";
			case "string":
				return "Aa";
			default:
				return "?";
		}
	};

	const toggleExpanded = (key: string) => {
		const next = new Set(expanded);
		if (next.has(key)) next.delete(key);
		else next.add(key);
		setExpanded(next);
	};

	const getJsonSummary = (value: string) => {
		try {
			const parsed = JSON.parse(value);
			if (Array.isArray(parsed)) return `Array (${parsed.length})`;
			if (parsed && typeof parsed === "object")
				return `Object (${Object.keys(parsed).length} keys)`;
			return "JSON";
		} catch {
			return "JSON";
		}
	};

	// Lightweight JSON viewer
	function JsonViewer({ data, level = 0 }: { data: unknown; level?: number }) {
		const [open, setOpen] = useState(true);

		const isObject = data !== null && typeof data === "object" && !Array.isArray(data);
		const isArray = Array.isArray(data);

		if (isObject) {
			const obj = data as Record<string, unknown>;
			const keys = Object.keys(obj);
			return (
				<div className={styles.jsonTable}>
					<div className={styles.jsonHeader} style={{ paddingLeft: level * 12 }}>
						<button className={styles.jsonToggle} onClick={() => setOpen(!open)}>
							{open ? "▾" : "▸"}
						</button>
						<span className={styles.jsonBadge}>Object</span>
						<span className={styles.jsonMeta}>{keys.length} keys</span>
					</div>
					{open && (
						<div className={styles.jsonBody}>
							{keys.map((k) => (
								<div key={k} className={styles.jsonRow}>
									<div
										className={styles.jsonKey}
										style={{ paddingLeft: level * 12 + 16 }}
									>
										{k}
									</div>
									<div className={styles.jsonValue}>
										<JsonValue data={obj[k]} level={level + 1} />
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			);
		}

		if (isArray) {
			const arr = data as unknown[];
			return (
				<div className={styles.jsonTable}>
					<div className={styles.jsonHeader} style={{ paddingLeft: level * 12 }}>
						<button className={styles.jsonToggle} onClick={() => setOpen(!open)}>
							{open ? "▾" : "▸"}
						</button>
						<span className={styles.jsonBadge}>Array</span>
						<span className={styles.jsonMeta}>{arr.length} items</span>
					</div>
					{open && (
						<div className={styles.jsonBody}>
							{arr.map((val, idx) => (
								<div key={idx} className={styles.jsonRow}>
									<div
										className={styles.jsonKey}
										style={{ paddingLeft: level * 12 + 16 }}
									>
										[{idx}]
									</div>
									<div className={styles.jsonValue}>
										<JsonValue data={val} level={level + 1} />
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			);
		}

		// Primitive
		return <PrimitiveValue data={data} />;
	}

	function JsonValue({ data, level }: { data: unknown; level: number }) {
		const isObj = data !== null && typeof data === "object";
		if (isObj) return <JsonViewer data={data} level={level} />;
		return <PrimitiveValue data={data} />;
	}

	function PrimitiveValue({ data }: { data: unknown }) {
		if (data === null) return <span className={styles.tNull}>null</span>;
		switch (typeof data) {
			case "string":
				return <span className={styles.tString}>&quot;{String(data)}&quot;</span>;
			case "number":
				return <span className={styles.tNumber}>{String(data)}</span>;
			case "boolean":
				return <span className={styles.tBoolean}>{String(data)}</span>;
			default:
				return <span className={styles.tUnknown}>{String(data)}</span>;
		}
	}

	return (
		<div className={styles.memory} data-screen={screen} data-h={heightTier}>
			{/* Header */}
			<div className={styles.header}>
				<div className={styles.headerInfoRow}>
					<div className={styles.titleSection}>
						<Database size={20} />
						<h1 className={styles.title}>Memory</h1>
						<span className={styles.subtitle}>Browser Storage Manager</span>
					</div>
					<div className={styles.stats}>
						<span className={styles.statItem}>{storageItems.length} items</span>
						<span className={styles.statItem}>{formatBytes(totalSize)}</span>
					</div>
				</div>
				<div className={styles.controlsRow}>
					<div className={styles.searchSection}>
						<div className={styles.searchBox}>
							<Search size={16} />
							<input
								type="text"
								placeholder="Search keys or values..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className={styles.searchInput}
							/>
						</div>
					</div>
					<div className={styles.actionButtons}>
						<button
							className={styles.refreshButton}
							onClick={loadStorageData}
							title="Refresh Data"
						>
							<RefreshCw size={16} />
							<span>Refresh</span>
						</button>
						{selectedItems.size > 0 && (
							<button
								className={styles.deleteButton}
								onClick={deleteSelectedItems}
								title={`Delete ${selectedItems.size} selected items`}
							>
								<Trash2 size={16} />
								<span>Delete ({selectedItems.size})</span>
							</button>
						)}
					</div>
				</div>
			</div>

			{/* Selection Controls */}
			{filteredItems.length > 0 && (
				<div className={styles.selectionControls}>
					<button
						className={styles.selectAllButton}
						onClick={
							selectedItems.size === filteredItems.length ? clearSelection : selectAll
						}
					>
						{selectedItems.size === filteredItems.length ? "Clear All" : "Select All"}
					</button>
					<span className={styles.selectionInfo}>
						{selectedItems.size} of {filteredItems.length} selected
					</span>
				</div>
			)}

			{/* Storage Items List */}
			<div className={styles.itemsList}>
				{filteredItems.length === 0 ? (
					<div className={styles.emptyState}>
						{searchQuery ? (
							<>
								<Search size={48} />
								<p>No items match your search</p>
								<small>Try a different search term</small>
							</>
						) : (
							<>
								<Database size={48} />
								<p>No localStorage data found</p>
								<small>Data will appear here as you use the apps</small>
							</>
						)}
					</div>
				) : (
					filteredItems.map((item) => (
						<div
							key={item.key}
							className={`${styles.storageItem} ${
								selectedItems.has(item.key) ? styles.selected : ""
							}`}
						>
							<div className={styles.itemHeader}>
								<div className={styles.itemInfo}>
									<input
										type="checkbox"
										checked={selectedItems.has(item.key)}
										onChange={() => toggleItemSelection(item.key)}
										className={styles.checkbox}
									/>
									<div className={styles.typeIndicator} title={`Type: ${item.type}`}>
										{getTypeIcon(item.type)}
									</div>
									<div className={styles.keyName}>{item.key}</div>
								</div>
								<div className={styles.itemMeta}>
									<span className={styles.itemSize}>{formatBytes(item.size)}</span>
									<button
										className={styles.deleteItemButton}
										onClick={() => deleteItem(item.key)}
										title="Delete this item"
									>
										<Trash2 size={14} />
									</button>
								</div>
							</div>
							<div className={styles.itemValue}>
								{item.type === "json" ? (
									<div className={styles.valueBlock}>
										{!expanded.has(item.key) ? (
											<div className={styles.valueSummaryRow}>
												<span className={styles.valueSummary}>
													{getJsonSummary(item.value)}
												</span>
												<button
													className={styles.toggleButton}
													onClick={() => toggleExpanded(item.key)}
													title="Expand JSON"
												>
													View
												</button>
											</div>
										) : (
											<div className={styles.jsonViewerWrapper}>
												<div className={styles.valueActions}>
													<button
														className={styles.toggleButton}
														onClick={() => navigator.clipboard.writeText(item.value)}
														title="Copy raw JSON"
													>
														Copy JSON
													</button>
													<button
														className={styles.toggleButton}
														onClick={() => toggleExpanded(item.key)}
														title="Hide details"
													>
														Collapse
													</button>
												</div>
												<JsonViewer data={JSON.parse(item.value)} />
											</div>
										)}
									</div>
								) : (
									<div className={styles.valueBlock}>
										{!expanded.has(item.key) ? (
											<div className={styles.valueSummaryRow}>
												<span className={styles.valueSummary}>
													{item.value.length > 200
														? `${item.value.substring(0, 200)}...`
														: item.value}
												</span>
												{item.value.length > 200 && (
													<button
														className={styles.toggleButton}
														onClick={() => toggleExpanded(item.key)}
														title="Show more"
													>
														More
													</button>
												)}
											</div>
										) : (
											<>
												<pre className={styles.valuePreview}>{item.value}</pre>
												<div className={styles.valueActions}>
													<button
														className={styles.toggleButton}
														onClick={() => toggleExpanded(item.key)}
														title="Show less"
													>
														Less
													</button>
												</div>
											</>
										)}
									</div>
								)}
							</div>
						</div>
					))
				)}
			</div>

			{/* Warning Footer */}
			{storageItems.length > 0 && (
				<div className={styles.warningFooter}>
					<AlertTriangle size={16} />
					<span>Deleting storage data will reset app preferences and saved states</span>
				</div>
			)}
		</div>
	);
}
