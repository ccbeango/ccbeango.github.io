---
title: "Vue2源码的打包构建"
date: "2021-12-01 12:16:14"
series:
  name: "Vue2源码探究"
  order: 4
tags:
  - "Vue2源码探究"
  - "初探Vue"
draft: false
---

Vue.js源码使用了[Rollup](https://github.com/rollup/rollup)来编译代码，同时相关库的编译也输出了各种模块规范`AMD`、`CommonJS`、`UMD`和`IIFE`，输出的模块代码在`dist`目录中。

> https://rollupjs.org/guide/zh/
>
> Rollup 是一个 JavaScript 模块打包器，可以将小块代码编译成大块复杂的代码，例如 library 或应用程序。Rollup 对代码模块使用新的标准化格式，这些标准都包含在 JavaScript 的 ES6 版本中，而不是以前的特殊解决方案，如 CommonJS 和 AMD。ES6 模块可以使你自由、无缝地使用你最喜爱的 library 中那些最有用独立函数，而你的项目不必携带其他未使用的代码。ES6 模块最终还是要由浏览器原生实现，但当前 Rollup 可以使你提前体验。

## 构建Scripts

`package.json`文件的`scripts`中有3条构建脚本：

```json
{
  "script": {
    "build": "node scripts/build.js",
    "build:ssr": "npm run build -- web-runtime-cjs,web-server-renderer",
    "build:weex": "npm run build -- weex"
  }
}
```

分别用于构建不同环境下的代码。可以看到，Rollup构建的入口文件是`scripts/build.js`

## 执行构建

可以看到，Rollup构建的入口文件是`scripts/build.js`

```js
// 创建dict目录
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist')
}

// 获取所有构建配置
let builds = require('./config').getAllBuilds()

// filter builds via command line arg
if (process.argv[2]) {
  // yarn build:ssr | yarn build:weex
  const filters = process.argv[2].split(',')
  builds = builds.filter(b => {
    return filters.some(f => b.output.file.indexOf(f) > -1 || b._name.indexOf(f) > -1)
  })
} else {
  // filter out weex builds by default
  // 不传参默认过滤掉weex的构建配置 yarn build
  builds = builds.filter(b => {
    return b.output.file.indexOf('weex') === -1
  })
}

build(builds)
```

这段代码的逻辑是，`dist`不存在则创建该目录；然后导入配置`./config.js`并调用`getAllBuilds()`获取所有构建配置。再根据构命令执行时，传入的不同的参数，进行过滤，获取不同的构建配置。最后执行`build(builds)`，构建代码，输出到指定目录下。`build()`函数详见下文。

再来看`scripts/config.js`

```js
const aliases = require('./alias')
// 生成指定路径
const resolve = p => {
  const base = p.split('/')[0]
  if (aliases[base]) {
    // base是路径别名
    return path.resolve(aliases[base], p.slice(base.length + 1))
  } else {
    return path.resolve(__dirname, '../', p)
  }
}

const builds = {
  // Runtime only (CommonJS). Used by bundlers e.g. Webpack & Browserify
  'web-runtime-cjs-dev': {
    entry: resolve('web/entry-runtime.js'),
    dest: resolve('dist/vue.runtime.common.dev.js'),
    format: 'cjs',
    env: 'development',
    banner
  },
  'web-runtime-cjs-prod': {
    entry: resolve('web/entry-runtime.js'),
    dest: resolve('dist/vue.runtime.common.prod.js'),
    format: 'cjs',
    env: 'production',
    banner
  },
  // Runtime+compiler CommonJS build (CommonJS)
  'web-full-cjs-dev': {
    entry: resolve('web/entry-runtime-with-compiler.js'),
    dest: resolve('dist/vue.common.dev.js'),
    format: 'cjs',
    env: 'development',
    alias: { he: './entity-decoder' },
    banner
  },
  'web-full-cjs-prod': {
    entry: resolve('web/entry-runtime-with-compiler.js'),
    dest: resolve('dist/vue.common.prod.js'),
    format: 'cjs',
    env: 'production',
    alias: { he: './entity-decoder' },
    banner
  },
  // Runtime only ES modules build (for bundlers)
  'web-runtime-esm': {
    entry: resolve('web/entry-runtime.js'),
    dest: resolve('dist/vue.runtime.esm.js'),
    format: 'es',
    banner
  },
  // Runtime+compiler ES modules build (for bundlers)
  'web-full-esm': {
    entry: resolve('web/entry-runtime-with-compiler.js'),
    dest: resolve('dist/vue.esm.js'),
    format: 'es',
    alias: { he: './entity-decoder' },
    banner
  },
  // Runtime+compiler ES modules build (for direct import in browser)
  'web-full-esm-browser-dev': {
    entry: resolve('web/entry-runtime-with-compiler.js'),
    dest: resolve('dist/vue.esm.browser.js'),
    format: 'es',
    transpile: false,
    env: 'development',
    alias: { he: './entity-decoder' },
    banner
  },
  // ...
}
// ...
```

首先先来看`builds`的定义，这是生成rollup打包配置的基础配置。

每项中，键表示打包环境，如`web-runtime-cjs-dev`表示开发环境CommonJS规范的web-runtime版本。

值是一个对象，也就是打包该环境的接触配置：

- `entry` 属性表示构建的入口JS文件地址
  - 不同环境使用的Vue会有不同的入口文件，构建出不同的Vue代码，详见[Vue的入口文件](/blog/Vue2源码探究/Vue的入口文件)

- `dest` 属性表示构建后的JS 文件地址
- `format` 属性表示构建JS模块格式
  - `cjs` 表示构建出来的文件遵循CommonJS规范
  - `es` 表示构建出来的文件遵循 ES Module规范
  - `umd` 表示构建出来的文件遵循UMD规范
- `env` 表示打包Node环境 `development`、`production`
- `transpile` 表示打包时是否使用`rollup-plugin-alias`插件
- `banner` 文件头注释
- `alias`
- `external` 打包时要排除的模块
- `moduleName` 打包成模块的模块名
- `plugins` 打包时需要的插件

在生成`entry`和`output`两个路径时，使用到`resolve`方法，`resolve()`方法的目的就是返回路径字符串，它先把传入的拼接路径参数 `p` 通过 `/` 做了分割成数组，然后取数组第一个元素设置为 `base`，`base`可能并不是真实的路径。

这里会通过`aliases[base]`来获取别名的真实路径，然后将别名路径与剩下的真实路径拼接返回入口或输出文件的真实路径。

配置文件中，导入了`alias.js`，这个文件中是Vue中定义的目录别名Map，如`aliases[vue]`即`D:\vue\src\platforms\web\entry-runtime-with-compiler`。

```js
const path = require('path')

const resolve = p => path.resolve(__dirname, '../', p)
/**
 * 定义目录别名
 */
module.exports = {
  vue: resolve('src/platforms/web/entry-runtime-with-compiler'),
  compiler: resolve('src/compiler'),
  core: resolve('src/core'),
  shared: resolve('src/shared'),
  web: resolve('src/platforms/web'),
  weex: resolve('src/platforms/weex'),
  server: resolve('src/server'),
  sfc: resolve('src/sfc')
}
```

如`web-runtime-cjs-dev`的`entry`为`resolve('web/entry-runtime.js')`，`aliases.web`获取到路径别名对应的真实路径`D:/vue/src/platforms/web`，然后拼接`/entry-runtime.js`得到最终的文件真实路径`D:/vue/src/platforms/web/entry-runtime.js`，因此也就找到了`web-runtime-cjs` 配置对应的入口文件。

它经过Rollup的构建打包后，最终会在dist目录下生成 `vue.runtime.common.dev.js`。

有了基本配置，接下来就可以使用基本配置来生成Rollup的打包配置，代码如下:

```js
/**
 * 生成指定builds[name]的配置
 * @param {*} name builds对象的键
 * @returns
 */
function genConfig (name) {
  const opts = builds[name]
  const config = {
    input: opts.entry,
    external: opts.external,
    plugins: [
      flow(),
      alias(Object.assign({}, aliases, opts.alias))
    ].concat(opts.plugins || []),
    output: {
      file: opts.dest,
      format: opts.format,
      banner: opts.banner,
      name: opts.moduleName || 'Vue'
    },
    onwarn: (msg, warn) => {
      if (!/Circular/.test(msg)) {
        warn(msg)
      }
    }
  }

  // built-in vars
  const vars = {
    __WEEX__: !!opts.weex,
    __WEEX_VERSION__: weexVersion,
    __VERSION__: version
  }
  // feature flags
  Object.keys(featureFlags).forEach(key => {
    vars[`process.env.${key}`] = featureFlags[key]
  })
  // build-specific env
  if (opts.env) {
    vars['process.env.NODE_ENV'] = JSON.stringify(opts.env)
  }
  config.plugins.push(replace(vars))

  if (opts.transpile !== false) {
    config.plugins.push(buble())
  }

  Object.defineProperty(config, '_name', {
    enumerable: false,
    value: name
  })

  return config
}

if (process.env.TARGET) {
  // 开发阶段根据package.json中yarn dev设置的Target，生成指定builds[target]的配置
  module.exports = genConfig(process.env.TARGET)
} else {
  exports.getBuild = genConfig
  exports.getAllBuilds = () => Object.keys(builds).map(genConfig)
}
```

可以看到，我们在打包入口文件`build.js`中就调用了`exports.getAllBuilds`导出的`getAllBuilds()`函数，这个函数获取到`buidls`的所有打包环境的key，并将key作为参数传入`genConfig()`方法。

`genConfig()`这个函数的逻辑是，根据传入的`name`找到打包对应的基础配置`const opts = builds[name]`，通过基础配置，生成真正的打包配置`config`。如`vue.runtime.common.dev.js`生成配置如下：

```js
{
  input: 'D:\\Work\\Vue\\learning-vue2\\vue\\src\\platforms\\web\\entry-runtime.js',
  external: undefined,
  plugins: [
    { name: 'flow-remove-types', transform: [Function: transform] },
    { resolveId: [Function: resolveId] },
    { name: 'replace', transform: [Function: transform] },
    { name: 'buble', transform: [Function: transform] }
  ],
  output: {
    file: 'D:\\Work\\Vue\\learning-vue2\\vue\\dist\\vue.runtime.common.dev.js',
    format: 'cjs',
    banner: '/*!\n' +
      ' * Vue.js v2.6.14\n' +
      ' * (c) 2014-2021 Evan You\n' +
      ' * Released under the MIT License.\n' +
      ' */',
    name: 'Vue'
  },
  onwarn: [Function: onwarn]
}
```

`getAllBuilds()`方法的最终值，就是类似上述配置的一个数组`[config1, config2, ...]`。

有了打包配置后，我们再回到`build.js`文件中来看下真正执行打包的逻辑：

```js
/**
 * 构建所有配置
 * @param {Array} builds
 */
function build (builds) {
  let built = 0
  const total = builds.length
  const next = () => {
    buildEntry(builds[built]).then(() => {
      built++
      if (built < total) {
        // 递归，直至所有的配置完成代码构建
        next()
      }
    }).catch(logError)
  }

  next()
}

/**
 * 根据构建配置rollup构建
 * @param {*} config rollup构建配置
 * @returns
 */
function buildEntry (config) {
  const output = config.output
  const { file, banner } = output
  const isProd = /(min|prod)\.js$/.test(file)
  return rollup.rollup(config)
    .then(bundle => bundle.generate(output))
    .then(({ output: [{ code }] }) => {
      if (isProd) {
        // 生产环境压缩代码
        const minified = (banner ? banner + '\n' : '') + terser.minify(code, {
          toplevel: true,
          output: {
            ascii_only: true
          },
          compress: {
            pure_funcs: ['makeMap']
          }
        }).code
        // 写入文件
        return write(file, minified, true)
      } else {
        return write(file, code)
      }
    })
}

/**
 * 将打包code写入到指定文件中 并输出日志
 * @param {*} dest 文件名 即 output
 * @param {*} code 生成的代码字符串
 * @param {*} zip  写文件后report是否显示zip后size
 * @returns
 */
function write (dest, code, zip) {
  return new Promise((resolve, reject) => {
    // ouput 文件 + size 日志输出
    function report (extra) {
      console.log(blue(path.relative(process.cwd(), dest)) + ' ' + getSize(code) + (extra || ''))
      resolve()
    }

    fs.writeFile(dest, code, err => {
      if (err) return reject(err)
      if (zip) {
        // gzip压缩后尺寸报告
        zlib.gzip(code, (err, zipped) => {
          if (err) return reject(err)
          report(' (gzipped: ' + getSize(zipped) + ')')
        })
      } else {
        report()
      }
    })
  })
}
```

打包逻辑也很简单，执行`build()`函数传入所有需要打包的配置参数，函数中执行内部定义的`next()`，`next()`内部会调用`buildEntry()`进行每个配置的Rollup打包，打包完成后，会递归调用`next()`本身，直至所有配置都完成打包。

`buildEntry()`函数是真正执行Rollup打包的函数，完成打包后将编译后的代码通过`write()`方法将文件写入到指定位置，并输入日志报告，如：

```shell
dist\vue.runtime.common.dev.js 303.15kb
dist\vue.runtime.common.prod.js 63.62kb (gzipped: 22.98kb)
```

到此整个打包就结束了。

## Runtime + Compiler vs. Runtime-only

[Runtime + Compiler vs. Runtime-only](https://cn.vuejs.org/v2/guide/installation.html#%E8%BF%90%E8%A1%8C%E6%97%B6-%E7%BC%96%E8%AF%91%E5%99%A8-vs-%E5%8F%AA%E5%8C%85%E5%90%AB%E8%BF%90%E8%A1%8C%E6%97%B6)

- Runtime + Compiler

如果你需要在客户端编译模板 (比如传入一个字符串给 `template` 选项，或挂载到一个元素上并以其 DOM 内部的 HTML 作为模板)，就将需要加上编译器，即完整版。

- Runtime Only

当使用 `vue-loader` 或 `vueify` 的时候，`*.vue` 文件内部的模板会在构建时预编译成 JavaScript。你在最终打好的包里实际上是不需要编译器的，所以只用运行时版本即可。

因为运行时版本相比完整版体积要小大约 30%，所以应该尽可能使用这个版本。

如下所示：

```js
// 需要编译器
new Vue({
  template: '<div>{{ hi }}</div>'
})

// 不需要编译器
new Vue({
  render (h) {
    return h('div', this.hi)
  }
})
```

因为在 Vue.js 2.0 中，最终渲染都是通过 `render` 函数，如果写 `template` 属性，则需要编译成 `render` 函数，那么这个编译过程会发生运行时，所以需要带有编译器的版本。

在Vue CLI脚手架创建的项目中，如果想要使用Runtime + Compiler版本，在`vue.config.js`中设置[`runtimeCompiler`](https://cli.vuejs.org/zh/config/#runtimecompiler)为true即可。

## 小结

通过打包构建学习，了解了Vue的打包流程，也知道了不同的Vue版本是如何生成的，目前Vue开发脚手架中，默认设置的是Runtime Only版本。不过在学习过程中，会使用Runtime + Compiler版本。
