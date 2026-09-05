---
title: "Webpack中的DevServer和HMR"
date: "2022-05-19 20:03:46"
series:
  name: "Webpack5使用学习"
  order: 7
tags:
  - "Webpack5使用学习"
draft: false
---

目前我们开发的代码，为了运行需要有两个操作：

- 操作一：npm run build，编译相关的代码；
- 操作二：通过live server或者直接通过浏览器，打开index.html代码，查看效果；

这个过程经常操作会影响我们的开发效率，我们希望可以做到，当文件发生变化时，可以自动的完成 编译和展示；

为了完成自动编译，webpack提供了几种可选的方式：

- webpack watch mode；
- webpack-dev-server；
- webpack-dev-middleware

## webpack watch mode

webpack给我们提供了[watch模式](https://webpack.docschina.org/configuration/watch/)，在该模式下，webpack依赖图中的所有文件，只要有一个发生了更新，那么代码将被重新编译，我们不需要手动去运行`npm run build`指令。

开启watch模式有两种方法：

**方式一： 在webpack的配置中，添加 watch: true**

```json {2}
module.exports = {
  watch: true,
  entry: './src/main.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'build')
  },
  // ...
}
```

**方式二： 在启动webpack的命令中，添加 --watch的标识**

```json
"scripts": {
  "build": "webpack",
  "watch": "webpack --watch"
},
```

执行命令后，当文件繁盛修改，不用再此执行，webpack会自动监听。

## webpack DevServer

上面的方式可以监听到文件的变化，但是事实上它本身是没有自动刷新浏览器的功能的，当然，目前我们可以在VSCode中使用live-server来完成这样的功能。

但是，我们希望在不适用live-server的情况下，可以具备live reloading（实时重新加载）的功能。

我们可以使用[DevServer](https://webpack.docschina.org/configuration/dev-server/)来完成。

安装插件：

```shell
npm install webpack-dev-server -D
```

在`package.json`中添加启动脚本：

```json
"scripts": {
  "build": "webpack",
  "watch": "webpack --watch",
  "serve": "webpack serve"
},
```

运行`npm run serve`脚本就可以使用devServer了。

修改代码后，devServer会自动刷新浏览器页面。webpack-dev-server在编译之后不会将编译结果写入到任何输出文件。而是将 bundle文件保留在内存中，事实上是使用了一个叫[memfs](https://github.com/streamich/memfs)的库在内存中操作文件系统。

## webpack-dev-middleware

默认情况下，webpack-dev-server已经帮助我们做好了一切，比如通过express启动一个服务，比如HMR（热模块替换）；

如果我们想要有更好的自由度，可以使用[webpack-dev-middleware](https://webpack.docschina.org/guides/development/#using-webpack-dev-middleware)来定制自己的devServer。

webpack-dev-middleware 是一个封装器(wrapper)，它可以把 webpack 处理过的文件发送到一个 server。

webpack-dev-server 在内部使用了它，然而它也可以作为一个单独的 package 来使用，以便根据需求进行更多自定义设置。

安装express和webpack-dev-middleware：

```shell
npm install express webpack-dev-middleware -D
```

然后我们创建`server.js`文件：

```js
const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');

const app = express();

const config = require("./webpack.config");

// 传入配置信息, webpack根据配置信息进行编译
const compiler =  webpack(config);

// 生成中间件并使用
const middleware = webpackDevMiddleware(compiler);
app.use(middleware);

app.listen(3000, () => {
  console.log("server has been started at http://localhost:3000");
});
```

启动服务`node server.js`，在浏览器中可以看到编译后的效果。

当然，也可以选择Koa来搭建此服务。

以上所有方式的，每次再修改文件自动编译时，都会刷新整个页面，也就是对所有的文件都进行重新编译。假如有成百上千个模块，修改一处，全部编译，显然这是不合理的。

我们可以使用HMR来解决此问题。

## 模块热替换HMR

[模块热替换](https://webpack.docschina.org/concepts/hot-module-replacement)(HMR - hot module replacement)功能会在应用程序运行过程中，替换、添加或删除模块，而无需重新加载整个页面。

HMR通过如下几种方式，来提高开发的速度：

- 不重新加载整个页面，这样可以保留某些应用程序的状态不丢失
- 只更新需要变化的内容，节省开发的时间；
- 修改了css、js源代码，会立即在浏览器更新，相当于直接在浏览器的devtools中直接修改样式；

默认情况下，webpack-dev-server已经支持HMR，从Webpack4开始，热模块替换是默认开启的；在不开启HMR的情况下，当我们修改了源代码之后，整个页面会自动刷新，使用的是live reloading；

修改webpack配置以开启HMR：

```json
devServer: {
  hot: true
}
```

此时再执行`npm run serve`，此时可以看到浏览器控制台中有如下输出：

```shell {1,3,4}
[HMR] Waiting for update signal from WDS...
main.js:1 hello webpack!
index.js:551 [webpack-dev-server] Hot Module Replacement enabled.
index.js:551 [webpack-dev-server] Live Reloading enabled.
```

但是此时再修改文件，依然是刷新的整个页面，这是因为我们需要去指定哪些模块发生更新时，进行HMR，修改入口文件`main.js`如下：

```js {5-9}
import './util'

console.log('hello webpack')

if(module.hot) {
  module.hot.accept('./util', () => {
    console.log('utils 更新了')
  })
}
```

使用[accept函数](https://webpack.docschina.org/api/hot-module-replacement/#accept)监听`util.js`文件，当这个文件发生修改时，Webpack就会进行热替换，不会再刷新整个页面。

## 框架中使用HMR

在开发其他项目时，我们是否需要经常手动去写入`module.hot.accpet`相关的API，比如开发Vue、React项目，我们修改了组件，希望进行热更新，这个时候应该如何去操作。

这个问题，社区已经有了响应的[解决方案](https://webpack.docschina.org/guides/hot-module-replacement#other-code-and-frameworks)。

- vue开发中，使用vue-loader，此loader支持vue组件的HMR，提供开箱即用的体验；
- react开发中，有[React Hot Loader](https://github.com/gaearon/react-hot-loader)，实时调整react组件（目前React官方已经弃用了，改成使用[react-refresh](https://github.com/pmmmwh/react-refresh-webpack-plugin)）

### React的HMR

在之前，React是借助于React Hot Loader来实现的HMR，目前已经改成使用react-refresh来实现了。

安装react相关依赖：

```shell
npm install -D react react-dom
```

安装react HRM相关依赖：

```shell
npm install -D @pmmmwh/react-refresh-webpack-plugin react-refresh
```

配置`webpack.config.js`

```js
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')

module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.jsx?$/i,
        loader: 'babel-loader'
      }
    ]
  },
  plugins: [
	 // ...
    new ReactRefreshWebpackPlugin()
  ],
}
```

修改`babel.config.js`文件：

```js
module.exports = {
  presets: [
    '@babel/preset-env',
    '@babel/preset-react',
  ],
  plugins: [
    'react-refresh/babel'
  ]
}
```

创建`App.jsx`文件

```jsx
import React, { Component } from "react";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      message: "Hello React",
    };
  }

  render() {
    return (
      <div>
        <h2>{this.state.message}</h2>
      </div>
    );
  }
}

export default App;
```

在`main.js`中引用

```js
import React from 'react';
import ReactDom from 'react-dom';
import ReactApp from './App.jsx'

ReactDom.render(<ReactApp/>, document.getElementById('reactRoot'))
```

`npm run serve`后，刷新页面可以看到渲染出`Hello React`

### Vue的HMR

Vue的加载需要使用vue-loader，而vue-loader加载的组件默认会帮助我们进行HMR的处理。

安装Vue相关依赖：

```shell
npm install -D vue
```

安装加载vue所需要的依赖：

```shell
npm install vue-loader vue-template-compiler -D
```

配置`webpack.config.js`

```js
const { VueLoaderPlugin } = require('vue-loader')

module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.vue$/i,
        loader: 'vue-loader'
      },
      {
        test: /\.css$/i,
        use: [
          'style-loader',
          'css-loader'
        ]
      }
    ]
  },
  plugins: [
	 // ...
    new VueLoaderPlugin()
  ]
}
```

创建`App.vue`文件

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
    color: red
  }
</style>
```

在`main.js`中引用

```js
import { createApp } from 'vue'
import VueApp from './App.vue'


createApp(VueApp).mount('#vueRoot')
```

`npm run serve`后，刷新页面可以看到渲染出`Hello Vue`

## HMR的原理

HMR的原理是什么呢？如何可以做到只更新一个模块中的内容呢？

- webpack-dev-server会创建两个服务：提供静态资源的服务（express）和Socket服务（net.Socket）；
- express server负责直接提供静态资源的服务（打包后的资源直接被浏览器请求和解析）；
- HMR Socket Server，是一个通过websocket实现的socket的长连接，：
  - 长连接有一个最好的好处是建立连接后双方可以通信（服务器可以直接发送文件到客户端）；
  - 当服务器监听到对应的模块发生变化时，会生成两个文件.json（manifest文件）和.js文件（update chunk）；
  - 通过长连接，可以直接将这两个文件主动发送给客户端（浏览器）；
  - 浏览器拿到两个新的文件后，通过HMR runtime机制，加载这两个文件，并且针对修改的模块进行更新；

![webpack中的DevServer和HMR01](https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/Webpack5/webpack中的DevServer和HMR01.png)

1. 首次请求时，浏览器通过HTTP请求，获取express server中的所有资源。
2. 当有文件发生变化时，HMR Server会生成一个json文件和做修改的js文件。
3. 通过websocket连接将这两个文件发送到浏览器，浏览器中的HMR runtime机制，加载这两个文件
4. 针对修改的模块进行更新。

## 常见配置说明

### output.publicPath

该属性用于指定打包后`index.html`要加载资源对应的一个基本路径：

- 它的默认值是一个空字符串，所以打包后引入js文件时，路径就是`bundle.js`；

  ```js
  <script defer src="bundle.js"></script>
  ```

  那么，开发中启动的本地服务，请求资源就类似于`http://localhost:8080/bundle.js`

- 在开发中，我们也将其设置为 `/` ，路径是`/bundle.js`，

  ```js
  <script defer src="/bundle.js"></script>
  ```

  那么浏览器会根据所在的域名+路径去请求对应的资源，也是`http://localhost:8080/bundle.js`；

- 如果配置为`/assets`，那么生成如下：

  ```js
  <script defer src="/assets/bundle.js"></script>
  ```

  请求资源就是：`http://localhost:8080/assets/bundle.js`

- 如果我们希望在本地直接打开html文件来运行，会将其设置为 `./`，路径时` ./bundle.js`，可以根据相对路径去查找资源。

### devServer一些配置

#### static.publicPath 或 publicPath

**webpack5中已经移除`devServer.publicPath`配置，可用`static.publicPath`进行配置**

devServer中也有一个publicPath的属性，该属性是指定本地服务所在的文件夹：

- 它的默认值是 `/`，也就是我们直接访问端口即可访问其中的资源 `http://localhost:8080`；
- 如果我们将其设置为了`/abc`，那么我们需要通过 `http://localhost:8080/abc`才能访问到对应的打包后的资源；
- 并且这个时候，我们其中的bundle.js通过 `http://localhost:8080/bundle.js`也是无法访问的：
  - 必须将output.publicPath也设置为 `/abc`；
  - 官方Webpack4文档中有[提到](https://v4.webpack.js.org/configuration/dev-server/#devserverpublicpath-)，建议 devServer.publicPath 与 output.publicPath相同；

#### static.directory 或 contentBase

**webpack5中已经移除contentBase配置，可用`static.directory`进行配置**

devServer中contentBase对于我们直接访问打包后的资源其实并没有太大的作用，它的主要作用是如果我们打包后的资源，又依赖于其他的一些资源，那么就需要指定从哪里来查找这个内容：

- 比如在index.html中，我们需要依赖一个 `abc.js` 文件，这个文件我们存放在 public文件中；

在index.html中，我们应该如何去引入这个文件呢？

- 比如代码是这样的：

  ```js
  <script src="./public/abc.js"></script>
  ```

  但是这样打包后浏览器是无法通过相对路径去找到这个文件夹的

- 所以代码是这样的：

  ```js
  <script src="./abc.js"></script>
  ```

  再设置`contentBase: path.resolve(__dirname, './public')`即可

在devServer中还有一个可以监听`contentBase`发生变化后重新编译的一个属性：`watchContentBase`，**Webpack5中已移除，可使用`static.watch`配置**。

- 默认情况下当我们修改contentBase加载的文件，是不会触发重新编译的
- 设置`watchContentBase: true`，修改文件后会webpack也会自动重新编译。

#### hotOnly

**webpack5中已经移除该配置**

hotOnly是当代码编译失败时，是否刷新整个页面：

- 默认情况下当代码编译失败修复后，会重新刷新整个页面；
- 如果不希望重新刷新整个页面，可以设置`hotOnly: true`，此时仍会继续进行HMR，不会刷新整个页面；

#### host

设置主机地址：

- 默认值是`localhost`；
- 如果希望其他地方也可以访问，可以设置为 `0.0.0.0`；

#### port

设置监听的端口，默认情况下是8080

#### open

设置是否打开浏览器：

- 默认值是false，设置为true会打开浏览器；
- 也可以设置打开指定页面，详见[webpack5文档](https://webpack.docschina.org/configuration/dev-server/#devserveropen)

#### compress

是否为静态文件开启gzip compression

- 默认值是`true`

#### proxy

proxy是我们开发中非常常用的一个配置选项，它的目的设置代理来解决跨域访问的问题：

- 比如我们的一个api请求是 `http://localhost:8888`，但是本地启动服务器的域名是 `http://localhost:8000`，这个时候发送网络请求就会出现跨域的问题；
- 那么我们可以将请求先发送到一个代理服务器，代理服务器和API服务器没有跨域的问题，就可以解决我们的跨域问题了；

我们可以进行如下的设置：

- `target`：表示的是代理到的目标地址，比如`/api/moment`会被代理到`http://localhost:8888/api/moment`；
- `pathRewrite`：默认情况下，我们的`/api` 也会被写入到URL中，如果希望删除，可以使用pathRewrite；
- `secure`：默认情况下不接收转发到https的服务器上，如果希望支持，可以设置为false；
- `changeOrigin`：它表示是否更新代理后请求的headers中host地址；即是否修改代理请求中的headers中的host属性，默认是本地的host，改成true后是代理的host。

#### historyApiFallback

[historyApiFallback](https://webpack.docschina.org/configuration/dev-server/#devserverhistoryapifallback)是开发中一个非常常见的属性，它主要的作用是解决SPA页面在路由跳转之后，进行页面刷新时，返回404的错误。

boolean值：默认是false。如果设置为true，那么在刷新时，返回404错误时，会自动返回 index.html 的内容；

object类型的值，可以配置rewrites属性：可以配置from来匹配路径，to决定要跳转到哪一个页面；

devServer中实现historyApiFallback功能是通过[connect-history-api-fallback](https://github.com/bripkens/connect-history-api-fallback)库的。

### resolve模块解析

resolve用于设置模块如何被解析：

- 在开发中我们会有各种各样的模块依赖，这些模块可能来自于自己编写的代码，也可能来自第三方库；
- resolve可以帮助webpack从每个`require/import` 语句中，找到需要引入到合适的模块代码；
- webpack 使用 [enhanced-resolve](https://github.com/webpack/enhanced-resolve) 来解析文件路径；

webpack能解析三种文件路径：

- 绝对路径：由于已经获得文件的绝对路径，因此不需要再做进一步解析。
- 相对路径：
  - 在这种情况下，使用 `import` 或 `require` 的资源文件所处的目录，被认为是上下文目录；
  - 在 `import/require` 中给定的相对路径，会拼接此上下文路径，来生成模块的绝对路径；
- 模块路径
  - 在 [resolve.modules](https://webpack.docschina.org/configuration/resolve/#resolvemodules)中指定的所有目录检索模块；默认值是 `['node_modules']`，所以默认会从`node_modules`中查找文件

#### resolve.extensions

默认值是`[string] = ['.js', '.json', '.wasm']`

尝试按顺序解析这些后缀名。如果有多个文件有相同的名字，但后缀名不同，webpack 会解析列在数组首位的后缀的文件，并跳过其余的后缀。

确定是文件还是文件夹：

- 如果是一个文件：
  - 如果文件具有扩展名，则直接打包文件；
  - 否则，将使用`resolve.extensions`选项作为文件扩展名解析；

- 如果是一个文件夹：
  - 会在文件夹中根据[resolve.mainFiles](https://webpack.docschina.org/configuration/resolve/#resolvemainfiles)配置选项中指定的文件顺序查找
    - `resolve.mainFiles`默认是`['index']`
    - 然后再根据 `resolve.extensions`来解析扩展名；

#### resolve.alias

- 当我们项目的目录结构比较深的时候，或者一个文件的路径可能需要 `../../../`这种路径片段；
- 可以给某些常见的路径起一个别名；

### 常见配置说明完整配置

```js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');

module.exports = {
  mode: "development",
  entry: "./src/index.js",
  output: {
    clean: true,
    filename: "bundle.js",
    path: path.resolve(__dirname, "./build"),
    // publicPath: '/test'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/i,
        use: "babel-loader"
      },
      {
        test: /\.vue$/i,
        use: "vue-loader"
      },
      {
        test: /\.css/i,
        use: [
          "style-loader",
          "css-loader"
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html"
    }),
    new ReactRefreshWebpackPlugin(),
    new VueLoaderPlugin()
  ],
  resolve: {
    extensions: ['.js', '.json', '.jsx', '.ts', '.vue', '.wasm', '.mjs'],
    alias: {
      '@': path.resolve(__dirname, './src'),
      "@pages": path.resolve(__dirname, "./src/pages")
    }
  },
  devServer: {
    hot: true,
    host: 'localhost',
    port: 9090,
    open: true,
    compress: true,
    static: {
      directory: path.join(__dirname, './public'), // 同之前的devServer.contentBase
      // publicPath: '/test', // 同之前的devServer.publicPath
      watch: true // 同之前的devServer.watchContentBase
    },
    proxy: {
      // '/api': 'http://httpbin.org',
      '/api': {
        target: 'http://httpbin.org',
        pathRewrite: {
          '^/api': ''
        },
        changeOrigin: true
      },
      '/hello': {
        target: 'http://localhost:9999',
        pathRewrite: {
          '^/hello': ''
        },
        logLevel: 'debug',
        changeOrigin: true
      }
    },
    historyApiFallback: true,
    // historyApiFallback: {
    //   rewrites: [
    //     {from: /abc/, to: "/index.html"}
    //   ]
    // }
  }
}
```
