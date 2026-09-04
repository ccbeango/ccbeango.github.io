## ADDED Requirements

### Requirement: 集中站点配置

系统 SHALL 在单一配置模块中维护站点名称、描述、关键词、规范 URL、base path、作者、导航、社交入口、首页精选上限、分页、图标、feed 和可选 Giscus 参数。配置模块 MUST 同时兼容 VitePress 服务端构建和浏览器 bundle，不得在浏览器中无条件访问 `process`。生产构建 MUST 要求有效的 `SITE_URL`，并 SHALL 使用 `SITE_BASE` 生成兼容非根部署的资源地址。

#### Scenario: 在开发环境读取配置

- **WHEN** 浏览器加载客户端配置且不存在 Node.js `process`
- **THEN** 页面正常运行并使用开发环境 base path

#### Scenario: 缺少生产域名

- **WHEN** 生产构建未提供规范 `SITE_URL`
- **THEN** 构建在生成绝对 URL 前明确失败并提示配置方式

### Requirement: 本地搜索

系统 SHALL 基于构建期已发布文章数据提供无需外部 API 的本地搜索，并 SHALL 匹配 Unicode 规范化后的中文标题、摘要、描述、标签和关键词。搜索 SHALL 通过可访问 dialog 按需打开，支持键盘操作、Escape 关闭、结果导航、空状态和关闭后的焦点恢复。

#### Scenario: 查询文章

- **WHEN** 访问者输入能匹配文章内容的查询
- **THEN** dialog 显示相关标题、摘要和链接，且结果中不包含草稿

#### Scenario: 没有匹配结果

- **WHEN** 查询不匹配任何已发布文章
- **THEN** dialog 显示明确空状态并保持关闭和重新输入能力

### Requirement: 页面元数据

系统 SHALL 为集合页和文章页生成唯一 title、description、keywords、canonical、Open Graph 与 Twitter Card 元数据，并 SHALL 从文章 frontmatter 与集中站点配置建立回退关系。页面 head SHALL 暴露 favicon、web manifest 和 feed discovery 链接。

#### Scenario: 生成文章元数据

- **WHEN** 构建处理一篇已发布文章
- **THEN** 输出 HTML 包含基于文章和站点配置生成的规范地址、描述、关键词及社交分享信息

### Requirement: Robots 与 Sitemap

系统 SHALL 生成 `robots.txt` 和 sitemap。robots SHALL 允许公开页面、排除非公开或不存在的 API 路径，并引用 sitemap 绝对地址；sitemap MUST 只包含公开集合页、有效分页、标签、归档和已发布文章的绝对地址，不得包含草稿、404 或空分页。

#### Scenario: 搜索引擎读取发现文件

- **WHEN** crawler 请求 robots 和 sitemap
- **THEN** 两个文件使用当前规范站点 URL，且公开路由集合一致并不包含草稿

### Requirement: 多格式 Feed

系统 SHALL 从统一已发布文章集合生成按日期从新到旧的 RSS 2.0、Atom 和 JSON Feed，分别输出 `/rss.xml`、`/atom.xml` 和 `/feed.json`，并 SHALL 让 `/index.xml` 提供与 RSS 2.0 等价的兼容内容。条目 SHALL 包含标题、摘要、正文、作者、发布日期、更新日期和绝对链接。

#### Scenario: 订阅博客

- **WHEN** feed reader 读取任一订阅地址
- **THEN** 客户端获得对应格式的有效已发布文章条目且不包含草稿

### Requirement: Manifest 与站点图标

系统 SHALL 提供 `site.webmanifest` 和 favicon PNG/SVG/ICO，并 SHALL 通过兼容 base path 的地址引用。manifest SHALL 包含站点名称、图标、主题颜色、背景颜色和 display 模式。

#### Scenario: 浏览器加载站点身份资源

- **WHEN** 浏览器打开任意公开页面
- **THEN** manifest 与图标请求成功，且资源地址在根路径和非根 base path 下均有效

### Requirement: 社交入口

系统 SHALL 只在首页以文字链接渲染集中配置中具有有效 URL 的 GitHub、X、小红书和 RSS 等社交入口。Header MUST NOT 渲染社交或订阅图标。外部链接 MUST 具有可访问名称和安全打开行为。

#### Scenario: 平台未配置

- **WHEN** 某个社交平台没有有效 URL
- **THEN** 页面不渲染该入口或空占位

### Requirement: 可选 Giscus 评论

系统 SHALL 只在 repository、category、mapping、reactions、input position 和语言等 Giscus 参数完整时，于文章末尾按需加载评论，并 SHALL 使用 VitePress appearance 同步评论主题。缺少配置或第三方加载失败 MUST NOT 影响文章阅读和其他页面能力。

#### Scenario: 加载评论

- **WHEN** 访问者打开文章且 Giscus 配置完整
- **THEN** 页面按 pathname 等配置加载评论，并与当前颜色主题保持一致

#### Scenario: 评论不可用

- **WHEN** Giscus 未配置或加载失败
- **THEN** 正文保持完整可用且不显示破坏布局的错误区域

### Requirement: 自动化发布门禁

GitHub Pages workflow SHALL 在上传静态 artifact 前执行不依赖浏览器的生产检查。检查 MUST 包含生成资产、字体校验、格式、authored styles、lint、类型、单元测试、生产构建和静态产物检查；任何检查失败时 MUST NOT 上传 artifact 或执行部署。桌面与移动端 Playwright 回归 SHALL 保留为本地完整检查，不得要求线上部署安装 Chromium。

#### Scenario: 发布检查失败

- **WHEN** GitHub Pages workflow 中任一质量检查或构建验证失败
- **THEN** 构建任务失败且部署任务不会发布本次静态产物

#### Scenario: 发布检查通过

- **WHEN** workflow 使用发布环境的 `SITE_URL` 与 `SITE_BASE` 完整执行 `pnpm check:build`
- **THEN** 系统上传本次已验证的 `src/.vitepress/dist` 并允许部署任务发布该 artifact

#### Scenario: 本地执行浏览器回归

- **WHEN** 维护者在本地执行 `pnpm check`
- **THEN** 系统在生产构建与静态产物检查后运行桌面和移动端 Playwright 回归

### Requirement: 提交前暂存文件校验

系统 SHALL 在安装依赖后注册 `pre-commit` hook，并 MUST 只对本次暂存的源文件执行对应 Prettier 与 ESLint 校验。主题 Vue、CSS 或样式审计脚本发生变化时 SHALL 同时执行 authored styles 审计。hook MUST 在检查失败时阻止提交，MUST NOT 自动修改或重新暂存文件，且 MUST NOT 在每次提交时执行类型检查、单元测试、生产构建或浏览器回归。

#### Scenario: 提交不符合规范的文件

- **WHEN** 暂存文件不符合 Prettier、ESLint 或相关 authored styles 规则
- **THEN** pre-commit 返回失败并保留开发者当前暂存内容，不创建提交

#### Scenario: 提交符合规范的文件

- **WHEN** 所有暂存文件通过适用的快速检查
- **THEN** pre-commit 成功且 Git 继续创建提交，不执行构建或 E2E
