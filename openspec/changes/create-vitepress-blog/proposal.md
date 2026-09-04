## Why

需要一套以本地 Markdown 为唯一内容来源、以静态文件交付的中文个人博客。项目既要保留 VitePress 已验证的 Markdown 与导航能力，又要提供适合长文和摄影内容的自定义阅读体验，并通过集中配置、设计令牌和自动化检查降低长期维护成本。

## What Changes

- 建立基于 VitePress `2.0.0-alpha.19`、Vue 3、TypeScript 和 pnpm workspace 的静态博客工程。
- 提供 `/`、`/blog`、`/blog/<nested-slug>`、`/tags`、`/tags/<tag>`、`/archives` 和 404 页面，并由统一的构建期文章数据驱动精选、分页、标签、归档、搜索、系列导航和发布附属物。
- 通过 frontmatter 定义文章、草稿、精选、SEO 和系列关系；系列文章自动生成标准 `themeConfig.sidebar`，无需另行维护 sidebar 配置。
- 使用自定义 VitePress Theme 构建居中的中文长文阅读界面，同时直接复用 VitePress 的标题锚点、hash 路由、活动目录、代码复制、appearance 和 sidebar 行为。
- 将 Tailwind CSS 4 作为主要 authored UI styles 来源，使用基于 `oklab()` 的语义颜色和统一设计令牌；仅在 utility 无法清晰表达运行时 DOM、复杂选择器或伪元素时使用局部 scoped CSS，不增加 nesting 插件或额外 PostCSS 配置；ESLint Flat Config 直接组合 JavaScript、TypeScript、Vue 和 Markdown 官方推荐配置检查代码质量，Prettier 统一格式化并通过官方插件排序 Tailwind class，`eslint-plugin-better-tailwindcss` 检查 canonical class。
- 支持 VitePress 官方 Markdown 扩展、数学公式、任务列表、三冒号 `link-card`、`image-grid`、`video`、`music` 和 `live-photo` 容器、文章引用、通用视频、远程音乐与全局播放器、Android Motion Photo、文章图片集翻页、统一照片预览、缩放平移和按需 EXIF 信息。
- 提供响应式全局导航、系列侧栏、本文目录、主题切换、搜索、回顶、可选 Giscus，以及 SEO、robots、sitemap、manifest、站点图标和多格式 feed。
- 通过 workspace 子包自托管 LXGW WenKai Lite Regular 400 与 Medium 500，并提供可重复的字体更新和校验流程。
- 将快速开始、工程规范、站点配置、内容写作与部署说明作为 `src/posts/guide` 中的正式系列文章维护，并同时作为 Markdown 与浏览器回归样例。
- 通过 pre-commit 暂存文件校验阻止格式和代码质量问题进入提交；GitHub Pages 在上传 artifact 前执行不依赖浏览器的生产检查，Playwright 保留为本地按需执行的完整回归。

## Capabilities

### New Capabilities

- `blog-content`: 文章契约、嵌套路由、发布状态、系列、Markdown 与媒体容器、分页、标签和归档。
- `blog-reading-experience`: 自定义主题、设计系统、导航、长文排版、响应式侧轨、照片预览、代码展示、主题和无障碍。
- `blog-discovery-and-engagement`: 搜索、页面元数据、robots、sitemap、feed、站点身份资源、社交入口和评论。

### Modified Capabilities

无。

## Impact

- 应用源码、文章和公共资源位于 `src`，VitePress 配置与自定义主题位于 `src/.vitepress`。
- 字体资产由 `packages/lxgw-wenkai-lite-webfont` 管理；代码质量、格式化和样式规范分别由根级 ESLint Flat Config、Prettier 配置及样式审计脚本执行。
- 构建结果为无需数据库、CMS、应用服务器或运行时内容 API 的纯静态文件。
- 正式发布前 MUST 填入站点身份、规范域名、社交链接和可选 Giscus 参数，并完成生产检查。
