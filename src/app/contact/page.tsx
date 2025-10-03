"use client"

import { MarketingNavbar } from "@/components/marketing/navbar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, MessageSquare, Send } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)

    // Simulate form submission
    setTimeout(() => {
      toast.success("Message sent! We'll get back to you soon.")
      setSubmitting(false)
      ;(e.target as HTMLFormElement).reset()
    }, 1000)
  }

  return (
    <div className="min-h-screen">
      <MarketingNavbar />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Get in Touch</h1>
            <p className="text-muted-foreground text-lg">
              Have a question or feedback? We'd love to hear from you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-500" />
                  <h2 className="text-xl font-semibold">Send us a message</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Fill out the form and we'll get back to you as soon as possible.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" placeholder="Your name" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="you@example.com" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" name="subject" placeholder="What's this about?" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Tell us more..."
                    rows={5}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </Card>

            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-blue-500/10">
                    <Mail className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email Support</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      For general inquiries and support
                    </p>
                    <a href="mailto:support@snooze.app" className="text-blue-500 hover:underline text-sm">
                      support@snooze.app
                    </a>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-4">Frequently Asked Questions</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm mb-1">How do I reset my password?</h4>
                    <p className="text-sm text-muted-foreground">
                      Click "Forgot password" on the sign-in page and follow the instructions.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-1">Can I use Snooze offline?</h4>
                    <p className="text-sm text-muted-foreground">
                      Snooze requires an internet connection to sync your data across devices.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-1">Is my data secure?</h4>
                    <p className="text-sm text-muted-foreground">
                      Yes, we use industry-standard encryption and security practices to protect your data.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
                <h3 className="font-semibold mb-2">Join our newsletter</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get productivity tips and product updates delivered to your inbox.
                </p>
                <form className="flex gap-2" onSubmit={(e) => {
                  e.preventDefault()
                  toast.success("Thanks for subscribing!")
                  ;(e.target as HTMLFormElement).reset()
                }}>
                  <Input placeholder="Your email" type="email" required />
                  <Button type="submit" size="sm">Subscribe</Button>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

