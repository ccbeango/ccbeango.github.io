---
title: "阅读JavaScript高级程序设计总结"
date: "2022-02-27 22:58:59"
tags:
  - "前端"
  - "JavaScript"
draft: false
---

## 第一、二章 简介

### JavaScript和EcmaScript的区别？

Ecma是欧洲计算机制造商协会的缩写，该协会标准化了当时两个版本的JS：在Netscape Navigator 中的JavaScript和IE中的JScript。即打造了ECMA-262，也就是EcmaScript。

JavaScript和ECMAScript 基本上是同义词，但JavaScript是EcmaScript的父集。

完整的JavaScript 实现包含3个部分：

- 核心 EcmaScript

- 文档对象模型 DOM
- 浏览器对象模型 BOM

浏览器实现了EcmaScript的宿主环境，然后根据需要扩展了DOM和BOM。NodeJS也只是EcmaScript的一个宿主环境。

ECMAScript 只是对实现这个规范描述的所有方面的一门语言的称呼。JavaScript 实现了ECMAScript，而NodeJS同样也实现了ECMAScript。

### \<script>标签有哪些属性

script是网景公司创造，之后加入了HTML标准中。

script标签共有8个属性：

- `async` 可选。表示应该立即开始下载脚本，但不能阻止其他页面动作，比如下载资源或等待其他脚本加载。
  - **只对外部脚本文件有效，即使用src引入的脚本**
- `charset` 可选。指定字符集，很少用，大多数浏览器不在乎此值
- `crossorigin` 可选。配置相关请求的**CORS（跨源资源共享）**设置。默认不使用CORS
  - `crossorigin="anonymous"` 配置文件请求不必设置凭据标志
  - `crossorigin="use-credentials"` 设置凭据标志，意味着出站请求会包含凭据
- `defer` 可选。脚本可以延迟到文档完全被解析和显示之后执行。
  - **只对外部脚本文件有效，即使用src引入的脚本**
- `integrity ` 可选。允许比对接收到的资源和指定的加密签名，以验证子资源完整性。
- ~~`language`~~ 已废弃。大多浏览器会忽略
- `src` 可选。要加载的外部文件
  - 外部引入的js文件扩展名不一定是`.js`。为浏览器将JS扩展语言ts、jsx转义为JS提供了可能性。
  - src执行不在同一个域名时，浏览器回向制定的域名发送一个GET请求来获取资源。
- `type` 可选。替代`language`。表示代码中脚本语言的类型，即MIME类型。
  - 默认是`text/javascript`。
  - 设置`module`，代码会被当成ES6模块，此时支持`export`、`import`关键字

### 多个script标签的加载顺序是什么？

如果**没有使用async或defer**，浏览器会按照\<script>在页面中出现的顺序依次解释，第二个\<script>元素的代码必须在第一个\<script>元素的代码解释完毕才能开始解释，第三个则必须等第二个解释完，以此类推。

### script标签应该放在哪里

浏览器页面渲染时，会在解析到\<body>的起始标签时开始渲染页面，如果大量JavaScript文件都放在\<head>里，也就意味着必须把所有JavaScript 代码都下载、解析和解释完成后才开始渲染页面。

所以通常将JS文件放在body内容的后面。而对于页面渲染前就要依赖的Javascript，可以放在head中。

或者可以使用`defer`标签改变脚本的解释时机。

### defer和async的区别

defer属性相当于告诉浏览器，立即下载脚本，但延迟执行。

```js
<html>
<head>
<title>Example HTML Page</title>
<script defer src="example1.js"></script>
<script defer src="example2.js"></script>
</head>
<body>
</body>
</html>
```

- HTML5规范要求，执行时机`DOMContentLoaded`事件之前执行，多个defer的script标签会按顺序执行。

- 但实际中不一定会在`DOMContentLoaded`事件之前执行，多个脚本也不一定顺序执行，因此最好只包含一个`defer`脚本。

async与defer类型，属性也相当于告诉浏览器，立即下载脚本；但不保证按次序执行。

```js
<html>
<head>
<title>Example HTML Page</title>
<script async src="example1.js"></script>
<script async src="example2.js"></script>
</head>
<body>
<!-- 这里是页面内容-->
</body>
</html>
```

- `async`属性的目的是告诉浏览器，不必等脚本下载和执行完之后再加载页面，同样也不必等到该`async`脚本下载和执行完之后，再加载其它脚本。因此，不应该在加载期间修改DOM，因为DOM可能还未加载完，会报错或修改无效。
- `async`脚本会在`load`事件前，`DOMContentLoaded`事件之前或之后执行。

> window 的load 事件会在页面完全加载后触发，因为要等待很多外部资源加载完成，所以会花费较长时间。
>
> 而DOMContentLoaded 事件会在DOM 树构建完成后立即触发，而不用等待图片、JavaScript文件、CSS 文件或其他资源加载完成。
>
> 相对于load 事件，DOMContentLoaded 可以让开发者在外部资源下载的同时就能指定事件处理程序，从而让用户能够更快地与页面交互。

### \<noscript>标签的作用

noscript是一个浏览器页面优雅降级的处理方案。

浏览器不支持JavaScript或浏览器的JavaScript支持被关闭，那么就会渲染此标签中的内容。

## 第三章 语言基础

### 什么是严格模式，以及作用

严格模式：为`JavaScript`定义了一种不同的解析与执行模式。是ES5引入的一个概念，处理了ES3的一些不规范的写法带来的隐患问题和不确定行为。

严格模式主要限制：

- 变量必须声明后再使用
- 函数的参数不能有同名属性，否则报错
- 不能适用`with`语句
- 不能对只读属性赋值，否则报错
- 不能适用前缀0表示八进制，否则报错
- 不能删除不可删除的属性，否则报错
- 不能删除变量`delete prop`，会报错，只能删除属性`delete global[prop]`
- `eval`不会再它的外层作用域引入变量
- `eval`和`arguments`不能被重新赋值
- `arguments`不会自动反映函数参数的变化
- 不能使用`arguments.callee`和`arguments.caller`
- 禁止`this`指向全局对象
- 不能使用`fn.caller`和`fn.arguments`获取函数调用的堆栈
- 增加了保留字，如`protected`、`static`、`interface`

尤其注意`this`的限制，ES6模块中，顶层的`this`指向`undefined`，即不应该在顶层代码中使用`this`。

### 声明变量var、let、const

**var**

- 初始化未赋值时，默认为undefined
- 使用var操作符定义的变量会成为函数的局部变量，即**var声明的变量是函数作用域**
- 函数内定义变量但省略var时，会创建一个全局变量（能在函数外访问到）
- 关键字声明的变量会自动提升到函数作用域顶部，即**提升（hoist）**
- 同一个作用域中，可反复多次声明一个变量，后声明的可覆盖之前声明的。因为存在提升，相当于多个声明做了合并。
- 在全局作用域中声明的变量会成为window对象的属性

**let**

- 与var声明类似，但是最主要的区别是**let 声明的范围是块作用域，而var 声明的范围是函数作用域。**
  - 同一个块作用域中，不允许多次（冗余）声明一个变量；否则报错`SyntaxError`。
  - let可以嵌套使用相同标识，JavaScript引擎会记录变量声明的标识和所在的作用域。
  - var和let混合声明同一个变量也会有冗余报错。
- **let声明变量不会在作用域中提升**。所以在let声明变量之前使用该变量存在暂时性死区。
- let在全局作用域中声明的变量不会成为window对象的属性。var声明的则会。

**const**

- const与let行为基本一致，唯一一个重要区别是，它声明时必须初始化变量，且无法再修改。尝试修改会报错
  - const这个特性只适用于它指向的变量的引用。如果指向一个对象，修改对象里面的值，并不会报错
  - `for in`和`for of`中建议使用它
- const变量是单一类型且不可修改的，JavaScript运行时编译器可以将所有实例替换成实际值，而不会通过查询表进行变量查找。（V8引擎就执行这种优化）

它们的使用建议是，优先使用const，let次之；不使用var

### 下面两个for循环的输出分别是什么？

考察let和var的特性

```js
for (var i = 0; i < 5; ++i) {
	setTimeout(() => console.log(i), 0)
}

for (let i = 0; i < 5; ++i) {
	setTimeout(() => console.log(i), 0)
}
```

第一个循环输出是55555，第二个循环输出是01234。

- var声明的变量是函数作用域的，存在声明变量提升，循环定义的循环体变量会渗透到循环体外部，循环结束时，就只有最后一个var i = 5。异步执行的`setTimeout`输出都会是5
- let声明的变量是块作用域的，每次创建都会在for循环快内部，每次循环内部都会保存自己的变量`let i`值，setTimeout都会在每次循环体的作用域中获取到不同的变量实例

同样适用于`for in`和`for of`循环，但建议此时使用`const`替代`let`

### JS中有哪些数据类型

JS中有7种数据类型，其中包括**6种简单数据类型（基本类型）**和**1种复杂数据类型（引用类型）**

基本类型：

- `Undefined` 声明变量未初始化时的值
- `Null` 是一个空指针对象
- `Boolean`
- `String`
- `Number`
- `Symbol `符号是原始值，且符号实例是唯一、不可变的。Symbol是用来创建唯一标识符，进而用作非字符串形式的对象属性，不会发生属性冲突的危险

引用类型：`Object`

- 它是派生其他对象的基类。
- Object实例都有的属性和方法
  - constructor
  - `hasOwnProperty(propertyName)`
  - `isPrototypeOf(Obj)`
  - `propertyIsEnumerable(propertyName)`
  - `toLocalString()`
  - `toString()`
  - `valueOf()`

### typeof是函数还是操作符，它的作用是什么

type是操作符，不是函数。

它的作用是用来确定任意变量的数据类型。

对一个值使用typeof 操作符会返回下列字符串之一：

- `"undefined"`表示值未定义；
- `"boolean"`表示值为布尔值；
- `"string"`表示值为字符串；
- `"number"`表示值为数值；
- `"object"`表示值为对象（而不是函数）或null；
- `"function"`表示值为函数；
- `"symbol"`表示值为符号。

typeof操作符判断一个变量是否为字符串、数值、布尔值或undefined 的最好方式。null或对象，那么返回`"object"`，如果对象内部实现了`[[Call]]`方法，则返回`"function"`

### NaN的特点

NaN(Not a number)表示不是一个数字。`isNaN()`函数能确定值是否不是数值。

- 任何涉及NaN的操作最终都会返回NaN
- NaN不等于包括NaN在内的任何值

### 字符串的特点

- 字符串包含一些字符字面量，如换行符`\n`、制表符`\t`、回车`\r`等
- 字符串的长度可以通过`length`属性获取，会返回字符串中16位字符的个数。如果有些字符是双字节，那么这个值可能不准确
- 字符串是不可变的，一旦被创建就不能被销毁。要想修改某个字符串的值，必须先销毁原字符串，然后将新的字符串重新赋值给该变量。

### 模板字符串的本质

模板字符串不是字符串，而是一个句法表达式；

在定义时会立即求值并转换为字符串实例，任何插入的变量也会从它们最近的作用域中取值。

任何值都可以做插入的值，插入的值都会调用toString强制转换成字符串。

模板字符串也可做标签函数，也就是可以调用一个函数。函数的第一个参数是原始字符串数组，后面的参数是对每个表达式求值的结果，参数个数不确定，后面参数一般使用剩余操作符`...params`接收。

```js
function tagFun (expression, a, b, abSum) {
    // ...
}
const a = 6
const b = 9
tagFun`${ a } + ${ b } = ${ a + b }`
// ["", " + ", " = ", ""]
// 6
// 9
// 15
console.log(untaggedResult); // "6 + 9 = 15"
console.log(taggedResult); // "foobar"
```

参数个数为n，第一个参数是数组，它的元素个数为`n + 1`

### JS中位操作符的原理

JS中所有数值都是以IEEE 754 64位格式存储，但未操作符不直接应用到64位表示，而是先把值转换成32位整数，再进行操作，之后再把值转换成64位。

对于开发者而言，就好像只有32位整数一样，因为64位整数存储格式是不可见的。

### 有符号的整数在JS中如何表示

有符号的整数使用32位的前31位表示整数值。第32位表示数值的符号，0表示正，1表示负。第三十二位称为符号位。

负数以二补数（补码）的二进制编码进行存储。

二补数计算如下：

1. 首选计算它的绝对值二进制
2. 然后计算一补数（反码），即每个0变成1,1变成0
3. 最后计算二补数（补码），给一补数加1。

把负值转二进制字符串输出时候，会得到一个前面加了减号的绝对值：

```js
let num = -18;
console.log(num.toString(2)); // "-10010"
```

### 未操作符 非、与、或、异或的作用

- 按位非`~`：返回数值的一补数（反码）。最终效果就是对数值取反并减`1`
- 按位与`&`：将两个数对齐，基于规则两个位都是1时返回1，任何一位是0时返回0，对每一位执行与操作。
- 按位或`|`：将两个数对齐，基于规则在至少一位是1 时返回1，两位都是0 时返回0，对每一位执行或操作
- 按位异或`^`：将两个数对齐，基于规则在只在一位上是1时返回1，两位都是1或0，则返回0

### 左移、右移、无符号右移

- 左移：按照指定的位数，将数值所有位向左移动，空位用0补充，保留符号位。
- 右移：按照指定位数，将数值所有位向右移动，空位用符号位补充。
- 无符号右移：对于正数，无符号右移会与有符号右移结果相同。因为都是0补充。负数时，有符号用1补充，无符号还是用0补充，那么符号位也被填充为0，就会把它当做是正值。

### 逻辑与&&和逻辑非||的特点

逻辑与

- 如果要判断的两个操作数都是真，则返回第二个；如果有一个不是真值，则返回这个值；
- 逻辑与操作符是一种短路操作符，就是如果第一个操作数决定了结果，那么永远不会对第二个操作数求值。

逻辑非

- 如果两个值有一个真，则就直接返回真值；
- 也是短路操作符，只不过第一个操作数为真，第二个操作数就不会再求值

逻辑与和非的短路特性经常在开发中用到。

### with语句的作用

with语句的作用是将代码作用域设置为特定对象。

```js
let qs = location.search.substring(1);
let hostName = location.hostname;
let url = location.href;

// 上面代码中的每一行都用到了location 对象。如果使用with 语句，就可以少写一些代码：
with(location) {
 let qs = search.substring(1);
 let hostName = hostname;
 let url = href;
}
```

这里，with 语句用于连接location 对象。

- 这意味着在这个语句内部，每个变量首先会被认为是一个局部变量。
- 如果没有找到该局部变量，则会搜索location 对象，看它是否有一个同名的属性。
- 如果有，则该变量会被求值为location 对象的属性。
- Vue中编译时codegen会生成with包裹的代码块。

## 第四章 变量、作用域与内存

### 变量保存值有什么特点

变量分为两种数据类型：原始值（primitive value）和引用值（reference value）。

- 保存原始值的变量是按值访问的。
  - 因为我们操作的就是存储在变量中的实际值。

- 保存引用值的变量是按引用访问的。
  - 因为JavaScript中不允许直接访问内存位置，因此不能直接操作对象所在的内存空间。
  - 操作对象时，实际操作的是对该对象的引用而非对象本身。

