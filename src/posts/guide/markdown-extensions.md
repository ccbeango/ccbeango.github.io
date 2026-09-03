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

| 能力     | 构建阶段 | 浏览器阶段 |
| -------- | -------- | ---------- |
| 代码高亮 | Shiki    | 复制按钮   |
| 搜索     | 索引生成 | 本地匹配   |
| 目录     | 标题提取 | 章节跟踪   |

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

普通内部链接使用公开 `/blog` 地址。需要显示更完整的文章引用时，使用 `link-card` 容器。第一段必须是一条标准 Markdown 链接，链接文字会成为卡片标题；第二段可以提供一段纯文本说明：

```md
::: link-card
[创建和组织文章](/blog/guide/writing-articles)

查看路径、frontmatter、草稿和自动系列配置。
:::
```

下面是同一语法的实际渲染结果：

::: link-card
[创建和组织文章](/blog/guide/writing-articles)

查看路径、frontmatter、草稿和自动系列配置。
:::

说明段可以省略。链接支持站内绝对路径和完整的 HTTP/HTTPS 地址；站内路径会自动应用 VitePress `base`。起始行不能附加参数，区块内也不能加入多条链接、富文本或嵌套容器。不要在 Markdown 中直接写 Vue 组件。

## 普通图片

普通图片继续使用标准 Markdown 语法，并提供有意义的 alt：

![Markdown 图片演示](/media/live-photo-sample-poster.png)

VitePress 会为正文图片增加原生 `loading="lazy"`。多张图片的组合方式见[编排多图布局](/blog/guide/image-layouts)。

## 视频

通用视频使用 `::: video <视频地址>`。播放器提供浏览器原生 controls、全屏和移动端内联播放，不会自动播放：

```md
::: video /media/live-photo-sample.mp4
![海边风景视频](/media/live-photo-sample-poster.png)
:::
```

下面是同一语法的实际渲染结果：

::: video /media/live-photo-sample.mp4
![海边风景视频](/media/live-photo-sample-poster.png)
:::

封面图片可以省略：

```md
::: video https://media.example.com/travel.webm
:::
```

视频和封面都支持 `src/public` 下的站内地址或完整远程 URL。远程服务器需要允许浏览器访问媒体资源，并正确支持视频的 MIME type 和 Range 请求。区块内除一张可选 Markdown 封面图片外不能放置正文、多个图片或嵌套 `video`。

## 音乐

音乐卡片使用 `::: music <远程地址> | <歌曲名> | <歌手>`。音频不需要存入项目；使用完整的远程音频直链，可选地在区块内提供一张 Markdown 封面：

```md
::: music https://cdn.example.com/song.mp3 | 歌曲名 | 歌手
![歌曲封面](https://images.example.com/cover.jpg)
:::
```

更推荐使用 `open.motues.top` 的 `type=details` 接口。此时只需填写平台和歌曲 ID，不需要手工填写歌曲名、歌手或封面：

```md
::: music https://open.motues.top/music?server=netease&type=details&id=470381097
:::
```

下面是同一语法的实际渲染结果。卡片加载时通过 `details` 和 `cover` 自动读取歌曲名、歌手、专辑和封面；只有点击播放后才通过 `url` 获取临时音频地址并打开全局播放器：

::: music https://open.motues.top/music?server=netease&type=details&id=470381097
:::

全局播放器在客户端路由切换后继续存在，并以 `80×80px` 的小型方形卡片默认悬浮在页面左上角。卡片使用放大、轻度模糊和增强色彩的专辑封面作为连续背景，并叠加玻璃高光与语义遮罩；内部呈现深色圆形唱片、同心纹路和中央圆形专辑封面。播放、暂停或加载图标直接位于唱片中心，不使用独立背景或底部控制面板；播放图标始终显示，播放期间的暂停图标在支持 hover 的设备上仅于播放器 hover 或键盘聚焦时显示，触摸设备保持可见。关闭控件保留易点击的透明区域，仅显示一个使用全站 popover、border 和 accent 语义色的 `16px` 圆点，并以类似消息角标的方式一半外凸于方块右上角。播放时唱片以约 `18s` 一圈的速度缓慢旋转，暂停后停在当前角度，系统要求减少动态效果时不旋转。拖动卡片的非按钮区域可以移动播放器，也可以聚焦播放器后使用方向键移动。播放进度仍可在文章内音乐卡片中调整，页面始终只使用一个 `audio` 元素。

Meting API 的 `server` 支持 `netease`、`tencent`、`kugou`、`baidu` 和 `kuwo`，省略时默认使用 `netease`。`details` 返回的 `url_id` 用于继续获取音频；封面接口接收歌曲 ID，而不是 `pic_id`，组件会自动完成这两个请求。接口还提供歌词、歌单和搜索能力，但单曲卡片目前不需要这些数据。

也可以继续直接使用 Motues 的 `type=url`，但这种方式与普通音频直链一样，需要手工填写展示信息：

```md
::: music https://open.motues.top/music?server=netease&type=url&id=470381097 | 讲不出再见 | 谭咏麟
:::
```

`open.motues.top` 属于第三方服务，可能受可用性、CORS、版权和上游临时地址失效影响；HTTPS 页面会尝试将接口返回的 HTTP 音频地址升级为 HTTPS。需要完全可控时应使用支持 HTTPS、正确 MIME type、Range 请求和跨域访问的音频直链。
