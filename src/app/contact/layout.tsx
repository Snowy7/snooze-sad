import { Metadata } from "next"

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the Snooze team. Have questions or feedback? We\'d love to hear from you. Send us a message or email us at support@snooze.app.',
  keywords: ['contact', 'support', 'help', 'feedback', 'customer service'],
  openGraph: {
    title: 'Contact Snooze',
    description: 'Get in touch with the Snooze team. We\'d love to hear from you.',
    url: 'https://snooze.app/contact',
    type: 'website',
  },
  alternates: {
    canonical: 'https://snooze.app/contact',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

