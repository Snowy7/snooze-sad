import { notFound } from "next/navigation"
import Link from "next/link"
import { MarketingNavbar } from "@/components/marketing/navbar"
import { AnimatedGrid } from "@/components/animated-grid"
import { ArrowLeft, Quote, Clock, Calendar, User } from "lucide-react"

const posts: Record<string, { title: string; date: string; author: string; readTime: string; category: string; sections: Array<{ type: 'heading' | 'paragraph' | 'quote' | 'list' | 'code'; content: string | string[] }> }> = {
  "building-a-calm-workspace": {
    title: "Building a calm workspace for deep work",
    date: "2025-09-20",
    author: "Islam Azzam",
    readTime: "8 min read",
    category: "Design",
    sections: [
      { type: 'paragraph', content: "In an age of constant notifications and endless streams of information, we set out to build something different: a productivity tool that respects your attention and helps you focus on what truly matters." },
      { type: 'paragraph', content: "The problem with most productivity apps is that they're designed to keep you engaged, not to help you get work done. They're optimized for metrics like daily active users and session length, not for helping you achieve deep, meaningful work." },
      { type: 'heading', content: "The calm workspace philosophy" },
      { type: 'paragraph', content: "We believe that the best productivity tool is one that gets out of your way. That's why we designed Snooze with these core principles:" },
      { type: 'list', content: [
        "Minimal cognitive load - Every feature should reduce mental overhead, not add to it. We use consistent patterns, clear visual hierarchy, and predictable interactions.",
        "Respect for focus - No aggressive notifications, no gamification tricks, no artificial urgency. You control when and how you engage with the app.",
        "Beautiful but functional - Aesthetics matter, but they should serve usability. Our black and white color scheme with subtle blue accents isn't just stylish—it reduces visual noise and helps you focus on content.",
        "Progressive disclosure - Advanced features are available when you need them, but they don't clutter the interface for everyday use."
      ] },
      { type: 'heading', content: "The psychology of calm design" },
      { type: 'paragraph', content: "Our design choices are grounded in research on attention and cognitive psychology. Studies show that the average knowledge worker is interrupted every 11 minutes and takes 23 minutes to fully recover focus. Traditional productivity apps contribute to this problem by creating their own interruptions." },
      { type: 'paragraph', content: "We took a different approach. Every notification in Snooze is opt-in. Every color choice is deliberate. Every animation serves a purpose—to provide feedback without being distracting." },
      { type: 'quote', content: "The best interface is no interface. But when you need one, it should be so well-designed that it becomes invisible." },
      { type: 'heading', content: "Design decisions that matter" },
      { type: 'paragraph', content: "Take our dashboard, for example. Instead of overwhelming you with every task you've ever created, we show you three things: what's due today, what's overdue, and your active projects. That's it. Everything else is accessible when you need it, but it doesn't demand your attention." },
      { type: 'paragraph', content: "Our editor is another example. We spent weeks perfecting the drag-and-drop interactions, not because it looks cool (though it does), but because reorganizing your thoughts should feel natural and effortless. The friction between having an idea and capturing it should be as close to zero as possible." },
      { type: 'paragraph', content: "We also implemented keyboard shortcuts for every common action. Why? Because reaching for the mouse breaks your flow. The command palette (⌘K) lets you access any feature without leaving the keyboard." },
      { type: 'heading', content: "The role of whitespace" },
      { type: 'paragraph', content: "One of the most powerful tools in our design arsenal is whitespace. Most apps try to pack as much information as possible into every screen. We do the opposite." },
      { type: 'paragraph', content: "Generous padding around elements gives your eyes room to rest. It creates a visual rhythm that makes scanning content easier. It signals importance—when something stands alone, it demands attention." },
      { type: 'paragraph', content: "Look at our Kanban boards. Each column has breathing room. Cards aren't crammed together. The result is a board that's easy to scan, even with dozens of tasks." },
      { type: 'heading', content: "Typography and readability" },
      { type: 'paragraph', content: "We chose our typography carefully. The font stack prioritizes system fonts that users are already familiar with. Line height is set to 1.6 for body text—wide enough for comfortable reading without feeling loose." },
      { type: 'paragraph', content: "Headings use a tighter line height and bolder weight to create clear visual hierarchy. We limit line length to 65-75 characters, the sweet spot for readability. These details matter. They're the difference between text that's comfortable to read for hours and text that causes eye strain after minutes." },
      { type: 'heading', content: "The result" },
      { type: 'paragraph', content: "Users tell us they feel calmer when using Snooze. They get into flow states faster. They actually complete their important work instead of just shuffling tasks around." },
      { type: 'paragraph', content: "That's the goal—not to be the app you spend the most time in, but to be the app that helps you spend time on what matters. Not to capture your attention, but to free it for the work that matters to you." },
      { type: 'paragraph', content: "We're just getting started. Every feature we add goes through the same filter: does this help users focus, or does it distract them? If it's the latter, we don't ship it." },
      { type: 'paragraph', content: "Because at the end of the day, the best productivity tool is one that helps you be productive, then gets out of your way." },
    ]
  },
  "drag-and-drop-done-right": {
    title: "Drag-and-drop done right in rich text",
    date: "2025-09-10",
    author: "Islam Azzam",
    readTime: "12 min read",
    category: "Engineering",
    sections: [
      { type: 'paragraph', content: "When we set out to build a Notion-like editor for Snooze, we knew the drag-and-drop experience would make or break the feature. It's one of those interactions that users don't think about when it works perfectly, but notice immediately when it doesn't." },
      { type: 'heading', content: "The challenge" },
      { type: 'paragraph', content: "Rich text editing is complex. You're not just moving DOM elements around—you're manipulating a document structure that needs to maintain semantic meaning, preserve formatting, handle nested elements, and stay in sync with the editor's internal state." },
      { type: 'paragraph', content: "Add drag-and-drop to that, and you've got a recipe for bugs. Content duplication, cursor jumping, lost formatting, broken undo/redo—we encountered all of these issues and more during development." },
      { type: 'heading', content: "The foundation: Tiptap and ProseMirror" },
      { type: 'paragraph', content: "We built our editor on Tiptap, which uses ProseMirror under the hood. ProseMirror has a robust transaction system for modifying the document, which is perfect for implementing drag-and-drop." },
      { type: 'paragraph', content: "Here's the key insight: in ProseMirror, you don't directly manipulate the DOM. Instead, you create transactions that describe changes to the document state. The editor then updates the DOM to match the new state." },
      { type: 'paragraph', content: "This immutable approach has huge benefits for features like drag-and-drop. You can describe a complex operation (delete content here, insert it there) as a single atomic transaction. If anything goes wrong, the transaction is rejected and the document stays consistent." },
      { type: 'heading', content: "Our implementation strategy" },
      { type: 'paragraph', content: "After several failed attempts, we landed on an approach that works reliably:" },
      { type: 'list', content: [
        "Use the HTML5 Drag and Drop API for the interaction layer",
        "Store the dragged block's position and content in state",
        "Calculate the drop target position based on mouse coordinates",
        "Create a ProseMirror transaction to move the content",
        "Provide visual feedback throughout the process"
      ] },
      { type: 'heading', content: "Step 1: Detecting blocks" },
      { type: 'paragraph', content: "First, we needed a way to detect which block the user is hovering over. We attach a mousemove listener to the editor and use document.elementFromPoint to find the element under the cursor." },
      { type: 'code', content: "const handleMouseMove = (e: MouseEvent) => {\n  const el = document.elementFromPoint(e.clientX, e.clientY)\n  const blockEl = el?.closest('[data-node-type]')\n  if (blockEl) {\n    const rect = blockEl.getBoundingClientRect()\n    setHoveredBlock({\n      element: blockEl,\n      top: rect.top,\n      height: rect.height\n    })\n  }\n}" },
      { type: 'paragraph', content: "We throttle this to 50ms for performance. Running on every mouse move would be wasteful and could cause jank." },
      { type: 'heading', content: "Step 2: Starting the drag" },
      { type: 'paragraph', content: "When the user clicks the drag handle, we find the parent node in ProseMirror's document structure and store it:" },
      { type: 'code', content: "const handleDragStart = (e: DragEvent) => {\n  const pos = view.posAtDOM(blockEl, 0)\n  const $pos = view.state.doc.resolve(pos)\n  const node = $pos.parent\n  \n  setDraggedNode({\n    node,\n    pos: $pos.start() - 1\n  })\n  \n  // Make it transparent while dragging\n  blockEl.style.opacity = '0.4'\n}" },
      { type: 'heading', content: "Step 3: Visual feedback" },
      { type: 'paragraph', content: "Good drag-and-drop needs clear visual feedback. We show:" },
      { type: 'list', content: [
        "The dragged element at 40% opacity",
        "A blue highlight on the hovered target block",
        "A drag cursor throughout the operation",
        "Smooth animations for all state changes"
      ] },
      { type: 'paragraph', content: "These cues are subtle but crucial. They give the user confidence that the system understands their intent." },
      { type: 'heading', content: "Step 4: Executing the drop" },
      { type: 'paragraph', content: "This is where it gets tricky. We need to delete the dragged node and insert it at the drop position—but in a single transaction to avoid partial states." },
      { type: 'code', content: "const handleDrop = (e: DragEvent) => {\n  const dropPos = view.posAtDOM(targetEl, 0)\n  const { node, pos } = draggedNode\n  \n  const tr = view.state.tr\n  \n  // Delete from old position\n  tr.delete(pos, pos + node.nodeSize)\n  \n  // Adjust drop position if needed\n  const newPos = dropPos > pos ? \n    dropPos - node.nodeSize : dropPos\n  \n  // Insert at new position\n  tr.insert(newPos, node)\n  \n  view.dispatch(tr)\n}" },
      { type: 'paragraph', content: "The position adjustment is important. If we're dropping after the drag source, we need to account for the deletion shifting positions." },
      { type: 'heading', content: "Lessons learned" },
      { type: 'paragraph', content: "Building great interactions takes time. Here's what we learned:" },
      { type: 'list', content: [
        "Use the framework's primitives - Fighting against ProseMirror's design is a losing battle. Embrace transactions.",
        "Visual feedback is critical - Users need constant reassurance that the system is responding to their input.",
        "Test edge cases obsessively - What happens with nested blocks? At document boundaries? With the cursor inside the dragged block?",
        "Performance matters - Throttle expensive operations. Use requestAnimationFrame for visual updates.",
        "Keyboard accessibility - Not everyone can or wants to use a mouse. We added keyboard shortcuts for reordering blocks.",
        "Progressive enhancement - The basic editor works without drag-and-drop. It's an enhancement, not a requirement."
      ] },
      { type: 'heading', content: "The details matter" },
      { type: 'paragraph', content: "We spent significant time on small details that most users will never consciously notice:" },
      { type: 'paragraph', content: "For single-line blocks like dividers, we set a minimum highlight height of 32px so they're always easy to target. For multi-line blocks, the drag handle is vertically centered, making it clear which block you're interacting with." },
      { type: 'paragraph', content: "When you hover over a block, there's a 200ms delay before hiding the controls. This gives you time to move from the text to the handle without it disappearing." },
      { type: 'paragraph', content: "The highlight fades in over 150ms with an ease-out curve. The drag handle scales slightly on hover. These micro-interactions add up to an experience that feels polished and responsive." },
      { type: 'heading', content: "What's next" },
      { type: 'paragraph', content: "We're not done. On the roadmap:" },
      { type: 'list', content: [
        "Multi-block selection and dragging",
        "Drag-and-drop into nested structures (toggles, callouts)",
        "Drag to reorder in list items",
        "Copy blocks by holding Option/Alt while dragging"
      ] },
      { type: 'paragraph', content: "Each of these features requires careful thought about edge cases and user expectations. But that's what makes building great software rewarding—the challenge of getting all the details right." },
      { type: 'paragraph', content: "If you're building rich text editing features, I hope this deep dive was helpful. The key takeaway: respect the framework's constraints, obsess over visual feedback, and test extensively. The result is an interaction that feels magical because it works exactly as users expect." },
    ]
  },
  "why-we-built-snooze": {
    title: "Why we built Snooze",
    date: "2025-07-01",
    author: "Islam Azzam",
    readTime: "6 min read",
    category: "Product",
    sections: [
      { type: 'paragraph', content: "Every productivity tool starts with a problem. Ours began with a simple observation: I was spending more time managing my tools than actually getting work done." },
      { type: 'heading', content: "The productivity paradox" },
      { type: 'paragraph', content: "I had tried everything. Trello, Asana, Notion, Todoist, Monday, ClickUp—each promised to make me more productive, but each added its own layer of complexity. I found myself spending hours setting up workflows, tweaking automations, and migrating data between tools." },
      { type: 'paragraph', content: "The irony wasn't lost on me: I was losing productivity by trying to be productive." },
      { type: 'paragraph', content: "I talked to dozens of other knowledge workers and discovered I wasn't alone. We all had the same problem: too many features, too much complexity, too many tools." },
      { type: 'heading', content: "What people really need" },
      { type: 'paragraph', content: "After interviewing over 50 people about their productivity workflows, I discovered a common pattern. Most people need five things from a productivity tool:" },
      { type: 'list', content: [
        "A place to capture and organize tasks without friction",
        "A way to plan their day and week visually",
        "Tools for managing projects with teams",
        "Time to focus without distractions",
        "Insights into where their time actually goes"
      ] },
      { type: 'paragraph', content: "But here's the thing: they don't need 47 features, 12 integration types, and infinite customization options. They need these five things to work seamlessly together in a tool that respects their attention." },
      { type: 'quote', content: "The best tool is one that helps you work, then gets out of your way." },
      { type: 'heading', content: "Our design philosophy" },
      { type: 'paragraph', content: "I decided to build Snooze with three core principles:" },
      { type: 'paragraph', content: "Simplicity first - Every feature must justify its existence. If we can't explain why it's essential in one sentence, it doesn't make the cut. We've said no to dozens of feature requests because they would add complexity without proportional value." },
      { type: 'paragraph', content: "Integration, not isolation - Your tasks, projects, and calendar should work together naturally. You shouldn't have to manually sync information between different views. When you create a task, it appears everywhere it should automatically." },
      { type: 'paragraph', content: "Respect for focus - The app should help you concentrate, not distract you. No unnecessary notifications, no gamification, no artificial urgency. You control when and how you engage with Snooze." },
      { type: 'heading', content: "The first version" },
      { type: 'paragraph', content: "I started building Snooze in March 2025. The first version was rough—a basic task list with a Pomodoro timer. But it worked. More importantly, I started using it daily." },
      { type: 'paragraph', content: "That's when I learned the most important lesson: use your own product obsessively. Every friction point I encountered became a priority to fix. Every feature I wished for got considered carefully." },
      { type: 'paragraph', content: "By July, we had a working MVP: task management, project boards, a focus timer, and basic notes. I shared it with a few friends. Their feedback was consistent: it's simple, but it works." },
      { type: 'heading', content: "Building in public" },
      { type: 'paragraph', content: "We launched publicly on July 1st, 2025. The response was overwhelming. Within a week, we had 1,000 users. By the end of the month, 5,000." },
      { type: 'paragraph', content: "Since then, we've shipped updates every two weeks based on user feedback. We've added Kanban boards, a rich text editor, calendar views, and team collaboration features." },
      { type: 'paragraph', content: "But we've also said no to dozens of feature requests. It's hard to say no, especially when users are passionate about their ideas. But every new feature adds complexity, and complexity is the enemy of usability." },
      { type: 'heading', content: "What we learned" },
      { type: 'paragraph', content: "Building Snooze taught me several important lessons about product development:" },
      { type: 'paragraph', content: "Start with your own pain - The best products solve problems their creators have experienced. This ensures you understand the problem deeply and can evaluate solutions honestly." },
      { type: 'paragraph', content: "Use your product daily - You can't build a great product you don't use. Every day I use Snooze reveals something to improve." },
      { type: 'paragraph', content: "Say no often - The art of product design is knowing what to leave out. Adding features is easy. Removing them is nearly impossible. So be conservative about what you add." },
      { type: 'paragraph', content: "Design for focus - In a world of distraction, the app that respects attention wins. We optimize for helping users concentrate, not for engagement metrics." },
      { type: 'paragraph', content: "Listen, but don't follow blindly - Users are great at identifying problems but often wrong about solutions. Your job is to understand the problem deeply and find the right solution." },
      { type: 'heading', content: "Where we're headed" },
      { type: 'paragraph', content: "Our roadmap focuses on making the core experience better, not on adding new features for the sake of features. We're working on mobile apps, offline support, and deeper integrations with tools you already use." },
      { type: 'paragraph', content: "We're also exploring AI-powered features—but only ones that genuinely help you work better. We won't add AI just because it's trendy. It needs to solve a real problem." },
      { type: 'paragraph', content: "Most importantly, we're committed to staying true to our founding principle: build a tool that helps people do their best work without getting in their way." },
      { type: 'paragraph', content: "We're building Snooze for the long term. Not for a quick exit or maximum growth at all costs. We're building a sustainable business that serves users well." },
      { type: 'paragraph', content: "If that resonates with you, I'd love to have you join us on this journey. Try Snooze, share your feedback, and help us build something truly useful." },
      { type: 'paragraph', content: "— Islam Azzam, Founder" },
    ]
  }
}

