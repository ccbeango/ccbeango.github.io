---
title: "propertymarkmap"
date: "2021-12-06 12:05:53"
series:
  name: "Vue2源码探究"
  order: 10
tags:
  - "Vue2源码探究"
  - "属性、方法、配置"
draft: false
---

## static

- version

- FunctionalRenderContext

- cid
- options
  - _base
  - components
  - directives
  - filters
- util
  - warn()
  - extend()
  - mergeOptions()
  - defineReactive()

- config
  - optionMergeStrategies
  - silent
  - productionTip
  - performance
  - devtools
  - errorHandler
  - warnHandler
  - ignoredElements
  - keyCodes

  - isReservedTag
  - isReservedAttr
  - parsePlatformTagName
  - isUnknownElement
  - getTagNamespace
  - mustUseProp

  - async

  - _lifecycleHooks
    - beforeCreate
    - created
    - beforeMount
    - mounted
    - beforeUpdate
    - updated
    - beforeDestroy
    - destroyed
    - activated
    - deactivated
    - errorCaptured
    - serverPrefetch

- set()
- delete()
- nextTick()
- observable()

- use()
- mixin()
- extend()

- directive()
- component()
- filter()

- compile()

## prototype

- _uid

- $isServer
- $ssrContext

- _init()

- $data
- $props
- $set()
- $delete
- $watch()

- $on()
- $once()
- $off()
- $emit()

- _update()
- $forceUpdate()
- $destroy()
- $mount()

- _render()
- $nextTick()
- _o = markOnce()
- _n = toNumber()
- _s = toString()
- _l = renderList()
- _t = renderSlot()
- _q = looseEqual()
- _i = looseIndexOf()
- _m = renderStatic()
- _f = resolveFilter()
- _k = checkKeyCodes()
- _b = bindObjectProps()
- _v = createTextVNode()
- _e = createEmptyVNode()
- _u = resolveScopedSlots()
- _g = bindObjectListeners()
- _d = bindDynamicKeys()
- _p = prependModifier()

## instance

- $el
- $options
- $parent
- $root
- $children
- $refs
- $slots
- $scopedSlots
- $vnode
- $attrs
- $listeners
- $isServer

- $createElement()
- **patch**()
- _c()

- _uid
- _name
- _isVue
- _self
- _renderProxy
- _renderContext
- _watcher
- _watchers
- _computedWatchers
- _data
- _props
- _events
- _inactive
- _directInactive
- _isMounted
- _isDestroyed
- _isBeingDestroyed
- _vnode
- _staticTrees
- _hasHookEvent
- _provided

- _ssrNode()
- _ssrList()
- _ssrEscape()
- _ssrAttr()
- _ssrAttrs()
- _ssrDOMProps()
- _ssrClass()
- _ssrStyle()
