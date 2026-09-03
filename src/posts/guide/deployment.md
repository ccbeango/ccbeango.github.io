---
title: 部署与发布
date: 2026-08-27
summary: 配置 SITE_URL 与 SITE_BASE，并将静态产物部署到主流托管平台。
description: Bean Blog 在 GitHub Pages、Cloudflare Pages、Vercel 和 Netlify 的部署配置。
keywords:
  - 静态部署
  - GitHub Pages
  - Cloudflare Pages
series:
  name: 发布与维护
  order: 1
  sidebar: Bean Blog 使用手册
  sidebarOrder: 3
tags:
  - 使用手册
  - 部署
draft: false
---

所有平台都安装同一份依赖、执行同一条构建命令，并发布 VitePress 的静态输出目录。

## 通用构建设置

| 设置 | 值 |
| --- | --- |
| Install command | `pnpm install --frozen-lockfile` |
| Build command | `pnpm build` |
| Output directory | `src/.vitepress/dist` |
| Node.js | 22.12 或更高 |
| 必需环境变量 | `SITE_URL=https://你的域名` |

生产构建缺少 `SITE_URL` 会失败，避免发布错误的 canonical、robots、sitemap 和 feed URL。

本地验证当前 GitHub Pages 根站点时，可以直接使用已经写入 `package.json` 的命令：

```powershell
pnpm build:local
pnpm preview
```

`build:local` 通过 `cross-env` 注入 `SITE_URL=https://username.github.io` 和 `SITE_BASE=/`，因此在 Windows、macOS 与 Linux 上行为一致。`pnpm build` 仍要求调用方显式提供发布环境变量。

## GitHub Pages

当前 workflow 位于 `.github/workflows/deploy.yml`，在 `master` 分支 push 或手动触发时构建并发布 `src/.vitepress/dist`。它直接声明当前根站点配置：

```text
SITE_URL=https://username.github.io
SITE_BASE=/
```

workflow 使用 `github.repository_owner` 动态生成实际 `SITE_URL`。根站点要求 GitHub 仓库名为 `username.github.io`，其中 `username` 替换为仓库所有者，并在仓库 `Settings -> Pages -> Build and deployment` 中选择 `GitHub Actions`。普通仓库无法仅通过把 `SITE_BASE` 改为 `/` 占用用户根路径。

如果继续使用普通仓库名，例如项目站点 `https://username.github.io/bean-blog/`，则需要同步修改 workflow：

```text
SITE_URL=https://username.github.io
SITE_BASE=/bean-blog/
```

workflow 使用 GitHub Pages 官方 artifact 和 OIDC 部署，不需要个人 Access Token 或手工维护 `gh-pages` 分支。切换自定义域名后，把 `SITE_URL` 改为最终 HTTPS 域名；根路径部署时保持 `SITE_BASE=/`。

## Cloudflare Pages

- Framework preset：None
- Build command：`pnpm build`
- Build output directory：`src/.vitepress/dist`
- Environment variables：设置 `SITE_URL`，子路径部署时再设置 `SITE_BASE`

绑定 custom domain 后，`SITE_URL` 必须与读者最终访问的 HTTPS origin 一致。

## Vercel

- Framework preset：Other
- Build command：`pnpm build`
- Output directory：`src/.vitepress/dist`
- Environment variables：为 Production 设置 `SITE_URL`

Vercel 根域部署通常不设置 `SITE_BASE`。如果 Preview deployment 也执行生产构建，需要为 Preview 提供对应绝对 URL。

## Netlify

```toml
[build]
command = "pnpm build"
publish = "src/.vitepress/dist"
```

在 Site configuration 中设置 `SITE_URL`。使用子路径代理时，再设置带首尾 `/` 的 `SITE_BASE`。

## 发布检查

```powershell
$env:SITE_URL='https://username.github.io'
$env:SITE_BASE='/'
pnpm check
```

`pnpm check` 会生成资源，校验字体和样式边界，执行 lint、类型检查、单元测试、生产构建、静态产物检查和浏览器回归。

完成后运行 `pnpm preview`，并确认以下地址可访问：

- `/robots.txt` 与 `/sitemap.xml`
- `/rss.xml`、`/index.xml`、`/atom.xml` 与 `/feed.json`
- `/site.webmanifest` 和 favicon
- `/blog`、文章详情、标签、归档和分页

最后检查 canonical 使用正式域名、草稿没有进入公开产物，并在桌面与移动视口抽查目录、系列导航、代码和媒体内容。
