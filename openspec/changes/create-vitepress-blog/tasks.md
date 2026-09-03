## 1. 工程与规范

- [x] 1.1 建立 VitePress `2.0.0-alpha.19`、Vue 3、TypeScript 和 pnpm workspace 工程，提供开发、严格生产构建、固定根站点本地构建、预览与检查命令
- [x] 1.2 以 `src` 为 VitePress 根目录，组织配置、数据、Markdown 插件、自定义主题、文章和公共资源
- [x] 1.3 配置 ESLint Flat Config、`@antfu/eslint-config` 和 `eslint-plugin-better-tailwindcss`，关闭外部 formatter，统一 LF、120 字符、Vue 属性换行、canonical class 与官方 class order，不引入 Prettier
- [x] 1.4 统一 VS Code 保存格式化与 `Alt+Shift+F` 到 ESLint 工作流
- [x] 1.5 建立 authored styles 审计，仅允许文章页 scoped Markdown 适配层，并拒绝其他普通 UI CSS、Vue `<style>`、内联样式、动态 class、内置色板、硬编码颜色和不受允许的 arbitrary value

## 2. 内容模型与路由

- [x] 2.1 建立 `src/posts/**/*.md` 的统一加载、frontmatter 校验、多段 slug 唯一性、草稿过滤、日期排序、字数与阅读时间计算
- [x] 2.2 生成 `/`、`/blog`、`/blog/<nested-slug>`、`/tags`、`/tags/<tag>`、`/archives` 和 404 静态页面
- [x] 2.3 实现最多展示最新 5 篇的首页精选、完整文章列表、静态分页、标签规范化与计数、年份归档
- [x] 2.4 根据 `series` frontmatter 自动生成单系列和多分组标准 `themeConfig.sidebar`，校验系列与 sidebar 顺序冲突
- [x] 2.5 确保生产路由、索引和附属产物排除草稿，开发环境允许草稿预览并显示标识

## 3. 自定义主题与设计系统

- [x] 3.1 实现首页、列表、文章、标签、归档、404、页头、页脚、全局纵向 flex 页面骨架、支持点击外部关闭的桌面下拉导航和移动嵌套导航
- [x] 3.2 使用 Tailwind CSS 4 作为主要 authored UI styles 管线，并通过采用标准 CSS Nesting、无需额外 nesting 插件或 PostCSS 配置的文章页 scoped CSS 集中适配 VitePress Markdown markup
- [x] 3.3 建立仅使用 `oklab()` 的语义颜色与 `-foreground` 配对，使用根节点同名 token 覆盖实现 class-based 暗色模式
- [x] 3.4 集中定义并使用字体、字重、字号与行高、间距、控件尺寸、圆角、容器、断点、层级、阴影、模糊、媒体比例和动效令牌
- [x] 3.5 通过 `@bean-blog/lxgw-wenkai-lite-webfont` 子包自托管 Regular 400 与 Medium 500，提供官方资产校验、Python/FontTools 更新脚本和 unicode-range WOFF2
- [x] 3.6 禁止 synthetic weight，使标题使用真实 Medium 轮廓，并保留中文系统字体 fallback
- [x] 3.7 完成亮色纯白画布、克制内容边界、明暗主题持久化、键盘焦点和稳定响应式布局

## 4. 文章阅读与 VitePress 复用

- [x] 4.1 实现 `52rem` 居中正文、通过语义背景渐隐与标题轻微重叠形成连续头部的可选浅横幅封面、紧凑文章头部、正文末尾标签和不依赖大块页末留白的长文布局
- [x] 4.2 直接复用 VitePress 标题锚点、hash 定位、活动目录、代码复制、appearance 和 sidebar 行为，并将内部 composable 接入集中在单一适配点
- [x] 4.3 实现宽屏对称三轨：左侧系列导航、居中正文和右侧本文目录，两侧保持稳定顶部距离并独立处理内容溢出
- [x] 4.4 实现窄屏零布局高度的系列与目录图标触发器、可滚动面板、点击外部与 Escape 关闭
- [x] 4.5 将系列导航呈现为无序号的多分组文章列表，使用 `14px` 标题、整行选中面和强调色，与本文目录保持视觉区分
- [x] 4.6 将本文目录呈现为 `14px` 二三级标题列表，保证滚动、直接 hash 和页末章节的 URL 与活动状态一致
- [x] 4.7 使用正文同字号展示表格；以 `bg-accent` 和 `text-accent-foreground` 展示无生成反引号的行内代码，且不影响 fenced code block
- [x] 4.8 实现不占布局的滚动回顶、首页 RSS 入口和页脚 `Powered by VitePress`

