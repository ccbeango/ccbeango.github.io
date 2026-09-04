## MODIFIED Requirements

### Requirement: 动态 Markdown 与图片声明

系统 SHALL 使用项目的 VitePress Markdown renderer 在构建期渲染动态正文，并 SHALL 基于 parser token 从正文末尾提取标准 Markdown 图片、从渲染正文中移除对应图片段落，再将图片按原顺序写入动态模型供图库展示。系统 MUST NOT 在浏览器中解析 Markdown，也 MUST NOT 通过正则、最终 HTML 或整篇字符串替换提取图片。首版动态正文 SHALL 支持普通段落、强调、链接、列表和换行，以及既有 `link-card`、`music`、`video` 和 `live-photo` 容器。

正文图片 MUST 连续位于正文末尾，MAY 位于一个或多个纯图片段落；每张图片 MUST 提供非空路径和非空 `alt`，每条动态 MUST 最多包含九张正文图片。系统 MUST 在构建期拒绝链接图片、图片 title、图文混排段落、分散图库、图片之后的正文，以及正文图片与 frontmatter `images` 混用。`music`、`video` 与 `live-photo` 容器中的封面或静态首帧 MUST NOT 被视为正文图片。迁移期未使用正文图片的动态 SHALL 继续支持既有 frontmatter `images`。

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
