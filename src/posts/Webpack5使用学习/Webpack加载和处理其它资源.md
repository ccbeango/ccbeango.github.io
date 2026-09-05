---
title: "Webpack加载和处理其它资源"
date: "2022-04-21 22:05:17"
series:
  name: "Webpack5使用学习"
  order: 3
tags:
  - "Webpack5使用学习"
draft: false
---

## 图片加载

为了演示我们项目中可以加载图片，我们需要在项目中使用图片，比较常见的使用图片的方式是两种：

- img元素，设置src属性；
- 其他元素（比如div），设置background-image的css属性

首先我们在`component.js`中书写如下代码：

```js
import '../css/index.css'
import '../css/component.less'

import catImg from "../img/cat.jpg";

function component() {
  const element = document.createElement('div')

  element.innerHTML = ['Hello', 'webpack'].join(' ')
  element.classList.add('content');

  const imgEle = new Image();
  // 方式一：require引入 是否需要加default和file-loader版本有关
  // imgEle.src = require('../img/cat.jpg').default
  // 方式二：import引入 没有是否要加default的问题
  imgEle.src = catImg
  element.appendChild(imgEle)

  const divEle = document.createElement('div')
  divEle.style.width = `200px`
  divEle.style.height = `200px`
  divEle.style.backgroundColor = 'red'
  divEle.classList.add('bg-image')

  element.appendChild(divEle)

  return element;
}

document.body.appendChild(component())
```

`index.css`如下：

```css
.content {
  color: red;
}

.bg-image {
  display: inline-block;
  background: url('../img/avatar.jpeg');
  background-size: contain;
}

```

- 当只给div设置背景图时，如果我们直接执行`npm run build`，会正常编译成功。

- 当我们添加一个图片`img`元素到页面中，再执行构建会有如下报错：

  ```js
  You may need an appropriate loader to handle this file type, currently no loaders are configured to process this file. See https://webpack.js.org/concepts#loaders
  ```

  我们之前遇到过同样的错误，这是因为没有响应的loader来解析图片。

### file-loader

要处理jpg、png等格式的图片，我们也需要有对应的loader：file-loader。

file-loader的作用就是帮助我们处理import/require()方式引入的一个文件资源，并且会将它放到我们输出的文件夹中；

我们引入`file-loader`

```shell
npm install file-loader -D
```

配置处理图片的Rule：

```js
{
  test: /\.(png|gif|jpe?g|svg)$/,
  use: 'file-loader'
}
```

此时再执行build，可以看到图片正常显示出来。

但是此时发现div设置背景图片无法正常显示。

