import type { MetadataRoute } from "next";
import { isIndexable, siteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  if (!isIndexable()) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    // The campus, auth screens and APIs need a session or are not content.
    rules: { userAgent: "*", allow: "/", disallow: ["/campus", "/auth", "/api", "/componentsdev", "/newsletter"] },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
