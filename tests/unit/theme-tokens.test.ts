import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const themeFile = new URL("../../src/.vitepress/theme/tailwind.css", import.meta.url);
const articlePageFile = new URL("../../src/.vitepress/theme/views/ArticlePage.vue", import.meta.url);

async function themeSource() {
  return readFile(themeFile, "utf8");
}

function tokenNames(source: string) {
  return new Set([...source.matchAll(/^\s*(--[\w*-]+):/gm)].map(match => match[1]));
}

describe("tailwind 设计令牌", () => {
  it("只在文章页使用 scoped CSS 适配 VitePress 生成内容", async () => {
    const source = await readFile(articlePageFile, "utf8");

    expect(source).toContain("<style scoped>");
    expect(source).toContain("class=\"article-content prose\"");
    expect(source).toMatch(/\.article-content\s*\{[\s\S]*& :deep\(/);
    expect(source).not.toContain(".article-content :deep(");
    expect(source).not.toContain("[&_");
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
      "--z-index-navigation",
      "--shadow-lg",
      "--blur-xl",
      "--aspect-cover",
      "--duration-slow",
      "--ease-standard",
      "--animate-live-photo",
    ]) {
      expect(tokens, `缺少 ${token}`).toContain(token);
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
      expect(pair.every(token => tokens.has(token)), pair.join(" / ")).toBe(true);
  });

  it("只使用 OKLab 颜色并通过同名 token 覆盖暗色模式", async () => {
    const source = await themeSource();
    const colorValues = source
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line.startsWith("--color-") && line !== "--color-*: initial;")
      .map(line => line.slice(line.indexOf(":") + 1, -1).trim());
    expect(colorValues.length).toBeGreaterThan(30);
    expect(colorValues.every(value => /^oklab\(.+\)$/.test(value))).toBe(true);

    const [light = "", dark = ""] = source.split("@utility theme-dark {");
    const lightTokens = tokenNames(light);
    const darkTokens = tokenNames(dark.split("}", 1)[0]);
    expect([...darkTokens].every(token => lightTokens.has(token))).toBe(true);
  });

  it("不保留旧颜色命名或无消费者的应用领域", async () => {
    const source = await themeSource();
    expect(source).not.toMatch(/--color-(?:canvas|surface|ink|line|notice-|draft-|preview-|scrim)/);
    expect(source).not.toMatch(/--color-photo-/);
    expect(source).not.toMatch(/--color-(?:chart|input|sidebar)-/);
  });
});
