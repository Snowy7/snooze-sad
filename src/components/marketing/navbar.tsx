"use client"

import Link from "next/link"
import { useAuth } from "@workos-inc/authkit-nextjs/components"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { LogoIcon } from "@/components/logo"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"

export function MarketingNavbar() {
  const { user } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header className={`sticky top-0 z-50 w-full transition-all ${scrolled ? "bg-background/80 backdrop-blur-lg border-b shadow-sm" : "bg-background/60 backdrop-blur-sm border-b border-border/40"}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-lg group">
          <LogoIcon className="h-9 w-9 text-red-500 transition-transform group-hover:scale-110" />
          <span className="hidden sm:inline bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Snooze</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          <NavLink href="/features" active={pathname === "/features"}>Features</NavLink>
          <NavLink href="/pricing" active={pathname === "/pricing"}>Pricing</NavLink>
          <NavLink href="/docs" active={pathname === "/docs"}>Docs</NavLink>
          <NavLink href="/blog" active={pathname === "/blog" || pathname?.startsWith("/blog/")}>Blog</NavLink>
          <NavLink href="/roadmap" active={pathname === "/roadmap"}>Roadmap</NavLink>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {user ? (
            <>
              <Link href="/dashboard">
                <Button 
                  size="sm" 
                  className="bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-500/25 hover:shadow-lg hover:shadow-red-500/30 transition-all"
                >
                  Dashboard
                </Button>
              </Link>
              <Link href="/dashboard">
                <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-offset-2 ring-offset-background hover:ring-red-500/60 transition-all">
                  <AvatarImage src={user.profilePictureUrl || ""} />
                  <AvatarFallback className="text-sm bg-red-500/10 text-red-600">
                    {(user.firstName?.[0] || user.email?.[0] || "U").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth" className="hidden sm:inline-block">
                <Button size="sm" variant="ghost" className="hover:bg-red-500/5 hover:text-red-600">
                  Sign in
                </Button>
              </Link>
              <Link href="/auth">
                <Button size="sm" className="bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-500/25 hover:shadow-lg hover:shadow-red-500/30 transition-all">
                  Get Started
                </Button>
              </Link>
            </>
          )}

          {/* Mobile menu trigger */}
          <button
            type="button"
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border hover:bg-accent transition-colors"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur-lg">
          <nav className="mx-auto max-w-7xl px-4 sm:px-6 py-4 grid gap-2 text-sm font-medium">
            <MobileNavLink href="/features" active={pathname === "/features"} onClick={() => setMobileOpen(false)}>Features</MobileNavLink>
            <MobileNavLink href="/pricing" active={pathname === "/pricing"} onClick={() => setMobileOpen(false)}>Pricing</MobileNavLink>
            <MobileNavLink href="/docs" active={pathname === "/docs"} onClick={() => setMobileOpen(false)}>Docs</MobileNavLink>
            <MobileNavLink href="/blog" active={pathname === "/blog" || pathname?.startsWith("/blog/")} onClick={() => setMobileOpen(false)}>Blog</MobileNavLink>
            <MobileNavLink href="/roadmap" active={pathname === "/roadmap"} onClick={() => setMobileOpen(false)}>Roadmap</MobileNavLink>
          </nav>
        </div>
      )}
    </header>
  )
}


function NavLink({ href, children, active }: { href: string; children: React.ReactNode; active?: boolean }) {
  return (
    <a
      href={href}
      className={`group relative px-3 py-2 rounded-lg transition-all ${
        active 
          ? 'text-red-600 bg-red-500/10' 
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      }`}
    >
      <span>{children}</span>
      {active && (
        <span className="absolute inset-x-3 -bottom-px h-0.5 bg-red-500 rounded-full" />
      )}
    </a>
  )
}


function MobileNavLink({ href, children, active, onClick }: { href: string; children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={`px-4 py-2.5 rounded-lg transition-all ${
        active 
          ? 'text-red-600 bg-red-500/10 font-semibold' 
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      }`}
    >
      {children}
    </a>
  )
}


