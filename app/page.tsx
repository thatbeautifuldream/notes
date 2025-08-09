"use client"

import { MarkdownPreview } from "@/components/markdown-preview"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useNotesStore } from "@/stores/notes-store"
import { FilePlus2, GripVertical, MoreVertical, Trash2 } from "lucide-react"
import { useTheme } from "next-themes"
import dynamic from "next/dynamic"
import { useEffect, useMemo, useRef, useState } from "react"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

const Editor = dynamic(() => import("@/components/note-editor").then((m) => m.NoteEditor), {
  ssr: false,
})

export default function Page() {
  const { theme } = useTheme()
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

  const [split, setSplit] = useState(55)
  const isDragging = useRef(false)

  const onMouseDown = () => {
    isDragging.current = true
  }

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDragging.current) return
      const container = document.getElementById("editor-preview-container")
      if (!container) return
      const rect = container.getBoundingClientRect()
      const percent = ((e.clientX - rect.left) / rect.width) * 100
      setSplit(Math.min(85, Math.max(15, percent)))
    }
    const onUp = () => {
      isDragging.current = false
    }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
    return () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
    }
  }, [])

  useEffect(() => {
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging.current) return
      const container = document.getElementById("editor-preview-container")
      if (!container) return
      const rect = container.getBoundingClientRect()
      const touch = e.touches[0]
      const percent = ((touch.clientX - rect.left) / rect.width) * 100
      setSplit(Math.min(85, Math.max(15, percent)))
    }
    const onTouchEnd = () => {
      isDragging.current = false
    }
    window.addEventListener("touchmove", onTouchMove)
    window.addEventListener("touchend", onTouchEnd)
    return () => {
      window.removeEventListener("touchmove", onTouchMove)
      window.removeEventListener("touchend", onTouchEnd)
    }
  }, [])

  type ViewMode = "write" | "read" | "both"
  const [mode, setMode] = useState<ViewMode>("both")

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="h-12 border-b border-border flex items-center gap-2 px-2 md:px-3">
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
          {/* View mode switcher (desktop) */}
          <ToggleGroup variant="outline" type="single" value={mode} onValueChange={(v) => v && setMode(v as ViewMode)} className="hidden md:inline-flex">
            <ToggleGroupItem value="write" aria-label="Write mode">Write</ToggleGroupItem>
            <ToggleGroupItem value="read" aria-label="Read mode">Read</ToggleGroupItem>
            <ToggleGroupItem value="both" aria-label="Split mode">Both</ToggleGroupItem>
          </ToggleGroup>
          {/* Compact mobile mode switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Change view mode">
                {/* Simple textual cue to avoid fragile icon imports */}
                <span className="text-xs font-medium">
                  {mode === "write" ? "W" : mode === "read" ? "R" : "B"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setMode("write")}>Write</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setMode("read")}>Read</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setMode("both")}>Both</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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

        {/* Editor + Preview */}
        <div id="editor-preview-container" className="flex-1 min-h-0 flex relative">
          {/* Editor panel */}
          <section
            className={cn("min-w-0 h-full font-mono", mode === "read" ? "hidden" : "block")}
            style={{ width: mode === "both" ? `${split}%` : "100%" }}
            aria-label="Editor"
          >
            <Editor
              key={activeNote?.id ?? "no-note"}
              value={activeNote?.content ?? ""}
              language="markdown"
              theme={theme === "dark" ? "vs-dark" : "light"}
              onChange={(val) => {
                if (activeNote) updateNoteContent(activeNote.id, val ?? "")
              }}
            />
          </section>

          {/* Divider */}
          {mode === "both" && (
            <div
              role="separator"
              aria-orientation="vertical"
              className="flex items-center justify-center w-3 cursor-col-resize select-none"
              onMouseDown={onMouseDown}
              onTouchStart={() => {
                isDragging.current = true
              }}
            >
              <div className="h-8 w-1 rounded bg-border flex items-center justify-center">
                <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>
          )}

          {/* Preview panel */}
          {mode !== "write" && (
            <section
              className={cn(
                "min-w-0 h-full border-l border-border",
                mode === "both" ? "block" : "block w-full"
              )}
              style={{ width: mode === "both" ? `${100 - split}%` : "100%" }}
              aria-label="Markdown preview"
            >
              <MarkdownPreview markdown={activeNote?.content ?? ""} />
            </section>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
