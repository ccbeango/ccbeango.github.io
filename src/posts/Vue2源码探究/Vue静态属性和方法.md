---
title: "Vue静态属性和方法"
date: "2021-12-06 11:52:38"
series:
  name: "Vue2源码探究"
  order: 8
tags:
  - "Vue2源码探究"
  - "属性、方法、配置"
draft: false
---

在VUe的入口文件分析中，`initGlobalAPI(Vue)`初始化了全局的静态属性和方法，即全局API。

全局API的实现与Vue其它部分代码关联不大，本节统一记录Vue全局静态API的实现方法的实现，便于预览。

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
 * Vue实例静态属性和方法
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

  Vue.set = set
  Vue.delete = del
  Vue.nextTick = nextTick

  // 2.6 explicit observable API
  Vue.observable = <T>(obj: T): T => {
    observe(obj)
    return obj
  }

  Vue.options = Object.create(null)
  ASSET_TYPES.forEach(type => {
    Vue.options[type + 's'] = Object.create(null)
  })

  // this is used to identify the "base" constructor to extend all plain-object
  // components with in Weex's multi-instance scenarios.
  Vue.options._base = Vue

  // 扩展内置组件 options.components
  extend(Vue.options.components, builtInComponents)

  initUse(Vue)
  initMixin(Vue)
  initExtend(Vue)
  initAssetRegisters(Vue)
}
```

## Vue.config

将Vue.config设置为访问器属性，添加`getter`、`setter`方法，做了一层代理

允许修改`Vue.config`的属性值，但不允许重新赋值整个config，否则会提示警告。

Vue全局配置，默认config在`src/core/config.js`中，有如下字段：

```js
export type Config = {
  // user
  optionMergeStrategies: { [key: string]: Function };
  silent: boolean;
  productionTip: boolean;
  performance: boolean;
  devtools: boolean;
  errorHandler: ?(err: Error, vm: Component, info: string) => void;
  warnHandler: ?(msg: string, vm: Component, trace: string) => void;
  ignoredElements: Array<string | RegExp>;
  keyCodes: { [key: string]: number | Array<number> };

  // platform
  isReservedTag: (x?: string) => boolean;
  isReservedAttr: (x?: string) => boolean;
  parsePlatformTagName: (x: string) => string;
  isUnknownElement: (x?: string) => boolean;
  getTagNamespace: (x?: string) => string | void;
  mustUseProp: (tag: string, type: ?string, name: string) => boolean;

  // private
  async: boolean;

  // legacy
  _lifecycleHooks: Array<string>;
};
```

## Vue.util

扩展内部工具函数，如果不知道这些方法的风险，不建议外部使用。这里只是提供了一个访问这些方法的方式。

```js
Vue.util = {
  warn,
  extend,
  mergeOptions,
  defineReactive
}
```

### warn

`warn()`一个Vue内部常用到的方法，我们在开发阶段看到的警告提示，大都是调用此方法输出的。

在`src/core/util/debug.js`文件中可看到

```js
import config from '../config'
import { noop } from 'shared/util'

export let warn = noop
export let tip = noop
export let generateComponentTrace = (noop: any)
export let formatComponentName = (noop: any)

if (process.env.NODE_ENV !== 'production') {
  const hasConsole = typeof console !== 'undefined'
  // ...

  warn = (msg, vm) => {
    const trace = vm ? generateComponentTrace(vm) : ''

    if (config.warnHandler) {
      // 全局config自定义有warnHandler，调用自定义处理
      config.warnHandler.call(null, msg, vm, trace)
    } else if (hasConsole && (!config.silent)) {
      console.error(`[Vue warn]: ${msg}${trace}`)
    }
  }

  tip = (msg, vm) => {
    if (hasConsole && (!config.silent)) {
      console.warn(`[Vue tip]: ${msg}` + (
        vm ? generateComponentTrace(vm) : ''
      ))
    }
  }

  formatComponentName = (vm, includeFile) => {
    // ...
  }
  generateComponentTrace = vm => {
    // ...
  }
}
```

这里导出4个debug函数

- warn
- tip
- formatComponentName
- generateComponentTrace

生产环境下，这4个方法为`noop`；非生产环境下，会重新定义。

warn()函数，全局配置中定义了`config.warnHandler`，则调用此处理；否则，调用`console.error`输出警告。

### extend

在`src/shared/util.js`文件中定义。

```js
/**
 * Mix properties into target object.
 */
