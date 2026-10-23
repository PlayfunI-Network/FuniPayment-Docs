"use client";

import { useDocsSearch } from "fumadocs-core/search/client";
import { staticClient } from "fumadocs-core/search/client/orama-static";
import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
  type SharedProps,
} from "fumadocs-ui/components/dialog/search";
import { create } from "zbsearch";
import { rankByTitle, zhTokenizer } from "@/lib/search";

// 與伺服器端 createFromSource 的 advanced 索引同一份欄位，查詢時才會用同一個斷詞。
const engine = staticClient({
  from: "/api/search",
  initDB: () =>
    create({
      schema: {
        content: "string",
        page_id: "string",
        type: "string",
        breadcrumbs: "string[]",
        tags: "enum[]",
        url: "string",
        locale: "enum",
        embeddings: "vector[512]",
      },
      components: { tokenizer: zhTokenizer },
    }),
});
// 標題含有搜尋詞的頁排前面（引擎本身照索引順序排）。
const client: typeof engine = {
  ...engine,
  search: async (query) => rankByTitle(await engine.search(query), query),
};

export default function ZhSearchDialog(props: SharedProps) {
  const search = useDocsSearch({ client });
  return (
    <SearchDialog {...search} {...props}>
      <SearchDialogOverlay />
      <SearchDialogContent>
        <SearchDialogHeader>
          <SearchDialogIcon />
          <SearchDialogInput placeholder="搜尋說明文件" />
          <SearchDialogClose />
        </SearchDialogHeader>
        <SearchDialogList />
      </SearchDialogContent>
    </SearchDialog>
  );
}
