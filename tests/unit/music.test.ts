import type { MarkdownRenderer } from "vitepress";
import { createMarkdownRenderer, disposeMdItInstance } from "vitepress";
import { beforeAll, describe, expect, it } from "vitest";
import { musicPlugin } from "../../src/.vitepress/markdown/music.ts";

let renderer: MarkdownRenderer;

beforeAll(async () => {
  renderer = await createMarkdownRenderer(process.cwd(), {
    container: {
      customContainers: {
        music: "音乐",
      },
    },
    config(md) {
      md.use(musicPlugin);
    },
  });
  disposeMdItInstance();
});

function render(source: string) {
  return renderer.renderAsync(source, { path: "music-example.md" });
}

describe("music Markdown plugin", () => {
  it("renders a remote audio card with an optional Markdown cover", async () => {
    const html = await render(
      [
        "::: music https://media.example.com/song.mp3 | 夜航 | 示例歌手",
        "![夜航封面](https://images.example.com/night.jpg)",
        ":::",
      ].join("\n"),
    );

    expect(html).toContain(
      '<MusicCard source="https://media.example.com/song.mp3" title="夜航" artist="示例歌手" cover="https://images.example.com/night.jpg" cover-alt="夜航封面" />',
    );
    expect(html).not.toContain("<img ");
  });

  it("renders a Motues details card without manually entered metadata", async () => {
    const html = await render("::: music https://open.motues.top/music?server=netease&type=details&id=152392\n:::");

    expect(html).toContain(
      '<MusicCard source="https://open.motues.top/music?server=netease&amp;type=details&amp;id=152392" resolver="motues-details" cover-alt="歌曲封面" />',
    );
  });

  it("keeps the explicit Motues url form available", async () => {
    const html = await render("::: music https://open.motues.top/music?type=url&id=152392 | 讲不出再见 | 谭咏麟\n:::");

    expect(html).toContain(
      '<MusicCard source="https://open.motues.top/music?type=url&amp;id=152392" resolver="motues" title="讲不出再见" artist="谭咏麟" cover-alt="讲不出再见的歌曲封面" />',
    );
  });

  it("keeps ordinary Markdown and adjacent media containers intact", async () => {
    const html = await render(
      [
        "这里是正文。",
        "",
        "::: music https://media.example.com/song.mp3 | 夜航 | 示例歌手",
        ":::",
        "",
        "![普通图片](/images/plain.jpg)",
      ].join("\n"),
    );

    expect(html).toContain("这里是正文。");
    expect(html).toContain("<MusicCard");
    expect(html).toContain('<img src="/images/plain.jpg" alt="普通图片"');
  });

  it.each([
    ["本地地址", "::: music /media/song.mp3 | 夜航 | 示例歌手\n:::", "必须是完整的 http 或 https"],
    [
      "不支持的 Motues type",
      "::: music https://open.motues.top/music?server=netease&type=cover&id=152392\n:::",
      "details 或 url type",
    ],
    [
      "不支持的 Motues server",
      "::: music https://open.motues.top/music?server=unknown&type=details&id=152392\n:::",
      "受支持的 server",
    ],
    [
      "details 模式手填信息",
      "::: music https://open.motues.top/music?server=netease&type=details&id=152392 | 讲不出再见 | 谭咏麟\n:::",
      "会自动读取歌曲信息",
    ],
    ["缺少歌曲名", "::: music https://media.example.com/song.mp3 | | 示例歌手\n:::", "直链必须使用 music"],
    ["正文", "::: music https://media.example.com/song.mp3 | 夜航 | 示例歌手\n说明文字\n:::", "只允许一张可选"],
    [
      "多个封面",
      [
        "::: music https://media.example.com/song.mp3 | 夜航 | 示例歌手",
        "![一](https://images.example.com/one.jpg)",
        "",
        "![二](https://images.example.com/two.jpg)",
        ":::",
      ].join("\n"),
      "最多包含一张",
    ],
    [
      "嵌套",
      [
        "::: music https://media.example.com/one.mp3 | 第一首 | 示例歌手",
        "::: music https://media.example.com/two.mp3 | 第二首 | 示例歌手",
        ":::",
        ":::",
      ].join("\n"),
      "不支持嵌套 music",
    ],
    ["缺失结束", "::: music https://media.example.com/song.mp3 | 夜航 | 示例歌手", "缺少 ::: 结束标记"],
  ])("reports %s input with its source location", async (_name, source, message) => {
    await expect(render(source)).rejects.toThrow(new RegExp(`music-example\\.md:\\d+.*${message}`));
  });
});
