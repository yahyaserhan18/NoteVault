import type { CreateNoteDto, Note, UpdateNoteDto } from "@/types";
import { useAuthContext } from "@/context/AuthContext";
import { useCallback } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

function useNotesAPI() {
    const { authFetch } = useAuthContext();

    const getAllNotes = useCallback(async (): Promise<Note[]> => {
        const response = await authFetch(`${API_BASE_URL}/api/notes`);
        if (!response?.ok) {
            console.error("Failed to get notes");
            return [];
        }
        const body: { ok: boolean; data: Note[] } = await response.json();
        return body.data ?? [];
    }, [authFetch]);

    const createNote = useCallback(async (note: CreateNoteDto): Promise<Note | null> => {
        const response = await authFetch(`${API_BASE_URL}/api/notes`, {
            method: "POST",
            body: JSON.stringify(note),
        });
        if (!response?.ok) {
            console.error("Failed to create note");
            return null;
        }
        const body: { ok: boolean; data: Note } = await response.json();
        return body.data ?? null;
    }, [authFetch]);

    const getNoteById = useCallback(async (id: string): Promise<Note | null> => {
        const response = await authFetch(`${API_BASE_URL}/api/notes/${id}`);
        if (!response?.ok) {
            console.error("Failed to get note");
            return null;
        }
        const body: { ok: boolean; data: Note } = await response.json();
        return body.data ?? null;
    }, [authFetch]);

    const updateNote = useCallback(async (id: string, note: UpdateNoteDto): Promise<Note | null> => {
        const response = await authFetch(`${API_BASE_URL}/api/notes/${id}`, {
            method: "PATCH",
            body: JSON.stringify(note),
        });
        if (!response?.ok) {
            console.error("Failed to update note");
            return null;
        }
        const body: { ok: boolean; data: Note } = await response.json();
        return body.data ?? null;
    }, [authFetch]);

    const deleteNote = useCallback(async (id: string): Promise<boolean> => {
        const response = await authFetch(`${API_BASE_URL}/api/notes/${id}`, {
            method: "DELETE",
        });
        if (!response?.ok) {
            console.error("Failed to delete note");
            return false;
        }
        return true;
    }, [authFetch]);

    return { getAllNotes, createNote, getNoteById, updateNote, deleteNote };
}

export default useNotesAPI;
