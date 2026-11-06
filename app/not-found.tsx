"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/context";

export default function NotFound() {
  const router = useRouter();
  const { lang } = useTranslation();
  const es = lang === "es";

  const goBack = () => {
    // Go back only when the previous page is ours; otherwise send people home.
    if (window.history.length > 1 && document.referrer.startsWith(window.location.origin)) router.back();
    else router.push("/");
  };

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-paper px-6 py-20 text-center">
      <Link href="/" aria-label="Hope Aviation" className="mb-12">
        <Image src="/logos/hope-logo.svg" alt="Hope Aviation" width={130} height={40} className="h-9 w-auto" priority />
      </Link>
      <p className="font-display text-[96px] font-semibold leading-none tracking-tight text-highlight md:text-[140px]" aria-hidden>
        404
      </p>
      <h1 className="mt-6 font-display text-2xl font-semibold tracking-tight text-primary md:text-3xl">
        {es ? "No encontramos esta página" : "We couldn't find this page"}
      </h1>
      <p className="mt-3 max-w-md text-base leading-relaxed text-primary/65">
        {es
          ? "Puede que el enlace esté mal escrito, que la página se haya movido o que no tengas acceso a ella."
          : "The link may be mistyped, the page may have moved, or you may not have access to it."}
      </p>
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <Button onClick={goBack} size="lg" variant="outline">
          <ArrowLeft aria-hidden />
          {es ? "Volver" : "Go back"}
        </Button>
        <Button asChild size="lg">
          <Link href="/">{es ? "Ir al inicio" : "Go home"}</Link>
        </Button>
      </div>
    </main>
  );
}
