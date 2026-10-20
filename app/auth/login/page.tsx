"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useTranslation } from "@/lib/i18n/context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Title } from "@/components/ui/title";
import { Mail, Lock, AlertCircle, Loader2, ArrowLeft, Sparkles } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authError = searchParams.get("error");
  const clearSession = searchParams.get("clear");
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(
    authError ? t("auth.errorGeneric") : null,
  );

  useEffect(() => {
    if (clearSession === "1") {
      const supabase = createClient();
      supabase.auth.signOut().then(() => {
        // Remove clear parameter from URL to prevent loop/flicker
        const url = new URL(window.location.href);
        url.searchParams.delete("clear");
        router.replace(url.pathname + url.search);
        router.refresh();
      });
    }
  }, [clearSession, router]);

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
        setMessage(t("auth.errorGeneric"));
        return;
      }

      router.push("/campus");
      router.refresh();
    } catch {
      setMessage(t("auth.errorGeneric"));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    setMessage(null);
    const supabase = createClient();
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/api/auth/callback?next=/campus`,
        scopes: "email profile",
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
    setGoogleLoading(false);
    if (error) setMessage(error.message);
  }

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Header Section (Logo removed as requested) */}
      <div className="flex flex-col items-center text-center space-y-1.5 mb-1">
        <Title level="h2" className="text-3xl font-light tracking-tight text-primary">
          {t("auth.signIn")}
        </Title>
        <p className="text-sm text-slate-400 font-medium max-w-[280px]">
          {t("auth.signInDescription")}
        </p>
      </div>

      {/* Auto-signup Info Card in Dolly Baby Blue */}
      <div className="flex items-start gap-3 p-4 bg-info border border-accent/15 rounded-2xl text-xs leading-relaxed shadow-xs">
        <Sparkles className="size-4 text-accent shrink-0 mt-0.5" />
        <p className="text-slate-700 font-medium">
          {t("auth.noAccountNotice")}
        </p>
      </div>

      <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground pl-1">
            {t("auth.email")}
          </Label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-accent transition-colors" />
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-11 rounded-[8px] border-border text-primary focus-visible:border-accent focus-visible:ring-accent/20"
              disabled={loading || googleLoading}
              placeholder="name@example.com"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password" className="text-xs font-semibold text-muted-foreground pl-1">
            {t("auth.password")}
          </Label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-accent transition-colors" />
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-11 rounded-[8px] border-border text-primary focus-visible:border-accent focus-visible:ring-accent/20"
              disabled={loading || googleLoading}
              placeholder="••••••••"
            />
          </div>
        </div>

        {message && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-xs font-semibold text-red-500 mt-1">
            <AlertCircle className="size-4 shrink-0" />
            <p>{message}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full mt-2 rounded-full h-11 font-bold text-white bg-accent hover:bg-accent-hover hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("auth.signingIn")}
            </>
          ) : (
            t("auth.signInWithEmail")
          )}
        </Button>
      </form>

      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white/80 backdrop-blur-xs px-3 text-slate-400 font-bold">{t("common.or")}</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleLogin}
        disabled={loading || googleLoading}
        className="w-full rounded-full h-11 font-bold border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:text-primary active:scale-[0.98] hover:scale-[1.01] transition-all flex items-center justify-center gap-3 shadow-xs border"
      >
        {googleLoading ? (
          <Loader2 className="size-4 animate-spin text-slate-400" />
        ) : (
          <svg className="size-5 shrink-0" viewBox="0 0 24 24" fill="none">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              fill="#EA4335"
            />
          </svg>
        )}
        <span>{t("auth.continueWithGoogle")}</span>
      </Button>

      <p className="text-center mt-2">
        <Link
          href="/"
          className="group inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline transition-all"
        >
          <ArrowLeft className="size-3 group-hover:-translate-x-0.5 transition-transform" />
          {t("auth.backToHome")}
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  const { t } = useTranslation();

  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-slate-500 font-semibold">{t("auth.loadingSignIn")}</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
