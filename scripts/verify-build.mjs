import { access, readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const root = fileURLToPath(new URL("../", import.meta.url));
const dist = join(root, "src", ".vitepress", "dist");
const requiredFiles = [
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

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const files = await walk(dist);
const relativeFiles = files.map((file) => relative(dist, file).replace(/\\/g, "/"));
const publicTextFiles = files.filter((file) => /\.(?:html|xml|json|txt)$/.test(file));
const publicText = (await Promise.all(publicTextFiles.map((file) => readFile(file, "utf8")))).join("\n");

assert(!relativeFiles.some((file) => file.startsWith("posts/")), "构建产物不得暴露 /posts 源稿路由");
assert(
  !relativeFiles.some((file) => file.startsWith("moments/") && file.endsWith(".html")),
  "构建产物不得暴露 /moments 源稿路由",
);
assert(!relativeFiles.some((file) => file.startsWith("moment/page/")), "动态页面不得生成分页路由");

const sourcePosts = await walk(join(root, "src", "posts"));
const draftTitles = (
  await Promise.all(
    sourcePosts.filter((file) => file.endsWith(".md")).map(async (file) => matter(await readFile(file, "utf8")).data),
  )
)
  .filter((data) => data.draft === true && typeof data.title === "string")
  .map((data) => data.title);
for (const title of draftTitles) {
  assert(!publicText.includes(title), `构建产物不得包含草稿：${title}`);
}

const articleFile = relativeFiles.find((file) => /^blog\/(?!index\.html|page\/).+\.html$/.test(file));
if (articleFile) {
  const article = await readFile(join(dist, articleFile), "utf8");
  for (const token of ['rel="canonical"', 'property="og:title"', 'name="twitter:card"', 'rel="manifest"']) {
    assert(article.includes(token), `文章缺少元数据：${token}`);
  }
}

const sitemap = await readFile(join(dist, "sitemap.xml"), "utf8");
assert(sitemap.includes("https://"), "sitemap 必须包含绝对地址");
assert(!sitemap.includes("/posts/") && !sitemap.includes("/404"), "sitemap 不得包含源稿或 404 路由");
assert(!sitemap.includes("/moment/page/") && !sitemap.includes("#moment-"), "sitemap 不得包含动态分页或 fragment");

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

console.log(`Static build verification passed (${requiredFiles.length} required files)`);