export function extend (to: Object, _from: ?Object): Object {
  for (const key in _from) {
    to[key] = _from[key]
  }
  return to
}
```

方法十分简单，将`_from`对象上的属性，合并到`to`对象上，如果属性相同，则用新的属性值覆盖旧值。

### mergeOptions、defineReactive

mergeOptions 根据不同的合并策略，合并options。详见Vue的options的合并策略

defineReactive 将对象上的属性设置成响应式的。详见深入响应式原理

## Vue.set\delete\nextTick\observable

```js
Vue.set = set
Vue.delete = del
Vue.nextTick = nextTick

// 2.6 explicit observable API
Vue.observable = <T>(obj: T): T => {
  observe(obj)
  return obj
}
```

这四个方法与响应式相关。详见深入响应式原理

## Vue.options

该属性是Vue构造函数的默认options，在此进行了初始化。

```js
Vue.options = Object.create(null)
ASSET_TYPES.forEach(type => {
  Vue.options[type + 's'] = Object.create(null)
})

// this is used to identify the "base" constructor to extend all plain-object
// components with in Weex's multi-instance scenarios.
Vue.options._base = Vue // 指向Vue构造函数本身

// 扩展内置组件keep-alive到 options.components
extend(Vue.options.components, builtInComponents)
```

在实例化Vue时，我们会传入自定义的options，如最简单的：

```js
// 传入我们自定义的options
new Vue({
  el: "#app",
  data: {
    msg: "Hello Vue",
  },
})
```

或者是我们开发中定义的复杂的组件，如以`data`定义实例中的响应式数据，以`computed`描述实例中的计算属性，以`components`来进行组件注册，并且定义各个阶段生命周期的钩子等，这些都是在一个对象中包裹，这个对象就是用户自定义options。

那么在Vue初始化时，用户自定义options就描述了我们想要的Vue实例的行为。

其实Vue内部本身会自带一些默认的options，这些options和用户自定义的options会在后续一起合并参与到Vue实例的初始化中。合并后保存在`vm.$options`中。

Vue内部的默认options保留在Vue.options属性上，分别有：

- _base 指向Vue基类构造函数本身
- components 存储全局注册的组件
- directives 存储全局注册的指令
- filters 储存全局注册的过滤器

使用`extend`方法，Vue默认在这里给components扩展了内置`keep-alive`。

```js
extend(Vue.options.components, builtInComponents)
```

在`src/platforms/web/runtime/index.js`扩展Web平台配置中，options中该扩展了指令`v-model`、`v-show`和组件`transition-group`、`transition`

```js
// install platform runtime directives & components
extend(Vue.options.directives, platformDirectives) // v-model v-show
extend(Vue.options.components, platformComponents) // transition-group transition
```

对于Web平台，Vue.options默认如下：

```js
Vue.options = {
  _base: Vue,
  components: {
    KeepAlive,
    Transition,
    TransitionGroup,
  },
  directives: {
    model,
    show
  },
  filters: {}
}
```

当我们调用`Vue.component\filter\directive` 注册或获取全局的组件、过滤器、指令时，本质上是在访问`Vue.options.component\filter\directive`对应的三个属性进行获取属性或注册新属性。

## Vue.component\filter\directive

通过`initAssetRegisters(Vue)`扩展这三个方法。

`Vue.component\filter\directive` 注册或获取全局的组件、过滤器、指令。

```js
/* @flow */

import { ASSET_TYPES } from 'shared/constants'
import { isPlainObject, validateComponentName } from '../util/index'

