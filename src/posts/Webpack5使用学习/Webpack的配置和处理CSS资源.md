---
title: "Webpack的配置和处理CSS资源"
date: "2022-04-10 18:17:04"
series:
  name: "Webpack5使用学习"
  order: 2
tags:
  - "Webpack5使用学习"
draft: false
---

## Webpack配置文件

在通常情况下，Webpack需要打包的项目是非常复杂的，并且我们需要一系列的配置来满足要求，默认配置必然是无法满足需求的。

比如，我们可以设置入口，设置输出，这些都可以通过命令行参数完成：

```shell
webpack --entry ./src/main.js --output-path ./build
```

但是，每次都输入相关参数过于繁琐，而且参数可能非常多，可读性差，我们可以使用配置文件来解决这一问题。

注：所有支持的参数可见官方文档[命令行接口](https://webpack.docschina.org/api/cli/)

### 默认配置文件

可以在根目录下创建一个`webpack.config.js`文件，来作为Webpack的默认配置文件。

此时执行`webpack`命令打包，Webpack默认会去执行的根目录下查找此文件作为webpack的配置文件。

```js
const path = require('path')

module.exports = {
  entry: './src/main.js',
  output: {
    filename: 'bundle.js',
    path: './build'
  }
}
```

- entry 指定入口文件
- output 指定打包输出配置
  - filename 指定打包文件名
  - path 指定打包输出路径，要注意，必须是绝对路径，否则报错。

`package.json`中配置执行脚本：

```js
"scripts": {
    "build2": "webpack"
  },
```

### 指定配置文件

但是如果我们的配置文件并不是webpack.config.js的名字，而是其他的名字呢，比如我们将`webpack.config.js`修改成了`wk.config.js`；

这个时候我们可以通过 `--config` 来指定对应的配置文件的路径：

```shell
webpack --config ./wk.config.js
```

我们通常会在`package.json`中配置执行脚本：

```json
"scripts": {
    "build3": "webpack --config ./wk.config.js"
  },
```

然后运行`npm run build`即可完成打包。

## Webpack依赖图

> https://webpack.docschina.org/concepts/dependency-graph

webpack到底是如何对我们的项目进行打包的呢？

事实上webpack在处理应用程序时，它会根据命令或者配置文件找到入口文件；

从入口开始，去查找所有依赖的文件，根据模块标识符，最终会生成一个**依赖关系图**，这个依赖关系图会包含应用程序中所需的所有模块（比如.js文件、css文件、图片、
字体等）。

依赖关系图是一个图结构，这其实就是利用**JavaScript的模块依赖加载机制**，加载器会执行**深度优先的依赖加载**。

然后遍历图结构，打包一个个模块（根据文件的不同使用不同的loader来解析）。

![webpack的配置01](https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/Webpack5/webpack的配置01.PNG)

注：模块相关原理，详见《JavaScript高级程序设计》第26章 模块章节。

## css-loader的使用

创建一个`component.js`的文件，通过JS创建一个元素，并且给它设置相关的样式

```js
import '../css/index.css'

function component() {
  const element = document.createElement('div')

  element.innerHTML = ['Hello', 'webpack'].join(' ')
  element.classList.add('content');

  return element;
}

document.body.appendChild(component())
```

此时我们再执行`npm run build3`会出现报错：

```js
ERROR in ./src/css/index.css 1:0
Module parse failed: Unexpected token (1:0)
You may need an appropriate loader to handle this file type, currently no loaders are configured to process this file. See https://webpack.js.org/concepts#loaders
> .content {
|   color: red;
| }
 @ ./src/js/component.js 1:0-25
 @ ./src/main.js 3:0-23
```

这里提示我们，需要一个loader来处理`index.css`文件。

上面的错误信息告诉我们需要一个loader来加载这个css文件，但是loader是什么呢？

> Webpack 只能理解 JavaScript 和 JSON 文件，这是 Webpack 开箱可用的自带能力。**loader** 让 webpack 能够去处理其他类型的文件，并将它们转换为有效 [模块](https://webpack.docschina.org/concepts/modules)，以供应用程序使用，以及被添加到依赖图中。

上面是官方解释，我们可以对loader做解释：

- loader 可以用于对模块的源代码进行转换；
- 我们可以将css文件也看成是一个模块，我们是通过import来加载这个模块的
- 在加载这个模块时，webpack其实并不知道如何对其进行加载，我们必须指定对应的loader来完成这个功能

对于加载css文件来说，我们需要一个可以读取css文件的loader，这个loader最常用的是`css-loader`

安装`css-loader`

```shell
npm install css-loader -D
```

### loader的使用方式

loader有三种使用方式：

- 内联方式
- CLI方式（webpack5中不再使用，webpack4中可以使用）
- 配置方式

[官方文档](https://webpack.docschina.org/concepts/loaders/#using-loaders)中只有两种方式了。

#### 内联方式

在引入的样式前加上使用的loader，并且使用`!`分割；

```js
import 'css-loader!../css/index.css'
```

可以使用多个loader，并且使用`!`将资源中的laoder分割，如：

```js
import 'xxx-loader!yyy-loader!css-loader!../css/index.css'
```

内联方式使用较少，因为不方便管理。

#### CLI方式

在命令行中使用`--module-bind`参数指定loader

Webpack5不再支持。

实际应用中也比较少使用，因为不方便管理

#### 配置方式

配置方式表示的意思是在我们的webpack配置文件中写明配置信息：

- `module.rules`中允许我们配置多个loader**。loader 从右到左（或从下到上）地取值(evaluate)/执行(execute)。**
- 这种方式可以更好的表示loader的配置，也方便后期的维护，同时也让你对各个Loader有一个全局的概览；

`module.rules`对应的是一个数组`[Rule, ...]`，数组中存放的是一个个的Rule，Rule是一个对象，对象中可以设置多个属性：

- `test` 用于对 resource（资源）进行匹配的，通常会设置成正则表达式；
- `use` 对应的值时一个数组：[UseEntry]
  - `UseEntry`是一个对象，可以通过对象的属性来设置一些其他属性
    - `loader` **必须**有一个 loader属性，对应的值是一个字符串，表示要使用的loader；
    - `options` 可选的属性，值是一个字符串或者对象，值会被传入到loader中；
    - `query` 目前已经使用options来替代；
  - `UseEntry`也可以是一个字符串，是`loader`属性的一种简写方式，如`use: [ 'style-loader' ]`，就是`use: [ { loader: 'style-loader'} ]`的简写。可以多个loader的简写。
- `loader` 此属性是`use`属性的简写，如`use: [ { loader: 'style-loader' } ]` 的简写就是`loader: 'style-loader'`。只有一个loader时的简写

```json
module: {
  rules: [
    {
      test: /\.css$/, // 匹配资源
      use: [ // use完整写法
        { loader: 'css-loader' } // UseEntry
      ],
      // use: ['css-loader'], //  use的简写 写多个只有一个属性的loader
      // loader: 'css-loader', // use的简写 写一个loader的简写
    }
  ]
}
```

上面配置就是，如果遇到`css`的文件，就使用`use`中配置的css-loader来进行转换。

此时再执行`npm run build3`可正常打包。

## 认识style-loader

我们已经可以通过css-loader来加载css文件了，但是你会发现这个css在我们的代码中并没有生效（页面没有效果）。

这是因为css-loader只是负责将.css文件进行解析，并不会将解析之后的css插入到页面中；

如果我们希望再完成插入style的操作，那么我们还需要另外一个loader，就是style-loader；

安装style-loader：

```shell
npm install style-loader -D
```

然后再配置style-loader：

```js
module: {
  rules: [
    {
      test: /\.css$/,
      use: [
        'style-loader',
        'css-loader'
      ]
    }
  ]
}
```

要注意，**loader的执行顺序是从右向左（或者说从下到上，或者说从后到前的）**，所以我们需要将style-loader写到css-loader的前面；

再重新打包后，就可以看到页面中的`Hello webpack`变成了红色，当前的css是通过页内样式的方式添加进来的；

本质上这个loader会先创建一个style标签，然后再插入css样式。

## css预处理器文件处理

在我们开发中，我们可能会使用less、sass、stylus的预处理器来编写css样式，效率会更高。

那么，如何可以让我们的环境支持这些预处理器呢？

首先我们需要确定，less、sass等编写的css需要通过工具转换成普通的css；

我们创建一个`component.less`文件，并写入以下样式：

```less
@fontSize: 50px;
@fontWeight: 700;

.content {
  font-size: @fontSize;
  font-weight: @fontWeight;
}
```

我们首先需要将less代码转换成css代码，这里需要用到工具库`less`

```shell
npm install less -D
```

执行如下命令：

```shell
npx less ./src/css/component.less > component.css
```

可以在根目录下看到这个转换后的css文件

在项目中我们会编写大量的less，它们如何可以自动转换呢？

我们通常会使用`less-loader`，来自动使用less工具转换less到css；**本质上就是使用上面安装的`less`将我们的less代码转换成css代码。**

安装`less-loader`：

```shell
npm install less-loader -D
```

配置loader：

```js
{
  test: /\.less$/,
  use: [
    { loader: 'style-loader' },
    { loader: 'css-loader' },
    { loader: 'less-loader' },
  ]
}
```

执行`npm run build3`，less就可以自动转换成css，并且页面也会生效了。

## 浏览器的兼容性问题

开发中，浏览器的兼容性问题，我们应该如何去解决和处理？

这里的兼容性问题不是指屏幕大小的变化适配；这里指的兼容性是针对不同的浏览器支持的特性：比如css特性、js语法，之间的兼容性；

我们知道市面上有大量的浏览器：

- 有Chrome、Safari、IE、Edge、Chrome for Android、UC Browser、QQ Browser等等；
- 它们的市场占率是多少？我们要不要兼容它们呢？

我们在编写代码时，需要考虑某些兼容性问题，比如css中经常会给某些属性添加前缀来兼容不同的浏览器。

同一个浏览器版本不同，不同的浏览器之间，都会有兼容性的问题

- 比如有些浏览器不支持Promise、不支持`const`属性。
- 或者有些css中经常会给某些属性添加前缀来兼容不同的浏览器。

现在这些问题都不需要自己去处理，目前前端工程化有对应的工具来处理。

这里css加前缀，可以使用工具`autoprefixer`，但是前缀是否要加，这是不确定的，比如项目只需要适配谷歌和火狐浏览器，那么就只需要加上这两个浏览器的前缀，其它浏览器的前缀不需要添加，如果全都添加就会平白增加无用代码。

对于JS代码也一样，比如哪些语法需要做转化，哪些语法不需要做就可以满足浏览器的需求，过多的转化是不需要的。

这些都取决于**我们的项目到底需要适配哪些浏览器**。

### 浏览器市场占有率

我们经常会在项目中会有类似下面的配置信息

```js
> 1%
last 2 versions
not dead
```

一般会是配置文件`.browserslistrc`，或是在`package.json`中。

这些其实就是一个个的条件，提供给工具使用，告诉工具到底需要适配哪些浏览器。

这里的`1%`，就是指市场占有率。条件就是说市场占有率需要大于百分之一。

浏览器的市场占有率可以在网站[caniuse.com](https://caniuse.com/)中找到，网站中有一个功能[Browser usage table](https://caniuse.com/usage-table)，这里统计了常见浏览器的市场占有率。

这里包含了不同浏览器不同版本当前的市场占有率。

### 认识browserslist工具

有一个问题，我们如何可以在css兼容性和js兼容性下共享我们配置的兼容性条件呢？

- 就是当我们设置了一个条件： > 1%；
- 我们表达的意思是css要兼容市场占有率大于1%的浏览器，js也要兼容市场占有率大于1%的浏览器；
- 如果我们是通过工具来达到这种兼容性的，比如后面我们会讲到的postcss-prest-env、babel、autoprefixer等

那么如何可以让他们共享我们的配置呢？

- 这个问题的答案就是Browserslist；

Browserslist是一个在不同的前端工具之间，共享目标浏览器和Node.js版本的配置。这些不同的前端工具包括：

- Autoprefixer
- Babel
- postcss-preset-env
- eslint-plugin-compat
- stylelint-no-unsupported-browser-features
- postcss-normalize
- obsolete-webpack-plugin

这些工具都需要通过共享配置`Browserslist`来决定需要兼容哪些浏览器，最终需要转换成什么样子的代码。

### Browserslist编写规则

开发中常用的规则：

- `defaults`：Browserslist的默认浏览器（> 0.5%, last 2 versions, Firefox ESR, not dead）
- `5%`：通过全局使用情况统计信息选择的浏览器版本。 >=，<或<=。
  - 5% in US：使用美国使用情况统计信息。它接受两个字母的国家/地区代码。
  - \>5% in alt-AS：使用亚洲地区使用情况统计信息。有关所有区域代码的列表，请参见caniuse-lite/data/regions
  - \>5% in my stats：使用自定义用法数据。
  - \> 5% in browserslist-config-mycompany stats：使用来自自定义使用情况数据browserslist-config-mycompany/browserslist-stats.json
  - cover 99.5%：提供覆盖率的最受欢迎的浏览器。
  - cover 99.5% in US：与上述相同，但国家/地区代码由两个字母组成。
  - cover 99.5% in my stats：使用自定义用法数据。
- `dead`：24个月内没有官方支持或更新的浏览器。现在已被判定死亡的浏览器有IE 10，IE_Mob 11，BlackBerry 10，BlackBerry 7， Samsung 4和OperaMobile 12.1。
  - 也会配合`not`来使用，即`not dead`，表示未死亡的浏览器
- last 2 versions：每个浏览器的最后2个版本。
  - last 2 Chrome versions：最近2个版本的Chrome浏览器。
  - last 2 major versions或last 2 iOS major versions：最近2个主要版本的所有次要/补丁版本。

不常用的配置：

- node 10和node 10.4：选择最新的Node.js10.x.x 或10.4.x版本。
  - current node：Browserslist现在使用的Node.js版本。
  - maintained node versions：所有Node.js版本，仍由 Node.js Foundation维护。
- iOS 7：直接使用iOS浏览器版本7。
  - Firefox > 20：Firefox的版本高于20，`>=`、`<`或`<=`也可以使用。它也可以与Node.js一起使用。
  - ie 6-8：选择一个包含范围的版本。
  - Firefox ESR：最新的[Firefox ESR]版本。
  - PhantomJS 2.1和PhantomJS 1.9：选择类似于PhantomJS运行时的Safari版本。
- extends browserslist-config-mycompany：从browserslist-config-mycompanynpm包中查询 。
- supports es6-module：支持特定功能的浏览器。 es6-module这是“我可以使用” 页面feat的URL上的参数。有关所有可用功能的列表，请参见 caniuse-
  lite/data/features
- browserslist config：在Browserslist配置中定义的浏览器。在差异服务中很有用，可用于修改用户的配置，例如 browserslist config and supports es6-module。
- since 2015或last 2 years：自2015年以来发布的所有版本（since 2015-03以及since 2015-03-10）。
- unreleased versions或unreleased Chrome versions：Alpha和Beta版本。

- not ie <= 8：排除先前查询选择的浏览器。

### 浏览器查询过程

我们可以编写类似于这样的配置:

```js
> 1%
last 2 versions
not dead
```

那么之后，这些工具会根据我们的配置来获取相关的浏览器信息，以方便决定是否需要进行兼容性的支持：

- 条件查询使用的是`caniuse-lite`的工具，这个工具的数据来自于`caniuse`的网站上
- 最终借助`caniuse-lite`来查询`browserslist`的配置所适配的浏览器。
- 我们在安装webpack时，安装了`browserslist`这个库，其中就有对`caniuse-lite`工具的使用。

### 使用browerslist

#### 命令行中使用

```shell
$ npx browserslist ">1%, last 2 versions, not dead"
and_chr 100
and_ff 98
and_qq 10.4
and_uc 12.12
android 99
baidu 7.12
chrome 100
chrome 99
chrome 98
edge 99
edge 98
firefox 98
firefox 97
ie 11
ios_saf 15.4
ios_saf 15.2-15.3
ios_saf 14.5-14.8
kaios 2.5
op_mini all
op_mob 64
opera 83
opera 82
safari 15.4
safari 15.2-15.3
samsung 16.0

```

`>1%, last 2 version, not dead`匹配到浏览器如上，也就是说打包编译的代码只会支持上述浏览器。

#### 配置使用

有两种方案：

- 方案一：在`package.json`中配置；取并集，满足其中一个即可

  ```json
  "browerslist": [
    "> 1%",
    "last 2 versions",
    "not dead"
  ]
  ```

- 方案二：单独的一个配置文件`.browserslistrc`文件； 换行相当于取并集，满足其中一个即可

  ```js
  > 1%
  last 2 versions
  not dead
  ```

上面的配置，在前端工具编译时，会自动去查找使用browerslist的配置。

这时我们可以进行验证，在命令行中输入`npx browserslist`，默认就会去读取我们写的配置，输出结果和命令行中的输出结果相同。

#### 默认配置

如果没有设置配置，就会使用默认配置

```js
browserslist.default = [
    '> 0.5%',
    'last 2 versions',
    'Firefox ESR',
    'not dead'
]
```

#### 配置条件关系

我们编写多个条件，多个条件的关系如下：

- `or`或`,`表示取并集，满足其中一个条件即可

  - 如`> 0.5% or last 2 versions` 表示占有率大于`0.5%`或每个浏览器最近两个版本

  - `> 0.5%, last 2 versions` 同上

  - 换行也是并集，同上

    ```js
    > 1%
    last 2 versions
    not dead
    ```

- `and`，相当于取交集，表示必须同时满足所有条件

  - 如`> 0.5% and last 2 versions`表示占有率大于`0.5%`并且是最近两个版本的浏览器

- `not`，相当于取反

  - `> 0.5% and not last 2 versions` 占有率大于`0.5%`并不是最近两个版本的浏览器
  - `> 0.5% or not last 2 versions` 占有率大于`0.5%`或者不是最近两个版本的浏览器
  - `> 0.5%, not last 2 versions` 占有率大于`0.5%`或者不是最近两个版本的浏览器

有时，我们在运行项目中会看到如下提示：

```shell
rowserslist: caniuse-lite is outdated. Please run:
npx browserslist@latest --update-db

Why you should do it regularly:
https://github.com/browserslist/browserslist#browsers-data-updating
```

这是提示我们需要更新`.browserslistrc`中的配置，推荐运行上面的命令进行更新，上面链接中官方也给出了这么做的好处。

## PostCSS使用学习

### 认识PostCSS

> https://github.com/postcss/postcss/blob/main/docs/README-cn.md
>
> PostCSS 是一个允许使用 JS 插件转换样式的工具。 这些插件可以检查（lint）你的 CSS，支持 CSS Variables 和 Mixins， 编译尚未被浏览器广泛支持的先进的 CSS 语法，内联图片，以及其它很多优秀的功能。
>
> PostCSS 接收一个 CSS 文件并提供了一个 API 来分析、修改它的规则（通过把 CSS 规则转换成一个[抽象语法树](https://zh.wikipedia.org/wiki/抽象語法樹)的方式）。在这之后，这个 API 便可被许多[插件](https://github.com/postcss/postcss#plugins)利用来做有用的事情，比如寻错或自动添加 CSS vendor 前缀。

PostCSS是一个通过JavaScript来转换样式的工具；它是一个独立的工具。

这个工具可以帮助我们进行一些CSS的转换和适配，比如自动添加浏览器前缀、css样式的重置；但是实现这些工具，我们需要借助于PostCSS对应的插件。

PostCSS本身提供的功能是很少的，只是将CSS文件转换成语法树，然后我们再使用这个工具相关的插件，做相关的转换。

使用PostCSS呢主要有是两个步骤：

- 第一步：查找PostCSS在构建工具中的扩展，比如webpack中的postcss-loader；
- 第二步：选择需要的PostCSS相关的插件；

### 命令行中使用PostCSS

如果想单独在命令行中使用PostCSS，需要安装一个命令行的依赖`postcss-cli`。

安装`postcss`、`postcss-cli`

```shell
npm install postcss postcss-cli -D
```

接下来例子是给css样式添加各个浏览器前缀：

编写css文件`postcss-autofixer.css`

```css
:fullscreen {
  color: red;
}

.example {
  display: grid;
  transition: all .5s;
  user-select: none;
  background: linear-gradient(to bottom, white, black);
}
```

命令行中执行命令

```js
npx postcss -o test.css .\src\css\postcss-autofixer.css
// You did not set any plugins, parser, or stringifier. Right now, PostCSS does nothing. Pick plugins for your case on https://www.postcss.parts/ and use them in postcss.config.js.
```

输出提示告诉我们，PostCss什么都没做，我们查看输出文件`test.css`，会发现输出文件和输入文件没有区别，只是输出文件中多了sourceMappingURL的注释。

就像我们上面提到的，PostCSS本身什么都没做，只是将CSS转换成了抽象语法树，再将语法树转换成css代码输出，这个过程中，由于中间没有使用任何插件，css还保持了原样输出。所以输出文件和原文件一样。

我们需要配合插件`autofixer`，给我们的css代码增加前缀，安装插件：

```shell
npm install autoprefixer -D
```

再次执行命令，并且指定使用`autoprefixer`：

```shell
npx postcss --use autoprefixer -o test.css .\src\css\postcss-autofixer.css
```

我们可以看到输出文件`test.css`如下：

```css
:-webkit-full-screen {
  color: red;
}

:-ms-fullscreen {
  color: red;
}

:fullscreen {
  color: red;
}

.example {
  display: grid;
  transition: all .5s;
  -webkit-user-select: none;
     -moz-user-select: none;
      -ms-user-select: none;
          user-select: none;
  background: linear-gradient(to bottom, white, black);
}
```

注：可以在此网站线上查看autofixer处理CSS属性情况：https://autoprefixer.github.io/

我们还可以看到，`transition: all .5s;`属性没有做任何处理，这是因为PostCSS在读取`.browserslistrc`文件的配置后，认为需要适配的浏览器默认都已经支持`transition`属性了。

### 构建工具中使用PostCSS

> https://github.com/webpack-contrib/postcss-loader

真实开发中我们必然不会直接使用命令行工具来对css进行处理，而是借助于构建工具，在webpack中使用postcss就是使用`postcss-loader`来处理的

安装：

```shell
npm install postcss-loader -D
```

#### 使用autoprefixer插件

修改加载css的loader

```json
{
  test: /\.css$/,
  use: [
    'style-loader',
    'css-loader',
    {
      loader: 'postcss-loader',
      options: {
        postcssOptions: {
          plugins: [
            // require('autoprefixer')
            'autoprefixer' // 简写
          ]
        }
      }
    }
  ]
},
```

因为postcss需要有对应的插件才会起效果，所以我们需要配置它的plugin，这里已安装`autoprefixer`插件。

再执行`npm run build3`可以看到效果

![webpack的配置02](https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/Webpack5/webpack的配置02.png)

执行原理和我们命令行中使用原理相同，PostCSS将CSS转化成抽象语法树，然后通过`autoprefixer`插件的处理，它会根据`.browserslistrc`的配置，读取需要兼容的浏览器，给需要兼容的CSS属性加上对应的前缀，输出对应的CSS。

这里如果我们修改`.browserslistrc`的配置为

```js
last 2 version
```

再次执行`npm run build3`，生成的结果如下，我们可以看到`transition`和`background`属性也加上了对应的前缀来兼容需要适配的浏览器。

![webpack的配置03](https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/Webpack5/webpack的配置03.png)

#### 单独的postcss配置文件

如果我们需要在多个loader中使用postcss，如我们还编写了less的样式文件，我们可将上面写的postcss配置，再复制一份粘贴到解析less的规则中，完整如下：

```json {16-26,34-43 }
const path = require('path')

module.exports = {
  entry: './src/main.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, './build')
  },
  module: {
    rules: [
      {
        test: /\.css$/, // 匹配资源
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  // require('autoprefixer')
                  'autoprefixer' // 简写
                ]
              }
            }
          }
        ]
      },
      {
        test: /\.less$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          { // 再复制粘贴一份相同的
            loader: 'postcss-loader',
              options: {
              postcssOptions: {
                plugins: [
                  'autoprefixer'
                ]
              }
            }
          },
          { loader: 'less-loader' },
        ]
      }
    ]
  }
}
```

显然这是不合理的，我们可以将PostCss的配置单独写在根据目录的配置文件`postcss.config.js`中，对`postcss`的插件配置进行抽离：

```js {21,29}
module.exports = {
  plugins: [
    'postcss-preset-env'
  ]
}
```

那么webpack的配置文件中，只需要写`postcss-loader`即可，如下

```js
const path = require('path')

module.exports = {
  entry: './src/main.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, './build')
  },
  module: {
    rules: [
      {
        test: /\.css$/, // 匹配资源
        // use: [ // 完整写法
        //   { loader: 'css-loader' } // UseEntry
        // ],
        // use: ['css-loader'], //  use的简写 写多个只有一个属性的loader
        // loader: 'css-loader', // use的简写 只写一个loader
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader' // 只需这样写即可
        ]
      },
      {
        test: /\.less$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          { loader: 'postcss-loader' }, // 只需这样即可
          { loader: 'less-loader' },
        ]
      }
    ]
  }
}
```

此时，再执行`npm run build3`构建，`postcss-loader`会去读取根目录下`postcss.config.js`的配置插件信息进行处理，会得到相同的编译结果，可在浏览器中查看效果。

#### 使用postcss-preset-env插件

> PostCSS Preset Env lets you convert modern CSS into something most browsers can understand, determining the polyfills you need based on your targeted browsers or runtime environments.

事实上，在配置postcss-loader时，我们配置插件并不需要使用autoprefixer。

我们可以使用另外一个插件：[postcss-preset-env](https://github.com/jonathantneal/postcss-preset-env)。

- 它可以帮助我们将一些现代的CSS特性，转成大多数浏览器认识的CSS，并且会根据目标浏览器或者运行时环境添加所需的polyfill
- 也包括会自动帮助我们添加autoprefixer（所以相当于已经内置了autoprefixer）

首先，我们需要安装postcss-preset-env：

```shell
npm install postcss-preset-env -D
```

然后在配置文件`postcss.config.js`中配置插件

```js
module.exports = {
  plugins: [
    // require('autoprefixer')
    // 'autoprefixer', // 不再需要

    // require('postcss-preset-env')
    'postcss-preset-env' // 简写
  ]
}
```

注意：我们在使用某些postcss插件时，也可以直接传入字符串，`autoprefixer`和`postcss-preset-env`都可以，它们都会默认加上`require()`。具体是否可以简写，要看对应的插件是否支持。

一个例子：

- 这里在使用十六进制的颜色时设置了8位；
- 但是某些浏览器可能不认识这种语法，我们最好可以转成RGBA的形式；
- 但是autoprefixer是不会帮助我们转换的（只会处理前缀）
- 而postcss-preset-env就可以完成这样的功能；

index.css文件：

```css {3}
.content {
  color: red;
  background: #12345678;
}

:fullscreen {
  color: red;
}

.example {
  display: grid;
  transition: all .5s;
  user-select: none;
  background: linear-gradient(to bottom, white, black);
}

```

效果如下，不仅加上了前缀，而且处理了16进制的8位颜色设置:

![webpack的配置04](https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/Webpack5/webpack的配置04.png.png)

#### css-loader的一个属性`importLoaders`

当我们在一个css模块`index.css`中，导入另一个css模块`normalize.css`

```css
@import "./normalize.css";

.content {
  color: red;
  background: #12345678;
}

:fullscreen {
  color: red;
}

.example {
  display: grid;
  transition: all .5s;
  user-select: none;
  background: linear-gradient(to bottom, white, black);
}
```

`normalize.css`

```css
/* normalize.css */
:fullscreen {
  border-radius: 10px;
}
```

此时直接执行`npm run build3`，会看到`nromalize.css`没有进行前缀处理，这是为什么呢？

因为在配置处理CSS的loader中，前缀处理是在`postcss-loader`阶段处理的，当结束时，会进入下一个`css-loader`的处理流程，此时解析到`@import "./normalize.css"; `模块，那么就已经过了前缀处理的loader，webpack并不会自动倒回进行加前缀处理。

此时可以配置`css-loader`的一个参数`importLoaders`，这个选项允许配置在 `css-loader` 之前有多少 loader 应用于 `@import`导入的CSS 模块。

修改webpack配置如下

```js
const path = require('path')

module.exports = {
  entry: './src/main.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, './build')
  },
  module: {
    rules: [
      {
        test: /\.css$/, // 匹配资源
        use: [
          'style-loader',
          // 'css-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1
            }
          },
          'postcss-loader'
        ]
      },
      {
        test: /\.less$/,
        use: [
          { loader: 'style-loader' },
          // { loader: 'css-loader' },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 2
            }
          },
          { loader: 'postcss-loader' },
          { loader: 'less-loader' },
        ]
      }
    ]
  }
}
```

可以看到在`css`和`less`的Rule中，都添加了`importLoaders`属性：

- 0是默认值，表示不需要回溯Loader处理
- 1表示前面有一个loader；2 表示前面有两个，以此类推

那么再次运行`npm run build3`可以看到，编译结果中`normalize.css`也被正常处理了。
