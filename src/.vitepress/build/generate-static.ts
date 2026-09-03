import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Feed } from "feed";
import { createContentLoader } from "vitepress";
import { preparePosts } from "../data/post-utils.ts";
import { siteConfig, withBasePath } from "../site.config.ts";

function absoluteUrl(path: string) {
  return new URL(withBasePath(path), `${siteConfig.site.url}/`).toString();
}

export async function generateStaticAssets(outDir: string) {
  const loader = createContentLoader("posts/**/*.md", {
    includeSrc: true,
    render: true,
    transform: (entries) => preparePosts(entries),
  });
  const posts = await loader.load();
  const author = {
    name: siteConfig.author.name,
    email: siteConfig.author.email,
    link: siteConfig.site.url,
  };
  const feed = new Feed({
    title: siteConfig.site.title,
    description: siteConfig.site.description,
    id: siteConfig.site.url,
    link: siteConfig.site.url,
    language: siteConfig.site.language,
    image: absoluteUrl(siteConfig.site.favicon.png),
    favicon: absoluteUrl(siteConfig.site.favicon.ico),
    copyright: `Copyright ${new Date().getFullYear()} ${siteConfig.author.name}`,
    updated: posts[0] ? new Date(posts[0].updated ?? posts[0].date) : new Date(),
    generator: "VitePress",
    feedLinks: {
      rss2: absoluteUrl(siteConfig.site.feeds.rss),
      atom: absoluteUrl(siteConfig.site.feeds.atom),
      json: absoluteUrl(siteConfig.site.feeds.json),
    },
    author,
  });

  for (const post of posts) {
    feed.addItem({
      title: post.title,
      id: absoluteUrl(post.url),
      link: absoluteUrl(post.url),
      description: post.summary,
      content: post.html,
      author: [author],
      date: new Date(post.updated ?? post.date),
      published: new Date(post.date),
    });
  }

  await mkdir(outDir, { recursive: true });
  const rss = feed.rss2();
  await Promise.all([
    writeFile(join(outDir, "rss.xml"), rss, "utf8"),
    writeFile(join(outDir, "index.xml"), rss, "utf8"),
    writeFile(join(outDir, "atom.xml"), feed.atom1(), "utf8"),
    writeFile(join(outDir, "feed.json"), feed.json1(), "utf8"),
    writeFile(
      join(outDir, "robots.txt"),
      `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${absoluteUrl("/sitemap.xml")}\n`,
      "utf8",
    ),
    writeFile(
      join(outDir, "site.webmanifest"),
      `${JSON.stringify(
        {
          name: siteConfig.site.name,
          short_name: siteConfig.site.name,
          description: siteConfig.site.description,
          start_url: siteConfig.site.base,
          scope: siteConfig.site.base,
          icons: [
            {
              src: withBasePath(siteConfig.site.favicon.png),
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable",
            },
          ],
          theme_color: "#f7f7f5",
          background_color: "#f7f7f5",
          display: "standalone",
        },
        null,
        2,
      )}\n`,
      "utf8",
    ),
  ]);
}
