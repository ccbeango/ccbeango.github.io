## Context

`bean-blog` 是一个面向中文长文和摄影内容的静态博客。作者在 `src/posts` 中维护 Markdown，构建期生成页面、索引和订阅文件，读者端不依赖内容 API。项目使用自定义主题表达博客的信息结构与视觉，但不得复制 VitePress 已经提供且经过验证的基础行为。

工程固定使用 VitePress `2.0.0-alpha.19`、Vue 3、TypeScript、pnpm workspace 和 Tailwind CSS 4。站点身份与第三方账号仍使用中性值，因此上线配置是唯一尚未完成的工作。

## Goals / Non-Goals

**Goals:**

- 让新增文章、加入系列和发布站点都以 Markdown、frontmatter 与静态构建为核心。
- 提供完整的内容浏览、中文长文阅读、远程音视频、图片与 Android Motion Photo 展示能力。
- 自定义布局与视觉，同时复用 VitePress 的 Markdown、路由、目录、sidebar、代码复制和 appearance 行为。
- 以 Tailwind CSS 4 令牌、ESLint 质量检查、Prettier 格式化和自动化测试维持长期一致性。
- 从同一份已发布文章集合生成搜索、SEO、sitemap 和多格式 feed。

**Non-Goals:**

- 不建设 CMS、数据库、登录、在线编辑器、服务端 API、SSR 或 ISR。
- 不支持无需重新构建的即时内容发布。
- 不逐像素复刻其他博客，也不复制其品牌和内容。
- 当前不解析 iOS Live Photo 配对文件；原生 Live Photo 能力仅覆盖显式海报加 MP4 和 Android Motion Photo JPEG。
- 不提供音乐文件托管、曲库检索或服务端音乐代理；音乐来源由作者提供远程直链或受支持的第三方解析接口。
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

唯一主题样式入口只包含 Tailwind import、plugin、source、custom-variant、theme 和 utility 指令。组件优先使用 Tailwind utility；只有运行时生成的 DOM、复杂选择器或伪元素无法通过 utility 清晰表达时，才在对应 Vue 组件中使用一个 `<style scoped>`。例如 `ArticlePage.vue` 以标准 CSS Nesting 将 Markdown 规则收拢在 `.article-content` 下，集中适配 VitePress 运行时生成的 markup，避免在模板父节点维护超长 descendant variants 和重复作用域前缀。

现有 Tailwind CSS 4 + Vite 构建链直接处理 CSS Nesting，不增加 nesting 插件或额外 PostCSS 配置。每个 Vue 组件最多包含一个 scoped style，且必须读取全局设计令牌；全局选择器、Tailwind 指令、硬编码颜色、额外普通 CSS、CSS Modules、CSS-in-JS 和内联 `style` 均被禁止。

主题关闭 Tailwind 默认颜色命名空间，以 `background` / `foreground`、`primary` / `primary-foreground`、`muted` / `muted-foreground`、`accent` / `accent-foreground`、`overlay` / `overlay-foreground` 等稳定语义角色组织颜色。所有颜色和带颜色的阴影使用 `oklab()`；暗色模式在根节点通过 `.dark` 加载同名令牌覆盖，只在语义确实不对称时使用局部 `dark:`。代码画布可保留 `code-*` 领域令牌，组件不得创建一次性或 `photo-*` 色板。

字体、字重、字号与行高、间距、控件尺寸、圆角、容器宽度、断点、层级、阴影、模糊、媒体比例和动效也集中为实际被消费的 Tailwind 令牌。组件优先使用规范尺度，仅为视口计算、动态网格、生成内容和内容边界保留 arbitrary value。层级由低到高依次为正文、阅读辅助控件、全局音乐播放器和 Header 导航；浏览器 top layer 中的 dialog 独立于该层级。

### 4. ESLint 检查质量，Prettier 统一格式

项目使用 ESLint Flat Config，直接组合 `@eslint/js`、`typescript-eslint`、`eslint-plugin-vue` 和 `@eslint/markdown` 的官方推荐配置检查 JavaScript、TypeScript、Vue 和 Markdown。项目级规则只补充有明确语义的约束与 VitePress 语法兼容项，`eslint-config-prettier` 关闭和格式化冲突的规则。`pnpm lint` 负责报告质量与 Markdown 结构问题，`pnpm lint:fix` 只应用具有可靠修复器的规则。

Prettier 是唯一 formatter。根配置固定 LF、2 空格缩进、120 字符宽度、分号、双引号、尾随逗号、Vue 多属性标签每行一个属性、`htmlWhitespaceSensitivity: "ignore"` 和 `proseWrap: "preserve"`。因此 Vue 多行元素的文本与起止标签各自占据完整行，Markdown 段落保留作者换行。`prettier-plugin-tailwindcss` 读取 Tailwind 4 主题入口并按官方规则排序 class；`eslint-plugin-better-tailwindcss` 独立检查具有标准等价形式的 canonical class。

