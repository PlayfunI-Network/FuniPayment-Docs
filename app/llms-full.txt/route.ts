import { llmsFullTxt, pageMarkdown } from "@/lib/llms";
import { seoPage, sidebarSections } from "@/lib/seo-pages";
import { source } from "@/lib/source";

export const dynamic = "force-static";

export async function GET() {
  const pages = new Map(source.getPages().map((page) => [page.url, page]));
  const urls = sidebarSections().flatMap((section) => section.urls);
  const markdown = await Promise.all(
    urls.map(async (url) => {
      const page = pages.get(url);
      if (!page) throw new Error(`側邊欄的 ${url} 找不到頁面`);
      return pageMarkdown(seoPage(page), await page.data.getText("raw"));
    }),
  );
  return new Response(llmsFullTxt(markdown), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
