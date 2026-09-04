---
title: 配置站点信息
date: 2026-09-01
summary: 完整说明站点身份、作者、导航、社交入口、评论，以及 VitePress 工程配置。
description: Bean Blog 的 site.config.ts、config.ts、环境变量、Markdown、SEO 与构建配置说明。
keywords:
  - 站点配置
  - VitePress 配置
  - Giscus
  - SITE_URL
series:
  name: 入门与配置
  order: 2
  sidebar: Bean Blog 使用手册
  sidebarOrder: 1
tags:
  - 使用手册
  - 配置
draft: false
---

项目有两个配置入口，它们服务于不同层级：

| 文件                            | 职责                                                              | 什么时候修改             |
| ------------------------------- | ----------------------------------------------------------------- | ------------------------ |
| `src/.vitepress/site.config.ts` | 站点名称、作者、动态身份、导航、社交入口、分页、图标、Feed 和评论 | 搭建自己的博客时需要修改 |
| `src/.vitepress/config.ts`      | VitePress 路由、Markdown、侧栏、SEO、资源注入和构建钩子           | 调整工程能力时才修改     |

日常配置优先集中在 `site.config.ts`。页面组件和构建逻辑会读取这里的数据，不应在组件中重复写作者名称、域名或社交账号。

## 环境变量

域名和部署路径由环境变量注入，不建议硬编码到 `site.config.ts`。

| 变量        | 必填         | 用途                                                                  | 示例值                       |
| ----------- | ------------ | --------------------------------------------------------------------- | ---------------------------- |
| `SITE_URL`  | 生产构建必填 | 站点完整来源地址，用于 canonical、Open Graph、sitemap、robots 和 Feed | `https://username.github.io` |
| `SITE_BASE` | 否           | 站点部署子路径；根站点使用 `/`                                        | `/` 或 `/blog/`              |

`SITE_URL` 不包含末尾 `/`。`SITE_BASE` 应同时保留开头和结尾的 `/`；未设置或设置为 `/` 时表示部署在域名根路径。

本地开发不要求 `SITE_URL`。需要检查生产输出时，项目已提供固定占位域名的命令：

```powershell
pnpm build:local
pnpm preview
```

GitHub Pages workflow 在 `.github/workflows/deploy.yml` 中声明：

```yaml
env:
  SITE_URL: https://${{ github.repository_owner }}.github.io
  SITE_BASE: /
```

如果仓库发布到项目子路径，需要把 `SITE_BASE` 改成 `/<repository>/`，并保证 Pages 的实际访问路径与之相同。

## 站点信息

`siteConfig.site` 控制全站公共信息和输出路径。

| 配置                 | 类型       | 建议修改 | 用途                                                            | 当前值示例                           |
| -------------------- | ---------- | -------- | --------------------------------------------------------------- | ------------------------------------ |
| `title`              | `string`   | 是       | VitePress 站点标题、页面标题后缀和首页标题                      | `Bean Blog`                          |
| `name`               | `string`   | 是       | 页头品牌名和 Web App Manifest 名称                              | `Bean Blog`                          |
| `description`        | `string`   | 是       | 默认站点描述；页面未单独声明时用于 SEO 和 Feed                  | `记录工程实践、技术思考与持续学习。` |
| `keywords`           | `string[]` | 是       | 普通页面的默认 SEO 关键词                                       | `["VitePress", "前端开发"]`          |
| `url`                | `string`   | 否       | 从 `SITE_URL` 读取并移除末尾 `/`                                | `https://username.github.io`         |
| `base`               | `string`   | 否       | 从 `SITE_BASE` 或 Vite `BASE_URL` 读取并规范为首尾带 `/` 的路径 | `/`                                  |
| `locale`             | `string`   | 按需     | Open Graph 地区代码                                             | `zh_CN`                              |
| `language`           | `string`   | 按需     | HTML、VitePress 和 Feed 的语言代码                              | `zh-CN`                              |
| `featuredPostsLimit` | `number`   | 按需     | 首页“推荐阅读”最多展示的最新文章数量                            | `5`                                  |
| `postsPerPage`       | `number`   | 按需     | 文章列表每页显示的文章数量                                      | `3`                                  |
| `favicon`            | `object`   | 是       | 浏览器和设备图标路径，字段见下表                                | 见下表                               |
| `manifest`           | `string`   | 按需     | Web App Manifest 的公开路径                                     | `/site.webmanifest`                  |
| `feeds`              | `object`   | 按需     | RSS、Atom 和 JSON Feed 的输出路径                               | 见下表                               |

