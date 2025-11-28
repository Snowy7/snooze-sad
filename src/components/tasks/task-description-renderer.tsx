"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { cn } from '@/lib/utils'

interface TaskDescriptionRendererProps {
  content: string
  className?: string
}

export function TaskDescriptionRenderer({ content, className }: TaskDescriptionRendererProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: content || '',
    editable: false,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: cn(
          'prose-headings:font-semibold',
          'prose-p:my-0 prose-p:leading-relaxed',
          'prose-ul:my-0 prose-ol:my-0',
          'prose-li:my-0',
          'text-muted-foreground text-xs leading-relaxed',
          'max-w-none',
          '[&_*]:text-xs [&_*]:leading-relaxed',
          className
        ),
      },
    },
  })

  if (!editor) return null

  return (
    <div className="task-description-renderer">
      <EditorContent editor={editor} />
    </div>
  )
}