- 原始值复制时，会创建一个全新的变量。新的变量和旧的变量是完全独立的。
- 引用值复制时，实际复制的是一个指针，该指针指向同一个堆内存中的对象

### 什么是执行上下文

执行上下文就是当前 JavaScript 代码执行时所在环境的抽象概念， JavaScript 中运行任何的代码都是在执行上下文中运行。

变量或函数的上下文决定了它们能够访问哪些数据，以及它们的行为。

每个上下文中都会关联一个**变量对象**，而上下文中定义的变量和函数都会保存在这个变量对象中。

虽然无法通过代码访问到这个变量对象，但是后台处理数据会用到它。

执行上下文主要有三种，**全局上下文**，（就是我们常用的浏览器中的window对象、Node中的global对象）、**函数上下文**以及**块级上下文**。还有一种**变量上下文**

上下文在其所有代码执行完毕的时候会被销毁，关联的变量对象也会被销毁，即销毁上下文中定义的变量和函数。

当执行到函数时，会为这个函数创建它的上下文，函数上下文会推入到一个上下文栈中，函数执行完毕后，上下文栈会弹出该函数，将控制权返回给之前的上下文。

上下文代码执行时，同时会创建变量对象的作用域链。这个**作用域链决定了各级上下文的代码在访问变量和函数时的顺序。**

代码正在执行的上下文的变量对象始终位于作用域链的最前端（因为与上下文栈关联），**处于活动状态的执行上下文只有一个**。

如果上下文是函数的，那么它的**活动对象（activation object）**就会用作变量对象。活动对象最初只有一个定义变量`arguments`。

作用域链中的倒数第二个变量对象，就是上下文栈中从顶到底第二个上下文对应的变量对象，第三个就是上下文栈中第三个上下文对象的变量对象，以此类推，直至全局上下文。（全局上下文的变量对象始终是作用域链中最后一个变量对象。）

代码在执行时，标识符的解析就是通过作用域链逐级搜索标识符名完成的。搜索过程就是从作用域链最前端开始，然后逐级往后，直至找到标识符。（如果最终没找到，通常会报错）

如果局部上下文中有一个同名的标识符，那就不能在该上下文中引用父上下文中的同名标识符。**遮蔽特性**

内部上下文可以通过作用域链访问到外部的一切，而外部上下文无法访问到内部的上下文中的任何东西。

代码辅助理解：

```js
let color = 'red'

function changeColor () {
  let anotherColor = 'green'

  function swapColor () {
    const tempColor = anotherColor
    anotherColor = color
    color = tempColor
    // 这里可以访问color、anotherColor 和tempColor
  }

  // 这里可以访问color 和anotherColor，但访问不到tempColor
  swapColor()
}

// 这里只能访问color
changeColor()

```

上面的代码会形成自己的上下文栈，包括全局上下文window，局部上下文changeColor和swapColor；每个上下文分别对应变量对象会形成作用域链。

![红皮书-全局上下文和作用域](https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/JavaScript/红皮书-全局上下文和作用域.drawio.svg)

注：图中方便理解，并不是实际的结构。作用域链其实是一个包含指针的列表。

**总结执行上下文**：

- 执行上下文分全局上下文、函数上下文、块级上下文和变量上下文（个人编写代码中不使用，内部垃圾回收会使用）。
- 代码执行流每进入一个新上下文，都会创建一个作用域链，用于搜索变量和函数。
- 函数或块的局部上下文不仅可以访问自己作用域内的变量，而且也可以访问任何包含上下文乃
  至全局上下文中的变量。
- 全局上下文只能访问全局上下文中的变量和函数，不能直接访问局部上下文中的任何数据。
- 变量的执行上下文用于确定什么时候释放内存。

### 执行上下文与作用域的区别

执行上下文就是当前 **JavaScript 代码执行期间**所在环境的抽象概念， JavaScript 中运行任何的代码都是在执行上下文中运行。

作用域是在**JavaScript代码编译成机器码执行之前**。也就是说作用域在变量和函数定义时已经确定了。 编译器需要依赖的一个作用对象，用于查找当前环境所定义得变量和函数等，最终输出整体词法树(ast)。

作用域可以理解成只是一个地盘，地盘中有该作用域中的变量和函数标识符，最大的用处就是**隔离变量**，不同作用域下的同名变量不会冲突。

那么我们可以看出，作用域中没有具体的变量数据，**变量的数据是通过作用域对应的执行上下文环境中的变量对象来实现的**。

同一个作用域下，对同一个函数的不同的调用会产生不同的执行上下文环境，继而产生不同的变量的值，**所以，作用域中变量的值是在执行过程中确定的，而作用域是在函数创建时就确定的。**

**如果要查找一个作用域下某个变量的值，就需要找到这个作用域对应的执行上下文，再在上下文对应的变量对象中找到变量的值。**

### 什么是闭包函数

闭包指的是**那些引用了另一个函数作用域中变量的函数**，通常在嵌套函数中实现。

闭包函数使用的是作用域链。这就不得不提到执行上下文和作用域。

执行上下文通常有三种，一种是全局上下文（浏览器中的window对象，Node中的global对象）；另一种是函数上下文（局部上下文）；最后一种是块级上下文（局部上下文）；还有一种是变量上下文。

全局上下文在代码执行期间始终存在，函数上下文只在函数执行期间存在。

（当一个被调用执行时，会为这个函数创建它的上下文，函数上下文会推入到一个上下文栈中；函数执行完毕后，上下文栈会弹出该函数，并判断是否销毁这个上下文的活动对象，需要则销毁，然后将控制权返回给之前的上下文。）

每个上下文中都会关联自己的变量对象，上下文在执行时创建的变量和函数都会保存在这个变量对象中。

当一个函数被创建时，会创建这个函数的预作用域链，保存在函数内部的`[[Scope]]`中。

当函数执行时，创建这个函数的上下文和上下文关联的变量对象（函数中称为活动对象），这个变量对象会用`arguments`和其他命名参数来初始化。并复制`[[Scope]]`中的预作用域链来创建这个函数的作用域链。函数上下文的变量对象在作用域链的最前端，外部包裹函数的变量对象是内部函数作用域链中的第二个对象，再外部的是第三个，这个作用域链一直串起所有包含函数的活动对象，直至全局上下文的活动对象为止。

函数内部在访问变量时，就会使用给定的名称从作用域链中逐级查找变量。函数执行完毕后，函数上下文会弹出上下文栈并被销毁，并销毁上下文关联的变量对象。

如果是一个闭包函数，外部的包裹函数的上下文会被销毁，但是因为内部函数的作用域链中有引用外部函数的变量对象，所以外部函数的变量对象并不会被销毁。

那么内部函数就可以访问到外部函数作用域中的变量，实现了闭包。

代码和图理解：

```js
/**
 * 创建对象的对比函数
 * @param {*} key 要对比的键名
 * @returns
 */
function createCompareFn(key) {
  return function (obj1, obj2) {
    let value1 = obj1[key]
    let value2 = obj2[key]
    if (value1 < value2) {
      return -1
    } else if (value1 > value2) {
      return 1
    } else {
      return 0
    }
  }
}

const compare = createCompareFn('grade')

const result = compare({ grade: 122 }, { grade: 108 })

```

compare()函数被创建时，会创建自己的预作用域链保存在`[[Scope]]`中。`compare()`在执行时，会创建它自己的上下文以及上下文关联的变量对象。然后会赋值`[[Scope]]`来创建作用域链，接着将它自己的变量对象推入到作用域链的最前端。如下图所示

![红皮书-闭包](https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/JavaScript/红皮书-闭包.drawio.svg)

图中可看到

- 函数在执行时，会将函数的上下文推入到上下文栈中。
- 函数的上下文都有自己的作用域链，作用域链其实是一个指针列表，每个指针就是一个作用域指向对应的变量对象，但物理上并不包含相应的对象。
- 每个上下文都有自己的变量对象，上下文可以关联到自己的变量对象。也可以通过作用域链访问到上一级的变量对象中定义的数据

### JavaScript的垃圾回收机制

JS通过自动内存管理实现内存分配和闲置资源回收。

基本思路是：确定哪个变量不再使用，然后释放它的内存。这个过程是周期性的，垃圾回收程序每隔一段时间，或者说在代码执行中某个预定的收集事件，就会自动运行。

如何确定哪个变量不再使用，即标记未使用的变量，有两种方法：

- 标记清理
  - 垃圾运行程序运行时，会标记内存中存储的所有变量。然后，它会将上下文中所有的变量和被在上下文中变量引用的变量的标记去掉。
  - 在此之后，再被加上标记的变量就是待删除的了，因为任何在上下文中的变量都访问不到它们了。
  - 随后垃圾回收程序会做一次**内存清理**，销毁带标记的所有值并回收它们的内存。
  - （到了2008 年，IE、Firefox、Opera、Chrome 和Safari 都在自己的JavaScript 实现中采用标记清理（或
    其变体），只是在运行垃圾回收的频率上有所差异。）
- 引用计数
  - 对每个值都记录它被引用的次数。
  - 如果声明一个变量并给它赋值一个引用值，那么这个值引用数为1。如果同一个值再被赋值给另一个变量，那么这个值的引用数加1。同样，如果变量不再引用这个值，那么引用书减1。
  - 当一个值的引用数为0时，垃圾回收程序下次运行就会释放引用数为0的值的内存。
  - 但是存在一个问题，就是**循环引用**，比如A对象中有个指针引用B，B对象中有个指针同时又引用A。那么A和B的引用数永远不会为0，那么内存就不会释放。如果大量存在这种情况，会导致大量内存无法释放，内存泄露。

优化内存使用方法：

1. **解除引用**：把不需要使用的变量或对象属性设置为`null`
2. 使用`const`和`let`：都是块作用域，相比于var的函数作用域，可以尽早让垃圾回收程序介入回收。
3. 合理使用隐藏类：两个类实例共享同一个构造函数和原型。避免先创建再补充，并在构造函数中一次声明所有属性。`delete`会导致生成相同的隐藏类。
4. 合理规范代码，避免内存泄露。
   - 不在未声明变量时就赋值，未就赋值会创建全局`var变量`
   - 合理使用闭包

## 第五章 基本引用类型

### 什么是基本引用类型，JS提供的基本引用类型有哪些？

引用类型有时候也被称为**对象定义**，对象被视为是某个引用类型（对象定义）的**实例**。

通过`new`操作符跟上**构造函数**来创建。

JS提供的基本引用类型有：

- Date
- RegExp
- 原始包装类型：Boolean、Number、String
- 单例内置对象：Global、Math

### Date的一些特性

- `Date.parse()`会接受一个表示日期的字符串，并解析日期为毫秒数。不是日期则返回`NaN`

- Date构造函数接受日期字符串，Date内部调用的是`Date.parse()`

  ```js
  let someDate = new Date(Date.parse('February 14, 2022'));
  // 等价于
  let someDate = new Date('February 14, 2022');
  ```

- `Date.now()` 返回执行时日期的毫秒数
- Date对象继承了Object，并重写了`toLocalString()`、`toString()`、`valueOf()`方法。如``
  - `toLocalString()` 返回本地环境一致的日期和事件字符串，`'2022/2/14 下午1:31:00'`
  - `toString()` 返回带时区信息的日期和时间，而时间也是以24 小时制（0~23）表示，`'Mon Feb 14 2022 13:31:00 GMT+0800 (中国标准时间)'`
  - `valueOf()` 返回日期毫秒数 `1644816660000`

### JavaScript如何处理调用原始值的方法或属性？

当时候原始值的属性或方法时，后台都会创建一个相应的原始包装类型对象，从而暴露出操作原始值的各种方法。

如有一个字符串`let s = hello`，当调用`s.slice()`方法时，后台都会执行以下三步：

1. 创建字符串的String类型实例
2. 调用实例上的特定方法
3. 销毁实例

后台执行可想象成

```js
let s = hello
let s2 = hello.slice()

// 想象成
let s = new String('hello')
let s2 = s.slice()
s = null
```

Number和Boolean原始包装类型同String。

### 原始包装类型的作用是什么

可以让JavaScript 中的原始值可以拥有类似对象的行为。

有3 种原始值包装类型：Boolean、Number 和String。

它们都具有如下特点。

- 每种包装类型都映射到同名的原始类型
- 在以读模式访问原始值时，后台会实例化一个原始值包装对象，通过这个对象可以操作数据
- 涉及原始值的语句只要一执行完毕，包装对象就会立即销毁

### 引用类型和原始包装类型的区别

主要区别在于对象的生命周期不同

- 引用类型创建的对象实例，会在离开它的作用域时被销毁。
- 原始包装类型创建的对象实例，只存在于它的那行代码的访问期间。
  - 这也就是为什么不能给原始值添加属性和方法，因为添加上属性或方法后，下一行就已经销毁了。

可以显示地new加上`Number`、`Boolean`、`String`构造函数来创建原始值，但一般没必要。

通过`new Object()`可以创建原始值和引用类型。Object内部会通过传入值的不同来返回相应的类型实例。

```js
let str = new Object('hello') // Sring实例
let num = new Object(60) // Number实例
let bool = new Object(true) // Boolean实例
let obj = new Obj({ name: 'ccbean' }) // 引用类型实例
```

### 原始包装类型和转型函数的区别

通过new调用原始包装类型的构造函数创建的是对象，typeof操作符会返回`"object"`

转型函数创建的是对应的制定值，typeof返回对应制定类型。

```js
let value = "25";
let obj = new Number(value); // 原始包装类型的构造函数
console.log(typeof obj); // "object"

let number = Number(value); // 转型函数
console.log(typeof number); // "number"
```

### 原始包装类型的一些总结

#### Boolean

- 重写了Object的`valueof()`方法，返回`true`或`false`

- 重写了`toString()`，返回`"true"`或`"false"`

- 原始包装类型创建的是一个Boolean对象，同其他原始包装类型一样，`typeof`返回的是`"object"`。

  - 原始值和引用值（Boolean 对象）的几个区别

    - typeof 操作符对原始值`"boolean"`，但对引用值返回`"object"`。

    - Boolean对象是Boolean类型的实例，在使instaceof 操作符时返回true，但对原始值则返回false。

      ```js
      console.log(typeof falseObject); // object
      console.log(typeof falseValue); // boolean
      console.log(falseObject instanceof Boolean); // true
      console.log(falseValue instanceof Boolean); // false
      ```

      理解原始布尔值和Boolean对象之间的区别非常重要，**强烈建议永远不要使用后者**。

#### Number

- 重写了`valueOf`，返回Number数值的原始数值；重写了`toString（）`，返回数字字符串，支持接受一个参数作为进制。
- `toFixed()`返回制定小数位的数值。不足则补0；超过则四舍五入。

- `Number.isInterger()`判断一个数是否能保存为整数

  ```js
  console.log(Number.isInteger(1)); // true
  console.log(Number.isInteger(1.00)); // true
  console.log(Number.isInteger(1.01)); // false
  ```

#### String

