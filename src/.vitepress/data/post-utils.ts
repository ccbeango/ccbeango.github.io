import type { ContentData, DefaultTheme } from "vitepress";
import type { ArchiveGroup, PostData, PostFrontmatter, TagSummary } from "./post-types.ts";
import { z } from "zod";

const dateString = z.preprocess(
  (value) => (value instanceof Date ? value.toISOString() : value),
  z.string().refine((value) => !Number.isNaN(Date.parse(value)), "必须是有效日期"),
);

const frontmatterSchema = z.object({
  title: z.string().trim().min(1, "不能为空"),
  date: dateString,
  updated: dateString.optional(),
  summary: z.string().trim().optional(),
  description: z.string().trim().optional(),
  keywords: z.array(z.string().trim().min(1)).default([]),
  featured: z.boolean().default(false),
  series: z
    .object({
      name: z.string().trim().min(1, "不能为空"),
      order: z.number().int("必须是整数").positive("必须是正整数"),
      sidebar: z.string().trim().min(1, "不能为空").optional(),
      sidebarOrder: z.number().int("必须是整数").positive("必须是正整数").optional(),
    })
    .superRefine((series, context) => {
      if (series.sidebar === undefined && series.sidebarOrder !== undefined) {
        context.addIssue({
          code: "custom",
          path: ["sidebar"],
          message: "必须与 sidebarOrder 同时提供",
        });
      }
      if (series.sidebar !== undefined && series.sidebarOrder === undefined) {
        context.addIssue({
          code: "custom",
          path: ["sidebarOrder"],
          message: "必须与 sidebar 同时提供",
        });
      }
    })
    .optional(),
  tags: z.array(z.string().trim().min(1)).default([]),
  draft: z.boolean().default(false),
  cover: z.string().trim().optional(),
  canonical: z.url().optional(),
});

function normalizeSlug(url: string) {
  return decodeURIComponent(url)
    .replace(/^\/posts\//, "")
    .replace(/\.(?:html|md)$/, "")
    .replace(/\/index$/, "")
    .replace(/^\/+|\/+$/g, "");
}

function plainText(source: string) {
  return source
    .replace(/^---[\s\S]*?---\s*/, "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_~|\-]/g, " ");
}

export function countWords(source: string) {
  const text = plainText(source);
  const chinese = text.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/gu)?.length ?? 0;
  const latin =
    text
      .match(/[\p{Letter}\p{Number}]+/gu)
      ?.filter((word) => !/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(word)).length ?? 0;
  return chinese + latin;
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Shanghai",
  }).format(new Date(value));
}

