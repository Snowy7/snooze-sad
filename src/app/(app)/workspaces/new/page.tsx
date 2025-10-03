"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "convex/react"
import { api } from "@/lib/convex"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Building2 } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function NewWorkspacePage() {
  const router = useRouter()
  const createWorkspace = useMutation(api.workspaces.createWorkspace)
  
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error("Workspace name is required")
      return
    }

    setIsCreating(true)
    try {
      const workspaceId = await createWorkspace({
        name: name.trim(),
        description: description.trim() || undefined,
      })
      
      toast.success("Workspace created successfully!")
      router.push("/dashboard")
    } catch (error) {
      console.error(error)
      toast.error("Failed to create workspace")
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl p-8" data-onboarding="workspace-form">
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
            
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Create Workspace</h1>
                <p className="text-muted-foreground">
                  Set up a new workspace to collaborate with your team
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Workspace Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="My Workspace"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isCreating}
                  className="text-base"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  Choose a name that represents your team or project
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="What's this workspace for?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isCreating}
                  rows={4}
                  className="text-base resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Help your team understand the purpose of this workspace
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isCreating}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating || !name.trim()}
                className="flex-1"
              >
                {isCreating ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Building2 className="h-4 w-4 mr-2" />
                    Create Workspace
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Info */}
          <div className="pt-4 border-t">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">What you can do with workspaces:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Organize projects and tasks by team or department</li>
                <li>Invite team members and collaborate in real-time</li>
                <li>Set different permission levels for members</li>
                <li>Track activity and progress across all projects</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

