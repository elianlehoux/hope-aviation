import { Suspense } from "react";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { BackToTop } from "@/components/shared/back-to-top";
import { Hero } from "@/components/features/landing/Hero";
import {
  MissionSection,
  WhyArgentinaSection,
  TrainingPathSection,
  RegionsSection,
  GetInvolvedBand,
  NewsletterBand,
} from "@/components/features/landing/HomeSections";
import { FeaturedCourses } from "@/components/features/landing/FeaturedCourses";
import { CoursesGallery } from "@/components/features/landing/CoursesGallery";

/**
 * Public home page. Bands follow the 2025 brochure rhythm:
 * photo hero → white → amber → paper → white → ink → blue → paper → ink footer.
 * Hope Aviation is not a flight school: it trains pilots and volunteers for
 * mission aviation through a free online campus and connects them with
 * organizations already in the field.
 */
export default function LandingPage() {
  return (
    <>
      <Navbar overlay />
      <main id="contenido" className="flex flex-col bg-white font-sans text-primary">
        <Hero />
        <MissionSection />
        <WhyArgentinaSection />
        <TrainingPathSection />
        {/* Course data reads the session cookie, so it streams in behind Suspense */}
        <Suspense fallback={<CoursesGallery courses={[]} loading />}>
          <FeaturedCourses />
        </Suspense>
        <RegionsSection />
        <GetInvolvedBand />
        <NewsletterBand />
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
