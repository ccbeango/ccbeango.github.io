import { access, readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const dist = join(root, "src", ".vitepress", "dist");
const requiredFiles = [
  "index.html",
  "404.html",
  "blog/index.html",
  "blog/page/2.html",
  "blog/page/3.html",
  "blog/guide/getting-started.html",
  "blog/guide/site-configuration.html",
  "blog/guide/writing-articles.html",
  "blog/guide/markdown-extensions.html",
  "blog/guide/image-layouts.html",
  "blog/guide/live-photo.html",
  "blog/guide/deployment.html",
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
];

await Promise.all(requiredFiles.map(file => access(join(dist, file))));

async function walk(directory) {
  const nested = await Promise.all((await readdir(directory, { withFileTypes: true })).map(
    entry => entry.isDirectory()
      ? walk(join(directory, entry.name))
      : [join(directory, entry.name)],
  ));
  return nested.flat();
}
const files = await walk(dist);
const publicTextFiles = files.filter(file => /\.(?:html|xml|json|txt)$/.test(file));
const publicText = (await Promise.all(publicTextFiles.map(file => readFile(file, "utf8")))).join("\n");

function assert(condition, message) {
  if (!condition)
    throw new Error(message);
}

assert(!files.some(file => relative(dist, file).replace(/\\/g, "/").startsWith("posts/")), "构建产物不得暴露 /posts 原稿路由");
assert(!publicText.includes("draft-preview") && !publicText.includes("草稿预览示例"), "公开产物不得包含草稿");

const article = await readFile(join(dist, "blog", "guide", "markdown-extensions.html"), "utf8");
assert(article.includes("<mjx-container"), "文章必须渲染数学公式");
assert(article.includes("language-ts"), "文章必须包含 Shiki 代码块");
assert(!article.includes("title: 使用 Markdown 扩展"), "文章正文不得显示 frontmatter");
for (const token of ["rel=\"canonical\"", "property=\"og:title\"", "name=\"twitter:card\"", "rel=\"manifest\""]) {
  assert(article.includes(token), `文章缺少元数据：${token}`);
}

const sitemap = await readFile(join(dist, "sitemap.xml"), "utf8");
assert(sitemap.includes("https://") && sitemap.includes("/blog/guide/getting-started"), "sitemap 必须包含绝对多段文章地址");
assert(!sitemap.includes("/posts/") && !sitemap.includes("/404"), "sitemap 不得包含原稿或 404");

const robots = await readFile(join(dist, "robots.txt"), "utf8");
assert(robots.includes("User-agent: *") && robots.includes("Sitemap: https://"), "robots 规则或 sitemap 地址无效");

const manifest = JSON.parse(await readFile(join(dist, "site.webmanifest"), "utf8"));
assert(manifest.name && manifest.icons?.length && manifest.display === "standalone", "web manifest 内容无效");

for (const feedFile of ["rss.xml", "index.xml", "atom.xml", "feed.json"]) {
  const feed = await readFile(join(dist, feedFile), "utf8");
  assert(feed.includes("https://") && feed.includes("开始使用 Bean Blog"), `${feedFile} 缺少绝对文章内容`);
}

console.log(`Static build verification passed (${requiredFiles.length} required files)`);
