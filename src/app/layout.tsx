import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://snooze.app'),
  title: {
    default: 'Snooze - Stay Organized. Stay Focused. Stay in Flow.',
    template: '%s | Snooze'
  },
  description: 'Combine daily habits, project management, and deep-focus sessions in one minimal workspace. Built for focus with Kanban boards, Pomodoro sessions, and analytics.',
  keywords: ['productivity', 'task management', 'project management', 'focus timer', 'pomodoro', 'habit tracker', 'kanban board', 'time tracking', 'productivity app', 'work organization'],
  authors: [{ name: 'Snooze' }],
  creator: 'Snooze',
  publisher: 'Snooze',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://snooze.app',
    siteName: 'Snooze',
    title: 'Snooze - Stay Organized. Stay Focused. Stay in Flow.',
    description: 'Combine daily habits, project management, and deep-focus sessions in one minimal workspace designed to help you achieve more.',
    images: [
      {
        url: '/images/app.png',
        width: 1920,
        height: 1080,
        alt: 'Snooze - Modern productivity workspace with dashboard, tasks, and projects',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Snooze - Stay Organized. Stay Focused. Stay in Flow.',
    description: 'Combine daily habits, project management, and deep-focus sessions in one minimal workspace.',
    images: ['/images/app.png'],
    creator: '@snoozeapp',
    site: '@snoozeapp',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
