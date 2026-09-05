---
title: "React-Redux"
date: "2021-07-04 16:53:17"
series:
  name: "React核心技术与开发实战"
  order: 14
tags:
  - "React核心技术与开发实战"
draft: false
---

## react结合redux

### redux融入react代码

目前redux在react中使用是最大的，所以我们需要将之前编写的redux代码，融入到react当中去。

<!--more-->

这里我创建了两个组件：

- Home组件：其中会展示当前的counter值，并且有一个+1和+5的按钮；
- About组件：其中会展示当前的counter值，并且有一个-1和-5的按钮；

home.js代码实现

```jsx
import React, { PureComponent } from 'react';
import store from '../store';
import { addAction, increAction } from '../store/actionCreators';

export default class Home extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      counter: store.getState().counter
    };
  }

  componentDidMount() {
    this.unsubscribe = store.subscribe(() => {
      this.setState({
        counter: store.getState().counter
      });
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    return (
      <div>
        <h1>Home</h1>
        <h2>计数：{this.state.counter}</h2>
        <button onClick={e => this.increment()}>+1</button>
        <button onClick={e => this.addNumber()}>+5</button>
      </div>
    )
  }

  increment() {
    store.dispatch(increAction())
  }

  addNumber() {
    store.dispatch(addAction(5))
  }
}
```

about.js代码实现

```jsx
import React, { PureComponent } from 'react';
import store from '../store';
import { subAction, decreAction } from '../store/actionCreators';

export default class About extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      counter: store.getState().counter
    };
  }

  componentDidMount() {
    this.unsubscribe = store.subscribe(() => {
      this.setState({
        counter: store.getState().counter
      });
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    return (
      <div>
        <h1>About</h1>
        <h2>计数：{this.state.counter}</h2>
        <button onClick={e => this.decrement()}>-1</button>
        <button onClick={e => this.subNumber()}>-5</button>
      </div>
    )
  }

  decrement() {
    store.dispatch(decreAction())
  }

  subNumber() {
    store.dispatch(subAction(5))
  }
}
```

上面的代码其实非常简单，核心代码主要是两个：

- 在 `componentDidMount` 中定义数据的变化，当数据发生变化时重新设置 `counter`;
- 在发生点击事件时，调用store的`dispatch`来派发对应的`action`；

### 自定义connect函数

上面的代码是否可以实现`react组件`和`redux`结合起来呢？

- 当然是可以的，但是我们会发现每个使用的地方其实会有一些重复的代码：
- 比如监听store数据改变的代码，都需要在 `componentDidMount`中完成；组件卸载要移除监听
- 比如派发事件，我们都需要去先拿到 `store`， 在调用其 `dispatch` 等；

我们来定义一个connect函数：

- 这个connect函数本身接受两个参数：

- - 参数一：里面存放 `component` 希望使用到的 `State` 属性；
  - 参数二：里面存放 `component` 希望使用到的 `dispatch`动作；

- 这个connect函数有一个返回值，是一个高阶组件：

- - 在`constructor`中的state中保存一下我们需要获取的状态；
  - 在`componentDidMount`中订阅store中数据的变化，并且执行 `setState`操作；
  - 在`componentWillUnmount`中需要取消订阅；
  - 在`render`函数中返回传入的`WrappedComponent`，并且将所有的状态映射到其`props`中；
  - 这个高阶组件接受一个组件作为参数，返回一个class组件；
  - 在这个class组件中，我们进行如下操作

- ```jsx
  import React from 'react';
  import store from '../store';

  export default function connect(mapStateToProp, mapDispatchToProp) {
    return function enhanceHOC(WrapComponent) {
      return class extends React.PureComponent {
        constructor(props) {
          super(props);

          this.state = {
            storeState: mapStateToProp(store.getState())
          };
        }

        componentDidMount() {
          this.unsubscribe = store.subscribe(() => {
            this.setState({
              storeState: mapStateToProp(store.getState())
            });
          })
        }

        componentWillUnmount() {
          this.unsubscribe();
        }

        render() {
          return <WrapComponent
            {...this.props}
            {...mapStateToProp(store.getState())}
            {...mapDispatchToProp(store.dispatch)}
          />
        }
      }
    }
  }
  ```

- 在home和props文件中，我们按照自己需要的state、dispatch来进行映射：

- 比如home.js中进行如下修改：

- - mapStateToProps：用于将state映射到一个对象中，对象中包含我们需要的属性；

  - mapDispatchToProps：用于将dispatch映射到对象中，对象中包含在组件中可能操作的函数；

  - - 当调用该函数时，本质上其实是调用dispatch(对应的Action)；

修改后的home2.js

