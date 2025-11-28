"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, FolderKanban, Target, Calendar, Sparkles } from "lucide-react"
import { useMutation } from "convex/react"
import { api } from "@/lib/convex"
import { Id } from "../../../convex/_generated/dataModel"
import { toast } from "sonner"
import { motion } from "framer-motion"

interface EmptyProjectsStateProps {
  workspaceId: Id<"workspaces">
}

export function EmptyProjectsState({ workspaceId }: EmptyProjectsStateProps) {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [isCreating, setIsCreating] = React.useState(false)

  const createProject = useMutation(api.projects.createProject)

  const handleCreateProject = async () => {
    if (!name.trim()) {
      toast.error("Please enter a project name")
      return
    }

    setIsCreating(true)
    try {
      await createProject({
        workspaceId,
        name: name.trim(),
        description: description.trim() || undefined,
        status: "active",
      })
      
      toast.success("Project created successfully!")
      setName("")
      setDescription("")
      setOpen(false)
    } catch (error) {
      console.error("Failed to create project:", error)
      toast.error("Failed to create project")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-8 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        <Card className="border-2 border-dashed shadow-xl">
          <CardHeader className="text-center space-y-4 pb-8 pt-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center"
            >
              <FolderKanban className="h-10 w-10 text-primary" />
            </motion.div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                No Projects Yet
              </CardTitle>
              <CardDescription className="text-base">
                Get started by creating your first project. Organize your work, track progress, and collaborate with your team.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pb-10">
            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <Target className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-semibold text-sm">Track Goals</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Set milestones and objectives
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <Calendar className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-semibold text-sm">Plan Sprints</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Organize work in iterations
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <Sparkles className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-semibold text-sm">Collaborate</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Work together seamlessly
                </p>
              </motion.div>
            </div>

            {/* Create Project Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="w-full"
                >
                  <Button size="lg" className="w-full gap-2 shadow-lg hover:shadow-xl transition-all">
                    <Plus className="h-5 w-5" />
                    Create Your First Project
                  </Button>
                </motion.div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>
                    Give your project a name and description to get started.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Project Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Website Redesign, Mobile App, Q4 Goals"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleCreateProject()
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="What's this project about?"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setOpen(false)}
                    disabled={isCreating}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateProject}
                    disabled={isCreating || !name.trim()}
                  >
                    {isCreating ? "Creating..." : "Create Project"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
