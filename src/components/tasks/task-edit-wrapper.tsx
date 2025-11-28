"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Maximize2, PanelRight, Square, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { TaskEditPanel } from "./task-edit-panel"
import { TaskEditTwoColumn } from "./task-edit-two-column"
import { TaskEditEnhanced } from "./task-edit-enhanced"

type ViewMode = "modal" | "side" | "fullscreen"

interface TaskEditWrapperProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: any
  workspaceId: string
  projectId?: string
  onTaskUpdate?: (taskId: string, updates: any) => void
}

const VIEW_MODE_KEY = "task-edit-view-mode"

// Inline editable title component
function EditableTitle({ 
  value, 
  onChange, 
  className 
}: { 
  value: string
  onChange: (value: string) => void
  className?: string
}) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [editValue, setEditValue] = React.useState(value)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  React.useEffect(() => {
    setEditValue(value)
  }, [value])

  const handleSave = () => {
    if (editValue.trim() && editValue !== value) {
      onChange(editValue.trim())
    } else {
      setEditValue(value)
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      setEditValue(value)
      setIsEditing(false)
    }
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={cn(
          "text-lg font-semibold bg-transparent border-none outline-none focus:ring-0 w-full",
          className
        )}
        placeholder="Task title..."
      />
    )
  }

  return (
    <h2
      onDoubleClick={() => setIsEditing(true)}
      className={cn(
        "text-lg font-semibold cursor-text hover:bg-muted/50 px-2 py-0.5 rounded transition-colors -ml-2",
        className
      )}
      title="Double-click to edit"
    >
      {value || "Untitled Task"}
    </h2>
  )
}

export function TaskEditWrapper({
  open,
  onOpenChange,
  task,
  workspaceId,
  projectId,
  onTaskUpdate,
}: TaskEditWrapperProps) {
  const [viewMode, setViewMode] = React.useState<ViewMode>("side")

  // Load view mode from localStorage on mount
  React.useEffect(() => {
    const savedMode = localStorage.getItem(VIEW_MODE_KEY) as ViewMode
    if (savedMode && ["modal", "side", "fullscreen"].includes(savedMode)) {
      setViewMode(savedMode)
    }
  }, [])

  // Save view mode to localStorage when it changes
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode)
    localStorage.setItem(VIEW_MODE_KEY, mode)
  }

  // Early return if task is null
  if (!task) {
    return null
  }

  // View mode switcher component
  const ViewModeSwitcher = () => (
    <TooltipProvider>
      <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant={viewMode === "modal" ? "default" : "ghost"}
              onClick={() => handleViewModeChange("modal")}
              className="h-7 w-7 p-0"
            >
              <Square className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Center Modal</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant={viewMode === "side" ? "default" : "ghost"}
              onClick={() => handleViewModeChange("side")}
              className="h-7 w-7 p-0"
            >
              <PanelRight className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Side Panel</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant={viewMode === "fullscreen" ? "default" : "ghost"}
              onClick={() => handleViewModeChange("fullscreen")}
              className="h-7 w-7 p-0"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Full Screen</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )

  // Modal View (Center)
  if (viewMode === "modal") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[85vw] w-[85vw] h-[90vh] p-0 gap-0 flex flex-col" showCloseButton={false}>
          <DialogTitle className="sr-only">Edit Task</DialogTitle>
          <TaskEditEnhanced
            task={task}
            workspaceId={workspaceId}
            projectId={projectId}
            onClose={() => onOpenChange(false)}
            title={task.title}
            onTitleChange={(newTitle) => onTaskUpdate?.(task._id, { title: newTitle })}
            viewModeSwitcher={<ViewModeSwitcher />}
          />
        </DialogContent>
      </Dialog>
    )
  }

  // Side Panel View (Custom implementation without Sheet)
  if (viewMode === "side") {
    return (
      <>
        {/* Backdrop */}
        {open && (
          <div 
            className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
            data-state={open ? "open" : "closed"}
            onClick={() => onOpenChange(false)}
          />
        )}
        
        {/* Side Panel */}
        <div 
          className={cn(
            "fixed right-0 top-0 z-50 h-screen w-full sm:max-w-2xl bg-background shadow-2xl",
            "flex flex-col gap-0 border-l",
            "transition-transform duration-300 ease-in-out",
            open ? "translate-x-0" : "translate-x-full"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-3 border-b bg-background h-fit">
            <EditableTitle 
              value={task.title}
              onChange={(newTitle) => onTaskUpdate?.(task._id, { title: newTitle })}
              className="flex-1 mr-4"
            />
            <div className="flex items-center gap-2">
              <ViewModeSwitcher />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 p-0 hover:bg-accent rounded-sm"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <TaskEditPanel
              open={open}
              onOpenChange={onOpenChange}
              task={task}
              workspaceId={workspaceId}
              projectId={projectId}
              hideHeader={true}
              hideTitleField={true}
            />
          </div>
        </div>
      </>
    )
  }

  // Fullscreen View
  if (viewMode === "fullscreen") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent 
          className="!max-w-none !w-screen !h-screen p-0 gap-0 !m-0 rounded-none !top-0 !left-0 !translate-x-0 !translate-y-0 data-[state=open]:slide-in-from-bottom-0 data-[state=closed]:slide-out-to-bottom-0 flex flex-col" 
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">Edit Task</DialogTitle>
          <TaskEditEnhanced
            task={task}
            workspaceId={workspaceId}
            projectId={projectId}
            onClose={() => onOpenChange(false)}
            title={task.title}
            onTitleChange={(newTitle: string) => onTaskUpdate?.(task._id, { title: newTitle })}
            viewModeSwitcher={<ViewModeSwitcher />}
          />
        </DialogContent>
      </Dialog>
    )
  }

  return null
}

