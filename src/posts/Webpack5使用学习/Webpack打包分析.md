---
title: "Webpack打包分析"
date: "2022-06-21 09:57:18"
series:
  name: "Webpack5使用学习"
  order: 11
tags:
  - "Webpack5使用学习"
draft: false
---

## 打包时间分析

如果我们希望看到每一个loader、每一个Plugin消耗的打包时间，可以借助于插件[speed-measure-webpack-plugin](https://github.com/stephencookdev/speed-measure-webpack-plugin)

注意：该插件在最新的webpack版本中存在一些兼容性的问题（和部分Plugin不兼容），暂时的做法是把不兼容的插件先删除掉，也就是不兼容的插件不显示它的打包时间，以便测试。

安装插件：

```shell
npm install speed-measure-webpack-plugin -D
```

这里注释掉不兼容插件`mini-css-extract-plugin`：

```js {24,33-36}
const path = require('path');
const { merge } = require('webpack-merge');
const baseConfig = require('./webpack.base');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const PurgeCSSPlugin = require('purgecss-webpack-plugin');
const glob = require('glob');
const CompressionPlugin = require('compression-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');

const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
const smp = new SpeedMeasurePlugin();

const config = merge(baseConfig, {
  mode: "production",
  module: {
    rules: [
      {
        test: /\.css/i,
        use: [
          // MiniCssExtractPlugin.loader,
          'style-loader',
          'css-loader'
        ],
        sideEffects: true
      }
    ]
  },
  plugins: [
    // new MiniCssExtractPlugin({
    //   filename: 'css/[name].[contenthash:6].css',
    //   chunkFilename: 'css/[name].[contenthash:6].css'
    // }),
    new PurgeCSSPlugin({
      // src下所有目录下的所有文件
      paths: glob.sync(path.resolve(__dirname, '../src/**/*'), {nodir: true}),
      safelist: function() {
        // 不移除html和body的样式
        return {
          standard: ['html', 'body']
        }
      }
    }),
    new CompressionPlugin({
      test: /\.(css|js)$/, // 匹配压缩的文件
      threshold: 500, // 设置文件从多大开始压缩
      minRatio: 0.8, // 至少的压缩比例 达不到就不会压缩 优先于threshold
      algorithm: 'gzip', // 压缩算法
    }),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      inject: 'body',
      cache: true, // 文件未改变时，不重新生成文件
      minify: {
        removeComments: true, // 是否要移除注释
        removeRedundantAttributes: false, // 是否移除多余的属性 input的type=text默认会被移除
        removeEmptyAttributes: true, // 是否移除一些空属性 如 <div id=""></div> id属性会被移除
        collapseWhitespace: false, // 折叠（移除）空格
        removeStyleLinkTypeAttributes: true, // 比如link中的type="text/css"
        keepClosingSlash: true, // 是否保持单元素的尾部
        minifyCSS: true, // 是否压缩内部style标签中的CSS
        minifyJS: { // 是否压缩script标签中的JS代码 利用的是Terser插件
          mangle: {
            toplevel: true
          }
        }
      }
    }),
    new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/runtime.+\.js$/])
  ],
  optimization: {
    usedExports: true,
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        terserOptions: {
          compress: {
            arguments: true
          },
          mangle: true,
          toplevel: true,
          keep_classnames: true,
          keep_fnames: true
        }
      }),
      new CssMinimizerPlugin()
    ],
    runtimeChunk: {
      name: 'runtime'
    }
  }
})

module.exports = smp.wrap(config);
```

执行打包后可在控制台看到如下结果，统计了总输出时间，各个插件和Loader运行时间，开发中可以做分析，确定哪一步影响了打包速度：

```shell
 SMP  ⏱
General output time took 1.92 secs

 SMP  ⏱  Plugins
BundleAnalyzerPlugin took 0.437 secs
TerserPlugin took 0.23 secs
HtmlWebpackPlugin took 0.177 secs
CompressionPlugin took 0.004 secs
ProvidePlugin took 0.001 secs
(unable to deduce plugin name) took 0 secs
InlineChunkHtmlPlugin took 0 secs
CssMinimizerPlugin took 0 secs

 SMP  ⏱  Loaders
babel-loader took 0.741 secs
  module count = 5
css-loader took 0.075 secs
  module count = 1
style-loader, and
css-loader took 0.034 secs
  module count = 1
modules with no loaders took 0.031 secs
  module count = 7
html-webpack-plugin took 0.015 secs
  module count = 1
```

## 打包文件分析

Webpack文档[bundle 分析](https://webpack.docschina.org/guides/code-splitting/#bundle-analysis)中介绍了多个分析工具，这里介绍两种方案。

第一种方案是使用 [官方分析工具](https://webpack.github.io/analyse/)，首先需要生成待分析的JSON文件：

```json
"scripts": {
  "stats": "webpack --config ./config/webpack.prod.js --profile --json stat.json'",
},
```

`--profile`、`--json`以JSON文件格式输出`stat.json`，然后将文件上传到官方分析工具即可查看分析结果。

第二种方案是使用插件[webpack-bundle-analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)，安装插件：

```shell
npm install webpack-bundle-analyzer -D
```

该插件支持很多配置，可在文档中查看具体配置

webpack配置中使用插件：

```json
const path = require('path');
const { merge } = require('webpack-merge');
const baseConfig = require('./webpack.base');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const PurgeCSSPlugin = require('purgecss-webpack-plugin');
const glob = require('glob');
const CompressionPlugin = require('compression-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = merge(baseConfig, {
  mode: "production",
  module: {
    rules: [
      {
        test: /\.css/i,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ],
        sideEffects: true
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash:6].css',
      chunkFilename: 'css/[name].[contenthash:6].css'
    }),
    new PurgeCSSPlugin({
      // src下所有目录下的所有文件
      paths: glob.sync(path.resolve(__dirname, '../src/**/*'), {nodir: true}),
      safelist: function() {
        // 不移除html和body的样式
        return {
          standard: ['html', 'body']
        }
      }
    }),
    new CompressionPlugin({
      test: /\.(css|js)$/, // 匹配压缩的文件
      threshold: 500, // 设置文件从多大开始压缩
      minRatio: 0.8, // 至少的压缩比例 达不到就不会压缩 优先于threshold
      algorithm: 'gzip', // 压缩算法
      // include:
      // exclude:
    }),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      inject: 'body',
      cache: true, // 文件未改变时，不重新生成文件
      // minify: false // 开发环境下，默认值
      minify: {
        removeComments: true, // 是否要移除注释
        removeRedundantAttributes: false, // 是否移除多余的属性 input的type=text默认会被移除
        removeEmptyAttributes: true, // 是否移除一些空属性 如 <div id=""></div> id属性会被移除
        collapseWhitespace: false, // 折叠（移除）空格
        removeStyleLinkTypeAttributes: true, // 比如link中的type="text/css"
        keepClosingSlash: true, // 是否保持单元素的尾部
        minifyCSS: true, // 是否压缩内部style标签中的CSS
        minifyJS: { // 是否压缩script标签中的JS代码 利用的是Terser插件
          mangle: {
            toplevel: true
          }
        }
      }
    }),
    new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/runtime.+\.js$/]),
    new BundleAnalyzerPlugin()
  ],
  optimization: {
    usedExports: true,
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        terserOptions: {
          compress: {
            arguments: true
          },
          mangle: true,
          toplevel: true,
          keep_classnames: true,
          keep_fnames: true
        }
      }),
      new CssMinimizerPlugin()
    ],
    runtimeChunk: {
      name: 'runtime'
    }
  }
});
```

执行`npm run build`时，这个工具会在8888端口上建立服务，访问该服务可以直接的看到每个包的大小。

- 比如有一个包时通过一个Vue组件打包的，但是非常的大，那么我们可以考虑是否可以拆分出多个组件，并且对其进行懒加载；
- 比如一个图片或者字体文件特别大，是否可以对其进行压缩或者其他的优化处理；
