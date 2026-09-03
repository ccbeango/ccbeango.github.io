## ADDED Requirements

### Requirement: Tailwind CSS 4 样式边界

项目 authored UI styles MUST 以 Tailwind CSS 4 工具类和主题令牌为主。运行时生成的 DOM、复杂选择器或伪元素无法通过 utility 清晰表达时，Vue 组件 MAY 包含一个 `<style scoped>`，并 MUST 只读取全局语义颜色和设计尺度。每个 Vue 组件 MUST NOT 包含多个 style block，scoped CSS MUST NOT 使用全局选择器、Tailwind 指令或硬编码颜色。项目 MUST NOT 增加 nesting 插件或额外 PostCSS 配置，也 MUST NOT 使用额外普通 CSS、CSS Modules、CSS-in-JS 或内联 `style` 属性；唯一主题入口只允许 Tailwind import、plugin、source、custom-variant、theme 和 utility 指令。第三方字体包入口 MAY 包含只引用包内 WOFF2 的 `@font-face`，但 MUST NOT 包含页面选择器或外部 URL。

#### Scenario: 审计 authored styles

- **WHEN** 执行项目样式审计
- **THEN** 符合必要性、组件作用域和设计令牌约束的 scoped CSS 被接受，额外普通 CSS、全局选择器、硬编码颜色、禁止的样式机制、动态拼接 class 和越界的字体 CSS 会被拒绝并报告来源

### Requirement: 全局设计令牌

项目 SHALL 关闭 Tailwind 默认颜色命名空间，并 SHALL 使用以 shadcn 风格基础角色和 `-foreground` 配对组织的语义颜色。全部颜色及含颜色的阴影 MUST 使用 `oklab()`；源码 MUST NOT 使用 Tailwind 内置色板、任意硬编码颜色、其他颜色函数或按单次用途命名的 token。照片预览、搜索 dialog、侧栏和浮动入口 SHALL 复用通用 `background`、`popover`、`primary`、`muted`、`accent`、`overlay`、`border`、`ring` 等角色，MUST NOT 建立 `photo-*` 色板。

项目 SHALL 集中定义实际使用的字体、字重、字号与行高、字距、间距、布局间隔、控件尺寸、圆角、容器宽度、断点、层级、阴影、模糊、媒体比例、动效时间、缓动和动画。组件 SHALL 优先使用这些令牌，只为视口计算、动态网格、生成内容或内容边界保留 arbitrary value，并 MUST NOT 增加没有消费者的应用领域 token。层级 SHALL 保持全局导航高于音乐播放器、音乐播放器高于阅读辅助控件、阅读辅助控件高于正文；浏览器 top layer 中的 dialog 不受该层级约束。

#### Scenario: 切换同名暗色令牌

- **WHEN** VitePress appearance 进入暗色且根节点匹配 `.dark`
- **THEN** 根节点加载 `theme-dark` 并覆盖同名语义令牌，组件无需维护平行暗色变量

#### Scenario: 调整设计尺度

- **WHEN** 开发者修改共享字号、间距、圆角、容器、阴影或动效令牌
- **THEN** 消费对应 Tailwind utility 的组件统一获得新值

#### Scenario: 阻止颜色系统分叉

- **WHEN** authored source 使用内置色板、硬编码颜色、非 `oklab()` 色值或 `photo-*` token
- **THEN** 样式审计失败并要求改用现有语义角色

### Requirement: 统一代码与 class 格式化

项目 MUST 使用 ESLint Flat Config 直接组合 JavaScript、TypeScript、Vue 和 Markdown 各生态的官方推荐配置，检查代码质量与 Markdown 结构。项目 MUST 使用 Prettier 作为唯一 formatter，并 SHALL 统一使用 LF、2 空格缩进、120 字符宽度、分号、双引号和尾随逗号。Prettier SHALL 保留 Markdown 段落换行，将 Vue 多属性标签整理为每行一个属性，并忽略 HTML 空白敏感度，使多行 Vue 元素的文本与起止标签各自占据完整行。`.editorconfig`、`.gitattributes` 与工作区编辑器 SHALL 保证 LF 和文件末尾换行。

`prettier-plugin-tailwindcss` SHALL 读取 Tailwind 4 入口并执行官方 class order，`eslint-plugin-better-tailwindcss` SHALL 校验 canonical class。`pnpm format`、保存格式化和 VS Code `Alt+Shift+F` SHALL 使用同一 Prettier 配置；保存后 SHALL 独立执行 ESLint 的安全修复。

