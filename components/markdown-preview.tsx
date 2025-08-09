"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { ScrollArea } from "@/components/ui/scroll-area"

export function MarkdownPreview(props: { markdown: string }) {
  return (
    <ScrollArea className="h-full">
      <article className="px-6 py-4 text-sm md:text-base leading-7 max-w-[100ch]">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ node, ...p }) => <h1 className="text-2xl font-bold mt-6 mb-3 text-foreground" {...p} />,
            h2: ({ node, ...p }) => <h2 className="text-xl font-bold mt-5 mb-2 text-foreground" {...p} />,
            h3: ({ node, ...p }) => <h3 className="text-lg font-semibold mt-4 mb-2 text-foreground" {...p} />,
            p: ({ node, ...p }) => <p className="my-3" {...p} />,
            ul: ({ node, ...p }) => <ul className="list-disc ml-6 my-3 space-y-1" {...p} />,
            ol: ({ node, ...p }) => <ol className="list-decimal ml-6 my-3 space-y-1" {...p} />,
            // @ts-expect-error - TODO: fix inline code rendering
            code: ({ inline, className, children, ...p }: { inline: boolean, className: string, children: React.ReactNode }) =>
              inline ? (
                <code className="px-1 py-0.5 rounded bg-muted text-muted-foreground" {...p}>
                  {children}
                </code>
              ) : (
                <pre className="my-3 p-3 rounded bg-muted overflow-x-auto">
                  <code className={className} {...p}>
                    {children}
                  </code>
                </pre>
              ),
            blockquote: ({ node, ...p }) => (
              <blockquote className="border-l-4 border-border pl-3 my-3 italic text-muted-foreground" {...p} />
            ),
            a: ({ node, ...p }) => <a className="text-primary underline" target="_blank" rel="noreferrer" {...p} />,
            hr: ({ node, ...p }) => <hr className="my-6 border-border" {...p} />,
            table: ({ node, ...p }) => (
              <div className="my-3 overflow-x-auto">
                <table className="min-w-full text-left border-collapse" {...p} />
              </div>
            ),
            th: ({ node, ...p }) => <th className="border-b border-border py-2 px-3 font-semibold text-foreground" {...p} />,
            td: ({ node, ...p }) => <td className="border-b border-border py-2 px-3 align-top" {...p} />,
          }}
        >
          {props.markdown || "Start typing Markdown in the editor to see a live preview."}
        </ReactMarkdown>
      </article>
    </ScrollArea>
  )
}