export function initAssetRegisters (Vue: GlobalAPI) {
  /**
   * Create asset registration methods.
   *  初始化3个全局函数
   *    Vue.component()
   *    Vue.directive()
   *    Vue.filter()
   * 调用方法时，其实是向Vue.options[components|directives|filters]中添加定义或获取定义
   */
  ASSET_TYPES.forEach(type => {
    Vue[type] = function (
      id: string,
      definition: Function | Object
    ): Function | Object | void {
      if (!definition) {
        // 只传id 直接返回该id的对应的asset
        return this.options[type + 's'][id]
      } else {
        /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'production' && type === 'component') {
          validateComponentName(id)
        }

        // 全局同步组件
        if (type === 'component' && isPlainObject(definition)) {
          // 有name，使用name作为组件名，否则使用id作为组件名
          definition.name = definition.name || id
          // 使用definition作为options 调用Vue.extend生成注册组件构造函数
          definition = this.options._base.extend(definition)
        }

        // 全局指令
        if (type === 'directive' && typeof definition === 'function') {
          definition = { bind: definition, update: definition }
        }

        /**
         * 对全局Vue.options进行扩展
         *  filter 直接赋值
         *  异步组件 直接赋值
         */
        this.options[type + 's'][id] = definition
        // 返回调用asset函数后的definition
        return definition
      }
    }
  })
}
```

可以看出，我们声明的全局组件或局部的组件、指令、过滤器，都是保存在`Vue.options`中的。

## Vue.extend

通过`initExtend(Vue)`扩展`Vue.extend()`方法。

该方法的主要作用是基于Vue基类，创建一个子类构造函数。即创建子组件的Vue构造函数。

当我们创建子组件时，会调用这个方法。在写Demo中我们可能会手动调用。在实际的项目开发中，Vue内部也是通过这个方法来创建子组件Vue构造函数的。

下面是一个使用`extend`的例子：

```html
<html>
  <div id="extend-test"></div>
</html>
<script>
  const child = Vue.extend({
    props: {
      greet: String
    },
    template: '<h3>我是子组件 - {{greet}}</h3>'
  });

  new Vue({
    el: '#extend-test',
    template: `
      <div>
        <h2>我是父组件</h2>
        <child :greet="msg"/>
      </div>
    `,
    components: { child },
    data: {
      msg: "Hello Vue",
    },
  });
</script>
```

我们来简单看下这个方法

```js
/* @flow */

import { ASSET_TYPES } from 'shared/constants'
import { defineComputed, proxy } from '../instance/state'
import { extend, mergeOptions, validateComponentName } from '../util/index'