#### Scenario: 规范化 Tailwind class

- **WHEN** Vue 模板包含具有标准等价形式的 arbitrary class
- **THEN** ESLint 报告 canonical class 问题并可通过 `pnpm lint:fix` 修复

#### Scenario: 排序 Tailwind class

- **WHEN** Vue 模板包含不符合官方顺序的静态 class 列表
- **THEN** Prettier 通过 Tailwind 官方插件在保存、`Alt+Shift+F` 或 `pnpm format` 时统一排序

#### Scenario: 规范化代码换行

- **WHEN** 代码使用 CRLF、缺少文件末尾换行、超过格式宽度或在同一行放置多个 Vue 属性
- **THEN** 编辑器、Git 或 Prettier 将其规范化，且 ESLint 只报告代码质量与 Markdown 结构问题

#### Scenario: 格式化含文本的 Vue 标签

- **WHEN** 多属性 Vue 元素包含文本或插值内容并需要换行
- **THEN** 起始标签的闭合符、内容和结束标签各自保持为完整行，不拆散结束标签

### Requirement: 自定义主题骨架

系统 SHALL 提供包含站点标识、主导航、首页社交入口、页面内容和页脚的自定义 VitePress Theme。全局 `Layout.vue` SHALL 使用最小高度为 viewport 的纵向 flex 页面骨架，内容区 SHALL 占据 Header 与 Footer 之外的剩余空间。短页面的 Footer SHALL 落在 viewport 底部，长页面的 Footer SHALL 正常排列在内容之后；所有页面的 Footer 到文档底部留白 MUST 保持一致，且不得使用 `fixed`、`sticky`、脚本测量或按页面设置高度实现。首页 SHALL 直接展示站点标题、作者简介、已配置的社交文字入口和精选文章，不设置营销落地页。Header SHALL 只展示导航、搜索和主题切换，不得混入社交或订阅图标。页脚 SHALL 展示版权和指向 VitePress 官网的 `Powered by VitePress`，MUST NOT 重复首页已有的 RSS。

#### Scenario: 进入博客

- **WHEN** 访问者打开首页
- **THEN** 首屏可看到作者信息、主要导航、社交文字入口和推荐阅读，Header 中不显示社交或订阅图标

#### Scenario: 查看页脚

- **WHEN** 访问者到达页面底部
- **THEN** 页脚包含版权与 `Powered by VitePress`，且不包含重复 RSS

#### Scenario: 在不同内容长度的页面查看页脚

- **WHEN** 访问者分别打开内容不足一屏的页面和超过一屏的长文章
- **THEN** 短页面的页脚位于 viewport 底部，长页面的页脚跟随正文，二者到文档底部的留白一致且不遮挡内容

### Requirement: VitePress 基础行为复用

自定义主题 SHALL 只拥有博客布局、视觉和 VitePress 没有合适扩展点的业务能力。VitePress 生成的标题锚点、hash 路由定位、代码复制 markup 与 client behavior、appearance 状态和 sidebar 行为 MUST 直接复用。文章目录需要自定义 UI 时 SHALL 通过单一适配点复用当前锁定版本的标题解析和活动锚点行为。

#### Scenario: 使用文章基础交互

- **WHEN** 页面包含标题锚点、目录、代码块或颜色主题控件
- **THEN** 定位、活动状态、复制和主题持久化由 VitePress 行为驱动，自定义主题只补充布局与视觉

#### Scenario: 升级 VitePress

- **WHEN** 精确锁定的 VitePress 版本发生变化
- **THEN** 项目回归单一适配点、标题定位、目录活动状态、sidebar、代码复制和 appearance，且不复制新版已有实现

### Requirement: 响应式全局导航

系统 SHALL 从集中配置渲染普通导航项和任意层级子菜单。宽屏 SHALL 使用可访问下拉菜单；窄屏 SHALL 使用可展开移动抽屉。移动导航 MUST 支持键盘操作、Escape 关闭、合理焦点处理，并在路由变化后关闭。页头在首页和集合页 SHALL 保持紧凑，在文章页 SHALL 与三轨阅读布局对齐。

#### Scenario: 浏览嵌套导航

- **WHEN** 访问者在桌面或移动视口展开含子项的导航
- **THEN** 两种布局展示同一配置内容，并允许键盘进入目标页面和退出菜单

#### Scenario: 关闭桌面下拉导航

- **WHEN** 访问者打开桌面下拉导航后点击该下拉框之外的位置或进入新的路由
- **THEN** 已展开的下拉导航自动关闭，无需再次点击原触发项

