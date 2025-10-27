'use client'

import React, { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import Heading from '@tiptap/extension-heading'

export const TiptapEditor = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: true,
        italic: true,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Heading.configure({
        levels: [1, 2],
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          'min-h-[140px] p-3 border border-[var(--brand-border)] rounded-md text-sm focus:outline-none prose max-w-none',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    return () => editor?.destroy()
  }, [editor])

  if (!editor) return null

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 border border-[var(--brand-border)] rounded-t-md bg-[var(--brand-background)] px-3 py-2">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`font-bold px-2 py-1 rounded ${editor.isActive('bold') ? 'bg-purple-100 text-purple-800' : 'hover:bg-[var(--brand-navbar)]'
            }`}
        >
          B
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`italic px-2 py-1 rounded ${editor.isActive('italic') ? 'bg-purple-100 text-purple-800' : 'hover:bg-[var(--brand-navbar)]'
            }`}
        >
          I
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`underline px-2 py-1 rounded ${editor.isActive('underline') ? 'bg-purple-100 text-purple-800' : 'hover:bg-[var(--brand-navbar)]'
            }`}
        >
          U
        </button>
        <button
          onClick={() => {
            const url = window.prompt('Enter a URL')
            if (url) {
              editor.chain().focus().setLink({ href: url }).run()
            }
          }}
          className="px-2 py-1 rounded hover:bg-[var(--brand-navbar)]"
        >
          🔗 Link
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-2 py-1 rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-purple-100 text-purple-800' : 'hover:bg-[var(--brand-navbar)]'
            }`}
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2 py-1 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-purple-100 text-purple-800' : 'hover:bg-[var(--brand-navbar)]'
            }`}
        >
          H2
        </button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} className="rounded-b-md border border-t-0 border-[var(--brand-border)]" />
    </div>
  )
}
