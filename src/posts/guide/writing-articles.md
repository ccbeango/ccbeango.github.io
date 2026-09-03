---
title: 创建和组织文章
date: 2026-08-31
summary: 说明文章路径、frontmatter、草稿、精选文章、系列侧栏与静态资源的写法。
description: Bean Blog 的 Markdown 文章创建、frontmatter 字段和自动系列配置指南。
keywords:
  - Markdown 写作
  - frontmatter
  - 系列文章
series:
  name: 内容写作
  order: 1
  sidebar: Bean Blog 使用手册
  sidebarOrder: 2
tags:
  - 使用手册
  - Markdown
draft: false
cover: /media/live-photo-sample-poster.png
---

每篇文章都是 `src/posts` 下的 Markdown 文件。新增文件并填写 frontmatter 后，文章会自动进入列表、标签、归档、搜索和 feed，不需要再维护一份文章清单。

## 文件路径与公开 URL

文件相对 `src/posts` 的路径就是完整 slug：

```text
src/posts/guide/writing-articles.md -> /blog/guide/writing-articles
src/posts/travel/2026/sichuan.md     -> /blog/travel/2026/sichuan
```

slug 支持多个路径段，但完整 slug 必须唯一。文章来源目录不会生成 `/posts` 公开路由。

## Frontmatter 示例

```yaml
---
title: 文章标题
date: 2026-09-01
updated: 2026-09-02
summary: 列表与 feed 使用的摘要
description: SEO description，省略时使用 summary
keywords:
  - VitePress
  - 静态博客
featured: true
series:
  name: 内容写作
  order: 1
  sidebar: Bean Blog 使用手册
  sidebarOrder: 2
tags:
  - 工程实践
draft: false
cover: /media/live-photo-sample-poster.png
canonical: https://example.com/original-article
---
```

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `title` | 是 | 非空文章标题 |
| `date` | 是 | 可解析日期，建议使用 `YYYY-MM-DD` |
| `updated` | 否 | 最近更新日期 |
| `summary` | 否 | 首页、列表、搜索和 feed 摘要 |
| `description` | 否 | SEO description，省略时回退到 `summary` |
| `keywords` | 否 | SEO 与搜索关键词数组 |
| `featured` | 否 | 是否进入首页“推荐阅读”，默认 `false` |
| `series` | 否 | 自动系列侧栏信息 |
| `tags` | 否 | 标签数组，会规范化、去重和计数 |
| `draft` | 否 | 草稿状态，默认 `false` |
| `cover` | 否 | `src/public` 下资源的根路径地址 |
| `canonical` | 否 | 内容另有首发地址时使用的完整 URL |

无效日期、错误字段类型或重复 slug 会让配置加载失败，并在错误中指出对应文件和字段。

## 草稿与精选文章

`draft: true` 的文章只在开发环境中出现，并显示“草稿预览”。生产环境会从所有公开入口排除草稿，包括系列 sidebar、搜索、标签、归档、sitemap 和 feed。

`featured: true` 只控制文章是否进入首页“推荐阅读”候选，不会影响 `/blog` 列表中的可见性。首页按日期从新到旧最多展示 `siteConfig.site.featuredPostsLimit` 篇，默认上限为 5；超过上限的推荐文章仍可在 `/blog` 中访问。发布前将 `draft` 改为 `false`，再按需要设置 `featured`。

仓库中的 `src/posts/guide/draft-preview.md` 是草稿过滤的可运行示例。

## 单系列侧栏

为文章添加同名 `series.name`，再使用正整数 `series.order` 控制顺序：

```yaml
series:
  name: TypeScript 入门
  order: 1
```

同一系列不能重复使用相同 `order`。新增系列文章只需填写 frontmatter，不需要修改 `site.config.ts` 或手写 `themeConfig.sidebar`。

## 多分组侧栏

多个系列需要同时出现在左侧时，为它们设置相同 `sidebar`，并用 `sidebarOrder` 排列分组：

```yaml
# “入门与配置”系列
series:
  name: 入门与配置
  order: 1
  sidebar: Bean Blog 使用手册
  sidebarOrder: 1
```

```yaml
# “内容写作”系列
series:
  name: 内容写作
  order: 1
  sidebar: Bean Blog 使用手册
  sidebarOrder: 2
```

`sidebar` 是内部关联作用域，不会显示在页面中。`sidebar` 与 `sidebarOrder` 必须成对填写；同一系列的声明必须一致，同一 sidebar 中不同系列的 `sidebarOrder` 不能重复。

系列 sidebar 在 VitePress 启动时生成。新增文章或修改标题、系列归属、sidebar 与顺序后需要重启开发服务。左侧系列导航用于切换手册文章，右侧本文目录用于定位当前文章标题，两者互不替代。

## 图片与静态资源

将公开资源放在 `src/public` 的明确子目录中，并在 Markdown 中使用根路径：

```md
![图片说明](/media/live-photo-sample-poster.png)
```

为图片提供有意义的 alt。普通正文图片由 VitePress 增加 `loading="lazy"`；文章封面通过 frontmatter 的 `cover` 设置。

## 文章封面

在 frontmatter 中填写 `cover`，即可在文章标题上方显示封面：

```yaml
cover: /media/live-photo-sample-poster.png
```

封面文件放在 `src/public` 中，配置值使用从站点根路径开始的公开地址。封面下缘会渐隐到当前主题的页面背景，标题轻微上移到过渡区，让图片与文章信息形成连续头部；没有 `cover` 时不会生成空占位，也不会改变标题间距。点击封面可以进入与正文图片相同的照片预览，并支持缩放、拖动和照片信息查看。

## 发布一篇文章

1. 在 `src/posts` 下创建 Markdown 文件。
2. 填写 `title`、`date` 和需要的可选 frontmatter。
3. 使用 `pnpm dev` 检查正文、目录、图片和窄屏布局。
4. 确认完整 slug、系列 `order` 与 `sidebarOrder` 没有冲突。
5. 将 `draft` 设置为 `false`，提交文章及引用的静态资源。