export function initExtend (Vue: GlobalAPI) {
  /**
   * Each instance constructor, including Vue, has a unique
   * cid. This enables us to create wrapped "child
   * constructors" for prototypal inheritance and cache them.
   */
  Vue.cid = 0
  let cid = 1

  /**
   * Class inheritance
   */
  Vue.extend = function (extendOptions: Object): Function {
    extendOptions = extendOptions || {}
    const Super = this
    const SuperId = Super.cid
    // _Ctor 添加_Ctor属性，做缓存优化
    // _Ctor的值是{ cid: VueComponent }的map映射
    // 好处：当多个父组件都使用同一个组件，即多处使用时，同一个组件extend初始化逻辑只会执行一次
    const cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {})
    if (cachedCtors[SuperId]) {
      return cachedCtors[SuperId]
    }

    const name = extendOptions.name || Super.options.name
    // 验证标签名是否有效
    if (process.env.NODE_ENV !== 'production' && name) {
      validateComponentName(name)
    }

    // 寄生式组合继承 使用父类原型Super.prototype作为Sub的原型
    const Sub = function VueComponent (options) {
      // 实例化Sub的时候，就会执行this._init逻辑，再次走到Vue实例的初始化逻辑
      this._init(options)
    }
    Sub.prototype = Object.create(Super.prototype)
    Sub.prototype.constructor = Sub

    // 接下来再对Sub进行扩展

    // 生成cid
    Sub.cid = cid++
    // 合并生成options
    // 组件的默认options使用基类Vue.options 和 用户传入的options合并
    // 用户在extendOptions传入的components、directive、filter都会是局部的
    Sub.options = mergeOptions(
      Super.options,
      extendOptions
    )
    // super指向父类Super构造函数
    Sub['super'] = Super

    // For props and computed properties, we define the proxy getters on
    // the Vue instances at extension time, on the extended prototype. This
    // avoids Object.defineProperty calls for each instance created.
    // props和computed，定义到原型上实现共享，这样可以避免每次实例化时都对props中的每个key进行proxy代理设置
    if (Sub.options.props) {
      // 为每一个props的值添加代理
      initProps(Sub)
    }
    if (Sub.options.computed) {
      // 初始化computed
      // 将computed的每一项(key)添加到Sub.prototype[key]上
      initComputed(Sub)
    }

    // allow further extension/mixin/plugin usage
    // 添加全局Super上的实例（静态）方法到Sub上 让各个组件中有这些全局静态方法
    Sub.extend = Super.extend
    Sub.mixin = Super.mixin
    Sub.use = Super.use

    // create asset registers, so extended classes
    // can have their private assets too.
    // 将全局Super上的component、directive、filter方法添加到Sub上
    ASSET_TYPES.forEach(function (type) {
      Sub[type] = Super[type]
    })

    // enable recursive self-lookup
    // 允许自查找 添加自身到components中
    if (name) {
      Sub.options.components[name] = Sub
    }

    // keep a reference to the super options at extension time.
    // later at instantiation we can check if Super's options have
    // been updated.
    Sub.superOptions = Super.options // 保存Super的options 更新检测使用
    Sub.extendOptions = extendOptions // 保存子组件用来扩展的options
    Sub.sealedOptions = extend({}, Sub.options) // 扩展完成的子Vue.options 做初始状态的封存

    // cache constructor
    // 缓存 cid: Sub 的map映射
    cachedCtors[SuperId] = Sub
    return Sub
  }
}
```

首先`initExtend(Vue)`方法会添加`cid`到Vue的构造函数，并声明变量`let cid = 0`，目的是为每一个使用`extend()`方法的创建的子类添加唯一表示`cid`，当作继承父Vue类创建的子Vue类的缓存key。

Vue.extend()方法内部实现，这里我们认为Vue构造函数为基类的，调用子类Vue.extend()再创建孙子Vue构造函数逻辑是相同的。

1. 首先`extendOptions`是创建Vue子类时传入options，看作用户options。

2. 然后扩展`extendOptions._Ctor`属性，以`cid`为key来缓存使用基类Vue已经创建的子Vue类即VueComponent构造函数，`extendOptions._Ctor = { cid1: VueComponent1, cid2: VueComponent2, ... }`，这样做的好处是当父组件中使用同一个组件多次时，同一个组件extend初始化逻辑只会执行一次。

3. 非生产环境，验证组件名是否合法

4. 接下来使用寄生式组合继承，创建子类Sub即VueComponent，基于父类`Super.prototype`创建子类`Sub.prototype`，`Sub.prototype.consturctor`指向Sub构造函数。我们开发中的组件，会通过调用Sub来实例化。

5. 再然后生成`Sub.cid = cid++`，将Vue的默认options和传入的`extendOptions`通过`mergeOptions`进行合并，作为子类Vue.options即子类的默认options。这就是为什么我们在子组件中可以访问到全局定义的组件、过滤器和指令等。此时我们创建子类时候传入的`components`、`directive`、`filter`都会是局部的，即也会保存在`Sub.options`中。

6. 将用户设置的可接受传入的`props`定义进行初始化处理。经过合并策略`mergeOptions`处理的用户传入的`props`定义。当调用组件时候，传入`props`值保存在`vm._props`中，这里的目的是通过`props`定义提前添加组件中`props`的访问方式到Vue原型`Vue.prototype`上，实例化后，通过`vm.xxx`访问到`vm._props.xxx`的传入值。这样做的好处是不用在每次实例化时，都在Vue实例上添加访问方式。

   如：上面的例子中，我们在子组件`child`中定义了` props: { greet: String }`，然后在父组件`App`中调用了它并传入了`:greet="msg"`，Vue会将这个值放在`vm._props.greet`中，而子组件中可以`{{greet}}`直接访问到，这是在`Vue.extend()`实例化子组件时，`initProps` 提前将`greet`属性的访问方式`vm.greet`代理到`vm._props.greet`上。`greet`属性访问方式是放在原型上的，即`Vue.prototype.greet`

   ```js
   /**
    * 初始化props
    *  为props中的每一项添加代理
    * @param {*} Comp
    */
   function initProps (Comp) {
     const props = Comp.options.props
     for (const key in props) {
       proxy(Comp.prototype, `_props`, key)
     }
   }

   // src/core/instance/state.js
   /**
    * 代理target[sourceKey][key]的访问到target[key]上
    *  这样可以通过vm.xxx访问到vm._props.xxx或vm._data.xxx
    * @param {*} target
    * @param {*} sourceKey
    * @param {*} key
    */
   export function proxy (target: Object, sourceKey: string, key: string) {
     sharedPropertyDefinition.get = function proxyGetter () {
       return this[sourceKey][key]
     }
     sharedPropertyDefinition.set = function proxySetter (val) {
       this[sourceKey][key] = val
     }
     Object.defineProperty(target, key, sharedPropertyDefinition)
   }
   ```

7. 将用户传入的`computed`进行初始化处理。将所有的计算属性添加到Vue的原型上。

   `Vue.prototype.xxx = Comp.options.computed.xxx`。保证Vue实例化后用户定义的计算属性`options.computed.xxx`可以通过`vm.xxx`访问到。提前添加计算属性的访问方式到`Vue.prototype`，这样做的好处是不用在每次实例化时，都在Vue实例上添加访问方式。

   ```js
   /**
    * 初始化计算属性
    *  为computed中的每一项设置计算属性并进行代理设置 详见defineComputed()方法
    * @param {*} Comp
    */
   function initComputed (Comp) {
     const computed = Comp.options.computed
     for (const key in computed) {
       defineComputed(Comp.prototype, key, computed[key])
     }
   }

   // src/core/instance/state.js
   /**
    * 定义计算属性并进行代理设置
    *  代理设置：保证计算属性vm.computed.xxx可以通过vm.xxx访问到
    * @param {*} target
    * @param {*} key
    * @param {*} userDef
    */
   export function defineComputed (
     target: any,
     key: string,
     userDef: Object | Function
   ) {
     const shouldCache = !isServerRendering()

     if (typeof userDef === 'function') {
       // 定义getter 默认函数作为getter
       sharedPropertyDefinition.get = // ...
     } else {
       // 计算属性定义getter和setter
       // 设置getter
       sharedPropertyDefinition.get = // ...
       // 设置setter
       sharedPropertyDefinition.set = userDef.set || noop
     }

     // ...

     // 代理计算属性 保证计算属性vm.computed.xxx可以通过vm.xxx访问到
     Object.defineProperty(target, key, sharedPropertyDefinition)
   }
   ```

8. 添加父Vue的`extend\mixin\use`到子Vue构造函数上。子Vue继承这些方法，子Vue调用这些方法时，访问和添加的属性和方法都会在子Vue上。
9. 添加父Vue的`component\directive\filter`到子类Vue的构造函数上。子Vue继承这些方法，子Vue调用这些方法时，访问和添加的属性和方法都会在子Vue.options上。
10. `Sub.options.components[name]`添加自查找。然后在子组件中保存父组件的默认options即`Sub.superOptions`，子组件用来扩展的options即`Sub.extendOptions`，扩展完成的子Vue.options即`Sub.sealedOptions`，做初始状态的封存。
11. `cachedCtors[SuperId] = Sub` 最后在`Sub.options.cachedCtors`中缓存扩展后的子类Sub，下次如果再`extend`这个子类，可以直接返回而不用再扩展一次。关联第2步
12. 返回子类Sub，即扩展后的子组件Vue构造函数。

### Vue.use

通过`initUse(Vue)`扩展`Vue.use()`方法。

该方法主要作用是向`Vue._installedPlugins = []`中添加插件，同一个插件只会被添加一次

```js
/* @flow */

