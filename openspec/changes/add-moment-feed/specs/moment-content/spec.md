## ADDED Requirements

### Requirement: 动态来源与内容契约

系统 SHALL 将 `src/moments/**/*.md` 作为短动态来源，并从相对路径派生唯一且支持多段结构的 slug。每条动态 MUST 提供有效 `date`，MAY 提供非空 `title`、有效 `updated`、非空 `location`、`tags`、`pinned` 和 `draft`；迁移期 MAY 继续通过 frontmatter `images` 提供图库。`tags`、最终图片集合、`pinned` 与 `draft` 未声明时 SHALL 分别归一化为空数组、空数组、`false` 与 `false`。

`images` MUST 最多包含九项，每项 MUST 提供非空 `src` 和非空 `alt`。系统 SHALL 规范化并去重标签，并 SHALL 在构建期拒绝无效字段、重复 slug 或重复稳定 fragment。

#### Scenario: 加载有效短动态

- **WHEN** 作者在 `src/moments/life/evening-walk.md` 中提供有效日期、简短 Markdown 正文、地点、标签和图片
- **THEN** 构建期动态模型包含 slug `life/evening-walk`、有序内容块、规范字段和唯一稳定 fragment

#### Scenario: 使用字段默认值

- **WHEN** 一条动态只提供有效 `date` 和正文
- **THEN** 系统接受该动态，并将标签与图片设为空数组、将置顶与草稿状态设为 `false`

#### Scenario: 拒绝无效动态

- **WHEN** 动态缺少日期、日期无效、可选字符串为空、图片缺少 `src` 或 `alt`、图片超过九张、slug 重复或 fragment 冲突
- **THEN** 构建失败并报告对应动态、字段或冲突来源

### Requirement: 动态 Markdown 与普通图库

系统 SHALL 使用项目的 VitePress Markdown renderer 在构建期解析动态正文，并 SHALL 基于 parser token 从正文末尾提取标准 Markdown 图片、从正文 token 流移除对应图片段落，再将图片按原顺序写入动态模型供图库展示。系统 MUST NOT 在浏览器中解析 Markdown，也 MUST NOT 通过正则、最终 HTML 或整篇字符串替换提取图片。动态正文 SHALL 支持普通段落、强调、链接、列表和换行。

正文图片 MUST 连续位于正文末尾，MAY 位于一个或多个纯图片段落；每张图片 MUST 提供非空路径和非空 `alt`，每条动态 MUST 最多包含九张正文图片。系统 MUST 在构建期拒绝链接图片、图片 title、图文混排段落、分散图库、图片之后的正文或富媒体，以及正文图片与 frontmatter `images` 混用。迁移期未使用正文图片的动态 SHALL 继续支持既有 frontmatter `images`。

#### Scenario: 渲染普通短 Markdown

- **WHEN** 动态正文包含段落、强调、链接、列表或换行
- **THEN** `/moment` 在动态专用排版作用域中显示构建期生成的对应 HTML

#### Scenario: 提取正文末尾图库

- **WHEN** 动态在简短正文之后使用一个或多个纯图片段落声明不超过九张且具有非空替代文本的标准 Markdown 图片
- **THEN** 构建期模型按原顺序包含对应 `src` 和 `alt`，普通内容块不包含这些图片或空图片段落，`/moment` 通过既有图库展示它们

#### Scenario: 继续加载旧 frontmatter 图片

- **WHEN** 动态未使用正文图片但通过合法 frontmatter `images` 声明图库
- **THEN** 系统继续接受该动态，并使用既有图库展示图片

#### Scenario: 拒绝混用图片入口

- **WHEN** 同一动态同时声明正文图片和非空 frontmatter `images`
- **THEN** 构建失败并提示两种图片入口不能混用

#### Scenario: 拒绝非法正文图库结构

- **WHEN** 正文图片缺少路径或替代文本、超过九张、带有链接或 title、与文字混排、分散在正文中，或图片之后仍有正文或富媒体
- **THEN** 构建失败并报告对应动态、行号及图库约束

