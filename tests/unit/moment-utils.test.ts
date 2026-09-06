import type { ContentData, MarkdownEnv } from "vitepress";
import { createMarkdownRenderer, disposeMdItInstance } from "vitepress";
import matter from "gray-matter";
import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import {
  formatMomentDateTime,
  formatMomentTime,
  momentFragment,
  prepareMoments,
  toMomentData,
} from "../../src/.vitepress/data/moment-utils.ts";
import {
  getMomentContentImages,
  getMomentRichMedia,
  momentContentPlugin,
  momentRichMediaContainers,
} from "../../src/.vitepress/markdown/moment-content.ts";
import { linkCardPlugin } from "../../src/.vitepress/markdown/link-card.ts";
import { livePhotoPlugin } from "../../src/.vitepress/markdown/live-photo.ts";
import { musicPlugin } from "../../src/.vitepress/markdown/music.ts";
import { videoPlugin } from "../../src/.vitepress/markdown/video.ts";

function entry(slug: string, frontmatter: Record<string, unknown> = {}, html = "<p>一条短动态</p>"): ContentData {
  return {
    url: `/moments/${slug}`,
    src: "一条短动态",
    html,
    excerpt: undefined,
    frontmatter: {
      date: "2026-09-01 12:00:00",
      ...frontmatter,
    },
  };
}

function createMomentMarkdownRenderer() {
  return createMarkdownRenderer(process.cwd(), {
    container: {
      customContainers: momentRichMediaContainers,
    },
    config(md) {
      md.use(momentContentPlugin);
      md.use(linkCardPlugin);
      md.use(livePhotoPlugin);
      md.use(musicPlugin);
      md.use(videoPlugin);
    },
  });
}

describe("动态 frontmatter 与标识", () => {
  it("保留嵌套 slug 并填充默认值", () => {
    expect(toMomentData(entry("life/evening-walk"))).toMatchObject({
      slug: "life/evening-walk",
      fragment: "moment-life-evening-walk",
      tags: [],
      images: [],
      pinned: false,
      draft: false,
      html: "<p>一条短动态</p>",
    });
  });

  it("接受可选字段并规范化标签", () => {
    const moment = toMomentData(
      entry("photo", {
        title: " 晚霞 ",
        updated: "2026-09-02 12:00:00",
        location: " 杭州 ",
        tags: [" 摄影 ", "摄影"],
        images: [{ src: " /moments/sunset.jpg ", alt: " 湖边晚霞 " }],
        pinned: true,
      }),
    );
    expect(moment).toMatchObject({
      title: "晚霞",
      location: "杭州",
      tags: ["摄影"],
      images: [{ src: "/moments/sunset.jpg", alt: "湖边晚霞" }],
      pinned: true,
    });
    expect(moment.updated).toBe("2026-09-02T04:00:00.000Z");
  });

  it("将无时区日期时间按站点默认时区规范化", () => {
    const parsed = matter("---\ndate: 2021-12-18 13:58:12\n---").data;
    const moment = toMomentData(
      entry("local-date-time", {
        ...parsed,
        updated: "2021-12-18 14:05:09",
      }),
    );

    expect(parsed.date).toBeInstanceOf(Date);
    expect(moment.date).toBe("2021-12-18T05:58:12.000Z");
    expect(moment.updated).toBe("2021-12-18T06:05:09.000Z");
    expect(formatMomentDateTime(moment.date)).toBe("2021年12月18日 13:58");
  });

  it("拒绝无效字段、过多图片、重复 slug 与 fragment", () => {
    expect(() => toMomentData(entry("invalid", { date: "not-a-date" }))).toThrow(/date/);
    expect(() => toMomentData(entry("invalid", { date: "2026-02-30 12:00:00" }))).toThrow(/date/);
    expect(() => toMomentData(entry("invalid", { location: "" }))).toThrow(/location/);
    expect(() => toMomentData(entry("invalid", { images: [{ src: "/photo.jpg", alt: "" }] }))).toThrow(
      /images\.0\.alt/,
    );
    expect(() =>
      toMomentData(
        entry("invalid", {
          images: Array.from({ length: 10 }, (_, index) => ({ src: `/${index}.jpg`, alt: `图片 ${index}` })),
        }),
      ),
    ).toThrow(/最多只能提供 9 张图片/);
    expect(() => prepareMoments([entry("same"), entry("same")])).toThrow(/slug 重复/);
    expect(momentFragment("life/walk")).toBe(momentFragment("life-walk"));
    expect(() => prepareMoments([entry("life/walk"), entry("life-walk")])).toThrow(/fragment 重复/);
  });
});

