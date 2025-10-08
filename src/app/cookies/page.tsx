import { MarketingNavbar } from "@/components/marketing/navbar"

export const metadata = {
  title: "Cookie Policy – Snooze",
  description: "Learn how we use cookies and how you can control them.",
}

export default function CookiePolicyPage() {
  return (
    <>
      <MarketingNavbar />
      <main className="min-h-screen">
      <section className="border-b">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h1 className="text-4xl font-bold tracking-tight">Cookie Policy</h1>
          <p className="mt-3 text-muted-foreground">Effective date: October 1, 2025</p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-4xl px-6 py-16 space-y-8 text-sm leading-7 text-muted-foreground">
          <div>
            <h2 className="text-base font-semibold text-foreground">What are cookies?</h2>
            <p className="mt-2">Cookies are small text files stored on your device to help websites function and improve your experience.</p>
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">How we use cookies</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Essential cookies for authentication and security</li>
              <li>Preference cookies to remember settings (theme, language)</li>
              <li>Analytics cookies to understand product usage</li>
            </ul>
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">Managing cookies</h2>
            <p className="mt-2">Most browsers let you disable cookies or clear them. Doing so may affect certain features like sign-in and preferences.</p>
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">Contact</h2>
            <p className="mt-2">If you have questions about this policy, contact us at support@snooze.app.</p>
          </div>
        </div>
      </section>
    </main>
    </>
  )
}


