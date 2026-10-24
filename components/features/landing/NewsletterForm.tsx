"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/lib/i18n/context";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * NewsletterForm — annual newsletter subscription.
 * `dark` sits on ink/navy bands (footer); `light` sits on paper/white.
 */
export function NewsletterForm({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const { t, lang } = useTranslation();
  const es = lang === "es";
  const inputId = React.useId();
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const light = variant === "light";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || t("newsletter.subscribeErrorToast"));
      }

      toast.success(t("newsletter.subscribeSuccessToast"));
      setEmail("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("newsletter.subscribeErrorToast"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex w-full flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
      <label htmlFor={inputId} className="sr-only">
        {es ? "Tu email" : "Your email"}
      </label>
      <Input
        id={inputId}
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t("landing.newsletterPlaceholder")}
        className={cn(
          "h-12 flex-1 rounded-full px-5 text-base",
          light
            ? "border-primary/20 bg-white text-primary placeholder:text-primary/45 focus-visible:border-accent focus-visible:ring-accent/20"
            : "border-white/15 bg-white/5 text-white placeholder:text-white/40 hover:border-white/25 focus-visible:border-white/60 focus-visible:ring-white/20",
        )}
        required
        disabled={loading}
      />
      <Button
        type="submit"
        disabled={loading}
        className={cn(
          "h-12 px-6",
          light
            ? "bg-primary text-white hover:bg-primary/90"
            : "bg-white text-primary hover:bg-white/90 focus-visible:ring-white/60",
        )}
      >
        {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        {es ? "Suscribirme" : "Subscribe"}
      </Button>
    </form>
  );
}