- `length`属性表示字符串中字符的数量。即使字符串中包含双字节字符（而不是单字节的ASII字符），也会按照单字符来计算。
- JavaScript的字符串由16位码元（code unit）组成。
  - 字符串中的`length`表示字符串中包含多少个16位码元。
  - 16位码元只能表示65535（0xFFFF）个字符，为了表示更多字符，Unicode采用一个策略，每个字符使用另外16位去选择一个**增补平面**。每个字符使用两个16码元的策略称为**代理对**策略。
- 某些Unicode字符可以有多种编码方式。字符看起来一样，但底层编码不同，为解决这个问题，Unicode提供了4种规范形式，可以将字符规范化为一致的格式：`NFD`、`NFC`、`NFKD`、`NFKC`。
  - `normalize()`方法接受这四个值作为参数，规范化字符串。或可以判断字符串是哪种规范格式。
- 字符串的一些方法
  - 码元方法 `charAt()` `charCodeAt()` `fromCharCode()` `codePointAt()` `fromCodePoint()`
  - 字符串操作方法 `concat()` `slice()` `substr()` `substring()`
  - 字符串位置方法 `indexOf()` `lastIndexOf()`
  - 字符串包含方法 `startsWith()` `endsWith()` `includes()`
  - 迭代器方法`[Symbol.iterator]()`
  - 大小写转化 `toLowerCase()` `toUpperCase()` `toLocaleLowerCase()` `toLocaleUpperCase()`
  - 字符串（正则）模式匹配方法 `match()` `search()` `replace()` `split()`
  - 其他方法 `trim()` `repeat()` `padStart()` `padEnd()`

### 单例内置对象

#### Global

- 它是一个兜底对象，针对的是不属于任何对象的属性和方法。

- 事实上，不存在全局变量和全局函数。在全局上下文中声明的变量和函数都会编程Global对象的属性。

- Global也和其他变量对象一样，无法直接在代码中访问到，但是后台在解析时都会用到它。

- Global对象内部有很多方法，如`isNaN()`、`isFinite()`、`parseInt()`、`parseFloat()`方法，我们在开发中可以直接使用，那么后台就会到Global上解析这些方法。

- Global对象内部有很多属性，包括一些特殊值如，`undefined`、`NaN`、`Infinity`；此外，所有原生引用类型的构造函数也都是它的属性，如`Function`、`Object`、`Array`、`Symbol`、`Error`等

- URI处理方法

  - `ecnodeURI()` `encodeURIComponent()`

    - `encodeURI()`不会编码属于URL 组件的特殊字符，比如冒号、斜杠、问号、
      井号
    - `encodeURIComponent()`会编码它发现的所有非标准字符。

    ```js
    let uri = "http://www.wrox.com/illegal value.js#start";
    // "http://www.wrox.com/illegal%20value.js#start"
    console.log(encodeURI(uri));
    // "http%3A%2F%2Fwww.wrox.com%2Fillegal%20value.js%23start"
    console.log(encodeURIComponent(uri));
    ```

  - `decodeURI()` `decodeURIComponent()`

    - `decodeURI()`只对使用`encodeURI()`编码过的字符解码。例如，%20 会被替换为空格，但%23 不会被替换为井号（#），因为井号不是由`encodeURI()`替换的。

    - `decodeURIComponent()`解码所有被`encodeURIComponent()`编码的字符，基本上就是解码所有特殊值。

      ```js
      let uri = "http%3A%2F%2Fwww.wrox.com%2Fillegal%20value.js%23start";
      // http%3A%2F%2Fwww.wrox.com%2Fillegal value.js%23start
      console.log(decodeURI(uri));
      // http:// www.wrox.com/illegal value.js#start
      console.log(decodeURIComponent(uri));
      ```

- `eval()` 这个方法就是一个EcmaScript解释器。

- 我们可以看出，Global对象其实是全局上下文关联的变量对象。浏览器中，**将window对象实现为Global对象的代理**。

#### Math

- Math对象上的方法比直接在JavaScript实现的快得多。因为使用了JavaScript引擎中更高效的实现和指令集。
- 一些方法：
  - 最大最小值： `max()` `min()`
  - 舍入方法：`ceil()` `floor()` `round()` `fround()`
  - 随机数：`random()` 从一组数据中获取一个随机数`number = Math.floor(Math.random() * total + first)`，选择区间就是`[first, total]`的整数

## 第六章 集合引用类型

### Object

- Object类型的实例没有多少功能，但适合存储和应用程序间交换数据
- 显示创建对象有两种方法`obj = new Object()`和对象字面量`obj = {}`
- Object 类型是一个基础类型，所有引用类型都从它继承了基本的行为

### Array

- 数组是有序的，数组大小是动态的，每个元素可以是任意类型

- 创建数组`new Array()`、省略new操作符`Array()`、数组字面量`[]`

- 修改length属性，可以添加或删除元素

  ```js
  // 创建一个包含3个字符串的数组
  let colors = ["red", "blue", "green"];
  colors.length = 4;
  console.log(colors[3]); // 添加一个undefined

  colors.length = 2; // 删除'green'和undefined

  // 末尾添加元素
  colors[colors.length] = "black"
  ```

- Array的方法：

  - 创建数组 `Array.from()`、`Array.of()`
  - 检测数组 `Array.isArray()`
  - 迭代器方法 `keys()` `values()` `entries()`
  - 复制和填充方法 `copyWithin()` `fill()`
  - 转换方法 `valueof()`、`toString()`、`toLocaleString()` `join()`
  - 栈和队列方法 `push()` `pop()` `shift()` `unshift()`
  - 排序方法 `reverse()` `sort()`
  - 操作方法 `concat()` `slice()` `splice()`
  - 搜索位置方法 `indexOf()` `lastIndexOf()` `includes()` `find()` `findIndex`
  - 迭代方法 `every()` `filter()` `forEach()` `map()` `some()`
  - 归并方法 `reduce()` `reduceRight()`

### Map

- Map和Object本质上相同，都是键值对的集合（Hash结构）。
- Object只能使用字符串或Symbol作为键，Map可以使用任意数据类型作为键，包括对象。
- 创建Map集合`new Map()`
- Map的属性和方法：`size` `set()` `get()` `has()` `delete()` `clear()`
- 用作键的对象以及其他集合类型，内部的属性发生改变时，Map的映射仍保持不变。
- Map与Object的一个主要差异是，Map内部会维护键值对的插入顺序，因此可以根据插入顺序执行迭代操作
- `entries()`方法可以获取Map的迭代器，或使用Map的`Symbol.iterator`属性获取迭代器
- `keys()` `values()`
- 键和值在迭代器遍历过程中可以修改；键如果是对象，键的对象属性修改不会影响内部的映射。

### 选择使用Object还是Map

对于大多数开发任务，使用Object还是Map，只是个人偏好问题，影响不大。

对于内存和性能开发者来说，Object和Map以下不同：

- 内存占用：Map比Object更省空间。给定大小的内存，Map大约可以比Object多存储50%的键值对。
- 插入性能：Map和Object插入性能相当。Map在所有浏览器中会稍微快一点。大量插入操作，Map性能更佳。
- 查找速度：大型Object和Map查找性能差距极小。少量键值对，Object有时更快。大量查找操作，某些情况下选Object更好。
- Object的`delete`操作性能不佳，无法合理使用隐藏类；Map的delete()比插入和查找更快。大量删除操作，推荐使用Map。

### WeakMap

- 是Map的兄弟类型，WeakMap的API是Map的子集。

- WeakMap的键只能是Object或继承自Object的类型。值可以是任意类型

- 原始值如果想做键，可以使用原始值包装类型包装成对象

  ```js
  // 原始值可以先包装成对象再用作键
  const stringKey = new String("key1");
  const wm3 = new WeakMap([
  	stringKey, "val1"
  ]);
  ```

- 方法是Map的子集：`set()` `get()` `has()` `delete()` 没有`clear()`方法
- weak指的是，JavaScript垃圾回收程序对待”弱映射“中**键**的方式；
  - 键是“弱弱地拿着”，意思是这些键不属于正式引用，不会阻止垃圾回收。
  - 值并不是**弱弱地拿着**，只要键存在，键值就存在于映射中，不会被回收
  - 键被垃圾回收，键值对映射就从WeakMap中消失了，成为空映射。值也会成为垃圾回收目标，之后被回收
- 不存在迭代器。因为WeakMap的键值对任何时候都可能被销毁。
- 因为不可迭代，所以不知道对象引用的情况下，无法获取其中的值。即便可以访问到WeakMap实例，也无法看到其中内容
- WeakMap只能用对象作为键，目的是保证只有通过键的对象引用才能获取值。如果使用原始值作为键，就没办法**区分**初始化时的字符串和初始化后使用的一个相等的字符串
- 应用：
  - 实现私有变量
  - DOM 节点元数据

### Set

- Set也是一种集合。Set 在很多方面都像是加强的Map，这是因为它们的大多数API 和行为都是共有的
- Set中元素可以是任意类型，Set的元素如果是对象或其他集合类型，在自己的内容或属性被修改时也不会改变
- 一些属性和方法 `size` `has()` `add()` `delete()` `clear()`
- `add()`和`delete()`操作是幂等的

- `keys()`或`values()`方法可以获取Map的迭代器，或使用Set的`Symbol.iterator`属性获取迭代器
- `entries()`返回包含两个元素的数组，这两个元素相等。`[ [a, a], [b, b] ]`
- 修改集合中值的属性不会影响其作为集合值的身份。
  - Set中的字符串原始值不会被修改
  - 修改对象的属性，对象中的属性会被修改，但对象仍然存在于集合中

### WeakSet

- 是Set的兄弟类型，WeakSet的API是Set的子集

- WeakSet中的值只能是Object 或者继承自Object 的类型

- 一些属性和方法：`has()` `add()` `delete()`

- weak指的是，JavaScript垃圾回收程序对待”弱集合“中**值**的方式

  - 这些值是“弱弱地拿着”的。意思就是，这些值不属于正式的引用，不会阻止垃圾回收

  - `add()`方法初始化了一个新对象，并将它用作一个值。因为没有指向这个对象的其他引用，所以当
    这行代码执行完成后，这个对象值就会被当作垃圾回收。然后，这个值就从弱集合中消失了，使其成为
    一个空集合。

    ```js
    const ws = new WeakSet();
    ws.add({}); // 执行完后会被垃圾回收
    ```

- 不存在迭代器

- WeakSet相比于WeakMap作用不大；不过弱集合在给对象打标签时还是有价值的

### 有哪些原生类型提供了默认迭代器

内置的原生类型实现迭代器的有：

- String

- Array
- TypedArray（定型数组）
- Map
- Set
- 函数的arguments对象
- NodeList等DOM 集合类型

## 第七章 迭代器与生成器

### 为什么会有迭代器模式

循环是迭代的基础，具有迭代的特点：知道执行迭代的次数、每次迭代执行相同的操作、迭代顺序固定。

迭代会在一个有序的集合上进行，数组是迭代集合上一个典型的例子。

迭代时可以通过递增索引获取每一项，但有问题：

- 迭代前需要事先知道如何使用数据结构。每次迭代需要先获取数组对象，然后通过索引取值，这种方式不适用于所有数据结构
- 遍历顺序不是数据结构固有的。通过递增索引适用于数组结构，但不适用于其它具有隐式顺序的结构。

也就是说开发者**需要事先单独记录索引，知道数据结构，然后通过循环执行迭代**。这种迭代只适用于数组。

数组的`forEach()`向迭代迈进了一步，这个方法解决了**单独记录索引**和**通过数组对象取值**的问题。但**无法标识何时迭代终止**

所以在有迭代器之前，执行迭代必须使用循环或其他辅助结构。

而迭代器模式，开发者**无需知道如何迭代就能实现迭代操作**。内部的迭代方式可能多种多样，除了默认的，开发者也可以自己实现。外部执行迭代全是相同的。

### 什么是迭代器模式

迭代器模式描述了一个方案，即把有些结构称为**可迭代对象（iterable）**，因为它们实现了**Iterable接口**，而且可以通过**迭代器Iterator**消费。

任何实现了Iterable接口的数据结构就是可迭代对象。可以被实现Iterator接口的结构（迭代器）消费。

每个迭代器都会关联一个可迭代对象，迭代器无需了解其关联的可迭代对象的结构，只需要知道如何取得连续的值。

这种概念上的分离，正式是Iterable和Iterator的强大之处，即迭代器模式的强大之处。

可迭代对象是一个抽象说法。

- 基本上，可以把可迭代对象理解成数组或集合这样的集合类型对象。

- 但不一定是集合对象，也可以仅仅是具有类似数组行为的其它数据结构。如

  ```js
  for (let i = 1; i <= 10; ++i) {
      console.log(i);
  }
  ```

### 什么是可迭代协议（Iterable）

实现Iterable接口需要两点：

- 支持迭代的自我识别
- 支持创建Iterator接口的对象，即支持创建迭代器（对象）

在EcmaScript中，可迭代对象上暴露一个属性Symbol.iterator，该属性是一个函数，即迭代器工厂函数。调用该函数必须返回一个新的迭代器（对象）。

### 什么是迭代器（Iterator）

迭代器是一种一次性使用的对象，用于迭代与其关联的可迭代对象。

迭代器API使用`next()`方法在可迭代对象中遍历数据。

每次成功调用`next()`，都会返回IteratorResult对象，该对象有两个属性：

- `done` 表示是否还可以再次调用next()取得下一个值
- `value` 包含可迭代对象的下一个值（done为false）或undefined（done为true）

迭代器的特点：

- 迭代器并不知道可迭代对象到底有多大，只要迭代器达到`done: true`，再调用`next()`就一直返回相同值`{done : true, value: undefined}`

- 每个迭代器都表示是可迭代对象的一次性的有序遍历。不同迭代器之间没有联系，只会独立遍历可迭代对象。
- 迭代器与可迭代对象是分离的。迭代器仅使用游标来记录遍历可迭代对象的历程。如果可迭代对象在迭代期间被修改了，那么迭代器也会反映相应的变化。
- 迭代器维护着一个指向可迭代对象的引用，因此迭代器会阻止垃圾回收程序回收可迭代对象

自定义迭代器：任何实现Iterator接口的对象，都可作为迭代器使用，很多内置类型就实现了Iterator接口。Iterator接口必须有`next()`方法，可选`return()`方法用于指定迭代器提前关闭时的执行逻辑。

下面实现了迭代器：

```js
// 可迭代对象，因为实现了Iterable接口
class Counter {
  constructor(limit) {
    this.limit = limit;
  }
  // 实现Iterable接口
  [Symbol.iterator]() {
    let count = 1,
      limit = this.limit;
    // 返回的对象实现了Iterator接口
    return {
      // Iterator接口必须实现的方法
      next() {
        if (count <= limit) {
          return { done: false, value: count++ };
        } else {
          return { done: true, value: undefined };
        }
      },
      // 可选
      return() {
        console.log('Exiting early');
        return { done: true };
      }
    };
  }
}
```

### 可接收可迭代对象的原生语言特性有哪些 即 迭代器的应用场合

一些场合下，原生语言结构会在后台调用提供的可迭代对象的迭代器工厂函数`[Symbol.iterator]()`，从而创建一个迭代器。

