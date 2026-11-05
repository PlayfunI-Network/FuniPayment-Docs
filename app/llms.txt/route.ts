import { llmsTxt } from "@/lib/llms";
import { seoPage, sidebarSections } from "@/lib/seo-pages";
import { source } from "@/lib/source";

export const dynamic = "force-static";

export function GET() {
  const pages = new Map(source.getPages().map((page) => [page.url, seoPage(page)]));
  return new Response(llmsTxt(sidebarSections(), pages), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
