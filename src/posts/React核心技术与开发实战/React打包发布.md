---
title: "React打包发布"
date: "2021-07-22 08:55:15"
series:
  name: "React核心技术与开发实战"
  order: 17
tags:
  - "React核心技术与开发实战"
draft: false
---

## React项目打包

对于使用脚手架创建的项目，打包是一件非常容易的事情：

```jsx
yarn build
```

<!--more-->

运行之后我们可以得到一个build目录，其文件结构如下：

```text
build
├── asset-manifest.json
├── favicon.ico
├── index.html
└── static
    ├── css
    │   ├── 2.64644618.chunk.css
    │   ├── 2.64644618.chunk.css.map
    │   ├── main.2173f363.chunk.css
    │   └── main.2173f363.chunk.css.map
    ├── js
    │   ├── 2.e29ea9d5.chunk.js
    │   ├── 2.e29ea9d5.chunk.js.LICENSE.txt
    │   ├── 2.e29ea9d5.chunk.js.map
    │   ├── main.7999b168.chunk.js
    │   ├── main.7999b168.chunk.js.map
    │   ├── runtime-main.65ece48c.js
    │   └── runtime-main.65ece48c.js.map
    └── media
        ├── download.3d89cf30.png
        ├── playbar_sprite.3c22467e.png
        ├── playpanel_bg.f95f52c7.png
        ├── sprite_02.046e0f81.png
        ├── sprite_button.398d627a.png
        ├── sprite_button2.fd7824a0.png
        ├── sprite_cover.741609ed.png
        ├── sprite_footer_01.7716863c.png
        ├── sprite_footer_02.5384e02f.png
        ├── sprite_icon.69882fbb.png
        └── sprite_icon2.306397d9.png
```

生成的文件作用：

- `/css`：
  - `main.2173f363.chunk.css`代表的项目中自己所编写的css代码
  - `2.64644618.chunk.css` 代表的是所依赖的第三方库，`vendor`(第三方库)的代码
  - `*.map`是所对应的映射文件
- `/js`：
  - `2.[hash].chunk.js`代表是所有依赖的第三方库， vendor(第三方库) 的代码
  - `main.[hash].chunk.js`我们自己编写的应用程序代码；
  - `runtime-main.[hash].js`代表的是Webpack runtime逻辑的chunk，用于加载和运行你的应用程序
- `/media`
  - 下面的文件是项目中依赖的资源文件，但并不是所有依赖的资源文件；webpack会根据配置，将一些小的资源文件直接转为base64应用在项目中。

## React打包优化

随着业务逻辑代码越多，main会变得非常臃肿；

那么首次项目运行时，就需要请求所有的的js文件，但是我们所需要的可能只是其中一小部分。很多模块，其实没有必要一开始就进行加载，这样就会影响首屏加载速度；

我们可以让某些组件用到时再加载（懒加载）；

使用react给我们提供的lazy函数即可实现懒加载。

```js
import React from 'react';
import { Redirect } from 'react-router-dom';

const CcDiscover = React.lazy(() => import('@/pages/discover'));
const CcFriend = React.lazy(() => import('@/pages/friend'));
const CcMine = React.lazy(() => import('@/pages/mine'));
const CcPlayer = React.lazy(() => import('@/pages/player'));

const CcAlbum = React.lazy(() => import('@/pages/discover/c-pages/album'));
const CcArtist = React.lazy(() => import('@/pages/discover/c-pages/artist'));
const CcDjRadio = React.lazy(() => import('@/pages/discover/c-pages/djradio'));
const CcRanking = React.lazy(() => import('@/pages/discover/c-pages/ranking'));
const CcRecommend = React.lazy(() => import('@/pages/discover/c-pages/recommend'));
const CcSongs = React.lazy(() => import('@/pages/discover/c-pages/songs'));

// import CcDiscover from '@/pages/discover';
// import CcFriend from '@/pages/friend';
// import CcMine from '@/pages/mine';
// import CcPlayer from '@/pages/player';

// import CcAlbum from '@/pages/discover/c-pages/album';
// import CcArtist from '@/pages/discover/c-pages/artist';
// import CcDjRadio from '@/pages/discover/c-pages/djradio';
// import CcRanking from '@/pages/discover/c-pages/ranking';
// import CcRecommend from '@/pages/discover/c-pages/recommend';
// import CcSongs from '@/pages/discover/c-pages/songs';

const routes = [
  {
    path: '/',
    exact: true,
    render: () => <Redirect to="/discover"/>
  },
  {
    path: '/discover',
    component: CcDiscover,
    routes: [
      {
        path: '/discover',
        exact: true,
        render: () => <Redirect to="/discover/recommend" />
      },
      {
        path: '/discover/recommend',
        component: CcRecommend
      },
      {
        path: "/discover/ranking",
        component: CcRanking
      },
      {
        path: "/discover/songs",
        component: CcSongs
      },
      {
        path: "/discover/djradio",
        component: CcDjRadio
      },
      {
        path: "/discover/artist",
        component: CcArtist
      },
      {
        path: "/discover/album",
        component: CcAlbum
      },
      {
        path: "/discover/player",
        component: CcPlayer
      }
    ]
  },
  {
    path: '/friend',
    component: CcFriend
  },
  {
    path: '/mine',
    component: CcMine
  }
];

export default routes;
```

