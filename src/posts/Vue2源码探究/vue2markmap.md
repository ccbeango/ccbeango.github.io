---
title: "vue2markmap"
date: "2021-11-30 15:12:55"
series:
  name: "Vue2源码探究"
  order: 7
tags:
  - "Vue2源码探究"
  - "初探Vue"
draft: false
---

## **flow** - 类型检查配置

- `compiler.js` - 编译code
- `component.js` - Vue实例属性和方法
- `global-api.js` - Vue静态属性和方法
- `modules.js` - 第三方库定义
- `options.js` - Vue实例的options、propOption
- `ssr.js` - 服务端渲染
- `vnode.js` - VNode节点
- `weex.js` - weex平台

## **scripts**

- `alias.js` - 目录别名
- `build.js` - 打包入口
- `config.js` - 打包配置生成
- `feature-flags.js`
- `gen-release-note.js`
- `get-weex-version.js`
- **git-hooks**
  - commit-msg
  - pre-commit
- `release-weex.sh`
- `release.sh`
- `verify-commit-msg.js`

## **src**

- **compiler** - 编译相关
  - codegen - ast -> 编译code
    - `events.js`
    - `index.js`
  - directives - 指令handler
    (codegen中使用)
    - `bind.js`
    - `index.js`
    - `model.js`
    - `on.js`
  - parser 解析template -> AST
    - `entity-decoder.js`
    - `filter-parser.js`
    - `html-parser.js`
    - `index.js`
    - `text-parser.js`
  - `codeframe.js`
  - `create-compiler.js`
  - `error-detector.js`
  - `helpers.js`
  - `index.js`
  - `optimizer.js` -> 优化AST
  - `to-function.js`

- **core** - 核心代码
  - `index.js` - Vue核心入口文件
  - `config.js` - Vue全局默认配置
  - **components** - 全局内置组件
    - `index.js`
    - `keep-alive.js`
  - **global-api** - Vue静态属性和方法
    - `assets.js` - Vue.components()|directive()|filter()
    - `extend.js` - Vue.extend()
    - `index.js` - 全局API
    - `mixin.js` - Vue.mixin()
    - `use.js` - Vue.use()
  - **instance** - Vue原型属性和方法 -> 实例化
    - `events.js`
    - `index.js` - Vue构造函数
    - `init.js`
    - `inject.js`
    - `lifecycle.js`
    - `proxy.js`
    - `render.js`
    - `state.js`
    - **render-helpers**
      - `bind-dynamic-keys.js`
      - `bind-object-listeners.js`
      - `bind-object-props.js`
      - `check-keycodes.js`
      - `index.js`
      - `render-list.js`
      - `render-slot.js`
      - `render-static.js`
      - `resolve-filter.js`
      - `resolve-scoped-slots.js`
      - `resolve-slots.js`
  - **observer** - 数据观察者Observer
    - `array.js`
    - `dep.js`
    - `index.js`
    - `scheduler.js`
    - `traverse.js`
    - `watcher.js`
  - **util** - core工具函数
    - `debug.js`
    - `env.js`
    - `error.js`
    - `index.js`
    - `lang.js`
    - `next-tick.js`
    - `options.js`
    - `perf.js`
    - `props.js`
  - **vdom** - 虚拟DOM
    - **helpers**
      - `extract-props.js`
      - `get-first-component-child.js`
      - `index.js`
      - `is-async-placeholder.js`
      - `merge-hook.js`
      - `normalize-children.js`
      - `normalize-scoped-slots.js`
      - `resolve-async-component.js`
      - `update-listeners.js`
    - **modules**
      - `directives.js`
      - `index.js`
      - `ref.js`
    - `create-component.js`
    - `create-element.js`
    - `create-functional-component.js`
    - `patch.js`
    - `vnode.js`

- **platforms** - 不同平台支持
  - **web**
    - **compiler** - 编译扩展
      - **directives**
        - `html.js`
        - `index.js`
        - `model.js`
        - `text.js`
      - **modules**
        - `class.js`
        - `index.js`
        - `model.js`
        - `style.js`
      - `index.js`
      - `options.js`
      - `util.js`
    - **runtime** - runtime扩展
      - `class-util.js`
      - `index.js` - Vue runtime 扩展入口
      - `node-ops.js`
      - `patch.js`
      - `transition-util.js`
      - **components**
        - `index.js`
        - `transition-group.js`
        - `transition.js`
      - **directives**
        - `index.js`
        - `model.js`
        - `show.js`
      - **modules**
        - `attrs.js`
        - `class.js`
        - `dom-props.js`
        - `events.js`
        - `index.js`
        - `style.js`
        - `transition.js`
    - **server**
      - `compiler.js`
      - **directives**
        - `index.js`
        - `model.js`
        - `show.js`
      - **modules**
        - `attrs.js`
        - `class.js`
        - `dom-props.js`
        - `index.js`
        - `style.js`
      - `util.js`
    - **util**
      - `attrs.js`
      - `class.js`
      - `compat.js`
      - `element.js`
      - `index.js`
      - `style.js`
    - `entry-compiler.js`
    - `entry-runtime-with-compiler.js` - runtime + compiler入口
    - `entry-runtime.js`
    - `entry-server-basic-renderer.js`
    - `entry-server-renderer.js`
  - ~~**weex**~~
    - compiler
    - runtime
    - util
    - `entry-compiler.js`
    - `entry-framework.js`
    - `entry-runtime-factory.js`

