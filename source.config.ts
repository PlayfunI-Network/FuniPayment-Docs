import { defineDocs, frontmatterSchema } from "fumadocs-mdx/config";

export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: frontmatterSchema.extend({
      // The title in search results, when the page's H1 says too little on its own.
      seoTitle: frontmatterSchema.shape.title.optional(),
      // The summary in search results and llms.txt; `description` stays the short line under the H1.
      seoDescription: frontmatterSchema.shape.title,
    }),
  },
});
