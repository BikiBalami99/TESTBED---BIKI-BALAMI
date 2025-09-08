"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Search, Plus, Trash2, FileText, Calendar, ArrowLeft, Pin } from "lucide-react";
import styles from "./Notes.module.css";
import { useWindowDimensions } from "../../OS/Window/WindowContext";

interface Note {
	id: string;
	title: string;
	content: string;
	createdAt: Date;
	updatedAt: Date;
	isPinned: boolean;
}

export default function Notes() {
	const { width, height } = useWindowDimensions();

	// Follow the convention from other apps
	const screen = useMemo(() => (width < 340 ? "xs" : width < 944 ? "sm" : "lg"), [width]);
	const heightTier = useMemo(() => (height < 400 ? "short" : "tall"), [height]);
	const [notes, setNotes] = useState<Note[]>([
		{
			id: "1",
			title: "Welcome to Notes",
			content:
				"This is your personal note-taking app. Start writing your thoughts here!\n\nYou can create new notes, search through them, and organize your thoughts. Notes are automatically saved as you type.",
			createdAt: new Date(),
			updatedAt: new Date(),
			isPinned: false,
		},
	]);
	const [selectedNote, setSelectedNote] = useState<string | null>("1");
	const [searchQuery, setSearchQuery] = useState("");
	const [isCreatingNote, setIsCreatingNote] = useState(false);
	const [mobileView, setMobileView] = useState<"list" | "detail">("list"); // iOS-style navigation

	// Sorting state
	type SortKey = "updatedAt" | "createdAt" | "title";
	type SortDir = "asc" | "desc";
	const [sortKey, setSortKey] = useState<SortKey>("updatedAt");
	const [sortDir, setSortDir] = useState<SortDir>("desc");

	// Filter notes based on search query
	const filteredNotes = useMemo(() => {
		if (!searchQuery.trim()) return notes;
		const query = searchQuery.toLowerCase();
		return notes.filter(
			(note) =>
				note.title.toLowerCase().includes(query) ||
				note.content.toLowerCase().includes(query)
		);
	}, [notes, searchQuery]);

	const createNewNote = () => {
		const newNote: Note = {
			id: Date.now().toString(),
			title: "",
			content: "",
			createdAt: new Date(),
			updatedAt: new Date(),
			isPinned: false,
		};
		setNotes((prev) => [newNote, ...prev]);
		setSelectedNote(newNote.id);
		setIsCreatingNote(false);
		// Navigate to detail view on mobile when creating new note
		if (screen === "xs") {
			setMobileView("detail");
		}
	};

	const updateNote = (id: string, updates: Partial<Note>) => {
		setNotes((prev) =>
			prev.map((note) =>
				note.id === id ? { ...note, ...updates, updatedAt: new Date() } : note
			)
		);
	};

	const togglePin = (id: string) => {
		setNotes((prev) =>
			prev.map((note) =>
				note.id === id
					? { ...note, isPinned: !note.isPinned, updatedAt: new Date() }
					: note
			)
		);
	};

	const deleteNote = (id: string) => {
		setNotes((prev) => prev.filter((note) => note.id !== id));
		if (selectedNote === id) {
			const remainingNotes = notes.filter((note) => note.id !== id);
			setSelectedNote(remainingNotes.length > 0 ? remainingNotes[0].id : null);
		}
	};

	// Sort notes: pinned first, then by selected sort key/direction
	const sortedNotes = useMemo(() => {
		const compare = (a: Note, b: Note) => {
			if (sortKey === "title") {
				const res = a.title.localeCompare(b.title);
				return sortDir === "asc" ? res : -res;
			}
			const av = sortKey === "updatedAt" ? a.updatedAt : a.createdAt;
			const bv = sortKey === "updatedAt" ? b.updatedAt : b.createdAt;
			const res = new Date(av).getTime() - new Date(bv).getTime();
			return sortDir === "asc" ? res : -res;
		};

		return [...filteredNotes].sort((a, b) => {
			if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
			return compare(a, b);
		});
	}, [filteredNotes, sortKey, sortDir]);

	// Handle note selection with iOS-style navigation
	const selectNote = (noteId: string) => {
		setSelectedNote(noteId);
		if (screen === "xs") {
			setMobileView("detail");
		}
	};

	// Handle back navigation on mobile
	const goBackToList = () => {
		if (screen === "xs") {
			setMobileView("list");
		}
	};

	const currentNote = notes.find((note) => note.id === selectedNote);

	// Format date for display
	const formatDate = (date: Date) => {
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		const days = Math.floor(diff / (1000 * 60 * 60 * 24));

		if (days === 0) {
			return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
		} else if (days === 1) {
			return "Yesterday";
		} else if (days < 7) {
			return date.toLocaleDateString([], { weekday: "long" });
		} else {
			return date.toLocaleDateString([], { month: "short", day: "numeric" });
		}
	};

	return (
		<div className={styles.notes} data-screen={screen} data-h={heightTier}>
			{/* iOS-style navigation: show list or detail based on screen size and state */}
			{screen === "xs" ? (
				<>
					{mobileView === "list" ? (
						/* Mobile List View */
						<div className={styles.mobileListView}>
							<div className={styles.sidebarHeader}>
								<h1 className={styles.title}>
									<FileText size={20} />
									Notes
								</h1>
								<div className={styles.headerActions}>
									<button
										className={styles.newNoteButton}
										onClick={createNewNote}
										title="New Note"
									>
										<Plus size={16} />
									</button>
								</div>
							</div>

							{/* Search */}
							<div className={styles.searchSection}>
								<div className={styles.searchBox}>
									<Search size={16} />
									<input
										type="text"
										placeholder="Search notes..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className={styles.searchInput}
									/>
								</div>
								<div className={styles.sortBox}>
									<select
										value={sortKey}
										onChange={(e) => setSortKey(e.target.value as SortKey)}
										className={styles.sortSelect}
										title="Sort by"
									>
										<option value="updatedAt">Updated</option>
										<option value="createdAt">Created</option>
										<option value="title">Title</option>
									</select>
									<select
										value={sortDir}
										onChange={(e) => setSortDir(e.target.value as SortDir)}
										className={styles.sortSelect}
										title="Sort direction"
									>
										<option value="desc">Desc</option>
										<option value="asc">Asc</option>
									</select>
								</div>
							</div>

							{/* Notes List */}
							<div className={styles.notesList}>
								{sortedNotes.length === 0 ? (
									<div className={styles.emptyNotesList}>
										{searchQuery ? (
											<>
												<Search size={32} />
												<p>No notes match your search</p>
												<small>Try a different search term</small>
											</>
										) : (
											<>
												<FileText size={32} />
												<p>No notes yet</p>
												<small>Create your first note to get started</small>
											</>
										)}
									</div>
								) : (
									sortedNotes.map((note) => (
										<div
											key={note.id}
											className={`${styles.noteItem} ${
												selectedNote === note.id ? styles.selected : ""
											} ${note.isPinned ? styles.pinned : ""}`}
											onClick={() => selectNote(note.id)}
										>
											<div className={styles.noteHeader}>
												<div className={styles.noteTitle}>{note.title || "New Note"}</div>
												<div className={styles.noteActions}>
													<button
														className={styles.pinButton}
														onClick={(e) => {
															e.stopPropagation();
															togglePin(note.id);
														}}
														title={note.isPinned ? "Unpin Note" : "Pin Note"}
													>
														<Pin size={14} />
													</button>
													<button
														className={styles.deleteButton}
														onClick={(e) => {
															e.stopPropagation();
															deleteNote(note.id);
														}}
														title="Delete Note"
													>
														<Trash2 size={14} />
													</button>
												</div>
											</div>
											<div className={styles.notePreview}>
												{note.content.split("\n")[0].substring(0, 100) ||
													"No additional text"}
											</div>
											<div className={styles.noteDate}>
												<Calendar size={12} />
												{formatDate(note.updatedAt)}
											</div>
										</div>
									))
								)}
							</div>
						</div>
					) : (
						/* Mobile Detail View */
						<div className={styles.mobileDetailView}>
							{currentNote ? (
								<>
									<div className={styles.mobileDetailHeader}>
										<button
											className={styles.backButton}
											onClick={goBackToList}
											title="Back to Notes"
										>
											<ArrowLeft size={20} />
										</button>
										<div className={styles.detailActions}>
											<button
												className={styles.pinButton}
												onClick={() => togglePin(currentNote.id)}
												title={currentNote.isPinned ? "Unpin Note" : "Pin Note"}
											>
												<Pin size={16} />
											</button>
											<button
												className={styles.deleteButton}
												onClick={() => {
													deleteNote(currentNote.id);
													goBackToList();
												}}
												title="Delete Note"
											>
												<Trash2 size={16} />
											</button>
										</div>
									</div>
									<div className={styles.editorHeader}>
										<input
											type="text"
											value={currentNote.title}
											onChange={(e) =>
												updateNote(currentNote.id, { title: e.target.value })
											}
											className={styles.editorTitle}
											placeholder="Title"
										/>
										<div className={styles.editorMeta}>
											<span className={styles.wordCount}>
												{
													currentNote.content
														.split(/\s+/)
														.filter((word) => word.length > 0).length
												}{" "}
												words
											</span>
											<span className={styles.lastUpdated}>
												{formatDate(currentNote.updatedAt)}
											</span>
										</div>
									</div>
									<textarea
										value={currentNote.content}
										onChange={(e) =>
											updateNote(currentNote.id, { content: e.target.value })
										}
										className={styles.editorContent}
										placeholder="Start writing..."
									/>
								</>
							) : (
								<div className={styles.emptyState}>
									<FileText size={64} />
									<h3 className={styles.emptyTitle}>Note not found</h3>
									<p className={styles.emptyText}>
										The selected note could not be found.
									</p>
									<button className={styles.backButton} onClick={goBackToList}>
										<ArrowLeft size={16} />
										Back to Notes
									</button>
								</div>
							)}
						</div>
					)}
				</>
			) : (
				/* Desktop/Tablet Layout */
				<>
					{/* Sidebar */}
					<div className={styles.sidebar}>
						<div className={styles.sidebarHeader}>
							<h1 className={styles.title}>
								<FileText size={20} />
								Notes
							</h1>
							<div className={styles.headerActions}>
								<button
									className={styles.newNoteButton}
									onClick={createNewNote}
									title="New Note"
								>
									<Plus size={16} />
								</button>
							</div>
						</div>

						{/* Search */}
						<div className={styles.searchSection}>
							<div className={styles.searchBox}>
								<Search size={16} />
								<input
									type="text"
									placeholder="Search notes..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className={styles.searchInput}
								/>
							</div>
							<div className={styles.sortBox}>
								<select
									value={sortKey}
									onChange={(e) => setSortKey(e.target.value as SortKey)}
									className={styles.sortSelect}
									title="Sort by"
								>
									<option value="updatedAt">Updated</option>
									<option value="createdAt">Created</option>
									<option value="title">Title</option>
								</select>
								<select
									value={sortDir}
									onChange={(e) => setSortDir(e.target.value as SortDir)}
									className={styles.sortSelect}
									title="Sort direction"
								>
									<option value="desc">Desc</option>
									<option value="asc">Asc</option>
								</select>
							</div>
						</div>

						{/* Notes List */}
						<div className={styles.notesList}>
							{sortedNotes.length === 0 ? (
								<div className={styles.emptyNotesList}>
									{searchQuery ? (
										<>
											<Search size={32} />
											<p>No notes match your search</p>
											<small>Try a different search term</small>
										</>
									) : (
										<>
											<FileText size={32} />
											<p>No notes yet</p>
											<small>Create your first note to get started</small>
										</>
									)}
								</div>
							) : (
								sortedNotes.map((note) => (
									<div
										key={note.id}
										className={`${styles.noteItem} ${
											selectedNote === note.id ? styles.selected : ""
										} ${note.isPinned ? styles.pinned : ""}`}
										onClick={() => selectNote(note.id)}
									>
										<div className={styles.noteHeader}>
											<div className={styles.noteTitle}>{note.title || "New Note"}</div>
											<div className={styles.noteActions}>
												<button
													className={styles.pinButton}
													onClick={(e) => {
														e.stopPropagation();
														togglePin(note.id);
													}}
													title={note.isPinned ? "Unpin Note" : "Pin Note"}
												>
													📌
												</button>
												<button
													className={styles.deleteButton}
													onClick={(e) => {
														e.stopPropagation();
														deleteNote(note.id);
													}}
													title="Delete Note"
												>
													<Trash2 size={14} />
												</button>
											</div>
										</div>
										<div className={styles.notePreview}>
											{note.content.split("\n")[0].substring(0, 100) ||
												"No additional text"}
										</div>
										<div className={styles.noteDate}>
											<Calendar size={12} />
											{formatDate(note.updatedAt)}
										</div>
									</div>
								))
							)}
						</div>
					</div>

					{/* Editor */}
					<div className={styles.editor}>
						{currentNote ? (
							<>
								<div className={styles.editorHeader}>
									<input
										type="text"
										value={currentNote.title}
										onChange={(e) =>
											updateNote(currentNote.id, { title: e.target.value })
										}
										className={styles.editorTitle}
										placeholder="Title"
									/>
									<div className={styles.editorMeta}>
										<span className={styles.wordCount}>
											{
												currentNote.content.split(/\s+/).filter((word) => word.length > 0)
													.length
											}{" "}
											words
										</span>
										<span className={styles.lastUpdated}>
											{formatDate(currentNote.updatedAt)}
										</span>
									</div>
								</div>
								<textarea
									value={currentNote.content}
									onChange={(e) =>
										updateNote(currentNote.id, { content: e.target.value })
									}
									className={styles.editorContent}
									placeholder="Start writing..."
								/>
							</>
						) : (
							<div className={styles.emptyState}>
								<FileText size={64} />
								<h3 className={styles.emptyTitle}>Select a note to view</h3>
								<p className={styles.emptyText}>
									Choose a note from the list on the left to view and edit it, or create a
									new note.
								</p>
							</div>
						)}
					</div>
				</>
			)}
		</div>
	);
}
