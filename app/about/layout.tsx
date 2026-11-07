import type { Metadata } from "next";

// The page is a client component, so its metadata lives in this pass-through layout.
export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "Qué es Hope Aviation: un proyecto independiente que prepara voluntarios y pilotos para la aviación misionera, empezando por un campus virtual gratuito.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
