"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle, ArrowRight, X, Sparkles } from "lucide-react"
import Link from "next/link"

interface OnboardingStep {
  id: string
  title: string
  description: string
  cta: string
  href: string
  completed: boolean
}

export function ActiveOnboarding() {
  const [dismissed, setDismissed] = useState(false)
  const [steps, setSteps] = useState<OnboardingStep[]>([
    {
      id: "create_project",
      title: "Create Your First Project",
      description: "Organize your work by creating a project. You can add tasks, set milestones, and track progress.",
      cta: "Create Project",
      href: "/projects/new",
      completed: false
    },
    {
      id: "add_daily_task",
      title: "Add a Daily Task",
      description: "Start your productivity journey by adding a task for today. Keep track of what needs to get done.",
      cta: "Go to Daily Tasks",
      href: "/daily",
      completed: false
    },
    {
      id: "create_habit",
      title: "Track a Habit",
      description: "Build consistency by tracking a daily habit. Create your first habit and start building streaks.",
      cta: "Create Habit",
      href: "/habits",
      completed: false
    },
    {
      id: "try_focus_mode",
      title: "Try Focus Mode",
      description: "Experience deep work with our Pomodoro-style focus timer. Select a task and start a focus session.",
      cta: "Start Focus Session",
      href: "/focus",
      completed: false
    },
    {
      id: "explore_shortcuts",
      title: "Learn Keyboard Shortcuts",
      description: "Work faster with keyboard shortcuts. Press Cmd/Ctrl + K to open the command menu anytime.",
      cta: "Try It Now",
      href: "#",
      completed: false
    }
  ])

  useEffect(() => {
    const onboardingDismissed = localStorage.getItem("active_onboarding_dismissed")
    if (onboardingDismissed) {
      setDismissed(true)
    }

    // Load completed steps from localStorage
    const completedSteps = localStorage.getItem("onboarding_completed_steps")
    if (completedSteps) {
      const completed = JSON.parse(completedSteps)
      setSteps(prevSteps =>
        prevSteps.map(step => ({
          ...step,
          completed: completed.includes(step.id)
        }))
      )
    }
  }, [])

  const handleDismiss = () => {
    localStorage.setItem("active_onboarding_dismissed", "true")
    setDismissed(true)
  }

  const handleStepComplete = (stepId: string) => {
    const completedSteps = localStorage.getItem("onboarding_completed_steps")
    const completed = completedSteps ? JSON.parse(completedSteps) : []
    
    if (!completed.includes(stepId)) {
      completed.push(stepId)
      localStorage.setItem("onboarding_completed_steps", JSON.stringify(completed))
      
      setSteps(prevSteps =>
        prevSteps.map(step =>
          step.id === stepId ? { ...step, completed: true } : step
        )
      )
    }
  }

  const completedCount = steps.filter(s => s.completed).length
  const progress = (completedCount / steps.length) * 100
  const currentStep = steps.find(s => !s.completed)

  if (dismissed || completedCount === steps.length) {
    return null
  }

  return (
    <Card className="relative overflow-hidden border-blue-500/50 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-foreground"
        onClick={handleDismiss}
      >
        <X className="h-4 w-4" />
      </Button>

      <div className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Sparkles className="h-5 w-5 text-blue-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">Get Started with Snooze</h3>
            <p className="text-sm text-muted-foreground">
              Complete these steps to unlock the full power of your productivity hub
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {completedCount} of {steps.length} completed
            </span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {currentStep && (
          <div className="p-4 rounded-lg border bg-card/50 space-y-3">
            <div className="flex items-start gap-3">
              <Circle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium mb-1">{currentStep.title}</h4>
                <p className="text-sm text-muted-foreground">{currentStep.description}</p>
              </div>
            </div>
            <Link href={currentStep.href}>
              <Button size="sm" className="w-full gap-2" onClick={() => handleStepComplete(currentStep.id)}>
                {currentStep.cta}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground mb-2">All Steps:</p>
          <div className="grid grid-cols-1 gap-2">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex items-center gap-2 text-sm ${
                  step.completed ? "text-muted-foreground line-through" : "text-foreground"
                }`}
              >
                {step.completed ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}
                <span className="text-xs">{step.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}