### Requirement: 中文长文排版

文章正文 SHALL 使用水平居中的 `52rem` 最大宽度、约 `1.1rem / 2rem` 的正文尺度和清晰标题层级，并 SHALL 正确展示段落、链接、列表、引用、图片、公式、脚注、表格和代码。表格文字 MUST 使用与正文相同的 `text-article-body` 字号。行内代码 MUST 移除 typography 生成的前后反引号，使用 `bg-accent` 与 `text-accent-foreground`；fenced code block SHALL 使用独立代码画布并复用 VitePress 行为。

文章头部 SHALL 展示克制标题，以及中文发布日期、字数、可选更新日期和阅读时间组成的紧凑元数据。`summary` MUST NOT 在头部重复展示，标签 SHALL 位于正文末尾。`cover` 只在显式配置时以标题上方的浅横幅显示，其下缘 SHALL 从透明渐隐到当前语义页面背景，标题 SHALL 轻微上移进入过渡区；渐变 MUST NOT 拦截封面的照片预览交互，没有封面时 MUST NOT 保留渐变、负间距或空占位。页面末尾 MUST NOT 为锚点定位预留接近 viewport 高度的空白。

#### Scenario: 阅读包含丰富内容的文章

- **WHEN** 文章包含表格、行内代码、代码块、公式、长链接和图片
- **THEN** 表格与正文同字号，行内代码无反引号并使用 accent 配色，代码块不受其影响，页面无水平溢出

#### Scenario: 显示文章元数据

- **WHEN** 文章包含可选 summary、updated、tags 和 cover
- **THEN** summary 只用于列表和发布数据，updated 位于头部元数据，tags 位于正文后，cover 位于标题上方且不主导首屏，并通过语义背景渐隐与轻微标题重叠组成连续头部

### Requirement: 响应式图片布局

`image-grid` SHALL 只输出可静态扫描的 Tailwind CSS 4 classes。宽屏 `landscape` 和 `portrait` SHALL 使用稳定的 `4:3` 与 `3:4` 容器，四张时使用两列两行；`r73`、`r37`、`r64` 和 `r46` SHALL 按对应方向组合横竖画幅并保持同排等高。窄屏全部布局 MUST 变为单列并保持 Markdown 源顺序。

#### Scenario: 在不同视口阅读多图文章

- **WHEN** 同一文章分别在宽屏和窄屏显示六种布局
- **THEN** 宽屏按 mode 稳定排列和裁切，窄屏按源顺序单列，页面不产生水平溢出

### Requirement: 文章目录

系统 SHALL 复用 VitePress 标题解析和活动锚点行为，生成包含二三级标题的本文目录。链接 SHALL 使用 `14px` 字号，非活动项使用清晰的辅助色，活动项使用强调色和字重。宽屏目录 SHALL 位于正文之外的右侧轨道，从首次呈现起保持固定顶部距离，内容超高时只在目录内部滚动。窄屏 SHALL 使用正文前方的零布局高度固定图标打开可滚动面板，MUST NOT 在文章末尾显示目录或占用正文高度。

#### Scenario: 跟踪并跳转章节

- **WHEN** 访问者滚动文章或选择目录链接
- **THEN** 目录活动项、可见标题和 URL hash 始终指向同一章节，固定页头不遮挡目标

#### Scenario: 定位页末章节

- **WHEN** hash 目标接近文档末尾且页面达到最大滚动位置
- **THEN** 目标标题保持可见，URL 与活动目录一致，且页面不使用额外大块末尾空白

#### Scenario: 在窄屏使用目录

- **WHEN** 视口无法容纳右侧轨道且访问者激活顶部目录图标
- **THEN** 图标滚动时可见但容器布局高度为零，面板在可用视口内展开，并可通过选择链接、点击外部或 Escape 关闭

### Requirement: 系列文章导航

系统 SHALL 将自动生成的标准 VitePress sidebar 显示为文章左侧系列导航，并复用 VitePress 的路径选择、嵌套、折叠和活动链接行为。系列导航 SHALL 只显示系列标题与 `14px` 文章标题；MUST NOT 显示章节序号、sidebar 作用域、用途说明、状态文字、本文目录活动竖线或标题缩进。当前文章 SHALL 使用整行 `accent` 选中面和强调前景色。

