"use client"

import Link from "next/link"
import { ArrowRight, PlayCircle, Sparkles, CheckCircle } from "lucide-react"
import { AnimatedGrid } from "@/components/animated-grid"
import { useAuth } from "@workos-inc/authkit-nextjs/components"

export function CTASection() {
  const { user } = useAuth()

  return (
    <section className="border-t relative overflow-hidden bg-gradient-to-b from-background to-red-500/5">
      <div className="absolute inset-0">
        <AnimatedGrid />
      </div>
      <div className="relative mx-auto max-w-7xl px-6 py-32 lg:py-40 text-center space-y-8">
        <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 mb-4 shadow-sm">
          <Sparkles className="h-4 w-4" />
          <span>Start Your Journey</span>
        </div>
        <h2 className="text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
          Ready to transform<br />your workflow?
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Join thousands of productive people using Snooze to stay organized, focused, and in flow.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          {user ? (
            <Link href="/dashboard" className="group relative inline-flex h-14 items-center gap-2 rounded-xl bg-red-500 px-10 text-lg font-semibold text-white shadow-2xl shadow-red-500/30 transition-all hover:shadow-red-500/50 hover:scale-105 hover:bg-red-600">
              <span>Go to Dashboard</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          ) : (
            <Link href="/auth" className="group relative inline-flex h-14 items-center gap-2 rounded-xl bg-red-500 px-10 text-lg font-semibold text-white shadow-2xl shadow-red-500/30 transition-all hover:shadow-red-500/50 hover:scale-105 hover:bg-red-600">
              <span>Get Started Free</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
          <Link href="/features" className="inline-flex h-14 items-center gap-2 rounded-xl border-2 border-border hover:border-red-500/50 bg-background px-10 text-lg font-semibold hover:bg-red-500/5 transition-all">
            <PlayCircle className="h-5 w-5" />
            <span>See Features</span>
          </Link>
        </div>
        <div className="flex items-center justify-center gap-8 pt-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-red-500" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-red-500" />
            <span>Free forever plan</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-red-500" />
            <span>Cancel anytime</span>
          </div>
        </div>
      </div>
    </section>
  )
}
