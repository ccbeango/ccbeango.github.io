import type { MarkdownRenderer } from "vitepress";

const MODES = ["landscape", "portrait", "r73", "r37", "r64", "r46"] as const;
type ImageGridMode = typeof MODES[number];

const OPEN_TOKEN = "container_image-grid_open";
const CLOSE_TOKEN = "container_image-grid_close";
const modeSet = new Set<string>(MODES);

const GRID_BASE_CLASSES = "not-prose my-8 grid w-full grid-cols-1 gap-3 sm:gap-4";
const GRID_MODE_CLASSES: Record<ImageGridMode, string> = {
  landscape: "",
  portrait: "",
  r73: "sm:grid-cols-[9fr_4fr]",
  r37: "sm:grid-cols-[4fr_9fr]",
  r64: "sm:grid-cols-[16fr_9fr]",
  r46: "sm:grid-cols-[9fr_16fr]",
};
const EQUAL_GRID_CLASSES: Record<2 | 3 | 4, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-2",
};
const GRID_ITEM_BASE_CLASSES = "m-0 min-w-0 overflow-hidden rounded-md bg-muted";
const GRID_ITEM_MODE_CLASSES: Record<ImageGridMode, readonly string[]> = {
  landscape: ["aspect-landscape"],
  portrait: ["aspect-portrait"],
  r73: ["aspect-wide", "aspect-tall"],
  r37: ["aspect-tall", "aspect-wide"],
  r64: ["aspect-landscape", "aspect-portrait"],
  r46: ["aspect-portrait", "aspect-landscape"],
};
const GRID_IMAGE_CLASSES = "m-0 block h-full w-full object-cover";

function hasExplicitClose(source: string, endLine: number | undefined, openingMarkup: string) {
  if (endLine === undefined)
    return false;
  const closingMarkup = source.split(/\r?\n/)[endLine]?.trim() ?? "";
  return /^:+$/.test(closingMarkup) && closingMarkup.length >= openingMarkup.length;
}

export function imageGridPlugin(md: MarkdownRenderer) {
  md.core.ruler.push("image-grid", (state) => {
    const fail = (message: string, tokenIndex: number): never => {
      const token = state.tokens[tokenIndex];
      const path = typeof state.env?.path === "string"
        ? state.env.path
        : typeof state.env?.relativePath === "string"
          ? state.env.relativePath
          : "Markdown";
      const line = token?.map ? `:${token.map[0] + 1}` : "";
      throw new Error(`[image-grid] ${path}${line} ${message}`);
    };

    for (let index = 0; index < state.tokens.length; index += 1) {
      const opening = state.tokens[index];
      if (opening.type !== OPEN_TOKEN)
        continue;

      const [name, rawMode, ...extra] = opening.info.trim().split(/\s+/);
      if (name !== "image-grid" || !rawMode || extra.length > 0)
        fail(`布局必须是 ${MODES.join(", ")} 之一`, index);
      const mode = rawMode.toLowerCase();
      if (!modeSet.has(mode)) {
        fail(`不支持布局 ${mode}，可用布局为 ${MODES.join(", ")}`, index);
      }

      let closingIndex = -1;
      for (let cursor = index + 1; cursor < state.tokens.length; cursor += 1) {
        const candidate = state.tokens[cursor];
        if (candidate.type === OPEN_TOKEN) {
          fail("不支持嵌套 image-grid 区块", cursor);
        }
        if (candidate.type === CLOSE_TOKEN) {
          closingIndex = cursor;
          break;
        }
      }
      if (
        closingIndex < 0
        || !hasExplicitClose(state.src, opening.map?.[1], opening.markup)
      ) {
        fail("缺少 ::: 结束标记", index);
      }

      const images: Array<{ token: (typeof state.tokens)[number]; map: [number, number] | null }> = [];
      let cursor = index + 1;
      while (cursor < closingIndex) {
        const paragraphOpen = state.tokens[cursor];
        const inline = state.tokens[cursor + 1];
        const paragraphClose = state.tokens[cursor + 2];
        if (
          paragraphOpen?.type !== "paragraph_open"
          || inline?.type !== "inline"
          || paragraphClose?.type !== "paragraph_close"
        ) {
          fail("区块内只允许普通 Markdown 图片", cursor);
        }

        for (const child of inline.children ?? []) {
          if (child.type === "image") {
            images.push({ token: child, map: inline.map });
            continue;
          }
          if (child.type === "softbreak" || child.type === "hardbreak")
            continue;
          if (child.type === "text" && child.content.trim() === "")
            continue;
          fail("区块内只允许普通 Markdown 图片和换行", cursor + 1);
        }
        cursor += 3;
      }

      const typedMode = mode as ImageGridMode;
      const isRatioLayout = typedMode.startsWith("r");
      if (isRatioLayout && images.length !== 2) {
        fail(`${typedMode} 布局必须包含 2 张图片`, index);
      }
      if (!isRatioLayout && (images.length < 2 || images.length > 4)) {
        fail(`${typedMode} 布局必须包含 2 至 4 张图片`, index);
      }

      const gridOpen = new state.Token("image_grid_open", "figure", 1);
      gridOpen.block = true;
      gridOpen.map = opening.map;
      const equalGridClass = isRatioLayout
        ? ""
        : EQUAL_GRID_CLASSES[images.length as 2 | 3 | 4];
      gridOpen.attrSet(
        "class",
        [GRID_BASE_CLASSES, GRID_MODE_CLASSES[typedMode], equalGridClass].filter(Boolean).join(" "),
      );
      gridOpen.attrSet("data-image-grid", typedMode);

      const replacement = [gridOpen];
      images.forEach(({ token: image, map }, imageIndex) => {
        const itemOpen = new state.Token("image_grid_item_open", "p", 1);
        itemOpen.block = true;
        itemOpen.map = map;
        const modeClasses = GRID_ITEM_MODE_CLASSES[typedMode];
        const itemModeClass = modeClasses.length === 1 ? modeClasses[0] : modeClasses[imageIndex];
        itemOpen.attrSet("class", `${GRID_ITEM_BASE_CLASSES} ${itemModeClass}`);

        image.attrJoin("class", GRID_IMAGE_CLASSES);
        if (!image.attrGet("loading"))
          image.attrSet("loading", "lazy");
        if (!image.attrGet("decoding"))
          image.attrSet("decoding", "async");

        const inline = new state.Token("inline", "", 0);
        inline.content = image.content;
        inline.children = [image];
        inline.map = map;

        const itemClose = new state.Token("image_grid_item_close", "p", -1);
        itemClose.block = true;
        replacement.push(itemOpen, inline, itemClose);
      });

      const gridClose = new state.Token("image_grid_close", "figure", -1);
      gridClose.block = true;
      gridClose.map = state.tokens[closingIndex].map;
      replacement.push(gridClose);

      state.tokens.splice(index, closingIndex - index + 1, ...replacement);
      index += replacement.length - 1;
    }
  });
}
