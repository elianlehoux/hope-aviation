import type { Metadata } from "next";

// The page is a client component, so its metadata lives in this pass-through layout.
export const metadata: Metadata = {
  title: "Términos",
  description:
    "Términos de uso del campus virtual de Hope Aviation.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