- ~~**server**~~ - 服务端渲染
- **sfc** - .vue文件解析
  - `parser.js`

- **shared** - 全局工具方法
  - `constants.js`
  - `util.js`

## **examples** - 官方示例

- **demo** - 源码阅读调试示例

## **dist** - 打包结果

## ~~**packages**~~

- vue-server-renderer
  - 服务端渲染
- vue-template-compiler
  - Web模板编译
- weex-template-compiler
  - weex模板编译
- weex-vue-framework
  - framework

## ~~**test**~~ - 单元测试

## ~~**types**~~ - Typescript兼容定义

## ~~**benchmarks**~~ - 性能验证

<!--
vue
├── BACKERS.md
├── benchmarks
├── dist
├── examples
├── flow
│   ├── compiler.js
│   ├── component.js
│   ├── global-api.js
│   ├── modules.js
│   ├── options.js
│   ├── ssr.js
│   ├── vnode.js
│   └── weex.js
├── packages
│   ├── vue-server-renderer
│   ├── vue-template-compiler
│   ├── weex-template-compiler
│   └── weex-vue-framework
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
├── src
│   ├── compiler
│   │   ├── codeframe.js
│   │   ├── codegen
│   │   │   ├── events.js
│   │   │   └── index.js
│   │   ├── create-compiler.js
│   │   ├── directives
│   │   │   ├── bind.js
│   │   │   ├── index.js
│   │   │   ├── model.js
│   │   │   └── on.js
│   │   ├── error-detector.js
│   │   ├── helpers.js
│   │   ├── index.js
│   │   ├── optimizer.js
│   │   ├── parser
│   │   │   ├── entity-decoder.js
│   │   │   ├── filter-parser.js
│   │   │   ├── html-parser.js
│   │   │   ├── index.js
│   │   │   └── text-parser.js
│   │   └── to-function.js
│   ├── core
│   │   ├── components
│   │   │   ├── index.js
│   │   │   └── keep-alive.js
│   │   ├── config.js
│   │   ├── global-api
│   │   │   ├── assets.js
│   │   │   ├── extend.js
│   │   │   ├── index.js
│   │   │   ├── mixin.js
│   │   │   └── use.js
│   │   ├── index.js
│   │   ├── instance
│   │   │   ├── events.js
│   │   │   ├── index.js
│   │   │   ├── init.js
│   │   │   ├── inject.js
│   │   │   ├── lifecycle.js
│   │   │   ├── proxy.js
│   │   │   ├── render-helpers
│   │   │   │   ├── bind-dynamic-keys.js
│   │   │   │   ├── bind-object-listeners.js
│   │   │   │   ├── bind-object-props.js
│   │   │   │   ├── check-keycodes.js
│   │   │   │   ├── index.js
│   │   │   │   ├── render-list.js
│   │   │   │   ├── render-slot.js
│   │   │   │   ├── render-static.js
│   │   │   │   ├── resolve-filter.js
│   │   │   │   ├── resolve-scoped-slots.js
│   │   │   │   └── resolve-slots.js
│   │   │   ├── render.js
│   │   │   └── state.js
│   │   ├── observer
│   │   │   ├── array.js
│   │   │   ├── dep.js
│   │   │   ├── index.js
│   │   │   ├── scheduler.js
│   │   │   ├── traverse.js
│   │   │   └── watcher.js
│   │   ├── util
│   │   │   ├── debug.js
│   │   │   ├── env.js
│   │   │   ├── error.js
│   │   │   ├── index.js
│   │   │   ├── lang.js
│   │   │   ├── next-tick.js
│   │   │   ├── options.js
│   │   │   ├── perf.js
│   │   │   └── props.js
│   │   └── vdom
│   │       ├── create-component.js
│   │       ├── create-element.js
│   │       ├── create-functional-component.js
│   │       ├── helpers
│   │       │   ├── extract-props.js
│   │       │   ├── get-first-component-child.js
│   │       │   ├── index.js
│   │       │   ├── is-async-placeholder.js
│   │       │   ├── merge-hook.js
│   │       │   ├── normalize-children.js
│   │       │   ├── normalize-scoped-slots.js
│   │       │   ├── resolve-async-component.js
│   │       │   └── update-listeners.js
│   │       ├── modules
│   │       │   ├── directives.js
│   │       │   ├── index.js
│   │       │   └── ref.js
│   │       ├── patch.js
│   │       └── vnode.js
│   ├── platforms
│   │   ├── web
│   │   │   ├── compiler
│   │   │   │   ├── directives
│   │   │   │   │   ├── html.js
│   │   │   │   │   ├── index.js
│   │   │   │   │   ├── model.js
│   │   │   │   │   └── text.js
│   │   │   │   ├── index.js
│   │   │   │   ├── modules
│   │   │   │   │   ├── class.js
│   │   │   │   │   ├── index.js
│   │   │   │   │   ├── model.js
│   │   │   │   │   └── style.js
│   │   │   │   ├── options.js
│   │   │   │   └── util.js
│   │   │   ├── entry-compiler.js
│   │   │   ├── entry-runtime-with-compiler.js
│   │   │   ├── entry-runtime.js
│   │   │   ├── entry-server-basic-renderer.js
│   │   │   ├── entry-server-renderer.js
│   │   │   ├── runtime
│   │   │   │   ├── class-util.js
│   │   │   │   ├── components
│   │   │   │   │   ├── index.js
│   │   │   │   │   ├── transition-group.js
│   │   │   │   │   └── transition.js
│   │   │   │   ├── directives
│   │   │   │   │   ├── index.js
│   │   │   │   │   ├── model.js
│   │   │   │   │   └── show.js
│   │   │   │   ├── index.js
│   │   │   │   ├── modules
│   │   │   │   │   ├── attrs.js
│   │   │   │   │   ├── class.js
│   │   │   │   │   ├── dom-props.js
│   │   │   │   │   ├── events.js
│   │   │   │   │   ├── index.js
│   │   │   │   │   ├── style.js
│   │   │   │   │   └── transition.js
│   │   │   │   ├── node-ops.js
│   │   │   │   ├── patch.js
│   │   │   │   └── transition-util.js
│   │   │   ├── server
│   │   │   │   ├── compiler.js
│   │   │   │   ├── directives
│   │   │   │   │   ├── index.js
│   │   │   │   │   ├── model.js
│   │   │   │   │   └── show.js
│   │   │   │   ├── modules
│   │   │   │   │   ├── attrs.js
│   │   │   │   │   ├── class.js
│   │   │   │   │   ├── dom-props.js
│   │   │   │   │   ├── index.js
│   │   │   │   │   └── style.js
│   │   │   │   └── util.js
│   │   │   └── util
│   │   │       ├── attrs.js
│   │   │       ├── class.js
│   │   │       ├── compat.js
│   │   │       ├── element.js
│   │   │       ├── index.js
│   │   │       └── style.js
│   │   └── weex
│   │       ├── compiler
│   │       │   ├── directives
│   │       │   │   ├── index.js
│   │       │   │   └── model.js
│   │       │   ├── index.js
│   │       │   └── modules
│   │       │       ├── append.js
│   │       │       ├── class.js
│   │       │       ├── index.js
│   │       │       ├── props.js
│   │       │       ├── recycle-list
│   │       │       │   ├── component-root.js
│   │       │       │   ├── component.js
│   │       │       │   ├── index.js
│   │       │       │   ├── recycle-list.js
│   │       │       │   ├── text.js
│   │       │       │   ├── v-bind.js
│   │       │       │   ├── v-for.js
│   │       │       │   ├── v-if.js
│   │       │       │   ├── v-on.js
│   │       │       │   └── v-once.js
│   │       │       └── style.js
│   │       ├── entry-compiler.js
│   │       ├── entry-framework.js
│   │       ├── entry-runtime-factory.js
│   │       ├── runtime
│   │       │   ├── components
│   │       │   │   ├── index.js
│   │       │   │   ├── richtext.js
│   │       │   │   ├── transition-group.js
│   │       │   │   └── transition.js
│   │       │   ├── directives
│   │       │   │   └── index.js
│   │       │   ├── index.js
│   │       │   ├── modules
│   │       │   │   ├── attrs.js
│   │       │   │   ├── class.js
│   │       │   │   ├── events.js
│   │       │   │   ├── index.js
│   │       │   │   ├── style.js
│   │       │   │   └── transition.js
│   │       │   ├── node-ops.js
│   │       │   ├── patch.js
│   │       │   ├── recycle-list
│   │       │   │   ├── render-component-template.js
│   │       │   │   └── virtual-component.js
│   │       │   └── text-node.js
│   │       └── util
│   │           ├── element.js
│   │           ├── index.js
│   │           └── parser.js
│   ├── server
│   │   ├── bundle-renderer
│   │   │   ├── create-bundle-renderer.js
│   │   │   ├── create-bundle-runner.js
│   │   │   └── source-map-support.js
│   │   ├── create-basic-renderer.js
│   │   ├── create-renderer.js
│   │   ├── optimizing-compiler
│   │   │   ├── codegen.js
│   │   │   ├── index.js
│   │   │   ├── modules.js
│   │   │   ├── optimizer.js
│   │   │   └── runtime-helpers.js
│   │   ├── render-context.js
│   │   ├── render-stream.js
│   │   ├── render.js
│   │   ├── template-renderer
│   │   │   ├── create-async-file-mapper.js
│   │   │   ├── index.js
│   │   │   ├── parse-template.js
│   │   │   └── template-stream.js
│   │   ├── util.js
│   │   ├── webpack-plugin
│   │   │   ├── client.js
│   │   │   ├── server.js
│   │   │   └── util.js
│   │   └── write.js
│   ├── sfc
│   │   └── parser.js
│   └── shared
│       ├── constants.js
│       └── util.js
├── test
├── types
└── yarn.lock
-->
