---
title: "Vue的入口文件"
date: "2021-12-05 10:30:29"
series:
  name: "Vue2源码探究"
  order: 6
tags:
  - "Vue2源码探究"
  - "初探Vue"
draft: false
---

## 多入口

`src/platforms/web`中是web平台的相关的代码，这里一共可以看到5个入口文件。

```text
─ web
   ├── entry-compiler.js
   ├── entry-runtime-with-compiler.js
   ├── entry-runtime.js
   ├── entry-server-basic-renderer.js
   ├── entry-server-renderer.js
```

- `entry-compiler.js` 编译时
- `entry-runtime-with-compiler.js` 运行时 + 编译时
- `entry-runtime.js ` 运行时
- `entry-server-basic-renderer.js` 服务端渲染
- `entry-server-renderer.js` 服务端渲染

我们在使用Vue时，会根据不同的情况选择不同的Vue构建版本，这几个入口文件分别是不同版本的构建入口文件，即打包构建配置中的`entry`字段。

我们会分析`entry-runtime-with-compiler.js`入口文件，其实整个过程就是根据不同的平台和入口对Vue本身进行扩展增强，如下图

![文章配图](https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/DigVue2/01.入口文件流程.drawio.svg)

## runtime + comliler入口

我们重点看`entry-runtime-with-compiler.js`文件。

```js {14,25}
/* @flow */

import config from 'core/config'
import { warn, cached } from 'core/util/index'
import { mark, measure } from 'core/util/perf'

import Vue from './runtime/index'
import { query } from './util/index'
import { compileToFunctions } from './compiler/index'
import { shouldDecodeNewlines, shouldDecodeNewlinesForHref } from './util/compat'

// 获取id选择符对应的innerHTML
const idToTemplate = cached(id => {
  const el = query(id)
  return el && el.innerHTML
})

// $mount是和编译环境相关的，所以将此方法在这里进行扩展实现
const mount = Vue.prototype.$mount // 暂存原$mount方法
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  // 获取DOM节点
  el = el && query(el)

  /* istanbul ignore if */
  if (el === document.body || el === document.documentElement) {
    process.env.NODE_ENV !== 'production' && warn(
      `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
    )
    return this
  }

  const options = this.$options
  // resolve template/el and convert to render function
   if (!options.render) {
    let template = options.template
    if (template) {
      // 定义了template
      if (typeof template === 'string') {
        // 模板字符串（不做处理） 和 id选择符
        if (template.charAt(0) === '#') {
          // 获取此id的后代HTML作为字符串作为模板
          template = idToTemplate(template)
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'production' && !template) {
            warn(
              `Template element not found or is empty: ${options.template}`,
              this
            )
          }
        }
      } else if (template.nodeType) {
        // template是一个原生DOM节点 获取此DOM的后代HTMl字符串作为模板
        template = template.innerHTML
      } else {
        if (process.env.NODE_ENV !== 'production') {
          warn('invalid template option:' + template, this)
        }
        // 不是string也不是原生DOM节点 报警告 并返回本身this
        return this
      }
    } else if (el) {
      // 没有定义template 获取el本身的HTML字符串作为模板
      template = getOuterHTML(el)
    }

    // compileToFunctions 方法 template模板编译 最终生成render函数
    if (template) {
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile')
      }

      // compileToFunctions：把模板template编译生成render以及staticRenderFns
      const { render, staticRenderFns } = compileToFunctions(template, {
        outputSourceRange: process.env.NODE_ENV !== 'production',
        shouldDecodeNewlines,
        shouldDecodeNewlinesForHref,
        delimiters: options.delimiters,
        comments: options.comments
      }, this)
      // 赋值给options
      options.render = render
      options.staticRenderFns = staticRenderFns

      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile end')
        measure(`vue ${this._name} compile`, 'compile', 'compile end')
      }
    }
  }

  // 调用原$mount方法
  return mount.call(this, el, hydrating)
}

/**
 * Get outerHTML of elements, taking care
 * of SVG elements in IE as well.
 * 获取el的HTML字符串
 */
function getOuterHTML (el: Element): string {
  if (el.outerHTML) {
    return el.outerHTML
  } else {
    const container = document.createElement('div')
    container.appendChild(el.cloneNode(true))
    return container.innerHTML
  }
}

Vue.compile = compileToFunctions

