import { MarketingNavbar } from "@/components/marketing/navbar"

export const metadata = {
  title: "Support – Snooze",
  description: "Help center and FAQs.",
}

const faqs = [
  { q: "How do I invite teammates?", a: "Go to Workspace Settings → Members → Invite. Enter email addresses and select roles." },
  { q: "Can I import tasks from another tool?", a: "Yes. Use the Import option in Projects to upload CSV or paste from clipboard." },
  { q: "How do focus sessions work?", a: "Start a 25-minute session from Dashboard or Focus. We'll time it, track streaks, and remind you to take breaks." },
  { q: "How can I restore deleted items?", a: "Recently deleted tasks and notes are in Trash for 14 days. Restore from there." },
  { q: "Is there an API?", a: "An API is in development with webhooks for task events. Check the roadmap for updates." },
]

export default function SupportPage() {
  return (
    <>
      <MarketingNavbar />
      <main className="min-h-screen">
      <section className="border-b">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Support</h1>
          <p className="mt-3 text-muted-foreground">Find answers, learn best practices, and get in touch.</p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="text-2xl font-semibold">Frequently asked questions</h2>
          <div className="mt-6 grid gap-4">
            {faqs.map((f) => (
              <div key={f.q} className="rounded-lg border p-4">
                <div className="font-medium">{f.q}</div>
                <div className="text-sm text-muted-foreground mt-1">{f.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
    </>
  )
}


