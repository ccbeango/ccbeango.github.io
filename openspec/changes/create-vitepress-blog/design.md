## Context

`bean-blog` 是一个面向中文长文和摄影内容的静态博客。作者在 `src/posts` 中维护 Markdown，构建期生成页面、索引和订阅文件，读者端不依赖内容 API。项目使用自定义主题表达博客的信息结构与视觉，但不得复制 VitePress 已经提供且经过验证的基础行为。

工程固定使用 VitePress `2.0.0-alpha.19`、Vue 3、TypeScript、pnpm workspace 和 Tailwind CSS 4。站点身份与第三方账号仍使用中性值，因此上线配置是唯一尚未完成的工作。

## Goals / Non-Goals

**Goals:**

- 让新增文章、加入系列和发布站点都以 Markdown、frontmatter 与静态构建为核心。
- 提供完整的内容浏览、中文长文阅读、图片与 Android Motion Photo 展示能力。
- 自定义布局与视觉，同时复用 VitePress 的 Markdown、路由、目录、sidebar、代码复制和 appearance 行为。
- 以 Tailwind CSS 4 令牌、统一 ESLint 工作流和自动化测试维持长期一致性。
- 从同一份已发布文章集合生成搜索、SEO、sitemap 和多格式 feed。

**Non-Goals:**

- 不建设 CMS、数据库、登录、在线编辑器、服务端 API、SSR 或 ISR。
- 不支持无需重新构建的即时内容发布。
- 不逐像素复刻其他博客，也不复制其品牌和内容。
- 当前不解析 iOS Live Photo 配对文件；原生 Live Photo 能力仅覆盖显式海报加 MP4 和 Android Motion Photo JPEG。
- 不导入 VitePress 默认主题整套视觉 CSS，也不重写依赖已经提供的交互算法。

## Decisions

### 1. 以 VitePress 为运行基础，自定义主题只负责产品层

VitePress 应用根目录为 `src`，配置、数据管线、Markdown 插件和主题均位于 `src/.vitepress`。公开路由固定为 `/`、`/blog`、`/blog/<nested-slug>`、`/tags`、`/tags/<tag>`、`/archives` 和 404；dynamic routes 在构建期将 `src/posts/**/*.md` 映射到 `/blog` 下的多段 slug。

主题自行实现首页、列表、文章、标签、归档和响应式导航布局。标题锚点、hash 定位、代码复制、appearance 状态和 sidebar 选择等能力直接使用 VitePress 的 markup、client behavior 或当前版本 composable。目录相关版本耦合集中在单一适配模块，VitePress 升级时必须回归这些接入点。

全局 `Layout.vue` 使用 `min-height: 100vh` 的 column flex 页面骨架统一排列 Header、可伸展内容区和 Footer。内容不足一屏时由内容区填满剩余空间，使 Footer 位于 viewport 底部；内容超过一屏时 Footer 保持普通文档流并位于正文之后。Footer 不使用 `fixed`、`sticky`、脚本测量或页面级高度补丁，各页面因此共享相同的文档底部留白且不会遮挡正文。

### 2. 构建期文章模型是唯一内容数据源

共享加载与转换模块校验 `title`、`date`、`updated`、`summary`、`description`、`keywords`、`featured`、`series`、`tags`、`draft`、`cover` 和 `canonical`，并生成 slug、URL、字数和阅读时间。完整多段 slug、系列顺序和共享 sidebar 顺序必须唯一。

生产构建排除草稿，开发环境保留草稿预览。首页精选、文章列表、分页、标签、归档、搜索、系列导航、sitemap 和 feed 全部消费同一已发布集合，避免各页面形成不同过滤或排序规则。首页在筛选 `featured: true` 并按日期倒序后，只展示 `siteConfig.site.featuredPostsLimit` 指定的最新文章，当前上限为 5，不另设首页分页。

`series` 使用 `{ name, order, sidebar?, sidebarOrder? }`。未提供 `sidebar` 时形成单系列侧栏；多个系列使用相同 `sidebar` 时形成按 `sidebarOrder` 排列的多分组侧栏。构建期生成标准 `themeConfig.sidebar`，主题继续复用 VitePress 默认主题的路径匹配、嵌套、折叠和活动链接逻辑。修改系列元数据后需要重启 dev 服务以重新加载配置。

### 3. Tailwind CSS 4 是主要 authored UI styles 管线

唯一主题样式入口只包含 Tailwind import、plugin、source、custom-variant、theme 和 utility 指令。常规组件继续使用 Tailwind utility；`ArticlePage.vue` 允许一个 `<style scoped>`，以标准 CSS Nesting 将 Markdown 规则收拢在 `.article-content` 下，集中适配 VitePress 在运行时生成的 Markdown markup，避免在模板父节点维护超长 descendant variants 和重复作用域前缀。现有 Tailwind CSS 4 + Vite 构建链直接处理该语法，不增加 nesting 插件或额外 PostCSS 配置。该适配层直接读取全局设计令牌，不使用 Tailwind 指令、硬编码颜色或全局选择器。其他 Vue `<style>`、普通 UI CSS、CSS Modules、CSS-in-JS 和内联 `style` 均被禁止。

