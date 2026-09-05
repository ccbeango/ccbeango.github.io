---
title: "Vue源码调试"
date: "2021-12-01 15:31:51"
series:
  name: "Vue2源码探究"
  order: 5
tags:
  - "Vue2源码探究"
  - "初探Vue"
draft: false
---

源码阅读过程中，时常需要进行断点调试，这里分享个人在学习过程中在VSCode中调试Vue代码的方法。

如果只是想在浏览器中断点调试代码，无需任何配置，直接打开demo下对应的html文件即可，但是只能看到编译后的Vue代码。

如果想要根据编译代码映射到真实代码，可以在VSCode中做些调试配置，提升代码调试的体验。

## VSCode中调试代码

VSCode中添加配置`launch.json`

```json
{
  // Use IntelliSense to learn about possible attributes.
  // Hover to view descriptions of existing attributes.
  // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Rollup",
      "type": "node",
      "request": "launch",
      "protocol": "inspector",
      "runtimeExecutable": "yarn",
      "runtimeArgs": ["dev"],
      "args":  ["--sourcemap"],
      "console": "integratedTerminal",
    },
    {
      "name": "Attach Demo",
      "type": "pwa-chrome",
      "request": "attach",
      "urlFilter": "http://localhost:*",
      "port": 9222
    },
    {
      "name": "Launch Demo",
      "type": "pwa-chrome",
      "request": "launch",
      "file": "${file}"
    }
  ]
}
```

配置的作用：

1. `Rollup` 运行`package.json`中定义的`yarn dev`脚本，同时添加上`--sourcemap`参数。关键在于添加`--sourcemap`参数，生成JS的source map映射。[什么是Source Map？](http://www.ruanyifeng.com/blog/2013/01/javascript_source_map.html)

2. `Attach Demo` 以Attach的方式监听调试。

3. `Launch Demo` 以launch的方式启动调试。

启动`Rollup`后，会启动监听模式来监听文件改动，实时生成`vue.js`和`vue.js.map`文件。

此时即可开始调试，有三种方式可进行代码调试：

**方法一**

直接在浏览器中打开对应的Demo文件，此时即可在浏览器中进行断点调试，但如果你在代码中有注释，可能就会出现编译生成的`vue.js`文件存在注释乱码，但不影响正常调试，此时在编译文件中打断点，断点会直接跳转到实际的代码实现文件位置。

**方法二**

找到demo下要运行的html文件，如`examples/demo/index.html`，运行`Launch Demo`，此时进行断点调试，可以在VSCode和浏览器中同时打断点，不会有乱码问题。

缺点是

1. 每次启动都会打开一个新的Chrome浏览器窗口，且浏览器窗口中没有任何配置，如我们安装的插件和收藏的文件夹等。

2. 断点调试时，可能由于电脑配置，存在VScode卡死问题，有时会断点失效。

**方法三（推荐）**

配合[LiveServer](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)插件，启动服务。

配置`tasks.json`

```json
{
  // See https://go.microsoft.com/fwlink/?LinkId=733558
  // for the documentation about the tasks.json format
  "version": "2.0.0",
  "tasks": [
    {
      "label": "chrome-port-set",
      "type": "process",
      "command": "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
      "isBackground": false,
      "args": [ "--remote-debugging-port=9222" ],
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

1. 运行task，启动一个远程调试端口9222的浏览器窗口，注意，如果已有打开的浏览器，会打开任何正在运行的浏览器的一个新窗口，可能不会进入调试模式。最好关闭所有窗口，再运行此task。
2. 启动LiveServer，此时可在Chrome打断点调试。
3. 运行`Attach Demo`启动服务，即可在VSCode和Chrome中打断点调试。

参考：

1. https://code.visualstudio.com/docs/nodejs/nodejs-debugging

2. https://code.visualstudio.com/docs/nodejs/browser-debugging
