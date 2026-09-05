---
title: "NodeJS代码规范"
date: "2021-06-22 14:32:10"
tags:
  - "Node"
  - "基础"
draft: false
---

> https://github.com/dead-horse/node-style-guide

## 2空格缩进

使用2个空格而不是tab来进行代码缩进，同时绝对不要混用空格和tab。

Sublime Text2设置（Preferebces > Settings > User）

```text
"tab_size"：2,
"translate_tabs_to_spaces": true
```

### 换行

使用UNIX风格的换行符（\n），同时在每个文件的结尾添加一个换行符。Windows风格的换行符(\r\n)是绝对禁止出现在任何项目中的。

Sublime Text2设置（Preferebces > Settings > User）

```text
"default_line_ending": "unix"
```

### 去除行末尾的多余空格

就像吃完饭要刷牙一样，在提交(commit)代码之前你需要清理掉所有的不必要的空格。

Sublime Text2设置（Preferebces > Settings > User）

```text
"trim_trailing_white_space_on_save": true
```

### 使用分号

是否使用分号，在社区争论已久，Isaac也写过一篇讨论的[文章](https://blog.izs.me/2010/12/an-open-letter-to-javascript-leaders-regarding)，但是，当可以用廉价的语法来消除一些可能引入错误的时候，请当一个保守派。

### 每行80个字符

限制你每行代码不超过80个字符。尽管现在的显示器越来越大，但是你的大脑并没有变大，并且你还可以把你的大显示器切分成多屏来显示。

Sublime Text2设置（Preferebces > Settings > User）

```text
"rulers": [80]
```

多屏：`view > Layout > Columns 2`

### 使用单引号

除非编写`.json`文件，其他时候都请用单引号包裹字符串。

Right

```js
var foo = 'bar';
```

Wrong

```js
var foo = "bar";
```

### 大括号位置

请把你的所有的左大括号都放在语句开始的这一行。

Right

```js
if (true) {
  console.log('winning');
}
```

Wrong

```js
if (true)
{
	console.log('losing');
}
```

同时，请注意在条件判断前后都添加一个空格。

### 每个变量声明都带一个var （旧）

每个变量声明都带一个`var`，这样删除或者调整变量声明的顺序会更加容易。不要把变量都生命在最前面，而是声明在它最有意义的地方。

Right

```js
var keys = ['foo', 'bar'];
var values = [23, 42];

var object = {};
while (items.length) {

}
```

Wrong

```js
keys = ['foo', 'bar'];
values = [23, 42];

object = {};
while (items.length) {

}
```

### 变量、属性和函数名都采用小驼峰

变量、属性和函数的命名风格都需要遵循小驼峰风格。 同时所有的命名都是有意义的。 尽量避免用单字符变量和少见单词来命名。Right

```js
var adminUser = db.query('SELECT * FROM users ...');
```

Wrong

```js
var admin_user = db.query('SELECT * FROM users ...');
var a = db.query('SELECT * FROM users ...');
```

### 类名采用大驼峰

类名都采用大驼峰风格来命名。

Right

```js
function BankAccount() {
}
```

Wrong

```js
function bank_Account () {
}
```

### 用大写来标识常量

常量变量和对象的静态常量属性都需要特殊表明，通过全部大写的方式来表明。

尽管Node.js/V8支持mozilla的const关键字，但不幸的是，对象的属性并不支持这个关键字，而且const没有包含于任何一个ECMA规范中（现在包含了）。

Right

```js
var SECOND = 1 * 1000；

function File() {
}
File.FULL_PERMISSIONS = 0777;
```

Wrong

```js
var SECOND = 1 * 1000;

function File() {
}
File.fullPermissions = 0777;
```

### 对象、数组的创建

使用尾随逗号，尽量用一行来声明，只有在编译器不接受的情况下才把对象的key用单引号包裹。使用字面表达式，用`{}, []`代替`new Object new Array`

Right

```js
var a = ['hello', 'world'];
var b = {
  good: 'code',
  'is generally': 'pretty'
};
```

Wrong

```js
var a = [
  'hello', 'world'
];
var b = {"good": 'code'
  			, is generally: 'pretty'
				};
```

### 使用 === 比较符

使用`===`操作符来进行比较，它会完全按照你的期望来执行。

Right

```js
var a = 0;
if (a === '') {
  console.log('winning');
}
```

Wrong

```js
var a = 0;
if (a == '') {
  console.log('losing');
}
```

### 三元操作符分多行

三元操作符不应该写在一行，将它分割到多行。

Right

```js
var foo = (a === b)
	? 1
	: 2;
```

Wrong

```js
var foo = (a === b) ? 1 : 2;
```

### 不要扩展内建类型

不要扩展Javascript内建对象的方法。将来来你会感激你这个做法的。

Right

```js
var a = [];
if (!a.length) {
  console.log('winning');
}
```

Wrong

```js
Array.prototype.empty = function () {
  return !this.length;
}
var a = [];
if (a.empty()) {
  console.log('losing');
}
```

### 使用有意义的判断条件

所有复杂的条件判断都需要赋予一个有意义的名字或者方法。

Right

```js
var isValidPassword = password.length >= 4 && /^(?=.*\d).{4,}$/.test(password);
if (isValidPassword) {
	console.log('winning');
}
```

Wrong

```js
if (password.length >= 4 && /^(?=.*\d).{4,}$/.test(password)) {
  console.log('losing');
}
```

### 尽早的从函数中返回

为了避免深入嵌套的`if`语句，请尽早的从函数中返回。

Right

```js
function isPercentage(val) {
  if (val < 0) {
    return false;
  }

  if (val > 100) {
    return false;
  }

  return true;
}
```

Wrong

```js
function isPercentage(val) {
  if (val >= 0) {
    if (val < 100) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}
```

针对这个示例，甚至可以进一步精简优化：

```js
function isPercentage(val) {
  var isInRange = (val >= 0 && val <= 100);
  return isInRange;
}
```

### 给你的闭包命名

请尽量给你的闭包、匿名函数命名。这让人知道你在意这个函数，更重要的是，这将会产生可读性更好的堆栈。

举例好像不适用于现在

Right

```js
req.on('end', function onEnd() {
  console.log('winning')
});
```

Wrong

```js
req.on('end', function () {
  console.log('winning')
});
```

### 不要嵌套闭包

使用闭包，但是不要嵌套它们，否则你的代码将会一团糟。

Right

```js
setTimeout(function() {
  client.connect(afterConnect);
}, 1000);
function afterConnect() {
  console.log('winning');
}
```

Wrong

```js
setTimeout(function () {
  client.connect(function () {
    console.log("losing");
  });
}, 1000);
```

### 使用单行注释风格

不管是单行注释还是多行注释，都是用`//`。同时，请尝试在更高层次来编写注释（解释函数的整体思路），只在解释一些难以理解代码的时候添加注释，而不是给一些琐碎的东西加上注释。

Right

```js
// 'ID_SOMETHING' = VALUE' -> ['ID_SOMETHING', 'SOMETHING', 'VALUE']
var matches = item.match(/ID_([^\n]+)=([^\n]+)/);

// This function has a nasty side effect where a failure to increment a
// redis counter used for statistics will cause an exception. This needs
// to be fixed in a later iteration
function loadUser(id, cb) {
  // ...
}
var isSessionValid = (session.expires < Date.now());
if (isSessionValid) {
  // ...
}
```

Wrong

```js
// Execute a regex
var matches = item.match(/ID_([^\n]+)=([^\n]+)/);

// Usage: loadUsers(5, function () { ... })
function loadUser(id, cb) {
  // ...
}

// Check if the session is valid
var isSessionValid = (session.expires < Date.now());
if (isSessionValid) {
  // ...
}
```

### Object.freeze, Object.preventExtensions, Object.seal, with, eval

这一堆屎一样的东西，你永远不会需要他们。

### Getters和setters

不要使用`setters`，它们会引发一些使用你的代码的人无法解决的问题。当没有副作用的时候，可以使用`getters`，例如提供一个集合类的长度属性的时候。

### 异步回调函数

Node的异步回调函数的第一个参数应该是错误指示，只有这样才能享受许多流程控制模块的福利。

Right

```js
function cb(err, data, ...) {...}
```

Wrong

```js
function cb(data, ...) {...}
```

### 继承

尽管有很多的方法来实现继承，但是最为推荐的是Node的标准写法。

```js
function Socket(options) {
  // ...
  stream.Stream.call(this);
  // ...
}
util.inherits(Socket, stream.Stream);
```

### 文件命名

单词之间使用`_`underscore来分割，如果你不想暴露某个文件给用户，可以使用`_`来开头

Right

```js
child_process.js
string_decoder.js
_linklist.js
```

Wrong

```js
childProcess.js
stringDecoder.js
```

### 空格

在所有的操作符前后都添加空格，`function`关键字后面添加空格。

Right

```js
var add = function (a, b) {
  return a + b;
};
```

Wrong

```js
var add=function(a,b){
  return a+b;
}
```
