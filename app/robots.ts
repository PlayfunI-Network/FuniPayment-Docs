import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/layout.shared";

export const dynamic = "force-static";

// Every crawler may read everything; AI crawlers get no rules of their own.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
