---
title: "HTML和CSS基础学习"
date: "2020-02-05 15:10:23"
tags:
  - "前端"
  - "HTML+CSS"
draft: false
---

记录下HTML+CSS的基础。

<!--more-->

HTML提供了大量元素，没一个元素都有特殊的用途，保证网页的丰富多样性：

- 区块：div
- 区分：span
- 文本：p、h1~h6、em、dt、dd
- 表格：table、tbody、thead、tr、td、th、tfoot、caption
- 表单：form、input、label、textarea、select
- 链接：a
- 图片：img
- 文档：html、head、title、body、meta
- 列表：ul、ol、li、dlside、footer、nav
- 其他：br、hr、iframe
- 结构：header、section、a、strong、pre、adderss、q、blcokquote、cite、code

## 文档声明

`<!DOCTYPE html>`

## HTML的基本元素

### html元素

是HTML文档的根元素，一个文档中只有一个，其他元素都是它的后代元素

W3C标准建议为html元素增加`lang`属性

```html
<html lang="en"></html>
```

作用是：

- 帮助语音合成工具确定要使用的发音
- 帮助翻译工具确定要使用的翻译规则

### head元素

head元素里面的内容是一些元数据（描述数据的数据）

一般用于描述网页的各种信息，如字符编码、网页标题。网页图标

- title
- meta
- style
- link

### h、p、strong、code、br、hr

### 字符实体

HTML中有一些字符是预留出来作特殊用途的，比如

- 小于号(<)
- 大于号（>）

想要在网页中正确地显示这些预留字符，必须使用字符实体，书写格式一般有两种

- &entity_name: &nbsp(空格) &lt(小于号)
- &#entity_number：&#160(空格) &#60（小于号）

### span元素

默认情况下，跟普通文本几乎没差别

用于区分特殊文本和普通文本，比如用来显示一些关键字。

对普通的文本进行归类。

### div元素

一般作为其他元素的容器，把其他元素包住，代表一个整体。

用于把网页分割为多个独立的部分。

### img元素

img元素是单标签

img元素的属性：

- src：设置图片的路径，可以使用绝对路径或相对路径。
- alt
- width
- height：使用很少

### a元素

定义超链接，用于打开新的URL

属性：

- href：链接地址。如果不写href属性，会被识别为普通文本。
- target：打开方式
  - `_self`
  - `_blank`
  - `_parent`：与iframe配合使用
  - `_top`：与iframe一起使用

a元素和base元素可以结合使用：

如果页面中要访问的url的域名或ip相同，可以抽离到base中。

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <base href="https://www.baidu.com" target="_blank">
</head>
<body>
    <a href="/">百度一下</a>
    <a href="/img/bd_logo1.png">百度logo</a>
</body>
</html>
```

#### 锚点

```html
<!-- 只有#号的锚点会跳转到页面顶部 -->
<a href="#">顶部</a>
<a href="#title1">标题1</a>
<a href="#title2">标题2</a>
<a href="#title3">标题3</a>

<h2 id="title1">我是内容1</h2>
<h2 id="title2">我是内容2</h2>
<h2 id="title3">我是内容3</h2>
```

#### 伪链接

有时候点击链接的时候不希望打开新的URL，而是希望做点别的事情，这时候就可以使用伪链接。

伪链接：没有指明具体链接地址的链接

点击伪链接之后具体来做什么事情，要编写对应的js代码。

如果暂时不需要做任何事情，可以用下面的形式

```html
<a href="#" onclick="return false;">伪链接1</a>
<a href="javascript:">伪链接2</a>
```

### iframe

现在使用很少。

在网页中嵌套网页。

### 标签语义化的重要性

标签语义化指的是选择标签的时候尽量让每一个标签都有正确的语义。

虽然很多标签之间互换之后也能实现功能，但还要遵守标签语义化原则。

比如自己可以用一个div去加上相应样式模仿h1标签，但是不推荐这么做，标签语义化很重要。

## 列表

HTMl提供了3组常用的用来展示列表的元素：

- 有序列表 ol、li
- 无序列表 ul、li
- 定义列表： dl、dt、dd

### 有序列表

`ol` (ordered list) 有序列表，直接子元素只能是`li`(list item)

```html
<ol>
  <li>海王</li>
  <li>海贼王</li>
  <li>上海堡垒</li>
  <li>星际穿越</li>
</ol>
```

对于列表，Chorme浏览器默认会加上如下样式元素。

```css
/* user agent stylesheet */
ol {
  display: block;
  list-style-type: decimal;
  margin-block-start: 1em;
  margin-block-end: 1em;
  margin-inline-start: 0px;
  margin-inline-end: 0px;
  padding-inline-start: 40px;
}

/* user agent stylesheet */
li {
  display: list-item;
  text-align: -webkit-match-parent;
}
```

浏览器默认加上了边距的样式，加边距的时候，Chrome使用了`margin-block-**`，而不是使用`margin-left`或其他的，是因为有些国家或地区在阅读时，可能是从右向左，这样设置更容易进行适配。

### 无序列表

`ul` (unordered list) 有序列表，直接子元素只能是`li`(list item)。

默认样式等，与有序列表基本相同。

### 定义列表

`dl`(definition list)定义列表，直接子元素只能是dt(definition term)、dd(definition description)。

`dt`：列表中每一项的项目名

`dd`：列表中每一项的具体描述，是对`dt`的描述、解释、补充。

- 一个`dt`后面一般紧跟着一个或多个`dd`。

`dt`、`dd`常见的组合是：

- 事务的名称、事务的描述
- 问题、答案

- 类别名、归属于这类的各种事务

```html
<dl>
   <dt>红饮料</dt>
   <dd>西瓜汁</dd>

   <dt>黑饮料</dt>
   <dd>咖啡</dd>

   <dt>白饮料</dt>
   <dd>牛奶</dd>
 </dl>
```

## 表格

`table`: 表格

`tr`：表格中的行

`td`：行中的单元格

### table相关属性

table的常用属性

| 属性        | 说明                                      |
| ----------- | ----------------------------------------- |
| border      | 边框的宽度                                |
| cellpadding | 单元格内部的间距                          |
| cellspacing | 单元格之间的间距                          |
| width       | 表格的宽度                                |
| align       | 表格的水平对齐方式<br>left、center、right |

```html
 <table border="1" cellspacing="10" width="500" align="center">
   <tr>
     <td>内容</td>
     <td>内容</td>
     <td>内容</td>
     <td>内容</td>
     <td>内容</td>
   </tr>
   <tr>
     <td>内容</td>
     <td>内容</td>
     <td>内容</td>
     <td>内容</td>
     <td>内容</td>
   </tr>
   <tr>
     <td>内容</td>
     <td>内容</td>
     <td>内容</td>
     <td>内容</td>
     <td>内容</td>
   </tr>
   <tr>
     <td>内容</td>
     <td>内容</td>
     <td>内容</td>
     <td>内容</td>
     <td>内容</td>
   </tr>
 </table>
```

### tr和td相关属性

tr常见属性

| 属性   | 说明                                                  |
| ------ | ----------------------------------------------------- |
| valign | 单元格的垂直对齐方式<br>top、middle、bottom、baseline |
| align  | 单元格的水平对齐方式<br>left、center、right           |

th和td常见属性

| 属性    | 说明                                               |
| ------- | -------------------------------------------------- |
| valign  | 单元格的垂直对齐方式 top、middle、bottom、baseline |
| align   | 单元格的水平对齐方式 left、center、right           |
| width   | 单元格的宽度                                       |
| height  | 单元格的高度                                       |
| rowspan | 单元格可横跨的行数                                 |
| colspan | 单元格可横跨的列数                                 |

### 细线表格

使用`cellspacing = 0`边框会合在一起，但是边框宽度是border*2。

可以使用`border-collapse`将边框合并。

```css
table {
  border: 1px solid #000;
  border-collapse: collapse;
}
```

### 表格的其他元素

**thead** 表格的表头

**tbody** 表格的主体 内容放在tbody中

**tfoot** 表格的页脚

**caption** 表格的标题

**th** 表格的表头单元格

### 单元格的合并

合并方向是向右、向下。

**colspan** 跨列合并

**rowspan** 跨行合并

### 表格CSS属性

设置单元格之间的间距，使用这个，尽量不要使用上面的

`border-spacing`用于设置单元格之间的水平、垂直间距。

- 2个值分别是cell之间的水平、垂直间距
- 如果只设置一个值，同时代表水平、垂直间距

```css
table {
  border-sapcing: 10px 20px;
}
```

![微信截图_20200913101720](https://cdn.jsdelivr.net/gh/ccbeango/blogImages/HTML+CSS/HTML%E5%92%8CCSS%E5%9F%BA%E7%A1%80%E5%AD%A6%E4%B9%A001.png)

## 表单

表单常用元素：

- `form` 表单 一般情况下，其他表单元素都是它的后代元素
- `input` 单行文本框、单选框、复选框、按钮等元素
- `textarea` 多行文本框
- `select、option` 下拉选择框
- `button` 按钮
- `label` 表单元素的标题
- `fieldset` 表单元素组
- `legend` fieldset的标题

### input元素

**input也是行内元素，准确地说是行内替换元素。**与img元素相似，页面最终展示的不是img元素，而是img中对应的那张图片，使用图片替换掉了img元素。input也是，不展示编写的input，而是展示成一个框。基本上所有的替换元素都是行内元素。

`input`的`type`类型：

- `text` 文本输入框（明文输入）
- `password` 文本输入框（密文输入）
- `radio` 单选框
- `checkbox` 复选框
- `button` 按钮
- `reset` 重置
- `submit` 提交表单数据给服务器
- `file` 文件上传

`input`其他属性：

- `maxlength` 允许输入的最大字数
- `placeholder` 占位文字
- `readonly` 只读
- `disabled` 禁用
- `checked` 默认被选中
- `selected` 下拉框默认选中选项
- `multiple` 下拉框多选
- `autofocus` 当页面加载时，自动聚焦
- `name` 名字
- `value` 取值
- `tableindex`
- `form` 设置所属的form元素（填写form元素的id），一旦使用了此属性，input元素即使不在form元素内部，它的数据也能提交给服务器。

布尔属性：

布尔属性可以没有属性值，写上属性就代表使用了这个属性。常见的布尔属性有，`diasbled`、`checked`、`readonly`、`multiple`、`autofocus`、`selected`。

如果要给这些布尔属性设置值，值就是属性名本身。

```html
<!-- 以下两种写法是等价的，建议采用第一种 -->
<input type="text" readonly disabled>
<input type="radio" checked>

<input type="text" readonly="readonly" disabled="disabled">
<input type="radio" checked="checked">
```

按钮的两种实现方式，在`form`中`button`按钮如果不设置任何属性，默认的作用是重置。但如果`form`设置了`action`属性，那么默认行为是提交

```html
 <!-- reset不写value，浏览器会默认赋值 -->
<input type="reset" value="重置">
<button>重置</button>
```

label可以跟某个input绑定，点击label就可以激活对应的input；有两种写法

```html
<div>
  <label for="phone">手机</label>
  <input type="text" value="" id="phone">
</div>

<label for="phone">
  手机
  <input type="text" value="" id="phone">
</label>

<div>
   <span>性别</span>
   <label for="male">男</label>
   <input type="radio" name="sex" id="male">
   <label for="female">女</label>
   <input type="radio" name="sex" id="female">
</div>
```

input去除边框，设置CSS属性`outline: none;`

例子：

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>

<body>
  <form action="" method="post">
    <fieldset>
      <legend>必填信息</legend>
      <div>
        <label for="phone">手机</label>
        <input type="text" value="" id="phone">
      </div>

      <div>
        <span>密码</span>
        <input type="password">
      </div>

      <div>
        <span>验证码</span>
        <input type="text">
        <input type="submit" value="获取验证码">
      </div>
    </fieldset>
    <fieldset>
      <legend>选填信息</legend>
      <div>
        <span>照片</span>
        <input type="file">
      </div>
      <div>
        <span>性别</span>
        <label for="male">男</label>
        <input type="radio" name="sex" id="male">
        <label for="female">女</label>
        <input type="radio" name="sex" id="female">
      </div>
      <div>
        <span>爱好</span>
        唱<input type="checkbox" name="hobby">
        跳<input type="checkbox" name="hobby">
        rap<input type="checkbox" name="hobby">
        篮球<input type="checkbox" name="hobby">
      </div>
      <div>
        <span>学历</span>
        <select name="" id="">
          <option value="0">小学</option>
          <option value="1">初中</option>
          <option value="2">高中</option>
        </select>
      </div>
      <div>
        <span>简介</span>
        <textarea name="" id="" cols="10" rows="3"></textarea>
      </div>
    </fieldset>
    <!-- reset不写value，浏览器会默认赋值 -->
    <input type="reset" value="重置">
    <!-- button按钮有一个默认的reset属性 -->
    <button>重置</button>
    <input type="submit" value="提交">
  </form>
</body>

</html>
```

### textarea元素

常用属性：

- `cols` 列数
- `rows` 行数

缩放的css设置

- 禁止缩放 `resize: none`
- 水平缩放 `resize: horizontal`
- 垂直缩放 `resize: vertical`
- 水平垂直缩放（默认） `resize: both`

### select和option

option是select的子元素，一个option代表一个选项

select常用属性：

- multiple 可以多选
- size 同时显示多少项

option常用属性

- selected 默认被选中

### form元素

常用属性：

- `action` 提交地址
- `method` 提交方法
- `target` 跳转方式
  - `_blank`：打开新页面跳转
  - `_self`在本页面跳转
- `enctype` 规定了在向服务器发送表单数据之前如何对数据进行编码
  - `application/x-www-form-urlencoded` 默认的编码方式
  - `multipart/form-data` 文件上传时必须为这个值，并且method为post
  - `text/plain` 普通文本传输
- `accept` 规定表单提交时使用的字符编码（默认UNKNOW，和文档相同的编码）

## Emmet语法

## ！ 和 html:x

使用`!`或`html[:x]`，x可以不写，或5或xml，能够直接生成html模板。

## > 子代 和 + 兄弟

```html
<!-- 结构 div>p>span>strong -->
<div>
  <p><span><strong></strong></span></p>
</div>

<!-- 结构 h2+div+p+ -->
<h2></h2>
<div></div>
<p></p>

<!-- div>h2+a+p>span -->
<div>
  <h2></h2>
  <a href=""></a>
  <p><span></span></p>
</div>
```

## * 多个 和 ^ 上一级

```html
<!-- div>p*3 -->
<div>
  <p></p>
  <p></p>
  <p></p>
</div>

<!-- div>span^div>p -->
<div><span></span></div>
<div>
  <p></p>
</div>

<!-- div>p*2>span^^h1+strong -->
<div>
  <p><span></span></p>
  <p><span></span></p>
</div>
<h1></h1>
<strong></strong>
```

## () 分组

```html
<!-- div>(p>span)+h2+strong -->
<p><span></span></p>
<h2></h2>
<strong></strong>

<!-- 转换 div>p*2>span^^h1+strong -->
<!-- 为 (div>(p*2>span))+h1+strong -->
<div>
  <p><span></span></p>
  <p><span></span></p>
</div>
<h1></h1>
<strong></strong>
```

感觉还是找上一层`^`好用。

## 属性(id属性、class属性、普通属性) 和 数字

```html
<!-- div#main -->
<div id="main"></div>

<!-- div.box  -->
<div class="box"></div>

<!-- div[title] -->
<div title=""></div>

<!-- div[title="哈哈"] -->
<div title="哈哈"></div>

<!-- 添加多个属性 div#main.box1.box2[title="test"]-->
  <div id="main" class="box1 box2" title="test"></div>

<!-- 练习div#main>div.box+p.p1+span.title^div#footer>div.box2 -->
  <div id="main">
    <div class="box"></div>
    <p class="p1"></p>
    <span class="title"></span>
  </div>
  <div id="footer">
    <div class="box2"></div>
  </div>
```

## {} 内容

```html
<!-- div.box{我是内容} -->
<div class="box">我是内容</div>
```

## $ 数字

```html
<!-- 属性数字 div.box$*4 -->
<div class="box1"></div>
<div class="box2"></div>
<div class="box3"></div>
<div class="box4"></div>

<!-- ul>li.item$$$*5 -->
<ul>
  <li class="item001"></li>
  <li class="item002"></li>
  <li class="item003"></li>
  <li class="item004"></li>
  <li class="item005"></li>
</ul>


<!--  内容数字 div.box{我是内容$}*3 -->
<div class="box">我是内容1</div>
<div class="box">我是内容2</div>
<div class="box">我是内容3</div>
```

## 隐式标签

一些约定俗成，挡在不指定元素的时候，会根据情况生成元素。

一般情况下，隐式标签是代表`div`的，不过也可以代表`li`或`table`

```html
<!-- #main -->
<div id="main"></div>

<!-- .box -->
<div class="box"></div>

<!-- div>.wrap>.content -->
<div>
  <div class="wrap">
    <div class="content"></div>
  </div>
</div>

<!-- ul>.item${列表元素$}*3 -->
<ul>
  <li class="item1">列表元素1</li>
  <li class="item2">列表元素2</li>
  <li class="item3">列表元素3</li>
</ul>


<!-- table>#row$*4>[colspan=2] -->
<table>
  <tr id="row1">
    <td colspan="2"></td>
  </tr>
  <tr id="row2">
    <td colspan="2"></td>
  </tr>
  <tr id="row3">
    <td colspan="2"></td>
  </tr>
  <tr id="row4">
    <td colspan="2"></td>
  </tr>
</table>
```

## CSS的Emmet语法

部分举例。

```css
.box {
  /* w200+h150+m20+p30 */
  /* w200 */
  width: 200px;
  /* h200 */
  height: 150px;
  /* m20  */
  margin: 20px;
  /* p30  */
  padding: 30px;
}

.box2 {
  /* m20-20-40-50 */
  margin: 20px 20px 40px 50px;
}

.box3 {
  /* p-10-20--30 */
  padding: -10px 20px -30px;
}

.box4 {
  /* m10px20px */
  margin: 10px 20px;
}

.box5 {
  /* m10px-20 */
  margin: 10px -20px;
}
```

字体的