export default Vue
```

这里主要做了一件事情，对`Vue.$mount()`方法进行扩展，因为`$mount`是和编译环境相关的，Vue将此方法在这里进行编译相关的扩展实现。

首先将原`$mount`方法暂存到`const mount`，然后重新定义`$mount`方法，在此方法最后，重新调用原`$mount`方法，`mount.call(this, el, hydrating)` 。

上面代码中有调用到`query()`方法来获取节点DOM，定义在`src/platforms/web/util/index.js`

```js
/**
 * Query an element selector if it's not an element already.
 *  el 如果是DOM节点，直接返回此节点
 *  el 如果是string
 *    document.querySelector获取此DOM节点
 *    节点不存在，则创建div节点
 *    最终返回DOM节点
 */
export function query (el: string | Element): Element {
  if (typeof el === 'string') {
    const selected = document.querySelector(el)
    if (!selected) {
      process.env.NODE_ENV !== 'production' && warn(
        'Cannot find element: ' + el
      )
      return document.createElement('div')
    }
    return selected
  } else {
    return el
  }
}
```

### $mount编译扩展

该方法扩展中主要做了两件事情：

1. 如果`el`根节点是body或document节点，不能挂载。
2. 如果`$options`中没有`render`方法，则模板编译扩展它。

下面来看下具体实现。

我们来看一个Vue的使用例子：

```vue
<html>
  <head>
    <title>Hello Vue</title>
    <script src="../../dist/vue.js"></script>
  </head>
  <body>
    <div id="app"></div>
    <script>
      const root = new Vue({
        el: "#app",
        data: {
          msg: "Hello Vue",
        },
      });
    </script>
  </body>
</html>
```

在根组件中会选择一个挂载节点`id="app" `，即`el: "#app"`，该Vue实例会调用`$mount`方法，之后会讲到。

**如果`el`根节点是body或document节点，不能挂载。**

那么我们来看扩展的`$mount()`方法是如何处理的，首先获取`id = "app"`的DOM节点。然后判断该节点是否是`body`或`html`节点，如果是返回Vue本身`this`，结束处理。

那为什么要这么做呢？

因为Vue之后在挂载新的根节点时，Patch过程会删除掉原来的`<div id="app"></div>`节点，而添加上新的`<div id="app">Hello Vue</div>`，所以不能替换掉body或者html节点。

**如果`$options`中没有`render`方法，则模板编译扩展它**

[`this.$options`](https://cn.vuejs.org/v2/api/#vm-options)是当前Vue实例的初始化选项。

Vue最终执行的都是render方法来生成VNode。

首先会判断初始化选项`$options.render`中有没有`render()`函数。如果用户自定义了`render()`函数或已经借助`vue-loader`这样的编译工具进行编译，那么就会跳过此阶段。

否则命中模板编译扩展逻辑。首先对模板`template`进行处理，然后调用编译函数`compileToFunctions`生成`render`函数 。

我们这里主要分析模板编译前，模板`tempalte`的处理。模板编译我们之后会详细介绍。

没有render方法时，转换规则如下：

- 定义了`$options.template`，template有三种类型：
  1. 普通的模板字符串 直接作为模板
  2. id选择符字符串 获取此id的`innerHTML`即后代HTMl字符串作为模板
  3. 原生DOM元素 获取此DOM的`innerHTML`即后代HTMl字符串作为模板

- 没有定义template，定义了el，获取`el.outerHTML`本身HTML字符串作为template。没有tempalte时，默认使用el作为模板

这也就是Vue中模板的写法支持的三种`tempalte`写法的处理过程：

- 模板字符串

  ```js
  new Vue({
    template: '<div>模板字符串</div>'
  });
  ```

- id选择符匹配元素的`innerHTML`模板

  ```js
  <div id="app">
    <div>test1</div>
    <script type="x-template" id="hello">
      <p>hello vue</p>
    </script>
  </div>

  new Vue({
    template: '#hello'
  });
  ```

- DOM元素匹配元素的`innerHTML`模板

  ```js
  <div id="app">
    <div>test1</div>
    <span id="hello"><div class="test2">test2</div></span>
  </div>

  new Vue({
    el: '#app',
    template: document.querySelector('#hello')
  })
  ```

在对$mount方法扩展后，最后默认导出`export default Vue`，那么这个`Vue`又是从哪来的呢？

## Web平台下Vue实例扩展

我们可以看到，在入口文件中，有这样一行导入：

```js
import Vue from './runtime/index'
```

实现在文件`src/platforms/web/runtime/index.js `

```js
/* @flow */

import Vue from 'core/index'
import config from 'core/config' // Vue默认config
import { extend, noop } from 'shared/util'
import { mountComponent } from 'core/instance/lifecycle'
import { devtools, inBrowser } from 'core/util/index'

import {
  query,
  mustUseProp,
  isReservedTag,
  isReservedAttr,
  getTagNamespace,
  isUnknownElement
} from 'web/util/index'

import { patch } from './patch'
import platformDirectives from './directives/index'
import platformComponents from './components/index'

