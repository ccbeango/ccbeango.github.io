---
title: "Rollup的使用"
date: "2022-06-30 09:52:41"
series:
  name: "Webpack5使用学习"
  order: 16
tags:
  - "Webpack5使用学习"
draft: false
---

## 认识Rollup

> Rollup is a module bundler for JavaScript which compiles small pieces of code into something larger and more complex, such as a library or application.
>
> Rollup 是一个 JavaScript 模块打包器，可以将小块代码编译成大块复杂的代码，例如 library 或应用程序。

Rollup的定义、定位和Webpack非常的相似，Rollup也是一个模块化的打包工具，但是Rollup主要是针对ES Module进行打包的。Webpack通常可以通过各种loader处理各种各样的文件，以及处理它们的依赖关系，而Rollup更多时候是专注于处理JavaScript代码的，当然也可以处理其它类型文件，如css、font、vue等等。

Rollup的配置和理念相对于Webpack来说，更加的简洁和容易理解；它的亮点在于，能针对ES6源码进行Tree Shaking，以去除那些已被定义但没被使用的代码并进行Scope Hoisting，以减小输出文件的大小和提升运行性能。

然而Rollup的这些亮点随后就被Webpack模仿和实现。在早期Webpack不支持tree shaking时，Rollup具备更强的优势。

