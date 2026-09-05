---
title: "Vue的options合并策略"
date: "2021-12-13 12:15:39"
series:
  name: "Vue2源码探究"
  order: 13
tags:
  - "Vue2源码探究"
  - "数据驱动"
draft: false
---

正如我们前面分析提到的，在Vue中，options中保存了我们想要创建的Vue实例的行为，它包括了Vue的默认options和用户传入的options。

在Vue实例初始化时，第一步就会将Vue默认options和用户自定义options合并成Vue实例的最终行为配置`vm.$options`。

```js
Vue.prototype._init = function (options?: Object) {
    const vm: Component = this
  	// ...
    // merge options
    if (options && options._isComponent) {
    	// ...
    } else {
      vm.$options = mergeOptions(
        // Vue.options
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      )
    }
  	// ...
}
```

## 默认Vue.options

`mergeOptions`的第一个参数是`resolveConstructorOptions(vm.constructor)`，该方法做的事情是处理Vue构造函数的options 并返回Vue的默认options即Vue.options。

```js
// 处理Vue构造函数的options 并返回Vue的默认options即Vue.options
export function resolveConstructorOptions (Ctor: Class<Component>) {
  let options = Ctor.options // Vue构造函数默认option
  if (Ctor.super) {
    // Ctor.super为真，说明是Vue子类，递归调用resolveConstructorOptions，最终实现继承所有的父Vue类中的options
    const superOptions = resolveConstructorOptions(Ctor.super)
    const cachedSuperOptions = Ctor.superOptions
    if (superOptions !== cachedSuperOptions) { // 父Vue.options有改变
      // super option changed,
      // need to resolve new options.
      Ctor.superOptions = superOptions // 父Vue.options已变，重新赋值获取新的superOptions
      // check if there are any late-modified/attached options (#4976)
      const modifiedOptions = resolveModifiedOptions(Ctor)
      // update base extend options
      if (modifiedOptions) {
        // 改变的options再合并到用户自定义的extendOptions
        extend(Ctor.extendOptions, modifiedOptions)
      }
      // 合并策略
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions)
      if (options.name) {
        // 更新当前组件构造函数到components
        options.components[options.name] = Ctor
      }
    }
  }
  return options
}

/**
 * Vue.options有变动，返回已变动的options项modified
 * @param {*} Ctor
 * @returns
 */
function resolveModifiedOptions (Ctor: Class<Component>): ?Object {
  let modified
  const latest = Ctor.options // 当前的options
  const sealed = Ctor.sealedOptions // 原options的封存备份
  for (const key in latest) {
    if (latest[key] !== sealed[key]) {
      // 记录有变动的options项到modified
      if (!modified) modified = {}
      modified[key] = latest[key]
    }
  }
  // 返回变动的options项
  return modified
}
```

## options的合并策略

Vue合并options下和合并选项有很多种，针对这些合并项，有不同的合并策略。同时也支持用户自定义合并策略`config.optionMergeStrategies`。

```js
/**
 * Merge two option objects into a new one.
 * Core utility used in both instantiation and inheritance.
 * 根据不同的合并策略，合并options
 * 实例化、继承中使用
 * @param {*} parent options
 * @param {*} child  options
 * @param {*} vm     当前vm实例
 * @returns
 */
export function mergeOptions (
  parent: Object,
  child: Object,
  vm?: Component
): Object {
  if (process.env.NODE_ENV !== 'production') {
    // 检测组件名是否有效
    checkComponents(child)
  }

  if (typeof child === 'function') {
    child = child.options
  }

  // 标准化props
  normalizeProps(child, vm)
  // 标准化inject
  normalizeInject(child, vm)
  // 标准化directive
  normalizeDirectives(child)

  // Apply extends and mixins on the child options,
  // but only if it is a raw options object that isn't
  // the result of another mergeOptions call.
  // Only merged options has the _base property.
  if (!child._base) { // 实例化的Vue组件
    // 递归 合并实例化组件的extends
    if (child.extends) {
      parent = mergeOptions(parent, child.extends, vm)
    }
    // 递归 合并实例化组件的mixins
    if (child.mixins) {
      for (let i = 0, l = child.mixins.length; i < l; i++) {
        parent = mergeOptions(parent, child.mixins[i], vm)
      }
    }
  }

  /**
   * 根据不同的合并策略，对options进行合并处理
   */
  const options = {}
  let key
  // 合并parent上的key
  for (key in parent) {
    mergeField(key)
  }
  // 合并child上有的而parent上没有的key
  for (key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key)
    }
  }
  function mergeField (key) {
    const strat = strats[key] || defaultStrat
    // 执行相应的合并策略
    options[key] = strat(parent[key], child[key], vm, key)
  }
  return options
}
```