- `for-of` 循环
- 数组解构
- 扩展操作符
- `Array.from()`
- 创建集合Set
- 创建映射Map
- `Promise.all()`和`Promise.race()`都接收Promise组成的可迭代对象
- `yield*` 操作符，在生成器中使用

### 什么是生成器

生成器拥有在一个函数块内暂停和恢复代码执行的能力。

生成器影响深远，如使用生成器可自定义迭代器和实现协程。

生成器的形式是一个函数，函数名称前加一个星号`*`表示它是一个生成器函数。

- 标识生成器的星号不受两边空格的影响。
- 可以定义函数的地方，就可以定义生成器

调用生成器函数，会产生一个**生成器（对象）**：

- 生成器对象一开始处于暂停（suspended）的状态
- 生成器对象既实现了Iterable接口，也实现了Iterator接口；所以，**生成器对象既是可迭代对象，也是迭代器对象**。
- 生成器对象的默认迭代器是自引用的。
  - 因为生成器对象实现了Iterable接口，也实现了Iterator接口
  - 所以调用Iterable接口`[Symbol.iterator]()`返回的迭代器对象，是本身生成器对象。

生成器对象一开始处于暂停（suspended）的状态。调用`next()`方法，可以让生成器开始或恢复执行。

- 每次成功调用`next()`，都会返回IteratorResult对象，该对象有两个属性：
  - `done` 表示是否还可以再次调用next()取得下一个值
  - `value` 是生成器函数的返回值，默认`undefined`。
- 函数体为空的生成器函数中间不会停留，调用一次`next()`就会让生成器状态变成`done: true`
- 生成器函数只在初次调用`next()`方法后开始执行。因为调用生成器函数是返回生成器对象，生成器对象调用`next()`后才会开始迭代执行。

`yeild`关键字：

- `yield` 关键字可以让生成器停止和开始执行。
- 生成器函数在遇到yield关键字之前会正常执行。遇到这个关键字后，执行会停止，函数作用域的状态会被保留。停止执行的生成器函数的内部代码即可迭代对象只能通过在生成器对象上调用next()方法来恢复执行
- yield 关键字有点像函数的中间返回语句，它生成的值会出现在next()方法返回的对象里。通过yield 关键字退出的生成器函数会处在done: false 状态；通过return 关键字退出的生成器函数会处于done: true 状态。
- 生成器函数的内部执行流程针对每个生成器对象区分作用域。每个生成器对象是相互是独立的
- yield 关键字只能在生成器函数内部使用，且必须直接位于生成器函数定义中。
- 生成器对象作为可迭代对象。直接调用`next()`作用不大，可作为可迭代对象使用
- yield使用不限次数
- yield关键字可以作为函数的中间参数使用；暂停的生成器函数，会接收next()传递的第一个参数值
- 使用星号`*`增强yield行为，`yield*`能迭代一个可迭代对象；`yield*`实际上只是将一个可迭代对象序列化为一连串可以单独产出的值，所以这跟把yield放到一个循环里没什么不同
- yield*的值是关联迭代器返回done: true 时的value 属性。对于普通迭代器来说，这个值是undefined；对于生成器函数产生的迭代器来说，这个值就是生成器函数返回的值。

生成器适合作为默认迭代器。因为生成器对象实现了Iterable接口，调用生成器函数会产生迭代器。

提前终止迭代器：`return()`和`throw()`都会强制生成器进入关闭状态。

- `return()`方法，终止迭代器对象的值。
  - 与迭代器不同，生成器进入关闭状态的，就无法恢复了。后续调用`next()`会返回`done: true`的状态
  - `for-of`循环等内置语言结构，会忽略`done: true`的`IteratorResult`内部返回值
- `thrwo()`方法
  - 会在暂停的时候将一个提供的错误注入到生成器对象中。如果错误未被处理，生成器就会关闭。
  - 假如生成器函数内部处理了这个错误，那么生成器就不会关闭，而且还可以恢复执行，错误
    处理会跳过对应的yield。

### 说一说迭代器

说到迭代器，首先要说到可迭代对象，可迭代对象是一个可以由任意对象实现的接口，支持连续获取对象产出的每一个值。任何实现`Iterable`接口的对象都有一个`Symbol.iterator` 属性，这个属性引用默认迭代器工厂函数，调用之后会返回一个实现Iterator接口的对象，即迭代器对象。

迭代器是一种一次性使用的对象，用于迭代与其关联的可迭代对象。每个迭代器表示对可迭代对象的一次有序遍历，迭代器内部有一个指针指向可迭代对象，用做游标来记录遍历的历程。

迭代器中的`next()`方法可用来遍历可迭代对象，调用此方法会返回一个`IteratorResult`对象，这个对象包含一个`done`属性和一个`value`属性，`done`是一个布尔值，表示是否还有更多值可以访问；`value`包含迭代器返回的当前值。

可以通过反复调用`next()`方法来迭代可迭代对象。也可以通过原生语法来迭代可迭代对象，如`for-of` 循环、数组解构、`yield*`。

迭代器的作用就是：

- 一是为各种数据结构，提供一个统一的、简便的访问接口；
- 二是使得数据结构的成员有序；

### 说一说生成器

生成器是一种特殊的函数，函数名称前加一个星号`*`表示它是一个生成器函数。生成器有在函数内部暂停和恢复代码执行的能力。

生成器函数调用之后会返回一个生成器对象。

生成器对象上实现了`Iterable`接口，因此可用在任何消费可迭代对象的地方，如`for-of`循环、或者作为自实现可迭代对象的迭代器工厂函数。

生成器对象也实现了`Iterator`接口，因此生成器也是一个迭代器对象，也有`next()`方法。这个方法可以恢复生成器函数内部代码的执行。

每次成功调用`next()`，都会返回`IteratorResult`对象，这个对象包含一个`done`属性和一个`value`属性，`done`是一个布尔值，表示是否还有更多值可以访问；`value` 是生成器函数的返回值，或`yield`关键字产生的值。

`yield`关键字是生成器函数内部支持的关键字，这个关键字能暂停生成器函数的执行。使用`yield`关键字还可以通过`next()`方法接收输入和产生输出。

`yield`后加星号`*`即`yield*`可以用来消费可迭代对象，也就可以用来组合处理迭代器和其它生成器。

生成器的关键在于，既可以暂停和恢复函数内部的执行，还可以向函数内输入数据和函数体外输出数据。这就为异步编程提供了一种新的解决方法，这也就有了之后的`async/await`异步编程。

## 第八章 对象、类与面向对象编程

### 什么是对象

对象是一组属性的无序集合。本质就是一张Hash表。

对象的每个属性和方法都用一个名称来标识，这个名称再映射到一个值。

### 什么是对象的属性描述符

属性描述符是一些内部特性，用来描述属性的特征。这些特性外部无法访问到，用中括号加特性的名称标识，如`[[Enumerable]]`。

对象的属性分为两种：数据属性和访问器属性。

**数据属性**

数据属性有4个属性描述符

- `[[Configurable]]` 默认为`true`。表示属性是否可以通过`delete`删除并重新定义、是否可以修改它的其它属性描述符、是否可以改为访问器属性。一旦设置成`false`，对应的属性不能再做任何修改。
- `[[Enumerable]]` 默认`true`。表示属性是否可以通过`for-in`循环返回
- `[[Writable]]` 默认`true`。表示属性的值是否可以被修改
- `[[Value]]` 默认`undefined`。 包含属性实际的值，值会从这个位置读取，也会写入这个位置。

对象中创建的属性默认是数据属性，即创建属性时候，JavaScript引擎默认就会设置数据属性的4个属性描述符。

**访问器属性**

访问器属性不包含数据值。但包含一个获取（getter）函数和一个设置（setter）函数，但都是非必须的。

访问器属性有4个属性描述符

- `[[Configurable]]` 同上。
- `[[Enumerable]]` 同上。
- `[[Get]]` 获取（getter）函数，在读取属性时调用。非必须，默认为`undefined`
- `[[Set]]` 设置（setter）函数。在设置属性时调用。非必须，默认为`undefined`

访问器属性的典型应用场景：设置一个值会有其它副作用，即设置一个值会导致一些其它的变化。

### 对象的属性描述符方法

**`Object.defineProperty()`**

- 在一个对象上定义或修改一个属性的属性描述符

- 方法接收三个参数：要给其添加或修改属性的对象、属性的描述和一个属性描述符对象。属性描述符对象包含`configurable`、`enumerable`、`writable` 和`value`，跟相关属性描述符一一对应。根据要修改的特征，可以设置其中一个或多个值。
- `configurable`设置成`false`，即描述符`[[Configurable]]`设置成`false`，对应的属性不能再做任何修改。
- 调用此方法设置属性，第三个参数不指定`configurable`、`enumerable`、`writable`，默认情况下都是`false`。
- **一般不需要调用此方法，但是要理解理解JavaScript对象，就要理解这些概念。**

**`Object.defineProperties()`**

- 在一个对象上同时定义多个属性，并分别定义它们的属性描述符。
- 方法接收两个参数：要给其添加或修改属性的对象和多个描述符对象组成的对象。
- 和`Object.defineProperty()`作用相同，唯一区别是这个方法可以同时定义多个属性。

**`Object.getOwnPropertyDescriptor()`**

- 作用：获取实例对象中指定属性的属性描述符。
- 方法接收两个参数：属性所在的对象和要取得其描述符的属性名。
  - 返回值是一个对象，对于访问器属性包含configurable、enumerable、get 和set 属性
  - 对于数据属性包含configurable、enumerable、writable 和value 属性

**`Object.getOwnPropertyDescriptors()`**

- 获取实例对象上所有属性的属性描述符。
- 这个方法实际上会在每个自有属性上调用`Object.getOwnPropertyDescriptor()`并在一个新对象中返回它们

### 对象的其它方法

#### 合并对象

**`Object.assign()`**

- 方法接收：一个目标对象和一个或多个源对象

- 将源对象上可枚举且自有属性复制到目标对象上。包括：字符串和Symbol为键的属性

- 相同属性名会被最后一个源对象上的覆盖

- **该方法是浅拷贝，如果属性是对象，只会复制对象的引用。**

- 不能在两个对象间转移获取函数和设置函数。对每个符合条件的属性，这个方法会使用源对象上的`[[Get]]`取得属性的值，然后使用目标对象上的`[[Set]]`设置属性的值。

  ```js
  let dest, src, result;

  /**
  * 获取函数与设置函数
  */
  dest = {
    set a(val) {
      console.log(`Invoked dest setter with param ${val}`);
    }
  };
  src = {
    get a() {
      console.log('Invoked src getter');
      return 'foo';
    }
  };
  Object.assign(dest, src);
  // 调用src 的获取方法
  // 调用dest 的设置方法并传入参数"foo"
  // 因为这里的设置函数不执行赋值操作
  // 所以实际上并没有把值转移过来
  console.log(dest); // { set a(val) {...} }
  ```

- 如果中间出错，可能会复制部分内容，不会回滚。它是一个尽力而为、可能只会完成部分复制的方法

#### 相等判断

**Object.is()**

- 判断两个值是否是全等。
- 与全等操作符 === 相似，但同时考虑了一些边界情况： -0、+0、0、NaN在`===`操作符下认为是不相等的。但`Object.is()`认为相等。

### 创建对象的方法

**方法1** 操作符new加上Object构造函数

Object构造函数，创建后再添加属性

```js
let person = new Object();
person.name = "ccbean";
person.age = 29;
person.job = "Software Engineer";
person.sayName = function () {
  console.log(this.name);
};
```

**方法二** 对象字面量

```js
let person = {
  name: "ccbean",
  age: 29,
  job: "Software Engineer",
  sayName() {
    console.log(this.name);
  }
};
```

缺点：具有同样接口的多个对象，要编写很多重复代码

**方法三** 工厂模式

```js
function createPerson(name, age, job) {
  let o = new Object();
  o.name = name;
  o.age = age;
  o.job = job;
  o.sayName = function () {
    console.log(this.name);
  };
  return o;
}
let person1 = createPerson("ccbean", 29, "Software Engineer");
let person2 = createPerson("tom", 27, "Doctor");
```

解决了创建多个类似对象重复代码问题。

缺点：新创建对象的标识问题，即新创建的对象是什么类型。

**方法四** 构造函数模式

自定义构造函数，以函数的形式为自己的对象类型定义属性和方法。

```js
function Person(name, age, job) {
  this.name = name;
  this.age = age;
  this.job = job;
  this.sayName = function () {
    console.log(this.name);
  };
}
let person1 = new Person("ccbean", 29, "Software Engineer");
let person2 = new Person("tom", 27, "Doctor");
person1.sayName();
person2.sayName();
```

person1和person2 分别保存着Person 的不同实例。这两个对象都有一个constructor 属性指向Person。

**对象的`constructor`用于标识对象的类型，实际上这个constructor属性实际在构造函数的原型对象prototype上。**不过一般用`instanceof`操作符来确定对象的类型。

与工厂模式的区别：

- 函数名首字母大写

- 没有显示地创建对象
- 属性和方法直接赋值给了`this`
- 没有`return`

相比于工厂模式，优点在于能够确定实例被标识为特定类型。

缺点是：不同实例上的方法同名但不相等。也就是相同逻辑的方法重复定义。

**方法五** 原型模式

函数上有一个属性`prototype`，这个属性是一个对象，是通过构造函数创建的对象的原型。

这个对象包含了特定引用类型的实例（构造函数的实例）共享的属性和方法。

原来在构造函数中赋值给对象实例的值，可以直接赋值给它们的原型。

```js
Person.prototype.name = "ccbean";
Person.prototype.age = 29;
Person.prototype.job = "Software Engineer";
Person.prototype.sayName = function () {
  console.log(this.name);
};

let person1 = new Person();
person1.sayName();
let person2 = new Person();
person2.sayName();
console.log(person1.sayName == person2.sayName); // true
```

解决了相同逻辑的方法重复定义的问题。也就是，原型上定义属性和方法是由所有的实例共享的。

缺点：弱化了向构造函数传递参数的能力；原型对象上的所有属性和方法都是共享的，没有单独属于实例上的属性和方法。

所以这也是开发中通常不单独使用原型模式的原因。而是使用原型模式加继承。

### 调用构造函数时，内部执行的流程

- 首先，会在内存中创建一个新对象

- 新对象内部的特性`[[Prototype]]`被赋值为构造函数的`prototype`属性。通过`__proto__`访问到原型
- 构造函数内部的`this`指向这个新对象。
- 执行构造函数内部的代码（给新对象添加属性）
- 如果构造函数返回非空对象，则返回该对象；否则，返回刚创建的新对象。

### 什么是原型

无论何时，只要创建一个函数，就会按照特定的规则为这个函数创建一个`prototype`属性，指向原型对象。

原型对象包含这个函数当做构造函数调用时，实例化出来的对象的原型。

原型上包含的属性和方法可以被实例化对象共享。

在自定义构造函数时，原型对象上只会自动有一个`constructor`属性，指回与之关联的构造函数。其它的所有方法都继承自Object的原型对象即`Object.prototype`。然后构造函数会添加自己的其它属性和方法。（Object原型的原型指向null，即`Object.prototype.__proto__ === null`）

