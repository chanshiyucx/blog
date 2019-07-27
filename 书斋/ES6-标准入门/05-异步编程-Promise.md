# 异步编程 Promise

Promise 是异步编程的一种解决方案，比传统的解决方案——回调函数和事件——更合理且更强大。，ES6 将其写进了语言标准，并原生提供了 Promise 对象。

## Promise 对象

### Promise 含义

所谓 Promise，简单来说就是一个容器，里面保存着某个未来才会结束的事件（通常是一个异步操作）的结果。Promise 对象有以下两个特点：

1. 对象的状态不受外界影响。Promise 对象代表一个异步操作，有 3 种状态：Pending（进行中）、Fulfilled（已成功）和 Rejected（已失败）。只有异步操作的结果可以决定当前是哪一种状态，任何其他操作都无法改变这个状态。
2. 一旦状态改变就不会再变，任何时候都可以得到这个结果。Promise 对象的状态改变只有两种可能：从 Pending 变为 Fulfilled 和从 Pending 变为 Rejected。只要这两种情况发生，状态就凝固了，这时就称为 Resolved（已定型）。就算改变已经发生，再对 Promise 对象添加回调函数，也会立即得到这个结果。这与事件（Event）完全不同。事件的特点是，如果错过了它，再去监听是得不到结果的。

Promise 也有一些缺点：

1. 无法取消 Promise，一旦新建它就会立即执行，无法中途取消。
2. 如果不设置回调函数，Promise 内部抛出的错误不会反应到外部。
3. 当处于 Pending 状态时，无法得知目前进展到哪一个阶段（刚刚开始还是即将完成）。

### 基本用法

Promise 对象是一个构造函数，用来生成 Promise 实例。

Promise 构造函数接受一个函数作为参数，该函数的两个参数分别是两个函数 resolve 和 reject，它们由引擎提供，不用自己部署。

resolve 函数将 Promise 对象的状态从 Pending 变为 Resolved，在异步操作成功时调用，并将异步操作的结果作为参数传递出去；reject 函数将 Promise 对象的状态从 Pending 变为 Rejected，在异步操作失败时调用，并将异步操作报出的错误作为参数传递出去。

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

需要注意：**调用 resolve 或 reject 并不会终结 Promise 的参数函数的执行**。

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

上面的代码中，调用 resolve(1) 以后，后面的 console.log(2) 还是会执行，并且会首先打印出来。**这是因为立即 resolved 的 Promise 是在本轮事件循环的末尾执行，总是晚于本轮循环的同步任务**。所以，最好在它们前面加上 return 语句，这样就不会产生意外。

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

`Promise.prototype.catch` 方法是 .then(null, rejection) 的别名，用于指定发生错误时的回调函数。

异步操作 reject 抛出的错误和 then 方法回调函数在运行中抛出的错误，都会被 catch 方法捕获。

```javascript
p.then(val => console.log('fulfilled:', val)).catch(err => console.log('rejected', err))

// 等同于
p.then(val => console.log('fulfilled:', val)).then(null, err => console.log('rejected:', err))
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

需要注意：catch 方法返回的还是一个 Promise 对象，因此后面还可以接着调用 then 方法。此时要是后面的 then 方法里面报错，就与前面的 catch 无关了。

### Promise.all()

`Promise.all` 方法用于将多个 Promise 实例包装成一个新的 Promise 实例。方法接受一个数组（或者具有 Iterator 接口结构）作为参数，数组成员都是 Promise 对象的实例；如果不是，就会先调用 Promise.resolve 方法，将参数转为 Promise 实例。

```javascript
const p = Promise.all([p1, p2, p3])
```

p 的状态由成员决定，分成两种情况：

1. 只有所有成员的状态都变成 Fulfilled，p 的状态才会变成 Fulfilled，此时返回值组成一个数组，传递给 p 的回调函数。
2. 只要成员中有一个被 Rejected，p 的状态就变成 Rejected，此时第一个被 Rejected 的实例的返回值会传递给 p 的回调函数。

需要注意：**如果作为参数的 Promise 实例自身定义了 catch 方法，那么它被 rejected 时并不会触发 Promise.all()的 catch 方法**。

```javascript
const p1 = new Promise((resolve, reject) => {
  resolve('hello')
})
  .then(result => result)
  .catch(e => e)

