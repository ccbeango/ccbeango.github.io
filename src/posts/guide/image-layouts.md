---
title: 编排多图布局
date: 2026-08-29
summary: 使用 VitePress 三冒号 image-grid 区块，在文章中编排横图、竖图、四张宫格和混合比例图片。
description: Bean Blog 六种 Markdown 图片布局的语法、数量约束与响应式示例。
keywords:
  - Markdown 图片
  - 图片布局
  - image-grid
series:
  name: 内容写作
  order: 3
  sidebar: Bean Blog 使用手册
  sidebarOrder: 2
tags:
  - 使用手册
  - Markdown
  - 排版
draft: false
---

普通 Markdown 图片不需要特殊写法，会独占正文宽度并按文章顺序出现。

![海边的横向风景](/media/live-photo-sample-poster.png)

点击普通图片或多图布局中的任意图片，会先以全屏纯图模式完整展示原图。预览两侧可以按当前文章中的图片顺序切换；键盘也可以使用 `ArrowLeft` 和 `ArrowRight`。第一张不显示上一张按钮，最后一张不显示下一张按钮。文章封面、普通图片、`image-grid` 图片与 Live Photo 首帧属于同一个图片序列。

右上角的详情 icon 可以切换拍摄信息：宽屏时照片在左、信息在右，窄屏时改为上下排列。再次点击 icon 会恢复纯图模式，按 `Escape` 或右上角关闭按钮退出预览。切换图片时会重置缩放与 Live Photo 播放状态；详情面板如果已经打开，则会继续显示并更新为当前照片的信息。

桌面端可以把鼠标移到照片上滚动滚轮缩放，并在放大后按住左键拖动平移。双击照片或点击右上角出现的重置 icon 都会恢复原尺寸和居中位置；触控设备仍使用原生滚动，不会接管双指手势。

拍摄信息在打开详情后才会按需读取，可能包含文件名、尺寸、拍摄时间、相机、镜头、焦距、光圈、快门和 ISO。没有 EXIF 的图片仍可正常预览，只会提示没有可读取的拍摄参数；GPS 不会被读取或展示。远程图片若要显示拍摄信息，需要允许博客域名通过 CORS 读取原文件。

需要组合多张图片时，使用 VitePress 风格的三冒号 container 包围普通图片，并用空行分隔：

```md
::: image-grid r73
![横向图片](/media/live-photo-sample-poster.png)

![纵向图片](/media/live-photo-sample-poster.png)
:::
```

`image-grid` 是本博客注册的 VitePress Custom Container。构建时，VitePress 负责解析三冒号区块，博客插件再把合法内容增强为响应式布局。

为减少仓库中的演示资源，本页所有格子重复使用同一张 `/media/live-photo-sample-poster.png`，通过不同布局裁切展示排版效果。实际文章可以为每个位置填写不同的本地路径或图床 URL。

## 可用布局

| mode        | 图片数量  | 宽屏布局                             |
| ----------- | --------- | ------------------------------------ |
| `landscape` | 2 至 4 张 | 等宽 `4:3` 横图；四张时为 `2×2` 宫格 |
| `portrait`  | 2 至 4 张 | 等宽 `3:4` 竖图；四张时为 `2×2` 宫格 |
| `r73`       | 2 张      | 左宽右窄，约 `7:3`                   |
| `r37`       | 2 张      | 左窄右宽，约 `3:7`                   |
| `r64`       | 2 张      | 左宽右窄，约 `64:36`                 |
| `r46`       | 2 张      | 左窄右宽，约 `36:64`                 |

全部布局在窄屏下都会恢复为单列，并保留 Markdown 源顺序。

## 等宽横图与四张宫格

`landscape` 支持两至四张图片。四张图片写在同一个 block 中即可形成 `2×2` 宫格，不需要新的 mode。

::: image-grid landscape
![山谷中的横向风景](/media/live-photo-sample-poster.png)

![建筑与天空的横向风景](/media/live-photo-sample-poster.png)

![山间拱门的横向裁切](/media/live-photo-sample-poster.png)

![海岸日落的横向裁切](/media/live-photo-sample-poster.png)
:::

## 等宽竖图

`portrait` 支持两至四张图片，所有容器使用 `3:4` 画幅。

::: image-grid portrait
![山间的纵向风景](/media/live-photo-sample-poster.png)

![光影中的纵向建筑](/media/live-photo-sample-poster.png)

![海岸边的纵向景色](/media/live-photo-sample-poster.png)
:::

## 七三布局

`r73` 让左图更宽、右图更窄，适合一张横图搭配一张竖图。

::: image-grid r73
![作为主体的横向风景](/media/live-photo-sample-poster.png)

![作为补充的纵向风景](/media/live-photo-sample-poster.png)
:::

## 三七布局

`r37` 将窄图放在左侧、宽图放在右侧。

::: image-grid r37
![左侧纵向风景](/media/live-photo-sample-poster.png)

![右侧横向风景](/media/live-photo-sample-poster.png)
:::

## 六四布局

`r64` 的宽度差异更克制，左侧使用横向画幅，右侧使用纵向画幅。

::: image-grid r64
![左侧横向建筑](/media/live-photo-sample-poster.png)

![右侧纵向建筑](/media/live-photo-sample-poster.png)
:::

## 四六布局

`r46` 是六四布局的镜像。

::: image-grid r46
![左侧纵向建筑](/media/live-photo-sample-poster.png)

![右侧横向建筑](/media/live-photo-sample-poster.png)
:::

## 输入约束

block 中只允许普通 Markdown 图片和换行。比例布局固定为两张图片，等宽布局允许两至四张。以下情况会产生包含文件与行号的错误：

- mode 拼写错误或不受支持
- 图片数量不符合规则
- block 中加入正文或其他元素
- 嵌套另一个 `image-grid`
- 遗漏结束 `:::`
