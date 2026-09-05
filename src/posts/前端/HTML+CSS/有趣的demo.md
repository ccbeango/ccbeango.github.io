---
title: "有趣的demo"
date: "2021-12-09 12:38:04"
tags:
  - "前端"
  - "HTML+CSS"
draft: false
---

这里收集一些有趣的Demo

## 背景跟随鼠标移动

来源：https://www.bilibili.com/video/BV13Y411477J?spm_id_from=333.999.0.0

思路：监听鼠标事件，根据鼠标位置与图片在窗口中的偏移尺寸的差值，计算出鼠标移动时图片的偏移量，并操作CSS的`transform: translate(x, y)`赋值给相应的图片。

::: demo [vanilla]

```html
<html>
  <div class="background">
    <div class="shell11">
      <div class="content">
        <h2 class="title">Slide down<br />︾</h2>
        <div class="images">
          <div class="img1"></div>
          <div class="img2"></div>
          <div class="img3"></div>
          <div class="img4"></div>
          <div class="img5"></div>
          <div class="img6"></div>
        </div>
      </div>
    </div>
  </div>
</html>

<script>
  let bg = document.querySelector(".background");
  let img1 = document.querySelector(".img1");
  let img3 = document.querySelector(".img3");
  let img4 = document.querySelector(".img4");
  let img5 = document.querySelector(".img5");
  // 设置鼠标移动时触发的效果
  bg.addEventListener("mousemove", (e) => {
    // 获取鼠标的位置
    let mouseX = e.clientX;
    let mouseY = e.clientY;
    // 获取图片距离左侧和顶部的距离
    let img1x = img1.offsetLeft;
    let img1y = img1.offsetTop;

    let img3x = img3.offsetLeft;
    let img3y = img3.offsetTop;

    let img4x = img4.offsetLeft;
    let img4y = img4.offsetTop;

    let img5x = img5.offsetLeft;
    let img5y = img5.offsetTop;
    // 设置移动时的偏移量
    let diff1x = (mouseX - img1x) / 45;
    let diff1y = (mouseY - img1y) / 45;

    let diff3x = (mouseX - img3x) / 18;
    let diff3y = (mouseY - img3y) / 18;

    let diff4x = (mouseX - img4x) / 30;
    let diff4y = (mouseY - img4y) / 30;

    let diff5x = (mouseX - img5x) / 8;
    let diff5y = (mouseY - img5y) / 8;

    img1.style.transform = `translate(${diff1x}px,${diff1y}px)`;
    img3.style.transform = `translate(${diff3x}px,${diff3y}px)`;
    img4.style.transform = `translate(${diff4x}px,${diff4y}px)`;
    img5.style.transform = `translate(${diff5x}px,${diff5y}px)`;
  });
</script>

<style>
  .background {
    width: 800px;
    height: 400px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-image: linear-gradient(to bottom, rgb(86, 71, 117), #000, #000);
  }

  .shell11 {
    width: 100%;
    height: 400px;
  }

  .content {
    width: 100%;
    height: 100%;
    position: relative;
  }

  .content > .title {
    position: absolute;
    text-align: center;
    left: 50%;
    transform: translate(-50%);
    z-index: 999;
    margin-top: 300px;
    color: rgba(255, 255, 255, 0.9);
    -webkit-text-stroke: #000 2px;
    font: 600 100px;
  }

  .images {
    width: 100%;
    height: 100%;
    position: absolute;
    overflow: hidden;
  }

  .images div {
    width: 100%;
    height: 100%;
    background-size: cover;
    position: absolute;
  }

  .img1 {
    background-image: url("https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/Demo/背景跟随鼠标移动/1.480g5c775xq0.png");
  }

  .img2 {
    background-image: url("https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/Demo/背景跟随鼠标移动/2.2h2lezmdir60.png");
  }

  .img3 {
    background-image: url("https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/Demo/背景跟随鼠标移动/3.5mfqbazl21o0.png");
  }

  .img4 {
    background-image: url("https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/Demo/背景跟随鼠标移动/4.7i350ycvi9g0.png");
  }

  .img5 {
    background-image: url("https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/Demo/背景跟随鼠标移动/5.3icyd90l8rs0.png");
  }

  .img6 {
    background-image: url("https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/Demo/背景跟随鼠标移动/6.2b1kvzedh1z4.png");
    transform: translate(600px, 400px);
  }
</style>
```

