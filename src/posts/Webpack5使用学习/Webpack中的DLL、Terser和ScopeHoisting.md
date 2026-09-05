---
title: "Webpack中的DLL、Terser和ScopeHoisting"
date: "2022-06-08 22:41:43"
series:
  name: "Webpack5使用学习"
  order: 9
tags:
  - "Webpack5使用学习"
draft: false
---

## DLL

### 认识DLL

DLL全称是动态链接库（Dynamic Link Library），是软件在Windows中实现共享函数库的一种实现方式；这是DLL名称的由来。

webpack中也有内置DLL的功能，可以实现JS代码的共享，将不经常改变的代码进行单独的编译，抽取成一个共享的库；

之后在项目编译时，就不需要再编译这部分公共共享代码。

如项目中用到了React、ReactDOM，那么就可以把它们编译成一个DLL库，之后只需要引用使用就可以，不需要每次都进行编译。

DLL库的使用分为两步:

1. 打包一个DLL库
2. 项目中引入DLL库

要注意的是，在升级到webpack4之后，React和Vue脚手架都移除了DLL库，Vue作者解释如下：

> https://github.com/vuejs/vue-cli/issues/1205
>
> `dll` option will be removed. Webpack 4 should provide good enough perf and the cost of maintaining DLL mode inside Vue CLI is no longer justified.

### 打包一个DLL库

