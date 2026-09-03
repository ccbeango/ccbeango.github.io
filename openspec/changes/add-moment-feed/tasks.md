## 1. 内容模型与共享基础设施

- [x] 1.1 提取文章与动态共用的日期、slug、草稿过滤、排序和路径工具，并确认 `/blog` 既有行为不变
- [x] 1.2 定义 `MomentFrontmatter`、`MomentImage`、`MomentContentBlock` 和 `MomentData`，覆盖默认值、标签去重、嵌套 slug 与 fragment 唯一性
- [x] 1.3 建立 `moments.data.ts` 构建期加载器，实现生产草稿过滤、置顶优先和组内日期倒序
- [x] 1.4 扩展 `site.config.ts`，集中配置封面列表、显示名、头像、签名和每批数量，并实现身份回退、正整数校验、本地 base path 与远程 URL 支持

## 2. Markdown、图库与富媒体

- [x] 2.1 基于 VitePress parser token 提取正文末尾的纯图片段落，校验位置、链接、title、alt、九图上限及 frontmatter 混用
- [x] 2.2 显式识别 `link-card`、`music`、`video` 和 `live-photo` 容器边界，使封面与静态首帧不进入普通图库
- [x] 2.3 复用四个既有 Markdown 插件的参数解析、错误位置、地址约束与 Vue 组件，并保持长文章输出不变
- [x] 2.4 让 Moment 富媒体替换 token 携带结构化 metadata，按最终 token 顺序生成 HTML 与富媒体组成的 `MomentContentBlock[]`
- [x] 2.5 移除富媒体注释 marker、运行时正则拆分、独立媒体数组和通过子组件 DOM 属性识别类型的逻辑
- [x] 2.6 让 `MomentCard` 直接遍历可判别内容块，并从内容块类型推导可播放媒体与正文裁切策略

## 3. 路由、配置与滚动信息流

- [x] 3.1 新增单一 `/moment` 页面、`layout: moment` 分支和主导航入口，不生成原稿、分页或动态详情路由
- [x] 3.2 从完整构建期集合按配置批量揭示动态，接入 `IntersectionObserver` 哨兵、手动加载回退和完成状态
- [x] 3.3 为动态生成稳定 fragment，支持复制 `/moment#fragment`、直接访问较后动态时自动揭示批次并定位
- [x] 3.4 保持 `/blog` 分页、文章搜索、标签、归档、系列、sitemap 和 Feed 的数据边界与公开 URL 不变

## 4. Moment 页面与视觉

- [x] 4.1 实现 52px 高、与中央内容等宽的 Moment 专用 Header，包括返回首页、主题切换和滚动后的无边框磨砂背景
- [x] 4.2 实现无圆角个人封面、随机封面选择、右下昵称、越界头像和签名，并保证 SSR 首图与客户端单次选择稳定
- [x] 4.3 使用现有 `muted` 与 `background` 面层区分两侧画布和中央信息流，完成亮暗模式、桌面与移动布局
- [x] 4.4 实现左头像右正文的分隔式 `MomentCard`，显示作者、置顶或草稿、内容块、图库、日期、地点和标签
- [x] 4.5 实现基于实际布局测量的六行“全文/收起”，并保证音乐、视频与 Live Photo 不被裁切
- [x] 4.6 实现朋友圈时间层级，保留标准 `datetime`、精确时间提示和随当前时刻更新的显示
- [x] 4.7 使用 Lucide 操作入口实现复制稳定链接、Clipboard API 回退、状态反馈、Escape、外部点击和焦点恢复

## 5. 图库与媒体交互

- [x] 5.1 实现一至九图布局：单图保留受限原比例，二图和四图两列，其余多图三列方形缩略图
- [x] 5.2 复用既有 `PhotoPreview`，支持指针与键盘打开、缩放、拖动、关闭、焦点恢复、base path 和明暗模式
- [x] 5.3 为每条动态图库建立独立预览 scope，使左右翻页只浏览当前动态中的图片
- [x] 5.4 禁止预览图片和导航控件的文本选择，避免连续翻页或拖动产生系统蓝色高亮
- [x] 5.5 让文章引用、音乐、视频和 Live Photo 复用既有响应式组件、播放控制、远程资源和错误状态

## 6. 内容、文档与验证

- [x] 6.1 为普通短文、普通图片及四种富媒体分别提供独立 Moment 示例，普通图片复用 Live Photo poster，音乐保留原有网络来源
- [x] 6.2 更新动态发布和站点配置正式手册，说明 frontmatter、图库、富媒体、随机封面、滚动加载、时间、稳定链接和互动边界
- [x] 6.3 补充单元测试，覆盖内容校验、token 边界、内容块顺序、无 marker、长文章兼容、配置、排序、时间和 fragment
- [x] 6.4 补充桌面与移动 Playwright 回归，覆盖专用 Header、明暗模式、滚动加载、深链、文本展开、四种富媒体、图库 scope、照片预览与复制链接
- [x] 6.5 执行 Prettier、ESLint、TypeScript、样式审计、单元测试、生产构建、静态产物验证、完整浏览器验收和 OpenSpec strict validation
