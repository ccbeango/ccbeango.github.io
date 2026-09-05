---
title: "Webpack自定义Loader"
date: "2022-06-23 10:28:50"
series:
  name: "Webpack5使用学习"
  order: 12
tags:
  - "Webpack5使用学习"
draft: false
---

Loader是用于对模块的源代码进行转换（处理），之前我们已经使用过很多Loader，比如css-loader、style-loader、babel-loader等。

loader 本质上是导出为函数的 JavaScript（Node） 模块。该函数在 loader 转换资源的时候调用。[loader runner](https://github.com/webpack/loader-runner) 会调用此函数，然后将上一个 loader 产生的结果或者资源文件传入进去。并通过 `this` 上下文访问。

## 创建和加载Loader

Loader是一个函数可以接收三个参数：

- content：资源文件的内容；
- map：sourcemap相关的数据；
- meta：一些元数据；

创建`loaders/ccbean-loader.js`文件：

```js
module.exports = function(content, map, meta) {
  console.log(content)

  return content + '  123456'; // 增加输出内容
}
```

在Webpack中配置自定义Loader：

```js {18}
const path = require('path');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  context: path.resolve(__dirname, '.'),
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, './build'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: './loaders/ccbean-loader.js',
            options: { hello: 'world' }
          }
        ]
      }
    ]
  }
}
```

注意，这里loader的相对路径时相对于context的配置。当然，这里的路径也可以时绝对路径。

执行`npm run build`，可以看到自定义Loader执行了，控制台中打印了`main.js`中的代码输出，打包文件`bundle.js`中内容如下：

```js
/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
/*!*********************!*\
  !*** ./src/main.js ***!
  \*********************/
console.log('Hello Webpack');  123456
/******/ })()
;
//# sourceMappingURL=bundle.js.map
```

但是，如果自定义多个Loader，每个loader加载时都会重复配置上相对路径`./loaders/`，如果希望可以直接去加载自己的loader文件夹，可以配置[resolveLoader](https://webpack.docschina.org/configuration/resolve/#resolveloader)：

```js {26}
const path = require('path');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  context: path.resolve(__dirname, '.'),
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, './build'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'ccbean-loader',
            options: { hello: 'world' }
          }
        ]
      }
    ]
  },
  resolveLoader: {
    modules: ['node_modules', './loaders'] // 可以是相对路径，也可以是绝对路径。
  }
}
```

## Loader的执行顺序

我们知道，使用多个Loader，它的执行顺序是从右到左（或从下到上）的。

其实，Loader中还会有一个方法[Pitching Loader](https://webpack.docschina.org/api/loaders/#pitching-loader)，在实际（从右到左）执行 loader 之前，会先 **从左到右** 调用 loader 上的 `pitch` 方法。

假如我们有下面三个loader：

```js
// ccbean-loader.js
module.exports = function(content, map, meta) {
  console.log(content)
  console.log('loader 01')

  return content;
}
module.exports.pitch = function(remainingRequest, precedingRequest, data) {
  console.log('picth loader 01')
}

// ccbean-loader02.js
module.exports = function(content, map, meta) {
  console.log(content)
  console.log('loader 02')

  return content;
}
module.exports.pitch = function(remainingRequest, precedingRequest, data) {
  console.log('picth loader 02')
}

// ccbean-loader03.js
module.exports = function(content, map, meta) {
  console.log(content)
  console.log('loader 03')

  return content;
}
module.exports.pitch = function(remainingRequest, precedingRequest, data) {
  console.log('picth loader 03')
}
```

在webpack中配置如下：

```js
const path = require('path');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  context: path.resolve(__dirname, '.'),
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, './build'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'ccbean-loader',
            options: { hello: 'world' }
          },
          'ccbean-loader02',
          'ccbean-loader03'
        ]
      }
    ]
  },
  resolveLoader: {
    modules: ['node_modules', './loaders']
  }
}
```

执行构建，可看到控制台输出如下：

```shell
picth loader 01
picth loader 02
picth loader 03
loader 03
loader 02
loader 01
```

其实和webpack中执行Loader的库[loader-runner](https://github.com/webpack/loader-runner)有关。`LoaderRunner.js`中有一个函数：

```js
function iteratePitchingLoaders(options, loaderContext, callback) {
	// abort after last loader
	if(loaderContext.loaderIndex >= loaderContext.loaders.length)
		return processResource(options, loaderContext, callback);

	var currentLoaderObject = loaderContext.loaders[loaderContext.loaderIndex];

	// iterate
	if(currentLoaderObject.pitchExecuted) {
		loaderContext.loaderIndex++;
		return iteratePitchingLoaders(options, loaderContext, callback);
	}

	// load loader module
	loadLoader(currentLoaderObject, function(err) {
		if(err) {
			loaderContext.cacheable(false);
			return callback(err);
		}
		var fn = currentLoaderObject.pitch;
		currentLoaderObject.pitchExecuted = true;
		if(!fn) return iteratePitchingLoaders(options, loaderContext, callback);

		runSyncOrAsync(
			fn,
			loaderContext, [loaderContext.remainingRequest, loaderContext.previousRequest, currentLoaderObject.data = {}],
			function(err) {
				if(err) return callback(err);
				var args = Array.prototype.slice.call(arguments, 1);
				// Determine whether to continue the pitching process based on
				// argument values (as opposed to argument presence) in order
				// to support synchronous and asynchronous usages.
				var hasArg = args.some(function(value) {
					return value !== undefined;
				});
				if(hasArg) {
					loaderContext.loaderIndex--;
					iterateNormalLoaders(options, loaderContext, args, callback);
				} else {
					iteratePitchingLoaders(options, loaderContext, callback);
				}
			}
		);
	});
}
```

Loader顺序执行相反就在这里，通过控制`loaderContext`中的`loaderIndex++`或`loaderIndex--`来获取不同的Loader：

- 先优先执行PitchLoader，在执行PitchLoader时进行`loaderIndex++`；
- 之后会执行NormalLoader，在执行NormalLoader时进行`loaderIndex--`；

NormalLoader就是配置中使用的Loader。

## Loader执行顺序和enforce

enforce可以用来改变Loader的特定执行顺序。可设置为`pre`或`post`

Loader共有四种类型：

- `NormalLoader` 默认Loader：Module.rules中默认配置的Loader
- `InlineLoader` 行内Loader：通过 import/require 行内使用的Loader。如`import 'loader1!loader2!./test.js'`
- `PreLoader` 前置Loader
- `PostLoader` 后置Loader

所有一个接一个进入的Loader都有两个阶段：

- Pitching阶段：loader 上的 pitch 方法，按照 `后置(post)、行内(inline)、普通(normal)、前置(pre)` 的顺序调用。
- Normal阶段：loader 上的常规方法，按照 `前置(pre)、普通(normal)、行内(inline)、后置(post)` 的顺序调用。模块源码的转换， 发生在这个阶段。

所以，enforce本质上是将Loader设置为前置pre或后置post Loader，改变Loader队列的执行顺序。

看下面一组Loader配置：

```json
module: {
  rules: [
    {
      test: /\.js$/,
      use: [
        'ccbean-loader',
        'ccbean-loader02',
        'ccbean-loader03'
      ]
    }
  ]
},

// 等价于如下配置：
module: {
  rules: [
    {
      test: /\.js$/,
      use: "ccbean-loader",
    },
    {
      test: /\.js$/,
      use: "ccbean-loader02",
    },
    {
      test: /\.js$/,
      use: "ccbean-loader03",
    },
  ],
},
```

执行顺序为：

```shell
picth loader 01
picth loader 02
picth loader 03
loader 03
loader 02
loader 01
```

为了使用enforce，使用拆分配置并配置enforce：

```json {10}
module: {
  rules: [
    {
      test: /\.js$/,
      use: "ccbean-loader",
    },
    {
      test: /\.js$/,
      use: "ccbean-loader02",
      enforce: "pre" // post
    },
    {
      test: /\.js$/,
      use: "ccbean-loader03",
    },
  ],
},
```

拆分后的配置`ccbean-loader02`的enforce为pre或post，执行结果如下：

```shell
# enforce: "pre"
picth loader 01
picth loader 03
picth loader 02
loader 02
loader 03
loader 01

# enforce: "post"
picth loader 02
picth loader 01
picth loader 03
loader 03
loader 01
loader 02
```

在React的脚手架中`eslint-loader`就配置了`enforce: "pre"`，目的是为了让所有Loader执行前，先执行此Loader。

## 同步Loader

默认创建的Loader就是[同步Loader](https://webpack.docschina.org/api/loaders/#synchronous-loaders)；

Loader必须在函数执行完之前通过 `return` 或者 `this.callback` 来返回结果，交给下一个loader来处理；通常在有错误的情况下，我们会使用 `this.callback`。

如果Loader不返回结果，会出现报错，如`ccbean_loader.js`如下：

```js
module.exports = function(content, map, meta) {
  console.log(content)
  console.log('loader 01')

  // return content;
}
```

报错如下：

```shell
ERROR in ./src/main.js
Module build failed: Error: Final loader (./loaders/ccbean-loader.js) didn't return a Buffer or String
```

可以使用`return`或`this.callback`返回内容：

```js
module.exports = function(content, map, meta) {
  console.log(content)
  console.log('loader 01')

  this.callback(null, content, map, meta);
  // 或return返回
  // return content;
}
```

this.callback的参数：

- 第一个参数必须是 Error 或者 null；
- 第二个参数是一个 string或者Buffer；

如果一个Loader中有一个异步操作，如有`setTimeout`定时器：

```js
module.exports = function(content, map, meta) {
  console.log(content)
  console.log('loader 01')

  setTimeout(() => {
    this.callback(null, content);
  }, 1000)
}
```

上面的代码也会有上面相同的报错。

```shell
Module build failed: Error: Final loader (./loaders/ccbean-loader.js) didn't return a Buffer or String
```

因为函数在执行完时，并没有通过return或this.callback返回结果。返回结果是异步的在定时器中。

这时可以使用异步Loader。

## 异步Loader

有时候我们使用Loader时会进行一些异步的操作；我们希望在异步操作完成后，再返回这个loader处理的结果；这个时候我们就要使用[异步Loader](https://webpack.docschina.org/api/loaders/#asynchronous-loaders)。

可以使用`this.async()`来获取异步callback，在`ccbean-async-loader.js`中实现如下：

```js
module.exports = function(content, map, meta) {
  console.log(content)
  console.log('async loader')

  const callback = this.async();

  setTimeout(() => {
    callback(null, content);
  }, 1000)
}

module.exports.pitch = function(remainingRequest, precedingRequest, data) {
  console.log('async pitch loader')
}
```

配置Loader：

```js
const path = require("path");

module.exports = {
  mode: "development",
  devtool: "source-map",
  context: path.resolve(__dirname, "."),
  entry: "./src/main.js",
  output: {
    path: path.resolve(__dirname, "./build"),
    filename: "bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: "ccbean-loader",
      },
      {
        test: /\.js$/,
        use: "ccbean-async-loader ",
      },
    ],
  },
  resolveLoader: {
    modules: ["node_modules", "./loaders"],
  },
};

```

执行`npm run build`可看到异步Loader可正常执行。

## Loader传入和获取参数

在使用loader时，传入参数。可以通过`this.getptions()`来获取Loader传入的参数。

`ccbean-options-loader.js`：

```js
const { getOptions } = require('loader-utils');

module.exports = function(content, map, meta) {
  console.log(content)
  console.log('options loader')

  const options = this.getOptions();
  console.log('传入的options', options)

  return content;
}

module.exports.pitch = function(remainingRequest, precedingRequest, data) {
  console.log('options pitch loader')
}
```

在`Module.rule`中配置Loader：

```js
const path = require("path");

module.exports = {
  mode: "development",
  devtool: "source-map",
  context: path.resolve(__dirname, "."),
  entry: "./src/main.js",
  output: {
    path: path.resolve(__dirname, "./build"),
    filename: "bundle.js",
  },
  module: {
    rules: [
      // 传入和获取参数
      {
        test: /\.js$/,
        use: [
          {
            loader: "ccbean-options-loader",
            options: {
              hello: "world"
            }
          }
        ],
      },
    ],
  },
  resolveLoader: {
    modules: ["node_modules", "./loaders"],
  },
};
```

执行`npm run build`可在控制台看到：

```shell
options pitch loader
console.log('Hello Webpack');
options loader
传入的options { hello: 'world' }
传入的options { hello: 'world' }
```

但是，现在我们可以传入任意类型的options，可以使用[schema-utils](https://github.com/webpack/schema-utils)库对传入的参数进行校验。

安装库：

```shell
npm install schema-utils
```

写`options-loader-schema.json`如下：

```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "请输入您的名字"
    },
    "age": {
      "type": "number",
      "description": "请输入您的年龄"
    }
  },
  "additionalProperties": false // 是否允许额外的参数
}
```

在Loader中使用schema：

```js {12}
const { validate } = require('schema-utils');
const schema = require('../schemas/options-loader-schema.json');

module.exports = function(content, map, meta) {
  console.log(content)
  console.log('options loader')

  const options = this.getOptions();
  console.log('传入的options', options)

  validate(schema, options, { name: 'MyPlugin' })

  return content;
}

module.exports.pitch = function(remainingRequest, precedingRequest, data) {
  console.log('options pitch loader')
}
```

此时webpack配置中，如果传入如下配置：

```js {18}
const path = require("path");

module.exports = {
  mode: "development",
  devtool: "source-map",
  context: path.resolve(__dirname, "."),
  entry: "./src/main.js",
  output: {
    path: path.resolve(__dirname, "./build"),
    filename: "bundle.js",
  },
  module: {
    rules: [
      // 传入和获取参数
      {
        test: /\.js$/,
        use: [
          {
            loader: "ccbean-options-loader",
            options: {
              name: "ccbean",
              age: "18" // 字符串类型
            }
          }
        ],
      },
    ],
  },
  resolveLoader: {
    modules: ["node_modules", "./loaders"],
  },
};

```

执行`npm run build`报错：

```shell
ERROR in ./src/main.js
Module build failed (from ./loaders/ccbean-options-loader.js):
ValidationError: Invalid configuration object. MyPlugin has been initialized using a configuration object that does not match the API schema.
 - configuration.age should be a number.
   -> 请输入您的年龄
    at validate (D:\Code\Webpack\hello-webpack\24_webpack自定义loader\node_modules\schema-utils\dist\validate.js:115:11)
    at Object.module.exports (D:\Code\Webpack\hello-webpack\24_webpack自定义loader\loaders\ccbean-options-loader.js:12:3)
```

修改age为number类型即可正常构建。

## 自定义Loader例子

### 自定义babel-loader

首选需要安装需要用到的依赖：

```shell
npm i -d @babel/core @babel/preset-env -D
```

这里简单演示只允许传入`preset-env`预设。

配置schema文件`ccbean-babel-loader-schema.json`

```json
{
  "type": "object",
  "properties": {
    "presets": {
      "type": "array"
    }
  },
  "additionalProperties": true
}
```

创建`ccbean-options-loader.js`

```js
const babel = require('@babel/core');
const { validate } = require('schema-utils');
const schema = require('../schemas/options-loader-schema.json');

module.exports = function(content, map, meta) {
  // 1. 异步loader
  const callback = this.async();

  // 2. 获取options
  const options = this.getOptions();

  // 3. 校验schema
  validate(schema, options, { name: 'ccbeanBabelLoader'});

  // 4. babel对源码进行转换
  babel.transform(content, options, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null, result.code);
    }
  });
}
```

配置webpack如下：

```js
const path = require("path");

module.exports = {
  mode: "development",
  devtool: "source-map",
  context: path.resolve(__dirname, "."),
  entry: "./src/main.js",
  output: {
    path: path.resolve(__dirname, "./build"),
    filename: "bundle.js",
  },
  module: {
    rules: [
      // 自定义babel-loader
      {
        test: /\.js$/,
        use: [
          {
            loader: "ccbean-babel-loader",
            options: {
              presets: ['@babel/preset-env']
            }
          }
        ],
      },
    ],
  },
  resolveLoader: {
    modules: ["node_modules", "./loaders"],
  },
};

```

执行`npm run build`可正常编译`main.js`

```js
// main.js
function sum(num1, num2) {
  return num1 + num2;
}

console.log(sum(20 + 30));
console.log('Hello Webpack');

// bundle.js
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};
/*!*********************!*\
  !*** ./src/main.js ***!
  \*********************/


function sum(num1, num2) {
  return num1 + num2;
}

console.log(sum(20 + 30));
console.log('Hello Webpack');
/******/ })()
;
//# sourceMappingURL=bundle.js.map
```

### 自定义md-loader

安装所需依赖：

```shell
npm i marked hightlight.js -D
```

`ccbean-md-loader.js`

```js
const marked = require('marked');
const hljs = require('highlight.js');

module.exports = function(content) {
  marked.setOptions({
    highlight: function(code, lang) {
      return hljs.highlight(lang, code).value;
    }
  })

  const htmlContent = marked(content);
  const innerContent = "`" + htmlContent + "`";
  const moduleCode = `var code=${innerContent}; export default code;`
  return moduleCode;
}
```

配置webpack，需要配置css和md的Loader：

```json
const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: "development",
  devtool: "source-map",
  context: path.resolve(__dirname, "."),
  entry: "./src/main.js",
  output: {
    path: path.resolve(__dirname, "./build"),
    filename: "bundle.js",
  },
  module: {
    rules: [
      // 自定义babel-loader
      {
        test: /\.js$/,
        use: [
          {
            loader: "ccbean-babel-loader",
            options: {
              presets: ['@babel/preset-env']
            }
          }
        ],
      },
      // 自定义md-loader
      {
        test: /\.md$/,
        use: [
          "ccbean-md-loader"
        ],
      },
      {
        test: /\.css$/,
        use: [
          "style-loader",
          "css-loader"
        ]
      }
    ],
  },
  resolveLoader: {
    modules: ["node_modules", "./loaders"],
  },
  plugins: [
    new HtmlWebpackPlugin()
  ],
};
```

入口文件如下：

```js
import mdText from "./test.md";
import "./style.css";
import "highlight.js/styles/default.css";

function sum(num1, num2) {
  return num1 + num2;
}

console.log(sum(20 + 30));
console.log('Hello Webpack');

document.body.innerHTML = mdText;
```

`npm run build`后可看到编译成功，浏览器中可看到效果。
