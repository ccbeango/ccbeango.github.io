import type { NavItem } from "../../src/.vitepress/site.config.ts";
import { afterEach, describe, expect, it, vi } from "vitest";
import { isGiscusConfigured, resolveMomentConfig, siteConfig } from "../../src/.vitepress/site.config.ts";

function expectNonEmpty(value: string) {
  expect(value.trim()).not.toBe("");
}

function expectPositiveInteger(value: number) {
  expect(Number.isInteger(value)).toBe(true);
  expect(value).toBeGreaterThan(0);
}

function isSupportedHref(value: string) {
  if (/^\/(?!\/)/.test(value)) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function expectValidNavigation(items: NavItem[]) {
  for (const item of items) {
    expectNonEmpty(item.title);
    const hasHref = typeof item.href === "string";
    const hasChildren = item.children !== undefined;
    expect(hasHref || hasChildren).toBe(true);
    expect(hasHref && hasChildren).toBe(false);

    if (typeof item.href === "string") expect(isSupportedHref(item.href)).toBe(true);
    if (item.children) {
      expect(item.children.length).toBeGreaterThan(0);
      expectValidNavigation(item.children);
    }
  }
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("可修改站点配置", () => {
  it("站点与作者信息使用有效值", () => {
    for (const value of [
      siteConfig.site.title,
      siteConfig.site.name,
      siteConfig.site.description,
      siteConfig.site.locale,
      siteConfig.site.language,
      siteConfig.author.name,
      siteConfig.author.bio,
    ])
      expectNonEmpty(value);

    expect(siteConfig.site.keywords.length).toBeGreaterThan(0);
    for (const keyword of siteConfig.site.keywords) expectNonEmpty(keyword);
    expect(siteConfig.author.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  it("公共资源与生成文件使用站内绝对路径", () => {
    for (const path of [
      siteConfig.site.logo,
      ...Object.values(siteConfig.site.favicon),
      siteConfig.site.manifest,
      ...Object.values(siteConfig.site.feeds),
    ]) {
      expect(path).toMatch(/^\/(?!\/)\S+$/);
    }
  });

  it("内容数量配置使用正整数", () => {
    expectPositiveInteger(siteConfig.site.featuredPostsLimit);
    expectPositiveInteger(siteConfig.site.postsPerPage);
    expectPositiveInteger(siteConfig.moment.momentBatchSize);
  });

  it("导航和社交入口只包含有效项目", () => {
    expectValidNavigation(siteConfig.navigation);
    for (const social of siteConfig.homeSocials) {
      expectNonEmpty(social.label);
      expect(isSupportedHref(social.href)).toBe(true);
    }
  });

  it("动态身份和资源配置有效", () => {
    expect(siteConfig.moment.covers.length).toBeGreaterThan(0);
    expect(new Set(siteConfig.moment.covers).size).toBe(siteConfig.moment.covers.length);
    for (const cover of siteConfig.moment.covers) expect(isSupportedHref(cover)).toBe(true);
    for (const value of [siteConfig.moment.displayName, siteConfig.moment.avatar, siteConfig.moment.signature])
      expectNonEmpty(value);
    expect(isSupportedHref(siteConfig.moment.avatar)).toBe(true);
  });
});

describe("动态身份配置", () => {
  it("拒绝无效的动态批次配置", () => {
    expect(() =>
      resolveMomentConfig(
        { covers: ["/cover.jpg"], momentBatchSize: 0 },
        { name: "Bean", bio: "签名" },
        "/favicon.svg",
      ),
    ).toThrow(/正整数/);
  });

  it("使用显式值并回退到作者身份", () => {
    expect(
      resolveMomentConfig(
        {
          covers: [" /cover.jpg ", "/cover-alt.jpg", "/cover.jpg"],
          displayName: " Moment Bean ",
          avatar: " /avatar.jpg ",
          signature: " 随手记录 ",
          momentBatchSize: 6,
        },
        { name: "Bean", bio: "作者简介" },
        "/favicon.svg",
      ),
    ).toEqual({
      covers: ["/cover.jpg", "/cover-alt.jpg"],
      displayName: "Moment Bean",
      avatar: "/avatar.jpg",
      signature: "随手记录",
      momentBatchSize: 6,
    });
    expect(
      resolveMomentConfig(
        { covers: ["/cover.jpg"], momentBatchSize: 4 },
        { name: "Bean", bio: "作者简介" },
        "/favicon.svg",
      ),
    ).toMatchObject({ displayName: "Bean", avatar: "/favicon.svg", signature: "作者简介" });
    expect(() =>
      resolveMomentConfig({ covers: [], momentBatchSize: 4 }, { name: "Bean", bio: "简介" }, "/favicon.svg"),
    ).toThrow(/至少需要一张非空封面/);
    expect(() =>
      resolveMomentConfig({ covers: [" "], momentBatchSize: 4 }, { name: "Bean", bio: "简介" }, "/favicon.svg"),
    ).toThrow(/至少需要一张非空封面/);
  });

  it("为动态资源和路由应用非根 base path", async () => {
    vi.stubEnv("SITE_BASE", "/bean-blog/");
    vi.resetModules();
    const { siteConfig: configuredSite, withBasePath } = await import("../../src/.vitepress/site.config.ts");

    expect(configuredSite.site.base).toBe("/bean-blog/");
    expect(withBasePath("/moment")).toBe("/bean-blog/moment");
    expect(withBasePath("/assets/cover.webp")).toBe("/bean-blog/assets/cover.webp");
    expect(withBasePath("https://images.example.com/cover.webp")).toBe("https://images.example.com/cover.webp");
  });
});

describe("giscus 配置", () => {
  it("站点配置关闭评论或提供完整参数", () => {
    expect(siteConfig.giscus === null || isGiscusConfigured(siteConfig.giscus)).toBe(true);
    if (siteConfig.giscus) {
      expect(siteConfig.giscus.repo).toMatch(/^[^/\s]+\/[^/\s]+$/);
      expect(siteConfig.giscus.repoId).toMatch(/^R_/);
      expect(siteConfig.giscus.categoryId).toMatch(/^DIC_/);
    }
  });

  it("拒绝缺失字段的部分配置", () => {
    expect(isGiscusConfigured(null)).toBe(false);
    expect(isGiscusConfigured({ repo: "owner/repo", repoId: "R_1" })).toBe(false);
  });

  it("接受完整配置", () => {
    expect(
      isGiscusConfigured({
        repo: "owner/repo",
        repoId: "R_1",
        category: "Announcements",
        categoryId: "DIC_1",
        mapping: "pathname",
        reactionsEnabled: "1",
        inputPosition: "bottom",
        lang: "zh-CN",
      }),
    ).toBe(true);
  });
});
