柏林已经来了命令，阿尔萨斯和洛林的学校只许教 ES6 了···他转身朝着黑板，拿起一支粉笔，使出全身的力量，写了两个大字：“ES6 万岁！”（《最后一课》）。<!-- more -->

阮一峰的《ES6 标准入门》第二版和第三版都有购入，第二版是去年买的实体书，当初大略翻了一遍，今年第三版又出世了，在原来的基础上新增了不少内容，是时候重拾书本学习了。

> Any application that can be written in JavaScript will eventually be written in JavaScript. --Jeff Atwood

## let 和 const

### 基本用法

#### 不存在变量提升

var 命令会发生“变量提升”现象，即变量可以在声明之前使用，值为 undefined。let 命令改变了语法行为，它所声明的变量一定要在声明后使用，否则便会报错。

```javascript
// var的情况
console.log(foo) // 输出 undefined
var foo = 2

// let的情况
console.log(bar) // 报错 ReferenceError
let bar = 2
```

#### 暂时性死区

只要块级作用域内存在 let 命令，它所声明的变量就“绑定”（binding）这个区域，不再受外部的影响。

ES6 规定，如果区块中存在 let 和 const 命令，则这个区块对这些命令声明的变量从一开始就形成封闭作用域。这在语法上称为“暂时性死区”（temporal dead zone，简称 TDZ）。

```javascript
var tmp = 123
if (true) {
  tmp = 'abc' // ReferenceError
  let tmp
}
```

“暂时性死区”也意味着 typeof 不再是一个百分之百安全的操作，变量用 let 声明的话，那么在声明之前引用会报错。作为比较，如果一个变量根本没有被声明，使用 typeof 反而不会报错。

```javascript
typeof x // ReferenceError

let x
typeof undeclared_variable // "undefined"
```

总之，暂时性死区的本质就是，**只要进入当前作用域，所要使用的变量就已经存在，但是不可获取**，只有等到声明变量的那一行代码出现，才可以获取和使用该变量。

#### 不允许重复声明

扩展 1：const 实际上保证的并不是变量的值不得改动，而是变量指向的那个内存地址不得改动。如果真的想将对象冻结，应该使用 `Object.freeze` 方法。

```javascript
var constantize = obj => {
  Object.freeze(obj)
  Object.keys(obj).forEach((key, i) => {
    if (typeof obj[key] === 'object') {
      constantize(obj[key])
    }
  })
}
```

扩展 2：ES5 只有两种声明变量的方法：使用 var 命令和 function 命令。ES6 除了添加了 let 和 const 命令，还有另外两种声明变量的方法：import 命令和 class 命令。所以，ES6 一共有 **6** 种声明变量的方法。

### 块级作用域

ES6 引入了块级作用域，明确允许在块级作用域之中声明函数。ES6 规定，_在块级作用域之中，函数声明语句的行为类似于 let，在块级作用域之外不可引用_。

块级作用域的出现，实际上使得获得广泛应用的立即执行匿名函数（IIFE）不再必要了。

但是由于这条规则会对旧代码产生很大影响。为了减轻因此产生的不兼容问题，浏览器可以不遵守这条规则，所以尽量避免在块级作用域内声明函数。

### 顶层对象的属性

顶层对象在浏览器环境中指的是 window 对象，在 Node 环境中指的是 global 对象。在 ES5 中，顶层对象的属性与全局变量是等价的。

ES6 为了改变这一点，一方面规定，为了保持兼容性，var 命令和 function 命令声明的全局变量依旧是顶层对象的属性；另一方面规定，let 命令、const 命令、class 命令声明的全局变量不属于顶层对象的属性。也就是说，从 ES6 开始，全局变量将逐步与顶层对象的属性隔离。

```javascript
var a = 1
window.a // 1

let b = 1
window.b // undefined
```

### global 对象

ES5 的顶层对象在各种实现中是不统一的。

- 在浏览器中，顶层对象是 window，但 Node 和 Web Worker 没有 window。
- 在浏览器和 Web Worker 中，self 也指向顶层对象，但是 Node 没有 self。
- 在 Node 中，顶层对象是 global，但其他环境都不支持。

同一段代码为了能够在各种环境中都取到顶层对象，目前一般是使用 this 变量，但是也有局限性。

- 在全局环境中，this 会返回顶层对象。但是在 Node 模块和 ES6 模块中，this 返回的是当前模块。
- 对于函数中的 this，如果函数不是作为对象的方法运行，而是单纯作为函数运行，this 会指向顶层对象。但是严格模式下，this 会返回 undefined。
- 不管是严格模式，还是普通模式，`new Function('returnthis')()` 总会返回全局对象。但是，如果浏览器用了 CSP（Content Security Policy，内容安全政策），那么 eval、new Function 这些方法都可能无法使用。

综上所述，很难找到一种方法可以在所有情况下都取到顶层对象。以下是两种勉强可以使用的方法。

```javascript
// 方法一
typeof window !== 'undefined'
  ? window
  : typeof process === 'object' &&
    typeof require === 'function' &&
    typeof global === 'object'
    ? global
    : this

// 方法二
var getGlobal = function() {
  if (typeof self !== 'undefined') {
    return self
  }
  if (typeof window !== 'undefined') {
    return window
  }
  if (typeof global !== 'undefined') {
    return global
  }
  throw new Error('unable to locate global object')
}
```

## 变量的解构赋值

### 数组的解构赋值

解构（Destructuring）属于“模式匹配”，只要等号两边的模式相同，左边的变量就会被赋予对应的值。

```javascript
let [x, y, ...z] = ['a']
x // "a"
y // undefined
z // []

// 不完全解构
let [a, b] = [1, 2, 3]
a // 1
b // 2
```

对于 Set 结构，也可以使用数组的解构赋值。

```javascript
let [x, y, z] = new Set(['a', 'b', 'c'])
x // "a"
```

事实上，只要某种数据结构具有 Iterator 接口，都可以采用数组形式的解构赋值。

```javascript
function* fibs() {
  let a = 0
  let b = 1
  while (true) {
    yield (a[(a, b)] = [b, a + b])
  }
}

let [first, second, third, fourth, fifth, sixth] = fibs()
sixth // 5
```

上面的代码中，fibs 是一个 Generator 函数，原生具有 Iterator 接口。解构赋值会依次从这个接口中获取值。

解构赋值允许指定默认值。ES6 内部使用严格相等运算符（===）判断一个位置是否有值。所以，**如果一个数组成员不严格等于 undefined，默认值是不会生效的**。

```javascript
let [x = 1] = [undefined]
x // 1

let [y = 1] = [null]
y // null
```

如果默认值是一个表达式，那么这个表达式是惰性求值的，即只有在用到时才会求值。

```javascript
function f() {
  console.log('aaa')
}
let [x = f()] = [1]
```

默认值可以引用解构赋值的其他变量，但该变量必须已经声明：

```javascript
let [x = 1, y = x] = [] // x=1; y=1
```

### 对象的解构赋值

对象的解构赋值的内部机制是先找到同名属性，然后再赋值给对应的变量。真正被赋值的是后者，而不是前者。

下面的代码中，foo 是匹配的模式，baz 才是变量。真正被赋值的是变量 baz，而不是模式 foo。

```javascript
let { foo: baz } = { foo: 'aaa', bar: 'bbb' }
```

与数组一样，解构也可以用于嵌套结构的对象：

```javascript
let obj = { p: ['Hello', { y: 'World' }] }
let {
  p: [x, { y }]
} = obj
```

### 字符串的解构赋值

### 数值和布尔值的解构赋值

### 函数参数的解构赋值

### 圆括号问题