### Requirement: 动态正文中的既有富媒体

系统 SHALL 允许动态正文在普通文本之间或普通图库之前使用既有 `link-card`、`music`、`video` 和 `live-photo` 容器，并 MUST 使用与 `src/posts` 相同的容器语法、构建期校验和 Vue 组件。系统 MUST NOT 为 Moment 建立重复的文章引用、音频、视频、Motion Photo 参数解析或渲染实现。

`music`、`video` 与 `live-photo` 容器中的封面或静态首帧 MUST 只归属对应富媒体，MUST NOT 被写入普通图库、计入九张上限或参与 frontmatter 图片混用判断。

#### Scenario: 混排四种富媒体

- **WHEN** 一条有效动态在短文本中声明合法的文章引用、音乐、视频和 Live Photo 容器
- **THEN** `/moment` 按源文件顺序显示既有 `LinkedCard`、`MusicCard`、`VideoPlayer` 和 `LivePhoto`，并保留各段普通文本的位置

#### Scenario: 保留既有容器校验

- **WHEN** 动态中的富媒体容器缺少既有必填参数、使用不受支持地址或违反容器内部结构
- **THEN** 构建失败并由对应容器规则报告动态源文件、行号和既有约束错误

#### Scenario: 隔离封面与普通图库

- **WHEN** 动态包含带 Markdown 封面或静态首帧的音乐、视频或 Live Photo，并在正文末尾声明普通图片
- **THEN** 对应组件接收自己的封面或静态首帧，普通图库只包含末尾图片且保持既有顺序和上限

### Requirement: 构建期有序内容块

系统 SHALL 在 Markdown parser token 仍保留源顺序时生成 `MomentContentBlock[]`，并 SHALL 使用同一有序数组表示普通 Markdown HTML、文章引用、音乐、视频和 Live Photo。富媒体插件 SHALL 在 Moment 环境中把结构化数据写入对应 token metadata，非 Moment 来源 SHALL 继续输出长文章使用的既有组件标签。

系统 MUST NOT 在客户端内容模型或最终 HTML 中写入内部富媒体注释 marker，MUST NOT 通过正则扫描或独立媒体数组重建顺序，也 MUST NOT 通过查询子组件 DOM 属性识别内容类型。`MomentCard` SHALL 直接根据内容块的可判别类型渲染对应组件，并从内容块数据判断是否包含可播放媒体。

#### Scenario: 构建混排内容块

- **WHEN** 一条动态在多个普通 Markdown 段落之间插入一种或多种受支持富媒体容器
- **THEN** 构建期模型按源文件顺序生成 HTML 与富媒体内容块，`/moment` 按相同顺序显示全部内容

#### Scenario: 不输出内部 marker

- **WHEN** 构建包含受支持富媒体的动态
- **THEN** 客户端内容模型和渲染 HTML 均不包含 `bean-moment-rich-media` 注释 marker

#### Scenario: 直接识别可播放媒体

- **WHEN** 动态内容块包含音乐、视频或 Live Photo
- **THEN** 卡片直接根据内容块类型禁用六行正文裁切，且不查询媒体组件的 DOM 属性

#### Scenario: 保持长文章输出

- **WHEN** 长文章使用文章引用、音乐、视频或 Live Photo 容器
- **THEN** 对应 Markdown 插件继续输出既有 Vue 组件并保持原有行为

### Requirement: 发布状态与排序

系统 SHALL 在生产构建中从动态数据和 `/moment` 页面排除 `draft: true` 的动态，开发环境 SHALL 保留草稿并显示草稿标识。系统 SHALL 先展示 `pinned: true` 的动态，再展示普通动态，且两个集合内部均 MUST 按 `date` 从新到旧排列。

#### Scenario: 生产过滤草稿