主题关闭 Tailwind 默认颜色命名空间，以 `background` / `foreground`、`primary` / `primary-foreground`、`muted` / `muted-foreground`、`accent` / `accent-foreground`、`overlay` / `overlay-foreground` 等稳定语义角色组织颜色。所有颜色和带颜色的阴影使用 `oklab()`；暗色模式在根节点通过 `.dark` 加载同名令牌覆盖，只在语义确实不对称时使用局部 `dark:`。代码画布可保留 `code-*` 领域令牌，组件不得创建一次性或 `photo-*` 色板。

字体、字重、字号与行高、间距、控件尺寸、圆角、容器宽度、断点、层级、阴影、模糊、媒体比例和动效也集中为实际被消费的 Tailwind 令牌。组件优先使用规范尺度，仅为视口计算、动态网格、生成内容和内容边界保留 arbitrary value。

### 4. ESLint 同时代码格式化与 Tailwind class 规范化

项目使用 ESLint Flat Config 与 `@antfu/eslint-config`，保持外部 `formatters` 关闭且不使用 Prettier。`.editorconfig`、`.gitattributes` 和 VS Code 设置共同固定 LF 与文件末尾换行；ESLint 对 JS、TS 和 Vue 执行 120 字符上限，并将 Vue 多属性标签自动整理为每行一个属性。URL、字符串、模板字符串、正则和独立 Tailwind `class` 属性行保持完整，避免为满足长度而破坏内容或 class order；无法安全自动重排的代码由 ESLint 报告后按语义手工换行。

`eslint-plugin-better-tailwindcss` 读取主题入口，执行 Tailwind 4 canonical class 检查和官方 class order。`pnpm format`、保存时修复和 VS Code `Alt+Shift+F` 均调用同一 ESLint 配置。独立样式审计阻止非法样式机制、内置色板、硬编码颜色、非 `oklab()` 令牌、动态拼接 class 和已可由设计尺度替代的 arbitrary value。

### 5. Markdown 扩展建立在 VitePress parser 之上

VitePress 官方 Custom Containers、GitHub Alerts、Code Groups、Shiki 行状态、标题锚点和普通图片懒加载 SHALL 由 VitePress parser 与客户端行为提供。数学公式和任务列表通过 Markdown 插件补充。项目插件不对整篇 Markdown 做字符串替换。

`::: image-grid <mode>` 消费 VitePress Custom Container token，只接受普通 Markdown 图片。`landscape` 和 `portrait` 接受 2 至 4 张图片，四张时宽屏显示 `2x2`；`r73`、`r37`、`r64`、`r46` 固定两张并按对应比例等高排列；窄屏全部恢复单列源顺序。非法 mode、内容、嵌套、数量或结束边界在构建期报告文件与行号。

`::: live-photo <mp4-url>` 使用区块内单张 Markdown 图片作为海报；`::: live-photo android` 将同一 JPEG 同时作为海报和 Android Motion Photo 源。Android 定位器先验证 JPEG 签名，再从文件尾部反向查找最后一个 atom 长度与边界合法的 MP4 `ftyp` box，找不到时读取 XMP 中的 `MediaDataOffset` 或 `MicroVideoOffset`，并把从定位点到文件结尾的附加数据作为视频 Blob。目标是浏览器可直接播放，不额外解析或裁剪厂商 trailer；解析失败、跨域响应不可读或浏览器不支持内嵌编码时继续显示静态首帧。

旧 HTML comment block 不兼容，也不做无痕降级；错误输入直接阻止 Markdown 构建。

### 6. 阅读布局围绕稳定居中的正文组织

文章正文使用 `52rem` 最大宽度和约 `1.1rem / 2rem` 的正文尺度，宽屏以对称三轨布局放置左侧系列导航和右侧本文目录，侧轨不得挤偏正文。两侧从首次呈现起保持一致的固定顶部距离，并在自身内容超高时内部滚动。窄屏以零布局高度的固定图标打开面板，不占用正文空间。

文章显式配置封面时，在图片底部三分之一区域覆盖从透明到 `background` 的渐变，并将标题区域轻微上移到封面下缘，使封面、标题和元数据形成连续头部。渐变层不得拦截封面预览交互，暗色模式继续使用同一个语义背景角色；没有封面时不得保留渐变、负间距或空占位。

系列导航只展示系列标题和 `14px` 文章标题，当前文章使用整行选中面和强调色；不显示序号、用途说明、状态文字或 sidebar 作用域。本文目录展示二三级标题，以 `14px` 字号和活动状态区分章节。标题定位和目录活动状态必须始终与 URL hash 一致，页末章节不得依赖额外 viewport 高度空白实现对齐。

正文表格使用与正文相同的 `text-article-body` 字号。行内代码移除 typography 自动生成的反引号，以 `bg-accent` 和 `text-accent-foreground` 呈现；fenced code block 保持独立代码画布和 VitePress 行为。

### 7. 所有文章图片共享照片预览

