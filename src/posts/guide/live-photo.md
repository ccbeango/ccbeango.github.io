---
title: 使用 Live Photo
date: 2026-08-28
summary: 使用独立 MP4 或 Android Motion Photo 原文件，在文章中提供按需播放的动态照片。
description: Bean Blog 的 Live Photo block、Android 单文件解析、静态降级与资源要求。
keywords:
  - Live Photo
  - Android Motion Photo
  - Markdown 图片
series:
  name: 内容写作
  order: 4
  sidebar: Bean Blog 使用手册
  sidebarOrder: 2
tags:
  - 使用手册
  - Markdown
  - 多媒体
draft: false
---

Live Photo 在正文中首先是一张普通图片。读者点击左上角的 `LIVE` 后，动态片段才会在图片原位置播放；再次点击或播放结束后恢复静态首帧。点击首帧的其他区域会打开全屏照片预览，预览左上角同样可以播放 Live Photo，右上角的详情 icon 可以按需读取拍摄参数。

## Android Motion Photo 原文件

采用“JPEG 主图后追加 MP4”结构的 Android Motion Photo 可以直接引用原始 `.jpg`，不需要预先分离视频：

```md
::: live-photo android
![Android Motion Photo 演示](/live-images/android-motion-photo.jpg)
:::
```

::: live-photo android
![Android Motion Photo 演示](/live-images/android-motion-photo.jpg)
:::

正文或照片预览中首次播放时，浏览器才会读取 JPEG 二进制、从文件末尾向前定位 MP4 的 `ftyp`，并创建 `video/mp4` Blob。各自停止后再次播放会复用各自的 Blob URL；关闭照片预览或离开文章时会释放对应资源。

## 使用独立 MP4

已经分离好的静态首帧和浏览器可播放的 MP4 可以直接配对：

```md
::: live-photo /media/live-photo-sample.mp4
![独立 MP4 的静态首帧](/media/live-photo-sample-poster.png)
:::
```

::: live-photo /media/live-photo-sample.mp4
![独立 MP4 的静态首帧](/media/live-photo-sample-poster.png)
:::

独立 MP4 mode 在激活前只加载静态首帧，不提前请求视频。

## 资源要求

同源文件建议放在 `src/public/live-images` 或 `src/public/media`。远程图片必须允许当前博客域名通过 CORS 读取响应；只能由 `<img>` 显示但不允许跨域读取的地址无法解析 Motion Photo，也无法在预览中读取 EXIF，但仍可作为普通静态图片查看。

CDN、图片压缩服务和对象存储处理链必须保留 Android 原文件，不能重新编码 JPEG、删除文件尾部数据或只返回优化后的静态图。独立视频应使用目标浏览器可播放的 MP4 编码。

当前 Android mode 不转码 HEVC、AV1 等浏览器不支持的编码，也不解析 Apple HEIC 与 MOV 文件对。解析失败或视频无法播放时，组件会恢复为普通静态图片。

## 区块语法

`live-photo` 是本博客注册的 VitePress Custom Container。区块内必须且只能包含一张普通 Markdown 图片，图片继续提供静态首帧、alt 和资源地址。

开始行只能使用 `::: live-photo android` 或在 `live-photo` 后提供一个非空 MP4 地址。缺少图片、包含正文、嵌套 block 或遗漏结束 `:::` 都会在开发时报告文件与行号。旧的 HTML comment 写法不再解析。
