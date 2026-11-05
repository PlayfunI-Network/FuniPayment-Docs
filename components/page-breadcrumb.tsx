// The breadcrumb above a page's title, server-rendered so its links are in the HTML. Same crumbs
// as the page's BreadcrumbList JSON-LD (lib/doc-tree), same look as Fumadocs' own breadcrumb.
import Link from "next/link";
import type { Crumb } from "@/lib/doc-tree";

export function PageBreadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  if (crumbs.length === 0) return null;
  return (
    <nav aria-label="麵包屑" className="max-md:hidden">
      <ol className="flex items-center gap-1.5 text-sm text-fd-muted-foreground">
        {crumbs.map((crumb, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={crumb.name} className="flex min-w-0 items-center gap-1.5">
              {i > 0 && (
                <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5 shrink-0">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              )}
              {crumb.url !== undefined ? (
                <Link href={crumb.url} className="truncate transition-opacity hover:opacity-80">
                  {crumb.name}
                </Link>
              ) : (
                <span className={last ? "truncate font-medium text-fd-primary" : "truncate"} aria-current={last ? "page" : undefined}>
                  {crumb.name}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
