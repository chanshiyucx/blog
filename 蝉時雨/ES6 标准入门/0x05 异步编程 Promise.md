Promise 是异步编程的一种解决方案，比传统的解决方案——回调函数和事件——更合理且更强大。，ES6 将其写进了语言标准，并原生提供了 Promise 对象。<!-- more -->

## Promise 对象

### Promise 含义

所谓 Promise，简单来说就是一个容器，里面保存着某个未来才会结束的事件（通常是一个异步操作）的结果。从语法上来说，Promise 是一个对象。Promise 对象有以下两个特点：

1. 对象的状态不受外界影响。Promise 对象代表一个异步操作，有 3 种状态：Pending（进行中）、Fulfilled（已成功）和 Rejected（已失败）。只有异步操作的结果可以决定当前是哪一种状态，任何其他操作都无法改变这个状态。这也是“Promise”这个名字的由来，它在英语中意思就是“承诺”，表示其他手段无法改变。
2. 一旦状态改变就不会再变，任何时候都可以得到这个结果。Promise 对象的状态改变只有两种可能：从 Pending 变为 Fulfilled 和从 Pending 变为 Rejected。只要这两种情况发生，状态就凝固了，不会再，这时就称为 Resolved（已定型）。就算改变已经发生，再对 Promise 对象添加回调函数，也会立即得到这个结果。这与事件（Event）完全不同。事件的特点是，如果错过了它，再去监听是得不到结果的。

Promise 也有一些缺点。首先，无法取消 Promise，一旦新建它就会立即执行，无法中途取消。其次，如果不设置回调函数，Promise 内部抛出的错误不会反应到外部。再者，当处于 Pending 状态时，无法得知目前进展到哪一个阶段（刚刚开始还是即将完成）。

### 基本用法

ES6 规定，Promise 对象是一个构造函数，用来生成 Promise 实例。

Promise 构造函数接受一个函数作为参数，该函数的两个参数分别是 resolve 和 reject。它们是两个函数，由 JavaScript 引擎提供，不用自己部署。

resolve 函数将 Promise 对象的状态从“未完成”变为“成功”（即从 Pending 变为 Resolved），在异步操作成功时调用，并将异步操作的结果作为参数传递出去；reject 函数将 Promise 对象的状态从“未完成”变为“失败”（即从 Pending 变为 Rejected），在异步操作失败时调用，并将异步操作报出的错误作为参数传递出去。

Promise 实例生成以后，可以用 then 方法分别指定 Resolved 状态和 Rejected 状态的回调函数。

```javascript
const promise = new Promise(function(resolve, reject) {
  // ... some code
  if (/* 异步操作成功 */) {
    resolve(value)
  } else {
    reject(error)
  }
})

promise.then(
  function(value) {
    // success
  },
  function(error) {
    // failure
  }
)
```

then 方法可以接受两个回调函数作为参数。第一个回调函数是 Promise 对象的状态变为 Resolved 时调用，第二个可选回调函数是 Promise 对象的状态变为 Rejected 时调用。这两个函数都接受 Promise 对象传出的值作为参数。

**Promise 新建后就会立即执行**：

```javascript
let promise = new Promise(function(resolve, reject) {
  console.log('Promise')
  resolve()
})
promise.then(function() {
  console.log('Resolved.')
})
console.log('Hi!')
// Promise
// Hi!
// Resolved
```

上面代码中，Promise 新建后会立即执行，所以首先输出的是 Promise。然后，then 方法指定的回调函数将在当前脚本所有同步任务执行完成后才会执行，所以 Resolved 最后输出。

resolve 函数的参数除了正常的值外，还可能是另一个 Promise 实例：

```javascript
const p1 = new Promise(function(resolve, reject) {
  setTimeout(() => reject(new Error('fail')), 3000)
})
const p2 = new Promise(function(resolve, reject) {
  setTimeout(() => resolve(p1), 1000)
})

p2.then(result => console.log(result)).catch(error => console.log(error)) // Error: fail
```

