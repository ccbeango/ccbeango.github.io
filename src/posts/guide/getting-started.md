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

| 工具 | 要求 |
| --- | --- |
| Node.js | 22.12 或更高版本 |
| pnpm | 11.24.0 |
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

| 命令 | 用途 |
| --- | --- |
| `pnpm dev` | 启动开发服务并预览草稿 |
| `pnpm format` | 使用 ESLint 格式化代码和排序 Tailwind class |
| `pnpm lint` | 检查代码规范与格式 |
| `pnpm typecheck` | 检查 TypeScript 与 Vue 类型 |
| `pnpm test` | 运行单元测试 |
| `pnpm audit:styles` | 检查 Tailwind authored styles 边界 |
| `pnpm build` | 生成生产静态站点 |
| `pnpm test:e2e` | 运行浏览器回归测试 |

项目不使用 Prettier，也不启用 `@antfu/eslint-config` 的外部 `formatters`。VS Code 的保存修复与 `Alt+Shift+F`、命令行的 `pnpm format` 都读取同一份 ESLint Flat Config。

`.editorconfig`、`.gitattributes` 和工作区 VS Code 设置统一使用 LF，并保证文件末尾换行。JS、TS 与 Vue 代码最多 120 字符；URL、字符串、模板字符串、正则和独立 Tailwind `class` 属性行不强制拆断。Vue 标签有多个属性时，ESLint 会自动整理为每行一个属性；无法安全自动重排的 TypeScript 长表达式会由 `pnpm lint` 报告，需要按语义手工换行。

主题不使用 Tailwind 默认色板。颜色、排版、布局尺寸、控件尺寸、圆角、容器、层级、阴影、模糊、媒体比例和动效统一定义在 `src/.vitepress/theme/tailwind.css`；颜色值全部使用 `oklab()`。暗色模式通过根节点的 `dark:theme-dark` 覆盖同名 token，因此普通组件无需为同一语义重复编写 `dark:` 颜色。完整命名和扩展规则见[配置站点信息](/blog/guide/site-configuration#主题设计令牌)。

## 下一步

- [配置站点信息](/blog/guide/site-configuration)
- [创建和组织文章](/blog/guide/writing-articles)
- [使用 Markdown 扩展](/blog/guide/markdown-extensions)
- [部署静态站点](/blog/guide/deployment)