### 图标配置

`favicon` 的文件应保存在 `src/public`，配置值使用以 `/` 开头的公开路径。构建时会自动拼接 `SITE_BASE`。

| 配置          | 类型     | 建议修改 | 用途           | 当前值         |
| ------------- | -------- | -------- | -------------- | -------------- |
| `favicon.ico` | `string` | 是       | 兼容性 favicon | `/favicon.ico` |
| `favicon.png` | `string` | 是       | PNG favicon    | `/favicon.png` |
| `favicon.svg` | `string` | 是       | SVG favicon    | `/favicon.svg` |

### Feed 配置

这些路径同时用于静态文件生成、页面 `<head>` 声明和站内 RSS 链接。

| 配置             | 类型     | 建议修改 | 用途           | 当前值       |
| ---------------- | -------- | -------- | -------------- | ------------ |
| `feeds.rss`      | `string` | 按需     | RSS 2.0 主地址 | `/rss.xml`   |
| `feeds.rssAlias` | `string` | 按需     | RSS 兼容别名   | `/index.xml` |
| `feeds.atom`     | `string` | 按需     | Atom Feed 地址 | `/atom.xml`  |
| `feeds.json`     | `string` | 按需     | JSON Feed 地址 | `/feed.json` |

## 作者信息

`siteConfig.author` 用于首页、文章信息和 Feed 作者信息。

| 配置    | 类型     | 建议修改 | 用途                    | 当前值示例                   |
| ------- | -------- | -------- | ----------------------- | ---------------------------- |
| `name`  | `string` | 是       | 作者显示名称            | `Bean`                       |
| `email` | `string` | 是       | Feed 等输出中的作者邮箱 | `hello@example.com`          |
| `bio`   | `string` | 是       | 首页作者简介            | `一名持续学习的软件工程师。` |

## 动态页配置

`siteConfig.moment` 集中控制 `/moment` 的个人区和滚动批次，不需要在每条动态中重复声明作者身份。

| 配置              | 类型       | 建议修改 | 用途                                            | 当前值示例                   |
| ----------------- | ---------- | -------- | ----------------------------------------------- | ---------------------------- |
| `covers`          | `string[]` | 是       | 个人区封面列表，进入页面时随机选择一张          | `[/moments/cover.webp, ...]` |
| `displayName`     | `string`   | 按需     | 动态作者名；省略或留空时回退到 `author.name`    | `Bean`                       |
| `avatar`          | `string`   | 按需     | 动态头像；省略或留空时回退到 `site.favicon.svg` | `/favicon.svg`               |
| `signature`       | `string`   | 按需     | 个人签名；省略或留空时回退到 `author.bio`       | `一名持续学习的软件工程师。` |
| `momentBatchSize` | `number`   | 按需     | 首批和后续每批动态数量，必须是正整数            | `4`                          |

`covers` 至少提供一项，空路径会导致配置加载失败，重复路径会自动去重。每次进入 `/moment` 时页面随机选择一张，停留期间不会自行切换：

```ts
covers: ["/moments/cover.webp", "/moments/cover-spring.webp", "/moments/cover-night.webp"],
```

封面和头像应存放在 `src/public`，配置值使用以 `/` 开头的公开路径。页面会为这些路径和动态图片统一拼接 `SITE_BASE`。完整写作格式见[发布短动态](/blog/guide/posting-moments)。

## 导航配置

