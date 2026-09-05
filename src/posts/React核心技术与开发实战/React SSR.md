---
title: "React SSR"
date: "2021-07-22 21:55:15"
series:
  name: "React核心技术与开发实战"
  order: 18
tags:
  - "React核心技术与开发实战"
draft: false
---

## 为什么使用SSR

单页面富应用的局限

之前我们开发的应用程序，如果直接请求，可以看到上面几乎没有什么内容。

<!--more-->

```html
<!DOCTYPE html>
<html lang="en">

<head>
	<meta charset="utf-8" />
	<link rel="icon" href="/favicon.ico" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta name="theme-color" content="#000000" />
	<meta name="description" content="Web site created using create-react-app" />
	<!--
      Notice the use of  in the tags above.
      It will be replaced with the URL of the `public` folder during the build.
      Only files inside the `public` folder can be referenced from the HTML.

      Unlike "/favicon.ico" or "favicon.ico", "/favicon.ico" will
      work correctly both with client-side routing and a non-root public URL.
      Learn how to configure a non-root public URL by running `npm run build`.
    -->
	<title>React App</title>
</head>

<body>
	<noscript>You need to enable JavaScript to run this app.</noscript>
	<div id="root"></div>
	<!--
      This HTML file is a template.
      If you open it directly in the browser, you will see an empty page.

      You can add webfonts, meta tags, or analytics to this file.
      The build step will place the bundled scripts into the <body> tag.

      To begin the development, run `npm start` or `yarn start`.
      To create a production bundle, use `npm run build` or `yarn build`.
    -->
	<script src="/static/js/bundle.js"></script>
	<script src="/static/js/0.chunk.js"></script>
	<script src="/static/js/main.chunk.js"></script>
</body>

</html>
```

但是为什么我们页面可以看到大量的内容呢？因为当我们请求下来静态资源之后会执行JS文件，JS会去请求数据，浏览器再渲染我们想要看到的。

## 认识SSR和同构

SSR（Server Side Rendering，服务端渲染），指的是页面在服务器端已经生成了完成的HTML页面结构，不需要浏览器解析；

对应的是CSR（Client Side Rendering，客户端渲染），我们开发的SPA页面通常依赖的就是客户端渲染；

早期的服务端渲染包括PHP、JSP、ASP等方式，都是SSR渲染。

而现在前后端分离的开发模式下，我们可以使用Node来帮助我们执行JavaScript代码，提前完成页面的渲染。

![image-20210722115457008](https://cdn.jsdelivr.net/gh/ccbeango/blogImages/React/React%E6%A0%B8%E5%BF%83%E6%8A%80%E6%9C%AF%E4%B8%8E%E5%BC%80%E5%8F%91%E5%AE%9E%E8%B7%B545.png)

什么是同构？

它表示的是一套代码既可以在服务端运行又可以在客户端运行，这就是同构应用。同构是一种SSR的形态，是现代SSR的一种表现形式。

当用户发出请求时，先在服务器通过SSR渲染出首页的内容。但是对应的代码同样可以在客户端被执行。

比如用户刷新某个页面，那么就直接在服务端渲染好，返回给用户。如果用户点击一个菜单进行路由跳转，那么直接在浏览器中渲染出来即可。一套代码既可以在服务端渲染，也可以在客户端渲染，不需要写两套代码。这样子写出来的应用程序，就可以称之为同构应用。

同构的另一个作用，当页面在服务端虚渲染后，涉及到事件绑定或其它的一些必须浏览器完成的操作，最好在浏览器中再执行一遍js操作，在这一次执行中，执行的目的包括事件绑定等。

## 首页展示

Next.js默认已经给我们配置好了路由映射关系：

- 路径和组件的映射关系；
- 这个映射关系就是在pages中配置相关的组件都会自动生成对应的路径；

```jsx
import Link from 'next/link'

export default function Home() {
  return (
    <div>
      {/* 链接跳转 */}
      <a href="/about">关于</a>
      {/* 路由跳转 */}
      <Link href="/about">关于</Link>
      <h2>首页</h2>
    </div>
  )
}

```

```jsx
import React, { memo } from 'react'

export default memo(function About() {
  return (
    <div>
      About
    </div>
  )
})

```

点击a标签跳转到关于页面，页面会刷新，SSR渲染，点击Link标签跳转，CSR渲染。