每次调用一个构造函数创建新实例，这个实例内部的`[[Prototype]]`特性就会指向构造函数的原型对象。无法直接访问到这个属性，但是在Node和一些浏览器中（Firefox、Safari 、Chrome）可以通过`__proto__`访问到对象的原型。

构造函数和原型之间有直接联系，即构造函数通过prototype 属性链接到原型对象。实例和构造函数的原型之间有直接联系，但实例和构造函数之间没有。

构造函数、原型对象和实例对象，是三个完全不同的对象：

- 构造函数中有属性`prototype`指向与之关联的原型对象
- 原型对象上有属性`constructor`指向与之关联的构造函数
- 实例对象上有`[[Prototype]]`指向与构造函数关联的原型对象

![红皮书-原型](https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/JavaScript/红皮书-原型.drawio.svg)

上图展示了`Person`构造函数、`Person`的原型对象和`Person`现有两个实例之间的关系。

- `Person.prototype`指向原型对象，而`Person.prototype.contructor`指回`Person`构造函数。
- 原型对象包含`constructor`属性和其他后来添加的属性。
- `Person`的两个实例`person1`和`person2`都只有一个内部属性`[[Prototype]]`指回`Person.prototype`，而且两者都与构造函数没有直接联系。

### instanceof操作符的本质

**操作符`instanceof`的本质是检查实例的原型链中是否包含指定构造函数的原型。**

```js
console.log(instance instanceof Object); // true
console.log(instance instanceof SuperType); // true
console.log(instance instanceof SubType); // true
```

### 对象的原型相关方法

**`Object.isPrototypeOf()`**

- 方法接收：一个对象作为参数。

- 作用：确定原型和实例的关系。也就是确定两个对象的关系。

- 本质上，`isPrototypeOf()`会在传入对象的`[[Prototype]]`（传入对象的原型）指向调用它的对象时返回`true`。只要调用对象的原型链中包含这个原型，这个方法就返回true。

  ```js
  // 传入对象person1的原型是否是Person构造函数关联的原型
  console.log(Person.prototype.isPrototypeOf(person1)); // true
  console.log(Person.prototype.isPrototypeOf(person2)); // true
  ```

**`Object.getPrototypeOf()`**

- 方法接收：一个对象作为参数。

- 作用：返回（获取）传入参数的内部特性`[[Prototype]]`的值，即返回传入对象的原型。

  ```js
  console.log(Object.getPrototypeOf(person1) == Person.prototype); // true
  console.log(Object.getPrototypeOf(person1).name); // "Ccbean"
  ```

**`Object.setPrototypeOf()`**

- 方法接收：一个对象作为参数。

- 作用：向实例的内部特性`[[Prototype]]`写入一个新值，即改变（重写）对象的原型。
- 不推荐使用，`Object.setPrototypeOf()`可能会严重影响代码性能。推荐使用`Object.create()`

**`Object.create()`**

- 方法可接收两个参数：
  - 作为新对象原型的对象、给新对象定义属性描述符的对象
  - 与`Object.defineProperties()`的第二个参数一样。每个新增属性都通过各自的描述符来描述，以这种方式添加的属性会遮蔽原型对象上的同名属性。

- 作用：创建一个新对象，同时使用传入的参数对象作为新对象的原型。即创建新对象，并指定其原型为传入对象。

  ```js
  let person = {
    name: "Nicholas",
    friends: ["Shelby", "Court", "Van"]
  };
  let anotherPerson = Object.create(person, {
    name: {
      value: "Greg"
    }
  });

  console.log(person.name); // Matt
  console.log(Object.getPrototypeOf(anotherPerson) === person); // true
  console.log(anotherPerson.name); // Greg
  console.log(anotherPerson.friends); // "Shelby,Court,Van"
  ```

### 多个对象实例间共享属性和方法的原理是什么

在通过对象访问属性时，会按照这个属性的名称开始搜索。

搜索首先会从这个对象实例上开始查找，如果在这个实例上找到了这个属性，那么就会返回这个属性名对应的值。

如果没有找到，搜索会沿着`[[Prototype]]`指针进入原型对象进行查找，然后在原型对象上找到对应属性后，再返回对应的值。

### 对象上属性的遮蔽特性

通过读取原型上的值来共享属性和方法，但是不能通过实例重写这些值。

只要在对象上添加一个属性，那么这个属性就会**遮蔽**（shadow）原型上的同名属性，也就是说虽然不会修改它，但会屏蔽对它的访问。

因为在标识符解析过程中，当找到对应属性后，会直接返回这个属性的值，不再继续搜索。

可以通过操作符`delete`删除实例上的属性，恢复标识符解析过程能够继续搜索到实例对象的原型上。

### 对象的属性相关方法

**`Object.hasOwnProperty()`**

- 方法接收一个参数：一个属性名

- 作用：用于确定某个属性是否是在实例上。属性可能不在实例上，而在原型上；或既不在实例上，也不在原型上

  ```js
  console.log(person1.hasOwnProperty("name")); // true
  ```

**`Object.keys()`**

- 方法接收一个对象作为参数
- 作用：返回该对象上所有可枚举的实例属性名的字符串数组。

```js
function Person() { }
Person.prototype.name = "Ccbean";
Person.prototype.age = 29;
Person.prototype.job = "Software Engineer";
Person.prototype.sayName = function () {
  console.log(this.name);
};
let keys = Object.keys(Person.prototype);
console.log(keys); // "name,age,job,sayName"
let p1 = new Person();
p1.name = "Rob";
p1.age = 31;
let p1keys = Object.keys(p1);
console.log(p1keys); // "[name,age]"
```

**`Object.getOwnPropertyNames()`**

- 方法接收一个对象作为参数

- 作用：返回对象上的所有实例属性名的字符串数组，无论是否可枚举。

  ```js
  let keys = Object.getOwnPropertyNames(Person.prototype);
  console.log(keys); // "[constructor,name,age,job,sayName]"
  ```

  返回的结果中包含了一个不可枚举的属性constructor

**`Object.getOwnPropertySymbols()`**

- 方法接收一个对象作为参数

- 作用：返回对象上的Symbol属性名的数组

  ```js
  let k1 = Symbol('k1'), k2 = Symbol('k2');
  let o = {
    [k1]: 'k1',
    [k2]: 'k2'
  };

  console.log(Object.getOwnPropertySymbols(o)); // [Symbol(k1), Symbol(k2)]
  ```

`for-in`循环、`Object.keys()`、`Object.getOwnPropertyNames()`、`Object.getOwnPropertySymbols()`以及`Object.assign()`在**属性枚举顺序**方面有很大区别。

`for-in`循环和`Object.keys()`的枚举顺序是不确定的，取决于JavaScript 引擎，可能因浏览器而异。

`Object.getOwnPropertyNames()`、`Object.getOwnPropertySymbols()`和`Object.assign()`的枚举顺序是确定性的。先以升序枚举数值键，然后以插入顺序枚举字符串和符号键。在对象字面量中定义的键以它们逗号分隔的顺序插入。

```js
let k1 = Symbol('k1'),
  k2 = Symbol('k2');
let o = {
  1: 1,
  first: 'first',
  [k1]: 'sym2',
  second: 'second',
  0: 0
};
o[k2] = 'sym2';
o[3] = 3;
o.third = 'third';
o[2] = 2;
console.log(Object.getOwnPropertyNames(o));
// ["0", "1", "2", "3", "first", "second", "third"]
console.log(Object.getOwnPropertySymbols(o));
// [Symbol(k1), Symbol(k2)]
```

**Object.entries()**

**Object.values()**

### in操作符

`in`操作符有两种使用方法：

- 单独使用：无论属性在对象实例上还是原型上，都会返回true

  ```js
  console.log("name" in person1); // true
  ```

- 在`for-in`循环中使用：返回实例对象和实例对象的原型对象上可以被枚举的所有属性的属性名。

**确定某个属性是否位于原型上的方法**：

```js
function hasPrototypeProperty (obj, name) {
  return !obj.hasOwnProperty(name) && (name in obj);
}
```

### 原型上添加属性方法和重写原型

**方法一 原型对象上添加属性和方法**

```js
function Person() { }
Person.prototype.name = "ccbean";
Person.prototype.age = 29;
Person.prototype.job = "Software Engineer";
Person.prototype.sayName = function () {
  console.log(this.name);
};
```

开发中，常常见到此种写法。

**方法二 重写原型对象**

不推荐使用，一是可能需要手动维护`constructor`属性的指向；更关键的是会破坏原型链。

```js
function Person() { }
Person.prototype = {
  name: "ccbean",
  age: 29,
  job: "Software Engineer",
  sayName() {
    console.log(this.name);
  }
};

let friend = new Person();
console.log(friend instanceof Object); // true
console.log(friend instanceof Person); // true

console.log(friend.constructor == Person); // false
console.log(friend.constructor == Object); // true
```

这种写法减少代码冗余，也从视觉上更好地封装原型功能。

`Person.prototype`被设置为一个新的对象。但是，这个新原型对象中的`constructor`属性不再指向`Person`。在创建函数时，也会创建`prototype`属性指向原型对象，同时给原型对象自动添加`constructor`属性，指向构造函数。这种写法重写了原型对象，此时，`constructor`属性指向了Object构造函数。

此时通过操作符`instanceof`仍然可以正确返回结果，因为实例对象和原型之间关系不受影响。但**切断了最初原型和构造函数之间的关系**，详见下面分析。

解决办法：新重写的原型上手动修改`constructor`属性，指向原构造函数。

```js
function Person() {
}
Person.prototype = {
  constructor: Person, // 手动添加关联
  name: "ccbean",
  age: 29,
  job: "Software Engineer",
  sayName() {
    console.log(this.name);
  }
};
```

上述存在一个问题，添加的`constructor`属性是可枚举的，可以通过`Object.defineProperty`来定义此属性：

```js
function Person() { }
Person.prototype = {
  name: "ccbean",
  age: 29,
  job: "Software Engineer",
  sayName() {
    console.log(this.name);
  }
};
// 恢复constructor 属性
Object.defineProperty(Person.prototype, "constructor", {
  enumerable: false,
  value: Person
});
```

重写原型对象的另一个问题，**切断了最初原型和构造函数之间的联系**

```js
function Person() { }
let friend1 = new Person();
Person.prototype = {
  constructor: Person,
  name: "ccbean",
  age: 29,
  job: "Software Engineer",
  sayName() {
    console.log(this.name);
  }
};
friend1.sayName(); // 错误

let friend2 = new Person();
friend2.sayName(); // 正确
```

重写构造函数上的原型之后再创建的实例才会引用新的原型。而在此之前创建的实例仍然会引用最初的原型。

`friend1`实例是在重写原型之前实例化的，所以`friend1`实例的`[[Prototype]]`原型对象指向的还是原来的原型，而不是新的原型。

`friend2`实例是在重写原型之后实例化的，所以`friend2`实例的`[[Prototype]]`原型对象指向的是新的原型，所以有`sayName()`方法。

### 什么是原型链

原型链是EcmaScript的主要继承方式。基本思想就是通过原型继承多个引用类型的属性和方法。

构造函数、原型和实例是三个完全不同的对象，它们之间的关系是，每个构造函数都有一个属性`prototype`指向原型，原型上有一个属性`constructor`指回构造函数，而实例内部有一个指针`[[Prototype]]`指回原型。

原型链的基本思想是：一个构造函数的原型是另一个引用类型的实例，那么原型内部也就有内部指针`[[Prototype]]`指向另一个原型。另一个原型也有一个指针`constructor`指向另一个构造函数。这样就形成了实例和另一个原型之间构造了一条原型链。

在读取实例上的属性时，首先会在实例对象上搜索，如果没有找到，就会搜索实例的原型，通过原型链，搜索就可以继续向上，搜索原型的原型，搜索会一直持续到原型链末端（Object的原型），直至找到属性。一旦找到，就会立即停止，不再搜索未搜索的原型链部分，这也就有了遮蔽特性。

默认情况下所有对象都继承自Object，这也是通过原型链实现的。任何函数的默认原型都是一个Object实例，也就是说这个Object实例中也有一个指针`[[Prototype]]`指向Object的原型`Object.prototype`。

代码理解：

```js
function Parent () {
  this.parentValue = 'parent';
}
Parent.prototype.getParentValue = function () {
  return this.parentValue;
}

function Son () {
  this.sonValue = 'son';
}
Son.prototype = new Parent();
Son.prototype.getSonValue = function () {
  return this.sonValue;
}

let sonInstance = new Son();
console.log(sonInstance.getParentValue()) // parent
console.log(sonInstance.getSonValue()) // son
```

上面代码就是通过原型链实现继承，关键在于`Son`没有使用默认原型，而是将其替换成一个新的对象。这个新的对象正好是`Parent`的实例。这样，`Son`就实现了能从`Parent`的实例中继承属性和方法，同时能够与`Parent`的原型产生联系。

最终，`sonInstance`实例能通过`[[Prototype]]`指针找到`Son.prototype`，而`Son.prototype`又指向`Parent`实例。Parent实例的`[[Prototype]]`指针又指向`Parent`的原型`Parent.prototype`。

需要注意的是：

- `Son.prototype`是`Parent`的实例，而`parentValue`是Parent的实例属性，因此`parentValue`在它上面。而`getParentValue()`是一个原型方法，在`Parent`的上
- `Son.prototype.constructor`指向`Parent`构造函数。因为`Son.prototype`被重写后，新原型中没有`constructor`属性；根据原型链查找，Son的原型是Parent实例，其中的`[[Prototype]]`指针，指向了Parent的原型`Parent.prototype`，而`Parent.prototype`对象中的`constructor`属性指向Parent构造函数。

![红皮书-原型链](https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/JavaScript/红皮书-原型链.drawio.svg)

### JS中实现继承的方法

**方法1** 原型链继承

```js
function Parent () {
  this.colors = ['red', 'blue', 'green'];
}

function Son () {
  this.sonValue = 'son';
}
Son.prototype = new Parent();

// 实例化Son无法给Parent传参
let instance1 = new Son();
let instance2 = new Son();

instance1.colors.push('black');
// 实力属性成为另一个对象的原型属性，出现了共享
console.log(instance1.colors); // "red,blue,green,black"
console.log(instance2.colors); // "red,blue,green,black"
```

原型链继承的问题：

- 一个实例作为另一个构造函数的原型，那么这个实例上的属性会变成另一个对象的原型上的属性。

- 子类型实例化时无法给父类型的构造函数传参。

所以原型链继承一般不会单独使用。

**方法二** 盗用构造函数

在子类构造函数中，调用父类构造函数。

因为函数就是在特定上下文中执行代码的简单对象，所以可以利用`apply()`或`call()`方法以新创建的对象为上下文执行构造函数。

```js
function Parent (name) {
  this.name = name;
  this.colors = ['red', 'blue', 'green'];
}
Parent.prototype.sayName = function () {
  return this.name;
}

function Son () {
  Parent.call(this, 'tom');
}

let instance1 = new Son();
let instance2 = new Son();

instance1.colors.push("black");

console.log(instance1.colors); // "red,blue,green,black"
console.log(instance2.colors); // "red,blue,green"
// 子类不能访问父类原型上定义方法
console.log(instance1.sayName); // undefined
```

