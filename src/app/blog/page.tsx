import Link from "next/link"
import { MarketingNavbar } from "@/components/marketing/navbar"
import { AnimatedGrid } from "@/components/animated-grid"
import { Clock, Calendar, ArrowRight, Sparkles } from "lucide-react"

export const metadata = {
  title: "Blog – Snooze",
  description: "Productivity tips, product updates, and deep dives.",
}

const posts = [
  {
    slug: "building-a-calm-workspace",
    title: "Building a calm workspace for deep work",
    excerpt: "How we designed Snooze to reduce cognitive load and keep you in flow with minimal distractions. A deep dive into our design philosophy and the psychology behind it.",
    date: "2025-09-20",
    author: "Islam Azzam",
    readTime: "8 min read",
    category: "Design"
  },
  {
    slug: "drag-and-drop-done-right",
    title: "Drag-and-drop done right in rich text",
    excerpt: "Lessons from implementing Notion-like blocks with smooth interactions and proper visual feedback. Technical deep dive into ProseMirror transactions and state management.",
    date: "2025-09-10",
    author: "Islam Azzam",
    readTime: "12 min read",
    category: "Engineering"
  },
  {
    slug: "why-we-built-snooze",
    title: "Why we built Snooze",
    excerpt: "The story behind creating a productivity tool that respects your attention and helps you achieve more. From frustration with existing tools to building our own solution.",
    date: "2025-07-01",
    author: "Islam Azzam",
    readTime: "6 min read",
    category: "Product"
  },
]

export default function BlogIndexPage() {
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
          <div className="mx-auto max-w-6xl px-6 py-20 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white dark:bg-black px-4 py-1.5 text-sm font-medium border shadow-lg shadow-red-500/20 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Sparkles className="h-4 w-4" />
              <span>Blog</span>
            </div>
            <h1 className="text-5xl font-bold tracking-tight animate-in fade-in slide-in-from-bottom-8 duration-700">
              Stories & Insights
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1000">
              Deep dives into productivity, design, and engineering from the Snooze team.
            </p>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section>
          <div className="mx-auto max-w-7xl px-6 py-16">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, idx) => (
                <Link key={post.slug} href={`/blog/${post.slug}`}>
                  <article className="group rounded-xl border bg-card p-6 h-full hover:shadow-xl hover:border-red-500/50 transition-all duration-300 cursor-pointer opacity-100">
                    {/* Category Badge */}
                    <div className="inline-block mb-4">
                      <span className="text-xs font-medium px-3 py-1 rounded-full bg-red-500/10 text-red-600 border border-red-500/20">
                        {post.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-bold mb-3 group-hover:text-red-600 transition-colors leading-tight">
                      {post.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-sm text-muted-foreground leading-relaxed mb-6 line-clamp-3">
                      {post.excerpt}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-4 border-t">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{post.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>

                    {/* Author */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <span className="text-sm font-medium">{post.author}</span>
                      <ArrowRight className="h-4 w-4 text-red-600 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="border-t bg-muted/30">
          <div className="mx-auto max-w-4xl px-6 py-16 text-center">
            <h2 className="text-2xl font-bold mb-3">Stay updated</h2>
            <p className="text-muted-foreground mb-6">
              Get the latest posts and product updates delivered to your inbox.
            </p>
            <div className="flex gap-2 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="your@email.com" 
                className="flex-1 rounded-lg border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button className="rounded-lg bg-red-500 text-white px-6 py-2 text-sm font-medium hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all">
                Subscribe
              </button>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