宽屏系列导航 SHALL 位于正文之外的左侧轨道，与右侧目录保持相同且稳定的顶部距离；窄屏 SHALL 使用零布局高度图标打开可滚动面板。没有 series 的文章 MUST NOT 渲染空侧栏，正文仍保持水平居中。

#### Scenario: 阅读单系列或多分组系列

- **WHEN** 当前文章具有自动 sidebar
- **THEN** 左侧按系列分组和文章顺序显示链接，以整行选中面标识当前文章，并与右侧本文目录保持明确视觉差异

#### Scenario: 滚动宽屏文章

- **WHEN** 长文同时具有左右侧轨且页面向下滚动
- **THEN** 两侧轨保持初始顶部位置，只有超出可用高度的侧轨内容在自身容器内滚动

#### Scenario: 在窄屏切换系列文章

- **WHEN** 访问者打开系列面板并选择另一篇文章
- **THEN** VitePress router 无整页刷新地进入目标 `/blog/<nested-slug>`，面板关闭且新文章成为活动项

### Requirement: 照片预览与拍摄信息

系统 SHALL 为普通 Markdown 图片、文章封面、`image-grid` 图片和 Live Photo 首帧提供统一的全屏原生 dialog，并 SHALL 按当前文章 DOM 顺序将这些图片组成同一预览序列。默认 SHALL 在与搜索 dialog mask 相同的单层 `overlay` 上完整显示原图，browser backdrop MUST 透明。预览两侧 SHALL 提供使用 `44px` 点击区和 `30px` Lucide icon 的上一张与下一张按钮，常态 MUST 无背景，hover SHALL 使用轻量 `overlay-foreground` 背景，并 MUST 支持键盘 `ArrowLeft` 与 `ArrowRight`；第一张 MUST NOT 显示上一张按钮，最后一张 MUST NOT 显示下一张按钮。右上角重置、信息和关闭按钮 SHALL 直接排列在 mask 上，使用 `36px` 点击区、`19px` Lucide icon、项目圆角和焦点环；常态与 hover 均 MUST 无背景、边框和阴影，常态图标为 `text-overlay-foreground/70`，hover 为 `text-overlay-foreground`。重置图标 MUST 使用 `Minimize2`，信息图标激活时 SHALL 显示实心强调状态。

桌面输入 SHALL 支持以指针为中心的滚轮缩放、放大后的左键拖动、双击和图标重置，缩放范围 MUST 为 `1x` 至 `5x`；触控输入 MUST 保留原生滚动。信息面板 SHALL 首次打开时按需加载 `exifr`、读取并缓存非 GPS EXIF；宽屏左图右栏、窄屏上下排列。面板 SHALL 使用 `overlay`、`overlay-foreground` 和轻量 backdrop blur，只显示存在的文件名、尺寸、像素、时间、相机、镜头、焦距、等效焦距、光圈、快门、ISO 与曝光补偿。

#### Scenario: 打开和关闭普通图片

- **WHEN** 访问者点击或用键盘激活可预览图片
- **THEN** dialog 默认只完整显示照片，允许 Escape 或右上角关闭，并在关闭后重置变换且恢复触发元素焦点

#### Scenario: 浏览当前文章图片

- **WHEN** 当前文章包含多张可预览图片，访问者点击翻页 icon 或按下 `ArrowLeft` / `ArrowRight`
- **THEN** dialog 按封面与 Markdown DOM 顺序切换，在序列边界隐藏无效方向，重置上一张的缩放、拖动和 Live Photo 状态，并让已打开的信息面板更新为当前照片

#### Scenario: 缩放并平移图片

- **WHEN** 桌面访问者滚轮放大并按住左键拖动照片
- **THEN** 图片在 `1x` 至 `5x` 内围绕指针缩放和平移，双击或 `Minimize2` 恢复原尺寸与居中位置

#### Scenario: 查看拍摄信息

- **WHEN** 访问者首次激活信息图标
- **THEN** 系统按需加载原图与非 GPS EXIF，在响应式信息区显示可用字段；无数据或失败时照片仍可查看并显示简洁空状态

### Requirement: Live Photo 交互

Live Photo SHALL 在正文和照片预览中以位于图片左上角的紧凑磨砂标识作为播放入口。标识 SHALL 由 Live Photo 徽记与 `LIVE` 文案组成，不得使用通用播放或暂停图标；播放期间徽记 SHALL 以五秒线性周期旋转。视频 SHALL 在原图片位置播放、不显示原生 controls；海报与视频比例不同时，标识 SHALL 跟随当前可见媒体的左上角。停止、结束、解析失败或播放失败后 MUST 恢复首帧。