const p2 = new Promise((resolve, reject) => {
  throw new Error('报错了')
})
  .then(result => result)
  .catch(e => e)

Promise.all([p1, p2])
  .then(result => console.log(result)) // ["hello", Error: 报错了]
  .catch(e => console.log(e))
```

上面的代码中，p1 会 resolved，p2 首先会 rejected，但是 p2 有自己的 catch 方法，该方法返回的是一个新的 Promise 实例，p2 实际上指向的是这个实例。该实例执行完 catch 方法后也会变成 resolved，导致 Promise.all() 方法参数里面的两个实例都会 resolved，因此会调用 then 方法指定的回调函数，而不会调用 catch 方法指定的回调函数。如果 p2 没有自己的 catch 方法，就会调用 Promise.all() 的 catch 方法。

### Promise.race()

`Promise.race` 方法同样是将多个 Promise 实例包装成一个新的 Promise 实例。

不同的是只要成员中有一个实例率先改变状态，p 的状态就跟着改变。那个率先改变的 Promise 实例的返回值就传递给 p 的回调函数。

```javascript
const p = Promise.race([p1, p2, p3])
```

下面是一个例子，如果指定时间内没有获得结果，就将 Promise 的状态变为 Rejected，否则变为 Resolved。

```javascript
const p = Promise.race([
  fetch('/resource-that-may-take-a-while'),
  new Promise(function(resolve, reject) {
    setTimeout(() => reject(new Error('request timeout')), 5000)
  })
])
p.then(response => console.log(response))
p.catch(error => console.log(error))
```

### Promise.resolve()

Promise.resolve 方法将现有对象转为 Promise 对象。Promise.resolve 等价于下面的写法：

```javascript
Promise.resolve('foo')
// 等价于
new Promise(resolve => resolve('foo'))
```

Promise.resolve 方法的参数分成以下 4 种情况：

1. 参数是一个 Promise 实例。如果参数是 Promise 实例，那么 Promise.resolve 将不做任何修改，原封不动地返回这个实例。
2. 参数是一个 thenable 对象。thenable 对象指的是具有 then 方法的对象。

```javascript
let thenable = {
  then: function(resolve, reject) {
    resolve(42)
  }
}
```

Promise.resolve 方法会将这个对象转为 Promise 对象，然后立即执行 thenable 对象的 then 方法。

1. 参数不是具有 then 方法的对象或根本不是对象。如果参数是一个原始值，或者是一个不具有 then 方法的对象，那么 Promise.resolve 方法返回一个新的 Promise 对象，状态为 Resolved。
2. 不带有任何参数。Promise.resolve 方法允许在调用时不带有参数，而直接返回一个 Resolved 状态的 Promise 对象。

需要注意：**立即 resolve 的 Promise 对象是在本轮“事件循环”（event loop）结束时，而不是在下一轮“事件循环”开始时**。

```javascript
setTimeout(function() {
  console.log('three')
}, 0)
Promise.resolve().then(function() {
  console.log('two')
})
console.log('one')
// one
// two
// three
```

上面的代码中，setTimeout(fn, 0) 是在下一轮“事件循环”开始时执行的，Promise.resolve() 在本轮“事件循环”结束时执行，console.log('one') 则是立即执行，因此最先输出。

### Promise.reject()

`Promise.reject(reason)` 方法也会返回一个新的 Promise 实例，状态为 Rejected。

需要注意：**Promise.reject() 方法的参数会原封不动地作为 reject 的理由变成后续方法的参数。这一点与 Promise.resolve 方法不一致**。

```javascript
const thenable = {
  then(resolve, reject) {
    reject('出错了')
  }
}
Promise.reject(thenable).catch(e => {
  console.log(e === thenable) // true
})
```

上面的代码中，Promise.reject 方法的参数是一个 thenable 对象，执行以后，后面 catch 方法的参数不是 reject 抛出的“出错了”这个字符串，而是 thenable 对象。

### 附加方法

ES6 的 Promise API 提供的方法不是很多，可以自己部署一些有用的方法。下面部署两个不在 ES6 中但很有用的方法。

#### done()

无论 Promise 对象的回调链以 then 方法还是 catch 方法结尾，只要最后一个方法抛出错误，都有可能无法捕捉到（因为 Promise 内部的错误不会冒泡到全局）。为此，可以提供一个 done 方法，它总是处于回调链的尾端，保证抛出任何可能出现的错误。

```javascript
asyncFunc()
  .then(f1)
  .catch(r1)
  .then(f2)
  .done()
