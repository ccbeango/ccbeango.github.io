---
title: "setState详解和React性能优化"
date: "2021-01-10 11:28:37"
series:
  name: "React核心技术与开发实战"
  order: 7
tags:
  - "React核心技术与开发实战"
draft: false
---

## setState的使用

### 为什么使用setState

开发中我们并不能直接通过修改state的值来让界面发生更新，因为我们修改了`state`之后，希望React根据最新的`State`来重新渲染界面，但是这种方式的修改React并不知道数据发生了变化。我们必须通过`setState`来告知React数据已经发生了变化。

<!--more-->

`setState`是从Component中继承过来的，在类组件中可以直接使用。

```js
// react/src/ReactBaseclasses.js
Component.prototype.setState = function(partialState, callback) {
  invariant(
    typeof partialState === 'object' ||
      typeof partialState === 'function' ||
      partialState == null,
    'setState(...): takes an object of state variables to update or a ' +
      'function which returns an object of state variables.',
  );
  this.updater.enqueueSetState(this, partialState, callback, 'setState');
};

```

### setState异步更新

setState是异步更新的。

下面的例子点击按钮修改`Hello World`为`Hello React`，页面中的文字虽然变化了，但是`changeText()`方法同步执行打印的文本内容仍是`Hello World`。

![558989](https://cdn.jsdelivr.net/gh/ccbeango/blogImages/React/React%E6%A0%B8%E5%BF%83%E6%8A%80%E6%9C%AF%E4%B8%8E%E5%BC%80%E5%8F%91%E5%AE%9E%E8%B7%B524.gif)

```jsx
import React, { Component } from 'react'

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      message: 'Hello World'
    };
  }

  render() {
    return (
      <div>
        <h2>{this.state.message}</h2>
        <button onClick={() => this.changeText()}>改变文本</button>
      </div>
    )
  }

  changeText() {
    this.setState({
      message: 'Hello React'
    });

    console.log(this.state.message);
  }
}
```

为什么`setState`是异步更新呢？

> https://github.com/facebook/react/issues/11527

- `setState`设计成异步，可以显著的提升性能；
  - 如果每次调用`setState`都进行一次更新，那么意味着`render`函数会被频繁调用，界面重新渲染，这样效率是很低的；
  - 好的办法应该是获取到多个更新，之后进行批量更新；

- 如果同步更新了`state`，但是还没执行到`render`函数，那么`state`和`props`不能保持同步；
  - `state`和`props`不能保持一致性，会在开发中产生很多的问题；如父组件和子组件的数据不同步，子组件中接受的props是旧的数据。

  那么如何可以获取到更新后的值呢？

  - setState接受两个参数：第二个参数是一个回调函数，这个回调函数会在更新后会执行；
  - 格式如下：setState(partialState, callback)

  ```jsx
  changeText() {
    this.setState({
      message: "你好啊,李银河"
    }, () => {
      console.log(this.state.message); // 你好啊,李银河
    });
  }
  ```

  当然，我们也可以在生命周期函数中获取更新后的数据：

  ```jsx
  componentDidUpdate(prevProps, provState, snapshot) {
    console.log(this.state.message);
  }
  ```

### setState一定是异步吗

疑惑：setState一定是异步更新的吗？

验证一：在setTimeout中的更新：

```jsx
changeText() {
  setTimeout(() => {
    this.setState({
      message: "你好啊,李银河"
    });
    console.log(this.state.message); // 你好啊,李银河
  }, 0);
}
```

验证二：原生DOM事件：

```jsx
componentDidMount() {
  const btnEl = document.getElementById("btn");
  btnEl.addEventListener('click', () => {
    this.setState({
      message: "你好啊,李银河"
    });
    console.log(this.state.message); // 你好啊,李银河
  })
}
```

其实分成两种情况：

- 在组件生命周期或React合成事件中，setState是异步；
- 在setTimeout或者原生dom事件中，setState是同步；

为什么React会使用合成事件对象？

React不止运行在浏览器，还可能运行在手机端（React-Native）。如果运行在浏览器中，那么此时就会把浏览器原生DOM对象和一些其他属性合成到合成事件对象中；如果在手机上，就会使用手机端原生控件对象。到底要使用哪个对象，React在最初始化时是不知道的，会根据环境来判断。

React中其实是通过一个函数来确定的：enqueueSetState部分实现（
react-reconciler/ReactFiberClassComponent.js）

每个组件对象都有一个updater对象

```jsx
 enqueueSetState(inst, payload, callback) {
    const fiber = getInstance(inst);
    const currentTime = requestCurrentTimeForUpdate();
    const suspenseConfig = requestCurrentSuspenseConfig();
    const expirationTime = computeExpirationForFiber(
      currentTime,
      fiber,
      suspenseConfig,
    );

    const update = createUpdate(expirationTime, suspenseConfig);
    update.payload = payload;
    if (callback !== undefined && callback !== null) {
      if (__DEV__) {
        warnOnInvalidCallback(callback, 'setState');
      }
      update.callback = callback;
    }

    enqueueUpdate(fiber, update);
    scheduleWork(fiber, expirationTime);
  },
```

`computeExpirationForFiber`会决定此次的更新是同步还是批量异步，位置在`packages\react-reconciler\src\ReactFiberWorkLoop.js`。

`createUpdate`会创建一个更新对象，然后`enqueueUpdate`会生成链表，`scheduleWork`安排执行相关任务。

`enqueueUpdate`生成链表源码如下：

`packages\react-reconciler\src\ReactUpdateQueue.js`

```jsx
export function enqueueUpdate<State>(fiber: Fiber, update: Update<State>) {
  const updateQueue = fiber.updateQueue;
  if (updateQueue === null) {
    // Only occurs if the fiber has been unmounted.
    return;
  }

  const sharedQueue = updateQueue.shared;
  const pending = sharedQueue.pending;
  if (pending === null) {
    // This is the first update. Create a circular list.
    update.next = update;
  } else {
    update.next = pending.next;
    pending.next = update;
  }
  sharedQueue.pending = update;

  if (__DEV__) {
    if (
      currentlyProcessingQueue === sharedQueue &&
      !didWarnUpdateInsideUpdate
    ) {
      console.error(
        'An update (setState, replaceState, or forceUpdate) was scheduled ' +
          'from inside an update function. Update functions should be pure, ' +
          'with zero side-effects. Consider using componentDidUpdate or a ' +
          'callback.',
      );
      didWarnUpdateInsideUpdate = true;
    }
  }
}
```

### setState的数据合并

比如我们还是有一个counter属性，记录当前的数字：

- 如果进行如下操作，那么counter会变成几呢？答案是1；
- 为什么呢？因为它会对多个state进行合并；

```jsx
  increment() {
    this.setState({
      counter: this.state.counter + 1
    });

    this.setState({
      counter: this.state.counter + 1
    });

    this.setState({
      counter: this.state.counter + 1
    });
  }
```

在源码中，有一个do-while循环会对update队列进行处理，内部对多个state进行了合并。

如何可以做到，让counter最终变成3呢？

```jsx
increment() {
  this.setState((state, props) => {
    return {
      counter: state.counter + 1
    }
  })

  this.setState((state, props) => {
    return {
      counter: state.counter + 1
    }
  })

  this.setState((state, props) => {
    return {
      counter: state.counter + 1
    }
  })
  }
```

为什么传入一个函数就可以变出3呢？

- 原因是多个state进行合并时，每次遍历，都会执行一次函数：

  `partialState = payload.call(instance, prevState, nextProps);`

packages\react-reconciler\src\ReactUpdateQueue.js

```jsx
export function processUpdateQueue<State>(
  workInProgress: Fiber,
  props: any,
  instance: any,
  renderExpirationTime: ExpirationTime,
): void {
  // This is always non-null on a ClassComponent or HostRoot
  const queue: UpdateQueue<State> = (workInProgress.updateQueue: any);

  hasForceUpdate = false;

  if (__DEV__) {
    currentlyProcessingQueue = queue.shared;
  }

  // The last rebase update that is NOT part of the base state.
  let baseQueue = queue.baseQueue;

  // The last pending update that hasn't been processed yet.
  let pendingQueue = queue.shared.pending;
  if (pendingQueue !== null) {
    // We have new updates that haven't been processed yet.
    // We'll add them to the base queue.
    if (baseQueue !== null) {
      // Merge the pending queue and the base queue.
      let baseFirst = baseQueue.next;
      let pendingFirst = pendingQueue.next;
      baseQueue.next = pendingFirst;
      pendingQueue.next = baseFirst;
    }

    baseQueue = pendingQueue;

    queue.shared.pending = null;
    // TODO: Pass `current` as argument
    const current = workInProgress.alternate;
    if (current !== null) {
      const currentQueue = current.updateQueue;
      if (currentQueue !== null) {
        currentQueue.baseQueue = pendingQueue;
      }
    }
  }

  // These values may change as we process the queue.
  if (baseQueue !== null) {
    let first = baseQueue.next;
    // Iterate through the list of updates to compute the result.
    let newState = queue.baseState;
    let newExpirationTime = NoWork;

    let newBaseState = null;
    let newBaseQueueFirst = null;
    let newBaseQueueLast = null;

    if (first !== null) {
      let update = first;
      do {
        const updateExpirationTime = update.expirationTime;
        if (updateExpirationTime < renderExpirationTime) {
          // Priority is insufficient. Skip this update. If this is the first
          // skipped update, the previous update/state is the new base
          // update/state.
          const clone: Update<State> = {
            expirationTime: update.expirationTime,
            suspenseConfig: update.suspenseConfig,

            tag: update.tag,
            payload: update.payload,
            callback: update.callback,

            next: (null: any),
          };
          if (newBaseQueueLast === null) {
            newBaseQueueFirst = newBaseQueueLast = clone;
            newBaseState = newState;
          } else {
            newBaseQueueLast = newBaseQueueLast.next = clone;
          }
          // Update the remaining priority in the queue.
          if (updateExpirationTime > newExpirationTime) {
            newExpirationTime = updateExpirationTime;
          }
        } else {
          // This update does have sufficient priority.

          if (newBaseQueueLast !== null) {
            const clone: Update<State> = {
              expirationTime: Sync, // This update is going to be committed so we never want uncommit it.
              suspenseConfig: update.suspenseConfig,

              tag: update.tag,
              payload: update.payload,
              callback: update.callback,

              next: (null: any),
            };
            newBaseQueueLast = newBaseQueueLast.next = clone;
          }

          // Mark the event time of this update as relevant to this render pass.
          // TODO: This should ideally use the true event time of this update rather than
          // its priority which is a derived and not reverseable value.
          // TODO: We should skip this update if it was already committed but currently
          // we have no way of detecting the difference between a committed and suspended
          // update here.
          markRenderEventTimeAndConfig(
            updateExpirationTime,
            update.suspenseConfig,
          );

          // Process this update.
          newState = getStateFromUpdate(
            workInProgress,
            queue,
            update,
            newState,
            props,
            instance,
          );
          const callback = update.callback;
          if (callback !== null) {
            workInProgress.effectTag |= Callback;
            let effects = queue.effects;
            if (effects === null) {
              queue.effects = [update];
            } else {
              effects.push(update);
            }
          }
        }
        update = update.next;
        if (update === null || update === first) {
          pendingQueue = queue.shared.pending;
          if (pendingQueue === null) {
            break;
          } else {
            // An update was scheduled from inside a reducer. Add the new
            // pending updates to the end of the list and keep processing.
            update = baseQueue.next = pendingQueue.next;
            pendingQueue.next = first;
            queue.baseQueue = baseQueue = pendingQueue;
            queue.shared.pending = null;
          }
        }
      } while (true);
    }

    if (newBaseQueueLast === null) {
      newBaseState = newState;
    } else {
      newBaseQueueLast.next = (newBaseQueueFirst: any);
    }

    queue.baseState = ((newBaseState: any): State);
    queue.baseQueue = newBaseQueueLast;

    // Set the remaining expiration time to be whatever is remaining in the queue.
    // This should be fine because the only two other things that contribute to
    // expiration time are props and context. We're already in the middle of the
    // begin phase by the time we start processing the queue, so we've already
    // dealt with the props. Context in components that specify
    // shouldComponentUpdate is tricky; but we'll have to account for
    // that regardless.
    markUnprocessedUpdateTime(newExpirationTime);
    workInProgress.expirationTime = newExpirationTime;
    workInProgress.memoizedState = newState;
  }

  if (__DEV__) {
    currentlyProcessingQueue = null;
  }
}
```

getStateFromUpdate获取新的state

```jsx
function getStateFromUpdate<State>(
  workInProgress: Fiber,
  queue: UpdateQueue<State>,
  update: Update<State>,
  prevState: State,
  nextProps: any,
  instance: any,
): any {
  switch (update.tag) {
   ...
    // Intentional fallthrough
    case UpdateState: {
      const payload = update.payload;
      let partialState;
      if (typeof payload === 'function') {
        // Updater function
        if (__DEV__) {
          enterDisallowedContextReadInDEV();
          if (
            debugRenderPhaseSideEffectsForStrictMode &&
            workInProgress.mode & StrictMode
          ) {
            payload.call(instance, prevState, nextProps);
          }
        }
        partialState = payload.call(instance, prevState, nextProps);
        if (__DEV__) {
          exitDisallowedContextReadInDEV();
        }
      } else {
        // Partial state object
        partialState = payload;
      }
      if (partialState === null || partialState === undefined) {
        // Null and undefined are treated as no-ops.
        return prevState;
      }
      // Merge the partial state and the previous state.
      return Object.assign({}, prevState, partialState);
    }
    case ForceUpdate: {
      hasForceUpdate = true;
      return prevState;
    }
  }
  return prevState;
}
```

最后，如果需要，会合并对象` return Object.assign({}, prevState, partialState);`

## React性能优化

我们知道React的渲染流程：

![image-20210622114027542](https://cdn.jsdelivr.net/gh/ccbeango/blogImages/React/React%E6%A0%B8%E5%BF%83%E6%8A%80%E6%9C%AF%E4%B8%8E%E5%BC%80%E5%8F%91%E5%AE%9E%E8%B7%B525.png)

React的更新流程是：

![image-20210622114110703](https://cdn.jsdelivr.net/gh/ccbeango/blogImages/React/React%E6%A0%B8%E5%BF%83%E6%8A%80%E6%9C%AF%E4%B8%8E%E5%BC%80%E5%8F%91%E5%AE%9E%E8%B7%B526.png)

React在props或state发生改变时，会调用React的render方法，会创建一颗不同的树。

React需要基于这两颗不同的树之间的差别来判断如何有效的更新UI：

- 如果一棵树参考另外一棵树进行完全比较更新，那么即使是最先进的算法，该算法的复杂程度为 O(n 3 )，其中 n 是树中元素的数量；
- https://grfia.dlsi.ua.es/ml/algorithms/references/editsurvey_bille.pdf；
- 如果在 React 中使用了该算法，那么展示 1000 个元素所需要执行的计算量将在十亿的量级范围；
- 这个开销太过昂贵了，React的更新性能会变得非常低效；

于是，React对这个算法进行了优化，将其优化成了O(n)，如何优化的呢？

- 同层节点之间相互比较，不会垮节点比较；
- 不同类型的节点，产生不同的树结构；
- 开发中，可以通过key来指定哪些节点在不同的渲染下保持稳定；

### Diffing算法

#### 对比不同类型的元素

当节点为不同的元素，React会拆卸原有的树，并且建立起新的树：

- 当一个元素从 `<a>` 变成 `<img>`，从 `<Article>` 变成 `<Comment>`，或从 `<Button>` 变成 `<div>` 都会触发一个完整的重建流程；
- 当卸载一棵树时，对应的DOM节点也会被销毁，组件实例将执行 `componentWillUnmount()` 方法；
- 当建立一棵新的树时，对应的 DOM 节点会被创建以及插入到 DOM 中，组件实例将执行 `componentWillMount()` 方法，紧接着 `componentDidMount()` 方法；

比如下面的代码更改：

- React 会销毁 `Counter` 组件并且重新装载一个新的组件，而不会对Counter进行复用；

```text
<div>
  <Counter />
</div>

<span>
  <Counter />
</span>
```

#### 对比同一类型的元素

当比对两个相同类型的 React 元素时，React 会保留 DOM 节点，仅比对及更新有改变的属性。

比如下面的代码更改：

- 通过比对这两个元素，React 知道只需要修改 DOM 元素上的 `className` 属性；

```text
<div className="before" title="stuff" />

<div className="after" title="stuff" />
```

比如下面的代码更改：

- 当更新 `style` 属性时，React 仅更新有所更变的属性。
- 通过比对这两个元素，React 知道只需要修改 DOM 元素上的 `color` 样式，无需修改 `fontWeight`。

```text
<div style={{color: 'red', fontWeight: 'bold'}} />

<div style={{color: 'green', fontWeight: 'bold'}} />
```

如果是同类型的组件元素：

- 组件会保持不变，React会更新该组件的props，并且调用`componentWillReceiveProps()` 和 `componentWillUpdate()` 方法；
- 下一步，调用 `render()` 方法，diff 算法将在之前的结果以及新的结果中进行递归；

#### 对子节点进行递归

在默认条件下，当递归 DOM 节点的子元素时，React 会同时遍历两个子元素的列表；当产生差异时，生成一个 mutation。

我们来看一下在最后插入一条数据的情况：

- 前面两个比较是完全相同的，所以不会产生mutation；
- 最后一个比较，产生一个mutation，将其插入到新的DOM树中即可；

```jsx
<ul>
  <li>first</li>
  <li>second</li>
</ul>

<ul>
  <li>first</li>
  <li>second</li>
  <li>third</li>
</ul>
```

但是如果我们是在中间插入一条数据：

- React会对每一个子元素产生一个mutation，而不是保持 `<li>星际穿越</li>`和`<li>盗梦空间</li>`的不变；
- 这种低效的比较方式会带来一定的性能问题；

```jsx
<ul>
  <li>星际穿越</li>
  <li>盗梦空间</li>
</ul>

<ul>
  <li>大话西游</li>
  <li>星际穿越</li>
  <li>盗梦空间</li>
</ul>
```

### keys的优化

我们在前面遍历列表时，总是会提示一个警告，让我们加入一个key属性：

我们来看一个案例：

```jsx
import React, { Component } from 'react'

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      movies: ["星际穿越", "盗梦空间"]
    }
  }

  render() {
    return (
      <div>
        <h2>电影列表</h2>
        <ul>
          {
            this.state.movies.map((item, index) => {
              return <li>{item}</li>
            })
          }
        </ul>
        <button onClick={e => this.insertMovie()}>插入数据</button>
      </div>
    )
  }

  insertMovie() {
  }
}
```

方式一：在最后位置插入数据

- 这种情况，有无key意义并不大

```jsx
insertMovie() {
  const newMovies = [...this.state.movies, "大话西游"];
  this.setState({
    movies: newMovies
  })
}
```

方式二：在前面插入数据

- 这种做法，在没有key的情况下，所有的li都需要进行修改；

```jsx
insertMovie() {
  const newMovies = ["大话西游", ...this.state.movies];
  this.setState({
    movies: newMovies
  })
}
```

当子元素(这里的li)拥有 key 时，React 使用 key 来匹配原有树上的子元素以及最新树上的子元素：

- 在下面这种场景下，key为111和222的元素仅仅进行位移，不需要进行任何的修改；
- 将key为333的元素插入到最前面的位置即可；

```jsx
<ul>
  <li key="111">星际穿越</li>
  <li key="222">盗梦空间</li>
</ul>

<ul>
  <li key="333">Connecticut</li>
  <li key="111">星际穿越</li>
  <li key="222">盗梦空间</li>
</ul>
```

key的注意事项：

- key应该是唯一的；
- key不要使用随机数（随机数在下一次render时，会重新生成一个数字）；
- 使用index作为key，对性能是没有优化的；

### SCU的优化

#### render函数被调用

我们使用之前的一个嵌套案例：

- 在App中，我们增加了一个计数器的代码；
- 当点击+1时，会重新调用App的render函数；
- 而当App的render函数被调用时，所有的子组件的render函数都会被重新调用；

```jsx
import React, { Component } from 'react';

function Header() {
  console.log("Header Render 被调用");
  return <h2>Header</h2>
}

class Main extends Component {
  render() {
    console.log("Main Render 被调用");
    return (
      <div>
        <Banner/>
        <ProductList/>
      </div>
    )
  }
}

function Banner() {
  console.log("Banner Render 被调用");
  return <div>Banner</div>
}

function ProductList() {
  console.log("ProductList Render 被调用");
  return (
    <ul>
      <li>商品1</li>
      <li>商品2</li>
      <li>商品3</li>
      <li>商品4</li>
      <li>商品5</li>
    </ul>
  )
}

function Footer() {
  console.log("Footer Render 被调用");
  return <h2>Footer</h2>
}

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      counter: 0
    }
  }

  render() {
    console.log("App Render 被调用");

    return (
      <div>
        <h2>当前计数: {this.state.counter}</h2>
        <button onClick={e => this.increment()}>+1</button>
        <Header/>
        <Main/>
        <Footer/>
      </div>
    )
  }

  increment() {
    this.setState({
      counter: this.state.counter + 1
    })
  }
}
```

![image-20210622173604563](https://cdn.jsdelivr.net/gh/ccbeango/blogImages/React/React%E6%A0%B8%E5%BF%83%E6%8A%80%E6%9C%AF%E4%B8%8E%E5%BC%80%E5%8F%91%E5%AE%9E%E8%B7%B527.png)

那么，我们可以思考一下，在以后的开发中，我们只要是修改了App中的数据，所有的组件都需要重新render，进行diff算法，性能必然是很低的：

- 事实上，很多的组件没有必须要重新render；
- 它们调用render应该有一个前提，就是依赖的数据（state、props）发生改变时，再调用自己的render方法；

如何来控制render方法是否被调用呢？

- 通过`shouldComponentUpdate`方法即可；

#### shouldComponentUpdate

React给我们提供了一个生命周期方法 `shouldComponentUpdate`（很多时候，我们简称为SCU），这个方法接受参数，并且需要有返回值：

- 该方法有两个参数：

- - 参数一：nextProps 修改之后，最新的props属性
  - 参数二：nextState 修改之后，最新的state属性

- 该方法返回值是一个boolean类型

- - 返回值为true，那么就需要调用render方法；
  - 返回值为false，那么久不需要调用render方法；
  - 默认返回的是true，也就是只要state发生改变，就会调用render方法；

```text
shouldComponentUpdate(nextProps, nextState) {
  return true;
}
```

我们可以控制它返回的内容，来决定是否需要重新渲染。

比如我们在App中增加一个message属性：

- jsx中并没有依赖这个message，那么它的改变不应该引起重新渲染；
- 但是因为render监听到state的改变，就会重新render，所以最后render方法还是被重新调用了；

```jsx
import React, { Component } from 'react';

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      counter: 0,
      message: "Hello World"
    }
  }

  render() {
    console.log("App Render 被调用");

    return (
      <div>
        <h2>当前计数: {this.state.counter}</h2>
        <button onClick={e => this.increment()}>+1</button>
        <button onClick={e => this.changeText()}>改变文本</button>
      </div>
    )
  }

  increment() {
    this.setState({
      counter: this.state.counter + 1
    })
  }

  changeText() {
    this.setState({
      message: "你好啊,李银河"
    })
  }
}
```

这个时候，我们可以通过实现shouldComponentUpdate来决定要不要重新调用render方法：

- 这个时候，我们改变counter时，会重新渲染；
- 如果，我们改变的是message，那么默认返回的是false，那么就不会重新渲染；

```jsx
shouldComponentUpdate(nextProps, nextState) {
  if (nextState.counter !== this.state.counter) {
    return true;
  }

  return false;
}
```

但是我们的代码依然没有优化到最好，因为当counter改变时，所有的子组件依然重新渲染了：

- 所以，事实上，我们应该实现所有的子组件的shouldComponentUpdate；

比如Main组件，可以进行如下实现：

- `shouldComponentUpdate`默认返回一个false；
- 在特定情况下，需要更新时，我们在上面添加对应的条件即可；

```jsx
class Main extends Component {

  shouldComponentUpdate(nextProps, nextState) {
    return false;
  }

  render() {
    console.log("Main Render 被调用");
    return (
      <div>
        <Banner/>
        <ProductList/>
      </div>
    )
  }
}
```

#### PureComponent和memo

如果所有的类，我们都需要手动来实现 shouldComponentUpdate，那么会给我们开发者增加非常多的工作量。

我们来设想一下shouldComponentUpdate中的各种判断的目的是什么？

- props或者state中的数据是否发生了改变，来决定shouldComponentUpdate返回true或者false；

事实上React已经考虑到了这一点，所以React已经默认帮我们实现好了，如何实现呢？

- 将class基础自PureComponent。

比如我们修改Main组件的代码：

```jsx
class Main extends PureComponent {
  render() {
    console.log("Main Render 被调用");
    return (
      <div>
        <Banner/>
        <ProductList/>
      </div>
    )
  }
}
```

完整代码如下：

```jsx
import React, { Component, PureComponent } from 'react';

function Header() {
  console.log("Header Render 被调用");
  return <h2>Header</h2>
}

class Main extends PureComponent {
  render() {
    console.log("Main Render 被调用");
    return (
      <div>
        <Banner/>
        <ProductList/>
      </div>
    )
  }
}

class Banner extends PureComponent {
  render() {
    console.log("Banner Render 被调用");
    return <div>Banner</div>
  }
}


function ProductList() {
  console.log("ProductList Render 被调用");
  return (
    <ul>
      <li>商品1</li>
      <li>商品2</li>
      <li>商品3</li>
      <li>商品4</li>
      <li>商品5</li>
    </ul>
  )
}

function Footer() {
  console.log("Footer Render 被调用");
  return <h2>Footer</h2>
}

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      counter: 0
    }
  }

  render() {
    console.log("App Render 被调用");

    return (
      <div>
        <h2>当前计数: {this.state.counter}</h2>
        <button onClick={e => this.increment()}>+1</button>
        <Header/>
        <Main/>
        <Footer/>
      </div>
    )
  }

  increment() {
    this.setState({
      counter: this.state.counter + 1
    })
  }
}
```

PureComponent的原理是什么呢？

- 对props和state进行浅层比较；

源码中有一个方法`checkShouldComponentUpdate`会校验我们实例中的`render`是否需要调用。

`\packages\react-reconciler\src\ReactFiberClassComponent.js`

- 如果实例中有`shouldComponentUpdate`方法，那么会调用此方法，并根据此方法的返回布尔值决定是否重新`render`
- 如果实例继承的是`PureComponent`，就会进行浅层比较，决定是否重新render
- 默认这个方法会返回`true`

```js
function checkShouldComponentUpdate(
  workInProgress,
  ctor,
  oldProps,
  newProps,
  oldState,
  newState,
  nextContext,
) {
  const instance = workInProgress.stateNode;
  if (typeof instance.shouldComponentUpdate === 'function') {
    if (__DEV__) {
      if (
        debugRenderPhaseSideEffectsForStrictMode &&
        workInProgress.mode & StrictMode
      ) {
        // Invoke the function an extra time to help detect side-effects.
        instance.shouldComponentUpdate(newProps, newState, nextContext);
      }
    }
    startPhaseTimer(workInProgress, 'shouldComponentUpdate');
    const shouldUpdate = instance.shouldComponentUpdate(
      newProps,
      newState,
      nextContext,
    );
    stopPhaseTimer();

    if (__DEV__) {
      if (shouldUpdate === undefined) {
        console.error(
          '%s.shouldComponentUpdate(): Returned undefined instead of a ' +
            'boolean value. Make sure to return true or false.',
          getComponentName(ctor) || 'Component',
        );
      }
    }

    return shouldUpdate;
  }

  if (ctor.prototype && ctor.prototype.isPureReactComponent) {
    return (
      !shallowEqual(oldProps, newProps) || !shallowEqual(oldState, newState)
    );
  }

  return true;
}
```

在`packages\react\src\ReactBaseClasses.js`中：

- 有一个属性是`pureComponentPrototype.isPureReactComponent = true;`定义是否是`PureComponent`；
- 那么上面的`checkShouldComponentUpdate`就可以根据这个属性判断执行了

```js
/**
 * Convenience component with default shallow equality check for sCU.
 */
function PureComponent(props, context, updater) {
  this.props = props;
  this.context = context;
  // If a component has string refs, we will assign a different object later.
  this.refs = emptyObject;
  this.updater = updater || ReactNoopUpdateQueue;
}

const pureComponentPrototype = (PureComponent.prototype = new ComponentDummy());
pureComponentPrototype.constructor = PureComponent;
// Avoid an extra prototype jump for these methods.
Object.assign(pureComponentPrototype, Component.prototype);
pureComponentPrototype.isPureReactComponent = true;
```

**那么，如果是一个函数式组件呢？**

我们需要使用一个高阶组件memo：

- 我们将之前的Header、Banner、ProductList都通过memo函数进行一层包裹；
- Footer没有使用memo函数进行包裹；
- 最终的效果是，当counter发生改变时，Header、Banner、ProductList的函数不会重新执行，而Footer的函数会被重新执行；

```jsx
import React, { Component, PureComponent, memo } from 'react';

const MemoHeader = memo(function Header() {
  console.log("Header Render 被调用");
  return <h2>Header</h2>
})


class Main extends PureComponent {
  render() {
    console.log("Main Render 被调用");
    return (
      <div>
        <Banner/>
        <ProductList/>
      </div>
    )
  }
}

class Banner extends PureComponent {
  render() {
    console.log("Banner Render 被调用");
    return <div>Banner</div>
  }
}


function ProductList() {
  console.log("ProductList Render 被调用");
  return (
    <ul>
      <li>商品1</li>
      <li>商品2</li>
      <li>商品3</li>
      <li>商品4</li>
      <li>商品5</li>
    </ul>
  )
}

function Footer() {
  console.log("Footer Render 被调用");
  return <h2>Footer</h2>
}

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      counter: 0
    }
  }

  render() {
    console.log("App Render 被调用");

    return (
      <div>
        <h2>当前计数: {this.state.counter}</h2>
        <button onClick={e => this.increment()}>+1</button>
        <MemoHeader/>
        <Main/>
        <Footer/>
      </div>
    )
  }

  increment() {
    this.setState({
      counter: this.state.counter + 1
    })
  }
}
```

memo在`\packages\react\src\memo.js`文件中，返回了一个对象，这个对象中有一个compare函数。

```js
export default function memo<Props>(
  type: React$ElementType,
  compare?: (oldProps: Props, newProps: Props) => boolean,
) {
  if (__DEV__) {
    if (!isValidElementType(type)) {
      console.error(
        'memo: The first argument must be a component. Instead ' +
          'received: %s',
        type === null ? 'null' : typeof type,
      );
    }
  }
  return {
    $$typeof: REACT_MEMO_TYPE,
    type,
    compare: compare === undefined ? null : compare,
  };
}
```

具体的比较在`packages\react-reconciler\src\ReactFiberBeginWork.js`中

- 如果自己在memo中传入了compare函数，就是用传入的，否则使用`shallowEqual`浅比较。
- 所以memo的本质上做了一个浅比较

```js
function updateMemoComponent(
  current: Fiber | null,
  workInProgress: Fiber,
  Component: any,
  nextProps: any,
  updateExpirationTime,
  renderExpirationTime: ExpirationTime,
): null | Fiber {
  if (current === null) {
    let type = Component.type;
    if (
      isSimpleFunctionComponent(type) &&
      Component.compare === null &&
      // SimpleMemoComponent codepath doesn't resolve outer props either.
      Component.defaultProps === undefined
    ) {
      let resolvedType = type;
      if (__DEV__) {
        resolvedType = resolveFunctionForHotReloading(type);
      }
      // If this is a plain function component without default props,
      // and with only the default shallow comparison, we upgrade it
      // to a SimpleMemoComponent to allow fast path updates.
      workInProgress.tag = SimpleMemoComponent;
      workInProgress.type = resolvedType;
      if (__DEV__) {
        validateFunctionComponentInDev(workInProgress, type);
      }
      return updateSimpleMemoComponent(
        current,
        workInProgress,
        resolvedType,
        nextProps,
        updateExpirationTime,
        renderExpirationTime,
      );
    }
    if (__DEV__) {
      const innerPropTypes = type.propTypes;
      if (innerPropTypes) {
        // Inner memo component props aren't currently validated in createElement.
        // We could move it there, but we'd still need this for lazy code path.
        checkPropTypes(
          innerPropTypes,
          nextProps, // Resolved props
          'prop',
          getComponentName(type),
          getCurrentFiberStackInDev,
        );
      }
    }
    let child = createFiberFromTypeAndProps(
      Component.type,
      null,
      nextProps,
      null,
      workInProgress.mode,
      renderExpirationTime,
    );
    child.ref = workInProgress.ref;
    child.return = workInProgress;
    workInProgress.child = child;
    return child;
  }
  if (__DEV__) {
    const type = Component.type;
    const innerPropTypes = type.propTypes;
    if (innerPropTypes) {
      // Inner memo component props aren't currently validated in createElement.
      // We could move it there, but we'd still need this for lazy code path.
      checkPropTypes(
        innerPropTypes,
        nextProps, // Resolved props
        'prop',
        getComponentName(type),
        getCurrentFiberStackInDev,
      );
    }
  }
  let currentChild = ((current.child: any): Fiber); // This is always exactly one child
  if (updateExpirationTime < renderExpirationTime) {
    // This will be the props with resolved defaultProps,
    // unlike current.memoizedProps which will be the unresolved ones.
    const prevProps = currentChild.memoizedProps;
    // Default to shallow comparison
    let compare = Component.compare;
    compare = compare !== null ? compare : shallowEqual;
    if (compare(prevProps, nextProps) && current.ref === workInProgress.ref) {
      return bailoutOnAlreadyFinishedWork(
        current,
        workInProgress,
        renderExpirationTime,
      );
    }
  }
  // React DevTools reads this flag.
  workInProgress.effectTag |= PerformedWork;
  let newChild = createWorkInProgress(currentChild, nextProps);
  newChild.ref = workInProgress.ref;
  newChild.return = workInProgress;
  workInProgress.child = newChild;
  return newChild;
}
```

#### 不可变数据的力量

我们通过一个案例来演练我们之前说的不可变数据的重要性：

```jsx
import React, { PureComponent } from 'react'

export default class App extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      friends: [
        { name: "lilei", age: 20, height: 1.76 },
        { name: "lucy", age: 18, height: 1.65 },
        { name: "tom", age: 30, height: 1.78 }
      ]
    }
  }

  render() {
    return (
      <div>
        <h2>朋友列表</h2>
        <ul>
          {
            this.state.friends.map((item, index) => {
              return (
                <li key={item.name}>
                  <span>{`姓名:${item.name} 年龄: ${item.age}`}</span>
                  <button onClick={e => this.incrementAge(index)}>年龄+1</button>
                </li>
              )
            })
          }
        </ul>
        <button onClick={e => this.insertFriend()}>添加新数据</button>
      </div>
    )
  }

  insertFriend() {

  }

  incrementAge(index) {

  }
}
```

**我们来思考一下inertFriend应该如何实现？**

实现方式一：

- 这种方式会造成界面不会发生刷新，添加新的数据；
- 原因是继承自PureComponent，会进行浅层比较，浅层比较过程中两个friends是相同的对象；

```jsx
insertFriend() {
  this.state.friends.push({name: "why", age: 18, height: 1.88});
  this.setState({
    friends: this.state.friends
  })
}
```

实现方式二：

- `[...this.state.friends, {name: "why", age: 18, height: 1.88}]`会生成一个新的数组引用；
- 在进行浅层比较时，两个引用的是不同的数组，所以它们是不相同的；

```jsx
insertFriend() {
  this.setState({
    friends: [...this.state.friends, {name: "why", age: 18, height: 1.88}]
  })
}
```

**我们再来思考一下incrementAge应该如何实现？**

实现方式一：

- 和上面方式一类似

```jsx
incrementAge(index) {
  this.state.friends[index].age += 1;
  this.setState({
    friends: this.state.friends
  })
}
```

实现方式二：

- 和上面方式二类似

```jsx
incrementAge(index) {
  const newFriends = [...this.state.friends];
  newFriends[index].age += 1;
  this.setState({
    friends: newFriends
  })
}
```

所以，在真实开发中，我们要尽量保证state、props中的数据不可变性，这样我们才能合理和安全的使用PureComponent和memo。