## 5. Markdown 与媒体

- [x] 5.1 保留 VitePress 官方 Custom Containers、GitHub Alerts、Code Groups、Shiki 行状态、标题锚点和普通图片懒加载，增加任务列表与数学公式
- [x] 5.2 实现 `::: image-grid <mode>`，支持 `landscape`、`portrait`、`r73`、`r37`、`r64`、`r46`、四张 `2x2` 宫格、移动单列和严格输入错误
- [x] 5.3 实现 `::: live-photo <mp4-url|android>`，支持显式 MP4，以及验证 JPEG、倒序定位合法 `ftyp`、legacy XMP offset 回退和保留厂商 trailer 的 Android Motion Photo
- [x] 5.4 为普通图片、封面、图片网格和 Live Photo 首帧提供统一全屏预览、键盘入口、焦点恢复和搜索 mask 同款 `overlay`
- [x] 5.5 实现桌面 `1x` 至 `5x` 指针中心滚轮缩放、左键拖动、双击与 `Minimize2` 按钮重置
- [x] 5.6 使用 `exifr` 按需缓存非 GPS 拍摄参数，并实现宽屏右侧与窄屏下方的响应式信息面板
- [x] 5.7 在正文与预览中实现图片左上角 Live 徽记与 `LIVE` 播放入口、激活前无视频请求或解析、并发去重、Blob 复用与释放、失败回退和无原生 controls 播放
- [x] 5.8 统一照片预览右上角操作为直接位于 mask 上的无背景 Lucide icon，并复用全局 overlay、foreground、primary 与 ring 语义颜色

## 6. 搜索与发布附属物

- [x] 6.1 实现匹配中文标题、摘要、描述、标签和关键词的本地搜索 dialog，包括空状态、键盘操作和焦点恢复
- [x] 6.2 集中管理站点、作者、导航、首页社交、精选上限、分页、feed 和 Giscus 配置，并兼容服务端与浏览器运行环境，Header 不显示社交入口
- [x] 6.3 生成页面 title、description、keywords、canonical、Open Graph、Twitter Card 和 feed discovery 元数据
- [x] 6.4 生成 robots、sitemap、RSS 2.0、`/index.xml`、Atom、JSON Feed、manifest 和站点图标，并提供直接声明 `SITE_URL` / `SITE_BASE` 的 GitHub Pages 官方 artifact 部署 workflow
- [x] 6.5 在配置完整时按需加载 Giscus、同步 VitePress appearance，并保证缺失配置或加载失败不影响阅读

## 7. 文档、测试与发布

- [x] 7.1 将快速开始、完整站点与 VitePress 配置说明、含真实封面示例的文章写作、Markdown 扩展、图片布局、Live Photo 和部署说明整理为 `src/posts/guide` 正式系列文章，并复用唯一通用演示图片
- [x] 7.2 精简 README 为仓库入口和手册索引，移除重复 `docs`、无说明价值的测试文章与冗余 public 演示资源
- [x] 7.3 使用 Vitest 覆盖内容转换、系列 sidebar、Markdown 容器、EXIF、主题令牌和配置，并以 `live-images/android-motion-photo.jpg` 覆盖真实 Android Motion Photo 定位和厂商 trailer 保留
- [x] 7.4 使用静态产物检查与 Playwright 覆盖公开路由、直接访问与客户端导航 404、SEO、feed、桌面和移动布局、导航、目录、搜索、媒体、主题和无障碍
- [x] 7.5 让站内手册真实示例同时承担 renderer 与浏览器回归，确保 typecheck 显式覆盖隐藏的 `src/.vitepress` 配置与主题目录，并执行 lint、样式审计、单元测试与 OpenSpec strict validation
- [ ] 7.6 填入正式站点身份、规范域名、社交链接和可选 Giscus 参数，使用目标 `SITE_URL` / `SITE_BASE` 完成生产检查、预览与发布
