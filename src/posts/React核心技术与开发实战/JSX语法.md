---
title: "JSX语法"
date: "2020-12-22 22:43:30"
series:
  name: "React核心技术与开发实战"
  order: 2
tags:
  - "React核心技术与开发实战"
draft: false
---

本节记录JSX语法相关内容。

<!--more-->

## JSX核心语法

### 认识JSX

```jsx
<script type="text/babel">
	const element = <h2>Hello world</h2>
	ReactDOM.render(element, document.getElementById('app'));
</script>
```

这段element变量的声明右侧赋值的标签语法，它不是一段字符串（因为没有使用引号包裹），它看起来是一段`HTML`原生，但是我们能在`JS`中直接给一个变量赋值`html`吗？其实是不可以的，如果去掉`type="text/babel"` 去除掉，那么就会出现语法错误；它其实就是JSX语法。

#### JSX是什么

- JSX是一种JavaScript的语法扩展（eXtension），也在很多地方称之为JavaScript XML，因为看起就是一段XML语法；
- 它用于描述我们的UI界面，并且其完成可以和JavaScript融合在一起使用；
- 它不同于Vue中的模块语法，不需要专门学习模块语法中的一些指令（比如v-for、v-if、v-else、v-bind）；Vue也支持JSX语法。

#### 为什么React选择了JSX？

React 认为渲染逻辑本质上与其他 UI 逻辑内在耦合。

- 比如UI需要绑定事件（button、a原生等等）；
- 比如UI中需要展示数据状态，在某些状态发生改变时，又需要改变UI；
- 他们之间是密不可分，所以React没有讲标记分离到不同的文件中，而是将它们组合到了一起，这个地方就是组件。

#### JSX的书写规范

1. JSX的顶层只能有一个根元素，所以很多时候会在外层包裹一个`div`原生（或者使用`Fragment`）
2. 为了方便阅读，通常会在JSX的外层包裹一个小括号`()`，这样可以方便阅读，并且`JSX`可以进行换行书写；
3. JSX中的标签可以是单标签，也可以是双标签；

### JSX的使用

#### JSX注释

```jsx
{/* 我是一个注释 */}
```

#### JSX嵌入变量

JSX嵌入变量：

- 当变量是`Number`、`String`、`Array`类型时，可以直接显示
- 当变量是`null`、`undefined`、`Boolean`类型时，内容为空
  - 如果希望可以显示`null`、`undefined`、`Boolean`，那么需要转成字符串；
  - 转换的方式有很多，比如`toString()`方法、和空字符串拼接，`String(变量)`等方式；
- 对象类型不能作为子元素（`not valid as a React child`）

```jsx
 <!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>

<body>
  <div id="app"></div>
</body>

</html>

<script crossorigin src="https://unpkg.com/react@17/umd/react.development.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>

<script type="text/babel">
  class App extends React.Component {
    constructor() {
      super();

      this.state = {
        name: 'ccbean',
        age: 18,
        hobby: [ '唱跳', 'rap', '篮球'],

        test1: null, // null
        test2: undefined, // undefined
        test3: true, // Boolean

        // 对象不能作为jsx的子类
        friend: {
          name: 'tom',
          age: 18
        }

      };
    }

    render() {
      return (
        <div>
          <h2>{this.state.name}</h2>
          <h2>{this.state.age}</h2>
          <h2>{this.state.hobby}</h2>

          {/* 没有任何显示 */}
          <h2>{this.state.test1}</h2>
          <h2>{this.state.test2}</h2>
          <h2>{this.state.test3}</h2>

          {/* 转为字符串显示 */}
          <h2>{String(this.state.test1)}</h2>
          <h2>{this.state.test2 + ''}</h2>
          <h2>{this.state.test3.toString()}</h2>

          {/* 报错  Objects are not valid as a React child... */}
          {/* <h2>{this.state.friend}</h2> */}
        </div>
      );
    }
  }

  // 渲染App组件
  ReactDOM.render(<App />, document.getElementById('app'));
</script>
```

#### JSX嵌入表达式

嵌入表达式可以是：

- 运算表达式
- 三元运算符
- 执行一个函数
- 总之js中常用的表达式

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
</body>

</html>

<script crossorigin src="https://unpkg.com/react@17/umd/react.development.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>

<script type="text/babel">
  class App extends React.Component {
    constructor() {
      super();

      this.state = {
        firstname: 'ccbean',
        lastname: 'go',

        isLogin: false,
      };
    }

    getFullname() {
      return `${this.state.firstname} ${this.state.lastname}`
    }

    render() {
      const { firstname, lastname } = this.state;
      return (
        <div>
          {/* 运算符表达式 */}
          <h2>{`${firstname} ${lastname}`}</h2>
          <h2>{2 * 10}</h2>

          {/* 三元运算符 */}
          <h2>{this.state.isLogin ? '欢迎回来' : '请登录'}</h2>

          {/* 进行函数调用 */}
          <h2>{this.getFullname()}</h2>
        </div>
      );
    }
  }

  // 渲染App组件
  ReactDOM.render(<App />, document.getElementById('app'));