describe("动态集合", () => {
  it("过滤草稿并将置顶动态按日期倒序放在前面", () => {
    const entries = [
      entry("regular-new", { date: "2026-09-04" }),
      entry("pinned-old", { date: "2026-09-01", pinned: true }),
      entry("pinned-new", { date: "2026-09-03", pinned: true }),
      entry("draft", { date: "2026-09-05", draft: true }),
    ];
    expect(prepareMoments(entries).map((moment) => moment.slug)).toEqual(["pinned-new", "pinned-old", "regular-new"]);
    expect(prepareMoments(entries, { includeDrafts: true }).map((moment) => moment.slug)).toEqual([
      "pinned-new",
      "pinned-old",
      "draft",
      "regular-new",
    ]);
  });

  it("使用秒级时间对动态排序", () => {
    const moments = prepareMoments([
      entry("earlier", { date: "2026-09-04 12:00:01" }),
      entry("later", { date: "2026-09-04 12:00:02" }),
    ]);

    expect(moments.map((moment) => moment.slug)).toEqual(["later", "earlier"]);
  });

  it("与长文章使用互不混合的内容加载入口", async () => {
    const postLoader = await readFile(new URL("../../src/.vitepress/data/posts.data.ts", import.meta.url), "utf8");
    const momentLoader = await readFile(new URL("../../src/.vitepress/data/moments.data.ts", import.meta.url), "utf8");

    expect(postLoader).toContain('createContentLoader("posts/**/*.md"');
    expect(postLoader).not.toContain('createContentLoader("moments/**/*.md"');
    expect(momentLoader).toContain('createContentLoader("moments/**/*.md"');
    expect(momentLoader).not.toContain('createContentLoader("posts/**/*.md"');
  });
});

describe("动态时间", () => {
  const now = new Date("2026-09-04T12:00:00+08:00");

  it("按朋友圈规则显示当天、昨天和七日内时间", () => {
    expect(formatMomentTime("2026-09-04T08:10:00+08:00", now)).toBe("08:10");
    expect(formatMomentTime("2026-09-03T18:35:00+08:00", now)).toBe("昨天");
    expect(formatMomentTime("2026-09-01T12:05:00+08:00", now)).toBe("星期二");
  });

  it("同年较早日期省略年份，跨年日期保留年份", () => {
    expect(formatMomentTime("2026-08-20T12:00:00+08:00", now)).toBe("8月20日");
    expect(formatMomentTime("2025-12-31T12:00:00+08:00", now)).toBe("2025年12月31日");
    expect(formatMomentDateTime("2026-09-04T08:10:00+08:00")).toBe("2026年9月4日 08:10");
  });
});