`siteConfig.navigation` 是 `NavItem[]`。有 `href` 的项目是直接链接，有 `children` 的项目显示为下拉菜单；`children` 仍是 `NavItem[]`，因此支持继续嵌套。

| `NavItem` 字段 | 类型        | 必填 | 用途                                                      |
| -------------- | ----------- | ---- | --------------------------------------------------------- |
| `title`        | `string`    | 是   | 导航显示文字                                              |
| `href`         | `string`    | 否   | 目标地址；内部地址以 `/` 开头，外部地址使用完整 HTTPS URL |
| `children`     | `NavItem[]` | 否   | 子导航列表                                                |

```ts
const navigation = [
  { title: "文章", href: "/blog" },
  { title: "动态", href: "/moment" },
  { title: "使用手册", href: "/blog/guide/getting-started" },
  {
    title: "浏览",
    children: [
      { title: "标签", href: "/tags" },
      { title: "归档", href: "/archives" },
    ],
  },
];
```

## 社交入口

`homeSocials` 控制首页的文字社交入口。Header 只保留导航、搜索和主题切换，不显示社交图标。

| `SocialLink` 字段 | 类型     | 必填 | 用途                           |
| ----------------- | -------- | ---- | ------------------------------ |
| `label`           | `string` | 是   | 首页显示文字和链接的无障碍名称 |
| `href`            | `string` | 是   | 平台地址或站内 Feed 地址       |

```ts
const homeSocials = [
  { label: "GitHub", href: "https://github.com/username" },
  { label: "RSS", href: "/rss.xml" },
];
```

没有有效地址的平台应直接从数组中移除，不保留空链接。

## Giscus 评论

`siteConfig.giscus` 的类型是 `GiscusConfig | null`。不需要评论时保持 `null`；启用前先在 Giscus 获取仓库和分类参数。

| 配置               | 类型                                           | 必填 | 用途                          | 常用值             |
| ------------------ | ---------------------------------------------- | ---- | ----------------------------- | ------------------ |
| `repo`             | `` `${string}/${string}` ``                    | 是   | 已启用 Discussions 的公开仓库 | `owner/repository` |
| `repoId`           | `string`                                       | 是   | Giscus 提供的仓库 ID          | `R_...`            |
| `category`         | `string`                                       | 是   | Discussion 分类名称           | `Announcements`    |
| `categoryId`       | `string`                                       | 是   | Giscus 提供的分类 ID          | `DIC_...`          |
| `mapping`          | `"pathname" \| "url" \| "title" \| "og:title"` | 是   | 页面与 Discussion 的映射方式  | `pathname`         |
| `reactionsEnabled` | `"0" \| "1"`                                   | 是   | 是否启用主贴表态              | `"1"`              |
| `inputPosition`    | `"top" \| "bottom"`                            | 是   | 评论输入框位置                | `"bottom"`         |
| `lang`             | `string`                                       | 是   | Giscus 界面语言               | `zh-CN`            |

```ts
const giscus = {
  repo: "owner/repository",
  repoId: "R_...",
  category: "Announcements",
  categoryId: "DIC_...",
  mapping: "pathname",
  reactionsEnabled: "1",
  inputPosition: "bottom",
  lang: "zh-CN",
};
```

全部字段有效时评论区才会加载。组件固定使用 `strict="0"`、`emit-metadata="0"` 和 `loading="lazy"`；评论主题会自动跟随 VitePress 的 `appearance` 状态，不需要在配置中重复声明。

## VitePress 基础配置

`src/.vitepress/config.ts` 导出异步 `UserConfigFn<DefaultTheme.Config>`。它组合 `site.config.ts`、文章数据和 Markdown plugins，属于工程基础设施；只更换博客信息时不需要改这个文件。

### 顶层选项

