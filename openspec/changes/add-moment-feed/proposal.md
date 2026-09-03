## Why

当前站点只提供面向长文的文章浏览方式，缺少适合随手记录、照片分享和简短状态的内容入口。新增独立的 `/moment` 短动态信息流，可以在不改变现有长文体验的前提下提供朋友圈式发布与浏览方式，并继续保持 Bean Blog 的设计语言和完全静态的发布模型。

## What Changes

- 新增以 `src/moments/**/*.md` 为来源的短动态内容类型，与 `src/posts/**/*.md` 长文章分开维护，但共享日期、slug、草稿过滤、排序和路径等构建期基础设施。
- 定义适合短内容的 frontmatter 和正文契约；普通照片使用正文末尾的标准 Markdown 图片语法声明，迁移期兼容旧 `images` 字段，并在构建期校验图库边界、替代文本和九张上限。
- 允许动态正文复用既有 `link-card`、`music`、`video` 和 `live-photo` 容器；容器参数、校验和 Vue 组件与长文章保持一致，封面或静态首帧不进入普通图库。
- 在 Markdown parser token 仍保留源顺序时生成由 HTML 与富媒体组成的有序 `MomentContentBlock[]`；浏览器不使用注释 marker、正则替换、独立媒体数组或 DOM 查询重建内容类型和顺序。
- 新增单一 `/moment` 聚合路由，按置顶状态和发布时间展示动态，通过滚动分批揭示构建期数据，并为每条动态提供稳定、可分享的页面内锚点；不生成分页或独立详情路由。
- 新增 Icefox 式个人封面和单列信息流，包括随机封面、头像与昵称关系、短文本展开、响应式图库、朋友圈时间、照片预览和复制链接；页面使用 52px 的 Moment 专用 Header，不渲染通用 Header。
- 页面视觉继续使用 Bean Blog 的字体、语义颜色、间距、响应式规则、明暗模式和既有组件；中央信息流与两侧画布形成克制对比，不复制参考主题的品牌、素材、PHP 实现或硬编码色板。
- 首版保持完全静态，不提供伪全站点赞或信息流内逐条评论；文章搜索、标签、归档、系列 sidebar、sitemap 和 Feed 的既有边界保持不变。
- 更新动态写作手册、独立富媒体示例、单元测试和桌面/移动端浏览器回归。

## Capabilities

### New Capabilities

- `moment-content`: 短动态 Markdown 来源、frontmatter、普通图库、既有富媒体、有序内容块、草稿与置顶、稳定锚点和滚动分批数据契约。
- `moment-experience`: Icefox 式朋友圈页面骨架、Bean Blog 视觉适配、短文本展开、响应式媒体、朋友圈时间、照片预览和真实分享操作。

### Modified Capabilities

无。

## Impact

- 新增 `src/moments` 内容目录和单一 `/moment` 页面，并扩展 `src/.vitepress/data`、Markdown 插件、站点配置与自定义主题中的动态模型和组件。
- 复用既有 `LinkedCard`、`MusicCard`、`VideoPlayer`、`LivePhoto` 与 `PhotoPreview`，不新增第三方运行时依赖或第二套媒体实现。
- 更新主导航、正式使用手册、示例内容、单元测试、静态产物验证和 Playwright 回归。
- 现有 `/blog` 路由、文章 frontmatter、搜索、标签、归档、系列、sitemap 和 Feed 行为保持不变；生产仍输出纯静态文件，不引入 CMS、数据库、登录或服务端 API。
