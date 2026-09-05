---
title: "VSCode下Vue的断点调试"
date: "2021-07-17 19:00:50"
tags:
  - "前端"
  - "Vue"
draft: false
---

## 场景

前端调试代码，大多情况下我都会使用控制台的日志输出进行调试。但这在定位某些问题时会比较繁琐，要不停的增改输出，尤其是在调试其他人的代码时，会变得异常痛苦。

使用VSCode进行代码调试，会提高定位问题的效率。

此方法针对的是Vue2。

## 配置方法

### 安装Debugger for Chrome

~~首先确保VSCode中安装[Debugger for Chrome](https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome)~~

新版本不再需要安装此插件，VSCode已默认集成。

### 开启source-map

在webpack构建时，开启`source-map`，允许调试器将压缩代码映射回原文件相应的位置。

在`vue.config.js`中添加此配置：

```js
module.exports = {
  configureWebpack: {
    devtool: process.env.NODE_ENV === 'development' ? 'source-map' : false
  }
}
```

### 配置babel.config.js

```js
module.exports = {
  'env': {
    'development': {
      'sourceMaps': true,
      'retainLines': true
    }
  },
  presets: [
    '@vue/cli-plugin-babel/preset'
  ]
}

```

注意：有时会出现断点调试问题，`async/await`函数无法正常进行断点，这可能是因为babel转换的目标浏览器配置问题。可以在开发环境中配置预设的`targets`参数：

```json
module.exports = {
  env: {
    development: {
      sourceMaps: true,
      retainLines: true
    }
  },
  presets: [
    ['@vue/app', {
      targets: { chrome: 88, node: 12 } // 关键点
    }]
  ]
};

```

上面的配置中，指定了预设的目标浏览器版本，优先级高于`.browerslistrc`中的配置，那么编译的代码只需要支持chrome版本88、node版本12。可解决上述问题。

### 配置launch.json

**Vue: Start配置**

我们是在调试一个Node项目，首先需要启动项目，代替在控制台中输入`npm run start`或`yarn start`配置：

```json
{
  "name": "Vue: Start",
  "type": "node",
  "request": "launch",
  "protocol": "inspector",
  "runtimeExecutable": "${workspaceRoot}/node_modules/.bin/vue-cli-service",
  "env": { "NODE_ENV": "development", "DEVTOOL": "source-map" },
  "windows": {
    "runtimeExecutable": "${workspaceRoot}/node_modules/.bin/vue-cli-service.cmd"
  },
  "args":  ["serve", "--debug", "--mode development", "--open"],
  "preLaunchTask": "chrome-port-set",
  "console": "integratedTerminal"
}
```

- `runtimeExecutable` 配置要执行的命令`vue-cli-service`路径
- `args` 配置执行命令时设置的参数
- `preLaunchTask` 在执行此命令前，预执行的task，详见配置task.json
- `console` 配置日志输出位置

以上配置输入类似手动终端输入`npm run start`启动项目，`start`配置如下

```json
"scripts": {
  "start": "vue-cli-service serve --debug --mode development --open"
}
```

当前，如果`package.json`中已经配置了这条命令，可以配置执行`npm`或`yarn`命令，无需将所有参数都放在`args`参数中做拼接，`args`中加入想要额加入的参数即可，配置可改成：

```json
{
  "name": "Vue: Start",
  "type": "node",
  "request": "launch",
  "protocol": "inspector",
  "runtimeExecutable": "yarn",
  "runtimeArgs": ["serve"],
  "args":  ["--color"], // 额外添加参数
  "windows": {
    "runtimeExecutable": "${workspaceRoot}/node_modules/.bin/vue-cli-service.cmd"
  },
  "args":  ["serve", "--debug", "--mode development", "--open"],
  "preLaunchTask": "chrome-port-set",
  "console": "integratedTerminal"
}
```

那么就等价于

```json
"scripts": {
  "start": "vue-cli-service serve --debug --mode development --open --color"
}
```

**Attach to Chrome配置**

```json
{
  "name": "Attach to Chrome",
  "type": "chrome",
  "request": "attach",
  "urlFilter": "http://localhost:*",
  "port": 9222,
  "timeout": 120000,
  "webRoot": "${workspaceRoot}/src",
  "sourceMaps": true,
  "sourceMapPathOverrides": {
    "webpack:///./src/*": "${webRoot}/*",
    "webpack:///src/*": "${webRoot}/*"
  }
}
```

- `port`开启远程调试端口`9222`，这也是为什么要在Vue: Start配置预执行一个task，详见详见配置task.json开启远程端口配置
- `sourceMapPathOverrides` 重写源文件映射关系

**compounds 配置**

```json
"compounds": [
  {
    "name": "Vue: All",
    "configurations": ["Vue: Start", "Attach to Chrome"]
  }
]
```

- 配置同时启动`Vue: Start`和`Attach to Chrome`

### Launch to Chrome 配置

启动项目后，也可单独运行此配置，使用launch方法断点调试。

```json
{
  "type": "chrome",
  "request": "launch",
  "name": "Launch to Chrome",
  "url": "http://localhost:8025",
  "webRoot": "${workspaceFolder}/src",
  "breakOnLoad": true,
  "sourceMapPathOverrides": {
    "webpack:///src/*": "${webRoot}/*"
  }
}
```

完整配置如下：

