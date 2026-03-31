"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(
    authError ? "Could not sign you in. Try again." : null,
  );

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        setMessage("Could not sign you in. Try again.");
        return;
      }

      router.push("/campus");
      router.refresh();
    } catch {
      setMessage("Could not sign you in. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    setMessage(null);
    const supabase = createClient();
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/api/auth/callback?next=/campus`,
      },
    });
    setLoading(false);
    if (error) setMessage(error.message);
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Access the Hope Aviation campus with your account.
        </p>
      </div>

      <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        {message ? (
          <p className="text-sm text-destructive" role="alert">
            {message}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in with email"}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Or</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium hover:bg-accent disabled:opacity-50"
      >
        Continue with Google
      </button>

      <p className="text-center text-xs text-muted-foreground">
        <Link href="/" className="underline hover:text-foreground">
          Back to home
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-muted-foreground">Loading sign-in…</p>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
