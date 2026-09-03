import type { MarkdownRenderer } from "vitepress";
import {
  createMarkdownRenderer,
  disposeMdItInstance,

} from "vitepress";
import { beforeAll, describe, expect, it } from "vitest";
import { imageGridPlugin } from "../../src/.vitepress/markdown/image-grid.ts";
import { livePhotoPlugin } from "../../src/.vitepress/markdown/live-photo.ts";

let enhanced: MarkdownRenderer;

beforeAll(async () => {
  enhanced = await createMarkdownRenderer(process.cwd(), {
    container: {
      customContainers: {
        "image-grid": "图片布局",
        "live-photo": "Live Photo",
      },
    },
    config(md) {
      md.use(imageGridPlugin);
      md.use(livePhotoPlugin);
    },
  });
  disposeMdItInstance();
});

function render(renderer: MarkdownRenderer, source: string) {
  return renderer.renderAsync(source, {
    path: "live-photo-example.md",
  });
}

const validBlock = [
  "::: live-photo /media/lake.mp4",
  "![湖面的倒影](/images/lake.jpg)",
  ":::",
].join("\n");

const androidBlock = [
  "::: live-photo android",
  "![清晨的街道](/live-images/motion-photo.jpg)",
  ":::",
].join("\n");

describe("live-photo Markdown plugin", () => {
  it("renders a LivePhoto component from a static poster and MP4", async () => {
    const html = await render(enhanced, validBlock);

    expect(html).toContain("<LivePhoto poster=\"/images/lake.jpg\" video=\"/media/lake.mp4\" alt=\"湖面的倒影\" />");
    expect(html).not.toContain("<img ");
  });

  it("uses the Android Motion Photo JPEG as both poster and source", async () => {
    const html = await render(enhanced, androidBlock);

    expect(html).toContain("<LivePhoto mode=\"android\" poster=\"/live-images/motion-photo.jpg\" android-source=\"/live-images/motion-photo.jpg\" alt=\"清晨的街道\" />");
    expect(html).not.toContain("<img ");
  });

  it("does not enhance the removed HTML comment syntax", async () => {
    const html = await render(enhanced, [
      "<!-- live-photo: android -->",
      "![清晨的街道](/live-images/motion-photo.jpg)",
      "<!-- /live-photo -->",
    ].join("\n"));

    expect(html).toContain("<img src=\"/live-images/motion-photo.jpg\" alt=\"清晨的街道\"");
    expect(html).not.toContain("LivePhoto");
  });

  it("keeps both modes, adjacent Markdown images, and image grids intact", async () => {
    const html = await render(enhanced, [
      "![普通图片](/images/plain.jpg)",
      "",
      validBlock,
      "",
      androidBlock,
      "",
      "::: image-grid r73",
      "![第一张](/images/one.jpg)",
      "",
      "![第二张](/images/two.jpg)",
      ":::",
    ].join("\n"));

    expect(html).toContain("/images/plain.jpg");
    expect(html.match(/<LivePhoto/g)).toHaveLength(2);
    expect(html).toContain("mode=\"android\"");
    expect(html).toContain("data-image-grid=\"r73\"");
  });

  it.each([
    ["缺失 mode", "::: live-photo\n![图片](/images/one.jpg)\n:::", "必须提供非空 MP4 地址或 android mode"],
    ["Android mode 带有额外参数", "::: live-photo android /media/a.mp4\n![图片](/images/one.jpg)\n:::", "必须提供非空 MP4 地址或 android mode"],
    ["空区块", "::: live-photo /media/a.mp4\n:::", "必须包含一张普通 Markdown 图片"],
    ["正文", "::: live-photo /media/a.mp4\n这里是正文。\n:::", "区块内只允许一张普通 Markdown 图片"],
    ["多张图片", "::: live-photo /media/a.mp4\n![一](/images/one.jpg)\n\n![二](/images/two.jpg)\n:::", "必须包含一张普通 Markdown 图片"],
    ["嵌套", "::: live-photo /media/a.mp4\n::: live-photo /media/b.mp4\n![图片](/images/one.jpg)\n:::\n:::", "不支持嵌套 live-photo 区块"],
    ["缺失结束", "::: live-photo /media/a.mp4\n![图片](/images/one.jpg)", "缺少 ::: 结束标记"],
  ])("reports %s input with its source location", async (_name, source, message) => {
    await expect(render(enhanced, source)).rejects.toThrow(new RegExp(`live-photo-example\\.md:\\d+.*${message}`));
  });
});
