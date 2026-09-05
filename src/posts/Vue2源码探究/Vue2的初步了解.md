---
title: "Vue2的初步了解"
date: "2021-11-30 13:57:28"
series:
  name: "Vue2源码探究"
  order: 3
tags:
  - "Vue2源码探究"
  - "初探Vue"
draft: false
---

本节记录阅读Vue2源码的整体目录结构，对Vue2的代码模块设计和划分有一个初步的了解。

## Vue中的Flow

我们都知道，Javascript作为动态类型语言十分灵活。最初的JavaScript只是为了实现简单的页面交互逻辑，寥寥几句就能完成一个网页的交互任务。不过随着前端的发展，前端项目越来越庞大，JS代码越来越多，过于灵活的语言特性也导致了一些难以在开发编译阶段发现的问题，但在运行阶段却会出现各种各样的bug。

项目越复杂就越需要通过工具的手段来保证项目的维护性和增强代码的可读性。

Vue2使用[Flow](https://flow.org/)作为类型检查工具，可以让我们在编译阶段提前发现一些难以发现的问题。

> 类型检查，就是在编译期尽早发现（由类型错误引起的）bug，又不影响代码运行（不需要运行时动态检查类型），使编写 JavaScript 具有和编写 Java 等强类型语言相近的体验。

那么Vue 2.0 为什么选用 Flow 进行静态代码检查而不是直接使用 TypeScript？

> 作者的[回复](https://www.zhihu.com/question/46397274/answer/101193678)：
>
> 这个选择最根本的还是在于工程上成本和收益的考量。Vue 2.0 本身在初期的快速迭代阶段是用 ES2015 写的，整个构建工具链也沿用了 Vue 1.x 的基于 ES 生态的一套（Babel, ESLint, Webpack, Rollup...)，全部换 TS 成本过高，短期内并不现实。

可总结为，Vue.js在做2.0重构的时候，在ES2015的基础上，除了ESLint保证代码风格之外，引入了Flow做静态类型检查。之所以选择Flow，主要是因为Babel和ESLint都有对应的 Flow插件以支持语法，可以完全沿用现有的构建配置，非常小成本的改动就可以拥有静态类型检查的能力。

## 项目目录

### flow

可以看到项目中的`.flowconfig`配置文件中，有Vue的源码flow配置。

```text
[ignore]
.*/node_modules/.*
.*/test/.*
.*/scripts/.*
.*/examples/.*
.*/benchmarks/.*

[include]

[libs]
flow

[options]
unsafe.enable_getters_and_setters=true
module.name_mapper='^compiler/\(.*\)$' -> '<PROJECT_ROOT>/src/compiler/\1'
module.name_mapper='^core/\(.*\)$' -> '<PROJECT_ROOT>/src/core/\1'
module.name_mapper='^shared/\(.*\)$' -> '<PROJECT_ROOT>/src/shared/\1'
module.name_mapper='^web/\(.*\)$' -> '<PROJECT_ROOT>/src/platforms/web/\1'
module.name_mapper='^weex/\(.*\)$' -> '<PROJECT_ROOT>/src/platforms/weex/\1'
module.name_mapper='^server/\(.*\)$' -> '<PROJECT_ROOT>/src/server/\1'
module.name_mapper='^entries/\(.*\)$' -> '<PROJECT_ROOT>/src/entries/\1'
module.name_mapper='^sfc/\(.*\)$' -> '<PROJECT_ROOT>/src/sfc/\1'
suppress_comment= \\(.\\|\n\\)*\\$flow-disable-line

```

我们可以看到

- `[ignore]`忽略对指定目录的类型检查。
- `[libs]` 配置使用库flow
- `[options]`配置了项目中src目录下一些目录别名和一个注释忽略配置
  - 这样可以直接使用类似`import Vue from 'core/index'`导入模块，rollup打包时，会自动识别到对应的模块
  - 代码中`// $flow-disable-line`可以忽略下一行的类型检查，源码中多处使用，避免一些情况下的类型检查

接下来我们看下到`flow`目录中的文件，详见[目录结构总览](/blog/Vue2源码探究/Vue2目录结构总览)，这里定义了Vue中自定义的类型检查配置。

我们后面的源码学习中，可以根据需要，查阅类型定义，在不了解Vue代码前通读类型定义没有什么必要，也没有什么实际的意义。

### scripts

该目录为Vue源码打包构建的配置目录。

```text
├── scripts
│   ├── alias.js
│   ├── build.js
│   ├── config.js
│   ├── feature-flags.js
│   ├── gen-release-note.js
│   ├── get-weex-version.js
│   ├── git-hooks
│   │   ├── commit-msg
│   │   └── pre-commit
│   ├── release-weex.sh
│   ├── release.sh
│   └── verify-commit-msg.js
```

### src

Vue的源码定义在src目录下，其结构如下：

```text
src
├── compiler        # 编译相关
├── core            # 核心代码
├── platforms       # 不同平台的支持
├── server          # 服务端渲染
├── sfc             # .vue 文件解析
├── shared          # 全局工具方法
```

#### compiler

Vue中一个很重要的点是VirtualDOM，虚拟DOM的生成实际上执行的是render函数。但在Vue中我们通常不会手写`render()`函数，往往会写`template`。那么template转成render的实现就在compiler目录下。

该目录是Vue中所有编译相关的代码。主要的作用是解析template模板成AST（抽象语法树）、AST优化、将AST转换成代码字符串，再通过处理，返回页面DOM渲染要用到的render函数。

编译的工作可以在构建时做（借助 webpack、vue-loader 等辅助插件）；也可以在运行时做，使用包含构建功能的 Vue.js。显然，编译是一项耗性能的工作，所以更推荐前者——离线编译。

#### core

该目录包含了 Vue.js 的核心代码，包括内置组件、全局API 封装（Vue的静态属性和方法），Vue 实例化、观察者Observer、虚拟 DOM、工具函数等等。

```text
├── core
│   ├── components 			# 全局内置组件
│   ├── global-api 			# Vue静态属性和方法
│   ├── instance 				# Vue原型属性和方法 -> 实例化
│   ├── observer 				# 数据观察者Observer
│   ├── util 					  # core工具函数
│   ├── vdom 						# 虚拟DOM
│   ├── config.js 			# Vue全局默认配置
│   └── index.js	 			# 入口
```

#### platforms

Vue是一个跨平台的MVV 框架，它既可以在web端运行，也可以配合weex在native客户端上运行。

该目录是Vue的入口，2 个目录代表2个主要入口，分别打包成运行在web上和weex上的Vue.js。weex 类似于RN。我们从不同的平台入口就可以编译出不同的vue代码

我们会重点分析 web 入口打包后的 Vue.js，对于 weex 入口打包的 Vue.js，笔记中不会涉及到。

```text
├── platforms
│   ├── web
│   │   ├── compiler
│   │   ├── runtime
│   │   ├── server
│   │   ├── util
│   │   ├── entry-compiler.js
│   │   ├── entry-runtime-with-compiler.js
│   │   ├── entry-runtime.js
│   │   ├── entry-server-basic-renderer.js
│   │   └── entry-server-renderer.js
```

我们可以看到，web目录下除了平台相关的编译、运行时、服务端渲染、工具函数外，还有5个`entry-*`的入口文件。

#### server

该目录包含服务端渲染相关代码。学习笔记中不会涉及到。

服务端渲染主要的工作是把组件渲染为服务器端的 HTML 字符串，将它们直接发送到浏览器，最后将静态标记"混合"为客户端上完全交互的应用程序。

#### sfc

通常我们开发Vue都会借助webpack构建， 然后通过 `.vue`单文件来编写组件。

这个目录下的代码逻辑会把 `.vue` 文件内容解析成一个 JavaScript 的对象。

#### shared

所有目录共享的一个公共方法。

Vue.js 会定义一些工具方法，这里定义的工具方法都是会被浏览器端的 Vue.js 和服务端的 Vue.js 所共享的。

### dist

该目录是Vue打包结果，我们开发中引用的Vue代码，来自于此。

### examples

该目录中是官方的一些示例代码。

本次学习中在目录下创建了`demo`目录，存放源码阅读的调试例子

### 其它目录

packages、test、types、benchmarks、examples与本次学习源码阅读关系不大，详见[目录结构总览](/blog/Vue2源码探究/Vue2目录结构总览)

> benchmark 的目的主要有两种，一是验证性能，另一个是获得一些基准数据，从而可以与本软件的其他版本或其他同类软件进行比较。通常不使用benchmark做正确性验证。benchmark测试不一定会发生在每个版本的开发期间。有可能仅会在有较大改动的时候才会进行一次benchmark测试。因此频率相对单元测试来说要低很多。

## 小结

从目录结构可以看出，Vue根据功能进行了清晰的模块拆分，相关的逻辑放在一个独立的目录下维护，并且把复用的代码也抽成一个独立目录。

这样的目录设计让代码的阅读性和可维护性都变强，是非常值得学习。
