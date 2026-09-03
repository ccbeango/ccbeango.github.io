import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineRoutes } from "vitepress";
import { loadPostSources } from "../.vitepress/data/load-post-sources.ts";
import { collectTags } from "../.vitepress/data/post-utils.ts";

const srcDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export default defineRoutes({
  watch: "../posts/**/*.md",
  async paths(files) {
    const posts = await loadPostSources(files, srcDir);
    return collectTags(posts).map(tag => ({
      params: { tag: tag.slug, tagName: tag.name },
    }));
  },
  transformPageData(pageData) {
    return { title: `标签：${pageData.params?.tagName ?? ""}` };
  },
});
