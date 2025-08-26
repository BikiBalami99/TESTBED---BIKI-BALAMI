"use client";

import React, { useState } from "react";
import styles from "./Notes.module.css";

interface Note {
	id: string;
	title: string;
	content: string;
	createdAt: Date;
}

export default function Notes() {
	const [notes, setNotes] = useState<Note[]>([
		{
			id: "1",
			title: "Welcome to Notes",
			content: "This is your personal note-taking app. Start writing your thoughts here!",
			createdAt: new Date(),
		},
	]);
	const [selectedNote, setSelectedNote] = useState<string | null>("1");
	const [newNoteTitle, setNewNoteTitle] = useState("");

	const createNewNote = () => {
		const newNote: Note = {
			id: Date.now().toString(),
			title: newNoteTitle || "Untitled Note",
			content: "",
			createdAt: new Date(),
		};
		setNotes((prev) => [newNote, ...prev]);
		setSelectedNote(newNote.id);
		setNewNoteTitle("");
	};

	const updateNote = (id: string, updates: Partial<Note>) => {
		setNotes((prev) =>
			prev.map((note) => (note.id === id ? { ...note, ...updates } : note))
		);
	};

	const deleteNote = (id: string) => {
		setNotes((prev) => prev.filter((note) => note.id !== id));
		if (selectedNote === id) {
			const remainingNotes = notes.filter((note) => note.id !== id);
			setSelectedNote(remainingNotes.length > 0 ? remainingNotes[0].id : null);
		}
	};

	const currentNote = notes.find((note) => note.id === selectedNote);

	return (
		<div className={styles.notes}>
			<div className={styles.sidebar}>
				<div className={styles.sidebarHeader}>
					<h3 className={styles.sidebarTitle}>Notes</h3>
					<button
						className={styles.newNoteButton}
						onClick={createNewNote}
						title="New Note"
					>
						+
					</button>
				</div>

				<div className={styles.newNoteInput}>
					<input
						type="text"
						placeholder="Note title..."
						value={newNoteTitle}
						onChange={(e) => setNewNoteTitle(e.target.value)}
						onKeyPress={(e) => e.key === "Enter" && createNewNote()}
						className={styles.titleInput}
					/>
				</div>

				<div className={styles.notesList}>
					{notes.map((note) => (
						<div
							key={note.id}
							className={`${styles.noteItem} ${
								selectedNote === note.id ? styles.selected : ""
							}`}
							onClick={() => setSelectedNote(note.id)}
						>
							<div className={styles.noteTitle}>{note.title || "Untitled"}</div>
							<div className={styles.notePreview}>{note.content.substring(0, 50)}...</div>
							<div className={styles.noteDate}>
								{new Date(note.createdAt).toLocaleDateString()}
							</div>
							<button
								className={styles.deleteButton}
								onClick={(e) => {
									e.stopPropagation();
									deleteNote(note.id);
								}}
								title="Delete Note"
							>
								×
							</button>
						</div>
					))}
				</div>
			</div>

			<div className={styles.editor}>
				{currentNote ? (
					<>
						<input
							type="text"
							value={currentNote.title}
							onChange={(e) => updateNote(currentNote.id, { title: e.target.value })}
							className={styles.editorTitle}
							placeholder="Note title..."
						/>
						<textarea
							value={currentNote.content}
							onChange={(e) => updateNote(currentNote.id, { content: e.target.value })}
							className={styles.editorContent}
							placeholder="Start writing your note..."
						/>
					</>
				) : (
					<div className={styles.emptyState}>
						<h3 className={styles.emptyTitle}>No note selected</h3>
						<p className={styles.emptyText}>
							Create a new note or select an existing one to start writing.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