/**
 * 对web平台下Vue进行扩展
 */

// web平台相关工具函数
// install platform specific utils
Vue.config.mustUseProp = mustUseProp // 必须绑定属性的标签
Vue.config.isReservedTag = isReservedTag // 是否是Web端的HTML SVG标签
Vue.config.isReservedAttr = isReservedAttr // 是否是style class 属性
Vue.config.getTagNamespace = getTagNamespace // 获取命名空间
Vue.config.isUnknownElement = isUnknownElement // 是否是未知元素标签

// web平台指令和组件扩展
// install platform runtime directives & components
extend(Vue.options.directives, platformDirectives) // platformDirectives: v-model v-show
extend(Vue.options.components, platformComponents) // platformComponents: transition-group transition

// 挂载__patch__方法
// install platform patch function
Vue.prototype.__patch__ = inBrowser ? patch : noop

// public mount method
// runtime实现，可以在runtime only和runtime+complier复用
// runtime only 会直接调用此方法
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && inBrowser ? query(el) : undefined
  // $mount 实际调用 mountComponent
  return mountComponent(this, el, hydrating)
}

// devtools global hook
//...

export default Vue
```

这里主要是对Web平台下Vue进行了一系列的初始化，进行平台相关的扩展：

1. 扩展Vue.config，相关工具函数
2. 扩展指令和组件扩展
3. 扩展`__patch__`方法
4. 扩展`$mount`方法
5. 扩展Vue开发插件Devtool (代码已省略)

这里需要注意的是，`$mount`方法在这里也进行了一次扩展，而入口文件中，也有相关的扩展处理，这是为什么呢？

这是因为，Vue在实现上有多个入口文件，而这里是对`$mount`方法在`runtime`阶段的封装，可以在Runtime Only和Runtime Complier版本中，进行复用。

在Runtime Only版本的入口中，只需要做导出即可。

入口文件`src/platforms/web/entry-runtime.js`

```js
/* @flow */

import Vue from './runtime/index'

export default Vue
```

在Runtime Complier版本的入口中，只需要对Vue扩展了编译部分，我们上面也分析过了。

## Vue的定义

接下来我们再来看这里的Vue，在头部可以看到这一行`import Vue from 'core/index'`

文件`src/core/index.js `实现如下：

```js
import Vue from './instance/index'
import { initGlobalAPI } from './global-api/index'
import { isServerRendering } from 'core/util/env'
import { FunctionalRenderContext } from 'core/vdom/create-functional-component'

// 定义 Vue的实例属性
initGlobalAPI(Vue)

// 定义 访问器属性 $isServer
Object.defineProperty(Vue.prototype, '$isServer', {
  get: isServerRendering
})

// 定义 访问器属性 $ssrContext
Object.defineProperty(Vue.prototype, '$ssrContext', {
  get () {
    /* istanbul ignore next */
    return this.$vnode && this.$vnode.ssrContext
  }
})

// 定义 数据属性 FunctionalRenderContext方法
// expose FunctionalRenderContext for ssr runtime helper installation
Object.defineProperty(Vue, 'FunctionalRenderContext', {
  value: FunctionalRenderContext
})

// Vue版本
Vue.version = '__VERSION__'

export default Vue
```

到此我们可以看到，这里Vue的核心处理逻辑，真正初始化Vue的地方。

1. `import Vue from './instance/index'`导入Vue构造函数
2. `initGlobalAPI`扩展Vue的实例属性，即静态属性和方法
3. 扩展一些SSR用到的相关属性和方法
   - [`$isServer`](https://cn.vuejs.org/v2/api/#vm-isServer) 当前 Vue 实例是否运行于服务器
   - `$ssrContext` SSR的context
   - `FunctionalRenderContext`
4. 扩展Vue版本属性[`version`](https://cn.vuejs.org/v2/api/#Vue-version)

这里关键的逻辑是前两步。导入了Vue构造函数，我们开发中可以执行`new Vue()`实例化的实现。`initGlobalAPI(Vue)`初始化Vue全局的API。

### Vue构造函数

Vue的具体实现是在`src/core/instance/index.js`中。

该文件中主要是定义了Vue的构造函数，对Vue的原型对象`prototype`进行了一系列的扩展。

我们这里只看大致的定义，具体的实现我们之后再具体分析。

```js
import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

// Vue构造函数
function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    // 警告 Vue是构造函数，应该使用new来调用
    warn('Vue is a constructor and should be called with the `new` keyword')
  }

  // 调用 Vue.prototype._init()
  this._init(options)
}

// 对Vue的prototype原型对象进行扩展
// Vue按功能将这些扩展分散到多个模块中进行实现
initMixin(Vue)
stateMixin(Vue)
eventsMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)

