import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

/** Public pages only; the campus and certificate pages are private or noindex. */
const PATHS: { path: string; priority: number }[] = [
  { path: "", priority: 1 },
  { path: "/about", priority: 0.8 },
  { path: "/directorio", priority: 0.7 },
  { path: "/donate", priority: 0.6 },
  { path: "/get-involved/church", priority: 0.5 },
  { path: "/get-involved/project", priority: 0.5 },
  { path: "/get-involved/teach", priority: 0.5 },
  { path: "/get-involved/volunteer", priority: 0.5 },
  { path: "/get-involved/support", priority: 0.5 },
  { path: "/privacy", priority: 0.2 },
  { path: "/terms", priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return PATHS.map(({ path, priority }) => ({ url: `${base}${path}`, changeFrequency: "monthly", priority }));
}
