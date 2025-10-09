import { MarketingNavbar } from "@/components/marketing/navbar"
import { AnimatedGrid } from "@/components/animated-grid"
import { CheckCircle, Sparkles, Star, Zap } from "lucide-react"
import Link from "next/link"
import { CTASection } from "@/components/marketing/cta-section"

export const metadata = {
  title: "Pricing – Snooze",
  description: "Simple pricing that grows with you. Free forever plan included.",
}

export default function PricingPage() {
  return (
    <>
      <MarketingNavbar />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative border-b overflow-hidden">
          <div className="absolute inset-0 -z-10">
            
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />
          </div>
          <div className="mx-auto max-w-7xl px-6 py-20 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white dark:bg-black px-4 py-1.5 text-sm font-medium border shadow-lg shadow-blue-500/20 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Sparkles className="h-4 w-4" />
              <span>Simple Pricing</span>
            </div>
            <h1 className="text-5xl font-bold tracking-tight animate-in fade-in slide-in-from-bottom-8 duration-700">
              Plans that scale with you
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1000">
              Start free, upgrade when you're ready. No credit card required for the free tier.
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-8 md:grid-cols-3">
              <PlanCard
                name="Free"
                price="$0"
                period="forever"
                description="Perfect for individuals getting started"
                features={[
                  "Unlimited tasks",
                  "Up to 3 projects",
                  "Focus timer & Pomodoro",
                  "Notes with rich editor",
                  "Basic analytics",
                  "Mobile friendly"
                ]}
                ctaLabel="Get Started Free"
                ctaLink="/auth"
                highlighted={false}
                icon={<Star className="h-6 w-6" />}
              />
              <PlanCard
                name="Pro"
                price="$8"
                period="per user / month"
                description="For power users who need more"
                features={[
                  "Everything in Free",
                  "Unlimited projects",
                  "Advanced analytics & charts",
                  "Calendar & Gantt views",
                  "Slash commands & blocks",
                  "Priority email support"
                ]}
                ctaLabel="Start Pro Trial"
                ctaLink="/auth"
                highlighted={true}
                badge="Most Popular"
                icon={<Zap className="h-6 w-6" />}
              />
              <PlanCard
                name="Team"
                price="$12"
                period="per user / month"
                description="For teams that collaborate"
                features={[
                  "Everything in Pro",
                  "Unlimited workspaces",
                  "Role-based permissions",
                  "Task assignments & mentions",
                  "Team dashboards",
                  "24/7 priority support"
                ]}
                ctaLabel="Start Team Trial"
                ctaLink="/auth"
                highlighted={false}
                icon={<CheckCircle className="h-6 w-6" />}
              />
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="border-t bg-muted/30 py-16">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Compare plans</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-4 px-4 font-semibold">Feature</th>
                    <th className="text-center py-4 px-4 font-semibold">Free</th>
                    <th className="text-center py-4 px-4 font-semibold">Pro</th>
                    <th className="text-center py-4 px-4 font-semibold">Team</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <ComparisonRow feature="Tasks" free="Unlimited" pro="Unlimited" team="Unlimited" />
                  <ComparisonRow feature="Projects" free="3" pro="Unlimited" team="Unlimited" />
                  <ComparisonRow feature="Workspaces" free="1" pro="1" team="Unlimited" />
                  <ComparisonRow feature="Team members" free="1" pro="1" team="Unlimited" />
                  <ComparisonRow feature="Analytics" free="Basic" pro="Advanced" team="Advanced + Team" />
                  <ComparisonRow feature="Views" free="List, Kanban" pro="+ Calendar, Gantt" team="+ Calendar, Gantt" />
                  <ComparisonRow feature="Support" free="Community" pro="Email" team="24/7 Priority" />
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="border-t py-16">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently asked questions</h2>
            <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
              <FAQ 
                q="Is the free plan really free forever?" 
                a="Yes! The Free plan is designed for personal use and will remain free forever. No credit card required." 
              />
              <FAQ 
                q="Can I cancel anytime?" 
                a="Absolutely. You can upgrade, downgrade, or cancel at any time from your account settings. No questions asked." 
              />
              <FAQ 
                q="Do you offer discounts?" 
                a="We provide special discounts for students, educators, and nonprofits. Contact our support team for details." 
              />
              <FAQ 
                q="What payment methods do you accept?" 
                a="We accept all major credit cards, debit cards, and PayPal. Invoicing available for Team plans." 
              />
              <FAQ 
                q="Can I try Pro or Team for free?" 
                a="Yes! All paid plans come with a 14-day free trial. No credit card required to start your trial." 
              />
              <FAQ 
                q="How does billing work for teams?" 
                a="Team plans are billed per user per month. Add or remove users anytime, and we'll prorate the charges." 
              />
            </div>
          </div>
        </section>

        <CTASection />
      </main>
    </>
  )
}

function PlanCard({ 
  name, 
  price, 
  period, 
  description,
  features, 
  ctaLabel,
  ctaLink,
  highlighted,
  badge,
  icon
}: { 
  name: string
  price: string
  period: string
  description: string
  features: string[]
  ctaLabel: string
  ctaLink: string
  highlighted?: boolean
  badge?: string
  icon?: React.ReactNode
}) {
  return (
    <div className={`group relative rounded-2xl border bg-card p-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
      highlighted ? 'ring-2 ring-blue-500 shadow-xl shadow-blue-500/20' : ''
    }`}>
      {badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 rounded-full bg-red-500 text-white px-4 py-1 text-xs font-semibold shadow-lg">
            <Star className="h-3 w-3" />
            {badge}
          </span>
        </div>
      )}
      
      <div className="mb-6">
        {icon && (
          <div className="inline-flex rounded-xl bg-red-500/10 p-3 mb-4 border border-red-500/20">
            <div className="text-red-500">{icon}</div>
          </div>
        )}
        <h3 className="text-2xl font-bold mb-2">{name}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold">{price}</span>
          {price !== "$0" && <span className="text-lg text-muted-foreground">USD</span>}
        </div>
        <div className="text-sm text-muted-foreground mt-1">{period}</div>
      </div>

      <Link href={ctaLink}>
        <button className={`w-full rounded-lg px-4 py-3 text-sm font-semibold transition-all ${
          highlighted 
            ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-blue-500/30 hover:shadow-xl' 
            : 'border-2 hover:bg-red-500/5 hover:border-red-500/50'
        }`}>
          {ctaLabel}
        </button>
      </Link>

      <ul className="mt-8 space-y-4">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-sm">
            <CheckCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-xl border bg-card p-6 hover:shadow-lg transition-all">
      <div className="font-semibold text-lg mb-2">{q}</div>
      <div className="text-sm text-muted-foreground leading-relaxed">{a}</div>
    </div>
  )
}

function ComparisonRow({ feature, free, pro, team }: { feature: string; free: string; pro: string; team: string }) {
  return (
    <tr>
      <td className="py-4 px-4 font-medium">{feature}</td>
      <td className="py-4 px-4 text-center text-sm text-muted-foreground">{free}</td>
      <td className="py-4 px-4 text-center text-sm text-muted-foreground">{pro}</td>
      <td className="py-4 px-4 text-center text-sm text-muted-foreground">{team}</td>
    </tr>
  )
}


