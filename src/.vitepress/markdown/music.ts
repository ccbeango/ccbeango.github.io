import type { MarkdownRenderer } from "vitepress";

const OPEN_TOKEN = "container_music_open";
const CLOSE_TOKEN = "container_music_close";
const MOTUES_SERVERS = new Set(["netease", "tencent", "kugou", "baidu", "kuwo"]);

function hasExplicitClose(source: string, endLine: number | undefined, openingMarkup: string) {
  if (endLine === undefined) return false;
  const closingMarkup = source.split(/\r?\n/)[endLine]?.trim() ?? "";
  return /^:+$/.test(closingMarkup) && closingMarkup.length >= openingMarkup.length;
}

function escapeAttribute(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function parseRemoteAudioSource(source: string) {
  try {
    const url = new URL(source);
    return url.protocol === "https:" || url.protocol === "http:" ? url : undefined;
  } catch {
    return undefined;
  }
}

export function musicPlugin(md: MarkdownRenderer) {
  md.core.ruler.push("music", (state) => {
    const fail = (message: string, tokenIndex: number): never => {
      const token = state.tokens[tokenIndex];
      const path =
        typeof state.env?.path === "string"
          ? state.env.path
          : typeof state.env?.relativePath === "string"
            ? state.env.relativePath
            : "Markdown";
      const line = token?.map ? `:${token.map[0] + 1}` : "";
      throw new Error(`[music] ${path}${line} ${message}`);
    };

    for (let index = 0; index < state.tokens.length; index += 1) {
      const opening = state.tokens[index];
      if (opening.type !== OPEN_TOKEN) continue;

      const segments = opening.info.split("|").map((segment) => segment.trim());
      const [declaration = "", title = "", artist = ""] = segments;
      const [name, source, ...extra] = declaration.split(/\s+/);
      if (name !== "music" || !source || extra.length > 0) {
        fail("container 必须提供一个远程音频地址或 Motues details 地址", index);
      }
      const sourceUrl = parseRemoteAudioSource(source);
      if (!sourceUrl) {
        fail("音频地址必须是完整的 http 或 https 远程 URL", index);
      }
      let resolver: "motues" | "motues-details" | undefined;
      if (sourceUrl.hostname === "open.motues.top") {
        const server = sourceUrl.searchParams.get("server");
        const type = sourceUrl.searchParams.get("type");
        if (
          sourceUrl.pathname !== "/music" ||
          !sourceUrl.searchParams.get("id") ||
          (server !== null && !MOTUES_SERVERS.has(server)) ||
          (type !== "details" && type !== "url")
        ) {
          fail("Motues 地址必须使用 /music、受支持的 server、details 或 url type 以及非空 id", index);
        }
        if (type === "details") {
          if (segments.length !== 1) {
            fail("Motues details 模式会自动读取歌曲信息，不需要填写歌曲名和歌手", index);
          }
          resolver = "motues-details";
        } else {
          if (segments.length !== 3 || !title || !artist) {
            fail("Motues url 模式必须填写歌曲名和歌手", index);
          }
          resolver = "motues";
        }
      } else if (segments.length !== 3 || !title || !artist) {
        fail("远程音频直链必须使用 music <音频地址> | <歌曲名> | <歌手> 格式", index);
      }

      let closingIndex = -1;
      for (let cursor = index + 1; cursor < state.tokens.length; cursor += 1) {
        const candidate = state.tokens[cursor];
        if (candidate.type === OPEN_TOKEN) fail("不支持嵌套 music 区块", cursor);
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
          fail("区块内只允许一张可选的 Markdown 封面图片", cursor);
        }

        for (const child of inline.children ?? []) {
          if (child.type === "image") {
            images.push(child);
            continue;
          }
          if (child.type === "softbreak" || child.type === "hardbreak") continue;
          if (child.type === "text" && child.content.trim() === "") continue;
          fail("区块内只允许一张可选的 Markdown 封面图片", cursor + 1);
        }
        cursor += 3;
      }

      if (images.length > 1) fail("区块最多包含一张 Markdown 封面图片", index);

      const image = images[0];
      const cover = image?.attrGet("src");
      if (image && !cover) fail("封面图片缺少地址", index);
      const coverAlt = image?.content.trim() || (title ? `${title}的歌曲封面` : "歌曲封面");

      const replacement = new state.Token("html_block", "", 0);
      replacement.block = true;
      replacement.map = opening.map;
      replacement.content = `<MusicCard source="${escapeAttribute(source)}"${resolver ? ` resolver="${resolver}"` : ""}${title ? ` title="${escapeAttribute(title)}"` : ""}${artist ? ` artist="${escapeAttribute(artist)}"` : ""}${cover ? ` cover="${escapeAttribute(cover)}"` : ""} cover-alt="${escapeAttribute(coverAlt)}" />\n`;

      state.tokens.splice(index, closingIndex - index + 1, replacement);
    }
  });
}
