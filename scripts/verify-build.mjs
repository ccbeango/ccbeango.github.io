import { access, glob, readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { loadPostSources } from "../src/.vitepress/data/load-post-sources.ts";
import { siteConfig } from "../src/.vitepress/site.config.ts";

const root = fileURLToPath(new URL("../", import.meta.url));
const src = join(root, "src");
const dist = join(src, ".vitepress", "dist");
const postSources = [];
for await (const file of glob("posts/**/*.md", { cwd: src })) postSources.push(join(src, file));
const posts = await loadPostSources(postSources.sort(), src);
const pageCount = Math.max(1, Math.ceil(posts.length / siteConfig.site.postsPerPage));
const requiredFiles = [
  ...new Set([
    "index.html",
    "404.html",
    "blog/index.html",
    "moment/index.html",
    "tags/index.html",
    "archives/index.html",
    "robots.txt",
    "sitemap.xml",
    "rss.xml",
    "index.xml",
    "atom.xml",
    "feed.json",
    "site.webmanifest",
    "favicon.ico",
    "favicon.png",
    "favicon.svg",
    "logo.svg",
    ...posts.map((post) => `blog/${post.slug}.html`),
    ...Array.from({ length: pageCount - 1 }, (_, index) => `blog/page/${index + 2}.html`),
  ]),
];

await Promise.all(requiredFiles.map((file) => access(join(dist, file))));

async function walk(directory) {
  const nested = await Promise.all(
    (await readdir(directory, { withFileTypes: true })).map((entry) =>
      entry.isDirectory() ? walk(join(directory, entry.name)) : [join(directory, entry.name)],
    ),
  );
  return nested.flat();
}
const files = await walk(dist);
const publicTextFiles = files.filter((file) => /\.(?:html|xml|json|txt)$/.test(file));
const publicText = (await Promise.all(publicTextFiles.map((file) => readFile(file, "utf8")))).join("\n");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(
  !files.some((file) => relative(dist, file).replace(/\\/g, "/").startsWith("posts/")),
  "构建产物不得暴露 /posts 原稿路由",
);
assert(
  !files.some((file) => relative(dist, file).replace(/\\/g, "/").startsWith("moments/") && /\.html$/.test(file)),
  "构建产物不得暴露 /moments 原稿路由",
);
assert(
  !files.some((file) => relative(dist, file).replace(/\\/g, "/").startsWith("moment/page/")),
  "动态页面不得生成分页路由",
);
assert(
  !files.some((file) => relative(dist, file).replace(/\\/g, "/") === "blog/guide/draft-preview.html") &&
    !publicText.includes("草稿预览示例") &&
    !publicText.includes("这条动态只在开发环境中用于检查草稿样式"),
  "公开产物不得包含草稿",
);

for (const post of posts) {
  const article = await readFile(join(dist, "blog", `${post.slug}.html`), "utf8");
  for (const token of ['rel="canonical"', 'property="og:title"', 'name="twitter:card"', 'rel="manifest"']) {
    assert(article.includes(token), `${post.slug} 缺少元数据：${token}`);
  }
}

const sitemap = await readFile(join(dist, "sitemap.xml"), "utf8");
assert(sitemap.includes("https://"), "sitemap 必须包含绝对地址");
assert(!sitemap.includes("/posts/") && !sitemap.includes("/404"), "sitemap 不得包含原稿或 404");
assert(!sitemap.includes("/moment/page/") && !sitemap.includes("#moment-"), "sitemap 不得包含动态分页或 fragment");
const sitemapPaths = new Set(
  [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, location]) => new URL(location).pathname),
);
for (const post of posts) {
  const articlePath = new URL(`/blog/${post.slug}`, "https://example.com").pathname;
  assert(sitemapPaths.has(articlePath), `sitemap 缺少文章：${post.slug}`);
}

const moment = await readFile(join(dist, "moment", "index.html"), "utf8");
const blogIndex = await readFile(join(dist, "blog", "index.html"), "utf8");
assert(
  moment.includes("data-moment-profile") &&
    moment.includes("data-moment-header") &&
    (moment.includes("data-moment-card") || moment.includes("data-moment-empty")),
  "动态首页结构无效",
);
assert(!blogIndex.includes("data-moment-card"), "文章列表不得混入短动态");
assert(!moment.includes("点赞") && !moment.includes("评论"), "动态页面不得包含虚假互动控件");

const robots = await readFile(join(dist, "robots.txt"), "utf8");
assert(robots.includes("User-agent: *") && robots.includes("Sitemap: https://"), "robots 规则或 sitemap 地址无效");

const manifest = JSON.parse(await readFile(join(dist, "site.webmanifest"), "utf8"));
assert(manifest.name && manifest.icons?.length && manifest.display === "standalone", "web manifest 内容无效");

for (const feedFile of ["rss.xml", "index.xml", "atom.xml", "feed.json"]) {
  const feed = await readFile(join(dist, feedFile), "utf8");
  assert(feed.includes("https://"), `${feedFile} 缺少绝对 URL`);
  assert(!feed.includes("data-moment-card"), `${feedFile} 不得混入短动态`);
}

console.log(
  `Static build verification passed (${posts.length} published posts, ${pageCount} listing pages, ${requiredFiles.length} required files)`,
);
