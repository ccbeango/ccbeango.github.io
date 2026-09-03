import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineRoutes } from "vitepress";
import { loadPostSources } from "../../.vitepress/data/load-post-sources.ts";
import { siteConfig } from "../../.vitepress/site.config.ts";

const srcDir = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

export default defineRoutes({
  watch: "../../posts/**/*.md",
  async paths(files) {
    const posts = await loadPostSources(files, srcDir);
    const pageCount = Math.ceil(posts.length / siteConfig.site.postsPerPage);
    return Array.from({ length: Math.max(0, pageCount - 1) }, (_, index) => ({
      params: { page: String(index + 2) },
    }));
  },
  transformPageData(pageData) {
    return { title: `全部文章 · 第 ${pageData.params?.page ?? ""} 页` };
  },
});