```css
.box{
 /* fz20 */
 font-size: 20px;

  /* fz1.5 */
  font-size: 1.5em;

  /* fw700 */
  font-weight: 700;
  /* lh40 */
  line-height: 40;
  /* lh40px */
  line-height: 40px;

  /* bgc#333 */
  background-color: #333333;
}
```

## CSS

CSS全称是Cascading Style Sheets。

CSS3：是CSS2.x以后对某一些CSS模块进行升级更新后的称呼，比如CSS Color Module Level 3、Select Level 3、CSS Namespaces Module Level 3。目前并不存在真正意义的CSS 3。

常见的CSS属性的具体用途，大致可以分类为：

- 文本：color、direction、letter-spacing、word-spacing、line-height、text-align、text-indent、text-transform、text-decoration、white-space
- 字体：font、font-family、font-style、font-variant、font-weight
- 背景：background、background-color、background-image、background-repeat、background-attachment、background-position
- 盒子模型：width、height、border、margin、padding
- 列表：list-style
- 表格：border-collapse
- 显示：display、visibility、overflow、opacity、filter
- 定位：vertical-align、position、left、top、right、bottom、float、clear

## CSS元素类型

元素类型可以用两种方式进行划分

### 块级、行内级元素

根据元素的显示类型，即能否在同一行显示，HTML元素可以主要分为两大类。

- 块级元素`block-level elements`
  - **独占父元素一行。**即==块级元素的宽度独占父级元素一整行==。高度会由内容撑起来。
  - 如div、p、pre、h1~h6、ul、ol、li、dl、dt、dd、table、form、article、aside、footer、header、hgroup、main、nav、section、blockquote、hr等
- 行内级元素`inline-level elements`
  - **多个行内级元素可以在父元素的同一行中显示**
  - 如a、img、span、strong、code、iframe、label、input、button、canvas、embed、object、video、audio等

例子

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    .box {
      width: 500px;
      height: 500px;
      background-color: orange;
    }

    .inner {
      height: 30px;
      background-color: red;
    }

    p {
      background-color: palegreen;
    }
  </style>
</head>
<body>
  <!-- 块级元素 -->
  <div class="box">
    <div class="inner"></div>
    <p>我是段落</p>
  </div>

  <!-- 行内级元素 -->
  <span>我是span元素</span>
  <strong>我是strong元素</strong>
  <input type="text">
</body>
</html>
```

### 替换、非替换元素

根据元素的内容类型，即是否浏览器会替换掉元素，HTML元素可以主要分为2大类

- 替换元素`replaced elements`
  - 元素本身没有实际内容，浏览器会根据元素的类型和属性，来决定元素的具体显示内容
  - 如img、input、iframe、video、embed、canvas、audio、object等
- 非替换元素`non-replaced elements`
  - 和替换元素相反，元素本身是有实际内容的，浏览器会直接将其内容显示出来，而不需要根据元素类型和属性来判断到底显示什么内容
  - 如div、p、pre、h1~h6、ul、ol、li、dl、dt、dd、table、form、article、aside、footer、header、hgroup、main、nav、section、blockquote、hr、a、strong、span、code、label等

#### 行内非替换元素注意点

以下属性对行内非替换元素不起作用

- `width`
- `height`
- `margin-top`
- `margin-bottom`

下面例子中`margin-left`生效，而`margin-top`是无效的。`width`和`height`也是无效的。

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    span {
      background-color: red;
      width: 100px;
      height: 100px;
      margin-left: 20px;
      margin-top: 100px;
    }
  </style>
</head>
<body>
  <span>span1</span>
  <span>span2</span>
</body>
</html>
```

以下属性对行内元素比较特殊：

- `padding-top`\\`padding-bottom`
- `border-top`\\`border-bottom`

这几个属性设置后上下会多出来区域，但不会占据空间。给它们设置成行内块级元素`display: inline-block`可以解决此问题。

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    .outer {
      margin-bottom: 100px;
    }

    span {
      background-color: red;
    }

    .span1 {
      padding-left: 20px;
      padding-bottom: 10px;
      padding-top: 20px;
      /* display: inline-block; */
    }

    .box1 {
      background-color: green;
      width: 100px;
      height: 50px;
    }

    .span2 {
      border-right: 10px solid purple;
      border-top: 10px solid blue;
      border-bottom: 10px solid yellow;
      /* display: inline-block; */
    }
  </style>
</head>

<body>
  <div class="outer">
    <span class="span1">span1</span>
    <span class="span1">span2</span>
    <div class="box1">div</div>
    <span class="span1">span3</span>
  </div>

  <div class="outer">
    <span class="span2">span1</span>
    <span class="span2">span2</span>
    <div class="box1">div</div>
    <span class="span2">span3</span>
  </div>
</body>

</html>
```

### 元素分类总结

<table>
    <tr>
      <td colspan="2">元素分类</td>
      <td>具体元素</td>
      <td>默认特性</td>
    </tr>
    <tr>
      <td rowspan="2">块级元素<br />（block-level elements）</td>
      <td>替换元素<br />(replaced elements)</td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>非替换元素(non-replaced elements)</td>
      <td>div、p、pre、h1~h6、ul、ol、li、dl、dt、dd、table、form、article、aside、footer、header、hgroup、main、nav、section、blockquote、hr
      </td>
      <td>独占父元素一行<br />可以随意设置宽高<br />高度默认由内容决定</td>
    </tr>
    <tr>
      <td rowspan="2">行内级元素<br />（inline-level elements）</td>
      <td>替换元素<br />(replaced elements)</td>
      <td>img、input、iframe、video、embed、canvas、audio、object等</td>
      <td>跟其他行内级元素在同一行显示<br />可以随意设置宽高</td>
    </tr>
    <tr>
      <td>非替换元素(non-replaced elements)</td>
      <td>a、strong、span、code、label等</td>
      <td>跟其他行内元素在同一行显示<br />不可以随意设置宽高<br />宽高由内容决定</td>
    </tr>
  </table>
### 元素之间的空格

行内级元素（包括`inline-block`元素）的代码之间如果有空格，会被解析显示为空格。

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    /* 方法3 */
    body {
      font-size: 0;
    }
    span, strong, div {
      font-size: 16px;

      float: left; /* 方法4 */
    }


    span {
      background-color: blue;
    }
    strong {
      background-color: coral;
    }
    div {
      display: inline-block;
      background-color: red;
    }
  </style>
</head>
<body>
  <div>
    <span>span</span>
    <strong>strong</strong>
    <div>我是div元素</div>
  </div>

   <!-- 方法1 -->
  <div>
    <span>span</span><strong>strong</strong><div>我是div元素</div>
  </div>

   <!-- 方法2 -->
   <div>
    <span>span</span><!--
 --><strong>strong</strong><!--
 --><div>我是div元素</div>
  </div>
</body>
</html>
```

为什么会产生空格，因为浏览器在解析多个空格或换行符时，会将其解析成一个空格。上面的第一个div中`span`、`strong`、`div`各占一行，三者之间的空格被解析成了一个空格。第二个div中三者之间没有空格，浏览器中显示也没有空格。

目前存在的解决方案：

1. 元素之间不要留空格（不建议）

2. 元素之间写注释（繁琐，不建议）
3. 设置父级元素`font-size: 0`，然后在元素中重新设置自己需要的`font-size`（不推荐）
   - 此方法不使用Safari
4. 给元素加浮动，一般都是使用这种办法。

### 元素之间的嵌套关系

块级元素、行内块元素`inline-block`：

- 一般情况下，可以嵌套任意的元素。如块级元素、行内级元素、`inline-block`元素
- 特殊情况，p元素不能包含其他块级元素

行内级元素（如`span`、`a`、`strong`等）

- 一般情况下，只能包含行内元素

## CSS样式应用

CSS样式应用到元素上有3种方法：

- 内联样式 （inline style）
- 文档样式表（document style sheet）、内嵌样式表（embed style sheet）
- 外部样式表 （external style sheet）

在Chrome中的调试窗口可以看到有些样式右上角标注`user agent stylesheet`，这是用户代理样式，即浏览器默认的标签样式。

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <link rel="stylesheet" href="./css/style.css">
  <style>
    /* 文档样式表 */
    .document-style {
      color: blue;
      font-size: 60px;
    }
  </style>
</head>
<body>
  <!-- 内联样式 inline -->
  <h1 style="color: red; font-size: 50px">哈哈哈</h1>

  <!-- 文档样式表 document style sheet -->
  <h1 class="document-style">呵呵呵</h1>

  <!-- 外部样式表 （external style sheet） -->
  <h1 class="external-style">咯咯咯</h1>
</body>
</html>
```

### css编码设置

关于外部样式表，推荐使用`utf-8`

这样可以避免浏览器解析样式，出现中文时的编解码错误。如：`font-family: '华文宋体'`，如果不设置编码，可能就会出错。

```css
@charset: "utf-8"
```

### 使用@import导入外部样式

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    @import: url('./css/style.css');
  </style>
</head>
<body>
  <h1 class="external-style">咯咯咯</h1>
</body>
</html>
```

使用`@import`引入和`<link>`进行引入都可以。

### 设置网页图标

```css
<link rel="icon" type="image/x-icon" href="">
```

link元素可以用来设置网页的图标

- link元素的`rel`属性不能省略，用来指定文档与链接资源的关系
- 一般rel若确定，响应的type也会默认确定，所以可以省略type
- 网页图标支持图片格式是`ico`、`png`，常用大小是`16*16`、`24*24`、`32*32`像素

## CSS选择器 （selector）

CSS选择器就是按照一定的规则，选择出符合条件的元素，为之添加CSS样式。

选择器种类大概可以分为：

- 通用选择器（universal selector）
- 元素选择器（type selectors）
- 类选择器（class selectors）
- id选择器（id selectors）
- 属性选择器（attribute selectors）
- 组合（combinators）
- 伪类（pseudo-classes）
- 伪元素（pseudo-elements）

### 通用选择器

选择所有的元素。

```css
* {
  color: red;
}
```

一般是用来给所有元素做一些通用性的设置。

```css
* {
  margin: 0;
  padding: 0;
}
```

### 元素选择器

选择指定的元素。

```css
div {
  color: red;
}
```

### class选择器

注意点：

- 一个元素可以有多个class，每个class之间用空格隔开
- class值如果由多个单词组成，`单词之间可以使用中划线

### id选择器

通过id选择选择指定元素，每个id值在一个文件中应该只出现一次。

### 属性选择器

根据属性进行选择，比如

```css
[title="test"] {
  color: red;
}

[title*="test"] {
  color: red;
}
```

### 后代选择器

又叫组合选择器，包含直接和间接所有的。

```html
<style>
div span {
  color: red;
}
</style>

<span>文字内容1</span>
<div class="box">
  <span>文字内容2</span>
  <p>
    <span>文字内容3</span>
  </p>
  <div>
    <span>文字内容4</span>
  </div>
  <span>文字内容5</span>
</div>
<span>文字内容6</span>
```

选中div下面span元素，所以选中的是2/3/4/5。

### 子代选择器

选择直接的子元素，只包含子代的。

```html
<style>
div > span {
  color: red;
}
</style>

<span>文字内容1</span>
<div class="box">
  <span>文字内容2</span>
  <p>
    <span>文字内容3</span>
  </p>
  <div>
    <span>文字内容4</span>
  </div>
  <span>文字内容5</span>
</div>
<span>文字内容6</span>
```

所以符合规则的是2/4/5

p标签中不可以包含div，包含的话结构会直接乱掉。

### 相邻兄弟选择器

div元素后面紧挨着的元素（且div、p元素必须是兄弟关系）

```html
<style>
  div+p {
    color: red;
  }
</style>
<p>文字内容1</p>
<div>
  <p>文字内容2</p>
</div>
<p>文字内容3</p>
<p>文字内容4</p>
```

符合规则的是3

### 全体兄弟选择器

div元素后面的p元素（且div、p元素必须是兄弟关系）

```html
<style>
  div~p {
    color: red;
  }
</style>
<p>文字内容1</p>
<div>
  <p>文字内容2</p>
</div>
<p>文字内容3</p>
<p>文字内容4</p>
```

符合规则的是3/4

### 选择器组

#### 交集选择器

同时符合2个条件的元素：div元素、class值有one的元素

```css
 <style>
    div.one[title="test"] {
      color: red;
    }
  </style>
  <div class="one">
    <p>文字内容1</p>
  </div>
  <div class="two">文字内容2</div>
  <p class="one">文字内容3</p>
    <div class="one" title="test">文字内容5</div>
</body>
```

符合规则的是5

#### 并集选择器

所有的div元素 + 所有class值有one的元素 + 所有title属性值等于test的元素。

```html
<style>
  div, .one, [title="test"] {
    color: red;
  }
</style>
<div class="one">文字内容1</div>
<span title="test">文字内容2</span>
<p class="one">文字内容3</p>
```

符合条件的有1/2/3

### 伪类选择器（pseudo-classes）

常见的伪类有

- 动态伪类（dynamci pseudo-classes）
  - `:link`、`:visited`、`:hover`、`:active`、`:focus`
- 目标伪类（target pseudo-classes)
  - `:target`

- 语言伪类(language pseudo-classes) 使用较少
  - `:lang()`
- 元素状态伪类(UI element state pseudo-classes)
  - `:enabled`、`:disabled`、`:checked`
- 结构伪类(structural pseudo-classes)
  - `:nth-child()`、`:nth-last-child()`、`:nth-of-type()`、`:nth-last-of-type()`
  - `:first-child`、`:last-child`、`first-of-type`、`:last-of-type`
  - `:root`、`:only-child`、`:only-of-type`、`:empty`
- 否定伪类(negation pseudo-classes)
  - `:not()`

#### 目标伪类

使用较少，一般在锚点中使用。

比如点击某个锚点，让选中的标题变颜色。

```css
/* 选中的锚点字体变成红色 */
:target {
  color: red;
}
```

#### 元素状态伪类

使用较少

设置某个元素处于某种状态时设置样式

```html
<style>
  button:enabled {
    color: green;
  }

  button:disabled {
    color: blue;
  }


</style>
<button>我是按钮1</button>
<button disabled>我是按钮2</button>
```

设置按钮在可用时是绿色，不可用时是蓝色。

#### 动态伪类

##### a元素上的使用

使用举例，可以在a链接上设置。

- `a:link`：未访问的链接
- `a:visited`：已访问的链接
- `a:hover`：鼠标移动到链接上
- `a:active`：激活的链接（鼠标在链接上长按住未松开）

```html
<style>
  /* 给a元素设置样式，会应用到所有伪类 */
  a {
      font-size: 20px
  }

  a:link {
    color: red;
  }

  a:visited {
    color: gray;
  }

  a:hover {
    color: blue;
  }

  a:active {
    color: orange;
  }
</style>
<a href="">Google一下</a>
```

如果给a元素设置样式，相当于给a元素的所有动态伪类都设置了。

要注意：

- `:hover`必须放在`:link`和`:visited`后面才能生效。
- `:active`必须放在`:hover`后面才能完全生效。

官方推荐的顺序是上面的顺序link visted hover acitve。

记忆小技巧：女朋友看到LV后，ha ha 大笑，哈哈哈。

##### 其他元素上的使用

`:hover`、`:active`也可以用到其他元素上：

```html
<style>
  strong:hover {
    color: blue;
  }

  strong:active {
    font-size: 30px;
  }

</style>
<strong>哈哈</strong>
```

##### :focus的使用

:focus指当前拥有输入焦点的元素（能接收键盘输入）

文本输入框聚焦后，北京变为灰色

```css
input:foucs {
  background: gray;
}
```

因为链接a元素可以被键盘Tab键选中聚焦，所以`:focus`也适用于a元素

```html
<style>
  a:focus {
    color: yellowgreen;
  }
</style>
<a href="">哈哈</a>
```

所以此时链接a上可以有五种动态伪类，建议的编写顺序为：

`:link`、`:visited`、`:focus`、`:hover`、`:active`

记忆：女朋友看到LV包包后，Feng了一样地ha ha大笑。

##### 去掉a元素的 :focus

开发过程中，a标签很多时候不希望获得foucs获取焦点。可以使用一些css的方法：

```css
a:focus {
  outline: none
}
```

这种方法其实是选中了，只是看不出来效果。

第二种办法，给a标签加上属性`tabindex`，这个属性是添加Tab键的选中顺序。

```html
<a tabindex="-1" href="">Google一下</a>
```

设置成`-1`之后，Tab键是无法选中的。

#### 结构伪类

##### :nth-child()

子元素选择器，选中第几个子元素改变样式。

```html
<style>
  /*
      交集选择器
     * 是一个p元素
     * 同时p元素作为子元素的第三个元素
  */
  p:nth-child(3) {
    color: red;
  }
</style>
<body>
  <div>
    <p>文字内容1</p>
    <p>文字内容2</p>
    <p>文字内容3</p>
    <p>文字内容4</p>
    <p>文字内容5</p>
  </div>
  <div>我是个div</div>
  <p>文字内容6</p>
</body>
```

文字内容3和6会变为红色。

`:nth-child()`根据n选择设置颜色，可以根据自己的需求，进行相关的计算。

```html
<style>
  /* 所有p的子元素设置为绿色 */
  p:nth-child(n) {
    color: green;
  }

  /* 偶数p红色 */
  p:nth-child(2n) {
    color: red;
  }

  /* 偶数p红色 */
  p:nth-child(even) {
    color: red;
  }

  /* 奇数p蓝色 */
  p:nth-child(2n+1) {
    color: blue;
  }

  /* 奇数p蓝色 */
  p:nth-child(odd) {
    color: blue;
  }

  /* 选中前5个设置紫色 */
  p:nth-child(-n+5) {
    color: purple;
  }
</style>
<div>
  <p>文字内容1</p>
  <p>文字内容2</p>
  <p>文字内容3</p>
  <p>文字内容4</p>
  <p>文字内容5</p>
  <p>文字内容6</p>
  <p>文字内容7</p>
  <p>文字内容8</p>
  <p>文字内容9</p>
</div>
```

一个例子

```html
<style>
  p:nth-child(4n+1) {
    color: red;
  }

  p:nth-child(4n+2) {
    color: blue;
  }

  p:nth-child(4n+3) {
    color: green;
  }

  p:nth-child(4n+4) {
    color: orange;
  }
