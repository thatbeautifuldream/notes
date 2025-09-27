"use client";

import { create } from "zustand";
import { IdbService, type TRecord } from "@/lib/idb-service";
import { useEffect } from "react";

export type TNoteContent = {
  content: string;
  pinned?: boolean;
};

export type TNote = {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  size?: number;
};

type TNotesState = {
  notes: TNote[];
  activeId: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  error?: string;
  createNote: () => Promise<string>;
  deleteNote: (id: string) => Promise<void>;
  setActive: (id: string | null) => void;
  updateNoteContent: (id: string, content: string) => Promise<void>;
  renameNote: (id: string, title: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  loadAll: () => Promise<void>;
  getActive: () => TNote | null;
  getAll: () => TNote[];
};

const db = new IdbService<TNoteContent>("notes-db");

function deriveTitle(content: string): string {
  const textContent = content.replace(/<[^>]*>/g, '').trim();
  const firstLine = textContent.split(/\r?\n/).find(Boolean) ?? "";
  const title = firstLine || "Untitled";
  return title.length > 120 ? title.slice(0, 120) + "…" : title;
}

function transformToNote(record: TRecord<TNoteContent>): TNote {
  return {
    id: record.id,
    title: record.name,
    content: record.content.content,
    pinned: record.content.pinned ?? false,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    size: record.size,
  };
}

export const useNotesStore = create<TNotesState>()((set, get) => ({
  notes: [],
  activeId: null,
  isLoading: false,
  isInitialized: false,
  error: undefined,

  createNote: async () => {
    try {
      set({ isLoading: true, error: undefined });

      const now = new Date();
      const record: TRecord<TNoteContent> = {
        id: crypto.randomUUID(),
        name: "Untitled",
        content: {
          content: "<p>Start writing...</p>",
          pinned: false,
        },
        createdAt: now,
        updatedAt: now,
        size: new Blob(["<p>Start writing...</p>"]).size,
      };

      await db.save(record);
      const note = transformToNote(record);

      set((state) => ({
        notes: [note, ...state.notes],
        activeId: note.id,
        isLoading: false
      }));

      return note.id;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  deleteNote: async (id) => {
    try {
      set({ isLoading: true, error: undefined });

      await db.delete(id);

      set((state) => {
        const filtered = state.notes.filter((n) => n.id !== id);
        const newActive = state.activeId === id ? filtered[0]?.id ?? null : state.activeId;
        return {
          notes: filtered,
          activeId: newActive,
          isLoading: false
        };
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  setActive: (id) => set({ activeId: id }),

  updateNoteContent: async (id, content) => {
    try {
      const state = get();
      const note = state.notes.find((n) => n.id === id);
      if (!note) throw new Error("Note not found");

      const newTitle = note.title === "Untitled" || note.title.trim() === ""
        ? deriveTitle(content)
        : note.title;

      const now = new Date();

      set((state) => ({
        notes: state.notes.map((n) =>
          n.id === id
            ? { ...n, content, title: newTitle, updatedAt: now }
            : n
        ),
      }));

      await db.update(id, {
        name: newTitle,
        content: {
          content,
          pinned: note.pinned,
        },
      });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  renameNote: async (id, title) => {
    try {
      const state = get();
      const note = state.notes.find((n) => n.id === id);
      if (!note) throw new Error("Note not found");

      const now = new Date();

      set((state) => ({
        notes: state.notes.map((n) =>
          n.id === id ? { ...n, title, updatedAt: now } : n
        ),
      }));

      await db.update(id, { name: title });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  togglePin: async (id) => {
    try {
      const state = get();
      const note = state.notes.find((n) => n.id === id);
      if (!note) throw new Error("Note not found");

      const newPinned = !note.pinned;

      set((state) => ({
        notes: state.notes.map((n) =>
          n.id === id ? { ...n, pinned: newPinned } : n
        ),
      }));

      await db.update(id, {
        content: {
          content: note.content,
          pinned: newPinned,
        },
      });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  loadAll: async () => {
    try {
      set({ isLoading: true, error: undefined });

      if (!get().isInitialized) {
        await db.init();
      }

      const records = await db.getAll();
      const notes = records.map(transformToNote);

      set({
        notes,
        isLoading: false,
        isInitialized: true
      });
    } catch (error) {
      set({
        error: (error as Error).message,
        isLoading: false,
        isInitialized: true
      });
      throw error;
    }
  },

  getActive: () => {
    const state = get();
    return state.activeId ? state.notes.find((n) => n.id === state.activeId) ?? null : null;
  },

  getAll: () => get().notes,
}));

export const useNotesInit = () => {
  const { loadAll, isInitialized } = useNotesStore();

  useEffect(() => {
    if (!isInitialized) {
      loadAll();
    }
  }, [loadAll, isInitialized]);
};