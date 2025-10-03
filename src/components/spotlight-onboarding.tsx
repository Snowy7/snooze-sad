"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, ArrowLeft, X, CheckCircle, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"

interface OnboardingStep {
  id: string
  title: string
  description: string
  targetSelector: string
  position: "top" | "bottom" | "left" | "right"
  shortcut?: string
  action?: () => void
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
    id: "sidebar",
    title: "Navigation Sidebar",
    description: "Access all your tools from here: Dashboard, Daily Tasks, Projects, Habits, Notes, Focus Mode, and more. Use keyboard shortcuts for quick navigation!",
    targetSelector: "[data-onboarding='sidebar']",
    position: "right",
    shortcut: "⇧⌘D Dashboard • ⇧⌘T Tasks • ⇧⌘P Projects"
  },
  {
    id: "command-menu",
    title: "Command Menu",
    description: "The fastest way to navigate! Type to search and access any feature instantly. All shortcuts are listed here.",
    targetSelector: "[data-onboarding='search']",
    position: "bottom",
    shortcut: "⌘K or Ctrl+K"
  },
  {
    id: "quick-actions",
    title: "Quick Actions",
    description: "Jump into your day with these quick action buttons. Start a focus session or manage your daily tasks with one click.",
    targetSelector: "[data-onboarding='quick-actions']",
    position: "bottom",
    shortcut: "⌘F Focus Mode • ⌘N New Note • ⇧⌘X New Project"
  },
  {
    id: "stats",
    title: "Your Progress at a Glance",
    description: "Track your daily completion rate, overdue tasks, and active projects. Stay on top of your productivity goals!",
    targetSelector: "[data-onboarding='stats']",
    position: "bottom",
    shortcut: "⇧⌘A Analytics • ⇧⌘H Habits • ⇧⌘C Calendar"
  }
]

export function SpotlightOnboarding() {
  const router = useRouter()
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("spotlight_onboarding_completed")
    const dismissed = localStorage.getItem("onboarding_dismissed")
    
    if (!hasSeenOnboarding && !dismissed) {
      // Delay to let the page render
      setTimeout(() => setIsActive(true), 500)
    }
  }, [])

  useEffect(() => {
    if (!isActive) return

    const updateTargetRect = () => {
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
  }, [isActive, currentStep])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    localStorage.setItem("onboarding_dismissed", "true")
    setIsActive(false)
  }

  const handleComplete = async () => {
    localStorage.setItem("spotlight_onboarding_completed", "true")
    setIsActive(false)
    
    // After onboarding, check if user needs to create a workspace
    // The layout will handle the redirect
  }

  if (!isActive) return null

  const step = steps[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1

  // Calculate tooltip position
  const getTooltipStyle = () => {
    // For first step or when target not found, center the tooltip
    if (!targetRect || isFirstStep) {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        maxWidth: "500px",
        padding: "0 20px"
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
      {targetRect && !isFirstStep ? (
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
                    x={targetRect.left - 8}
                    y={targetRect.top - 8}
                    width={targetRect.width + 16}
                    height={targetRect.height + 16}
                    rx="12"
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
                transparent ${Math.max(targetRect.width, targetRect.height) / 2 + 20}px,
                black ${Math.max(targetRect.width, targetRect.height) / 2 + 30}px
              )`
            }}
          />
        </>
      ) : (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-sm pointer-events-auto" onClick={handleSkip} />
      )}
      
      {/* Blue highlight ring around the spotlight */}
      {targetRect && !isFirstStep && (
        <>
          <style>{`
            @keyframes ring-pulse {
              0%, 100% {
                box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7),
                            0 0 20px rgba(59, 130, 246, 0.5);
              }
              50% {
                box-shadow: 0 0 0 8px rgba(59, 130, 246, 0),
                            0 0 40px rgba(59, 130, 246, 0.8);
              }
            }
            .ring-pulse {
              animation: ring-pulse 2s ease-in-out infinite;
            }
          `}</style>
          <div
            className="absolute rounded-xl ring-4 ring-blue-500 ring-pulse transition-all duration-300 pointer-events-none"
            style={{
              top: `${targetRect.top - 8}px`,
              left: `${targetRect.left - 8}px`,
              width: `${targetRect.width + 16}px`,
              height: `${targetRect.height + 16}px`,
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
            0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
            50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); }
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
        
        <div className="bg-card border border-border rounded-lg shadow-2xl p-6 space-y-4 w-full max-w-md bounce-in">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  {isFirstStep ? (
                    <>
                      {step.title}
                      <Sparkles className="wave-emoji h-6 w-6 text-primary" />
                    </>
                  ) : (
                    step.title
                  )}
                </h3>
                {step.shortcut && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/20">
                    <kbd className="text-xs font-mono text-blue-600 dark:text-blue-400">
                      {step.shortcut}
                    </kbd>
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

          <div className="flex items-center justify-between pt-2">
            <div className="flex gap-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    index === currentStep
                      ? "w-6 bg-blue-500 pulse-ring"
                      : index < currentStep
                      ? "w-1.5 bg-green-500 scale-110"
                      : "w-1.5 bg-muted"
                  }`}
                  style={{
                    animationDelay: `${index * 0.1}s`
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
                className="gap-1 hover:scale-105 transition-transform bg-blue-500 hover:bg-blue-600"
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

