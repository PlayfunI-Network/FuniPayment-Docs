import { createRelativeLink } from "fumadocs-ui/mdx";
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/layouts/docs/page";
import type { Metadata } from "next";
import type { ComponentProps } from "react";
import { notFound } from "next/navigation";
import { PageBreadcrumb } from "@/components/page-breadcrumb";
import { SiteFooter } from "@/components/site-footer";
import { breadcrumbs } from "@/lib/doc-tree";
import { EXTERNAL_LINK_PROPS, isExternalHref } from "@/lib/external-link";
import { extractFaq, FAQ_URL, formatDate, pageJsonLd, pageMetadata, serializeJsonLd } from "@/lib/seo";
import { seoPage, sidebarSections } from "@/lib/seo-pages";
import { getMDXComponents } from "@/mdx-components";
import { source } from "@/lib/source";

type Props = { params: Promise<{ slug?: string[] }> };

export default async function Page(props: Props) {
  const { slug } = await props.params;
  const page = source.getPage(slug);
  if (!page) notFound();

  const MDX = page.data.body;
  // A page that opens with <DemoHero> gets the full width, so the demo and its text fit side by
  // side; its table of contents moves from the right column to the bar at the top (as on a phone).
  const raw = await page.data.getText("raw");
  const hero = raw.includes("<DemoHero>");
  const seo = seoPage(page);
  const crumbs = breadcrumbs(sidebarSections(), page.url, page.data.title);
  const jsonLd = pageJsonLd(seo, crumbs, page.url === FAQ_URL ? extractFaq(raw) : undefined);
  const PageLink = createRelativeLink(source, page);
  // A link to a file (/demo/tutorials/hilife.png) is a plain <a>: Next's Link would prefetch it as a page.
  // A link to another site (dashboard, official site, Discord) opens in a new tab.
  const Link = (props: ComponentProps<"a">) =>
    isExternalHref(props.href) ? (
      <a {...props} {...EXTERNAL_LINK_PROPS} />
    ) : /^\/[^?#]*\.[a-z0-9]+(?:[?#]|$)/i.test(props.href ?? "") ? (
      <a {...props} />
    ) : (
      <PageLink {...props} />
    );
  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full || hero}
      tableOfContentPopover={hero ? { container: { className: "xl:block" } } : undefined}
      footer={{ children: <SiteFooter /> }}
      breadcrumb={{ enabled: false }}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      <PageBreadcrumb crumbs={crumbs} />
      <DocsTitle className="max-md:text-[1.5em] max-md:leading-snug">{page.data.title}</DocsTitle>
      <DocsDescription className="mb-2 max-md:text-base">{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX components={getMDXComponents({ a: Link })} />
      </DocsBody>
      {/* Not Fumadocs' PageLastUpdate: that one fills the date in after hydration, so it is not in the HTML. */}
      {seo.lastModified && (
        <p className="text-sm text-fd-muted-foreground">
          最後更新於 <time dateTime={seo.lastModified}>{formatDate(seo.lastModified)}</time>
        </p>
      )}
    </DocsPage>
  );
}

export function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  const page = source.getPage(slug);
  if (!page) notFound();
  return pageMetadata(seoPage(page));
}
