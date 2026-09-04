## 1. Moment 富媒体 token 边界

- [x] 1.1 在 `momentContentPlugin` 中识别 `link-card`、`music` 与 `video` 的完整容器范围，使内部 token 不参与普通图片图库扫描
- [x] 1.2 保持普通尾部图库、图片混用和非受支持容器的既有构建期约束，并确认三种容器继续由原插件渲染

## 2. 示例与写作手册

- [x] 2.1 分别新增文章引用、音乐和视频的代表性 Moment 示例，并在视频示例中覆盖尾部图库
- [x] 2.2 更新正式 Moment 写作手册，说明三种支持类型、语法来源、顺序规则和不支持范围

## 3. 回归覆盖

- [x] 3.1 扩展 Moment Markdown 单元测试，覆盖三种容器渲染、视频和音乐封面隔离、尾部图库与非法后续内容
- [x] 3.2 扩展 Playwright Moment 场景，验证桌面与移动端富媒体渲染、卡片布局、媒体控件和普通图库共存

## 4. 验证

- [x] 4.1 对改动文件运行 Prettier，并执行相关单元测试、类型检查、生产构建与 OpenSpec strict validation

## 5. Live Photo 动态

- [x] 5.1 将既有 `live-photo` 容器接入 Moment 结构化媒体、独立示例、写作手册与桌面/移动回归
