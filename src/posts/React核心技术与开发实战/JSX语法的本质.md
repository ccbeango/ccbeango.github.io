---
title: "JSX语法的本质"
date: "2020-12-23 15:16:01"
series:
  name: "React核心技术与开发实战"
  order: 3
tags:
  - "React核心技术与开发实战"
draft: false
---

> https://zh-hans.reactjs.org/docs/react-api.html#createelement
>
> https://zh-hans.reactjs.org/docs/react-without-jsx.html

## 使用createElement实现HelloWorld

实际上，`JSX`仅仅只是`React.createElement(component, props, ...children)` 函数的语法糖。所有的`JSX`最终都会被转换成`React.createElement`的函数调用。

此时就不再需要设置`<script type="text/babel">`，也不再需要引入`babel`的相关依赖

<!--more-->

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>

<body>
  <div id="app">app</div>
</body>

</html>

<script src="https://unpkg.com/react@17/umd/react.development.js" crossorigin></script>
<script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js" crossorigin></script>
<!-- <script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script> -->

<!-- <script type="text/babel"> -->
<script>
  const message = (props) => React.createElement('h2', null, `Hello ${props.toWhat}`);

  ReactDOM.render(
    React.createElement(message, { toWhat: 'World' }, null),
    document.getElementById('app')
  );
</script>
```

## React.createElement简析

`React.createElement`的源码位置在`packages/react`下：

- `packages/react/src/index.js`中对外重新导出暴露`createElement`方法

  ```js
  ...
  // Export all exports so that they're available in tests.
  // We can't use export * from in Flow for some reason.
  export {
   	...
    createElement,
    cloneElement,
    isValidElement,
   	...
  }
  ```

- `packages/react/src/React.js` 导出`createElement`

  ```js
  import {
    createElementWithValidation,
    createFactoryWithValidation,
    cloneElementWithValidation,
  } from './ReactElementValidator';
  ...
  // TODO: Move this branching into the other module instead and just re-export.
  const createElement = __DEV__ ? createElementWithValidation : createElementProd;

  export {
    ...
    createElement,
    cloneElement,
    isValidElement,
    ...
  }
  ```

- `packages/react/src/ReactElement.js`中的`createElement`是具体的实现，生产模式下会直接调用此方法

  ```js
  ...

  /**
   * Create and return a new ReactElement of the given type.
   * See https://reactjs.org/docs/react-api.html#createelement
   */
  export function createElement(type, config, children) {
    ...
     return ReactElement(
      type,
      key,
      ref,
      self,
      source,
      ReactCurrentOwner.current,
      props,
    );
  }
  ```

- `packages/react/src/ReactElementValidator.js`中导出`createElementWithValidation`，开发模式下会首先调用此方法进行一系列验证，并在出现错误时给出一些提示，然后也会调用第二条中的`createElement`方法

  ```js
  import {
    isValidElement,
    createElement,
    cloneElement,
    jsxDEV,
  } from './ReactElement';
  ...

  export function createElementWithValidation(type, props, children) {
    ...
    const element = createElement.apply(this, arguments);
  	...

    return element;
  }
  ```

注：基于React v17.0.1代码。

函数React.createElement签名如下：

```js
React.createElement(
  type,
  config,
  children
)
```

- `type`：当前`ReactElement`类型
  - 如果是标签元素，那么就使用标签名字符串表示，如`div`
  - 如果是组件元素，那么就直接使用组件的名称
- `config`：所有jsx中的属性都在config中以对象的属性和值的形式存储
- `children`：
  - 存放在标签中的内容，以children数组的方式进行存储；
  - 如果是多个元素，React内部有对它们进行处理

## JSX的babel转换

React中使用`JSX`实现的代码，都依赖`babel`进行转换，可以在[babel官网](https://babeljs.io/repl/#?presets=react)快速查看转换过程。

```jsx
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>

<body>
  <div id="app">app</div>
  <div id="app2">app</div>
</body>

</html>

<script src="https://unpkg.com/react@17/umd/react.development.js" crossorigin></script>
<script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js" crossorigin></script>
<script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>

