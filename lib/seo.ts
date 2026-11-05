// Everything search engines and AI crawlers read about a page: its <head> metadata and JSON-LD.
// The facts here all come from the page itself or the site's settings; nothing is written only
// for crawlers (no ratings, no customer counts, no SearchAction: the search box has no URL).
import type { Metadata } from "next";
import { CONTACT_EMAIL, OFFICIAL_URL, SITE_NAME, SITE_URL } from "@/lib/layout.shared";
import { type Crumb } from "@/lib/doc-tree";

export const PRODUCT_NAME = "FunI 付款系統";
export const OG_IMAGE = { url: "/brand/og-default.png", width: 1200, height: 630, alt: `${SITE_NAME}：Discord 收款機器人使用說明` };
export const FAQ_URL = "/troubleshooting/faq";

const ORGANIZATION_ID = `${OFFICIAL_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

/** Search results cut by pixels, and a CJK character is about two Latin ones wide. */
export function displayWidth(text: string): number {
  let width = 0;
  for (const char of text) {
    width += /[ᄀ-ᅟ⺀-꓏가-힣豈-﫿︰-﹯＀-｠￠-￦]/u.test(char) ? 2 : 1;
  }
  return width;
}

export function absoluteUrl(url: string): string {
  return url === "/" ? SITE_URL : `${SITE_URL}${url}`;
}

/** Where a page's Markdown copy is published: /payments/fp -> /payments/fp.md, / -> /index.md. */
export function markdownPath(url: string): string {
  return url === "/" ? "/index.md" : `${url}.md`;
}

export type SeoPage = {
  url: string;
  /** The page's H1. */
  title: string;
  /** A fuller title for search results, when the H1 alone says too little. */
  seoTitle?: string;
  /** The summary for search results and llms.txt (frontmatter seoDescription). */
  description: string;
  /** ISO date of the page's last commit, when known. */
  lastModified?: string;
};

/** The whole <title>: the home page's stands alone, every other page ends with the site's name. */
export function documentTitle(page: Pick<SeoPage, "url" | "title" | "seoTitle">): string {
  const title = page.seoTitle ?? page.title;
  return page.url === "/" ? title : `${title}｜${SITE_NAME}`;
}

export function pageMetadata(page: SeoPage): Metadata {
  const title = documentTitle(page);
  const isHome = page.url === "/";
  return {
    title: { absolute: title },
    description: page.description,
    alternates: {
      canonical: absoluteUrl(page.url),
      types: { "text/markdown": markdownPath(page.url) },
    },
    openGraph: {
      type: isHome ? "website" : "article",
      siteName: SITE_NAME,
      locale: "zh_TW",
      url: absoluteUrl(page.url),
      title,
      description: page.description,
      images: [OG_IMAGE],
      ...(!isHome && page.lastModified ? { modifiedTime: page.lastModified } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: page.description,
      images: [OG_IMAGE.url],
    },
  };
}

function organization() {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: PRODUCT_NAME,
    url: OFFICIAL_URL,
    logo: { "@type": "ImageObject", url: `${SITE_URL}/brand/funi-logo.webp`, width: 480, height: 526 },
    email: CONTACT_EMAIL,
  };
}

function website() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "zh-TW",
    publisher: { "@id": ORGANIZATION_ID },
  };
}

function softwareApplication(description: string) {
  return {
    "@type": "SoftwareApplication",
    name: PRODUCT_NAME,
    url: OFFICIAL_URL,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Discord",
    inLanguage: "zh-TW",
    description,
    publisher: { "@id": ORGANIZATION_ID },
  };
}

/** Schema.org wants an `item` on every crumb but the last, so a crumb with no page of its own is left out. */
function breadcrumbList(crumbs: Crumb[], pageUrl: string) {
  const linked = crumbs.filter((crumb) => crumb.url !== undefined && crumb.url !== pageUrl);
  const last = crumbs[crumbs.length - 1];
  return {
    "@type": "BreadcrumbList",
    itemListElement: [...linked, last].map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: absoluteUrl(crumb === last ? pageUrl : (crumb.url as string)),
    })),
  };
}

function article(page: SeoPage) {
  return {
    "@type": "TechArticle",
    "@id": `${absoluteUrl(page.url)}#article`,
    headline: page.title,
    description: page.description,
    url: absoluteUrl(page.url),
    mainEntityOfPage: absoluteUrl(page.url),
    inLanguage: "zh-TW",
    image: `${SITE_URL}${OG_IMAGE.url}`,
    ...(page.lastModified ? { dateModified: page.lastModified } : {}),
    author: { "@id": ORGANIZATION_ID },
    publisher: { "@id": ORGANIZATION_ID },
    isPartOf: { "@id": WEBSITE_ID },
  };
}

function faqPage(url: string, faq: FaqEntry[]) {
  return {
    "@type": "FAQPage",
    "@id": `${absoluteUrl(url)}#faq`,
    url: absoluteUrl(url),
    inLanguage: "zh-TW",
    mainEntity: faq.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
}

/** The JSON-LD graph of a page. `faq` is the page's own questions, when it is the FAQ page. */
export function pageJsonLd(page: SeoPage, crumbs: Crumb[], faq?: FaqEntry[]) {
  const graph: object[] = [organization(), website()];
  if (page.url === "/") {
    graph.push(softwareApplication(page.description));
  } else {
    graph.push(article(page), breadcrumbList(crumbs, page.url));
    if (faq && faq.length > 0) graph.push(faqPage(page.url, faq));
  }
  return { "@context": "https://schema.org", "@graph": graph };
}

/** JSON-LD text that is safe inside a <script>. */
export function serializeJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export type FaqEntry = { question: string; answer: string };

/** Markdown inline marks down to the words a reader sees. */
function plainText(markdown: string): string {
  return markdown
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

/** The FAQ page's questions (its H3s) and answers (the text under each), as written on the page. */
export function extractFaq(raw: string): FaqEntry[] {
  const entries: FaqEntry[] = [];
  for (const block of raw.replace(/\r\n/g, "\n").split(/^### /m).slice(1)) {
    const newline = block.indexOf("\n");
    const answer = block.slice(newline + 1).split(/^#{1,3} /m)[0];
    entries.push({ question: block.slice(0, newline).trim(), answer: plainText(answer) });
  }
  return entries;
}

/** A date as the page shows it, in Taiwan's time zone: 2026年11月5日. */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("zh-TW", { timeZone: "Asia/Taipei", year: "numeric", month: "long", day: "numeric" }).format(new Date(iso));
}
