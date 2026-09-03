import type { ContentData } from "vitepress";
import { describe, expect, it } from "vitest";
import {
  collectTags,
  countWords,
  createSeriesSidebar,
  getFeaturedPosts,
  groupArchives,
  normalizeSearchText,
  paginatePosts,
  preparePosts,
  searchPosts,
  tagSlug,
  toPostData,
} from "../../src/.vitepress/data/post-utils.ts";

function entry(slug: string, frontmatter: Record<string, unknown> = {}, src = "这是正文 content"): ContentData {
  return {
    url: `/posts/${slug}`,
    src,
    html: undefined,
    excerpt: undefined,
    frontmatter: {
      title: slug,
      date: "2026-01-01",
      tags: [],
      keywords: [],
      ...frontmatter,
    },
  };
}

describe("frontmatter 与 slug", () => {
  it("报告缺少的必填字段", () => {
    expect(() => toPostData(entry("invalid", { title: "" }))).toThrow(/title/);
  });

  it("接受 YAML 解析后的 Date 并保留多段 slug", () => {
    const post = toPostData(entry("zh/example", { date: new Date("2026-02-03") }));
    expect(post.slug).toBe("zh/example");
    expect(post.url).toBe("/blog/zh/example");
    expect(post.date).toContain("2026-02-03");
  });

  it("拒绝重复的完整 slug", () => {
    expect(() => preparePosts([entry("zh/example"), entry("zh/example")])).toThrow(/slug 重复/);
  });

  it("校验系列名称、正整数顺序和侧栏字段配对", () => {
    expect(toPostData(entry("guide/intro", {
      series: { name: " VitePress 指南 ", order: 1 },
    })).series).toEqual({ name: "VitePress 指南", order: 1 });
    expect(toPostData(entry("guide/grouped", {
      series: { name: "指南", order: 1, sidebar: " 文档 ", sidebarOrder: 2 },
    })).series).toEqual({ name: "指南", order: 1, sidebar: "文档", sidebarOrder: 2 });
    expect(() => toPostData(entry("guide/invalid", {
      series: { name: "VitePress 指南", order: 0 },
    }))).toThrow(/series\.order/);
    expect(() => toPostData(entry("guide/missing-sidebar-order", {
      series: { name: "VitePress 指南", order: 1, sidebar: "文档" },
    }))).toThrow(/series\.sidebarOrder/);
    expect(() => toPostData(entry("guide/missing-sidebar", {
      series: { name: "VitePress 指南", order: 1, sidebarOrder: 1 },
    }))).toThrow(/series\.sidebar/);
  });
});

describe("系列文章 sidebar", () => {
  it("按 order 生成每篇成员对应的标准 sidebar", () => {
    const posts = preparePosts([
      entry("guide/second", { title: "第二章", series: { name: "VitePress 指南", order: 2 } }),
      entry("guide/first", { title: "第一章", series: { name: "VitePress 指南", order: 1 } }),
      entry("standalone", { title: "普通文章" }),
    ]);
    const sidebar = createSeriesSidebar(posts);

    expect(sidebar["/blog/guide/first.md"]).toEqual([{
      text: "VitePress 指南",
      collapsed: false,
      items: [
        { text: "第一章", link: "/blog/guide/first" },
        { text: "第二章", link: "/blog/guide/second" },
      ],
    }]);
    expect(sidebar["/blog/guide/second.md"]).toEqual(sidebar["/blog/guide/first.md"]);
    expect(sidebar["/blog/standalone.md"]).toBeUndefined();
  });

  it("拒绝同系列重复 order", () => {
    const posts = preparePosts([
      entry("guide/first", { series: { name: "VitePress 指南", order: 1 } }),
      entry("guide/duplicate", { series: { name: "VitePress 指南", order: 1 } }),
    ]);
    expect(() => createSeriesSidebar(posts)).toThrow(/VitePress 指南.*order 1.*guide\/first.*guide\/duplicate/);
  });

  it("为共享侧栏的每篇文章生成多个有序系列分组", () => {
    const posts = preparePosts([
      entry("media/live", { title: "动态照片", series: { name: "媒体", order: 2, sidebar: "写作指南", sidebarOrder: 2 } }),
      entry("guide/start", { title: "快速开始", series: { name: "基础", order: 1, sidebar: "写作指南", sidebarOrder: 1 } }),
      entry("media/images", { title: "图片布局", series: { name: "媒体", order: 1, sidebar: "写作指南", sidebarOrder: 2 } }),
      entry("guide/config", { title: "站点配置", series: { name: "基础", order: 2, sidebar: "写作指南", sidebarOrder: 1 } }),
    ]);
    const sidebar = createSeriesSidebar(posts);
    const expected = [
      {
        text: "基础",
        collapsed: false,
        items: [
          { text: "快速开始", link: "/blog/guide/start" },
          { text: "站点配置", link: "/blog/guide/config" },
        ],
      },
      {
        text: "媒体",
        collapsed: false,
        items: [
          { text: "图片布局", link: "/blog/media/images" },
          { text: "动态照片", link: "/blog/media/live" },
        ],
      },
    ];

    expect(sidebar["/blog/guide/start.md"]).toEqual(expected);
    expect(sidebar["/blog/media/live.md"]).toEqual(expected);
  });

  it("拒绝不一致的系列侧栏声明和重复的分组顺序", () => {
    const inconsistent = preparePosts([
      entry("guide/first", { series: { name: "指南", order: 1, sidebar: "文档", sidebarOrder: 1 } }),
      entry("guide/second", { series: { name: "指南", order: 2, sidebar: "其他", sidebarOrder: 1 } }),
    ]);
    expect(() => createSeriesSidebar(inconsistent)).toThrow(/指南.*sidebar 声明不一致/);

    const duplicateOrder = preparePosts([
      entry("guide/first", { series: { name: "指南", order: 1, sidebar: "文档", sidebarOrder: 1 } }),
      entry("reference/first", { series: { name: "参考", order: 1, sidebar: "文档", sidebarOrder: 1 } }),
    ]);
    expect(() => createSeriesSidebar(duplicateOrder)).toThrow(/文档.*sidebarOrder 1.*(?:指南.*参考|参考.*指南)/);
  });

  it("沿用文章集合的草稿过滤规则", () => {
    const entries = [
      entry("guide/published", { series: { name: "VitePress 指南", order: 1 } }),
      entry("guide/draft", { draft: true, series: { name: "VitePress 指南", order: 2 } }),
    ];
    const publishedSidebar = createSeriesSidebar(preparePosts(entries));
    const previewSidebar = createSeriesSidebar(preparePosts(entries, { includeDrafts: true }));

    expect(publishedSidebar["/blog/guide/draft.md"]).toBeUndefined();
    expect(previewSidebar["/blog/guide/draft.md"]).toBeDefined();
  });
});

