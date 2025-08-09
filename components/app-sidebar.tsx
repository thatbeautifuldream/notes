"use client"

import { FilePlus2 } from "lucide-react"

import { Sidebar as UISidebar, SidebarContent, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useNotesStore } from "@/stores/notes-store"
import { NoteListItem } from "@/components/note-list-item"
import { ThemeSwitcher } from "@/components/theme-toggle"
import { useTheme } from "next-themes"

export function AppSidebar() {
    const { notes, activeId, setActive, createNote, deleteNote, renameNote } = useNotesStore()
    const { theme, setTheme } = useTheme()

    return (
        <UISidebar>
            <SidebarHeader>
                <div className="p-2 border-b border-sidebar-border bg-sidebar">
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
            </SidebarHeader>
            <SidebarContent>
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
            </SidebarContent>
            <SidebarFooter className="mt-auto border-t border-sidebar-border">
                <div className="w-full flex items-center justify-end">
                    <ThemeSwitcher
                        className="w-fit"
                        value={theme === "light" || theme === "dark" ? (theme as "light" | "dark") : undefined}
                        onChange={(t) => setTheme(t)}
                    />
                </div>
            </SidebarFooter>
        </UISidebar>
    )
}