这里可以分为三部分

1. 标准化child，即用户传入的options
2. 递归调用`mergeOptions`处理extends和mixins选项
3. 将`parent`与`child`按照不同的策略`strats`进行合并

### 标准化options

首先，非开发环境下校验自定义选项中`options.components`组件名是否合法。

1. 组件的标签名需符合h5规范；
2. 不允许使用Vue内置标签`slot`、`component`
3. 不允许使用HTML标签做标签名

```js
/**
 * Validate component names
 *  检查所有组件名是否有效
 */
function checkComponents (options: Object) {
  for (const key in options.components) {
    validateComponentName(key)
  }
}

/**
 * 验证组件名是否有效
 * @param {*} name
 */
export function validateComponentName (name: string) {
  // 标签名需符合h5规范
  if (!new RegExp(`^[a-zA-Z][\\-\\.0-9_${unicodeRegExp.source}]*$`).test(name)) {
    warn(
      'Invalid component name: "' + name + '". Component names ' +
      'should conform to valid custom element name in html5 specification.'
    )
  }

  // 1. 不允许使用Vue内置标签 slot,component
  // 2. 不允许使用HTML标签
  if (isBuiltInTag(name) || config.isReservedTag(name)) {
    warn(
      'Do not use built-in or reserved HTML elements as component ' +
      'id: ' + name
    )
  }
}
```

接下来normalizeProps标准化`props`、normalizeInject标准化`inject`、normalizeDirectives标准化`directive`。这三个方法的目的都是将用户自定义传入的选项处理成各个选项需要的统一格式。

#### 标准化props

将props转成需要的对象格式。

```js
/**
 * Ensure all props option syntax are normalized into the
 * Object-based format.
 */
function normalizeProps (options: Object, vm: ?Component) {
  const props = options.props
  if (!props) return
  const res = {}
  let i, val, name
  if (Array.isArray(props)) {
    // props是数组格式
    i = props.length
    while (i--) {
      val = props[i]
      if (typeof val === 'string') {
        name = camelize(val) // 转驼峰 hello-wrold => helloWorld
        res[name] = { type: null }
      } else if (process.env.NODE_ENV !== 'production') {
        // 警告 数组语法的props，元素必须是字符串
        warn('props must be strings when using array syntax.')
      }
    }
  } else if (isPlainObject(props)) {
    // props是对象
    for (const key in props) {
      val = props[key]
      name = camelize(key)
      res[name] = isPlainObject(val)
        // 对象 直接作为值定义
        ? val
        // 非对象val当作props指定类型字段 val可以是字符串或数组 String 或 [String, Number]
        : { type: val }
    }
  } else if (process.env.NODE_ENV !== 'production') {
    // 警告 props非数组或对象
    warn(
      `Invalid value for option "props": expected an Array or an Object, ` +
      `but got ${toRawType(props)}.`,
      vm
    )
  }
  options.props = res
}
```

