// A page's Markdown copy. The export writes these under out/md/; the build's last step
// (scripts/publish-markdown.mjs) moves them next to the pages, so /payments/fp has /payments/fp.md.
import { notFound } from "next/navigation";
import { pageMarkdown } from "@/lib/llms";
import { markdownPath } from "@/lib/seo";
import { seoPage } from "@/lib/seo-pages";
import { source } from "@/lib/source";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return source.getPages().map((page) => ({ slug: markdownPath(page.url).slice(1).split("/") }));
}

export async function GET(_request: Request, props: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await props.params;
  const path = slug.join("/").replace(/\.md$/, "");
  const page = source.getPage(path === "index" ? [] : path.split("/"));
  if (!page) notFound();
  return new Response(pageMarkdown(seoPage(page), await page.data.getText("raw")), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
