---
title: "Gulp的使用"
date: "2022-06-28 19:39:18"
series:
  name: "Webpack5使用学习"
  order: 15
tags:
  - "Webpack5使用学习"
draft: false
---

## 什么是Gulp

> A toolkit to automate & enhance your workflow；

[Gulp](https://gulpjs.com/)是一个自动化和增强工作流程的工具包。

Gulp是一个基于流的自动化构建工具，除了可以管理和执行任务，还支持监听文件、读写文件。

gulp可翻译为喝一大口，下图gulp的Logo就很贴切。

![glup的使用01](https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/Webpack5/glup的使用01.gif)

Gulp的最大特点是引入了流的概念，同时提供了一系列常用的插件去处理流，流可以在插件之间传递。

Gulp是一系列的工作流，比如定义各种Task，通过Gulp的工作流可以将TypeScript转成JavaScript、将PNG转成WebP、将Markdown转成HTML。

那么我们只需在Gulp中定义一系列任务，任务自动运行，就可以完成工作流了。

Gulp被设计得非常简单，只通过下面4种方法就可以支持几乎所有构建场景：

- 通过[gulp.task](https://www.gulpjs.com.cn/docs/api/task/)注册一个任务；
- 通过[gulp.watch](https://www.gulpjs.com.cn/docs/api/watch/)监听文件的变化；
- 通过[gulp.src](https://www.gulpjs.com.cn/docs/api/src/)读取文件；
- 通过[gulp.dest](https://www.gulpjs.com.cn/docs/api/dest/)写文件。

Gulp的优点是好用又不失灵活，既可以单独完成构建，也可以和其他工具搭配使用。其缺点和Grunt类似，集成度不高，要写很多配置后才可以用，无法做到开箱即用。

## Gulp和Webpack

Gulp的核心理念是任务运行（task runner）

- 主要用来定义一系列的任务，然后任务按照安排好的方式来运行。

- Gulp是基于文件Stream的构建流。通过读取流、转换流、写入流来进行操作。

- 在文件的转换过程中，可以使用Gulp的插件体系来完成某些任务。比如TypeScript转JavaScript，中间的转化过程就是接触Gulp的插件来完成的。整个转化过程，也就是一个Task。

Webpack的核心理念是模块打包（module bundler）

- webpack是一个静态模块化的打包工具；可以用来分析模块间的各种依赖，通过给定的入口，就可以自定完成打包。但是Gulp不具备模块化和打包功能，它只是一个任务流，用来做一些自动化的任务。
- Webpack可以使用各种各样的Loader来加载不同的模块；
- Webpack也有各种各样的插件，在Webpack的整个生命周期中来完成特定的Task；

Gulp相对于Webpack的优缺点：

- gulp相对于webpack思想更加的简单、API更加易用，更适合编写一些自动化的任务；
- 但是目前对于大型项目（Vue、React、Angular）并不会使用gulp来构建，因为默认gulp是不支持模块化的；

## Gulp的基本使用

安装Gulp

```shell
npm install gulp -D
```

在项目根目录下创建`gulpfile.js`文件，此文件名字一般就是固定的，用来定义Gulp的任务。

### 单个任务

定义一个任务：

```js
const foo = (cb) => {
  console.log('foo task working');
  cb();
}

module.exports = {
  foo
}
```

执行`npx gulp foo`，可看到控制台输出结果：

```shell
❯ npx gulp foo
[22:59:58] Using gulpfile D:\Code\Webpack\hello-webpack\29_gulp的基本使用\gulpfile.js
[22:59:58] Starting 'foo'...
foo task working
[22:59:58] Finished 'foo' after 1.72 ms
```

当创建的Task为默认任务时，运行Task不需要具体的任务名称：

```js
module.exports.default = (cb) => {
  console.log('default task working');
  cb();
}

// ❯ npx gulp
// [23:18:08] Using gulpfile D:\Code\Webpack\hello-webpack\29_gulp的基本使用\gulpfile.js
// [23:18:08] Starting 'default'...
// default task working
// [23:18:08] Finished 'default' after 1.62 ms
```

可以看到，每一个Task中最后都调用了`cb()`回调函数，因为每个gulp任务都是一个异步的JavaScript函数：

- 此函数可以接受一个callback作为参数，调用callback函数任务会结束；
- 或者是一个返回stream、promise、event emitter、child process或observable类型的函数；

Gulp的任务分为公共public或者私有private类型的任务：

- 公共任务（Public tasks） 从 gulpfile 中被导出（export），可以通过 gulp 命令直接调用；

- 私有任务（Private tasks） 被设计为在内部使用，通常作为 `series()` 或 `parallel()` 组合的组成部分；

  ```js
  // 公共任务 被导出了
  const foo = (cb) => {
    console.log('foo task working');
    cb();
  }

  // 私有任务 未被导出
  const bar = (cb) => {
    console.log('bar task working');
    cb();
  }

  module.exports = {
    foo
  }
  ```

### 任务组合

Gulp提供了组合任务的方法：

- `series()`：串行任务组合；
- `parallel()`：并行任务组合；

两个方法都可以接受任意数量的任务函数或者已经组合的任务来执行操作。

如下面的任务：

```js
const { series, parallel } = require('gulp');

const task1 = (cb) => {
  setTimeout(() => {
    console.log('task1 working')
    cb();
  }, 2000);
}

const task2 = (cb) => {
  setTimeout(() => {
    console.log('task2 working')
    cb();
  }, 2000);
}

const task3 = (cb) => {
  setTimeout(() => {
    console.log('task3 working')
    cb();
  }, 2000);
}

// 串行执行Task
const seriesTask = series(task1, task2, task3);
// 并行执行Task
const parallelTask = parallel(task1, task2, task3);
// 任意组合
const composeTask = parallel(task1, seriesTask, parallelTask);

module.exports = {
  seriesTask,
  parallelTask,
  composeTask
}
```

执行Task结果如下：

```shell
# 串行执行
❯ npx gulp seriesTask
[23:43:35] Using gulpfile D:\Code\Webpack\hello-webpack\29_gulp的基本使用\gulpfile.js
[23:43:35] Starting 'seriesTask'...
[23:43:35] Starting 'task1'...
task1 working
[23:43:37] Finished 'task1' after 2.01 s
[23:43:37] Starting 'task2'...
task2 working
[23:43:39] Finished 'task2' after 2.01 s
[23:43:39] Starting 'task3'...
task3 working
[23:43:41] Finished 'task3' after 2.01 s
[23:43:41] Finished 'seriesTask' after 6.04 s

# 并行执行
❯ npx gulp parallelTask
[23:44:57] Using gulpfile D:\Code\Webpack\hello-webpack\29_gulp的基本使用\gulpfile.js
[23:44:57] Starting 'parallelTask'...
[23:44:57] Starting 'task1'...
[23:44:57] Starting 'task2'...
[23:44:57] Starting 'task3'...
task1 working
[23:44:59] Finished 'task1' after 2.02 s
task2 working
[23:44:59] Finished 'task2' after 2.02 s
task3 working
[23:44:59] Finished 'task3' after 2.02 s
[23:44:59] Finished 'parallelTask' after 2.02 s

# 再组合
❯ npx gulp composeTask
[23:46:43] Using gulpfile D:\Code\Webpack\hello-webpack\29_gulp的基本使用\gulpfile.js
[23:46:43] Starting 'composeTask'...
[23:46:43] Starting 'task1'...
[23:46:43] Starting 'task1'...
[23:46:43] Starting 'task1'...
[23:46:43] Starting 'task2'...
[23:46:43] Starting 'task3'...
task1 working
[23:46:45] Finished 'task1' after 2.01 s
task1 working
[23:46:45] Finished 'task1' after 2.01 s
[23:46:45] Starting 'task2'...
task1 working
[23:46:45] Finished 'task1' after 2.01 s
task2 working
[23:46:45] Finished 'task2' after 2.01 s
task3 working
[23:46:45] Finished 'task3' after 2.01 s
task2 working
[23:46:47] Finished 'task2' after 2 s
[23:46:47] Starting 'task3'...
task3 working
[23:46:49] Finished 'task3' after 2 s
[23:46:49] Finished 'composeTask' after 6.02 s
```

- `npx gulp seriesTask` 串行执行3个Task，耗时 6.04s
- `npx gulp parallelTask` 并行执行3个Task，耗时 2.02 s

### 读取和写入文件

gulp 暴露了 [`src()`](https://www.gulpjs.com.cn/docs/api/src/) 和 [`dest()`](https://www.gulpjs.com.cn/docs/api/dest/) 方法用于[处理文件](https://www.gulpjs.com.cn/docs/getting-started/working-with-files/#%E5%A4%84%E7%90%86%E6%96%87%E4%BB%B6)。

`src()` 接受glob参数，并从文件系统中读取文件然后生成一个Node流（Stream）。它将所有匹配的文件读取到内存中并通过流（Stream）进行处理。

由 `src()` 产生的流（stream）应当从任务（task函数）中返回并发出异步完成的信号。

`dest()` 接受一个输出目录作为参数，并且它还会产生一个 Node流(stream)，通过该流将内容输出到文件中。

大多数情况下，利用 `.pipe()` 方法将插件放置在 `src()` 和 `dest()` 之间，并转换流（stream）中的文件。

流（stream）所提供的主要的 API 是 .pipe() 方法，它接受一个 转换流（Transform streams）或可写流（Writable streams）；那么转换流或者可写流，拿到数据之后可以对数据进行处理，再次传递给下一个转换流或者可写流；

所以本质是以流的形式进行传递，在每个pipe中做自己要做的操作。

`gulpfile.js`

```js
const { src, dest } = require('gulp');

const jsTask = () => {
  return src('./src/*.js')
    .pipe(dest('./build/'));
}

module.exports = {
  jsTask
};
```

`src/main.js`

```js
	const message = "Hello World";
console.log(message);

const foo = () => {
  console.log("foo");
}

foo();

console.log("Hello World");
```

执行`npx gulp jsTask`可看到`build`目录中原样输出了`main.js`文件。

如果在执行Task过程中，想要对文件进行某些处理，可以使用[社区提供的插件](https://gulpjs.com/plugins/)。

下面对`main.js`做如下转换：

- 使用[gulp-babel](https://www.npmjs.com/package/gulp-babel)插件将ES6转换成ES5；
- 使用[gulp-terser](https://www.npmjs.com/package/gulp-terser)插件，对代码进行压缩和丑化；

安装babel相关插件：

```shell
npm i -D gulp-babel @babel/core @babel/preset-env
```

使用babel插件：

```js {6}
const { src, dest } = require('gulp');
const babel = require('gulp-babel');

const jsTask = () => {
  return src('./src/*.js')
    .pipe(babel({ presets: ['@babel/preset-env'] }))
    .pipe(dest('./build/'))
}

module.exports = {
  jsTask
};
```

执行`npx gulp jsTask`，可看到代码已经转成了ES5风格：

```js
"use strict";

var message = "Hello World";
console.log(message);

var foo = function foo() {
  console.log("foo");
};

foo();
console.log("Hello World");
```

安装terser相关插件：

```shell
npm i -D gulp-terser
```

使用terser插件：

```js {8}
const { src, dest } = require('gulp');
const babel = require('gulp-babel');
const terser = require('gulp-terser');

const jsTask = () => {
  return src('./src/**/*.js')
    .pipe(babel({ presets: ['@babel/preset-env'] }))
    .pipe(terser({ mangle: { toplevel: true } }))
    .pipe(dest('./build/'))
}

module.exports = {
  jsTask
};
```

执行`npx gulp jsTask`，代码已被压缩丑化：

```js
"use strict";var o="Hello World";console.log(o);var l=function(){console.log("foo")};l(),console.log("Hello World");
```

### glob文件匹配

> https://www.gulpjs.com.cn/docs/getting-started/explaining-globs/

glob 是由普通字符和/或通配字符组成的字符串，用于匹配文件路径。可以利用一个或多个 glob 在文件系统中定位文件。

`src()` 方法接受一个 glob 字符串或由多个 glob 字符串组成的数组作为参数，用于确定哪些文件需要被操作。glob 或 glob 数组必须至少匹配到一个匹配项，否则 `src()` 将报错。

当使用 glob 数组时，将按照每个 glob 在数组中的位置依次执行匹配 - 这尤其对于取反（negative） glob 有用。

glob的匹配规则如下：

- 一个星号`*`：在一个字符串中，匹配任意数量的字符，包括零个匹配；对于匹配单级目录下的文件很有用。

  ```js
  // 匹配类似 index.js，但是不能匹配类似 scripts/index.js 或 scripts/nested/index.js
  '*.js'
  ```

- 两个星号`**`：在多个字符串片段中匹配任意数量的字符，包括零个匹配。 对于匹配嵌套目录下的文件很有用。确保适当地限制带有两个星号的 glob 的使用，以避免匹配大量不必要的目录。

  ```js
  // 匹配类似 scripts/index.js、scripts/nested/index.js 和 scripts/nested/twice/index.js 的文件。
  'scripts/**/*.js'
  // 如果没有 scripts/ 这个前缀做限制，node_modules 目录下的所有目录或其他目录也都将被匹配。
  ```

- 取反`!` ：由于 glob 匹配时是按照每个 glob 在数组中的位置依次进行匹配操作的，所以 glob 数组中的取反（negative）glob 必须跟在一个非取反（non-negative）的 glob 后面。第一个 glob 匹配到一组匹配项，然后后面的取反 glob 删除这些匹配项中的一部分。如果取反 glob 只是由普通字符组成的字符串，则执行效率是最高的。

  ```js
  // 匹配script下的所有js文件，但不包括scripts/vendor/下的
  ['script/**/*.js', '!scripts/vendor/']
  ```

### 文件监听

gulp api 中的 [watch()](https://www.gulpjs.com.cn/docs/api/watch/) 方法利用文件系统的监控程序（file system watcher）将 与进行关联。

```js {12}
const { src, dest, watch } = require('gulp');
const babel = require('gulp-babel');
const terser = require('gulp-terser');

const jsTask = () => {
  return src('./src/**/*.js')
    .pipe(babel({ presets: ['@babel/preset-env'] }))
    .pipe(terser({ mangle: { toplevel: true } }))
    .pipe(dest('./build/'))
}

// watch jsTask
watch("./src/**/*.js", jsTask);

module.exports = {
  jsTask
};
```

当jsTask中检测的代码发生变化，就会自动重新执行Task编译JS文件。

## Gulp的案例练习

接下来使用Gulp通过一个个Task来开启本地服务和打包。

### 打包HTML文件

使用[gulp-htmlmin](https://github.com/jonschlinkert/gulp-htmlmin)插件，处理HTML，类似于HtmlWebpackPlugin

```shell
npm i -D gulp-htmlmin
```

创建`htmlTask`

```js
const { src, dest } = require('gulp');
const htmlMin = require('gulp-htmlmin');

const htmlTask = () => {
  return src('./src/*.html')
    .pipe(htmlMin({ collapseWhitespace: true })) // 压缩空格
    .pipe(dest('./build'));
}

module.exports = {
  htmlTask
};
```

执行`npx gulp htmlTask`结果

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>

</body>
</html>

<!-- 打包结果 -->
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Document</title></head><body></body></html>
```

### 打包JS文件

使用Babel和Terser对JS文件进行打包处理。

安装babel和terser相关插件：

```shell
npm i -D gulp-babel @babel/core @babel/preset-env gulp-terser
```

创建`jsTask`，设置base保证输出

```js
const { src, dest } = require('gulp');
const babel = require('gulp-babel');
const terser = require('gulp-terser');

const jsTask = () => {
  return src('./src/js/*.js', { base: './src' })
    .pipe(babel({ presets: ['@babel/preset-env'] }))
    .pipe(terser({ mangle: { toplevel: true } }))
    .pipe(dest('./build'))
}

module.exports = {
  jsTask
};
```

执行`npx gulp jsTask`结果

```js
// main.js
const message = "Hello World";
console.log(message);

const foo = () => {
  console.log("foo");
}

foo();

console.log("Hello World");

// 打包后
"use strict";var o="Hello World";console.log(o);var l=function(){console.log("foo")};l(),console.log("Hello World");
```

### 打包less文件

使用[gulp-less](https://github.com/gulp-community/gulp-less#readme)插件以及[gulp-postcss](https://github.com/postcss/gulp-postcss)插件对less代码做转化

```shell
npm i gulp-less gulp-postcss postcss-preset-env -D
```

创建`lessTask`，使用postcss对less代码做转化

```js
const { src, dest } = require('gulp');
const less = require('gulp-less');
const postcss = require('gulp-postcss');
const postcssPresetEnv = require('postcss-preset-env');

const lessTask = () => {
  return src('./src/css/*.less', { base: './src' })
    .pipe(less())
    .pipe(postcss([postcssPresetEnv()]))
    .pipe(dest('./build'))
}

module.exports = {
  lessTask
};
```

执行`npx gulp lessTask`结果

```less
// style.less
body {
  background: red;
}

.container {
  font-size: 30px;
  span {
    color: green;
    user-select: none;
  }
}

// 打包后
body {
  background: red;
}
.container {
  font-size: 30px;
}
.container span {
  color: green;
  -webkit-user-select: none;
     -moz-user-select: none;
          user-select: none;
}
```

### 资源注入

上面打包的JS和CSS并没有注入到HTML文件中。

Gulp是一个自动化的工具，可以自动化处理任务，但是并不会处理文件之间的依赖关系。

可以实现对应的Task来注入资源，处理依赖关系。

使用[gulp-inject](https://github.com/klei/gulp-inject)插件可以实现此工作

```shell
npm i gulp-inject -D
```

创建`injectTask`，把打包好的`build/js/*.js`和`build/css/*.css`注入到打包的`build/index.html`中

```js
const inject = require('gulp-inject');

const injectTask = () => {
  return src('./build/*.html')
    // 读取打包好的js和css文件，inject到html中 relative: true 注入的脚本为相对路径
    .pipe(inject(src(['./build/js/*.js', './build/css/*.css'])))
    .pipe(dest('./build'))
}

module.exports = {
  htmlTask,
  jsTask,
  lessTask,
};
```

注意，index.html模板文件中要加入注释，来告诉插件注入资源的位置：

```js
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <!-- inject:css -->
  <!-- endinject -->
</head>
<body>
  <!-- inject:js -->
  <!-- endinject -->
</body>
</html>
```

执行`npx gulp injectTask`结果

```html
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Document</title><!-- inject:css --><link rel="stylesheet" href="/build/css/style.css"><!-- endinject --></head><body><!-- inject:js --><script src="/build/js/main.js"></script><script src="/build/js/math.js"></script><!-- endinject --></body></html>
```

### 搭建本地服务

使用[browser-sync](https://github.com/BrowserSync/browser-sync)插件

```shell
npm i -D browser-sync
```

创建`serve`

```js
const browserSync = require('browser-sync');

// 搭建本地服务器
const bs = browserSync.create();
const serve = () => {
  // 监听html js css 文件变动，以重新执行task
  watch("./src/*.html", series(htmlTask, injectTask));
  watch("./src/js/*.js", series(jsTask, injectTask));
  watch("./src/css/*.less", series(lessTask, injectTask));

  bs.init({
    port: 8080,
    open: true, // 在浏览器中打开
    files: "./build/*", // 哪些文件变化刷新浏览器
    server: {
      baseDir: "./build" // 服务于哪个目录
    }
  })
}

module.exports = {
  serve
};
```

执行`npx gulp serve`可启动8080端口的本地服务。

### 创建开发和打包任务

使用库[del](https://github.com/sindresorhus/del)用于清除旧的构建资源：

```shell
npm i del -D
```

创建任务：

```js
const cleanTask = () => {
  // 删除build目录
  return del(['build'])
}

// 清除旧的build -> 同时执行htmlTask, jsTask, lessTask -> 注入资源
const buildTask = series(cleanTask, parallel(htmlTask, jsTask, lessTask), injectTask);
// 构建 -> 启动服务
const serveTask = series(buildTask, serve);

module.exports = {
  buildTask,
  serveTask
};
```

在`package.json`中配置scripts

```json
"scripts": {
  "serve": "gulp serve",
  "build": "gulp build"
},
```

直接执行`npm run serve`启动开发服务，执行`npm run build`打包构建。

### 完整配置

`gulpfile.js`

```js
const { src, dest, watch, series, parallel } = require('gulp');
const htmlMin = require('gulp-htmlmin');
const babel = require('gulp-babel');
const terser = require('gulp-terser');
const less = require('gulp-less');
const postcss = require('gulp-postcss');
const postcssPresetEnv = require('postcss-preset-env');
const inject = require('gulp-inject');
const browserSync = require('browser-sync');
const del = require('del');

const htmlTask = () => {
  return src('./src/*.html')
    .pipe(htmlMin({ collapseWhitespace: true }))
    .pipe(dest('./build'));
}

const jsTask = () => {
  return src('./src/js/*.js', { base: './src' })
    .pipe(babel({ presets: ['@babel/preset-env'] }))
    .pipe(terser({ mangle: { toplevel: true } }))
    .pipe(dest('./build'))
}

const lessTask = () => {
  return src('./src/css/*.less', { base: './src' })
    .pipe(less())
    .pipe(postcss([postcssPresetEnv()]))
    .pipe(dest('./build'))
}

const injectTask = () => {
  return src('./build/*.html')
    // 读取打包好的js和css文件，inject到html中  relative: true 注入的脚本为相对路径
    .pipe(inject(src(['./build/js/*.js', './build/css/*.css']), { relative: true }))
    .pipe(dest('./build'))
}

// 搭建本地服务器
const bs = browserSync.create();
const serve = () => {
  // 监听html js css 文件变动，以重新执行task
  watch("./src/*.html", series(htmlTask, injectTask));
  watch("./src/js/*.js", series(jsTask, injectTask));
  watch("./src/css/*.less", series(lessTask, injectTask));

  bs.init({
    port: 8080,
    open: true, // 在浏览器中打开
    files: "./build/*", // 哪些文件变化刷新浏览器
    server: {
      baseDir: "./build" // 服务于哪个目录
    }
  })
}

const cleanTask = () => {
  // 删除build目录
  return del(['build'])
}

// 清除旧的build -> 同时执行htmlTask, jsTask, lessTask -> 注入资源
const buildTask = series(cleanTask, parallel(htmlTask, jsTask, lessTask), injectTask);
// 构建 -> 启动服务
const serveTask = series(buildTask, serve);

module.exports = {
  // htmlTask,
  // jsTask,
  // lessTask,
  // injectTask,
  // serve,
  buildTask,
  serveTask
};
```
