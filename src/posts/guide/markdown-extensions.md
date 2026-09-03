---
title: 使用 Markdown 扩展
date: 2026-08-30
summary: 通过可直接运行的示例使用 GFM、数学公式、代码块、容器、Alerts、Code Groups 和内容组件。
description: Bean Blog 支持的 VitePress 官方 Markdown 扩展及完整语法示例。
keywords:
  - VitePress Markdown
  - Custom Containers
  - Code Groups
series:
  name: 内容写作
  order: 2
  sidebar: Bean Blog 使用手册
  sidebarOrder: 2
tags:
  - 使用手册
  - Markdown
  - VitePress
draft: false
---

文章默认支持标准 Markdown、VitePress 官方扩展和少量已注册的 Vue 内容组件。本页中的示例就是当前主题的真实渲染结果，也由自动化测试直接验证。

[[toc]]

## 表格与任务列表

GFM 表格和任务列表无需额外配置：

| 能力 | 构建阶段 | 浏览器阶段 |
| --- | --- | --- |
| 代码高亮 | Shiki | 复制按钮 |
| 搜索 | 索引生成 | 本地匹配 |
| 目录 | 标题提取 | 章节跟踪 |

- [x] 写作内容与公开路由解耦
- [x] 生产环境排除草稿
- [ ] 发布前替换正式域名

## 数学公式

行内公式 $E = mc^2$ 可以直接出现在段落中。块级公式使用成对的 `$$`，在窄屏中会限制在正文宽度内：

$$
T(n) = T(n - 1) + O(1) = O(n)
$$

## 代码块

fenced code block 只需要声明语言。高亮、语言标签和复制行为均由 VitePress 与 Shiki 提供：

```ts
interface Post {
  title: string;
  slug: string;
  draft?: boolean;
}

const published = (posts: Post[]) => posts.filter(post => !post.draft);
```

## Custom Containers

基础容器包括 `info`、`tip`、`warning`、`danger` 和原生可展开的 `details`。默认标题已经配置为中文。

### 默认标题

::: info
适合补充背景、上下文或中性说明。
:::

::: tip
适合给出建议、最佳实践或更便捷的做法。
:::

::: warning
适合提醒需要留意但仍可继续的情况。
:::

::: danger
适合说明可能造成数据丢失或不可逆影响的操作。
:::

::: details
这是浏览器原生的可展开内容，默认保持收起。
:::

### 自定义标题

在容器类型后直接添加标题：

::: danger 停止
危险区域，请先确认影响范围再继续。
:::

::: details 点击查看代码
```ts
const message = "Hello, VitePress!";
```
:::

## GitHub Alerts

GitHub 风格 Alerts 支持 `NOTE`、`TIP`、`IMPORTANT`、`WARNING` 和 `CAUTION`：

> [!NOTE]
> 用于补充读者应该了解的信息。

> [!TIP]
> 用于帮助读者更顺利地完成操作。

> [!IMPORTANT]
> 用于强调完成目标所必需的信息。

> [!WARNING]
> 用于提示需要立即关注的风险。

> [!CAUTION]
> 用于说明某个操作可能带来的负面后果。

## Code Groups

Code Group 使用带标题的 fenced code block，标签切换由 VitePress 客户端处理：

::: code-group

```sh [pnpm]
pnpm dev
```

```sh [npm]
npm run dev
```

:::

## 代码行状态

行高亮、focus、diff、error 和 warning 使用 VitePress/Shiki 标记：

```ts {2}
const stable = true;
const focused = true; // [!code focus]
const added = "new"; // [!code ++]
const removed = "old"; // [!code --]
const invalid = false; // [!code error]
const pending = true; // [!code warning]
```

## 标题锚点与内部链接

二级和三级标题由 VitePress 自动生成锚点。点击标题左侧的 `#` 或右侧本文目录后，URL hash 会更新，固定页头也不会遮挡目标标题。

普通内部链接使用公开 `/blog` 地址。需要显示更完整的入口时，可以使用已注册的 `LinkedCard`：

<LinkedCard href="/blog/guide/writing-articles" title="创建和组织文章" description="查看路径、frontmatter、草稿和自动系列配置。" />

不要在 Markdown 中任意引入 Vue 组件。新增内容组件时，应在 theme `enhanceApp` 中注册，并补充 renderer 和浏览器测试。

## 普通图片

普通图片继续使用标准 Markdown 语法，并提供有意义的 alt：

![Markdown 图片演示](/media/live-photo-sample-poster.png)

VitePress 会为正文图片增加原生 `loading="lazy"`。多张图片的组合方式见[编排多图布局](/blog/guide/image-layouts)。