<script type="text/babel">
  const Message = () => {
    return (
      <div>
        <div className="header">
          <h1 title="标题">我是标题</h1>
        </div>
        <div className="content">
          <h2>我是页面内容</h2>
          <button>按钮</button>
        </div>
        <div className="footer">
          <p>我是尾部的内容</p>
        </div>
      </div>
    )
  };

  // 渲染App组件
  ReactDOM.render(<Message />, document.getElementById('app'));


  /*#__PURE__*/
  const message2 = React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "header"
  }, /*#__PURE__*/React.createElement("h1", {
    title: "\u6807\u9898"
  }, "\u6211\u662F\u6807\u9898")), /*#__PURE__*/React.createElement("div", {
    className: "content"
  }, /*#__PURE__*/React.createElement("h2", null, "\u6211\u662F\u9875\u9762\u5185\u5BB9"), /*#__PURE__*/React.createElement("button", null, "\u6309\u94AE")), /*#__PURE__*/React.createElement("div", {
    className: "footer"
  }, /*#__PURE__*/React.createElement("p", null, "\u6211\u662F\u5C3E\u90E8\u7684\u5185\u5BB9")));

  ReactDOM.render(message2, document.getElementById('app2'));
</script><!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>

<body>
  <div id="app">app</div>
  <div id="app2">app</div>
</body>

</html>

<script src="https://unpkg.com/react@17/umd/react.development.js" crossorigin></script>
<script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js" crossorigin></script>
<script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>

<script type="text/babel">
  const Message = () => {
    return (
      <div>
        <div className="header">
          <h1 title="标题">我是标题</h1>
        </div>
        <div className="content">
          <h2>我是页面内容</h2>
          <button>按钮</button>
        </div>
        <div className="footer">
          <p>我是尾部的内容</p>
        </div>
      </div>
    )
  };

  // 渲染App组件
  ReactDOM.render(<Message />, document.getElementById('app'));

  const message2 = /*#__PURE__*/ React.createElement(
    "div",
    null,
  /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "header"
      },
    /*#__PURE__*/ React.createElement(
        "h1",
        {
          title: "\u6807\u9898"
        },
        "\u6211\u662F\u6807\u9898"
      )
    ),
  /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "content"
      },
    /*#__PURE__*/ React.createElement(
        "h2",
        null,
        "\u6211\u662F\u9875\u9762\u5185\u5BB9"
      ),
    /*#__PURE__*/ React.createElement("button", null, "\u6309\u94AE")
    ),
  /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "footer"
      },
    /*#__PURE__*/ React.createElement(
        "p",
        null,
        "\u6211\u662F\u5C3E\u90E8\u7684\u5185\u5BB9"
      )
    )
  );

  ReactDOM.render(message2, document.getElementById('app2'));
</script>
```

将`Message`中的`JSX`代码粘贴到官网，转换后得到`message2`，其也可以正常渲染。实际上，React中的JSX就是这样转换并最终渲染的。

## 虚拟DOM的创建过程

从上面的简析我们知道，通过`React.createElement`最终创建出来一个`ReactElement`对象。

```js
/**
 * Create and return a new ReactElement of the given type.
 * See https://reactjs.org/docs/react-api.html#createelement
 */
export function createElement(type, config, children) {
  ...
   return ReactElement(
    type,
    key,
    ref,
    self,
    source,
    ReactCurrentOwner.current,
    props,
  );
}
```

这个`ReactElement`对象是什么作用呢？React为什么要创建它呢？

原因是React利用`ReactElement`对象组成了一个JavaScript的对象树；JavaScript的对象树就是虚拟DOM（Virtual DOM）；

查看`ReactElement`树结构，直接将`message`的结果打印到控制台就可以查看这个对象树：

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>

<body>
  <div id="app">app</div>
</body>

</html>

<script src="https://unpkg.com/react@17/umd/react.development.js" crossorigin></script>
<script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js" crossorigin></script>

<script>
  const message = /*#__PURE__*/ React.createElement(
    "div",
    null,
  /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "header"
      },
    /*#__PURE__*/ React.createElement(
        "h1",
        {
          title: "\u6807\u9898"
        },
        "\u6211\u662F\u6807\u9898"
      )
    ),
  /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "content"
      },
    /*#__PURE__*/ React.createElement(
        "h2",
        null,
        "\u6211\u662F\u9875\u9762\u5185\u5BB9"
      ),
    /*#__PURE__*/ React.createElement("button", null, "\u6309\u94AE")
    ),
  /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "footer"
      },
    /*#__PURE__*/ React.createElement(
        "p",
        null,
        "\u6211\u662F\u5C3E\u90E8\u7684\u5185\u5BB9"
      )
    )
  );

  console.log(message);

  ReactDOM.render(message, document.getElementById('app'));
</script>
```

