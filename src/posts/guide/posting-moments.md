---
title: 发布短动态
date: 2026-09-04
summary: 使用独立 Markdown 文件发布短文字和照片，并配置动态页身份、滚动加载、草稿与置顶状态。
description: Bean Blog 动态文件、正文图片、frontmatter、Markdown 范围、草稿、置顶与稳定链接说明。
keywords:
  - 短动态
  - Markdown
  - 图片宫格
series:
  name: 内容写作
  order: 5
  sidebar: Bean Blog 使用手册
  sidebarOrder: 2
tags:
  - 使用手册
  - 内容写作
draft: false
---

动态用于发布类似微博、X 或 Instagram 的简短文字和照片。它与长文章是两种独立内容：动态保存在 `src/moments`，集中显示在 `/moment`；文章保存在 `src/posts`，继续使用 `/blog/<nested-slug>`、搜索、标签、归档、系列与 Feed。

## 创建动态

在 `src/moments` 下创建 Markdown 文件。目录可以继续嵌套，文件相对路径会形成内部 slug 和稳定锚点，但不会生成单条动态详情页。

最小示例只需要 `date` 和简短正文：

```md
---
date: 2026-09-04T08:10:00+08:00
---

九月的风终于有了一点凉意。
```

动态正文面向普通段落、强调、链接、列表和换行，也支持文章引用、音乐、视频与 Live Photo。它不承诺支持 Vue 组件、代码组、数学公式或长文章的完整排版；需要展开论述的内容应写入 `src/posts`。

## 分享文章、音乐、视频和 Live Photo

动态可以直接复用长文章的 `link-card`、`music`、`video` 和 `live-photo` 容器。前三种的参数、远程媒体限制、封面和播放行为与[使用 Markdown 扩展](/blog/guide/markdown-extensions)完全一致；Live Photo 的 Android 模式与资源说明见[使用 Live Photo](/blog/guide/live-photo)。不需要为动态填写另一套 frontmatter 字段。

```md
今晚把最近反复打开的内容放在一起。

::: link-card
[使用 Markdown 扩展](/blog/guide/markdown-extensions)

容器、视频和音乐的完整写法都在这篇手册里。
:::

::: music https://cdn.example.com/night.mp3 | 夜航 | 示例歌手
![夜航的封面](https://images.example.com/night-cover.jpg)
:::

::: video /media/travel.mp4
![旅途视频的封面](/media/travel-poster.jpg)
:::

::: live-photo /media/live-photo.mp4
![江边傍晚的动态照片](/media/live-photo-poster.jpg)
:::
```

- `link-card` 用于站内或完整 `http/https` 外部链接，第一段是一条 Markdown 链接，可选的第二段是纯文本说明。
- `music` 使用完整的远程音频 URL 或已支持的 Motues 地址；直链必须提供歌曲名和歌手，封面可选。
- `video` 使用站内公开视频路径或完整远程视频 URL，封面可选。
- `live-photo` 使用独立 MP4，或用 `android` 模式引用 Android Motion Photo 原图；区块内必须包含一张静态首帧图片。
- 音乐、视频和 Live Photo 容器中的封面或静态首帧只属于对应组件，不会计入下方动态图库的九张上限，也不会与图库混用。
- 富媒体可以出现在普通正文之间或正文末尾图片之前；普通动态图片仍必须连续放在整条正文的最后。图片之后不能再写正文或富媒体容器。

除这四种容器外，动态不支持 `image-grid`、代码组、数学公式和 Vue 组件。复杂媒体或需要完整文章排版的内容应发布为长文章。

## Frontmatter 字段

| 字段       | 类型                        | 必填 | 默认值  | 用途                                                   |
| ---------- | --------------------------- | ---- | ------- | ------------------------------------------------------ |
| `date`     | 日期或日期时间              | 是   | 无      | 发布时间                                               |
| `title`    | 非空字符串                  | 否   | 无      | 内部描述和辅助语义，不作为卡片文章标题显示             |
| `updated`  | 日期或日期时间              | 否   | 无      | 最近更新时间                                           |
| `location` | 非空字符串                  | 否   | 无      | 动态底部显示的地点                                     |
| `tags`     | `string[]`                  | 否   | `[]`    | 动态元数据；会去除首尾空白和重复项，首版不链接标签页面 |
| `images`   | `{ src, alt }[]`，最多 9 项 | 否   | `[]`    | 迁移期兼容的旧图片宫格写法                             |
| `pinned`   | `boolean`                   | 否   | `false` | 将动态排在普通动态之前                                 |
| `draft`    | `boolean`                   | 否   | `false` | 只在开发环境预览                                       |

