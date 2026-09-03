---
title: 草稿预览示例
date: 2026-09-03
summary: 用于验证开发环境可以预览草稿，而生产输出会完整排除草稿。
keywords:
  - 草稿
  - 发布流程
featured: true
tags:
  - 使用手册
  - 草稿
draft: true
---

## 为什么保留这篇草稿

这篇文章是发布状态的可运行示例。开发服务应显示“草稿预览”，生产构建的路由、列表、系列、搜索、标签、归档、sitemap 与 feed 都不应包含它。

## 发布前要做什么

确认正文和元数据已经完成后，将 frontmatter 中的 `draft` 改为 `false`。如果文章还需要出现在首页，再单独设置 `featured: true`。
