import type { MarkdownRenderer } from "vitepress";
import { createMarkdownRenderer, disposeMdItInstance } from "vitepress";
import { beforeAll, describe, expect, it } from "vitest";
import { linkCardPlugin } from "../../src/.vitepress/markdown/link-card.ts";

let renderer: MarkdownRenderer;

beforeAll(async () => {
  renderer = await createMarkdownRenderer(process.cwd(), {
    container: {
      customContainers: {
        "link-card": "文章引用",
      },
    },
    config(md) {
      md.use(linkCardPlugin);
    },
  });
  disposeMdItInstance();
});

function render(source: string) {
  return renderer.renderAsync(source, { path: "link-card-example.md" });
}

describe("link-card Markdown plugin", () => {
  it("renders a Markdown article link and optional description as the existing card", async () => {
    const html = await render(
      [
        "::: link-card",
        "[创建和组织文章](/blog/guide/writing-articles)",
        "",
        "查看路径、frontmatter、草稿和自动系列配置。",
        ":::",
      ].join("\n"),
    );

    expect(html).toContain(
      '<LinkedCard href="/blog/guide/writing-articles" title="创建和组织文章" description="查看路径、frontmatter、草稿和自动系列配置。" />',
    );
  });

  it("supports an external article without a description and escapes its URL", async () => {
    const html = await render("::: link-card\n[外部文章](https://example.com/post?id=1&lang=zh)\n:::");

    expect(html).toContain('<LinkedCard href="https://example.com/post?id=1&amp;lang=zh" title="外部文章" />');
  });

  it("keeps ordinary Markdown around the container intact", async () => {
    const html = await render(
      ["容器之前。", "", "::: link-card", "[相关文章](/blog/related)", ":::", "", "容器之后。"].join("\n"),
    );

    expect(html).toContain("<p>容器之前。</p>");
    expect(html).toContain("<LinkedCard");
    expect(html).toContain("<p>容器之后。</p>");
  });

  it.each([
    ["起始行参数", "::: link-card /blog/post\n[文章](/blog/post)\n:::", "起始行只能写"],
    ["缺少链接", "::: link-card\n:::", "必须包含一条 Markdown 链接"],
    ["第一段正文", "::: link-card\n这不是链接\n:::", "第一段必须且只能是"],
    ["多个链接", "::: link-card\n[一](/blog/one) [二](/blog/two)\n:::", "第一段必须且只能是"],
    ["相对路径", "::: link-card\n[文章](../post)\n:::", "站内绝对路径"],
    ["富文本说明", "::: link-card\n[文章](/blog/post)\n\n包含 **强调**。\n:::", "说明必须是非空纯文本"],
    ["多余段落", "::: link-card\n[文章](/blog/post)\n\n第一段。\n\n第二段。\n:::", "最多包含一段说明"],
    ["嵌套", "::: link-card\n::: link-card\n[文章](/blog/post)\n:::\n:::", "不支持嵌套 link-card"],
    ["缺少结束", "::: link-card\n[文章](/blog/post)", "缺少 ::: 结束标记"],
  ])("reports %s input with its source location", async (_name, source, message) => {
    await expect(render(source)).rejects.toThrow(new RegExp(`link-card-example\\.md:\\d+.*${message}`));
  });
});
