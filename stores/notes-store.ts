"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { get, set, del } from "idb-keyval";

export type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
};

type NotesState = {
  notes: Note[];
  activeId: string | null;
  createNote: () => string;
  deleteNote: (id: string) => void;
  setActive: (id: string | null) => void;
  updateNoteContent: (id: string, content: string) => void;
  renameNote: (id: string, title: string) => void;
};

function newNote(): Note {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const now = Date.now();
  return {
    id,
    title: "Untitled",
    content: "# New Note\n\nStart writing your markdown...",
    createdAt: now,
    updatedAt: now,
  };
}

// Custom storage object for IndexedDB
const indexedDBStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) ?? null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      notes: [],
      activeId: null,

      createNote: () => {
        const note = newNote();
        set((state) => ({ notes: [note, ...state.notes], activeId: note.id }));
        return note.id;
      },

      deleteNote: (id) => {
        set((state) => {
          const filtered = state.notes.filter((n) => n.id !== id);
          const newActive =
            state.activeId === id ? filtered[0]?.id ?? null : state.activeId;
          return { notes: filtered, activeId: newActive };
        });
      },

      setActive: (id) => set({ activeId: id }),

      updateNoteContent: (id, content) => {
        set((state) => {
          const notes = state.notes.map((n) =>
            n.id === id
              ? {
                  ...n,
                  content,
                  // Auto-derive a title from first heading/text if the title was untouched or matches previous
                  title:
                    n.title === "Untitled" || n.title.trim() === ""
                      ? deriveTitle(content)
                      : n.title,
                  updatedAt: Date.now(),
                }
              : n
          );
          return { notes };
        });
      },

      renameNote: (id, title) => {
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id ? { ...n, title, updatedAt: Date.now() } : n
          ),
        }));
      },
    }),
    {
      name: "notes-store-v1",
      storage: createJSONStorage(() => indexedDBStorage),
      version: 1,
      partialize: (state) => ({
        notes: state.notes,
        activeId: state.activeId,
      }),
    }
  )
);

function deriveTitle(content: string) {
  const firstLine = content.split(/\r?\n/).find(Boolean) ?? "";
  const heading = firstLine.replace(/^#\s*/, "").trim();
  const title = heading || "Untitled";
  return title.length > 120 ? title.slice(0, 120) + "…" : title;
}
