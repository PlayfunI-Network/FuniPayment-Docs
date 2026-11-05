import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { seoPage } from "@/lib/seo-pages";
import { source } from "@/lib/source";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return source.getPages().map((page) => {
    const { lastModified } = seoPage(page);
    return { url: absoluteUrl(page.url), ...(lastModified ? { lastModified } : {}) };
  });
}
