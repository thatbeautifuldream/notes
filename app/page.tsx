"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { Input } from "@/components/ui/input"
import { useNotesStore, useNotesInit } from "@/stores/notes-store"
import { useEffect, useMemo } from "react"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { EditorProvider } from "@/components/ui/kibo-ui/editor"


export default function Page() {
  const { notes, activeId, createNote, deleteNote, setActive, updateNoteContent, renameNote, isInitialized, isLoading } = useNotesStore()

  // Initialize the notes store
  useNotesInit()

  useEffect(() => {
    if (isInitialized && notes.length === 0) {
      createNote().then(id => setActive(id))
    } else if (isInitialized && !activeId && notes.length > 0) {
      setActive(notes[0].id)
    }
  }, [isInitialized, notes.length, activeId, createNote, setActive])

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
