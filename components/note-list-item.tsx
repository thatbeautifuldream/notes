"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Trash2, MoreVertical } from "lucide-react"
import { cn } from "@/lib/utils"

export function NoteListItem(props: {
    id: string
    title: string
    active?: boolean
    updatedAt: number
    onSelect: () => void
    onDelete: () => void
    onRename: (title: string) => void
}) {
    const [editing, setEditing] = useState(false)
    const [value, setValue] = useState(props.title)

    useEffect(() => {
        setValue(props.title)
    }, [props.title])

    return (
        <div
            className={cn(
                "group flex items-center justify-between rounded-md px-2 py-2 text-sm",
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
                    <div className="truncate">
                        <div className="font-medium truncate">{props.title || "Untitled"}</div>
                        <div className="text-xs text-muted-foreground truncate">
                            {new Date(props.updatedAt).toLocaleString()}
                        </div>
                    </div>
                )}
            </div>
            <div className="flex items-center gap-1 ml-2">
                {!editing && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                            e.stopPropagation()
                            setEditing(true)
                        }}
                        aria-label="Rename note"
                    >
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                        e.stopPropagation()
                        props.onDelete()
                    }}
                    aria-label="Delete note"
                >
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
            </div>
        </div>
    )
}
