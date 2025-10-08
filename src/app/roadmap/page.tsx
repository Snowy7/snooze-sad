"use client"

import { MarketingNavbar } from "@/components/marketing/navbar"
import { useState } from "react"
import { Check, Clock, Rocket, Sparkles, ChevronUp, ChevronDown, Plus } from "lucide-react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/lib/convex"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"

const roadmapData = {
  now: {
    title: "Now",
    subtitle: "Shipping this month",
    icon: Rocket,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    items: [
      "Mobile app beta (iOS & Android)",
      "Offline mode with sync",
      "Advanced filtering & saved views",
      "Task dependencies & blockers",
      "Calendar integrations (Google, Outlook)"
    ]
  },
  next: {
    title: "Next",
    subtitle: "Q1 2026",
    icon: Clock,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    items: [
      "Recurring project templates",
      "Custom fields & metadata",
      "Time estimates & tracking",
      "Advanced automation rules",
      "Team analytics dashboard",
      "Slack & Discord integrations"
    ]
  },
  later: {
    title: "Later",
    subtitle: "Q2+ 2026",
    icon: Sparkles,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-500/30",
    items: [
      "Public API & webhooks",
      "Custom integrations marketplace",
      "Advanced permissions & roles",
      "Multi-workspace views",
      "AI-powered insights",
      "Voice commands & dictation"
    ]
  }
}

const milestones = [
  {
    date: "October 2025",
    title: "Enhanced visualizations",
    items: [
      "Gantt chart with sticky columns and current day",
      "Calendar view with task spans across dates",
      "Analytics page with completion trends",
      "Project color coding and visual hierarchy"
    ]
  },
  {
    date: "September 2025",
    title: "Editor overhaul",
    items: [
      "Notion-style rich text editor with slash commands",
      "Drag-and-drop block reordering",
      "Dark mode optimized highlights",
      "Debounced autosave for performance"
    ]
  },
  {
    date: "August 2025",
    title: "Collaboration features",
    items: [
      "Workspace invitations and roles",
      "Task assignments and mentions",
      "Activity feeds and notifications",
      "Shared project dashboards"
    ]
  },
  {
    date: "July 2025",
    title: "Foundation & MVP",
    items: [
      "Core task management with projects",
      "Kanban boards with drag-and-drop",
      "Focus mode with Pomodoro timer",
      "Notes with basic rich text",
      "Authentication and user profiles"
    ]
  },
]

export default function RoadmapPage() {
  const [showFeatureDialog, setShowFeatureDialog] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("feature")
  const [userEmail, setUserEmail] = useState("")
  const [userName, setUserName] = useState("")

  const featureRequests = useQuery(api.featureRequests.list, {})
  const createFeatureRequest = useMutation(api.featureRequests.create)
  const voteFeature = useMutation(api.featureRequests.vote)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createFeatureRequest({
        title,
        description,
        category,
        userEmail,
        userName,
      })
      toast.success("Feature request submitted!")
      setShowFeatureDialog(false)
      setTitle("")
      setDescription("")
      setCategory("feature")
      setUserEmail("")
      setUserName("")
    } catch (error) {
      toast.error("Failed to submit feature request")
    }
  }

  const handleVote = async (featureId: any, vote: number) => {
    try {
      await voteFeature({ featureRequestId: featureId, vote })
    } catch (error) {
      toast.error("Please sign in to vote")
    }
  }

  return (
    <>
      <MarketingNavbar />
      <main className="min-h-screen bg-background">
        <section className="border-b">
          <div className="mx-auto max-w-6xl px-6 py-16 text-center">
            <h1 className="text-4xl font-bold tracking-tight">Roadmap</h1>
            <p className="mt-3 text-muted-foreground">Transparent progress on what we're shipping.</p>
          </div>
        </section>

        {/* Roadmap Cards */}
        <section className="border-b">
          <div className="mx-auto max-w-6xl px-6 py-16 grid gap-6 md:grid-cols-3">
            {Object.values(roadmapData).map((phase) => {
              const Icon = phase.icon
              return (
                <div key={phase.title} className={`rounded-xl border ${phase.borderColor} p-6 ${phase.bgColor}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg bg-background/50 ${phase.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{phase.title}</h3>
                      <p className="text-xs text-muted-foreground">{phase.subtitle}</p>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {phase.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <div className={`h-1.5 w-1.5 rounded-full mt-1.5 ${phase.color.replace('text-', 'bg-')}`} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </section>

        {/* Feature Requests */}
        <section className="border-b bg-muted/30">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-semibold">Feature Requests</h2>
                <p className="text-sm text-muted-foreground mt-1">Vote on features you'd like to see</p>
              </div>
              <Dialog open={showFeatureDialog} onOpenChange={setShowFeatureDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-black text-white hover:bg-black/90 border border-red-500/30">
                    <Plus className="h-4 w-4 mr-2" />
                    Request Feature
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Request a Feature</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Title</label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Feature title"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe the feature in detail"
                        rows={4}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Category</label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="feature">New Feature</SelectItem>
                          <SelectItem value="improvement">Improvement</SelectItem>
                          <SelectItem value="bug">Bug Report</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Your Name</label>
                      <Input
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Optional"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Your Email</label>
                      <Input
                        type="email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        placeholder="Optional"
                      />
                    </div>
                    <Button type="submit" className="w-full">Submit Request</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {featureRequests?.map((request) => (
                <div key={request._id} className="rounded-xl border bg-card p-4 flex items-start gap-4">
                  <div className="flex flex-col items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 hover:bg-red-500/10"
                      onClick={() => handleVote(request._id, 1)}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <div className="text-sm font-semibold">{request.netVotes}</div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 hover:bg-red-500/10"
                      onClick={() => handleVote(request._id, -1)}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{request.title}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        request.status === 'planned' ? 'bg-red-500/10 text-red-600 border border-red-500/20' :
                        request.status === 'in-progress' ? 'bg-purple-500/10 text-purple-600 border border-purple-500/20' :
                        request.status === 'completed' ? 'bg-green-500/10 text-green-600 border border-green-500/20' :
                        'bg-gray-500/10 text-gray-600 border border-gray-500/20'
                      }`}>
                        {request.status}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {request.category}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{request.description}</p>
                    {request.userName && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Requested by {request.userName}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Shipped Milestones */}
        <section>
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="text-2xl font-semibold mb-8">Shipped milestones</h2>
            <div className="relative">
              <div className="absolute left-[15px] top-0 bottom-0 w-px bg-border" />
              <div className="space-y-8">
                {milestones.map((milestone) => (
                  <div key={milestone.date} className="relative pl-12">
                    <div className="absolute left-0 top-1">
                      <div className="h-8 w-8 rounded-full border-4 border-background bg-green-500 flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="rounded-xl border bg-card p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold">{milestone.title}</h3>
                        <span className="text-sm text-muted-foreground">{milestone.date}</span>
                      </div>
                      <ul className="space-y-1 text-sm text-muted-foreground list-disc pl-5">
                        {milestone.items.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
