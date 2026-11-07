"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useTranslation } from "@/lib/i18n/context";
import { safeNext } from "@/lib/auth/safe-next";
import {
  AuthDivider,
  AuthField,
  AuthHeading,
  FormAlert,
  GoogleButton,
  PasswordField,
  SubmitButton,
  currentOrigin,
  looksLikeEmail,
} from "./auth-ui";

type LoginError = "credentials" | "unconfirmed" | "inactive" | "link" | "network" | "google" | null;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lang } = useTranslation();
  const es = lang === "es";

  const next = safeNext(searchParams.get("next"));
  const clearSession = searchParams.get("clear") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [error, setError] = useState<LoginError>(
    searchParams.get("inactive") ? "inactive" : searchParams.get("error") ? "link" : null,
  );
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent">("idle");

  // `?clear=1` signs out a stale session before showing the form.
  useEffect(() => {
    if (!clearSession) return;
    const supabase = createClient();
    supabase.auth.signOut().then(() => {
      const url = new URL(window.location.href);
      url.searchParams.delete("clear");
      router.replace(url.pathname + url.search);
      router.refresh();
    });
  }, [clearSession, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const eErr = !email.trim()
      ? es ? "Escribí tu mail." : "Enter your email."
      : !looksLikeEmail(email)
        ? es ? "Ese mail no parece válido." : "That email doesn't look right."
        : null;
    const pErr = !password ? (es ? "Escribí tu clave." : "Enter your password.") : null;
    setEmailError(eErr);
    setPasswordError(pErr);
    if (eErr || pErr) return;

    setLoading(true);
    setError(null);
    setResendState("idle");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: { code?: string } } | null;
        const code = body?.error?.code;
        setError(code === "email_not_confirmed" ? "unconfirmed" : code === "account_inactive" ? "inactive" : "credentials");
        setLoading(false);
        return;
      }
      router.replace(next);
      router.refresh();
    } catch {
      setError("network");
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${currentOrigin()}/api/auth/callback?next=${encodeURIComponent(next)}`,
        scopes: "email profile",
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
    if (oauthError) {
      setGoogleLoading(false);
      setError("google");
    }
  }

  async function handleResend() {
    setResendState("sending");
    const supabase = createClient();
    await supabase.auth.resend({
      type: "signup",
      email: email.trim(),
      options: { emailRedirectTo: `${currentOrigin()}/api/auth/callback?next=${encodeURIComponent(next)}` },
    });
    setResendState("sent");
  }

  const busy = loading || googleLoading;
  const signupHref = next === "/campus" ? "/auth/registro" : `/auth/registro?next=${encodeURIComponent(next)}`;

  return (
    <div className="flex flex-col gap-8">
      <AuthHeading
        title={es ? "Entrá al campus" : "Sign in to the campus"}
        description={es ? "Seguí con tus cursos donde los dejaste." : "Pick up your courses where you left off."}
      />

      <GoogleButton
        onClick={handleGoogle}
        loading={googleLoading}
        disabled={busy}
        label={es ? "Continuar con Google" : "Continue with Google"}
      />

      <AuthDivider label={es ? "o con tu mail" : "or with email"} />

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <AuthField
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          label={es ? "Mail" : "Email"}
          placeholder={es ? "nombre@ejemplo.com" : "name@example.com"}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) setEmailError(null);
          }}
          error={emailError}
          disabled={busy}
        />

        <PasswordField
          id="password"
          name="password"
          autoComplete="current-password"
          label={es ? "Clave" : "Password"}
          showLabel={es ? "Mostrar clave" : "Show password"}
          hideLabel={es ? "Ocultar clave" : "Hide password"}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (passwordError) setPasswordError(null);
          }}
          error={passwordError}
          disabled={busy}
          labelAside={
            <Link
              href="/auth/recuperar"
              className="rounded-sm text-sm font-medium text-accent underline-offset-4 hover:underline focus-visible:outline-hidden focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              {es ? "¿Olvidaste tu clave?" : "Forgot your password?"}
            </Link>
          }
        />

        {error === "inactive" ? (
          <FormAlert>
            <p className="font-semibold">{es ? "Tu cuenta está desactivada" : "Your account is deactivated"}</p>
            <p className="mt-0.5 text-destructive/80">
              {es
                ? "Si creés que es un error, escribinos a hope.aviation.uap@gmail.com."
                : "If you think this is a mistake, write to hope.aviation.uap@gmail.com."}
            </p>
          </FormAlert>
        ) : null}

        {error === "credentials" ? (
          <FormAlert>
            <p className="font-semibold">{es ? "Mail o clave incorrectos" : "Wrong email or password"}</p>
            <p className="mt-0.5 text-destructive/80">
              {es ? "Revisá los datos o " : "Check them and try again, or "}
              <Link href="/auth/recuperar" className="font-semibold underline underline-offset-2">
                {es ? "recuperá tu clave" : "reset your password"}
              </Link>
              .
            </p>
          </FormAlert>
        ) : null}

        {error === "unconfirmed" ? (
          <FormAlert tone="info">
            <p className="font-semibold">{es ? "Todavía no confirmaste tu mail" : "Your email isn't confirmed yet"}</p>
            <p className="mt-0.5 text-primary/75">
              {es
                ? "Abrí el link que te mandamos al crear la cuenta."
                : "Open the link we sent when you created your account."}
            </p>
            <button
              type="button"
              onClick={handleResend}
              disabled={resendState !== "idle"}
              className="mt-2 font-semibold text-accent underline-offset-4 hover:underline disabled:text-primary/65 disabled:no-underline"
            >
              {resendState === "sent"
                ? es ? "Listo, te lo reenviamos." : "Done, we sent it again."
                : resendState === "sending"
                  ? es ? "Reenviando…" : "Sending…"
                  : es ? "Reenviar el mail" : "Resend the email"}
            </button>
          </FormAlert>
        ) : null}

        {error === "link" ? (
          <FormAlert>
            {es
              ? "No pudimos completar el ingreso con ese link. Si ya confirmaste tu mail, entrá con tu clave."
              : "We couldn't sign you in with that link. If you already confirmed your email, sign in with your password."}
          </FormAlert>
        ) : null}

        {error === "network" ? (
          <FormAlert>
            {es ? "No pudimos conectarnos. Probá de nuevo en un momento." : "We couldn't connect. Try again in a moment."}
          </FormAlert>
        ) : null}

        {error === "google" ? (
          <FormAlert>
            {es ? "No pudimos abrir Google. Probá de nuevo." : "We couldn't open Google. Try again."}
          </FormAlert>
        ) : null}

        <SubmitButton loading={loading} loadingLabel={es ? "Entrando…" : "Signing in…"} disabled={googleLoading} className="mt-1">
          {es ? "Entrar" : "Sign in"}
        </SubmitButton>
      </form>

      <p className="text-center text-[15px] text-muted-foreground">
        {es ? "¿No tenés cuenta? " : "New here? "}
        <Link
          href={signupHref}
          className="rounded-sm font-semibold text-primary underline decoration-highlight decoration-2 underline-offset-4 hover:decoration-primary focus-visible:outline-hidden focus-visible:ring-[3px] focus-visible:ring-ring"
        >
          {es ? "Creá una gratis" : "Create a free account"}
        </Link>
      </p>
    </div>
  );
}