显式 MP4 模式在首次激活前 MUST NOT 挂载视频或请求 MP4。Android Motion Photo 在首次激活前 MUST NOT 读取 JPEG 二进制、创建 Blob 或挂载视频；同一组件 SHALL 合并并发解析请求并在成功后复用 Blob，组件卸载时 MUST 释放 Object URL。正文与预览 SHALL 独立管理资源，关闭预览时 MUST 停止并释放预览 Blob。播放入口和视频 MUST 具有可访问名称与可见焦点，并 MUST 在桌面和移动视口保持稳定尺寸且不造成页面级水平溢出。

#### Scenario: 在正文播放 Live Photo

- **WHEN** 访问者激活图片左上角 `LIVE`
- **THEN** 视频才开始请求或解析并在图片位置播放，徽记旋转显示播放状态，再次激活或播放结束后恢复静态首帧

#### Scenario: 在预览播放 Android Motion Photo

- **WHEN** 访问者打开 Android 首帧预览并激活 `LIVE`
- **THEN** 系统才读取 JPEG 并生成预览专用 Blob，且关闭预览不会影响正文播放器资源

#### Scenario: 复用 Android 解析结果

- **WHEN** 访问者停止一个已成功解析的 Android Motion Photo 后再次播放
- **THEN** 同一组件复用已有 Blob，不重复读取和解析源文件

#### Scenario: Live Photo 加载或播放失败

- **WHEN** 源文件无法通过 CORS 读取、二进制定位失败或浏览器拒绝播放
- **THEN** 系统清理临时播放状态、恢复可用的静态首帧且不显示原生播放条

### Requirement: 音乐卡片与全局播放器

音乐卡片 SHALL 展示可选或自动封面、歌曲名、歌手、可选专辑、播放状态和进度入口。Motues details 卡片 SHALL 在客户端加载时合并并缓存 details 与 cover 请求，使用 details 的 `url_id` 准备音频接口，并 SHALL 在元数据或封面失败时分别降级；封面接口 MUST 使用歌曲 ID 而不是 `pic_id`。系统 SHALL 在 `Layout.vue` 中只挂载一个原生 `audio` 元素和一个全局播放器；选择曲目后，全局播放器 SHALL 默认出现在 viewport 左上角，以 `80×80px` 悬浮方形卡片提供播放、暂停与关闭，并 SHALL 在 VitePress 客户端路由切换后保持当前曲目。卡片 MUST 将放大、轻度模糊且增强色彩的专辑封面延展为连续背景，并 SHALL 通过高光和语义遮罩建立层次。卡片内部 MUST 显示由深色圆形唱片、同心纹路和中央圆形专辑封面组成的唱片视觉，MUST NOT 显示波形、中央音乐 icon 或底部控制面板。播放、暂停或加载状态 MUST 使用直接覆盖在唱片中心且无背景的 Lucide icon，并 MUST 保持静止而不随唱片旋转。播放图标 MUST 持续可见；支持 hover 的设备 MUST 仅在播放器 hover 或 focus 时显示播放期间的暂停图标，无 hover 输入 MUST 保持暂停入口可见。关闭控件 MUST 使用透明命中区包裹更小的可见圆点，可见层 SHALL 复用通用 popover、border、muted 和 accent 语义角色而非唱片深色；可见圆点中心 MUST 与方块右上角重合，使其一半外凸且不覆盖唱片主体。播放器移动至 viewport 边缘时 MUST 为该外凸区域保留可见空间。唱片 SHALL 以不快于 `18s` 一圈的速度线性旋转，并 MUST 只在音频播放时继续旋转；暂停时 MUST 保留当前角度，用户要求减少动态效果时 MUST 禁用旋转。播放器 MUST 支持通过卡片非按钮区域进行 pointer 拖动和在播放器聚焦时使用方向键移动，MUST 将位置限制在 viewport 内，且不得因曲目信息变化造成页面级布局偏移。播放器 SHALL 始终显示在系列导航、本文目录和回到顶部控件之上，并 SHALL 保持在 Header 全局导航和 dialog 之下。

直接 URL 与 Motues 来源在用户激活前 MUST NOT 发起音频 URL 请求；Motues details 与 cover MAY 为展示卡片在挂载时请求。系统 SHALL 缓存成功的 Motues 音频解析结果、合并同一来源的并发请求，并 MUST 使用播放尝试标识阻止快速切歌或关闭后的旧请求覆盖当前曲目。HTTPS 页面 SHALL 尝试把解析结果中的 HTTP 音频地址升级为 HTTPS。接口响应无效、网络失败或浏览器拒绝播放时，卡片或播放器 SHALL 显示简洁错误状态且文章保持可用。

