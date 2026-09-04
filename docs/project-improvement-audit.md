# 项目完善度审计

> 审计日期：2026-09-04  
> 审计对象：当前 `master` 分支  
> 用途：记录正式发布前尚未完成、需要确认或值得优化的事项。本文不是使用手册，也不表示相关事项已经进入实现阶段。

## 当前结论

博客的核心功能和基础阅读体验已经完整，不需要继续进行无目标的 UI 调整。后续工作应优先围绕正式站点配置、旧文章迁移、自动化发布保障和站外内容兼容性展开。

本次审计确认以下检查通过：

- `pnpm format:check`
- `pnpm audit:styles`
- `pnpm lint`
- `pnpm typecheck -- --pretty false`
- `pnpm test`
- `openspec validate create-vitepress-blog --strict`

Playwright 已配置桌面与移动端测试。本次遵循项目约定，没有执行生产构建、静态产物检查或 Playwright 测试，因此这些结果仍需在正式发布验收时确认。

## P0：正式发布前完成

### 站点身份与发布配置

- [ ] 确认项目最终作为通用模板还是正式个人博客维护。
- [ ] 在 `src/.vitepress/site.config.ts` 中填写正式站点名称、简介、关键词和作者信息。
- [ ] 将首页 GitHub 地址从通用入口替换为有效地址，或在不需要时移除。
- [ ] 决定是否启用 Giscus；不启用时继续保持 `giscus: null`。
- [ ] 使用最终 `SITE_URL` 和 `SITE_BASE` 执行完整生产检查与预览。
- [ ] 确认 canonical、robots、sitemap、Feed 和 manifest 使用最终站点信息。
- [ ] 完成 OpenSpec `create-vitepress-blog` 的任务 7.7，并在验收后归档该 change。

当前 OpenSpec 已完成 48/49 项任务。唯一未完成项是正式站点身份、域名、社交链接、可选 Giscus 和最终发布验收。

### 同步当前代码

- [ ] 确认本地领先远端的两个提交符合预期。
- [ ] 推送后确认线上版本与本地 `master` 一致。
- [ ] 抽查线上使用手册，确保不再包含旧 formatter 或旧 ESLint 方案的描述。

审计时工作树干净，但本地 `master` 比 `origin/master` 领先两个提交，因此线上站点还不是当前工作区版本。

## P0：旧文章迁移

`migrate-blog` 分支包含 121 篇迁移文章。该分支与当前 `master` 从相同旧基线分别演进，同时修改了 ESLint、依赖、OpenSpec 和工程配置，因此不应直接整分支合并。

建议只移植以下内容，并在当前 `master` 的规范下重新处理：

- 121 篇文章
- `scripts/migrate-vuepress-posts.mjs`
- `tests/unit/migrated-posts.test.ts`
- 当前项目确实需要的迁移文档说明

迁移验收事项：

- [ ] 在当前 Prettier 和 ESLint 配置下格式化并检查全部迁移文章。
- [ ] 验证 121 篇文章均能加载，slug 唯一，且不会生成 `/posts` 路由。
- [ ] 修复文章中的相对链接。已发现 `Vue2的初步了解.md` 仍引用重命名前的 `./00.Vue2目录结构总览.md`，而目标文件已经是 `Vue2目录结构总览.md`。
- [ ] 决定是否保留旧博客的 `/pages/<slug>/` 地址。
- [ ] 若需要保留历史链接和搜索引擎权重，为 121 个旧 permalink 建立到新 `/blog/<nested-slug>` 的映射与静态跳转方案。
- [ ] 增加站内链接和图片链接检查，避免迁移后出现静默 404。
- [ ] 检查约 438 个远程图片引用是否仍可访问。
- [ ] 对使用 EXIF 或 Live Photo 的远程资源确认 CORS 响应。
- [ ] 对 Android Motion Photo 确认图床不会重新编码 JPEG、删除尾部数据或只返回压缩后的静态图。
- [ ] 在真实文章量下确认搜索体积、构建时间、分页数量和大型系列 sidebar 的表现。

普通远程图片只依赖浏览器图片加载，可以正常展示；EXIF 读取和 Android Motion Photo 解析需要 JavaScript `fetch` 响应，因此额外依赖图床 CORS。

## P1：自动化发布保障

GitHub Pages workflow 已调整为在上传 Pages artifact 前执行 `pnpm check:build`。以下快速质量门禁已经接入部署：

- [x] 在部署前执行 `pnpm format:check`。
- [x] 执行 `pnpm audit:styles`。
- [x] 执行 `pnpm lint`。
- [x] 执行 `pnpm typecheck`。
- [x] 执行 `pnpm test`。
- [x] 构建后执行 `pnpm verify:build`。
- [x] 日常部署不安装 Chromium，不执行 Playwright 回归。
- [x] 只有 `check:build` 完整通过时才上传和发布 Pages artifact。
- [x] 保留本地完整 `pnpm check`，按需执行 Playwright 回归。