| 配置                  | 当前值或来源                               | 建议修改 | 作用                                                   |
| --------------------- | ------------------------------------------ | -------- | ------------------------------------------------------ |
| `lang`                | `siteConfig.site.language`                 | 否       | 设置文档和 HTML 语言                                   |
| `title`               | `siteConfig.site.title`                    | 否       | 设置全站标题                                           |
| `titleTemplate`       | `` `:title \| ${siteConfig.site.title}` `` | 按需     | 组合页面标题与站点标题                                 |
| `description`         | `siteConfig.site.description`              | 否       | 设置默认页面描述                                       |
| `base`                | `siteConfig.site.base`                     | 否       | 设置 VitePress 部署基础路径                            |
| `srcExclude`          | `["posts/**/*.md", "moments/**/*.md"]`     | 否       | 不让文章和动态原稿直接生成 `/posts` 或 `/moments` 页面 |
| `cleanUrls`           | `true`                                     | 按需     | 生成不带 `.html` 的公开 URL                            |
| `lastUpdated`         | `true`                                     | 按需     | 让 VitePress 收集 Git 最后更新时间                     |
| `appearance`          | `true`                                     | 按需     | 启用 VitePress 明暗模式状态和切换能力                  |
| `themeConfig.sidebar` | 自动生成                                   | 否       | 根据文章 frontmatter 的 `series` 生成官方格式 sidebar  |
| `vite.plugins`        | `[tailwindcss()]`                          | 否       | 使用 Tailwind CSS 4 的 Vite plugin 处理主题样式        |

配置函数还会根据 `command` 区分环境：开发服务的系列侧栏包含草稿，生产构建会排除草稿；执行生产构建前调用 `requireSiteUrl()`，缺少 `SITE_URL` 时主动失败，避免发布带错误绝对地址的页面。

### Markdown 选项

这些能力由 VitePress 官方 Markdown 配置和 markdown-it plugins 提供，自定义主题只负责展示，不重复实现解析行为。

| 配置                                  | 当前值         | 作用                               |
| ------------------------------------- | -------------- | ---------------------------------- |
| `markdown.lineNumbers`                | `true`         | 代码块显示行号                     |
| `markdown.math`                       | `true`         | 启用数学公式解析                   |
| `markdown.image.lazyLoad`             | `true`         | 为普通 Markdown 图片启用原生懒加载 |
| `markdown.codeCopyButton.tooltipText` | `复制代码`     | 复制按钮默认提示文字               |
| `markdown.codeCopyButton.copiedText`  | `已复制`       | 复制成功后的提示文字               |
| `markdown.theme.light`                | `github-light` | 亮色模式 Shiki 代码主题            |
| `markdown.theme.dark`                 | `github-dark`  | 暗色模式 Shiki 代码主题            |

Custom Containers 使用 VitePress 保留的英文关键字，界面标题改为中文：

| 英文关键字   | 默认中文标题 |
| ------------ | ------------ |
| `info`       | 信息         |
| `note`       | 备注         |
| `tip`        | 提示         |
| `important`  | 重要         |
| `warning`    | 警告         |
| `danger`     | 危险         |
| `caution`    | 注意         |
| `details`    | 详细信息     |
| `image-grid` | 图片布局     |
| `live-photo` | Live Photo   |

`markdown.config(md)` 依次注册下列 plugins：

| plugin                   | 作用                                               |
| ------------------------ | -------------------------------------------------- |
| `markdown-it-task-lists` | 将 Markdown 任务列表转换为可访问的 checkbox markup |
| `imageGridPlugin`        | 解析 `::: image-grid` 多图布局                     |
| `livePhotoPlugin`        | 解析 `::: live-photo` 并输出可播放的 Motion Photo  |
| `photoPreviewPlugin`     | 为普通图片和图片布局补充统一照片预览数据           |

具体写法分别见《使用 Markdown 扩展》《编排多图布局》和《使用 Live Photo》章节。

### Sitemap、head 与构建钩子

