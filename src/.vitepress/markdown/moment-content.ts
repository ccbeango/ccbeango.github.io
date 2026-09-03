import type { MomentContentBlock, MomentImage, MomentRichMedia } from "../data/moment-types.ts";
import type { MarkdownRenderer } from "vitepress";

type MarkdownToken = ReturnType<MarkdownRenderer["parse"]>[number];

const momentImagesKey = "__beanMomentImages";
const momentRichMediaMetaKey = "__beanMomentRichMedia";
export const momentRichMediaContainers = {
  "link-card": "文章引用",
  music: "音乐",
  video: "视频",
  "live-photo": "Live Photo",
} as const;
const supportedContainerCloseTokens = new Map([
  ["container_link-card_open", "container_link-card_close"],
  ["container_music_open", "container_music_close"],
  ["container_video_open", "container_video_close"],
  ["container_live-photo_open", "container_live-photo_close"],
]);

type MomentContentEnvironment = Record<string, unknown> & {
  [momentImagesKey]?: MomentImage[];
};

type MomentRichMediaMetadata = Record<string, unknown> & {
  [momentRichMediaMetaKey]?: MomentRichMedia;
};

function momentPath(env: unknown) {
  if (!env || typeof env !== "object") return;
  const record = env as Record<string, unknown>;
  const path = typeof record.relativePath === "string" ? record.relativePath : record.path;
  if (typeof path !== "string") return;
  return path.replace(/\\/g, "/");
}

function containsImage(token: MarkdownToken): boolean {
  return token.type === "image" || Boolean(token.children?.some(containsImage));
}

function supportedContainerTokenIndexes(tokens: MarkdownToken[]) {
  const indexes = new Set<number>();

  for (let index = 0; index < tokens.length; index += 1) {
    const opening = tokens[index];
    const closeType = supportedContainerCloseTokens.get(opening.type);
    if (!closeType) continue;

    let depth = 0;
    let closingIndex = tokens.length - 1;
    for (let cursor = index; cursor < tokens.length; cursor += 1) {
      const token = tokens[cursor];
      if (token.type === opening.type) depth += 1;
      if (token.type === closeType && --depth === 0) {
        closingIndex = cursor;
        break;
      }
    }
    for (let cursor = index; cursor <= closingIndex; cursor += 1) indexes.add(cursor);
  }

  return indexes;
}

function tokenLine(token: MarkdownToken) {
  return token.map ? `:${token.map[0] + 1}` : "";
}

function fail(path: string, token: MarkdownToken, message: string): never {
  throw new Error(`[moment-content] ${path}${tokenLine(token)} ${message}`);
}

function extractImageParagraph(
  md: MarkdownRenderer,
  token: MarkdownToken,
  path: string,
  env: unknown,
): MomentImage[] | undefined {
  const children = token.children ?? [];
  if (!children.some(containsImage)) return;

  const images: MomentImage[] = [];
  for (const child of children) {
    if (child.type === "softbreak" || child.type === "hardbreak") continue;
    if (child.type === "text" && !child.content.trim()) continue;
    if (child.type !== "image") {
      fail(path, token, "动态正文图片必须位于不含文字、链接或其他内容的独立段落中");
    }
    if (child.attrGet("title") !== null) {
      fail(path, token, "动态正文图片不支持 title，请只保留图片路径和替代文本");
    }

    const src = child.attrGet("src")?.trim();
    const alt = md.renderer.renderInlineAsText(child.children ?? [], md.options, env).trim();
    if (!src) fail(path, token, "动态正文图片必须提供非空路径");
    if (!alt) fail(path, token, "动态正文图片必须提供非空替代文本 alt");
    images.push({ src, alt });
  }
  return images;
}

export function getMomentContentImages(env: object) {
  return (env as MomentContentEnvironment)[momentImagesKey] ?? [];
}

export function addMomentRichMedia(env: unknown, token: MarkdownToken, media: MomentRichMedia) {
  if (!momentPath(env)?.match(/(?:^|\/)moments\//)) return false;
  const metadata: MomentRichMediaMetadata = token.meta && typeof token.meta === "object" ? token.meta : {};
  metadata[momentRichMediaMetaKey] = media;
  token.meta = metadata;
  return true;
}

function richMediaFromToken(token: MarkdownToken) {
  if (!token.meta || typeof token.meta !== "object") return;
  return (token.meta as MomentRichMediaMetadata)[momentRichMediaMetaKey];
}

export function renderMomentContentBlocks(
  md: MarkdownRenderer,
  tokens: MarkdownToken[],
  env: object,
): MomentContentBlock[] {
  const blocks: MomentContentBlock[] = [];
  let htmlTokens: MarkdownToken[] = [];

  const flushHtml = () => {
    if (!htmlTokens.length) return;
    const html = md.renderer.render(htmlTokens, md.options, env);
    if (html.trim()) blocks.push({ type: "html", html });
    htmlTokens = [];
  };

  for (const token of tokens) {
    const media = richMediaFromToken(token);
    if (!media) {
      htmlTokens.push(token);
      continue;
    }
    flushHtml();
    blocks.push(media);
  }
  flushHtml();
  return blocks;
}

export function momentContentPlugin(md: MarkdownRenderer) {
  md.core.ruler.push("moment-content", (state) => {
    const path = momentPath(state.env);
    if (!path || !/(?:^|\/)moments\//.test(path)) return;

    const env = state.env as MomentContentEnvironment;
    env[momentImagesKey] = [];

    const images: MomentImage[] = [];
    const richMediaTokens = supportedContainerTokenIndexes(state.tokens);
    let galleryStart = state.tokens.length;
    let cursor = state.tokens.length;
    while (cursor >= 3) {
      const open = state.tokens[cursor - 3];
      const inline = state.tokens[cursor - 2];
      const close = state.tokens[cursor - 1];
      if (open.type !== "paragraph_open" || inline.type !== "inline" || close.type !== "paragraph_close") break;

      const paragraphImages = extractImageParagraph(md, inline, path, state.env);
      if (!paragraphImages?.length) break;
      images.unshift(...paragraphImages);
      galleryStart = cursor - 3;
      cursor -= 3;
    }

    const earlierImage = state.tokens
      .slice(0, galleryStart)
      .find((token, index) => !richMediaTokens.has(index) && containsImage(token));
    if (earlierImage) {
      fail(path, earlierImage, "动态正文图片必须集中放在正文末尾，并使用独立的纯图片段落");
    }
    if (!images.length) return;

    const frontmatterImages = (state.env as { frontmatter?: Record<string, unknown> }).frontmatter?.images;
    if (frontmatterImages !== undefined && (!Array.isArray(frontmatterImages) || frontmatterImages.length > 0)) {
      fail(path, state.tokens[galleryStart], "不能同时使用正文图片和 frontmatter images");
    }
    if (images.length > 9) fail(path, state.tokens[galleryStart], "动态正文最多只能提供 9 张图片");

    state.tokens.splice(galleryStart);
    env[momentImagesKey] = images;
  });
}
