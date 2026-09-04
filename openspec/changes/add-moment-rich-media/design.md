## Context

长文章的 `link-card`、`music`、`video` 和 `live-photo` 容器分别在独立的 Markdown core rule 中校验并替换为已注册的 Vue 组件。Moment 使用另一条较早执行的 core rule，从正文末尾提取标准图片段落为图库；它会递归扫描 token，因此会把媒体容器中的封面或静态首帧视作普通正文图片并拒绝构建。

Moment 不应复制容器的参数解析或渲染逻辑。它需要在容器插件替换 token 前识别可信边界，跳过受支持容器中的内容，继续处理容器以外的普通图片，并让既有插件在后续执行时完成原有校验和替换。

## Goals / Non-Goals

**Goals:**

- 允许 Moment 正文混排短文本与既有文章引用、音乐、视频和 Live Photo 容器。
- 使音乐、视频封面和 Live Photo 静态首帧仅归属容器，不进入 Moment 图片模型。
- 保持 Moment 尾部图库、旧 frontmatter 兼容、图片上限与图片可访问性规则。
- 复用现有 Vue 组件、base path 处理、远程媒体限制和播放行为。

**Non-Goals:**

- 不允许 Moment 使用所有长文章 Markdown 扩展，不在本 change 中开放代码组、数学公式或 `image-grid`。
- 不为 Moment 新增不同于长文章的容器参数、渲染组件或音乐播放状态。
- 不改变长文章容器语法、校验、路由、搜索或 Feed。
- 不把视频、音乐封面或 Live Photo 静态首帧转换为 Moment 图库或接入照片预览。

## Decisions

### 1. 在 Moment token 扫描中排除受支持容器范围

`momentContentPlugin` 保持在其他容器插件之前执行。它识别 `container_link-card`、`container_music`、`container_video` 与 `container_live-photo` 的成对开闭 token，将这些完整范围标记为富媒体内容，尾部图库提取与较早图片检测都跳过范围内 token。这样视频、音乐封面与 Live Photo 静态首帧不会成为动态图库，容器本身仍保留给既有 core rule 替换为 `LinkedCard`、`MusicCard`、`VideoPlayer`、`LivePhoto`。

备选方案是把 Moment 插件移动到所有容器插件之后。这样虽然也能避开图片封面，但已替换的 HTML block 无法区分受支持和未支持的富媒体，可能无意放开其它容器，因此不采用。

### 2. 容器沿用长文契约，Moment 不建立平行校验

Moment 不解析 URL、歌曲元信息、链接文字、描述、封面或 Motion Photo 数据。每种容器继续由现有插件约束：文章引用使用一条链接和可选说明，音乐使用安全的远程来源或 Motues 地址，视频使用地址和可选单张封面，Live Photo 使用 MP4 或 Android mode 和一张静态首帧。错误应继续由对应容器插件以源文件与行号报告。

备选方案是为 Moment 复制三个 parser rule 或在 frontmatter 定义媒体数组。前者会造成规则漂移，后者会把内容拆离 Markdown 正文，均不采用。

### 3. 富媒体可出现在正文任意位置，普通图库仍必须在最后

正文可在任意普通段落之间插入受支持容器。普通 Markdown 图片仍必须连续出现在整个正文末尾的纯图片段落中；容器自身的封面或静态首帧不影响该判断。受支持容器可以位于图库之前，但普通正文或额外富媒体容器不得出现在图库之后。

这延续当前图库由卡片独立展示的行为。把所有媒体都统一转换为图库会破坏视频控制和音乐播放卡片，因此不采用。

## Risks / Trade-offs

- [容器 token 不完整或嵌套时跳过范围会掩盖错误] → 仅跳过明确的成对同类 token；不完整或嵌套结构继续交给现有容器插件报错。
- [未来新增容器时被自动允许] → 支持类型使用显式集合，新容器必须通过独立 change 添加。
- [Moment 卡片中的富媒体过高或窄屏拥挤] → 复用现有组件的响应式宽度、控制与语义颜色，并加入桌面和移动浏览器验收。
- [远程音频、封面、视频或 Motion Photo 原图失效] → 沿用现有浏览器加载与组件错误状态；静态 Moment 正文和其他内容不受影响。

## Migration Plan

1. 为 Moment token 解析增加受支持容器范围识别，并以单元测试固定图库与封面边界。
2. 使用现有四种容器语法分别增加文章引用、音乐、视频和 Live Photo 代表性 Moment，不新增资源或依赖。
3. 更新正式写作手册，说明可用类型、已有语法链接、顺序与不支持的类型。
4. 补充生产构建和浏览器回归；回滚时移除该 Moment 中的容器写法并恢复原 token 扫描即可，长文容器不受影响。

## Open Questions

无阻塞问题。Moment 的媒体密度、自动播放和外部内容策略继续沿用各既有组件的当前行为。