```json
{
  // Use IntelliSense to learn about possible attributes.
  // Hover to view descriptions of existing attributes.
  // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Vue: Start",
      "type": "node",
      "request": "launch",
      "protocol": "inspector",
      "runtimeExecutable": "${workspaceRoot}/node_modules/.bin/vue-cli-service",
      "args":  ["serve", "--debug", "--mode development", "--open"],
      "preLaunchTask": "chrome-port-set",
      "console": "integratedTerminal"
    },
    {
      "name": "Attach to Chrome",
      "type": "chrome",
      "request": "attach",
      "urlFilter": "http://localhost:*",
      "port": 9222,
      "timeout": 10000,
      "webRoot": "${workspaceRoot}/src",
      "sourceMaps": true,
      "sourceMapPathOverrides": {
        "webpack:///./src/*": "${webRoot}/*",
        "webpack:///src/*": "${webRoot}/*",
      }
    },
    {
      "type": "chrome",
      "request": "launch",
      "name": "vuejs: chrome",
      "url": "http://localhost:8025",
      "webRoot": "${workspaceFolder}/src",
      "breakOnLoad": true,
      "sourceMapPathOverrides": {
        "webpack:///src/*": "${webRoot}/*"
      }
    }
  ],
  "compounds": [
    {
      "name": "Vue: All",
      "configurations": ["Vue: Start", "Attach to Chrome"]
    }
  ]
}
```

### 配置tasks.json

启动项目前，我们需要开启远程调试端口，以便`attach to chrome`可以远程Attach到浏览器。

```json
{
  // See https://go.microsoft.com/fwlink/?LinkId=733558
  // for the documentation about the tasks.json format
  "version": "2.0.0",
  "tasks": [
    {
      "label": "chrome-port-set",
      "type": "process",
      "command": "open",
			"args": ["/Applications/Google Chrome.app", "--args", "--remote-debugging-port=9222"],
      "windows": {
        "command": "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "args": [ "--remote-debugging-port=9222" ],
      },
      "isBackground": false,
      "problemMatcher": {
        "owner": "custom",
        "pattern": {
          "regexp": ""
        },
        "background": {
          "beginsPattern": "Starting development chrome\\.\\.\\.",
          "endsPattern": "Not launching vue app as debug argument was passed\\."
        }
      }
    }
  ]
}

```

- `"args": [ "--remote-debugging-port=9222" ]`这里的端口号要和`Attach to chrome`中的端口号一致。

在桌面快捷方式中，添加参数，可加上`chrome.exe --remote-debugging-port=9222 --user-data-dir=remote-debug-profile`，两个参数的作用如下：

> Setting the `--remote-debugging-port` tells the browser to listen on that port for a debug connection. Setting a separate `--user-data-dir` forces a new instance of the browser to be opened; if this flag isn't given, then the command will open a new window of any running browser and not enter debug mode. [vscode browser-debugging](https://code.visualstudio.com/docs/nodejs/browser-debugging)

也就是说：

- `-- remote-debugging-port`告诉浏览器在该端口上侦听调试连接。
- `-- user-data-dir` 将强制打开浏览器的一个新实例; 如果没有给出这个标志，那么该命令将打开任何正在运行的浏览器的一个新窗口，而不会进入调试模式。

在tasks.json中添加`--user-data-dir=remote-debug-profile`也可行，但每次都会打开一个没有任何插件的新窗口，没有自己扩展的任何Chrome插件，不便于Vue调试。但是不添加此参数，正如上面所说的，可能无法正常开启调试模式，我的做法是，关闭所有浏览器窗口，然后执行task开启一个调试模式的浏览器窗口，这样就可以解决此问题。

Windows环境下，可以写一个bat脚本，然后每次点击bat文件启动即可，这样就无需配置Task：

```bash
# chrome.bat
start C:\Program" "Files\Google\Chrome\Application\chrome.exe --remote-debugging-port=9222
```

注：路径中存在空格，可使用双引号对空格进行转义。

Mac环境下，创建一个Automater 。首选新建一个 Automater 应用， 然后选择 Run Shell Script，使用open命令并编辑所需要的参数：

```shell
open /Applications/Google\ Chrome.app --args --remote-debugging-port=9222
```

最后保存该脚本，下次可以通过桌面快捷方式启动了。

注：路径中存在空格，使用反斜杠`\`对空格进行转义。

## 启动项目

点击`Vue: All` 启动项目，在项目中打断点然后进行操作，可看到效果。

![image-20210728111945448](https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/Vue/VSCode下Vue的断点调试01.png)

可能遇到的问题：

- 项目启动时间过长，设置的`Attach to chrome`下的timeout已经超时，但是`Vue: start`还未启动完毕。可以等到项目启动完成之后，再单击`Attach to Chrome`即可。
- 断点打不上，一定要在上面提到的浏览器中打开页面进行调试。
  - 断点只能打到你当前在浏览器中建在的页面涉及的文件上，比如正在浏览编辑页面，那么断点可以打到编辑页面，但是无法在列表页面上打上可用断点。
  - 如果使用这个浏览器还是打不开，可以尝试关闭所有的浏览器，再运行一下项目试试。

## 总结

根据Vue调试配置的经验，可借鉴相同的思路，调试webpack打包的各种项目。

vscode调试配置参数一览： [vscode-js-debug options](https://github.com/microsoft/vscode-js-debug/blob/main/OPTIONS.md)

参考链接：

1. https://cn.vuejs.org/v2/cookbook/debugging-in-vscode.html
2. https://juejin.cn/post/6844903805620846606
3. https://code.visualstudio.com/docs/editor/debugging
4. https://code.visualstudio.com/docs/nodejs/browser-debugging
5. https://github.com/microsoft/vscode-js-debug/blob/main/OPTIONS.md
