// Fumadocs pages as the plain data lib/seo and lib/llms work with.
import { docSections, type DocSection } from "@/lib/doc-tree";
import { lastModifiedOf } from "@/lib/last-modified";
import type { SeoPage } from "@/lib/seo";
import { source } from "@/lib/source";

type SourcePage = NonNullable<ReturnType<typeof source.getPage>>;

export function seoPage(page: SourcePage): SeoPage {
  return {
    url: page.url,
    title: page.data.title,
    seoTitle: page.data.seoTitle,
    description: page.data.seoDescription,
    lastModified: lastModifiedOf(page.path),
  };
}

export function sidebarSections(): DocSection[] {
  return docSections(source.getPageTree() as Parameters<typeof docSections>[0]);
}
