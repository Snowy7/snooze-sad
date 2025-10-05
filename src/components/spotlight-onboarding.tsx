"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, ArrowLeft, X, CheckCircle, Hand, Sparkles, Palette } from "lucide-react"
import { useRouter } from "next/navigation"
import { AccentColorPicker } from "@/components/accent-color-picker"
import { useMutation } from "convex/react"
import { api } from "@/lib/convex"
import { useAuth } from "@workos-inc/authkit-nextjs/components"
import { CommandShortcut } from "@/components/ui/command" 

interface OnboardingStep {
  id: string
  title: string
  description: string
  targetSelector: string
  position: "top" | "bottom" | "left" | "right"
  shortcut?: string
  action?: () => void
  customContent?: React.ReactNode
}

const steps: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to Snooze!",
    description: "Let's take a quick tour of your new productivity hub. We'll show you the key features to get you started.",
    targetSelector: "body",
    position: "bottom"
  },
  {
    id: "accent-color",
    title: "Choose Your Style",
    description: "Pick your favorite accent color to personalize your workspace. You can always change it later in Settings!",
    targetSelector: "body",
    position: "bottom"
  },
  {
    id: "sidebar",
    title: "Navigation Sidebar",
    description: "Access all your tools from here: Dashboard, Daily Tasks, Projects, Habits, Notes, Focus Mode, and more. Use keyboard shortcuts for quick navigation!",
    targetSelector: "[data-onboarding='sidebar']",
    position: "right",
    shortcut: "sidebar"
  },
  {
    id: "command-menu",
    title: "Command Menu",
    description: "The fastest way to navigate! Type to search and access any feature instantly. All shortcuts are listed here.",
    targetSelector: "[data-onboarding='search']",
    position: "bottom",
    shortcut: "command"
  },
  {
    id: "quick-actions",
    title: "Quick Actions",
    description: "Jump into your day with these quick action buttons. Start a focus session or manage your daily tasks with one click.",
    targetSelector: "[data-onboarding='quick-actions']",
    position: "bottom",
    shortcut: "actions"
  },
  {
    id: "stats",
    title: "Your Progress at a Glance",
    description: "Track your daily completion rate, overdue tasks, and active projects. Stay on top of your productivity goals!",
    targetSelector: "[data-onboarding='stats']",
    position: "bottom",
    shortcut: "navigation"
  },
  {
    id: "create-workspace",
    title: "Create Your First Workspace",
    description: "Workspaces help you organize projects by team, department, or personal goals. Fill out this form to create your first one!",
    targetSelector: "[data-onboarding='workspace-form']",
    position: "right"
  }
]

