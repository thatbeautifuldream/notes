"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MoreVertical } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export function NoteListItem(props: {
    id: string
    title: string
    content?: string
    active?: boolean
    updatedAt: number
    pinned?: boolean
    onSelect: () => void
    onDelete: () => void
    onRename: (title: string) => void
    onTogglePin?: () => void
}) {
    const [editing, setEditing] = useState(false)
    const [value, setValue] = useState(props.title)

    useEffect(() => {
        setValue(props.title)
    }, [props.title])

    const preview = getPreviewFromMarkdown(props.content ?? "")
    const dateLabel = getRelativeDateLabel(new Date(props.updatedAt))
    // no-op state now that we use a dropdown menu instead of select

    return (
        <div
            className={cn(
                "group flex items-start justify-between rounded-md px-2 py-2 text-sm",
                props.active
                    ? "bg-accent/60"
                    : "hover:bg-accent/40 cursor-pointer",
            )}
            onClick={() => !editing && props.onSelect()}
        >
            <div className="min-w-0 flex-1">
                {editing ? (
                    <Input
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onBlur={() => {
                            setEditing(false)
                            props.onRename(value.trim() || "Untitled")
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                setEditing(false)
                                props.onRename(value.trim() || "Untitled")
                            } else if (e.key === "Escape") {
                                setEditing(false)
                                setValue(props.title)
                            }
                        }}
                        className="h-8"
                        autoFocus
                    />
                ) : (
                    <div className="flex flex-col min-w-0">
                        <div className="font-medium truncate leading-5">{props.title || "Untitled"}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2 min-w-0">
                            <span className="shrink-0 tabular-nums">{dateLabel}</span>
                            {preview && (
                                <span className="truncate text-[0.78rem] leading-4 max-w-[120px]">{preview}</span>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <div className="flex items-center gap-1 ml-2 shrink-0">
                {!editing && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    "h-8 w-8 p-0 text-muted-foreground hover:text-primary focus-visible:text-primary data-[state=open]:text-primary hover:bg-transparent",
                                    props.active && ""
                                )}
                                aria-label="Note actions"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            side="bottom"
                            align="start"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <DropdownMenuItem
                                onSelect={() => {
                                    setEditing(true)
                                }}
                            >
                                Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={() => {
                                    props.onTogglePin?.()
                                }}
                            >
                                {props.pinned ? "Unpin" : "Pin"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                variant="destructive"
                                onSelect={() => {
                                    props.onDelete()
                                }}
                            >
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </div>
    )
}

function getPreviewFromMarkdown(markdown: string): string {
    if (!markdown) return "";
    // Use the first non-empty line that is not a top-level heading as preview
    const lines = markdown.split(/\r?\n/).filter((l) => l.trim().length > 0)
    const candidate = (lines[0]?.replace(/^#\s*/, "") === lines[0] ? lines[0] : lines[1]) ?? lines[0] ?? ""
    const stripped = candidate
        // remove markdown emphasis/syntax
        .replace(/[*_`>#-]/g, "")
        .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // links
        .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // images
        .trim()
    return stripped.length > 60 ? stripped.slice(0, 60) + "…" : stripped
}

function getRelativeDateLabel(date: Date): string {
    const now = new Date()
    const d = new Date(date)

    const isSameDay = (a: Date, b: Date) =>
        a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)

    if (isSameDay(d, now)) {
        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
    if (isSameDay(d, yesterday)) {
        return "Yesterday"
    }

    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays < 7) {
        return d.toLocaleDateString([], { weekday: "short" })
    }
    if (now.getFullYear() === d.getFullYear()) {
        return d.toLocaleDateString([], { month: "short", day: "numeric" })
    }
    return d.toLocaleDateString()
}
