"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { useNotesStore } from "@/stores/notes-store"
import { FilePlus2, MoreVertical, Trash2 } from "lucide-react"
import { useEffect, useMemo } from "react"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { EditorProvider } from "@/components/ui/kibo-ui/editor"


export default function Page() {
  const { notes, activeId, createNote, deleteNote, setActive, updateNoteContent, renameNote } = useNotesStore()

  useEffect(() => {
    if (notes.length === 0) {
      const id = createNote()
      setActive(id)
    } else if (!activeId) {
      setActive(notes[0].id)
    }
  }, [notes.length])

  const activeNote = useMemo(() => notes.find((n) => n.id === activeId) ?? null, [notes, activeId])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex-1 flex flex-col min-w-0 h-svh">
        {/* Top bar */}
        <div className="h-12 border-b border-border flex items-center gap-2 px-2 md:px-3 sticky top-0 z-10 bg-background">
          <SidebarTrigger aria-label="Toggle sidebar" />
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <Input
              value={activeNote?.title ?? ""}
              onChange={(e) => {
                if (activeNote) renameNote(activeNote.id, e.target.value)
              }}
              placeholder="Untitled"
              className="h-9 bg-transparent border-none focus-visible:ring-0 text-base font-medium truncate"
            />
          </div>
          {activeNote && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Note actions">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => deleteNote(activeNote.id)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete note
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button
            onClick={() => {
              const id = createNote()
              setActive(id)
            }}
          >
            <FilePlus2 className="h-4 w-4 mr-2" />
            New
          </Button>
        </div>

        {/* Editor */}
        <div className="flex-1 min-h-0 overflow-hidden p-4">
          <EditorProvider
            key={activeNote?.id ?? "no-note"}
            content={activeNote?.content ?? ""}
            onUpdate={({ editor }) => {
              if (activeNote) {
                const html = editor.getHTML()
                updateNoteContent(activeNote.id, html)
              }
            }}
            placeholder="Start writing..."
            className="h-full w-full max-w-none prose prose-lg dark:prose-invert focus:outline-none"
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
