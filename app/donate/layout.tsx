import type { Metadata } from "next";

// The page is a client component, so its metadata lives in this pass-through layout.
export const metadata: Metadata = {
  title: "Apoyar",
  description:
    "Cómo apoyar a Hope Aviation: ofrendas, becas para estudiantes y alianzas que mantienen el campus gratuito.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
