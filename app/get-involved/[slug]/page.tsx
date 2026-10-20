import Link from "next/link";
import Image from "next/image";
import { Title } from "@/components/ui/title";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/shared/navbar";
import { T } from "@/lib/i18n/context";
import {
  Church,
  Briefcase,
  GraduationCap,
  Heart,
  Gift,
  CheckCircle2,
  Mail,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const VALID_SLUGS = ["church", "project", "teach", "volunteer", "support"] as const;

export function generateStaticParams() {
  return VALID_SLUGS.map((slug) => ({ slug }));
}

interface InvolvementOption {
  slug: string;
  titleKey: string;
  descriptionKey: string;
  features: string[];
  icon: LucideIcon;
  color: string;
  iconBg: string;
}

const involvementOptions: InvolvementOption[] = [
  {
    slug: "church",
    titleKey: "landing.churchTitle",
    descriptionKey: "landing.churchDescription",
    features: ["landing.churchFeature1", "landing.churchFeature2", "landing.churchFeature3"],
    icon: Church,
    color: "text-amber-500",
    iconBg: "bg-amber-500/10",
  },
  {
    slug: "project",
    titleKey: "landing.projectTitle",
    descriptionKey: "landing.projectDescription",
    features: ["landing.projectFeature1", "landing.projectFeature2", "landing.projectFeature3"],
    icon: Briefcase,
    color: "text-accent",
    iconBg: "bg-accent/10",
  },
  {
    slug: "teach",
    titleKey: "landing.teachTitle",
    descriptionKey: "landing.teachDescription",
    features: ["landing.teachFeature1", "landing.teachFeature2", "landing.teachFeature3"],
    icon: GraduationCap,
    color: "text-emerald-500",
    iconBg: "bg-emerald-500/10",
  },
  {
    slug: "volunteer",
    titleKey: "landing.volunteerTitle",
    descriptionKey: "landing.volunteerDescription",
    features: ["landing.volunteerFeature1", "landing.volunteerFeature2", "landing.volunteerFeature3"],
    icon: Heart,
    color: "text-rose-500",
    iconBg: "bg-rose-500/10",
  },
  {
    slug: "support",
    titleKey: "landing.donateTitle",
    descriptionKey: "landing.donateDescription",
    features: ["landing.donateFeature1", "landing.donateFeature2", "landing.donateFeature3"],
    icon: Gift,
    color: "text-purple-500",
    iconBg: "bg-purple-500/10",
  },
];

export default async function GetInvolvedPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const option = involvementOptions.find((opt) => opt.slug === slug);

  if (!option) {
    const { notFound } = await import("next/navigation");
    notFound();
    return null;
  }

  const Icon = option.icon;

  return (
    <main className="relative min-h-screen flex flex-col bg-[#1C1E21] text-white font-sans overflow-hidden">
      <Navbar />
      
      {/* ═══════════════════════ HERO BACKGROUND ═══════════════════════════════════════ */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/Untitled-1 copy.webp"
          alt="Kids watching an airplane"
          fill
          priority
          className="object-cover object-center opacity-30"
        />
        {/* Gradient scrims identical to About Us */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary via-transparent to-[#1C1E21]" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent" />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-32 sm:py-40 relative z-10">
        <div className="w-full max-w-3xl">
          
          <div className="bg-white/5 backdrop-blur-xl rounded-[32px] p-8 md:p-14 border border-white/10">

            <Title level="h1" className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-8 leading-[1.1]">
              <T k={option.titleKey} />
            </Title>
            
            <p className="text-lg md:text-xl lg:text-2xl text-white/70 leading-relaxed font-medium mb-12">
              <T k={option.descriptionKey} />
            </p>

            <div className="bg-black/30 rounded-2xl p-8 mb-12 border border-white/5">
              <ul className="space-y-6">
                {option.features.map((featureKey) => (
                  <li key={featureKey} className="flex items-start gap-4">
                    <CheckCircle2 className={`size-6 ${option.color} shrink-0 mt-0.5`} />
                    <span className="text-white/80 text-[17px] md:text-[19px] font-medium leading-relaxed">
                      <T k={featureKey} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <Button asChild size="lg" className="w-full h-16 rounded-full bg-white text-primary hover:bg-slate-100 font-bold text-[18px] transition-all duration-200 shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)]">
              <a href="mailto:hope.aviation.uap@gmail.com" className="flex items-center justify-center gap-2">
                <Mail className="size-6" />
                <T k="landing.getInvolvedContact" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
