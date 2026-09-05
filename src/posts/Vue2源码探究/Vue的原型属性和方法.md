---
title: "Vue的原型属性和方法"
date: "2021-12-11 15:46:30"
series:
  name: "Vue2源码探究"
  order: 9
tags:
  - "Vue2源码探究"
  - "属性、方法、配置"
draft: false
---

`src/core/instance/index.js`文件中定义了Vue的构造函数，随后执行了5个函数，Vue通过代码分隔将不同场景的原型方法和属性定义在了不同文件中，这里就是将它们改在到Vue的原型上：

```js
// 定义Vue原型上的init方法(内部方法)
initMixin(Vue)
// 定义原型上跟数据相关的属性方法
stateMixin(Vue)
// 定义原型上跟事件相关的属性方法
eventsMixin(Vue)
// 定义原型上跟生命周期相关的方法
lifecycleMixin(Vue)
// 定义原型上渲染相关的属性方法
renderMixin(Vue)
```

下面分别来看简单了解这几个方法

## initMixin

定义方法:

- Vue.prototype._init()

添加`Vue.prototype._init()`，这是内部在实例化Vue时会执行的初始化方法

```js
export function initMixin (Vue: Class<Component>) {
  // 使用new调用Vue构造函数时，执行Vue.prototype._init()方法
  Vue.prototype._init = function (options?: Object) {
    // ...
  }
}
```

Vue构造函数实例化时，会调用此方法。

```js
// src/core/instance/index.js
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

// src/core/global-api/extend.js
const Sub = function VueComponent (options) {
  // 实例化Sub的时候，就会执行this._init逻辑，再次走到Vue实例的初始化逻辑
  this._init(options)
}
```

## stateMixin

定义跟数据相关的属性方法：

- 属性：
  - Vue.prototype.$data 访问器属性 实例化组件`vm._data`的访问代理
  - Vue.prototype.$props 访问器属性 实例化组件`vm._props`的访问代理
- 方法：
  - Vue.prototype.$set() 静态方法`Vue.set`的别名，响应式地添加`vm._data`中的属性
  - Vue.prototype.$delete() 静态方法`Vue.delete`的别名，响应式地移除`vm._data`中的属性
  - Vue.prototype.$watch() 添加侦听器方法

```js
export function stateMixin (Vue: Class<Component>) {
  const dataDef = {}
  dataDef.get = function () { return this._data }
  const propsDef = {}
  propsDef.get = function () { return this._props }

  if (process.env.NODE_ENV !== 'production') {
    // $data和$props 开发环境设置setter方法，以便提示警告
    dataDef.set = function () {
      warn(
        'Avoid replacing instance root $data. ' +
        'Use nested data properties instead.',
        this
      )
    }
    propsDef.set = function () {
      warn(`$props is readonly.`, this)
    }
  }
  Object.defineProperty(Vue.prototype, '$data', dataDef)
  Object.defineProperty(Vue.prototype, '$props', propsDef)

  // 设置响应式 $set和$delete方法
  Vue.prototype.$set = set
  Vue.prototype.$delete = del

    // 设置 $watch方法
  Vue.prototype.$watch = function (
    expOrFn: string | Function,
    cb: any,
    options?: Object
  ) {
    // ...
  }
}
```

`Vue.prototype.$data`和`Vue.prototype.$props`都是访问器属性，分别添加实例化组件`vm._data`和`vm._props`的访问代理。

## eventsMixin

定义自定义事件相关原型方法

- Vue.prototype.$on() 添加自定义事件监听
- Vue.prototype.$once() 添加自定义事件监听，值监听一次
- Vue.prototype.$off() 移除自定义事件监听
- Vue.prototype.$emit() 触发自定义监听事件

```js
export function eventsMixin (Vue: Class<Component>) {
  const hookRE = /^hook:/
  Vue.prototype.$on = function (event: string | Array<string>, fn: Function): Component {
    // ...
  }

  Vue.prototype.$once = function (event: string, fn): Component {
    // ...
  }

  Vue.prototype.$off = function (event?: string | Array<string>, fn?: Function): Component {
    // ...
  }

  Vue.prototype.$emit = function (event: string): Component {
    // ...
  }
}
```

## lifecycleMixin

定义生命周期相关方法

- Vue.prototype._update() 把VNode渲染成真实DOM
- Vue.prototype.$forceUpdate() 强制组件更新
- Vue.prototype.$destroy() 组件销毁执行方法

```js
export function lifecycleMixin (Vue: Class<Component>) {
  Vue.prototype._update = function (vnode: VNode, hydrating?: boolean) {
    // ...
  }

  Vue.prototype.$forceUpdate = function () {
    // ...
  }

  Vue.prototype.$destroy = function () {
    // ...
  }
}
```

## renderMixin

这里也是定义生命周期相关方法

- 方法：
  - 内部方法 (render-helpers)
  - Vue.prototype._render 最终返回渲染VNode
  - Vue.prototype.$nextTick 将回调延迟到下次DOM更新循环之后执行 内部渲染循环都会调用这个方法

```js
export function renderMixin (Vue: Class<Component>) {
  // install runtime convenience helpers
  installRenderHelpers(Vue.prototype)

  Vue.prototype.$nextTick = function (fn: Function) {
    return nextTick(fn, this)
  }

  Vue.prototype._render = function (): VNode {
    // ...
  }
}
```

`installRenderHelpers(Vue.prototype)`会向原型上定义渲染阶段要用到的辅助函数：

```js
/**
 * 编译阶段生成render中用到的辅助函数
 *  会添加到Vue.prototype上
 * @param {*} target
 */
export function installRenderHelpers (target: any) {
  target._o = markOnce
  target._n = toNumber
  target._s = toString
  target._l = renderList
  target._t = renderSlot
  target._q = looseEqual
  target._i = looseIndexOf
  target._m = renderStatic
  target._f = resolveFilter
  target._k = checkKeyCodes
  target._b = bindObjectProps
  target._v = createTextVNode
  target._e = createEmptyVNode
  target._u = resolveScopedSlots
  target._g = bindObjectListeners
  target._d = bindDynamicKeys
  target._p = prependModifier
}
```

## 小结

这节我们简单总结了Vue在原型上添加的属性和方法，了解代码大致结构，便于之后在具体的分析中查找。
