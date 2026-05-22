"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/lib/i18n/context";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

/**
 * NewsletterForm — Client component for the annual newsletter subscription.
 * Extracted from the landing page footer to allow event handlers.
 */
export function NewsletterForm() {
  const { t } = useTranslation();
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);

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
    <form
      className="mt-2 flex items-center gap-2"
      onSubmit={handleSubmit}
    >
      <div className="relative w-full">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("landing.newsletterPlaceholder")}
          className="pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 hover:border-white/20 focus-visible:border-accent focus-visible:ring-accent/20 rounded-xl h-11"
          required
          disabled={loading}
        />
        <Button
          type="submit"
          size="icon"
          disabled={loading}
          className="absolute right-1 top-1 h-9 w-9 rounded-lg bg-accent hover:bg-accent/90 text-white transition-colors flex items-center justify-center"
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
        </Button>
      </div>
    </form>
  );
}