</style>
<body>
  <div>
    <div>div</div>
    <p>文字内容1</p>
    <p>文字内容2</p>
    <p>文字内容3</p>
    <p>文字内容4</p>
    <span>span</span>
    <p>文字内容5</p>
    <p>文字内容6</p>
  </div>
</body>
```

p标签的颜色从上至下依次是：蓝、绿色、橘色、红色、绿色、橘色。

##### :nth-last-child()

`:nth-child()`是正着数，`:nth-last-child()`是倒着数。

其他的特性和`:nth-child()`是一样的。

`:nth-last-child(1)`倒数第一个子元素；

`:nth-last-child(2n)`选中偶数的子元素；

`nth-last-child(-n+2)`，代表最后两个子元素。

##### :nth-of-type()

`:nth-of-type()`用法和`:nth-child()`类似，不同点是`:nth-of-type()`计数时只计算同种类型的元素。

忽略其他类型，只选择同类的子元素进行样式添加。

```html
<style>
  p:nth-child(3) {
    color: blue;
  }

  p:nth-of-type(3) {
    color: red;
  }
</style>
<body>
  <div>
    <div>div</div>
    <p>文字内容1</p>
    <p>文字内容2</p>
    <p>文字内容3</p>
    <p>文字内容4</p>
    <span>span</span>
    <p>文字内容5</p>
    <p>文字内容6</p>
  </div>
</body>
```

文字内容2变成蓝色，文字内容3变成红色。`:nth-child()`会在所有的子元素中进行选择，`:nth-of-type()`只会在同类的子元素中进行选择。

`nth-of-type(2n)`或`:nth-of-type(2n+1)`表示从相同的子类中选择偶数或奇数。使用同上面的是一个原理。

假如说这样写就表示找每个类型的偶数。

```css
:nth-of-type(2n) {
  color:red;
}
```

再来看这例子，样式改变是什么哪些：

```html
<style>
  p:nth-of-type(2) {
    color: red;
  }
</style>

<body>

  <div>
    <p>文字内容1</p>
    <div>
      <p>文字内容2</p>
    </div>
    <div>
      <div>
        <p>文字内容3</p>
      </div>
      <p>文字内容4</p>
      <p>文字内容5</p>
    </div>
    <p>文字内容6</p>
  </div>

</body>
```

变红色字体的是5和6

##### :nth-last-of-type()

同理`nth-of-type()`，唯一不同是，倒过来找。不再赘述。

##### 其他伪类

- `:first-child` 等同于`:nth-child(1)`

- `:last-child`等同于`:nth-last-child(1)`

- `:first-of-type`等同于`:nth-last-of-type(1)`

- `:only-child`是父元素中唯一的子元素，选中。

  ```html

  <style>
    body :only-child {
      color: red;
    }
  </style>
  <!-- 文字内容2和3变红 -->
  <body>
    <p>文字内容1</p>
    <div>
      <p>文字内容2</p>
    </div>
    <div>
      <div>
        <p>文字内容3</p>
      </div>
      <p>文字内容4</p>
      <p>文字内容5</p>
    </div>
    <p>文字内容6</p>

  </body>
  ```

- `only-of-type`，是父元素中唯一的这种类型的子元素。

  ```html
  <style>
    body :only-of-type {
      color: red;
    }
  </style>
  <!-- 文字内容1、4和5变红 -->
  <body>
    <div>
      <p>
        <span>文字内容1</span>
      </p>
      <div>文字内容2</div>
      <div>文字内容3</div>
    </div>
    <div>
      <strong>文字内容4</strong>
      <a href="">
        <span>文字内容5</span>
      </a>
    </div>
  </body>
  ```

- `:root`根元素，也就是html元素。下面两种写法等价

  ```css
  html {

  }

  :root {

  }
  ```

- `:empty` 选中元素内容为空的元素。

  ```html
  <style>
    :empty {
      height: 20px;
      background-color: red;
    }
  </style>
  <!-- 空元素p和div会被选中 -->
  <body>
    <div>
      <p></p>
      <span>文字内容1</span>
    </div>
    <div>
      <strong>文字内容2</strong>
      <a href="">文字内容3</a>
      <div></div>
    </div>
  </body>

  ```

##### :not() 否定伪类

`:not()`的格式是`:not(x)`，表示除`x`以外的元素。

`x`是一个选择器，可以是：元素选择器、通用选择器、属性选择器、类选择器、id选择器、伪类（除否定伪类）。

```html
<style>
  body :not(div) {
    color: red;
  }
</style>
<!-- 文字内容2和3变红 -->
<body>
  <div>文字内容1</div>
  <p>文字内容2</p>
  <span>文字内容3</span>
  <div>文字内容4</div>
</body>

```

`:not()`中的参数也可以是类名或者id名

### 伪元素选择器 (pseudo-elements)

伪元素可以看成是行内元素。

常用的伪元素有：

- `:first-line`、`::first-line`
- `:fitst-letter`、`::first-letter`
- `:before`、`::before`
- `:after`、`::after`

为了区分伪元素和伪类，建议伪元素使用2个冒号，如`::first-line`

#### ::first-line

选中第一行，针对首行文本设置属性

```css
div::first-line {
  color: blue;
  text-decoration: underline;
}
```

只有下列属性可以应用到`::first-line`上：

- 字体属性、颜色属性、背景属性
- `word-spacing`、`letter-spacing`、`text-decoration`、`text-transform`、`line-height`

#### ::first-letter

选中第一个字母，针对首字母设置属性

```css
div::first-letter {
  color: blue;
  font-size: 30px;
}
```

只有下列属性可以应用在`::first-letter`上：

- 字体属性、margin属性、padding属性、border属性、颜色属性、背景属性
- `text-decoration`、`text-transform`、`letter-spacing`、`word-spacing`(适当的时候)、`line-height`、`float`、`vertical-align`(只有当float是none时)

#### ::before 和 ::after

`::before`和`::after`用来在一个元素内容之前或之后插入其他内容(可以是文字、图片)。

```html
<style>
span::before {
    content: "1";
    color: red;
    margin-right: 5px;
  }

  span::after {
    content: "abc";
    color: purple;
    margin-left: 5px;
  }
</style>

<body>
  <span>我是一个span</span>
</body>

```

这个元素中，不能省略content属性，即使里面是空字符串，属性是不能删除的。

```css
div::before {
  content: "";
  display: inline-block;
  width: 100px;
  height: 20px;
  background-color: red;
}

div::before {
  content: url("bg001.png")
}
```

## CSS常用属性

- color 前景色，不止字体颜色，例如还可以作用border边框，或text-decoration:line-through。
- font-size 字体大小
- background-color 背景颜色
- width/height 宽高

​ **宽度和高度不适用与非替换行内元素**

### 颜色设置的方法

1. 基本颜色关键字red、black、yellow、blue等，只有上百种基本颜色的关键字。
2. RGB颜色十进制：rgb()
3. RGBA颜色：和十进制之前相同，a指alpha，透明度。如：rgb()
4. RGB颜色十六进制：#FFFFFF

### 查看网站布局的技巧

在浏览器中打开开发者工具，然后添加一个新的div全局样式属性，增加`outline`就可以进行布局结构的查看

```css
div {
    outline: 2px solid red !important;
}
```

### CSS属性-文本

#### 文本 text-transform

转换文本大小写

#### 文本 text-decoration

text-decoration 用于设置文字的装饰线

很多时候用来去掉`a`标签的下划线。

```css
a {
  text-decoration: none;
}
```

还有就是比如用来加删除划线，划掉原来的价格。

html中的u标签，是设置了这个属性

```css
/* u标签默认样式 */
u {
    text-decoration: underline;
}
```

#### 文本 letter-sapcing

设置之母之间的间距

#### 文本 word-spacing

设置单词之间的间距

#### 文本 word-break

指定非中日韩脚本的单词换行规则。

#### 文本 text-ident

设置文本首行缩进。

可以使用但是`em`进行首行缩进。比如说，一段文本中的字体大小是`20px`，想要首行缩进2个字，可以使用`text-indent: 40px;`或`text-indet: 2em;`

```css
p {
  text-indent: 40px;
  text-indet: 2em;
}
```

#### 文本 text-align

设置元素内容在元素中的水平对齐方式。

```css
div {
  background-color: #0f0;
  text-align: center;
}
```

可以用户设置div中的元素，文本，图片等。

可以设置元素内容居中，但是不能设置div居中。因为div是块级元素，父级的盒子会认为它自己内部的盒子本身宽度和自己是一致的，所以是不会对内部的盒子产生作用。

```html
<style>
    .box {
      background-color: #0f0;
      text-align: center;
    }

    .inner {
      background-color: purple;
      width: 200px;
    }
</style>

<div class="box">
   <div class="inner">我是div</div>
</div>
```

如果不设置inner的宽度，看起来好现实box中设置的元素内容居中作用在了inner的div盒子上，其实不是的，由于继承，inner盒子也有了文本设置属性，他只是作用在了inner盒子的内容上。

可以这样改

```css
.inner {
  background-color: purple;
  width: 200px;
  display: inline-block
}
```

#### 文本 text-shadow

text-shadow用法与box-shadow类似，是用来设置文字阴影的。

text-shadow同样适用于伪元素`::first-line`、`::first-letter`

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    h1 {
      text-shadow: 5px 5px 3px orange;
    }

    p::first-line {
      text-shadow: 3px 3px 3px green;
    }

    p::first-letter {
      font-size: 25px;
      text-shadow: 5px 5px 5px purple;
    }
  </style>
</head>

<body>
  <h1>你好啊</h1>
  <p>
    无论是灾区搜救的机器人、无人驾驶的汽车、还是监视地面影像的卫星，穿透云层和雾霾的能力都非常有用。目前，科学家已开发出最先进的再成像系统LiDAR，通过配套的算法——可以测量单个光子的运动。这项技术特别与众不同之处在于，它可以复原被障碍物散射和反射掉的光子。
  </p>
</body>

</html>
```

### CSS属性-字体

Google浏览器设置字体，最小是12px，再小其实就看不清楚了。

浏览器默认字体的大小是浏览器自己设置的，例如chrome浏览器我们就可以自己在设置中进行字体样式的相关设置。

#### 字体 font-size

决定文字的大小。字体默认浏览器设置的大小是16px

常用设置：

具体数值+单位，如100px

也可以使用em单位，如`1em`代码100%，`2em`代表200%，`0.5em`代表50%。或者使用rem单位，现在移动端使用很多。

```html
<style>
    .box {
      font-size: 18px;
    }

    p {
      /* 相对于父级box的字体大小，所以字体大小是2*18px */
      font-size: 2em;
    }
  </style>
</head>
<body>
  <div class="box">
    <span>我是span元素</span>
    <p>我是段落，哈哈哈</p>
  </div>
</body>
```

#### 字体 font-family

用于设置字体的类型。如微软雅黑

当设置某种字体的时候，浏览器会去读取操作系统中是否有这种字体，Windows下会去`C:\Windows\Fonts`目录下寻找设置的字体是否存在，如果有就会去使用这种字体。

如果没有这种字体，那么设置的字体将失效。为了防止设置的字体刚好操作系统不存在，一般会一次性设置多个字体

```css
font-family: Arial, Helvetica, sans-serif;
```

字体中间有空格，可以使用单引号包含起来。

浏览器会从左至右依次选择设置的字体，直到找到可用的字体，如果都不存在，那么浏览器会使用操作系统的默认字体。

一般情况下，英文字体只适用于英文，中文字体同时适用于中文和英文。所以在开发中，中英文需要使用不同的字体，可以将英文字体写在前面，中文字体写在后面。

```css
div {
  font-family: "Courier New", "宋体"
}
```

#### 字体 font-weight

设置文本的粗细。

使用某些html标签，如h1~h6、b、strong，其实是浏览器给这些标签设置了font-weight属性，显示出来的字体就是加粗的。标签也是设置了css样式而已。

```css
/* h1的默认样式 */
h1 {
    display: block;
    font-size: 2em;
    margin-block-start: 0.67em;
    margin-block-end: 0.67em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    font-weight: bold;
}
/* b标签默认样式 */
b {
    font-weight: bold;
}
```

#### 字体 font-style

用于设置文字的常规、斜体显示。

如使用i标签，是加上了这个属性。

```css
i {
    font-style: italic;
}
```

我们很少使用这种标签，一般会使用字体样式来设置。

i标签使用很多，都会使用i标签和伪类配合，来设置小图标之类的。

#### 字体 font-variant

影响小写字母的显示形式。

`small-caps`将小写字母替换为缩小过的大写字母规格。

#### 字体 line-height

用于设置文本的最小行高。

##### 简单理解

行高可以简单理解为一行文本所占据的高度。

例子：

```html
<style>
  .box {
    background: green;
    font-size: 18px;
  }
</style>
<div class="box">
  我是div元素
</div>
```

设置的文本，在浏览器中显示，文本在盒子中占据了一定的高度，但要注意的是，**文本占据的高度并不等于文字的高度**，我们的直观印象会认为，一行文本占据的高度等于文本的高度，但这是不一定的。

打开浏览器选中“我是div元素”文本，我们可以看到，默认情况下文本占据的高度其实是大于文字的高度的，文本上下都多出来一部分区域。

上面的div我们并没有设置高度，不过我们都知道是有高度的，这个高度我们通常会说是里面的内容撑起来的。准确来说，撑起来div高度的就是文本的行高。

为什么要有行高呢？比如说我们在读一首诗时，这首诗是竖着读还是横着读，我们会自动根据这个诗字体间的间距去决定该怎样去读。就是因为这些文字之间有间距，我们潜移默化地会去决定怎样读这段文字。

##### 严格定义

行高的严格定义是，两行文字基线(baseline)之间的间距。

baseline：与小写字母`x`最底部对齐的线。

行距：当前文本底线和下一行文本顶线之间的距离。

