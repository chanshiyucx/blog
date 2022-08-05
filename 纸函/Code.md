## 001 setTimeout、Promise、Async/Await 的区别？

1. setTimeout

```js
console.log('script start')
setTimeout(function () {
  console.log('settimeout')
})
console.log('script end')
// 输出顺序：script start -> script end -> settimeout
```

2. Promise

```js
console.log('script start')
let promise1 = new Promise(function (resolve) {
  console.log('promise1')
  resolve()
  console.log('promise1 end')
}).then(function () {
  console.log('promise2')
})
setTimeout(function () {
  console.log('settimeout')
})
console.log('script end')
// 输出顺序: script start->promise1->promise1 end->script end->promise2->settimeout
```

Promise 本身是**同步的立即执行函数**。

- promise.then() 的回调是一个 task，promise 是 resolved 或 rejected，这个 task 就会放入**当前事件循环回合的 microtask queue（微任务）**；promise 是 pending，这个 task 就会放入事件循环的**未来的某个回合的 microtask queue（微任务）**。
- setTimeout 的回调也是个 task，它会被放入 **macrotask queue（宏任务）**。

3. async/await

```js
async function async1() {
  console.log('async1 start')
  await async2()
  console.log('async1 end')
}
async function async2() {
  console.log('async2')
}

console.log('script start')
async1()
console.log('script end')

// 输出顺序：script start->async1 start->async2->script end->async1 end
```

async 函数返回一个 Promise 对象，当函数执行的时候，一旦遇到 await 就会先返回，等到触发的异步操作完成，再执行函数体内后面的语句。可以理解为，是让出了线程，跳出了 async 函数体。

```js
async function async1() {
  console.log('async1 start') // 2
  await async2()
  console.log('async1 end') // 6
}
async function async2() {
  console.log('async2') // 3
}
console.log('script start') // 1
setTimeout(function () {
  console.log('setTimeout') // 8
}, 0)
async1()
new Promise(function (resolve) {
  console.log('promise1') // 4
  resolve()
}).then(function () {
  console.log('promise2') // 7
})
console.log('script end') // 5
```

## 002 将数组扁平化并去除其中重复数据，最终得到一个升序且不重复的数组

```js
var arr = [[1, 2, 2], [3, 4, 5, 5], [6, 7, 8, 9, [11, 12, [12, 13, [14]]]], 10]
Array.from(new Set(arr.flat(Infinity))).sort((a, b) => {
  return a - b
})
```

## 003 ES5/ES6 的继承除了写法以外还有什么区别？

- class 声明会提升，但不会初始化赋值。类似于 let、const 声明变量有暂时性死区。

```js
const bar = new Bar() // it's ok
function Bar() {
  this.bar = 42
}

const foo = new Foo() // ReferenceError: Foo is not defined
class Foo {
  constructor() {
    this.foo = 42
  }
}
```

- class 声明内部会启用严格模式。

```js
// 引用一个未声明的变量
function Bar() {
  baz = 42 // it's ok
}
const bar = new Bar()

class Foo {
  constructor() {
    fol = 42 // ReferenceError: fol is not defined
  }
}
const foo = new Foo()
```

- class 的所有方法（包括静态方法和实例方法）都是不可枚举的。

```js
// 引用一个未声明的变量
function Bar() {
  this.bar = 42
}
Bar.answer = function () {
  return 42
}
Bar.prototype.print = function () {
  console.log(this.bar)
}
const barKeys = Object.keys(Bar) // ['answer']
const barProtoKeys = Object.keys(Bar.prototype) // ['print']

class Foo {
  constructor() {
    this.foo = 42
  }
  static answer() {
    return 42
  }
  print() {
    console.log(this.foo)
  }
}
const fooKeys = Object.keys(Foo) // []
const fooProtoKeys = Object.keys(Foo.prototype) // []
```

- class 的所有方法（包括静态方法和实例方法）都没有原型对象 prototype，不能使用 new 来调用。

```js
function Bar() {
  this.bar = 42
}
Bar.prototype.print = function () {
  console.log(this.bar)
}

const bar = new Bar()
const barPrint = new bar.print() // it's ok

class Foo {
  constructor() {
    this.foo = 42
  }
  print() {
    console.log(this.foo)
  }
}
const foo = new Foo()
const fooPrint = new foo.print() // TypeError: foo.print is not a constructor
```

- 必须使用 new 调用 class。

```js
function Bar() {
  this.bar = 42
}
const bar = Bar() // it's ok

class Foo {
  constructor() {
    this.foo = 42
  }
}
const foo = Foo() // TypeError: Class constructor Foo cannot be invoked without 'new'
```

- class 内部无法重写类名。

```js
function Bar() {
  Bar = 'Baz' // it's ok
  this.bar = 42
}
const bar = new Bar()
// Bar: 'Baz'
// bar: Bar {bar: 42}

class Foo {
  constructor() {
    this.foo = 42
    Foo = 'Fol' // TypeError: Assignment to constant variable
  }
}
const foo = new Foo()
Foo = 'Fol' // it's ok
```

## 004 3 个判断数组的方法，请分别介绍它们之间的区别和优劣 Object.prototype.toString.call() 、 instanceof 以及 Array.isArray()

1. Object.prototype.toString.call()

每一个继承 Object 的对象都有 toString 方法，如果 toString 方法没有重写的话，会返回 [Object type]，其中 type 为对象的类型。但当除了 Object 类型的对象外，其他类型直接使用 toString 方法时，会直接返回都是内容的字符串，所以我们需要使用 call 或者 apply 方法来改变 toString 方法的执行上下文。

```js
const an = ['Hello', 'An']
an.toString() // "Hello,An"
Object.prototype.toString.call(an) // "[object Array]"
```

这种方法对于所有基本的数据类型都能进行判断，即使是 null 和 undefined。

```js
Object.prototype.toString.call('An') // "[object String]"
Object.prototype.toString.call(1) // "[object Number]"
Object.prototype.toString.call(Symbol(1)) // "[object Symbol]"
Object.prototype.toString.call(null) // "[object Null]"
Object.prototype.toString.call(undefined) // "[object Undefined]"
Object.prototype.toString.call(function () {}) // "[object Function]"
Object.prototype.toString.call({ name: 'An' }) // "[object Object]"
```

Object.prototype.toString.call() 常用于判断浏览器内置对象时。

2. instanceof

instanceof 的内部机制是通过判断对象的原型链中是不是能找到类型的 prototype。instanceof 只能用来判断对象类型，原始类型不可以。

