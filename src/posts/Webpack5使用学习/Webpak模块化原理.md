---
title: "Webpak模块化原理"
date: "2022-04-21 22:28:07"
series:
  name: "Webpack5使用学习"
  order: 4
tags:
  - "Webpack5使用学习"
draft: false
---

## mode配置简介

> https://webpack.docschina.org/configuration/mode/

使用`mode` 配置选项，告知 webpack 使用相应模式的内置优化。具体优化项详见[mode: development](https://v4.webpack.docschina.org/concepts/mode/#mode-development)。

webpack默认mode值是production，可选值有：

- `none`：不使用任何默认优化选项
- `development`： 会将 `DefinePlugin` 中 `process.env.NODE_ENV` 的值设置为 `development`. 为模块和 chunk 启用有效的名。
- `production`：会将 `DefinePlugin` 中 `process.env.NODE_ENV` 的值设置为 `production`。为模块和 chunk 启用确定性的混淆名称，`FlagDependencyUsagePlugin`，`FlagIncludedChunksPlugin`，`ModuleConcatenationPlugin`，`NoEmitOnErrorsPlugin` 和 `TerserPlugin` 。

**注意**

- 如果 `mode` 未通过配置或 CLI 赋值，CLI 将使用可能有效的 `NODE_ENV` 值作为 `mode`。
- 设置`NODE_ENV`并不会自动地设置`mode`。

使用方式

在配置对象中提供 `mode` 选项

```javascript
module.exports = {
  mode: 'production'
};
```

或在命令行中：

```shell
webpack --mode=production
```

## Webpack的模块化

Webpack打包的代码，允许我们使用各种各样的模块化，最常用的CommonJS、ES Module。

那么它是如何帮助我们实现了代码中支持模块化呢？

我们来研究一下它的原理，包括如下原理：

- CommonJS模块化实现原理；
- ES Module模块化实现原理；
- CommonJS加载ES Module的原理；
- ES Module加载CommonJS的原理；

设置mode和devtool属性如下：

```json
module.exports = {
  mode: 'development',
  devtool: 'source-map'
};
```

### CommonJS模块化实现原理

我们有CommonJS规范实现的`format.js`文件

```js
const dateFormat = (date) => {
  return "2020-12-12";
}

const priceFormat = (price) => {
  return "100.00";
}

module.exports = {
  dateFormat,
  priceFormat
}
```

`main.js`对该模块进行引用如下：

```js
const { dateFormat, priceFormat } = require('./js/format');

console.log(dateFormat("1213"));
console.log(priceFormat("1213"));
```

执行打包命令`npm run build`，我们可以得到`bundle.js`文件，去掉一些注释后如下：

```js
(function () {
  // 依赖的模块
  var __webpack_modules__ = ({
    "./src/js/format.js": (function (module) {
        const dateFormat = (date) => {
          return "2020-12-12";
        }

        const priceFormat = (price) => {
          return "100.00";
        }

        module.exports = {
          dateFormat,
          priceFormat
        }
      })
  });

  // The module cache
  var __webpack_module_cache__ = {};

  // The require function
  function __webpack_require__(moduleId) {
    // Check if module is in cache
    var cachedModule = __webpack_module_cache__[moduleId];
    if (cachedModule !== undefined) {
      return cachedModule.exports;
    }
    // Create a new module (and put it into the cache)
    var module = __webpack_module_cache__[moduleId] = {
      exports: {}
    };

    // Execute the module function
    __webpack_modules__[moduleId](module, module.exports, __webpack_require__);

    // Return the exports of the module
    return module.exports;
  }

  var __webpack_exports__ = {};
  // This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
  !function () { // 感叹号会将IIFE函数转为表达式，去掉则会报错。 或者使用括号来包裹IIFE
    const { dateFormat, priceFormat } = __webpack_require__("./src/js/format.js");

    console.log(dateFormat("1213"));
    console.log(priceFormat("1213"));
  }();
})();

//# sourceMappingURL=bundle.js.map
```

1. 整个文件是一个IIFE函数，起到模块隔离的作用，即作用域隔离。

2. 定义变量`__webpack_modules__`，是一个对象，它存储的是代码中所有的依赖模块信息，key是模块标识符，value是一个函数`funciton(module, exports, require)`，函数接收三个参数：
   - 第一个参数`module`：模块本身的module
   - 第二个参数`exports`：对module中exports属性的引用。也就是我们在代码中经常用来做到处使用的`exports`
   - 第三个参数`require`：`require()`函数，在模块中引用其它模块时常用到的require()函数。
   - **这也就是为什么我们在编写一个CommonJS模块时，能够在模块中使用`module.exports`、`exports`、`require()`的原因。同理，NodeJS中对模块函数的实现的函数签名为`function (exports, require, module, __filename, __dirname)`。**
   - 这里看着之所以只有一个参数，是因为不需要后两个参数，webpack编译省略掉了

3. 函数内部是该模块的业务逻辑代码。最后对`module.exports`进行赋值

4. `__webpack_module_cache__`为模块加载后的缓存对象。

5. 函数`__webpack_require__(moduleId)`就是webpack对CommonJS的`require()`函数的实现，函数接收一个参数模块标识符。

   - 当函数执行时，传入标识符`moduleId`，首先判断模块缓存`__webpack_module_cache__`对象中是否有对`moduleId`的缓存，如果有则直接返回。没有则执行下面的加载过程。这样可以在模块多次加载时，避免多次执行模块函数。

   - 模块加载，创建键为模块标识符`moduleId`，值为模块函数`__webpack_modules__[moduleId](module, module.exports, __webpack_require__)`的执行结果，即对`module.exports`进行赋值。这里也就正好传入了`__webpack_modules__`对象中函数签名定义的三个参数。

- 最后，是入口文件`entry`相关代码，使用IIFE对入口进行包裹，这是为了隔离`chunk`中其它模块的污染，即作用域隔离。
  - 这里`require`被替换成了Webpack的对应实现`__webpack_require__()`

**总结**

和Node对CommonJS规范的实现类似。本质上Webpack自己实现了require函数。通过立即执行函数IIFE，给每个模块提供自己的函数作用域，实现模块隔离。将要导出的属性和方法赋值到`module.exports`上。

### ES Module模块化实现原理

我们有CommonJS规范实现的`math.js`文件。

```js
export const sum = (num1, num2) => {
  return num1 + num2;
}

export const mul = (num1, num2) => {
  return num1 * num2;
}
```

`main.js`对该模块进行引用如下：

```js
import { sum, mul } from './js/math.js';

console.log(sum(20, 30));
console.log(mul(20, 30));
```

执行打包命令`npm run build`，我们可以得到`bundle.js`文件，去掉一些注释后如下：

```js
(function () {
  "use strict";
  var __webpack_modules__ = ({
    "./src/js/math.js":
      (function (__unused_webpack_module, __webpack_exports__, __webpack_require__) {
        // module.exports上添加Symbol.toStringTag: 'Module'和`__esModule: true`属性
        __webpack_require__.r(__webpack_exports__);
        // 设置导出方法sum和mul的代理
        __webpack_require__.d(__webpack_exports__, {
          "mul": function () { return mul; },
          "sum": function () { return sum; }
        });

        const sum = (num1, num2) => {
          return num1 + num2;
        }

        const mul = (num1, num2) => {
          return num1 * num2;
        }
      })

  });
  // The module cache
  var __webpack_module_cache__ = {};

  // The require function
  function __webpack_require__(moduleId) {
    // Check if module is in cache
    var cachedModule = __webpack_module_cache__[moduleId];
    if (cachedModule !== undefined) {
      return cachedModule.exports;
    }
    // Create a new module (and put it into the cache)
    var module = __webpack_module_cache__[moduleId] = {
      exports: {}
    };

    // Execute the module function 执行模块函数 传入三个参数
    __webpack_modules__[moduleId](module, module.exports, __webpack_require__);

    // Return the exports of the module
    return module.exports;
  }

  /* webpack/runtime/define property getters */
  !function () {
    // define getter functions for harmony exports
    __webpack_require__.d = function (exports, definition) {
      for (var key in definition) {
        if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
          // 生成访问器属性
          // {
          //   exports: {
          //     mul: /* getter */ function () { return mul; },
          //     sum: /* getter */ function () { return sum; }
          //   }
          // }
          Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
        }
      }
    };
  }();

  /* webpack/runtime/hasOwnProperty shorthand */
  !function () {
    __webpack_require__.o = function (obj, prop) {
      return Object.prototype.hasOwnProperty.call(obj, prop);
    }
  }();

  /* webpack/runtime/make namespace object */
  !function () {
    // define __esModule on exports
    __webpack_require__.r = function (exports) {
      if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
        // { exports: { Symbol(Symbol.toStringTag): 'Module'  } }
        Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
      }
      // { exports: { __esModule: true  } }
      Object.defineProperty(exports, '__esModule', { value: true });
    };
  }();

  var __webpack_exports__ = {};
  // This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
  !function () {
    __webpack_require__.r(__webpack_exports__);
    var _js_math_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/js/math.js");

    // 此语法等价于： _js_math_js__WEBPACK_IMPORTED_MODULE_0__.sum(20, 30);
    console.log((0, _js_math_js__WEBPACK_IMPORTED_MODULE_0__.sum)(20, 30));
    console.log((0, _js_math_js__WEBPACK_IMPORTED_MODULE_0__.mul)(20, 30));
  }();
})();

//# sourceMappingURL=bundle.js.map
```

1. 最外层包裹IIFE函数，进行作用域隔离。
2. 定义变量`__webpack_modules__`，是一个对象。key为模块标识符，value是一个函数`function (__unused_webpack_module, __webpack_exports__, __webpack_require__)`，接收三个参数
   - `__unused_webpack_module`
   - ``**webpack_exports**`
   - `__webpack_require__`
3. 声明模块缓存对象`__webpack_module_cache__`
4. 定义`require`函数`function __webpack_require__(moduleId)`，接收模块标识符作为参数。
   - 首先从缓存中加载模块，如果模块存在则直接返回。不存在则继续执行
   - 执行模块函数`__webpack_modules__[moduleId](module, module.exports, __webpack_require__)`加载模块

5. `require`函数上定义了三个属性`d`、`o`、`r`，分别是三个方法

   - `__webpack_require__.d()`，给模块中要导出的属性和方法设置一个访问器属性代理到`module.exports`上

   - `__webpack_require__.o()`，hasOwnProperty方法的简写
   - `__webpack_require__.r()`，给`module.exports`对象上设置数据属性`Symbol.toStringTag: 'Module'`和`__esModule: true`

6. 执行入口文件

**总结**

ES Module 通过`Object.defineProperty`给导出的属性和方法设置代理。同时在module.exports上设置了`____esModule: true`，以及有Symbol时，设置`Symbol(Symbol.toStringTag): 'Module'`，用来标识这是一个ESModule。

CommonJS是将要导出的属性和方法赋值到`module.exports`上。而ESModule是要将导出的属性和方法设置代理到`module.exports`上。

### CommonJS、ES Module可相互加载的原理

`main.js`对该模块进行引用如下：

```js
// commonjs模式导入es module
const math = require('./js/math');
const { sum, mul } = require('./js/math');
// es module模式导入commonjs
import format, { dateFormat, priceFormat } from './js/format';

console.log(math.sum(20, 30));
console.log(math.mul(20, 30));

console.log(sum(20, 30));
console.log(mul(20, 30));

console.log(format.dateFormat("1213"));
console.log(format.priceFormat("1213"));

console.log(dateFormat("1213"));
console.log(priceFormat("1213"));

```

执行打包命令`npm run build`，我们可以得到`bundle.js`文件，去掉一些注释后如下：

```js
(function () {
  var __webpack_modules__ = ({
    "./src/js/format.js":
      (function (module) {
        const dateFormat = (date) => {
          return "2020-12-12";
        }
        const priceFormat = (price) => {
          return "100.00";
        }

        module.exports = {
          dateFormat,
          priceFormat
        }
      }),
    "./src/js/math.js":
      (function (__unused_webpack_module, __webpack_exports__, __webpack_require__) {
        "use strict";
        // module.exports上添加Symbol.toStringTag: 'Module'和`__esModule: true`属性
        __webpack_require__.r(__webpack_exports__);
        // 设置导出方法sum和mul的代理 即 设置访问器getter属性
        __webpack_require__.d(__webpack_exports__, {
          "mul": function () { return mul; },
          "sum": function () { return sum; }
        });
        const sum = (num1, num2) => {
          return num1 + num2;
        }

        const mul = (num1, num2) => {
          return num1 * num2;
        }
      })
  });
  // The module cache
  var __webpack_module_cache__ = {};

  // The require function
  function __webpack_require__(moduleId) {
    // Check if module is in cache
    var cachedModule = __webpack_module_cache__[moduleId];
    if (cachedModule !== undefined) {
      return cachedModule.exports;
    }
    // Create a new module (and put it into the cache)
    var module = __webpack_module_cache__[moduleId] = {
      exports: {}
    };

    // Execute the module function
    __webpack_modules__[moduleId](module, module.exports, __webpack_require__);

    // Return the exports of the module
    return module.exports;
  }

  /* webpack/runtime/compat get default export */
  !function () {
    // getDefaultExport function for compatibility with non-harmony modules
    __webpack_require__.n = function (module) {
      var getter = module && module.__esModule ?
        function () { return module['default']; } :
        function () { return module; };
      __webpack_require__.d(getter, { a: getter });
      return getter;
    };
  }();

  /* webpack/runtime/define property getters */
  !function () {
    // define getter functions for harmony exports
    __webpack_require__.d = function (exports, definition) {
      for (var key in definition) {
        if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
          Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
        }
      }
    };
  }();

  /* webpack/runtime/hasOwnProperty shorthand */
  !function () {
    __webpack_require__.o = function (obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
  }();

  /* webpack/runtime/make namespace object */
  !function () {
    // define __esModule on exports
    __webpack_require__.r = function (exports) {
      if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
        Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
      }
      Object.defineProperty(exports, '__esModule', { value: true });
    };
  }();

  var __webpack_exports__ = {};
  // This entry need to be wrapped in an IIFE because it need to be in strict mode.
  !function () {
    "use strict";
    __webpack_require__.r(__webpack_exports__);
    var _js_format__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/js/format.js");
    var _js_format__WEBPACK_IMPORTED_MODULE_0___default = __webpack_require__.n(_js_format__WEBPACK_IMPORTED_MODULE_0__);
    // commonjs模式导入es module
    const math = __webpack_require__("./src/js/math.js");
    const { sum, mul } = __webpack_require__("./src/js/math.js");

    console.log(math.sum(20, 30));
    console.log(math.mul(20, 30));
    // commonjs的导入方式会解构赋值 无论导入模块是哪种格式的
    console.log(sum(20, 30));
    console.log(mul(20, 30));

    // esmodule的导入通过代理实现 无论导入的模块是哪种格式的
    console.log(_js_format__WEBPACK_IMPORTED_MODULE_0___default().dateFormat("1213"));
    console.log(_js_format__WEBPACK_IMPORTED_MODULE_0___default().priceFormat("1213"));

    console.log((0, _js_format__WEBPACK_IMPORTED_MODULE_0__.dateFormat)("1213"));
    console.log((0, _js_format__WEBPACK_IMPORTED_MODULE_0__.priceFormat)("1213"));
  }();
})();
//# sourceMappingURL=bundle.js.map
```
