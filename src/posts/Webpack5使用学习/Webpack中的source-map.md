---
title: "Webpack中的source-map"
date: "2022-04-27 20:06:54"
series:
  name: "Webpack5使用学习"
  order: 5
tags:
  - "Webpack5使用学习"
draft: false
---

## 认识source-map

我们的代码通常运行在浏览器上时，是通过打包压缩的，也就是真实跑在浏览器上的代码，和我们编写的代码其实是有差异的。

- 比如ES6的代码可能被转换成ES5；

- 比如对应的代码行号、列号在经过编译后肯定会不一致；

- 比如代码进行丑化压缩时，会将编码名称等修改；

- 比如我们使用了TypeScript等方式编写的代码，最终转换成JavaScript；

但是，当代码报错需要调试时（debug），调试转换后的代码是很困难的。

那么如何可以调试这种转换后不一致的代码呢？答案就是**source-map**

- source-map是从已转换的代码，映射到原始的源文件；
- 使浏览器可以重构原始源并在调试器中显示重建的原始源；

## 使用source-map

http://www.ruanyifeng.com/blog/2013/01/javascript_source_map.html

webpack在打包时，可以通过配置`devtool`选项生成source-map；

这里设置`devtool: source-map`并执行构建来看下效果。

我们可以看到`bundle.js`文件的最后一行是一行魔法注释：

```js
//# sourceMappingURL=bundle.js.map
```

它指向对应的source-map文件`bundle.js.map`。

浏览器会根据这一行注释，查找响应的source-map，并且根据source-map还原我们的代码，方便进行调试。

可在Chrome浏览器中开启source-map，默认是开启的：

![webpack中的source-map01](https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/Webpack5/webpack中的source-map01.PNG)

## 分析source-map

最初source-map生成的文件带下是原始文件的10倍，第二版减少了约50%，第三版又减少了50%，所以目前一个133kb的文件，最终的source-map的大小大概在300kb。

整个`bundle.js.map`代码如下：

