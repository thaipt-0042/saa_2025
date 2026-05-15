// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('isomorphic-dompurify', () => ({
  default: { sanitize: (s: string) => s },
}))

// Mock Tiptap — heavy editor, not suited for unit tests
vi.mock('@tiptap/react', () => ({
  useEditor: vi.fn(() => ({
    commands: {
      toggleBold: vi.fn(),
      toggleItalic: vi.fn(),
      toggleStrike: vi.fn(),
      toggleOrderedList: vi.fn(),
      toggleBlockquote: vi.fn(),
      setLink: vi.fn(),
    },
    isActive: vi.fn(() => false),
    getText: vi.fn(() => 'Hello world'),
    getHTML: vi.fn(() => '<p>Hello world</p>'),
    on: vi.fn(),
    off: vi.fn(),
    destroy: vi.fn(),
    isDestroyed: false,
  })),
  EditorContent: ({ editor }: { editor: unknown }) =>
    editor ? <div data-testid="editor-content" contentEditable /> : null,
  BubbleMenu: () => null,
}))

vi.mock('@tiptap/starter-kit', () => ({ default: {} }))
vi.mock('@tiptap/extension-mention', () => ({ default: { configure: vi.fn(() => ({})) } }))

import { RichTextEditor } from './rich-text-editor'

describe('RichTextEditor', () => {
  const onContentChange = vi.fn()

  beforeEach(() => { vi.clearAllMocks() })

  it('renders the editor content area', () => {
    render(<RichTextEditor onContentChange={onContentChange} />)
    expect(screen.getByTestId('editor-content')).toBeInTheDocument()
  })

  it('renders Bold toolbar button with aria-pressed', () => {
    render(<RichTextEditor onContentChange={onContentChange} />)
    const boldBtn = screen.getByRole('button', { name: /bold/i })
    expect(boldBtn).toBeInTheDocument()
    expect(boldBtn).toHaveAttribute('aria-pressed')
  })

  it('renders Italic toolbar button with aria-pressed', () => {
    render(<RichTextEditor onContentChange={onContentChange} />)
    const italicBtn = screen.getByRole('button', { name: /italic/i })
    expect(italicBtn).toBeInTheDocument()
    expect(italicBtn).toHaveAttribute('aria-pressed')
  })

  it('renders character counter', () => {
    render(<RichTextEditor onContentChange={onContentChange} />)
    expect(screen.getByText(/\d+\s*\/\s*\d+/)).toBeInTheDocument()
  })
})
