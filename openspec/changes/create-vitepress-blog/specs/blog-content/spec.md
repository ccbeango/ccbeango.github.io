## ADDED Requirements

### Requirement: 文章来源与公开路由
系统 SHALL 将 `src/posts/**/*.md` 作为文章来源，并根据相对路径生成唯一、稳定且支持多段 slug 的 `/blog/<nested-slug>` 静态详情路由。系统 SHALL 同时提供 `/`、`/blog`、`/tags`、`/tags/<tag>`、`/archives` 和 404 页面。

#### Scenario: 发布多段 slug 文章
- **WHEN** 作者新增 `src/posts/guide/getting-started.md`
- **THEN** 系统生成 `/blog/guide/getting-started`，并在对应公开集合中提供该文章入口

#### Scenario: 检测重复路由
- **WHEN** 两个来源文件归一化后得到相同的完整 slug
- **THEN** 构建失败并报告冲突 slug 和来源文章

#### Scenario: 访问不存在的地址
- **WHEN** 访问者直接打开不存在的地址或通过客户端路由进入不存在的地址
- **THEN** 系统根据 VitePress 的 `page.isNotFound` 状态显示项目自定义 404 页面

### Requirement: Frontmatter 与派生数据
每篇文章 MUST 提供非空 `title` 和有效 `date`，并 MAY 提供 `updated`、`summary`、`description`、`keywords`、`featured`、`series`、`tags`、`draft`、`cover` 和 `canonical`。系统 SHALL 在构建期校验字段并派生 URL、中文字数和按每分钟 400 字计算且至少一分钟的阅读时间；摘要与描述缺一时 SHALL 相互回退。

#### Scenario: 处理有效文章
- **WHEN** 文章 frontmatter 满足契约
- **THEN** 统一文章数据包含规范字段、`/blog/<nested-slug>` URL、字数和阅读时间

#### Scenario: 拒绝无效文章
- **WHEN** 必填字段缺失、日期无效、数组成员为空或 canonical 不是有效 URL
- **THEN** 构建失败并报告对应文章和字段原因

### Requirement: 发布状态与文章集合
系统 SHALL 按 `date` 从新到旧建立统一文章集合。生产构建 MUST 从路由、列表、分页、精选、标签、归档、搜索、系列 sidebar、sitemap 和 feed 中排除 `draft: true` 的文章；开发环境 SHALL 允许访问草稿并显示草稿标识。首页 SHALL 只展示 `featured: true` 的已发布文章，并 SHALL 按集中配置的上限展示最新 5 篇；`/blog` SHALL 展示全部已发布文章。

#### Scenario: 生产环境过滤草稿
- **WHEN** 内容目录同时包含已发布文章和草稿
- **THEN** 所有生产公开数据和产物只包含已发布文章

#### Scenario: 查看精选与完整列表
- **WHEN** 访问者分别打开首页和 `/blog`
- **THEN** 首页按日期展示最多 5 篇最新精选文章，文章页按日期展示全部已发布文章，且两者均显示标题、可用摘要、中文日期和字数

### Requirement: 自动系列配置
`series` MUST 包含非空 `name` 和正整数 `order`，并 MAY 成对提供非空 `sidebar` 与正整数 `sidebarOrder`。系统 SHALL 校验同系列 `order` 唯一、同系列 sidebar 声明一致以及同 sidebar 作用域 `sidebarOrder` 唯一，并 SHALL 从已发布文章自动生成标准 VitePress `themeConfig.sidebar`。

未声明 `series.sidebar` 的系列 SHALL 形成独立侧栏；声明相同 `series.sidebar` 的多个系列 SHALL 形成按 `sidebarOrder` 排列的多个分组，组内文章按 `order` 排列。作者将文章加入系列时 MUST NOT 再修改站点 sidebar 配置。

#### Scenario: 加入单系列
- **WHEN** 作者为文章填写唯一的 `series.name` 和 `series.order`
- **THEN** 文章出现在该系列自动侧栏的正确位置

#### Scenario: 组合多分组侧栏
- **WHEN** 多个系列使用相同 `series.sidebar` 和不同 `series.sidebarOrder`
- **THEN** 每个成员页面获得包含全部系列且顺序稳定的标准 VitePress sidebar

#### Scenario: 拒绝冲突系列声明
- **WHEN** 系列顺序重复、sidebar 字段未成对填写、同系列声明不一致或 sidebar 分组顺序重复
- **THEN** 配置加载失败并报告冲突系列、文章和顺序

### Requirement: VitePress Markdown 能力
系统 SHALL 保留 VitePress 支持的标准 Markdown、GFM 表格、标题锚点、脚注、Custom Containers、GitHub Alerts、Code Groups、Shiki 代码高亮及行高亮、focus、diff、error 和 warning 状态，并 SHALL 增加任务列表和数学公式。普通 Markdown 图片 SHALL 由 VitePress 图片插件增加原生懒加载。主题与项目插件 MUST 使用 VitePress 生成的标准 token、markup 和客户端行为，不得重新实现这些语法。

#### Scenario: 渲染官方扩展
- **WHEN** 文章包含 Code Groups、五种基础 Custom Containers、自定义容器标题、五种 GitHub Alerts 或 Shiki 行状态
- **THEN** VitePress 负责解析和交互，页面以项目主题正确展示且保留语义

#### Scenario: 渲染常用增强内容
- **WHEN** 文章包含任务列表、行内或块级数学公式、表格、脚注和普通 Markdown 图片
- **THEN** 内容正确渲染，图片保留 alt 并包含 `loading="lazy"`

