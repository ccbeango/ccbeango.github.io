import type { MomentData } from "./moment-types.ts";
import type { MarkdownEnv } from "vitepress";
import { createContentLoader, createMarkdownRenderer } from "vitepress";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  getMomentContentImages,
  getMomentRichMedia,
  momentContentPlugin,
  momentRichMediaContainers,
} from "../markdown/moment-content.ts";
import { linkCardPlugin } from "../markdown/link-card.ts";
import { livePhotoPlugin } from "../markdown/live-photo.ts";
import { musicPlugin } from "../markdown/music.ts";
import { videoPlugin } from "../markdown/video.ts";
import { prepareMoments } from "./moment-utils.ts";

const srcDir = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const momentParser = createMarkdownRenderer(srcDir, {
  container: {
    customContainers: momentRichMediaContainers,
  },
  config(md) {
    md.use(momentContentPlugin);
    md.use(linkCardPlugin);
    md.use(livePhotoPlugin);
    md.use(musicPlugin);
    md.use(videoPlugin);
  },
});

export default createContentLoader("moments/**/*.md", {
  includeSrc: true,
  render: true,
  async transform(entries) {
    const md = await momentParser;
    const entriesWithBodyImages = entries.map((entry) => {
      const relativePath = `${entry.url.replace(/^\//, "")}.md`;
      const env: MarkdownEnv = { path: relativePath, relativePath, cleanUrls: true };
      md.parse(entry.src ?? "", env);
      const bodyImages = getMomentContentImages(env);
      const momentMedia = getMomentRichMedia(env);
      if (!bodyImages.length && !momentMedia.length) return entry;
      return {
        ...entry,
        ...(bodyImages.length ? { frontmatter: { ...entry.frontmatter, images: bodyImages } } : {}),
        ...(momentMedia.length ? { momentMedia } : {}),
      };
    });

    return prepareMoments(entriesWithBodyImages, {
      includeDrafts: process.env.NODE_ENV !== "production",
    });
  },
});

export declare const data: MomentData[];
