"use client"

import Link from "next/link";
import { useAuth } from "@workos-inc/authkit-nextjs";
import { ArrowRight } from "lucide-react";

export function HeroButtons() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-16 duration-1000">
      {user ? (
        <Link href="/dashboard" className="group relative inline-flex h-14 items-center gap-2 rounded-xl bg-red-500 px-10 text-base font-semibold text-white shadow-lg shadow-red-500/25 transition-all hover:shadow-xl hover:shadow-red-500/30 hover:scale-[1.02] hover:bg-red-600">
          <span>Go to Dashboard</span>
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Link>
      ) : (
        <Link href="/auth" className="group relative inline-flex h-14 items-center gap-2 rounded-xl bg-red-500 px-10 text-base font-semibold text-white shadow-lg shadow-red-500/25 transition-all hover:shadow-xl hover:shadow-red-500/30 hover:scale-[1.02] hover:bg-red-600">
          <span>Get Started Free</span>
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
      <Link href="/docs" className="group inline-flex h-14 items-center gap-2 rounded-xl border-2 px-10 text-base font-semibold hover:bg-muted transition-all">
        <span>View Documentation</span>
        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
}
