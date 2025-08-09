"use client"

import { useMemo } from "react"
import { Editor } from "@monaco-editor/react"
import type { OnChange } from "@monaco-editor/react"
import { useDebouncedCallback } from "@/lib/use-debounced-callback"

export function NoteEditor(props: {
  value: string
  language?: "markdown"
  onChange?: (value: string) => void
  theme?: "light" | "vs-dark" | string
}) {
  const debounced = useDebouncedCallback((val: string) => {
    props.onChange?.(val)
  }, 200)

  const options = useMemo(
    () => ({
      minimap: { enabled: false },
      wordWrap: "on" as const,
      fontSize: 14,
      fontFamily:
        'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      scrollBeyondLastLine: false,
      automaticLayout: true,
      padding: { top: 12, bottom: 12 },
      renderLineHighlight: "line" as const,
    }),
    [],
  )

  const handleChange: OnChange = (val) => {
    debounced(val ?? "")
  }

  return (
    <Editor
      height="100%"
      defaultLanguage="markdown"
      language={props.language ?? "markdown"}
      value={props.value}
      onChange={handleChange}
      theme={props.theme ?? "light"}
      options={options}
    />
  )
}