这是因为在 webpack 5中，已经不需要使用旧的 assets loader（如 `file-loader`/`url-loader`/`raw-loader` 等），可以使用[资源模块类型](https://webpack.docschina.org/guides/asset-modules/#custom-data-uri-generator)替换掉所有的资源loader。

但如果还使用了这些asset loader，那么就可能出现图片资源被处理了两次，一次被css-loader自行处理，一次被file-loader处理，最终导致css的url中的图片无法正常显示。

因为为了学习loader，这里可以设置Rule的`dependency: { not: ['url'] }`排除对CSS中`url()`的处理。

```json
{
  test: /\.(png|gif|jpe?g|svg)$/,
  use: 'file-loader',
  dependency: { not: ['url'] }
}
```

这样就可以正常显示图片。现在loader所做的事情其实就是将图片复制到打包目录下，并进行了重命名。重命名时，对文件的内容默认使用MD4的散列函数处理，生成的一个128位的hash值（即32个十六进制表示的字符串）；

#### 文件的名称规则

有时候我们处理后的文件名称按照一定的规则进行显示：比如保留原来的文件名、扩展名，同时为了防止重复，包含一个hash值等。

这个时候我们可以使用PlaceHolders来完成，webpack给我们提供了大量的PlaceHolders来显示不同的内容，可进行[查阅](https://webpack.js.org/loaders/file-loader/#placeholders)

这里介绍几个最常用的placeholder：

- `[ext]` 处理文件的扩展名；
- `[name]` 处理文件的名称；
- `[hash]`文件的内容，使用MD4的散列函数处理，生成的一个128位的hash值（32个十六进制）；
- `[contentHash]` 在file-loader中和[hash]结果是一致的（在webpack的一些其他地方不一样，后面会讲到）；
- `[hash:<length>]`截图hash的长度，默认32个字符太长了；
- `[path]` 文件相对于webpack配置文件的路径；

我们配置资源生成如下：

```json
{
  test: /\.(png|jpe?g|gif|svg)$/i,
  use: [
    {
      loader: 'file-loader',
      options: {
        name: '[name].[hash:8].[ext]',
        outputPath: 'img'
      }
    }
  ],
  dependency: { not: ['url'] }
}
```

一般不适用`outputPath`属性，而是再`name`属性中加上路径，上面的写法等效于

```json
{
  test: /\.(png|jpe?g|gif|svg)$/i,
  use: [
    {
      loader: 'file-loader',
      options: {
        name: 'img/[name].[hash:8].[ext]'
      }
    }
  ],
  dependency: { not: ['url'] }
}
```

在Vue中就是上面的这种写法。

要知道的是，这个loader除了可以用来处理图片资源外，还可以用来处理我们用到几乎所有的资源，如mp3、mp4、word、字体、js、json文件等等。只要是我们将其归类为资源类型的，都可以用来处理。

只是这里用来处理图片而已。下面的url-loader也是如此。

### url-loader

url-loader和file-loader的工作方式是相似的，但是可以将较小的文件，转成base64的URI。

安装url-loader：

```shell
npm install url-loader -D
```

替换掉`file-loader`：

```json
{
  test: /\.(png|jpe?g|gif|svg)$/i,
  use: [
    {
      // loader: 'file-loader',
      loader: 'url-loader',
      options: {
        // name: '[name].[hash:8].[ext]',
        // outputPath: 'img'
        name: 'img/[name].[hash:8].[ext]', // 等效
      }
    }
  ],
  dependency: { not: ['url'] }
}
```

可以看到浏览器中显示结果是一样的，但是在`build`目录下，没有了对应的文件，默认情况下url-loader会将所有的图片文件转成base64编码。

但是开发中我们往往是小的图片需要转换，但是大的图片直接使用图片即可：

- 因为小的图片转换base64之后可以和页面一起被请求，减少不必要的请求过程，即减少小图片的HTTP请求；
- 而大的图片也进行转换，反而会影响页面的请求速度，因为所有文件都被打包到js文件中，文件过大，加载就慢了；

设置方法，url-loader有一个options属性`limit`，可以用于设置转换的限制：

```json
{
  test: /\.(png|jpe?g|gif|svg)$/i,
  use: [
    {
      // loader: 'file-loader',
      loader: 'url-loader',
      options: {
        // name: '[name].[hash:8].[ext]',
        // outputPath: 'img'
        name: 'img/[name].[hash:8].[ext]', // 等效
        limit: 100 *  1024 // 小于100k图片转base64
      }
    }
  ],
  dependency: { not: ['url'] }
}
```

limit属性的单位是字节`bit`，这里配置大于100kb的图片会输出到`build/img`目录。

## 资源模块 asset module type

我们当前使用的webpack版本是webpack5：

- 在webpack5之前，加载各种资源，如txt、html、图片、字体等，我们需要使用各种oader，比如raw-loader 、url-loader、file-loader；

- 在webpack5之后，我们可以直接使用[资源模块类型（asset module type）](https://webpack.docschina.org/guides/asset-modules/)，来替代上面的这些loader；也就无需配置额外 loader。

资源模块类型(asset module type)，通过添加 4 种新的模块类型，来替换所有这些 loader：

- `asset/resource` 发送一个单独的文件并导出 URL。之前通过使用 `file-loader` 实现。
- `asset/inline` 导出一个资源的 data URI。之前通过使用 `url-loader` 实现。
- `asset/source` 导出资源的源代码即原样导出。之前通过使用 `raw-loader` 实现。
- `asset` 在导出一个 data URI 和发送一个单独的文件之间自动选择。之前通过使用 `url-loader`，并且配置资源体积限制实现。

### `asset/resource`资源

此类型用来替换之前的`file-loader` 实现。

当需加载图片资源，可以如下设置：

```json
{
  test: /\.(png|jpe?g|gif|svg)$/i,
  type: 'asset/resource',
}
```

如果需要自定义文件名和输出路径，有两种方式：

- 修改output，添加assetModuleFilename属性

  ```json
  output: {
    filename: "bundle.js",
    // 必须是一个绝对路径
    path: path.resolve(__dirname, "./build"),
    assetModuleFilename: 'img/[name].[hash:8][ext]'
  },
  ```

  此设置会应用到所有使用asset module type的资源上。不推荐

- 在Rule中，添加一个generator属性，并且设置filename；推荐

  ```json
  {
    test: /\.(png|jpe?g|gif|svg)$/i,
    type: 'asset/resource',
    generator: {
      filename: '[name].[hash:8][ext]'
    }
  }
  ```

### `asset/inline `资源

此类型用来替换之前的`url-loader` 实现。

将需要处理的资源转成base64的字符串。

```json
{
  test: /\.(png|jpe?g|gif|svg)$/i,
  type: 'asset/inline',
},
```

执行构建，可看到所有图片都没有输出到`build`目录，而是转成了Data URI即base64字符串。

webpack 输出的 data URI，默认是呈现为使用 Base64 算法编码的文件内容。

如果要使用自定义编码算法，则可以指定一个自定义函数来编码文件内容：

```json
const path = require('path');
const svgToMiniDataURI = require('mini-svg-data-uri');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.svg/,
        type: 'asset/inline',
       	generator: {
         dataUrl: content => {
           content = content.toString();
           return svgToMiniDataURI(content);
         }
       }
      }
    ]
  },
};
```

### asset资源

此类型用来替换之前通过使用 `url-loader`，并且配置资源体积限制实现，资源是转成DataURI还是导出为文件。

```json
{
  test: /\.(png|jpe?g|gif|svg)$/i,
  type: 'asset',
  generator: {
    filename: 'img/[name].[hash:8][ext]'
  },
  parser: {
    dataUrlCondition: {
      maxSize: 1024 * 250 // 250kb
    }
  }
},
```

小于250kb的图片将会被转成DataURI，大于的导出到指定目录。

### asset/source

此类型用来替换之前的`raw-loader`，将文件作为字符串导入到 webpack loader，即导出资源源代码。

如处理txt文件：

```json
{
  test: /\.txt/,
  type: 'asset/source',
}
```

### 加载字体

Webpack5之前，可以使用file-loader或url-loader来加载字体文件。

Webpack5之后，可以直接使用资源模块类型处理。

如果我们需要使用某些特殊的字体或者字体图标，那么我们会引入很多字体相关的文件，这些文件的处理是一样的，多种字体引入是为了解决不同浏览器的兼容性问题。

首先从阿里图标库中下载了几个字体图标，放入`font`目录：

```shell
src\font\iconfont.css
src\font\iconfont.eot
src\font\iconfont.ttf
src\font\iconfont.woff
src\font\iconfont.woff2
```

在component中引入，并且添加一个i元素用于显示字体图标：

```js
// 创建字体图标
const iEle = document.createElement('i');
iEle.classList.add('iconfont', 'icon-ashbin', 'icon-setting');
element.appendChild(iEle);
```

然后配置webpack加载字体的Rule（等效于`file-loader`的配置）：

```json
{
  test: '/\.ttf|eot|woff?2/',
  type: 'asset/resource',
  generator: {
    filename: 'font/[name].[hash:8][ext]'
  }
}
```

等效于Webpack5之前`file-loader`的配置：

```json
{
  test: '/\.ttf|eot|woff?2/',
  use: [
    {
      loader: 'file-loader',
      options: {
        name: 'font/[name].[hash:8].[ext]', // 等效
      }
    }
  ]
}
```

执行build编译，可正常显示图标。

**注意：其它类型的资源文件都可以使用这种方法来进行配置，如mp3、mp4等**

此时完整配置如下：

```js
const path = require('path');

module.exports = {
  entry: "./src/main.js",
  output: {
    filename: "bundle.js",
    // 必须是一个绝对路径
    path: path.resolve(__dirname, "./build"),
    // assetModuleFilename: 'img/[name].[hash:8][ext]'
  },
  module: {
    rules: [
      {
        // 规则使用正则表达式
        test: /\.css$/, // 匹配资源
        use: [
          // 注意: 编写顺序(从下往上, 从右往做, 从后往前)
          "style-loader",
          {
            loader: "css-loader",
            options: {
              importLoaders: 1
            }
          },
          "postcss-loader"
        ],
      },
      {
        test: /\.less$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              importLoaders: 2
            }
          },
          "postcss-loader",
          "less-loader"
        ]
      },
      // { // 替换file-loader
      //   test: /\.(png|jpe?g|gif|svg)$/i,
      //   type: 'asset/resource',
      //   generator: {
      //     filename: 'img/[name].[hash:8][ext]'
      //   }
      // },
      // { // 替换url-loader
      //   test: /\.(png|jpe?g|gif|svg)$/i,
      //   type: 'asset/inline',
      // },
      { // 替换url-loader + 限制资源大小转换
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset',
        generator: {
          filename: 'img/[name].[hash:8][ext]'
        },
        parser: {
          dataUrlCondition: {
            maxSize: 1024 * 250 // 250kb
          }
        }
      },
      {
        test: /\.txt/,
        type: 'asset/source'
      },
      {
        test: '/\.ttf|eot|woff?2/',
        type: 'asset/resource',
        generator: {
          filename: 'font/[name].[hash:8][ext]'
        }
      }
    ]
  }
}
```

## 认识plugin

Webpack的另一个核心是Plugin。

**loader 用于转换特定的模块类型，而插件则可以用于执行范围更广的任务，比如：打包优化，资源管理，注入环境变量。**Plugin可以贯穿Webpack的整个生命周期。

![Webpack加载和处理其它资源01](https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/Webpack5/Webpack加载和处理其它资源01.png)

上图我们可以看到，加载a、b、c三个css文件时，使用`css-loader`进行加载，然后b文件又使用了`csso-loader`进行了优化。这时，将这些加载好的CSS模块抽取到一个单独的文件`style.css`中，需要使用相关的插件进行操作。

### CleanWebpackPlugin

> https://github.com/johnagan/clean-webpack-plugin
>
> A webpack plugin to remove/clean your build folder(s).

前面演示的过程中，每次修改了一些配置，重新打包时，都需要手动删除dist文件夹，其实可以借助于一个插件来帮助我们完成，这个插件就是CleanWebpackPlugin

安装插件：

```shell
npm install --save-dev clean-webpack-plugin -D
```

配置插件：

```js
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  // 省略其它内容...
  plugins: [
    new CleanWebpackPlugin(),
  ],
}
```

此时构建，不需要我们手动删除目录，这个插件会在构建前删除之前的构建内容。

在Webpack5中，已经不再需要单独安装此插件，webpack中已内置，可以直接配置`output.clean`选项开启此功能：

```json {5}
output: {
  publicPath: '/',
  filename: 'bundle.js',
  path: path.resolve(__dirname, 'build'),
  clean: true
},
```

再进行构建时，之前构建的文件就会被清除掉。

### HtmlWebpackPlugin

> https://webpack.docschina.org/plugins/html-webpack-plugin/
>
> `HtmlWebpackPlugin`简化了 HTML 文件的创建，以便为你的 webpack 包提供服务。这对于那些文件名中包含哈希值，并且哈希值会随着每次编译而改变的 webpack 包特别有用。你可以让该插件为你生成一个 HTML 文件，使用 [lodash 模板](https://lodash.com/docs#template)提供模板，或者使用你自己的 [loader](https://webpack.docschina.org/loaders)。
>
> 插件HtmlWebpackPlugin仓库地址：https://github.com/jantimon/html-webpack-plugin

现在还有一个地方不规范，我们的HTML文件是编写在根目录下的，而最终打包的dist文件夹中是没有index.html文件的。

在进行项目部署的时，必然也是需要有对应的入口文件index.html，所以我们也需要对index.html进行打包处理。

而且打包时需要插入打包后的JS入口文件，现在也是手动插入。

对HTML进行打包处理我们可以使用另外一个插件：HtmlWebpackPlugin。

安装插件：

```shell
npm install html-webpack-plugin -D
```

使用方法：

```js
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  // 其它省略
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Hello Webpack'
    })
  ],
};
```

打包后将会在打包目录下生成一个`index.html`文件：

```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Hello Webpack</title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <script defer="defer" src="bundle.js"></script>
</head>
<body></body>
</html>
```

HtmlWebpackPlugin构造函数可接收的配置选项详见[插件文档](https://github.com/jantimon/html-webpack-plugin#options)

但是我们看到，上面打包生成的html文件，可能并不符合我们的需求，比如少了`div#app`的挂载节点。

我们可以在插件使用`template`中指定模板：

```json
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  // 其它省略
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Hello Webpack',
      template: './public/index.html'
    })
  ],
};
```

这里创建`public/index.html`文件，使用Vue2中默认的HTMl文件：

```html {8}
<!DOCTYPE html>
<html lang="">

<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <link rel="icon" href="<%= BASE_URL %>favicon.ico">
  <title>
    <%= htmlWebpackPlugin.options.title %>
  </title>
</head>

<body>
  <noscript>
    <strong>We're sorry but <%= htmlWebpackPlugin.options.title %> doesn't work properly without JavaScript enabled.
        Please enable it to continue.</strong>
  </noscript>
  <div id="app">{{message}}</div>
  <!-- built files will be auto injected -->
</body>
```

模板使用的是[ejs模板引擎](https://ejs.bootcss.com/)，再执行`npm run build`构建，会看到报错：

```shell
ERROR in Template execution failed: ReferenceError: BASE_URL is not defined

ERROR in   ReferenceError: BASE_URL is not defined
```

这是因为在编译template模块时，有一个`BASE_URL`，如上第8行所示。但是我们并没有设置过这个常量值，所以会出现没有定义的错误。

当我们删除掉这一行，重新构建，可以编译成功。

但很显然，我们需要这个常量，这个时候我们可以使用DefinePlugin插件。

### DefinePlugin

> https://webpack.docschina.org/plugins/define-plugin/
>
> `DefinePlugin` 允许在 **编译时** 将你代码中的变量替换为其他值或表达式。

正如官方文档中介绍的，DefinePlugin允许在编译时**创建配置的全局常量**，它是一个webpack内置的插件，不需要单独安装。

其实我们再webpack中常用到的一个配置属性[模式`mode`](https://webpack.docschina.org/configuration/mode/)，当设置其值时，内部依赖此插件完成对`NODE_ENV`的赋值。

我们可以做如下配置：

```json
plugins: [
  new DefinePlugin({
    BASE_URL: '"./"'
  })
]
```

注意，这里配置的常量是**字符串**，如果写值是`BASE_URL: './'`，那么使用时，取值是`./`，会被认作标识符解析，而不是`"./"`字符串。一般可以使用`JSON.stringify()`进行包裹。

这是再执行构建，打包成功，可以看到EJS模板中的`BASE_URL`被替换成了一个字符串`./`。

### CopyWebpackPlugin

> https://webpack.docschina.org/plugins/copy-webpack-plugin/
>
> Copies individual files or entire directories, which already exist, to the build directory.

在vue的打包过程中，如果我们将一些文件放到public的目录下，那么这个目录会被复制到dist文件夹中。这个复制的功能，就是使用CopyWebpackPlugin来完成的。

安装CopyWebpackPlugin插件：

```shell
npm install copy-webpack-plugin -D
```

接下来配置CopyWebpackPlugin即可，复制的规则在patterns中设置

```json
plugins: [
  new CopyWebpackPlugin({
    patterns: [
      {
        from: 'public',
        globOptions: {
          ignore: [
            '**/.DS_Store',
            '**/index.html'
          ]
        }
      }
    ]
  })
]
```

- from：设置从哪一个源中开始复制；
- to：复制到的位置，可以省略，会默认使用`output.path`复制到打包的目录下；
- pglobOptions：设置一些额外的选项，可以在`ignore`属性中编写需要忽略的文件：
  - .DS_Store：mac目录下回自动生成的一个文件；
  - index.html：也不需要复制，因为我们已经通过HtmlWebpackPlugin完成了index.html的生成；

此插件的配置参数有很多，具体可查阅官方文档。

再进行打包，即可看到效果，标签上有图标显示出来。