#### Scenario: 播放远程音乐

- **WHEN** 访问者激活使用直接 URL 的音乐卡片
- **THEN** 唯一全局播放器显示唱片、唱片中心播放控制和右上角关闭并开始请求音频，播放后唱片缓慢旋转，文章内不创建额外 `audio` 元素

#### Scenario: 自动加载 Motues 元数据

- **WHEN** 页面挂载 Motues details 音乐卡片
- **THEN** 客户端自动取得并展示歌曲名、歌手、专辑和封面，但不请求音频 URL

#### Scenario: 按需解析 Motues 音频

- **WHEN** 访问者首次激活已加载元数据的 Motues 音乐卡片
- **THEN** 客户端才请求 url 接口、校验返回 URL 并交给唯一 `audio` 元素，重复播放复用成功结果

#### Scenario: 跨文章保持播放器

- **WHEN** 音乐播放器已经打开且访问者通过客户端路由进入另一篇文章
- **THEN** 播放器与当前曲目继续存在，并可在新页面继续控制或关闭

#### Scenario: 移动全局播放器

- **WHEN** 访问者拖动播放器卡片的非按钮区域或在播放器聚焦时按方向键
- **THEN** 播放器在 viewport 边界内移动、不遮断页面布局，且经过系列导航、本文目录或回到顶部控件时不会被它们覆盖

#### Scenario: 音乐解析或播放失败

- **WHEN** 第三方接口不可用、响应不含有效 URL、音频被 CORS 或浏览器策略阻止
- **THEN** 全局播放器停止加载并播报可访问错误状态，访问者仍可重试、关闭播放器和继续阅读

### Requirement: 自托管中文字体

系统 SHALL 通过 `@bean-blog/lxgw-wenkai-lite-webfont` workspace 子包自托管 LXGW WenKai Lite。子包 SHALL 固定官方 release 与资产校验信息，以可重复 Python/FontTools 脚本将 Regular 和 Medium 分别生成 `400`、`500` unicode-range WOFF2，并只暴露 `@font-face` CSS。博客 MUST 直接 import 子包且不得请求字体 CDN；全站 MUST 禁止 synthetic weight，使请求 `600/700` 的标题使用真实 Medium 轮廓。加载失败时 SHALL 回退到中文系统字体。

#### Scenario: 加载和更新字体

- **WHEN** 浏览器打开站点或开发者执行字体更新命令
- **THEN** 浏览器只请求同源所需分包，更新流程校验官方资产并可重复生成 400/500 CSS 与 WOFF2

### Requirement: 代码块与滚动回顶

fenced code block SHALL 使用 VitePress 与 Shiki 的语言标识、行号、Code Groups、行状态、复制按钮和客户端交互，主题只提供 Tailwind 视觉适配。文章滚动超过阈值后 SHALL 显示不占布局的回顶按钮，并在激活时平滑回到页面顶部。

#### Scenario: 复制代码并返回顶部

- **WHEN** 访问者复制代码或在长文章中激活回顶
- **THEN** 剪贴板获得原始代码并显示稳定反馈，页面平滑返回顶部且正文不发生布局偏移

### Requirement: 颜色主题与无障碍

系统 SHALL 使用 VitePress appearance 支持浅色和深色主题，首次访问尊重系统偏好，显式选择在刷新后保留。亮色页面画布 MUST 为纯白；普通内容层级 SHALL 主要依靠留白与排版，装饰性分割线 MUST NOT 切割文章头部、列表、归档、分页、目录和页脚。真实容器与交互控件 MAY 保留必要边界。

所有交互控件 MUST 具有可访问名称、可见焦点和键盘操作能力。固定格式控件 SHALL 使用稳定尺寸，状态变化 MUST NOT 引起不必要的布局偏移，桌面和移动视口 MUST NOT 出现页面级水平溢出、文本裁切或内容重叠。

#### Scenario: 切换主题

- **WHEN** 访问者修改 appearance
- **THEN** 页面立即使用对应同名语义令牌，控件状态保持一致且选择在后续访问中保留

#### Scenario: 仅用键盘操作

- **WHEN** 访问者通过键盘使用导航、搜索、主题、侧栏、目录、图片和文章控件
- **THEN** 所有主要功能均可到达、识别、激活和退出，焦点状态清晰可见
