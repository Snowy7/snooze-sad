"use client"

import { useState, useEffect, useRef } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/lib/convex"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Plus, FileText, Trash2, ChevronDown, Clock } from "lucide-react"
import { useOwnerId } from "@/hooks/use-owner"
import { RichTextEditor } from "@/components/rich-text-editor"
import { format } from "date-fns"
import { useDebounce } from "@/hooks/use-debounce"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function NotesPage() {
  const ownerId = useOwnerId()
  const notesData = useQuery(api.functions.listNotes, { ownerId })
  const notes = notesData || []
  const upsertNote = useMutation(api.functions.upsertNote)
  const deleteNote = useMutation(api.functions.deleteNote)
  const isLoading = notesData === undefined
  
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  
  // Use refs to track the loaded state and prevent saving during load
  const loadedContentRef = useRef({ title: "", content: "" })
  const isLoadingNoteRef = useRef(false)

  const selectedNote = notes.find((n: any) => n._id === selectedNoteId)
  
  // Auto-save debounced - only save after user stops typing for 3 seconds
  const debouncedContent = useDebounce(content, 1000)
  const debouncedTitle = useDebounce(title, 1000)
  
  // Load note content when selected note changes
  useEffect(() => {
    if (selectedNote) {
      isLoadingNoteRef.current = true
      const noteTitle = selectedNote.title || ""
      const noteContent = selectedNote.content || ""
      setTitle(noteTitle)
      setContent(noteContent)
      loadedContentRef.current = { title: noteTitle, content: noteContent }
      setHasUnsavedChanges(false)
      // Reset loading flag after a brief delay
      setTimeout(() => {
        isLoadingNoteRef.current = false
      }, 100)
    }
  }, [selectedNote])
  
  // Track changes in real-time for status indicator
  useEffect(() => {
    if (isLoadingNoteRef.current) return
    if (!selectedNoteId) return
    
    const hasChanges = 
      title !== loadedContentRef.current.title ||
      content !== loadedContentRef.current.content
    
    setHasUnsavedChanges(hasChanges)
  }, [title, content, selectedNoteId])

  // Auto-save when debounced values change
  useEffect(() => {
    // Don't save if we're currently loading a note
    if (isLoadingNoteRef.current) return
    
    // Don't save if no note is selected
    if (!selectedNoteId) return
    
    // Don't save if already saving
    if (isSaving) return
    
    // Check if content actually changed from what was loaded
    const hasActualChanges = 
      debouncedTitle !== loadedContentRef.current.title ||
      debouncedContent !== loadedContentRef.current.content
    
    if (hasActualChanges) {
      handleSave(true)
    }
  }, [debouncedContent, debouncedTitle])

  // Auto-select first note if none selected
  useEffect(() => {
    if (!selectedNoteId && notes.length > 0) {
      setSelectedNoteId(notes[0]._id)
    }
  }, [notes, selectedNoteId])

  async function handleSave(isAutoSave = false) {
    if (!title.trim()) {
      if (!isAutoSave) toast.error("Title is required")
      return
    }
    
    setIsSaving(true)
    try {
      const id = await upsertNote({ 
        id: selectedNoteId as any, 
        title, 
        content, 
        ownerId 
      })
      if (!selectedNoteId) setSelectedNoteId(id as any)
      
      // Update the loaded content ref to prevent re-saving
      loadedContentRef.current = { title, content }
      setHasUnsavedChanges(false)
      
      if (!isAutoSave) toast.success("Note saved")
    } catch (error) {
      if (!isAutoSave) toast.error("Failed to save note")
    } finally {
      setIsSaving(false)
    }
  }

  function handleNew() {
    isLoadingNoteRef.current = true
    setSelectedNoteId(null)
    setTitle("Untitled")
    setContent("<p></p>")
    loadedContentRef.current = { title: "Untitled", content: "<p></p>" }
    setHasUnsavedChanges(false)
    setTimeout(() => {
      isLoadingNoteRef.current = false
    }, 100)
  }

  async function handleDelete(id: string) {
    const confirm = window.confirm("Delete this note? This cannot be undone.")
    if (!confirm) return
    
    toast.promise(
      deleteNote({ id: id as any }).then(() => {
        if (selectedNoteId === id) {
          setSelectedNoteId(null)
          setTitle("")
          setContent("")
          loadedContentRef.current = { title: "", content: "" }
        }
      }),
      {
        loading: 'Deleting note...',
        success: 'Note deleted',
        error: 'Failed to delete note'
      }
    )
  }

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading notes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Top Bar - Notion Style */}
      <div className="flex-shrink-0 flex items-center justify-between px-8 py-3 border-b w-full">
        <div className="flex items-center gap-3">
          {/* Notes Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 h-9 px-3">
                <FileText className="h-4 w-4" />
                <span className="font-medium">
                  {selectedNote ? selectedNote.title : selectedNoteId ? title : "Select a note"}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-80">
              <div className="px-2 py-1.5">
                <Button 
                  size="sm" 
                  className="w-full gap-2 h-8" 
                  onClick={handleNew}
                >
                  <Plus className="h-4 w-4" />
                  New Note
                </Button>
              </div>
              <DropdownMenuSeparator />
              <div className="max-h-96 overflow-y-auto">
                {notes.length === 0 ? (
                  <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                    No notes yet
                  </div>
                ) : (
                  notes.map((n: any) => (
                    <DropdownMenuItem
                      key={n._id}
                      onClick={() => setSelectedNoteId(n._id)}
                      className={`flex items-start gap-3 p-3 cursor-pointer ${
                        selectedNoteId === n._id ? 'bg-accent' : ''
                      }`}
                    >
                      <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate text-sm">{n.title}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" />
                          {format(new Date(n.createdAt), "MMM d, yyyy")}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(n._id)
                        }}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </DropdownMenuItem>
                  ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Status Indicator */}
          {isSaving ? (
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-yellow-500 animate-pulse"></span>
              Saving...
            </span>
          ) : hasUnsavedChanges ? (
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-orange-500"></span>
              Unsaved changes
            </span>
          ) : selectedNoteId ? (
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500"></span>
              Saved
            </span>
          ) : null}
        </div>
      </div>

      {/* Content Area */}
      {!selectedNoteId ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground/20" />
            <div>
              <p className="text-lg font-medium text-muted-foreground">No note selected</p>
              <p className="text-sm text-muted-foreground mt-1">
                Select a note from the dropdown or create a new one
              </p>
            </div>
            <Button onClick={handleNew} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Note
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Title Input - Notion Style */}
          <div className="flex-shrink-0 px-4 sm:px-8 md:px-16 lg:px-32 xl:px-48 pt-12 pb-4 w-full">
            <input 
              type="text"
              placeholder="Untitled" 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              className="w-full text-3xl sm:text-4xl md:text-5xl font-bold border-none focus:outline-none bg-transparent px-0 py-2 placeholder:text-muted-foreground/30 text-foreground" 
            />
          </div>

          {/* Editor */}
          <div className="flex-1 overflow-hidden">
            <RichTextEditor 
              key={selectedNoteId || "new"}
              content={content}
              onChange={setContent}
              placeholder="Start writing..."
            />
          </div>
        </div>
      )}
    </div>
  )
}