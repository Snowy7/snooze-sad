"use client"

import Link from "next/link"
import { useAuth } from "@workos-inc/authkit-nextjs/components"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { LogoIcon } from "@/components/logo"

export function MarketingNavbar() {
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <LogoIcon className="h-8 w-8" />
          <span className="hidden sm:inline">Snooze</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#preview" className="text-muted-foreground hover:text-foreground transition-colors">
            Preview
          </a>
          <a href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
            Contact
          </a>
          <a href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
            Privacy
          </a>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {user ? (
            <>
              <Link href="/dashboard">
                <Button size="sm" variant="outline">
                  Go to Dashboard
                </Button>
              </Link>
              <Link href="/dashboard">
                <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-offset-2 ring-offset-background hover:ring-blue-500 transition-all">
                  <AvatarImage src={user.profilePictureUrl || ""} />
                  <AvatarFallback className="text-sm">
                    {(user.firstName?.[0] || user.email?.[0] || "U").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth">
                <Button size="sm" variant="ghost">
                  Sign in
                </Button>
              </Link>
              <Link href="/auth">
                <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}


