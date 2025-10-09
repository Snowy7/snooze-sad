"use client"

import { useState, useEffect } from "react"
import dynamic from 'next/dynamic'
import { MarketingNavbar } from "@/components/marketing/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar, Zap, Command, Clock, GripVertical, Plus, Search, Play, Pause, Square, ArrowRight, CheckCircle, ListTodo, Settings, Trash2 } from "lucide-react"
import { DndContext, DragEndEvent, closestCorners, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Highlight from "@tiptap/extension-highlight"
import TaskList from "@tiptap/extension-task-list"
import TaskItem from "@tiptap/extension-task-item"
import { Table } from "@tiptap/extension-table"
import { TableRow } from "@tiptap/extension-table-row"
import { TableCell } from "@tiptap/extension-table-cell"
import { TableHeader } from "@tiptap/extension-table-header"
import { toast } from "sonner"

type Section = { title: string; body: string; example?: string }

const InteractiveDailyTasks = dynamic(() => Promise.resolve(function InteractiveDailyTasks() {
  const [tasks, setTasks] = useState([
    { id: '1', title: 'Morning workout', completed: false, isTemplate: true },
    { id: '2', title: 'Check emails', completed: true, isTemplate: true },
    { id: '3', title: 'Team standup', completed: false, isTemplate: true },
  ])
  const [newTask, setNewTask] = useState('')
  const [templates, setTemplates] = useState([
    { id: 't1', title: 'Morning workout', active: true },
    { id: 't2', title: 'Check emails', active: true },
    { id: 't3', title: 'Team standup', active: true },
  ])
  const [showTemplates, setShowTemplates] = useState(false)
  const [newTemplate, setNewTemplate] = useState('')

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  const addTask = () => {
    if (!newTask.trim()) return
    setTasks([...tasks, { id: Date.now().toString(), title: newTask, completed: false, isTemplate: false }])
    setNewTask('')
  }

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id))
  }

  const addTemplate = () => {
    if (!newTemplate.trim()) return
    setTemplates([...templates, { id: Date.now().toString(), title: newTemplate, active: true }])
    setNewTemplate('')
  }

  const toggleTemplate = (id: string) => {
    setTemplates(templates.map(t => t.id === id ? { ...t, active: !t.active } : t))
  }

  const deleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id))
  }

  const completed = tasks.filter(t => t.completed).length

  return (
    <div className="rounded-lg border bg-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
            <ListTodo className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-bold">Daily Tasks</h3>
            <p className="text-xs text-muted-foreground">Wednesday, October 8, 2025</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Templates
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Daily Task Templates</DialogTitle>
                <DialogDescription>
                  Templates automatically create tasks every day
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="New template..."
                    value={newTemplate}
                    onChange={(e) => setNewTemplate(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTemplate()}
                  />
                  <Button onClick={addTemplate}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {templates.map((template) => (
                    <div key={template.id} className="flex items-center gap-3 p-3 rounded-lg border">
                      <Checkbox
                        checked={template.active}
                        onCheckedChange={() => toggleTemplate(template.id)}
                      />
                      <span className={`flex-1 text-sm ${!template.active ? "text-muted-foreground line-through" : ""}`}>
                        {template.title}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteTemplate(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <span className="text-xs text-muted-foreground">{completed} / {tasks.length}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Add a one-time task for today..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
        />
        <Button onClick={addTask}>
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      <div className="space-y-2">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors group">
            <Checkbox
              checked={task.completed}
              onCheckedChange={() => toggleTask(task.id)}
            />
            <span className={`flex-1 text-sm ${task.completed ? "line-through text-muted-foreground" : ""}`}>
              {task.title}
            </span>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => deleteTask(task.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {tasks.length > 0 && (
        <div className="pt-4 border-t flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {completed} of {tasks.length} completed
          </span>
          <span className="font-medium">
            {Math.round((completed / tasks.length) * 100)}%
          </span>
        </div>
      )}
    </div>
  )
}), { ssr: false });

const SortableTaskCard = dynamic(() => Promise.resolve(function SortableTaskCard({ id, task }: { id: string; task: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="rounded-lg border p-3 text-xs bg-card hover:shadow-md transition-all cursor-move flex items-center gap-2"
    >
      <GripVertical className="h-3 w-3 text-muted-foreground" />
      <span>{task}</span>
    </div>
  )
}), { ssr: false });

const InteractiveKanban = dynamic(() => Promise.resolve(function InteractiveKanban() {
  const [tasks, setTasks] = useState({
    backlog: [
      { id: 'b1', text: 'Design mockups' },
      { id: 'b2', text: 'Write docs' },
    ],
    inProgress: [
      { id: 'i1', text: 'Build feature' },
    ],
    done: [
      { id: 'd1', text: 'Fix bug #123' },
    ]
  })

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Find which columns the active and over items are in
    let activeColumn: keyof typeof tasks | null = null
    let overColumn: keyof typeof tasks | null = null

    for (const [col, items] of Object.entries(tasks)) {
      if (items.some(item => item.id === activeId)) {
        activeColumn = col as keyof typeof tasks
      }
      if (items.some(item => item.id === overId)) {
        overColumn = col as keyof typeof tasks
      }
      // Check if overId is a column itself
      if (col === overId) {
        overColumn = col as keyof typeof tasks
      }
    }

    if (!activeColumn) return

    // If dropped on a column (not on a task)
    if (Object.keys(tasks).includes(overId)) {
      overColumn = overId as keyof typeof tasks
    }

    if (!overColumn) return

    setTasks((prev) => {
      // Moving within the same column
      if (activeColumn === overColumn) {
        const items = [...prev[activeColumn]]
        const oldIndex = items.findIndex(item => item.id === activeId)
        const newIndex = items.findIndex(item => item.id === overId)
        
        if (oldIndex === -1) return prev
        if (newIndex === -1) return prev
        
        return {
          ...prev,
          [activeColumn]: arrayMove(items, oldIndex, newIndex)
        }
      }

      // Moving between columns
      const activeItems = [...prev[activeColumn]]
      const overItems = [...prev[overColumn]]
      const activeIndex = activeItems.findIndex(item => item.id === activeId)
      
      if (activeIndex === -1) return prev
      
      const [movedItem] = activeItems.splice(activeIndex, 1)
      
      // Find where to insert in the new column
      const overIndex = overItems.findIndex(item => item.id === overId)
      if (overIndex === -1) {
        // Drop at the end if not over a specific task
        overItems.push(movedItem)
      } else {
        overItems.splice(overIndex, 0, movedItem)
      }

      return {
        ...prev,
        [activeColumn]: activeItems,
        [overColumn]: overItems
      }
    })
  }
  
  return (
    <div className="rounded-lg border p-4 bg-muted/20">
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries({ backlog: 'Backlog', inProgress: 'In Progress', done: 'Done' }).map(([key, label]) => (
            <SortableContext key={key} items={tasks[key as keyof typeof tasks].map(t => t.id)} strategy={verticalListSortingStrategy}>
              <div 
                id={key}
                className="rounded-lg border bg-background p-3 min-h-[200px]"
              >
                <div className="text-xs font-semibold mb-3 flex items-center justify-between">
                  <span>{label}</span>
                  <Badge variant="outline" className="text-[10px]">{tasks[key as keyof typeof tasks].length}</Badge>
                </div>
                <div className="space-y-2">
                  {tasks[key as keyof typeof tasks].map((task) => (
                    <SortableTaskCard key={task.id} id={task.id} task={task.text} />
                  ))}
                </div>
              </div>
            </SortableContext>
          ))}
        </div>
      </DndContext>
      <div className="mt-3 text-xs text-center text-muted-foreground">
        <GripVertical className="h-3 w-3 inline mr-1" />
        Drag tasks between columns or reorder within columns
      </div>
    </div>
  )
}), { ssr: false });

const InteractiveEditor = dynamic(() => Promise.resolve(function InteractiveEditor() {
  const [showSlashHint, setShowSlashHint] = useState(false)
  
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit, Underline],
    content: `<h2>Welcome to the Editor</h2><p>This is an <strong>interactive example</strong> of our rich text editor. Try editing this text!</p><ul><li>You can format text</li><li>Create lists</li><li>And much more</li></ul>`,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none p-4 min-h-[200px]',
      },
      handleKeyDown: (view, event) => {
        if (event.key === '/') {
          setShowSlashHint(true)
          setTimeout(() => setShowSlashHint(false), 3000)
        }
        return false
      },
    },
  })

  if (!editor) return null

  return (
    <div className="rounded-lg border bg-background/50">
      <div className="flex items-center gap-1 border-b p-2 flex-wrap">
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => editor.chain().focus().toggleBold().run()}>
          <strong>B</strong>
        </Button>
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => editor.chain().focus().toggleItalic().run()}>
          <em>I</em>
        </Button>
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <u>U</u>
        </Button>
        <div className="h-4 w-px bg-border mx-1" />
        <Button size="sm" variant="ghost" className="h-8 px-2 text-xs" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          H1
        </Button>
        <Button size="sm" variant="ghost" className="h-8 px-2 text-xs" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </Button>
        <Button size="sm" variant="ghost" className="h-8 px-2 text-xs" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          H3
        </Button>
        <div className="h-4 w-px bg-border mx-1" />
        <Button size="sm" variant="ghost" className="h-8 px-2 text-xs" onClick={() => editor.chain().focus().toggleBulletList().run()}>
          • List
        </Button>
        <Button size="sm" variant="ghost" className="h-8 px-2 text-xs" onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          1. List
        </Button>
        <Button size="sm" variant="ghost" className="h-8 px-2 text-xs" onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          Code
        </Button>
        <Button size="sm" variant="ghost" className="h-8 px-2 text-xs" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          ―
        </Button>
      </div>
      <div className="relative">
        <EditorContent editor={editor} />
        {showSlashHint && (
          <div className="absolute top-4 left-4 bg-red-500 text-white text-xs px-3 py-2 rounded-lg shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200 z-10">
            <div className="font-semibold mb-1">Slash Menu Available!</div>
            <div className="text-red-100">Type / to insert elements</div>
          </div>
        )}
      </div>
      <div className="text-xs text-muted-foreground p-2 border-t bg-muted/30 space-y-1">
        <div>💡 <strong>Try these features:</strong></div>
        <div className="flex flex-wrap gap-2 mt-1">
          <kbd className="px-2 py-0.5 bg-white dark:bg-muted border rounded text-[10px]">/</kbd>
          <span>Slash menu</span>
          <span className="text-border">•</span>
          <kbd className="px-2 py-0.5 bg-white dark:bg-muted border rounded text-[10px]">⌘B</kbd>
          <span>Bold</span>
          <span className="text-border">•</span>
          <kbd className="px-2 py-0.5 bg-white dark:bg-muted border rounded text-[10px]">⌘I</kbd>
          <span>Italic</span>
        </div>
      </div>
    </div>
  )
}), { ssr: false });

