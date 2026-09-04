## ADDED Requirements

### Requirement: 动态正文中的既有富媒体容器

系统 SHALL 允许 `src/moments/**/*.md` 的正文使用既有 `link-card`、`music`、`video` 和 `live-photo` 容器，并 MUST 使用与 `src/posts` 相同的容器语法、构建期校验和 Vue 组件。系统 MUST NOT 为 Moment 建立重复的链接、音频、视频或 Motion Photo 解析、播放器或卡片实现。

#### Scenario: 渲染文章引用、音乐、视频和 Live Photo

- **WHEN** 一条有效动态在短文本中声明合法的 `link-card`、`music`、`video` 和 `live-photo` 容器
- **THEN** `/moment` 依次显示既有 `LinkedCard`、`MusicCard`、`VideoPlayer` 和 `LivePhoto`，普通文本保留在对应位置

#### Scenario: 保留既有容器校验

- **WHEN** 动态中的文章引用、音乐、视频或 Live Photo 容器缺少既有必填参数、使用不受支持地址或违反容器内部结构
- **THEN** 构建失败并由对应容器规则报告动态源文件、行号和既有约束错误

### Requirement: 富媒体与动态图库隔离

系统 SHALL 将 `music`、`video` 与 `live-photo` 容器中的可选 Markdown 封面或静态首帧归属到对应富媒体组件，MUST NOT 将它们写入 `MomentData.images`、计入九张上限或作为正文末尾图库处理。普通 Markdown 图片仍 SHALL 按既有动态图库契约处理，且可以紧随受支持富媒体容器出现。

#### Scenario: 容器封面或静态首帧不进入图库

- **WHEN** 动态包含带 Markdown 封面的音乐、视频或 Live Photo 容器，以及正文末尾的一张普通动态图片
- **THEN** 对应组件分别接收自己的封面或静态首帧，动态图库只包含末尾普通图片且按既有方式显示

#### Scenario: 维持尾部图库边界

- **WHEN** 动态在普通图片图库之后继续声明正文或富媒体容器
- **THEN** 构建失败并报告正文图片必须位于正文末尾的既有约束

### Requirement: 动态富媒体写作说明

正式动态写作手册 SHALL 说明 Moment 支持的四种富媒体容器、复用的长文章语法、音乐、视频和 Live Photo 封面或静态首帧与图库的归属、正文顺序，以及首版明确不支持的复杂类型。

#### Scenario: 作者查阅富媒体写法

- **WHEN** 作者需要在短动态中引用文章、分享音乐、嵌入视频或 Live Photo
- **THEN** 手册提供可直接使用的简短示例和到完整 Markdown 容器说明的链接
