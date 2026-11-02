/** An http(s) link to another site. Docs links (/payments/fp, #anchor, ./x) are not. */
export function isExternalHref(href: string | undefined): boolean {
  return /^https?:\/\//i.test(href ?? "");
}

/** Every link off the docs site opens in a new tab. */
export const EXTERNAL_LINK_PROPS = { target: "_blank", rel: "noopener noreferrer" } as const;
