import { access, readdir, readFile } from "node:fs/promises";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import { siteConfig } from "../../src/.vitepress/site.config.ts";

const guideDirectory = new URL("../../src/posts/guide/", import.meta.url);
const publicDirectory = new URL("../../src/public/", import.meta.url);

describe("模板内容契约", () => {
  it("配置引用的站点图标均为本地公开资源", async () => {
    const assets = [siteConfig.site.logo, ...Object.values(siteConfig.site.favicon)];

    for (const asset of assets) {
      expect(asset).toMatch(/^\/\S+$/);
      await expect(access(new URL(asset.slice(1), publicDirectory))).resolves.toBeUndefined();
    }
  });

  it("使用手册中的 Markdown 文件具有可发布的基本结构", async () => {
    const files = (await readdir(guideDirectory)).filter((file) => file.endsWith(".md"));

    for (const file of files) {
      const { content, data } = matter(await readFile(new URL(file, guideDirectory), "utf8"));
      expect(data.title).toEqual(expect.any(String));
      expect(data.title.trim()).not.toBe("");
      expect(content).toMatch(/\S/);
    }
  });
});
