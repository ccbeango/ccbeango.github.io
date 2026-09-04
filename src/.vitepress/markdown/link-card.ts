import type { MarkdownRenderer } from "vitepress";

const OPEN_TOKEN = "container_link-card_open";
const CLOSE_TOKEN = "container_link-card_close";

function hasExplicitClose(source: string, endLine: number | undefined, openingMarkup: string) {
  if (endLine === undefined) return false;
  const closingMarkup = source.split(/\r?\n/)[endLine]?.trim() ?? "";
  return /^:+$/.test(closingMarkup) && closingMarkup.length >= openingMarkup.length;
}

function escapeAttribute(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function isSupportedHref(href: string) {
  if (href.startsWith("/") && !href.startsWith("//")) return true;
  try {
    const url = new URL(href);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function linkCardPlugin(md: MarkdownRenderer) {
  md.core.ruler.push("link-card", (state) => {
    const fail = (message: string, tokenIndex: number): never => {
      const token = state.tokens[tokenIndex];
      const path =
        typeof state.env?.path === "string"
          ? state.env.path
          : typeof state.env?.relativePath === "string"
            ? state.env.relativePath
            : "Markdown";
      const line = token?.map ? `:${token.map[0] + 1}` : "";
      throw new Error(`[link-card] ${path}${line} ${message}`);
    };

    for (let index = 0; index < state.tokens.length; index += 1) {
      const opening = state.tokens[index];
      if (opening.type !== OPEN_TOKEN) continue;
      if (opening.info.trim() !== "link-card") {
        fail("起始行只能写 ::: link-card", index);
      }

      let closingIndex = -1;
      for (let cursor = index + 1; cursor < state.tokens.length; cursor += 1) {
        const candidate = state.tokens[cursor];
        if (candidate.type === OPEN_TOKEN) fail("不支持嵌套 link-card 区块", cursor);
        if (candidate.type === CLOSE_TOKEN) {
          closingIndex = cursor;
          break;
        }
      }
      if (closingIndex < 0 || !hasExplicitClose(state.src, opening.map?.[1], opening.markup)) {
        fail("缺少 ::: 结束标记", index);
      }

      const paragraphs: Array<(typeof state.tokens)[number]> = [];
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
          fail("区块内只允许一条 Markdown 链接和一段可选的纯文本说明", cursor);
        }
        paragraphs.push(inline);
        cursor += 3;
      }

      if (paragraphs.length < 1 || paragraphs.length > 2) {
        fail("区块必须包含一条 Markdown 链接，并且最多包含一段说明", index);
      }

      const linkChildren = paragraphs[0].children ?? [];
      const linkOpen = linkChildren[0];
      const linkClose = linkChildren.at(-1);
      if (linkOpen?.type !== "link_open" || linkClose?.type !== "link_close") {
        fail("第一段必须且只能是一条 Markdown 链接", index + 1);
      }
      const titleTokens = linkChildren.slice(1, -1);
      if (
        titleTokens.length === 0 ||
        titleTokens.some((token) => token.type !== "text" && token.type !== "code_inline")
      ) {
        fail("第一段必须且只能是一条 Markdown 链接，且链接文字必须是非空纯文本", index + 1);
      }
      const href = linkOpen.attrGet("href") ?? "";
      if (!isSupportedHref(href)) {
        fail("文章链接必须是站内绝对路径或完整的 http/https URL", index + 1);
      }
      const title = titleTokens
        .map((token) => token.content)
        .join("")
        .trim();
      if (!title) fail("链接文字不能为空", index + 1);

      let description = "";
      if (paragraphs[1]) {
        const descriptionTokens = paragraphs[1].children ?? [];
        if (
          descriptionTokens.length === 0 ||
          descriptionTokens.some(
            (token) => token.type !== "text" && token.type !== "softbreak" && token.type !== "hardbreak",
          )
        ) {
          fail("说明必须是非空纯文本", index + 4);
        }
        description = descriptionTokens
          .map((token) => (token.type === "softbreak" || token.type === "hardbreak" ? " " : token.content))
          .join("")
          .trim();
        if (!description) fail("说明不能为空", index + 4);
      }

      const replacement = new state.Token("html_block", "", 0);
      replacement.block = true;
      replacement.map = opening.map;
      replacement.content = `<LinkedCard href="${escapeAttribute(href)}" title="${escapeAttribute(title)}"${description ? ` description="${escapeAttribute(description)}"` : ""} />\n`;

      state.tokens.splice(index, closingIndex - index + 1, replacement);
    }
  });
}
