"use client"

import * as React from "react"
import { X, MessageSquare, Timer, Paperclip, MoreVertical, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface RightDrawerProps {
  nodeId: string | null
  onClose: () => void
}

export function RightDrawer({ nodeId, onClose }: RightDrawerProps) {
  const isOpen = nodeId !== null

  // TODO: Fetch node data and work item details from Convex
  const mockData = {
    title: "Design landing page",
    description: "Create a beautiful landing page for the new product launch",
    status: "in_progress",
    priority: "high",
    assignees: ["John Doe", "Jane Smith"],
    tags: ["design", "ui/ux"],
    startDate: "2025-10-15",
    endDate: "2025-10-20",
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[480px] bg-background border-l shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Task Details</h2>
              <div className="flex items-center gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Node
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="details" className="flex-1 flex flex-col">
              <div className="px-4 pt-3">
                <TabsList className="w-full">
                  <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
                  <TabsTrigger value="comments" className="flex-1">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Comments
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="flex-1">
                    <Timer className="h-4 w-4 mr-1" />
                    Activity
                  </TabsTrigger>
                </TabsList>
              </div>

              <ScrollArea className="flex-1">
                {/* Details Tab */}
                <TabsContent value="details" className="p-4 space-y-4 mt-0">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      defaultValue={mockData.title}
                      className="font-medium"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      defaultValue={mockData.description}
                      rows={4}
                      className="resize-none"
                    />
                  </div>

                  <Separator />

                  {/* Status & Priority */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select defaultValue={mockData.status}>
                        <SelectTrigger id="status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="backlog">Backlog</SelectItem>
                          <SelectItem value="todo">Todo</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="in_review">In Review</SelectItem>
                          <SelectItem value="done">Done</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select defaultValue={mockData.priority}>
                        <SelectTrigger id="priority">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start-date">Start Date</Label>
                      <Input
                        id="start-date"
                        type="date"
                        defaultValue={mockData.startDate}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="end-date">Due Date</Label>
                      <Input
                        id="end-date"
                        type="date"
                        defaultValue={mockData.endDate}
                      />
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {mockData.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                      <Button variant="outline" size="sm" className="h-6">
                        + Add Tag
                      </Button>
                    </div>
                  </div>

                  {/* Assignees */}
                  <div className="space-y-2">
                    <Label>Assignees</Label>
                    <div className="flex flex-wrap gap-2">
                      {mockData.assignees.map((assignee) => (
                        <Badge key={assignee} variant="outline">
                          {assignee}
                        </Badge>
                      ))}
                      <Button variant="outline" size="sm" className="h-6">
                        + Assign
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Attachments */}
                  <div className="space-y-2">
                    <Label>Attachments</Label>
                    <Button variant="outline" size="sm" className="w-full">
                      <Paperclip className="h-4 w-4 mr-2" />
                      Add Attachment
                    </Button>
                  </div>
                </TabsContent>

                {/* Comments Tab */}
                <TabsContent value="comments" className="p-4 space-y-4 mt-0">
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No comments yet</p>
                    <p className="text-xs mt-1">Start a conversation about this task</p>
                  </div>
                  <div className="space-y-2">
                    <Textarea placeholder="Write a comment..." rows={3} />
                    <div className="flex justify-end">
                      <Button size="sm">Post Comment</Button>
                    </div>
                  </div>
                </TabsContent>

                {/* Activity Tab */}
                <TabsContent value="activity" className="p-4 space-y-4 mt-0">
                  <div className="space-y-3">
                    {[
                      { action: "created", user: "You", time: "2 hours ago" },
                      { action: "changed status to In Progress", user: "John", time: "1 hour ago" },
                      { action: "added a comment", user: "Jane", time: "30 mins ago" },
                    ].map((activity, i) => (
                      <div key={i} className="flex gap-3 text-sm">
                        <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p>
                            <span className="font-medium">{activity.user}</span>{" "}
                            <span className="text-muted-foreground">{activity.action}</span>
                          </p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>

            {/* Footer Actions */}
            <div className="p-4 border-t flex gap-2">
              <Button className="flex-1">Save Changes</Button>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

