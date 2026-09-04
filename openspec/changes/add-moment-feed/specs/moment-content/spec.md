## ADDED Requirements

### Requirement: 动态来源与内容契约

系统 SHALL 将 `src/moments/**/*.md` 作为短动态来源，并从相对路径派生唯一且支持多段结构的 slug。每条动态 MUST 提供有效 `date`，MAY 提供非空 `title`、有效 `updated`、非空 `location`、`tags`、`pinned` 和 `draft`；迁移期 MAY 继续通过 frontmatter `images` 提供图库。`tags`、最终图片集合、`pinned` 与 `draft` 未声明时 SHALL 分别归一化为空数组、空数组、`false` 与 `false`。

`images` MUST 最多包含九项，每项 MUST 提供非空 `src` 和非空 `alt`。系统 SHALL 规范化并去重标签，并 SHALL 在构建期拒绝无效字段、重复 slug 或重复稳定 fragment。

#### Scenario: 加载有效短动态

- **WHEN** 作者在 `src/moments/life/evening-walk.md` 中提供有效日期、简短 Markdown 正文、地点、标签和图片
- **THEN** 构建期动态模型包含 slug `life/evening-walk`、渲染后的正文、规范字段和唯一稳定 fragment

#### Scenario: 使用字段默认值

- **WHEN** 一条动态只提供有效 `date` 和正文
- **THEN** 系统接受该动态，并将标签与图片设为空数组、将置顶与草稿状态设为 `false`

#### Scenario: 拒绝无效动态

- **WHEN** 动态缺少日期、日期无效、可选字符串为空、图片缺少 `src` 或 `alt`、图片超过九张、slug 重复或 fragment 冲突
- **THEN** 构建失败并报告对应动态、字段或冲突来源

### Requirement: 动态 Markdown 与图片声明

系统 SHALL 使用项目的 VitePress Markdown renderer 在构建期渲染动态正文，并 SHALL 基于 parser token 从正文末尾提取标准 Markdown 图片、从渲染正文中移除对应图片段落，再将图片按原顺序写入动态模型供图库展示。系统 MUST NOT 在浏览器中解析 Markdown，也 MUST NOT 通过正则、最终 HTML 或整篇字符串替换提取图片。首版动态正文 SHALL 支持普通段落、强调、链接、列表和换行。

正文图片 MUST 连续位于正文末尾，MAY 位于一个或多个纯图片段落；每张图片 MUST 提供非空路径和非空 `alt`，每条动态 MUST 最多包含九张正文图片。系统 MUST 在构建期拒绝链接图片、图片 title、图文混排段落、分散图库、图片之后的正文，以及正文图片与 frontmatter `images` 混用。迁移期未使用正文图片的动态 SHALL 继续支持既有 frontmatter `images`。

#### Scenario: 渲染普通短 Markdown

- **WHEN** 动态正文包含段落、强调、链接、列表或换行
- **THEN** `/moment` 在动态专用排版作用域中显示构建期生成的对应 HTML

#### Scenario: 提取正文末尾图库

- **WHEN** 动态在简短正文之后使用一个或多个纯图片段落声明不超过九张、具有非空替代文本的标准 Markdown 图片
- **THEN** 构建期模型按原顺序包含对应 `src` 和 `alt`，渲染后的正文 HTML 不包含这些图片或空图片段落，`/moment` 通过既有图库展示它们

#### Scenario: 继续加载旧 frontmatter 图片

- **WHEN** 动态未使用正文图片但通过合法 frontmatter `images` 声明图库
- **THEN** 系统继续接受该动态，并使用既有图库展示图片

#### Scenario: 拒绝混用图片入口

- **WHEN** 同一动态同时声明正文图片和非空 frontmatter `images`
- **THEN** 构建失败并提示两种图片入口不能混用

#### Scenario: 拒绝非法正文图库结构

- **WHEN** 正文图片缺少路径或替代文本、超过九张、带有链接或 title、与文字混排、分散在正文中，或图片之后仍有正文
- **THEN** 构建失败并报告对应动态及图库约束

### Requirement: 发布状态与排序

系统 SHALL 在生产构建中从动态数据和所有 `/moment` 页面排除 `draft: true` 的动态，开发环境 SHALL 保留草稿并显示草稿标识。系统 SHALL 先展示 `pinned: true` 的动态，再展示普通动态，且两个集合内部均 MUST 按 `date` 从新到旧排列。

#### Scenario: 生产过滤草稿

- **WHEN** 动态目录同时包含已发布动态和草稿
- **THEN** 生产数据与 `/moment` 均不包含草稿，开发页面仍可预览草稿

#### Scenario: 排列置顶与普通动态

- **WHEN** 不同日期的动态同时包含置顶和普通条目
- **THEN** 所有置顶动态按日期倒序排在普通动态之前，普通动态也按日期倒序排列

### Requirement: 单一动态路由、分批加载与稳定链接

系统 SHALL 只提供 `/moment` 公开聚合路由，并 MUST NOT 生成 `/moment/page/<page>`。页面 SHALL 从同一份已过滤、已排序的构建期动态集合渲染首批内容，在底部哨兵进入阈值范围时追加下一批，直至无重复、无遗漏地展示全部动态；此过程 MUST NOT 请求分页页面或在浏览器中解析 Markdown。每条动态 SHALL 获得唯一稳定 DOM id，并 SHALL 可通过 `/moment` 与 fragment 的链接直接定位；此次 MUST NOT 为单条动态生成独立详情路由。

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
- **THEN** `/moment` 只显示动态，文章相关页面和 feed 只包含文章

#### Scenario: 动态进入 sitemap

- **WHEN** 生产构建生成 sitemap
- **THEN** 只有 `/moment` 作为动态页面进入 sitemap，不包含 `/moment/page/*`，单条动态 fragment 不作为独立 sitemap 条目

### Requirement: 动态站点配置

系统 SHALL 在业务配置中集中声明动态页封面列表、显示名、头像、签名和每批数量。封面列表 MUST 至少包含一项非空路径，并 SHALL 在规范化后去重；显示名、头像或签名未单独配置时 SHALL 回退到现有作者信息与站点图标。每批数量 MUST 是正整数，封面与媒体路径 SHALL 正确支持非根 `SITE_BASE`。

#### Scenario: 使用完整动态配置并随机选择封面

- **WHEN** 作者配置一张或多张动态封面、显示名、头像、签名和每批数量，并进入 `/moment`
- **THEN** 页面从封面列表随机选择一张用于本次个人区，停留期间保持不变，并据配置分批展示动态

#### Scenario: 拒绝无效封面列表

- **WHEN** 动态封面列表为空或包含空路径
- **THEN** 配置加载失败并报告封面列表约束

#### Scenario: 使用身份回退

- **WHEN** 动态显示名、头像或签名未单独配置
- **THEN** 页面分别使用现有作者名、站点图标或作者简介，且仍能正常构建