describe("文章集合转换", () => {
  const posts = preparePosts([
    entry("old", { date: "2024-01-01", tags: ["工程实践"], featured: true }),
    entry("new", { date: "2026-01-01", tags: ["VitePress", "工程实践"], featured: true }),
    entry("draft", { date: "2027-01-01", tags: ["草稿"], draft: true, featured: true }),
  ], { includeDrafts: true });

  it("按日期倒序并按发布状态筛选精选", () => {
    expect(posts.map(post => post.slug)).toEqual(["draft", "new", "old"]);
    expect(getFeaturedPosts(posts).map(post => post.slug)).toEqual(["new", "old"]);
    expect(preparePosts([
      entry("published"),
      entry("draft", { draft: true }),
    ]).map(post => post.slug)).toEqual(["published"]);
  });

  it("按日期倒序限制首页精选数量", () => {
    const featured = preparePosts(Array.from({ length: 6 }, (_, index) => entry(`featured-${index + 1}`, {
      date: `2026-01-${String(index + 1).padStart(2, "0")}`,
      featured: true,
    })));

    expect(getFeaturedPosts(featured, 5).map(post => post.slug)).toEqual([
      "featured-6",
      "featured-5",
      "featured-4",
      "featured-3",
      "featured-2",
    ]);
  });

  it("计算中文字数与阅读时间", () => {
    const post = toPostData(entry("words", {}, "---\ntitle: ignored\n---\n中文测试 and 42"));
    expect(countWords("中文测试 and 42")).toBe(6);
    expect(post.wordCount).toBe(6);
    expect(post.readingTime).toBe(1);
  });

  it("处理分页边界", () => {
    expect(paginatePosts(posts, 0, 2)).toMatchObject({ page: 1, pageCount: 2 });
    expect(paginatePosts(posts, 99, 2)).toMatchObject({ page: 2, pageCount: 2 });
  });

  it("规范化标签、计数并生成稳定 ASCII slug", () => {
    const tags = collectTags(posts.filter(post => !post.draft));
    expect(tags.find(tag => tag.name === "工程实践")?.count).toBe(2);
    expect(tagSlug("Tailwind CSS")).toBe("tailwind-css");
    expect(tagSlug("工程实践")).toMatch(/^u[0-9a-f]+(?:-u[0-9a-f]+)*$/);
  });

  it("按年份倒序归档且年份内日期倒序", () => {
    const groups = groupArchives(posts);
    expect(groups.map(group => group.year)).toEqual(["2027", "2026", "2024"]);
    expect(groups[1]?.posts[0]?.slug).toBe("new");
  });

  it("匹配无空格中文搜索", () => {
    const searchable = preparePosts([
      entry("search", { title: "中文博客搜索", summary: "无需外部服务", tags: ["工程实践"] }),
    ]);
    expect(normalizeSearchText(" 中文 博客 ")).toBe("中文博客");
    expect(searchPosts(searchable, "博客搜索")).toHaveLength(1);
    expect(searchPosts(searchable, "工程实践")).toHaveLength(1);
    expect(searchPosts(searchable, "不存在")).toHaveLength(0);
  });
});
