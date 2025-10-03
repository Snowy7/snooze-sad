"use client"

import { useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/lib/convex"
import { useOwnerId } from "@/hooks/use-owner"
import { useWorkspace } from "@/hooks/use-workspace"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { ArrowLeft, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function NewProjectPage() {
  const router = useRouter()
  const ownerId = useOwnerId()
  const { currentWorkspaceId, workspaces, currentWorkspace } = useWorkspace()
  const createProject = useMutation(api.functions.upsertProject)
  
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [color, setColor] = useState("blue")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error("Project name is required")
      return
    }

    if (!currentWorkspaceId) {
      toast.error("Please select a workspace from the sidebar")
      return
    }

    toast.promise(
      createProject({
        id: null,
        name,
        description,
        color,
        startDate,
        endDate,
        ownerId,
        workspaceId: currentWorkspaceId,
      }).then((id) => {
        router.push(`/projects/${id}`)
      }),
      {
        loading: 'Creating project...',
        success: 'Project created!',
        error: 'Failed to create project'
      }
    )
  }

  const colors = [
    { value: "blue", label: "Blue", class: "bg-blue-500" },
    { value: "green", label: "Green", class: "bg-green-500" },
    { value: "purple", label: "Purple", class: "bg-purple-500" },
    { value: "orange", label: "Orange", class: "bg-orange-500" },
    { value: "pink", label: "Pink", class: "bg-pink-500" },
    { value: "red", label: "Red", class: "bg-red-500" },
  ]

  return (
    <div className="p-6 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <Link href="/projects">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </Link>
      </div>

      <Card className="p-8">
        <h1 className="text-2xl font-bold mb-6">Create New Project</h1>
        
        {workspaces.length === 0 ? (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You need to create a workspace first before creating projects.{" "}
              <Link href="/workspaces/new" className="underline font-medium">
                Create Workspace
              </Link>
            </AlertDescription>
          </Alert>
        ) : !currentWorkspaceId ? (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please select a workspace from the sidebar before creating a project.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="mb-6 bg-blue-500/10 border-blue-500/20">
            <AlertCircle className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-blue-600 dark:text-blue-400">
              Creating project in <strong>{currentWorkspace?.name}</strong> workspace
            </AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Website Redesign"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Brief description of the project..."
            />
          </div>

          <div>
            <Label htmlFor="color">Color</Label>
            <Select value={color} onValueChange={setColor}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {colors.map(c => (
                  <SelectItem key={c.value} value={c.value}>
                    <div className="flex items-center gap-2">
                      <div className={`h-4 w-4 rounded-full ${c.class}`} />
                      {c.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Link href="/projects" className="flex-1">
              <Button type="button" variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="flex-1">
              Create Project
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
