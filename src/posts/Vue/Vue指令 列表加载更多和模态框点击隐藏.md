---
title: "Vue指令 列表加载更多和模态框点击隐藏"
date: "2020-07-12 09:27:10"
tags:
  - "Vue"
draft: false
---

列表的懒加载和点击某个模态框外隐藏，是开发中常用到的，下面是在Vue中对两个功能的指令实现，可直接在Vue项目中使用。

<!--more-->

## 指令 - 列表加载更多

```typescript
import { DirectiveOptions, VNode } from 'vue';

/**
 * 滚动加载更多指令
 *  v-scrollmore="{
 *       load: function, // 加载回调函数
 *       loadEnd: boolean, // 加载状态
 *       loadAuto: boolean,   // 首次加载数据未填充满可视区域或未加载完毕时，是否自动再去加载
 *       loadingText: string, // 加载中文本 默认 "加载中..."
 *       loadEndText: string  // 没有更多文本 默认 "没有更多了"
 *   }">
 *
 * 提示的样式设置： loadingText 和 loadEndText 的 class 为 "load-more-text"
 *
 *
 *  示例
 *  <div  v-scrollmore="{
 *       load: loadMore,
 *       loadEnd: loadStatus,
 *       loadAuto: true,
 *       loadingText: 'loading...',
 *       loadEndText: 'no more'
 *     }">
 */

const ctx = 'scrollmore';

interface HTMLElementExtend extends HTMLElement {
  [ctx]: {
    timeout: NodeJS.Timeout | null;
    timer: NodeJS.Timeout | null;
    vueScrollEvent: (() => void) | null;
  };
}


const defaultLoadingText = '加载中...';
const defaultloadEndText = '没有更多了';

/**
 * 添加提示
 * @param el HTMLElement
 * @param loadText 提示
 */
function addLoadText(el: HTMLElement, loadText: string) {

  const hintELement = document.createElement('div');
  hintELement.innerHTML = `<p>${loadText}</p>`;
  hintELement.style.textAlign = 'center';
  hintELement.className = 'load-more-text';

  el.appendChild(hintELement);
}

/**
 * 移除旧提示
 * @param el HTMLElement
 */
function removeLoadText(el: HTMLElement) {
  const tableLoadMoreText = el.querySelector('.load-more-text');

  if (tableLoadMoreText) {
    el.removeChild(tableLoadMoreText);
  }
}

/**
 * 防抖
 * @param fn 被执行函数
 * @param delay 延迟执行时间
 */
const debounce = (fn: () => void, delay: number) => {
  let timeout: NodeJS.Timeout | null = null;

  return () => {
    if (timeout !== null) clearTimeout(timeout);
    timeout = setTimeout(fn, delay);
  }
}

/**
 * 滚动到底部加载更多
 */
export const scrollmore: DirectiveOptions = {
  async bind(el, binding, vnode) {
    const elItem = el as HTMLElementExtend;

    elItem[ctx] = {
      timeout: null,
      timer: null,
      vueScrollEvent: null,
    };

    const loadEnd = binding.value.loadEnd;
    const loadingText = binding.value.loadingText || defaultLoadingText;
    const loadEndText = binding.value.loadEndText || defaultloadEndText;

    if (!loadEnd) {
      const directLoadMore = () => {
        const sign = 0;
        const scrollDistance = el.scrollHeight - Math.ceil(el.scrollTop) - Math.ceil(el.clientHeight);

        if (scrollDistance <= sign) {
          binding.value.load();
        }
      }

      const vueScrollEvent = debounce(directLoadMore, 500);

      elItem[ctx].vueScrollEvent = vueScrollEvent;

      el.addEventListener('scroll', vueScrollEvent);

      removeLoadText(el);

      addLoadText(el, loadingText);
    }

    if (loadEnd) {
      removeLoadText(el);

      // 内容高度大于可视高度时，添加提示；否则无需提示
      if (elItem.scrollHeight - elItem.clientHeight > 0) {
        addLoadText(el, loadEndText);
      }
    }
  },
  inserted(el, binding, vnode) {
    const elItem = el as HTMLElementExtend;
    const loadEnd = binding.value.loadEnd;
    const loadAuto = binding.value.loadAuto || false;

    // 首次加载不够填满容器，且需自动加载的，执行加载更多，直至填满后清除定时 或 加载完毕（updated中清除定时）
    if (!loadEnd && loadAuto) {
      const scrollHeight = el.scrollHeight; // 文档实际高度，包含超出视窗的溢出部分
      const clientHeight = el.clientHeight; // 窗口可视高度

      elItem[ctx].timeout = setTimeout(() => {

        if (scrollHeight <= clientHeight && scrollHeight !== 0 && !loadEnd) {
          // 内容高度小于可视高度，继续加载
          elItem[ctx].timer = setInterval(() => {
            binding.value.load(); // 重新请求加载
            if (el.scrollHeight > clientHeight) {
              clearInterval(elItem[ctx].timer as NodeJS.Timeout);
              clearTimeout(elItem[ctx].timeout as NodeJS.Timeout);

              // 去除提示
              removeLoadText(el);
            }
          }, 1500);
        }
      }, 500);

    }

  },
  update(el, binding) {
    const elItem = el as HTMLElementExtend;
    const loadEnd = binding.value.loadEnd;
    // 加载完毕后清除定时
    if (loadEnd) {
      clearInterval(elItem[ctx].timer as NodeJS.Timeout);
      clearTimeout(elItem[ctx].timeout as NodeJS.Timeout);
    }

    if (loadEnd !== binding.oldValue.loadEnd) {
      const loadingText = binding.value.loadingText || defaultLoadingText;
      const loadEndText = binding.value.loadEndText || defaultloadEndText;
      if (!loadEnd) {
        removeLoadText(el);
        addLoadText(el, loadingText);
      }

      if (loadEnd) {
        removeLoadText(el);

        // 内容高度大于可视高度时，添加加载完毕提示 否则，无需提示
        if (elItem.scrollHeight - elItem.clientHeight > 0) {
          addLoadText(el, loadEndText);
        }
      }
    }
  },
  unbind(el) {
    const elItem = el as HTMLElementExtend;
    clearInterval(elItem[ctx].timer as NodeJS.Timeout);
    clearTimeout(elItem[ctx].timeout as NodeJS.Timeout);
    if (elItem[ctx].vueScrollEvent !== null) {
      el.removeEventListener('scroll', elItem[ctx].vueScrollEvent as () => void);
    }
  }

};
```

