import { afterEach, describe, expect, it, vi } from "vitest";
import { isGiscusConfigured, resolveMomentConfig, siteConfig } from "../../src/.vitepress/site.config.ts";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("内容数量配置", () => {
  it("使用独立的站点 Logo", () => {
    expect(siteConfig.site.logo).toBe("/logo.svg");
  });

  it("首页最多展示 5 篇推荐文章", () => {
    expect(siteConfig.site.featuredPostsLimit).toBe(5);
  });

  it("动态每批数量为正整数", () => {
    expect(siteConfig.moment.momentBatchSize).toBe(4);
    expect(siteConfig.moment.signature).toBe("记录实践、判断与复盘。");
    expect(() =>
      resolveMomentConfig(
        { covers: ["/cover.jpg"], momentBatchSize: 0 },
        { name: "Bean", bio: "签名" },
        "/favicon.svg",
      ),
    ).toThrow(/正整数/);
  });
});

describe("动态身份配置", () => {
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
    expect(withBasePath("/moments/cover.webp")).toBe("/bean-blog/moments/cover.webp");
    expect(withBasePath("https://images.example.com/cover.webp")).toBe("https://images.example.com/cover.webp");
  });
});

describe("giscus 配置", () => {
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