</script>
```

#### JSX属性绑定

HTML中元素属性是不可或缺的，在JSX中设置其属性与原生的HTML大致相同：

- 如元素都会有`title`属性 `<h2 title={this.state.title}>Hello World</h2>`

- 如`img`元素会有`src`属性 `<img src={this.getImageSize(this.state.imgUrl, 100)} alt="" />`

- 如`a`元素会有`href`属性 `<a href={this.state.blogUrl} target="_blank">我的博客</a>`

- 如元素需要绑定`class`属性 `<div className="box title">我是一个div</div>`
  - 在这里`class`也是`JS`中的关键字，不能直接使用，要用`className`代替。
  - 类似的还有HTML中的`for`，要使用`htmlFor`代替 `<label htmlFor="name">名字</label>`

- 如原生使用内联样式`style`

  ```jsx
  <div style={{ color: 'red', fontSize: '30px' }}>我是绑定style属性的div</div>
  ```

  - 要注意这边是两个大括号，外层大括号是JSX语法，内层标识设置的内联样式是一个对象。

下面是完整的示例：

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
</body>

</html>

<script crossorigin src="https://unpkg.com/react@17/umd/react.development.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>

<script type="text/babel">
  class App extends React.Component {
    constructor() {
      super();

      this.state = {
        title: '标题',
        imgUrl: 'http://p3.music.126.net/FHK7HOXGRM69u9J8wiU4ZQ==/109951165549520393.jpg',
        blogUrl: 'https://ccbeango.github.io/',
        active: true
      };
    }

    getImageSize(imageUrl, size) {
      return `${imageUrl}?param=${size}y${size}`;
    }

    render() {
      return (
        <div>
          {/* 绑定普通属性 */}
          <h2 title={this.state.title}>Hello World</h2>
          <img src={this.getImageSize(this.state.imgUrl, 100)} alt="" />
          <img src={this.getImageSize(this.state.imgUrl, 200)} alt="" />
          <a href={this.state.blogUrl} target="_blank">我的博客</a>

          {/* 绑定class属性 */}
          <div className={"box title " + this.state.active ? 'active' : ''}>我是一个div</div>
          <label htmlFor="name">名字</label>

          {/* 绑定style属性 */}
          <div style={{ color: 'red', fontSize: '30px' }}>我是绑定style属性的div</div>
        </div>
      );
    }
  }

  // 渲染App组件
  ReactDOM.render(<App />, document.getElementById('app'));
</script>
```

#### JSX事件绑定

React 事件的命名采用小驼峰式（camelCase），而不是纯小写；并且需要通过{}传入一个事件处理函数，这个函数会在事件发生时被执行；

这里需要注意的是：事件绑定时，需要指定`this`，否则当事件触发时，无法正确调用绑定函数，因为绑定的方法并不是我们主动调用的，是被React内部调用的，在被React调用时，React内部是无法获知该方法来自哪里，需要我们自行指定。

解决绑定`this`的方法：

- 方法一：使用`bind()`函数显示绑定`this`
- 方法二：使用`ES6`的`class fields`语法
- 方法三：事件监听时传入箭头函数

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
</body>

</html>

<script crossorigin src="https://unpkg.com/react@17/umd/react.development.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>

<script type="text/babel">
  class App extends React.Component {
    constructor() {
      super();

      this.state = {

      };
    }

    clickButton() {
      console.log('按钮1 2 4', this);
    }

    clickButton3 = () => {
      console.log('按钮3',this);
    }

    render() {
      return (
        <div>
          {/* 无法获取this */}
          <button onClick={this.clickButton}>按钮1</button>
          {/* 方法一：bind()显示绑定 通常会在构造函数中绑定 */}
          <button onClick={this.clickButton.bind(this)}>按钮2</button>
          {/* 方法二：使用class field语法 */}
          <button onClick={this.clickButton3}>按钮3</button>
          {/* 方法三：箭头函数 */}
          <button onClick={() => this.clickButton()}>按钮4</button>
        </div>
      );
    }
  }

  // 渲染App组件
  ReactDOM.render(<App />, document.getElementById('app'));
