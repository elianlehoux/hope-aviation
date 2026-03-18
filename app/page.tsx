import Link from "next/link";

/**
 * Landing Page — Public-facing homepage for Hope Aviation.
 * Serves as the entry point showcasing the platform and
 * providing navigation to the virtual campus.
 */
export default function LandingPage() {
  return (
    <main className="relative min-h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* ── Navbar ── */}
      <nav className="w-full border-b border-border/40 backdrop-blur-md bg-background/80 sticky top-0 z-50">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
          <span className="text-xl font-bold tracking-tight">
            Hope Aviation
          </span>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#about" className="hover:text-foreground transition-colors">
              About
            </a>
            <a href="#contact" className="hover:text-foreground transition-colors">
              Contact
            </a>
          </div>

          <Link
            href="/campus"
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
          >
            Enter Campus
          </Link>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 md:py-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(120,119,198,0.15),transparent)]" />

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight max-w-3xl">
          Your Aviation Journey
          <br />
          <span className="text-primary">Starts Here</span>
        </h1>

        <p className="mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed">
          A modern virtual campus designed for aviation students and
          professionals. Learn, grow, and take flight — all from one place.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link
            href="/campus"
            className="rounded-lg bg-primary px-8 py-3 text-base font-semibold text-primary-foreground shadow-md hover:opacity-90 transition-opacity"
          >
            Go to Campus
          </Link>
          <a
            href="#features"
            className="rounded-lg border border-border px-8 py-3 text-base font-semibold text-foreground hover:bg-accent transition-colors"
          >
            Learn More
          </a>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section
        id="features"
        className="w-full bg-muted/50 border-t border-border py-20 px-6"
      >
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Everything You Need to Succeed
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Our platform provides a comprehensive suite of tools built
            specifically for aviation training and education.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Interactive Courses",
              description:
                "Structured modules covering theory, regulations, and practical knowledge.",
            },
            {
              title: "Live Sessions",
              description:
                "Real-time classes with expert instructors from the aviation industry.",
            },
            {
              title: "Progress Tracking",
              description:
                "Monitor your advancement with detailed analytics and milestone tracking.",
            },
            {
              title: "Resource Library",
              description:
                "Access manuals, study guides, and reference materials anytime.",
            },
            {
              title: "Community Forum",
              description:
                "Connect with fellow students and aviation professionals worldwide.",
            },
            {
              title: "Certifications",
              description:
                "Earn recognized certificates as you complete each training programme.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── About Section ── */}
      <section id="about" className="w-full py-20 px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            About Hope Aviation
          </h2>
          <p className="mt-6 text-muted-foreground leading-relaxed">
            Hope Aviation is a next-generation virtual campus committed to
            delivering world-class aviation education. Our mission is to make
            professional aviation training accessible, modern, and effective
            for everyone — regardless of location.
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="w-full border-t border-border py-8 px-6 text-center text-sm text-muted-foreground">
        <p>
          &copy; 2026 Hope Aviation. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
