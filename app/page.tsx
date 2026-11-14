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
  ValuesBand,
  GetInvolvedBand,
  NewsletterBand,
} from "@/components/features/landing/HomeSections";
import { FeaturedCourses } from "@/components/features/landing/FeaturedCourses";
import { CoursesGallery } from "@/components/features/landing/CoursesGallery";
import { MotionRoot } from "@/components/features/landing/motion";
import { MOTION_BOOT_SCRIPT } from "@/components/features/landing/motion-boot";

/**
 * Public home page. Bands follow the 2025 brochure rhythm:
 * photo hero → navy strip → white → amber → paper → white → ink → photo → blue → paper → ink footer.
 * Hope Aviation is not a flight school: it trains pilots and volunteers for
 * mission aviation through a free online campus and connects them with
 * organizations already in the field.
 */
export default function LandingPage() {
  return (
    <>
      {/* Marks the page as animated before first paint; MotionRoot takes over after hydration. */}
      <script dangerouslySetInnerHTML={{ __html: MOTION_BOOT_SCRIPT }} />
      <MotionRoot />
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
        <ValuesBand />
        <GetInvolvedBand />
        <NewsletterBand />
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