Playwright 已覆盖 404、字体、首页、分页、标签、归档、footer、目录、系列导航、搜索、主题、代码复制、图片布局、通用视频、远程音乐与全局播放器、照片预览、Live Photo 和移动导航。它适合在交互或主题修改后本地执行，或者在发布较大版本前运行，不阻塞频繁的文章发布。

### 提交前校验

- [x] 使用 `simple-git-hooks` 注册 `pre-commit`。
- [x] 使用 `lint-staged` 只检查暂存文件的 Prettier 与 ESLint。
- [x] 在相关主题文件变化时执行 authored styles 审计。
- [x] hook 只校验并阻止问题提交，不自动修改或重新暂存文件。
- [x] 类型、单测和构建继续由按范围本地验证与部署门禁承担，避免每次 commit 过慢。

## P1：RSS 和站外阅读

Feed 生成器直接把 VitePress 渲染后的 `post.html` 写入 RSS、Atom 和 JSON Feed。`live-photo` 会渲染为 Vue 的 `<LivePhoto />` 组件，普通 Feed 阅读器不会执行 Vue，因此动态照片可能在 Feed 中变成不可用的空标签。

- [ ] 决定 Feed 输出完整正文还是只输出摘要。
- [ ] 若保留完整正文，为 Live Photo 输出可点击的静态 poster 和原文链接。
- [ ] 确认 `image-grid` 在常见 Feed 阅读器中能够按普通图片顺序降级。
- [ ] 增加 Feed 内容测试，不只检查 Feed 文件存在和包含文章标题。
- [ ] 填写正式作者邮箱，避免 Feed 继续发布占位邮箱。

## P2：可选优化

### Manifest 与图标

- [ ] 将 `site.webmanifest` 中硬编码的 `#f7f7f5` 与当前亮色纯白主题对齐。
- [ ] 将 manifest 的颜色配置集中管理，避免构建脚本保存过期视觉值。
- [ ] 优化约 285 KB 的 `favicon.ico`；当前 `favicon.png` 约 11 KB，可以生成更精简的 ICO。

Manifest 属于浏览器平台元数据，其颜色格式需要兼顾实际浏览器支持，不必机械套用组件 CSS token，但最终视觉值应与站点主题一致。

### SEO 分享卡片

当前已有 title、description、keywords、canonical、Open Graph 和 Twitter Card 元数据，但没有 `og:image` 或 `twitter:image`。

- [ ] 确认是否需要带图片的社交分享卡片。
- [ ] 若需要，设计全站默认图与文章封面的回退顺序，并补充绝对 URL 测试。

这属于产品选择，不影响当前静态站点正常发布。

### 依赖维护

- [ ] 定期检查 VitePress 2 alpha 更新；升级后重点回归默认主题适配点、标题锚点、活动目录、sidebar 和代码复制。
- [ ] 分开评估补丁更新与 TypeScript、MathJax 等主版本更新，避免无目的批量升级。

### 质量基线

- [ ] 在文章迁移完成后增加断链检查。
- [ ] 根据需要增加 axe 无障碍扫描。
- [ ] 根据实际线上加载情况建立 Lighthouse 或 Web Vitals 基线。
- [ ] 测量字体、文章索引和图片对首屏性能的真实影响后再优化，不仅依据仓库文件大小判断。

字体子包当前包含约 7.14 MiB、194 个按 `unicode-range` 拆分的 WOFF2 文件。构建产物会包含这些文件，但浏览器只会按页面实际字符请求对应子集，因此应以网络请求和真实首屏数据作为优化依据。

## 建议执行顺序

1. 完成正式站点身份配置，执行最终生产验收。
2. 推送当前 `master` 的两个本地提交，确认线上版本同步。
3. 从 `migrate-blog` 选择性移植迁移结果，不合并旧工程配置。
4. 处理旧 permalink、已知相对链接和远程图片检查。
5. 在 121 篇真实文章下执行完整检查并评估性能。
6. 处理 Feed 的 Live Photo 静态降级。
7. 根据实际需求处理 manifest、分享卡片、无障碍和性能基线。
8. 完成正式站点任务后归档 `create-vitepress-blog`。

## 最终验收标准

- 正式站点配置中不存在无效占位身份或链接。
- 121 篇迁移文章均可访问，站内链接和图片没有已知 404。
- 历史 permalink 已明确选择保留或放弃，不处于未决状态。
- `pnpm check` 使用最终域名配置完整通过。
- GitHub Pages workflow 会在 `check:build` 失败时停止部署，完整 E2E 可在本地按需执行。
- 线上 canonical、sitemap、robots、Feed、manifest 和公开路由与预期一致。
- 桌面和移动端的目录、系列导航、搜索、主题、代码、图片预览与 Live Photo 完成抽查。
- OpenSpec `create-vitepress-blog` 不再保留未完成任务并已归档。
