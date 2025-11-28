"use client"

import * as React from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/lib/convex"
import { BoardLogo } from "@/components/board-logo"
import { FloatingSidebar } from "@/components/floating-sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import { useRouter } from "next/navigation"
import { useOwnerId } from "@/hooks/use-owner"
import { Button } from "@/components/ui/button"
import { RichTextEditor } from "@/components/rich-text-editor"
import { Plus, FileText, Trash2, ChevronDown, Clock, Search } from "lucide-react"
import { format } from "date-fns"
import { useDebounce } from "@/hooks/use-debounce"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function PersonalDocsPage() {
  const router = useRouter()
  const ownerId = useOwnerId()
  const [mode, setMode] = React.useState<"personal" | "team">("personal")
  const [searchQuery, setSearchQuery] = React.useState("")

  const handleModeChange = (newMode: "personal" | "team") => {
    setMode(newMode)
    if (newMode === "team") {
      router.push("/dashboard")
    }
  }

  // Get user's workspace
  const workspaces = useQuery(api.workspaces.listMyWorkspaces, {})
  const workspace = workspaces?.find((w: any) => w.ownerId === ownerId)

  // Get only type "document" documents
  const docsData = useQuery(
    api.workItems.listWorkItems,
    workspace ? { workspaceId: workspace._id, type: "document" } : "skip"
  )
  const docs = docsData || []
  const isLoading = docsData === undefined

  const createWorkItem = useMutation(api.workItems.createWorkItem)
  const updateWorkItem = useMutation(api.workItems.updateWorkItem)
  const deleteWorkItem = useMutation(api.workItems.deleteWorkItem)

  const [selectedDocId, setSelectedDocId] = React.useState<string | null>(null)
  const [title, setTitle] = React.useState("")
  const [content, setContent] = React.useState("")
  const [isSaving, setIsSaving] = React.useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false)

  // Use refs to track loaded state
  const loadedContentRef = React.useRef({ title: "", content: "" })
  const isLoadingDocRef = React.useRef(false)

  const selectedDoc = docs.find((d: any) => d._id === selectedDocId)

  // Debounced auto-save
  const debouncedContent = useDebounce(content, 1000)
  const debouncedTitle = useDebounce(title, 1000)

  // Filter docs by search query
  const filteredDocs = React.useMemo(() => {
    if (!searchQuery.trim()) return docs
    const query = searchQuery.toLowerCase()
    return docs.filter((d: any) => 
      d.title.toLowerCase().includes(query) ||
      d.content?.toLowerCase().includes(query)
    )
  }, [docs, searchQuery])

  // Load doc content when selected
  React.useEffect(() => {
    if (selectedDoc) {
      isLoadingDocRef.current = true
      const docTitle = selectedDoc.title || ""
      const docContent = selectedDoc.content || ""
      setTitle(docTitle)
      setContent(docContent)
      loadedContentRef.current = { title: docTitle, content: docContent }
      setHasUnsavedChanges(false)
      setTimeout(() => {
        isLoadingDocRef.current = false
      }, 100)
    }
  }, [selectedDoc])

  // Track changes
  React.useEffect(() => {
    if (isLoadingDocRef.current) return
    if (!selectedDocId) return

    const hasChanges =
      title !== loadedContentRef.current.title ||
      content !== loadedContentRef.current.content

    setHasUnsavedChanges(hasChanges)
  }, [title, content, selectedDocId])

  // Auto-save
  React.useEffect(() => {
    if (isLoadingDocRef.current) return
    if (!selectedDocId) return
    if (isSaving) return

    const hasActualChanges =
      debouncedTitle !== loadedContentRef.current.title ||
      debouncedContent !== loadedContentRef.current.content

    if (hasActualChanges) {
      handleSave(true)
    }
  }, [debouncedContent, debouncedTitle])

  // Auto-select first doc
  React.useEffect(() => {
    if (!selectedDocId && docs.length > 0) {
      setSelectedDocId(docs[0]._id)
    }
  }, [docs, selectedDocId])

  async function handleSave(isAutoSave = false) {
    if (!title.trim() || !workspace) return

    setIsSaving(true)
    try {
      if (selectedDocId) {
        await updateWorkItem({
          workItemId: selectedDocId as any,
          title,
          content,
        })
      } else {
        const id = await createWorkItem({
          workspaceId: workspace._id,
          type: "document",
          title,
          content,
        })
        setSelectedDocId(id as any)
      }

      loadedContentRef.current = { title, content }
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error("Failed to save doc:", error)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleNew() {
    if (!workspace) return

    isLoadingDocRef.current = true
    setIsSaving(true)
    
    try {
      // Actually create the document in the database
      const id = await createWorkItem({
        workspaceId: workspace._id,
        type: "document",
        title: "Untitled",
        content: "<p></p>",
      })
      
      // Now select the newly created doc
      setSelectedDocId(id as any)
      setTitle("Untitled")
      setContent("<p></p>")
      loadedContentRef.current = { title: "Untitled", content: "<p></p>" }
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error("Failed to create doc:", error)
    } finally {
      setIsSaving(false)
      setTimeout(() => {
        isLoadingDocRef.current = false
      }, 100)
    }
  }

  async function handleDelete(id: string) {
    const confirm = window.confirm("Delete this doc? This cannot be undone.")
    if (!confirm) return

    await deleteWorkItem({ workItemId: id as any })
    if (selectedDocId === id) {
      setSelectedDocId(null)
      setTitle("")
      setContent("")
      loadedContentRef.current = { title: "", content: "" }
    }
  }

  if (isLoading) {
    return (
      <div className="relative w-full h-full">
        <BoardLogo showWorkspaceSwitcher={false} />
        <FloatingSidebar mode="personal" />
        <ModeToggle mode={mode} onModeChange={handleModeChange} />
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Loading docs...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <BoardLogo showWorkspaceSwitcher={false} />
      <FloatingSidebar mode="personal" />
      <ModeToggle mode={mode} onModeChange={handleModeChange} />

      <div className="w-full h-full flex flex-col pt-16">
        {/* Top Bar */}
        <div className="flex-shrink-0 flex items-center justify-between px-8 py-3 border-b w-full">
          <div className="flex items-center gap-3">
            {/* Docs Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 h-9 px-3">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">
                    {selectedDoc ? selectedDoc.title : selectedDocId ? title : "Select a doc"}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-80">
                <div className="px-2 py-1.5">
                  <Button size="sm" className="w-full gap-2 h-8" onClick={handleNew}>
                    <Plus className="h-4 w-4" />
                    New Doc
                  </Button>
                </div>
                <DropdownMenuSeparator />
                
                {/* Search in dropdown */}
                <div className="px-2 pb-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 h-8 text-sm"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>

                <ScrollArea className="max-h-96">
                  {filteredDocs.length === 0 ? (
                    <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                      {searchQuery ? "No docs found" : "No docs yet"}
                    </div>
                  ) : (
                    filteredDocs.map((d: any) => (
                      <DropdownMenuItem
                        key={d._id}
                        onClick={() => setSelectedDocId(d._id)}
                        className={`flex items-start gap-3 p-3 cursor-pointer ${
                          selectedDocId === d._id ? "bg-accent" : ""
                        }`}
                      >
                        <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate text-sm">{d.title}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock className="h-3 w-3" />
                            {format(new Date(d.createdAt), "MMM d, yyyy")}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(d._id)
                          }}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </DropdownMenuItem>
                    ))
                  )}
                </ScrollArea>
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
            ) : selectedDocId ? (
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500"></span>
                Saved
              </span>
            ) : null}
          </div>
        </div>

        {/* Content Area */}
        {!selectedDocId ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground/20" />
              <div>
                <p className="text-lg font-medium text-muted-foreground">No doc selected</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Select a doc from the sidebar or create a new one
                </p>
              </div>
              <Button onClick={handleNew} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Doc
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
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-3xl sm:text-4xl md:text-5xl font-bold border-none focus:outline-none bg-transparent px-0 py-2 placeholder:text-muted-foreground/30 text-foreground"
              />
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-hidden">
              <RichTextEditor
                key={selectedDocId || "new"}
                content={content}
                onChange={setContent}
                placeholder="Start writing..."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