```jsx
import React, { PureComponent } from 'react';
import connect from '../utils/connect';
import { addAction, increAction } from '../store/actionCreators';

class Home extends PureComponent {
  render() {
    return (
      <div>
        <h1>Home2</h1>
        <h2>计数：{this.props.counter}</h2>
        <button onClick={e => this.increment()}>+1</button>
        <button onClick={e => this.addNumber()}>+5</button>
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
    counter: state.counter
  };
}

const mapDispatchToProp = dispatch => {
  return {
    increAction() {
      dispatch(increAction());
    },
    addAction(num) {
      dispatch(addAction(num))
    }
  };
}


export default connect(mapStateToProp, mapDispatchToProp)(Home);
```

About2.js

```jsx
import React, { PureComponent } from 'react';
import { subAction, decreAction } from '../store/actionCreators';
import connect from '../utils/connect';

class About extends PureComponent {
  render() {
    return (
      <div>
        <h1>About2</h1>
        <h2>计数：{this.props.counter}</h2>
        <button onClick={e => this.decrement()}>-1</button>
        <button onClick={e => this.subNumber()}>-5</button>
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
    counter: state.counter
  }),
  dispatch => ({
    decreAction() {
      dispatch(decreAction());
    },
    subAction(num) {
      dispatch(subAction(num));
    }
  })
)(About);
```

有了connect函数，我们之后只需要关心从state和dispatch中映射自己需要的状态和行为即可。

### store的context处理

但是上面的connect函数有一个很大的缺陷：依赖导入的store

- 如果我们将其封装成一个独立的库，需要依赖用于创建的store，我们应该如何去获取呢？
- 难道让用户来修改我们的源码吗？不太现实；

正确的做法是我们提供一个Provider，Provider来自于我们创建的Context，让用户将store传入到value中即可；

```jsx
import React from 'react';

const StoreContext = React.createContext();

export {
  StoreContext
};
```

修改connect函数中class组件部分的代码：

- 注意下面我们将class组件的名称明确的定义出来，并且给它的`contextType`进行了赋值；
- 在组件内部用到store的地方，统一使用this.context代替（注意：constructor中直接使用第二个参数即可）

```jsx
import React from 'react';
import { StoreContext } from './context';

export default function connect(mapStateToProp, mapDispatchToProp) {
  return function enhanceHOC(WrapComponent) {
    class EnhanceComponent extends React.PureComponent {
      constructor(props, context) {
        super(props);

        this.state = {
          storeState: mapStateToProp(context.getState())
        };
      }

      componentDidMount() {
        this.unsubscribe = this.context.subscribe(() => {
          this.setState({
            storeState: mapStateToProp(this.context.getState())
          });
        })
      }

      componentWillUnmount() {
        this.unsubscribe();
      }

      render() {
        return <WrapComponent
          {...this.props}
          {...mapStateToProp(this.context.getState())}
          {...mapDispatchToProp(this.context.dispatch)}
        />
      }
    }

    EnhanceComponent.contextType = StoreContext;

    return EnhanceComponent;
  }
}
```

在入口的index.js中，使用Provider并且提供store即可：

```jsx
import { StoreContext } from './utils/context';
import store from './store';

ReactDOM.render(
  <StoreContext.Provider value={store}>
    <App />
  </StoreContext.Provider>,
  document.getElementById('root')
);
```

这样，我们通过Context将Store进行共享，实现connect对所有业务代码没有任何的依赖。可以在任何地方进行使用。

## react-redux使用

### 2.1. react-redux的使用

开始之前需要强调一下，redux和react没有直接的关系，你完全可以在React, Angular, Ember, jQuery, or vanilla JavaScript中使用Redux。

尽管这样说，redux依然是和React或者Deku的库结合的更好，因为他们是通过state函数来描述界面的状态，Redux可以发射状态的更新，让他们作出相应。

虽然我们之前已经实现了connect、Provider这些帮助我们完成连接redux、react的辅助工具，但是实际上redux官方帮助我们提供了 react-redux 的库，可以直接在项目中使用，并且实现的逻辑会更加的严谨和高效。

安装react-redux：

```jsx
yarn add react-redux
```

使用connect函数：

- 将之前使用的connect函数，换成react-redux的connect函数；

```jsx
import React, { PureComponent } from 'react';
import { connect } from "react-redux";

// import connect from '../utils/connect2';


export default connect(mapStateToProps, mapDispatchToProps)(Home);
```

使用Provider：

- 将之前自己创建的Context的Provider，换成react-redux的Provider组件：
- 注意：这里传入的是store属性，而不是value属性，其实本质上还是value，只是做了一层封装（待会儿可以在源码中查看）；

