"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import DragHandle from '@tiptap/extension-drag-handle-react'
import { useState, useRef, useEffect, useMemo } from 'react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import Strike from '@tiptap/extension-strike'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import Dropcursor from '@tiptap/extension-dropcursor'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon,
  Strikethrough,
  List, 
  ListOrdered, 
  Heading1, 
  Heading2, 
  Heading3,
  Quote,
  Code,
  ImageIcon,
  Link as LinkIcon,
  Highlighter,
  Type,
  GripVertical,
  Plus,
  ChevronDown,
  Table as TableIcon,
  CheckSquare,
  Minus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const [showSlashMenu, setShowSlashMenu] = useState(false)
  const [slashMenuPosition, setSlashMenuPosition] = useState<{ top: number; left: number } | null>(null)
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0)
  const [slashSearchQuery, setSlashSearchQuery] = useState('')
  const [slashInsertPos, setSlashInsertPos] = useState<number | null>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const slashMenuRef = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        dropcursor: false,
        horizontalRule: false,
      }),
      Dropcursor.configure({
        color: 'var(--primary)',
        width: 2,
        class: 'drop-cursor',
      }),
      HorizontalRule.configure({
        HTMLAttributes: {
          class: 'my-8 border-t-2 border-border',
        },
      }),
      Underline,
      Strike,
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto my-4',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer hover:text-primary/80',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || "Type '/' for commands...",
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: 'not-prose',
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'flex items-start gap-2',
        },
      }),
      Table.configure({
        resizable: true,
        allowTableNodeSelection: true,
        HTMLAttributes: {
          class: 'border-collapse w-full my-4',
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: 'border-b border-border',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-border bg-muted font-semibold p-3 text-left',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-border p-3',
        },
      }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base dark:prose-invert w-full focus:outline-none px-4 sm:px-8 md:px-16 lg:px-32 xl:px-48 py-8 min-h-[calc(100vh-12rem)]',
      },
      handleKeyDown: (view, event) => {
        // Handle slash menu opening
        if (event.key === '/' && !showSlashMenu) {
          const { from } = view.state.selection
          
          // Let the "/" be typed first
          setTimeout(() => {
            const coords = view.coordsAtPos(from + 1)
            const editorRect = editorRef.current?.getBoundingClientRect()
            if (editorRect) {
              setSlashMenuPosition({
                top: coords.top - editorRect.top + 24,
                left: coords.left - editorRect.left,
              })
              setShowSlashMenu(true)
              setSelectedCommandIndex(0)
              setSlashSearchQuery('')
              setSlashInsertPos(from + 1) // Position after the "/"
            }
          }, 0)
          return false // Allow "/" to be typed
        }
        
        // Prevent default editor behavior when slash menu is open
        if (showSlashMenu) {
          if (['ArrowUp', 'ArrowDown', 'Enter', 'Escape'].includes(event.key)) {
            event.preventDefault()
            return true
          }
          // Prevent backspace from deleting in editor
          if (event.key === 'Backspace') {
            event.preventDefault()
            return true
          }
          // Prevent any typing in editor when slash menu is open
          if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
            event.preventDefault()
            return true
          }
        }
        
        return false
      },
    },
  })

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      try {
        editor.commands.setContent(content)
      } catch (error) {
        console.error('Error setting editor content:', error)
        // Fallback to empty paragraph if content is invalid
        editor.commands.setContent('<p></p>')
      }
    }
  }, [content, editor])

  // Slash commands
  const slashCommands = useMemo(() => {
    if (!editor) return []

    const addImage = () => {
      const url = window.prompt('Enter image URL:')
      if (url) {
        editor.chain().focus().setImage({ src: url }).run()
      }
    }

    return [
      {
        label: 'Heading 1',
        description: 'Large section heading',
        icon: <Heading1 className="h-4 w-4" />,
        category: 'Text',
        keywords: ['h1', 'heading', 'title'],
        action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      },
      {
        label: 'Heading 2',
        description: 'Medium section heading',
        icon: <Heading2 className="h-4 w-4" />,
        category: 'Text',
        keywords: ['h2', 'heading', 'subtitle'],
        action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      },
      {
        label: 'Heading 3',
        description: 'Small section heading',
        icon: <Heading3 className="h-4 w-4" />,
        category: 'Text',
        keywords: ['h3', 'heading'],
        action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      },
      {
        label: 'Bullet List',
        description: 'Create a simple bullet list',
        icon: <List className="h-4 w-4" />,
        category: 'Lists',
        keywords: ['ul', 'list', 'bullet'],
        action: () => editor.chain().focus().toggleBulletList().run(),
      },
      {
        label: 'Numbered List',
        description: 'Create a numbered list',
        icon: <ListOrdered className="h-4 w-4" />,
        category: 'Lists',
        keywords: ['ol', 'list', 'numbered', 'ordered'],
        action: () => editor.chain().focus().toggleOrderedList().run(),
      },
      {
        label: 'Task List',
        description: 'Track tasks with a checklist',
        icon: <CheckSquare className="h-4 w-4" />,
        category: 'Lists',
        keywords: ['todo', 'task', 'checkbox', 'check'],
        action: () => editor.chain().focus().toggleTaskList().run(),
      },
      {
        label: 'Quote',
        description: 'Capture a quote',
        icon: <Quote className="h-4 w-4" />,
        category: 'Text',
        keywords: ['blockquote', 'quote'],
        action: () => editor.chain().focus().toggleBlockquote().run(),
      },
      {
        label: 'Code Block',
        description: 'Display code with syntax',
        icon: <Code className="h-4 w-4" />,
        category: 'Text',
        keywords: ['code', 'codeblock', 'pre'],
        action: () => editor.chain().focus().toggleCodeBlock().run(),
      },
      {
        label: 'Divider',
        description: 'Visually divide blocks',
        icon: <Minus className="h-4 w-4" />,
        category: 'Basic',
        keywords: ['hr', 'divider', 'separator', 'line'],
        action: () => editor.chain().focus().setHorizontalRule().run(),
      },
      {
        label: 'Table',
        description: 'Insert a table',
        icon: <TableIcon className="h-4 w-4" />,
        category: 'Advanced',
        keywords: ['table', 'grid'],
        action: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
      },
      {
        label: 'Image',
        description: 'Upload or embed with a link',
        icon: <ImageIcon className="h-4 w-4" />,
        category: 'Media',
        keywords: ['image', 'picture', 'photo', 'img'],
        action: addImage,
      },
    ]
  }, [editor])

  // Filter commands based on search
  const filteredCommands = useMemo(() => {
    if (!slashSearchQuery) return slashCommands
    
    const query = slashSearchQuery.toLowerCase()
    return slashCommands.filter(cmd => 
      cmd.label.toLowerCase().includes(query) ||
      cmd.description.toLowerCase().includes(query) ||
      cmd.keywords.some(k => k.includes(query))
    )
  }, [slashSearchQuery, slashCommands])

  const groupedCommands = useMemo(() => {
    return filteredCommands.reduce((acc: Record<string, any[]>, cmd: any) => {
      if (!acc[cmd.category]) acc[cmd.category] = []
      acc[cmd.category].push(cmd)
      return acc
    }, {} as Record<string, any[]>)
  }, [filteredCommands])

  // Keyboard navigation for slash menu
  useEffect(() => {
    if (!showSlashMenu || !editor) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setSelectedCommandIndex(prev => {
          const next = Math.min(prev + 1, filteredCommands.length - 1)
          // Scroll the selected element into view
          setTimeout(() => {
            const element = document.querySelector(`[data-command-index="${next}"]`)
            element?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
          }, 0)
          return next
        })
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        setSelectedCommandIndex(prev => {
          const next = Math.max(prev - 1, 0)
          // Scroll the selected element into view
          setTimeout(() => {
            const element = document.querySelector(`[data-command-index="${next}"]`)
            element?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
          }, 0)
          return next
        })
      } else if (event.key === 'Enter') {
        event.preventDefault()
        const command = filteredCommands[selectedCommandIndex]
        if (command && editor && slashInsertPos !== null) {
          // Delete the "/" before inserting the command
          const tr = editor.state.tr.delete(slashInsertPos - 1, slashInsertPos)
          editor.view.dispatch(tr)
          
          // Execute the command
          command.action()
          setShowSlashMenu(false)
          setSlashSearchQuery('')
          setSlashInsertPos(null)
        }
      } else if (event.key === 'Escape') {
        event.preventDefault()
        setShowSlashMenu(false)
        setSlashSearchQuery('')
        setSlashInsertPos(null)
        editor.commands.focus()
      } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        setSlashSearchQuery(prev => prev + event.key)
        setSelectedCommandIndex(0)
      } else if (event.key === 'Backspace') {
        if (slashSearchQuery) {
          setSlashSearchQuery(prev => prev.slice(0, -1))
          setSelectedCommandIndex(0)
        } else {
          setShowSlashMenu(false)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showSlashMenu, editor, filteredCommands, selectedCommandIndex, slashSearchQuery, slashInsertPos])

  // Click outside to close slash menu
  useEffect(() => {
    if (!showSlashMenu) return

    const handleClickOutside = (event: MouseEvent) => {
      if (slashMenuRef.current && !slashMenuRef.current.contains(event.target as Node)) {
        setShowSlashMenu(false)
        setSlashSearchQuery('')
        setSlashInsertPos(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showSlashMenu])

  // Ensure empty paragraph at end
  useEffect(() => {
    if (!editor) return

    const handleUpdate = () => {
      const { doc } = editor.state
      const lastNode = doc.lastChild
      
      if (lastNode && lastNode.type.name !== 'paragraph') {
        editor.commands.insertContentAt(doc.content.size, '<p></p>')
      }
    }

    editor.on('update', handleUpdate)
    return () => {
      editor.off('update', handleUpdate)
    }
  }, [editor])

  if (!editor) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading editor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full relative" ref={editorRef}>
      <div className="w-full h-full overflow-y-auto">
        {/* Drag Handle Component */}
        <DragHandle editor={editor}>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 hover:bg-accent rounded-md"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (!editor) return
                const { from } = editor.state.selection
                const coords = editor.view.coordsAtPos(from)
                const editorRect = editorRef.current?.getBoundingClientRect()
                if (editorRect) {
                  setSlashMenuPosition({
                    top: coords.top - editorRect.top + 24,
                    left: coords.left - editorRect.left,
                  })
                  setShowSlashMenu(true)
                  setSelectedCommandIndex(0)
                  setSlashSearchQuery('')
                  setSlashInsertPos(null) // No slash to delete when using Plus button
                }
              }}
            >
              <Plus className="h-4 w-4 text-muted-foreground" />
            </Button>
            <div className="h-7 w-7 flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-accent rounded-md transition-colors">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </DragHandle>

        {/* Slash Command Menu */}
        {showSlashMenu && slashMenuPosition && (
          <div
            ref={slashMenuRef}
            className="absolute z-50 w-96 rounded-lg border bg-popover shadow-2xl overflow-hidden"
            style={{
              top: slashMenuPosition.top,
              left: slashMenuPosition.left,
            }}
          >
            <div className="max-h-96 overflow-y-auto">
              <div className="p-1">
                {Object.entries(groupedCommands).map(([category, commands]) => (
                  <div key={category}>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {category}
                    </div>
                    {commands.map((cmd: any, index: number) => {
                      const globalIndex = filteredCommands.indexOf(cmd)
                      return (
                        <Button
                          key={cmd.label}
                          data-command-index={globalIndex}
                          size="sm"
                          variant={selectedCommandIndex === globalIndex ? 'secondary' : 'ghost'}
                          className="w-full justify-start h-auto py-2 text-sm font-normal"
                          onClick={() => {
                            if (editor && slashInsertPos !== null) {
                              // Delete the "/" before inserting the command
                              const tr = editor.state.tr.delete(slashInsertPos - 1, slashInsertPos)
                              editor.view.dispatch(tr)
                            }
                            
                            cmd.action()
                            setShowSlashMenu(false)
                            setSlashSearchQuery('')
                            setSlashInsertPos(null)
                          }}
                        >
                          <span className="mr-3">{cmd.icon}</span>
                          <div className="flex flex-col items-start flex-1">
                            <span className="font-medium">{cmd.label}</span>
                            <span className="text-xs text-muted-foreground">{cmd.description}</span>
                          </div>
                        </Button>
                      )
                    })}
                  </div>
                ))}
                {filteredCommands.length === 0 && (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No commands found for "{slashSearchQuery}"
                  </div>
                )}
              </div>
            </div>
            {slashSearchQuery && (
              <div className="border-t px-3 py-2 bg-muted/30 text-xs text-muted-foreground">
                Searching: <span className="font-mono font-medium text-foreground">{slashSearchQuery}</span>
              </div>
            )}
          </div>
        )}

        <EditorContent editor={editor} className="notion-editor max-w-full" />
      </div>

      {/* Bubble Menu for Text Formatting */}
      {editor && (
        <BubbleMenu 
          editor={editor}
          className="flex items-center gap-1 p-1 rounded-lg border bg-popover shadow-xl"
        >
          {/* Text Style */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="h-8 px-2 gap-1">
                <Type className="h-4 w-4" />
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => editor.chain().focus().setParagraph().run()}>
                Paragraph
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
                <Heading1 className="h-4 w-4 mr-2" /> Heading 1
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                <Heading2 className="h-4 w-4 mr-2" /> Heading 2
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
                <Heading3 className="h-4 w-4 mr-2" /> Heading 3
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="h-6" />

          {/* Basic Formatting */}
          <Button
            size="sm"
            variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
            className="h-8 w-8 p-0"
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
            className="h-8 w-8 p-0"
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={editor.isActive('underline') ? 'secondary' : 'ghost'}
            className="h-8 w-8 p-0"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={editor.isActive('strike') ? 'secondary' : 'ghost'}
            className="h-8 w-8 p-0"
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <Strikethrough className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* Lists */}
          <Button
            size="sm"
            variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'}
            className="h-8 w-8 p-0"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'}
            className="h-8 w-8 p-0"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* More Options */}
          <Button
            size="sm"
            variant={editor.isActive('blockquote') ? 'secondary' : 'ghost'}
            className="h-8 w-8 p-0"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={editor.isActive('code') ? 'secondary' : 'ghost'}
            className="h-8 w-8 p-0"
            onClick={() => editor.chain().focus().toggleCode().run()}
          >
            <Code className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={editor.isActive('highlight') ? 'secondary' : 'ghost'}
            className="h-8 w-8 p-0"
            onClick={() => editor.chain().focus().toggleHighlight().run()}
          >
            <Highlighter className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* Link */}
          <Button
            size="sm"
            variant={editor.isActive('link') ? 'secondary' : 'ghost'}
            className="h-8 w-8 p-0"
            onClick={() => {
              const url = window.prompt('Enter URL:')
              if (url) {
                editor.chain().focus().setLink({ href: url }).run()
              }
            }}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
        </BubbleMenu>
      )}
    </div>
  )
}