export default Vue
```

这里定义了Vue的构造函数，当`new Vue()`时，函数内部调用`this._init()`初始化Vue实例。

**为何Vue 不⽤ES6 的Class 去实现呢？**

在构造函数下面，通过`xxxMixin`对Vue的`prototype`原型对象进行扩展，Vue按功能将这些扩展分散到多个模块中进行实现。如果使用`class Vue ...`是难以实现的。这样Vue按功能把这些扩展分散到多个模块中去实现，⽽不是在⼀个模块⾥实现所有原型对象的扩展。这么做是⾮常⽅便代码的维护和管理的。

### initGlobalAPI

Vue还对实例对象进行了扩展，即扩展了Vue的全局静态方法。

在`src/core/global-api/index.js`中，我们也先做一个快速浏览，具体的实现之后再分析。

```js
/* @flow */

import config from '../config'
import { initUse } from './use'
import { initMixin } from './mixin'
import { initExtend } from './extend'
import { initAssetRegisters } from './assets'
import { set, del } from '../observer/index'
import { ASSET_TYPES } from 'shared/constants'
import builtInComponents from '../components/index'
import { observe } from 'core/observer/index'

import {
  warn,
  extend,
  nextTick,
  mergeOptions,
  defineReactive
} from '../util/index'

/**
 * Vue实例属性扩展 即静态属性和方法
 */
export function initGlobalAPI (Vue: GlobalAPI) {
  // config
  const configDef = {}
  configDef.get = () => config
  if (process.env.NODE_ENV !== 'production') {
    configDef.set = () => {
      // 警告 不要直接替换掉Vue.config的定义
      warn(
        'Do not replace the Vue.config object, set individual fields instead.'
      )
    }
  }
  // 定义 全局配置的访问器属性 Vue.config
  Object.defineProperty(Vue, 'config', configDef)

  // exposed util methods.
  // NOTE: these are not considered part of the public API - avoid relying on
  // them unless you are aware of the risk.
  Vue.util = {
    warn,
    extend,
    mergeOptions,
    defineReactive
  }

  // 全局静态方法
  Vue.set = set
  Vue.delete = del
  Vue.nextTick = nextTick

  // 2.6 explicit observable API
  Vue.observable = <>(obj: T): T => {
    observe(obj)
    return obj
  }

  // 全局的Vue.options
  Vue.options = Object.create(null)
  ASSET_TYPES.forEach(type => {
    Vue.options[type + 's'] = Object.create(null)
  })

  // this is used to identify the "base" constructor to extend all plain-object
  // components with in Weex's multi-instance scenarios.
  Vue.options._base = Vue

  // 扩展内置组件
  extend(Vue.options.components, builtInComponents)

  // API Vue.use
  initUse(Vue)
  // API Vue.mixin
  initMixin(Vue)
  // Vue.extend
  initExtend(Vue)
  // Vue.component Vue.filter Vue.directive
  initAssetRegisters(Vue)
}
```

这⾥就是在Vue上扩展的⼀些全局⽅法的定义，Vue官⽹中[全局配置](https://cn.vuejs.org/v2/api/#%E5%85%A8%E5%B1%80%E9%85%8D%E7%BD%AE)在这里初始化定义，以及一些[全局API](https://cn.vuejs.org/v2/api/#%E5%85%A8%E5%B1%80-API)中都在这⾥找到，也包含了一些在官方文档中没有的。

- 全局配置`Vue.config`，全局默认配置在`src/core/config.js`中定义。
- `Vue.util`工具函数扩展，不建议外部使用
- 全局API，全局静态属性和方法扩展
  - `Vue.set`
  - `Vue.delete`
  - `Vue.nextTick`
  - `Vue.observable`
  - `Vue.options` Vue的全局options
    - `_base` 指向Vue基类构造函数本身
    - `components`
    - `directives`
    - `filters`
  - `Vue.use()`
  - `Vue.mixin()`
  - `Vue.extend()`
  - `Vue.components()`

## 小结

从入口到Vue初始化的流程，到此分析完毕。我们可以看到Vue的整个入口设计还是有些绕的。前面的分析我们也提到，Vue是支持多平台的，每个平台的实现会有些不同，那么Vue将相同的核心处理进行抽离，放在`src/core`下进行实现；而平台相关逻辑放在`src/platforms`下处理；结构设计是十分巧妙的，值得学习。

Vue本质上的实现，是使用`Funciton`来定义Class，再对Vue原型对象`prototype`进行扩展。Vue按功能将这些扩展分散到多个模块中进行实现，方便代码的管理，如果使用class则难以实现这样的代码分割，这也是值得学习的。
