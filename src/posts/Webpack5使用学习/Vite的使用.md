---
title: "Vite的使用"
date: "2022-07-03 17:41:13"
series:
  name: "Webpack5使用学习"
  order: 17
tags:
  - "Webpack5使用学习"
draft: false
---

## 认识Vite

Vite的定位是下一代前端开发与构建工具，能显著提升前端开发体验。

实际开发中，编写的代码往往不能被浏览器直接识别，如ES6、TypeScript、Vue等。

所以必须通过构建工具对代码进行转换、编译，如 [webpack](https://webpack.js.org/)、[Rollup](https://rollupjs.org/) 和 [Parcel](https://parceljs.org/) 等工具，它们极大地改善了前端开发者的开发体验。

但是随着项目越来越大，需要处理的JavaScript代码量呈指数级增长。

构建工具需要很长时间才能开启服务器，HMR也需要几秒钟才能在浏览器中反映出来，开发体验很差。

Vite 旨在利用生态系统中的新进展解决上述问题：浏览器开始原生支持 ES 模块，且越来越多 JavaScript 工具使用编译型语言编写。

- 它主要由两部分组成：
  - 一个开发服务器，它基于 [原生 ES 模块](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) 提供了 [丰富的内建功能](https://cn.vitejs.dev/guide/features.html)，如速度快到惊人的 [模块热更新（HMR）](https://cn.vitejs.dev/guide/features.html#hot-module-replacement)。
  - 一套构建指令，它使用 [Rollup](https://rollupjs.org/) 打包你的代码，并且它是预配置的，可输出用于生产环境的高度优化过的静态资源。

## 浏览器原生模块化支持

如果不借助其它工具，加载上百个模块的JS代码，对于浏览器请求是巨大的消耗。如加载Loadash，可能我们只使用其中几个方法，但是浏览器需要加载几百个文件，消耗巨大。

其次，代码可能是TypeScript、less、vue等，浏览器不能直接识别。

Vite解决了上面的这些问题。

代码如下：

```js
// index.js
import { formatDate } from './utils/format.js'
import _ from '../node_modules/lodash-es/lodash.default.js';


console.log('Hello Vite');

console.log(formatDate());

console.log(_.join(['A', 'B', 'C']))

// format.js
export function formatDate() {
  return '2022-07-03';
}
```

在`index.html`中引入

```html {12}
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <h1>Hello World</h1>
  <!-- 默认支持esmodule -->
  <script src="./index.js" type="module"></script>
</body>
</html>
```

使用LiveServer打开`index.html`，可以在浏览器中看到，JS代码可正常执行，浏览器默认值实际ESModule模块的。然而lodash模块加载了几百个JS文件。

![文章配图](https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/Webpack5/Vite%E7%9A%84%E4%BD%BF%E7%94%A801.png)

## Vite的使用

通过下面命令安装Vite，便于学习构建工具。

```shell
npm i -D vite
```

注：官方文档中通过`npm create vite@latest`是将Vite作为脚手架来创建项目，不方便很多细节的理解。

此时修改lodash库的引入方式，手动引入Vite不会做任何的优化：

```js
import { formatDate } from './utils/format.js'
// import _ from '../node_modules/lodash-es/lodash.default.js';
import _ from 'lodash-es';


console.log('Hello Vite');

console.log(formatDate());

console.log(_.join(['A', 'B', 'C']))
```

`npx vite`来启动项目，此时可以看到，Network中只关于Lodash只加载了`lodash-es.js`文件。

![Vite的使用02](https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/Webpack5/Vite的使用02.png)

Vite将这个Lodash库做了合并，减少HTTP的请求次数，在打包阶段再通过TreeShaking进行进一步优化。

## Vite的功能

> https://cn.vitejs.dev/guide/features.html

对非常基础的使用来说，使用 Vite 开发和使用一个静态文件服务器并没有太大区别。然而，Vite 还通过原生 ESM 导入提供了许多主要用于打包场景的增强功能。

文档中对各功能做了详细介绍，这里对开发中支持的常见文件类型做演练。

### HMR

Vite 提供了一套原生 ESM 的 [HMR API](https://cn.vitejs.dev/guide/api-hmr.html)。 具有 HMR 功能的框架可以利用该 API 提供即时、准确的更新，而无需重新加载页面或清除应用程序状态。

### CSS的处理

Vite不需要做任何配置即可加载CSS模块。

#### CSS

`base.css`

```css
body {
  background: red;
}

.title {
  font-size: 20px;
  user-select: none;
}
```

直接在入口文件中做引入：

```js
import { formatDate } from './utils/format.js'
import _ from 'lodash-es';
import './css/base.css';

console.log('Hello Vite');

console.log(formatDate());

console.log(_.join(['A', 'B', 'C']))
```

可在浏览器中直接看到效果，CSS直接作为内联样式被引入到了HTML文件中。

#### CSS Module

Vite支持CSS Module。

```css
.red {
  color: green;
}
```

在入口文件中引入：

```js
import classes from './css/hello.module.css';

document.getElementById('foo').className = classes.green;
```

#### CSS预处理器

Vite 同时提供了对 `.scss`, `.sass`, `.less`, `.styl` 和 `.stylus` 文件的内置支持。

有如下代码：

`main.less`

```less
@mainColor: white;
@maineSize: 30px;

.main {
  color: @mainColor;
  font-size: @maineSize;
}
```

`footer.scss`

```scss
.footer {
  color: gainsboro;
  span {
    background: purple;
  }
}
```

只需要安装相关的依赖，不需要做任何的配置：

```shell
npm i -D less sass
```

在入口文件中引入：

```js
import './css/main.less';
import './css/footer.scss';
```

#### PostCSS

Vite会自动应用PostCSS配置到已导入的CSS代码。

只需要安装依赖，并配置即可`postcss.config.js`即可。

安装依赖

```shell
npm i postcss postcss-preset-env -D
```

配置`postcss.config.js`

```js
module.exports = {
  plugins: [
    require('postcss-preset-env')
  ]
};
```

在浏览器中，可以看到已经引入的CSS、Less、Scss、以及PostCSS对它们做的处理。

![Vite的使用03](https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/Webpack5/Vite的使用03.png)

### 静态资源处理

静态资源的加载方式有多种。

```js
import dovePng from './img/dove.png'; // 直接加载
import doveURL from './img/dove.png?url' // 显示加载资源为url
import doveString from './img/dove.png?raw' // 以字符串形式加载资源

console.log(dovePng); // /src/img/dove.png
console.log(doveURL); // /src/img/dove.png
console.log(doveString); // 二进制字符串
```

### JSON的处理

JSON 可以被直接导入 —— 同样支持具名导入

```js
import dataJson, { count } from './json/data'

// json的处理
console.log(dataJson.hello, count);
```

### TypeScript的处理

Vite 天然支持引入 `.ts` 文件。

Vite 使用 [esbuild](https://github.com/evanw/esbuild) 将 TypeScript 转译到 JavaScript，约是 `tsc` 速度的 20~30 倍，同时 HMR 更新反映到浏览器的时间小于 50ms。

`math.ts`

```typescript
export function sum(num1: number, num2: number) {
  return num1 + num2;
}
```

入口文件中引入

```js
import { sum } from './ts/math';

console.log(sum(20, 30));
```

### Vue的处理

默认情况下，Vite无法对Vue做处理，直接引入Vue代码会报错，需要使用[@vitejs/plugin-vue](https://www.npmjs.com/package/@vitejs/plugin-vue)插件。

```shell
23:24:38 [vite] Internal server error: Failed to parse source for import analysis because the content contains invalid JS syntax. Install @vitejs/plugin-vue to handle .vue files.
```

安装插件和Vue相关依赖：

```shell
npm i @vitejs/plugin-vue vue -D
```

配置`vite.config.js`

```js
import vue from '@vitejs/plugin-vue'

module.exports = {
  plugins: [vue()]
}
```

`App.vue`

```vue
<template>
  <div id="app">
    <h2 class="title">{{message}}</h2>
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: "Hello Vue ~"
    }
  }
}
</script>

<style scoped>
  .title {
    color: blue
  }
</style>
```

入口中使用：

```js
import VueApp from './vue/App.vue';
import { createApp } from 'vue';

createApp(VueApp).mount("#vueapp");
```

### React的处理

默认情况下，Vite支持React代码，因为ESModule是原生支持React使用的JSX语法的。

安装React依赖

```shell
npm i react react-dom -D
```

创建`App.jsx`

```jsx
import React, { Component } from "react";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      message: "Hello React",
    };
  }

  render() {
    return (
        <h2>{this.state.message}</h2>
    );
  }
}

export default App;
```

注意，入口文件也需要是JSX，否则会报错，`index.jsx`

```js
import React from 'react';
// import ReactDom from 'react-dom';
import { createRoot }  from 'react-dom/client';
import ReactApp from './react/App.jsx';

// ReactDom.createRoot(<ReactApp/>, document.getElementById("app"));
// 新语法，焯！
createRoot(document.getElementById("reactapp")).render(<ReactApp/>);
```

### 文件处理简析

可以看到，Vite在返回文件时，直接返回了原文件类型，如`ts`、`less`、`scss`，但这些类型浏览器本身是不支持的。

那么为什么浏览器直接返回这些类型呢？

原因是，Vite提前将所有格式的文件，提前编译成了JS文件，然后Vite中的connect服务器，通过HTTP 304重定向到已经编译好的JS文件。获取到编译好的文件后，浏览器再进行解析。

![Vite的使用04](https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/Webpack5/Vite的使用04.png)

![Vite的使用05](https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/Webpack5/Vite的使用05.png)

![Vite的使用06](https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/Webpack5/Vite的使用06.png)

可以看到，所有的文件都是JS文件，并不是原文件。

通过重定向，将请求修改为另一个请求，connect擅长处理这样的任务。

### Vite中的connect

Vite2后，Vite内部使用[connect](https://github.com/senchalabs/connect)库来做服务。已经不再使用Koa了（Vite1使用的是Koa），至于为什么换成Connect，官方文档中做了相关说明

> Since most of the logic should be done via plugin hooks instead of middlewares, the need for middlewares is greatly reduced. The internal server app is now a good old [connect](https://github.com/senchalabs/connect) instance instead of Koa.
>
> 由于大多数逻辑应该通过插件钩子而不是中间件来完成，因此对中间件的需求大大减少。内部服务器应用现在是一个很好的旧版的connect实例，而不是Koa。
>
> https://v2.vitejs.dev/guide/migration.html#for-plugin-authors

## Vite中的ESBuild

Vite 使用 [esbuild](https://esbuild.github.io/) [预构建依赖](https://cn.vitejs.dev/guide/dep-pre-bundling.html)。esbuild 使用 Go 编写，并且比以 JavaScript 编写的打包器预构建依赖快 10-100 倍。

![文章配图](https://raw.githubusercontent.com/evanw/esbuild/main/images/benchmark-light.svg)

esbuild的特点：

- 超快的构建速度，且不需要缓存
- 支持ES6和CommonJS模块化
- 支持ES6的Tree Shaking
- 支持Go、JavaScript的[API](https://esbuild.github.io/api/)
- 支持[TypeScript ](https://esbuild.github.io/content-types/#typescript)和 [JSX](https://esbuild.github.io/content-types/#jsx) 语法编译
- 支持[SourceMap](https://esbuild.github.io/api/#sourcemap)
- 支持代码[压缩](https://esbuild.github.io/api/#minify)
- 支持扩展其它[插件](https://esbuild.github.io/plugins/)

有了esbuild，就不需要再使用Babel对JS代码做处理。

esbuild为什么这么快？

- esbuild使用Go语言编写，可以直接转换成机器码，而无需经过字节码。JavaScript代码需要先编译解析成AST —> 转成字节码 —> 优化字节码 —> 转成机器码。Go比JavaScript快很多。
- esbuild可以充分利用CPU的多内核，esbuild会单独开一个进程，在这个进程中它会尽可能多地开启线程，多线程运行在CPU多个内核中，并行执行，效率更高，并且尽可能让CPU饱和运行。
- esbuild的所有内容都是从零开始编写的，而不是使用第三方，所以从一开始就考虑到了各种性能问题。

## Vite的打包

Vite打包也很简单，只需运行 `vite build` 命令。默认情况下，它使用 `<root>/index.html` 作为其构建入口点，并生成能够静态部署的应用程序包。

Vite使用Rollup做打包，因为Rollup 在应用打包方面更加成熟和灵活。

[为什么生产环境仍需打包？](https://cn.vitejs.dev/guide/why.html#why-bundle-for-production)

[为何不用 ESBuild 打包？](https://cn.vitejs.dev/guide/why.html#why-bundle-for-production)

打包：

```shell
npx vite build
```

查看效果：

```shell
npx vite preview
```

`vite preview` 命令会在本地启动一个静态 Web 服务器，将 `dist` 文件夹运行在 `http://localhost:4173`。这样在本地环境下查看该构建产物是否正常可用就方便多了。

可以将这些命令配置到`scripts`中

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
},
```

## 项目中使用Vite

上面是从零开始使用Vite，相当于是Webpack或Rollup的打包工具。

但是实际项目中，并不需要从零配置，直接使用Vite的脚手架工具即可：

```shell
npm init vite@latest
```

[npm-init](https://docs.npmjs.com/cli/v8/commands/npm-init)本质上操作如下：

- 执行`npm exec crrete-vite@latest`，`create-vite`脚手架通过[npm-exec](https://docs.npmjs.com/cli/v8/commands/npm-exec)解析，它会执行本地或者远程的npm包命令，这样就不需要本地安装脚手架。

- 当然，也可以本地安装`npm i -g create-vite@latest`，和本地安装`create-react-app`一样。使用`npm init react-app react-demo`也无需本地安装React脚手架来安装创建React应用。`npm init`会自动加上`create-`前缀，无需手动添加。
