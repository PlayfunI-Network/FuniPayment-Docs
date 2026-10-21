import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export const SITE_NAME = "FunI 付款系統 說明文件";
export const SITE_URL = "https://docs.funipay.net";

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
    links: [
      { text: "官網", url: "https://funipay.net", external: true },
      { text: "後台", url: "https://dashboard.funipay.net", external: true },
      { text: "社群", url: "https://go.funipay.net/discord", external: true },
    ],
  };
}
