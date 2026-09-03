import type { MarkdownRenderer } from "vitepress";
import { createMarkdownRenderer, disposeMdItInstance } from "vitepress";
import { beforeAll, describe, expect, it } from "vitest";
import { videoPlugin } from "../../src/.vitepress/markdown/video.ts";

let renderer: MarkdownRenderer;

beforeAll(async () => {
  renderer = await createMarkdownRenderer(process.cwd(), {
    container: {
      customContainers: {
        video: "视频",
      },
    },
    config(md) {
      md.use(videoPlugin);
    },
  });
  disposeMdItInstance();
});

function render(source: string) {
  return renderer.renderAsync(source, { path: "video-example.md" });
}

describe("video Markdown plugin", () => {
  it("renders a video player with an optional Markdown poster", async () => {
    const html = await render(
      ["::: video /media/travel.mp4", "![旅途中的风景](/images/travel-poster.jpg)", ":::"].join("\n"),
    );

    expect(html).toContain(
      '<VideoPlayer source="/media/travel.mp4" poster="/images/travel-poster.jpg" title="旅途中的风景" />',
    );
    expect(html).not.toContain("<img ");
  });

  it("renders a video player without a poster", async () => {
    const html = await render("::: video https://media.example.com/travel.webm\n:::");

    expect(html).toContain('<VideoPlayer source="https://media.example.com/travel.webm" title="视频播放器" />');
  });

  it.each([
    ["缺少地址", "::: video\n:::", "必须提供一个非空视频地址"],
    ["额外参数", "::: video /media/a.mp4 extra\n:::", "必须提供一个非空视频地址"],
    ["正文", "::: video /media/a.mp4\n这里是正文。\n:::", "只允许一张可选的 Markdown 封面图片"],
    [
      "多个封面",
      "::: video /media/a.mp4\n![一](/images/one.jpg)\n\n![二](/images/two.jpg)\n:::",
      "最多包含一张 Markdown 封面图片",
    ],
    ["嵌套", "::: video /media/a.mp4\n::: video /media/b.mp4\n:::\n:::", "不支持嵌套 video 区块"],
    ["缺失结束", "::: video /media/a.mp4", "缺少 ::: 结束标记"],
  ])("reports %s input with its source location", async (_name, source, message) => {
    await expect(render(source)).rejects.toThrow(new RegExp(`video-example\\.md:\\d+.*${message}`));
  });
});
