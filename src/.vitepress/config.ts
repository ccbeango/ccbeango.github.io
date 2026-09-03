import type { DefaultTheme, UserConfigFn } from "vitepress";
import { glob } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import taskLists from "markdown-it-task-lists";
import { defineConfig } from "vitepress";
import { generateStaticAssets } from "./build/generate-static.ts";
import { loadPostSources } from "./data/load-post-sources.ts";
import { createSeriesSidebar } from "./data/post-utils.ts";
import { imageGridPlugin } from "./markdown/image-grid.ts";
import { linkCardPlugin } from "./markdown/link-card.ts";
import { livePhotoPlugin } from "./markdown/live-photo.ts";
import { musicPlugin } from "./markdown/music.ts";
import { momentContentPlugin, momentRichMediaContainers } from "./markdown/moment-content.ts";
import { photoPreviewPlugin } from "./markdown/photo-preview.ts";
import { videoPlugin } from "./markdown/video.ts";
import { requireSiteUrl, siteConfig, withBasePath } from "./site.config.ts";

const srcDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");

async function loadSeriesSidebar(includeDrafts: boolean) {
  const files: string[] = [];
  for await (const file of glob("posts/**/*.md", { cwd: srcDir })) files.push(resolve(srcDir, file));
  const posts = await loadPostSources(files.sort(), srcDir, { includeDrafts });
  return createSeriesSidebar(posts);
}

const config: UserConfigFn<DefaultTheme.Config> = async ({ command }) => {
  if (command === "build") requireSiteUrl();
  const sidebar = await loadSeriesSidebar(command !== "build");
  const absolute = (path: string) =>
    siteConfig.site.url ? new URL(withBasePath(path), `${siteConfig.site.url}/`).toString() : withBasePath(path);

  return defineConfig({
    lang: siteConfig.site.language,
    title: siteConfig.site.title,
    titleTemplate: `:title | ${siteConfig.site.title}`,
    description: siteConfig.site.description,
    base: siteConfig.site.base,
    srcExclude: ["posts/**/*.md", "moments/**/*.md"],
    cleanUrls: true,
    lastUpdated: true,
    appearance: true,
    themeConfig: {
      sidebar,
    },
    vite: {
      plugins: [tailwindcss()],
    },
    markdown: {
      lineNumbers: true,
      math: true,
      image: {
        lazyLoad: true,
      },
      container: {
        infoLabel: "信息",
        noteLabel: "备注",
        tipLabel: "提示",
        importantLabel: "重要",
        warningLabel: "警告",
        dangerLabel: "危险",
        cautionLabel: "注意",
        detailsLabel: "详细信息",
        customContainers: {
          "image-grid": "图片布局",
          ...momentRichMediaContainers,
          "live-photo": "Live Photo",
        },
      },
      codeCopyButton: {
        tooltipText: "复制代码",
        copiedText: "已复制",
      },
      theme: {
        light: "github-light",
        dark: "github-dark",
      },
      config(md) {
        md.use(momentContentPlugin);
        md.use(taskLists, { enabled: true, label: true, labelAfter: true });
        md.use(imageGridPlugin);
        md.use(linkCardPlugin);
        md.use(livePhotoPlugin);
        md.use(musicPlugin);
        md.use(videoPlugin);
        md.use(photoPreviewPlugin);
      },
    },
    sitemap: siteConfig.site.url
      ? {
          hostname: siteConfig.site.url,
          transformItems: (items) => items.filter((item) => !/(?:^|\/)404\/?$/.test(item.url)),
        }
      : undefined,
    head: [
      ["link", { rel: "icon", href: withBasePath(siteConfig.site.favicon.ico), sizes: "any" }],
      ["link", { rel: "icon", href: withBasePath(siteConfig.site.favicon.svg), type: "image/svg+xml" }],
      ["link", { rel: "icon", href: withBasePath(siteConfig.site.favicon.png), type: "image/png" }],
      ["link", { rel: "manifest", href: withBasePath(siteConfig.site.manifest) }],
      [
        "link",
        { rel: "alternate", type: "application/rss+xml", title: "RSS", href: withBasePath(siteConfig.site.feeds.rss) },
      ],
      [
        "link",
        {
          rel: "alternate",
          type: "application/atom+xml",
          title: "Atom",
          href: withBasePath(siteConfig.site.feeds.atom),
        },
      ],
      [
        "link",
        {
          rel: "alternate",
          type: "application/feed+json",
          title: "JSON Feed",
          href: withBasePath(siteConfig.site.feeds.json),
        },
      ],
    ],
    transformHead({ page, pageData }) {
      const params = pageData.params as Record<string, unknown> | undefined;
      const title = typeof params?.title === "string" ? params.title : pageData.title;
      const description = typeof params?.description === "string" ? params.description : siteConfig.site.description;
      const keywords =
        typeof params?.keywords === "string" && params.keywords ? params.keywords : siteConfig.site.keywords.join(",");
      const routePath =
        typeof params?.url === "string" ? params.url : `/${page}`.replace(/(?:index)?\.(?:md|html)$/, "");
      const canonical =
        typeof params?.canonical === "string" && params.canonical
          ? params.canonical
          : absolute(routePath.startsWith("/") ? routePath : `/${routePath}`);
      return [
        ["meta", { name: "description", content: description }],
        ["meta", { name: "keywords", content: keywords }],
        ["link", { rel: "canonical", href: canonical }],
        ["meta", { property: "og:type", content: params?.slug ? "article" : "website" }],
        ["meta", { property: "og:title", content: title || siteConfig.site.title }],
        ["meta", { property: "og:description", content: description }],
        ["meta", { property: "og:url", content: canonical }],
        ["meta", { name: "twitter:card", content: "summary" }],
        ["meta", { name: "twitter:title", content: title || siteConfig.site.title }],
        ["meta", { name: "twitter:description", content: description }],
      ];
    },
    async buildEnd(config) {
      await generateStaticAssets(config.outDir);
    },
  });
};

export default config;
