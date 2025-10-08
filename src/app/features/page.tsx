import Link from "next/link"
import { MarketingNavbar } from "@/components/marketing/navbar"
import { AnimatedGrid } from "@/components/animated-grid"
import { 
  CheckCircle, 
  Calendar, 
  Focus, 
  FileText, 
  BarChart3, 
  Users, 
  Zap, 
  Clock,
  Target,
  Sparkles,
  Kanban,
  ListChecks,
  PenTool
} from "lucide-react"
import { CTASection } from "@/components/marketing/cta-section"

export const metadata = {
  title: "Features – Snooze",
  description: "All-in-one productivity workspace: tasks, projects, focus, notes, analytics.",
}

export default function FeaturesPage() {
  return (
    <>
      <MarketingNavbar />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative border-b overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <AnimatedGrid />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,_var(--tw-gradient-stops))] from-red-500/10 via-transparent to-transparent" />
          </div>
          <div className="mx-auto max-w-7xl px-6 py-20 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 px-4 py-1.5 text-sm font-semibold border border-red-500/20 shadow-sm mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Sparkles className="h-4 w-4" />
              <span>Features</span>
            </div>
            <h1 className="text-5xl font-bold tracking-tight animate-in fade-in slide-in-from-bottom-8 duration-700">
              Everything you need to stay productive
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1000">
              Snooze combines task management, project planning, deep work, and insights in a calm, distraction-free workspace.
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={<ListChecks className="h-8 w-8" />}
                title="Tasks & Daily View"
                description="Plan your day with a clear list of priorities. Set due dates, priorities, and track completion."
                points={[
                  "Plan your day with clear priorities",
                  "Recurring tasks and reminders",
                  "Keyboard-first shortcuts"
                ]}
                color="blue"
              />
              <FeatureCard
                icon={<Kanban className="h-8 w-8" />}
                title="Projects & Kanban"
                description="Drag-and-drop boards with labels, assignees, and multiple view modes."
                points={[
                  "Drag-and-drop boards",
                  "Multiple views (List, Kanban, Calendar, Gantt)",
                  "Filtered views by priority or owner"
                ]}
                color="purple"
              />
              <FeatureCard
                icon={<Focus className="h-8 w-8" />}
                title="Focus Mode"
                description="Pomodoro-style sessions to maximize deep work and minimize distractions."
                points={[
                  "Pomodoro-style sessions",
                  "Pause and resume support",
                  "Session history and streaks"
                ]}
                color="green"
              />
              <FeatureCard
                icon={<PenTool className="h-8 w-8" />}
                title="Notes & Rich Editor"
                description="Notion-like editing with slash commands, drag to reorder, and rich formatting."
                points={[
                  "Notion-like editing with slash commands",
                  "Drag to reorder blocks",
                  "Highlight colors and formatting"
                ]}
                color="orange"
              />
              <FeatureCard
                icon={<BarChart3 className="h-8 w-8" />}
                title="Calendar & Analytics"
                description="Visualize tasks on calendar and track progress with beautiful charts."
                points={[
                  "Calendar with task timelines",
                  "Project velocity metrics",
                  "Weekly progress tracking"
                ]}
                color="blue"
              />
              <FeatureCard
                icon={<Users className="h-8 w-8" />}
                title="Workspaces & Collaboration"
                description="Invite teammates, assign work, and collaborate seamlessly."
                points={[
                  "Invite teammates and assign tasks",
                  "Role-based permissions",
                  "Workspace-level dashboards"
                ]}
                color="purple"
              />
            </div>
          </div>
        </section>

        {/* Detailed Features Section */}
        <section className="border-t bg-muted/30 py-16">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">Powerful features for productivity</h2>
              <p className="text-muted-foreground">Explore all the tools that make Snooze special</p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <DetailedFeature
                icon={<Clock className="h-5 w-5" />}
                title="Time Tracking"
                description="Track time spent on tasks and projects automatically"
              />
              <DetailedFeature
                icon={<Target className="h-5 w-5" />}
                title="Smart Priorities"
                description="AI-powered suggestions to help you focus on what matters"
              />
              <DetailedFeature
                icon={<Zap className="h-5 w-5" />}
                title="Command Palette"
                description="Navigate your workspace at lightning speed with ⌘K"
              />
              <DetailedFeature
                icon={<CheckCircle className="h-5 w-5" />}
                title="Subtasks"
                description="Break down complex tasks into manageable steps"
              />
              <DetailedFeature
                icon={<FileText className="h-5 w-5" />}
                title="Comments"
                description="Discuss and collaborate on tasks with your team"
              />
              <DetailedFeature
                icon={<Calendar className="h-5 w-5" />}
                title="Gantt Charts"
                description="Visualize project timelines and dependencies"
              />
            </div>
          </div>
        </section>

        <CTASection />
      </main>
    </>
  )
}

function FeatureCard({ 
  icon, 
  title, 
  description, 
  points, 
  color 
}: { 
  icon: React.ReactNode
  title: string
  description: string
  points: string[]
  color: string
}) {
  const colorClasses: Record<string, string> = {
    blue: "from-blue-500/10 to-blue-500/5",
    purple: "from-purple-500/10 to-purple-500/5",
    green: "from-green-500/10 to-green-500/5",
    orange: "from-orange-500/10 to-orange-500/5",
  }

  const iconColorClasses: Record<string, string> = {
    blue: "text-red-500 bg-red-500/10 border-red-500/20",
    purple: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    green: "text-green-500 bg-green-500/10 border-green-500/20",
    orange: "text-orange-500 bg-orange-500/10 border-orange-500/20",
  }

  return (
    <div className="group relative rounded-2xl border bg-card p-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${colorClasses[color]} opacity-50 group-hover:opacity-100 transition-opacity`} />
      
      <div className="relative">
        <div className={`inline-flex rounded-xl p-3 mb-4 border ${iconColorClasses[color]}`}>
          {icon}
        </div>
        
        <h3 className="text-2xl font-bold mb-3">{title}</h3>
        <p className="text-sm text-muted-foreground mb-6">{description}</p>
        
        <ul className="space-y-3">
          {points.map((point) => (
            <li key={point} className="flex items-start gap-3 text-sm">
              <CheckCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function DetailedFeature({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex items-start gap-4 p-6 rounded-xl border bg-card hover:shadow-lg transition-all">
      <div className="flex-shrink-0 inline-flex rounded-lg bg-red-500/10 p-2.5 text-red-500 border border-red-500/20">
        {icon}
      </div>
      <div className="flex-1">
        <h4 className="font-semibold mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}