import { toArray } from '../util/index'

export function initUse (Vue: GlobalAPI) {
  // 向Vue._installedPlugins中添加插件
  Vue.use = function (plugin: Function | Object) {
    const installedPlugins = (this._installedPlugins || (this._installedPlugins = []))
    if (installedPlugins.indexOf(plugin) > -1) {
      // 已添加过
      return this
    }

    // additional parameters
    const args = toArray(arguments, 1)
    args.unshift(this) // 第一个参数是Vue本身
    if (typeof plugin.install === 'function') {
      // 执行插件的install方法
      plugin.install.apply(plugin, args)
    } else if (typeof plugin === 'function') {
      // plugin是一个函数，当作install方法执行
      plugin.apply(null, args)
    }
    installedPlugins.push(plugin)
    return this
  }
}
```

## Vue.mixin

通过`initMixin(Vue)`扩展`Vue.mixin()`方法。

`Vue.mixin()`实际上调用的是`mergeOptions`，详见Vue的options合并策略

```js
import { mergeOptions } from '../util/index'

export function initMixin (Vue: GlobalAPI) {
  Vue.mixin = function (mixin: Object) {
    // mixin 实际是调用 mergeOptions 混入到 Vue.options
    this.options = mergeOptions(this.options, mixin)
    return this
  }
}
```

## 小结

这里主要的方法，我们在开发中常见的，这里也只是将所有的方法大概列出，对一些实现做简单的分析，未涉及到的在之后具体的分析会讲到。
