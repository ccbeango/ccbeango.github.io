import { readdir, readFile } from "node:fs/promises";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const guideDirectory = new URL("../../src/posts/guide/", import.meta.url);
const publicDirectory = new URL("../../src/public/", import.meta.url);

const publishedGuides = [
  ["getting-started.md", "开始使用 Bean Blog", "入门与配置", 1, 1],
  ["site-configuration.md", "配置站点信息", "入门与配置", 2, 1],
  ["writing-articles.md", "创建和组织文章", "内容写作", 1, 2],
  ["markdown-extensions.md", "使用 Markdown 扩展", "内容写作", 2, 2],
  ["image-layouts.md", "编排多图布局", "内容写作", 3, 2],
  ["live-photo.md", "使用 Live Photo", "内容写作", 4, 2],
  ["posting-moments.md", "发布短动态", "内容写作", 5, 2],
  ["deployment.md", "部署与发布", "发布与维护", 1, 3],
] as const;

describe("博客内使用手册", () => {
  it("只保留站点身份、功能图标、文章演示资源和已声明来源的动态资源", async () => {
    const imageFiles = (await readdir(publicDirectory, { recursive: true }))
      .map((file) => file.replaceAll("\\", "/"))
      .filter((file) => /\.(?:ico|jpe?g|png|svg|webp)$/i.test(file))
      .sort();

    expect(imageFiles).toEqual([
      "favicon.ico",
      "favicon.png",
      "favicon.svg",
      "icons/live-photo.svg",
      "live-images/android-motion-photo.jpg",
      "logo.svg",
      "media/live-photo-sample-poster.png",
    ]);
  });

  it("以三个系列分组发布完整手册", async () => {
    const files = await readdir(guideDirectory);
    expect([...files].sort()).toEqual([
      "deployment.md",
      "draft-preview.md",
      "getting-started.md",
      "image-layouts.md",
      "live-photo.md",
      "markdown-extensions.md",
      "posting-moments.md",
      "site-configuration.md",
      "writing-articles.md",
    ]);

    for (const [file, title, name, order, sidebarOrder] of publishedGuides) {
      const source = await readFile(new URL(file, guideDirectory), "utf8");
      const { data, content } = matter(source);
      expect(data).toMatchObject({
        title,
        draft: false,
        series: {
          name,
          order,
          sidebar: "Bean Blog 使用手册",
          sidebarOrder,
        },
      });
      expect(data.summary).toEqual(expect.any(String));
      expect(content).toMatch(/^\s*\S/);
      expect(content).not.toMatch(/^\s*#[ \t]+\S/);
      expect(content).toContain("## ");
    }
  });

  it("覆盖安装、配置、写作、媒体与发布主题", async () => {
    const sources = await Promise.all(
      publishedGuides.map(async ([file]) => readFile(new URL(file, guideDirectory), "utf8")),
    );
    const manual = sources.join("\n");

    for (const topic of [
      "pnpm dev",
      "prettier.config.mjs",
      "htmlWhitespaceSensitivity",
      "prettier-plugin-tailwindcss",
      "eslint-plugin-better-tailwindcss",
      "site.config.ts",
      "Frontmatter",
      "Custom Containers",
      "::: link-card",
      "image-grid",
      "::: video",
      "::: music",
      "open.motues.top",
      "Android Motion Photo",
      "src/moments",
      "covers",
      "momentBatchSize",
      "GitHub Pages",
    ]) {
      expect(manual).toContain(topic);
    }
    expect(manual).toContain("type=details");
    expect(manual).toContain("自动读取歌曲名、歌手、专辑和封面");
    expect(manual).toContain("封面接口接收歌曲 ID，而不是 `pic_id`");
  });

  it("使用写作手册展示真实文章封面配置", async () => {
    const source = await readFile(new URL("writing-articles.md", guideDirectory), "utf8");
    const { data, content } = matter(source);

    expect(data.cover).toBe("/media/live-photo-sample-poster.png");
    expect(content).toContain("正文直接从普通段落或 `##` 二级标题开始");
    expect(content).toContain("## 文章封面");
    expect(content).toContain("cover: /media/live-photo-sample-poster.png");
    expect(content).toContain("点击封面可以进入与正文图片相同的照片预览");
  });

  it("完整说明站点与 VitePress 工程配置", async () => {
    const source = await readFile(new URL("site-configuration.md", guideDirectory), "utf8");

    for (const setting of [
      "SITE_URL",
      "SITE_BASE",
      "featuredPostsLimit",
      "postsPerPage",
      "momentBatchSize",
      "moment",
      "favicon.svg",
      "feeds.rssAlias",
      "navigation",
      "homeSocials",
      "reactionsEnabled",
      "inputPosition",
      "srcExclude",
      "cleanUrls",
      "lineNumbers",
      "image.lazyLoad",
      "transformHead",
      "buildEnd",
    ]) {
      expect(source).toContain(setting);
    }
    expect(source).not.toContain("headerSocials");
  });

  it("完整说明动态正文图片与迁移规则", async () => {
    const source = await readFile(new URL("posting-moments.md", guideDirectory), "utf8");

    expect(source).toContain("![江边傍晚的云层](/media/live-photo-sample-poster.png)");
    expect(source).toContain("图片必须连续放在正文末尾");
    expect(source).toContain("每条动态最多九张图片");
    expect(source).toContain("不能同时使用 frontmatter `images` 和正文图片");
  });

  it("保留不会进入生产输出的草稿示例", async () => {
    const source = await readFile(new URL("draft-preview.md", guideDirectory), "utf8");
    expect(matter(source).data).toMatchObject({ title: "草稿预览示例", draft: true });
  });
});
