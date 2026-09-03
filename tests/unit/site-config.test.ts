import { describe, expect, it } from "vitest";
import { isGiscusConfigured, siteConfig } from "../../src/.vitepress/site.config.ts";

describe("内容数量配置", () => {
  it("首页最多展示 5 篇推荐文章", () => {
    expect(siteConfig.site.featuredPostsLimit).toBe(5);
  });
});

describe("giscus 配置", () => {
  it("拒绝缺失字段的部分配置", () => {
    expect(isGiscusConfigured(null)).toBe(false);
    expect(isGiscusConfigured({ repo: "owner/repo", repoId: "R_1" })).toBe(false);
  });

  it("接受完整配置", () => {
    expect(isGiscusConfigured({
      repo: "owner/repo",
      repoId: "R_1",
      category: "Announcements",
      categoryId: "DIC_1",
      mapping: "pathname",
      reactionsEnabled: "1",
      inputPosition: "bottom",
      lang: "zh-CN",
    })).toBe(true);
  });
});
