"use client"

import { FilePlus2 } from "lucide-react"

import { Sidebar as UISidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useNotesStore, type Note } from "@/stores/notes-store"
import { NoteListItem } from "@/components/note-list-item"
import { ThemeSwitcher } from "@/components/theme-toggle"
import { useTheme } from "next-themes"
import { motion } from "motion/react"

function groupNotes(notes: Note[]) {
    const pinned = notes.filter((n) => n.pinned)
    const unpinned = notes.filter((n) => !n.pinned)

    const now = new Date()
    const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
    const todayStart = startOfDay(now)
    const yesterdayStart = todayStart - 24 * 60 * 60 * 1000
    const weekStart = todayStart - 7 * 24 * 60 * 60 * 1000
    const monthStart = todayStart - 30 * 24 * 60 * 60 * 1000

    const sections: { label: string; items: Note[] }[] = []

    if (pinned.length) sections.push({ label: "Pinned", items: pinned })
    const today = unpinned.filter((n) => n.updatedAt >= todayStart)
    const yesterday = unpinned.filter((n) => n.updatedAt < todayStart && n.updatedAt >= yesterdayStart)
    const prev7 = unpinned.filter((n) => n.updatedAt < yesterdayStart && n.updatedAt >= weekStart)
    const prev30 = unpinned.filter((n) => n.updatedAt < weekStart && n.updatedAt >= monthStart)
    const older = unpinned.filter((n) => n.updatedAt < monthStart)

    if (today.length) sections.push({ label: "Today", items: today })
    if (yesterday.length) sections.push({ label: "Yesterday", items: yesterday })
    if (prev7.length) sections.push({ label: "Previous 7 Days", items: prev7 })
    if (prev30.length) sections.push({ label: "Previous 30 Days", items: prev30 })
    if (older.length) sections.push({ label: "Older", items: older })

    // Sort each section by updatedAt desc
    sections.forEach((s) => s.items.sort((a, b) => b.updatedAt - a.updatedAt))
    return sections
}

export function AppSidebar() {
    const { notes, activeId, setActive, createNote, deleteNote, renameNote, togglePin } = useNotesStore()
    const { theme, setTheme } = useTheme()
    const sections = groupNotes([...notes])

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
                <ScrollArea className="flex-1" hideScrollbar={true}>
                    <div className="p-2">
                        {sections.map((section) => {
                            const isPinned = section.label === "Pinned"
                            if (isPinned) {
                                return (
                                    <SidebarGroup key={section.label}>
                                        <Accordion type="single" collapsible key={section.label} defaultValue="pinned">
                                            <AccordionItem value="pinned" className="border-none">
                                                <AccordionTrigger className="px-1 text-[10px] uppercase tracking-wider text-muted-foreground/80 hover:no-underline">
                                                    Pinned
                                                </AccordionTrigger>
                                                <AccordionContent>
                                                    <motion.ul className="mt-1 space-y-1">
                                                        {section.items.map((n) => (
                                                            <motion.li key={n.id} layout="position">
                                                                <NoteListItem
                                                                    id={n.id}
                                                                    title={n.title}
                                                                    content={n.content}
                                                                    pinned={n.pinned}
                                                                    active={n.id === activeId}
                                                                    onSelect={() => setActive(n.id)}
                                                                    onDelete={() => deleteNote(n.id)}
                                                                    onRename={(t) => renameNote(n.id, t)}
                                                                    onTogglePin={() => togglePin(n.id)}
                                                                    updatedAt={n.updatedAt}
                                                                />
                                                            </motion.li>
                                                        ))}
                                                    </motion.ul>
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    </SidebarGroup>
                                )
                            }
                            return (
                                <SidebarGroup key={section.label}>
                                    <SidebarGroupLabel className="px-1 text-[10px] uppercase tracking-wider text-muted-foreground/80">
                                        {section.label}
                                    </SidebarGroupLabel>
                                    <motion.ul className="mt-1 space-y-1">
                                        {section.items.map((n) => (
                                            <motion.li key={n.id} layout="position">
                                                <NoteListItem
                                                    id={n.id}
                                                    title={n.title}
                                                    content={n.content}
                                                    pinned={n.pinned}
                                                    active={n.id === activeId}
                                                    onSelect={() => setActive(n.id)}
                                                    onDelete={() => deleteNote(n.id)}
                                                    onRename={(t) => renameNote(n.id, t)}
                                                    onTogglePin={() => togglePin(n.id)}
                                                    updatedAt={n.updatedAt}
                                                />
                                            </motion.li>
                                        ))}
                                    </motion.ul>
                                </SidebarGroup>
                            )
                        })}
                    </div>
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