```jsx
import { Provider } from 'react-redux';

import store from './store';

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
```

### react-redux的源码

这里我简单带着大家看一下react-redux的源码。

首先，我们简单看一下Provider的源码：

- 使用了一个useMemo来返回一个contextValue的对象；

- - 这里使用useMemo的原因是为了进行性能的优化；
  - 在依赖的store不改变的情况下，不会进行重新计算，返回一个新的对象；

- 在下面的Context的Provider中就会将其赋值给value属性；

react-redux\src\components\Provider.js

```jsx
function Provider({ store, context, children }) {
  const contextValue = useMemo(() => {
    const subscription = new Subscription(store)
    subscription.onStateChange = subscription.notifyNestedSubs
    return {
      store,
      subscription,
    }
  }, [store])

  const previousState = useMemo(() => store.getState(), [store])

  useIsomorphicLayoutEffect(() => {
    const { subscription } = contextValue
    subscription.trySubscribe()

    if (previousState !== store.getState()) {
      subscription.notifyNestedSubs()
    }
    return () => {
      subscription.tryUnsubscribe()
      subscription.onStateChange = null
    }
  }, [contextValue, previousState])

  // ReactReduxContext从另外一个文件导入
  const Context = context || ReactReduxContext

  return <Context.Provider value={contextValue}>{children}</Context.Provider>
}
```

react-redux\src\components\Context.js

```jsx
import React from 'react'

export const ReactReduxContext = /*#__PURE__*/ React.createContext(null)

if (process.env.NODE_ENV !== 'production') {
  ReactReduxContext.displayName = 'ReactRedux'
}

export default ReactReduxContext
```

**connect函数的依赖比较复杂：**

调用createConnect来返回一个connect函数：

react-redux\src\connect\connect.js

```jsx
export function createConnect({
  connectHOC = connectAdvanced,
  mapStateToPropsFactories = defaultMapStateToPropsFactories,
  mapDispatchToPropsFactories = defaultMapDispatchToPropsFactories,
  mergePropsFactories = defaultMergePropsFactories,
  selectorFactory = defaultSelectorFactory,
} = {}) {
  return function connect(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps,
    {
      pure = true,
      areStatesEqual = strictEqual,
      areOwnPropsEqual = shallowEqual,
      areStatePropsEqual = shallowEqual,
      areMergedPropsEqual = shallowEqual,
      ...extraOptions
    } = {}
  ) {
    const initMapStateToProps = match(
      mapStateToProps,
      mapStateToPropsFactories,
      'mapStateToProps'
    )
    const initMapDispatchToProps = match(
      mapDispatchToProps,
      mapDispatchToPropsFactories,
      'mapDispatchToProps'
    )
    const initMergeProps = match(mergeProps, mergePropsFactories, 'mergeProps')

    // 最终调用connectHOC
    return connectHOC(selectorFactory, {
      // used in error messages
      methodName: 'connect',

      // used to compute Connect's displayName from the wrapped component's displayName.
      getDisplayName: (name) => `Connect(${name})`,

      // if mapStateToProps is falsy, the Connect component doesn't subscribe to store state changes
      shouldHandleStateChanges: Boolean(mapStateToProps),

      // passed through to selectorFactory
      initMapStateToProps,
      initMapDispatchToProps,
      initMergeProps,
      pure,
      areStatesEqual,
      areOwnPropsEqual,
      areStatePropsEqual,
      areMergedPropsEqual,

      // any extra options args can override defaults of connect or connectAdvanced
      ...extraOptions,
    })
  }
}

// connect是createConnect()的返回
export default /*#__PURE__*/ createConnect()
```

connect函数最终调用的是connectHOC：

- connectHOC其实是connectAdvanced的函数；
- connectAdvanced函数最终返回的是wrapWithConnect函数；

react-redux\src\components\connectAdvanced.js

```jsx
export default function connectAdvanced(..., ...) {
  ...
  const Context = context

  return function wrapWithConnect(WrappedComponent) {
  	...
    // If we're in "pure" mode, ensure our wrapper component only re-renders when incoming props have changed.
    const Connect = pure ? React.memo(ConnectFunction) : ConnectFunction

    Connect.WrappedComponent = WrappedComponent
    Connect.displayName = ConnectFunction.displayName = displayName

    if (forwardRef) {
      const forwarded = React.forwardRef(function forwardConnectRef(
        props,
        ref
      ) {
        return <Connect {...props} reactReduxForwardedRef={ref} />
      })

      forwarded.displayName = displayName
      forwarded.WrappedComponent = WrappedComponent
      return hoistStatics(forwarded, WrappedComponent)
    }

    return hoistStatics(Connect, WrappedComponent)
  }
}
```
