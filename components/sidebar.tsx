"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FilePlus2 } from "lucide-react"
import { useNotesStore } from "@/stores/notes-store"
import { NoteListItem } from "@/components/note-list-item"

export function Sidebar() {
    const { notes, activeId, setActive, createNote, deleteNote, renameNote } = useNotesStore()

    return (
        <div className="h-full flex flex-col">
            <div className="p-2 border-b border-border bg-sidebar">
                <Button
                    className="w-full"
                    onClick={() => {
                        const id = createNote()
                        setActive(id)
                    }}
                >
                    <FilePlus2 className="h-4 w-4 mr-2" />
                    New note
                </Button>
            </div>
            <ScrollArea className="flex-1">
                <ul className="p-2 space-y-1">
                    {notes.map((n) => (
                        <li key={n.id}>
                            <NoteListItem
                                id={n.id}
                                title={n.title}
                                active={n.id === activeId}
                                onSelect={() => setActive(n.id)}
                                onDelete={() => deleteNote(n.id)}
                                onRename={(t) => renameNote(n.id, t)}
                                updatedAt={n.updatedAt}
                            />
                        </li>
                    ))}
                </ul>
            </ScrollArea>
        </div>
    )
}