```json
{
  "version": 3,
  "file": "bundle.js",
  "mappings": ";;;;;;;;;AAAA;AACA;AACA;;AAEA;AACA;AACA;;AAEA;AACA;AACA;AACA;;;;;;;;;;;;;;;;;ACXO;AACP;AACA;;AAEO;AACP;AACA;;;;;;;UCNA;UACA;;UAEA;UACA;UACA;UACA;UACA;UACA;UACA;UACA;UACA;UACA;UACA;UACA;UACA;;UAEA;UACA;;UAEA;UACA;UACA;;;;;WCtBA;WACA;WACA;WACA,eAAe,4BAA4B;WAC3C,eAAe;WACf,iCAAiC,WAAW;WAC5C;WACA;;;;;WCPA;WACA;WACA;WACA;WACA,yCAAyC,wCAAwC;WACjF;WACA;WACA;;;;;WCPA,8CAA8C;;;;;WCA9C;WACA;WACA;WACA,uDAAuD,iBAAiB;WACxE;WACA,gDAAgD,aAAa;WAC7D;;;;;;;;;;;;;;ACNA;AACA,QAAQ,WAAW,EAAE,mBAAO,CAAC,mCAAW;AACxC;AACsD;AACtD;AACA;AACA;AACA;AACA,YAAY,sDAAU;AACtB,YAAY,uDAAW",
  "sources": [
    "webpack://06_learn_webpack/./src/js/format.js",
    "webpack://06_learn_webpack/./src/js/math.js",
    "webpack://06_learn_webpack/webpack/bootstrap",
    "webpack://06_learn_webpack/webpack/runtime/compat get default export",
    "webpack://06_learn_webpack/webpack/runtime/define property getters",
    "webpack://06_learn_webpack/webpack/runtime/hasOwnProperty shorthand",
    "webpack://06_learn_webpack/webpack/runtime/make namespace object",
    "webpack://06_learn_webpack/./src/main.js"
  ],
  "sourcesContent": [
    "const dateFormat = (date) => {\n  return \"2020-12-12\";\n}\n\nconst priceFormat = (price) => {\n  return \"100.00\";\n}\n\nmodule.exports = {\n  dateFormat,\n  priceFormat\n}\n",
    "export const sum = (num1, num2) => {\n  return num1 + num2;\n}\n\nexport const mul = (num1, num2) => {\n  return num1 * num2;\n}\n",
    "// The module cache\nvar __webpack_module_cache__ = {};\n\n// The require function\nfunction __webpack_require__(moduleId) {\n\t// Check if module is in cache\n\tvar cachedModule = __webpack_module_cache__[moduleId];\n\tif (cachedModule !== undefined) {\n\t\treturn cachedModule.exports;\n\t}\n\t// Create a new module (and put it into the cache)\n\tvar module = __webpack_module_cache__[moduleId] = {\n\t\t// no module.id needed\n\t\t// no module.loaded needed\n\t\texports: {}\n\t};\n\n\t// Execute the module function\n\t__webpack_modules__[moduleId](module, module.exports, __webpack_require__);\n\n\t// Return the exports of the module\n\treturn module.exports;\n}\n\n",
    "// getDefaultExport function for compatibility with non-harmony modules\n__webpack_require__.n = function(module) {\n\tvar getter = module && module.__esModule ?\n\t\tfunction() { return module['default']; } :\n\t\tfunction() { return module; };\n\t__webpack_require__.d(getter, { a: getter });\n\treturn getter;\n};",
    "// define getter functions for harmony exports\n__webpack_require__.d = function(exports, definition) {\n\tfor(var key in definition) {\n\t\tif(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {\n\t\t\tObject.defineProperty(exports, key, { enumerable: true, get: definition[key] });\n\t\t}\n\t}\n};",
    "__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }",
    "// define __esModule on exports\n__webpack_require__.r = function(exports) {\n\tif(typeof Symbol !== 'undefined' && Symbol.toStringTag) {\n\t\tObject.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });\n\t}\n\tObject.defineProperty(exports, '__esModule', { value: true });\n};",
    "// commonjs模式导入es module\r\nconst { sum, mul } = require('./js/math');\r\n// es module模式导入commonjs\r\nimport { dateFormat, priceFormat } from './js/format';\r\n\r\nconsole.log(sum(20, 30));\r\nconsole.log(mul(20, 30));\r\n\r\nconsole.log(dateFormat(\"1213\"));\r\nconsole.log(priceFormat(\"1213\"));\r\n"
  ],
  "names": [],
  "sourceRoot": ""
}
```

字段含义如下：

- version：当前使用的版本，也就是最新的第三版；
- sources：从哪些文件转换过来的source-map和打包的代码（最初始的文件）；
- names：转换前的变量和属性名称（因为目前使用的是development模式，所以不需要保留转换前的名称）；
- mappings：source-map用来和源文件映射的信息（比如位置信息等），一串base64 VLQ（veriable-length quantity可变长度值）编码；
- file：打包后的文件（浏览器加载的文件）；
- sourceContent：转换前的具体代码信息（和sources是对应的关系）；
- sourceRoot：所有的sources相对的根目录；