可选字符串不能是空字符串。日期、图片数量、图片路径和替代文本会在构建期校验，错误会指出对应动态和字段。

## 添加图片

动态图片放在 `src/public` 中，并在简短正文末尾使用标准 Markdown 图片语法：

```md
---
date: 2026-09-03T18:35:00+08:00
location: 钱塘江边
tags:
  - 摄影
  - 日常
---

下班后绕去江边，云层散开得正是时候。

![江边傍晚的云层](/media/live-photo-sample-poster.png)
![夕阳落在江面上](/media/live-photo-sample-poster.png)
```

构建期会从 Markdown parser token 中提取这些图片，并从正文 HTML 移除对应图片段落，再交给动态图库展示；浏览器不会重新解析 Markdown。图片保持书写顺序，并遵循以下规则：

- 图片必须连续放在正文末尾，可以写在一个或多个只包含图片的段落中。
- 每条动态最多九张图片，每张都必须填写非空、准确描述内容的替代文本。
- 不支持给图片添加链接或 title，也不能在同一段落中混写文字与图片。
- 图片之间不能插入正文，图片之后也不能继续书写正文。
- 路径使用从 `src/public` 开始的绝对公开路径，例如 `/media/live-photo-sample-poster.png`；页面会自动拼接 `SITE_BASE`。

违反这些约束时构建会指出对应动态和行号。提取后的 `alt` 同时用于缩略图和照片预览的可访问名称。

迁移期间，原有 frontmatter `images` 仍然可用：

```yaml
images:
  - src: /media/live-photo-sample-poster.png
    alt: 江边傍晚的云层
```

旧写法只用于兼容尚未迁移的动态。单条动态不能同时使用 frontmatter `images` 和正文图片，否则构建会失败；新动态应使用正文末尾的标准 Markdown 写法。

图库保持声明顺序，布局规则如下：

- 一张图片在受限范围内保留原始比例。
- 两张或四张图片使用两列正方形宫格。
- 三张或五至九张图片使用三列正方形宫格。

点击图片或在图片获得焦点后按 `Enter`、`Space`，会进入文章图片共用的照片预览。预览中的左右翻页只浏览当前这条动态的图库，不会跳转到信息流中其它动态的图片。

## 草稿、置顶与排序

开发服务会保留 `draft: true` 的动态并显示“草稿”标识。生产构建会从动态数据、页面和公开输出中排除草稿。

`pinned: true` 的动态始终排在普通动态之前。置顶组和普通组内部都按 `date` 从新到旧排序，因此较早的置顶动态仍会出现在较新的普通动态之前。

## 滚动加载与稳定链接

`siteConfig.moment.momentBatchSize` 控制首批及后续每批显示的动态数量。`/moment` 使用单一连续信息流；接近列表底部时会从构建期数据中自动揭示下一批，也可以使用“加载更多动态”按钮。全部动态显示后，页面会给出完成状态，不生成 `/moment/page/*` 分页路由。

每条动态都有从完整嵌套 slug 派生的稳定 fragment。操作菜单中的“复制链接”统一复制 `/moment` 与 fragment，例如 `/moment#moment-2026-nine-small-things`。直接打开较后的动态时，页面会先揭示包含它的批次再定位。动态没有独立详情路由，fragment 也不会成为单独的 sitemap 条目。

动态时间参考朋友圈层级：当天显示 `HH:mm`，昨天显示“昨天”，过去七个日历日内显示星期，今年较早日期显示“月日”，跨年日期显示“年月日”。将指针停在时间上仍可查看完整发布时间。

## 首版互动边界

动态页是完全静态的。首版操作菜单只提供真实可用的“复制链接”，不显示虚假点赞、点赞数，也不在信息流中为每条动态嵌入评论。文章搜索、标签、归档、系列 sidebar、RSS、Atom 和 JSON Feed 仍只包含 `src/posts` 中的长文章。

动态页的封面、显示名、头像、签名和每批数量见[配置站点信息](/blog/guide/site-configuration#动态页配置)。