</script>
```

事件绑定的参数传递

在执行事件函数时，有可能我们需要获取一些参数信息：

- 比如event对象：默认情况下，React会默认传递事件对象到绑定的函数中；
- 有更多参数时，最好的方式就是传入一个箭头函数，主动执行的事件函数，并且传入相关的其他参数；

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
</body>

</html>

<script crossorigin src="https://unpkg.com/react@17/umd/react.development.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>

<script type="text/babel">
  class App extends React.Component {
    constructor() {
      super();

      this.state = {
        movies: ['大话西游', '美人鱼', '夏洛特烦恼', '西红柿首富']
      };
    }

    clickButton(e) {
      console.log(this, e);
    }

    clickLi(item, index, e) {
      console.log(item, index, e);
    }

    render() {
      return (
        <div>
          {/* 默认情况下React会传递事件对象event到clickButton */}
          <button onClick={this.clickButton.bind(this)}>按钮</button>
          <ul>
            {/* 自行传递参数和事件对象 */}
            {this.state.movies.map((item, index) =>
              <li key={index} onClick={(e) => this.clickLi(item, index, e)}>
                {item}
              </li>
            )}
          </ul>
        </div>
      );
    }
  }

  // 渲染App组件
  ReactDOM.render(<App />, document.getElementById('app'));
</script>
```

#### JSX条件渲染

在开发中我们经常会遇到，界面的内容要根据不同的情况显示不同的内容，或者决定是否渲染某部分内容：

- 在Vue中，可以通过指令来实现，如`v-show`、`v-if`
- 在React中，所有的判断都和普通的JS一致，常见的渲染方式有：
  - 条件判断语句
  - 三元运算符
  - 与运算符`&&`
  - 控制`display`属性是否是`none`

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
</body>

</html>

<script crossorigin src="https://unpkg.com/react@17/umd/react.development.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>

<script type="text/babel">
  class App extends React.Component {
    constructor() {
      super();

      this.state = {
        isLogin: false
      };
    }

    clickButton(e) {
      this.setState({
        isLogin: !this.state.isLogin
      });
    }

    render() {
      // 通过if判断
      let welcome = null;
      if(this.state.isLogin) {
        welcome = <h2>欢迎回来</h2>
      } else {
        welcome = <h2>请登录</h2>
      }

      return (
        <div>
          {welcome}
          {/* 通过三元运算符 */}
          <button onClick={e => this.clickButton(e)}>{this.state.isLogin ? '退出' : '登录'}</button>
          {/* 通过逻辑与 */}
          <h3>{ this.state.isLogin && '你好' }</h3>
          {/* 控制display是否为none */}
          <h3 style={{ display: this.state.isLogin ? 'block' : 'none' }}>我是页面内容</h3>
        </div>
      );
    }
  }

  // 渲染App组件
  ReactDOM.render(<App />, document.getElementById('app'));
</script>
```

#### JSX列表渲染

在React中，列表渲染，一般会使用JS的函数实现：

- JS中如何处理列表，在JSX中都是适用的，如使用`map()`、`filter()`、`slice()`等；

列表渲染的`key`：

- `key`帮助 React 识别哪些元素改变了，比如被添加或删除。因此你应当给数组中的每一个元素赋予一个确定的标识。
- 一个元素的`key `最好是这个元素在列表中拥有的一个独一无二的字符串。通常，我们使用数据中的`id`来作为元素的 `key`
- 如果列表项目的顺序可能会变化，不建议使用索引来用作`key`值，因为这样做会导致性能变差，还可能引起组件状态的问题。

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
</body>

</html>

<script crossorigin src="https://unpkg.com/react@17/umd/react.development.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>

<script type="text/babel">
  class App extends React.Component {
    constructor() {
      super();

      this.state = {
        movies: ['大话西游', '美人鱼', '夏洛特烦恼', '西红柿首富'],
        numbers: [1, 2, 14, 11, 9, 22, 3, 12],
      };
    }

    clickButton(e) {
      console.log(this, e);
    }

    clickLi(item, index, e) {
      console.log(item, index, e);
    }

    render() {
      return (
        <div>
          <h2>电影列表</h2>
          <ul>
            {this.state.movies.map((item, index) =>
              <li key={index} onClick={(e) => this.clickLi(item, index, e)}>
                {item}
              </li>
            )}
          </ul>
          <h2>前三个电影</h2>
          <ul>
            {this.state.movies.slice(0, 3).map((item, index) =>
              <li key={index} onClick={(e) => this.clickLi(item, index, e)}>
                {item}
              </li>
            )}
          </ul>
          <h2>大于10的数据</h2>
          <ul>
            {this.state.numbers.filter(item => item > 10).map((item, index) =>
              <li key={index}>
                {item}
              </li>
            )}
          </ul>
        </div>
      );
    }
  }

  // 渲染App组件
  ReactDOM.render(<App />, document.getElementById('app'));
</script>
```
