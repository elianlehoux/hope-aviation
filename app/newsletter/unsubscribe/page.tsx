"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "@/lib/i18n/context";
import { toast } from "sonner";
import { Mail, CheckCircle, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function UnsubscribeForm() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = React.useState(emailParam);
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  React.useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error(t("newsletter.validationError"));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/newsletter/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || t("newsletter.unsubscribeError"));
      }

      setSuccess(true);
      toast.success(t("newsletter.unsubscribeSuccess"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("newsletter.unsubscribeError"));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="p-8 md:p-12 border-slate-100 bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl text-center space-y-6 max-w-md w-full mx-4 transition-all duration-300">
        <div className="mx-auto flex items-center justify-center p-4 bg-emerald-50 rounded-2xl text-emerald-500 border border-emerald-100 w-fit">
          <CheckCircle className="size-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-primary tracking-tight">
            {t("newsletter.unsubscribeTitle")}
          </h2>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            {t("newsletter.unsubscribeSuccess")}
          </p>
        </div>
        <div className="pt-4">
          <Button asChild className="w-full rounded-xl h-12 font-bold bg-primary text-white">
            <Link href="/">
              {t("campus.backToHome")}
            </Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8 md:p-12 border-slate-100 bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl max-w-md w-full mx-4 space-y-8 transition-all duration-300">
      <div className="text-center space-y-3">
        <img 
          src="/logos/Hope Black.svg" 
          alt="Hope Aviation" 
          className="h-16 w-auto mx-auto drop-shadow-sm" 
        />
        <h2 className="text-2xl font-extrabold text-primary tracking-tight">
          {t("newsletter.unsubscribeTitle")}
        </h2>
        <p className="text-sm text-slate-500 font-medium leading-relaxed">
          {t("newsletter.unsubscribeConfirm").replace("{email}", email || "your email")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-semibold text-slate-600 pl-1">
            {t("newsletter.placeholder") || "Email Address"}
          </Label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 transition-colors group-focus-within:text-primary" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="pl-11 rounded-xl border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all h-12 text-base font-medium"
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl h-12 font-bold bg-primary text-white hover:scale-102 active:scale-98 transition-all duration-200"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("newsletter.sending") || "Processing..."}
            </>
          ) : (
            t("newsletter.unsubscribeBtn")
          )}
        </Button>
      </form>
    </Card>
  );
}

export default function UnsubscribePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <React.Suspense fallback={
        <Card className="p-8 border-slate-100 bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl max-w-md w-full mx-4 h-80 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </Card>
      }>
        <UnsubscribeForm />
      </React.Suspense>
    </div>
  );
}