在Webpack中可使用[DllPlugin](https://webpack.docschina.org/plugins/dll-plugin/#dllplugin)打包一个DLL库。

此插件用于在单独的 webpack 配置中创建一个 dll-only-bundle。 此插件会生成一个名为 `manifest.json` 的文件，这个文件中包含了从 require 和 import 中 request 到模块 id 的映射。

`manifest.json` 文件是用于让 [`DllReferencePlugin`](https://webpack.docschina.org/plugins/dll-plugin/#dllreferenceplugin) 能够映射到相应的依赖上。

此插件与 [`output.library`](https://webpack.docschina.org/configuration/output/#outputlibrary) 的选项相结合可以暴露出（也称为放入全局作用域）dll 函数。

这里我们使用React做相关测试，将`react`、`react-dom`打包到一个DLL库中。

配置如下：

```js {8,13,24-27}
const path = require('path')
const webpack = require('webpack')
const TerserPlguin = require('terser-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  entry: {
    react: ['react', 'react-dom']
  },
  output: {
    path: path.resolve(__dirname, './dll'),
    filename: 'dll_[name].js',
    library: 'dll_[name]'
  },
  optimization: {
    minimizer: [
      new TerserPlguin({
        extractComments: false
      })
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.DllPlugin({
      name: 'dll_[name]',
      path: path.resolve(__dirname, './dll/[name].manifest.json')
    })
  ]
}
```

- entry中配置`react: ['react', 'react-dom']`，两个包为入口文件
- output中配置`library: 'dll_[name]'`，将入口文件导出的模块与`dll_[name]`进行绑定，打包库时，常用`library`配置，详见[output.library](https://webpack.docschina.org/configuration/output/#outputlibrary)
- 使用插件`new webpack.DllPlugin({...})`，options中设置了`name`和`path`
  - `name` 表示暴露出的 DLL 的函数名，这里是`dll_[name]`，与output.library保持相同，可以暴露出dll 函数，也就是将dll函数放入全局作用域。此处在全局作用域中可通过`dll_[name]`访问到暴露出来的模块。
  - `path`表示manifest.json 输出文件的 **绝对路径**

这里使用了`new CleanWebpackPlugin()`插件而不是使用`output.clean`，原因是测试中发现使用后者会出现没有生成`manifest.json`文件的情况。

执行`npm run build`可看到在dll目录中生成`dll.react.js`和`react.manifest.json`。

在`dll_react.js`中可看到我们配置的`output.library`和DllPlugin插件的`name`结合暴露在全局作用域中的变量：

```js
var dll_react;
(()=>{var e={448:(e,n,t)=>{"use strict";
  // ...
  dll_react = t;
})();
```

注意，此时，变量`dll_react`只与入口文件所导出的`react-dom`绑定。

### 使用一个DLL库

[DllReferencePlugin](https://webpack.docschina.org/plugins/dll-plugin/#dllreferenceplugin)插件可以通过`manifest.json`将DLL库映射到需要使用的项目中。

这里我们使用上面生成的React的DLL库。

如果使用了`react`和`react-dom`，使用了splitChunks的情况下，可以打包到一个独立的chunk中。

但是现在我们有了`dll_react.js`，不再需要单独去打包它们，可以直接去引用dll_react即可，需要两步：

1. 通过DllReferencePlugin插件告知要使用的DLL库；
2. 通过[AddAssetHtmlPlugin](https://github.com/SimenB/add-asset-html-webpack-plugin)插件，将打包的DLL库引入到打包的HTML模块中；

首先安装插件：

```shell
npm i add-asset-html-webpack-plugin -D
```

然后在Webpack中配置如下：

```js
const webpack = require('webpack');
const AddAssetHtmlPlugin = require("add-asset-html-webpack-plugin");

module.exports = {
  // ...
  plugins: [
    new webpack.DllReferencePlugin({
      context: path.resolve(__dirname, '../'), // manifest (或者是内容属性)中请求的上下文
      manifest: path.resolve(__dirname, "../dll/react.manifest.json")
    }),
    new AddAssetHtmlPlugin({
      filePath: path.resolve(__dirname, '../dll/dll_react.js'),
      outputPath: 'js',
      publicPath: 'js'
    })
  ],
  // ...
}
```

DllReferencePlugin插件会引用DLL库中的react、react-dom的代码

AddAssetHtmlPlugin插件会将`dll_react.js`移动到`build/js`目录，同时在打包的`index.html`中添添加一个script标签引入`dll_react.js`文件，如下：

```html {8}
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Document</title>
    <script defer="defer" src="js/dll_react.js"></script>
    <script defer="defer" src="main.bundle.js"></script>
    <script defer="defer" src="index.bundle.js"></script>
    <link href="css/main.eb45b5.css" rel="stylesheet" />
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>
```

AddAssetHtmlPlugin和[CopyWebpackPlugin](https://webpack.docschina.org/plugins/copy-webpack-plugin/)类似，都是将文件复制到构建目录中，不同的是，AddAssetHtmlPlugin除了将文件复制到build目录外，还会在HTML文件中添加引入的标签。

## Terser

### 认识Terser

> A JavaScript mangler/compressor toolkit for ES6+.

[Terser](https://github.com/terser/terser)是一个用于JavaScript ES6+的mangler（绞肉机）/compressor（压缩机）的工具包。

mangler绞肉机该如何理解呢？这里以一个函数为例，假如有一个函数：

```js
function getAuthInfoFromCloud(options) {
  return fetch('api/auth', data)
}
```

那么经过mangler，这个函数被转换成如下代码：

```js
function a(o) {
  return f('api/auth', d)
}
```

把大代码绞成了小代码，但代码还是原来的功能，没有什么不同。就好像去菜市场买一块肉包饺子，让热心老板用绞肉机给你绞成肉馅，肉还是你的肉，为了包饺子，没啥不一样。

再经过compressor压缩机，代码会被转化成如下结构：

```js
function a(o){return f('api/auth',d)}
```

早期我们会使用`uglify-js`来丑化、压缩我们的JavaScript代码，但是目前已经不再维护，并且不支持ES6+的语法。

Terser是从uglify-es Fork 过来的，并且保留它原来的大部分API以及适配`uglify-es`和`uglify-js@3`。

也就是说，Terser可以帮助我们丑化、压缩代码，让打包的bundle变得更小。

### 命令行中单独使用Terser

Terser是一个独立的工具，可以单独安装：

```shell
# 全局安装
npm install terser -g

# 局部安装
npm install terser
```

可以在命令行中使用Terser：

```shell
terser [input files] [options]

# 如
terser js/file.js -o foo.min.js -c -m
```

Terser有很多可配置参数，开发中常用的是[mangle options](https://github.com/terser/terser#mangle-options)和[compress options](https://github.com/terser/terser#compress-options)对代码进行丑化压缩。

下面会在命令行中使用几个常见的配置看绞肉和压缩效果。

测试代码`abc.js`如下：

```js
const greet = 'Hello world';

console.log(greet);

function sum(arg1, arg2) {
  return arguments[0] + arguments[1];
}

console.log(sum(10, 20));

function getAuthInfoFromCloud(reqOptions) {
  if (1 === 2) {
    return 'Dead Code'
  }
  return fetch(reqOptions)
}

const info = {
  nickname() {
    return 'ccbean';
  }
}

class Person {
  constructor() {
    this.name = 'ccbean'
  }

  sayHi() {
    return 'hello'
  }
}
```

执行：

```js
npx terser .\src\abc.js -o ./src/abc.min.js
```

得到文件`abc.min.js`，默认情况下，Terser会使用默认的转换参数，并移除代码中的空格：

```js
const greet="Hello world";console.log(greet);function sum(arg1,arg2){return arguments[0]+arguments[1]}console.log(sum(10,20));function getAuthInfoFromCloud(reqOptions){if(1===2){return"Dead Code"}return fetch(reqOptions)}const info={nickname(){return"ccbean"}};class Person{constructor(){this.name="ccbean"}hi(){return"hello"}}
```

格式化后如下：

```js
const greet = "Hello world";
console.log(greet);
function sum(arg1, arg2) {
  return arg1 + arg2;
}
console.log(sum(10, 20));
function getAuthInfoFromCloud(reqOptions) {
  if (1 === 2) return "Dead Code";
  return fetch(reqOptions);
}
const info = { nickname: () => "ccbean" };
class Person {
  constructor() {
    this.name = "ccbean";
  }
  sayHi() {
    return "hello";
  }
}

```

如果需要对代码做特殊处理，可以配置具体的参数。在开发中，我们通常不会手动去设置这些参数，而是直接使用默认`defaults`开启的参数。

**使用如下Compress参数处理：**

- defaults：默认为true。传入false，会关闭大部分开启的压缩转换。当只想启用一些压缩选项而禁用其余选项时会有用。

- arrows：默认值是true；class或者object中的函数，转换成箭头函数；
- arguments：默认值是false，将函数中使用 arguments[index]转成对应的形参名称；
- dead_code：默认值是true；移除不可达的代码（tree shaking）；不会用到的代码会被移除。
- hoist_funs：默认值为false；提升函数声明

```js
# 多个参数使用逗号隔开
npx terser .\src\abc.js -o ./src/abc.min.js -c defaults=false,arrows,dead_code=false,hoist_funs=true,arguments=true
```

手动格式化后，得到输出如下：

```js
// 函数提升了
function sum(arg1, arg2) {
  return arg1 + arg2;
}
function getAuthInfoFromCloud(reqOptions) {
  if (1 === 2) return "Dead Code";  // 关闭了deda_code，没被移除
  return fetch(reqOptions);
}
const greet = "Hello world";
console.log(greet);
console.log(sum(10, 20));
const info = { nickname: () => "ccbean" };
class Person {
  constructor() {
    this.name = "ccbean";
  }
  sayHi() {
    return "hello";
  }
}
```

只输入`-c`表示全部使用compress的默认参数。如:

```js
npx terser .\src\abc.js -o ./src/abc.min.js -c
```

格式化后结果如下：

```js
const greet = "Hello world";
function sum(arg1, arg2) {
  return arguments[0] + arguments[1];
}
function getAuthInfoFromCloud(reqOptions) {
  return fetch(reqOptions);
}
console.log(greet), console.log(sum(10, 20));
const info = { nickname: () => "ccbean" };
class Person {
  constructor() {
    this.name = "ccbean";
  }
  sayHi() {
    return "hello";
  }
}

```

上面的代码只是默认做了压缩，但是没有进行绞肉（丑化），使用mangle进行丑化。

**使用如下Mangle参数处理：**

- toplevel：默认值是false；顶层作用域中的变量名称，进行丑化（转换）；

- keep_classnames：默认值是false，是否保持依赖的类名称；
- keep_fnames：默认值是false，是否保持原来的函数名称；

```js
npx terser .\src\abc.js -o ./src/abc.min.js -c arguments=true -m toplevel=true,keep_classnames=true,keep_fnames=false
```

执行后，代码如下：

```js
const n="Hello world";function o(n,o){return n+o}function c(n){return fetch(n)}console.log(n),console.log(o(10,20));const e={nickname:()=>"ccbean"};class Person{constructor(){this.name="ccbean"}sayHi(){return"hello"}}
```

手动格式化：

```js
const n = "Hello world";
function o(n, o) {
  return n + o;
}
function c(n) {
  return fetch(n);
}
console.log(n), console.log(o(10, 20));
const e = { nickname: () => "ccbean" };
class Person { // keep_classnames为true，类名没变
  constructor() {
    this.name = "ccbean";
  }
  sayHi() {
    return "hello";
  }
}
```

可以看到，代码中的标识符经过Mangle丑化后，变得很简单。

### Webpack中使用Terser

开发中，一般不需要手动的通过terser来处理我们的代码，可以直接通过webpack来处理：

- 在webpack中有一个minimizer属性，在production模式下，默认就是使用TerserPlugin，根据Webpack开启的默认参数来处理我们的代码的；
- 如果想要定制化，也可以自己来创建TerserPlugin的实例，覆盖Webpack默认的相关的配置；

首先，设置[optimization.minimize](https://webpack.docschina.org/configuration/optimization/#optimizationminimize)为true，这个配置的作用是告知 webpack 使用 [TerserPlugin](https://webpack.docschina.org/plugins/terser-webpack-plugin/) 或其它在 [`optimization.minimizer`](https://webpack.docschina.org/configuration/optimization/#optimizationminimizer)定义的插件压缩bundle。 也就是让其对我们的代码进行压缩，production模式下默认已经打开了。

然后，在minimizer创建一个TerserPlugin，并传入压缩相关的配置：

- extractComments：默认值为true，表示会将注释抽取到一个单独的文件中；在开发中，我们不希望保留这个注释时，可以设置为false；
- parallel：使用多进程并发运行提高构建的速度，默认值是true，并发运行的默认数量： `os.cpus().length - 1`；
- terserOptions：设置terser相关的配置：
  - compress：设置压缩相关的选项；
  - mangle：设置丑化相关的选项，可以直接设置为true；
  - toplevel：顶层变量是否进行转换；
  - keep_classnames：保留类的名称；
  - keep_fnames：保留函数的名称；

在`webpack.prod.config`中进行配置：

```js
const { merge } = require('webpack-merge');
const baseConfig = require('./webpack.base');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = merge(baseConfig, {
  mode: "production",
  // ...
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        terserOptions: {
          compress: {
            arguments: true
          },
          mangle: true,
          toplevel: true,
          keep_classnames: true,
          keep_fnames: true
        }
      })
    ]
  }
})
```

`index.js`代码如下：

```js
const greet = 'Hello world';

console.log(greet);

function sum(arg1, arg2) {
  return arguments[0] + arguments[1];
}

console.log(sum(10, 20));

function getAuthInfoFromCloud(reqOptions) {
  if (1 === 2) {
    return 'Dead Code'
  }
  return fetch(reqOptions)
}

getAuthInfoFromCloud({ url: 'http://httpbin.org', method: 'get' });

const info = {
  nickname() {
    return 'ccbean';
  }
}

info.nickname();

class Person {
  constructor() {
    this.name = 'ccbean'
  }

  sayHi() {
    return 'hello'
  }
}

new Person()
```

执行`npm run build`生成`index.5eafed.bundle.js`：

```js
(()=>{function _defineProperties(e,n){for(var r=0;r<n.length;r++){var t=n[r];t.enumerable=t.enumerable||!1,t.configurable=!0,"value"in t&&(t.writable=!0),Object.defineProperty(e,t.key,t)}}console.log("Hello world"),console.log(function sum(e,n){return e+n}(10,20)),function getAuthInfoFromCloud(e){return fetch(e)}({url:"http://httpbin.org",method:"get"});new(function(){function Person(){!function _classCallCheck(e,n){if(!(e instanceof n))throw new TypeError("Cannot call a class as a function")}(this,Person),this.name="ccbean"}return function _createClass(e,n,r){return n&&_defineProperties(e.prototype,n),r&&_defineProperties(e,r),Object.defineProperty(e,"prototype",{writable:!1}),e}(Person,[{key:"sayHi",value:function sayHi(){return"hello"}}]),Person}())})();
```

手动格式化后：

```js
(() => {
  function _defineProperties(e, n) {
    for (var r = 0; r < n.length; r++) {
      var t = n[r];
      (t.enumerable = t.enumerable || !1),
        (t.configurable = !0),
        "value" in t && (t.writable = !0),
        Object.defineProperty(e, t.key, t);
    }
  }
  console.log("Hello world"),
    console.log(
      (function sum(e, n) {
        return e + n;
      })(10, 20)
    ),
    (function getAuthInfoFromCloud(e) {
      return fetch(e);
    })({ url: "http://httpbin.org", method: "get" });
  new ((function () {
    function Person() {
      !(function _classCallCheck(e, n) {
        if (!(e instanceof n))
          throw new TypeError("Cannot call a class as a function");
      })(this, Person),
        (this.name = "ccbean");
    }
    return (
      (function _createClass(e, n, r) {
        return (
          n && _defineProperties(e.prototype, n),
          r && _defineProperties(e, r),
          Object.defineProperty(e, "prototype", { writable: !1 }),
          e
        );
      })(Person, [
        {
          key: "sayHi",
          value: function sayHi() {
            return "hello";
          },
        },
      ]),
      Person
    );
  })())();
})();
```

一般情况下，我们不需要手动配置Terser，Webpack在`production`模式下，默认会开启Terser等相关优化插件对代码做优化：

例如，配置：

```js
const { merge } = require('webpack-merge');
const baseConfig = require('./webpack.base');

module.exports = merge(baseConfig, {
  mode: "production",
})
```

执行构建后可得到如下代码：

```js
(()=>{function e(e,n){for(var t=0;t<n.length;t++){var o=n[t];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}console.log("Hello world"),console.log(function(e,n){return arguments[0]+arguments[1]}(10,20)),fetch({url:"http://httpbin.org",method:"get"}),new(function(){function n(){!function(e,n){if(!(e instanceof n))throw new TypeError("Cannot call a class as a function")}(this,n),this.name="ccbean"}var t,o;return t=n,(o=[{key:"sayHi",value:function(){return"hello"}}])&&e(t.prototype,o),Object.defineProperty(t,"prototype",{writable:!1}),n}())})();
```

格式化后：

```js
(() => {
  function e(e, n) {
    for (var t = 0; t < n.length; t++) {
      var o = n[t];
      (o.enumerable = o.enumerable || !1),
        (o.configurable = !0),
        "value" in o && (o.writable = !0),
        Object.defineProperty(e, o.key, o);
    }
  }
  console.log("Hello world"),
    console.log(
      (function (e, n) {
        return arguments[0] + arguments[1];
      })(10, 20)
    ),
    fetch({ url: "http://httpbin.org", method: "get" }),
    new ((function () {
      function n() {
        !(function (e, n) {
          if (!(e instanceof n))
            throw new TypeError("Cannot call a class as a function");
        })(this, n),
          (this.name = "ccbean");
      }
      var t, o;
      return (
        (t = n),
        (o = [
          {
            key: "sayHi",
            value: function () {
              return "hello";
            },
          },
        ]) && e(t.prototype, o),
        Object.defineProperty(t, "prototype", { writable: !1 }),
        n
      );
    })())();
})();
```

可见，默认模式下，Webpack已经做了相关设置，如果不需要特殊配置，使用默认即可。

## CSS压缩

CSS压缩通常是去除无用的空格等，因为很难去修改选择器、属性的名称、值等；

可以使用插件[css-minimizer-webpack-plugin](https://webpack.docschina.org/plugins/css-minimizer-webpack-plugin/)来进行CSS压缩，这个插件是使用[cssnano](https://github.com/cssnano/cssnano)工具来优化、压缩CSS,，它也可以单独使用；

安装插件：

```shell
npm install css-minimizer-webpack-plugin -D
```

在`optimization.minimizer`中配置：

```js {5, 41}
const { merge } = require('webpack-merge');
const baseConfig = require('./webpack.base');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

module.exports = merge(baseConfig, {
  mode: "production",
  module: {
    rules: [
      {
        test: /\.css/i,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash:6].css',
      chunkFilename: 'css/[name].[contenthash:6].css'
    })
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        terserOptions: {
          compress: {
            arguments: true
          },
          mangle: true,
          toplevel: true,
          keep_classnames: true,
          keep_fnames: true
        }
      }),
      new CssMinimizerPlugin()
    ]
  }
})
```

执行`npm run build`，可看到将`style.css`：

```css
body {
  background: blue;
}

div {
  font-size: 20px;
  color: wheat;
}
```

进行了压缩，转成了`main.2471b6.css`：

```css
body{background:blue}div{color:wheat;font-size:20px}
```

## Scope Hoisting

Scope Hoisting从webpack3开始增加的一个新功能；作用是对作用域进行提升，并且让webpack打包后的代码更小、运行更快。

默认情况下webpack打包会有很多的函数作用域，包括一些（比如最外层的）IIFE，无论是从最开始的代码运行，还是加载一个模块，都需要执行一系列的函数；

比如`main.js`中引用了一个`util`模块，有如下代码：

```js
import { sum, mul } from "./util.js";

sum(2, 2)
mul(2, 2)
```

那么在构建后，util函数也会有自己的作用域闭包，在main中调用时，就要通过`__webpack_require__()`函数去加载这个模块：

```js
(() => {
  "use strict";
  var e = {
      "./src/util.js": (e, r, _) => {
        function sum(e, r) {
          return e + r;
        }
        function mul(e, r) {
          return e * r;
        }
        _.r(r), _.d(r, { mul: () => mul, sum: () => sum });
      },
    },
    r = {};
  function __webpack_require__(_) {
    var u = r[_];
    if (void 0 !== u) return u.exports;
    var t = (r[_] = { exports: {} });
    return e[_](t, t.exports, __webpack_require__), t.exports;
  }
  (__webpack_require__.d = (e, r) => {
    for (var _ in r)
      __webpack_require__.o(r, _) &&
        !__webpack_require__.o(e, _) &&
        Object.defineProperty(e, _, { enumerable: !0, get: r[_] });
  }),
    (__webpack_require__.o = (e, r) =>
      Object.prototype.hasOwnProperty.call(e, r)),
    (__webpack_require__.r = (e) => {
      "undefined" != typeof Symbol &&
        Symbol.toStringTag &&
        Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }),
        Object.defineProperty(e, "__esModule", { value: !0 });
    });
  var _ = {};
  (() => {
    __webpack_require__.r(_);
    var e = __webpack_require__(/*! ./util.js */ "./src/util.js");
    (0, e.sum)(2, 2), (0, e.mul)(2, 2);
  })();
})();
```

当模块之前的依赖关系复杂时，就会有大量的上述情况，整个代码会变得很繁琐，也会带来一定的性能损耗。

通过Scope Hoisting可以将函数合并到一个模块中来运行，解决这个问题：

- 使用Scope Hoisting非常的简单，webpack已经内置了对应的插件[ModuleConcatenationPlugin](https://webpack.docschina.org/plugins/module-concatenation-plugin/)：
- 在production模式下，默认这个模块就会启用；
- 在development模式下，需要自己来打开该模块；

```js {23}
const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const baseConfig = require('./webpack.base');

process.env.NODE_ENV = 'development'

module.exports = merge(baseConfig, {
  mode: "development",
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.css/i,
        use: [
          'style-loader',
          'css-loader'
        ]
      }
    ]
  },
  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin()
  ]
})

```

开发模式下，执行`npm run build`后，代码如下：

```js
(() => {
  "use strict";
  var __webpack_require__ = {};

  (() => {
    __webpack_require__.r = (exports) => {
      if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
        Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
      }
      Object.defineProperty(exports, "__esModule", { value: true });
    };
  })();

  var __webpack_exports__ = {};
  __webpack_require__.r(__webpack_exports__);

  function sum(num1, num2) {
    return num1 + num2;
  }
  function mul(num1, num2) {
    return num1 * num2;
  }

  sum(2, 2);
  mul(2, 2);
})();
```

可以看到，代码是在一个作用域中，不需要再去其它作用域中加载。

当然，插件也会自动判断作用域能不能提升，如果不可提升，则不会提升。比如一个的模块在多个地方引用，就不会对这个模块进行提升。