Rollup也提供了大量的[插件](https://github.com/rollup/awesome)来帮助我们做打包优化。

Webpack和Rollup的应用场景：

- 通常在实际项目开发过程中，使用webpack，比如vue、react、angular项目都是基于webpack的；

- 在对库文件进行打包时，通常会使用Rollup，比如vue、react、dayjs源码本身都是基于Rollup的；因为Rollup在用于打包JavaScript库时比Webpack 更有优势，其打包出来的代码更小、更快。

## 使用

安装Rollup：

```shell
npm i -D rollup
```

### 命令行中

可在命令行中使用Rollup，可使用参数见[命令行的参数](https://rollupjs.org/guide/zh/#%E5%91%BD%E4%BB%A4%E8%A1%8C%E7%9A%84%E5%8F%82%E6%95%B0command-line-flags)

对`src/main.js`打包

```js
const message = "Hello Rollup";
console.log(message);

const sum = (num1, num2) => {
  return num1 + num2;
}

export default {
  sum
}
```

**打包IIFE规范库**

```shell
# 必须加 -n ccbeanUtil 声明全局访问标识符
# 因为在浏览器中使用，需要全局访问的标识符
npx rollup ./src/main.js -f iife -n ccbeanUtil  -o build/bundle.iife.js
```

结果：

```js
// -n ccbeanUtil 声明全局访问标识符
var ccbeanUtil = (function (exports) {
  'use strict';

  const message = "Hello Rollup";
  console.log(message);

  const sum = (num1, num2) => {
    return num1 + num2;
  };

  exports.sum = sum;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

})({});
```

**打包AMD规范库**

```shell
npx rollup ./src/main.js -f amd -o build/bundle.amd.js
```

打包结果

```js
define(['exports'], (function (exports) { 'use strict';

  const message = "Hello Rollup";
  console.log(message);

  const sum = (num1, num2) => {
    return num1 + num2;
  };

  exports.sum = sum;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
```

**打包CommonJS规范库**

```shell
npx rollup ./src/main.js -f cjs -o build/bundle.cjs.js
```

打包结果

```js
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const message = "Hello Rollup";
console.log(message);

const sum = (num1, num2) => {
  return num1 + num2;
};

exports.sum = sum;
```

**打包UMD规范库**

```shell
# 必须加 -n ccbeanUtil 声明全局访问标识符
# 因为在浏览器中使用，需要全局访问的标识符
npx rollup ./src/main.js -f umd -n ccbeanUtil -o build/bundle.umd.js
```

打包结果

```js
(function (global, factory) {
  // commonjs
  typeof exports === "object" && typeof module !== "undefined"
    ? factory(exports)
    // amd
    : typeof define === "function" && define.amd
    ? define(["exports"], factory)
    // browser
    : ((global =
        typeof globalThis !== "undefined" ? globalThis : global || self),
      // 将ccbeanUtil挂载到global
      factory((global.ccbeanUtil = {})));
})(this, function (exports) {
  "use strict";

  const message = "Hello Rollup";
  console.log(message);

  const sum = (num1, num2) => {
    return num1 + num2;
  };

  exports.sum = sum;

  Object.defineProperty(exports, "__esModule", { value: true });
});
```

**打包ESModule规范库**

```shell
npx rollup ./src/main.js -f es -o build/bundle.es.js
```

打包结果

```js
const message = "Hello Rollup";
console.log(message);

const sum = (num1, num2) => {
  return num1 + num2;
};

export { sum };
```

### 配置文件中

Rollup的[配置文件](https://rollupjs.org/guide/zh/#%E9%85%8D%E7%BD%AE%E6%96%87%E4%BB%B6configuration-files)是可选的，但是使用配置文件的作用很强大，而且很方便。

可以将Rollup的配置下载`rollup.config.js`中

```js
module.exports = {
  input: './src/main.js', // 入口
  output: { // 输出
    file: './build/bundle.js', // 打包文件
    format: 'umd', // 包规范
    name: 'ccebanUtil' // 访问标识符
  }
};
```

执行`npx gulp -c`即可打包，默认会去查找根目录下`rollup.config.js`配置文件，如果不是此文件名，需要指定具体配置。

如果需要输入多个，`output`可以是一个数组：

```js
module.exports = {
  input: "./src/main.js",
  output: [
    {
      format: "umd",
      name: "ccebanUtil",
      file: "./build/ccbean.umd.js",
    },
    {
      format: "cjs",
      file: "build/ccbean.commonjs.js",
    },
    {
      format: "amd",
      file: "build/ccbean.amd.js",
    },
    {
      format: "es",
      file: "build/ccbean.es.js",
    },
    {
      format: "iife",
      name: "ccebanUtil",
      file: "build/ccbean.browser.js",
    },
  ],
};
```

### 解决CommonJS

Rollup主要是针对ESModule，默认情况下，Rollup并不会处理CommonJS规范的代码。

直接使用CommonJS模块，Rollup打包后会出现报错。

使用配置：

```js
module.exports = {
  input: "./src/main.js",
  output:  {
    format: "umd",
    name: "ccebanUtil",
    file: "./build/ccbean.umd.js",
  },
};
```

有CommonJS规范的`util.js`模块：

```js
// CommonJS规范模块
const dateFormat = () => {
  return '2022-06-30';
}

module.exports = {
  dateFormat
}
```

在`main.js`中引用

```js {1}
const { dateFormat } = require('./util');

const message = "Hello Rollup";
console.log(message);

const sum = (num1, num2) => {
  return num1 + num2;
}

console.log(dateFormat())

export {
  sum
}
```

执行`npx rollup -c`模块可正常打包：

```js {7}
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.ccebanUtil = {}));
})(this, (function (exports) { 'use strict';

  const { dateFormat } = require('./util');

  const message = "Hello Rollup";
  console.log(message);

  const sum = (num1, num2) => {
    return num1 + num2;
  };

  console.log(dateFormat());

  exports.sum = sum;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
```

但是，浏览器中并没有`require`函数，直接使用会报错：

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <script src="../build/ccbean.umd.js"></script>
</body>
</html>

<!-- Uncaught ReferenceError: require is not defined -->
```

如果直接使用`import`形式来导入CommonJS模块，打包就会报错：

```js
import { dateFormat } from './util';

const message = "Hello Rollup";
console.log(message);

const sum = (num1, num2) => {
  return num1 + num2;
}

console.log(dateFormat())

export {
  sum
}

// ./src/main.js → ./build/ccbean.umd.js...
// [!] Error: 'dateFormat' is not exported by src/util.js, imported by src/main.js
```

在使用第三方库时，会存在是用CommonJS规范实现的库，如Loadsh，在Rollup中，可以使用插件[@rollup/plugin-commonjs](https://github.com/rollup/plugins/tree/master/packages/commonjs)解决这个问题。

```shell
npm i -D @rollup/plugin-commonjs
```

配置插件

```js
const commonjs = require('@rollup/plugin-commonjs');

module.exports = {
  input: "./src/main.js",
  output:  {
    format: "umd",
    name: "ccebanUtil",
    file: "./build/ccbean.umd.js",
  },
  plugins: [
    commonjs()
  ]
};
```

在`main.js`中要使用`import`的方式导入。

```js
import { dateFormat } from './util';
```

这样就可以使用ES的导入方式来使用CommonJS模块。

### 解决第三方库

我们在开发库时，会使用第三方库，这些库在`node_modules`中。

使用lodash库，上面的配置已经解决了CommonJS的问题，但是在`node_modules`中的第三方库，默认情况下Rollup是无法定位到的。

下面的代码在打包后，浏览器中执行会报错。

```js
import _ from 'lodash';

console.log(_.join(['Hello', 'World']))

// 报错
// ccbean.umd.js:30 Uncaught TypeError: Cannot read properties of undefined (reading 'join')
```

可以使用[@rollup/plugin-node-resolve](https://github.com/rollup/plugins/tree/master/packages/node-resolve)插件来处理

```shell
npm i -D lodash @rollup/plugin-node-resolve
```

`main.js`

```js {13}
import resolve from "@rollup/plugin-node-resolve";

module.exports = {
  // ...
  plugins: [
    resolve()
  ]
};
```

再执行`npx rollup -c `打包解决此问题。

但是，可以发现所有的lodash代码都被打包到了`ccbean.umd.js`中，显然开发库时并不希望lodash打包到我们的项目中。

可以使用[external](https://rollupjs.org/guide/zh/#%E5%A4%96%E9%93%BEexternal--e--external)选项来处理。同时，使用[output.global](https://rollupjs.org/guide/zh/#%E5%A4%96%E9%93%BEexternal--e--external)配置loadsh的全局变量，让打包工具知道我们使用了Lodash，且全局变量是`_`

```js {10-12, 19}
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";

module.exports = {
  input: "./src/main.js",
  output:  {
    format: "umd",
    name: "ccebanUtil",
    file: "./build/ccbean.umd.js",
    globals: {
      lodash: "_"
    }
  },
  plugins: [
    commonjs(),
    resolve()
  ],
  external: [
    "lodash"
  ]
};
```

那么，我们的库并不会把Lodash打包到项目中，可以直接依赖外部的Lodash库来完美解决问题。

如果有开发者使用这个库，可以自行引入Lodash。此时，在浏览器中打开`index.html`依然会报错，可手动引入Lodash。

### 使用Babel

如果我们希望将ES6转成ES5的代码，可以在rollup中使用babel。

Rollup中使用@rollup/plugin-babel插件做JS转化。

安装Babel相关依赖

```shell
npm i -D @rollup/plugin-babel @babel/core @babel/preset-env
```

配置`babel.config.js`

```js
module.exports = {
  presets: ["@babel/preset-env"],
};

```

配置rollup：

```js {18}
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";

module.exports = {
  input: "./src/main.js",
  output:  {
    format: "umd",
    name: "ccebanUtil",
    file: "./build/ccbean.umd.js",
    globals: {
      lodash: "_"
    }
  },
  plugins: [
    commonjs(),
    resolve(),
    babel({ babelHelpers: "bundled" })
  ],
  external: [
    "lodash"
  ]
};
```

[babelHelpers](https://github.com/rollup/plugins/tree/master/packages/babel#babelhelpers)参数的作用是处理babel转化时生成的辅助函数如何注入到代码中。默认值是`bundled`，表示生成的辅助代码会注入到打包的bundle中。

```js
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('lodash')) :
  typeof define === 'function' && define.amd ? define(['exports', 'lodash'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.ccebanUtil = {}, global._));
})(this, (function (exports, _) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var ___default = /*#__PURE__*/_interopDefaultLegacy(_);

  var dateFormat = function dateFormat() {
    return '2022-06-30';
  };

  var util = {
    dateFormat: dateFormat
  };

  var message = "Hello Rollup";
  console.log(message);

  var sum = function sum(num1, num2) {
    return num1 + num2;
  };

  console.log(util.dateFormat());
  console.log(___default["default"].join(['Hello', 'World']));

  exports.sum = sum;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
```

### 使用Terser

如果我们希望对代码进行压缩，可以使用[rollup-plugin-terser](https://github.com/TrySound/rollup-plugin-terser)插件

```shell
npm i -D rollup-plugin-terser
```

配置Rollup

```js {20}
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import { terser } from "rollup-plugin-terser";

module.exports = {
  input: "./src/main.js",
  output: {
    format: "umd",
    name: "ccebanUtil",
    file: "./build/ccbean.umd.js",
    globals: {
      lodash: "_",
    },
  },
  plugins: [
    commonjs(),
    resolve(),
    babel({ babelHelpers: "bundled" }),
    terser()
  ],
  external: ["lodash"],
};
```

执行`npx rollup -c`即可看到压缩效果。

```js
!function(e,o){"object"==typeof exports&&"undefined"!=typeof module?o(exports,require("lodash")):"function"==typeof define&&define.amd?define(["exports","lodash"],o):o((e="undefined"!=typeof globalThis?globalThis:e||self).ccebanUtil={},e._)}(this,(function(e,o){"use strict";function n(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var t=n(o),l=function(){return"2022-06-30"};console.log("Hello Rollup");console.log(l()),console.log(t.default.join(["Hello","World"])),e.sum=function(e,o){return e+o},Object.defineProperty(e,"__esModule",{value:!0})}));
```

### 处理CSS

如果我们项目中需要处理css文件，可以使用Postcss

安装插件[rollup-plugin-postcss](https://github.com/egoist/rollup-plugin-postcss)和postcss相关依赖

```shell
npm install rollup-plugin-postcss postcss -D
```

配置Rollup

```js
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import { terser } from "rollup-plugin-terser";
import postcss from "rollup-plugin-postcss";

module.exports = {
  input: "./src/main.js",
  output: {
    format: "umd",
    name: "ccebanUtil",
    file: "./build/ccbean.umd.js",
    globals: {
      lodash: "_",
    },
  },
  plugins: [
    commonjs(),
    resolve(),
    babel({ babelHelpers: "bundled" }),
    terser(),
    postcss()
  ],
  external: ["lodash"],
};
```

在`main.js`中导入`style.css`

```css
body {
  background-color: red;
}
```

```js
import './style.css'
```

执行`npx rollup -c`构建可看到CSS被打包到了`ccbean.umd.js`中。

### 处理Vue

处理vue文件需要使用[rollup-plugin-vue](https://github.com/vuejs/rollup-plugin-vue)插件

同时，需要插件[@vue/compiler-sfc](https://github.com/vuejs/core/tree/main/packages/compiler-sfc)来编译Vue的模板。

```shell
npm i rollup-plugin-vue rollup-plugin-vue -D
```

配置Rollup，要注意vue插件的引入顺序。

```js {16,20,27}
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import { terser } from "rollup-plugin-terser";
import postcss from "rollup-plugin-postcss";
import vue from "rollup-plugin-vue";

module.exports = {
  input: "./src/main.js",
  output: {
    format: "umd",
    name: "ccebanUtil",
    file: "./build/ccbean.umd.js",
    globals: {
      lodash: "_",
      vue: "Vue"
    },
  },
  plugins: [
    vue(),
    commonjs(),
    resolve(),
    babel({ babelHelpers: "bundled" }),
    postcss(),
    terser(),
  ],
  external: ["lodash", "vue"],
};
```

编译`App.vue`文件

```vue
<template>
  <div id="app">
    <h2 class="title">{{message}}</h2>
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: "Hello Vue"
    }
  }
}
</script>