| 配置                     | 启用条件        | 作用                                                                                |
| ------------------------ | --------------- | ----------------------------------------------------------------------------------- |
| `sitemap.hostname`       | 存在 `SITE_URL` | 使用站点来源地址生成 sitemap                                                        |
| `sitemap.transformItems` | sitemap 已启用  | 从 sitemap 中排除 404 页面                                                          |
| `head`                   | 始终            | 注入 favicon、manifest、RSS、Atom 和 JSON Feed 链接                                 |
| `transformHead`          | 每个页面        | 生成 description、keywords、canonical、Open Graph 和 Twitter Card metadata          |
| `buildEnd`               | 构建结束        | 调用 `generateStaticAssets(config.outDir)` 生成 Feed、robots 和 manifest 等静态文件 |

`transformHead` 优先使用动态页面参数中的 `title`、`description`、`keywords`、`url` 和 `canonical`，缺失时回退到页面数据及 `siteConfig.site`。带文章 `slug` 的页面输出 `og:type=article`，其它页面输出 `website`。

## 配置辅助函数

`site.config.ts` 还导出三个辅助函数，通常不需要修改：

| 函数                   | 用途                                                        |
| ---------------------- | ----------------------------------------------------------- |
| `isGiscusConfigured()` | 检查 Giscus 必填字段是否完整，供评论组件决定是否加载        |
| `requireSiteUrl()`     | 在生产构建开始时确认 `SITE_URL` 已设置                      |
| `withBasePath()`       | 为站内公开资源拼接规范化后的 `SITE_BASE`，外部 URL 保持不变 |

## 主题设计令牌

项目参考 shadcn-vue 的语义主题方式，将可复用视觉值集中放在 `src/.vitepress/theme/tailwind.css` 的 `@theme` 中。组件优先使用 Tailwind utility，不直接读取具体颜色或尺寸数值。只有运行时生成的 DOM、复杂选择器或伪元素无法通过 utility 清晰表达时，才在对应组件中使用一个 `<style scoped>`，并直接读取相同的设计令牌。例如 `ArticlePage.vue` 使用标准 CSS Nesting 将 VitePress 生成的 Markdown DOM 规则收拢在 `.article-content` 下。现有 Tailwind CSS 4 + Vite 构建链可直接处理该语法，不需要额外的 nesting 插件或 PostCSS 配置。

### 颜色角色

Tailwind 默认颜色命名空间已经关闭。通用 surface 使用基础 token / `-foreground` 配对，保证背景和其上的内容一起变化：

| 分组     | token                                                                                              | 用途                                     |
| -------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| 页面     | `background` / `foreground`                                                                        | 页面画布与默认正文                       |
| 容器     | `card` / `card-foreground`、`popover` / `popover-foreground`                                       | 内容卡片与浮层                           |
| 操作     | `primary`、`secondary`、`accent` 及各自 `-foreground`                                              | 主要操作、次要表面、hover 与 active 状态 |
| 辅助     | `muted` / `muted-foreground`                                                                       | 低强调表面与辅助文字                     |
| 边界     | `border`、`border-strong`、`ring`                                                                  | 容器边界、强边界与键盘焦点               |
| 遮罩     | `overlay` / `overlay-foreground`                                                                   | dialog mask 及直接显示在 mask 上的内容   |
| 状态     | `info`、`success`、`important`、`warning`、`destructive`、`caution` 及各自 `-foreground`           | 容器、Alerts 与草稿提示                  |
| 代码领域 | `code-background`、`code-card`、`code-muted-foreground`、`code-border`、`code-accent` 和代码行状态 | 固定深色代码画布                         |

所有 `--color-*` 和阴影中的颜色必须使用 `oklab()`。亮色值定义在 `@theme`；`@utility theme-dark` 只覆盖确实不同的同名 token。根布局通过 `dark:theme-dark` 一次加载暗色值，组件继续使用 `bg-background`、`text-foreground`、`border-border` 等相同 utility。照片预览与搜索 dialog 的 mask 都使用 `overlay`；照片预览内直接落在 mask 上的图标和信息栏使用其通用配对 `overlay-foreground`，LIVE 标识和页面侧栏入口继续复用其它通用角色，不为单个组件建立专属色板。只有固定代码画布这类通用角色确实无法表达的功能才建立领域前缀，不能按页面或某次使用创建 `header-*`、`search-*` 一类颜色。