```

代码实现：

```javascript
Promise.prototype.done = function(onFulfilled, onRejected) {
  this.then(onFulfilled, onRejected).catch(function(reason) {
    // 抛出一个全局错误
    setTimeout(() => {
      throw reason
    }, 0)
  })
}
```

done 方法可以像 then 方法那样使用，提供 Fulfilled 和 Rejected 状态的回调函数，也可以不提供任何参数。但不管怎样，done 方法都会捕捉到任何可能出现的错误，并向全局抛出。

#### finally()

finally 方法用于指定不管 Promise 对象最后状态如何都会执行的操作。它与 done 方法的最大区别在于，它接受一个普通的回调函数作为参数，该函数不管怎样都必须执行。

下面一个示例，服务器使用 Promise 处理请求，然后使用 finally 方法关掉服务器。

```javascript
server
  .listen(0)
  .then(function() {
    // run test
  })
  .finally(server.stop)
```

代码实现：

```javascript
Promise.prototype.finally = function(callback) {
  let P = this.constructor
  return this.then(
    value => P.resolve(callback()).then(() => value),
    reason =>
      P.resolve(callback()).then(() => {
        throw reason
      })
  )
}
```

上面的代码中，不管前面的 Promise 是 fulfilled 还是 rejected，都会执行回调函数 callback。

### Generator 函数与 Promise 的结合

使用 Generator 函数管理流程，遇到异步操作时通常返回一个 Promise 对象。

```javascript
function getFoo() {
  return new Promise(function(resolve, reject) {
    resolve('foo')
  })
}
let g = function*() {
  try {
    let foo = yield getFoo()
    console.log(foo)
  } catch (e) {
    console.log(e)
  }
}
function run(generator) {
  let it = generator()
  function go(result) {
    if (result.done) return result.value
    return result.value.then(
      function(value) {
        return go(it.next(value))
      },
      function(error) {
        return go(it.throw(error))
      }
    )
  }
  go(it.next())
}
run(g)
```

### Promise.try()

实际开发中经常遇到一种情况：不知道或者不想区分函数 f 是同步函数还是异步操作，但是想用 Promise 来处理它。因为这样就可以不管 f 是否包含异步操作，都用 then 方法指定下一步流程，用 catch 方法处理 f 抛出的错误。一般的写法如下：

```javascript
Promise.resolve().then(f)
```

上面的写法有一个缺点：如果 f 是同步函数，那么它会在本轮事件循环的末尾执行：

```javascript
const f = () => console.log('now')
Promise.resolve().then(f)
console.log('next')
// next
// now
```

有两种方法可以让同步函数同步执行，让异步函数异步执行，并且让它们具有统一的 API。

第一种方法是用 async 函数：

```javascript
const f = () => console.log('now')
;(async () => f())()
console.log('next')
// now
// next
```

上面的代码中，第二行是一个立即执行的匿名函数，会立即执行里面的 async 函数，因此如果 f 是同步的，就会得到同步的结果；如果 f 是异步的，就可以用 then 指定下一步。同时需要注意：`async ()=>f()` 会吃掉 f() 抛出的错误。所以，如果想捕获错误，要使用 promise.catch 方法：

```javascript
;(async () => f())().then(...).catch(...)
```

第二种方式是使用 new Promise()：

```javascript
const f = () => console.log('now')
;(() => new Promise(resolve => resolve(f())))()
console.log('next')
// now
// next
```