关于source-map的具体细节可参考[JavaScript Source Map 详解](http://www.ruanyifeng.com/blog/2013/01/javascript_source_map.html)

## 生成source-map

如何在使用webpack打包的时候，生成对应的source-map呢？

webpack为提供了非常多的选项（目前是26个），来处理source-map，详见[Devtool](https://webpack.docschina.org/configuration/devtool/)。

选择不同的值，生成的source-map会稍微有差异，打包的过程也会有性能的差异，可以根据不同的情况进行选择。

例如我们可以设置`none`、`eval`、`eval-cheap`，这里不需要记住每个值的含义，只需要理解其中几个关键字`eval`、`cheap`、`inline`、`source-map`、`nosources`的含义，其它值都是这些关键字的组合。

### 不生成source-map的配置值

下面几个值不会生成source-map：

- `false`：不使用source-map，也就是没有任何和source-map相关的内容。
- `(none)`：(省略devtool)，即什么都不写，production模式下的默认值，不生成source-map。
- `eval`：development模式下的默认值，不生成source-map。
  - 但是它会在eval执行的代码中，添加 `//# sourceURL=xxx`的注释，会被浏览器在执行时解析，并且在调试面板中生成对应的一些文件目录，方便我们调试代码；

设置`devtool： 'eval'`可看到生成代码中有如下片段：

```js
eval("const dateFormat = (date) => {\n  return \"2020-12-12\";\n}\n\nconst priceFormat = (price) => {\n  return \"100.00\";\n}\n\nmodule.exports = {\n  dateFormat,\n  priceFormat\n}\n\n\n//# sourceURL=webpack://06_learn_webpack/./src/js/format.js?");
```

我们编写的代码，都会转成了字符串代码包裹在eval函数中，之所以这样来写就是为了可以在函数结尾加上注释：`//# sourceURL=webpack://06_learn_webpack/./src/js/format.js?`，这个注释只会在eval函数中生效。目的就是为了让这行注释生效，**让我们的打包后的代码可以在浏览器中被重新转回到对应文件中，方便进行调试。**

在`format.js`文件中添加一行代码如下

```js {9}
const dateFormat = (date) => {
  return "2020-12-12";
}

const priceFormat = (price) => {
  return "100.00";
}

console.log(hello)

module.exports = {
  dateFormat,
  priceFormat
}
```

重新打包后再运行页面，很显然会有如下报错

```js
format.js:9 Uncaught ReferenceError: hello is not defined
    at eval (format.js:9:13)
    at Object../src/js/format.js (bundle.js:18:1)
    at __webpack_require__ (bundle.js:64:41)
    at eval (main.js:2:68)
    at Object../src/main.js (bundle.js:40:1)
    at __webpack_require__ (bundle.js:64:41)
    at bundle.js:116:37
    at bundle.js:118:12
```

点击打开后可看到浏览器已经根据eval中的注释将我们的代码还原了。

![image](https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/Webpack5/image.png)

但是可以注意到，浏览器并未还原所有的JS代码文件，这里就没有还原`math.js`文件。因为执行到此处时已经报错了，JS代码不再继续执行，就只还原了已经执行的eval函数中的原代码。

这个参数也不会还原所有的文件，这里的导入使用的还是webpack中实现的加载函数

![webpack中的source-map06](https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/Webpack5/webpack中的source-map06.png)

### 值source-map

source-map：会生成一个独立的source-map文件，并且在bundle文件中末尾有一个注释`//# sourceMappingURL=xxx.js.map`，指向source-map文件。**还原所有源文件**

设置`devtool： 'source-map'`再进行打包，我们可以在浏览器中看到还原代码：

![webpack中的source-map03](https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/Webpack5/webpack中的source-map03.png)

它会还原我们代码中使用到的所有代码，包括webpack中使用到的代码，以及我们引用库中的代码。

这样无论是哪里的代码出现错误，都可以准确地定位到。

### 值eval-source-map

eval-source-map：会生成sourcemap，但是source-map是以DataUrl添加到eval函数的后面，即以base64为转码的source-map添加到eval函数的后面。**只还原执行到的源文件**

配置`devtool： 'eval-source-map'`再进行打包，可以看到打包代码使用eval函数包裹，末尾添加了base64位编码的字符串：

```js
eval("const dateFormat = (date) => {\n  return \"2020-12-12\";\n}\n\nconst priceFormat = (price) => {\n  return \"100.00\";\n}\n\nconsole.log(hello)\n\nmodule.exports = {\n  dateFormat,\n  priceFormat\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvanMvZm9ybWF0LmpzLmpzIiwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8wNl9sZWFybl93ZWJwYWNrLy4vc3JjL2pzL2Zvcm1hdC5qcz84ZTQyIl0sInNvdXJjZXNDb250ZW50IjpbImNvbnN0IGRhdGVGb3JtYXQgPSAoZGF0ZSkgPT4ge1xuICByZXR1cm4gXCIyMDIwLTEyLTEyXCI7XG59XG5cbmNvbnN0IHByaWNlRm9ybWF0ID0gKHByaWNlKSA9PiB7XG4gIHJldHVybiBcIjEwMC4wMFwiO1xufVxuXG5jb25zb2xlLmxvZyhoZWxsbylcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGRhdGVGb3JtYXQsXG4gIHByaWNlRm9ybWF0XG59XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./src/js/format.js\n");
```

浏览器也只是还原了部分源文件，也就是说置只还原了已经执行的JS文件，未执行的不还原。

![webpack中的source-map04](https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/Webpack5/webpack中的source-map04.png)

### 值inline-source-map

inline-source-map：会生成sourcemap，但是source-map是以DataUrl添加到bundle文件的末尾，即base64编码的source-map添加到bundle文件的末尾。**还原所有源文件**

配置`devtool： 'inline-source-map'`再进行打包，在`bundle.js`文件末尾我们可以看到如下注释：

```js
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozt...
```

浏览器中还原了所有的源文件：

![webpack中的source-map05](https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/Webpack5/webpack中的source-map05.png)

### 值cheap-source-map

cheap-source-map：会生成sourcemap，但它不生成列映射（Column Mapping），只精确到行。会更加高效一些（cheap低开销）。

但是目前发现配合loader使用时候才可以看到差别，目前测试不使用loader时，所有配置都是一整行都会标红。

这里配合babel-loader进行测试，整行标红：

![webpack中的source-map07](https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/Webpack5/webpack中的source-map07.png)

修改`devtool: source-map`可以看到效果，具体到列标红：

![webpack中的source-map10](https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/Webpack5/webpack中的source-map10.png)

### 值cheap-module-source-map

cheap-module-source-map：会生成sourcemap，类似于cheap-source-map，但是对源自loader的sourcemap处理会更好。也就是说如果使用loader对我们的源码进行了特殊的处理，比如babel，那么使用此配置会更好地还原原代码。

这里使用babel-loader做下演示，安装babel相关依赖

```shell
npm i @babel/core @babel/preset-env babel-loader -D
```

在webpack中配置babel：

```js
module: {
  rules: [
    {
      test: /\.js$/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env']
        }
      }
    }
  ]
},
```

此时，如果使用`devtool: cheap-source-map`进行打包，我们会看到浏览器还原的的代码文件是ES5风格的，具体对应的源文件哪一行也有误差（源文件有15行，这里13行）：

![webpack中的source-map08](https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/Webpack5/webpack中的source-map08.png)

改用`devtool: cheap-module-source-map`再进行打包，浏览器会还原成我们的源代码风格：

![webpack中的source-map09](https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/Webpack5/webpack中的source-map09.png)

### 值hidden-source-map

hidden-source-map：会生成sourcemap，但是不会对source-map文件进行引用；相当于删除了打包文件中对sourcemap的引用注释；即删除打包文件最后一行的注释`//# sourceMappingURL=bundle.js.map`。

配置`devtool： 'hidden-source-map'`进行打包，我们可以看到打包文件`bundle.js`中没有最后一行的注释，但是也生成了相应的`bundle.js.map`文件。

如果我们手动添加进来注释，那么sourcemap就又会生效了。`bundle.js`末尾添加注释，sourcemap就会又生效。

```js
//# sourceMappingURL=bundle.js.map
```

### 值nosources-source-map

nosources-source-map：会生成sourcemap，但是生成的sourcemap只有错误信息的提示，不会生成源代码文件；

配置`devtool： 'hidden-source-map'`进行打包，在浏览器的控制台中我们可以看到正确的错误提示：

![webpack中的source-map11](https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/Webpack5/webpack中的source-map11.png)

但是点击跳转后，可以看到没有对应的原代码文件

![webpack中的source-map12](https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/Webpack5/webpack中的source-map12.png)

## 多个值组合

事实上，webpack提供给我们的26个值，是可以进行多组合的。26个值就是上面几个值的组合。

组合的规则如下：

- `inline-|hidden-|eval`：三个值时三选一；
- `nosources`：可选值；
- `cheap`：可选值，并且可以跟随`module`的值；

语法如下：

`[inline-|hidden-|eval-][nosources-][cheap-[module-]]source-map`

那么在开发中，最佳的实践是什么呢？

- 开发阶段：推荐使用`source-map`或者`cheap-module-source-map`。
  - 这分别是Vue和React使用的值，可以获取调试信息，方便快速开发；
- 测试阶段：推荐使用`source-map`或者`cheap-module-source-map`
  - 测试阶段我们也希望在浏览器下看到正确的错误提示
- 发布阶段：`false`、缺省值（不写）