优点是：可以在子类构造函数中，向父类构造函数传参

缺点是：

- 不同实例上的方法同名但不相等，也就是相同逻辑的方法重复定义。（与构造函数模式有相同的问题）
- 子类不能访问父类原型上定义方法。因为子类的原型还是指向自己原生的对象原型。

**方法三** 组合继承

综合原型链和盗用构造函数。

```js
function Parent(name) {
  this.name = name
  this.colors = ['red', 'blue', 'green'];
}
Parent.prototype.sayName = function () {
  return this.name;
}

function Son(name, age) {
  // 先继承
  Parent.call(this, name); // 第二次调用父构造函数 实例化时（new Son()）执行到此处
  this.age = age;
}
Son.prototype = new Parent(); // 第一次调用父构造函数
Son.prototype.sayAge = function () {
  return this.age;
}

let instance1 = new Son("jack", 29);
instance1.colors.push("black");
console.log(instance1.colors); // "red,blue,green,black"
instance1.sayName(); // "jack";
instance1.sayAge(); // 29
let instance2 = new Son("tom", 27);
console.log(instance2.colors); // "red,blue,green"
instance2.sayName(); // "tom";
instance2.sayAge(); // 27
```

组合继承弥补了原型链和盗用构造函数的不足，是JavaScript 中使用最多的继承模式。而且组合继承也保留了`instanceof`操作符和`isPrototypeOf()`方法识别合成对象的能力。

不过，上面的代码，父构造函数始终会被调用两次。

- 第一次是重写`Son`的原型时，会将Parent的实例属性`name`、`colors`作为Son的原型属性
- 第二次是Son在实例化时，这时也会在新创建的实例对象上添加属性`name`、`colors`，遮蔽原型上的同名属性。

缺点：

- 存在效率问题，父构造函数始终会被调用两次。

- 使用父类构造函数的实例作为子类的原型。
  - 导致父类构造函数中的实例属性作为子类的原型属性。
  - 子类实例化时实例对象上会再创建同名属性遮蔽它。

**方法四** 原型式继承

使用`Object.create()`方法实现继承，这个方法的作用就是创建新对象，并指定其原型为传入对象。

```js
let person = {
  name: "Nicholas",
  friends: ["Shelby", "Court", "Van"]
};

let anotherPerson = Object.create(person, {
  name: {
    value: "Greg"
  }
});
anotherPerson.friends.push("Rob");

console.log(person.name); // Matt
console.log(Object.getPrototypeOf(anotherPerson) === person); // true
console.log(anotherPerson.name); // Greg

let yetAnotherPerson = Object.create(person);
yetAnotherPerson.name = "Linda";
yetAnotherPerson.friends.push("Barbie");
console.log(person.friends); // "Shelby,Court,Van,Rob,Barbie"
```

适用的场景是主要关注实例对象，不需要单独创建构造函数，就可以通过原型实现继承。

**方法五** 寄生式继承

创建一个实现继承的函数，以某种方式增强对象，然后返回这个对象。

```js
function createPerson(original) {
  let clone = Object.create(original); // 通过调用函数创建一个新对象
  clone.sayHi = function () { // 以某种方式增强这个对象
    console.log("hi");
  };
  return clone; // 返回这个对象
}

let person = {
  name: "ccbean",
  friends: ["Shelby", "Court", "Van"]
};
let anotherPerson = createPerson(person);
anotherPerson.sayHi(); // "hi"
```

类似于原型式继承，只是做了继承部分的封装。

同样适用的场景是主要关注实例对象，而不在乎类型和构造函数的场景。

缺点：通过寄生式继承给对象添加函数会导致函数难以重用，与构造函数模式类似。

**方法六** 寄生式组合继承

**此方法是引用类型继承的最佳模式**

使用父类原型的副本作为子类原型，再通过盗用构造函数继承实例属性，

```js
function Parent(name) {
  this.name = name
  this.colors = ['red', 'blue', 'green'];
}
Parent.prototype.sayName = function () {
  return this.name;
}

function Son(name, age) {
  Parent.call(this, name); // 父构造函数只调用一次
  this.age = age;
}
Son.prototype = Object.create(Parent.prototype);
Son.prototype.constructor = Son;
Son.prototype.sayAge = function () {
  return this.age;
}

let instance1 = new Son("jack", 29);
instance1.colors.push("black");
console.log(instance1.colors); // "red,blue,green,black"
instance1.sayName(); // "jack";
instance1.sayAge(); // 29

let instance2 = new Son("tom", 27);
console.log(instance2.colors); // "red,blue,green"
instance2.sayName(); // "tom";
instance2.sayAge(); // 27
```

优点：父构造函数只调用一次，这样可以避免将父类构造函数中的实例属性作为子类的原型属性。

### 组合继承和寄生式组合继承的区别

区别在于子类原型的不同：

- 组合继承使用父类构造函数的实例作为子类的原型。
- 寄生式组合继承使用父类原型的副本实例作为子类的原型。

这样可以避免组合继承的问题：将父类构造函数中的实例属性作为子类的原型属性；

两者都会结合盗用构造函数，将父类构造函数中的实例属性，复制到子类的实例属性中。

总结：差别只在子类原型赋值的时候：一个使用父类构造函数的实例；另一个使用父类原型的副本实例。

## class类

### class的本质是什么

ES6 的类都仅仅是封装了ES5构造函数和原型继承的语法糖而已。

```js
// 类声明
class Person {}
// 类表达式
const Animal = class {};
```

类表达式的类名称是可选的。在把类表达式赋值给变量后，可以通过name 属性取得类表达式的名称字符串。但不能在类表达式作用域外部访问这个标识符。

```js

let Person = class PersonName {
  identify() {
    console.log(Person.name, PersonName.name);
  }
}
let p = new Person();
p.identify(); // PersonName PersonName
console.log(Person.name); // PersonName
// 不能在类的外部访问到
console.log(PersonName); // ReferenceError: PersonName is not defined
```

### 类和函数构造函数的相同点和不同点

类和函数构造函数一样，本质上也是函数，只是一个特殊函数。所以有以下相同特点：

- 声明一个类，`typeof`操作符会返回`"function"`
- 类中也有标识符`prototype`，指向它的原型。而原型对象上也有`constructor`属性指向类本身。
- 和函数构造函数相同，可以用`instanceof`检测实例的原型链中是否包含构造函数的原型。
- 类可以作为参数传递和返回
- 类也可以被立即调用，和`IIFE`同理。
- 类中定义的方法（普通方法、getter、setter），会被添加为类的原型`prototype`上。即类中定义的方法会当做类的原型方法。
- 类上的静态方法，会直接添加到类的对象上，即类是特殊函数，本身也是一个对象。
- 构造函数内部定义的属性和方法，会作为类的实例方法

不同的是：

- 函数定义存在提升；类定义不存在提升；
- 函数是函数作用域的；类是块作用域的；
- 类构造函数必须使用`new`操作符，否则报错。函数构造函数如果不使用`new`调用，`this`就会指向全局上下文。

- 默认情况下，类中的代码都是在严格模式下执行的；函数是非严格模式下的；

### 类中的方法

类中的方法都不是必须的，可以有的方法有：

- 构造函数方法
- 实例方法
- `setter`方法
- `getter`方法
- 静态方法

实例方法和静态方法支持迭代器和生成器方法。

#### 构造函数方法

- `constructor`用于在类中定义构造函数。

- 方法名`constructor`会告诉解释器在使用`new`操作符创建类的新实例时，应该调用这个函数。

- 构造函数不定义时，相当于默认将构造函数定义为空函数。

- 构造函数实例化流程，和函数构造函数相同。

- 类构造函数`constructor`没有特别之处，只是在`new`实例化时，默认调用的方法。所以实例化后，仍然可以在实例上调用此方法。

  ```js
  class Person {}
  // 使用类创建一个新实例
  let p1 = new Person();
  p1.constructor();
  // TypeError: Class constructor Person cannot be invoked without 'new'
  // 使用对类构造函数的引用创建一个新实例
  let p2 = new p1.constructor();
  ```

#### 实例、原型和类成员

**实例成员**

- 类构造函数`constructor`内部，可以给类的实例添加实例属性；创建实例后，可以继续给实例添加属性；就相当于在函数构造函数中添加给`this`的属性。

**原型方法**

- 类中定义的普通方法、getter、setter会添加到类的原型上，即被当做类的原型方法。
- 类块中不能定义原始值或对象
- 类中的方法名等同于对象属性，能使用：字符串、Symbol、计算的值

### 静态方法

- 类上的静态方法，会直接添加到类的对象上，即类是特殊函数，本身也是一个对象。也就是说可以通过`static`在类上添加属性和方法。

### class类的继承

- 使用`extends`关键字实现继承

- `super`关键字可以引用父类的原型。仅限于子类中使用，而且仅仅限于类构造函数、实例方法、静态方法三种方法的内部。

  - `super` 只能在子类构造函数、实例方法和静态方法中使用。
  - 子类中使用`super()`可以调用父类构造函数。`super()`相当于`super.constructor()`的简写。
  - 不能单独引用`super`关键字，要么用它调用构造函数、静态方法或实例方法
  - 调用`super()`会调用父类构造函数，并将返回的实例赋值给`this`

  - `super()`的行为如同调用构造函数，可以通过它给父类构造函数传参
  - 如果子类没有定义构造函数，在实例化子类时，会自动调用`super()`，而且会传入所有传给子类的参数给父类构造函数。
  - 在类构造函数中，不能在调用`super()`之前引用`this`
  - 子类中显式定义了构造函数，那么必须调用super()；或者返回一个对象，很少这样用

- `new.target`是一个指针，指向通过`new`关键字调用的类或函数。

## 第九章 代理与反射

### 什么是代理

- 代理是目标对象的抽象。代理用作目标对象的替身，完全独立于目标对象。目标对象既可以独立操作，也可以通过代理操作。

- 创建代理使用`Proxy`构造函数。这个构造函数接收两个参数：目标对象和处理程序对象。

  - 处理程序对象中不添加任何捕获器可创建空代理，所有操作都会无障碍传播到目标对象，什么额外的操作也不做。

- 代理对象上执行的任何操作都会应用到目标对象；唯一可感知的不同就是代码中操作的是代理对象，但**本质上是通过代理对象作用到了目标对象**。

  ```js
  const target = {
    id: 'target'
  };
  const handler = {};
  const proxy = new Proxy(target, handler);
  // id 属性会访问同一个值
  // 本质上proxy.id访问到了target.id
  console.log(target.id); // target
  console.log(proxy.id); // target
  // 给目标属性赋值会反映在两个对象上
  // 因为两个对象访问的是同一个值
  // 本质上proxy.id访问到了target.id
  target.id = 'foo';
  console.log(target.id); // foo
  console.log(proxy.id); // foo
  // 给代理属性赋值会反映在两个对象上
  // 因为这个赋值会转移到目标对象
  proxy.id = 'bar';
  console.log(target.id); // bar
  console.log(proxy.id); // bar
  // hasOwnProperty()方法在的两个地方（分别target和proxy的原型链上，本质都在Object的原型上）
  // 都会应用到目标对象
  console.log(target.hasOwnProperty('id')); // true
  console.log(proxy.hasOwnProperty('id')); // true
  // 因此不能使用instanceof 操作符
  // 严格相等可以用来区分代理和目标
  console.log(target === proxy); // false
  ```

- 代理的主要目的是可以定义捕获器。捕获器是在处理程序对象中定义的JavaScript对象的基本操作拦截器。处理程序对象中可以定义一个或多个捕获器，每个捕获器都有对应的一种基本操作，可以直接或间接在代理程序上调用。在代理对象上调用这些基本的操作时，代理可以在这些操作传播到目标对象之前先调用捕获器函数，从而拦截并修改相应的行为。

- 每个捕获器都有相应的参数，基于这些参数可以重建被捕获方法的原始行为。所有捕获器都可以基于参数重建被捕获方法的原始行为，但是并不是所有的捕获方法都很简单，手动重建原始行为是不现实的。这就用到了反射。

- 开发者并不需要手动重建原始行为，Reflect对象上封装了原始行为，可以通过调用Reflect对象上的同名方法来轻松重建原始行为。

- Reflect对象上有与Proxy对象上同名的反射方法。这些方法与Proxy对象上的方法具有相同的名称和函数签名，而且具有同**被拦截方法**相同的行为。

- 使用捕获器几乎可以改变所有基本方法的行为，但必须遵循**捕获器不变式**（trap invariant）。捕获器不变式因方法不同而异，但**通常都会防止捕获器定义出现过于反常的行为**。如下面代码定义`foo`属性不可配置不可读，但是捕获器返回`qux`，行为反常，会报错；

  ```js
  const target = {};
  Object.defineProperty(target, 'foo', {
    configurable: false,
    writable: false,
    value: 'bar'
  });
  const handler = {
    get() {
      return 'qux';
    }
  };
  const proxy = new Proxy(target, handler);
  console.log(proxy.foo); // TypeError
  ```

- Reflect上的静态方法`Reflect.revocable()`方法支持撤销代理对象与目标对象的关联。撤销代理的操作是不可逆的。而且，撤销函数`revoke()`是幂等的，调用多少次的结果都一样。撤销代理之后再调用代理会抛出TypeError。

  撤销函数和代理对象是在实例化时同时生成的

  ```js
  const target = {
    foo: 'bar'
  };
  const handler = {
    get() {
      return 'intercepted';
    }
  };
  const { proxy, revoke } = Proxy.revocable(target, handler);
  console.log(proxy.foo); // intercepted
  console.log(target.foo); // bar
  revoke();
  console.log(proxy.foo); // TypeError
  ```

- 支持多层代理，也就是说给代理设置代理。这样就可以在一个目标对象之上构建多层拦截网。

### 什么是反射

- 每个捕获器都有相应的参数，基于这些参数可以重建被捕获方法的原始行为。所有捕获器都可以基于参数重建被捕获方法的原始行为，但是并不是所有的捕获方法都很简单，手动重建原始行为是不现实的。
- 开发者并不需要手动重建原始行为，Reflect对象上封装了原始行为，可以通过调用Reflect对象上的同名方法来轻松重建原始行为。
- Reflect对象上有与Proxy对象上同名的反射方法。这些方法与Proxy对象上的方法具有相同的名称和函数签名，而且具有同**被拦截方法**相同的行为。也就是说，不管Proxy怎么修改目标对象默认行为，你总可以在Reflect上获取默认行为。
- **但是反射API并不限于捕获处理程序；大多数反射API 方法在Object 类型上有对应的方法。**

反射方法与对象上的方法有些行为上是不同的：

- 修改某些Object方法的返回结果，让其变得更合理。有些反射方法返回称作**状态标记**的布尔值，表示意图执行的操作是否成功。而Object在无法定义属性时，会抛出一个错误。
  - 如在定义新属性时如果发生问题，`Reflect.defineProperty()`会返回false，而不是向`Object.defineProperty()`抛出错误。
  - 下面的方法都会返回状态标记：
    - `Reflect.defineProperty()`
    - `Reflect.preventExtensions()`
    - `Reflect.setPrototypeOf()`
    - `Reflect.set()`
    - `Reflect.deleteProperty()`

