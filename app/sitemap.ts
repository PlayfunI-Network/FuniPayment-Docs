import type { MetadataRoute } from "next";
import { source } from "@/lib/source";

export const dynamic = "force-static";

const SITE = "https://docs.funipay.net";

export default function sitemap(): MetadataRoute.Sitemap {
  return source.getPages().map((page) => ({
    url: page.url === "/" ? SITE : `${SITE}${page.url}`,
  }));
}
