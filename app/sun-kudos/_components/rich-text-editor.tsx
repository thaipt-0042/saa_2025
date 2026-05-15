'use client'

import { useEffect, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Mention from '@tiptap/extension-mention'
import DOMPurify from 'isomorphic-dompurify'
import { useDebounce } from '@/lib/hooks/use-debounce'
import type { UserSearchResult } from '@/lib/kudos/kudo-types'

const MAX_CHARS = 1000

interface RichTextEditorProps {
  onContentChange: (html: string) => void
  initialContent?: string
}

export function RichTextEditor({ onContentChange, initialContent = '' }: RichTextEditorProps) {
  const [charCount, setCharCount] = useState(0)
  const [mentionQuery, setMentionQuery] = useState('')
  const [mentionSuggestions, setMentionSuggestions] = useState<UserSearchResult[]>([])
  const mentionCommandRef = useRef<((item: { id: string; label: string }) => void) | null>(null)
  const debouncedMentionQuery = useDebounce(mentionQuery, 300)

  useEffect(() => {
    let cancelled = false

    async function run() {
      const trimmed = debouncedMentionQuery.trim()
      if (!trimmed) {
        setMentionSuggestions([])
        return
      }
      try {
        const r = await fetch(`/api/users/search?q=${encodeURIComponent(trimmed)}`)
        const data: UserSearchResult[] = await r.json()
        if (!cancelled) setMentionSuggestions(data)
      } catch {
        if (!cancelled) setMentionSuggestions([])
      }
    }

    run()
    return () => { cancelled = true }
  }, [debouncedMentionQuery])

  const editor = useEditor({
    extensions: [
      StarterKit,
      Mention.configure({
        HTMLAttributes: { class: 'mention' },
        suggestion: {
          items: ({ query }: { query: string }) => {
            setMentionQuery(query)
            return mentionSuggestions
          },
          render: () => ({
            onStart: ({ command }: { command: (item: { id: string; label: string }) => void }) => {
              mentionCommandRef.current = command
            },
            onUpdate: ({ command }: { command: (item: { id: string; label: string }) => void }) => {
              mentionCommandRef.current = command
            },
            onExit: () => {
              mentionCommandRef.current = null
              setMentionSuggestions([])
            },
            onKeyDown: () => false,
          }),
        },
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor: e }) => {
      const text = e.getText()
      setCharCount(text.length)
      const html = DOMPurify.sanitize(e.getHTML())
      onContentChange(html)
    },
  })

  if (!editor) return null

  function toolbarButton(
    label: string,
    isActive: boolean,
    onClick: () => void
  ) {
    return (
      <button
        key={label}
        type="button"
        aria-label={label}
        aria-pressed={isActive}
        onClick={onClick}
        style={{
          padding: '4px 8px',
          borderRadius: '4px',
          border: 'none',
          background: isActive ? 'rgba(255,234,158,0.15)' : 'none',
          color: isActive ? 'var(--color-cta-primary)' : '#aaa',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 600,
        }}
      >
        {label}
      </button>
    )
  }

  return (
    <div
      style={{
        border: '1px solid var(--color-divider)',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          padding: '8px',
          borderBottom: '1px solid var(--color-divider)',
          flexWrap: 'wrap',
        }}
      >
        {toolbarButton('Bold', editor.isActive('bold'), () => editor.commands.toggleBold())}
        {toolbarButton('Italic', editor.isActive('italic'), () => editor.commands.toggleItalic())}
        {toolbarButton('Strike', editor.isActive('strike'), () => editor.commands.toggleStrike())}
        {toolbarButton('List', editor.isActive('orderedList'), () => editor.commands.toggleOrderedList())}
        {toolbarButton('Blockquote', editor.isActive('blockquote'), () => editor.commands.toggleBlockquote())}
      </div>

      {/* Editor */}
      <div style={{ padding: '10px 12px', minHeight: '120px' }}>
        <EditorContent editor={editor} />
      </div>

      {/* Character counter */}
      <div
        style={{
          padding: '4px 12px 8px',
          textAlign: 'right',
          fontSize: '12px',
          color: charCount > MAX_CHARS ? '#d4271d' : '#666',
        }}
      >
        {charCount} / {MAX_CHARS}
      </div>
    </div>
  )
}
