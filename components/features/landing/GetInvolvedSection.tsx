"use client";

import Link from "next/link";
import { Title } from "@/components/ui/title";
import { Button } from "@/components/ui/button";
import { T } from "@/lib/i18n/context";
import {
  Church,
  Briefcase,
  GraduationCap,
  Heart,
  Gift,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface InvolvementOption {
  titleKey: string;
  descriptionKey: string;
  features: string[];
  icon: LucideIcon;
  color: string;
  iconBg: string;
  href: string;
}

const involvementOptions: InvolvementOption[] = [
  {
    titleKey: "landing.churchTitle",
    descriptionKey: "landing.churchDescription",
    features: [
      "landing.churchFeature1",
      "landing.churchFeature2",
      "landing.churchFeature3",
    ],
    icon: Church,
    color: "text-amber-500",
    iconBg: "bg-amber-500/10",
    href: "/get-involved/church",
  },
  {
    titleKey: "landing.projectTitle",
    descriptionKey: "landing.projectDescription",
    features: [
      "landing.projectFeature1",
      "landing.projectFeature2",
      "landing.projectFeature3",
    ],
    icon: Briefcase,
    color: "text-accent",
    iconBg: "bg-accent/10",
    href: "/get-involved/project",
  },
  {
    titleKey: "landing.teachTitle",
    descriptionKey: "landing.teachDescription",
    features: [
      "landing.teachFeature1",
      "landing.teachFeature2",
      "landing.teachFeature3",
    ],
    icon: GraduationCap,
    color: "text-emerald-500",
    iconBg: "bg-emerald-500/10",
    href: "/get-involved/teach",
  },
  {
    titleKey: "landing.volunteerTitle",
    descriptionKey: "landing.volunteerDescription",
    features: [
      "landing.volunteerFeature1",
      "landing.volunteerFeature2",
      "landing.volunteerFeature3",
    ],
    icon: Heart,
    color: "text-rose-500",
    iconBg: "bg-rose-500/10",
    href: "/get-involved/volunteer",
  },
  {
    titleKey: "landing.donateTitle",
    descriptionKey: "landing.donateDescription",
    features: [
      "landing.donateFeature1",
      "landing.donateFeature2",
      "landing.donateFeature3",
    ],
    icon: Gift,
    color: "text-purple-500",
    iconBg: "bg-purple-500/10",
    href: "/get-involved/support",
  },
];

/**
 * GetInvolvedSection — Landing page section showing the 5 ways to participate
 * in the Hope Aviation mission: Church, Project, Teach, Volunteer, Donate.
 */
export function GetInvolvedSection() {
  return (
    <section
      id="get-involved"
      className="w-full bg-[#00263E] py-32 relative overflow-hidden"
    >
      {/* Ambient background effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/8 rounded-full blur-[160px] -mr-64 -mt-64" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#ffaa00]/6 rounded-full blur-[120px] -ml-48 -mb-48" />
      </div>

      <div className="mx-auto max-w-7xl px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <Title
            level="h2"
            className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-6"
          >
            <T k="landing.getInvolvedTitle" />
          </Title>
          <p className="text-xl text-white/60 max-w-2xl mx-auto font-medium leading-relaxed">
            <T k="landing.getInvolvedSubtitle" />
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {involvementOptions.map((option) => {
            const Icon = option.icon;
            return (
              <div
                key={option.titleKey}
                className="group bg-white/5 backdrop-blur-sm rounded-[20px] p-8 border border-white/10 hover:bg-white/10 hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                {/* Icon */}
                <div
                  className={`size-14 rounded-2xl ${option.iconBg} flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110`}
                >
                  <Icon className={`size-7 ${option.color}`} />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
                  <T k={option.titleKey} />
                </h3>

                {/* Description */}
                <p className="text-white/50 text-[15px] font-medium leading-relaxed mb-6">
                  <T k={option.descriptionKey} />
                </p>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {option.features.map((featureKey) => (
                    <li
                      key={featureKey}
                      className="flex items-start gap-3 text-white/40 text-sm font-medium"
                    >
                      <CheckCircle2
                        className={`size-4 ${option.color} shrink-0 mt-0.5`}
                      />
                      <T k={featureKey} />
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  asChild
                  className="w-full rounded-full bg-transparent border border-white/20 text-white hover:bg-white/10 font-bold h-11 text-sm transition-all duration-200 group/btn"
                >
                  <Link
                    href={option.href}
                    className="flex items-center justify-center gap-2"
                  >
                    <T k="landing.getInvolvedContact" />
                    <ArrowRight className="size-4 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
