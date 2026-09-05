---
title: "Redux中间件和state管理"
date: "2021-07-06 16:12:17"
series:
  name: "React核心技术与开发实战"
  order: 15
tags:
  - "React核心技术与开发实战"
draft: false
---

## 中间件的使用

### 1.1. 组件中异步请求

在之前简单的案例中，redux中保存的counter是一个本地定义的数据，我们可以直接通过同步的操作来dispatch action，state就会被立即更新。

但是真实开发中，redux中保存的很多数据可能来自服务器，我们需要进行异步的请求，再将数据保存到redux中。

<!--more-->

在之前学习网络请求的时候我们讲过，网络请求可以在class组件的`componentDidMount`中发送，所以我们可以有这样的结构：

![image-20210704184321502](https://cdn.jsdelivr.net/gh/ccbeango/blogImages/React/React%E6%A0%B8%E5%BF%83%E6%8A%80%E6%9C%AF%E4%B8%8E%E5%BC%80%E5%8F%91%E5%AE%9E%E8%B7%B533.png)

组件中发送网络请求

我现在完成如下案例操作：

- 在Home组件中请求banners和recommends的数据；
- 在About组件中展示banners和recommends的数据；

**redux代码进行如下修改：**

在reducer.js中添加state初始化数据和reducer函数中处理代码：

```jsx
const initialState = {
  counter: 0,
  banners: [],
  recommends: []
}

function reducer(state = initialState, action) {
  switch (action.type) {
    case ADD_NUMBER:
      return { ...state, counter: state.counter + action.num };
    case SUB_NUMBER:
      return { ...state, counter: state.counter - action.num };
    case CHANGE_BANNER:
      return { ...state, banners: action.banners };
    case CHANGE_RECOMMEND:
      return { ...state, recommends: action.recommends };
    default:
      return state;
  }
}
```

constants中增加常量：

```jsx
const CHANGE_BANNER = "CHANGE_BANNER";
const CHANGE_RECOMMEND = "CHANGE_RECOMMEND";
```

actionCreators.js中添加actions：

```jsx
const changeBannersAction = (banners) => ({
  type: CHANGE_BANNER,
  banners
})

const changeRecommendsAction = (recommends) => ({
  type: CHANGE_RECOMMEND,
  recommends
})
```

**组件中代码代码修改：**

Home3组件：

```jsx
import React, { PureComponent } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { addAction, increAction, changeBannersAction, changeRecommendsAction } from '../store/actionCreators';

class Home extends PureComponent {
  componentDidMount() {
    axios.get("http://123.207.32.32:8000/home/multidata").then(res => {
      const data = res.data.data;
      this.props.changeBanners(data.banner.list);
      this.props.changeRecommends(data.recommend.list);
    })
  }

  render() {
    return (
      <div>
        <h1>Home3</h1>
        <h2>计数：{this.props.counter}</h2>
        <button onClick={e => this.increment()}>+1</button>
        <button onClick={e => this.addNumber()}>+5</button>
        <h1>Banners</h1>
        <ul>
          {
            this.props.banners.map((item, index) => {
              return <li key={item.acm}>{item.title}</li>
            })
          }
        </ul>
        <h1>Recommends</h1>
        <ul>
          {
            this.props.recommends.map((item, index) => {
              return <li key={item.acm}>{item.title}</li>
            })
          }
        </ul>
      </div>
    )
  }

  increment() {
    this.props.increAction();
  }

  addNumber() {
    this.props.addAction(5);
  }
}

const mapStateToProp = state => {
  return {
    counter: state.counter,
    banners: state.banners,
    recommends: state.recommends
  };
}

const mapDispatchToProp = dispatch => {
  return {
    increAction() {
      dispatch(increAction());
    },
    addAction(num) {
      dispatch(addAction(num))
    },
    changeBanners(banners) {
      dispatch(changeBannersAction(banners));
    },
    changeRecommends(recommends) {
      dispatch(changeRecommendsAction(recommends));
    }
  };
}


export default connect(mapStateToProp, mapDispatchToProp)(Home);
```

### redux中异步请求

上面的代码有一个缺陷：

- 我们必须将网络请求的异步代码放到组件的生命周期中来完成；
- 事实上，网络请求到的数据也属于我们状态管理的一部分，更好的一种方式应该是将其也交给redux来管理；

![image-20210704184353406](https://cdn.jsdelivr.net/gh/ccbeango/blogImages/React/React%E6%A0%B8%E5%BF%83%E6%8A%80%E6%9C%AF%E4%B8%8E%E5%BC%80%E5%8F%91%E5%AE%9E%E8%B7%B534.png)

但是在redux中如何可以进行异步的操作呢？

- 答案就是使用**中间件（Middleware）**；

redux也引入了中间件（Middleware）的概念：

- 这个中间件的目的是在`dispatch的action`和`最终达到的reducer`之间，扩展一些自己的代码；
- 比如日志记录、调用异步接口、添加代码调试功能等等；

我们现在要做的事情就是发送异步的网络请求，所以我们可以添加对应的中间件：

- 这里官网推荐的、包括演示的网络请求的中间件是使用 `redux-thunk`

redux-thunk是如何做到让我们可以发送异步的请求呢？

- 我们知道，默认情况下的dispatch(action)，action需要是一个JavaScript的对象；

- `redux-thunk`可以让dispatch(action函数)，`action可以是一个函数`；

- 该函数会被调用，并且会传给这个函数一个dispatch函数和getState函数；

- - dispatch函数用于我们之后再次派发action；
  - getState函数考虑到我们之后的一些操作需要依赖原来的状态，用于让我们可以获取之前的一些状态；

- **如何使用redux-thunk呢？**

- 1.安装redux-thunk

- ```text
  yarn add redux-thunk
  ```

- 2.在创建store时传入应用了middleware的enhance函数

- - 通过applyMiddleware来结合多个Middleware, 返回一个enhancer；
  - 将enhancer作为第二个参数传入到createStore中；

- ```js
  // 通过applyMiddleware来结合多个Middleware, 返回一个enhancer
  const enhancer = applyMiddleware(thunkMiddleware);
  // 将enhancer作为第二个参数传入到createStore中
  const store = createStore(reducer, enhancer);
  ```

- 3.定义返回一个函数的action：

- - 注意：这里不是返回一个对象了，而是一个函数；
  - 该函数在dispatch之后会被执行；

- ```jsx
  export const getAboutMultidataAction = () => {
    return (dispatch) => {
      axios.get("http://123.207.32.32:8000/home/multidata").then(res => {
        const data = res.data.data;
        dispatch(changeBannersAction(data.banner.list));
        dispatch(changeRecommendsAction(data.recommend.list));
      })
    }
  }
  ```

- 修改about3.js中的代码

- ```jsx
  import React, { PureComponent } from 'react';
  import { subAction, decreAction, getAboutMultidataAction } from '../store/actionCreators';
  import { connect } from 'react-redux';

  class About extends PureComponent {
    componentDidMount() {
      this.props.getAboutMultidataAction();
    }

    render() {
      return (
        <div>
          <h1>About3</h1>
          <h2>计数：{this.props.counter}</h2>
          <button onClick={e => this.decrement()}>-1</button>
          <button onClick={e => this.subNumber()}>-5</button>
          <h1>Banners</h1>
          <ul>
            {
              this.props.banners.map((item, index) => {
                return <li key={item.acm}>{item.title}</li>
              })
            }
          </ul>
          <h1>Recommends</h1>
          <ul>
            {
              this.props.recommends.map((item, index) => {
                return <li key={item.acm}>{item.title}</li>
              })
            }
          </ul>
        </div>
      )
    }

    decrement() {
      this.props.decreAction();
    }

    subNumber() {
      this.props.subAction(5);
    }
  }

  export default connect(
    state => ({
      counter: state.counter,
      banners: state.banners,
      recommends: state.recommends
    }),
    dispatch => ({
      decreAction() {
        dispatch(decreAction());
      },
      subAction(num) {
        dispatch(subAction(num));
      },
      getAboutMultidataAction() {
        dispatch(getAboutMultidataAction());
      }
    })
  )(About);
  ```

- trace打开：

- ```jsx
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({trace: true}) || compose;
  ```

### redux-saga

[redux-saga](https://github.com/redux-saga/redux-saga)中间件使用了ES6的generator语法

安装redux-saga

```text
yarn add redux-saga
```

集成redux-saga中间件

```jsx
import { applyMiddleware, createStore, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import createSagaMiddleware from 'redux-saga';
import reducer from './reducer';
import mySaga from './saga';

// 通过createSagaMiddleware函数来创建saga中间件
const sagaMiddleware = createSagaMiddleware();

// const enhancer = applyMiddleware(thunkMiddleware);
// const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({ trace: true }) || compose;

const enhancer = composeEnhancers(applyMiddleware(thunkMiddleware, sagaMiddleware));

const store = createStore(reducer, enhancer);

sagaMiddleware.run(mySaga);

export default store;
```

saga.js文件的编写

- takeEvery：可以传入多个监听的actionType，每一个都可以被执行（对应有一个takeLastest，会取消前面的）
- put：在saga中派发action不再是通过dispatch，而是通过put；
- all：可以在yield的时候put多个action；

```jsx
import { takeEvery, put, all } from 'redux-saga/effects';
import axios from 'axios';
import { FETCH_HOME_MULTIDATA } from './constants';
import { changeBannersAction, changeRecommendsAction } from './actionCreators';

function* fetchHomeMultidata() {
  const res = yield axios.get('http://123.207.32.32:8000/home/multidata');

  const banner = res.data.data.banner.list;
  const recommend = res.data.data.recommend.list;

  // yield put(changeBannersAction(banner));
  // yield put(changeRecommendsAction(recommend));

  yield all([
    put(changeBannersAction(banner)),
    put(changeRecommendsAction(recommend))
  ]);
}

function* mySaga() {
  yield takeEvery(FETCH_HOME_MULTIDATA, fetchHomeMultidata)
}

export default mySaga;
```

## 中间件的原理

### 打印日志需求

前面我们已经提过，中间件的目的是在redux中插入一些自己的操作：

- 比如我们现在有一个需求，在dispatch之前，打印一下本次的action对象，dispatch完成之后可以打印一下最新的store state；
- 也就是我们需要将对应的代码插入到redux的某部分，让之后所有的dispatch都可以包含这样的操作；

如果没有中间件，我们是否可以实现类似的代码呢？

当然可以，类似下面的方式即可：

```js
console.log("dispatching:", addAction(5));
store.dispatch(addAction(5));
console.log("new state:", store.getState());

console.log("dispatching:", addAction(10));
store.dispatch(subAction(10));
console.log("new state:", store.getState());
```

但是这种方式缺陷非常明显：

- 首先，每一次的dispatch操作，我们都需要在前面加上这样的逻辑代码；
- 其次，存在大量重复的代码，会非常麻烦和臃肿；

是否有一种更优雅的方式来处理这样的相同逻辑呢？

- 我们可以将代码封装到一个独立的函数中

```jsx
function dispatchAndLog(action) {
  console.log("dispatching:", action);
  store.dispatch(addAction(5));
  console.log("新的state:", store.getState());
}

dispatchAndLog(addAction(10));
```

但是这样的代码有一个非常大的缺陷：

- 调用者（使用者）在使用我的dispatch时，必须使用我另外封装的一个函数dispatchAndLog；
- 显然，对于调用者来说，很难记住这样的API，更加习惯的方式是直接调用dispatch；

我们来进一步对代码进行优化；

### 修改dispatch

事实上，我们可以利用一个hack一点的技术：Monkey Patching，利用它可以修改原有的程序逻辑；

我们对代码进行如下的修改：

- 这样就意味着我们已经直接修改了dispatch的调用过程；
- 在调用dispatch的过程中，真正调用的函数其实是dispatchAndLog；

```js
let next = store.dispatch;

function dispatchAndLog(action) {
  console.log("dispatching:", addAction(10));
  next(addAction(5));
  console.log("新的state:", store.getState());
}

store.dispatch = dispatchAndLog;
```

当然，我们可以将它封装到一个模块中，只要调用这个模块中的函数，就可以对store进行这样的处理：

```js
function patchLogging(store) {
  let next = store.dispatch;

  function dispatchAndLog(action) {
    console.log("dispatching:", action);
    next(addAction(5));
    console.log("新的state:", store.getState());
  }

  store.dispatch = dispatchAndLog;
}
```

### thunk需求

redux-thunk的作用：

- 我们知道redux中利用一个中间件redux-thunk可以让我们的dispatch不再只是处理对象，并且可以处理函数；
- 那么redux-thunk中的基本实现过程是怎么样的呢？事实上非常的简单。

我们来看下面的代码：

- 我们又对dispatch进行转换，这个dispatch会判断传入的

```js
function patchThunk(store) {
  let next = store.dispatch;

  function dispatchAndThunk(action) {
    if (typeof action === "function") {
      action(store.dispatch, store.getState);
    } else {
      next(action);
    }
  }

  store.dispatch = dispatchAndThunk;
}
```

将两个patch应用起来，进行测试：

```js
patchLogging(store);
patchThunk(store);

store.dispatch(addAction(10));

function getData(dispatch) {
  setTimeout(() => {
    dispatch(subAction(10));
  }, 1000)
}

// 传入函数
store.dispatch(getData);
```

### 合并中间件

单个调用某个函数来合并中间件并不是特别的方便，我们可以封装一个函数来实现所有的中间件合并：

```js
function applyMiddleware(store, middlewares) {
  middlewares.forEach(middleware => {
    store.dispatch = middleware(store);
  })
}

applyMiddleware(store, [patchLogging, patchThunk]);
```

![image-20210705180210533](https://cdn.jsdelivr.net/gh/ccbeango/blogImages/React/React%E6%A0%B8%E5%BF%83%E6%8A%80%E6%9C%AF%E4%B8%8E%E5%BC%80%E5%8F%91%E5%AE%9E%E8%B7%B535.png)

当然，真实的中间件实现起来会更加的灵活，这里我们仅仅做一个抛砖引玉，有兴趣可以参考redux合并中间件的源码流程。

## reducer拆分

### reducer代码拆分

我们来看一下目前我们的reducer：

- 当前这个reducer既有处理counter的代码，又有处理home页面的数据；
- 后续counter相关的状态或home相关的状态会进一步变得更加复杂；
- 我们也会继续添加其他的相关状态，比如购物车、分类、歌单等等；

```jsx
function reducer(state = initialState, action) {
  switch (action.type) {
    case ADD_NUMBER:
      return { ...state, counter: state.counter + action.num };
    case SUB_NUMBER:
      return { ...state, counter: state.counter - action.num };
    case CHANGE_BANNER:
      return { ...state, banners: action.banners };
    case CHANGE_RECOMMEND:
      return { ...state, recommends: action.recommends };
    default:
      return state;
  }
}
```

如果将所有的状态都放到一个reducer中进行管理，随着项目的日趋庞大，必然会造成代码臃肿、难以维护。

**因此，我们可以对reducer进行拆分：**

我们先抽取一个对counter处理的reducer：

```jsx
import { ADD_NUMBER, SUB_NUMBER, INCREMENT, DECREMENT } from './constants';

const initialCounterState = {
  counter: 0
};

export default function counterReducer(state = initialCounterState, action) {
  switch(action.type) {
    case ADD_NUMBER:
      return { ...state, counter: state.counter + action.num };
    case SUB_NUMBER:
      return { ...state, counter: state.counter - action.num };
    case INCREMENT:
      return { ...state, counter: state.counter + 1 };
    case DECREMENT:
      return { ...state, counter: state.counter - 1 };
    default:
      return state;
  }
}
```

再抽取一个对home处理的reducer：

```jsx
import { CHANGE_BANNER, CHANGE_RECOMMEND } from './constants';

const initialHomeState = {
  banners: [],
  recommends: []
};

export default function homeReducer(state = initialHomeState, action) {
  switch(action.type) {
    case CHANGE_BANNER:
      return { ...state, banners: action.banners };
    case CHANGE_RECOMMEND:
      return { ...state, recommends: action.recommends };
    default:
      return state;
  }
}
```

将它们合并起来:

```jsx
const reducer = (state = {}, action) => {
  return {
    counterInfo: counterReducer(state.counterInfo, action),
    homeInfo: homeReducer(state.homeInfo, action)
  };
}
```

### reducer文件拆分

目前我们已经将不同的状态处理拆分到不同的reducer中，我们来思考：

- 虽然已经放到不同的函数了，但是这些函数的处理依然是在同一个文件中，代码非常的混乱；
- 另外关于reducer中用到的constant、action等我们也依然是在同一个文件中；

所以，接下来，我们可以对文件结构再次进行拆分：

```text
./store
├── counter
│   ├── actioncreators.js
│   ├── constants.js
│   ├── index.js
│   └── reducer.js
├── home
│   ├── actioncreators.js
│   ├── constants.js
│   ├── index.js
│   └── reducer.js
├── index.js
├── reducer.js
└── saga.js
```

这里不再给出代码，每个文件中存放的内容即可：

- home/actioncreators.js：存放home相关的action；
- home/constants.js：存放home相关的常量；
- home/reducer.js：存放分离的reducer代码；
- index.js：统一对外暴露的内容；

### combineReducers

redux给我们提供了一个combineReducers函数可以方便的让我们对多个reducer进行合并：

```jsx
import { combineReducers } from 'redux';

import { reducer as counterReducer } from './counter';
import { reducer as homeReducer } from './home';

const reducer = combineReducers({
  counterInfo: counterReducer,
  homeInfo: homeReducer
})

export default reducer;
```

那么combineReducers是如何实现的呢？

- 事实上，它也是讲我们传入的reducers合并到一个对象中，最终返回一个combination的函数（相当于我们之前的reducer函数了）；
- 在执行combination函数的过程中，它会通过判断前后返回的数据是否相同来决定返回之前的state还是新的state；
- 新的state会触发订阅者发生对应的刷新，而旧的state可以有效的组织订阅者发生刷新；

redux\src\combineReducers.js

```js
export default function combineReducers(reducers) {
  const reducerKeys = Object.keys(reducers)
  const finalReducers = {}
  for (let i = 0; i < reducerKeys.length; i++) {
    const key = reducerKeys[i]

    if (process.env.NODE_ENV !== 'production') {
      if (typeof reducers[key] === 'undefined') {
        warning(`No reducer provided for key "${key}"`)
      }
    }

    if (typeof reducers[key] === 'function') {
      finalReducers[key] = reducers[key]
    }
  }
  const finalReducerKeys = Object.keys(finalReducers)

  // This is used to make sure we don't warn about the same
  // keys multiple times.
  let unexpectedKeyCache
  if (process.env.NODE_ENV !== 'production') {
    unexpectedKeyCache = {}
  }

  let shapeAssertionError
  try {
    assertReducerShape(finalReducers)
  } catch (e) {
    shapeAssertionError = e
  }

  return function combination(state = {}, action) {
    if (shapeAssertionError) {
      throw shapeAssertionError
    }

    if (process.env.NODE_ENV !== 'production') {
      const warningMessage = getUnexpectedStateShapeWarningMessage(
        state,
        finalReducers,
        action,
        unexpectedKeyCache
      )
      if (warningMessage) {
        warning(warningMessage)
      }
    }

    let hasChanged = false
    const nextState = {}
    for (let i = 0; i < finalReducerKeys.length; i++) {
      const key = finalReducerKeys[i]
      const reducer = finalReducers[key]
      const previousStateForKey = state[key]
      const nextStateForKey = reducer(previousStateForKey, action)
      if (typeof nextStateForKey === 'undefined') {
        const actionType = action && action.type
        throw new Error(
          `When called with an action of type ${
            actionType ? `"${String(actionType)}"` : '(unknown type)'
          }, the slice reducer for key "${key}" returned undefined. ` +
            `To ignore an action, you must explicitly return the previous state. ` +
            `If you want this reducer to hold no value, you can return null instead of undefined.`
        )
      }
      nextState[key] = nextStateForKey
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey
    }
    hasChanged =
      hasChanged || finalReducerKeys.length !== Object.keys(state).length
    return hasChanged ? nextState : state
  }
}
```

## ImmutableJS

### 数据可变性的问题

在React开发中，我们总是会强调数据的不可变性：

- 无论是类组件中的state，还是redux中管理的state；
- 事实上在整个JavaScript编码过程中，数据的不可变性都是非常重要的；

数据的可变性引发的问题：

- 我们明明没有修改obj，只是修改了obj2，但是最终obj也被我们修改掉了；
- 原因非常简单，对象是引用类型，它们指向同一块内存空间，两个引用都可以任意修改；

```js
const obj = {
  name: "why",
  age: 18
}

console.log(obj); // {name: "ccbean", age: 18}
const obj2 = obj;
obj2.name = "kobe";
console.log(obj); // {name: "kobe", age: 18}
```

有没有办法解决上面的问题呢？

- 进行对象的拷贝即可：Object.assign或扩展运算符

```js
console.log(obj); // {name: "ccbean", age: 18}
const obj2 = {...obj};
obj2.name = "kobe";
console.log(obj); // {name: "kobe", age: 18}
```

这种对象的浅拷贝有没有问题呢？

- 从代码的角度来说，没有问题，也解决了我们实际开发中一些潜在风险；
- 从性能的角度来说，有问题，如果对象过于庞大，这种拷贝的方式会带来性能问题以及内存浪费；

### 认识ImmutableJS

为了解决上面的问题，出现了Immutable对象的概念：

- Immutable对象的特点是只要修改了对象，就会返回一个新的对象，旧的对象不会发生改变；

但是这样的方式就不会浪费内存了吗？

- 为了节约内存，又出现了一个新的算法：Persistent Data Structure（持久化数据结构或一致性数据结构）；

当然，我们一听到持久化第一反应应该是数据被保存到本地或者数据库，但是这里并不是这个含义：

- 用一种数据结构来保存数据；
- 当数据被修改时，会返回一个对象，但是新的对象会尽可能的利用之前的数据结构而不会对内存造成浪费；

如何做到这一点呢？结构共享：

![640](https://cdn.jsdelivr.net/gh/ccbeango/blogImages/React/React%E6%A0%B8%E5%BF%83%E6%8A%80%E6%9C%AF%E4%B8%8E%E5%BC%80%E5%8F%91%E5%AE%9E%E8%B7%B536.gif)

![640](https://cdn.jsdelivr.net/gh/ccbeango/blogImages/React/React%E6%A0%B8%E5%BF%83%E6%8A%80%E6%9C%AF%E4%B8%8E%E5%BC%80%E5%8F%91%E5%AE%9E%E8%B7%B537.png)

```js
const imjs = require('immutable');

// 1.定义JavaScript的Array和转换成immutable的List
const friends = [
  { name: "why", age: 18 },
  { name: "kobe", age: 30 }
]

// 不会进行深层转换
const imArray1 = imjs.List(friends);
// 会进行深层转换
const imArray2 = imjs.fromJS(friends);
console.log(imArray1);
console.log(imArray2);


// 2.定义JavaScript的Object和转换成immutable的Map
const info = {
  name: "coderwhy",
  age: 18,
  friend: {
    name: "kobe",
    age: 30
  }
}

const imObj1 = imjs.Map(info);
const imObj2 = imjs.fromJS(info);
console.log(imObj1);
console.log(imObj2);

// 3.对immutable操作
// 3.1.添加数据
// 产生一个新的immutable对象
console.log(imArray1.push("aaaa"));
console.log(imArray1.set(2, "aaaa"));
// 原来的是不变的
console.log(imArray1);

// 3.2.修改数据
console.log(imArray1.set(1, "aaaa"));
console.log(imArray2.set(2, imjs.fromJS("bbbb")));

// 3.3.删除数据
console.log(imArray1.delete(0).get(0)); // {name: "kobe", age: 30}

// 3.4.查询数据
console.log(imArray1.get(1));
console.log(imArray2.get(1));
console.log(imArray1.get(1).name);
console.log(imArray2.getIn([1, "name"]));

// 4.转换成JavaScript对象
const array = imArray1.toJS();
const obj = imObj1.toJS();
console.log(array);
console.log(obj);
```