`pnpm format`、保存格式化和 VS Code `Alt+Shift+F` 均读取根 Prettier 配置；保存后再执行 ESLint 的安全修复。`.editorconfig`、`.gitattributes` 和 VS Code 设置共同保证 LF 与文件末尾换行。独立样式审计阻止非法样式机制、内置色板、硬编码颜色、非 `oklab()` 令牌、动态拼接 class 和已可由设计尺度替代的 arbitrary value。

`simple-git-hooks` 通过根级 `prepare` 注册 `pre-commit`，`lint-staged` 只对暂存代码与 Markdown 执行 Prettier 和 ESLint 校验，并对暂存的 JSON、YAML、CSS 等文件执行 Prettier 校验。主题 Vue、CSS 或样式审计脚本变化时，在 lint-staged 隔离的暂存内容上执行全项目 authored styles 审计。hook 不自动修复或重新暂存文件；类型、单元测试、构建和 E2E 不进入每次 commit，避免提交反馈过慢。

### 5. Markdown 扩展建立在 VitePress parser 之上

VitePress 官方 Custom Containers、GitHub Alerts、Code Groups、Shiki 行状态、标题锚点和普通图片懒加载 SHALL 由 VitePress parser 与客户端行为提供。数学公式和任务列表通过 Markdown 插件补充。项目插件不对整篇 Markdown 做字符串替换。

`::: link-card` 消费 VitePress Custom Container token。区块第一段必须且只能是一条标准 Markdown 链接，以链接地址和文字生成现有文章引用卡片；第二段允许提供可选的纯文本说明。站内绝对路径在客户端应用 VitePress `base`，完整 HTTP/HTTPS 地址保持不变。起始行参数、多条链接、富文本说明、额外段落、嵌套或缺失结束边界在构建期报告文件与行号。

`::: image-grid <mode>` 消费 VitePress Custom Container token，只接受普通 Markdown 图片。`landscape` 和 `portrait` 接受 2 至 4 张图片，四张时宽屏显示 `2x2`；`r73`、`r37`、`r64`、`r46` 固定两张并按对应比例等高排列；窄屏全部恢复单列源顺序。非法 mode、内容、嵌套、数量或结束边界在构建期报告文件与行号。

`::: live-photo <mp4-url>` 使用区块内单张 Markdown 图片作为海报；`::: live-photo android` 将同一 JPEG 同时作为海报和 Android Motion Photo 源。Android 定位器先验证 JPEG 签名，再从文件尾部反向查找最后一个 atom 长度与边界合法的 MP4 `ftyp` box，找不到时读取 XMP 中的 `MediaDataOffset` 或 `MicroVideoOffset`，并把从定位点到文件结尾的附加数据作为视频 Blob。目标是浏览器可直接播放，不额外解析或裁剪厂商 trailer；解析失败、跨域响应不可读或浏览器不支持内嵌编码时继续显示静态首帧。

媒体 block 只接受已注册的三冒号 Custom Container 语法；错误输入直接阻止 Markdown 构建。

`::: video <source>` 输出全局注册的 `VideoPlayer`，使用 `withBase` 同时处理站内 base path 与远程 URL。容器允许为空，或包含一张普通 Markdown 图片作为 poster 和可访问标题；其他正文、多图、嵌套与缺失结束标记在构建期失败。播放器使用浏览器原生 controls、`playsinline` 和 `preload="metadata"`，不自动播放，也不进入照片预览图片集。

`::: music <remote-source> | <title> | <artist>` 输出全局注册的 `MusicCard`，允许包含一张可选的 Markdown 封面。`remote-source` 可以是完整 HTTP/HTTPS 音频直链，也可以是 `open.motues.top/music` 地址。Motues `type=details` 模式只需 URL，不填写标题和歌手；卡片挂载后合并并缓存 `details` 与 `cover` 请求，自动展示歌曲名、歌手、专辑和封面，再根据 `url_id` 构造播放请求。Motues `type=url` 模式继续要求作者提供标题和歌手。`server` 仅接受 Meting 文档支持的平台并可省略为默认网易云；封面请求使用歌曲 ID 而不是 `pic_id`。本地路径、正文、多图、嵌套与缺失结束标记在构建期失败。

