## Why

当前长文章已支持文章引用、音乐卡片、视频播放器和 Live Photo，但 Moment 的正文图片提取会把媒体容器中的封面或静态首帧错误识别为普通动态图库。短动态因此无法稳定复用这些已经存在且经过验证的内容类型。

## What Changes

- 允许 Moment 正文在普通短文本中使用既有的 `link-card`、`music`、`video` 和 `live-photo` 容器。
- 调整 Moment 的构建期 token 处理，使音乐、视频和 Live Photo 的封面或静态首帧属于对应容器，不参与正文末尾图库提取、数量上限或混用校验。
- 保持现有容器插件的参数、地址、封面和嵌套校验，不新增第二套 Moment 专用语法或组件。
- 保持正文末尾普通图片图库的连续、纯图片段落、最多九张和必填 alt 规则；图库可以位于富媒体容器之后。
- 更新动态写作手册、示例内容以及单元和浏览器回归测试，覆盖四种容器、容器封面与动态图库组合。

## Capabilities

### New Capabilities

- `moment-rich-media`: Moment 正文对既有文章引用、音乐和视频容器的构建期识别、渲染和写作边界。

### Modified Capabilities

- `moment-content`: Moment 正文图片提取规则调整为排除受支持富媒体容器内部的封面图片。

## Impact

- 修改 `src/.vitepress/markdown/moment-content.ts` 的 parser token 扫描逻辑。
- 复用现有 `link-card`、`music`、`video`、`live-photo` Markdown 插件和已注册的 Vue 组件，不增加依赖或运行时服务。
- 更新 `src/posts/guide/posting-moments.md`、Moment 示例、单元测试和 Playwright 回归。
- `/moment` 继续是单一静态聚合页面；长文章 Markdown 行为、文章数据模型、路由、搜索和 Feed 均不改变。