- **WHEN** 动态目录同时包含已发布动态和草稿
- **THEN** 生产数据与 `/moment` 均不包含草稿，开发页面仍可预览草稿

#### Scenario: 排列置顶与普通动态

- **WHEN** 不同日期的动态同时包含置顶和普通条目
- **THEN** 所有置顶动态按日期倒序排在普通动态之前，普通动态也按日期倒序排列

### Requirement: 单一动态路由、分批加载与稳定链接

系统 SHALL 只提供 `/moment` 公开聚合路由，并 MUST NOT 生成 `/moment/page/<page>`。页面 SHALL 从同一份已过滤、已排序的构建期动态集合渲染首批内容，在底部哨兵进入阈值范围时追加下一批，直至无重复、无遗漏地展示全部动态；此过程 MUST NOT 请求分页页面或在浏览器中解析 Markdown。每条动态 SHALL 获得唯一稳定 DOM id，并 SHALL 可通过 `/moment` 与 fragment 的链接直接定位；系统 MUST NOT 为单条动态生成独立详情路由。

#### Scenario: 滚动加载后续动态

- **WHEN** 已发布动态数量超过每批配置且访问者滚动到底部哨兵附近
- **THEN** 页面追加下一批已构建动态、保留既有条目和滚动位置，并显示加载中或完成状态而不改变 URL

#### Scenario: 使用手动加载回退

- **WHEN** 键盘用户激活“加载更多动态”或浏览器不支持自动观察
- **THEN** 页面追加下一批动态，并在全部展示后移除加载命令、显示完成状态

#### Scenario: 分享并直接打开较后动态

- **WHEN** 访问者复制任意动态链接并在新页面直接打开
- **THEN** 链接指向 `/moment` 与稳定 fragment，页面自动揭示包含目标的批次并定位到该动态

### Requirement: 动态与长文章隔离

系统 SHALL 让 `/moment` 只消费 `src/moments`，让现有文章列表、文章路由、搜索、标签、归档、系列 sidebar、RSS、Atom 和 JSON Feed 继续只消费 `src/posts`。新增动态 MUST NOT 改变任何现有文章 URL、计数、排序或发布附属物。

#### Scenario: 同时存在文章和动态

- **WHEN** `src/posts` 与 `src/moments` 同时包含已发布内容
- **THEN** `/moment` 只显示动态，文章相关页面和 Feed 只包含文章

#### Scenario: 动态进入 sitemap

- **WHEN** 生产构建生成 sitemap
- **THEN** 只有 `/moment` 作为动态页面进入 sitemap，不包含分页路由，单条动态 fragment 不作为独立 sitemap 条目

### Requirement: 动态站点配置

系统 SHALL 在业务配置中集中声明动态页封面列表、显示名、头像、签名和每批数量。封面列表 MUST 至少包含一项非空的本地公开路径或完整远程 URL，并 SHALL 在规范化后去重；显示名、头像或签名未单独配置时 SHALL 回退到现有作者信息与站点图标。每批数量 MUST 是正整数，本地封面、头像和媒体路径 SHALL 正确支持非根 `SITE_BASE`，远程 URL SHALL 保持原地址。

#### Scenario: 使用完整动态配置并随机选择封面

- **WHEN** 作者配置一张或多张动态封面、显示名、头像、签名和每批数量，并进入 `/moment`
- **THEN** 页面从封面列表随机选择一张用于本次个人区，停留期间保持不变，并据配置分批展示动态

#### Scenario: 使用远程封面

- **WHEN** 封面列表包含完整 `http` 或 `https` URL
- **THEN** 页面直接使用该远程 URL，不为其拼接站点 base path

#### Scenario: 拒绝无效封面列表

- **WHEN** 动态封面列表为空或包含空路径
- **THEN** 配置加载失败并报告封面列表约束

#### Scenario: 使用身份回退

- **WHEN** 动态显示名、头像或签名未单独配置
- **THEN** 页面分别使用现有作者名、站点图标或作者简介，且仍能正常构建
