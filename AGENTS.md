# Bean Blog 开发规则

## 项目基础

- 技术栈为 VitePress 2、Vue 3、TypeScript、pnpm workspace 和 Tailwind CSS 4；版本以 `package.json` 和 lockfile 为准。
- VitePress 根目录是 `src`，主题、配置、数据和 Markdown 扩展位于 `src/.vitepress`。
- 文章来源是 `src/posts/**/*.md`，公开文章路由是 `/blog/<nested-slug>`，不生成 `/posts` 路由。
- 站点业务配置位于 `src/.vitepress/site.config.ts`，VitePress 工程配置位于 `src/.vitepress/config.ts`。

## 实现约束

- 修改前先阅读相关实现和测试，沿用现有模块边界，不建立平行实现。
- 自定义主题只负责布局、视觉和项目业务；标题锚点、hash 定位、活动目录、代码复制、appearance 和 sidebar 等基础行为复用 VitePress。
- VitePress 内部 API 与 composable 的访问集中在 `src/.vitepress/theme/vitepress-default-theme.ts`；升级 VitePress 时回归该适配点和相关基础交互。
- 搜索、系列、分页、标签、归档、sitemap 和 feed 复用构建期文章模型，不建立独立文章数据源。
- 系列 sidebar 由构建期文章模型生成，不手工维护重复配置。
- Markdown 扩展基于 VitePress parser token 实现，不对整篇 Markdown 做字符串替换。

## 样式约束

- UI 使用 Tailwind CSS 4 utility 和 `src/.vitepress/theme/tailwind.css` 中的设计令牌。
- 组件优先使用 Tailwind utility；只有运行时生成的 DOM、复杂选择器或伪元素无法清晰表达时才使用 `<style scoped>`。
- 每个 Vue 组件最多包含一个 `<style scoped>`，并复用全局设计令牌；不使用全局选择器、Tailwind 指令、硬编码颜色、CSS Modules、CSS-in-JS 或内联 `style`。
- 不增加 CSS Nesting 插件或额外 PostCSS 配置。
- 不使用 Tailwind 内置色板或硬编码颜色；颜色使用基于 `oklab()` 的语义角色和 `-foreground` 配对。
- 明暗模式覆盖同名语义令牌；组件优先复用现有颜色和尺寸令牌，避免一次性 token 与不必要的 arbitrary value。
- 使用已有 Lucide 图标，不手绘已有等价图标。

## 工具规范

- Prettier 是唯一 formatter；`prettier-plugin-tailwindcss` 负责 Tailwind class order。
- ESLint Flat Config 负责 JavaScript、TypeScript、Vue 和 Markdown 质量检查；`eslint-plugin-better-tailwindcss` 负责 canonical class 检查。
- `simple-git-hooks` 在 `pre-commit` 调用 `lint-staged`，只校验暂存文件的 Prettier 与 ESLint，并在相关主题文件变化时执行样式审计；不得绕过 hook 提交已知问题。
- 局部修改使用 `pnpm exec prettier <files> --write`，不要手工制造与 `prettier.config.mjs` 冲突的格式。
- `packages/lxgw-wenkai-lite-webfont/index.css` 是生成文件，不手工修改。

## 文档与 OpenSpec

- `src/posts/guide` 是正式使用手册。用户可见功能、配置、写作语法或命令变化时，同步更新对应手册和测试。
- README 只保留仓库入口、命令摘要、目录说明和手册索引，详细用法写入博客手册。
- OpenSpec change 只描述自身目标，不承担全局项目记忆；修改前读取对应 status、instructions 和上下文文件。
- OpenSpec 自然语言使用简体中文，schema 规定的英文标题和 `MUST`、`SHALL`、`WHEN`、`THEN` 等关键字保持原文。

## 验证与 Git

- 根据改动范围运行 `pnpm format:check`、`pnpm lint`、`pnpm typecheck -- --pretty false`、`pnpm audit:styles` 和相关测试；生产构建验证使用 `pnpm check:build`，完整浏览器验收使用 `pnpm check`。
- OpenSpec 改动运行 `openspec validate <change-name> --strict`。
- 不为每次修改执行生产构建；UI 优先检查 dev 服务，发布验证或用户明确要求时再运行构建和完整检查。
- 先检查 Git 状态并保留用户改动。未经明确要求，不执行 `git add`、commit、push、rebase、分支合并或 destructive Git 命令。
