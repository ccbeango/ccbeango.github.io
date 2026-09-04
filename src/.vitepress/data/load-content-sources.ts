import type { ContentData } from "vitepress";
import { readFile } from "node:fs/promises";
import { relative } from "node:path";
import matter from "gray-matter";

export async function loadContentSources(files: string[], srcDir: string) {
  return Promise.all(
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
}
