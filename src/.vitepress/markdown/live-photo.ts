import type { MarkdownRenderer } from "vitepress";

const OPEN_TOKEN = "container_live-photo_open";
const CLOSE_TOKEN = "container_live-photo_close";

function hasExplicitClose(source: string, endLine: number | undefined, openingMarkup: string) {
  if (endLine === undefined) return false;
  const closingMarkup = source.split(/\r?\n/)[endLine]?.trim() ?? "";
  return /^:+$/.test(closingMarkup) && closingMarkup.length >= openingMarkup.length;
}

function escapeAttribute(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function livePhotoPlugin(md: MarkdownRenderer) {
  md.core.ruler.push("live-photo", (state) => {
    const fail = (message: string, tokenIndex: number): never => {
      const token = state.tokens[tokenIndex];
      const path =
        typeof state.env?.path === "string"
          ? state.env.path
          : typeof state.env?.relativePath === "string"
            ? state.env.relativePath
            : "Markdown";
      const line = token?.map ? `:${token.map[0] + 1}` : "";
      throw new Error(`[live-photo] ${path}${line} ${message}`);
    };

    for (let index = 0; index < state.tokens.length; index += 1) {
      const opening = state.tokens[index];
      if (opening.type !== OPEN_TOKEN) continue;

      const [name, source, ...extra] = opening.info.trim().split(/\s+/);
      if (name !== "live-photo" || !source || extra.length > 0)
        fail("container 必须提供非空 MP4 地址或 android mode", index);

      let closingIndex = -1;
      for (let cursor = index + 1; cursor < state.tokens.length; cursor += 1) {
        const candidate = state.tokens[cursor];
        if (candidate.type === OPEN_TOKEN) {
          fail("不支持嵌套 live-photo 区块", cursor);
        }
        if (candidate.type === CLOSE_TOKEN) {
          closingIndex = cursor;
          break;
        }
      }
      if (closingIndex < 0 || !hasExplicitClose(state.src, opening.map?.[1], opening.markup)) {
        fail("缺少 ::: 结束标记", index);
      }

      const images: Array<(typeof state.tokens)[number]> = [];
      let cursor = index + 1;
      while (cursor < closingIndex) {
        const paragraphOpen = state.tokens[cursor];
        const inline = state.tokens[cursor + 1];
        const paragraphClose = state.tokens[cursor + 2];
        if (
          paragraphOpen?.type !== "paragraph_open" ||
          inline?.type !== "inline" ||
          paragraphClose?.type !== "paragraph_close"
        ) {
          fail("区块内只允许一张普通 Markdown 图片", cursor);
        }

        for (const child of inline.children ?? []) {
          if (child.type === "image") {
            images.push(child);
            continue;
          }
          if (child.type === "softbreak" || child.type === "hardbreak") continue;
          if (child.type === "text" && child.content.trim() === "") continue;
          fail("区块内只允许一张普通 Markdown 图片", cursor + 1);
        }
        cursor += 3;
      }

      if (images.length !== 1) {
        fail("区块必须包含一张普通 Markdown 图片", index);
      }

      const image = images[0];
      const poster = image.attrGet("src");
      if (!poster) fail("图片缺少地址", index);
      const posterUrl = poster as string;

      const replacement = new state.Token("html_block", "", 0);
      replacement.block = true;
      replacement.map = opening.map;
      replacement.content =
        source.toLowerCase() === "android"
          ? `<LivePhoto mode="android" poster="${escapeAttribute(posterUrl)}" android-source="${escapeAttribute(posterUrl)}" alt="${escapeAttribute(image.content)}" />\n`
          : `<LivePhoto poster="${escapeAttribute(posterUrl)}" video="${escapeAttribute(source)}" alt="${escapeAttribute(image.content)}" />\n`;

      state.tokens.splice(index, closingIndex - index + 1, replacement);
    }
  });
}