[props](https://cn.vuejs.org/v2/api/#props)支持数组或对象格式。

props是数组格式时，元素必须是字符串格式，遍历每个元素转化成对象格式，如

```js
{
  props: ['hello', 'world', 'hello-world']
}
// 转化后
{
  props: {
    hello: { type: null },
    world: { type: null },
    helloWorld: { type: null },
  }
}
```

props是对象时，允许配置高级选项，如类型检测、自定义验证和设置默认值，[官方文档](https://cn.vuejs.org/v2/guide/components-props.html)中有对prop定义的详细介绍。

props为对象时，支持的参数格式是多样的，转换规则只有两个，如果propKey对应的propVal是对象，则直接作为转后结果；如果是非对象，将propVal作为prop转换独享的type字段。

```js
// 定义
{
  props: {
    A: Number,
    B: [ Number, String ],
    C: { type: String, default: 'hello', ... }
  }
}
// 转换后
{
  props: {
    A: { type: Number },
    B: { type: [ Number, String ] },
    C: { type: String, default: 'hello', ... }
  }
}
```

#### 标准化inject

```js
/**
 * Normalize all injections into Object-based format
 *  将inject转成标准要求的对象格式
 */
function normalizeInject (options: Object, vm: ?Component) {
  const inject = options.inject
  if (!inject) return
  const normalized = options.inject = {}
  if (Array.isArray(inject)) {
    for (let i = 0; i < inject.length; i++) {
      normalized[inject[i]] = { from: inject[i] }
    }
  } else if (isPlainObject(inject)) {
    for (const key in inject) {
      const val = inject[key]
      normalized[key] = isPlainObject(val)
        ? extend({ from: key }, val)
        : { from: val }
    }
  } else if (process.env.NODE_ENV !== 'production') {
    // 警告 inject非数组或对象
    warn(
      `Invalid value for option "inject": expected an Array or an Object, ` +
      `but got ${toRawType(inject)}.`,
      vm
    )
  }
}
```

#### 标准化directive

将directive转成标准要求的对象格式。

```js
/**
 * Normalize raw function directives into object format.
 *  将directive转成标准要求的对象格式
 */
function normalizeDirectives (options: Object) {
  const dirs = options.directives
  if (dirs) {
    for (const key in dirs) {
      const def = dirs[key]
      if (typeof def === 'function') {
        // def是函数定义，转成对象
        dirs[key] = { bind: def, update: def }
      }
    }
  }
}
```

该方法很简单，如果注册的指令是对象格式则不做处理，如果注册的指令是函数，则将其转化成对象，并将函数作为`bind`和`update`的handler。

### 处理extends和mixins

[options.extends](https://cn.vuejs.org/v2/api/#extends)和[options.mixins](https://cn.vuejs.org/v2/api/#mixins)

```js
// Apply extends and mixins on the child options,
// but only if it is a raw options object that isn't
// the result of another mergeOptions call.
// Only merged options has the _base property.
if (!child._base) {
  // 递归 合并实例化组件的extends
  if (child.extends) {
    parent = mergeOptions(parent, child.extends, vm)
  }
  // 递归 合并实例化组件的mixins
  if (child.mixins) {
    for (let i = 0, l = child.mixins.length; i < l; i++) {
      parent = mergeOptions(parent, child.mixins[i], vm)
    }
  }
}
```

### 根据策略合并选项

最后是合并options，并返回。

这里首先遍历parentOptions，将其根据相应的合并策略合并到options中；

```js
  const options = {}
  let key
  // 合并parent上的key
  for (key in parent) {
    mergeField(key)
  }
  // 合并child上有的而parent上没有的key
  for (key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key)
    }
  }
  function mergeField (key) {
    // 如果有自定义选项策略，则使用自定义选项策略，否则选择使用默认策略
    const strat = strats[key] || defaultStrat
    // 执行相应的合并策略
    options[key] = strat(parent[key], child[key], vm, key)
  }
  return options
```

再遍历childOptions，进行判断`!hasOwn(parent, key)`，也就是说将child上有而parent没有的选项，也合并到`options`中。hasOwn方法如下：

```js
/**
 * Check whether an object has the property.
 */
const hasOwnProperty = Object.prototype.hasOwnProperty
export function hasOwn (obj: Object | Array<*>, key: string): boolean {
  return hasOwnProperty.call(obj, key)
}
```

我们可以看出，`mergeField`方法就是合并策略真正执行的地方。这个方法根据选项key获取相应的合并策略，如果没有对应的策略，就是用默认合并策略`defaultStrat`，然后调用获取到的策略`strat`执行合并，扩展到options上。

下面我们来看`strats`对应的策略

#### 合并策略规则

我们已经提到过，选项是用来定义Vue实例的行为。选项的类型官方API中分为6类：

- [数据](https://cn.vuejs.org/v2/api/#%E9%80%89%E9%A1%B9-%E6%95%B0%E6%8D%AE)
- [DOM](https://cn.vuejs.org/v2/api/#%E9%80%89%E9%A1%B9-DOM)
- [生命周期钩子](https://cn.vuejs.org/v2/api/#%E9%80%89%E9%A1%B9-%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E9%92%A9%E5%AD%90)
- [资源](https://cn.vuejs.org/v2/api/#%E9%80%89%E9%A1%B9-%E8%B5%84%E6%BA%90)
- [组合](https://cn.vuejs.org/v2/api/#%E9%80%89%E9%A1%B9-%E7%BB%84%E5%90%88)
- [其它](https://cn.vuejs.org/v2/api/#%E9%80%89%E9%A1%B9-%E5%85%B6%E5%AE%83)

Vue中选项十分丰富，不过它们的合并策略，遵循**选项的子配置存在则取子配置，不存在则取父配置，即用子去覆盖父**。

#### 默认合并策略

优先使用子childVal，不存在则使用父parentVal。

```js
/**
 * Default strategy.
 * 默认合并策略
 *  childVal不是undefined，使用childVal
 *  否则使用parentVal
 */
const defaultStrat = function (parentVal: any, childVal: any): any {
  return childVal === undefined
    ? parentVal
    : childVal
}
```

非生产环境下`options.el`、`options.propsData`选项对默认策略做了一层封装，添加了警告。

```js
if (process.env.NODE_ENV !== 'production') {
  /**
   * el propsData 默认合并策略
   */
  strats.el = strats.propsData = function (parent, child, vm, key) {
    if (!vm) {
      // 警告 el propsData只能在new Vue实例化创建时使用
      warn(
        `option "${key}" can only be used during instance ` +
        'creation with the `new` keyword.'
      )
    }
    return defaultStrat(parent, child)
  }
}
```

#### data合并策略

data的合并策略，最终是调用`mergeDataOrFn`方法，区别在于是否有vm实例。vm实例为真，说明是`new Vue()`创建的实例进行data合并；否则，说明是子父类关系，即`Vue.extend()`被调用创建子类时进行的data合并。

```js
/**
 * data合并策略
 *  childVal必须是函数
 */
strats.data = function (
  parentVal: any,
  childVal: any,
  vm?: Component
): ?Function {
	// vm代表是否为Vue创建的实例，否则是子父类的关系
  if (!vm) {
    if (childVal && typeof childVal !== 'function') { // 必须保证子类的data类型是一个函数而不是一个对象
      // 警告 子类的data需要是一个函数 开发中常见错误
      process.env.NODE_ENV !== 'production' && warn(
        'The "data" option should be a function ' +
        'that returns a per-instance value in component ' +
        'definitions.',
        vm
      )

      return parentVal
    }
    return mergeDataOrFn(parentVal, childVal)
  }
  // new Vue创建的实例 传递vm作为函数的第三个参数
  return mergeDataOrFn(parentVal, childVal, vm)
}
```

如果是子父类的关系，需要对`data`选项进行规范校验，保证它的类型是一个函数而不是对象。

```js
/**
 * Data
 *  data、provide合并策略
 */
export function mergeDataOrFn (
  parentVal: any,
  childVal: any,
  vm?: Component
): ?Function {
  if (!vm) { // 子父类
    // in a Vue.extend merge, both should be functions
    if (!childVal) { // 子类不存在data选项，则合并结果为父类data选项
      return parentVal
    }
    if (!parentVal) { // 父类不存在data选项，则合并结果为子类data选项
      return childVal
    }

    // when parentVal & childVal are both present,
    // we need to return a function that returns the
    // merged result of both functions... no need to
    // check if parentVal is a function here because
    // it has to be a function to pass previous merges.
    return function mergedDataFn () { // data选项在父类和子类同时存在的情况下返回的是一个函数
      // 子类实例和父类实例，分别将子类和父类实例中data函数执行后返回的对象传递给mergeData函数做数据合并
      return mergeData(
        typeof childVal === 'function' ? childVal.call(this, this) : childVal, // to
        typeof parentVal === 'function' ? parentVal.call(this, this) : parentVal // from
      )
    }
  } else {
    // vm为真 Vue构造函数实例对象
    return function mergedInstanceDataFn () {
      // instance merge
      const instanceData = typeof childVal === 'function'
        ? childVal.call(vm, vm)
        : childVal
      const defaultData = typeof parentVal === 'function'
        ? parentVal.call(vm, vm)
        : parentVal
      if (instanceData) {
        // 当实例中传递data选项时，将实例的data对象和Vm构造函数上的data属性选项合并
        return mergeData(instanceData, defaultData)
      } else {
        // 当实例中不传递data时，默认返回Vm构造函数上的data属性选项
        return defaultData
      }
    }
  }
}
```

从上面代码中，我们可以看到。

如果是子父类的data合并：

- childVal不为真，返回parentVal 即 子类不存在data选项，则合并结果为父类data选项，`data: parentVal `
- parentVal不为真，返回childVal 即 父类不存在data选项，则合并结果为子类data选项，`data: childVal `
- parentVal和childVal都为真 返回mergedDataFn函数 即 data选项在父类和子类同时存在的情况下返回的是一个函数mergedDataFn，作为data选项函数，`data: mergedDataFn `
  - 当有Vue.mixin混入选项data函数 或 `Vue.extend()`创建子类A后，再调用子类`A.extend()`创建孙子类B，那么就会命中此逻辑。

如果是Vue实例的data合并，直接返回mergedInstanceDataFn函数，作为data选项函数，`data: mergedInstanceDataFn`。

我们可以发现，当返回的是mergedDataFn或mergedInstanceDataFn时，它们内部都调用了mergeData函数。

它们的执行时机是在`initState`阶段，在初始化响应式系统的第一步，就是执行data函数拿到`return {...}`数据时。

```js
/**
 * Helper that recursively merges two data objects together.
 * 合并两个对象 递归合并from到to中
 *   to中的每一项都设置成observed，可观察的
 *   如果to.key是一个对象，就递归调用本身mergeData，保证每个key都是可观察的
 * @param {*} to 子类data
 * @param {*} from 父类data
 * @returns
 */
function mergeData (to: Object, from: ?Object): Object {
  if (!from) return to
  let key, toVal, fromVal

  // 获取父类data的所有key数组
  const keys = hasSymbol
    ? Reflect.ownKeys(from)
    : Object.keys(from)

  for (let i = 0; i < keys.length; i++) {
    key = keys[i]

    // in case the object is already observed...
    if (key === '__ob__') continue // 跳过响应式对象的__ob__键

    toVal = to[key]
    fromVal = from[key]

    if (!hasOwn(to, key)) {
      // 父类的data[key]，子类没有，则将新增的数据加入响应式系统中
      set(to, key, fromVal)
    } else if (
      toVal !== fromVal &&
      isPlainObject(toVal) &&
      isPlainObject(fromVal)
    ) {
      // toVal !== fromVal不相等，且都是对象，递归合并 如果相等，则使用子类数据
      // 处理深层对象，当合并的数据为多层嵌套对象时，需要递归调用mergeData进行比较合并
      mergeData(toVal, fromVal)
    }
  }

  // 返回合并结果
  return to
}
```

`mergeData`方法的两个参数是子`data`选项和父`data`选项的结果，也就是两个`data`对象，从源码上看数据合并的原则是，将父类的数据整合到子类的数据选项中； 如果父类数据和子类数据冲突时，保留子类数据。如果对象有深层嵌套，且不相等，则需要递归调用`mergeData`进行数据合并。总结就是，子类data中有的优先使用子类的，没有的就是用父类的。

为什么`Vue`组件的`data`是一个函数，而不是一个对象呢？

看完源码后，相信会对这个问题有更深刻的认识，组件设计的目的是为了复用，每次通过函数创建相当于在一个独立的内存空间中生成一个`data`的副本，这样每个组件之间的数据不会互相影响。

#### provide合并策略

provide也使用mergeDataOrFn函数处理合并。

```js
/**
 * provide合并策略
 */
strats.provide = mergeDataOrFn
```

#### 资源合并策略

资源合并策略指的是选项`components`、`directives`、`filters`的合并策略。

```js
ASSET_TYPES.forEach(function (type) {
  strats[type + 's'] = mergeAssets
})

// src/shared/constants.js
export const ASSET_TYPES = [
  'component',
  'directive',
  'filter'
]
```

这些资源选项的合并逻辑很简单，首先会创建一个原型指向父类资源选项的空对象，再将子类选项赋值给空对象，如果子类选项中有相同的key，那么就会遮蔽父类选项上的相同key。

```js
/**
 * Assets
 * When a vm is present (instance creation), we need to do
 * a three-way merge between constructor options, instance
 * options and parent options.
 *  资源选项components、directives、filters合并策略
 */
function mergeAssets (
  parentVal: ?Object,
  childVal: ?Object,
  vm?: Component,
  key: string
): Object {
  // 创建一个空对象，其原型指向父类的资源选项
  const res = Object.create(parentVal || null)
  if (childVal) {
    // childVal 即 components,filters,directives选项必须为对象
    process.env.NODE_ENV !== 'production' && assertObjectType(key, childVal, vm)
    // childVal会覆盖parentVal上相同的值
    return extend(res, childVal)
  } else {
    return res
  }
}
```

看下面的合并结果：

```js
var vm = new Vue({
  components: {
    componentA: {}
  },
  directives: {
    'v-boom': {}
  }
})

console.log(vm.$options.components)

// 根实例的选项和资源默认选项合并后的结果
{
  components: {
    componentA: {},
    __proto__: {
      KeepAlive: {}
      Transition: {}
      TransitionGroup: {}
    }
  },
  directives: {
    'v-boom': {},
    __proto__: {
      'v-show': {},
      'v-model': {}
    }
  }
}
```

总结，对于 `directives、filters` 以及 `components` 等资源选项，父类选项将以原型链的形式被处理。子类通过原型链能查找并使用内置组件和内置指令。子类中如果有相同名称的资源名，则会遮蔽原型链上的同名资源。

#### 生命周期函数合并策略

```js
LIFECYCLE_HOOKS.forEach(hook => {
  strats[hook] = mergeHook // 对生命周期钩子选项的合并都执行mergeHook策略
})

// src/shared/constants.js
export const LIFECYCLE_HOOKS = [
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'updated',
  'beforeDestroy',
  'destroyed',
  'activated',
  'deactivated',
  'errorCaptured',
  'serverPrefetch'
]
```

合并策略可总结为：

1. 如果子类不存在钩子选项，则以父类选项返回。
2. 如果父类不存在钩子选项，子类存在时，则以数组形式返回子类钩子选项。
3. 如果子类和父类都拥有相同钩子选项，则将子类选项和父类选项合并成数组，子类钩子选项放在数组的末尾，这样在执行钩子时，永远是父类选项优先于子类选项执行。

```js
/**
 * Hooks and props are merged as arrays.
 * 生命周期钩子函数合并策略
 *  将各个生命周期的钩子函数合并成数组
 */
function mergeHook (
  parentVal: ?Array<Function>,
  childVal: ?Function | ?Array<Function>
): ?Array<Function> {
  const res = childVal
    ? parentVal
      // childVal、parentVal都为真，合并数组
      ? parentVal.concat(childVal)
      // childVal为真，parentVal不为真，使用childVal当作数组
      : Array.isArray(childVal)
        ? childVal
        : [childVal]
    // childVal不为真，使用parentVal数组
    : parentVal
  return res
    ? dedupeHooks(res)
    : res
}
// 同一个钩子出现多次，去除掉重复的
function dedupeHooks (hooks) {
  const res = []
  for (let i = 0; i < hooks.length; i++) {
    if (res.indexOf(hooks[i]) === -1) {
      res.push(hooks[i])
    }
  }
  return res
}
```

例子：

```js
var Parent = Vue.extend({
  mounted() {
    console.log('parent')
  }
})
var Child = Parent.extend({
  mounted() {
    console.log('child')
  }
})
var vm = new Child().$mount('#app');

// 输出结果：
parent
child
```

总结，对于生命周期钩子选项，子类和父类相同的选项将合并成数组，这样在执行子类钩子函数时，父类钩子选项也会执行，并且父会优先于子执行。

#### watch合并策略

watch合并策略为：

1. 子类和父类watch选项都没有，返回空对象
2. 子类或父类watch选项存在，返回存在的选项
3. 子类和父类watch选项都存在，则将子类选项和父类选项合并成数组，子类watch选项放在数组的末尾，保证执行时，永远是父类选项优先于子类选项执行。

```js
/**
 * Watchers.
 *
 * Watchers hashes should not overwrite one
 * another, so we merge them as arrays.
 *  watch的合并策略
 *    parentVal、childVal都不为真，返回空对象
 *    parentVal或childVal有一个为真，返回真的项
 *    parentVal和childVal都为真，每一项都合并成数组
 */
strats.watch = function (
  parentVal: ?Object,
  childVal: ?Object,
  vm?: Component,
  key: string
): ?Object {
  // work around Firefox's Object.prototype.watch...
  if (parentVal === nativeWatch) parentVal = undefined
  if (childVal === nativeWatch) childVal = undefined

  // parentVal和childVal都不为真 或 只有一个为真
  /* istanbul ignore if */
  if (!childVal) return Object.create(parentVal || null) // 没有子类watch选项，则默认用父选项
  if (process.env.NODE_ENV !== 'production') {
    assertObjectType(key, childVal, vm) // 子类watch必须是对象
  }
  if (!parentVal) return childVal // 没有父类watch选项

  // parentVal和childVal都为真 子类和父类watch选项都存在
  // 相同的key合并成[parent, child]数组
  const ret = {}
  extend(ret, parentVal)
  for (const key in childVal) {
    let parent = ret[key]
    const child = childVal[key]
    if (parent && !Array.isArray(parent)) {
      // 父的选项先转换成数组
      parent = [parent]
    }
    ret[key] = parent
      // 相同的key合并成[parent, child]数组
      ? parent.concat(child)
      // parent没有，将child作为数组合并上
      : Array.isArray(child) ? child : [child]
  }
  return ret
}
```

例子：

```js
var Parent = Vue.extend({
  watch: {
    'test': function() {
      console.log('parent change')
    }
  }
})
var Child = Parent.extend({
  watch: {
    'test': {
      handler: function() {
        console.log('child change')
      }
    }
  },
  data() {
    return {
      test: 1
    }
  }
})
var vm = new Child().$mount('#app');
vm.test = 2;
// 输出结果
parent change
child change
```

总结，对于watch选项的合并，最终和父类选项合并成数组，并且数组的选项成员，可以是回调函数，选项对象，或者函数名。

#### props methods inject computed合并策略

合并策略为，如果父类不存在选项，则返回子类选项，子类父类都存在时，用子类选项去覆盖父类选项。

```js
/**
 * Other object hashes.
 *  props、methods、inject、computed合并策略
 *    parentVal不为真，使用childVal
 *    parentVal和childVal为真，合并后返回；
 *      childVal会覆盖parentVal相同的key
 */
strats.props =
strats.methods =
strats.inject =
strats.computed = function (
  parentVal: ?Object,
  childVal: ?Object,
  vm?: Component,
  key: string
): ?Object {
  if (childVal && process.env.NODE_ENV !== 'production') {
    assertObjectType(key, childVal, vm)
  }
  // parentVal不为真，使用childVal
  if (!parentVal) return childVal

  // parentVal和childVal为真，合并后返回；
  const ret = Object.create(null)
  extend(ret, parentVal)
  //  childVal会覆盖parentVal相同的key
  if (childVal) extend(ret, childVal)
  return ret
}
```

## 小结

`Vue`有相当丰富的选项合并策略，不管是内部的选项还是用户自定义的选项，他们都遵循内部约定好的合并策略。有了丰富的选项和严格的合并策略，`Vue`在开发上可以根据需要，灵活定义实例行为。