使用 instanceof 判断一个对象是否为数组，instanceof 会判断这个对象的原型链上是否会找到对应的 Array 的原型。**并且所有对象类型 instanceof Object 都是 true**。

```js
;[] instanceof Array // true
;[] instanceof Object // true
```

3. Array.isArray()

功能：用来判断对象是否为数组，当检测 Array 实例时，Array.isArray 优于 instanceof，因为 Array.isArray 可以检测出 iframes。

```js
var iframe = document.createElement('iframe')
document.body.appendChild(iframe)
xArray = window.frames[window.frames.length - 1].Array
var arr = new xArray(1, 2, 3) // [1,2,3]

// Correctly checking for Array
Array.isArray(arr) // true
Object.prototype.toString.call(arr) // true
// Considered harmful, because doesn't work though iframes
arr instanceof Array // false
```

Array.isArray() 是 ES5 新增的方法，当不存在 Array.isArray()，可以用 Object.prototype.toString.call() 实现。

```js
if (!Array.isArray) {
  Array.isArray = function (arg) {
    return Object.prototype.toString.call(arg) === '[object Array]'
  }
}
```

扩展：如何正确判断 JS 的数据类型？

1. typeof：可以判断基本数据类型，但难以判断除了函数以外的复杂数据类型。对于 null、对象（Object）、数组（Array）来说，都会转换成 object。
2. instanceof：所有对象类型 instanceof Object 都是 true。
3. Object.prototype.toString.call()

## 005 改造下面的代码，使之输出 0 - 9

```js
for (var i = 0; i < 10; i++) {
  setTimeout(() => {
    console.log(i)
  }, 1000)
}
```

解法一：利用 let 变量的特性，在每一次 for 循环的过程中，let 声明的变量会在当前的块级作用域里面创建一个文法环境，该环境里面包括了当前 for 循环过程中的 i。

```js
for (let i = 0; i < 10; i++) {
  setTimeout(() => {
    console.log(i)
  }, 1000)
}
```

解法二：利用函数自执行的方式，把当前 for 循环过程中的 i 传递进去，构建出块级作用域。IIFE 其实并不属于闭包的范畴。

```js
for (var i = 0; i < 10; i++) {
  ;((i) => {
    setTimeout(() => {
      console.log(i)
    }, 1000)
  })(i)
}
```

## 006 函数与变量申明优先级？

```js
var b = 10
;(function b() {
  b = 20
  console.log(b)
})()
```

打印内容：

```
ƒ b() {
  b = 20;
  console.log(b)
}
```

原因：一个声明在函数体内都是可见的，函数声明优先于变量声明；**在非匿名自执行函数中，函数变量为只读状态无法修改**。

- 函数表达式与函数声明不同，函数名只在该函数内部有效，并且此绑定是常量绑定。
- IIFE 中的函数是函数表达式，而不是函数声明。

改造使其分别打印 10 和 20：

```js
var b = 10
;(function b() {
  var b = 20
  console.log(this.b) // 10
  console.log(b) // 20
})()
```

## 007 使用迭代的方式实现 flatten 函数

```js
let arr = [1, 2, [3, 4, 5, [6, 7], 8], 9, 10, [11, [12, 13]]]

// 迭代
const flatten = (arr) => {
  while (arr.some((item) => Array.isArray(item))) {
    arr = [].concat(...arr)
  }
  return arr
}

// 递归
const flatten = (arr) => arr.reduce((acc, cur) => (Array.isArray(cur) ? [...acc, ...flatten(cur)] : [...acc, cur]), [])
```

## 008 代码中 a 在什么情况下会打印 1？

```js
var a = ?;
if(a == 1 && a == 2 && a == 3){
 	console.log(1);
}
```

**因为 == 会进行隐式类型转换**，所以重写 toString 方法就可以了：

```js
var a = {
  i: 1,
  toString() {
    return a.i++
  },
}

if (a == 1 && a == 2 && a == 3) {
  console.log(1)
}
```

## 009 下面代码输出什么？

```js
var a = 10
;(function () {
  console.log(a) // undefined
  a = 5
  console.log(window.a) // 10
  var a = 20
  console.log(a) // 20
})()
```

在立即执行函数中，`var a = 20` 语句定义了一个局部变量 a，由于变量声明提升机制，局部变量 a 的声明会被提升至立即执行函数的函数体最上方，且由于这样的提升并不包括赋值，因此第一条打印语句会打印 undefined，最后一条语句会打印 20。

由于变量声明提升，`a = 5` 这条语句执行时，局部的变量 a 已经声明，因此它产生的效果是对局部的变量 a 赋值，此时 window.a 依旧是最开始赋值的 10。

## 010 实现一个 sleep 函数

```js
const sleep = (time) => {
  return new Promise((resolve) => setTimeout(resolve, time))
}

sleep(1000).then(() => {
  // 这里写你的骚操作
})
```

## 011 使用 sort() 对数组 [3, 15, 8, 29, 102, 22] 进行排序，输出结果

sort 函数，可以接收一个函数，返回值是比较两个数的相对顺序的值

1. 默认没有函数，默认的排序方法会将数组元素转换为字符串，然后比较字符串中字符的 UTF-16 编码顺序来进行排序

```js
;[3, 15, 8, 29, 102, 22].sort()

// [102, 15, 22, 29, 3, 8]
```

2. 带函数的比较

```js
;[3, 15, 8, 29, 102, 22].sort((a, b) => {
  return a - b
})
```

- 返回值大于 0 即 a-b > 0，a 和 b 交换位置
- 返回值大于 0 即 a-b < 0，a 和 b 位置不变
- 返回值等于 0 即 a-b = 0，a 和 b 位置不变

更方便记忆：**a-b 输出从小到大排序，b-a 输出从大到小排序**。

## 012 输出以下代码执行的结果并解释为什么

```js
var obj = {
  2: 3,
  3: 4,
  length: 2,
  splice: Array.prototype.splice,
  push: Array.prototype.push,
}
obj.push(1)
obj.push(2)
console.log(obj) // [,,1,2]
```

push 方法应该是根据数组的 length 来根据参数给数组创建一个下标为 length 的属性。

1. 使用第一次 push，obj 对象的 push 方法设置 obj[2]=1;obj.length+=1
2. 使用第二次 push，obj 对象的 push 方法设置 obj[3]=2;obj.length+=1
3. 使用 console.log 输出的时候，因为 obj 具有 length 属性和 splice 方法，故将其作为数组进行打印
4. 打印时因为数组未设置下标为 0 1 处的值，故打印为 empty，主动 obj[0] 获取为 undefined

## 013 实现 (5).add(3).minus(2) 功能

