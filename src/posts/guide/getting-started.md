---
title: 开始使用 Bean Blog
date: 2026-09-02
summary: 安装依赖、启动开发服务，并了解 Bean Blog 的目录结构与日常命令。
description: Bean Blog 的环境要求、安装步骤、开发命令和项目目录说明。
keywords:
  - Bean Blog
  - VitePress
  - 快速开始
featured: true
series:
  name: 入门与配置
  order: 1
  sidebar: Bean Blog 使用手册
  sidebarOrder: 1
tags:
  - 使用手册
  - VitePress
draft: false
---

Bean Blog 是一个基于 VitePress 2、Vue 3、TypeScript 和 Tailwind CSS 4 的静态博客。文章保存在仓库中，发布时生成纯静态页面，不需要数据库或应用服务器。

## 环境要求

| 工具      | 要求                        |
| --------- | --------------------------- |
| Node.js   | 22.12 或更高版本            |
| pnpm      | 11.24.0                     |
| VitePress | 精确锁定为 `2.0.0-alpha.19` |

VitePress 当前使用 alpha 版本，因此升级版本后应重新检查 Markdown 渲染、标题锚点、系列导航和主题行为。

## 安装依赖

在项目根目录执行：

```powershell
pnpm install --frozen-lockfile
```

`pnpm-lock.yaml` 已固定完整依赖树。除非确实需要升级依赖，否则不要删除 lockfile 或改用其他包管理器重新生成。

## 运行开发环境

```powershell
pnpm dev
```

默认地址为 `http://localhost:5173`。正文修改支持热更新；新增文章，或修改文章标题、系列归属与排序后，需要重启开发服务，因为系列 sidebar 在 VitePress 配置阶段生成。

开发环境会显示 `draft: true` 的文章并标记为草稿。生产构建会从路由、列表、搜索、归档、标签、 sitemap 和 feed 中排除草稿。

## 项目目录

```text
packages/
  lxgw-wenkai-lite-webfont/ # 自托管中文字体子包
src/
  .vitepress/
    build/                  # robots、manifest 与 feed
    data/                   # 文章校验和集合转换
    markdown/               # 图片与 Live Photo 扩展
    theme/                  # 自定义主题与 Tailwind 入口
    config.ts               # VitePress 配置
    site.config.ts          # 站点身份和第三方配置
  posts/                    # Markdown 文章来源
    guide/                  # 当前使用手册
  public/                   # 图标、封面和文章媒体
  blog/                     # /blog 动态路由入口
tests/                      # Vitest 与 Playwright
```

`src/posts` 的目录不会公开为 `/posts`。文章文件的相对路径会转换为 `/blog/<nested-slug>`。

## 常用命令

| 命令                | 用途                                            |
| ------------------- | ----------------------------------------------- |
| `pnpm dev`          | 启动开发服务并预览草稿                          |
| `pnpm format`       | 使用 Prettier 格式化文件并排序 Tailwind class   |
| `pnpm format:check` | 检查文件是否符合 Prettier 格式                  |
| `pnpm lint`         | 使用 ESLint 检查代码质量与 Markdown 结构        |
| `pnpm lint:fix`     | 修复具有可靠 ESLint 修复器的问题                |
| `pnpm typecheck`    | 检查 TypeScript 与 Vue 类型                     |
| `pnpm test`         | 运行单元测试                                    |
| `pnpm audit:styles` | 检查 Tailwind authored styles 边界              |
| `pnpm check:staged` | 检查 Git 暂存文件格式、质量和相关样式边界       |
| `pnpm build`        | 生成生产静态站点                                |
| `pnpm test:e2e`     | 运行浏览器回归测试                              |
| `pnpm verify:build` | 检查生产路由、元数据、Feed 和草稿排除           |
| `pnpm check:build`  | 执行静态质量检查、单测、构建和静态产物验证      |
| `pnpm check`        | 执行 `check:build` 和完整 Playwright 浏览器回归 |

## 代码规范与格式化

项目将代码质量检查和格式化分开处理：

| 工具                                | 职责                                                      |
| ----------------------------------- | --------------------------------------------------------- |
| ESLint Flat Config                  | 检查 JavaScript、TypeScript、Vue 代码质量和 Markdown 结构 |
| Prettier                            | 统一代码、Vue 模板、JSON、YAML 和 Markdown 的排版         |
| `prettier-plugin-tailwindcss`       | 按 Tailwind 官方顺序排列静态 class                        |
| `eslint-plugin-better-tailwindcss`  | 检查可替换为标准 Tailwind 写法的 canonical class          |
| `.editorconfig` 与 `.gitattributes` | 固定 LF、文件末尾换行和基础编辑器行为                     |

根目录的 `prettier.config.mjs` 是唯一格式化配置，当前规则包括：

- 使用 2 空格缩进、120 字符宽度、分号、双引号和尾随逗号。
- Vue 标签具有多个属性时，每个属性单独占一行。
- 使用 `htmlWhitespaceSensitivity: "ignore"`，使多行 Vue 标签的内容和起止标签各占完整行。
- 使用 `proseWrap: "preserve"`，保留 Markdown 中文段落的原始换行。
- 从 `src/.vitepress/theme/tailwind.css` 读取 Tailwind CSS 4 主题并排序 class。

例如，多属性标签中的文字会稳定格式化为：

```vue
<label
  id="search-title"
  for="site-search"
  class="sr-only"
>
  搜索文章
</label>
```

VS Code 已将 Prettier 配置为默认 formatter。保存文件或按下 `Alt+Shift+F` 会执行相同的 Prettier 配置；保存后还会运行 ESLint 的安全自动修复。命令行中，`pnpm format` 写入格式化结果，`pnpm format:check` 只检查而不修改文件。

安装依赖时，根级 `prepare` 会通过 `simple-git-hooks` 注册 `pre-commit`。每次提交由 `lint-staged` 只检查暂存文件：代码和 Markdown 同时经过 Prettier 与 ESLint，JSON、YAML 和 CSS 经过 Prettier；主题 Vue、CSS 或样式审计脚本变化时还会执行 `pnpm audit:styles`。hook 只报告并阻止不合规提交，不会自动格式化或重新暂存文件。

ESLint 直接组合 `@eslint/js`、`typescript-eslint`、`eslint-plugin-vue` 和 `@eslint/markdown` 的官方推荐配置。`pnpm lint` 只报告问题，`pnpm lint:fix` 修复具有可靠修复器的问题。Markdown 检查兼容 VitePress 的 `[[toc]]` 和 GitHub Alerts，代码块仍要求声明语言。

主题不使用 Tailwind 默认色板。颜色、排版、布局尺寸、控件尺寸、圆角、容器、层级、阴影、模糊、媒体比例和动效统一定义在 `src/.vitepress/theme/tailwind.css`；颜色值全部使用 `oklab()`。暗色模式通过根节点的 `dark:theme-dark` 覆盖同名 token，因此普通组件无需为同一语义重复编写 `dark:` 颜色。完整命名和扩展规则见[配置站点信息](/blog/guide/site-configuration#主题设计令牌)。

## 下一步

- [配置站点信息](/blog/guide/site-configuration)
- [创建和组织文章](/blog/guide/writing-articles)
- [使用 Markdown 扩展](/blog/guide/markdown-extensions)
- [部署静态站点](/blog/guide/deployment)
