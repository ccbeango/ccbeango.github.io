---
title: "Vue源码学习01"
date: "2021-10-02 10:00:51"
tags:
  - "前端"
  - "Vue"
draft: false
---

## Flow

[Flow](https://flow.org/en/docs/getting-started/) 是 facebook 出品的 JavaScript 静态类型检查工具。

Vue.js 的源码利用了 Flow 做了静态类型检查。

Vue.js 在做 2.0 重构的时候，在 ES2015 的基础上，除了 ESLint 保证代码风格之外，也引入了 Flow 做静态类型检查。之所以选择 Flow，主要是因为 Babel 和 ESLint 都有对应的 Flow 插件以支持语法，可以完全沿用现有的构建配置，非常小成本的改动就可以拥有静态类型检查的能力。

### Flow 在 Vue.js 源码中的应用

有时候我们想引用第三方库，或者自定义一些类型，但 Flow 并不认识，因此检查的时候会报错。为了解决这类问题，Flow 提出了一个 `libdef` 的概念，可以用来识别这些第三方库或者是自定义类型，而 Vue.js 也利用了这一特性。

在 Vue.js 的主目录下有 `.flowconfig` 文件， 它是 Flow 的配置文件。

配置文件中，`[libs]`定义Vue中自定义的位置。

```text
...

[libs]
flow

...

```

这里 `[l ibs]` 配置的是 `flow`，表示指定的库定义都在 `flow` 文件夹内。

我们可以看到flow中配置如下：

```js
flow
├── compiler.js        # 编译相关
├── component.js       # 组件数据结构
├── global-api.js      # Global API 结构
├── modules.js         # 第三方库定义
├── options.js         # 选项相关
├── ssr.js             # 服务端渲染相关
├── vnode.js           # 虚拟 node 相关
```

静态类型检查的方式非常有利于大型项目源码的开发和维护。Vue3中使用的是TypeScript。

## src目录设计

ue.js 的源码都在 src 目录下，其目录结构如下。

```text
src
├── compiler        # 编译相关
├── core            # 核心代码
├── platforms       # 不同平台的支持
├── server          # 服务端渲染
├── sfc             # .vue 文件解析
├── shared          # 共享代码
```

### compiler

Vue中一个很重要的点是VirtualDOM，虚拟DOM的生成实际上执行的是render()函数。

但在Vue中我们通常不会手写`render()`函数，往往会写`template`。那么template转成render的实现就在compiler目录下。

compiler 目录包含 Vue.js 所有编译相关的代码。它包括

- 把模板解析成 ast 语法树
- ast 语法树优化
- 代码生成等功能。

编译的工作可以在构建时做（借助 webpack、vue-loader 等辅助插件）；也可以在运行时做，使用包含构建功能的 Vue.js。显然，编译是一项耗性能的工作，所以更推荐前者——离线编译。

### core

core 目录包含了 Vue.js 的核心代码，包括内置组件、全局 API 封装，Vue 实例化、观察者、虚拟 DOM、工具函数等等。

目录如下：

```text
core
├── components        # 内置组件 keep-alive
├── global-api        # 全局API
├── instance          # 渲染的实例
├── observer          # 响应式相关
├── vdom              # .vue 文件解析
```

- components 内置组件
  - keep-alive在这里实现
- global-api 全局的API
  - Vue.use
  - Vue.minxn
  - Vue.extend
- instance 渲染实例
  - render-helpers 渲染辅助函数
  - event 事件相关
    - $emit
    - $on
    - $once
    - $off
  - lifecycle 生命周期
    - 挂载组件
    - 更新子组件
  - proxy 非生产环境的proxy代理
  - render 渲染
- observer 响应式相关
  - array 数据相关API
  - dep
  - scheduler
  - traverse
  - watcher 指令和watch使用
- util 工具函数
- vdom 虚拟DOM

### platforms

Vue.js 是一个跨平台的 MVVM 框架，它可以跑在 web 上，也可以配合 weex 跑在 native 客户端上。platform 是 Vue.js 的入口，2 个目录代表 2 个主要入口，分别打包成运行在 web 上和 weex 上的 Vue.js

platforms

- 包含平台相关的运行代码
  - 平台相关的编译、运行时、服务端渲染、工具函数等
- web 浏览器相关程序
- weex 类似于RN
- 那么我们从不同的平台入口就可以编译出不同的vue代码

### server

服务端渲染相关代码。

Vue.js 2.0 支持了服务端渲染，所有服务端渲染相关的逻辑都在这个目录下。

注意：这部分代码是跑在服务端的 Node.js，不要和跑在浏览器端的 Vue.js 混为一谈。

服务端渲染主要的工作是把组件渲染为服务器端的 HTML 字符串，将它们直接发送到浏览器，最后将静态标记"混合"为客户端上完全交互的应用程序。

### sfc

讲`.vue`的代码文件编译成一个JS的对象。

通常我们开发 Vue.js 都会借助 webpack 构建， 然后通过 .vue 单文件来编写组件。

这个目录下的代码逻辑会把 .vue 文件内容解析成一个 JavaScript 的对象。

### shared

所有目录共享的一个辅助方法。

Vue.js 会定义一些工具方法，这里定义的工具方法都是会被浏览器端的 Vue.js 和服务端的 Vue.js 所共享的。

## 源码构建

Vue.js 源码是基于 [Rollup](https://github.com/rollup/rollup) 构建的，它的构建相关配置都在 scripts 目录下。

## 入口文件