export function SpotlightOnboarding() {
  const router = useRouter()
  const { user } = useAuth()
  const updateAccentColorByEmail = useMutation(api.users.updateAccentColorByEmail)
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [selectedAccent, setSelectedAccent] = useState<string>(
    typeof window !== 'undefined' ? localStorage.getItem('accentColor') || 'slate' : 'slate'
  )

  useEffect(() => {
    // Detect mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("spotlight_onboarding_completed")
    const dismissed = localStorage.getItem("onboarding_dismissed")
    
    if (!hasSeenOnboarding && !dismissed) {
      // Make sure we're on the dashboard before starting onboarding
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : ''
      if (currentPath !== '/dashboard') {
        // Navigate to dashboard, but don't show onboarding yet
        router.push('/dashboard')
        return
      }
      
      // Wait for dashboard to fully render before showing onboarding
      setTimeout(() => {
        // Double-check we're still on dashboard
        if (window.location.pathname === '/dashboard') {
          setIsActive(true)
        }
      }, 1000)
    }
  }, [router])

  useEffect(() => {
    if (!isActive) return

    const updateTargetRect = () => {
      // On mobile, don't show highlights
      if (isMobile) {
        setTargetRect(null);
        return;
      }

      const step = steps[currentStep]
      const target = document.querySelector(step.targetSelector)
      
      if (target) {
        const rect = target.getBoundingClientRect()
        setTargetRect(rect)
      } else {
        setTargetRect(null)
      }
    }

    updateTargetRect()
    window.addEventListener("resize", updateTargetRect)
    window.addEventListener("scroll", updateTargetRect)

    return () => {
      window.removeEventListener("resize", updateTargetRect)
      window.removeEventListener("scroll", updateTargetRect)
    }
  }, [isActive, currentStep, isMobile])

  const handleAccentColorChange = async (color: string) => {
    setSelectedAccent(color)
    
    // Save to localStorage immediately
    localStorage.setItem('accentColor', color)
    
    // Update DOM for instant feedback
    document.documentElement.setAttribute("data-accent", color)
    
    // Save to database in the background
    if (user?.email) {
      try {
        await updateAccentColorByEmail({ 
          email: user.email,
          accentColor: color 
        })
      } catch (error) {
        console.log("Could not save accent color:", error)
      }
    }
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1
      
      // If moving to the "Create Workspace" step (last step), navigate first
      if (nextStep === steps.length - 1) {
        router.push("/workspaces/new")
        // Wait for navigation and form render before showing the step
        setTimeout(() => {
          setCurrentStep(nextStep)
        }, 500)
      } else {
        setCurrentStep(nextStep)
      }
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1
      
      // If going back from "Create Workspace" step (last step), navigate to dashboard first
      if (currentStep === steps.length - 1) {
        router.push("/dashboard")
        // Wait for navigation before updating step
        setTimeout(() => {
          setCurrentStep(prevStep)
        }, 300)
      } else {
        setCurrentStep(prevStep)
      }
    }
  }

  const handleSkip = () => {
    localStorage.setItem("onboarding_dismissed", "true")
    setIsActive(false)
  }

  const handleComplete = async () => {
    localStorage.setItem("spotlight_onboarding_completed", "true")
    
    // Just close onboarding - navigation already happened when reaching step 6
    setIsActive(false)
  }

  if (!isActive) return null

  const step = steps[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1
  const isAccentColorStep = step.id === "accent-color"

  // Calculate tooltip position
  const getTooltipStyle = () => {
    // On mobile or for first step, accent color step, or when target not found, center the tooltip
    if (isMobile || !targetRect || isFirstStep || isAccentColorStep) {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        maxWidth: isMobile ? "calc(100vw - 2rem)" : (isAccentColorStep ? "700px" : "600px"),
        padding: isMobile ? "0 1rem" : "0 20px"
      }
    }

    const padding = 20
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight
    let top = 0
    let left = 0

    switch (step.position) {
      case "bottom":
        top = targetRect.bottom + padding
        left = targetRect.left + targetRect.width / 2
        // Keep within viewport
        if (top > windowHeight - 300) top = targetRect.top - padding - 200
        return { 
          top: `${Math.max(20, top)}px`, 
          left: `${left}px`, 
          transform: "translateX(-50%)",
          maxWidth: "90vw"
        }
      
      case "top":
        top = targetRect.top - padding - 200
        left = targetRect.left + targetRect.width / 2
        return { 
          top: `${Math.max(20, top)}px`, 
          left: `${left}px`, 
          transform: "translateX(-50%)",
          maxWidth: "90vw"
        }
      
      case "right":
        top = targetRect.top + targetRect.height / 2
        left = targetRect.right + padding
        // Keep within viewport
        if (left > windowWidth - 500) {
          left = targetRect.left - padding
          return { 
            top: `${top}px`, 
            left: `${left}px`, 
            transform: "translate(-100%, -50%)",
            maxWidth: "90vw"
          }
        }
        return { 
          top: `${top}px`, 
          left: `${left}px`, 
          transform: "translateY(-50%)",
          maxWidth: "90vw"
        }
      
      case "left":
        top = targetRect.top + targetRect.height / 2
        left = targetRect.left - padding
        return { 
          top: `${top}px`, 
          left: `${left}px`, 
          transform: "translate(-100%, -50%)",
          maxWidth: "90vw"
        }
      
      default:
        return {
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          maxWidth: "500px"
        }
    }
  }

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Dark overlay with cutout using SVG mask */}
      {targetRect && !isFirstStep && !isAccentColorStep && !isMobile ? (
        <>
          {/* Blurred dark overlay with SVG cutout */}
          <div className="absolute inset-0 pointer-events-auto" onClick={handleSkip}>
            <svg className="w-full h-full">
              <defs>
                <filter id="backdrop-blur">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
                </filter>
                <mask id="spotlight-mask">
                  {/* White background for the mask */}
                  <rect x="0" y="0" width="100%" height="100%" fill="white" />
                  {/* Black cutout for the spotlight (reveals the content) */}
                  <rect
                    x={targetRect.left - 16}
                    y={targetRect.top - 16}
                    width={targetRect.width + 32}
                    height={targetRect.height + 32}
                    rx="16"
                    fill="black"
                  />
                </mask>
              </defs>
              {/* Dark overlay with mask applied */}
              <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="rgba(0, 0, 0, 0.85)"
                mask="url(#spotlight-mask)"
                style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
              />
            </svg>
          </div>
          
          {/* Additional blur layer that respects the cutout */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              maskImage: `radial-gradient(
                circle at ${targetRect.left + targetRect.width / 2}px ${targetRect.top + targetRect.height / 2}px,
                transparent ${Math.max(targetRect.width, targetRect.height) / 2 + 80}px,
                black ${Math.max(targetRect.width, targetRect.height) / 2 + 120}px
              )`
            }}
          />
        </>
      ) : (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-sm pointer-events-auto" onClick={handleSkip} />
      )}
      
      {/* Blue highlight ring around the spotlight */}
      {targetRect && !isFirstStep && !isAccentColorStep && !isMobile && (
        <>
          <div
            className="absolute rounded-xl transition-all duration-300 pointer-events-none"
            style={{
              top: `${targetRect.top - 8}px`,
              left: `${targetRect.left - 8}px`,
              width: `${targetRect.width + 16}px`,
              height: `${targetRect.height + 16}px`,
              border: '4px solid rgb(var(--accent-500))',
              boxShadow: `
                0 0 0 0 rgba(var(--accent-500), 1),
                0 0 10px rgba(var(--accent-500), 0.8),
                0 0 20px rgba(var(--accent-500), 0.7),
                0 0 30px rgba(var(--accent-500), 0.6),
                0 0 40px rgba(var(--accent-500), 0.5),
                0 0 60px rgba(var(--accent-500), 0.4),
                0 0 80px rgba(var(--accent-500), 0.3),
                inset 0 0 30px rgba(var(--accent-500), 0.3)
              `,
              animation: 'ring-pulse 2s ease-in-out infinite'
            }}
          />
          {/* Transparent overlay on the highlighted area to allow clicks */}
          <div
            className="absolute pointer-events-auto cursor-pointer"
            style={{
              top: `${targetRect.top - 8}px`,
              left: `${targetRect.left - 8}px`,
              width: `${targetRect.width + 16}px`,
              height: `${targetRect.height + 16}px`,
            }}
            onClick={(e) => {
              e.stopPropagation()
              // Allow clicks to pass through to the element below
            }}
          />
        </>
      )}

      {/* Tooltip */}
      <div
        className="absolute pointer-events-auto px-4"
        style={getTooltipStyle()}
      >
        <style>{`
          @keyframes wave {
            0%, 100% { transform: rotate(0deg); }
            10%, 30% { transform: rotate(14deg); }
            20% { transform: rotate(-8deg); }
            40% { transform: rotate(-4deg); }
            50% { transform: rotate(10deg); }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          
          @keyframes pulse-glow {
            0%, 100% { 
              filter: brightness(1);
              transform: scale(1);
            }
            50% { 
              filter: brightness(1.2);
              transform: scale(1.05);
            }
          }
          
          @keyframes ring-pulse {
            0%, 100% {
              box-shadow: 
                0 0 0 0 rgba(var(--accent-500), 1),
                0 0 10px rgba(var(--accent-500), 0.8),
                0 0 20px rgba(var(--accent-500), 0.7),
                0 0 30px rgba(var(--accent-500), 0.6),
                0 0 40px rgba(var(--accent-500), 0.5),
                0 0 60px rgba(var(--accent-500), 0.4),
                0 0 80px rgba(var(--accent-500), 0.3),
                inset 0 0 30px rgba(var(--accent-500), 0.3);
            }
            50% {
              box-shadow: 
                0 0 0 8px rgba(var(--accent-500), 0),
                0 0 15px rgba(var(--accent-500), 0.9),
                0 0 30px rgba(var(--accent-500), 0.8),
                0 0 45px rgba(var(--accent-500), 0.7),
                0 0 60px rgba(var(--accent-500), 0.6),
                0 0 80px rgba(var(--accent-500), 0.5),
                0 0 100px rgba(var(--accent-500), 0.4),
                0 0 120px rgba(var(--accent-500), 0.3),
                inset 0 0 40px rgba(var(--accent-500), 0.4);
            }
          }
          
          @keyframes bounce-in {
            0% { transform: scale(0.3); opacity: 0; }
            50% { transform: scale(1.05); }
            70% { transform: scale(0.9); }
            100% { transform: scale(1); opacity: 1; }
          }
          
          .wave-emoji {
            display: inline-block;
            animation: wave 2s ease-in-out infinite;
            transform-origin: 70% 70%;
          }
          
          .float-emoji {
            display: inline-block;
            animation: float 3s ease-in-out infinite;
          }
          
          .pulse-ring {
            animation: pulse-glow 2s ease-in-out infinite;
          }
          
          .bounce-in {
            animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          }
        `}</style>
        
        <div className={`bg-card border border-border rounded-lg shadow-2xl space-y-4 w-full bounce-in ${
          isMobile ? "p-4 max-w-[calc(100vw-2rem)]" : (isAccentColorStep ? "p-6 max-w-2xl" : "p-6 max-w-md")
        }`}>
          <div className="flex items-start justify-between">
              <div className="flex-1">
              <div className="space-y-2">
                <h3 className={`${isMobile ? "text-base" : "text-lg"} font-semibold flex items-center gap-2 flex-wrap`}>
                  {isFirstStep ? (
                    <>
                      {step.title}
                      <Hand className="wave-emoji h-6 w-6 text-primary" />
                    </>
                  ) : isAccentColorStep ? (
                    <>
                      {step.title}
                      <Palette className="float-emoji h-6 w-6 text-primary" />
                    </>
                  ) : isLastStep ? (
                    <>
                      {step.title}
                      <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                    </>
                  ) : (
                    step.title
                  )}
                </h3>
                {step.shortcut && !isMobile && (
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {step.shortcut === "sidebar" && (
                      <>
                        <div className="inline-flex items-center gap-2">
                          <CommandShortcut>⇧⌘D</CommandShortcut>
                          <span className="text-xs text-muted-foreground">Dashboard</span>
                        </div>
                        <div className="inline-flex items-center gap-2">
                          <CommandShortcut>⇧⌘T</CommandShortcut>
                          <span className="text-xs text-muted-foreground">Tasks</span>
                        </div>
                        <div className="inline-flex items-center gap-2">
                          <CommandShortcut>⇧⌘P</CommandShortcut>
                          <span className="text-xs text-muted-foreground">Projects</span>
                        </div>
                      </>
                    )}
                    {step.shortcut === "command" && (
                      <div className="inline-flex items-center gap-2">
                        <CommandShortcut>⌘K</CommandShortcut>
                        <span className="text-xs text-muted-foreground">or</span>
                        <CommandShortcut>Ctrl+K</CommandShortcut>
                      </div>
                    )}
                    {step.shortcut === "actions" && (
                      <>
                        <div className="inline-flex items-center gap-2">
                          <CommandShortcut>⌘F</CommandShortcut>
                          <span className="text-xs text-muted-foreground">Focus</span>
                        </div>
                        <div className="inline-flex items-center gap-2">
                          <CommandShortcut>⌘N</CommandShortcut>
                          <span className="text-xs text-muted-foreground">Note</span>
                        </div>
                        <div className="inline-flex items-center gap-2">
                          <CommandShortcut>⇧⌘X</CommandShortcut>
                          <span className="text-xs text-muted-foreground">Project</span>
                        </div>
                      </>
                    )}
                    {step.shortcut === "navigation" && (
                      <>
                        <div className="inline-flex items-center gap-2">
                          <CommandShortcut>⇧⌘A</CommandShortcut>
                          <span className="text-xs text-muted-foreground">Analytics</span>
                        </div>
                        <div className="inline-flex items-center gap-2">
                          <CommandShortcut>⇧⌘H</CommandShortcut>
                          <span className="text-xs text-muted-foreground">Habits</span>
                        </div>
                        <div className="inline-flex items-center gap-2">
                          <CommandShortcut>⇧⌘C</CommandShortcut>
                          <span className="text-xs text-muted-foreground">Calendar</span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mt-3">{step.description}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 -mt-1 -mr-1 hover:rotate-90 transition-transform duration-300"
              onClick={handleSkip}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Accent Color Picker for accent-color step */}
          {isAccentColorStep && (
            <div className="pt-2">
              <AccentColorPicker 
                value={selectedAccent}
                onChange={handleAccentColorChange}
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="flex gap-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    index === currentStep
                      ? "w-6 accent-bg"
                      : index < currentStep
                      ? "w-1.5 accent-bg opacity-60 scale-110"
                      : "w-1.5 bg-muted"
                  }`}
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    ...(index === currentStep && {
                      boxShadow: `
                        0 0 5px rgba(var(--accent-500), 0.9),
                        0 0 10px rgba(var(--accent-500), 0.8),
                        0 0 15px rgba(var(--accent-500), 0.7),
                        0 0 20px rgba(var(--accent-500), 0.6),
                        0 0 25px rgba(var(--accent-500), 0.5),
                        0 0 30px rgba(var(--accent-500), 0.4),
                        0 0 40px rgba(var(--accent-500), 0.3)
                      `,
                      animation: 'pulse-glow 2s ease-in-out infinite'
                    }),
                    ...(index < currentStep && {
                      boxShadow: `
                        0 0 5px rgba(var(--accent-500), 0.6),
                        0 0 10px rgba(var(--accent-500), 0.5),
                        0 0 15px rgba(var(--accent-500), 0.4)
                      `
                    })
                  }}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {!isFirstStep && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handlePrevious}
                  className="hover:scale-105 transition-transform"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              )}
              <Button 
                size="sm" 
                onClick={handleNext} 
                className="gap-1 hover:scale-105 transition-transform accent-bg text-white hover:opacity-90"
              >
                {isLastStep ? (
                  <>
                    <CheckCircle className="h-4 w-4 animate-pulse" />
                    Finish
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </div>
          </div>

          <p className="text-xs text-center text-muted-foreground animate-pulse">
            {currentStep + 1} of {steps.length}
          </p>
        </div>
      </div>
    </div>
  )
}

