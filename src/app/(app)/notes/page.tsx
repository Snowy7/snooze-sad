"use client"

import { useState, useEffect, useCallback } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/lib/convex"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Plus, FileText, Search, Trash2, Save } from "lucide-react"
import { useOwnerId } from "@/hooks/use-owner"
import { RichTextEditor } from "@/components/rich-text-editor"
import { format } from "date-fns"
import { useDebounce } from "@/hooks/use-debounce"

export default function NotesPage() {
  const ownerId = useOwnerId()
  const notes = useQuery(api.functions.listNotes, { ownerId }) || []
  const upsertNote = useMutation(api.functions.upsertNote)
  const deleteNote = useMutation(api.functions.deleteNote)
  
  const [search, setSearch] = useState("")
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const selectedNote = notes.find((n: any) => n._id === selectedNoteId)
  
  // Auto-save debounced
  const debouncedContent = useDebounce(content, 1000)
  const debouncedTitle = useDebounce(title, 1000)
  
  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title || "")
      setContent(selectedNote.content || "")
      setHasChanges(false)
    } else if (!selectedNoteId && !hasChanges) {
      setTitle("")
      setContent("")
    }
  }, [selectedNote, selectedNoteId])

  useEffect(() => {
    if (hasChanges && selectedNoteId && !isSaving) {
      handleSave(true)
    }
  }, [debouncedContent, debouncedTitle])

  const filteredNotes = notes.filter((n: any) => 
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content?.toLowerCase().includes(search.toLowerCase())
  )

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
      setHasChanges(false)
      if (!isAutoSave) toast.success("Note saved")
    } catch (error) {
      if (!isAutoSave) toast.error("Failed to save note")
    } finally {
      setIsSaving(false)
    }
  }

  function handleNew() {
    setSelectedNoteId(null)
    setTitle("Untitled")
    setContent("")
    setHasChanges(true)
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
          setHasChanges(false)
        }
      }),
      {
        loading: 'Deleting note...',
        success: 'Note deleted',
        error: 'Failed to delete note'
      }
    )
  }

  return (
    <div className="flex gap-0 h-[calc(100vh-3.5rem)] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-80 border-r flex flex-col bg-muted/30">
        <div className="p-4 border-b bg-background/50">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search notes..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8" />
            </div>
            <Button size="sm" className="gap-1" onClick={handleNew}><Plus className="h-4 w-4" /></Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground px-4">
              {search ? "No notes found" : "No notes yet"}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredNotes.map((n: any) => (
                <div key={n._id} className="group">
                  <button 
                    onClick={() => setSelectedNoteId(n._id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${selectedNoteId === n._id ? 'bg-accent' : 'hover:bg-accent/50'}`}
                  >
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate text-sm">{n.title}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {format(new Date(n.createdAt), "MMM d, yyyy")}
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => { e.stopPropagation(); handleDelete(n._id); }}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden bg-background">
        {!selectedNoteId && !hasChanges ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center space-y-3">
              <FileText className="h-16 w-16 mx-auto opacity-10" />
              <div>
                <p className="font-medium">No note selected</p>
                <p className="text-sm mt-1">Select a note or create a new one</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="p-6 pb-4 border-b bg-background/50">
              <div className="flex items-center gap-4">
                <Input 
                  placeholder="Note title..." 
                  value={title} 
                  onChange={e => { setTitle(e.target.value); setHasChanges(true); }}
                  className="text-2xl font-bold border-none focus-visible:ring-0 flex-1" 
                />
                <Button 
                  size="sm" 
                  onClick={() => handleSave(false)} 
                  disabled={!hasChanges || isSaving}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? "Saving..." : hasChanges ? "Save" : "Saved"}
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {(selectedNoteId || hasChanges) && (
                <RichTextEditor 
                  key={selectedNoteId || "new"}
                  content={content}
                  onChange={(newContent) => { setContent(newContent); setHasChanges(true); }}
                  placeholder="Start writing your note..."
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