![文章配图](https://cdn.jsdelivr.net/gh/ccbeango/blogImages/HTML%2BCSS/CSS入门基础概念总结02.png)

根据行高的定义，我们知道了行高就是右侧标出是行高的那根黑线即两条基线之间的高度，我们又可以知道其实右侧三条黑色箭头代表的高度都是行高。

我们要注意区分`height`和`line-height`的区别：

- height：元素的整体高度
- line-height：元素中每一行文字所占据的高度

行高一个最常用的实例就是，让一行文字在div内部进行垂直居中。

```html
<style>
  .box {
    font-size: 20px;
    height: 50px;
    line-height: 50px;
    background: green;
  }
</style>
<div class="box">
  我是div元素
</div>
```

上面的文字在div中是垂直居中的。

假如说当前的行高是30px，文本的高度是20px，现在行距就是10px，文本在排布的时候，上下距离各5px。所以上面的例子，设置的行高应该就是div盒子的高度，那么文字正好是居中的，距离上下各15px。

所以文本为什么可以居中，就是因为行高设定之后，行距会等分。

这个时候，其实`height`是可以不写的，行高已经将盒子撑起来了。当然，没有文本时，行高也没有意义。

#### 字体 font 多写属性

可以同时设置多个属性

```css
font: font-style font-variant font-weight font-size/line-height font-family
```

比如

```css
.box {
  font-size: 18px;
  font-family: "宋体";
  font-weight: bold;
  font-style: oblique;
  font-variant: small-caps;
  line-height: 50px;
}
/* 可写成 */
.box {
  font: oblique small-caps bold 30px/50px "宋体";
}
```

其中`font-style`、`font-variant`、`font-weight`可以随意调换顺序，也可以省略，不设置。

`/line-height`可以省略，如果不省略，必须跟在`font-size`后面。

### CSS属性 - vertical-aligin

`vrertical-align`会影响**行内级元素**在一个**行盒**中垂直方向的位置。

上面行高的时候说过，一个div没有设置高度的时候，在没有内容时，是没有高度的，有内容时，内容撑起高度。内容撑起高度的本质是内容有行高。

但是行高为什么可以撑起div的高度？

- 这是因为`line boxes`的存在，并且`line boxes`有一个特性，包裹每行的`inline level`。
- 而其中的文字是有行高的，必须将整个行高包裹进去，才算包裹这个`line-level`

文本有行高，行盒为了包裹文本，就将行盒的高度撑起来了，那么div的高度也就被撑起来了。

一个div中有一行或者多行内容，每一行都有一个行盒，行盒的高度会包裹每一行的内容。一段文字中插入一个图片，如果图片高度为100px，大于文字的行高30px，那么图片所在的那一行的行盒就会包裹（等于）图片高度，行盒高度等于100px。当然这一行中如果有更高的元素，那么行盒的高度就会更高。所有行盒的高度之和就是整个div的高度。

理解行盒的概念例子，第一行由于span高度是200px，第一行的行盒的高度就是200px。

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<style>
  div {
    background: red;
  }

  span {
    display: inline-block;
    width: 200px;
    height: 200px;
    background: green;
  }
</style>
<body>
  <div>
    哈哈哈哈哈哈哈<span></span>哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈
    哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈
    哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈
    哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈
    哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈
    哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈
    哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈
    哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈
    哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈
  </div>
</body>
</html>
```

行盒的高度必须要将一行中所有的内容都包裹起来，行盒的高度就等于一行中占用的元素占用的最大高度。

问题：如果div中有图片、文字、inline-block，甚至他们设置了margin这些属性，那么会如何？

- 情况一：如果只有文字，那么只包裹文字
- 情况二：有图片，有文字时，行盒会包裹图片
- 情况三：有图片、文字、inline-block（比图片要大），会包裹最大的，是全部包裹。
  - 此时我们注意到，图片和`inline-block`盒子底部都会有一点空间。
  - 这是因为默认情况下，所有行内级元素都是基线对齐的。此时图片和`inline-block`盒子的基线就是底部。
- 情况四：有图片、文字、inline-block（比图片要大），会包裹最大的，设置了margin-bottom，也是全部包裹。
- 情况五：`inline-block`中加入文本，那么就会文本对齐，因为还是为了保证基线对齐。

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<style>
  div {
    background: red;
  }

  span {
    display: inline-block;
    width: 200px;
    height: 200px;
    background: green;
  }

</style>
<body>
  <div>
    普通的文本
    <img src="http://taosha01-1253585015.cos.ap-shanghai.myqcloud.com/taosha/d620bec0-d61c-11ea-9c32-1172a154412d.png?imageMogr2/crop/100x100/center" alt="">
    <strong>strong文本</strong>
    <span></span>
    <span>加文本</span>
    <span>加文本加文本加文本加文本加文本加文本加文本</span>
    XXX 默认都是基线对齐的
  </div>
</body>
</html>
```

行内级元素默认是基线对齐的，可以看下面的例子，两个`inline-block`元素，可以看到他们下面还是会有间隙。就算没有文本，默认情况下浏览器会认为假如有文本存在，那么也会是基线对齐。也可以加上一些文本对照看到效果。

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<style>
  div {
    background: red;
  }

  span {
    display: inline-block;
    width: 200px;
    height: 200px;
    background: green;
  }

  i {
    display: inline-block;
    width: 200px;
    height: 200px;
    background: blue;
  }

</style>
<body>
  <div>
    <!-- <span>X</span> -->
    <span></span>
    <i></i>
    <!-- xxxxxxxxx对照文本 -->
  </div>
</body>
</html>
```

**vertical-align**

可以看到，上面的例子中，`line-boxes`行盒一定会想办法包裹住当前行中所有的内容。

它们的对齐方式看起来千奇百怪，但是其实有内在规律，就是**行内级元素在行盒内的默认情况下是基线对齐**。

`vertical-align`的默认值就是`baseline`。

baseline是什么呢？

- 文本的`baseline`是字母x的正下方
- `inline-block`默认的`baseline`是`margin-bottom`的底部，没有的话就是盒子的底部
- `inline-block`有文本时，`baseline`就是最后一行文本的x的正下方
- 那么上面的现象就都可以解释的通了。

`vertical-align`属性值：

- `baseline` 默认值 基线对齐
- `top` 把行内级盒子的顶部跟行盒顶部对齐
- `middle` 行内级盒子的中心点与父盒基线加上`x-height`一半的线对齐
- `bottom` 把行内级盒子的底部跟行盒底部对齐
- `<percentage>` 把行内级盒子提升或下降一段距离（距离相对于`line-height`计算/元素高度），0%意味着同`baseline`一样
- `<length>` 把行内级盒子提升或下降一段距离，0cm意味着同`baseline`一样

保证内容在行盒内对齐方式。

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<style>
  div {
    background: red;
    height: 300px;
    /* 行高大于200px 行盒按照300px包裹 */
    /* line-height: 300px; */
    font-size: 50px;
  }

  span {
    display: inline-block;
    width: 200px;
    height: 200px;
    background: green;
    vertical-align: middle;
  }

  strong {
    vertical-align: middle;
  }

</style>
<body>
  <div>
    <span>X</span>
    <strong>X</strong>
    xxxxxxxxx对照文本
  </div>
</body>
</html>
```

思考，上面的例子，如果设置行高为300px，那么`inline-block`的span是据中的吗？

答案是不居中的，我们可以看到，盒子靠下一点点，这是因为我们使用的字体，存在文字下沉。此时不能有文本，有文本就会出现下沉。

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<style>
  div {
    background: red;
    height: 300px;
    line-height: 300px;
    /* 解决文字下沉带来的不居中问题
    通常是图片不居中，这样设置就可以居中了 */
    font-size: 0px;
  }

  span {
    display: inline-block;
    width: 200px;
    height: 200px;
    background: green;
    vertical-align: middle;
  }
</style>
<body>
  <div>
    <span></span>
  </div>
</body>
</html>
```

做居中时，可以用定位去做，相对定位或绝对定位。或者flex布局

相对定位：

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<style>
  div {
    background: red;
    height: 300px;
  }

  span {
    position: relative;
    top: 50%;
    transform: translate(0, -50%);
    display: inline-block;
    width: 200px;
    height: 200px;
    background: green;
  }
</style>
<body>
  <div>
    <span></span>
  </div>
</body>
</html>
```

### CSS属性-列表

列表常见的CSS属性有四个，列表属性用的很少。

- list-style-type
- list-style-image
- list-style-position
- list-style

它们都可以继承，所以设置给`ol`、`ul`元素，默认也会应用到`li`元素。

#### 列表 list-style-type

设置li元素前面标记的样式

- **none** 去除标记样式

- dics 实心圆
- circle 空心圆
- square 实心方块
- decimal 阿拉伯数字
- lower-roman 小写罗马数字
- upper-roman 大写罗马数字

#### 列表 list-style-image

设置某张图片为`li`元素前面的标记，会覆盖`list-style-type`的设置。

#### 列表 list-style-position

设置li元素前面标记的位置：

- outside
- inside

#### 列表 list-style

是`list-tyle-type`、`list-tyle-image`、`list-tyle-position`的缩写属性。

```css
ul {
 list-style: outside url("image/dot.png");
}
```

一般最常用对还是直接设置为`none`，去掉前面的默认标记`list-style: none`。

### CSS属性-表格

### CSS属性-display

块级元素是浏览器给它默认加上了块级元素的属性。

display属性能够改变元素的显示类型，常见常用的：

- `block` 让元素显示为块级元素
- `inline` 让元素显示为行内级元素
- `inline-block` 让元素同时具备行内级、块级元素的特征。即既可以跟其他行内级元素在同一行显示，也可以随意设置宽高。若没有设置宽高，宽高有内容决定。可以理解为，对外是一个行内级元素，对内是一个块级元素。
- `none` 隐藏元素 元素不再占用空间
- `flex` 将对象作为弹性伸缩盒显示 https://www.ruanyifeng.com/blog/2015/07/flex-grammar.html
- `inline-flex` 将对象作为内联块级弹性伸缩盒显示 当Flex Box容器没有设置宽度大小限制时，当display 指定为 flex 时，FlexBox 的宽度会填充父容器，当display指定为 inline-flex 时，FlexBox的宽度会包裹子Item

以下取值，等同于某些HTML元素：

- `table` `<table>` 一个block-level表格
- `inline-table` `<table>` 一个inline-level表格
- `table-row` `<tr>`
- `table-row-group` `<tbody>`
- `table-header-group` `<thead>`
- `table-footer-group` `<tfoot>`
- `table-cell` `<td>`、`<th>`，一个单元格
- `table-caption` `<caption>`， 表格的标题
- `list-item` `<li>`

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    h1 {
      display: inline-block;
      width: 100px;
      height: 200px;
      background-color: red;
    }
    span {
      display: inline-block;
      width: 100px;
      height: 100px;
      background-color: blue;
    }
  </style>
</head>

<body>
  <!-- 非浮动元素是基线对齐的，看着会有点奇怪 -->
  <h1>你好</h1>
  <span>哈哈</span>
</body>
</html>
```

邮箱练习：

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    ul, li {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    a {
      text-decoration: none;
      color: #000;
    }

    .email {
      width: 100px;
      border: 2px solid #999;
      text-align: center;
    }

    .email  .header {
      background-color: #999;
      color: #fff;
    }

    /* 移动到div.email上时，显示ul邮箱列表 */
    .email:hover > ul {
      display: block;
    }

    .email ul {
      display: none;
    }

    .email ul li:hover {
      background-color: rosybrown;
    }

    /* 将a标签设置成块级元素，宽度占满父级元素宽度，实现整行都显示小手光标 */
    .email ul li a {
      display: block;
    }

  </style>
</head>

<body>
  <div class="email">
    <div class="header">邮箱</div>
    <ul>
      <li><a href="">qq邮箱</a></li>
      <li><a href="">163邮箱</a></li>
      <li><a href="">gmail邮箱</a></li>
    </ul>
  </div>
</body>
</html>
```

flex和inline-flex练习：

可以看到当不设置flex容器的宽度时，`flex`的容器会占据整行，`inline-flex`的容器会包裹item

```html
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Title</title>

    <style>
      /*Flex 容器*/
      .flex__container {
        display: inline-flex;
        background-color: gray;
      }

      .flex__container2 {
        width: 500px;
        display: flex;
        background-color: gray;
      }

      /*Flex 子 Item */
      .flex__item {
        width: 50px;
        height: 50px;

        background-color: aqua;
        border: 1px solid black;
      }
    </style>
  </head>
  <body>
    <!--Flex容器-->
    <div class="flex__container">
      <!--Flex容器中的子Item-->
      <div class="flex__item"></div>
      <div class="flex__item"></div>
      <div class="flex__item"></div>
      <div class="flex__item"></div>
    </div>

    <div class="flex__container2">
      <!--Flex容器中的子Item-->
      <div class="flex__item"></div>
      <div class="flex__item"></div>
      <div class="flex__item"></div>
      <div class="flex__item"></div>
    </div>
  </body>
</html>
```

### CSS属性-visibility

`visibility`能控制元素的可见性，有2个常用值：

- `visible` 显示元素
- `hidden` 隐藏元素

`visibility: hidden;`和`display: none;` 的区别：

- `visibility: hidden;` 虽然元素看不见了，但元素的框依旧还留着，还会占着原来的位置
- `display: none;` 不仅元素看不见了，而且元素的框也会被移除，不会占着任何位置

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    div {
      width: 100px;
      height: 100px;
      background-color: red;
      display: none;
      /* visibility: hidden; */
    }
  </style>
</head>
<body>
  <div>
    我是div元素
  </div>
  <p>我是段落</p>
</body>
</html>
```

### CSS属性-overflow

overflow用于控制内容溢出时的行为

- `visible` 默认值，溢出的内容照样可见
- `hidden` 溢出的内容直接剪裁，被隐藏
- `scroll` 溢出的内容被剪裁隐藏，但可以通过滚动机制查看
- `auto` 自动根据内容是否溢出来决定是否提供滚动机制

还有`overflow-x`和`overflow-y`可以分别设置水平垂直方向。建议还是直接使用`overflow`，因为目前`overflow-x`、`overflow-y`还没有成为标准，有些浏览器可能不支持。

### CSS属性-盒子模型

HTML中每一个元素都可以看做是一个盒子。可以具备四个属性：

- 内容`content` 盒子里面装的东西
- 内边距`padding` 盒子边缘和里面装的东西之间的间距
- 边框`border` 盒子的边框，边缘部分
- 外边距`margin` 盒子和其他盒子之间的间距

![微信截图_20200919141401](https://cdn.jsdelivr.net/gh/ccbeango/blogImages/HTML+CSS/HTML%E5%92%8CCSS%E5%9F%BA%E7%A1%80%E5%AD%A6%E4%B9%A002.png)

#### 内容 content

相关属性值：

- `width` 宽度
- `min-width` 最小宽度，无论内容多少，宽度都小于或等于其值。
- `max-width` 最大宽度，无论内容多少，宽度都大于或等于其值。常用于`inline-block`，用于达到一定宽度后换行。
- `height` 高度
- `min-height` 最小高度，无论内容多少，高度都小于或等于其值
- `max-height` 最大高度，无论内容多少，高度都大于或等于其值

#### 内边距 padding

**在默认的水平文档流方向下，padding属性的垂直方向的百分比值都是相对于父元素宽度计算的。**

相关属性值：

- `padding-left` 左内边距
- `padding-right` 右内边距
- `padding-top` 上内边距
- `padding-bottom` 下内边距
- `padding` 上面四个的简写，顺序是上、右、下、左。

padding的规律：

- 四个值`padding: 10px 20px 30px 40px` 上右下左

- 三个值`padding: 10px 20px 30px ` 上右下，左边跟随右边的值

- 两个值`padding:10px 20px ` 上和右，没有下，跟随上，没有左，跟随右

- 一个值`padding: 10px` 上下左右都使用同一个值

#### 外边距 margin

**在默认的水平文档流方向下，margin属性的垂直方向的百分比值都是相对于父元素宽度计算的。**

相关属性值：

- `margin-left` 左外边距
- `margin-right` 右外边距
- `margin-top` 上外边距
- `margin-bottom` 下外边距
- `margin` 上面四个属性的简写。规律同`padding`

#### 上下margin的传递，父子关系

**`margin-top`传递**：如果块级元素的顶部线和父元素的顶部线重叠，那么这个块级元素的margin-top值会传递给父元素。

下面的margin-top设置是在inner上，但是传递到了box2上

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    .box1 {
      width: 100px;
      height: 100px;
      background-color: red;
    }

    .box2 {
      width: 200px;
      height: 200px;
      background-color: orange;
    }

    .inner {
      width: 100px;
      height: 100px;
      background-color: orchid;
      margin-top: 20px;
    }
  </style>
</head>

<body>
  <div class="box1"></div>
  <div class="box2">
    <div class="inner"></div>
  </div>
</body>

</html>
```

**margin-bottom传递**：如果块级元素的底部线和父元素的底部线重叠，并且父元素的高度是`auto`，那么这个块级元素的`margin-bottom`值会传递给父元素。

下面的margin-bottom设置是在inner上，box2的高度是auto（没有设置），inner的`margin-bottom`传递到了box2上。

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    .box1 {
      width: 100px;
      height: 100px;
      background-color: red;
    }

    .box2 {
      width: 200px;
      background-color: orange;
    }

    .inner {
      width: 100px;
      height: 100px;
      background-color: orchid;
      margin-bottom: 20px;
    }
  </style>
</head>

<body>
  <div class="box2">
    <div class="inner"></div>
  </div>
  <div class="box1"></div>
</body>

</html>
```

如何防止出现传递问题？

1. 给父元素设置`padding-top`\\`padding-bottom`，让父级元素和内部元素的顶部、底部线不重叠，就可以防止此问题。不推荐。

   ```css
   .box2 {
     width: 200px;
     background-color: orange;
     padding-bottom: 5px;
   }
   ```

2. 给父元素设置`border`，也是让元素边界线不重叠。不推荐

   ```css
   .box2 {
     border-bottom: 5px solid yellowgreen;
     width: 200px;
     background-color: orange;
   }
   ```

3. 触发`BFC`（`block format context`）结界。BFC是解决此类问题最好的方法。

   - 浮动可以触发

   - 设置一个元素的`overflow`为非`visible`，如`hidden`、`auto`、`scroll`

     ```css
     .box2 {
       overflow: hidden;
       width: 200px;
       background-color: orange;
     }
     ```

建议：

- `margin`一般是用来设置兄弟元素之间的间距
- `padding`一般是用来设置父子元素之间的间距

#### 上下margin折叠

垂直方向上相邻的2个`margin`（`margin-top`、`margin-bottom`）有可能会合并为1个`margin`，这种现象叫做折叠`collapse`。

水平方向上的`margin`永远不会折叠。

折叠后最终值的计算规则：两个值进行比较，取较大的值。

- 两个兄弟块级元素之间上下margin的折叠。

![微信截图_20200919175937](https://cdn.jsdelivr.net/gh/ccbeango/blogImages/HTML+CSS/HTML%E5%92%8CCSS%E5%9F%BA%E7%A1%80%E5%AD%A6%E4%B9%A003.png)

- 父子块级元素之间的margin折叠。

![微信截图_20211109193800](https://cdn.jsdelivr.net/gh/ccbeango/blogImages/HTML+CSS/%E5%BE%AE%E4%BF%A1%E6%88%AA%E5%9B%BE_20211109193800.png)

块级元素折叠问题看似有点莫名其妙，实际上还有有用处的。比如连续的段落之间的`margin`，恰好需要这种折叠效果。

![微信截图_20200919180523](https://cdn.jsdelivr.net/gh/ccbeango/blogImages/HTML+CSS/HTML%E5%92%8CCSS%E5%9F%BA%E7%A1%80%E5%AD%A6%E4%B9%A004.png)

如何防止折叠？

- 只设置其中一个元素的`margin`。

#### margin-right无效问题

这个其实是包含块计算宽度的问题。

> [Block-level, non-replaced elements in normal flow](https://www.w3.org/TR/CSS2/visudet.html#blockwidth)
>
> The following constraints must hold among the used values of the other properties:
>
> 'margin-left' + 'border-left-width' + 'padding-left' + 'width' + 'padding-right' + 'border-right-width' + 'margin-right' = width of containing block
>
> If all of the above have a computed value other than 'auto', the values are said to be "over-constrained" and one of the used values will have to be different from its computed value. If the ['direction'](https://www.w3.org/TR/CSS2/visuren.html#propdef-direction) property of the containing block has the value 'ltr', the specified value of ['margin-right'](https://www.w3.org/TR/CSS2/box.html#propdef-margin-right) is ignored and the value is calculated so as to make the equality true. If the value of ['direction'](https://www.w3.org/TR/CSS2/visuren.html#propdef-direction) is 'rtl', this happens to ['margin-left'](https://www.w3.org/TR/CSS2/box.html#propdef-margin-left) instead.

下面的例子中，设置margin的左右边距都是20px，理论上应该左右边都有边距

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
            body {
                margin: 0;
            }
      .inner {
                width: 100%;
                height: 50px;
                margin: 0 20px;
                background: red;
            }
    </style>
  </head>
  <body>
    <div class="outer">
            <div class="inner"></div>
        </div>
  </body>
</html>
```

但实际上并非如此，我们会看到右侧是没有边距的。

根据CSS定义，margin-left + border-left-width + 'padding-left' + 'width' + 'padding-right' + 'border-right-width' + 'margin-right' = 包含块的宽度。

根据例子中的设置带入公式 20 + 0 + 0 + 100% + 0 + 0 + 20 = 包含块的宽度。

这里没有任何一个值是auto，相当于将所有的属性都做了限制，那么就是过渡约束（over-constrained），此时如果包含块的 `direction`属性值为`ltr`，则忽略指定的`margin-right` 值并计算该值以使等式成立。 如果`direction`的值是`rtl`，则会忽略`margin-left`进行计算。

在这里就会忽略margin-right的设置，取值就是0；

这里解决这个问题，可以把width: 100%删除，使width获取计算结果，就会看到右侧也有margin的间距。

#### 边框 border

边框宽度：

- `border-top-width`
- `border-right-width`
- `border-bottom-width`
- `border-left-width`
- `border-width`

边框颜色

- `border-top-color`
- `border-right-color`
- `border-bottom-color`
- `border-left-color`
- `border-color`

边框样式

- `border-top-style`
- `border-right-style`
- `border-bottom-style`
- `border-left-style`
- `border-style`

边框样式取值如图

![微信截图_20200919195202](https://cdn.jsdelivr.net/gh/ccbeango/blogImages/HTML+CSS/HTML%E5%92%8CCSS%E5%9F%BA%E7%A1%80%E5%AD%A6%E4%B9%A005.png)

`border-top`、`border-right`、`border-bottom`、`border-left`各个边的属性简写。

`border` 上面三个属性的简写，且不缺分顺序。按照个人习惯写就好。

#### 边框 形状

边框的形状可能是：

- 矩形
- 梯形
- 三角形

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    div {
      margin-bottom: 30px;
    }

    /* 矩形 */
    .box1 {
      width: 100px;

      border-top: 20px solid red;
    }

    /* 梯形 */
    .box2 {
      width: 50px;
      height: 50px;
      background-color: blue;
      border-top: 50px solid red;
      border-right: 50px solid yellow;
      border-bottom: 50px solid green;
      border-left: 50px solid purple;
    }

    /* 三角形1 */
    .box3 {
      width: 0;
      height: 0;
      border-top: 100px solid red;
      border-left: 100px solid green;
    }

    /* 三角形2 */
    .box4 {
      width: 0;
      height: 0;
      border-top: 50px solid red;
      border-left: 50px solid green;
      border-bottom: 50px solid blue;
      border-right: 50px solid purple;
    }

    /* 三角形3 */
    .box5 {
      width: 0;
      height: 0;
      border-top: 50px solid red;
      border-left: 50px solid transparent;
      border-right: 50px solid transparent;
    }

    /* 三角形4 */
    .box6 {
      width: 0;
      height: 0;
      border-top: 100px solid red;
      border-left: 100px solid transparent;
      transform: rotate(-45deg);
    }
  </style>
</head>

<body>
  <div class="box1"></div>
  <div class="box2"></div>
  <div class="box3"></div>
  <div class="box4"></div>
  <div class="box5"></div>
  <div class="box6"></div>
</body>
</html>
```

#### 边框 border-radius

圆角可以设置具体数值，也可以设置百分比值。

圆角相关属性：

- `border-top-left-radius`
- `border-top-right-radius`
- `border-bottom-left-radius`
- `border-bottom-right-radius`
- `border-radius`

`broder-*-*-radius`定义的是四分之一椭圆的半径

- 第一个是水平半径

- 第二个是垂直半径（如果不设置，就跟随水平的半径值）

- `border-top-left-radius: 55pt 25pt;` 设置如图：

  ![微信截图_20200920110818](https://cdn.jsdelivr.net/gh/ccbeango/blogImages/HTML+CSS/HTML%E5%92%8CCSS%E5%9F%BA%E7%A1%80%E5%AD%A6%E4%B9%A006.png)

`border-radius`是一个缩写属性

- `border-radius: 10px 20px 30px 40px/15px 25px 35px 45px;`
- 斜线`/`前面是水平半径，后面是垂直半径。
- 四个值的顺序是顺时针方向，上左`top-left`、上右`top-right`、下右`bottom-right`、下左`bottom-left`。也还是上右下左。不过很少这么用，一般只用来设置一个值。
  - 如果下左`bottom-left`没设置，就跟随上右`top-right`
  - 如果下右`bottom-right`没设置，就跟随上左`top-left`
  - 如果上右`top-right`没设置，就跟随`top-left`

#### 外轮廓 outline

`outline`表示元素的外轮廓，特点是

- 不占用空间
- 默认显示在`border`的外面

`outline`相关属性有

- `outline-width` 宽度
- `outline-style` 样式，取值跟`border`样式一样，如`solid`、`dotted`等
- `outline-color` 颜色
- `outline` 是上面三个属性的简写。用法和`border`类似

应用实例：

- 去除`a`元素、`input`元素的focus轮廓效果。

  ```css
  a, input {
    outline: none;
  }
  ```

#### 阴影 box-shadow

`<shadow>= inset? && length{2, 4} && color?`

- `inset` 外框阴影变内框阴影
- 第一个`length` 水平方向的偏移，正数往右偏移
- 第二个`length` 垂直方向的偏移，正数往下偏移
- 第三个`length` 模糊半径（blur radius）
- 第四个`length` 阴影向四周的延伸距离
- `<color>` 阴影的颜色，如果没有设置，就跟随color属性的颜色。

注：`&&`就表示顺序是任意的。所以这三个设置的顺序就是任意的。

阴影可以设置一个或多个，多个阴影设置使用逗号`,`隔开。

```css
box-shadow: inset 10px 5px 5px orange, 5px 10px 5px green;
```

例子:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    div {
      margin: 20px auto;
    }
    .box1 {
      width: 100px;
      height: 100px;
      background-color: red;
      box-shadow: 10px 5px 5px 3px orange;
    }

    .box2 {
      width: 100px;
      height: 100px;
      background-color: green;
      box-shadow: inset 10px 5px 5px orange;
    }
  </style>
</head>
<body>
  <div class="box1"></div>
  <div class="box2"></div>
</body>
</html>
```

#### 尺寸 box-sizing

用来设置盒子模型中的宽高的行为。

默认情况下，盒子尺寸是内容盒子，即设置的宽度和高度只是指定内容的高度。

`border-sizing`的属性值

- `content-box` 内容盒子。padding、border都布置在width、height外边
- `border-box` 盒子内减 padding、border都布置在width、height里边

#### 水平居中

在一些需求中，需要元素在父元素中水平居中显示（父元素一般都是块级元素、inline-block）

行内元素、`inline-block`元素水平居中方法是：在父元素中设置`text-align: center;`

块级元素水平居中：在自身上设置`margin: 0 auto;`

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    .box {
      height: 200px;
      background-color: red;
      /* 1.普通文本 */
      /* text-align: center; */
      /* 2.行内元素 */
      /* text-align: center; */
      /* 3.行内替换元素 */
      /* text-align: center; */
      /* 4.行内块级元素 */
      /* text-align: center; */
      /* 5.块级元素 这个设置只能文字居中 */
      /* text-align: center; */
    }

    .ib {
      width: 100px;
      height: 100px;
      background-color: green;
      display: inline-block;
    }

    .block {
      width: 200px;
      height: 100px;
      background-color: yellow;
      margin: 0 auto;
    }
  </style>
</head>

<body>
  <div class="box">
    <!-- 1.普通文本 -->
    <!-- 我是普通文本 -->

    <!-- 2.行内元素 -->
    <!-- <strong>我是行内元素</strong> -->

    <!-- 3.行内替换元素 -->
    <!-- <a href="#">我是a链接</a> -->

    <!-- 4.行内块级元素: inline-block -->
    <!-- <span class="ib">我是行内块级元素</span> -->

    <!-- 5.块级元素 -->
    <div class="block">我是块级元素</div>
  </div>
</body>

</html>
```

#### margin水平居中原理

`maragin: 0 auto;`中设置了`margin-left`和`margin-right`都为`auto`，这两个值如果不设置都有默认值0。如果只设置这两个值其中之一为`auto`，比如设置`margin-left: auto;`，此时`margin-right`是0，浏览器会把当前行剩余的宽度自动分配给`margin-left`。

下面的设置，`div.inner`就会靠右侧显示。

```html
<style>
  .box {
    height: 200px;
    background-color: red;

  }

  .inner {
    width: 200px;
    height: 100px;
    background-color: yellow;
    margin-left: auto;
    margin-right: 0;
  }
</style>

<body>
  <div class="box">
    <div class="inner"></div>
  </div>
</body>
```

那么，如果把`margin-left`和`margin-right`都设置为`auto`，浏览器就会把剩余的空间让两者均分。

垂直方向如果也设置auto，是不会居中的，如果想要垂直方向的居中，意味着父元素垂直高度必须是`auto`。但如果设置父元素高度是`auto`，父元素的高度就必须由其内部的元素撑起，那么它的高度就等于其中子元素的高度，也就不存在垂直居中了。如下：

```html
<style>
  .box {
    height: auto;
    background-color: red;
  }


  .inner {
    width: 200px;
    height: 100px;
    background-color: yellow;
    margin-left: auto;
    margin-right: auto;
  }
</style>

<body>
  <div class="box">
    <div class="inner"></div>
  </div>
</body>
```

### CSS属性-背景

#### 背景 background-image

用于设置元素的背景图片。

- 会**盖在（不是覆盖）**background-color的上面。
- 如果设置了多张图片`background-image: url("bg001.png"), url("bg002.png"), url("bg003.png");`，设置的第一张图片将显示在最上面，其他图片按顺序层叠在下面。
- 如果设置了背景图片后，元素没有具体的宽高，背景图片是不会显示出来的。即背景图不会把盒子撑起来。

例子：

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    .box {
      width: 800px;
      height: 600px;
      background-color: red;
      background-image: url('https://lh3.googleusercontent.com/proxy/JxeDPDa1PJJA55FcVdr3K12W-7gHVoUS3YsSIfg1kl7P_ZNO6cW537L5FYeJoACiIXFMRPHLnPTEuiJ20XHfglwstM80py-NYd4ZELtl67KN_EdHr_rPWO3eX7DZwd1K'), url('https://pic1.zhimg.com/v2-3b4fc7e3a1195a081d0259246c38debc_720w.jpg?source=172ae18b');
      background-repeat: repeat-y;
    }

  </style>
</head>

<body>
  <div class="box">
    <div class="inner"></div>
  </div>
</body>

</html>
```

#### 背景 background-repeat

用于设置背景图片是否需要平铺。

常见设置有:

- `repeat` 平铺，默认值
- `no-repeat` 不平铺
- `repeat-x` 只在水平方向平铺
- `repeat-y` 只在垂直方向平铺

#### 背景 background-size

用于设置背景图片的大小。

- `auto` 以背景图本身大小显示 默认值
- `cover` 缩放背景图，以完全覆盖铺满元素
- `contain` 缩放背景图，宽度或高度铺满元素，但是图片保持宽高比
- `<percentage>` 百分比，相对于背景区（background positioning area）。当只设置一个值时，是设置说水平方向的大小，垂直方向是`auto`，即使用默认值。设置两个值时，是水平、垂直方向。`background-size: auto 180px;`表示宽度保持原来宽高比自动计算，高度`180px`。`background-size: 150px`等价于`background-size: 150px auto`
- `length` 具体的大小，比如100px 可以设置一个或两个值。规则同上。

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    .box {
      width: 1200px;
      height: 500px;
      background-color: red;
      background-image: url('https://pic1.zhimg.com/v2-3b4fc7e3a1195a081d0259246c38debc_720w.jpg?source=172ae18b');
      background-repeat: no-repeat;
      /* 背景图片进行拉伸，让背景图片覆盖整个元素 */
      /* background-size: cover; */
      /* 对背景进行拉伸，拉升到一个方向的宽度（高度），不再进行拉伸，保持图片的宽高比 */
      background-size: contain;

      /* 设置百分比或具体值 */
      /* background-size: 33% 80%; */
      /* background-size: 300px 100px; */
    }

  </style>
</head>

<body>
  <div class="box"></div>
</body>

</html>
```

#### 背景 background-position

`background-position`用于设置背景图片在水平、垂直方向上的具体位置。可以设置一个或两个值

- `<number>` 设置具体值 水平或垂直方向
- `<percentage>` 设置百分比 水平或垂直方向
- 水平方向还可以设置值 `left`、`center`、`bottom`
- 垂直方向还可以设置 `top`、`center`、`bottom`
- 如果只设置了一个方向，另一个方向默认是`center`，如`background-position: 80px;`等价于`background-position: 80px center;`

#### 背景 background-attachment

可以设置以下3个值：

- `scroll` 背景图片跟随元素一起滚动 默认值
- `local` 背景图片跟随元素以及元素内容一起滚动
- `fixed` 背景图片相对于浏览器窗口固定

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    .box {
      width: 200px;
      height: 300px;
      background-image: url('http://res.xyq.netease.com/pc/zt/20151119153357/images/top_aec1ab4.jpg');
      overflow: auto;
      /* 随着box的滚动（浏览器），背景一起滚动 */
      /* background-attachment: scroll; */

      /* local 图片会随着box内容的滚动而滚动 */
      /* background-attachment: local; */

      /* 背景是固定的，不会随着box的滚动而滚动 游戏网站使用较多 */
      background-attachment: fixed;
    }
  </style>
</head>
<body>
  <div class="box">
    MongoDB是一个基于分布式文件存储 [1] 的数据库。由C++语言编写。旨在为WEB应用提供可扩展的高性能数据存储解决方案。
    MongoDB是一个介于关系数据库和非关系数据库之间的产品，是非关系数据库当中功能最丰富，最像关系数据库的。它支持的数据结构非常松散，是类似json的bson格式，因此可以存储比较复杂的数据类型。Mongo最大的特点是它支持的查询语言非常强大，其语法有点类似于面向对象的查询语言，几乎可以实现类似关系数据库单表查询的绝大部分功能，而且还支持对数据建立索引。
  </div>
  <br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>
</body>
</html>
```

#### 背景 background

`background`是一系列背景相关属性的简写属性

- 它是这些属性的缩写：`image position/size repeat attachment color`
- `background-size`可以省略，如果不省略，`/background-size`必须紧跟在`background-position`的后面
- 其他属性也都可以省略，而且顺序任意

```css
background: url("images/beer.png") center center/150px 150px no-repeat #fff;
```

#### 图片缩放 image-rendering

设置图像缩放算法

常用来解决大图缩小时，变模糊的问题

```css
image-rendering: -moz-crisp-edges;
image-rendering: -o-crisp-edges;
image-rendering: -webkit-optimize-contrast;
image-rendering: crisp-edges;
-ms-interpolation-mode: nearest-neighbor;
```

#### background-image和img的选择

|                        | img                | background-image         |
| ---------------------- | ------------------ | ------------------------ |
| 性质                   | HTML元素           | CSS样式                  |
| 图片是否占用空间       | `√`                | `X`                      |
| 浏览器右键直接查看地址 | `√`                | `X`                      |
| 支持CSS Sprite         | `X`                | `√`                      |
| 更有可能被搜索引擎收录 | `√`（结合alt属性） | `X`                      |
| 加载顺序               | 优先加载           | 等加载完HTML元素后再加载 |

总结：

- img，作为网页内容的重要组成部分，比如广告图片、LOGO图片、文章配图、产品图片
- background-image 可有可无。有，能让页面更加美观。无，也不影响用户获取完整的网页内容信息

### 光标 cursor

可视设置鼠标指针在元素上面时的显示样式。

cursor常见的设置:

- `auto` 浏览器根据上下文决定指针的显示样式，比如根据文本和非文本切换指针样式
- `default` 由操作系统决定，一般就是一个小箭头
- `pointer` 一只小手，鼠标指针挪动到链接上面默认就是这个样式
- `text` 一条竖线，鼠标指针挪动到文本输入框上面默认就是这个样式
- `none` 没有任何指针显示在元素上面

### CSS属性-定位

这个[文章](https://www.cnblogs.com/guangzan/p/10290579.html)写的很不错。

利用`position`可以对元素进行定位，常用取值有：

- `static` 静态定位 默认值
- `relative` 相对定位
- `absolute` 绝对定位
- `fixed` 固定定位

|          | 脱离标准流 | 定位元素 | 绝对定位元素 | 定位参照对象                                                      |
| -------- | ---------- | -------- | ------------ | ----------------------------------------------------------------- |
| static   | `X`        | `X`      | `X`          | `X`                                                               |
| relative | `X`        | ==√==    | `X`          | 元素自己原来的位置                                                |
| absolute | ==√==      | ==√==    | ==√==        | 最邻近的定位祖先元素<br/>如果找不到这样的祖先元素，参照对象是视口 |
| fixed    | ==√==      | ==√==    | ==√==        | 视口                                                              |

#### 静态定位 static

默认值 元素按照标准流布局，left、right、top、bottom没有任何作用

#### 相对定位 relative

元素按照标准流布局。

可以通过left、right、top、bottom进行定位。定位参照对象是原来的位置。

应用场景：

- 在不影响其他元素位置的前提下，对当前元素位置进行微调。

  ```html
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
      sub, sup {
        font-size: 14px;
      }

      sub {
        position: relative;
        bottom: 5px;
      }

      sup {
        position: relative;
        top: 2px;
      }
    </style>
  </head>
  <body>
    <h1>请计算n<sub>1</sub>+n<sub>2</sub>+n<sup>2</sup>的值</h1>
  </body>
  </html>
  ```

梦幻西游相对定位练习

背景图根据浏览器窗口大小，决定显示内容大小，图片内容始终居中显示。这种方式比设置`background-image`的方式更好，后者必须有div的固定高度，没有高度的情况下是看不到背景的。使用`img`更合适一点，可以直接撑起高度。

实现思路：图片向左移动的距离= 图片宽度 _0.5 - div_ 0.5。即向左移动的宽度等于图片宽度的一半减去div容器的宽度的一半。

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    body {
      margin: 0;
    }

    .box {
      overflow: hidden;
    }

    .box img {
      /* 1 向左移动img的一半 */
      position: relative;
      /* left: -960px; */
      transform: translate(-50%);
      /* 2 向右移动父元素的一半 */
      margin-left: 50%;
    }
  </style>
</head>
<body>
  <div class="box">
    <img src="http://res.xyq.netease.com/pc/zt/20151119153357/images/top_aec1ab4.jpg" alt="">
  </div>
</body>
</html>
```

#### 固定定位 fixed

元素脱离标准流。

可以通过left、right、top、bottom进行定位。定位参照对象是视口（viewport）。

当画布滚动时，固定不动。

**什么是视口？**

能看到网页的部分区域叫做视口。

**什么是画布？**

能看到网页的部分区域是有限的，但是网页可能会很大，整个网页是画布。

#### 绝对定位 absolute

元素脱离normal flow(标准流)

可以通过`left` `right` `top` `bottom`进行定位

- 定位参照对象时最邻近的定位祖先元素
- 如果找不到这样的祖先元素,参照对象是视口

定位元素指的是

- position值不为`static`的元素
- 也就是position值为`ralative` `absolute` `fixed`的元素

子绝父相

在觉大数情况下，子元素的绝对定位都是相对于父元素进行定位

如果希望子元素相对于父元素进行定位，又不希望父元素脱标,常用解决方案是:

- 父元素设置`position: relative`，让父元素成为定位元素,而且父元素不脱离标准流
- 子元素设置`position: absolute`

简称为子绝父相。

#### 绝对定位技巧

绝对定位元素是`position`值为`absolute`或`fiexed`的元素

对于绝对定位元素来说

- 定位参照对象的宽度 = left + right + margin-left + margin-right + 绝对定位元素的实际占用宽度
  - 当left、right、margin都为0时，定位参照对象的宽度就等于绝对定位元素的实际占用宽度。所以经常使用设置为0的方法来撑起绝对定位元素的宽度。
- 定位参照对象的高度 = top + bottom + margin-top + margin-bottom + 绝对定位元素的实际占用高度

如果希望绝对定位元素的宽度和定位参照对象一样，可以给绝对定位元素设置以下属性：`left: 0; right: 0; bottom: 0; margin: 0`。

如果希望绝对定位元素在定位参照对象中居中显示，可以给绝对定位元素设置以下属性：`left: 0; right: 0; bottom: 0; margin: auto`。

下面是具体实现的例子：

让子元素占据父元素，下面的`div.inner`没有设置宽度，当利用上面的宽度公式时，它的宽度就是`div.box`的宽度。高度也可以用此种方法实现

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    .box {
      position: relative;
      width: 600px;
      height: 600px;
      background-color: red;
    }

    .inner {
      position: absolute;
      left: 0;
      right: 0;
      height: 100px;
      background: blue;
    }
  </style>
</head>
<body>
  <div class="box">
    <div class="inner"></div>
  </div>
</body>
</html>
```

让内容居中，根据上面的公式，首先设置`left`、`right`相等，一般设置为`0`，然后设置`margin: 0 auto`，此时`div.inner`就会水平居中。同理，垂直方向上也可以这么设置。

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    .box {
      position: relative;
      width: 600px;
      height: 600px;
      background-color: red;
    }

    .inner {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      margin: auto auto;
      width: 200px;
      height: 200px;
      background: blue;
    }
  </style>
</head>
<body>
  <div class="box">
    <div class="inner"></div>
  </div>
</body>
</html>
```

#### 定位元素的层叠关系

定位元素的层叠关系：

- 父子关系：子元素会层叠在父元素上
- 非父子关系：
  - 都是非定位元素：在标准流中一般存在的层叠想想
  - 一个是定位、一个是非定位元素：定位元素会层叠在非定位元素上面
  - 都是定位元素：默认后面出现的会盖住前面的。可以使用CSS属性`z-index`来控制层叠顺序。

### CSS属性-z-index

z-index属性用来设置**定位元素**的层叠关系，仅对定位元素有效。

取值可以是正整数、负整数、0、auto（默认）

比较原则：

- 如果是兄弟关系：
  - `z-index`越大，层叠在越上面
  - `z-index`相等，写在后面的那个元素层叠在上面
- 如果不是兄弟关系
  - 各自从元素自己以及祖先元素中，找出最相邻的2个定位元素进行比较。

#### 脱标元素的特点

脱离标准流元素：相对定位、绝对定位、固定定位、浮动。

脱离标准流元素的特点：

- 没有设置宽高情况下，宽高默认由内容决定

- 可以随意设置宽高，即使是行内元素
- 不再受标准流约束
- 不再给父元素汇报高度。意思是脱离了文档流，父元素不知道这个元素的存在了。

脱标元素和display的关系：

脱标元素都会变成块级元素，块级元素会占据父级元素一整行，但是脱标后已经没有父元素了，这时宽高都会变为`auto`，即包裹内容，内容宽高是多少，元素的宽高就是多少。

### CSS Sprite

CSS Sprite是一种CSS图像合成技术，将各种小图片合并到一张图片上，然后利用CSS的背景定位来显示对应的图片部分。

有人翻译为CSS雪碧图、CSS精灵图。

使用CSS Sprite的好处：

- 减少网页的http请求数量，加快网页的响应速度，减轻服务器压力
- 减小图片总大小
- 解决了图片命名困扰，只需要针对一张集合的图片命名

Sprite图片制作（雪碧图、精灵图）：

- Photoshop
- 网页生成 https://www.toptal.com/developers/css/sprite-generator

前端一些框架 mpvue(vue) uniapp(vue) taro(react)

下面的例子，网页布局中一些居中显示，谁需要居中，class中就加上wrap

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    .wrap {
      width: 1000px;
      margin: 0 auto;
    }

    .nav {
      margin-top: 20px;
      background-color: red;
      height: 50px;
    }

    .header {
      margin-top: 20px;
      background-color: green;
      height: 50px;
    }

    .content {
      margin-top: 20px;
      background-color: blue;
      height: 50px;
    }
  </style>
</head>
<body>
  <!-- 居中显示，谁需要居中，就加上wrap -->
  <div class="nav wrap"></div>
  <div class="header wrap"></div>
  <div class="content"></div>
</body>
</html>
```

CSS Sprite简单练习

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    .wrap {
      width: 1100px;
      margin: 0 auto;
    }

    ul {
      list-style: none;
    }

    p, ul, li, h5 {
      margin: 0;
      padding: 0;
      float: left;
    }

    .service ul li {
      margin-left: 12px;
      margin-right: 20px;
    }

    .service ul li p {
      height: 42px;
      line-height: 42px;
      font-size: 18px;
      width: 180px;
      font-weight: 700;
      margin-left: 10px;
    }

    .service ul li h5 {
      text-indent: -9990px;
      width: 36px;
      height: 42px;
      background-image: url(http://misc.360buyimg.com/mtd/pc/index_2019/1.0.0/assets/img/23f3ddf914b1b527d0429a3d713cfe3a.png);

    }

    .service ul li .duo {
      background-position: 0 -192px;
    }

    .service ul li .kuai {
      background-position: -41px -192px;
    }

    .service ul li .hao {
      background-position: -82px -192px;
    }

    .service ul li .sheng {
      background-position: -123px -192px;
    }
  </style>
</head>
<body>
  <div class="service wrap">
    <ul>
      <li>
        <h5 class="duo">多</h5>
        <p>品类齐全，轻松购物</p>
      </li>
      <li>
        <h5 class="kuai">快</h5>
        <p>多仓直发，急速配送</p>
      </li>
      <li>
        <h5 class="hao">好</h5>
        <p>正品行货，精致服务</p>
      </li>
      <li>
        <h5 class="sheng">省</h5>
        <p>天天低价，畅选无忧</p>
      </li>
    </ul>
  </div>
</body>
</html>
```

背景居中，梦幻西游适配练习：

能让产品适应各种运行环境，尽量保持一致的用户体验在前端开发中，一般都是要做浏览器适配、屏幕适配。

背景图根据浏览器窗口大小，决定显示内容大小，图片内容始终居中显示。

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    body {
      margin: 0;
      padding: 0;
    }

    .box {
      height: 400px;
      background-image: url('http://res.xyq.netease.com/pc/zt/20151119153357/images/top_aec1ab4.jpg');
      background-position: center -81px;
    }
  </style>
</head>
<body>
  <div class="box"></div>
</body>
</html>
```

### CSS属性-浮动

绝对定位、浮动都会让元素脱离标准流，以达到灵活布局的效果。

可以通过`float`属性让元素产生浮动效果，float的常用取值：

- `none` 不浮动，默认值
- `left` 向左浮动
- `right` 向右浮动

元素的层叠关系：

- 标准元素：标准流中的元素不存在层叠
- 定位元素：定位元素层叠到标准流元素上面
  - 定位元素之间可以使用z-index改变层叠关系
- 浮动元素：定位元素会层叠在浮动元素上面。
- 层叠最终关系：定位元素 > 浮动元素 > 标准元素。

#### 浮动的规则

- 规则一：元素一旦浮动后，会脱离标准流，朝着向左或向右方向移动，直到自己的边接紧贴着包含块（一般是父元素）或者其他浮动元素的边界为止

- 规则二：浮动元素不能与行内级元素层叠，行内级内容将会被浮动元素推出。也就是都会被挤出去。

  - 比如行内级元素、inline-block元素、块级元素的文字内容。可以看到下面的其他内容都会被`strong`元素推出去，但并意味着strong没有脱离标准流。只是规则使得它不能与这些元素层叠。因为最开始出现浮动就是为了做图文环绕的。

    ```html
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
      <style>
        strong {
          float: left;
        }

        .inner {
          display: inline-block;
          width: 50px;
          height: 50px;
          background: blue;
        }

        a {
          background-color: #00f;
          color: #fff;
        }
      </style>
    </head>
    <body>
     <div class="box">
       div元素的文字
      <div class="inner"></div>
      <span>span元素</span>
      <strong>strong元素</strong>
      <a href="#">a元素</a>
     </div>
    </body>
    </html>
    ```

  - 利用此特性可以轻松实现图文环绕。

    ```html
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
      <style>
        .box {
          background-color: red;
          width: 500px;
        }

        img {
          float: left;
        }
      </style>
    </head>
    <body>
      <div class="box">
        据俄罗斯防疫指挥部4日消息
        <img
      src="https://ss0.bdstatic.com/94oJfD_bAAcT8t7mm9GUKT-xh_/timg?image&quality=100&size=b4000_4000&sec=1607166166&di=6f23129fe4375e54a9d8146e148b55cb&src=http://a0.att.hudong.com/30/29/01300000201438121627296084016.jpg"
          alt="">
       过去24小时俄新增新冠肺炎确诊病例27403例，累计确诊达2402949例，累计死亡42176例。莫斯科市5日开始大规模新冠疫苗接种。随着新冠疫情在俄罗斯不断蔓延，俄罗斯首都莫斯科市5日开始大规模疫苗接种。莫斯科市政府市民疫苗接种电子申请系统4日正式启动，接种站5日投入运营。
      </div>
    </body>
    </html>
    ```

- 规则三：行内级元素、inline-block元素浮动后，其顶部将与所在行的顶部对齐。只会在当前行左右浮动，并不会向上浮动。

  ```html
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
      .box {
        background-color: red;
        width: 300px;
      }

      .inner {
        float: left; /* 这里会报错 */
        display: inline-block;
        width: 30px;
        height: 30px;
        background: blue;
      }
    </style>
  </head>
  <body>
    <div class="box">
      据俄罗斯防疫指挥部4日消息
      <div class="inner" ></div>
      过去24小时俄新增新冠肺炎确诊病例27403例，累计确诊达2402949例，累计死亡42176例。莫斯科市5日开始大规模新冠疫苗接种。
      <div class="inner"></div>
      随着新冠疫情在俄罗斯不断蔓延，俄罗斯首都莫斯科市5日开始大规模疫苗接种。莫斯科市 <div class="inner"></div>政府市民疫苗接种电子申请系统4日正式启动，接种站5日投入运营。
    </div>
  </body>
  </html>
  ```

- 规则四：如果元素是向左（右）浮动，浮动元素的左（右）边接不能超出包含块的左（右）边界。

- 规则五：浮动元素之间不能层叠。

  - 左浮找左浮，右浮找右浮。
  - 如果水平方向剩余的空间不够显示浮动元素，浮动元素将线下移动，直到找到充足的空间为止；

- 规则六：浮动元素的顶端不能超过包含块的顶端，也不能超过之前所有浮动元素的顶端。

  下面的`div.inner3`左边会挨着`div.inner2`，并不会挨着`div.inner1`。如果`div.inner2`的浮动改成`float: right;`也不会到最顶部。

  ```html
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
      .box {
        background-color: red;
        width: 300px;
        height: 320px;
      }

      .inner1 {
        float: left;
        width: 200px;
        height: 100px;
        background: green;
      }

      .inner2 {
        float: left;
        width: 150px;
        height: 150px;
        background: yellow;
      }

      .inner3 {
        float: left;
        width: 30px;
        height: 150px;
        background: purple;
      }
    </style>
  </head>
  <body>
    <div class="box">
      <div class="inner1"></div>
      <div class="inner2"></div>
      <div class="inner3"></div>
    </div>
  </body>

  </html>
  ```

#### 理解浮动规则

- `div.inner2`左浮动，只会在它自己的行内浮动；
- `div.inner1`左浮动，`div.inner2`会跑到最上面，因为`div.inner1`脱离了文档流，此时会出现`inner1`和`inner2`层叠；此时inner2中的文本，会环绕`inner1`显示。
- `div.inner1`左浮动，设置`div.inner2`的`display: inline-block;`，`div.inner2`会跑到最上面且会被挤在右侧，并不会层叠。
- `div.inner1`和`div.inner2`都左浮动，会挨着第一行显示，不会层叠；
- 如果此时去掉`div.box`中的高度，此时，就没有了红色。脱离文档流的元素不会向父元素报告高度，父元素没有了高度，即高度坍塌。可以清除浮动来解决。

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    .box {
      background-color: red;
      height: 200px;
    }

    .inner1 {
      /* float: left; */
      width: 50px;
      height: 50px;
      background: green;
    }

    .inner2 {
      /* float: left; */
      /* display: inline-block; */
      width: 80px;
      height: 80px;
      background: yellow;
    }
  </style>
</head>
<body>
  <div class="box">
    <div class="inner1"></div>
    <div class="inner2">我是内容啊</div>
  </div>
</body>
</html>
```

#### 多出margin的处理方式

在进行布局时，同一行多个元素摆放后，设置`margin-right`让他们之间产生间距，那么最后一个元素设置的`margin-right`总是多余的。

解决方法：

1. 每一行最后一个元素，总添加一个class，通过类选择器去除这个`margin-right`。

2. 使用伪类选择器。但是使用伪类不好的有点是，如果布局改变，可能就要改变`nth-child`。最大的问题是兼容性问题。

   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>Document</title>
     <style>
       .box {
         background-color: red;
         width: 430px;
         height: 320px;
       }

       .inner {
         float: left;
         width: 100px;
         height: 100px;
         background: green;
         margin-right: 10px;
         margin-bottom: 10px;
       }

       .inner:nth-child(4n) {
         margin-right: 0;
       }
     </style>
   </head>
   <body>
     <div class="box">
       <div class="inner"></div>
       <div class="inner"></div>
       <div class="inner"></div>
       <div class="inner"></div>
       <div class="inner"></div>
       <div class="inner"></div>
       <div class="inner"></div>
       <div class="inner"></div>
       <div class="inner"></div>
       <div class="inner"></div>
       <div class="inner"></div>
       <div class="inner"></div>
     </div>
   </body>
   </html>
   ```

3. 块级元素宽度计算。使用margin负值。

   wrap的总宽度为

   ```text
   width of block = content-width + marfin-left + margin-right + padding-left + padding+right + border-left + border-right
   ```

   因为wrap未设置宽度，所以宽度为`auto`，将设置值带入公式可得：

   `430 = content-width(auto) + 0 + -10 + 0 + 0 + 0 + 0`即 `content-width=440`。

   此时，正好可以放下`div.inner`，而多出来的margin就被隐藏起来了。

   ```html
   <!DOCTYPE html>
   <html lang="en">

   <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>Document</title>
     <style>
       /* width of block = content-width + marfin-left + margin-right + padding-left + padding+right + border-left + border-right */

       .box {
         background-color: red;
         width: 430px;
         height: 320px;
       }

       .wrap {
         margin-right: -10px;
       }

       .inner {
         float: left;
         width: 100px;
         height: 100px;
         background: green;
         margin-right: 10px;
         margin-bottom: 10px;
       }

     </style>
   </head>

   <body>
     <div class="box">
       <div class="wrap">
         <div class="inner"></div>
         <div class="inner"></div>
         <div class="inner"></div>
         <div class="inner"></div>
         <div class="inner"></div>
         <div class="inner"></div>
         <div class="inner"></div>
         <div class="inner"></div>
         <div class="inner"></div>
         <div class="inner"></div>
         <div class="inner"></div>
         <div class="inner"></div>
       </div>
     </div>
   </body>

   </html>
   ```

例子2：

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    .container {
      width: 990px;
      height: 500px;
      background-color: red;
      margin: 0 auto;
    }

    .wrap {
      margin-right: -10px;
    }

    .item {
      float: left;
      margin-right: 10px;
      width: 240px;
      background-color: green;
    }

    .itema {
      height: 306px
    }

    .itemb {
      height: 148px;
    }

    .item-last {
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="wrap">
      <div class="item itema"></div>
      <div class="item itema"></div>
      <div class="item itemb"></div>
      <div class="item itemb"></div>
      <div class="item itemb item-last"></div>
      <div class="item itemb item-last"></div>
    </div>
  </div>
</body>
</html>
```

例子3：

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .brand {
      width: 1100px;
      height: 180px;
      background: red;
    }

    .brand ul {
      margin-right: -10px;
    }

    .brand ul li {
      float: left;
      width: 219px;
      height: 167px;
      background: green;
      margin-right: -1px;
      border: 1px solid #333;
    }
  </style>
</head>

<body>
  <div class="brand">
    <ul>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
    </ul>
  </div>
</body>

</html>
```

#### 清除浮动

由于浮动元素脱离了标准流，变成了脱标元素，所以不再向父元素汇报高度。父元素计算总高度时，就不会计算浮动子元素的高度，导致高度坍塌的问题。

解决父元素高度坍塌问题的过程，一般叫做清浮动（清理浮动、清除浮动）

清浮动的目的是让父元素计算总高度的时候，把浮动子元素的高度计算进去。

清除浮动方法：

- 给父元素设置固定高度
  - 不推荐，因为扩展性不好
- 在父元素最后增加一个空的块级元素，并且让它设置`clear:both`
  - 会增加很多无意义的空标签，维护麻烦
  - 违反了结构与样式分离的原则（不推荐）
- 在父元素最后增加一个br标签`<br clear="all">`
  - 会增加很多无意义的空标签，维护麻烦
  - 违反了结构与样式分离的原则（不推荐）
- 给父元素增加`::after`伪元素：
  - 纯CSS样式解决，结构与样式分离（推荐）

#### clear属性

- left：要求元素顶部低于之前生成的所有左浮动元素的底部
- right：要求元素顶部低于之前生成的所有右浮动元素的底部

- both：要求元素顶部低于之前生成的所有浮动元素的底部

就是clear元素左右单边或两边都不能有浮动元素。

**任何元素一旦使用伪元素都需要重新设置display，使用伪元素默认变成行内级元素**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
      .container {
        width: 990px;
        background: red;
        margin: 0 auto;
      }

      .wrap {
        margin-right: -10px;
      }


      .item {
        float: left;
        width: 240px;
        background: green;
        margin-right: 10px;
        margin-bottom: 10px;
      }

      .itema {
        height: 306px;
      }

      .itemb {
        height: 148px;
      }

      .clear {
        clear: both;
      }

      /* 使用伪类方法 */
      .clear-fix::after {
        content: "";
        display: block;
        clear: both;

        /* 兼容浏览器 */
        height: 0;
        visibility: 0;
      }
      /* 兼容浏览器 IE6 7*/
      .clear-fix {
        *zoom: 1;
      }
    </style>
  </head>

  <body>
    <div class="container">
      <div class="wrap clear-fix">
        <div class="item itema"></div>
        <div class="item itema"></div>
        <div class="item itemb"></div>
        <div class="item itemb"></div>
        <div class="item itemb item-last"></div>
        <div class="item itemb item-last"></div>
      </div>
      <!-- <div class="clear"></div> -->
      <!-- <br clear="all" /> -->
    </div>
    <div>我是其它内容</div>
  </body>
</html>
```

### CSS属性-变形

#### transform

transform属性允许你平移、旋转、缩放、倾斜给定元素。

**transform属性对行内元素没有效果。**

不会影响其它元素位置

属性值可以为一个或多个` transform: scale(2) skew(45deg) rotate(45deg);`

以下是相关属性值：

##### 2D转换 - translate

- 平移`translate（x，y）` `translateX(n)`、`translateY(n)`

  - 一个值，设置x轴上的位移
  - 两个值，设置x轴和y轴上的位移

  - 值类型：
    - 数字：100px
    - 百分比：参照元素本身。如元素本身宽度100px，那么50%就表示50px
  - 不会影响其它元素位置

  ```html
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
      .box1 {
        margin: 100px auto;
        width: 100px;
        height: 100px;
        background: red;
      }

      .box1:hover {
        transform: translate(20px);
      }

      span {
        background: green;
      }

      span:hover {
        transform: translate(20px);
      }
    </style>
  </head>
  <body>
    <div class="box1"></div>
    <!-- 无效果 -->
    <span>行内</span>
  </body>
  </html>
  ```

##### 2D转换 - scale

- `scale(x,y)` 缩放

  - 一个值，设置x轴和y轴相同的缩放
  - 两个值，分别设置x轴和y轴上的缩放
  - 值类型
    - 数值：`参照元素本身*数值` 如：1 保持不变 2 方大一倍 0.5 缩小一半
    - 百分比：同上相乘

  ```html
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
      .box1 {
        margin: 100px auto;
        width: 100px;
        height: 100px;
        background: red;
      }

      .box1:hover {
        /* transform: scale(0.5); */
        /* transform: scale(1); */
        /* transform: scale(2); */
        transform: scale(150%);
      }

    </style>
  </head>
  <body>
    <div class="box1"></div>
  </body>
  </html>
  ```

##### 2D转换 - rotate

- `rotate(deg)` 旋转

  - 一个值，表示旋转的角度
  - 值类型：deg表示旋转的角度。正数为顺时针，负数为逆时针
  - 旋转的原点受`transform-origin`的影响

  ```html
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
      .box1 {
        margin: 100px auto;
        width: 100px;
        height: 100px;
        background: red;
      }

      .box1:hover {
        transform: rotate(45deg);
        /* transform-origin: 10px top; */
        transform-origin: left top;
      }

    </style>
  </head>
  <body>
    <div class="box1"></div>
  </body>
  </html>
  ```

##### 2D转换 - skew

- `skew(deg,deg)` 倾斜

  - 一个值，设置x轴上的倾斜
  - 两个值，设置x轴和y轴上的倾斜

  - 值类型：deg表示旋转的角度。正数为顺时针，负数为逆时针
  - 旋转的原点受`transform-origin`的影响

  ```html
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
      .box1 {
        margin: 100px auto;
        width: 100px;
        height: 100px;
        background: red;
      }

      .box1:hover {
        transform: scale(2) skew(45deg) rotate(45deg);
        /* transform: skew(20deg, 30deg); */
        /* transform-origin: 10px top; */
        /* transform-origin: left top; */
      }

    </style>
  </head>
  <body>
    <div class="box1"></div>
  </body>
  </html>
  ```

##### 2D转换-综合写法

同时使用多个转换，其格式为：

```text
transform: translate() rotate() scale() ...
```

其顺序会影响转换效果。如先旋转会改变坐标轴方向。

当我们同时有位移和其他属性的时候，记得要将位移放到最前。

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    div {
      background: chartreuse;
      width: 200px;
      height: 200px;
      transition: all .5s;
    }

    div:hover {
      transform: translate(150px, 50px) rotate(180deg);
    }

  </style>
</head>
<body>
  <div></div>
</body>
</html>
```

##### 3D转换

三位坐标系其实就是指立体空间，立体空间是由3个轴共同组成。

- x轴 水平向右
- y轴 垂直向下
- z轴 垂直屏幕 往外是正值

##### 3D转换-translate3d

- `translateX()` 仅在X轴上移动
- `translateY()`仅在Y轴上移动
- `translateZ()` 仅在Z轴上移动 （一般用px做单位）
- `translate3d(x, y, z)` 分别在三个轴的方向上要移动的距离 xyz不可省略，如果没有就写0

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    body {
      perspective: 300px;
    }
    div {
      margin: 200px auto;
      width: 200px;
      height: 200px;
      background: red;
      /* 全写 */
      /* transform: translateX(100px) translateY(100px) translateZ(100px); */
      /* 简写 */
      /* transform: translate3d(100px, 100px, 100px); */
      /* x y z 不能省略 没有就写0 */
      transform: translate3d(0, 0, 100px);
    }

  </style>
</head>
<body>
  <div></div>
</body>
</html>
```

##### 3D转换-rotate3d

3D旋转可以让元素在三维平面沿着x轴、y轴、z轴或者自定义轴进行旋转。

单位`deg`，正值表示正向旋转，负值表示负向旋转。

左手准则：左手握拳，大拇指指向轴的正方向，四指弯曲方向即为正向。

- `rotateX(deg)` 沿着x轴旋转
- `rotateY(deg)`沿着y轴旋转
- `rotateZ(deg)` 沿着z轴旋转
- `rotate3d(x, y, z, deg)` 沿着自定义轴旋转 x y z 取值 0 或 1，矢量设置旋转轴

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    /* 当透视距离越小，代表距离眼睛越近，看起来就会离我们越近 */
    body {
      perspective: 300px;
      /* perspective: 100px; */
    }
    div {
      margin: 200px auto;
      width: 200px;
      height: 200px;
      background: red;
      transition: all .5s;
    }

    div:hover {
      /* transform: rotateX(180deg); */
      /* transform: rotateY(180deg); */
      transform: rotateZ(180deg);
      /* transform: rotate3d(1, 1, 1, 180deg); */
    }

  </style>
</head>
<body>
  <div></div>
</body>
</html>
```

##### JS实现3D库

three.js

#### 原点 transfrom-origin

**`transform-origin`** CSS属性让你更改一个元素变形的原点。

```text
transform-origin: x y z;
```

默认旋转式中心点`50% 50%`

属性值：

- 一个值

  - 设置x轴的原点

- 两个值

  - 设置x轴和y轴的原点

- 三个值

  - 前两个值和只有两个值时相同。第三个值必须是`<length>`，它始终代表Z轴偏移量

- 值说明：

  前两个值必须是`<length>`、`<percentage>`或`left`、`center`、`right`、`top`、`bottom`

  - `left`、`center`、`right`、`top`、`bottom`是关键字（一般使用这个）
  - length：从左上角开始计算
  - 百分比：参考元素本身大小

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    .box1 {
      margin: 100px auto;
      width: 100px;
      height: 100px;
      background: red;
    }

    .box1:hover {
      transform: scale(2);
      transform-origin: 10px top;
    }

  </style>
</head>
<body>
  <div class="box1"></div>
</body>
</html>
```

#### 透视 perspective

在2D平面产生近大远小视觉立体，但是效果只是二维的。如果想要在网页中产生3D效果，就需要透视。

透视也称为视距，就是人的眼睛到屏幕的距离。距离视觉点越近的，在电脑平面成像越大，越远成像越小。

透视的单位是像素。

透视要写在被观察元素的父盒子或更父级盒子上面，值越大，就表示Z轴距离人的眼睛越远。

在子元素中我们设置的Z轴越大，就表示我们看到的物体越大。

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    body {
      /* body是父元素 */
      perspective: 300px;
      perspective: 150px;
    }
    div {
      margin: 200px auto;
      width: 200px;
      height: 200px;
      background: red;
      transform: translate3d(0, 0, 100px);
    }
  </style>
</head>
<body>
  <div></div>
</body>
</html>
```

#### 呈现 transform-style

控制子元素是否开启三维立体环境。

写在要开启3D元素的父级元素上（必须是父级，更父级会无效），但是影响的是子盒子。

属性值：

- `flat` 默认 不开启3D立体空间
- ` preserve-3d` 开启3D立体空间

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    body {
      perspective: 300px;
    }
    .box {
      position: relative;
      margin: 200px auto;
      width: 200px;
      height: 200px;
      background: red;
      transition: all 2s;
      transform: rotateY(-60deg);
      /* 让子元素保持3d立体空间环境 */
      transform-style: preserve-3d;
    }

    .box div {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: red;
    }

    .box div:last-child {
      background-color: green;
      transform: rotateX(60deg);
    }

  </style>
</head>
<body>
  <div class="box">
    <div></div>
    <div></div>
  </div>
</body>
</html>
```

两面翻转的盒子

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    body {
      perspective: 300px;
    }
    .box {
      position: relative;
      margin: 200px auto;
      width: 200px;
      height: 200px;
      /* transition: transform 0.5s; */
      animation: rotate 2s ease infinite;
      /* 让子元素保持3d立体空间环境 */
      transform-style: preserve-3d;
    }


    .box:hover {
      transform: rotateY(180deg);
    }

    @keyframes rotate {
      from {}
      50% {
        transform: rotateY(180deg);
      }
      to {
        transform: rotateY(360deg);
      }
    }


    .front, .back {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      color: #fff;
      font-size: 30px;
      text-align: center;
      line-height: 200px;
    }

    .front {
      background-color: red;
      z-index: 1;
    }

    .back {
      background-color: green;
      /* 让两个盒子背靠背 */
      transform: rotateY(180deg);
    }

  </style>
</head>
<body>
  <div class="box">
    <div class=front>你好</div>
    <div class="back">Hello</div>
  </div>
</body>
</html>
```

3D导航栏效果

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    ul li {
      float: left;
      margin: 0 10px;
      width: 200px;
      height: 40px;
      list-style: none;
      perspective: 300px;
    }

    .box {
      position: relative;
      width: 100%;
      height: 100%;
      transition: transform 0.5s;
      transform-style: preserve-3d;
    }

    .box:hover {
      transform: rotateX(90deg);
    }

    .front, .bottom {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      color: #fff;
      font-size: 30px;
      text-align: center;
      line-height: 40px;
    }

    .front {
      background-color: red;
      z-index: 1;
      transform: translateZ(20px);
    }

    .bottom {
      background-color: green;
      /* 先移动，再旋转 */
      transform: translateY(50%) rotateX(-90deg) ;
    }
  </style>
</head>
<body>
  <ul>
    <li>
      <div class="box">
        <div class=front>首页</div>
        <div class="bottom">Home</div>
      </div>
    </li>
    <li>
      <div class="box">
        <div class=front>关于</div>
        <div class="bottom">About</div>
      </div>
    </li>
  </ul>
</body>
</html>
```

旋转木马效果

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    body {
      perspective: 1000px;
    }
    .box {
      position: relative;
      margin: 200px auto;
      width: 300px;
      height: 300px;
      background-color: red;
      animation: rotate 3s linear infinite;
      transform-style: preserve-3d;
    }

    .box:hover {
      animation-play-state: paused;
    }

    @keyframes rotate {
      from {
        transform: rotateY(0deg);
      }
      from {
        transform: rotateY(360deg);
      }
    }

    div[class^="item"] {
      position: absolute;
      width: 100%;
      height: 100%;
      background: url('http://taosha01-1253585015.cos.ap-shanghai.myqcloud.com/taosha/d620bec0-d61c-11ea-9c32-1172a154412d.png?imageMogr2/crop/100x100/center') center/100% no-repeat;
    }

    .item1 {
      background-color: red;
      transform: translateZ(300px);
    }

    .item2 {
      background-color: red;
      transform: rotateY(60deg) translateZ(300px);
    }

    .item3 {
      background-color: red;
      transform: rotateY(120deg) translateZ(300px);
    }

    .item4 {
      transform: rotateY(180deg) translateZ(300px);
      background-color: red;
    }

    .item5 {
      transform: rotateY(240deg) translateZ(300px);
      background-color: red;
    }

    .item6 {
      transform: rotateY(300deg) translateZ(300px);
      background-color: red;
    }
  </style>
</head>
<body>
  <div class="box">
    <div class="item1"></div>
    <div class="item2"></div>
    <div class="item3"></div>
    <div class="item4"></div>
    <div class="item5"></div>
    <div class="item6"></div>
  </div>
</body>
</html>
```

### CSS属性-过渡

**谁做过渡给谁加transition**

#### transition-property

[`transition-property`](https://developer.mozilla.org/zh-CN/docs/Web/CSS/transition-property)指定应用过渡属性的名称。

相关属性值：

- `none`
- `all`
- `属性名称` css属性名称

#### transition-duration

[`transition-duration`](https://developer.mozilla.org/zh-CN/docs/Web/CSS/transition-duration)属性以秒或毫秒为单位指定过渡动画所需的时间。默认值为 `0s ，表示不出现过渡动画`。

可以指定多个时长，每个时长会被应用到由 `transition-property` 指定的对应属性上。如果指定的时长个数小于属性个数，那么时长列表会重复。如果时长列表更长，那么该列表会被裁减。两种情况下，属性列表都保持不变。

属性值：

- `<time>`类型：表示过渡属性从旧的值转变到新的值所需要的时间。

#### transition-timing-function

[`transition-timing-function`](https://developer.mozilla.org/zh-CN/docs/Web/CSS/transition-timing-function) CSS属性受到 [transition effect](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Transitions/Using_CSS_transitions)的影响，会产生不断变化的中间值，而 `transition-timing-function` 属性用来描述这个中间值是怎样计算的。实质上，通过这个函数会建立一条加速度曲线，因此在整个transition变化过程中，变化速度可以不断改变。

你可以规定多个timing function，通过使用`transition-property`属性，可以根据主列表(transition property的列表)给每个CSS属性应用相应的timing function。如果timing function的个数比主列表中数量少，缺少的值被设置为初始值`ease` 。如果timing function比主列表要多，timing function函数列表会被截断至合适的大小。这两种情况下声明的CSS属性都是有效的。

属性值：

- `<timing-function>`

  通过`transition-property`中定义被过渡属性，每个`<timing-function>`的值代表与这个属性相对应的timing function。

#### transition-delay

[`transition-delay`](https://developer.mozilla.org/zh-CN/docs/Web/CSS/transition-delay) 属性规定了在过渡效果开始作用之前需要等待的时间。

值以秒（s）或毫秒（ms）为单位，表明动画过渡效果将在何时开始。取值为正时会延迟一段时间来响应过渡效果；取值为负时会导致过渡立即开始。

你可以指定多个延迟时间，每个延迟将会分别作用于你所指定的相符合的css属性`transition-property`

属性值：

- `<time>`表明动画效果属性生效之前需要等待的时间。

#### transition

**`transition`** 属性是 `transition-property`、`transition-duration`、`transition-timing-function` 和 `transition-delay` 的一个简写属性。

`transition`属性可以被指定为一个或多个 CSS 属性的过渡效果，多个属性之间用逗号进行分隔。

属性值：

- 值1`transition-property` transfrom、width、height、all等
- 值2`transition-duration` 100ms 1s
- 值3`transition-timing-function` 动画的变化速度 ease/ease-in
- 值4`transition-delay` 延迟/等待多久再执行这个动画

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    .box1 {
      margin: 100px auto;
      width: 100px;
      height: 100px;
      background: red;
      /* transition: width 1.5s linear; */
      /* transition: width 1.5s linear, height 1s ease-in; */
      transition: all 1.5s linear;
    }

    .box1:hover {
      width: 200px;
      height: 200px;
      transform: rotate(45deg);
    }

  </style>
</head>
<body>
  <div class="box1"></div>
</body>
</html>
```

类似下拉框旋转的三角形

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    .box1 {
      position: relative;
      margin: 100px auto;
      width: 200px;
      height: 30px;
      border: 1px solid black;
    }

    .box1::after {
      content: "";
      position: absolute;
      top: 5px;
      right: 8px;
      width: 10px;
      height: 10px;
      border-right: 1px solid black;
      border-bottom: 1px solid black;
      transform: rotate(45deg);
      transition: transform 0.3s ease;
    }


    .box1:hover::after {
      transform: rotate(225deg);
    }

  </style>
</head>
<body>
  <div class="box1"></div>
</body>
</html>
```

旋转盒子

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    .box1 {
      margin: 100px auto;
      width: 200px;
      height: 200px;
      border: 1px solid black;
      overflow: hidden;
    }

    .box1::after {
      content: "嗨";
      display: block;
      width: 200px;
      height: 200px;
      background: cadetblue;
      transform: rotate(90deg);
      transform-origin: left bottom;
      transition: transform 0.5s ease;
    }

    .box1:hover::after {
      transform: rotate(0deg);
    }

  </style>
</head>
<body>
  <div class="box1"></div>
</body>
</html>
```

分页按钮效果

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    li {
      list-style: none;
      display: inline-block;
      margin: 5px;
      cursor: pointer;
      width: 20px;
      height: 20px;
      text-align: center;
      line-height: 20px;
      border: 1px solid #000;
      border-radius: 50%;
      transition: all 0.4s;
    }

    li:hover {
      transform: scale(1.2);
    }

  </style>
</head>
<body>
  <ul>
    <li>1</li>
    <li>2</li>
    <li>3</li>
    <li>4</li>
    <li>5</li>
    <li>6</li>
  </ul>
</body>
</html>
```

### CSS属性-动画

可通过设置多个节点来精确控制一个或一组动画，常用来实现复杂的动画效果。

制作动画分两步：先定义动画、再调用动画

#### animation-name

[`animation-name`](https://developer.mozilla.org/zh-CN/docs/Web/CSS/animation-name)

#### animation-duration

[`animation-duration`](https://developer.mozilla.org/zh-CN/docs/Web/CSS/animation-duration)

#### animation-timing-function

[`animation-timing-function`](https://developer.mozilla.org/zh-CN/docs/Web/CSS/animation-timing-function)

#### animation-delay

[`animation-delay`](https://developer.mozilla.org/zh-CN/docs/Web/CSS/animation-delay)

#### animation-iteration-count

[`animation-iteration-count`](https://developer.mozilla.org/zh-CN/docs/Web/CSS/animation-iteration-count)

#### animation-direction

[`animation-direction`](https://developer.mozilla.org/zh-CN/docs/Web/CSS/animation-direction)

#### animation-fill-mode

[`animation-fill-mode`](https://developer.mozilla.org/zh-CN/docs/Web/CSS/animation-fill-mode)

#### animation-play-state

[`animation-play-state`](https://developer.mozilla.org/zh-CN/docs/Web/CSS/animation-play-state)

属性应用例子，移动的方块

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    div {
      background: chartreuse;
      width: 200px;
      height: 200px;
      /* 动画名称 */
      animation-name: test1;
      /* 持续时间 */
      animation-duration: 2s;
      /* 运动曲线 */
      animation-timing-function: ease;
      /* 何时开始 */
      /* animation-delay: 0.5s; */
      /* 重复次数 */
      animation-iteration-count: infinite;
      /* 是否反方向播放 */
      animation-direction: alternate-reverse;
      /* 动画结束后状态 */
      /* animation-fill-mode: forwards; */
      /* 简写 */
      /* animation: name duration timing-function delay iteration-count direction fill-mode; */
      /* animation: test1 2s ease 0s 1 alternate forwards; */
      /* animation: test1 2s; */
    }

    div:hover {
      /* 动画播放或停止 */
      animation-play-state: paused;
    }

    @keyframes test1 {
      from {
        transform: translate(0, 0);
      }

      to {
        transform: translate(1000px, 0);
      }
    }
  </style>
</head>
<body>
  <div></div>
</body>
</html>
```

#### animation

**animation** 属性是 [`animation-name`](https://developer.mozilla.org/zh-CN/docs/Web/CSS/animation-name)，[`animation-duration`](https://developer.mozilla.org/zh-CN/docs/Web/CSS/animation-duration), [`animation-timing-function`](https://developer.mozilla.org/zh-CN/docs/Web/CSS/animation-timing-function)，[`animation-delay`](https://developer.mozilla.org/zh-CN/docs/Web/CSS/animation-delay)，[`animation-iteration-count`](https://developer.mozilla.org/zh-CN/docs/Web/CSS/animation-iteration-count)，[`animation-direction`](https://developer.mozilla.org/zh-CN/docs/Web/CSS/animation-direction)，[`animation-fill-mode`](https://developer.mozilla.org/zh-CN/docs/Web/CSS/animation-fill-mode) 和 [`animation-play-state`](https://developer.mozilla.org/zh-CN/docs/Web/CSS/animation-play-state) 属性的一个简写属性形式。

前两个属性一定要写，其他属性均可省略让它们使用默认值。

属性值：

- 值1`animation-name` 使用的关键帧动画名称
- 值2`animation-duration` 规定动画完成一个周期所花费的秒或毫秒，默认0
- 值3`animation-timing-function` 指定动画的变化曲线，默认`ease`
  - linear 动画匀速执行
  - ease 默认 动画以低速开始，然后加快，在结束前变慢
  - ease-in 动画以低速开始
  - ease-out 动画以低速结束
  - ease-in-out 动画以低速开始和结束
  - steps() 指定了函数中的间隔数量(步长)
- 值4`animation-delay` 指定延迟执行时间，默认`0`，立即执行
- 值5 `animation-iteration-count` 指定动画执行次数 ，默认`1`，`infinite`表示无限动画
- 值6 `animation-direction` 指定动画执行方向
  - `normal` 默认
  - `alternate` 反向执行
  - `reverse` 从结束位置开始执行
  - `alternate-reverse` 反向执行，从结束位置开始
- 值7 `animation-fill-mode` 指定动画结束后状态，即动画最终停留在什么位置
  - `none` 默认 回到没有执行动画的位置
  - `forwards` 动画最后一帧的位置
  - `backwards` 动画第一帧的位置
- 值8 `animation-play-state` 指定动画运行或者暂停 （一般结合JavaScript使用，用于暂停动画；或者结合鼠标经过`:hover`使用）
  - `running` 默认
  - `paused`

#### 关键帧动画

使用transition来进行过渡动画，但是过渡动画只能控制首位两个值：

- 从关键帧动画的角度理解相当于只是定义了两帧的状态：第一帧和最后一帧；
- 如果我们希望可以有更多的变化，可以直接使用关键帧动画。

关键帧动画使用`@keyframes`来定义（动画）多个变化状态，并且使用`animation-name`来声明匹配：

1. 使用`@keyframes`创建一个规则
2. `@keyframes`中使用百分比定义各个阶段的样式
3. 通过`animation`将动画添加到属性上

`0%`是动画的开始，到`100%`是动画的完成，这样的规则叫做**动画序列**。

也可以使用`from`和`to`关键字，`from`表示`0%`，`to`表示`100%`。其中的百分比要是整数，它是`animation-duration`总的时间的划分。

```html
<style>
@keyframes 动画名称 {
     0% {
      transform: translate(0, 0);
  }
  25% {
      transform: translate(200px, 0);
  }
  50% {
      transform: translate(200px, 200px);
  }
  75% {
      transform: translate(0, 200px);
  }
  100% {
      transform: translate(0, 0);
  }
}
</style>
```

一个移动的正方形

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    div {
      background: chartreuse;
      width: 200px;
      height: 200px;
      transition: all .5s;
    }

    div:hover {
      animation: test1 2s linear, test2 2s linear;
    }

    @keyframes test1 {
      from {
        transform: translate(0, 0);
      }
      25% {
        transform: translate(200px, 0);
      }
      50% {
        transform: translate(200px, 200px);
      }
      75% {
        transform: translate(0, 200px);
      }
      to {
        transform: translate(0, 0);
      }
    }

    @keyframes test2 {
      0% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
      100% {
        opacity: 1;
      }
    }
  </style>
</head>
<body>
  <div></div>
</body>
</html>
```

属性分开和简写应用例子，移动的方块

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    div {
      background: chartreuse;
      width: 200px;
      height: 200px;
      /* 动画名称 */
      animation-name: test1;
      /* 持续时间 */
      animation-duration: 2s;
      /* 运动曲线 */
      animation-timing-function: ease;
      /* 何时开始 */
      /* animation-delay: 0.5s; */
      /* 重复次数 */
      animation-iteration-count: infinite;
      /* 是否反方向播放 */
      animation-direction: alternate-reverse;
      /* 动画结束后状态 */
      /* animation-fill-mode: forwards; */
      /* 简写 */
      /* animation: name duration timing-function delay iteration-count direction fill-mode; */
      /* animation: test1 2s ease 0s 1 alternate forwards; */
      /* 前两个属性必须，其余可省略 */
      /* animation: test1 2s; */
    }

    div:hover {
      /* 动画播放或停止 */
      animation-play-state: paused;
    }

    @keyframes test1 {
      from {
        transform: translate(0, 0);
      }

      to {
        transform: translate(1000px, 0);
      }
    }
  </style>
</head>
<body>
  <div></div>
</body>
</html>
```

分步长steps()完成动画，打字机效果显示一行文字

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    .text {
      position: relative;
      width: 0px;
      height: 30px;
      font-size: 20px;
      white-space: nowrap;
      overflow: hidden;
      background: #cec1c1;
      /* animation: test 5s ease-in forwards; */
      animation: test 5s steps(10) forwards;
    }

    @keyframes test {
      from {
        width: 0px;
      }

      to {
        width: 220px;
      }
    }
  </style>
</head>
<body>
  <div class="text">
    床前明月光，疑是地上霜
  </div>
</body>
</html>
```

地图上的发光波纹坐标点

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    .map {
      position: relative;
      width: 1200px;
      height: 616px;
      background: #cec1c1;
    }

    .country {
      position: absolute;
      top: 200px;
      left: 324px;
    }

    .dotted {
      width: 10px;
      height: 10px;
      background: #f00;
      border-radius: 50%;
    }

    .country div[class^="pulse"] {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 10px;
      height: 10px;
      box-shadow: 0 0 16px red;
      border-radius: 50%;
      animation: pulse 2s linear infinite;
    }

    .country div.pulse2 {
      animation-delay: 1s;
    }

    .country div.pulse3 {
      animation-delay: 2s;
    }


    @keyframes pulse {
      from {}

      70% {
        width: 40px;
        height: 40px;
        opacity: 1;
      }

      to {
        width: 70px;
        height: 70px;
        opacity: 0;
      }
    }
  </style>
</head>
<body>
  <div class="map">
    我是地图
    <div class="country">
      <div class="dotted"></div>
      <div class="pulse1"></div>
      <div class="pulse2"></div>
      <div class="pulse3"></div>
    </div>
  </div>
</body>
</html>
```

奔跑的熊

与gif相比，可以很简单控制熊奔跑的速度。

![bear](https://cdn.jsdelivr.net/gh/ccbeango/blogImages/HTML+CSS/HTML%E5%92%8CCSS%E5%9F%BA%E7%A1%80%E5%AD%A6%E4%B9%A007.png)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    body {
      background: grey;
    }
    .bear {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 200px;
      height: 100px;
      background: url('./bear.png');
      animation: bear 1s steps(8) infinite, moving 3s linear 1 forwards;
    }

    @keyframes bear {
      from {
        background-position: 0 0;
      }

      to {
        background-position: -1600px 0;
      }
    }

    @keyframes moving {
      from {
        left: 0;
      }

      to {
        left: 50%;
        transform: translate(-50%);
      }
    }
  </style>
</head>
<body>
  <div class="bear">
  </div>
</body>
</html>
```

公告无缝滚动

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>CSS3动画</title>
    <style>
      .container {
        margin: 0 auto;
        width: 600px;
      }

      .wrapText {
        width: 300px;
        background: red;
        display: flex;
        white-space: nowrap;
        overflow: hidden;
      }
      .text {
        flex-shrink: 0;
        display: inline-block;
        /* 设置min-widht属性,让两个公告的宽度至少等于wrapText宽度 */
        min-width: 100%;
        font-size: 14px;
        color: #262626;
        white-space: nowrap;
        animation: moving 3s linear infinite;
      }
      @keyframes moving {
        from {
          transform: translateX(0%);
        }
        to {
          transform: translateX(-100%);
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h6>短公告</h6>
      <div class="wrapText">
        <div class="text">你好我是公告</div>
        <div class="text">你好我是公告</div>
      </div>
      <h6>长公告</h6>
      <div class="wrapText">
        <div class="text">
          很长的公告，很长的公告很长的公告很长的公告很长的公告很长的公告很长的公告xxxxxx
        </div>
        <div class="text">
          很长的公告，很长的公告很长的公告很长的公告很长的公告很长的公告很长的公告xxxxxx
        </div>
      </div>
    </div>
  </body>
</html>
```

### CSS属性-filter 滤镜

**`filter`** CSS属性将模糊或颜色偏移等图形效果应用于元素。滤镜通常用于调整图像，背景和边框的渲染。

设置一种函数，方法如下：

```text
filter: <filter-function> [<filter-function>]* | none
```

给SVG元素`<filter>`引用滤镜, 如下：

```text
filter: url(file.svg#filter-element-id)
```

`url()`获取指向SVG过滤器的URI，该 [SVG filter](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/filter) 可以嵌入到外部XML文件中

属性值(filter函数)：

- `blur()` 高斯模糊
- `brightness()` 亮度
- `contrast()` 对比度
- `drop-shadow()` 阴影效果
- `grayscale()` 图像灰度
- `hue-rotate()` 色相旋转
- `invert()` 反转输入图像
- `opacity()` 透明度
- `saturate()` 图像饱和度
- `sepia()` 图像转为深褐色

可以组合任意数量的函数来控制渲染。

```css
filter: contrast(175%) brightness(3%)
```

图片底部实现毛玻璃效果

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<style>
  .box {
    position: relative;
    width: 300px;
    height: 300px;
    background: url('http://taosha01-1253585015.cos.ap-shanghai.myqcloud.com/taosha/d620bec0-d61c-11ea-9c32-1172a154412d.png?imageMogr2/crop/100x100/center') center/300px 300px no-repeat;
  }

  .filter {
    position: absolute;
    bottom: 0;
    width: 300px;
    height: 30px;
    overflow: hidden;
    background: url('http://taosha01-1253585015.cos.ap-shanghai.myqcloud.com/taosha/d620bec0-d61c-11ea-9c32-1172a154412d.png?imageMogr2/crop/100x100/center') center bottom/300px 300px no-repeat;
    filter: blur(8px);
  }

  span {
    position: absolute;
    bottom: 0;
    width: 100%;
    text-align: center;
    font-size: 16px;
    color: red;
  }
</style>
<body>
  <div class="box">
    <div class="filter">哈哈哈</div>
    <span>我是标题啊</span>
  </div>
</body>
</html>
```

## CSS特性

### 继承

CSS中有些属性是可以继承的。一个元素如果没有设置某属性，就会跟随父元素的值。当然，一个元素如果有设置某属性的值，就使用自己设置的值。

不能继承的属性，一般可以使用inherit值强制继承。

浏览器的开发者工具也会标识出哪些样式是继承过来的`Inherited from ***`。

要注意的是，CSS继承过来的是计算值，

```html
<style>
  .box1 {
    font-size: 60px;
  }

  .box2 {
     /* 30px */
    font-size: 0.5em;
  }
</style>

<div class="box1">
  <div class="box2">
      <!-- p中文字30px -->
    <p>文字内容</p>
  </div>
</div>
```

### 层叠和权重

CSS允许相同名字的CSS属性层叠在同一个元素上。

层叠后的结果是只有一个CSS属性会生效。

哪个CSS属性会生效，取决于CSS属性所处环境的优先级高低。

浏览器的开发者工具非常清晰地显示了哪个CSS属性会生效。

**基本层叠**，使用了相同的选择器，后面一定会把前面的层叠掉。

下面文字内容是橘色。

```html
<style>
  .box1 {
    color: red;
  }

  .box2 {
    background-color: green;
    color: purple;
  }

  .box3 {
    width: 300px;
    color: orange;
  }
</style>
<body>
  <div class="box1 box2 box3">文字内容1</div>
</body>
```

当选择器不同时，需要按照选择器的权重来层叠，谁的权重越大，谁就优先显示。

下面文字内容是蓝色。

```html
<style>
 #mian {
   color: blue;
 }

 .box {
   color: green;
 }

 div {
   color: red;
 }

</style>
<body>
  <div class="box" id="main">文字内容</div>
</body>
```

#### CSS属性的优先级

按照经验，为了方便比较CSS属性的优先级，可以给CSS属性所处的环境定义一个权重。

- `!important`：
- 内联样式：1000
- id选择器：100
- 类选择器、属性选择器、伪类：10
- 元素选择器、伪元素：1
- 通配符：0

比较优先级的严谨方法：

- 从权值最大的开始比较每一种权值的数量多少，数量多的则优先级高，即可结束比较
- 如果数量相同，比较下一个较小的权值，以此类推。

- 如果所有权值比较完毕后，发现数量相同，就采取就近原则。

```css
  /* 如果这2个color是作用在同一个标签上，哪个优先级高？ */

  /* 2个id选择器、2个类选择器 */
  .five#radio .one #three {
    color: blue;
  }

  /* 2个id选择器、1个类选择器、2个元素选择器 */
  #box #btn .four div span {
    color: black;
  }
```

要理解的是，权重只是为了方便记忆，并不是真的按照值去比较权重。

**为什么"我是个a"是蓝色。**

```html
<style>
  div {
    color: red !important;
  }
</style>

<body>
  <div class="box1 box2 box3">
    我是div的内容 <br>
    <span>我是一个span</span> <br>
    <a href="">我是个a</a>
  </div>
</body>
```

因为a标签本身给自己设置了颜色，所以会使用自己的颜色，而不是继承div中的红色，即使设置了`!important`

**为什么div中的文本没有变成红色**

```html
<style>
  p div {
    color: red !important;
  }
</style>

<body>
  <p>
    <div>我是一个div</div>
  </p>
</body>
```

浏览器本身不支持p中嵌套div，可以在浏览器中查看，html结构是乱掉的，和声明的不一样。

### CSS属性的使用经验

为什么有时候编写的CSS属性不生效，有可能是因为：

- 选择器的优先级太低
- 选择器没选中对应的元素
- CSS属性的使用形式不对
  - 元素不支持此CSS属性，比如span默认是不支持width和heigt的
  - 浏览器不支持此CSS属性，如旧版本的浏览器不支持CSS3的某些属性
  - 被同类的CSS属性覆盖，比如font覆盖font-size

建议：

充分利用浏览器开发者工具进行调试（增加、修改样式）、查错。

## 浏览器私有前缀

为了兼容老版本的写法，比较新的浏览器无须添加。

私有前缀：

- `-moz-` firefox浏览器私有属性
- `-ms-` 代表ie浏览器私有属性
- `-webkit-` 代表safari、chrome私有属性
- `-o-` 代表Opera私有属性

提倡写法：

```css
{
  -moz-border-radius: 10px;
  -ms-border-radius: 10px;
  -webkit-border-radius: 10px;
  -o-border-radius: 10px;
  border-radius: 10px;
}
```
