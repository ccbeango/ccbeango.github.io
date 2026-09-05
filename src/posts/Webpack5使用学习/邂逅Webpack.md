---
title: "邂逅Webpack"
date: "2022-04-07 22:49:48"
series:
  name: "Webpack5使用学习"
  order: 1
tags:
  - "Webpack5使用学习"
draft: false
---

## 学习内容

Webpack的核心内容：

- webpack核心配置深入解析；
- webpack常用Loaders和Plugins深入学习；
- 自定义webpack中自己的Loader和Plugin；
- Babel各种用法以及polyfill、TypeScript的支持；
- ESLint的配置规则以及在VSCode、webpack中的使用；
- 各种性能优化方案：打包抽取分包、Tree Shaking、动态链接库、CDN、gzip压缩等等；
- webpack模块化原理解析、打包原理实现；
- 掌握其他流行构件工具：gulp、rollup、vite；

## 前端发展

### 早期

互联网发展早期，前端只负责写静态页面，纯粹的展示功能，
JavaScript的作用也只是进行一些表单的验证和增加特效。

当然为了动态在页面中填充一些数据，也出现了JSP、ASP、
PHP这样的开发模式。

### 近期

随着AJAX技术的诞生改变了前端的发展历史，使得开发者发现，
前端的作用不仅仅是展示页面，可以管理数据以及和用户互动。
由于用户交互、数据交互的需求增多，也让JQuery 这样优秀的前
端工具库大放异彩。

### 现代

而现代的Web开发事实上变得更加多样化和复杂化。开发的多
样性包括我们需要开发PC Web页面、移动端Web页面、小程序、
公众号、甚至包括App，都属于前端开发的范畴。

当然也包括一系列复杂性的问题。

## 为什么会出现Webpack

前端的复杂化，让我们在开发中遇到一些问题：

- 代码量打，开发过程中需要通过**模块化的方式**来开发，也出现了很多模块化技术，如CommonJS、AMD、CMD、UMD
- 使用一些高级的特性来加快我们的开发效率或者安全性，比如通过`ES6+`、`TypeScript`开发脚本逻辑，通过`sass`、`less`等方式来编写css样式代码；但浏览器不支持，需要通过转化让浏览器识别。
- 开发过程中，我们还希望试试的监听文件的变化来并且反映到浏览器上，提高开发的效率
- 开发完成后我们还需要将代码进行压缩、合并以及其他相关的优化。
- 开发各种工具库，等等。

目前前端流行的三大框架：Vue、React、Angular，这三大框架的创建过程我们都是借助于脚手架（CLI）的；事实上Vue-CLI、create-react-app、Angular-CLI都是基于webpack来帮助我们支持模块化、less、TypeScript、打包优化等的；

## webpack简介

### 什么是Webpack

> webpack is a **static module bundler** for **modern** JavaScript applications

webpack 是一个用于现代 JavaScript 应用程序的静态模块打包工具

详细的解释如下：

- 打包bundler：webpack可以将帮助我们进行打包，所以它是一个打包工具。
- 静态的static：这样表述的原因是我们最终会将代码打包成静态资源（部署到静态服务器）；
- 模块化module：webpack默认支持各种模块化开发，ES Module、CommonJS、AMD等；
- 现代的modern：正是因为现代前端开发面临各种各样的问题，才催生了webpack的出现和发展；

### 工作中Webpack的应用

前端目前离不开Webpack。

- 在开发vue、react、angular等项目的过程中我们需要一些特殊的配置：比如给某些目录结构起别名，让我们的项目支持sass、less等预处理器，希望在项目中手动的添加TypeScript的支持，都需要对webpack进行一些特殊的配置工作。
- 如果我们希望将在原有的脚手架上来定制一些自己的特殊配置提供性能：比如安装性能分析工具、使用gzip压缩代码、引用cdn的资源，公共代码抽取等等操作，甚至包括需要编写属于自己的loader和plugin。

### Webpack和Vite

**webpack会被vite取代吗？**

vite推出后确实引起了很多的反响，也有很多人看好vite的发展。

但是目前vite取代webpack还有很长的路要走：

- 目前vue的项目支持使用vite，也支持使用webpack；
- React、Angular的脚手架目前没有支持，暂时也没有转向vite的打算；
- vite最终打包的过程，依然需要借助于rollup来完成；

vite的核心思想并不是首创：

- vite的很多思想和之前的snowpack是重合的，而且相对目前来说snowpack会更加成熟。当然，后续发展来看vite可能会超越snowpack；

webpack在发展的过程中，也会不断改进自己，借鉴其他工具的一些优势和思想。在这么多年的发展中，无论是自身的优势还是生态都是非常强大的；开发中遇到的问题，基本上都可以找到对应的解决方案。

### 官方文档指南

- API：API，提供相关的接口，可以自定义编译的过程（比如自定义loader和Plugin可以参考该位置的API）
- BLOG：博客，等同于上一个tab的BLOG，里面有一些博客文章；
- CONCEPTS：概念，主要是介绍一些webpack的核心概念，比如入口、出口、Loaders、Plugins等等，但是这里并没有一些对它
  们解析的详细API；
- CONFIGURATION：配置，webpack详细的配置选项，都可以在这里查询到，更多的时候是作为查询手册；
- GUIDES：指南，更像是webpack提供给我们的教程，我们可以按照这个教程一步步去学习webpack的使用过程；
- LOADERS：loaders，webpack的核心之一，常见的loader都可以在这里查询到用法，比如css-loader、babel-loader、less-loader等等；
- PLUGINS：plugins，webpack的核心之一，常见的plugin都可以在这里查询到用法，比如BannerPlugin、CleanWebpackPlugin、MiniCssExtractPlugin等等；
- MIGRATE：迁移，可以通过这里的教程将webpack4迁移到webpack5等；