describe("动态 Markdown", () => {
  it("从正文末尾提取图片并从正文 HTML 中移除", async () => {
    const markdown = await createMomentMarkdownRenderer();
    await expect(
      markdown.renderAsync("普通 **短动态**。", { relativePath: "moments/life/text.md" }),
    ).resolves.toContain("<strong>短动态</strong>");

    const env = {
      path: "moments/life/photo.md",
      relativePath: "moments/life/photo.md",
      cleanUrls: true,
    } satisfies MarkdownEnv;
    const html = await markdown.renderAsync(
      "一条带图动态。\n\n![晚霞](/moments/sunset.jpg)\n\n![江面](/moments/river.jpg)",
      env,
    );
    expect(html).toContain("<p>一条带图动态。</p>");
    expect(html).not.toContain("<img");
    expect(getMomentContentImages(env)).toEqual([
      { src: "/moments/sunset.jpg", alt: "晚霞" },
      { src: "/moments/river.jpg", alt: "江面" },
    ]);

    await expect(
      markdown.renderAsync("![文章图片](/posts/photo.jpg)", { relativePath: "posts/article.md" }),
    ).resolves.toContain("<img");
    disposeMdItInstance();
  });

  it("保留旧 frontmatter 图片并拒绝与正文图片混用", async () => {
    const markdown = await createMomentMarkdownRenderer();
    const legacy = ["---", "images:", "  - src: /moments/legacy.jpg", "    alt: 旧图片", "---", "", "正文"];
    await expect(
      markdown.renderAsync(legacy.join("\n"), { relativePath: "moments/life/legacy.md" }),
    ).resolves.toContain("正文");
    await expect(
      markdown.renderAsync([...legacy, "", "![新图片](/moments/new.jpg)"].join("\n"), {
        relativePath: "moments/life/mixed.md",
      }),
    ).rejects.toThrow(/不能同时使用正文图片和 frontmatter images/);
    disposeMdItInstance();
  });

  it("渲染受支持富媒体，并将容器封面排除在动态图库之外", async () => {
    const markdown = await createMomentMarkdownRenderer();
    const env = {
      path: "moments/life/rich-media.md",
      relativePath: "moments/life/rich-media.md",
      cleanUrls: true,
    } satisfies MarkdownEnv;
    const html = await markdown.renderAsync(
      [
        "今天想分享四件事。",
        "",
        "::: link-card",
        "[使用 Markdown 扩展](/blog/guide/markdown-extensions)",
        ":::",
        "",
        "::: music https://open.motues.top/music?server=netease&type=details&id=1336076646",
        ":::",
        "",
        "::: video /media/live-photo-sample.mp4",
        "![旅途视频封面](/media/live-photo-sample-poster.png)",
        ":::",
        "",
        "::: live-photo /media/live-photo-sample.mp4",
        "![江边傍晚的动态照片](/media/live-photo-sample-poster.png)",
        ":::",
        "",
        "![动态图库图片](/media/live-photo-sample-poster.png)",
      ].join("\n"),
      env,
    );

    expect(html).toContain("<!--bean-moment-rich-media-0-->");
    expect(html).toContain("<!--bean-moment-rich-media-1-->");
    expect(html).toContain("<!--bean-moment-rich-media-2-->");
    expect(html).toContain("<!--bean-moment-rich-media-3-->");
    expect(html).not.toContain("动态图库图片");
    expect(getMomentContentImages(env)).toEqual([{ src: "/media/live-photo-sample-poster.png", alt: "动态图库图片" }]);
    expect(getMomentRichMedia(env)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "link-card", href: "/blog/guide/markdown-extensions" }),
        expect.objectContaining({
          type: "music",
          source: "https://open.motues.top/music?server=netease&type=details&id=1336076646",
          resolver: "motues-details",
          coverAlt: "歌曲封面",
        }),
        expect.objectContaining({
          type: "video",
          source: "/media/live-photo-sample.mp4",
          poster: "/media/live-photo-sample-poster.png",
          title: "旅途视频封面",
        }),
        expect.objectContaining({
          type: "live-photo",
          poster: "/media/live-photo-sample-poster.png",
          video: "/media/live-photo-sample.mp4",
          alt: "江边傍晚的动态照片",
        }),
      ]),
    );

    await expect(
      markdown.renderAsync(
        [
          "![动态图库图片](/media/live-photo-sample-poster.png)",
          "",
          "::: video /media/live-photo-sample.mp4",
          ":::",
        ].join("\n"),
        { relativePath: "moments/life/media-after-gallery.md" },
      ),
    ).rejects.toThrow(/动态正文图片必须集中放在正文末尾/);
    disposeMdItInstance();
  });

  it("拒绝不符合尾部图库约束的正文图片", async () => {
    const markdown = await createMomentMarkdownRenderer();
    const render = (source: string, name: string) =>
      markdown.renderAsync(source, { relativePath: `moments/invalid/${name}.md` });

    await expect(render("图片 ![晚霞](/moments/a.jpg)", "mixed-paragraph")).rejects.toThrow(/独立段落/);
    await expect(render("![晚霞](/moments/a.jpg)\n\n后续正文", "text-after-images")).rejects.toThrow(/正文末尾/);
    await expect(render("[![晚霞](/moments/a.jpg)](/blog/photo)", "linked-image")).rejects.toThrow(/独立段落/);
    await expect(render('![晚霞](/moments/a.jpg "标题")', "image-title")).rejects.toThrow(/不支持 title/);
    await expect(render("![](/moments/a.jpg)", "empty-alt")).rejects.toThrow(/非空替代文本 alt/);
    await expect(
      render(
        Array.from({ length: 10 }, (_, index) => `![图片 ${index + 1}](/moments/${index + 1}.jpg)`).join("\n\n"),
        "too-many-images",
      ),
    ).rejects.toThrow(/最多只能提供 9 张图片/);
    disposeMdItInstance();
  });
});
