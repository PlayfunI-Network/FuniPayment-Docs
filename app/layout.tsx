import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { RootProvider } from "fumadocs-ui/provider/next";
import type { ReactNode } from "react";
import ZhSearchDialog from "@/components/search-dialog";
import { SITE_NAME, SITE_URL } from "@/lib/layout.shared";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s｜${SITE_NAME}` },
  description: "在 Discord 伺服器用 FunI 付款系統收款：設定、指令、付款方式與常見問題。",
  icons: { icon: "/brand/funi-icon.png" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-TW" className={geistSans.variable} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <RootProvider
          theme={{ defaultTheme: "dark", enableSystem: false }}
          search={{ SearchDialog: ZhSearchDialog }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