### Requirement: 三冒号多图布局
系统 SHALL 只接受由 `::: image-grid <mode>` 与 `:::` 包围的普通 Markdown 图片作为多图布局输入，并 SHALL 复用 VitePress Custom Container parser 的 token。`mode` MUST 为 `landscape`、`portrait`、`r73`、`r37`、`r64` 或 `r46`；前两种 MUST 包含 2 至 4 张图片，其余模式 MUST 包含 2 张图片。HTML comment 不属于多图布局语法。

#### Scenario: 渲染图片布局
- **WHEN** 合法 `image-grid` 容器包含对应数量的图片
- **THEN** 系统保留 alt 和源顺序，并输出 mode 对应的响应式布局

#### Scenario: 渲染四张宫格
- **WHEN** `landscape` 或 `portrait` 容器包含四张图片
- **THEN** 宽屏使用稳定的 `2x2` 宫格，窄屏仍按 Markdown 源顺序单列

#### Scenario: 拒绝无效图片容器
- **WHEN** 容器使用未知 mode、包含正文、发生嵌套、图片数量错误或缺少结束 `:::`
- **THEN** Markdown 处理失败并报告源文件、行号和具体原因

### Requirement: 三冒号 Live Photo
系统 SHALL 只接受包含一张普通 Markdown 图片的 `::: live-photo <mp4-url>` 或 `::: live-photo android` 容器。`mp4-url` 模式 SHALL 使用图片作为海报并播放指定视频；`android` 模式 SHALL 使用同一 JPEG 作为海报和 Android Motion Photo 源。HTML comment 不属于 Live Photo 语法。

Android 定位器 SHALL 验证 JPEG 文件头，优先从文件尾部反向查找最后一个 atom 长度与文件边界合法的 MP4 `ftyp` box，并在找不到时使用边界合法的 XMP `MediaDataOffset` 或 `MicroVideoOffset`。播放器 SHALL 以定位点至文件结尾建立可播放 Blob，不要求解析 MP4 box 或裁剪厂商 trailer。普通 JPEG、越界 atom 和越界 legacy offset MUST NOT 生成视频 Blob。

#### Scenario: 播放显式视频
- **WHEN** 合法容器提供 MP4 URL 和一张海报图片
- **THEN** 页面显示海报和 `LIVE` 入口，并可在原位置无原生 controls 播放视频

#### Scenario: 播放 Android Motion Photo
- **WHEN** 访问者激活 `android` 模式 Live Photo
- **THEN** 客户端按需读取 JPEG、定位内嵌 MP4 并生成浏览器可播放的 Blob

#### Scenario: 回退 Android 定位方式
- **WHEN** Android JPEG 没有可用的尾部 `ftyp` 定位但包含合法 legacy XMP offset
- **THEN** 系统按 offset 定位视频并允许播放

#### Scenario: 保留真实样本的厂商尾部数据
- **WHEN** 定位器处理 Android 功能样本 `live-images/android-motion-photo.jpg`
- **THEN** 系统从最后一个合法 `ftyp` 起点保留至文件结尾，并将包含厂商 trailer 的结果交给浏览器播放

#### Scenario: 拒绝无效 Android 视频位置
- **WHEN** 普通 JPEG 不包含合法 `ftyp`、atom 长度越界或 legacy offset 越界
- **THEN** 系统不创建视频 Blob，并继续保留静态图片

#### Scenario: 拒绝无效 Live Photo 容器
- **WHEN** 容器缺少 mode、包含非图片内容、多于一张图片、发生嵌套或缺少结束 `:::`
- **THEN** Markdown 处理失败并报告源文件、行号和具体原因

### Requirement: 静态分页
系统 SHALL 按集中配置的每页文章数生成分页结果和可直接访问的静态路径，并 SHALL 在边界处阻止越界导航。

#### Scenario: 在分页之间导航
- **WHEN** 已发布文章超过一页且访问者选择上一页或下一页
- **THEN** 页面进入有效静态路径并展示正确且不重复的文章集合

### Requirement: 标签与归档
系统 SHALL 对标签执行 Unicode 规范化、slug 转换、去重和计数，并 SHALL 按年份从新到旧生成归档，年内文章按日期从新到旧排列。

#### Scenario: 按标签浏览
- **WHEN** 访问者选择一个标签
- **THEN** 标签详情只显示关联的已发布文章

#### Scenario: 按年份浏览
- **WHEN** 访问者打开 `/archives`
- **THEN** 页面按年份和日期顺序展示已发布文章链接

### Requirement: 博客内使用手册
项目 SHALL 将快速开始、站点配置、文章写作、Markdown 扩展、图片布局、Live Photo 和部署说明作为 `src/posts/guide` 下的正式博客文章，并 SHALL 通过自动多分组 sidebar 形成连续使用手册。README SHALL 只保留仓库入口、命令摘要和手册索引；项目 MUST NOT 维护内容重复的 `docs` 或无说明价值的测试文章。手册中的真实示例 SHALL 同时用于自动化回归。普通图片、文章封面、图片网格和显式 MP4 海报 SHALL 复用同一张通用演示图片，不得为不同布局复制图片文件；Android Motion Photo MAY 另保留一张真实功能样本。

#### Scenario: 阅读并验证使用手册
- **WHEN** 用户访问 `/blog/guide/*` 或测试验证 Markdown、系列、图片与 Live Photo
- **THEN** 同一组手册文章既提供完整用法，也作为对应功能的测试样例，并只保留一张共享通用演示图片与一张 Android 功能样本
