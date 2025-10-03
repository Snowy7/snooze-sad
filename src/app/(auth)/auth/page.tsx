"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Moon, Sun } from "lucide-react";
import { signInWithPassword, signUpWithPassword, startGoogleOAuth, startGitHubOAuth } from "@/lib/workos/auth";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Logo } from "@/components/logo";

export default function AuthPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

  const heading = useMemo(() => (isSignUp ? "Create Account" : "Welcome back"), [isSignUp]);
  const cta = useMemo(() => (isSignUp ? "Create Account" : "Sign In"), [isSignUp]);

  function validate(body: Record<string, string>) {
    if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) return "Enter a valid email";
    if (!body.password || body.password.length < 8) return "Password must be at least 8 characters";
    return null;
  }

  async function submitEmailPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const body: Record<string, string> = {};
    formData.forEach((v, k) => (body[k] = String(v)));
    const error = validate(body);
    if (error) {
      toast.error(error);
      return;
    }
    const endpointAction = isSignUp ? signUpWithPassword : signInWithPassword;
    setSubmitting(true);
    try {
      const formDataObj = new FormData();
      Object.entries(body).forEach(([k, v]) => formDataObj.append(k, v));
      const result = await endpointAction(null, formDataObj);
      if (result?.success) {
        toast.success(isSignUp ? "Account created" : "Welcome back");
        router.replace("/dashboard");
      } else {
        toast.error(result?.error || "Authentication failed");
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-muted/30 relative">
      <Button
        variant="outline"
        size="icon"
        className="absolute top-4 right-4"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>

      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center justify-center gap-2 text-2xl font-bold">
            <Logo className="h-8 w-8" />
            Snooze
          </Link>
          <h1 className="text-2xl font-semibold">{heading}</h1>
          <p className="text-sm text-muted-foreground">
            {isSignUp ? "Create an account to get started" : "Sign in to your account"}
          </p>
        </div>

        <div className="space-y-3">
          <form action={startGoogleOAuth}>
            <Button
              type="submit"
              variant="outline"
              className="w-full justify-start gap-2"
              disabled={loading}
            >
              <GoogleLogo className="size-4" />
              {isSignUp ? "Continue with Google" : "Sign in with Google"}
            </Button>
          </form>
          <form action={startGitHubOAuth}>
            <Button
              type="submit"
              variant="outline"
              className="w-full justify-start gap-2"
              disabled={loading}
            >
              <GitHubLogo className="size-4" />
              {isSignUp ? "Continue with GitHub" : "Sign in with GitHub"}
            </Button>
          </form>
        </div>

        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
            Or
          </span>
        </div>

        <form className="space-y-4" onSubmit={submitEmailPassword}>
          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="firstName">Name</Label>
              <Input id="firstName" name="firstName" placeholder="Your name" autoComplete="name" />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" autoComplete="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input id="password" name="password" type={showPassword ? "text" : "password"} placeholder={isSignUp ? "Create a password" : "Your password"} autoComplete={isSignUp ? "new-password" : "current-password"} />
              <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword((s) => !s)} aria-label="Toggle password visibility">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button className="w-full" type="submit" disabled={loading || submitting}>
            {submitting ? (
              <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Please wait...</span>
            ) : cta}
          </Button>
        </form>

        <p className="text-sm text-center text-muted-foreground">
          {isSignUp ? (
            <>
              Already have an account?{" "}
              <button className="underline hover:text-foreground" onClick={() => setIsSignUp(false)}>Sign in</button>
            </>
          ) : (
            <>
              New here?{" "}
              <button className="underline hover:text-foreground" onClick={() => setIsSignUp(true)}>Create an account</button>
            </>
          )}
        </p>
      </Card>
    </div>
  );
}

function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.8 33.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.7 3l5.7-5.7C34.2 6.3 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.1-.1-2.1-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.8 16.3 19 14 24 14c3 0 5.7 1.1 7.7 3l5.7-5.7C34.2 6.3 29.4 4 24 4 15.6 4 8.5 8.9 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 10.1-2 13.6-5.4l-6.3-5.2C29.3 36 26.8 37 24 37c-5.2 0-9.6-3.3-11.3-7.9l-6.6 5.1C8.5 39.1 15.6 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.6 5.6-6.7 6.9l6.3 5.2C37.7 37.9 40 32.5 40 26c0-1.9-.2-3.3-.4-5.5z"/>
    </svg>
  );
}

function GitHubLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="currentColor" d="M12 .5a11.5 11.5 0 0 0-3.64 22.42c.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.71 1.26 3.37.96.11-.75.4-1.26.72-1.55-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.3 1.2-3.11-.12-.3-.52-1.5.11-3.12 0 0 .98-.31 3.2 1.19a11.1 11.1 0 0 1 5.82 0c2.22-1.5 3.2-1.19 3.2-1.19.63 1.62.23 2.82.11 3.12.75.81 1.2 1.85 1.2 3.11 0 4.43-2.69 5.41-5.25 5.69.41.35.77 1.04.77 2.11 0 1.52-.01 2.75-.01 3.13 0 .31.21.67.8.55A11.5 11.5 0 0 0 12 .5z"/>
    </svg>
  );
}
