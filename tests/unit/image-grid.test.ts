import type { MarkdownRenderer } from "vitepress";
import { createMarkdownRenderer, disposeMdItInstance } from "vitepress";
import { beforeAll, describe, expect, it } from "vitest";
import { imageGridPlugin } from "../../src/.vitepress/markdown/image-grid.ts";

let enhanced: MarkdownRenderer;

beforeAll(async () => {
  enhanced = await createMarkdownRenderer(process.cwd(), {
    container: {
      customContainers: {
        "image-grid": "图片布局",
      },
    },
    config(md) {
      md.use(imageGridPlugin);
    },
  });
  disposeMdItInstance();
});

function render(renderer: MarkdownRenderer, source: string) {
  return renderer.renderAsync(source, {
    path: "image-grid-example.md",
  });
}

describe("image-grid Markdown plugin", () => {
  it.each([
    ["landscape", 3, "sm:grid-cols-3"],
    ["portrait", 3, "sm:grid-cols-3"],
    ["r73", 2, "sm:grid-cols-[9fr_4fr]"],
    ["r37", 2, "sm:grid-cols-[4fr_9fr]"],
    ["r64", 2, "sm:grid-cols-[16fr_9fr]"],
    ["r46", 2, "sm:grid-cols-[9fr_16fr]"],
  ])("renders %s layout", async (mode, count, layoutClass) => {
    const images = Array.from({ length: count }, (_, index) => `![图片 ${index + 1}](/images/${index + 1}.jpg)`).join(
      "\n\n",
    );
    const html = await render(enhanced, `::: image-grid ${mode}\n${images}\n:::`);

    expect(html).toContain(`data-image-grid="${mode}"`);
    expect(html.match(/<img /g)).toHaveLength(count);
    expect(html).toContain('loading="lazy"');
    expect(html).toContain("object-cover");
    expect(html).toContain(layoutClass);
  });

  it.each(["landscape", "portrait"])("renders four %s images as a two-column grid", async (mode) => {
    const images = Array.from({ length: 4 }, (_, index) => `![图片 ${index + 1}](/images/${index + 1}.jpg)`).join(
      "\n\n",
    );
    const html = await render(enhanced, `::: image-grid ${mode}\n${images}\n:::`);

    expect(html.match(/<img /g)).toHaveLength(4);
    expect(html).toContain("sm:grid-cols-2");
    expect(html).not.toContain("lg:grid-cols-4");
  });

  it("does not enhance the removed HTML comment syntax", async () => {
    const source = [
      "<!-- image-grid: r73 -->",
      "![第一张](/images/one.jpg)",
      "",
      "![第二张](/images/two.jpg)",
      "<!-- /image-grid -->",
    ].join("\n");
    const html = await render(enhanced, source);

    expect(html).not.toContain("data-image-grid");
    expect(html.match(/<img /g)).toHaveLength(2);
    expect(html.indexOf("one.jpg")).toBeLessThan(html.indexOf("two.jpg"));
  });

  it("reports invalid mode and content with source location", async () => {
    await expect(
      render(
        enhanced,
        ["::: image-grid unknown", "![第一张](/images/one.jpg)", "![第二张](/images/two.jpg)", ":::"].join("\n"),
      ),
    ).rejects.toThrow(/image-grid-example\.md:1.*不支持布局 unknown/);

    await expect(render(enhanced, ["::: image-grid r73", "这里不是图片。", ":::"].join("\n"))).rejects.toThrow(
      /区块内只允许普通 Markdown 图片/,
    );
  });

  it("reports missing mode, nesting, and missing close with source location", async () => {
    await expect(
      render(
        enhanced,
        ["::: image-grid", "![第一张](/images/one.jpg)", "![第二张](/images/two.jpg)", ":::"].join("\n"),
      ),
    ).rejects.toThrow(/image-grid-example\.md:1.*布局必须是/);

    await expect(
      render(
        enhanced,
        [
          "::: image-grid r73",
          "::: image-grid r37",
          "![第一张](/images/one.jpg)",
          "![第二张](/images/two.jpg)",
          ":::",
          ":::",
        ].join("\n"),
      ),
    ).rejects.toThrow(/image-grid-example\.md:2.*不支持嵌套 image-grid 区块/);

    await expect(
      render(enhanced, ["::: image-grid r73", "![第一张](/images/one.jpg)", "![第二张](/images/two.jpg)"].join("\n")),
    ).rejects.toThrow(/image-grid-example\.md:1.*缺少 ::: 结束标记/);
  });
});
