import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const themeFile = new URL("../../src/.vitepress/theme/tailwind.css", import.meta.url);
const articlePageFile = new URL("../../src/.vitepress/theme/views/ArticlePage.vue", import.meta.url);
const styleAuditFile = new URL("../../scripts/audit-styles.mjs", import.meta.url);
const readingControlFiles = [
  "../../src/.vitepress/theme/components/SeriesSidebar.vue",
  "../../src/.vitepress/theme/components/TableOfContents.vue",
  "../../src/.vitepress/theme/components/BackToTop.vue",
].map((path) => new URL(path, import.meta.url));

async function themeSource() {
  return readFile(themeFile, "utf8");
}

function tokenNames(source: string) {
  return new Set([...source.matchAll(/^\s*(--[\w*-]+):/gm)].map((match) => match[1]));
}

describe("tailwind 设计令牌", () => {
  it("文章页使用 scoped CSS 适配 VitePress 生成内容", async () => {
    const source = await readFile(articlePageFile, "utf8");

    expect(source).toContain("<style scoped>");
    expect(source).toContain('class="article-content prose"');
    expect(source).toMatch(/\.article-content\s*\{[\s\S]*& :deep\(/);
    expect(source).not.toContain(".article-content :deep(");
    expect(source).not.toContain("[&_");
  });

  it("按 scoped CSS 规则审计所有 Vue 组件而非固定文件白名单", async () => {
    const source = await readFile(styleAuditFile, "utf8");

    expect(source).not.toContain("allowedVueStyle");
    expect(source).toContain("Vue 组件最多只能包含一个 <style scoped>");
    expect(source).toContain("scoped CSS 不得通过 :global() 修改全局样式");
    expect(source).toContain("不允许 CSS Modules");
  });

  it("覆盖博客使用的完整设计尺度", async () => {
    const tokens = tokenNames(await themeSource());
    for (const token of [
      "--spacing",
      "--spacing-page-gutter",
      "--spacing-control",
      "--breakpoint-sm",
      "--breakpoint-xl",
      "--font-sans",
      "--font-weight-medium",
      "--text-label",
      "--text-article-body",
      "--leading-code",
      "--tracking-normal",
      "--tracking-live",
      "--radius",
      "--radius-xl",
      "--container-article",
      "--container-photo-inspector",
      "--z-index-player",
      "--z-index-navigation",
      "--shadow-lg",
      "--blur-xl",
      "--aspect-cover",
      "--duration-slow",
      "--ease-standard",
      "--animate-live-photo",
      "--animate-music-record",
    ]) {
      expect(tokens, `缺少 ${token}`).toContain(token);
    }
  });

  it("播放器位于阅读辅助控件之上且低于全局导航", async () => {
    const source = await themeSource();
    const zIndexes = Object.fromEntries(
      [...source.matchAll(/^\s*--z-index-(\w+):\s*(\d+);/gm)].map((match) => [match[1], Number(match[2])]),
    );

    expect(zIndexes.navigation).toBeGreaterThan(zIndexes.player);
    expect(zIndexes.player).toBeGreaterThan(zIndexes.control);
    expect(zIndexes.control).toBeGreaterThan(zIndexes.content);

    for (const file of readingControlFiles) {
      const component = await readFile(file, "utf8");
      expect(component).toContain("z-control");
      expect(component).not.toContain("z-navigation");
    }
  });

  it("保持 surface 与 foreground 语义配对", async () => {
    const tokens = tokenNames(await themeSource());
    const pairs = [
      ["--color-background", "--color-foreground"],
      ["--color-overlay", "--color-overlay-foreground"],
      ["--color-card", "--color-card-foreground"],
      ["--color-popover", "--color-popover-foreground"],
      ["--color-primary", "--color-primary-foreground"],
      ["--color-muted", "--color-muted-foreground"],
      ["--color-warning", "--color-warning-foreground"],
      ["--color-code-card", "--color-code-card-foreground"],
    ];
    for (const pair of pairs)
      expect(
        pair.every((token) => tokens.has(token)),
        pair.join(" / "),
      ).toBe(true);
  });

  it("只使用 OKLab 颜色并通过同名 token 覆盖暗色模式", async () => {
    const source = await themeSource();
    const colorValues = source
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.startsWith("--color-") && line !== "--color-*: initial;")
      .map((line) => line.slice(line.indexOf(":") + 1, -1).trim());
    expect(colorValues.length).toBeGreaterThan(30);
    expect(colorValues.every((value) => /^oklab\(.+\)$/.test(value))).toBe(true);

    const [light = "", dark = ""] = source.split("@utility theme-dark {");
    const lightTokens = tokenNames(light);
    const darkTokens = tokenNames(dark.split("}", 1)[0]);
    expect([...darkTokens].every((token) => lightTokens.has(token))).toBe(true);
  });

  it("不保留旧颜色命名或无消费者的应用领域", async () => {
    const source = await themeSource();
    expect(source).not.toMatch(/--color-(?:canvas|surface|ink|line|notice-|draft-|preview-|scrim)/);
    expect(source).not.toMatch(/--color-photo-/);
    expect(source).not.toMatch(/--color-(?:chart|input|sidebar)-/);
  });
});
