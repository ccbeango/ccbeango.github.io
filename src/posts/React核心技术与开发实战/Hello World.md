---
title: "Hello World"
date: "2020-12-21 23:01:30"
series:
  name: "React核心技术与开发实战"
  order: 1
tags:
  - "React核心技术与开发实战"
draft: false
---

## 什么是React

什么是React？React是用于构建用户界面的 JavaScript 库。

<!--more-->

React的特点：

- 声明式编程：它允许我们只需要维护自己的状态，当状态改变时，React可以根据最新的状态去渲染我们的UI界面；

![image-20201207224809023](https://cdn.jsdelivr.net/gh/ccbeango/blogImages/HTML+CSS/React%E6%A0%B8%E5%BF%83%E6%8A%80%E6%9C%AF%E4%B8%8E%E5%BC%80%E5%8F%91%E5%AE%9E%E8%B7%B501.png)

- 组件化开发：
  - 组件化开发页面目前是前端的流行趋势，通常会将复杂的界面拆分成一个个小的组件；
  - 如何合理的进行组件的划分和设计，是一个非常关键的问题；
- 多平台适配：
  - 2013年，React发布之初主要是开发Web页面；
  - 2015年，Facebook推出了ReactNative，用于开发移动端跨平台；
  - 2017年，Facebook推出ReactVR，用于开发虚拟现实Web应用程序；

## Hello World

演练：

- 在界面上有一个文本：Hello World
- 点击下方的一个按钮，点击后文本改变为Hello React

![image-20201208204439312](https://cdn.jsdelivr.net/gh/ccbeango/blogImages/HTML+CSS/React%E6%A0%B8%E5%BF%83%E6%8A%80%E6%9C%AF%E4%B8%8E%E5%BC%80%E5%8F%91%E5%AE%9E%E8%B7%B502.png)

### 使用原生JS实现

这种实现方法叫做**命令式编程**，每做一个操作，都是给计算机（浏览器）一个命令。

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <h2 class="title"></h2>
  <button class="btn">改变文本</button>
</body>
</html>

<script>
  // 1.定义数据
  let message = 'Hello World';

  // 2. 讲数据显示在h2中
  const titleEl = document.getElementsByClassName('title')[0];
  titleEl.innerHTML = message;

  // 3.点击按钮，页面的数据发生改变
  const btnEl = document.getElementsByClassName('btn')[0];
  btnEl.addEventListener('click', e => {
    message = 'Hello React';
    titleEl.innerHTML = message;
  });
</script>
```

### 使用React实现

#### React开发依赖

使用React实现必须依赖三个库：

- `react`：包含react所必须的核心代码
- `react-dom`：react渲染在不同平台所需要的核心代码
- `babel`：将jsx转换成React代码的工具

对于Vue来说，只需要依赖一个`vue.js`文件即可，但React需要三个依赖，原因是:三个库是各司其职的，目的就是让每一个库只单纯做自己的事情；在React的0.14版本之前是没有`react-dom`这个概念的，所有的功能都包含在`react`里。

为什么要进行拆分？原因就是因为`react-native`。`react`包中包含了`react`和`react-native`所共同拥有的核心代码。

`react-dom`针对web和native所完成的事情不同：

- web端：`react-dom`会将JSX最终渲染成真实DOM，显示在浏览器中
- native端：`react-dom`会将JSX最终渲染成原生的控件（如Android中的Button，IOS中的UIButton）

Babel是什么：

- 是目前前端使用非常广泛的编辑器、转移器。
- 比如当下很多浏览器并不支持ES6的语法，但是确实ES6的语法非常的简洁和方便，我们开发时希望使用它。
- 那么编写源码时我们就可以使用ES6来编写，之后通过Babel工具，将ES6转成大多数浏览器都支持的ES5的语法。

React和Babel的关系：

- 默认情况下开发React其实可以不使用`babel`，但是前提是我们自己使用 `React.createElement` 来编写源代码，它编写的代码非常的繁琐和可读性差。
- 那么就可以直接编写`jsx`（JavaScript XML）的语法，并且让babel帮助我们转换成`React.createElement`

在编写React代码时，这三个依赖是必不可少的。

依赖加载方式：

1. 直接CDN引入
2. 下载后，添加本地依赖
3. 通过npm管理

### 实现HelloWorld

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
<!-- 添加React的依赖 -->
<script src="https://unpkg.com/react@16/umd/react.development.js" crossorigin></script>
<script src="https://unpkg.com/react-dom@16/umd/react-dom.development.js" crossorigin></script>
<script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>

<script type="text/babel">
  let message = 'Hello World';
  ReactDOM.render(<h2>{message}</h2>, document.getElementById('app'));
</script>
```

上面代码中，有几个注意点：

1. 编写React的script代码中，必须添加`type="text/babel"`，作用是可以让`babel`解析`jsx`的语法
2. [`ReactDOM.render()`](https://zh-hans.reactjs.org/docs/react-dom.html#render)函数可以接收三个参数，前两个是必须的：
   - 参数一：传递要渲染的内容，这个内容可以是HTML元素，也可以是React的组件。这里传递的是一个`h2`元素。
   - 参数二：将渲染的内容，挂载到哪一个HTML元素上。这里挂在到了`div#app`上。
3. `crossorigin`属性，为了拿到跨域脚本的错误信息。可以将远程应用的js脚本的错误，在本地显示打印到控制台。默认情况下错误信息是不显示的。
4. 使用`{}`语法可以引入外部的变量或表达式。

### 点击按钮改变样式实现

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
<!-- 添加React的依赖 -->
<script src="https://unpkg.com/react@16/umd/react.development.js" crossorigin></script>
<script src="https://unpkg.com/react-dom@16/umd/react-dom.development.js" crossorigin></script>
<script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>

<script type="text/babel">
  let message = 'Hello World';

  render();

  function btnClick() {
    message = 'Hello React';
    render();
  }

  function render() {
    ReactDOM.render(
      <div>
        <h2>{message}</h2>
        <button onClick={btnClick}>改变文本</button>
      </div>,
      document.getElementById('app'));
  }
</script>
```

上面的代码，实现了React与原生一样的功能。首先第一次加载时，调用`render()`进行渲染；点击按钮时，改变`message`消息，然后再次调用`render()`进行渲染。

虽然上面已经实现了功能，但是看起来会很乱。

整个逻辑其实可以看做一个整体，那么就可以将其封装成一个组件，使用组件实现会更清晰：

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
<!-- 添加React的依赖 -->
<script src="https://unpkg.com/react@16/umd/react.development.js" crossorigin></script>
<script src="https://unpkg.com/react-dom@16/umd/react-dom.development.js" crossorigin></script>
<script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>

<script type="text/babel">
  // 封装APP组件
  class App extends React.Component {
    constructor() {
      super();

      // 直接定义在this上的数据是没有被监听的
      // this.message = 'Hello World';

      this.state = {
        message: 'Hello World'
      };
    }

    btnClick() {
      // 直接修改无法被监听
      // this.message = 'Hello React';
      // 直接修改state，监听到，但没有通知再次渲染
      // this.state.message = 'Hello React'
      // 修改，通知渲染
      this.setState({
        message: 'Hello React'
      });
    }

    render() {
      return (
        <div>
          <h2>{this.message}</h2>
          <button onClick={this.btnClick.bind(this)}>改变文本</button>
        </div>
      );
    }
  }

  // 渲染App组件
  ReactDOM.render(<App />,
    document.getElementById('app')
  );
</script>
```

上面代码将这个功能封装在组件中，使用类封装成一个组件：

- 定义一个类（类名大写，组件的名称是必须大写的，小写会被认为是HTML元素），继承自`React.Component`
- 实现当前组件的`render`函数，`render`当中返回的`jsx`内容，之后`React`会自动渲染内容
