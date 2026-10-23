import { createRelativeLink } from "fumadocs-ui/mdx";
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/layouts/docs/page";
import type { Metadata } from "next";
import type { ComponentProps } from "react";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { getMDXComponents } from "@/mdx-components";
import { source } from "@/lib/source";

type Props = { params: Promise<{ slug?: string[] }> };

export default async function Page(props: Props) {
  const { slug } = await props.params;
  const page = source.getPage(slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const PageLink = createRelativeLink(source, page);
  // A link to a file (/demo/tutorials/hilife.png) is a plain <a>: Next's Link would prefetch it as a page.
  const Link = (props: ComponentProps<"a">) =>
    /^\/[^?#]*\.[a-z0-9]+(?:[?#]|$)/i.test(props.href ?? "") ? <a {...props} /> : <PageLink {...props} />;
  return (
    <DocsPage toc={page.data.toc} full={page.data.full} footer={{ children: <SiteFooter /> }}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX components={getMDXComponents({ a: Link })} />
      </DocsBody>
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
  return { title: page.data.title, description: page.data.description };
}