const InteractiveFocusTimer = dynamic(() => Promise.resolve(function InteractiveFocusTimer() {
  const [seconds, setSeconds] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [isFocusMode, setIsFocusMode] = useState(false)
  const totalSeconds = 25 * 60
  
  useEffect(() => {
    if (!isRunning) return
    const interval = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          setIsRunning(false)
          setIsFocusMode(false)
          toast.success("Focus session complete!")
          return 25 * 60
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [isRunning])

  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  const progress = ((totalSeconds - seconds) / totalSeconds) * 100
  
  if (isFocusMode) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
        <div className="text-center space-y-8 max-w-2xl px-8">
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">Complete documentation review</div>
            <div className="text-[8rem] font-bold font-mono leading-none tracking-tight">
              {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </div>
            <div className="text-lg text-muted-foreground">Stay focused...</div>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden max-w-md mx-auto">
            <div className="h-full bg-red-500 transition-all duration-1000" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex gap-3 justify-center">
            <Button 
              size="lg"
              variant="outline"
              onClick={() => setIsRunning(!isRunning)}
            >
              {isRunning ? <><Pause className="h-5 w-5 mr-2" />Pause</> : <><Play className="h-5 w-5 mr-2" />Resume</>}
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => {
                setIsRunning(false)
                setIsFocusMode(false)
                setSeconds(25 * 60)
              }}
            >
              <Square className="h-5 w-5 mr-2" />
              Exit Focus
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            Press <kbd className="px-2 py-1 bg-muted border rounded">Esc</kbd> to exit
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="rounded-lg border p-6 bg-card">
      <div className="text-center mb-4">
        <div className="text-sm text-muted-foreground mb-2">Example Task</div>
        <div className="font-semibold">Complete documentation review</div>
      </div>
      <div className="text-4xl font-bold mb-4 font-mono text-center">
        {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </div>
      <Button 
        className="w-full bg-red-500 hover:bg-red-600 text-white shadow-lg"
        onClick={() => {
          setIsRunning(true)
          setIsFocusMode(true)
          toast.success("Focus session started!")
        }}
      >
        <Play className="h-4 w-4 mr-2" />
        Start Focus Mode
      </Button>
      <div className="text-xs text-center text-muted-foreground mt-2">
        Enters full-screen focus mode
      </div>
    </div>
  )
}), { ssr: false });

const InteractiveGantt = dynamic(() => Promise.resolve(function InteractiveGantt() {
  const tasks = [
    { name: 'Design phase', start: 10, duration: 30, color: 'bg-red-500' },
    { name: 'Development', start: 35, duration: 40, color: 'bg-purple-500' },
    { name: 'Testing', start: 70, duration: 20, color: 'bg-green-500' },
  ]
  
  const today = 45
  
  return (
    <div className="rounded-lg border p-4 bg-muted/20 overflow-x-auto">
      <div className="min-w-[600px]">
        <div className="grid grid-cols-[140px_1fr] gap-2 mb-2">
          <div className="text-xs font-semibold">Tasks</div>
          <div className="text-xs font-semibold">Timeline (Days)</div>
        </div>
        <div className="space-y-2">
          {tasks.map((task, i) => (
            <div key={i} className="grid grid-cols-[140px_1fr] gap-2 items-center">
              <div className="text-xs text-muted-foreground truncate">{task.name}</div>
              <div className="relative h-10 bg-muted rounded">
                <div 
                  className={`absolute h-full ${task.color} rounded opacity-80 hover:opacity-100 transition-opacity cursor-pointer flex items-center px-2`}
                  style={{ left: `${task.start}%`, width: `${task.duration}%` }}
                >
                  <span className="text-xs text-white font-medium truncate">{task.name}</span>
                </div>
                {today >= task.start && today <= task.start + task.duration && (
                  <div 
                    className="absolute top-0 bottom-0 w-px bg-red-500 z-10"
                    style={{ left: `${today}%` }}
                  >
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="relative mt-4 h-8 border-t pt-2">
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Day 0</span>
            <span>Day 50</span>
            <span>Day 100</span>
          </div>
          <div 
            className="absolute top-0 bottom-0 w-px bg-red-500/50"
            style={{ left: `${today}%` }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-[10px] bg-red-500 text-white px-1 rounded whitespace-nowrap">
              Today
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}), { ssr: false });

const InteractiveCommandPalette = dynamic(() => Promise.resolve(function InteractiveCommandPalette() {
  const [search, setSearch] = useState('')
  const commands = [
    { icon: Calendar, label: 'Go to Calendar', shortcut: '' },
    { icon: Zap, label: 'Start Focus Session', shortcut: '' },
    { icon: Plus, label: 'New Task', shortcut: '⌘N' },
  ]
  
  const filtered = commands.filter(c => c.label.toLowerCase().includes(search.toLowerCase()))
  
  return (
    <div className="rounded-lg border p-4 bg-background/50">
      <div className="flex items-center gap-2 mb-3">
        <Command className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Command Palette</span>
        <kbd className="ml-auto text-xs bg-white dark:bg-muted px-2 py-1 rounded border shadow-sm">⌘K</kbd>
      </div>
      <Input 
        placeholder="Search for anything..." 
        className="mb-2"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="space-y-1">
        {filtered.map((cmd, i) => (
          <div key={i} className="flex items-center gap-2 px-2 py-1.5 hover:bg-accent rounded text-sm cursor-pointer">
            <cmd.icon className="h-4 w-4" />
            <span>{cmd.label}</span>
            {cmd.shortcut && <kbd className="ml-auto text-xs bg-white dark:bg-muted px-1.5 py-0.5 rounded border text-[10px]">{cmd.shortcut}</kbd>}
          </div>
        ))}
      </div>
    </div>
  )
}), { ssr: false });

const InteractiveCalendar = dynamic(() => Promise.resolve(function InteractiveCalendar() {
  const [selected, setSelected] = useState(5)
  
  return (
    <div className="rounded-lg border p-4 bg-muted/20">
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="text-center text-xs text-muted-foreground font-semibold">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 14 }).map((_, i) => (
          <button 
            key={i} 
            onClick={() => setSelected(i)}
            className={`aspect-square rounded text-xs flex items-center justify-center border transition-all ${
              i === selected 
                ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/30 scale-105' 
                : 'hover:bg-accent hover:scale-105'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  )
}), { ssr: false });

const KeyboardShortcuts = dynamic(() => Promise.resolve(function KeyboardShortcuts() {
  const shortcuts = [
    { keys: ['⌘', 'K'], label: 'Command palette', category: 'Navigation' },
    { keys: ['⌘', 'P'], label: 'Quick search', category: 'Navigation' },
    { keys: ['⌘', '/'], label: 'Toggle sidebar', category: 'Navigation' },
    { keys: ['⌘', '\\'], label: 'Focus mode', category: 'Navigation' },
    { keys: ['G', 'D'], label: 'Go to dashboard', category: 'Navigation' },
    { keys: ['G', 'C'], label: 'Go to calendar', category: 'Navigation' },
    { keys: ['G', 'P'], label: 'Go to projects', category: 'Navigation' },
    { keys: ['G', 'N'], label: 'Go to notes', category: 'Navigation' },
    { keys: ['⌘', 'N'], label: 'New task', category: 'Actions' },
    { keys: ['⌘', 'Shift', 'N'], label: 'New project', category: 'Actions' },
    { keys: ['⌘', 'E'], label: 'New note', category: 'Actions' },
    { keys: ['⌘', 'Enter'], label: 'Save & close', category: 'Actions' },
    { keys: ['⌘', 'B'], label: 'Bold text', category: 'Editor' },
    { keys: ['⌘', 'I'], label: 'Italic text', category: 'Editor' },
    { keys: ['⌘', 'U'], label: 'Underline text', category: 'Editor' },
    { keys: ['⌘', 'Shift', 'H'], label: 'Highlight text', category: 'Editor' },
    { keys: ['⌘', 'Z'], label: 'Undo', category: 'Editor' },
    { keys: ['⌘', 'Shift', 'Z'], label: 'Redo', category: 'Editor' },
    { keys: ['/'], label: 'Slash menu', category: 'Editor' },
    { keys: ['Esc'], label: 'Close dialog', category: 'General' },
    { keys: ['?'], label: 'Show shortcuts', category: 'General' },
  ]
  
  const categories = Array.from(new Set(shortcuts.map(s => s.category)))
  
  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      {categories.map((category) => (
        <div key={category}>
          <div className="text-xs font-bold text-red-600 mb-2 uppercase tracking-wider">{category}</div>
          <div className="space-y-1">
            {shortcuts.filter(s => s.category === category).map((shortcut, i) => (
              <div key={i} className="flex items-center justify-between group hover:bg-accent/50 p-2 rounded transition-colors">
                <span className="text-sm">{shortcut.label}</span>
                <div className="flex gap-1">
                  {shortcut.keys.map((key, j) => (
                    <kbd 
                      key={j} 
                      className="px-2.5 py-1.5 text-xs font-semibold bg-white dark:bg-muted border rounded shadow-sm min-w-[28px] text-center"
                    >
                      {key}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}), { ssr: false });

const InteractiveNotesIntro = dynamic(() => Promise.resolve(function InteractiveNotesIntro() {
  const [notes, setNotes] = useState([
    { id: '1', title: 'Welcome to Notes', updatedAt: new Date() },
    { id: '2', title: 'Meeting Notes', updatedAt: new Date(Date.now() - 86400000) },
    { id: '3', title: 'Project Ideas', updatedAt: new Date(Date.now() - 172800000) },
  ])
  const [selectedId, setSelectedId] = useState('1')
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  
  const simulateSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setHasChanges(false)
    }, 800)
  }
  
  return (
    <div className="rounded-lg border bg-background overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-card">
        <div className="flex items-center gap-2">
          <select 
            className="text-sm font-medium bg-transparent border-none focus:outline-none cursor-pointer"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {notes.map(n => (
              <option key={n.id} value={n.id}>{n.title}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          {isSaving ? (
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-yellow-500 animate-pulse"></span>
              Saving...
            </span>
          ) : hasChanges ? (
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-orange-500"></span>
              Unsaved changes
            </span>
          ) : (
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500"></span>
              Saved
            </span>
          )}
        </div>
      </div>
      
      {/* Title */}
      <div className="px-8 pt-8 pb-4">
        <input 
          type="text"
          value={notes.find(n => n.id === selectedId)?.title}
          onChange={(e) => {
            setNotes(notes.map(n => n.id === selectedId ? { ...n, title: e.target.value } : n))
            setHasChanges(true)
            simulateSave()
          }}
          className="w-full text-3xl font-bold border-none focus:outline-none bg-transparent"
          placeholder="Untitled"
        />
      </div>
      
      {/* Content Preview */}
      <div className="px-8 pb-8 text-muted-foreground">
        <p className="text-sm">Start writing your note here...</p>
        <p className="text-xs mt-4">💡 Auto-saves 1 second after you stop typing</p>
      </div>
    </div>
  )
}), { ssr: false });

const InteractiveBlocks = dynamic(() => Promise.resolve(function InteractiveBlocks() {
  return (
    <div className="rounded-lg border bg-background p-6 space-y-3">
      <div className="group relative pl-12">
        <div className="absolute left-0 top-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
            <Plus className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 cursor-grab">
            <GripVertical className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm">Hover over this block to see controls →</p>
      </div>
      
      <div className="group relative pl-12">
        <div className="absolute left-0 top-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
            <Plus className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 cursor-grab">
            <GripVertical className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm">Each block has its own controls</p>
      </div>
      
      <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted/50 rounded">
        <strong>💡 Tip:</strong> Click <Plus className="h-3 w-3 inline" /> to insert new blocks, or drag <GripVertical className="h-3 w-3 inline" /> to reorder
      </div>
    </div>
  )
}), { ssr: false });

const InteractiveSlashMenu = dynamic(() => Promise.resolve(function InteractiveSlashMenu() {
  const [showMenu, setShowMenu] = useState(false)
  const [input, setInput] = useState('')
  
  const commands = [
    { icon: '📝', label: 'Text', description: 'Just start writing' },
    { icon: '📋', label: 'Heading 1', description: 'Big section heading' },
    { icon: '📋', label: 'Heading 2', description: 'Medium section heading' },
    { icon: '•', label: 'Bulleted List', description: 'Create a simple list' },
    { icon: '1.', label: 'Numbered List', description: 'Create a numbered list' },
    { icon: '☑', label: 'To-do List', description: 'Track tasks with checkboxes' },
    { icon: '💬', label: 'Quote', description: 'Capture a quote' },
    { icon: '</>', label: 'Code', description: 'Capture a code snippet' },
    { icon: '⊞', label: 'Table', description: 'Insert a table' },
    { icon: '―', label: 'Divider', description: 'Visually divide blocks' },
  ]
  
  const filtered = commands.filter(c => 
    c.label.toLowerCase().includes(input.toLowerCase()) ||
    c.description.toLowerCase().includes(input.toLowerCase())
  )
  
  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="relative">
        <Input 
          placeholder="Type '/' to open menu..."
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            if (e.target.value === '/') {
              setShowMenu(true)
              setInput('')
            }
          }}
          onFocus={() => input === '/' && setShowMenu(true)}
        />
        
        {showMenu && (
          <div className="absolute top-full left-0 right-0 mt-2 rounded-lg border bg-card shadow-lg z-10 max-h-80 overflow-y-auto">
            <div className="p-2 space-y-1">
              {filtered.map((cmd, i) => (
                <button
                  key={i}
                  className="w-full flex items-start gap-3 p-2 rounded hover:bg-accent transition-colors text-left"
                  onClick={() => {
                    toast.success(`Inserted ${cmd.label}`)
                    setShowMenu(false)
                    setInput('')
                  }}
                >
                  <span className="text-lg">{cmd.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{cmd.label}</div>
                    <div className="text-xs text-muted-foreground">{cmd.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-xs text-muted-foreground space-y-1">
        <div>• Type <kbd className="px-1.5 py-0.5 bg-muted border rounded text-[10px]">/</kbd> to open the menu</div>
        <div>• Use <kbd className="px-1.5 py-0.5 bg-muted border rounded text-[10px]">↑</kbd> <kbd className="px-1.5 py-0.5 bg-muted border rounded text-[10px]">↓</kbd> to navigate</div>
        <div>• Press <kbd className="px-1.5 py-0.5 bg-muted border rounded text-[10px]">Enter</kbd> to insert</div>
      </div>
    </div>
  )
}), { ssr: false });

const InteractiveFormatting = dynamic(() => Promise.resolve(function InteractiveFormatting() {
  const [showToolbar, setShowToolbar] = useState(false)
  
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Highlight.configure({ multicolor: true }),
    ],
    content: '<p>Select this text to see the formatting toolbar appear!</p>',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none p-4 min-h-[120px]',
      },
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection
      setShowToolbar(from !== to)
    },
  })

  if (!editor) return null

  return (
    <div className="rounded-lg border bg-background relative">
      {showToolbar && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 bg-card border rounded-lg shadow-lg p-1">
          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => editor.chain().focus().toggleBold().run()}>
            <strong>B</strong>
          </Button>
          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => editor.chain().focus().toggleItalic().run()}>
            <em>I</em>
          </Button>
          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => editor.chain().focus().toggleUnderline().run()}>
            <u>U</u>
          </Button>
          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => editor.chain().focus().toggleHighlight({ color: '#fbbf24' }).run()}>
            <span className="bg-yellow-400 px-1">H</span>
          </Button>
        </div>
      )}
      <EditorContent editor={editor} />
      <div className="text-xs text-muted-foreground p-3 border-t bg-muted/30">
        💡 Select text to see the floating toolbar • Use <kbd className="px-1.5 py-0.5 bg-white dark:bg-muted border rounded text-[10px]">⌘B</kbd> for bold, <kbd className="px-1.5 py-0.5 bg-white dark:bg-muted border rounded text-[10px]">⌘I</kbd> for italic
      </div>
    </div>
  )
}), { ssr: false });

const InteractiveAdvancedBlocks = dynamic(() => Promise.resolve(function InteractiveAdvancedBlocks() {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: `
      <blockquote>
        <p>"This is a beautiful quote with a styled border"</p>
      </blockquote>
      <pre><code>function hello() {
  console.log("Code block with syntax highlighting");
}</code></pre>
      <ul data-type="taskList">
        <li data-type="taskItem" data-checked="true">Completed task</li>
        <li data-type="taskItem" data-checked="false">Pending task</li>
      </ul>
      <table>
        <tr><th>Feature</th><th>Status</th></tr>
        <tr><td>Tables</td><td>✅ Done</td></tr>
        <tr><td>Task Lists</td><td>✅ Done</td></tr>
      </table>
    `,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none p-4',
      },
    },
  })

  if (!editor) return null

  return (
    <div className="rounded-lg border bg-background">
      <EditorContent editor={editor} />
      <div className="text-xs text-muted-foreground p-3 border-t bg-muted/30">
        💡 All blocks are fully interactive • Click checkboxes, edit tables, and more
      </div>
    </div>
  )
}), { ssr: false });

const InteractiveAutoSave = dynamic(() => Promise.resolve(function InteractiveAutoSave() {
  const [status, setStatus] = useState<'saved' | 'unsaved' | 'saving'>('saved')
  const [text, setText] = useState('Start typing to see auto-save in action...')
  
  useEffect(() => {
    if (status === 'unsaved') {
      const timer = setTimeout(() => {
        setStatus('saving')
        setTimeout(() => setStatus('saved'), 800)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [status, text])
  
  return (
    <div className="rounded-lg border bg-background">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-card">
        <span className="text-sm font-medium">Auto-Save Demo</span>
        {status === 'saving' ? (
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-yellow-500 animate-pulse"></span>
            Saving...
          </span>
        ) : status === 'unsaved' ? (
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-orange-500"></span>
            Unsaved changes
          </span>
        ) : (
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500"></span>
            Saved
          </span>
        )}
      </div>
      <textarea
        className="w-full p-4 bg-transparent border-none focus:outline-none resize-none"
        rows={4}
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          setStatus('unsaved')
        }}
      />
      <div className="text-xs text-muted-foreground p-3 border-t bg-muted/30">
        💡 Status changes: 🟠 Unsaved → 🟡 Saving (after 1s) → 🟢 Saved
      </div>
    </div>
  )
}), { ssr: false });

const InteractiveKeyboard = dynamic(() => Promise.resolve(function InteractiveKeyboard() {
  const shortcuts = [
    { keys: ['/'], label: 'Open slash menu' },
    { keys: ['⌘', 'B'], label: 'Bold' },
    { keys: ['⌘', 'I'], label: 'Italic' },
    { keys: ['⌘', 'U'], label: 'Underline' },
    { keys: ['⌘', 'Shift', 'H'], label: 'Highlight' },
    { keys: ['Tab'], label: 'Indent list' },
    { keys: ['Shift', 'Tab'], label: 'Outdent list' },
    { keys: ['Enter'], label: 'New block' },
    { keys: ['⌘', 'Z'], label: 'Undo' },
    { keys: ['⌘', 'Shift', 'Z'], label: 'Redo' },
  ]
  
  return (
    <div className="rounded-lg border bg-card p-4 space-y-2">
      {shortcuts.map((shortcut, i) => (
        <div key={i} className="flex items-center justify-between p-2 hover:bg-accent/50 rounded transition-colors">
          <span className="text-sm">{shortcut.label}</span>
          <div className="flex gap-1">
            {shortcut.keys.map((key, j) => (
              <kbd 
                key={j} 
                className="px-2.5 py-1.5 text-xs font-semibold bg-white dark:bg-muted border rounded shadow-sm min-w-[28px] text-center"
              >
                {key}
              </kbd>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}), { ssr: false });

const ExampleComponents: Record<string, React.ComponentType> = {
  task: InteractiveDailyTasks,
  kanban: InteractiveKanban,
  editor: InteractiveEditor,
  'notes-intro': InteractiveNotesIntro,
  blocks: InteractiveBlocks,
  'slash-menu': InteractiveSlashMenu,
  formatting: InteractiveFormatting,
  'advanced-blocks': InteractiveAdvancedBlocks,
  autosave: InteractiveAutoSave,
  keyboard: InteractiveKeyboard,
  focus: InteractiveFocusTimer,
  gantt: InteractiveGantt,
  command: InteractiveCommandPalette,
  calendar: InteractiveCalendar,
  shortcuts: KeyboardShortcuts,
}

export default function DocsClient({ sections }: { sections: Record<string, Section[]> }) {
  const [active, setActive] = useState<string>(Object.keys(sections)[0])
  
  return (
    <>
      <MarketingNavbar />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative border-b overflow-hidden">
          <div className="absolute inset-0 -z-10">
            
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />
          </div>
          <div className="mx-auto max-w-6xl px-6 py-20 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white dark:bg-black px-4 py-1.5 text-sm font-medium border shadow-lg shadow-red-500/20 mb-6">
              <Search className="h-4 w-4" />
              <span>Documentation</span>
            </div>
            <h1 className="text-5xl font-bold tracking-tight">Learn Snooze</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Interactive guides, examples, and best practices to master your productivity workflow.
            </p>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-7xl px-6 py-16 grid gap-8 lg:grid-cols-[280px_1fr]">
            {/* Sidebar */}
            <aside className="lg:sticky lg:top-24 h-fit">
              <div className="rounded-xl border bg-card p-3 space-y-1 shadow-sm">
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">Sections</div>
                {Object.keys(sections).map((k) => (
                  <button
                    key={k}
                    onClick={() => setActive(k)}
                    className={`w-full text-left rounded-md px-3 py-2.5 text-sm transition-all duration-200 flex items-center justify-between group ${
                      active === k 
                        ? 'bg-white dark:bg-muted border shadow-md shadow-red-500/20' 
                        : 'hover:bg-red-500/5'
                    }`}
                  >
                    <span>{k}</span>
                    <ArrowRight className={`h-4 w-4 transition-transform ${active === k ? 'translate-x-0' : '-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`} />
                  </button>
                ))}
              </div>
            </aside>

            {/* Content */}
            <div className="space-y-6">
              {(sections[active] || []).map((entry, idx) => (
                <article key={entry.title} className="scroll-mt-24 group">
                  <div className="rounded-xl border bg-card p-8 hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-sm font-bold text-red-600">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold mb-3 group-hover:text-red-600 transition-colors">{entry.title}</h2>
                        <p className="text-muted-foreground leading-7">{entry.body}</p>
                        
                        {entry.example && ExampleComponents[entry.example] && (
                          <div className="mt-6">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="h-px flex-1 bg-border" />
                              <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                                <CheckCircle className="h-4 w-4 text-red-500" />
                                Try it yourself
                              </span>
                              <div className="h-px flex-1 bg-border" />
                            </div>
                            {ExampleComponents[entry.example]}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
