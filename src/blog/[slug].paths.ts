import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineRoutes } from "vitepress";
import { loadPostSources } from "../.vitepress/data/load-post-sources.ts";

const srcDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export default defineRoutes({
  watch: "../posts/**/*.md",
  async paths(files) {
    const posts = await loadPostSources(files, srcDir, {
      includeDrafts: process.env.NODE_ENV !== "production",
    });
    return posts.map(({ src, html: _html, ...post }) => ({
      params: {
        slug: post.slug,
        post: JSON.stringify(post),
        title: post.title,
        description: post.description || post.summary || "",
        keywords: post.keywords.join(","),
        canonical: post.canonical ?? "",
        url: post.url,
      },
      content: src ?? "",
    }));
  },
  transformPageData(pageData) {
    const params = pageData.params as Record<string, string> | undefined;
    return {
      title: params?.title ?? pageData.title,
      description: params?.description ?? pageData.description,
    };
  },
});
