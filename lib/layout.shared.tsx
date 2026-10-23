import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export const SITE_NAME = "FunI 付款系統 說明文件";
export const SITE_URL = "https://docs.funipay.net";
export const CONTACT_EMAIL = "contact@funipay.net";

const OFFICIAL = { text: "官網", url: "https://funipay.net" };
const DASHBOARD = { text: "後台", url: "https://dashboard.funipay.net" };
const COMMUNITY = { text: "社群", url: "https://go.funipay.net/discord" };

/** The page footer's links; the contact address follows them. */
export const FOOTER_LINKS = [
  OFFICIAL,
  { text: "服務條款", url: "https://funipay.net/terms" },
  { text: "隱私權政策", url: "https://funipay.net/privacy" },
  COMMUNITY,
];

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/funi-logo.webp" alt="" width={28} height={28} className="rounded-md" />
          <span className="font-semibold">{SITE_NAME}</span>
        </>
      ),
      url: "/",
    },
    links: [OFFICIAL, DASHBOARD, COMMUNITY].map((link) => ({ ...link, external: true })),
  };
}
