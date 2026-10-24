"use client";

import * as React from "react";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/** Title block at the top of every auth form. */
export function AuthHeading({
  icon,
  title,
  description,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-3">
      {icon ? (
        <span className="mb-1 inline-flex size-12 items-center justify-center rounded-full bg-highlight/15 text-primary [&_svg]:size-5">
          {icon}
        </span>
      ) : null}
      <h1 className="font-display text-[32px] font-semibold leading-[1.1] tracking-tight text-primary sm:text-[36px]">
        {title}
      </h1>
      {description ? (
        <p className="text-base leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
    </header>
  );
}

const inputClass =
  "h-12 rounded-[12px] border-primary/15 bg-white px-4 text-[16px] placeholder:text-muted-foreground/60 hover:border-primary/30 focus-visible:border-accent focus-visible:ring-[3px] focus-visible:ring-accent/20 aria-invalid:border-destructive aria-invalid:ring-destructive/15";

type FieldProps = Omit<React.ComponentProps<"input">, "id"> & {
  id: string;
  label: string;
  error?: string | null;
  hint?: string;
  /** Extra element rendered at the right of the label (e.g. "Forgot password?"). */
  labelAside?: React.ReactNode;
};

/** Label + large input + hint or inline error. */
export function AuthField({ id, label, error, hint, labelAside, className, ...props }: FieldProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={id}>{label}</Label>
        {labelAside}
      </div>
      <Input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(inputClass, className)}
        {...props}
      />
      <FieldMessage id={id} error={error} hint={hint} />
    </div>
  );
}

/** Password field with a show/hide toggle. */
export function PasswordField({
  id,
  label,
  error,
  hint,
  labelAside,
  showLabel,
  hideLabel,
  className,
  ...props
}: FieldProps & { showLabel: string; hideLabel: string }) {
  const [visible, setVisible] = React.useState(false);
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={id}>{label}</Label>
        {labelAside}
      </div>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(inputClass, "pr-12", className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? hideLabel : showLabel}
          aria-pressed={visible}
          className="absolute right-1.5 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-paper hover:text-primary focus-visible:outline-hidden focus-visible:ring-[3px] focus-visible:ring-ring"
        >
          {visible ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
        </button>
      </div>
      <FieldMessage id={id} error={error} hint={hint} />
    </div>
  );
}

function FieldMessage({ id, error, hint }: { id: string; error?: string | null; hint?: string }) {
  if (error) {
    return (
      <p id={`${id}-error`} className="flex items-center gap-1.5 text-sm font-medium text-destructive">
        <AlertCircle className="size-4 shrink-0" aria-hidden />
        {error}
      </p>
    );
  }
  if (hint) {
    return (
      <p id={`${id}-hint`} className="text-sm text-muted-foreground">
        {hint}
      </p>
    );
  }
  return null;
}

/** Primary CTA: amber pill with a loading state. */
export function SubmitButton({
  loading,
  loadingLabel,
  children,
  disabled,
  className,
  ...props
}: React.ComponentProps<typeof Button> & { loading?: boolean; loadingLabel?: string }) {
  return (
    <Button
      type="submit"
      size="lg"
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn("h-12 w-full text-base", className)}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="size-[18px] animate-spin" aria-hidden />
          {loadingLabel ?? children}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

/** Form-level message (error, info or success), announced to screen readers. */
export function FormAlert({
  tone = "error",
  children,
  className,
}: {
  tone?: "error" | "info" | "success";
  children: React.ReactNode;
  className?: string;
}) {
  const Icon = tone === "error" ? AlertCircle : tone === "success" ? CheckCircle2 : Info;
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 rounded-[12px] border px-4 py-3 text-sm leading-relaxed",
        tone === "error" && "border-destructive/20 bg-destructive/5 text-destructive",
        tone === "info" && "border-accent/15 bg-info text-primary",
        tone === "success" && "border-success/20 bg-success/5 text-success",
        className,
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

/** "or" separator between Google and the email form. */
export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4" role="separator">
      <span className="h-px flex-1 bg-primary/10" />
      <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
      <span className="h-px flex-1 bg-primary/10" />
    </div>
  );
}

/** Secondary button for Google OAuth (navy outline pill). */
export function GoogleButton({
  loading,
  label,
  onClick,
  disabled,
}: {
  loading?: boolean;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className="h-12 w-full gap-3 border-primary/20 bg-white text-base hover:bg-paper-deep/60"
    >
      {loading ? (
        <Loader2 className="size-[18px] animate-spin" aria-hidden />
      ) : (
        <svg className="size-5" viewBox="0 0 24 24" aria-hidden>
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
      {label}
    </Button>
  );
}

/** Skeleton shown while a form reads search params or the session. */
export function AuthFormSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden>
      <div className="flex flex-col gap-3">
        <div className="h-9 w-3/4 animate-pulse rounded-[8px] bg-primary/[0.06]" />
        <div className="h-5 w-full animate-pulse rounded-[8px] bg-primary/[0.05]" />
      </div>
      <div className="h-12 w-full animate-pulse rounded-full bg-primary/[0.05]" />
      <div className="flex flex-col gap-2">
        <div className="h-4 w-16 animate-pulse rounded bg-primary/[0.06]" />
        <div className="h-12 w-full animate-pulse rounded-[12px] bg-primary/[0.05]" />
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-4 w-16 animate-pulse rounded bg-primary/[0.06]" />
        <div className="h-12 w-full animate-pulse rounded-[12px] bg-primary/[0.05]" />
      </div>
      <div className="h-12 w-full animate-pulse rounded-full bg-highlight/30" />
    </div>
  );
}

/** Basic email shape check; the server has the final word. */
export function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/** Current origin for Supabase redirect URLs (client only). */
export function currentOrigin(): string {
  return typeof window !== "undefined" ? window.location.origin : "";
}
