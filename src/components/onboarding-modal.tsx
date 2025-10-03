"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, Calendar, FolderKanban, Target, BarChart3, ArrowRight, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface OnboardingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const steps = [
  {
    title: "Welcome to Snooze!",
    description: "Your all-in-one productivity hub. Let's take a quick tour of what you can do.",
    icon: <CheckCircle className="h-12 w-12 text-blue-500" />,
    features: [
      "Organize tasks and projects in one place",
      "Track habits and build streaks",
      "Focus with Pomodoro timers",
      "Analyze your productivity"
    ]
  },
  {
    title: "Daily Tasks",
    description: "Start your day by checking what's on your plate. Add personal tasks or see what's due from your projects.",
    icon: <Calendar className="h-12 w-12 text-green-500" />,
    features: [
      "Quick-add tasks for today",
      "Check off completed items",
      "See tasks from all projects",
      "Set due dates and priorities"
    ]
  },
  {
    title: "Projects & Kanban",
    description: "Organize work into projects with Kanban boards. Drag tasks through Backlog → In Progress → Done.",
    icon: <FolderKanban className="h-12 w-12 text-purple-500" />,
    features: [
      "Create unlimited projects",
      "Drag & drop task management",
      "Add labels, tags, and milestones",
      "Track project progress"
    ]
  },
  {
    title: "Focus Mode",
    description: "Enter deep work with a fullscreen timer. Select any task and start a focus session.",
    icon: <Target className="h-12 w-12 text-orange-500" />,
    features: [
      "Pomodoro-style timer",
      "Distraction-free interface",
      "Custom timer durations",
      "Track time spent on tasks"
    ]
  },
  {
    title: "Analytics & Insights",
    description: "Visualize your productivity. See completion trends, time distribution, and habit streaks.",
    icon: <BarChart3 className="h-12 w-12 text-blue-500" />,
    features: [
      "Completed tasks over time",
      "Time spent per project",
      "Habit streak tracking",
      "Weekly productivity summary"
    ]
  }
]

export function OnboardingModal({ open, onOpenChange }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const router = useRouter()
  const step = steps[currentStep]

  function handleNext() {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Mark onboarding as complete
      localStorage.setItem("onboarding_completed", "true")
      onOpenChange(false)
      router.push("/dashboard")
    }
  }

  function handlePrevious() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  function handleSkip() {
    localStorage.setItem("onboarding_completed", "true")
    onOpenChange(false)
    router.push("/dashboard")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            {step.icon}
          </div>
          <DialogTitle className="text-2xl text-center">{step.title}</DialogTitle>
          <DialogDescription className="text-center text-base">
            {step.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <ul className="space-y-3">
            {step.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex gap-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === currentStep ? "bg-blue-500" : "bg-muted"
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              Skip Tour
            </Button>
            {currentStep > 0 && (
              <Button variant="outline" size="sm" onClick={handlePrevious}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
            )}
            <Button size="sm" onClick={handleNext}>
              {currentStep < steps.length - 1 ? (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-1" />
                </>
              ) : (
                "Get Started"
              )}
            </Button>
          </div>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Step {currentStep + 1} of {steps.length}
        </p>
      </DialogContent>
    </Dialog>
  )
}

