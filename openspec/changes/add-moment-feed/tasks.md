## 1. 内容模型与共享基础设施

- [x] 1.1 提取文章与动态可共用的日期解析、slug、草稿过滤、排序、分页和路径工具，并用现有测试确认 `/blog` 行为不变
- [x] 1.2 定义 `MomentFrontmatter`、图片项和 `MomentData` 类型及 Zod schema，覆盖默认值、标签去重、最多九图、嵌套 slug 与 fragment 唯一性校验
- [x] 1.3 基于 VitePress parser token 约束动态正文图片入口，并实现构建期 Markdown 渲染、生产草稿过滤及置顶优先的日期倒序
- [x] 1.4 建立 `moments.data.ts` 和共享的文件加载入口，保证页面消费独立动态模型且不改变文章集合

## 2. 配置与静态路由

- [x] 2.1 扩展 `site.config.ts`，集中配置动态封面、显示名、头像、签名和每批数量，提供作者身份回退、正整数校验和 base path 支持
- [x] 2.2 新增单一 `/moment` 页面和 `layout: moment` 分支，不为短动态生成原稿、分页或详情路由
- [x] 2.3 保持现有文章分页组件与 `/blog` 第一页、后续页链接行为不变
- [x] 2.4 为主导航增加“动态”，验证动态页、稳定 fragment 的直接访问、客户端导航、canonical 与 sitemap 行为

## 3. Icefox 式动态页面

- [x] 3.1 实现复用现有内容容器和设计令牌的个人封面区域，包括真实图片、右下昵称、越界方形头像、签名及身份配置回退
- [x] 3.2 实现分隔式 `MomentCard`，以固定头像列和弹性正文列展示作者、草稿或置顶标识、构建期 Markdown、日期、地点和标签
- [x] 3.3 实现基于实际溢出的六行正文限制、“全文/收起”、`aria-expanded` 和内容更新后的重新测量
- [x] 3.4 实现一至九图图库：单图保留比例，二图和四图两列，其他多图三列，并声明稳定尺寸、懒加载、替代文本和 base path
- [x] 3.5 在动态页接入现有 `PhotoPreview`，验证指针与键盘打开、源顺序、焦点恢复、缩放、拖动和明暗模式，不新增第二套 lightbox
- [x] 3.6 使用 Lucide `Ellipsis` 实现可访问的操作 popover 和复制稳定链接命令，覆盖 Clipboard API 回退、成功或失败反馈、Escape、外部点击和焦点恢复
- [x] 3.7 实现无动态空状态和连续动态流，确保不显示虚假点赞、点赞数、逐条评论或无实际行为的控件

## 4. 视觉资源、文档与验证

- [x] 4.1 准备来源明确的本地封面、头像与代表性图库测试资源，覆盖无图、一图、二图、三图、四图、九图、纯图片、溢出正文、置顶和草稿动态
- [x] 4.2 使用 Tailwind utility 和现有 `oklab()` 语义令牌完成样式，必要 scoped style 仅处理动态 Markdown、行数测量或复杂选择器，并通过 authored styles 审计
- [x] 4.3 新增动态写作正式手册，说明目录、frontmatter、图片写作方式、资源路径、Markdown 范围、草稿、置顶、滚动加载、稳定链接及首版互动边界
- [x] 4.4 补充单元测试，覆盖内容校验、正文图片规则、草稿过滤、置顶排序、朋友圈时间、fragment、配置回退、base path 和文章数据隔离
- [x] 4.5 补充 Playwright 回归，覆盖桌面与移动布局、明暗模式、文本展开、所有图库分支、照片预览、复制链接、popover 键盘行为、专用 Header、滚动加载和空状态
- [x] 4.6 在 dev 服务中以桌面和移动截图检查 Icefox 信息结构与 Bean Blog 视觉连续性，并修正溢出、重叠、布局偏移和无障碍问题
- [x] 4.7 对改动文件运行 Prettier，执行格式、样式、lint、类型、单元与浏览器检查，并运行 `openspec validate add-moment-feed --strict`

## 5. 专用 Header、滚动加载与朋友圈时间

- [x] 5.1 修订 proposal、design 与规格，替换全局 Header、静态分页和绝对日期决策，并通过 OpenSpec strict validation
- [x] 5.2 新增覆盖封面的 Moment 专用 Header，提供返回首页、滚动状态和主题切换，同时让 `/moment` 跳过通用 Header
- [x] 5.3 将动态配置改为每批数量，只保留 `/moment`，实现滚动哨兵、手动回退、完成状态和深链自动揭示，复制链接统一为 `/moment#fragment`
- [x] 5.4 实现并测试 Hugo-Theme-Amigo 规则的朋友圈时间显示，保留标准 `datetime` 与精确时间提示
- [x] 5.5 更新正式手册、README、静态产物验证和 Playwright 覆盖，确认 `/blog` 分页、文章发现能力和 feed 不受影响
- [x] 5.6 完成 Prettier、样式审计、类型、单元、生产构建、桌面与移动端浏览器及截图验收，并再次运行 OpenSpec strict validation
- [x] 5.7 将 Moment Header 限制为中央内容宽度并改用无边框磨砂背景，为页面增加 `muted` 外层与 `background` 中央信息流层，验证亮暗模式视觉层级
- [x] 5.8 将 Moment 专用 Header 高度调整为 52px，并在桌面与移动 viewport 验证稳定尺寸

## 6. 正文图片写作

- [x] 6.1 修订 proposal、design 与规格，定义正文末尾纯图片段落、最多九图、必填 alt、旧 frontmatter 兼容和禁止混用规则
- [x] 6.2 基于 VitePress parser token 提取正文末尾图片、移除对应正文 token，并将结果接入既有 `MomentData.images` 与 `MomentGallery`
- [x] 6.3 将示例动态和正式手册迁移到正文图片语法，并记录旧 frontmatter `images` 的临时兼容方式
- [x] 6.4 补充单元测试，覆盖提取顺序、正文 HTML 移除、旧字段兼容、混用、位置、段落内容、链接、title、alt 和九图上限
- [x] 6.5 修复 VitePress renderer 单例跨配置与数据模块实例时无法共享 WeakMap 元数据的问题，改由单次 Markdown env 传递提取结果
- [x] 6.6 统一运行格式、lint、类型、单元、构建和 OpenSpec strict validation

## 7. 随机个人封面

- [x] 7.1 将 Moment 配置从单个 `cover` 扩展为必填 `covers` 列表，规范化、去重并拒绝空列表或空路径
- [x] 7.2 在每次进入 `/moment` 时随机选择一张封面，SSR 首屏使用第一张并在页面生命周期内保持选择结果
- [x] 7.3 更新 OpenSpec、站点配置手册、单元测试与浏览器回归，说明和覆盖多封面配置及随机选择
