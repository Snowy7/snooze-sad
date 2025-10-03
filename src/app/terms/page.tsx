import { MarketingNavbar } from "@/components/marketing/navbar"
import Link from "next/link"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Read the Terms of Service for using Snooze. Learn about your rights and responsibilities when using our productivity application.',
  keywords: ['terms of service', 'terms and conditions', 'user agreement', 'legal'],
  openGraph: {
    title: 'Terms of Service - Snooze',
    description: 'Terms of Service for using Snooze productivity application.',
    url: 'https://snooze.app/terms',
    type: 'website',
  },
  alternates: {
    canonical: 'https://snooze.app/terms',
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <MarketingNavbar />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: October 3, 2025</p>
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Agreement to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using Snooze, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Use License</h2>
            <p className="text-muted-foreground leading-relaxed">
              We grant you a personal, non-transferable, non-exclusive license to use Snooze for your personal productivity needs. This license does not include:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Modifying or copying the materials</li>
              <li>Using the materials for commercial purposes</li>
              <li>Attempting to reverse engineer any software</li>
              <li>Removing any copyright or proprietary notations</li>
              <li>Transferring the materials to another person</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">User Accounts</h2>
            <p className="text-muted-foreground leading-relaxed">
              You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Content</h2>
            <p className="text-muted-foreground leading-relaxed">
              You retain all rights to the content you create using Snooze. However, by using our service, you grant us the right to store and process your content to provide the service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Prohibited Uses</h2>
            <p className="text-muted-foreground leading-relaxed">
              You may not use Snooze:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>In any way that violates any applicable law or regulation</li>
              <li>To transmit any unsolicited advertising or promotional material</li>
              <li>To impersonate or attempt to impersonate another user</li>
              <li>To engage in any activity that interferes with or disrupts the service</li>
              <li>To introduce viruses, malware, or other malicious code</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Service Availability</h2>
            <p className="text-muted-foreground leading-relaxed">
              We strive to provide reliable service, but we do not guarantee that Snooze will be available at all times. We may suspend or discontinue any part of the service at any time without notice.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may terminate or suspend your account immediately, without prior notice, if you breach these Terms of Service. Upon termination, your right to use the service will immediately cease.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              Snooze and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the new Terms of Service on this page.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about these Terms of Service, please{" "}
              <Link href="/contact" className="text-blue-500 hover:underline">
                contact us
              </Link>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}

