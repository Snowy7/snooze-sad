"use client"

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Focus, BarChart3, CheckCircle, Zap, Users, TrendingUp, Target, Clock, Sparkles, ArrowRight, PlayCircle, Star, FileText } from "lucide-react";
import { MarketingNavbar } from "@/components/marketing/navbar";
import { AnimatedGrid } from "@/components/animated-grid";
import { Metadata } from "next";
import { TodayCard } from "@/components/app/today-card";
import { OverdueList } from "@/components/app/overdue-list";
import { CalendarNow } from "@/components/app/calendar-now";
import { ProgressMini } from "@/components/app/progress-mini";
import { RecentNotes } from "@/components/app/recent-notes";
import { LogoIcon } from "@/components/logo";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { CTASection } from "@/components/marketing/cta-section";

const metadata: Metadata = {
  title: 'Snooze - Stay Organized. Stay Focused. Stay in Flow.',
  description: 'Combine daily habits, project management, and deep-focus sessions in one minimal workspace. Built for focus with Kanban boards, Pomodoro sessions, habit tracking, and analytics to help you achieve more.',
  keywords: ['productivity app', 'task manager', 'project management', 'focus timer', 'pomodoro technique', 'habit tracker', 'kanban board', 'time tracking', 'work organization', 'productivity tool'],
  openGraph: {
    title: 'Snooze - Stay Organized. Stay Focused. Stay in Flow.',
    description: 'Combine daily habits, project management, and deep-focus sessions in one minimal workspace designed to help you achieve more.',
    url: 'https://snooze.app',
    siteName: 'Snooze',
    type: 'website',
    images: [
      {
        url: '/images/app.png',
        width: 1920,
        height: 1080,
        alt: 'Snooze - Modern productivity workspace with dashboard, tasks, and projects',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Snooze - Stay Organized. Stay Focused. Stay in Flow.',
    description: 'Combine daily habits, project management, and deep-focus sessions in one minimal workspace.',
    images: ['/images/app.png'],
    creator: '@snoozeapp',
  },
  alternates: {
    canonical: 'https://snooze.app',
  },
};

export default function Home() {
  const { user } = useAuth()
  
  // Structured Data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Snooze",
    "applicationCategory": "ProductivityApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1250"
    },
    "description": "Combine daily habits, project management, and deep-focus sessions in one minimal workspace designed to help you achieve more."
  };

  return (
    <main className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <MarketingNavbar />
      
      {/* Hero Section */}
      <section className="relative isolate overflow-hidden min-h-screen flex items-center pt-16">
        {/* Clean Atmospheric Background */}
        <div className="absolute inset-0 -z-10">
          <AnimatedGrid />
          {/* Single, focused gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 via-background to-background" />
          {/* Subtle glow effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-red-500/10 blur-[120px] rounded-full" />
        </div>
        
        <div className="mx-auto max-w-7xl px-6 w-full py-12">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Refined Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 px-4 py-1.5 text-sm font-semibold border border-red-500/20 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Sparkles className="h-4 w-4" />
              <span>All-in-one productivity workspace</span>
            </div>

            {/* Clean, Bold Heading */}
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-700">
              <span className="block text-foreground">
                Stay Organized.
              </span>
              <span className="block text-foreground">
                Stay Focused.
              </span>
              <span className="block bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
                Stay in Flow.
              </span>
            </h1>

            {/* Clear Description */}
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000">
              The productivity workspace that combines daily tasks, project management, and deep-focus sessions—without the chaos.
            </p>

            {/* Prominent CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-16 duration-1000">
              {user ? (
                <Link href="/dashboard" className="group relative inline-flex h-14 items-center gap-2 rounded-xl bg-red-500 px-10 text-base font-semibold text-white shadow-lg shadow-red-500/25 transition-all hover:shadow-xl hover:shadow-red-500/30 hover:scale-[1.02] hover:bg-red-600">
                  <span>Go to Dashboard</span>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              ) : (
                <Link href="/auth" className="group relative inline-flex h-14 items-center gap-2 rounded-xl bg-red-500 px-10 text-base font-semibold text-white shadow-lg shadow-red-500/25 transition-all hover:shadow-xl hover:shadow-red-500/30 hover:scale-[1.02] hover:bg-red-600">
                  <span>Get Started Free</span>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              )}
              <Link href="/docs" className="group inline-flex h-14 items-center gap-2 rounded-xl border-2 px-10 text-base font-semibold hover:bg-muted transition-all">
                <span>View Documentation</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm text-muted-foreground animate-in fade-in slide-in-from-bottom-20 duration-1200">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-red-500" />
                <span>Free forever</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-red-500" />
                <span>No credit card</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-red-500" />
                <span>1,000+ users</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-20 duration-1000">
            <StatBadge value="10K+" label="Active Users" />
            <StatBadge value="500K+" label="Tasks Completed" />
            <StatBadge value="98%" label="Satisfaction" />
            <StatBadge value="4.8★" label="User Rating" />
          </div>

          {/* App Screenshot */}
          <div className="mt-20 relative animate-in fade-in zoom-in-95 duration-1000 delay-300">
            <div className="absolute inset-0 rounded-xl" />
            <div className="relative rounded-xl border-2 bg-background/50 backdrop-blur-sm shadow-2xl overflow-hidden ring-1 ring-black/5 hover:scale-[1.02] transition-transform duration-500">
              <Image
                src="/images/app.png"
                alt="Snooze dashboard showing daily tasks, projects, and productivity analytics"
                width={1920}
                height={1080}
                className="w-full h-full object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Bento Grid */}
      <section id="features" className="border-t bg-muted/30 relative overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:py-32">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold bg-primary/10 text-primary border border-primary/20 mb-6 shadow-sm">
              <Zap className="h-4 w-4" />
              <span>Powerful Features</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              Everything you need to stay productive
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">Powerful features wrapped in a simple, beautiful interface</p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              title="Daily Tasks" 
              description="Manage routines with recurring templates. Set priorities, deadlines, and track completion." 
              icon={<CalendarDays className="h-6 w-6" />}
            />
            <FeatureCard 
              title="Projects" 
              description="Organize work with Kanban boards, Gantt charts, and team assignments." 
              icon={<CheckCircle className="h-6 w-6" />}
            />
            <FeatureCard 
              title="Focus Mode" 
              description="Pomodoro-style sessions to maximize deep work and minimize distractions." 
              icon={<Focus className="h-6 w-6" />}
            />
            <FeatureCard 
              title="Analytics" 
              description="Track progress, streaks, and time spent per project with beautiful charts." 
              icon={<BarChart3 className="h-6 w-6" />}
            />
            <FeatureCard 
              title="Team Collaboration" 
              description="Invite team members, assign tasks, and work together seamlessly." 
              icon={<Users className="h-6 w-6" />}
            />
            <FeatureCard 
              title="Rich Notes" 
              description="Notion-like editor with slash commands, drag-to-reorder, and rich formatting." 
              icon={<FileText className="h-6 w-6" />}
            />
          </div>
        </div>
      </section>

      {/* Interactive Preview Section - Mini Workspace */}
      <section id="preview" className="border-t">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Mini Workspace</h2>
            <p className="mt-3 text-muted-foreground">A focused snapshot of your day with tasks, calendar, progress, and notes</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Column 1: Today & Overdue */}
            <div className="space-y-6">
              <TodayCard tasks={[
                { id: "t1", title: "Write project brief", due: "Today" },
                { id: "t2", title: "Review PR #128", due: "Today" },
                { id: "t3", title: "Plan sprint backlog" },
              ]} />
              <OverdueList items={[
                { id: "o1", title: "Finalize Q3 roadmap", due: "2d" },
                { id: "o2", title: "Email contractor NDA", due: "5d" },
              ]} />
            </div>

            {/* Column 2: Calendar & Progress */}
            <div className="space-y-6">
              <CalendarNow nextEvent={{ title: "Standup with team", time: "10:00 AM" }} />
              <ProgressMini completed={7} total={10} />
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Focus Timer</span>
                  <span className="text-muted-foreground">25:00</span>
                </div>
                <div className="mt-3 h-2 rounded bg-muted">
                  <div className="h-2 rounded bg-red-500" style={{ width: `30%` }} />
                </div>
              </div>
            </div>

            {/* Column 3: Notes */}
            <div className="space-y-6">
              <RecentNotes notes={[
                { id: "n1", title: "Meeting notes – product strategy", snippet: "Define north-star metric and align KPIs across teams." },
                { id: "n2", title: "Ideas – onboarding", snippet: "Simplify sign-up, reduce fields, progressive profile completion." },
                { id: "n3", title: "Docs outline", snippet: "Intro, quick start, concepts, API, recipes, troubleshooting." },
              ]} />
              <div className="rounded-lg border p-4">
                <div className="text-sm font-medium">Quick Actions</div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <button className="rounded-md border px-3 py-2 hover:bg-red-500/5 transition-colors">New Task</button>
                  <button className="rounded-md border px-3 py-2 hover:bg-red-500/5 transition-colors">New Project</button>
                  <button className="rounded-md border px-3 py-2 hover:bg-red-500/5 transition-colors">Start Focus</button>
                  <button className="rounded-md border px-3 py-2 hover:bg-red-500/5 transition-colors">Open Notes</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Snooze Section */}
      <section className="border-t relative overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:py-32">
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-20 items-center">
            <div className="space-y-8 order-2 lg:order-1">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold bg-primary/10 text-primary border border-primary/20 mb-6 shadow-sm">
                  <Clock className="h-4 w-4" />
                  <span>Why Snooze?</span>
                </div>
                <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
                  A calm space for real work
                </h2>
                <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                  Built for focus. Organize projects, plan your day, and track time—without breaking your flow.
                </p>
              </div>
              
              <div className="space-y-4">
                <FeatureListItem 
                  icon={<Zap className="h-5 w-5" />} 
                  title="Keyboard-first command menu" 
                  description="Navigate your workspace at lightning speed"
                />
                <FeatureListItem 
                  icon={<TrendingUp className="h-5 w-5" />} 
                  title="Light & dark modes with system sync" 
                  description="Comfortable viewing at any time of day"
                />
                <FeatureListItem 
                  icon={<Users className="h-5 w-5" />} 
                  title="Accessible, mobile-friendly design" 
                  description="Work from anywhere, on any device"
                />
                <FeatureListItem 
                  icon={<Target className="h-5 w-5" />} 
                  title="Smart task prioritization" 
                  description="Focus on what matters most"
                />
              </div>

              <div className="pt-4">
                <Link href="/features" className="group inline-flex items-center gap-2 text-red-600 dark:text-red-400 font-semibold hover:gap-3 transition-all">
                  <span>Explore all features</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="order-1 lg:order-2 relative">
              <div className="relative rounded-2xl border-2 bg-background/50 backdrop-blur-sm shadow-2xl overflow-hidden ring-1 ring-black/5 hover:scale-[1.02] transition-transform duration-500">
                <Image
                  src="/images/demo.png"
                  alt="Snooze workspace dashboard with project management and team collaboration"
                  width={1920}
                  height={1080}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section id="pricing" className="border-t bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold bg-primary/10 text-primary border border-primary/20 mb-6 shadow-sm">
              <Sparkles className="h-4 w-4" />
              <span>Simple Pricing</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
              Plans that scale with you
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Start free, upgrade when you're ready
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
            <div className="rounded-2xl border bg-card p-8 transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="inline-flex rounded-xl bg-red-500/10 p-3 mb-4 border border-red-500/20">
                <Star className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <p className="text-sm text-muted-foreground mb-6">Perfect for individuals</p>
              <div className="mb-6">
                <span className="text-5xl font-bold">$0</span>
                <span className="text-sm text-muted-foreground ml-2">forever</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-5 w-5 text-red-500" />
                  <span>Unlimited tasks</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-5 w-5 text-red-500" />
                  <span>Up to 3 projects</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-5 w-5 text-red-500" />
                  <span>Focus timer</span>
                </li>
              </ul>
              <Link href="/auth">
                <button className="w-full rounded-lg border-2 px-4 py-3 text-sm font-semibold hover:bg-red-500/5 hover:border-red-500/50 transition-all">
                  Get Started
                </button>
              </Link>
            </div>

            <div className="relative rounded-2xl border-2 border-red-500 bg-card p-8 shadow-xl shadow-red-500/20 hover:shadow-2xl hover:-translate-y-1 transition-all">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1 rounded-full bg-red-500 text-white px-4 py-1 text-xs font-semibold">
                  <Star className="h-3 w-3" />
                  Most Popular
                </span>
              </div>
              <div className="inline-flex rounded-xl bg-red-500/10 p-3 mb-4 border border-red-500/20">
                <Zap className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <p className="text-sm text-muted-foreground mb-6">For power users</p>
              <div className="mb-6">
                <span className="text-5xl font-bold">$8</span>
                <span className="text-sm text-muted-foreground ml-2">per month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-5 w-5 text-red-500" />
                  <span>Everything in Free</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-5 w-5 text-red-500" />
                  <span>Unlimited projects</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-5 w-5 text-red-500" />
                  <span>Advanced analytics</span>
                </li>
              </ul>
              <Link href="/auth">
                <button className="w-full rounded-lg bg-red-500 text-white px-4 py-3 text-sm font-semibold hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all">
                  Start Pro Trial
                </button>
              </Link>
            </div>

            <div className="rounded-2xl border bg-card p-8 transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="inline-flex rounded-xl bg-red-500/10 p-3 mb-4 border border-red-500/20">
                <Users className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Team</h3>
              <p className="text-sm text-muted-foreground mb-6">For collaboration</p>
              <div className="mb-6">
                <span className="text-5xl font-bold">$12</span>
                <span className="text-sm text-muted-foreground ml-2">per user/mo</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-5 w-5 text-red-500" />
                  <span>Everything in Pro</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-5 w-5 text-red-500" />
                  <span>Unlimited workspaces</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-5 w-5 text-red-500" />
                  <span>Team dashboards</span>
                </li>
              </ul>
              <Link href="/auth">
                <button className="w-full rounded-lg border-2 px-4 py-3 text-sm font-semibold hover:bg-red-500/5 hover:border-red-500/50 transition-all">
                  Start Team Trial
                </button>
              </Link>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/pricing" className="inline-flex items-center gap-2 text-red-600 dark:text-red-400 font-semibold hover:gap-3 transition-all">
              <span>View detailed pricing</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <CTASection />

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <LogoIcon className="h-8 w-8" />
                <span className="font-bold text-lg">Snooze</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your all-in-one productivity workspace for staying organized and focused.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold mb-4 text-sm">Product</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="/features" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link href="/roadmap" className="hover:text-foreground transition-colors">Roadmap</Link></li>
                <li><Link href="/changelog" className="hover:text-foreground transition-colors">Changelog</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold mb-4 text-sm">Resources</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="/docs" className="hover:text-foreground transition-colors">Documentation</Link></li>
                <li><Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link href="/support" className="hover:text-foreground transition-colors">Support</Link></li>
                <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4 text-sm">Legal</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
                <li><Link href="/cookies" className="hover:text-foreground transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © 2025 Snooze. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <a href="https://twitter.com" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Twitter">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://github.com" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="GitHub">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
              </a>
              <a href="https://linkedin.com" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="LinkedIn">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

function StatBadge({ value, label }: { value: string; label: string }) {
  return (
    <div className="group relative rounded-xl border bg-background/50 backdrop-blur-sm p-4 transition-all hover:scale-105 hover:border-red-500/50 hover:shadow-lg">
      <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
        {value}
      </div>
      <div className="text-xs sm:text-sm text-muted-foreground mt-1">{label}</div>
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

function FeatureCard({ 
  title, 
  description, 
  icon
}: { 
  title: string; 
  description: string; 
  icon: React.ReactNode;
}) {
  return (
    <div className="group relative rounded-xl border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 inline-flex rounded-lg bg-primary/10 p-3 text-primary border border-primary/20">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

function FeatureListItem({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <div className="group flex items-start gap-4 p-4 rounded-xl border bg-background/50 backdrop-blur-sm transition-all hover:scale-[1.02] hover:shadow-lg hover:border-red-500/50">
      <div className="flex-shrink-0 inline-flex rounded-lg bg-red-500/10 p-2.5 text-red-500 dark:text-red-400 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
