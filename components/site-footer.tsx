// The footer under every docs page (spec §4.3): the official site, the terms and the privacy
// policy (on the official site, not copied here), the Discord community and the contact address.
import { CONTACT_EMAIL, FOOTER_LINKS } from "@/lib/layout.shared";

export function SiteFooter() {
  return (
    <footer className="mt-10 border-t pt-6 text-sm text-fd-muted-foreground">
      <nav aria-label="頁尾連結">
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          {FOOTER_LINKS.map((link) => (
            <li key={link.url}>
              <a href={link.url} className="transition-colors hover:text-fd-foreground">
                {link.text}
              </a>
            </li>
          ))}
          <li>
            <a href={`mailto:${CONTACT_EMAIL}`} className="transition-colors hover:text-fd-foreground">
              {CONTACT_EMAIL}
            </a>
          </li>
        </ul>
      </nav>
    </footer>
  );
}