### 可维护尺度

除颜色外，项目集中管理所有对博客有长期价值的设计尺度：

| 类别       | namespace                                                                                 | 当前用途                                                            |
| ---------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 字体与字重 | `font-*`、`font-weight-*`                                                                 | 中文正文字体、代码字体和字体包真实提供的 `400` / `500`              |
| 字号与行高 | `text-*`、`leading-*`                                                                     | 基础 type scale、文章标题/正文/章节、紧凑 label、callout 和代码行高 |
| 字距       | `tracking-*`                                                                              | 全局字距策略与 Live Photo 标识                                      |
| 间距与尺寸 | `spacing`、`spacing-page-*`、`spacing-header`、`spacing-control-*`、`spacing-side-rail-*` | 基础 `4px` spacing scale、页面 gutter、页头、控件和侧轨位置         |
| 圆角       | `radius`、`radius-sm` 至 `radius-xl`                                                      | 从单一基准派生的交互控件和容器圆角                                  |
| 容器       | `container-*`                                                                             | 列表内容、文章正文、三轨布局、导航、搜索和照片详情宽度              |
| 响应式     | `breakpoint-sm` 至 `breakpoint-xl`                                                        | 项目实际使用的四个布局断点                                          |
| 层级       | `z-index-content`、`z-index-control`、`z-index-navigation`                                | 内容附属项、浮动控件和导航浮层                                      |
| 景深       | `shadow-*`、`blur-*`                                                                      | 卡片、dialog、磨玻璃预览和代码 focus blur                           |
| 媒体       | `aspect-*`                                                                                | 横图、竖图、混排图和文章封面比例                                    |
| 动效       | `duration-*`、`ease-*`、`animate-*`                                                       | 默认过渡、即时缩放、慢速宽度变化、loading 和 Live Photo             |

基础数值尺度使用 Tailwind 熟悉的 `sm`、`md`、`lg`；只有跨组件且用途稳定的值才使用 `page-gutter`、`side-rail-top` 这类语义名称。项目没有表单系统、统计图表或 dashboard sidebar，因此不会照搬 shadcn-vue 中没有实际消费者的 token；照片详情宽度属于稳定布局尺寸，可以保留 `container-photo-inspector`，但这不意味着照片功能需要独立颜色领域。

### 新增与修改规则

调整全站视觉时先修改已有 token。确需新增时，先确认它满足以下条件：在多个位置重复，或代表不会随组件名称变化的稳定语义；名称描述角色而非颜色值或当前页面；有源码消费者和必要的回归断言。surface 颜色必须补齐 `-foreground` 配对，独立领域内部也遵循 `background`、`foreground`、`card`、`muted`、`border`、`accent` 等一致后缀。

视口 `calc()`、响应内容的 `minmax()` grid track、伪元素 `content` 和组合 transition property 依赖上下文，可以保留 arbitrary value。普通字号、字距、圆角、模糊、图片比例和动画已有命名尺度，不得再写 arbitrary value。不要使用 Tailwind 内置色板或任意硬编码颜色。确需 scoped CSS 时，每个组件最多使用一个 `<style scoped>`，不得使用全局选择器、Tailwind 指令、CSS Modules、CSS-in-JS 或内联 `style`；`pnpm audit:styles` 会检查这些边界、必需 namespace、颜色配对和旧 token 回归。

## 发布前检查

发布前至少确认：

- `site.config.ts` 中的站点名称、简介、关键词和作者信息已替换。
- 导航链接和 `homeSocials` 中没有无效占位地址。
- favicon 和 manifest 图标文件真实存在。
- workflow 的 `SITE_URL`、`SITE_BASE` 与 GitHub Pages 实际部署方式一致。
- 不使用评论时 `giscus` 为 `null`；使用时全部字段来自目标仓库的 Giscus 配置。
- 修改 `config.ts` 后，相关 Markdown、动态路由、SEO 或静态生成测试同步更新。