但是，修改后运行代码会报错：

```jsx
Error: A React component suspended while rendering, but no fallback UI was specified.

Add a <Suspense fallback=...> component higher in the tree to provide a loading indicator or placeholder to display.
```

React希望我们提供一个在组件没有加载出来之前，显示的组件； 我们可以通过Suspense组件传入一个fallback属性；

```jsx
import React, { memo, Suspense } from 'react';
import { HashRouter } from 'react-router-dom';
import { renderRoutes } from 'react-router-config';
import { Provider } from 'react-redux';

import routes from './router';
import store from './store';

import AppHeader from '@/components/app-header';
import AppFooter from '@/components/app-footer';
import CcAppPlayerBar from './pages/player/app-player-bar';

export default memo(function App() {
  return (
    <Provider store={store}>
      <HashRouter>
        <AppHeader/>
        <Suspense fallback={<div>page loading</div>}>
          {renderRoutes(routes)}
        </Suspense>
        <AppFooter/>
        <CcAppPlayerBar/>
      </HashRouter>
    </Provider>
  )
})
```

## 项目部署

### 手动部署

每次将打包好的build资源目录手动复制到服务器可访问目录，这里使用docker启动nginx容器进行模拟：

```shell
docker run -d -p 9999:80 --name cc-music-web-nginx --mount type=bind,source=D:/Work/React/ReactLearning/04_learning_component/build,target=/usr/share/nginx/html nginx
```

也就是说每次在项目打包完之后，需要手动拷贝build目录到`D:/Work/React/ReactLearning/04_learning_component/`下才可以。

### 自动化部署

![image-20210722092103563](https://cdn.jsdelivr.net/gh/ccbeango/blogImages/React/React%E6%A0%B8%E5%BF%83%E6%8A%80%E6%9C%AF%E4%B8%8E%E5%BC%80%E5%8F%91%E5%AE%9E%E8%B7%B538.png)

创建一个可挂载数据卷：

```text
docker volume create jenkins-volume
```

使用docker启动jenkins容器：

```shell
 docker run -d -p 9998:8080 --name my-jenkins  -u root --mount source=jenkins-volume,target=/var/jenkins_home  jenkinszh/jenkins-zh
```

容器启动后，访问`localhost:9998`进行初始化，第一次会让我们安装插件（推荐插件直接安装即可），创建用户。

所需插件，一般在初始化时，推荐插件会安装。

#### General配置

![image-20210722095133113](https://cdn.jsdelivr.net/gh/ccbeango/blogImages/React/React%E6%A0%B8%E5%BF%83%E6%8A%80%E6%9C%AF%E4%B8%8E%E5%BC%80%E5%8F%91%E5%AE%9E%E8%B7%B539.png)

#### 源码管理配置

![image-20210722095244042](https://cdn.jsdelivr.net/gh/ccbeango/blogImages/React/React%E6%A0%B8%E5%BF%83%E6%8A%80%E6%9C%AF%E4%B8%8E%E5%BC%80%E5%8F%91%E5%AE%9E%E8%B7%B540.png)

#### 触发器配置

轮训SCM规则

- 第一颗`*`表示分钟minute：取值0-59，第几分钟执行
- 第二颗`*`表示小时hour：取值0-23，第几小时执行
- 第三颗`*`表示日day：取值1-31，第几日执行
- 第四颗`*`表示月month：取值1-12，第几月执行
- 第五颗`*`表示星期week：取值0-7，每周第几天执行

```shell
# 每半个小时构建一次或每半个小时检查一次远程代码分支，有更新则构建
H/30 * * * *

# 每两个小时构建一次或每两个小时检查一次远程代码分支，有更新则构建
H H/2 * * *

# 每天凌晨两点定时构建
H 2 * * *

# 每个月15号执行构建
H H 15 * *

# 工作日，上午9点整执行构建
H 9 * * 1-5

# 每周1，3，5，从8:30开始，截止19:30，每4小时30分构建一次
H/30 8-20/4 * * 1,3,5
```

![image-20210722095321188](https://cdn.jsdelivr.net/gh/ccbeango/blogImages/React/React%E6%A0%B8%E5%BF%83%E6%8A%80%E6%9C%AF%E4%B8%8E%E5%BC%80%E5%8F%91%E5%AE%9E%E8%B7%B541.png)

#### 构建环境配置

![image-20210722095347013](https://cdn.jsdelivr.net/gh/ccbeango/blogImages/React/React%E6%A0%B8%E5%BF%83%E6%8A%80%E6%9C%AF%E4%B8%8E%E5%BC%80%E5%8F%91%E5%AE%9E%E8%B7%B542.png)

#### 构建配置

![image-20210722095418202](https://cdn.jsdelivr.net/gh/ccbeango/blogImages/React/React%E6%A0%B8%E5%BF%83%E6%8A%80%E6%9C%AF%E4%B8%8E%E5%BC%80%E5%8F%91%E5%AE%9E%E8%B7%B543.png)

#### 构建后操作

需要配置 publish over shh，安装此插件，配置推送服务起ssh即可

![image-20210722095451697](https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/React/React核心技术与开发实践44.png)