:::

## B站头部效果

::: demo [vanilla]

```html
<html>
  <div class="container2">
    <div class="shell2">
      <img class="image" style="height: 100%; transform: translate(0, -8px)" src="https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/Demo/B站头部效果/1.7baum5pc1440.png"/>
    </div>
  </div>
</html>
<script>
  const shell2 = document.querySelector(".shell2");
  const image = document.querySelector(".image");
  shell2.addEventListener("mouseenter", function (e) {
    this.x = e.clientX;
    image.style.transition = "none";
  });
  shell2.addEventListener("mousemove", function (e) {
    this._x = e.clientX;
    const disx = this._x - this.x;
    const move = 36 - disx / -20;
    image.style.transform = `translate(${move}px,-8px)`;
  });
  shell2.addEventListener("mouseleave", function (e) {
    image.style.transition = 0.3 + "s";
    image.style.transform = "translate(0,-8px)";
  });
</script>
<style>
  .container2 {
    display: flex;
    justify-content: center;
    overflow: hidden;
  }
  .shell2 {
    width: 100%;
    height: 162px;
    display: flex;
    justify-content: center;
  }
</style>
```

:::

## 键盘

使用[Grid](http://www.ruanyifeng.com/blog/2019/03/grid-layout-tutorial.html)布局

::: demo [vanilla]

```html
<html>
<div class="container3">
  <div class="keyboard-base">
    <div class="key color">~</div>
    <div class="key">1</div>
    <div class="key">2</div>
    <div class="key">3</div>
    <div class="key">4</div>
    <div class="key">5</div>
    <div class="key">6</div>
    <div class="key">7</div>
    <div class="key">8</div>
    <div class="key">9</div>
    <div class="key">0</div>
    <div class="key">-</div>
    <div class="key">+</div>
    <div class="key delete color">Delete</div>
    <div class="key tab color">Tab</div>
    <div class="key">Q</div>
    <div class="key">w</div>
    <div class="key">E</div>
    <div class="key">R</div>
    <div class="key">T</div>
    <div class="key">Y</div>
    <div class="key">U</div>
    <div class="key">I</div>
    <div class="key">O</div>
    <div class="key">P</div>
    <div class="key">[</div>
    <div class="key">]</div>
    <div class="key backslash color">\</div>
    <div class="key capslock color">CapsLock</div>
    <div class="key">A</div>
    <div class="key">S</div>
    <div class="key">D</div>
    <div class="key">F</div>
    <div class="key">G</div>
    <div class="key">H</div>
    <div class="key">J</div>
    <div class="key">K</div>
    <div class="key">L</div>
    <div class="key">;</div>
    <div class="key">'</div>
    <div class="key return">Return</div>
    <div class="key leftshift color">Shift</div>
    <div class="key">Z</div>
    <div class="key">X</div>
    <div class="key">C</div>
    <div class="key">V</div>
    <div class="key">B</div>
    <div class="key">N</div>
    <div class="key">M</div>
    <div class="key">,</div>
    <div class="key">.</div>
    <div class="key">/</div>
    <div class="key rightshift color">Shift</div>
    <div class="key leftctrl color">Ctrl</div>
    <div class="key color">Alt</div>
    <div class="key command color">Command</div>
    <div class="key space">Space</div>
    <div class="key command color">command</div>
    <div class="key color">Alt</div>
    <div class="key color">Ctrl</div>
    <div class="key color">Fn</div>
  </div>
</div>
</html>

<style>
  .container3 {
    display: flex;
    justify-content: center;
  }
  .keyboard-base {
    box-sizing: border-box;
    min-width: 1085px;
    padding: 20px;
    background-color: rgb(56, 56, 56);
    border-radius: 10px;
    display: grid;
    grid-template-columns: repeat(30, 30px);
    grid-template-rows: repeat (5, 60px);
    grid-gap: 5px;
  }
  .key {
    background-color: rgb(243, 243, 243);
    border-radius: 5px;
    grid-column: span 2;
    font: 500 20px "";
    text-align: center;
    padding: 17px;
    border: 2px solid black;
  }
  .key:hover {
    box-shadow: inset 0 0 7px rgba(0, 0, 0, 0.8);
  }
  .color {
    background-color: rgb(180, 180, 180);
  }
  .delete {
    grid-column: span 4;
  }
  .tab {
    grid-column: span 3;
  }
  .backslash {
    grid-column: span 3;
  }
  .capslock {
    grid-column: span 4;
  }
  .return {
    background-color: rgb(250, 140, 70);
    grid-column: span 4;
  }
  .leftshift {
    grid-column: span 5;
  }
  .rightshift {
    grid-column: span 5;
  }
  .leftctrl {
    grid-column: span 3;
  }
  .command {
    grid-column: span 3;
    font-size: 14px;
  }
  .space {
    background-color: rgb(250, 140, 70);
    grid-column: span 13;
  }
</style>
```

:::

## 漫画翻页

::: demo [vanilla]

```html
<html>
<div class="container5">
	<div class="manga">
		<div class="b" style="--i:2;background-image: url(https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/Demo/漫画翻页/1.3ydk5lmt3v80.gif);"></div>
		<div class="c" style="--i:4;--s:1; background-image: url(https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/Demo/漫画翻页/2.3r8ddzabjmg0.gif);"></div>
		<div class="d" style="--i:3;--s:2; background-image: url(https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/Demo/漫画翻页/3.2h83x42p1p20.gif);"></div>
		<div class="e" style="--i:2;--s:3; background-image: url(https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/Demo/漫画翻页/4.1f02ogdb4g0w.gif);"></div>
		<div class="f" style="--i:1;--s:4; background-image: url(https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/Demo/漫画翻页/5.lk7hf0tkk40.gif);"></div>
	</div>
</div>
</html>
<style>
  .container5 {
    background-color: #9980FA;
    width: 800px;
    height: 500px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .manga {
    width: 270px;
    height: 420px;
    transform-style: preserve-3d;
    perspective: 1000px;
    transition: .8s;
  }
  .b,.c,.d,.e,.f{
    width: 270px;
    height: 400px;
    position: absolute;
    /* 这是翻页的起点，在左边 */
    transform-origin: left;
    background-size: cover;
    /* 这是翻页时元素之间的延迟 */
    transition: calc(var(--i)*.3s);
    /* 这是翻页时元素的层级 */
    z-index: calc(var(--i)*99);
  }
  .b,.c{
    border: solid 20px #576574;
    border-left: none;
    top: -20px;
    border-radius: 0 20px 20px 0;
  }
  .manga:hover .b{
      border-left: #576574 20px solid;
  }
  .manga:hover .c,.manga:hover .d,.manga:hover .e,.manga:hover .f{
      transform: rotateY(-180deg);
      /* 此时翻页的顺序会倒过来，所以我们的延迟和层级也要反一下 */
      transition: calc(var(--s)*.4s);
      z-index: calc(var(--s)*-99);
  }
  .a:hover{
      transform: translateX(100px);
  }
</style>
```

:::

## 砖石布局

::: demo [vanilla]

```html
<html>
  <div class="container6">
    <div class="shell5">
      <div class="tall"><span>1</span></div>
      <div><span>2</span></div>
      <div><span>3</span></div>
      <div class="wide"><span>4</span></div>
      <div><span>5</span></div>
      <div class="tall"><span>6</span></div>
      <div class="big"><span>7</span></div>
      <div><span>8</span></div>
      <div class="wide"><span>9</span></div>
      <div class="big"><span>10</span></div>
      <div class="tall"><span>11</span></div>
      <div><span>12</span></div>
      <div><span>13</span></div>
      <div><span>14</span></div>
      <div><span>15</span></div>
      <div class="wide"><span>16</span></div>
      <div><span>17</span></div>
      <div><span>18</span></div>
      <div class="wide"><span>19</span></div>
      <div><span>20</span></div>
      <div class="wide"><span>21</span></div>
      <div class="big"><span>22</span></div>
      <div><span>23</span></div>
      <div><span>24</span></div>
      <div class="big"><span>25</span></div>
      <div class="tall"><span>26</span></div>
      <div><span>27</span></div>
      <div><span>28</span></div>
      <div><span>29</span></div>
    </div>
  </div>
</html>
<style>
  .container6 {
    background-color: rgb(235, 151, 151);
    width: 800px;
    height: 400px;
  }
  .shell5 {
    /* 先设置网格布局 */
    display: grid;
    padding: 20px;
    /* 定义网格布局中行与列之间间隙的尺寸 */
    grid-gap: 20px;
    /* 该属性规定网格布局中的列数和宽度 */
    grid-template-columns: repeat(auto-fit, minmax(250px,1fr));
    /* 设置网格中行的默认尺寸 */
    grid-auto-rows: 270px;
    /* 属性控制自动放置项目在网格中的插入方式为填充 */
    grid-auto-flow: dense;
  }

  .shell5 > div{
    background-color: rgb(51,51,51);
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 5px;
    position: relative;
  }

  .shell5 span {
    color: #fff;
    font: 100 100px 'Kristen ITC';
    position: absolute;
    top: -10px;
    left: 20px;
    /* 给文字加个阴影 */
    text-shadow: -5px 0 rgb(0, 0, 0), 0 -5px rgb(0, 0, 0),5px 0 rgb(0, 0, 0),0 5px rgb(0, 0, 0);
  }
  .shell5 .wide{
    grid-column: span 2;
  }
  .shell5 .tall{
    grid-row: span 2;
  }
  .shell5 .big{
    grid-column: span 2;
    grid-row: span 2;
  }
</style>
```

:::

## 滚动视差

使用`background-clip`填充文字背景，监听容器内滚动事件，同步修改文字背景的`background-position`

::: demo [vanilla]

```html
<html>
  <div class="container7">
    <h1 class="title7">滚动一下</h1>
    <div class="image-title7"><span>Hello</span></div>
    <h2 class="h2title7">
      In winter, it is covered with snow and snow. When you climb to Jinding, you can see far and wide, and the
      scenery is very magnificent.
    </h2>
  </div>
</html>
<script>
  const container7 = document.querySelector(".container7")
  const imageTitle7 = document.querySelector(".image-title7")
  container7.addEventListener('scroll', (e) => {
    const scrollY = e.target.scrollTop

    if (scrollY !== 0) {
      imageTitle7.style.backgroundPosition = `calc(50% + ${scrollY}px) calc(50% + ${scrollY}px)`
    }else{
      imageTitle7.style.backgroundPosition = ''
    }
  })
</script>
<style>
.container7 {
  background-image: url("https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/Demo/滚动视差/mountain-range.48mb2m4uhd00.jpg");
  background-size: cover;
  background-position: 50% 50%;
  position: relative;
  height: 350px;
  overflow-x: hidden;
}

.title7 {
  position: absolute;
  text-align: center;
  width: 100%;
  letter-spacing: 10px;
  color: #fff;
}

.image-title7 {
  background-image: inherit;
  background-size: cover;
  background-position: 50% 50%;
  height: 350px;
  font: 900 13rem '';
  line-height: 50vh;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  width: 100%;
  text-align: center;
  overflow: hidden;
}

.h2title7 {
  position: absolute;
  letter-spacing: 2px;
  top: 35vh;
  width: 70%;
  color: #fff;
  left: 50%;
  transform: translateX(-50%);
  padding: 30px;
  background-color: rgba(0, 0, 0, .3);
}
</style>
```

:::

## 滑动视差

::: demo [vanilla]

```html
<html>
<div class="container8">
  <div class="shell8">
    <div class="image8" style="background-image: url('https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/西北游记/0602-03.jpeg');"></div>
    <div class="heading8">
        <h1>When you are confused</h1>
    </div>
    <div class="text8">
        <h1>Set goals in your mind</h1>
    </div>

    <div class="image8" style="background-image: url('https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/西北游记/0602-12.jpeg');"></div>
    <div class="heading8">
        <h1>When you're down</h1>
    </div>
    <div class="text8">
        <h1>Try to wake up the beast in your heart</h1>
    </div>

    <div class="image8" style="background-image: url('https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/西北游记/0607-02.jpeg');"></div>
    <div class="heading8">
        <h1>When prople leave you</h1>
    </div>
    <div class="text8">
        <h1>It's time to start your season</h1>
    </div>

    <div class="image8" style="background-image: url('https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/西北游记/0607-01.jpeg');"></div>
    <div class="heading8">
        <h1>Come on,stranger.</h1>
    </div>
  </div>
</div>
</html>
<style>
.container8 {
  height: 350px;
}
.shell8{
  height: 350px;
  overflow-x: hidden;
  perspective: 3px;
}
.shell8 div{
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  font-style: 30px;
  letter-spacing: 2px;
}
.image8{
  transform: translateZ(-1px) scale(1.6);
  background-size: 100% auto;
  width: 100%;
  height: 350px;
  z-index: -1;
}
.text8{
  height: 175px;
  background-color: #fff;
}
.text8 h1{
  color: #000;
}
.heading8{
  z-index: -1;
  transform: translateY(-105px) translateZ(1px);
  color: #fff;
  font-size: 30px;
}
</style>
```

:::

### 选项卡

::: demo [vanilla]

```html
<html>
  <div class="container9">
    <div class="shell9">
      <div class="shell-top9">
        <div class="main9">
          <div class="item">
            <img src="https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/Demo/选项卡/1.62jhj5mff2c0.png" />
            <div class="box-one"></div>
            <div class="box-two"></div>
            <div class="box-one"></div>
          </div>
          <div class="item">
            <img src="https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/Demo/选项卡/2.3u0lwarsd080.png" />
            <div class="box-one"></div>
            <div class="box-two"></div>
            <div class="box-one"></div>
          </div>
          <div class="item">
            <img src="https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/Demo/选项卡/3.3e2k9sidr9k0.png" />
            <div class="box-one"></div>
            <div class="box-two"></div>
            <div class="box-one"></div>
          </div>
        </div>
      </div>
      <div class="shell-bottom9">
        <div class="list9"><img src="https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/Demo/选项卡/1.62jhj5mff2c0.png" /></div>
        <div class="list9"><img src="https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/Demo/选项卡/2.3u0lwarsd080.png" /></div>
        <div class="list9"><img src="https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/Demo/选项卡/3.3e2k9sidr9k0.png" /></div>
      </div>
    </div>
  </div>
</html>
<script>
  const container9 = document.querySelector(".container9");
  const list9 = document.querySelectorAll(".list9");
  const main9 = document.querySelector(".main9");
  for (let i = 0; i < list9.length; i++) {
    list9[i].addEventListener("click", () => {
      main9.style.left = i * -100 + "%";
      if (i === 0) container9.style.backgroundColor = "rgb(250, 220, 250)";
      if (i === 1) container9.style.backgroundColor = "rgb(240, 175, 195)";
      if (i === 2) container9.style.backgroundColor = "rgb(180, 200, 150)";
    });
  }
</script>
<style>
  .container9 {
    height: 350px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    background-color: rgb(250, 220, 250);
    transition: 1s;
  }

  .shell9 {
    width: 200px;
    height: 300px;
    background-color: #fff;
    box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.4);
    display: flex;
    flex-direction: column;
  }

  .shell-top9 {
    width: 100%;
    height: 240px;
    border-bottom: 1px solid rgba(223, 223, 223);
    overflow-x: hidden;
  }

  .shell-top9 div {
    width: 300%;
    height: 100%;
    display: flex;
    position: relative;
    transition: 0.3s;
    left: 0;
  }

  .shell-top9 .main9 .item {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-evenly;
  }

  .shell-top9 .main9 .item img {
    width: 50px;
  }

  .shell-top9 .main9 .item .box-one {
    width: 70%;
    height: 10px;
    border-radius: 10px;
    background-color: rgb(220, 220, 220);
  }

  .shell-top9 .main9 .item .box-two {
    width: 50%;
    height: 10px;
    border-radius: 10px;
    background-color: rgb(220, 220, 220);
  }

  .shell-bottom9 {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    height: 58px;
  }

  .shell-bottom9 .list9 {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    filter: grayscale(0.5);
  }

  .shell-bottom9 .list9 img {
    width: 40px;
  }
</style>
```

:::

### 全景预览

::: demo [vanilla]

```html
<html>
  <div class="shell10">
    <div class="img10"></div>
  </div>
</html>
<script>
  const img10 = document.querySelector(".img10");
  img10.addEventListener("mouseenter", function (e) {
    this.x = e.clientX;
    this.y = e.clientY;
  });
  img10.addEventListener("mousemove", function (e) {
    this._x = e.clientX;
    this._y = e.clientY;
    const disx = this._x - this.x;
    const disy = this._y - this.y;
    const movex = disx * 2;
    const movey = -600 + disy / 1.6;
    img10.style.backgroundPosition = `${movex}px ${movey}px`;
  });
</script>
<style>
  .shell10 {
    width: 100%;
    height: 350px;
  }
  .img10 {
    width: 100%;
    height: 100%;
    background-image: url("https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/Demo/全景图/1.5wrxanc3ou80.jpg");
    background-repeat: repeat-x;
    background-position: 0 -600px;
  }
</style>
```

:::
