import { DocsLayout } from "fumadocs-ui/layouts/docs";
import Link from "next/link";
import { baseOptions } from "@/lib/layout.shared";
import { source } from "@/lib/source";

export default function NotFound() {
  return (
    <DocsLayout tree={source.getPageTree()} {...baseOptions()}>
      <main className="mx-auto flex max-w-xl flex-col gap-4 px-4 py-24">
        <h1 className="text-3xl font-bold">找不到這一頁</h1>
        <p className="text-fd-muted-foreground">
          網址可能打錯了，或這一頁已經搬家。用左側目錄或上方的搜尋找找看。
        </p>
        <Link href="/" className="text-fd-primary underline underline-offset-4">
          回到說明文件首頁
        </Link>
      </main>
    </DocsLayout>
  );
}
