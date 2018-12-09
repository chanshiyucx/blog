Generator 函数是 ES6 提供的一种异步编程解决方案，语法行为与传统函数完全不同。此前，只在 dva（内部封装 redux-saga）里使用过，此次深入了解之。<!-- more -->

## Generator 函数

### 简介

#### 基本概念

Generator 函数可以理解成一个状态机，封装了多个内部状态。执行 Generator 函数会返回一个遍历器对象。返回的遍历器对象可以依次遍历 Generator 函数内部的每一个状态。也就是说，Generator 函数除了是状态机，还是一个遍历器对象生成函数。

Generator 函数的调用方法与普通函数一样。不同的是，调用 Generator 函数后，该函数并不执行，返回的也不是函数运行结果，而是一个指向内部状态的指针对象，也就是遍历器对象。

每次调用 next 方法，内部指针就从函数头部或上一次停下来的地方开始执行，直到遇到下一条 yield 语句（或 return 语句）为止。换言之，**Generator 函数是分段执行的，yield 语句是暂停执行的标记，而 next 方法可以恢复执行**。

```javascript
function* helloWorldGenerator() {
  yield 'hello'
  yield 'world'
  return 'ending'
}
let hw = helloWorldGenerator()

hw.next() // { value: 'hello', done: false }
hw.next() // { value: 'world', done: false }
hw.next() // { value: 'ending', done: true }
hw.next() // { value: undefined, done: true }
```

#### yield 表达式

遍历器对象的 next 方法的运行逻辑如下：

1. 遇到 yield 语句就暂停执行后面的操作，并将紧跟在 yield 后的表达式的值作为返回的对象的 value 属性值。
2. 下一次调用 next 方法时再继续往下执行，直到遇到下一条 yield 语句。
3. 如果没有再遇到新的 yield 语句，就一直运行到函数结束，直到 return 语句为止，并将 return 语句后面的表达式的值作为返回对象的 value 属性值。
4. 如果该函数没有 return 语句，则返回对象的 value 属性值为 undefined。

> 只有调用 next 方法且内部指针指向该语句时才会执行 yield 语句后面的表达式，因此等于为 JavaScript 提供了手动的“惰性求值”（Lazy Evaluation）的语法功能。

```javascript
function* gen() {
  yield 123 + 456
}
```

上面的代码中，yield 后面的表达式不会立即求值，只会在 next 方法将指针移到这一句时才求值。

Generator 函数可以不用 yield 语句，这时就变成了一个单纯的暂缓执行函数。

```javascript
function* f() {
  console.log('执行了！')
}
let generator = f()
setTimeout(function() {
  generator.next()
}, 2000)
```

上面的代码中，函数 f 如果是普通函数，在为变量 generator 赋值时就会执行。但是函数 f 是一个 Generator 函数，于是就变成只有调用 next 方法时才会执行。

#### 与 Iterator 接口的关系

任意一个对象的 Symbol.iterator 方法等于该对象的遍历器对象生成函数，调用该函数会返回该对象的一个遍历器对象。

由于 Generator 函数就是遍历器生成函数，因此可以把 Generator 赋值给对象的 Symbol.iterator 属性，从而使得该对象具有 Iterator 接口。

```javascript
let myIterable = {}
myIterable[Symbol.iterator] = function*() {
  yield 1
  yield 2
  yield 3
}
;[...myIterable] // [1, 2, 3]
```

### next 方法

yield 语句本身没有返回值，或者说总是返回 undefined。**next 方法可以带有一个参数，该参数会被当作上一条 yield 语句的返回值**。

```javascript
function* f() {
  for (let i = 0; true; i++) {
    let reset = yield i
    if (reset) {
      i = -1
    }
  }
}
let g = f()
g.next() // { value: 0, done: false }
g.next() // { value: 1, done: false }
g.next(true) // { value: 0, done: false }
```

上面的代码先定义了一个可以无限运行的 Generator 函数 f，如果 next 方法没有参数，每次运行到 yield 语句时，变量 reset 的值总是 undefined。当 next 方法带有一个参数 true 时，当前的变量 reset 就被重置为这个参数（即 true），因而 i 会等于 -1，下一轮循环就从-1 开始递增。

这个功能重要的语法意义在于 Generator 函数从暂停状态到恢复运行，其上下文状态（context）是不变的。通过 next 方法的参数就有办法在 Generator 函数开始运行后继续向函数体内部注入值，从而调整函数行为。

```javascript
function* foo(x) {
  let y = 2 * (yield x + 1)
  let z = yield y / 3
  return x + y + z
}

let a = foo(5)
a.next() // Object{value:6, done:false}
a.next() // Object{value:NaN, done:false}
a.next() // Object{value:NaN, done:true}

let b = foo(5)
b.next() // { value:6, done:false }
b.next(12) // { value:8, done:false }
b.next(13) // { value:42, done:true }
```

需要注意：由于 next 方法的参数表示上一条 yield 语句的返回值，所以第一次使用 next 方法时传递参数是无效的。V8 引擎直接忽略第一次使用 next 方法时的参数，只有从第二次使用 next 方法开始，参数才是有效的。从语义上讲，第一个 next 方法用来启动遍历器对象，所以不用带有参数。

```javascript
function* dataConsumer() {
  console.log('Started')
  console.log(`1. ${yield}`)
  console.log(`2. ${yield}`)
  return 'result'
}
let genObj = dataConsumer()
genObj.next() // Started
genObj.next('a') // 1. a
genObj.next('b') // 2. b
```

### for...of 循环

for...of 循环可以自动遍历 Generator 函数生成的 Iterator 对象，且此时不再需要调用 next 方法。

```javascript
function* foo() {
  yield 1
  yield 2
  return 3
}
for (let v of foo()) {
  console.log(v) // 1 2
}
```

一旦 next 方法的返回对象的 done 属性为 true，for...of 循环就会终止，且不包含该返回对象，所以上面的 return 语句返回的 3 不包括在 for...of 循环中。

下面是一个利用 Generator 函数和 for...of 循环实现斐波那契数列的例子：

```javascript
function* fibonacci() {
  let [prev, curr] = [0, 1]
  for (;;) {
    ;[prev, curr] = [curr, prev + curr]
    yield curr
  }
}

for (let n of fibonacci()) {
  if (n > 1000) break
  console.log(n)
}
```

除了 for...of 循环，扩展运算符（...）、解构赋值和 Array.from 方法内部调用的都是遍历器接口。可以将 Generator 函数返回的 Iterator 对象作为参数：

```javascript
function* numbers() {
  yield 1
  yield 2
  return 3
  yield 4
}
// 扩展运算符
;[...numbers()] // [1, 2]

// Array.from方法
Array.from(numbers()) // [1, 2]

// 解构赋值
let [x, y] = numbers()
x // 1
y // 2
```

<!-- ### Generator.prototype.throw()

### Generator.prototype.return() -->

### yield\* 表达式

如果在 Generator 函数内部调用另一个 Generator 函数，需要用到 yield\* 语句。

```javascript
function* foo() {
  yield 'a'
  yield 'b'
}
function* bar() {
  yield 'x'
  yield* foo()
  yield 'y'
}
```

### Generator 函数 this

### 状态机与协程

### 应用
