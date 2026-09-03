import { access, readdir, readFile } from "node:fs/promises";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import { siteConfig } from "../../src/.vitepress/site.config.ts";

const guideDirectory = new URL("../../src/posts/guide/", import.meta.url);
const publicDirectory = new URL("../../src/public/", import.meta.url);

describe("博客内使用手册", () => {
  it("当前配置引用的本地公共资源存在", async () => {
    const configuredAssets = [
      siteConfig.site.logo,
      ...Object.values(siteConfig.site.favicon),
      siteConfig.moment.avatar,
      ...siteConfig.moment.covers,
    ].filter((path) => /^\/(?!\/)/.test(path));

    for (const path of new Set(configuredAssets)) {
      await expect(access(new URL(path.slice(1), publicDirectory))).resolves.toBeUndefined();
    }
  });

  it("保留手册和功能测试依赖的媒体样例", async () => {
    for (const path of [
      "icons/live-photo.svg",
      "live-images/android-motion-photo.jpg",
      "media/live-photo-sample-poster.png",
    ]) {
      await expect(access(new URL(path, publicDirectory))).resolves.toBeUndefined();
    }
  });

  it("使用手册中的 Markdown 文件具有可发布的基本结构", async () => {
    const files = (await readdir(guideDirectory)).filter((file) => file.endsWith(".md"));

    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const { content, data } = matter(await readFile(new URL(file, guideDirectory), "utf8"));
      expect(data.title).toEqual(expect.any(String));
      expect(data.title.trim()).not.toBe("");
      expect(content).toMatch(/\S/);
    }
  });
});