## 指令 - 点击其他区域隐藏

```typescript
import { DirectiveOptions, VNode } from 'vue';
import { DirectiveBinding } from 'vue/types/options';

/**
 * 模态框指令，点击其他区域自动关闭
 *  <SearchResultPanel v-show="show" v-clickoutside="handleClose" />
 */

const ctx = 'clickoutside';
const nodeList: HTMLElementExtend[] = [];
let seed = 0;

interface HTMLElementExtend extends HTMLElement {
  [ctx]: {
    id: number;
    documentHandler: (...any: any) => void;
    methodName: string;
    bindingFn: (...any: any) => any;
    [key: string]: any;
  };
}


// 返回一个方法用来在点击的时候触发函数（触发之前会判断该元素是不是el，
// 是不是focusElment以及他们的后代元素，如果是则不会执行函数）
function createDocumentHandler(el: HTMLElementExtend, binding: DirectiveBinding, vnode: VNode) {
  return function (mouseup: MouseEvent, mousedown: MouseEvent) {
    if (
      !vnode ||
      !vnode.context ||
      !mouseup.target ||
      !mousedown.target ||
      el.contains((mouseup.target as Node)) ||
      el.contains((mousedown.target as Node)) ||
      el === mouseup.target
    ) {
      return;
    }

    el[ctx].bindingFn();

  }
}


let startClick: MouseEvent;
document.addEventListener('mousedown', e => {
  startClick = e;
});

document.addEventListener('mouseup', e => {
  // 循环所有的绑定节点，把它们的documentHandler属性所绑定的函数执行一次
  // 这个时候得到的刚好是上面的那个判断执行的函数bindingFn
  nodeList.forEach(node => node[ctx].documentHandler(e, startClick));
});


export const clickoutside: DirectiveOptions = {
  inserted(el) {
    // console.log(el);
  },

  bind(el, binding, vnode) {
    const nodeItem = el as HTMLElementExtend;
    nodeList.push(nodeItem);
    nodeItem[ctx] = {
      id: seed++,
      documentHandler: createDocumentHandler(nodeItem, binding, vnode),
      methodName: binding.expression,
      bindingFn: binding.value
    }
  },

  update(el, binding, vnode) {
    const nodeItem = el as HTMLElementExtend;
    // console.log('点击其他区域关闭', nodeItem[ctx]);
    nodeItem[ctx].documentHandler = createDocumentHandler(nodeItem, binding, vnode);
    nodeItem[ctx].methodName = binding.expression;
    nodeItem[ctx].bindingFn = binding.value;
  },

  unbind(el, binding, vnode) {
    const nodeItem = el as HTMLElementExtend;
    const len = nodeList.length;
    for (let i = 0; i < len; i++) {
      if (nodeList[i][ctx].id === nodeItem[ctx].id) {
        nodeList.splice(i, 1);
        break;
      }
    }
    delete nodeItem[ctx];
  }
}

```

## 使用方法

首先在入口文件`mian.ts`中注册全局指令；

```typescript
// 注册自定义全局指令
Object.keys(directives).forEach(key => {
  Vue.directive(key, (directives as { [key: string]: DirectiveOptions })[key]);
});
```

组件中可直接使用指令:

```vue
<Emoji
v-show="isShowEmoji"
v-clickoutside="closeEmojiModal"
@chooseEmoji="$emit('chooseEmoji', $event)"
/>


closeEmojiModal() {
  this.isShowEmoji = false;
}
```

```vue
<div
     class="wx-user-list"
     ref="WxUserList"
     v-scrollmore="{
                   load: loadMore,
                   loadEnd: false,
                   loadAuto: true,
                   loadingText: 'loading',
                   loadEndText: 'no more'
                   }"
     >
```
