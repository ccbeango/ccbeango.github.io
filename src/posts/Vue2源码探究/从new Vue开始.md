---
title: "从new Vue开始"
date: "2021-12-13 10:40:43"
series:
  name: "Vue2源码探究"
  order: 12
tags:
  - "Vue2源码探究"
  - "数据驱动"
draft: false
---

我们还从上一节的例子中开始

```html
<html>
  <head>
    <title>Hello Vue</title>
    <script src="../../../../dist/vue.js"></script>
  </head>
  <body>
    <div id="app">{{msg}}</div>
    <script>
      var vue = new Vue({
        el: "#app",
        data: {
          msg: "Hello Vue",
        },
      });
    </script>
  </body>
</html>
```

在这里我们调用了`new Vue()`实例化出来一个Vue，并将其挂载到了`div#app`上

在Vue构造函数中，在`src/core/instance/index.js`

```js
/**
 * Vue构造函数
 */
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
```

调用了`this._init(options)`即`Vue.prototype._init()`进行Vue实例初始化。

那么我们来看`_init(options)`方法，在`src/core/instance/init.js`中

```js
 Vue.prototype._init = function (options?: Object) {
   const vm: Component = this
   // a uid
   vm._uid = uid++

   let startTag, endTag
   /* istanbul ignore if */
   if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
     startTag = `vue-perf-start:${vm._uid}`
     endTag = `vue-perf-end:${vm._uid}`
     mark(startTag)
   }

   // a flag to avoid this being observed
   vm._isVue = true

   // merge options
   if (options && options._isComponent) {
     // optimize internal component instantiation
     // since dynamic options merging is pretty slow, and none of the
     // internal component options needs special treatment.
     // 内部自调用new Sub()的 merge options
     // 自调用生成的options再做合并
     initInternalComponent(vm, options)
   } else {
     // 用户主动调用 new Vue()的merge options
     // 把Vue构造函数vm.constructor的默认options和用户自定义options做合并，到vm.$options上
     vm.$options = mergeOptions(
       resolveConstructorOptions(vm.constructor),
       options || {},
       vm
     )
   }

   // 初始化 _renderProxy
   /* istanbul ignore else */
   if (process.env.NODE_ENV !== 'production') {
     initProxy(vm)
   } else {
     // 生产环境下 _renderProxy是vm组件(this)本身
     vm._renderProxy = vm
   }
   // expose real self
   vm._self = vm
   // 初始化 生命周期
   initLifecycle(vm)
   // 初始化 事件
   initEvents(vm)
   // 初始化 render
   initRender(vm)
	 // 执行 beforeCreate
   callHook(vm, 'beforeCreate')
   initInjections(vm) // resolve injections before data/props
   // 初始化 data
   initState(vm)
   initProvide(vm) // resolve provide after data/props
   // 执行 created
   callHook(vm, 'created')

   /* istanbul ignore if */
   if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
     vm._name = formatComponentName(vm, false)
     mark(endTag)
     measure(`vue ${vm._name} init`, startTag, endTag)
   }

   if (vm.$options.el) {
     // 有el 调用$mount进行挂载
     vm.$mount(vm.$options.el)
   }
}
```

Vue实例初始化概括如下：

1. `vm._uid` 实例唯一标识`uid`
2. `vm._isVue` 添加是否是`Vue`实例标识，避免Vue把它变成响应式的。
3. 将用户自定义options和Vue构造函数的默认options进行合并。
   1. 内部自调用new Sub()的merge options ，调用initInternalComponent()，内部组件在内部调用`Vue.extend()`时，内部调用了`mergeOptions`进行合并初始化处理。这里主要时内部组件的options处理。
   2. 外部主动调用，我们开头的例子`new Vue(options)`，会进行合并策略`mergeOptions`合并。
4. 非生产环境，对Vue实例做`Proxy`代理。
5. `vm._self = vm` 添加自访问
6. `initLifecycle(vm)` 初始化生命周期
7. `initEvents(vm)` 初始化 事件
8. `initRender(vm)` 初始化render
9. `callHook(vm, 'beforeCreate')` 调用生命周期函数`beforeCreate`，即在实例初始化之后，进行数据侦听和事件/侦听器的配置之前同步调用。
10. `initInjections(vm)` 初始化state前初始化`injections`
11. `initState(vm)` 初始化数据data、props侦听和事件以及侦听器
12. `initProvide(vm)` 初始化state后初始化`provide`
13. `callHook(vm, 'created')` 调用生命周期`created`。在这一步中，实例已完成对选项的处理，意味着以下内容已被配置完毕：数据侦听、计算属性、方法、事件/侦听器的回调函数。然而，挂载阶段还没开始，且 `$el` property 目前尚不可用。
14. 如果通过`new Vue`创建的根Vue实例提供了`el`，即一个在页面上已存在的 DOM 元素作为 Vue 实例的挂载目标，那么就调用`vm.$mount(vm.$options.el)`进入编译过程。否则，需要显式调用 `vm.$mount()` 手动开启编译。

## 小结

Vue实例初始化过程逻辑写的很清楚，将不同功能逻辑拆分到不同模块中进行实现，让主线中只存在流程调用。

整个初始化流程的分支逻辑有很多，分支的第一步就是合并options，通过这一步我们获取到了描述Vue实例行为的完整的配置options。这一步也就是Vue的合并策略，我们下一节来看这部分代码的实现。