普通 Markdown 图片、`image-grid` 图片、文章封面和 Live Photo 首帧统一进入原生 dialog。默认在全屏 `overlay` 中完整显示单张照片；遮罩与搜索 dialog mask 复用相同语义颜色，browser backdrop 透明。右上角直接放置重置、信息和关闭 Lucide icon：`36px` 点击区、`19px` 图标、无常态或 hover 背景，常态为 `text-overlay-foreground/70`，hover 为 `text-overlay-foreground`。重置使用 `Minimize2`，信息图标激活时显示实心强调状态。

桌面支持以指针为中心的 `1x` 至 `5x` 滚轮缩放、左键拖动、双击与按钮重置；触控设备保留原生滚动。信息首次打开时按需加载 `exifr`，缓存非 GPS EXIF，并在宽屏右栏或窄屏下方展示已有拍摄参数。信息面板继续使用 `overlay`、`overlay-foreground` 和轻量 backdrop blur，不建立照片专属颜色。

Live Photo 可在正文和预览中通过位于图片左上角的紧凑磨砂标识播放；标识由 Live Photo 徽记与 `LIVE` 文案组成，播放期间徽记以五秒线性周期旋转，不显示通用播放图标或原生 controls。预览在视频固有尺寸变化时按当前媒体边界重新定位标识，因此海报与视频比例可以不同。显式 MP4 在激活前不挂载视频或发起视频请求；Android 视频在首次播放时才读取并生成 Blob，同一组件合并并发请求并复用成功结果。正文与预览分别管理资源，组件卸载或关闭预览时停止播放并释放各自 Blob。`media/live-photo-sample-poster.png` 是唯一通用演示图片，同时承担普通图片、封面、网格裁切和显式 MP4 海报；`live-images/android-motion-photo.jpg` 仅承担真实 EXIF 与 Android Motion Photo 回归，其定位结果包含文件末尾的厂商 trailer。独立 MP4 仍作为视频功能资源保留，不计作额外图片。

### 8. 字体由独立 workspace 子包维护

`@bean-blog/lxgw-wenkai-lite-webfont` 固定 LXGW WenKai Lite 官方 release、原始资产大小和 SHA256。Python 更新脚本使用 FontTools 将 Regular 和 Medium 分别生成 `400`、`500` unicode-range WOFF2，CSS 入口仅包含指向包内文件的 `@font-face`。博客直接 import 该包，不使用外部 CDN。全站禁用 synthetic weight，使 `600/700` 请求回落到真实 Medium 轮廓。

### 9. 静态发现能力与发布配置集中管理

`site.config.ts` 统一维护站点、作者、导航、首页社交入口、feed 和 Giscus 配置，同时兼容服务端构建与浏览器加载。GitHub、RSS 等入口只在首页以文字链接展示，Header 只保留导航、搜索和主题切换。构建期生成页面元数据、robots、sitemap、RSS 2.0、Atom、JSON Feed、`/index.xml`、manifest 和图标引用。搜索使用构建期文章数据在浏览器本地匹配中文标题、摘要、标签和关键词；Giscus 只在配置完整时按需加载。

生产构建必须提供规范 `SITE_URL`，所有绝对 URL 和 sitemap 由该地址及 `SITE_BASE` 生成。正式身份信息、域名、社交链接和可选 Giscus 参数在上线前填写。

### 10. 使用手册同时是可执行样例

快速开始、站点配置、文章写作、Markdown 扩展、图片布局、Live Photo 和部署说明位于 `src/posts/guide`，通过自动多分组系列侧栏连续阅读。README 只保留仓库入口和手册索引，不维护重复 `docs`。renderer、单元和端到端测试直接使用手册中的真实示例，避免文档与实现分离。普通图片、封面、比例布局和显式 MP4 海报复用唯一通用演示图；Android Live Photo 单独使用一张真实功能样本。

## Risks / Trade-offs

- VitePress 2 仍为 alpha：通过精确版本锁定和升级回归控制内部 composable 变化。
- 自定义主题需要维护更多 markup 适配：通过只拥有布局和视觉、集中 VitePress 适配点降低分叉风险。
- scoped Markdown 适配层不经过 Tailwind class 排序：以单文件例外、全局设计令牌复用、结构测试和样式审计限制其扩散。
- 浏览器端读取原始照片可能产生网络和内存开销：EXIF 与 Android 视频均按需读取、缓存，并及时释放 Blob。
- 字体子包体积较大且更新依赖 Python/FontTools：unicode-range 分包减少实际下载，校验元数据保证更新可重复。

## Release Plan

1. 填入正式站点名称、作者资料、域名、社交链接和可选 Giscus 参数。
2. 使用目标部署平台对应的 `SITE_URL` 与 `SITE_BASE` 执行完整检查和生产预览。
3. 发布 VitePress 静态输出目录；回滚时恢复上一份静态产物。

## Open Questions

- 正式站点名称、作者展示信息和规范域名是什么？
- 使用哪个静态托管平台，是否需要非根 `SITE_BASE`？
- 展示哪些社交平台，是否启用 Giscus？
