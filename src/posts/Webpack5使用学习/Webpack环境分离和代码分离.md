---
title: "Webpack环境分离和代码分离"
date: "2022-05-24 22:51:18"
series:
  name: "Webpack5使用学习"
  order: 8
tags:
  - "Webpack5使用学习"
draft: false
---

## 区分开发环境

当配置越来越多时，单文件的Webpack配置会变得越来越不容易维护；某些配置只在开发环境需要使用，某些配置只在生成环境需要使用，对配置进行划分，方便维护和管理。

在启动时区分不同的配置有两种方案：

- 编写不同的配置文件，开发和生成时，分别加载不同的配置文件，结合插件webpack-merge来实现；
- 方式二：使用相同的一个入口配置文件，webpack配置为[导出函数](https://webpack.docschina.org/configuration/configuration-types/#exporting-a-function)，通过设置[Environment ](https://webpack.docschina.org/api/cli/#environment-options)参数来区分它们；

### 方案一 多配置文件

结合插件webpack-merge来实现。

在package.json中添加脚本：

```json
"scripts": {
  "build": "webpack --config ./config/webpack.prod.js",
  "serve": "webpack serve --config ./config/webpack.dev.js",
},
```

首先我们创建一个配置文件`webpack.base.js`：

```js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');

module.exports = {
  context: path.resolve(__dirname, '../'),
  entry: './src/index.js',
  output: {
    clean: true,
    filename: "bundle.js",
    path: path.resolve(__dirname, "../build"),
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
    new VueLoaderPlugin()
  ],
  resolve: {
    extensions: ['.js', '.json', '.jsx', '.ts', '.vue', '.wasm', '.mjs'],
    alias: {
      '@': path.resolve(__dirname, '../src'),
      "@pages": path.resolve(__dirname, "../src/pages")
    }
  }
}
```

然后分别创建两个配置：

`webpack.dev.js`

```js
const path = require('path');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const { merge } = require('webpack-merge');
const baseConfig = require('./webpack.base');

process.env.NODE_ENV = 'development'

module.exports = merge(baseConfig, {
  mode: "development",
  plugins: [
    new ReactRefreshWebpackPlugin(),
  ],
  devServer: {
    hot: true,
    host: 'localhost',
    port: 9090,
    open: true,
    compress: true,
    static: {
      directory: path.join(__dirname, '../public'), // 同之前的devServer.contentBase
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
})
```

`webpack.prod.js`

```js
const { merge } = require('webpack-merge');
const baseConfig = require('./webpack.base');

module.exports = merge(baseConfig, {
  mode: "production",
})
```

### 方案二 environment参数

在package.json中添加脚本：

```json
"scripts": {
  "build2": "webpack --config ./config/webpack.common.js --env production",
  "serve2": "webpack serve ./config/webpack.common.js --env development"
},
```

然后我们在`config/webpack.common.js`中以导出函数形式实现配置：

```js
const path = require('path')

module.exports = function (env) {
  console.log('======= env ========', env)

  return {
    context: path.resolve(__dirname, '../'),
    entry: './src/main.js',
    output: {
      path: path.resolve(__dirname, '../build')
    }
  }
}
```

执行`npm run build2`可以看到日志输出：

```js
======= env ======== { WEBPACK_BUNDLE: true, WEBPACK_BUILD: true, production: true }
```

那么，就可以根据`env.production`来区分环境。

具体配置略过。

### 入口和上下文配置

我们可以注意到，配置文件在`config`目录下，但是我们的`entry`配置为`'./src/main.js'`，而不是`../src/main.js`。

这里`entry`的相对路径和`context`即上下文配置有关，上下文是入口文件所处的目录的绝对路径的字符串。

默认使用 Node.js 进程的当前工作目录，也就是我们运行脚本，如`npm run build2`时的执行目录。通常就是我们的根目录。

上面的`context`的配置是上一级目录，也等同于默认配置，指向了根目录。

如果配置`context`为当前目录即`path.resolve(__dirname, './')`，那么`entry`配置如下：

```js
const path = require('path')

module.exports = function (env) {
  return {
    context: path.resolve(__dirname, './'),
    entry: '../src/main.js',
    output: {
      path: path.resolve(__dirname, '../build')
    }
  }
}
```

## 代码分离

### 认识代码分离

代码分离（Code Splitting）是webpack一个非常重要的特性：

- 它主要的目的是将代码分离到不同的bundle中，之后可以按需加载，或者并行加载这些文件；

- 比如默认情况下，所有的JavaScript代码（业务代码、第三方依赖、暂时没有用到的模块）在首页全部都加载，就会影响首页的加载速度；
- 代码分离可以分出出更小的bundle，以及控制资源加载优先级，提供代码的加载性能；

假如我们有一段代码：

```js
import moment from 'moment'
import lodash from 'lodash'


console.log(lodash.join(['hello', 'webpack']))
console.log(moment().format('YYYY-MM-DD HH:MM:SS'))
```

默认情况下，执行`npm run build`进行打包时，所有代码都会被打包到一个文件中。

这就导致页面在执行时，首次加载会很慢，Webpack给我们提供了解决方案。

Webpack中常用的代码分离有三种：

- 入口起点：使用entry配置手动分离代码；
- 防止重复：使用Entry Dependencies或者SplitChunksPlugin去重和分离代码；
- 动态导入：通过模块的内联函数调用来分离代码；

### 手动入口分离代码

之前我们都是简单配置入口entry，如`entry: './src/index.js'`

entry支持多种格式配置，如字符串、数组、对象。详见[入口起点](https://webpack.docschina.org/concepts/entry-points)。

我们可以根据多入口配置，进行手动分离，配置如下：

```json
module.exports = {
  entry: {
    main: './src/main.js',
    index: './src/index.js'
  },
  output: {
    clean: true,
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, '../build'),
  },
  // ...
}
```

默认情况下，入口 chunk 的输出文件名是从 [`output.filename`](https://webpack.docschina.org/configuration/output/#outputfilename) 中提取出来的。也可以配置`entry.filename`来指定一个自定义的输出文件名。

此时再执行打包，可以看到打包出`index.bundle.js`和`main.bundle.js`两个文件。

但这两个文件中都包含了第三方库`momnet`和`lodash`的代码，文件会很大，而且很明显，大部分代码都是相同的。

可以将这些公共的第三方库配置为入口：

```json
entry: {
  main: { import: './src/main.js', dependOn: ['lodash', 'moment'] },
  index: { import: './src/index.js', dependOn: 'lodash' },
  lodash: 'lodash',
  moment: 'moment'
},
```

将`lodash`、`moment`第三方库设置成入口，通过`dependOn`配置当前入口所依赖的入口。第三方代码可被抽离到单独文件中。

可以将多个第三方库抽离到一个单独文件中：

```json
entry: {
  main: { import: './src/main.js', dependOn: 'shared' },
  index: { import: './src/index.js', dependOn: 'shared' },
  shared: ['lodash', 'moment']
},
```

上面的配置，会将`loadash`和`moment`抽离到`shared.bundle.js`这一个文件中。如果其它入口依赖相同，可以进行上述配置。

另外可以看到，打包目录下会有`index.bundle.js.LICENSE.txt`和`main.bundle.js.LICENSE.txt`文件，这是我们所用到代码的License，可以配置[TerserWebpackPlugin](https://webpack.docschina.org/plugins/terser-webpack-plugin/)优化，配置[`extractComments`](https://webpack.docschina.org/plugins/terser-webpack-plugin/#extractcomments)去掉这部分注释的抽离。

下面的配置License注释不会抽离，而是保留在打包文件中。

```json
optimization: {
  minimizer: [
    new TerserPlugin({
      extractComments: false
    })
  ]
},
```

Webpack4之后，官方并不推荐这种代码分离方式，而是推荐使用 [`optimization.splitChunks`](https://webpack.docschina.org/configuration/optimization/#optimizationsplitchunks) ，将 第三方库和app(应用程序) 模块分开，并为其创建一个单独的文件。不要为 vendor 或其他不是执行起点创建 entry。

### splitChunks分离代码

目前官方推荐使用此方式对代码进行分离。

[SplitChunksPlugin](https://webpack.docschina.org/plugins/split-chunks-plugin/)默认已集成到Webpack，开箱即用。

Webpack提供了SplitChunksPlugin[默认的配置](https://webpack.docschina.org/plugins/split-chunks-plugin/#optimizationsplitchunks)。

我们可以自定义SplitChunksPlugin的配置，接下来对该插件的常用参数进行说明：

#### chunks

`chunks`表明将选择哪些 chunk 进行优化。

可设置为`all`、`async` 、 `initial`。

- 默认值是`async`，表示只有代码中存在异步引入时，才会对代码进行分离。
- ` initial`表示对同步代码进行代码分离。
- `all`表示无论是同步还是异步代码，都会分离。开发中通常设置成此配置。

测试`async`，设置配置如下：

```json
{
  entry: {
    main: './src/main.js',
    index: './src/index.js'
  },
  output: {
    clean: true,
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, '../build'),
  },
  // ...
  optimization: {
    // ...
    splitChunks: {
      chunks: 'async'
    }
  }
}
```

修改文件`main.js`和`index.js`进行测试：

```js
import moment from 'moment'

console.log(moment().format('YYYY-MM-DD HH:MM:SS'))

import('lodash').then((res) => {
   console.log('hello webpack from async')
})
```

`npm run build`打包可以看到生成了异步加载的抽离文件`974.bundle.js`。入口文件会小很多。

#### minSize

拆分包的大小，至少为minSize；如果一个包拆分出来达不到minSize，那么这个包就不会拆分；

默认值为`20000`即20kb，通常就使用默认值。

#### maxSize

将大于maxSize的包，拆分为不小于minSize的包； 默认为`0`

比如设置`minSize: 20000, maxSize: 30000`，那么大于30kb的包就会被拆分成一个20kb和一个10kb的包。

maxSize的优先级小于minSize，即优先满足minSize的设置。

#### minChunks

至少被引入的次数，默认是`1`；

如果设置为`2`，但是只引入了1次，那么不会被单独拆分；

#### cacheGroups

用于对拆分的包进行分组，比如一个lodash在拆分之后，并不会立即打包，而是会等到所有符合规则的包加载完成后一起打包到一个文件中。

每个键可对应设置一个对象，可设置属性：

- `test`：匹配符合规则的包；
- `name`：拆分包的name属性；
- `filename`：拆分包名称。可以使用占位属性，如`[id]_vendors.js`
- `name`：设置拆包的名称。用来设置固定名称，不能使用占位属性。
- `priority`：设置优先级 当同时满足多个打包配置时，使用配置的优先级。值越大优先级越高，通常设置为负值。

具体配置可查看[文档](https://webpack.docschina.org/plugins/split-chunks-plugin/#splitchunkscachegroups)

#### 开发中设置

开发中我们通常不会设置这么多属性，大部分使用默认设置

如Vue脚手架`@vue/cli@5.0.4`创建的Vue项目，在`node_modules/@vue/cli-service/lib/config/app.js`中，可看到如下配置：

```js
webpackConfig.optimization.splitChunks({
  cacheGroups: {
    defaultVendors: {
      name: `chunk-vendors`,
      test: /[\\/]node_modules[\\/]/,
      priority: -10,
      chunks: 'initial'
    },
    common: {
      name: `chunk-common`,
      minChunks: 2,
      priority: -20,
      chunks: 'initial',
      reuseExistingChunk: true
    }
  }
})
```

这就是为什么我们可以在Vue打包文件中看到类似`chunk-vendors.1c4c5c82.js`和`chunk-common.a696fd86.js`文件。

而其余的Vue则是使用了Webpack的默认配置。

开发中，对于同步文件，一般情况下会打包出四个文件，如Vue中：

- `app.xxx.js` 入口文件
- `chunk-vendors.xxx.js` 第三方库文件
- `chunk-common.xxx.js` 代码模块引入了多次打包文件(Vue中引入两次则打包`minChunks: 2`)
- `runtime.xxx.js`

### 动态导入代码分离

**只要是异步导入的代码，Webpack就会对它进行代码分离处理。**

动态导入时，webpack提供了两种实现动态导入的方式：

- 第一种，使用ECMAScript中的 import() 语法来完成，也是目前推荐的方式；
- 第二种，使用webpack遗留的 require.ensure，目前已经不推荐使用；

`foo_01.js`文件代码如下：

```js
export default function sum(a, b) {
  return a + b
}
```

我们在`main.js`中添加如下代码：

```js
import('./foo_01').then((res) => {
  console.log('foo01', res)
})
```

在打包后可以看到文件`679.bundle.js`，格式化后如下：

```js
"use strict";
(self.webpackChunk_14_learn_webpack =
  self.webpackChunk_14_learn_webpack || []).push([
  [679],
  {
    3679: (e, a, n) => {
      function u(e, a) {
        return e + a;
      }
      n.r(a), n.d(a, { default: () => u });
    },
  },
]);
```

#### 动态导入的文件名 output.chunkFilename

因为动态导入通常是一定会打包成独立的文件的，所以并不会在`cacheGroups`中进行配置；

那么它的命名我们通常会在output中，通过`chunkFilename` 属性来命名；

```json {5}
output: {
  clean: true,
  filename: '[name].bundle.js',
  path: path.resolve(__dirname, '../build'),
  chunkFilename: 'chunk_[id]_[name].js'
},
```

重新`npm run build`，可看到生成文件`chunk_679_679.js`

可以看到默认情况下获取到的`[name]`和`[id]`的名称是一样的。

如果我们希望修改name的值，可以通过magic comments（魔法注释）的方式。

修改`main.js`代码：

```js
import(/* webpackChunkName: foo */'./foo_01').then((res) => {
  console.log('foo01', res)
})
```

重新`npm run build`，可看到生成文件`chunk_957_foo.js`

#### 代码的懒加载

动态import使用最多的一个场景是懒加载（比如路由懒加载）。

在Vue和React中，我们经常会通过`import()`来实现代码的懒加载。当触发到这个对应功能的代码时，再对其加载。

`element.js`模块，创建第一个DIV：

```js
const element = document.createElement('div');

element.innerHTML = "Hello Element";

export default element;
```

在main.js中实现代码：

```js
const button = document.createElement('button')

button.innerHTML = '加载元素'
button.addEventListener('click', () => {
  import(
    /* webpackChunkName: "element" */
    './element'
  ).then(({ default: element }) => {
    document.body.appendChild(element)
  })
})

document.body.appendChild(button)
```

`npm run build`进行打包，浏览器中打开`index.html`，此时element模块的文件并没有被加载。

当点击加载元素按钮时，可在控制台Network一栏中看到打包文件`chunk_113_element.js`才被加载。

#### 预获取/预加载模块 (Prefetch/Preload)

浏览器在加载模块时，使用代码懒加载会有一个问题，如果需要懒加载的模块很大，那么在触发时再去加载模块会耗费一定的时间。

那么可不可以让这个模块在浏览器空闲时下载下来，然后在真正需要时直接使用即可？

对此，webpack v4.6.0+ 增加了对预获取和预加载的支持。

在声明 import 时，使用下面这些内置指令，可以让 webpack 输出 "resource hint(资源提示)"，来告知浏览器：

- **prefetch**(预获取)：将来某些导航下可能需要的资源
- **preload**(预加载)：当前导航下可能需要资源

我们可以通过魔法注释来触发这个功能，在`main.js`中添加注释：

```js {6}
const button = document.createElement('button')
button.innerHTML = '加载元素'
button.addEventListener('click', () => {
  import(
    /* webpackChunkName: "element" */
    /* webpackPrefetch: true */
    './element'
  ).then(({ default: element }) => {
    document.body.appendChild(element)
  })
})
document.body.appendChild(button)
```

再进行打包`npm run build`打包，我们在Network中可以看到，`chunk_113_element.js`文件会在所有文件加载完毕后，自动加载出来。

我们可以看到，在打包文件`index.html`中是看不到`chunk_113_element.js`文件的，在浏览器中打开时，会生成 `<link rel="prefetch" as="script" href=".../chunk_113_element.js">` 并追加到页面头部，这会让浏览器在闲置时间预取`chunk_113_element.js`文件。

与 prefetch 指令相比，preload 指令有许多不同之处：

- preload chunk 会在父 chunk 加载时，以并行方式开始加载。prefetch chunk 会在父 chunk 加载结束后开始加载。
- preload chunk 具有中等优先级，并立即下载。prefetch chunk 在浏览器闲置时下载。
- preload chunk 会在父 chunk 中立即请求，用于当下时刻。prefetch chunk 会用于未来的某个时刻。
- 浏览器支持程度不同。

设置`main.js`如下：

```js
const button = document.createElement('button')
button.innerHTML = '加载元素'
button.addEventListener('click', () => {
  import(
    /* webpackChunkName: "element" */
    /* webpackPreload: true */
    './element'
  ).then(({ default: element }) => {
    document.body.appendChild(element)
  })
})
document.body.appendChild(button)
```

再进行打包`npm run build`打包，我们在Network中看不到`chunk_113_element.js`文件。点击按钮之后，才看到这个文件被加载出来。

这是因为Preload会随父chunk文件`main.bundle.js`并行下载，其实已经下载了下来。

它的使用场景官网有举例说明：

> 有一个 `Component`，依赖于一个较大的 library，所以应该将其分离到一个独立的 chunk 中。
>
> 我们假想这里的图表组件 `ChartComponent` 组件需要依赖一个体积巨大的 `ChartingLibrary` 库。它会在渲染时显示一个 `LoadingIndicator(加载进度条)` 组件，然后立即按需导入 `ChartingLibrary`：
>
> **ChartComponent.js**
>
> ```js
> //...
> import(/* webpackPreload: true */ 'ChartingLibrary');
> ```
>
> 在页面中使用 `ChartComponent` 时，在请求 ChartComponent.js 的同时，还会通过 `<link rel="preload">` 请求 charting-library-chunk。假定 page-chunk 体积很小，很快就被加载好，页面此时就会显示 `LoadingIndicator(加载进度条)` ，等到 `charting-library-chunk` 请求完成，LoadingIndicator 组件才消失。启动仅需要很少的加载时间，因为只进行单次往返，而不是两次往返。尤其是在高延迟环境下。
>
> **不正确地使用 `webpackPreload` 会有损性能，请谨慎使用。**

### optimization其它配置

#### chunksId

[optimization.chunkIds](https://webpack.docschina.org/configuration/optimization/#optimizationchunkids)配置用于告知webpack模块的`id`采用什么算法生成。

有如下值：

`boolean = false` `string: 'natural' | 'named' | 'size' | 'total-size' | 'deterministic'`

| 选项值            | 描述                                                                    |
| :---------------- | :---------------------------------------------------------------------- |
| `'natural'`       | 按使用顺序的数字 id。                                                   |
| `'named'`         | 对调试更友好的可读的 id。                                               |
| `'deterministic'` | 在不同的编译中不变的短数字 id。有益于长期缓存。在生产模式中会默认开启。 |
| `'size'`          | 专注于让初始下载包大小更小的数字 id。                                   |
| `'total-size'`    | 专注于让总下载包大小更小的数字 id。                                     |

- 如果环境是开发环境，那么 `optimization.chunkIds` 会被设置成 `'named'`，但当在生产环境中时，它会被设置成 `'deterministic'`
- 如果上述的条件都不符合, `optimization.chunkIds` 会被默认设置为 `'natural'`

假如我们设置` chunkIds: 'named',`时，打包的名字就会如`vendor-node_modules_lodash_lodash_js_vendor.js`，可以做到见名知意。

生产环境下，默认会被设置成 `'deterministic'`，也就是我们上面测试打包时，看到的短id，如`624_vendor.js`。

#### runtimeChunk

[optimization.runtimeChunk](https://webpack.docschina.org/configuration/optimization/#optimizationruntimechunk)用于配置runtime相关的代码是否抽取到一个单独的chunk中：

- runtime相关的代码指的是在运行环境中，对模块进行解析、加载、模块信息相关的代码；
- 比如我们的element、bar两个模块是通过import函数相关的代码加载的，这个就是通过runtime代码完成的；

设置此属性，会为每个入口添加一个只含有 runtime 的额外 chunk。

可设置的值如下：

- `false`：默认值，runtime代码打包到入口文件中；

- `true`或`multiple`：针对每个入口打包一个runtime文件；
- `single`：所有入口的runtime代码打包一个runtime文件；
- 对象`{ name }`：name属性设置runtimeChunk的名称；name可以是字符串或函数

抽离出来后，有利于浏览器缓存的策略：

- 比如我们修改了业务代码（main），那么runtime和element、bar的chunk是不需要重新加载的；
- 比如我们修改了component、bar的代码，那么main中的代码是不需要重新加载的；

设置如下：

```json
optimization: {
  // ...
  runtimeChunk: true, // false(默认)  true/multiple single { name: "" }
  runtimeChunk: {
    // name: 'runtime-ccbean',
    name: (entrypoint) => `runtimechunk-${entrypoint.name}`
  }
}
```

### 外部扩展 externals

`externals` 配置选项提供了「从输出的 bundle 中排除依赖」的方法。相反，所创建的 bundle 依赖于那些存在于用户环境(consumer's environment)中的依赖。此功能通常对 **library 开发人员**来说是最有用的，然而也会有各种各样的应用程序用到它。

**防止**将某些 `import` 的包(package)**打包**到 bundle 中，而是在运行时(runtime)再去从外部获取这些扩展依赖(external dependencies)。

比如我们在项目中用到的`lodash`和`moment`，可以做如下配置来排除这两个库的打包：

```json
externals: {
  lodash: '_',
  moment: 'moment'
}
```

这里的键`lodash`、`moment`就是我们使用的库名，值`_`、`moment`就是我们在使用库时，自己代码中用到的引用名称。

```js
import _ from 'lodash'
import moment from 'moment'
```

在`index.html`中单独从CDN中引入这两个库：

```html {8-9}
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <script src="https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/moment@2.29.3/moment.min.js"></script>
</head>
<body>
  <div id="app"></div>
</body>
</html>
```

执行`npm run build`后，可以看到打包代码中没有了`[id]_vendor.js`相关的代码，因为已经从打包文件中抽离出来了。

在SPA开发项目中，一般不会这样做，这里只是做演示。但如果是开发一个库，我们通常会这样来抽离三方库依赖。库在使用时，使用用户环境的第三方依赖。

### Shimming 预支依赖

目前我们的lodash、moment都使用了CDN进行引入，所以相当于在全局是可以使用`_`和`moment`。

假如一个文件中使用了`axios`，但是没有对它进行引入，那么下面的代码是会报错的：

```js
axios.get('http://httpbin.org/get').then(res => {
  console.log('axios res', res)
})

// Uncaught ReferenceError: axios is not defined
```

那么此时可以使用ProvidePlugin来实现shimming的效果。

[Shimming](https://webpack.docschina.org/guides/shimming/#root)是一个概念，是某一类功能的统称，shimming翻译过来我们称之为 垫片，相当于给我们的代码填充一些垫片来处理一些问题。

Webpack中的ProvidePlugin介绍如下：

> Automatically load modules instead of having to `import` or `require` them everywhere.

直接使用Webpack提供的这个插件：

```js
const webpack = require('webpack')

module.exports = {
  // ...
  plugins: [
    new webpack.ProvidePlugin({
      Axios: 'axios',
      Vue: ['vue/dist/vue.esm.js', 'default'],
    })
  ]
}
```

上面的配置中，键`Axios`、`Vue`表示在代码中使用的声明，值`axios`、`['vue/dist/vue.esm.js', 'default']`表示要查找的库。数组表示查找`'vue/dist/vue.esm.js'`下的`default`作为`Vue`对象的引用。所以数组就可以实现某个模块下指定部分暴露。

当开发时，未导入`axios`、`vue`时，Webpack会自动去ProvidePlugin配置的模块中查找引用。

默认情况下，会从当前目录下`./**`和`node_modules`中查找引用库。

开发中，webpack并不推荐随意的使用shimming：

- Webpack背后的整个理念是使前端开发更加模块化；
- 也就是说，需要编写具有封闭性的、不存在隐含依赖（比如全局变量）的彼此隔离的模块；

它的使用场景是：

- Webpack编译器能够识别遵循 ES2015 模块语法、CommonJS 或 AMD 规范编写的模块。然而，一些 third party(第三方库) 可能会引用一些全局依赖（例如 `jQuery` 中的 `$`）。因此这些 library 也可能会创建一些需要导出的全局变量。这些 "broken modules(不符合规范的模块)" 就可以使用 预置依赖来处理。
- 当希望 [polyfill](<https://en.wikipedia.org/wiki/Polyfill_(programming)>) 扩展浏览器能力，来支持到更多用户时。在这种情况下，你可能只是想要将这些 polyfills 提供给需要修补(patch)的浏览器，也就是实现按需加载。

### MiniCssExtractPlugin 样式抽离

[MiniCssExtractPlugin](https://webpack.docschina.org/plugins/mini-css-extract-plugin)可以将 CSS 提取到单独的文件中，为每个包含 CSS 的 JS 文件创建一个 CSS 文件，并且支持 CSS 和 SourceMaps 的按需加载。

安装依赖：

```shell
npm install mini-css-extract-plugin -D
```

在`webpack.prod.js`中配置：

```json
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
]
```

执行`npm run build`可以看到css被抽离到了单独的文件`main.eb45b5.css`中

### 文件名中的Hash

在给打包的文件进行命名的时候，会使用占位符Placeholder，Placeholder中有几个属性比较相似的值：

- hash、chunkhash、contenthash
- hash本身是通过MD4的散列函数处理后，生成一个128位的hash值（32个十六进制）

**hash值的生成和整个项目有关系**

我们有入口文件`index.js`和`main.js`，当配置时：

```json {3}
output: {
  clean: true,
  filename: 'js/[name].[hash:6].bundle.js',
  path: path.resolve(__dirname, '../build'),
  chunkFilename: 'js/chunk_[id]_[name].js'
},
```

执行`npm run build`，可以看到输出文件中有`index.200756.bundle.js`、`main.200756.bundle.js`，可以看到两个文件的hash是相同的。

此时，如果修改了`index.js`文件中的内容，那么hash会发生变化；那就意味着两个文件的名称都会发生变化；`main.js`并没有发生变化，但是文件名却变了，在开发中，这就造成了不必要的重新加载。

chunkhash可以有效的解决上面的问题，**chunkhash会根据不同的入口文件来解析来生成hash值**，比如我们修改了`index.js`，那么`main.js`的chunkhash是不会发生改变的；

```json
output: {
  clean: true,
  path: path.resolve(__dirname, '../build'),
  filename: 'js/[name].[chunkhash:6].bundle.js',
  chunkFilename: 'js/chunk.[chunkhash:6].[name].js'
},
```

**contenthash表示生成的文件hash名称，只和内容有关系：**

比如我们的`main.js`，引入了一个`style.css`，`style.css`又被抽取到一个独立的css文件中；

这个css文件在命名时，如果我们使用的是chunkhash；那么当index.js文件的内容发生变化时，css文件的命名也会发生变化；这个时候我们可以使用contenthash；

```json
plugins: [
  new MiniCssExtractPlugin({
    filename: 'css/[name].[contenthash:6].css',
    chunkFilename: 'css/[name].[contenthash:6].css'
  })
]
```
