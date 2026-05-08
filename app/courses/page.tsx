import Link from "next/link";
import { Title } from "@/components/ui/title";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/shared/navbar";
import { ArrowLeft } from "lucide-react";

/**
 * Placeholder for /courses route.
 * Prevents 404 error boundary from corrupting the React tree.
 * Replace with real course catalogue content later.
 */
export default function CoursesPage() {
  return (
    <main className="relative min-h-screen flex flex-col bg-white text-slate-900 font-sans">
      <Navbar />
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-32">
        <div className="max-w-lg text-center space-y-6">
          <Title level="h1" className="text-primary tracking-tight">
            Courses
          </Title>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Our course catalogue is coming soon. We&apos;re preparing the best
            aviation training experience for you.
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
