import Link from "next/link";
import { Title } from "@/components/ui/title";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/shared/navbar";
import { ArrowLeft } from "lucide-react";

/**
 * Catch-all placeholder for /get-involved/* routes.
 * Prevents 404 error boundaries from corrupting the React tree
 * during client-side navigation. Replace with real content later.
 */

const VALID_SLUGS: Record<string, string> = {
  church: "Connect Your Church",
  project: "Connect Your Project",
  teach: "Teach",
  volunteer: "Volunteer",
  support: "Support Us",
};

export default async function GetInvolvedPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const title = VALID_SLUGS[slug];

  if (!title) {
    const { notFound } = await import("next/navigation");
    notFound();
  }

  return (
    <main className="relative min-h-screen flex flex-col bg-white text-slate-900 font-sans">
      <Navbar />
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-32">
        <div className="max-w-lg text-center space-y-6">
          <Title level="h1" className="text-primary tracking-tight">
            {title}
          </Title>
          <p className="text-lg text-muted-foreground leading-relaxed">
            This section is coming soon. We&apos;re building something
            meaningful — stay tuned.
          </p>
          <Button asChild variant="outline" size="lg" className="group">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
              Back to home
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