## Webpack的安装

目前需要两个：webpack、webpack-cli。

```shell
npm install webpack webpack-cli –g # 全局安装
npm install webpack webpack-cli –D # 局部安装
```

但是webpack-cli并不是必须的。

比如vue项目中本身是依赖webpack的，但是没有使用webpack-cli，而是使用vue自己实现的`vue-cli-service`，来对webpack-cli做了替换。

再比如，React项目中，也是自实现webpack加载，并没有使用`webpack-cli`

为什么我们需要安装webpack-cli，原因也很简单，假如我们在使用webpack的过程中，如果使用了一些配置信息，如`webpack --config w.config.js`，那么`--config`配置参数的解析，是交给webpack-cli来做的。也包括参数后面的配置文件`w.config.js`，这个文件最终在加载的时候也是交给webpack-cli来帮助我们加载的。

但是，我们可以不使用`webpack-cli`来解析参数和加载文件，完全可以自己实现。自己返回对应的complier即可，Vue和React脚手架，都是这样来实现的。

```js
const webpack = require('webpack')

const compiler = webpack(config)
```

刚开始学习时，我们可以借助官方的`webpack-cli`来加载配置。之后可以再编写自己的Cli。

总结：

- 执行webpack命令，会执行node_modules下的.bin目录下的webpack；
- webpack在执行时是依赖webpack-cli的，如果没有安装就会报错；
- 而webpack-cli中代码执行时，才是真正利用webpack进行编译和打包的过程；
- 所以在安装webpack时，我们需要同时安装webpack-cli（第三方的脚手架事实上是没有使用webpack-cli的，而是类似于
  自己的vue-service-cli的东西）

## 传统开发存在的问题

日常开发中，我们会使用一些语法，比如：

- ES6的语法，比如const、箭头函数、模块化等语法；
- CommonJS的模块化语法；
- ES6模块化语法，在通过script标签引入时，必须添加上 type="module" 属性；旧的浏览器不支持模块化语法。

上面存在的语法，我们在发布静态资源时，是不能直接发布的，因为运行在用户浏览器必然会存在各种各样的兼容性问题。

我们需要通过某个工具对其进行打包，让其转换成浏览器可以直接识别的语法。

## Webpack默认打包

### 全局Webpack使用

全局安装webpack后，在`01_webpack初体验`目录下目录下直接执行 webpack 命令

```shell
webpack
```

此时，**webpack会默认查找当前目录下的 `src/index.js`作为入口**，所以，如果当前项目中没有存在`src/index.js`文件，那么会报错。

运行后会生成一个`dist`文件夹，里面存放一个`main.js`的文件，就是我们打包之后的文件。

这个文件中的代码被压缩和丑化了

```js
(()=>{var o={466:o=>{o.exports={dateFormat:o=>"2020-12-12",priceFormat:o=>"100.00"}}},r={};function t(e){var s=r[e];if(void 0!==s)return s.exports;var a=r[e]={exports:{}};return o[e](a,a.exports,t),a.exports}(()=>{"use strict";const{dateFormat:o,priceFormat:r}=t(466);console.log(50),console.log(600),console.log(o("1213")),console.log(r("1213"))})()})();
```

我们可以看到，代码中依然有ES6的语法，比如箭头函数、`const`等，这是因为默认情况下webpack并不清楚我们打包后的文件是否需要转成ES5之前的语法，后续我们需要通过babel来进行转换和设置。

官方文档在[模块](https://webpack.docschina.org/guides/getting-started/#modules)中有介绍：

> webpack 不会更改代码中除 `import` 和 `export` 语句以外的部分，如果你在使用其它 ES2015 特性，请确保你在 webpack loader 系统中使用了一个像是Babel的transpiler（转译器）。

也就是webpack内部默认对`import`和`export`做了支持，其它的不会做处理，如果想要支持，需要自己配置`babel`相关的loader。

### 局部Webpack使用

通常情况下，我们不会使用全局webpack进行打包，我们会在项目中安装webpack，在`package.json`中对版本进行控制。

全局安装的webpack，每个人可能都会是不同的版本。这样做的目的是**保证无论何时何地，我们执行打包命令时，所使用的版本都是一致的**。

```shell
 npm i webpack webpack-cli -D
```

我们可以直接使用局部的webpack进行打包，命令行中输入即可完成打包。

```shell
./node_modules/.bin/webpack
```

但是，这种方式会很麻烦，通常我们会用下面两种方法来使用局部Webpack

**方法一 配置脚本**

通常我们会在`package.json`中配置相关的执行脚本：

```json
"scripts": {
    "build": "webpack"
  },
```

执行`npn run build`，就可以使用局部的Webpack完成打包。

推荐此种方法。

注意：如果局部未安装，默认会去找全局安装的Webpack，未找到才会提示报错。

**方法二 使用npx**

我们可以使用`npx`，执行`npx webpack`，也可以使用局部的Webpack完成打包。

这种适用于未配置脚本，临时执行某一个局部脚本。当然我们也可以用于执行其它局部脚本。

`npx`的原理，就是在运行它时，执行下列流程：

- 去`node_modules/.bin`路径检查`npx`后的命令是否存在，找到之后执行；
- 找不到，就去环境变量`$PATH`里面，检查`npx`后的命令是否存在，找到之后执行；
- 还是找不到，自动下载一个临时的依赖包最新版本在一个临时目录，然后再运行命令，运行完之后删除，不污染全局环境。

npx 想要解决的主要问题，就是调用项目内部安装的模块。关于npx可看[npx 使用教程](https://www.ruanyifeng.com/blog/2019/02/npx.html)