```js
Number.prototype.add = function (n) {
  return this.valueOf() + n
}
Number.prototype.minus = function (n) {
  return this.valueOf() - n
}
```

## 014 怎么让一个 div 水平垂直居中

```html
<div class="parent">
  <div class="child"></div>
</div>
```

1.

```css
div.parent {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

2.

```css
div.parent {
  position: relative;
}
div.child {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

3.

```css
div.parent {
  position: relative;
}
div.child {
  width: 50px;
  height: 10px;
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  margin: auto;
}
```

4.

```css
div.parent {
  display: grid;
}
div.child {
  justify-self: center;
  align-self: center;
}
```

## 015 输出以下代码的执行结果并解释为什么

```js
var a = { n: 1 }
var b = a
a.x = a = { n: 2 }

console.log(a.x) // undefined
console.log(b.x) // {n:2}
```

`a.x = a = {n: 2};` 这一行比较复杂。先获取等号左侧的 a.x，但 a.x 并不存在，于是 JS 为（堆内存中的）对象创建一个新成员 x，这个成员的初始值为 undefined，（这也是为什么直接引用一个未定义的变量会报错，但是直接引用一个对象的不存在的成员时，会返回 undefined）

创建完成后，目标指针已经指向了这个新成员 x，并会先挂起，单等等号右侧的内容有结果了，便完成赋值。接着执行赋值语句的右侧，发现 a={n:2} 是个简单的赋值操作，于是 a 的新值等于了{n:2}。这里特别注意，这个 a 已经不是开头的那个 a，而是一个全新的 a，这个新 a 指针已经不是指向原来的值的那个堆内存，而是分配了一个新的堆内存。但是原来旧的堆内存因为还有 b 在占用，所以并未被回收。然后将这个新的对象 a 的堆内存指针，赋值给了刚才挂起的新成员 x，此时，对象成员 x 便等于了新的对象 a。所以，现在 `b={n:1,x:{n:2}}; a={n:2};`。

## 016 某公司 1 到 12 月份的销售额存在一个对象里面

如下：{1:222, 2:123, 5:888}，请把数据处理为如下结构：[222, 123, null, null, 888, null, null, null, null, null, null, null]。

```js
let obj = { 1: 222, 2: 123, 5: 888 }
const result = Array.from({ length: 12 }).map((_, index) => obj[index + 1] || null)
console.log(result)
```

## 017 要求设计 LazyMan 类，实现以下功能

```js
LazyMan('Tony')
// Hi I am Tony

LazyMan('Tony').sleep(10).eat('lunch')
// Hi I am Tony
// 等待了10秒...
// I am eating lunch

LazyMan('Tony').eat('lunch').sleep(10).eat('dinner')
// Hi I am Tony
// I am eating lunch
// 等待了10秒...
// I am eating diner

LazyMan('Tony').eat('lunch').eat('dinner').sleepFirst(5).sleep(10).eat('junk food')
// Hi I am Tony
// 等待了5秒...
// I am eating lunch
// I am eating dinner
// 等待了10秒...
// I am eating junk food
```

实现：

```js
class LazyManClass {
  constructor(name) {
    console.log(`Hi I am ${name}`)
    this.taskList = []
    setTimeout(() => {
      this.next()
    }, 0)
  }

  eat(name) {
    const task = () => {
      console.log(`I am eating ${name}`)
      this.next()
    }
    this.taskList.push(task)
    return this
  }

  sleep(time) {
    const task = () => {
      setTimeout(() => this.next(), time * 1000)
    }
    this.taskList.push(task)
    return this
  }

  sleepFirst(time) {
    const task = () => {
      setTimeout(() => this.next(), time * 1000)
    }
    this.taskList.unshift(task)
    return this
  }

  next() {
    const task = this.taskList.shift()
    task && task()
  }
}

function LazyMan(name) {
  return new LazyManClass(name)
}
```

## 018 给定两个数组，写一个方法来计算它们的交集

给定 nums1 = [1, 2, 2, 1]，nums2 = [2, 2]，返回 [2, 2]。

这道题不是工程题，是道算法题。求的是~~两个数组的最长公共子序列~~ (子序列要求顺序，交集不需要），列如：

```js
var nums1 = [1]
var nums2 = [1, 1]
```

交集应该是 [1]。

这道题两种思路，空间换时间，或者不用额外空间就提升时间复杂度。

1. 空间换时间的思路是用个 Hash 表来存数组 1 的元素以及出现的个数（此处需要遍历 n 次，并存一个 n 级别的空间）。遍历数组 2，发现数组 2 里有 Hash 表里的值就存到 Result 数组里，并把 Hash 表内该值次数减一（为 0 之后就 Delete）。如果不存在 Hash 表里，就跳过。这样时间复杂度就是(m+n)。

2. 不用额外空间，就用遍历 n 的时候，判断值在不在 m 里，如果在，把 m 里的该值 push 到 Result 数组里，并将该值从 m 数组里删掉（用 splice）。这样就是不用额外空间，但是提高了时间复杂度。

思路 1 的解法：

```js
const intersect = (nums1, nums2) => {
  const map = {}
  const res = []
  for (let n of nums1) {
    if (map[n]) {
      map[n]++
    } else {
      map[n] = 1
    }
  }
  for (let n of nums2) {
    if (map[n] > 0) {
      res.push(n)
      map[n]--
    }
  }
  return res
}
```

## 019 已知如下代码，如何修改才能让图片宽度为 300px?

```html
<img src="1.jpg" style="width:480px!important;”>
```

有两种方式：

```css
/* 方式一 */
max-width: 300px;

/* 方式二 */
transform: scale(0.625, 0.625);
```

## 020 模拟实现一个 Promise.finally

```js
Promise.prototype.finally = function (callback) {
  let P = this.constructor // 获取当前实例构造函数的引用
  return this.then(
    (value) => P.resolve(callback()).then(() => value), // 接受状态：返回数据
    (reason) =>
      P.resolve(callback()).then(() => {
        throw reason
      }) // 拒绝状态：抛出错误
  )
}
```

测试：

```js
/*********************** 测试 ***********************/
const p = new Promise((resolve, reject) => {
  console.info('starting...')

  setTimeout(() => {
    Math.random() > 0.5 ? resolve('success') : reject('fail')
  }, 1000)
})

// 正常顺序测试
p.then((data) => {
  console.log(`%c resolve: ${data}`, 'color: green')
})
  .catch((err) => {
    console.log(`%c catch: ${err}`, 'color: red')
  })
  .finally(() => {
    console.info('finally: completed')
  })

// finally 前置测试
p.finally(() => {
  console.info('finally: completed')
})
  .then((data) => {
    console.log(`%c resolve: ${data}`, 'color: green')
  })
  .catch((err) => {
    console.log(`%c catch: ${err}`, 'color: red')
  })
```

## 021 如何把一个字符串的大小写取反（大写变小写小写变大写），例如 ’AbC' 变成 'aBc'

方案一

```js
const processString = (str) =>
  str
    .split('')
    .map((s) => (s === s.toUpperCase() ? s.toLowerCase() : s.toUpperCase()))
    .join('')
```

方案二

```js
const processString = (str) => str.replace(/[a-zA-Z]/g, (s) => (/[a-z]/.test(s) ? s.toUpperCase() : s.toLowerCase()))
```

## 022 实现一个字符串匹配算法，从长度为 n 的字符串 S 中，查找是否存在字符串 T，T 的长度是 m，若存在返回所在位置

```js
// 因为 T 的 length 是一定的，所以在循环S的的时候 ，循环当前项 i 后面至少还有 T.length 个元素
const find = (S, T) => {
  if (S.length < T.length) return -1
  for (let i = 0; i < S.length - T.length; i++) {
    if (S.substr(i, T.length) === T) return i
  }
  return -1
}
```

或者使用正则：

```js
// 方法一：
const find = (S, T) => S.search(T)

// 方法二：
const find = (S, T) => {
  const matched = S.match(T)
  return matched ? matched.index : -1
}
```

## 023 使用 JavaScript Proxy 实现简单的数据绑定

```html
<body>
  <input type="text" id="name" />
  <p id="word">Hello</p>
  <script>
    const inputEl = document.getElementById('name')
    const wordEl = document.getElementById('word')
    const data = {}
    const proxy = new Proxy(data, {
      get(target, property) {
        return Reflect.get(...arguments)
      },
      set(target, property, value) {
        target[property] = value
        wordEl.innerHTML = value
        return Reflect.set(...arguments)
      },
    })

    inputEl.addEventListener('keyup', (e) => {
      proxy.text = e.target.value
    })
  </script>
</body>
```

## 024 对象的键名的转换

这题考察的是对象的键名的转换。

- **对象的键名只能是字符串和 Symbol 类型**。
- 其他类型的键名会被转换成字符串类型。
- 对象转字符串默认会调用 toString 方法。

```js
// example 1
var a = {},
  b = '123',
  c = 123
a[b] = 'b' // c 的键名会被转换成字符串'123'，这里会把 b 覆盖掉。
a[c] = 'c'
console.log(a[b]) // 输出 c

// example 2
var a = {},
  b = Symbol('123'),
  c = Symbol('123')
a[b] = 'b' // b 是 Symbol 类型，不需要转换。
a[c] = 'c' // c 是 Symbol 类型，不需要转换。任何一个 Symbol 类型的值都是不相等的，所以不会覆盖掉 b。
console.log(a[b]) // 输出 b

// example 3
var a = {},
  b = { key: '123' },
  c = { key: '456' }
a[b] = 'b' // b 不是字符串也不是 Symbol 类型，需要转换成字符串。对象类型会调用 toString 方法转换成字符串 [object Object]。
a[c] = 'c' // c 不是字符串也不是 Symbol 类型，需要转换成字符串。  对象类型会调用 toString 方法转换成字符串 [object Object]。这里会把 b 覆盖掉。
console.log(a[b]) // 输出 c
```

## 025 给定一个数组，将数组中的元素向右移动 k 个位置，其中 k 是非负数

```
输入: [1, 2, 3, 4, 5, 6, 7] 和 k = 3
输出: [5, 6, 7, 1, 2, 3, 4]
解释:
向右旋转 1 步: [7, 1, 2, 3, 4, 5, 6]
向右旋转 2 步: [6, 7, 1, 2, 3, 4, 5]
向右旋转 3 步: [5, 6, 7, 1, 2, 3, 4]
```

解法一：

```js
function rotate(arr, k) {
  const len = arr.length
  const step = k % len // 因为步数有可能大于数组长度，所以要先取余
  return arr.slice(-step).concat(arr.slice(0, len - step))
}
```

解法二：

```js
function rotate(arr, k) {
  for (let i = 0; i < k; i++) {
    arr.unshift(arr.pop())
  }
  return arr
}
```

## 026 打印出 1 - 10000 之间的所有对称数 例如 121、1331 等

```js
;[...Array(10000).keys()].filter((x) => {
  return x.toString().length > 1 && x === Number(x.toString().split('').reverse().join(''))
})
```

## 027 定一个数组 nums，编写一个函数将所有 0 移动到数组的末尾，同时保持非零元素的相对顺序

```
输入: [0,1,0,3,12]
输出: [1,3,12,0,0]
```

```js
const zeroMove = (arr) => {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i] === 0) {
      arr.push(arr.splice(i, 1)[0])
    }
  }
  return arr
}
```

## 028 如何用 css 或 js 实现多行文本溢出省略效果

```css
// 单行：
overflow: hidden;
text-overflow: ellipsis;
white-space: nowrap;

// 多行：
display: -webkit-box;
-webkit-box-orient: vertical;
-webkit-line-clamp: 3; //行数
overflow: hidden;
```

## 029 add(1)(2, 3) 链式调用函数

```
add(1);  // 1
add(1)(2);   // 3
add(1)(2)(3)；  // 6
add(1)(2, 3);   // 6
add(1, 2)(3);   // 6
add(1, 2, 3);   // 6
```

```js
const add = (...rest) => {
  const args = [...rest]
  const fn = (...re) => {
    args.push(...re)
    return fn
  }

  fn.toString = () => {
    return args.reduce((a, b) => a + b)
  }

  return fn
}
```

## 030 两数之和

给定一个整数数组和一个目标值，找出数组中和为目标值的两个数。

你可以假设每个输入只对应一种答案，且同样的元素不能被重复利用。

示例：

```
给定 nums = [2, 7, 11, 15], target = 9
因为 nums[0] + nums[1] = 2 + 7 = 9
所以返回 [0, 1]
```

```js
const test = (arr, target) => {
  for (let i = 0; i < arr.length; i++) {
    const v = target - arr[i]
    const j = arr.findIndex((t) => t === v && t !== arr[i]) // 数不能重复使用
    if (j >= 0) {
      return [i, j]
    }
  }
}
```

## 031 获取路由参数对象

```js
function getQuery(url) {
  const obj = {}
  const search = url.split('?')[1]
  if (!search) return obj
  const arr = search.split('&')
  for (item of arr) {
    const keyValue = item.split('=')
    obj[keyValue[0]] = keyValue[1]
  }
  return obj
}

getQuery('https://www.jianshu.com/u/98ab8b7e6c50?name=shaonian&age=18&sex=man')
// {name: 'shaonian', age: '18', sex: 'man'}
```

## 032 设计并实现 Promise.race()

Promise.race(iterable) 方法返回一个 promise，一旦迭代器中的某个 promise 解决或拒绝，返回的 promise 就会解决或拒绝。

```js
Promise._race = (promises) =>
  new Promise((resolve, reject) => {
    promises.forEach((promise) => {
      promise.then(resolve, reject)
    })
  })
```

基本和上面的例子差不多，不同点是每个传入值使用 Promise.resolve 转为 Promise 对象，兼容非 Promise 对象

```js
const _race = (p) => {
  return new Promise((resolve, reject) => {
    p.forEach((item) => {
      Promise.resolve(item).then(resolve, reject)
    })
  })
}
```

## 033 实现模糊搜索结果的关键词高亮显示

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
      bdi {
        color: #f60;
      }
    </style>
  </head>
  <body>
    <input type="text" class="input" />
    <ul class="container"></ul>

    <script>
      const data = ['上海野生动物园', '上饶野生动物园', '北京巷子', '上海中心', '上海黄埔江', '迪士尼上海', '陆家嘴上海中心']
      const input = document.querySelector('.input')
      const container = document.querySelector('.container')

      const debounce = (fn, timeout = 300) => {
        let t
        return (...args) => {
          if (t) {
            clearTimeout(t)
          }
          t = setTimeout(() => {
            fn.apply(fn, args)
          }, timeout)
        }
      }

      const memorize = (fn) => {
        const cache = new Map()
        return (name) => {
          if (!name) {
            container.innerHTML = ''
            return
          }

          if (cache.get(name)) {
            container.innerHTML = cache.get(name)
            return
          }

          const res = fn.call(fn, name).join('')
          cache.set(name, res)
          container.innerHTML = res
        }
      }

      const handleInput = (value) => {
        const reg = new RegExp(`\(${value}\)`)
        const search = data.reduce((acc, cur) => {
          if (reg.test(cur)) {
            const match = RegExp.$1
            acc.push(`<li>${cur.replace(match, '<bdi>$&</bdi>')}</li>`)
          }
          return acc
        }, [])
        return search
      }

      const memorizeInput = memorize(handleInput)

      input.addEventListener(
        'input',
        debounce((e) => memorizeInput(e.target.value))
      )
    </script>
  </body>
</html>
```

## 034 已知数据格式，实现一个函数 fn 找出链条中所有的父级 id

- bfs 利用队列实现，循环中做的是 push => shift => push => shift
- dfs 利用栈实现，循环中做的是 push => pop => push => pop

```js
const data = [
  {
    id: '1',
    name: 'test1',
    children: [
      {
        id: '11',
        name: 'test11',
        children: [
          {
            id: '111',
            name: 'test111',
          },
          {
            id: '112',
            name: 'test112',
          },
        ],
      },
    ],
  },
]

const find = (data, id, mode = 'bfs') => {
  const quene = [...data]
  do {
    // const current = quene.shift()
    const current = quene[mode === 'bfs' ? 'shift' : 'pop']()
    if (current.children) {
      quene.push(
        ...current.children.map((x) => ({
          ...x,
          path: (current.path || current.id) + '-' + x.id,
        }))
      )
    }
    if (current.id === id) {
      return current
    }
  } while (quene.length)
  return undefined
}

console.log(find(data, '112')) // {id: '112', name: 'test112', path: '1-11-112'}
```

## 035 给定两个大小为 m 和 n 的有序数组 nums1 和 nums2，请找出这两个有序数组的中位数

示例 1：nums1 = [1, 3]，nums2 = [2]，中位数是 2.0
示例 2：nums1 = [1, 2]，nums2 = [3, 4]，中位数是(2 + 3) / 2 = 2.5

```js
const findMedianSortedArrays = (nums1, nums2) => {
  let nums = []
  while (nums1.length && nums2.length) {
    if (nums1[0] < nums2[0]) {
      nums.push(nums1.shift())
    } else {
      nums.push(nums2.shift())
    }
  }
  nums = [...nums, ...nums1, ...nums2]

  let media
  if (nums.length % 2) {
    media = nums[Math.floor(nums.length / 2)]
  } else {
    const m = nums.length / 2
    media = (nums[m - 1] + nums[m]) / 2
  }
  return media
}
```

## 036 修改以下 print 函数，使之输出 0 到 99，或者 99 到 0

要求：

1. 只能修改 setTimeout 到 `Math.floor(Math.random() * 1000` 的代码
2. 不能修改 `Math.floor(Math.random() * 1000`
3. 不能使用全局变量

```js
function print(n) {
  setTimeout(() => {
    console.log(n)
  }, Math.floor(Math.random() * 1000))
}
for (var i = 0; i < 100; i++) {
  print(i)
}
```

有 2 种方法

1. 立即执行函数
2. 定时器第二位重新赋固定的值

```js
// 方法一
function print(n) {
  setTimeout(
    (() => {
      console.log(n)
    })(),
    Math.floor(Math.random() * 1000)
  )
}

// 方法二
function print(n) {
  setTimeout(
    () => {
      console.log(n)
    },
    1,
    Math.floor(Math.random() * 1000)
  )
}
```

```js
setTimeout(func|code, delay,a,b,c ..)  // 第一个参数是执行体，第二个参数是延时时间，后面的参数可以作为参数传入第一个函数执行体内作为参数使用
```

## 037 模拟实现一个 localStorage

```js
const localStorageMock = (function () {
  let store = {}
  return {
    getItem: function (key) {
      return store[key] || null
    },
    setItem: function (key, value) {
      store[key] = value.toString()
    },
    removeItem: function (key) {
      delete store[key]
    },
    clear: function () {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage2', {
  value: localStorageMock,
})

localStorage2.setItem('test', 'test')
console.log(localStorage2.getItem('test')) //test
localStorage2.removeItem('test')
console.log(localStorage2.getItem('test')) //null
localStorage2.setItem('test', 'test')
localStorage2.clear()
console.log(localStorage2.getItem('test')) //null
```

## 038 匹配 elective 后的数字输出

url 有三种情况

```
https://www.xx.cn/api?keyword=&level1=&local_batch_id=&elective=&local_province_id=33
https://www.xx.cn/api?keyword=&level1=&local_batch_id=&elective=800&local_province_id=33
https://www.xx.cn/api?keyword=&level1=&local_batch_id=&elective=800,700&local_province_id=33
```

匹配 elective 后的数字输出（写出你认为的最优解法）: [] || ['800'] || ['800','700']

```js
function getUrlValue(url) {
  if (!url) return
  let res = url.match(/(?<=elective=)(\d+(,\d+)*)/)
  return res ? res[0].split(',') : []
}
```

```js
new URLSearchParams(url).get('elective')
```

## 039 分别写出如下代码的返回值

```js
String('11') == new String('11') // true
String('11') === new String('11') // false
```

new String() 返回的是对象，== 的时候，实际运行的是 `String('11') == new String('11').toString();`

## 040 如何快速从一个巨大的数组中随机获取部分元素

比如有个数组有 100K 个元素，从中不重复随机选取 10K 个元素。

```js
/* 洗牌算法：
    1.生成一个0 - arr.length 的随机数
    2.交换该随机数位置元素和数组的最后一个元素，并把该随机位置的元素放入结果数组
    3.生成一个0 - arr.length - 1 的随机数
    4.交换该随机数位置元素和数组的倒数第二个元素，并把该随机位置的元素放入结果数组
    依次类推，直至取完所需的10k个元素
*/

function shuffle(arr, size) {
  let result = []
  for (let i = 0; i < size; i++) {
    const randomIndex = Math.floor(Math.random() * (arr.length - i))
    const item = arr[randomIndex]
    result.push(item)
    arr[randomIndex] = arr[arr.length - 1 - i]
    arr[arr.length - 1 - i] = item
  }
  return result
}
```

## 041 数字连续，输入 '1, 2, 3, 5, 7, 8, 10' 输出 '1~3, 5, 7~8, 10'

请写一个函数，完成以下功能，输入 '1, 2, 3, 5, 7, 8, 10' 输出 '1~3, 5, 7~8, 10'。

这道题的意思是：如果连续数字的话，就取连续的第一个数和最后一个数，中间用~隔开。如果不连续就用，隔开。

```js
const nums = [1, 2, 3, 5, 7, 8, 10]
const simplifyStr = (nums) => {
  const result = []
  let temp = nums[0]
  nums.forEach((value, index) => {
    if (value + 1 !== nums[index + 1]) {
      if (temp !== value) {
        result.push(`${temp}~${value}`)
      } else {
        result.push(`${value}`)
      }
      temp = nums[index + 1]
    }
  })
  return result
}
console.log(simplifyStr(nums).join(','))
```

## 042 flatObj

写个程序把 entry 转换成如下对象

```
var entry = {
a: {
 b: {
   c: {
     dd: 'abcdd'
   }
 },
 d: {
   xx: 'adxx'
 },
 e: 'ae'
}
}

// 要求转换成如下对象
var output = {
'a.b.c.dd': 'abcdd',
'a.d.xx': 'adxx',
'a.e': 'ae'
}
```

```js
const entry = {
  a: {
    b: {
      c: {
        dd: 'abcdd',
      },
    },
    d: {
      xx: 'adxx',
    },
    e: 'ae',
  },
}

const flatObj = (obj, parentKey = '', result = {}) => {
  Object.keys(obj).forEach((k) => {
    const newKey = `${parentKey}${k}`
    if (typeof obj[k] === 'object') {
      flatObj(obj[k], newKey + '.', result)
    } else {
      result[newKey] = obj[k]
    }
  })
  return result
}
```

## 043 出字符串中连续出现最多的字符

```
'abcaakjbb' => {'a':2,'b':2}
'abbkejsbcccwqaa' => {'c':3}
```

```js
const str = 'abcaakjbb'
const arr = str.match(/(\w)\1*/g) // ['a', 'b', 'c', 'aa', 'k', 'j', 'bb']
const maxLen = Math.max(...arr.map((s) => s.length))
const result = arr.reduce((pre, curr) => {
  if (curr.length === maxLen) {
    pre[curr[0]] = curr.length // curr[0] 的意思是 aa 只取 a
  }
  return pre
}, {})

console.log(result)
```

**正则表达式中的小括号"()"。是代表分组的意思。如果再其后面出现\1 则是代表与第一个小括号中要匹配的内容相同。**

## 044 wait 同步执行

```js
function wait() {
  return new Promise((resolve) => setTimeout(resolve, 10 * 1000))
}

async function main() {
  console.time()
  const x = await wait() // 每个都是都执行完才结, 包括setTimeout（10*1000）的执行时间
  const y = await wait() // 执行顺序 x->y->z 同步执行，x 与 setTimeout 属于同步执行
  const z = await wait()
  console.timeEnd() // default: 30099.47705078125ms

  console.time()
  const x1 = wait() // x1,y1,z1 同时异步执行，包括setTimeout（10*1000）的执行时间
  const y1 = wait() // x1 与 setTimeout 属于同步执行
  const z1 = wait()
  await x1
  await y1
  await z1
  console.timeEnd() // default: 10000.67822265625ms

  console.time()
  const x2 = wait() // x2,y2,z2 同步执行，但是不包括setTimeout（10*1000）的执行时间
  const y2 = wait() // x2 与 setTimeout 属于异步执行
  const z2 = wait()
  x2, y2, z2
  console.timeEnd() // default: 0.065185546875ms
}
main()
```

## 045 用 setTimeout 实现 setInterval

```js
function mySetInterval() {
  mySetInterval.timer = setTimeout(() => {
    arguments[0]()
    mySetInterval(...arguments)
  }, arguments[1])
}

mySetInterval.clear = function () {
  clearTimeout(mySetInterval.timer)
}

mySetInterval(() => {
  console.log(11111)
}, 1000)

setTimeout(() => {
  // 5s 后清理
  mySetInterval.clear()
}, 5000)
```

## 046 求两个日期中间的有效日期

```js
const rangeDay = (start, end) => {
  const result = []
  const startTime = start.getTime()
  const endTime = end.getTime()
  const range = endTime - startTime
  const oneDay = 24 * 60 * 60 * 1000
  let total = 0
  while (total <= range) {
    result.push(new Date(startTime + total).toLocaleDateString().replace(/\//g, '-'))
    total += oneDay
  }
  return result
}

rangeDay(new Date('2015-02-28'), new Date('2015-03-03'))
// ['2015-2-28', '2015-3-1', '2015-3-2', '2015-3-3']
```

## 047 黄、红、蓝三色球排序

在一个字符串数组中有红、黄、蓝三种颜色的球，且个数不相等、顺序不一致，请为该数组排序。使得排序后数组中球的顺序为:黄、红、蓝。例如：红蓝蓝黄红黄蓝红红黄红，排序后为：黄黄黄红红红红红蓝蓝蓝。

```js
const arr = '红蓝蓝黄红黄蓝红红黄红'
const obj = { 黄: 0, 红: 1, 蓝: 2 }
arr
  .split('')
  .sort((a, b) => obj[a] - obj[b])
  .join('')
```

## 048 求多个数组之间的交集

```js
function intersect(...args) {
  if (args.length === 0) {
    return []
  }

  if (args.length === 1) {
    return args[0]
  }

  return args.reduce((result, arg) => {
    return result.filter((item) => arg.includes(item))
  })
}
```

## 049 数字千分位

将 '10000000000' 形式的字符串，以每 3 位进行分隔展示 '10.000.000.000'。

```js
// 寻找字符空隙加 .
'10000000000'.replace(/\B(?=(\d{3})+(?!\d))/g, '.')

// 寻找数字并在其后面加 .
'10000000000'.replace(/(\d)(?=(\d{3})+\b)/g, '$1.')
```

扩展：

\b 是单词边界，具体就是 \w 与 \W 之间的位置，也包括 \w 与 ^ 之间的位置，和 \w 与 $ 之间的位置。

```js
var result = '[JS] Lesson_01.mp4'.replace(/\b/g, '#')
console.log(result) // "[#JS#] #Lesson_01#.#mp4#"

var result = '[JS] Lesson_01.mp4'.replace(/\B/g, '#')
console.log(result) // "#[J#S]# L#e#s#s#o#n#_#0#1.m#p#4"
```

(?=p)，其中 p 是一个子模式，即 p 前面的位置，或者说，该位置后面的字符要匹配 p，而 (?!p) 就是 (?=p) 的反面意思。

```js
var result = 'hello'.replace(/(?=l)/g, '#')
console.log(result) // "he#l#lo"

var result = 'hello'.replace(/(?!l)/g, '#')
console.log(result) // "#h#ell#o#"
```

二者的学名分别是 positive lookahead 和 negative lookahead。中文翻译分别是正向先行断言和负向先行断言。

## 050 字符转 Base64

```js
let encodedData = window.btoa('this is a example')
console.log(encodedData) // dGhpcyBpcyBhIGV4YW1wbGU=

let decodeData = window.atob(encodedData)
console.log(decodeData) // this is a example
```

## 051 二分查找如何定位左边界和右边界？

```js
//递归查找基础代码
function erfen_digui(arr, val, left = 0, right = arr.length - 1) {
  if (left > right) {
    return -1
  }
  let cent = Math.floor((right + left) / 2)
  if (arr[cent] === val) {
    return `最终查找结果下标为${cent}`
  } else if (arr[cent] > val) {
    right = cent - 1
  } else {
    left = cent + 1
  }
  return erfen_digui(arr, val, left, right)
}

//左边界（查找第一个元素）
function erfen_digui(arr, val, left = 0, right = arr.length - 1) {
  if (left > right) {
    return -1
  }
  let cent = Math.floor((right + left) / 2)
  if (arr[cent] === val) {
    /****************改动点********************/
    if (arr[cent - 1] === val) {
      right = cent - 1
    } else {
      return `最终查找结果下标为${cent}`
    }
    /*****************************************/
  } else if (arr[cent] > val) {
    right = cent - 1
  } else {
    left = cent + 1
  }
  return erfen_digui(arr, val, left, right)
}

// 右边界（查找最后一个元素）
function erfen_digui(arr, val, left = 0, right = arr.length - 1) {
  if (left > right) {
    return -1
  }
  let cent = Math.floor((right + left) / 2)
  if (arr[cent] === val) {
    /****************改动点********************/
    if (arr[cent + 1] === val) {
      left = cent + 1
    } else {
      return `最终查找结果下标为${cent}`
    }
    /*****************************************/
  } else if (arr[cent] > val) {
    right = cent - 1
  } else {
    left = cent + 1
  }
  return erfen_digui(arr, val, left, right)
}
```

## 052 实现一个 normalize 函数，能将输入的特定的字符串转化为特定的结构化数据

字符串仅由小写字母和 [] 组成，且字符串不会包含多余的空格。
示例一: 'abc' --> {value: 'abc'}
示例二：'[abc[bcd[def]]]' --> {value: 'abc', children: {value: 'bcd', children: {value: 'def'}}}

```js
let str = '[abc[bcd[def]]]'

const normalize = (str) => {
  let result = {}
  str
    .split(/[\[\]]/g) // ['', 'abc', 'bcd', 'def', '', '', '']
    .filter(Boolean) // ['abc', 'bcd', 'def']
    .reduce((obj, item, index, a) => {
      obj.value = item
      if (index !== a.length - 1) {
        return (obj.children = {})
      }
    }, result)
  return result
}
```

## 053 实现一个批量请求函数 multiRequest(urls, maxNum)

要求如下：

1. 要求最大并发数 maxNum
2. 每当有一个请求返回，就留下一个空位，可以增加新的请求
3. 所有请求完成后，结果按照 urls 里面的顺序依次打出

```js
function multiRequest(urls, maxNum) {
  const ret = []
  let i = 0
  let resolve
  const promise = new Promise((r) => (resolve = r)) // resolve 赋值
  const addTask = () => {
    if (i >= urls.length) {
      // 全部任务结束
      return resolve()
    }

    const task = request(urls[i++]).finally(() => {
      addTask() // 如果有任务结束，则添加新任务
    })
    ret.push(task)
  }

  while (i < maxNum) {
    addTask() // 初始时添加任务至最大并发数
  }

  return promise.then(() => Promise.all(ret))
}

// 模拟请求
function request(url) {
  return new Promise((r) => {
    const time = Math.random() * 1000
    setTimeout(() => r(url), time)
  })
}
```

## 054 模拟实现 Array.prototype.splice

有几点需要注意的：

1. 第一个参数，开始下标
2. 第二个参数，删除个数
3. 从第三个开始往后都是插入的数据
4. 操作的都是原数组，也就是改变的是原数组
5. 返回一个被删除的数据的新数组

```js
Array.prototype._splice = function (start, deleteCount, ...addList) {
  if (start < 0) {
    if (Math.abs(start) > this.length) {
      start = 0
    } else {
      start += this.length
    }
  }

  if (typeof deleteCount === 'undefined') {
    deleteCount = this.length - start
  }

  const removeList = this.slice(start, start + deleteCount)

  const right = this.slice(start + deleteCount)

  let addIndex = start
  addList.concat(right).forEach((item) => {
    this[addIndex] = item
    addIndex++
  })
  this.length = addIndex

  return removeList
}
```

## 055 实现 Promise.retry，成功后 resolve 结果，失败后重试，尝试超过一定次数才真正的 reject

```js
Promise.retry = function (fn, times = 3) {
  return new Promise(async (resolve, reject) => {
    while (times--) {
      try {
        const ret = await fn()
        resolve(ret)
        break
      } catch (error) {
        if (!times) reject(error)
      }
    }
  })
}
function request() {
  return new Promise((resolve, reject) => {
    setTimeout(() => (Math.random() > 0.9 ? resolve(n) : reject(n)), 1000)
  })
}
Promise.retry(request)
```

## 056 循环异步串行

输出以下代码运行结果，为什么？如果希望每隔 1s 输出一个结果，应该如何改造？注意不可改动 square 方法？

```js
const list = [1, 2, 3]
const square = (num) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(num * num)
    }, 1000)
  })
}

function test() {
  list.forEach(async (x) => {
    const res = await square(x)
    console.log(res)
  })
}
test()
```

forEach 是不能阻塞的，默认是请求并行发起，所以是同时输出 1、4、9。

串行解决方案：

```js
async function test() {
  for (let i = 0; i < list.length; i++) {
    let x = list[i]
    const res = await square(x)
    console.log(res)
  }
}
```

当然，也可以用 for of 语法，就是帅：

```js
async function test() {
  for (let x of list) {
    const res = await square(x)
    console.log(res)
  }
}
```

还有一个更硬核点的，也是 axios 源码里所用到的，利用 promise 本身的链式调用来实现串行。

```js
let promise = Promise.resolve()
function test(i = 0) {
  if (i === list.length) return
  promise = promise.then(() => square(list[i]))
  test(i + 1)
}
test()
```

## 057 数组非零非负最小值 index

[10,21,0,-7,35,7,9,23,18] 输出 5， 因为 7 最小。

```js
const minIndex = (arr) => arr.reduce((num, v, i) => (v > 0 && v < arr[num] ? i : num), 0)
```

## 058 实现对象的 Map 函数类似 Array.prototype.map

```js
Object.prototype.map = function (handleFn, thisValue) {
  const obj = this
  let res = {}
  for (let prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      // 三个参数，当前值，可选的索引值，可选的当前对象
      res[prop] = handleFn.call(thisValue, obj[prop], prop, obj)
    }
  }
  return res
}
```

## 059 异步输出

```js
var date = new Date()

console.log(1, new Date() - date)

setTimeout(() => {
  console.log(2, new Date() - date)
}, 500)

Promise.resolve().then(console.log(3, new Date() - date))

while (new Date() - date < 1000) {}

console.log(4, new Date() - date)
```

解析：

- 首先执行同步代码，输出 1 0
- 遇到 setTimeout，定时 500ms 后执行，此时将 setTimeout 交给异步线程，主线程继续执行下一步，异步线程执行 setTimeout
- 主线程执行 `Promise.resolve().then`，**`.then` 的参数不是函数，直接执行 (value => value)**，输出 3 1
- 主线程继续执行同步任务 whlie ，等待 1000ms，在此期间，setTimeout 定时 500ms 完成，异步线程将 setTimeout 回调事件放入宏任务队列中
- 继续执行下一步，输出 4 1000
- 检查微任务队列，为空
- 检查宏任务队列，执行 setTimeout 宏任务，输入 2 1000

总结：

- Promise 构造函数是同步执行的，then 方法是异步执行的
- **`.then` 或者 `.catch` 的参数期望是函数，传入非函数则会直接执行**
- Promise 的状态一经改变就不能再改变，构造函数中的 resolve 或 reject 只有第一次执行有效，多次调用没有任何作用
- `.then` 方法是能接收两个参数的，第一个是处理成功的函数，第二个是处理失败的函数，再某些时候你可以认为 `.catch` 是 `.then` 第二个参数的简便写法
- 当遇到 `promise.then` 时， 如果当前的 Promise 还处于 pending 状态，我们并不能确定调用 resolved 还是 rejected，只有等待 promise 的状态确定后，再做处理，所以我们需要把我们的两种情况的处理逻辑做成 callback 放入 promise 的回调数组内，当 promise 状态翻转为 resolved 时，才将之前的 `promise.then` 推入微任务队列

## 060 排序算法

### 冒泡排序

原理：依次比较两个相邻的值，如果后者较小，则交换两者的顺序，让最大的值排在最后，时间复杂度 O(n^2)。

```js
function bubleSort(arr = []) {
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = 0; j < arr.length - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        ;[arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
      }
    }
  }
  return arr
}
```

### 快速排序

原理：使用到了递归思想，时间复杂度 O(nlogn)。

1. 新建两个空数组 left、right
2. 然后找到数组的基准值 `point = arr[Math.floor(arr.length/2)]`
3. 遍历数组的每一项，小于这个基准值的项放到 left 数组，大于基准值的放到 right 数组
4. 然后按照步骤 2、3，递归上面 left、right 数组
5. 最后将 left、基准值和 right 数组用 concat 拼接起来

```js
function quickSort(arr = []) {
  if (arr.length <= 1) {
    return arr
  }
  let left = [],
    right = []
  let pivot = arr[Math.floor(arr.length / 2)]
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] < pivot) {
      left.push(arr[i])
    } else if (arr[i] > pivot) {
      right.push(arr[i])
    }
  }
  return quickSort(left).concat([pivot], quickSort(right))
}
```

### 插入排序

时间复杂度 O(n^2)。

1. 将一组数据的首个数据组成有序区间，其他数据组成无序区间
2. 在无序区间抽出首个数据 A
3. A 依次与有序区间的各个数据进行对比。若遇到数据比 A 大的，则将 A 插入到该数据的前面一个位置，若 A 比有序区间的任何数据都要大，则插入到有序区间末尾。总之，保证插入后的有序区间依然有序。
4. 重复 2 和 3 操作，直到无序区间没有数据

```js
function insertSort(arr = []) {
  for (let i = 1; i < arr.length; i++) {
    for (let j = i; j > 0; j--) {
      if (arr[j] < arr[j - 1]) {
        ;[arr[j], arr[j - 1]] = [arr[j - 1], arr[j]]
      }
    }
  }
  return arr
}
```

## 061 Hook 实现节流防抖

```js
import { useEffect, useState, useCallback, useRef } from "react";

export default function useThrottle(fn, delay) {
  const timer = useRef(-1);
  const throttle = useCallback(() => {
    if (timer.current > -1) {
      return;
    }
    timer.current = setTimeout(() => {
      fn();
      timer.current = -1;
      clearTimeout(timer.current);
    }, delay);
  }, [fn, delay]);
  return throttle;
}

export default function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}
```