唯一 `audio` 元素和全局播放器挂载在 `Layout.vue`，文章卡片负责选择或切换曲目，并继续提供歌曲信息与进度调整。音频直链或 Motues `type=url` 只在用户点击播放后请求，成功结果与并发请求在客户端复用，HTTPS 页面将返回的 HTTP 地址升级为 HTTPS。全局播放器在 VitePress 客户端路由切换后保持当前曲目，并默认出现在 viewport 左上角，呈现为 `80×80px` 的悬浮唱片卡片。放大、轻度模糊且增强色彩的专辑封面延展为整张卡片背景，玻璃高光和语义遮罩建立连续层次；内部放置由深色唱片、同心纹路和中央圆形专辑封面组成的 `72px` 唱片。无背景的 Lucide 播放、暂停或加载图标固定覆盖在唱片中心，不随唱片旋转，播放器不设置底部控制面板。播放图标持续可见；支持 hover 的设备仅在播放器 hover 或 focus 时显示暂停图标，无 hover 输入则持续提供暂停入口。关闭控件使用透明的 `24px` 命中区包裹 `16px` 可见圆点，可见层复用全站 popover、border、muted 和 accent 语义角色，其中心与方块右上角重合；拖动边界为该外凸区域保留 viewport 空间。唱片始终挂载 `18s` 线性旋转动画，但默认暂停，仅在音频播放时继续旋转，因此暂停后保留当前角度；系统要求减少动态效果时禁用旋转。卡片非按钮区域支持 pointer 拖动，播放器本身支持方向键移动，位置始终限制在 viewport 内。快速切歌或关闭时使用请求序号阻止过期解析结果覆盖当前曲目；接口失败时提供可访问错误状态且文章仍可阅读。

### 6. 阅读布局围绕稳定居中的正文组织

文章正文使用 `52rem` 最大宽度和约 `1.1rem / 2rem` 的正文尺度，宽屏以对称三轨布局放置左侧系列导航和右侧本文目录，侧轨不得挤偏正文。两侧从首次呈现起保持一致的固定顶部距离，并在自身内容超高时内部滚动。窄屏以零布局高度的固定图标打开面板，不占用正文空间。系列导航、本文目录和回到顶部属于阅读辅助控件，必须位于可拖动的全局音乐播放器下方。

文章显式配置封面时，在图片底部三分之一区域覆盖从透明到 `background` 的渐变，并将标题区域轻微上移到封面下缘，使封面、标题和元数据形成连续头部。渐变层不得拦截封面预览交互，暗色模式继续使用同一个语义背景角色；没有封面时不得保留渐变、负间距或空占位。

系列导航只展示系列标题和 `14px` 文章标题，当前文章使用整行选中面和强调色；不显示序号、用途说明、状态文字或 sidebar 作用域。本文目录展示二三级标题，以 `14px` 字号和活动状态区分章节。标题定位和目录活动状态必须始终与 URL hash 一致，页末章节不得依赖额外 viewport 高度空白实现对齐。

正文表格使用与正文相同的 `text-article-body` 字号。行内代码移除 typography 自动生成的反引号，以 `bg-accent` 和 `text-accent-foreground` 呈现；fenced code block 保持独立代码画布和 VitePress 行为。

### 7. 所有文章图片共享照片预览

普通 Markdown 图片、`image-grid` 图片、文章封面和 Live Photo 首帧统一进入原生 dialog，并按当前文章 DOM 顺序组成图片集。默认在全屏 `overlay` 中完整显示单张照片；遮罩与搜索 dialog mask 复用相同语义颜色，browser backdrop 透明。预览两侧使用 `44px` 点击区和 `30px` Lucide icon 顺序翻页，并支持键盘 `ArrowLeft` 与 `ArrowRight`；按钮常态无背景，hover 使用轻量 `overlay-foreground` 背景，序列边界不显示无效方向。右上角直接放置重置、信息和关闭 Lucide icon：`36px` 点击区、`19px` 图标、无常态或 hover 背景，常态为 `text-overlay-foreground/70`，hover 为 `text-overlay-foreground`。重置使用 `Minimize2`，信息图标激活时显示实心强调状态。

桌面支持以指针为中心的 `1x` 至 `5x` 滚轮缩放、左键拖动、双击与按钮重置；触控设备保留原生滚动。翻页时停止当前 Live Photo、释放预览专用 Blob 并重置缩放与拖动；已经打开的信息面板保持可见，并按需加载新照片的 `exifr` 非 GPS 信息。信息面板在宽屏显示于右栏、窄屏显示于下方，继续使用 `overlay`、`overlay-foreground` 和轻量 backdrop blur，不建立照片专属颜色。

