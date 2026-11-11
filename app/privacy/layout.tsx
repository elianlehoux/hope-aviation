import type { Metadata } from "next";

// The page is a client component, so its metadata lives in this pass-through layout.
export const metadata: Metadata = {
  title: "Privacidad",
  description:
    "Cómo Hope Aviation trata los datos personales de quienes usan el campus.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