export function tagSlug(tag: string) {
  const normalized = tag.normalize("NFKC").trim().toLocaleLowerCase("zh-CN");
  return Array.from(normalized)
    .map((character) => {
      if (/[a-z0-9]/.test(character)) return character;
      if (/[\s\-_]/.test(character)) return "-";
      return `-u${character.codePointAt(0)?.toString(16)}-`;
    })
    .join("")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function toPostData(entry: ContentData): PostData {
  const slug = normalizeSlug(entry.url);
  const result = frontmatterSchema.safeParse(entry.frontmatter);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join(".") || "frontmatter"}: ${issue.message}`)
      .join("; ");
    throw new Error(`文章 ${slug || entry.url} 的 frontmatter 无效：${details}`);
  }

  const frontmatter = result.data as PostFrontmatter;
  const wordCount = countWords(entry.src ?? "");
  return {
    ...frontmatter,
    summary: frontmatter.summary ?? frontmatter.description ?? "",
    description: frontmatter.description ?? frontmatter.summary ?? "",
    tags: [...new Set(frontmatter.tags.map((tag) => tag.trim()))],
    slug,
    url: `/blog/${slug}`,
    wordCount,
    readingTime: Math.max(1, Math.ceil(wordCount / 400)),
    src: entry.src,
    html: entry.html,
  };
}

export function sortPosts<T extends Pick<PostData, "date">>(posts: T[]) {
  return [...posts].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
}

export function preparePosts(entries: ContentData[], options: { includeDrafts?: boolean } = {}) {
  const posts = entries.map(toPostData);
  const duplicate = posts.find((post, index) => posts.findIndex((item) => item.slug === post.slug) !== index);
  if (duplicate) throw new Error(`文章 slug 重复：${duplicate.slug}`);
  return sortPosts(options.includeDrafts ? posts : posts.filter((post) => !post.draft));
}

export function getFeaturedPosts(posts: PostData[], limit?: number) {
  const featuredPosts = sortPosts(posts.filter((post) => post.featured && !post.draft));
  return limit === undefined ? featuredPosts : featuredPosts.slice(0, limit);
}

export function createSeriesSidebar(posts: PostData[]): DefaultTheme.SidebarMulti {
  interface SeriesGroup {
    name: string;
    sidebar: string;
    sidebarOrder: number;
    members: PostData[];
  }

  const seriesGroups = new Map<string, SeriesGroup>();
  for (const post of posts) {
    if (!post.series) continue;
    const sidebar = post.series.sidebar ?? post.series.name;
    const sidebarOrder = post.series.sidebarOrder ?? 1;
    const existing = seriesGroups.get(post.series.name);
    if (existing) {
      if (existing.sidebar !== sidebar || existing.sidebarOrder !== sidebarOrder) {
        throw new Error(`系列「${post.series.name}」的 sidebar 声明不一致：${existing.members[0].slug}、${post.slug}`);
      }
      existing.members.push(post);
      continue;
    }
    seriesGroups.set(post.series.name, {
      name: post.series.name,
      sidebar,
      sidebarOrder,
      members: [post],
    });
  }

  const sidebarScopes = new Map<string, SeriesGroup[]>();
  for (const group of seriesGroups.values()) {
    const ordered = [...group.members].sort((a, b) => a.series!.order - b.series!.order);
    const duplicate = ordered.find(
      (post, index) => ordered.findIndex((item) => item.series!.order === post.series!.order) !== index,
    );
    if (duplicate) {
      const first = ordered.find((post) => post !== duplicate && post.series!.order === duplicate.series!.order)!;
      throw new Error(
        `系列「${group.name}」的 order ${duplicate.series!.order} 重复：${first.slug}、${duplicate.slug}`,
      );
    }
    group.members = ordered;
    const scopeGroups = sidebarScopes.get(group.sidebar) ?? [];
    scopeGroups.push(group);
    sidebarScopes.set(group.sidebar, scopeGroups);
  }

  const sidebar: DefaultTheme.SidebarMulti = {};
  for (const [scope, scopeGroups] of sidebarScopes) {
    const orderedGroups = [...scopeGroups].sort(
      (a, b) => a.sidebarOrder - b.sidebarOrder || a.name.localeCompare(b.name, "zh-CN"),
    );
    const duplicate = orderedGroups.find(
      (group, index) => orderedGroups.findIndex((item) => item.sidebarOrder === group.sidebarOrder) !== index,
    );
    if (duplicate) {
      const first = orderedGroups.find(
        (group) => group !== duplicate && group.sidebarOrder === duplicate.sidebarOrder,
      )!;
      throw new Error(
        `侧栏「${scope}」的 sidebarOrder ${duplicate.sidebarOrder} 重复：${first.name}、${duplicate.name}`,
      );
    }

    const groups: DefaultTheme.SidebarItem[] = orderedGroups.map((group) => ({
      text: group.name,
      collapsed: false,
      items: group.members.map((post) => ({ text: post.title, link: post.url })),
    }));
    for (const group of orderedGroups) {
      for (const post of group.members) sidebar[`${post.url}.md`] = groups;
    }
  }
  return sidebar;
}

export function paginatePosts(posts: PostData[], page: number, pageSize: number) {
  const pageCount = Math.max(1, Math.ceil(posts.length / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  return {
    page: safePage,
    pageCount,
    items: posts.slice((safePage - 1) * pageSize, safePage * pageSize),
  };
}

export function collectTags(posts: PostData[]): TagSummary[] {
  const counts = new Map<string, { name: string; count: number }>();
  for (const post of posts) {
    for (const tag of post.tags) {
      const slug = tagSlug(tag);
      const current = counts.get(slug);
      counts.set(slug, { name: current?.name ?? tag, count: (current?.count ?? 0) + 1 });
    }
  }
  return [...counts.entries()]
    .map(([slug, value]) => ({ slug, ...value }))
    .sort((a, b) => a.name.localeCompare(b.name, "zh-CN"));
}

export function groupArchives(posts: PostData[]): ArchiveGroup[] {
  const groups = new Map<string, PostData[]>();
  for (const post of sortPosts(posts)) {
    const year = String(new Date(post.date).getUTCFullYear());
    groups.set(year, [...(groups.get(year) ?? []), post]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => Number(b) - Number(a))
    .map(([year, yearPosts]) => ({ year, posts: yearPosts }));
}

export function normalizeSearchText(value: string) {
  return value.normalize("NFKC").toLocaleLowerCase("zh-CN").replace(/\s+/g, "");
}

export function searchPosts(posts: PostData[], query: string) {
  const normalized = normalizeSearchText(query);
  if (!normalized) return [];
  return posts.filter((post) =>
    normalizeSearchText(
      [post.title, post.summary, post.description, ...post.tags, ...post.keywords].join(" "),
    ).includes(normalized),
  );
}