Live Photo 可在正文和预览中通过位于图片左上角的紧凑磨砂标识播放；标识由 Live Photo 徽记与 `LIVE` 文案组成，播放期间徽记以五秒线性周期旋转，不显示通用播放图标或原生 controls。预览在视频固有尺寸变化时按当前媒体边界重新定位标识，因此海报与视频比例可以不同。显式 MP4 在激活前不挂载视频或发起视频请求；Android 视频在首次播放时才读取并生成 Blob，同一组件合并并发请求并复用成功结果。正文与预览分别管理资源，组件卸载或关闭预览时停止播放并释放各自 Blob。`media/live-photo-sample-poster.png` 是唯一通用演示图片，同时承担普通图片、封面、网格裁切和显式 MP4 海报；`live-images/android-motion-photo.jpg` 仅承担真实 EXIF 与 Android Motion Photo 回归，其定位结果包含文件末尾的厂商 trailer。独立 MP4 仍作为视频功能资源保留，不计作额外图片。

### 8. 字体由独立 workspace 子包维护

`@bean-blog/lxgw-wenkai-lite-webfont` 固定 LXGW WenKai Lite 官方 release、原始资产大小和 SHA256。Python 更新脚本使用 FontTools 将 Regular 和 Medium 分别生成 `400`、`500` unicode-range WOFF2，CSS 入口仅包含指向包内文件的 `@font-face`。博客直接 import 该包，不使用外部 CDN。全站禁用 synthetic weight，使 `600/700` 请求回落到真实 Medium 轮廓。

### 9. 静态发现能力与发布配置集中管理

`site.config.ts` 统一维护站点、作者、导航、首页社交入口、feed 和 Giscus 配置，同时兼容服务端构建与浏览器加载。GitHub、RSS 等入口只在首页以文字链接展示，Header 只保留导航、搜索和主题切换。构建期生成页面元数据、robots、sitemap、RSS 2.0、Atom、JSON Feed、`/index.xml`、manifest 和图标引用。搜索使用构建期文章数据在浏览器本地匹配中文标题、摘要、标签和关键词；Giscus 只在配置完整时按需加载。

生产构建必须提供规范 `SITE_URL`，所有绝对 URL 和 sitemap 由该地址及 `SITE_BASE` 生成。正式身份信息、域名、社交链接和可选 Giscus 参数在上线前填写。

项目将发布检查拆为两个层级。`pnpm check:build` 覆盖生成资产、字体校验、格式、authored styles、lint、类型、单元测试、生产构建与静态产物检查，GitHub Pages 在上传 artifact 前执行该命令，任一步骤失败都不得部署。`pnpm check` 在此基础上增加 Playwright；浏览器回归不阻塞频繁的文章发布，仅由开发者在本地按需安装 Chromium 并执行。

### 10. 使用手册同时是可执行样例

快速开始与工程规范、站点配置、文章写作、Markdown 扩展、远程音视频、图片布局、Live Photo 和部署说明位于 `src/posts/guide`，通过自动多分组系列侧栏连续阅读。工程规范 SHALL 记录 ESLint、Prettier、Tailwind class 工具、编辑器和命令行的实际职责及最终配置。README 只保留仓库入口和手册索引，不维护重复 `docs`。renderer、单元和端到端测试直接使用手册中的真实示例，避免文档与实现分离。普通图片、封面、比例布局和显式 MP4 海报复用唯一通用演示图；Android Live Photo 单独使用一张真实功能样本；音乐使用远程资源，不在仓库保存音频样本。

## Risks / Trade-offs

- VitePress 2 仍为 alpha：通过精确版本锁定和升级回归控制内部 composable 变化。
- 自定义主题需要维护更多 markup 适配：通过只拥有布局和视觉、集中 VitePress 适配点降低分叉风险。
- scoped CSS 不经过 Tailwind class 排序：以必要性原则、组件作用域、全局设计令牌复用和样式审计限制其扩散。
- 浏览器端读取原始照片可能产生网络和内存开销：EXIF 与 Android 视频均按需读取、缓存，并及时释放 Blob。
- 远程音乐受第三方可用性、CORS、版权与地址时效影响：保留直接 URL 模式，Motues 元数据在客户端加载，音频地址只在交互后解析，并分别提供失败状态。
- 字体子包体积较大且更新依赖 Python/FontTools：unicode-range 分包减少实际下载，校验元数据保证更新可重复。

## Release Plan

1. 填入正式站点名称、作者资料、域名、社交链接和可选 Giscus 参数。
2. 使用目标部署平台对应的 `SITE_URL` 与 `SITE_BASE` 执行完整检查和生产预览。
3. 发布 VitePress 静态输出目录；回滚时恢复上一份静态产物。

## Open Questions

- 正式站点名称、作者展示信息和规范域名是什么？
- 使用哪个静态托管平台，是否需要非根 `SITE_BASE`？
- 展示哪些社交平台，是否启用 Giscus？
