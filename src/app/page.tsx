import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Focus, BarChart3, CheckCircle } from "lucide-react";
import { MarketingNavbar } from "@/components/marketing/navbar";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <MarketingNavbar />
      
      {/* Hero Section */}
      <section className="relative isolate overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent" />
        <div className="mx-auto max-w-5xl px-6 text-center">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Stay Organized. Stay Focused. <br className="hidden sm:block" />Stay in Flow.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Combine daily habits, project management, and deep-focus sessions in one minimal workspace designed to help you achieve more.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/auth" className="inline-flex h-11 items-center rounded-md bg-blue-500 px-8 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-600 hover:shadow-md">
              Get Started Free
            </Link>
            <a href="#features" className="inline-flex h-11 items-center rounded-md border px-6 text-sm font-medium transition-colors hover:bg-accent">
              Learn More
            </a>
          </div>
          <div className="mt-16 relative rounded-xl border bg-background/50 backdrop-blur-sm shadow-2xl overflow-hidden">
            <div className="aspect-video w-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center text-muted-foreground">
              Product Preview
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight">Everything you need to stay productive</h2>
            <p className="mt-4 text-muted-foreground">Powerful features wrapped in a simple, beautiful interface</p>
          </div>
          <div className="grid gap-8 md:grid-cols-4">
            <FeatureCard title="Daily Tasks" description="Manage routines and see active project tasks in one view." icon={<CalendarDays className="h-6 w-6" />} />
            <FeatureCard title="Projects" description="Organize work with Kanban boards, timelines, and assignments." icon={<CheckCircle className="h-6 w-6" />} />
            <FeatureCard title="Focus Mode" description="Pomodoro-style sessions to maximize deep work." icon={<Focus className="h-6 w-6" />} />
            <FeatureCard title="Analytics" description="Track progress, streaks, and time spent per project." icon={<BarChart3 className="h-6 w-6" />} />
          </div>
        </div>
      </section>

      {/* Preview Section */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight">A calm space for real work</h2>
              <p className="text-lg text-muted-foreground">Built for focus. Organize projects, plan your day, and track time—without breaking your flow.</p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">✓ Keyboard-first command menu</li>
                <li className="flex items-start gap-2">✓ Light & dark modes with system sync</li>
                <li className="flex items-start gap-2">✓ Accessible, mobile-friendly design</li>
              </ul>
            </div>
            <div className="rounded-xl border bg-background/50 backdrop-blur-sm shadow-lg overflow-hidden">
              <div className="aspect-video w-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center text-muted-foreground">
                Demo View
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Ready to get started?</h2>
          <p className="text-lg text-muted-foreground">Join thousands staying organized and focused every day</p>
          <Link href="/auth" className="inline-flex h-11 items-center rounded-md bg-blue-500 px-8 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-600 hover:shadow-md">
            Start Free Today
          </Link>
          <p className="text-xs text-muted-foreground">No credit card required</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">© 2025 Snooze. All rights reserved.</div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
              <Link href="/terms" className="hover:text-foreground">Terms</Link>
              <Link href="/contact" className="hover:text-foreground">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-lg border p-6 transition-all hover:shadow-lg hover:border-blue-500/50">
      {icon && <div className="mb-4 inline-flex rounded-lg bg-blue-500/10 p-3 text-blue-500">{icon}</div>}
      <h3 className="text-base font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
