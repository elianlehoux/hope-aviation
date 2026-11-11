import type { Metadata } from "next";

// The page is a client component, so its metadata lives in this pass-through layout.
export const metadata: Metadata = {
  title: "Darte de baja del boletín",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
