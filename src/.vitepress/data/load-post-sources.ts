import type { ContentData } from "vitepress";
import { readFile } from "node:fs/promises";
import { relative } from "node:path";
import matter from "gray-matter";
import { preparePosts } from "./post-utils.ts";

export async function loadPostSources(files: string[], srcDir: string, options: { includeDrafts?: boolean } = {}) {
  const entries = await Promise.all(
    files.map(async (file): Promise<ContentData> => {
      const source = await readFile(file, "utf8");
      const parsed = matter(source);
      const relativePath = relative(srcDir, file).replace(/\\/g, "/");
      return {
        url: `/${relativePath.replace(/\.md$/, "")}`,
        src: parsed.content,
        html: undefined,
        excerpt: undefined,
        frontmatter: parsed.data,
      };
    }),
  );
  return preparePosts(entries, options);
}