![image-20201222202554030](https://cdn.jsdelivr.net/gh/ccbeango/blogImages/HTML+CSS/React%E6%A0%B8%E5%BF%83%E6%8A%80%E6%9C%AF%E4%B8%8E%E5%BC%80%E5%8F%91%E5%AE%9E%E8%B7%B503.png)

这个对象就是我们常说虚拟DOM。**其实直接打印JSX得到的结果也是一样的，只是多了一个babel转换的过程。**如下：

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>

<body>
  <div id="app">app</div>
  <div id="app2">app</div>
</body>

</html>

<script src="https://unpkg.com/react@17/umd/react.development.js" crossorigin></script>
<script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js" crossorigin></script>
<script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>

<script type="text/babel">
  const Message = () => {
  	// JSX -> createElement函数 -> ReactElement （对象树）-> ReactDOM.render -> 真实DOM
    const elementObj = (
      <div>
        <div className="header">
          <h1 title="标题">我是标题</h1>
        </div>
        <div className="content">
          <h2>我是页面内容</h2>
          <button>按钮</button>
        </div>
        <div className="footer">
          <p>我是尾部的内容</p>
        </div>
      </div>
    );

    console.log(elementObj);

    return elementObj;
  };

  // 渲染App组件
  ReactDOM.render(<Message />, document.getElementById('app'));

</script>
```

![image-20201222204142149](https://cdn.jsdelivr.net/gh/ccbeango/blogImages/HTML+CSS/React%E6%A0%B8%E5%BF%83%E6%8A%80%E6%9C%AF%E4%B8%8E%E5%BC%80%E5%8F%91%E5%AE%9E%E8%B7%B504.png)

如上图，最右侧的对象和我们所写的JSX内层结果都有三个。如果我们继续一层层地展开，就会发现，两边刚好是一一对应的关系。而这个就是JS实现的树结构，即虚拟DOM。

此时，调用`ReactDOM.render`就会把虚拟DOM给映射到`div#app`中，即建立起虚拟DOM和真实DOM的对应关系，将虚拟DOM映射到真实DOM上。

**总结，`JSX`本质是`createElement`函数，`createElement`帮助我们创建`ReactElement`对象树，它是一个JavaScript对象，也就是我们常说的虚拟DOM，最后`ReactDOM.render`将虚拟DOM映射到浏览器中的真实DOM上。**

## 采用虚拟DOM的原因

为什么要采用虚拟DOM，而不是直接修改真实的DOM呢？

- 很难跟踪状态发生的改变：原有的开发模式，我们很难跟踪到状态发生的改变，不方便针对我们应用程序进行调试；
- 操作真实DOM性能较低：传统的开发模式会进行频繁的DOM操作，而这一的做法性能非常的低；
  - 首先，`document.createElement`本身创建出来的就是一个非常复杂的[对象](https://developer.mozilla.org/zh-CN/docs/Web/API/Document/createElement)；
  - 其次，DOM操作会引起浏览器的[回流和重绘](https://juejin.cn/post/6844903862919233544)，所以在开发中应该避免频繁的DOM操作；

这边有个例子

比如我们有一组数组需要渲染：[0, 1, 2, 3, 4]，我们会怎么做呢？

```html
<ul>
  <li>0</li>
  <li>1</li>
  <li>2</li>
  <li>3</li>
  <li>4</li>
</ul>
```

后来，我们又增加了5条数据：[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]。那么我们在JS中可能会这样实现

```js
for (var i=5; i<10; i++) {
  var li = document.createElement("li");
  li.innerHTML = arr[i];
  ul.appendChild(li);
}
```

但是上面这段代码的性能非常低效：

- 因为我们通过 `document.createElement` 创建元素，再通过 `ul.appendChild(li)` 渲染到DOM上，进行了多次DOM操作；
- 对于批量操作的，最好的办法不是一次次修改DOM，而是对批量的操作进行合并；（比如可以通过`DocumentFragment`进行合并）；

那么，虚拟DOM可以帮助我们做类似于`DocumentFragment`的工作，减少DOM操作，同时，虚拟DOM帮助我们从命令式编程转到了声明式编程的模式。

React官方的说法：Virtual DOM 是一种编程理念。

> https://zh-hans.reactjs.org/docs/faq-internals.html

在这个理念中，UI以一种理想化或者说虚拟化的方式保存在内存中，并且它是一个相对简单的JavaScript对象，我们可以通过`ReactDOM.render`让 `虚拟DOM` 和 `真实DOM`同步起来，这个过程中叫做[协调（Reconciliation）](https://zh-hans.reactjs.org/docs/reconciliation.html)；

这种编程的方式赋予了React声明式的API：你只需要告诉React希望让UI是什么状态，React来确保DOM和这些状态是匹配的。你不需要直接进行DOM操作，就可以从手动更改DOM、属性操作、事件处理中解放出来。

购买书籍的购物车例子：

```jsx
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>

  <style>
    table {
      border: 1px solid #eee;
      border-collapse: collapse;
    }

    th,
    td {
      border: 1px solid #eee;
      padding: 10px 16px;
      text-align: center;
    }

    th {
      background: #aaa;
    }

    .count {
      margin: 0 5px;
    }
  </style>
</head>

<body>
  <div id="app">app</div>
</body>

</html>

<script src="https://unpkg.com/react@17/umd/react.development.js" crossorigin></script>
<script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js" crossorigin></script>
<script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>

<script type="text/babel">
  class App extends React.Component {
    constructor() {
      super();

      this.state = {
        books: [
          {
            id: 1,
            name: '《算法导论》',
            date: '2006-9',
            price: 85.00,
            count: 1
          },
          {
            id: 2,
            name: '《UNIX编程艺术》',
            date: '2006-2',
            price: 59.00,
            count: 1
          },
          {
            id: 3,
            name: '《编程珠玑》',
            date: '2008-10',
            price: 39.00,
            count: 1
          },
          {
            id: 4,
            name: '《代码大全》',
            date: '2006-3',
            price: 128.00,
            count: 1
          },
        ]
      }
    }

    formatPrice(price) {
      if (typeof price !== "number") {
        price = Number("aaa") || 0;
      }

      return "¥" + price.toFixed(2);
    }

    changeBookCount(index, num) {
      // React中设计原则: state中的数据的不可变性;
      const newBooks = [...this.state.books];
      newBooks[index].count += num;

      this.setState({
        books: newBooks
      });
    }

    removeBook(index) {
      this.setState({
        books: this.state.books.filter((item, indey) => index != indey)
      })
    }

    renderEmptyTip() {
      return <h2>购物车为空~</h2>
    }

    renderBooks() {
      return (
        <div>
          <table>
            <thead>
              <tr>
                <th></th>
                <th>书籍名称</th>
                <th>出版日期</th>
                <th>价格</th>
                <th>购买数量</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {
                this.state.books.map((item, index) => {
                  return (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.name}</td>
                      <td>{item.date}</td>
                      <td>{this.formatPrice(item.price)}</td>
                      <td>
                        <button disabled={item.count <= 1} onClick={e => this.changeBookCount(index, -1)}>-</button>
                        <span className="count">{item.count}</span>
                        <button onClick={e => this.changeBookCount(index, 1)}>+</button>
                      </td>
                      <td><button onClick={() => this.removeBook(index)}>移除</button></td>
                    </tr>
                  )
                })
              }

            </tbody>
          </table>
          <h2>总价格：￥{this.state.books.reduce((total, item) => total + item.price * item.count, 0)}</h2>
        </div>
      );
    }


    render() {
      return this.state.books.length ? this.renderBooks() : this.renderEmptyTip();
    }
  }

  // 渲染App组件
  ReactDOM.render(<App />, document.getElementById('app'));
</script>
```
