import { MarketingNavbar } from "@/components/marketing/navbar"
import Link from "next/link"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Learn how Snooze collects, uses, and protects your personal information. We take your privacy seriously and implement industry-standard security measures.',
  keywords: ['privacy policy', 'data protection', 'security', 'GDPR', 'privacy'],
  openGraph: {
    title: 'Privacy Policy - Snooze',
    description: 'Learn how Snooze protects your personal information and privacy.',
    url: 'https://snooze.app/privacy',
    type: 'website',
  },
  alternates: {
    canonical: 'https://snooze.app/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <MarketingNavbar />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: October 3, 2025</p>
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              At Snooze, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our productivity application.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Information We Collect</h2>
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-medium mb-2">Personal Information</h3>
                <p className="text-muted-foreground leading-relaxed">
                  When you create an account, we collect your name, email address, and password. If you choose to upload a profile picture, we store that as well.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Usage Data</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We collect information about how you use Snooze, including your tasks, projects, notes, habits, and focus sessions. This data is used to provide and improve our services.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>To provide and maintain our services</li>
              <li>To notify you about changes to our services</li>
              <li>To provide customer support</li>
              <li>To gather analysis or valuable information to improve our services</li>
              <li>To monitor the usage of our services</li>
              <li>To detect, prevent and address technical issues</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement appropriate technical and organizational security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use WorkOS for authentication and Convex for data storage. These services have their own privacy policies governing the use of your information.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              You have the right to access, update, or delete your personal information at any time through your account settings. You may also request a copy of your data or request account deletion.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy, please{" "}
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