上面的代码中，p1 和 p2 都是 Promise 的实例，但是 p2 的 resolve 方法将 p1 作为参数，此时 p1 的状态就会传递给 p2。也就是说，**p1 的状态决定了 p2 的状态**。如果 p1 的状态是 Pending，那么 p2 的回调函数就会等待 p1 的状态改变；如果 p1 的状态已经是 Resolved 或 Rejected，那么 p2 的回调函数将会立刻执行。

需要注意的是：**调用 resolve 或 reject 并不会终结 Promise 的参数函数的执行**。

```javascript
new Promise((resolve, reject) => {
  resolve(1)
  console.log(2)
}).then(r => {
  console.log(r)
})
// 2
// 1
```

上面的代码中，调用 resolve(1)以后，后面的 console.log(2)还是会执行，并且会首先打印出来。**这是因为立即 resolved 的 Promise 是在本轮事件循环的末尾执行，总是晚于本轮循环的同步任务**。所以，最好在它们前面加上 return 语句，这样就不会产生意外。

```javascript
new Promise((resolve, reject) => {
  return resolve(1)
  // 后面的语句不会执行
  console.log(2)
})
```

### Promise.prototype.then()

Promise 实例 then 方法是定义在原型对象 Promise.prototype 上。then 方法返回的是一个新的 Promise 实例，因此可以采用链式写法。

### Promise.prototype.catch()

Promise.prototype.catch 方法是.then(null, rejection) 的别名，用于指定发生错误时的回调函数。

异步操作 reject 抛出的错误和 then 方法回调函数在运行中抛出的错误，都会被 catch 方法捕获。

```javascript
p.then(val => console.log('fulfilled:', val)).catch(err =>
  console.log('rejected', err)
)

// 等同于
p.then(val => console.log('fulfilled:', val)).then(null, err =>
  console.log('rejected:', err)
)
```

**如果 Promise 状态已经变成 Resolved，再抛出错误是无效的**：

```javascript
const promise = new Promise(function(resolve, reject) {
  resolve('ok')
  throw new Error('test')
})
promise
  .then(function(value) {
    console.log(value)
  })
  .catch(function(error) {
    console.log(error)
  }) // ok
```

上面的代码中，Promise 在 resolve 语句后面再抛出错误，并不会被捕获，等于没有抛出。因为 Promise 的状态一旦改变，就会永久保持该状态，不会再改变了。

Promise 对象的错误具有“冒泡”性质，会一直向后传递，直到被捕获为止。也就是说，错误总是会被下一个 catch 语句捕获。

一般说来，不要在 then 方法中定义 Rejected 状态的回调函数（即 then 的第二个参数），而应总是使用 catch 方法。

> 跟传统的 try/catch 代码块不同的是，如果没有使用 catch 方法指定错误处理的回调函数，Promise 对象抛出的错误不会传递到外层代码，即不会有任何反应。

```javascript
const someAsyncThing = function() {
  return new Promise(function(resolve, reject) {
    // 下面一行会报错，因为x没有声明
    resolve(x + 2)
  })
}
someAsyncThing().then(function() {
  console.log('everything is great')
})
```

上面的代码中，由于没有指定 catch 方法，错误不会被捕获，也不会传递到外层代码。正常情况下，运行后不会有任何输出。如果这个脚本放在服务器中执行，退出码就是 0（即表示执行成功）。

```javascript
const promise = new Promise(function(resolve, reject) {
  resolve('ok')
  setTimeout(function() {
    throw new Error('test')
  }, 0)
})
promise.then(function(value) {
  console.log(value)
})
// ok
// Uncaught Error: test
```

上面的代码中，Promise 指定在下一轮“事件循环”再抛出错误。那时，Promise 的运行已经结束，所以这个错误是在 Promise 函数体外抛出的，会冒泡到最外层，成了未捕获的错误。

需要注意的是，catch 方法返回的还是一个 Promise 对象，因此后面还可以接着调用 then 方法。此时要是后面的 then 方法里面报错，就与前面的 catch 无关了。

### Promise.all()

### Promise.race()

### Promise.resolve()

### Promise.reject()

### 附加方法

#### done()

#### finally()

### 应用

### Promise.try()
