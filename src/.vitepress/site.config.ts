export interface NavItem {
  title: string;
  href?: string;
  children?: NavItem[];
}

export interface SocialLink {
  label: string;
  href: string;
}

export interface MomentConfigInput {
  covers: string[];
  displayName?: string;
  avatar?: string;
  signature?: string;
  momentBatchSize: number;
}

export interface MomentConfig {
  covers: string[];
  displayName: string;
  avatar: string;
  signature: string;
  momentBatchSize: number;
}

export interface GiscusConfig {
  repo: `${string}/${string}`;
  repoId: string;
  category: string;
  categoryId: string;
  mapping: "pathname" | "url" | "title" | "og:title";
  reactionsEnabled: "0" | "1";
  inputPosition: "top" | "bottom";
  lang: string;
}

export function isGiscusConfigured(value: Partial<GiscusConfig> | null | undefined): value is GiscusConfig {
  return Boolean(
    value?.repo &&
    value.repoId &&
    value.category &&
    value.categoryId &&
    value.mapping &&
    value.reactionsEnabled &&
    value.inputPosition &&
    value.lang,
  );
}

function normalizeBase(value: string | undefined) {
  if (!value || value === "/") return "/";
  return `/${value.replace(/^\/+|\/+$/g, "")}/`;
}

export function resolveMomentConfig(
  value: MomentConfigInput,
  author: { name: string; bio: string },
  favicon: string,
): MomentConfig {
  const covers = value.covers.map((cover) => cover.trim());
  if (!covers.length || covers.some((cover) => !cover)) throw new Error("动态页至少需要一张非空封面");
  if (!Number.isInteger(value.momentBatchSize) || value.momentBatchSize <= 0)
    throw new Error("动态页每批数量必须是正整数");
  return {
    covers: [...new Set(covers)],
    displayName: value.displayName?.trim() || author.name,
    avatar: value.avatar?.trim() || favicon,
    signature: value.signature?.trim() || author.bio,
    momentBatchSize: value.momentBatchSize,
  };
}

const serverEnv = typeof process === "undefined" ? undefined : process.env;
const runtimeBase = serverEnv?.SITE_BASE ?? import.meta.env?.BASE_URL;
const author = {
  name: "Bean",
  email: "hello@example.com",
  bio: "一名持续学习的软件工程师，在这里记录实践、判断与复盘。",
};
const favicon = {
  ico: "/favicon.ico",
  png: "/favicon.png",
  svg: "/favicon.svg",
};

export const siteConfig = {
  site: {
    title: "Bean Blog",
    name: "Bean Blog",
    description: "记录工程实践、技术思考与持续学习。",
    keywords: ["VitePress", "前端开发", "工程实践", "个人博客"],
    url: serverEnv?.SITE_URL?.replace(/\/$/, "") ?? "",
    base: normalizeBase(runtimeBase),
    locale: "zh_CN",
    language: "zh-CN",
    featuredPostsLimit: 5,
    postsPerPage: 3,
    favicon,
    manifest: "/site.webmanifest",
    feeds: {
      rss: "/rss.xml",
      rssAlias: "/index.xml",
      atom: "/atom.xml",
      json: "/feed.json",
    },
  },
  author,
  moment: resolveMomentConfig(
    {
      covers: ["/moments/cover.webp", "/media/live-photo-sample-poster.png"],
      signature: "记录实践、判断与复盘。",
      momentBatchSize: 4,
    },
    author,
    favicon.svg,
  ),
  navigation: [
    { title: "文章", href: "/blog" },
    { title: "动态", href: "/moment" },
    { title: "使用手册", href: "/blog/guide/getting-started" },
    {
      title: "浏览",
      children: [
        { title: "标签", href: "/tags" },
        { title: "归档", href: "/archives" },
      ],
    },
  ] satisfies NavItem[],
  homeSocials: [
    { label: "GitHub", href: "https://github.com/" },
    { label: "RSS", href: "/rss.xml" },
  ] satisfies SocialLink[],
  giscus: null as GiscusConfig | null,
};

export function requireSiteUrl() {
  if (!siteConfig.site.url) {
    throw new Error("生产构建需要 SITE_URL，例如：$env:SITE_URL='https://blog.example.com'; pnpm build");
  }
  return siteConfig.site.url;
}

export function withBasePath(path: string) {
  if (/^(?:[a-z]+:)?\/\//i.test(path)) return path;
  const normalized = path.startsWith("/") ? path.slice(1) : path;
  return `${siteConfig.site.base}${normalized}`.replace(/\/+/g, "/");
}