export async function generateStaticParams() {
  return Object.keys(posts).map((slug) => ({ slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const post = posts[params.slug]
  if (!post) return {}
  
  const firstPara = post.sections.find(s => s.type === 'paragraph')
  
  return {
    title: `${post.title} – Snooze Blog`,
    description: typeof firstPara?.content === 'string' ? firstPara.content : '',
  }
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = posts[params.slug]
  
  if (!post) {
    notFound()
  }
  
  return (
    <>
      <MarketingNavbar />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative border-b overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <AnimatedGrid />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,_var(--tw-gradient-stops))] from-red-500/10 via-transparent to-transparent" />
          </div>
          <article className="mx-auto max-w-4xl px-6 py-16">
            <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to blog
            </Link>
            
            <div className="inline-block mb-6">
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-red-500/10 text-red-600 border border-red-500/20">
                {post.category}
              </span>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-6">
              {post.title}
            </h1>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{post.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{post.readTime}</span>
              </div>
            </div>
          </article>
        </section>

        {/* Content */}
        <article className="mx-auto max-w-3xl px-6 py-16">
          <div className="prose prose-lg prose-neutral dark:prose-invert max-w-none">
            {post.sections.map((section, i) => {
              if (section.type === 'heading') {
                return (
                  <h2 key={i} className="text-2xl font-bold mt-12 mb-4 scroll-mt-16">
                    {section.content}
                  </h2>
                )
              }
              
              if (section.type === 'paragraph') {
                return (
                  <p key={i} className="text-muted-foreground leading-8 mb-6">
                    {section.content}
                  </p>
                )
              }
              
              if (section.type === 'quote') {
                return (
                  <div key={i} className="my-8 pl-6 border-l-4 border-red-500/50 bg-red-500/5 p-6 rounded-r-lg">
                    <Quote className="h-6 w-6 text-red-500 mb-2" />
                    <p className="text-lg italic text-foreground">{section.content}</p>
                  </div>
                )
              }
              
              if (section.type === 'list' && Array.isArray(section.content)) {
                return (
                  <ul key={i} className="space-y-3 my-6">
                    {section.content.map((item, j) => (
                      <li key={j} className="flex items-start gap-3 text-muted-foreground leading-7">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-3 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )
              }
              
              if (section.type === 'code') {
                return (
                  <pre key={i} className="bg-muted/50 border rounded-lg p-4 overflow-x-auto my-6">
                    <code className="text-sm text-foreground font-mono">{section.content}</code>
                  </pre>
                )
              }
              
              return null
            })}
          </div>
          
          <div className="mt-16 pt-8 border-t">
            <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-red-600 dark:text-red-400 hover:underline group">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to all posts
            </Link>
          </div>
        </article>
      </main>
    </>
  )
}