<style scoped>
  .title {
    color: blue
  }
</style>
```

在`main.js`中导入：

```js
import { createApp } from 'vue';
import VueApp from './App.vue';

createApp(VueApp).mount("#app");
```

在`index.html`中引入Vue包的CDN

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <script src="https://unpkg.com/vue@3"></script>
</head>
<body>
  <div id="app"></div>
  <script src="../node_modules/lodash/lodash.min.js"></script>
  <script src="../build/ccbean.umd.js"></script>
</body>
</html>
```

执行`npx rollup -c`构建后可看见页面渲染出蓝色的`Hello Vue`。

### 处理环境变量

有时，代码中会用到全局的Node变量如`process.env.NODE_ENV`，默认情况下Rollup打包，在浏览器中会有错误

```js
// main.js
console.log('NODE_ENV', process.env.NODE_ENV)

// Uncaught ReferenceError: process is not defined
```

可以使用插件[@rollup/plugin-replace](https://github.com/rollup/plugins/tree/master/packages/replace)来设置对应的值

```shell
npm i -D @rollup/plugin-replace
```

配置Rollup

```js {21-25}
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import { terser } from "rollup-plugin-terser";
import postcss from "rollup-plugin-postcss";
import vue from "rollup-plugin-vue";
import replace from "@rollup/plugin-replace";

module.exports = {
  input: "./src/main.js",
  output: {
    format: "umd",
    name: "ccebanUtil",
    file: "./build/ccbean.umd.js",
    globals: {
      lodash: "_",
      vue: "Vue"
    },
  },
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
      __buildDate__: () => JSON.stringify(new Date()),
      __buildVersion: 15
    }),
    vue(),
    commonjs(),
    resolve(),
    babel({ babelHelpers: "bundled" }),
    postcss(),
    terser()
  ],
  external: ["lodash", "vue"],
};
```

执行`npx rollup -c`构建，可解决问题。

### 搭建本地服务

使用插件[rollup-plugin-serve](https://github.com/thgh/rollup-plugin-serve)搭建服务

```shell
npm install rollup-plugin-serve -D
```

配置Rollup

```js
import serve from 'rollup-plugin-serve';

module.exports = {
  // ...
  plugins: [
    serve({
      open: true, // 是否打开浏览器
      port: 8080, // 监听哪端口
      contentBase: "./" // 服务的文件夹 当前根目录 因为index.html在这里
    }),
  ]
};
```

当文件发生改变时，我们想要实时看到渲染效果，可以使用插件[rollup-plugin-livereload](https://github.com/thgh/rollup-plugin-livereload)

```shell
npm install rollup-plugin-livereload -D
```

配置Rollup

```js
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

module.exports = {
  // ...
  plugins: [
    serve({
      open: true, // 是否打开浏览器
      port: 8080, // 监听哪端口
      contentBase: "./src" // 服务的文件夹
    }),
    livereload()
  ]
};
```

使用`-w`参数来开启文件监听，有文件发生变化时，再通过livereload来重新渲染。

执行`npx rollup -c -w`，修改文件，会重新渲染。

也可以配置[watch](https://rollupjs.org/guide/zh/#watch-options)选项，来做更多的监听配置。

### 区分开发环境

在`package.json`中创建一个开发和构建的脚本：

```json
"scripts": {
    "serve": "rollup -c --environment NODE_ENV:development -w",
    "build": "rollup -c --environment NODE_ENV:production"
},
```

根据环境变量`NODE_ENV`，加载不同的插件：

```js
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import { terser } from "rollup-plugin-terser";
import postcss from "rollup-plugin-postcss";
import vue from "rollup-plugin-vue";
import replace from "@rollup/plugin-replace";
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

const isProduction = process.env.NODE_ENV === 'production';

const plugins = [
  replace({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    __buildDate__: () => JSON.stringify(new Date()),
    __buildVersion: 15
  }),
  vue(),
  commonjs(),
  resolve(),
  babel({ babelHelpers: "bundled" }),
  postcss()
];

if (isProduction) {
  plugins.push(terser())
} else {
  plugins.push(...[
    serve({
      // open: true, // 是否打开浏览器
      port: 8080, // 监听哪端口
      contentBase: "./" // 服务的文件夹 当前根目录 因为index.html在这里
    }),
    livereload()
  ])
}

module.exports = {
  input: "./src/main.js",
  output: {
    format: "umd",
    name: "ccebanUtil",
    file: "./build/ccbean.umd.js",
    globals: {
      lodash: "_",
      vue: "Vue"
    },
  },
  plugins,
  external: ["lodash", "vue"],
};
```
