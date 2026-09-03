import type { PostData } from "./post-types.ts";
import { createContentLoader } from "vitepress";
import { preparePosts } from "./post-utils.ts";

export default createContentLoader("posts/**/*.md", {
  includeSrc: true,
  transform(entries) {
    return preparePosts(entries, {
      includeDrafts: process.env.NODE_ENV !== "production",
    }).map(({ html: _html, src: _src, ...post }) => post);
  },
});

export declare const data: PostData[];
