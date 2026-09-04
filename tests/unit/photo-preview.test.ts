import type { MarkdownRenderer } from "vitepress";
import { createMarkdownRenderer, disposeMdItInstance } from "vitepress";
import { beforeAll, describe, expect, it } from "vitest";
import { imageGridPlugin } from "../../src/.vitepress/markdown/image-grid.ts";
import { photoPreviewPlugin } from "../../src/.vitepress/markdown/photo-preview.ts";

let renderer: MarkdownRenderer;

beforeAll(async () => {
  renderer = await createMarkdownRenderer(process.cwd(), {
    image: { lazyLoad: true },
    container: {
      customContainers: {
        "image-grid": "图片布局",
      },
    },
    config(md) {
      md.use(imageGridPlugin);
      md.use(photoPreviewPlugin);
    },
  });
  disposeMdItInstance();
});

describe("photo preview Markdown plugin", () => {
  it("marks ordinary Markdown images as accessible preview triggers", async () => {
    const html = await renderer.renderAsync("![海边风景](/images/coast.jpg)");

    expect(html).toContain("data-photo-preview");
    expect(html).toContain('role="button"');
    expect(html).toContain('tabindex="0"');
    expect(html).toContain('aria-label="预览图片：海边风景"');
    expect(html).toContain("cursor-zoom-in");
    expect(html).toContain('loading="lazy"');
  });

  it("marks every image produced by image-grid without changing source order", async () => {
    const html = await renderer.renderAsync(
      ["::: image-grid r73", "![第一张](/images/one.jpg)", "", "![第二张](/images/two.jpg)", ":::"].join("\n"),
      { path: "preview-grid.md" },
    );

    expect(html.match(/data-photo-preview/g)).toHaveLength(2);
    expect(html.indexOf("one.jpg")).toBeLessThan(html.indexOf("two.jpg"));
    expect(html).toContain('data-image-grid="r73"');
  });
});