- 用函数行为替代操作符。
  - 某些Object操作是命令式，比如`in`和`delete`操作符，而`Reflect.has()`和`Reflect.deleteProperty()`让它们变成了函数行为。
  - 下面的方法可替代操作符
    - `Reflect.get()`：可以替代对象属性访问操作符。
    - `Reflect.set()`：可以替代`=`赋值操作符。
    - `Reflect.has()`：可以替代`in`操作符或`with()`
    - `Reflect.deleteProperty()`：可以替代`delete`操作符。
    - `Reflect.construct()`：可以替代`new`操作符。

- 安全地应用函数。

  - 在通过`apply` 方法调用函数时，被调用的函数可能也定义了自己的apply属性，虽然可能性极小。为避免此问题，可以用定义在Function 原型上的apply 方法。

  ```js
  Function.prototype.apply.call(myFunc, thisVal, argumentList);
  ```

  - 这种可怕的代码完全可以使用Reflect.apply 来避免：

  ```js
  Reflect.apply(myFunc, thisVal, argumentsList);
  ```

### 代理的一些编程模式

#### 跟踪访问属性

通过捕获get、set 和has 等操作，可以知道对象属性什么时候被访问、被查询。把实现相应捕获器的某个对象代理放到应用中，可以监控这个对象何时在何处被访问过。

```js
const user = {
  name: 'Jake'
};
const proxy = new Proxy(user, {
  get(target, property, receiver) {
    console.log(`Getting ${property}`);
    return Reflect.get(...arguments);
  },
  set(target, property, value, receiver) {
    console.log(`Setting ${property}=${value}`);
    return Reflect.set(...arguments);
  }
});
proxy.name; // Getting name
proxy.age = 27; // Setting age=27
```

#### 隐藏属性

访问某些属性时，返回`undefind`或`false`

```js
const hiddenProperties = ['foo', 'bar'];
const targetObject = {
  foo: 1,
  bar: 2,
  baz: 3
};
const proxy = new Proxy(targetObject, {
  get(target, property) {
    if (hiddenProperties.includes(property)) {
      return undefined;
    } else {
      return Reflect.get(...arguments);
    }
  },
  has(target, property) {
    if (hiddenProperties.includes(property)) {
      return false;
    } else {
      return Reflect.has(...arguments);
    }
  }
});
// get()
console.log(proxy.foo); // undefined
console.log(proxy.bar); // undefined
console.log(proxy.baz); // 3
// has()
console.log('foo' in proxy); // false
console.log('bar' in proxy); // false
console.log('baz' in proxy); // true
```

#### 隐藏属性

因为所有赋值操作都会触发set()捕获器，所以可以根据所赋的值决定是允许还是拒绝赋值。

```js
const target = {
  onlyNumbersGoHere: 0
};
const proxy = new Proxy(target, {
  set(target, property, value) {
    if (typeof value !== 'number') {
      return false;
    } else {
      return Reflect.set(...arguments);
    }
  }
});
proxy.onlyNumbersGoHere = 1;
console.log(proxy.onlyNumbersGoHere); // 1
proxy.onlyNumbersGoHere = '2';
console.log(proxy.onlyNumbersGoHere); // 1
```

#### 函数与构造函数参数验证

跟保护和验证对象属性类似，也可对函数和构造函数参数进行审查。比如，可以让函数只接收某种类型的值：

```js
function median(...nums) {
  return nums.sort()[Math.floor(nums.length / 2)];
}
// 函数参数验证
const proxy = new Proxy(median, {
  apply(target, thisArg, argumentsList) {
    for (const arg of argumentsList) {
      if (typeof arg !== 'number') {
        throw 'Non-number argument provided';
      }
    }
    return Reflect.apply(...arguments);
  }
});
console.log(proxy(4, 7, 1)); // 4
console.log(proxy(4, '7', 1));
// Error: Non-number argument provided


class User {
  constructor(id) {
    this.id_ = id;
  }
}
// 构造函数参数验证
const proxy = new Proxy(User, {
  construct(target, argumentsList, newTarget) {
    if (argumentsList[0] === undefined) {
      throw 'User cannot be instantiated without id';
    } else {
      return Reflect.construct(...arguments);
    }
  }
});
new proxy(1);
new proxy();
  // Error: User cannot be instantiated without id
```

#### 数据绑定与可观察对象

通过代理可以把运行时中原本不相关的部分联系到一起。这样就可以实现各种模式，从而让不同的代码互操作。

比如，可以将被代理的类绑定到一个全局实例集合，让所有创建的实例都被添加到这个集合中：

```js
const userList = [];
class User {
  constructor(name) {
    this.name_ = name;
  }
}
const proxy = new Proxy(User, {
  construct() {
    const newUser = Reflect.construct(...arguments);
    userList.push(newUser);
    return newUser;
  }
});
new proxy('John');
new proxy('Jacob');
new proxy('Jingleheimerschmidt');
console.log(userList); // [User {}, User {}, User{}]
```

还可以把集合绑定到一个事件分派程序，每次插入新实例时都会发送消息：

```js
const userList = [];
function emit(newValue) {
  console.log(newValue);
}
const proxy = new Proxy(userList, {
  set(target, property, value, receiver) {
    const result = Reflect.set(...arguments);
    if (result) {
      emit(Reflect.get(target, property, receiver));
    }
    return result;
  }
});
proxy.push('John');
// John
proxy.push('Jacob');
// Jacob
```

---

### 说一说代理和反射

代理是目标对象的抽象层。代理用作目标对象的替身，完全独立于目标对象。目标对象既可以独立操作，也可以通过代理操作。

代理的主要目的是可以定义包含捕获器的处理程序对象，这些捕获器可以拦截大部分JavaScript的基本操作和方法。在这些捕获器程序中，在遵循**捕获器不变式**的前提下，可以修改任何操作的行为。

反射是一套封装了与捕获器拦截操作相对应的方法。可以把反射API看做是一套基本操作，这些操作是大部分JavaScript对象API的基础。

可以使用代理来创建各种编码模式，如：跟踪属性访问、隐藏属性、阻止修改或删除属性、函数参数验证、构造函数参数验证、数据绑定、观察对象等。

## 第十章 函数

### 函数的本质是什么

函数实际上是一个对象，是`Function`类型的实例，`Function`也有属性和方法，和其它引用类型一样。

因为函数是对象，所以函数名其实是指向函数对象的指针，而且不一定与函数本身紧密绑定。

### 定义函数有哪些方法？这些方法有什么区别

定义函数有4种方法： 函数声明、函数表达式（匿名函数）、箭头函数、使用`Function`构造函数

```js
// 函数声明
function sum(num1, num2) {
  return num1 + num2;
}

// 函数表达式
const sum = function (num1, num2) {
  return num1 + num2;
}

// 箭头函数
const sum = (num1, num2) => {
  return num1 + num2;
}

// Funtion构造函数
let sum = new Function("num1", "num2", "return num1 + num2"); // 不推荐
```

平常开发中，不推荐使用Funtion构造函数来定义函数，因为这段代码会被解释两次：第一次是将它当作常规ECMAScript 代码；第二次是解释传给构造函数的字符串。这显然会影响性能。不过，**把函数想象为对象，把函数名想象为指针是很重要的，这种语法很好地诠释了这些概念**。

（函数表达式看起来就像一个普通的变量定义和赋值，即创建一个函数再把它赋值给一个变量functionName。这样创建的函数叫作匿名函数（anonymous funtion），因为function 关键字后面没有标识符。未赋值给其他变量的匿名函数的name属性是空字符串）

上面4中方法，本质上都是实例化函数对象，也就是创建函数。但是有一些差别：

函数声明和函数表达式区别是，函数声明存在**函数声明提升**。

- 在任何代码执行之前，JavaScript 引擎会先执行一遍扫描，读取函数声明，把发现的函数声明提升到源代码树的顶部，并在执行上下文中生成函数定义，保存到关联的在变量对象中。这个过程叫作**函数声明提升**。因此即使函数定义出现在调用它们的代码之后，引擎也会把函数声明提升到顶部。
- 函数表达式必须等到代码执行到它那一行，才会在函数上下文中生成函数定义。因此必须在使用前声明。
- 除了函数什么时候真正有定义这个区别之外，这两种语法是等价的。

函数声明和函数表达式定义的函数都是标准函数。特殊对象是`this`，它在标准函数和箭头函数中有不同的行为：

- 在标准函数中，this指向的是把函数当成方法调用的上下文。

  - 函数名只是保存指针的变量。因此全局定义的sayColor()函数和o.sayColor()是同一个函数，只不过执行的上下文不同。

  ```js
  window.color = 'red';
  let o = {
    color: 'blue'
  };
  function sayColor() {
    console.log(this.color);
  }
  sayColor(); // 'red'
  o.sayColor = sayColor;
  o.sayColor(); // 'blue'
  ```

- 在箭头函数中，this指向的是定义箭头函数的上下文。也就是说，箭头函数中this会保留定义该函数时的上下文。

  ```js
  window.color = 'red';
  let o = {
  color: 'blue'
  };
  let sayColor = () => console.log(this.color);
  sayColor(); // 'red'
  o.sayColor = sayColor;
  o.sayColor(); // 'red'
  ```

箭头函数：

- 箭头函数不能使用`arguments`、`super`和`new.target`
- 箭头函数不能用作构造函数
- 箭头函数没有`prototype`属性。

### 函数名的一些特点

函数名本质上是指向函数对象的指针，所以它和其它包含对象指针的变量行为相同。也就是说，**函数名就是一个变量**

- 一个函数可以有多个函数名

- 使用不带括号的函数名会访问函数指针，而不会执行函数。

- 函数对象上都有一个只读属性`name`，保存一个**函数标识符**即一个字符串化的变量名（函数名）

  - 大多数情况下，有函数名，name为函数名；没有函数名，name为空字符串

  - 如果函数是使用`Function`构造函数创建，name为`'anonymous'`

  - 如果是访问器属性的`setter`或`getter`函数、或使用`bind()`实例化，那么标识符前会加上前缀`set`、`get`、`bound`

    ```js
    function foo() { }
    console.log(foo.bind(null).name); // bound foo

    let dog = {
      years: 1,
      get age() {
        return this.years;
      },
      set age(newAge) {
        this.years = newAge;
      }
    }
    let propertyDescriptor = Object.getOwnPropertyDescriptor(dog, 'age');
    console.log(propertyDescriptor.get.name); // get age
    console.log(propertyDescriptor.set.name); // set age
    ```

### 函数的参数

- 函数的参数可以是任意类型，定义的参数个数和传入的参数个数也不需要一致
- 这是因为，函数的参数在内部表现为一个数组。函数被调用时，总会接收一个数组，但函数并不关心这个数组中包含什么。数组是空的或者超出个数要求，都没问题。
- 在非箭头函数中，**函数内部可以通过arguments对象获取传进来的值**。箭头函数中，无法使用`arguments`访问参数
- arguments对象是一个类数组对象，可通过中括号`[]`语法来访问到其中的元素，即传进来参数的实际值。`arguments.length`能确定传进来的参数个数。
- 函数定义时的参数即命名参数，只是为了方便才写出来的，并不是必须要写出来。（在ECMAScript 中的命名参数不会创建让之后的调用必须匹配的函数签名。这是因为根本不存在验证命名参数的机制）
- `arguments`对象可以和命名参数一起使用。
- 非严格模式下，`arguments`对象的中元素的值始终与命名参数同步；但它们访问的并不是同一块内存地址，它们的内存是分开的，只不过会保持同步而已。
- 如果只传了一个参数，然后把`arguments[1]`设置为某个值，那么这个值并不会反映到第二个命名参数。因为`arguments` 对象的长度是根据函数调用时传入的参数个数确定的，而非定义函数时给出的命名参数个数确定的。
- 函数的命名参数没有传值，默认是undefined。类似于定义了变量而没有初始化
- 严格模式下
  - 给`arguments`中的元素赋值，并不会同步到命名参数；
  - 函数中尝试重写arguments对象会导致语法错误，代码不会执行。
- 函数的参数支持扩展和收集。

### JS中函数有没有重载，为什么

没有重载。

其它语言中，一个函数可以有两个定义，只要签名（接收参数的类型和数量）不同就行。

- JS中函数没有签名，因为参数是由包含零个或多个值的数组表示的。

- 函数没有签名，自然就没有重载。

- 两个同名函数，后定义的会覆盖先定义的。

把函数名当成指针也能理解为什么没有重载

- 函数名只是一个指向函数对象的指针，函数名和其它包含指向其它对象类型指针的变量名没什么区别
- 所以，定义两个同名函数时，就会导致后定义的重写先定义的

### 函数的默认参数

- 在使用默认参数时，`arguments`对象的值不反映参数的默认值，只反映传给函数的参数。跟ES5严格模式一样，修改命名参数也不会影响arguments 对象，它始终以调用函数时传入的值为准。

- 默认参数值并不限于原始值或对象类型，也可以使用调用函数返回的值。当默认参数使用调用函数返回的值，函数的默认参数只有在函数被调用时才会求值，不会在函数定义时求值。而且，计算默认值的函数只有在调用函数但未传相应参数时才会被调用。

- 给多个参数定义默认值实际上跟使用let 关键字顺序声明变量一样。

- 因为参数是按顺序初始化的，所以后定义默认值的参数可以引用先定义的参数。

- 参数初始化顺序遵循“暂时性死区”规则，即前面定义的参数不能引用后面定义的。

- 参数存在于自己的作用域中，它们不能引用函数体的作用域。

### 函数可以作为值

函数名就是一个变量，所以函数可以作为另一个函数的参数，也可以作为一个函数的返回值。

任何时候，只要函数被当作值来使用，它就是一个函数表达式。

### 函数的属性和方法

- `arguments`主要用于包含函数的参数。但还包含了其它属性：
  - `arguments.length`，函数调用时，传进来的参数个数。
  - `arguments.callee`，是一个指向包含`arguments`对象函数的指针。严格模式下，不能访问该值，否则报错
  - `arguments.caller`，非严格模式下始终是`undefined`；严格模式下访问会报错。这是为了分清`arguments.caller`和函数的caller故意为之。
- `this`
  - 在标准函数中，this指向的是把函数当成方法调用的上下文。
  - 在箭头函数中，this指向的是定义该函数时的上下文。
  - this指向的就是函数的执行上下文。如果访问`this.color`，那么上下文对象就会从关联的变量对象中获取到具体的值。
- `caller` 引用的是调用当前函数的函数，或者如果是在全局作用域中调用的则为null。
  - 如果要降低耦合度，则可以通过arguments.callee.caller 来引用同样的值。
- `new.target` 区分函数是作为构造函数被调用，还是作为普通函数被调用。
  - 如果是通过`new`关键字作为构造函数被调用，`new.target`指向被调用的构造函数
  - 如果作为普通函数被调用，`new.target`的值为`undefined`
