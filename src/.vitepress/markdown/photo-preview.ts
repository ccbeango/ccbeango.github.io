import type { MarkdownRenderer } from "vitepress";

const PHOTO_PREVIEW_CLASSES = "cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring";

export function photoPreviewPlugin(md: MarkdownRenderer) {
  const renderImage = md.renderer.rules.image
    ?? ((tokens, index, options, _env, self) => self.renderToken(tokens, index, options));

  md.renderer.rules.image = (tokens, index, options, env, self) => {
    const image = tokens[index];
    const alt = image.content.trim() || "图片";
    image.attrSet("data-photo-preview", "");
    image.attrSet("role", "button");
    image.attrSet("tabindex", "0");
    image.attrSet("aria-label", `预览图片：${alt}`);
    image.attrJoin("class", PHOTO_PREVIEW_CLASSES);
    return renderImage(tokens, index, options, env, self);
  };
}
