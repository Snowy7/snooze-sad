import { Metadata } from "next"

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your Snooze account to access your projects, tasks, and productivity tools. Start organizing your work and staying focused.',
  openGraph: {
    title: 'Sign In - Snooze',
    description: 'Sign in to your Snooze account to access your productivity workspace.',
    url: 'https://snooze.app/auth',
    type: 'website',
  },
  alternates: {
    canonical: 'https://snooze.app/auth',
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}



