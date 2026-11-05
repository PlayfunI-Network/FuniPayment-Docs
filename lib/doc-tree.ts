// The sidebar's structure in plain data, for the breadcrumb, llms.txt and llms-full.txt.
import type { ReactNode } from "react";

/** The parts of Fumadocs' page tree used here. */
type TreeNode =
  | { type: "page"; name: ReactNode; url: string }
  | { type: "folder"; name: ReactNode; children: TreeNode[] }
  | { type: "separator"; name?: ReactNode };

export type DocSection = { name: string | null; urls: string[] };
export type Crumb = { name: string; url?: string };

export const ROOT_CRUMB = "說明文件";

function pageUrls(nodes: TreeNode[]): string[] {
  return nodes.flatMap((node) => (node.type === "page" ? [node.url] : node.type === "folder" ? pageUrls(node.children) : []));
}

/** The tree's pages in sidebar order: top-level pages in a section with no name, then one section per folder. */
export function docSections(tree: { children: TreeNode[] }): DocSection[] {
  const sections: DocSection[] = [];
  for (const node of tree.children) {
    if (node.type === "page") {
      const last = sections[sections.length - 1];
      if (last && last.name === null) last.urls.push(node.url);
      else sections.push({ name: null, urls: [node.url] });
    } else if (node.type === "folder") {
      sections.push({ name: String(node.name), urls: pageUrls(node.children) });
    }
  }
  return sections;
}

/**
 * 說明文件 › section › page. A section has no page of its own, so its crumb links to its first
 * page; on that page the crumb is plain text. The home page has no breadcrumb.
 */
export function breadcrumbs(sections: DocSection[], url: string, title: string): Crumb[] {
  if (url === "/") return [];
  const section = sections.find((s) => s.name !== null && s.urls.includes(url));
  return [
    { name: ROOT_CRUMB, url: "/" },
    ...(section ? [{ name: section.name as string, url: section.urls[0] === url ? undefined : section.urls[0] }] : []),
    { name: title },
  ];
}
