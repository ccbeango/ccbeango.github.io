import type { MarkdownRenderer } from "vitepress";
import { readFile } from "node:fs/promises";
import matter from "gray-matter";
import { createMarkdownRenderer, resolveConfig } from "vitepress";
import { beforeAll, describe, expect, it } from "vitest";

describe("vitePress 官方 Markdown 扩展", () => {
  let markdown: MarkdownRenderer;

  beforeAll(async () => {
    const config = await resolveConfig("src", "serve", "development");
    markdown = await createMarkdownRenderer(
      config.srcDir,
      config.markdown,
      config.site.base,
      config.logger,
      config.publicDir,
    );
  }, 30_000);

  it("保留容器、Alert、Code Group 与代码行状态的官方 markup", async () => {
    const article = await readFile(
      new URL("../../src/posts/guide/markdown-extensions.md", import.meta.url),
      "utf8",
    );
    const source = matter(article).content;

    const html = await markdown.renderAsync(source, { path: "guide/markdown-extensions.md" });

    for (const type of ["info", "tip", "warning", "danger"])
      expect(html).toContain(`class="${type} custom-block"`);
    expect(html).toContain("<details class=\"details custom-block\"><summary>详细信息</summary>");
    expect(html).toContain("<p class=\"custom-block-title\">停止</p>");
    expect(html).toContain("<summary>点击查看代码</summary>");
    for (const type of ["note", "tip", "important", "warning", "caution"])
      expect(html).toContain(`class="${type} custom-block github-alert"`);
    for (const title of ["信息", "提示", "警告", "危险", "备注", "重要", "注意"])
      expect(html).toContain(`>${title}</`);
    expect(html).toContain("class=\"vp-code-group\"");
    expect(html).toContain("type=\"radio\"");
    expect(html).toContain("language-sh active");
    expect(html).toContain("highlighted has-focus");
    expect(html).toContain("line diff add");
    expect(html).toContain("line diff remove");
    expect(html).toContain("highlighted error");
    expect(html).toContain("highlighted warning");
  });

  it("使用官方 image plugin 为普通图片增加懒加载", async () => {
    const html = await markdown.renderAsync(
      "![Markdown 图片演示](/media/live-photo-sample-poster.png)",
      { path: "lazy-image.md" },
    );

    expect(html).toContain("loading=\"lazy\"");
    expect(html).toContain("alt=\"Markdown 图片演示\"");
  });
});
