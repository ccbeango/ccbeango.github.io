export interface NavItem {
  title: string;
  href?: string;
  children?: NavItem[];
}

export interface SocialLink {
  label: string;
  href: string;
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

const serverEnv = typeof process === "undefined" ? undefined : process.env;
const runtimeBase = serverEnv?.SITE_BASE ?? import.meta.env?.BASE_URL;

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
    favicon: {
      ico: "/favicon.ico",
      png: "/favicon.png",
      svg: "/favicon.svg",
    },
    manifest: "/site.webmanifest",
    feeds: {
      rss: "/rss.xml",
      rssAlias: "/index.xml",
      atom: "/atom.xml",
      json: "/feed.json",
    },
  },
  author: {
    name: "Bean",
    email: "hello@example.com",
    bio: "一名持续学习的软件工程师，在这里记录实践、判断与复盘。",
  },
  navigation: [
    { title: "文章", href: "/blog" },
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