- `prototype` 指向原型对象。保存引用类型所有实例方法的地方。
  - 这意味着`toString()`、`valueOf()`等方法实际上都保存在`prototype`上，进而由所有实例共享
- `length` 表示函数定义的命名参数个数。
- `[[Scope]]` 保存函数定义的预作用域链
- `apply()` 指定调用时函数体内部的this对象值。
  - 第一个参数是函数内this的值，第二个参数可以是数组或`arguments`对象。
  - 非严格模式下，第一个参数则指定为 `null` 或 `undefined` 时会自动替换为指向全局对象。指定为原始值会被原始包装类型包装。
  - **`apply`和`call()`的强大之处在于控制函数调用上下文，即控制函数体内this值的能力。**也就是可以将任意对象设置为任意函数的上下文。
- `call()` 与`apply()`相似，不同之处在于传参形式不同。第一个参数相同；剩下的参数要逐个传递，也就是必须要将参数一个个列出来。
- `bind()` 创建一个新的函数实例，其`this`值绑定到传给bind的对象。
- 继承并重写的方法
  - `toString()`、`toLocaleString()` 返回函数字符串
  - `valueOf()` 返回函数本身

### 什么是尾调用、尾调用优化

尾调用就是外部函数的返回值是一个内部函数的返回值。

尾调用优化的关键是如果函数的逻辑允许基于尾调用将其销毁，则引擎会这么做。也就是说，引擎发现销毁尾调用函数的外部函数调用栈帧不会影响尾调用函数，那么就销毁外部函数。

尾调用优化的条件：

- 代码必须在严格模式下执行
- 外部函数的返回值是对尾调用函数的调用。即尾调用必须直接返回
- 外调用函数返回后不需要执行额外的逻辑。
- 尾调用函数不是引用外部函数作用域中自由变量的闭包。

**尾调用优化为什么必须在严格模式下执行？**

之所以要求严格模式，主要因为在非严格模式下函数调用中允许使用`f.arguments`和`f.caller`，而它们都会引用外部函数的栈帧。显然，这意味着不能应用优化了。因此尾调用优化要求必须在严格模式下有效，以防止引用这些属性。

### 什么是立即调用的函数表达式

立即调用的函数表达式（IIFE，Immediately Invoked Function Expression）

函数定义包含在一个括号中，所以会被解释为函数表达式（匿名函数）。紧跟在第一组括号后面的第二组括号会立即调用前面的函数表达式。这就叫作IIFE。

ES6之前，常使用IIFE可以用来模拟块级作用域。

IIFE是现在模块的基石，各种模块模式都离不开IIFE。

Node中的CommonJS模块实现，以及CMD、AMD都用到了IIFE。

## 第十一章 异步编程

### 回调函数

```js
function double(value, success, failure) {
  setTimeout(() => {
    try {
      if (typeof value !== 'number') {
        throw 'Must provide number as first argument';
      }
      success(2 * value);
    } catch (e) {
      failure(e);
    }
  }, 1000);
}
const successCallback = (x) => console.log(`Success: ${x}`);
const failureCallback = (e) => console.log(`Failure: ${e}`);
double(3, successCallback, failureCallback);
double('b', successCallback, failureCallback);
// Success: 6（大约1000 毫秒之后）
// Failure: Must provide number as first argument（大约1000 毫秒之后）
```

问题在于，代码复杂会导致回调地狱。

### 什么是Promise

Promise是ES6新增的引用类型。是一个构造函数，所以也是一个对象。

它是一个构造函数，所以可以通过操作符`new`来实例化，接收一个函数即执行器函数作为参数。

Promise是一个有状态的对象，可能有3个状态：

- `pending` 是一个初始化状态。`new Promise()`初始化状态。
- `fulfilled` 表示完成（成功）状态
- `rejected` 表示拒绝（失败）状态

状态可以从`pending`状态转化成`fulfilled`或`rejected`状态，且不可逆。

而且状态也不一定会从`pending`转化为其它两种状态，可能会永远处于`pending`状态。

这个状态是Promise内部私有的，外部不可读取也不可修改。这是为了避免外部读取到状态，以同步方式处理Promise对象。起到了隔离外部的同步代码。

Promise的状态可以在执行器函数内部进行修改。执行器函数有两个作用：

- 第一个是初始化Promise的异步行为。也就是将异步操作封装在此函数中，但初始化操作是同步执行的。

- 第二个是控制状态的最终转换。只有调用Promise的实例的`then()`方法，才会获取到最终状态。

其中控制状态转换是用到了执行器的两个函数参数实现的。通常两个参数叫`resolve()`和`reject()`。

- 调用`resolve()`可以把Promise的状态切换成完成态`fulfilled`。
- 调用`reject()`可以把Promise的状态切换成拒绝态`rejected`。

### Promise的实例方法

**期约实例的方法是连接外部同步代码与内部异步代码之间的桥梁。**

**`Promise.prototype.then()`**

- Promise的原型上有`then()`方法，这个方法实现了`Thenable`方法。

- 实现`Thenable`接口，最简单的类：

  ```js
  class Thenable {
    then () {}
  }
  ```

- 该方法接收两个参数：`onResolved`处理程序和`onRejected`处理程序。这两个参数是可选的，非函数类型的参数会被忽略。不需要传的参数，可以传`undefined`
  - `onResolved()`的返回值会通过`Promise.resolve()`包装来生成新`Promise`实例。如果没有提供`onResolved()`，则`Promise.resolve()`就会包装上一个`Promise`实例完成态的值。如果`onResolved()`没有显式的返回语句，则`Promise.resolve()`会包装默认的返回值`undefined`。如果显示返回，则`Promise.resolve()`会包装这个值。如果`onReject()`中抛出异常，则返回失败态`rejected`
  - `onRejected()` 对返回值也进行`Promise.resovle()`包装
- `then()`方法返回一个新的Promise实例。因为这个新的Promise实例基于`onResolved()`函数的返回值构建。

- 因为会返回新的Promise实例，所以支持连续`then()`的点操作，下面方法也都支持。

**`Promise.prototype.catch()`**

- 该方法是`then(undefined, onRejected)`的语法糖

**`Promise.prototype.finally()`**

- 方法用于给`Promise`添加`onFinally`处理程序，无论何时状态都会失败。这个方法可以避免`onResolved` 和`onRejected` 处理程序中出现冗余代码。
- finally()的返回结果就是对父Promise的传递

### Promise的静态方法

**`Promise.resolve()`**

- 该方法接收一个参数作为完成态的值。

- 作用是直接实例化一个完成态`fulfilled`的Promise实例对象。（Promise最初状态不一定是`pending`状态。）
- 如果接收一个Promise作为参数，那么就是一个空包装。`Promise.resolve()`是一个幂等操作，会保留作为参数传入的Promise的状态。

**`Promise.reject()`**

- 方法接收一个参数作为拒绝态的值。
- 作用是直接实例化一个拒绝态`rejected`的Promise实例对象，并抛出一个异步错误
- 如果接收一个Promise作为参数，不会做空包装，而是直接返回当做参数传入的Promise对象。

**`Promise.all()`**

- 方法接收一个可迭代对象
- 作用是在一组`Pormise`全部解决之后再返回它的状态。如果全完成，则会返回所有成功结果的顺序数组；只要失败，则返回那个失败的状态，只返回第一个失败的原因。
- 方法会默认执行所有的`Promise`。每个执行互不影响

**`Promise.race()`**

- 方法接收一个可迭代对象，返回一个新期约

- 一组集合中最先解决或拒绝的期约的镜像
- 无论`resolve`或`reject`，只要是第一个落定的，就会当成`race()`的状态返回
- 方法会默认执行所有的`Promise`。每个执行互不影响

### 下面代码为什么try/catch无法捕获Promise的错误

```js
try {
  Promise.reject(new Error('bar'));
} catch (e) {
  console.log(e);
}
// UnhandledPromiseRejectionWarning: Error: bar
```

这里的同步代码之所以没有捕获`Promise`抛出的错误，是因为它没有通过异步模式捕获错误。

**Promise真正的异步特性：它们是同步对象（在同步执行模式中使用），但也是异步执行模式的媒介。**

**当Promise进入完成或拒绝状态时，与该状态相关的处理程序仅仅会被排期到事件循环的微任务中处理，而非立即执行。**

所以，Promise的错误并没有抛到执行同步代码的线程里，而是在**事件循环的微任务中**处理的。

因此，try/catch 块并不能捕获该错误。

代码一旦开始以异步模式执行，则唯一与之交互的方式就是使用异步结构，即`Promise`或`async/await`。

### async/await异步执行

`async`函数如果使用`return`关键字返回值，那么这个值就会被`Promise.resolve()`包裹成Promise实例。如果没有返回值或返回`undefined`，则会返回`Promise.resolve()`包裹的`undefined`

`async`函数中的错误抛出会返回拒绝态`rejected`的`Promise`实例

`await` 关键字会暂停执行异步函数后面的代码，让出JavaScript 运行时的执行线程。这个行为与生成器函数中的yield 关键字是一样的。

`await`关键字同样是尝试“解包”对象的值，然后将这个值传给表达式，再异步恢复异步函数的执行。

`await`和`return`关键字都期待一个`Thenable`接口对象，但常规值也可以。如果是实现`thenable`接口的对象，则这个对象可以由`await`来“解包”。如果不是，则这个值就被包裹成完成态`fulfilled`的Promise。

`Promise.reject()`返回的错误不会被`async`函数捕获，因为异步错误无法在同步代码中获取。前面加上`await`关键字可以捕获错误。

JavaScript 运行时在碰到await 关键字时，会记录在哪里暂停执行。等到await 右边的值可用了，JavaScript 运行时会向微任务队列中推送一个任务，这个任务会恢复异步函数的执行。

因此，即使后面跟着一个立即可用的值，函数的其余部分也会被异步求值。

### 说一说async/await

`async`函数是生成器的语法糖。`async`函数对生成器函数做了改进：

- 内置执行器。生成器函数执行必须依靠执行器，如调用生成器函数后，生成迭代器对象，手动调用迭代器的`next()`方法，或使用`for-of`等语法。 `async`函数具有内置执行器，只需要添加`await`关键字，内部会自动进行异步执行处理。
- 更好的语意支持。比起星号`*`和`yield`关键字，语意更清晰。`async`表示函数有异步操作，`await`表示紧跟在后面的表达式需要等待结果。
- `async`函数的返回值是`Promise`实例，返回值都是`Promise.resolve()`包裹的Promise实例。而生成器函数的返回值是一个迭代器对象。
- `async`函数可以看作多个异步操作，包装成的一个 Promise 对象，而`await`关键字就是内部`then`命令的语法糖。

## 第二十六章 模块

### 模块模式

- 模块模式背后的思想是：把逻辑拆分，各自封装，相互独立，每个块自行决定对外暴露什么，同时决定自行引入执行哪些外部代码。
- 模块标识符是所有模块系统通用的概念。模块系统本质是键/值实体，其中模块都有一个引用它的标识符。这个标识符在模拟系统中是字符串，最终解析的实际模块系统是中是文件的实际路径。
- 模块系统的核心是管理依赖；本地模块声明外部模块依赖，模块系统检视这些模块，保证能被正常加载并初始化；

- 模块加载：当一个外部模块被指定为依赖时，本地模块期望在执行它时，依赖已准备好并已初始化。

  - 在浏览器中，只有所有依赖都加载完成，才可以执行入口文件
  - 模块加载是顺序的、单线程的，必须指定一个模块作为入口（entry point），也是代码执行的起点。
  - 模块必须等依赖加载完之后才能被加载。

- 动态依赖：模块支持动态加载，但代价是增加了对模块进行静态分析的难度。

- 静态分析：模块中包含的发送到浏览器的JavaScript 代码经常会被静态分析，分析工具会检查代码结构并在不实际执行代码的情况下推断其行为。对静态分析友好的模块系统可以让模块打包系统更容易将代码处理为较少的文件。它支持在智能编辑器里智能自动完成，这也就是开发中写好的代码能自动出现友好提示或错误提示的原因。

- 模块支持循环依赖，模块的加载器会执行**深度优先的依赖加载**。

  ```js
  require('./moduleD');
  require('./moduleB');
  console.log('moduleA');

  require('./moduleA');
  require('./moduleC');
  console.log('moduleB');

  require('./moduleB');
  require('./moduleD');
  console.log('moduleC');

  require('./moduleA');
  require('./moduleC');
  console.log('moduleD');
  ```

  如果`moduleA`作为入口文件，那么输出顺序为：moduleB、moduleC、moduleD、moduleA，满足深度优先的依赖加载。

  如果moduleC 最先加载，那么输出顺序为：moduleD、moduleA、

  moduleB、moduleC，也同样满足深度有限加载。

- 立即执行函数IIFE是模块加载的基础。然后出现了CommonJS、AMD、UMD等社区模块方案。

## DOM

### 什么是DOM

DOM（Document Object Model）即文档对象模型，是一个应用编程接口。

- DOM 将整个页面抽象为一组分层节点。HTML 或XML 页面的每个组成部分都是一种节点，包含不同的数据。
- 通过DOM创建表示文档的树，使用DOMAPI，可以让开发者轻松控制文档结构，删除、添加、替换、修改。

W3C为保证Web跨平台的本性，避免厂商各行其是导致Web分裂，制定了DOM标准。

### DOM包含哪些内容

DOM有四个版本：

- DOM1（最初版本），包含：
  - **DOM Core** 提供映射XML文档，从而方便访问和操作文档
  - **DOM HTML** 扩展前者，并增加了特定于HTML的对象和方法
- DOM2，包含：
  - **DOM视图**：描述追踪文档的不同视图接口。如应用CSS样式前后的文档
  - **DOM事件**： 描述事件和事件处理的接口
  - **DOM样式**：描述处理元素CSS样式的接口
  - **DOM遍历和范围**：描述遍历和操作DOM 树的接口。

- DOM3，包含：
  - **DOM Load and Save**： 统一加载和保存文档的接口
  - **DOM Validation**：验证文档的接口
  - **DOM Core的扩展** 支持了XML1.0的所有新特性，包括XML Infoset、XPath 和XML Base
- DOM4：W3C 不再按照Level 来维护DOM，而是作为DOM Living Standard 来维护，其快照称为DOM4。
  - **Mutation Observers**：用于替代Mutation Events。观察整个文档、DOM树的一部分、或某个元素。还可以观察元素属性、子节点、文本或前三者任意组合变化。

## BOM

### 什么是BOM

BOM（Browser Object Model）即浏览器对象模型，是一个访问和操作浏览器的接口。它是唯一一个没有标准的JavaScript实现。

BOM主要针对的是浏览器窗口和子窗口，不过大家把特定于浏览器的扩展都归在BOM的范畴。

BOM包括：

- window对象：浏览器实例，BOM对象的基础。
  - 代表浏览器窗口和页面可见区域
  - 同时也被复用为EcmaScript的Global对象
- location对象：当前窗口加载中加载文档的信息以及导航功能
- navigator对象：浏览器相关信息，通常用于确定浏览器类型
- screen对象：客户端显示器信息，如屏幕像素宽度、高度
- history对象：表示浏览器的导航历史记录，开发者可以以编程方式实现导航，也可以修改历史记录
