---
title: "Webpack自定义Plugin"
date: "2022-06-25 17:16:53"
series:
  name: "Webpack5使用学习"
  order: 13
tags:
  - "Webpack5使用学习"
draft: false
---

## Compiler和Compilation

webpack有两个非常重要的类：Compiler和Compilation。

Compiler和Compilation的区别如下：

- Compiler：在Webpack构建之初就会创建此对象，并且在webpack的整个生命周期中都会存在(before - run - beforeCompiler - compile - make - finishMake - afterCompiler)，只要是webpack编译，都会创建一个Compiler，也就是每次执行如npm run build时会创建Compiler对象
- Compilation是到准备编译模块（如main.js），才会创建Compilation对象，主要存在于 compile之后 - make之前，且是make阶段主要使用的对象。

那么为什么要引入Compilation，只使用Compiler是否可以？

答案是不可以的。Compiler在整个生命周期中只使用一个对象即可。但是Compilation是每次编译都会创建新的。

比如webpack开启了watch，只要是原代码发生了变化，就需要重新编译模块；此时重新编译，如果再创建Compiler对象显然是不合理的，Compiler对象在初始化过程中做了很多操作，详见createCompiler。原代码发生改变，Compiler是可以继续使用的。

那么这个重新编译的工作，就可以创建一个新的Compilation对象来做编译。它们两个的生命周期不同，使用阶段也就不同。

## Webpack和Tapable

Compiler和Compilation是通过注入插件的方式，来监听webpack的所有生命周期。

插件的注入离不开各种各样的Hook，而他们的Hook是如何得到的呢？

其实是创建了Tapable库中的各种Hook的实例；所以，如果我们想要学习自定义插件，最好先了解[Tapable](https://github.com/webpack/tapable)

Tapable是官方编写和维护的一个库；这个库对外提供了很多Hook类，可以使用这些类创建插件的Hook。

```js
const {
	SyncHook,
	SyncBailHook,
	SyncWaterfallHook,
	SyncLoopHook,
	AsyncParallelHook,
	AsyncParallelBailHook,
	AsyncSeriesHook,
	AsyncSeriesBailHook,
	AsyncSeriesWaterfallHook
} = require("tapable");
```

在Webpack文档中可以看到这些由Tapable提供的生命周期Hook，包括[compiler 钩子](https://webpack.docschina.org/api/compiler-hooks/)和[compilation 钩子](https://webpack.docschina.org/api/compilation-hooks/)

Hook 的类型可以按照 **事件回调的运行逻辑** 或者 **触发事件的方式** 来分类。

事件回调的运行逻辑可分为四种：

- Basic：基础类型，单纯地调用注册的事件回调，并不关心其内部的运行逻辑；
- Bail：保险类型，当一个事件在运行时返回值不为`undefined`时，就会停止后面事件回调的执行；
- Waterfall：瀑布类型，如果当前执行的事件回调返回值不为`undefined`时，会将这次返回的结果作为下一个回调事件的第一个参数；
- Loop：循环类型，如果当前执行事件回调函数的返回值不为`undefined`，重新从第一个注册的事件回调执行，直到当前执行的事件回调没有返回值。

触发事件的方式可分同步和异步两种：

- Sync：Sync开头的Hook类只能用`tap`方法注册事件回调，这类事件回调是同步执行的；如果使用`tapAsync`或`tapPromise`方法注册则会报错。
- Async：Async开头的Hook类，无法用`call`方法触发事件，必须用`callAsync`或者`promise`方法触发，这两个方法都能触发`tap`、`tapAsync`、`tapPromise`注册的事件回调。按照串行和并行，异步Hook类又分为：
  - AsyncSeries：按照顺序执行，当前事件回调如果是异步的，那么会等异步执行完毕才会执行下一个事件回调；
  - AsyncParelle：并行执行所有的事件回调。

## 自定义插件

在之前的学习中，已经使用了非常多的Plugin，如CleanWebpackPlugin、HTMLWebpackPlugin、MiniCSSExtractPlugin、CompressionPlugin。

这些Plugin被注册到webpack的生命周期中的过程如下：

1. 在webpack函数的createCompiler方法中，注册了所有的插件；
2. 在注册插件时，会调用插件函数或者插件对象的apply方法；
3. 插件方法会接收compiler对象，我们可以通过compiler对象来注册Hook的事件；
4. 某些插件也会传入一个compilation的对象，我们也可以监听compilation的Hook事件；

这里示例演示，将静态文件上传到指定服务器。

那么上传时机在资源输出到目录后，应该监听[afterEmit](https://webpack.docschina.org/api/compiler-hooks/#afteremit)钩子，这个钩子会在输出 asset 到 output 目录之后执行。

创建插件`/plugins/AutoUploadWebpackPlugin.js`

```js
const { NodeSSH } = require('node-ssh');

class AutoUploadWebpackPlugin {
  constructor(options) {
    this.options = options;
    this.ssh = new NodeSSH();
  }

  // 插件必须实现apply方法
  apply(compiler) {
    // 监听输出 asset 到 output 目录之后执行的Hook
    compiler.hooks.afterEmit.tapAsync('AutoUploadWebpackPlugin', async (compilation, callback) => {
      // 1. 获取打包输出目录
      const outputPath = compilation.outputOptions.path;
      console.log('打包了', outputPath)

      // 2. 创建SSH连接
      await this.connectServer()

      // 3. 删除服务端之前的资源文件
      const serverDir = this.options.remotePath;
      this.ssh.execCommand(`rm -rf ${serverDir}/*`);

      // 4. 上传文件
      this.uploadFiles(outputPath, serverDir)

      // 5. 断开SSH连接
      this.ssh.dispose();

      callback();
    });
  }

  async connectServer() {
    try {
      await this.ssh.connect({
        host: this.options.host,
        username: this.options.username,
        password: this.options.password
      });
      console.log('连接成功~');
    } catch (error) {
      console.log('连接失败：', error);
    }
  }

  async uploadFiles(localPath, remotePath) {
    const status = await this.ssh.putDirectory(localPath, remotePath, {
      recursive: true,
      concurrency: 10
    });
    console.log('传送到服务器: ', status ? "成功": "失败");
  }
}

module.exports = AutoUploadWebpackPlugin;
```

在Webpack中配置插件：

```js
const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const AutoUploadWebpackPlugin = require('./plugins/AutoUploadWebpackPlugin');

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
    ],
  },
  plugins: [
    new HtmlWebpackPlugin(),
    new AutoUploadWebpackPlugin({
      host: '127.0.0.1',
      username: 'ccbean',
      password: '**********',
      remotePath: '/root/server'
    })
  ],
};
```

开发插件本质就是监听Webpack生命周期，然后进行相关的功能开发。
