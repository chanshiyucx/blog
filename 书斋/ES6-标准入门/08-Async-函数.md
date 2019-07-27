# Async 函数

Async 函数是 ES2017 标准提供的改进版异步编程解决方案，它比 Generator 函数更加优雅方便。Async 函数就是隧道尽头的亮光，很多人认为它是异步操作的终极解决方案。

异步操作是 JavaScript 编程的麻烦事，从最早的回调函数，到 Promise 对象，再到 Generator 函数，每次都有所改进，但又让人觉得不彻底。它们都有额外的复杂性，都需要理解抽象的底层运行机制。

> 异步编程的最高境界，就是根本不用关心它是不是异步。

## async 函数

### 含义

总体来讲，async 函数是 Generatot 函数的语法糖，但是相比之有 4 点改进：

1. 内置执行器：Generator 函数执行必须靠执行器，而 async 函数自带执行器。
2. 更好的语义：async 和 await 相比星号和 yield，语义更清晰。
3. 更广的适用性：yield 命令后面只能是 Thunk 函数或 Promise 对象，而 await 命令后面可以是 Promise 对象或原始值。
4. 返回值是 Promise：async 函数返回值是 Promise 对象，而 Generator 函数返回值是 Iterator 对象。

async 函数可以看作由多个异步操作包装成的一个 Promise 对象，而 await 命令就是内部 then 命令的语法糖。

### 语法

#### await 命令

async 函数返回一个 Promise 对象。async 函数内部 return 语句返回的值，会成为 then 方法回调函数的参数。

正常情况下，await 命令后面是一个 Promise 对象。如果不是，会被转成一个立即 resolve 的 Promise 对象。await 命令后面的 Promise 对象如果变为 reject 状态，则 reject 的参数会被 catch 方法的回调函数接收到。此时加不加 return 效果一样。

```javascript
async function f() {
  // 加不加 return 效果一样
  await Promise.reject('出错了')
}

f()
  .then(v => console.log(v))
  .catch(e => console.log(e)) // 出错了
```

需要注意：**只要一个 await 语句后面的 Promise 变为 reject，那么整个 async 函数都会中断执行**。如果希望异步操作失败也不会中断后面的异步操作，有两种解决办法：

1. 将 await 放在 try...catch 结构里面。
2. 在 await 后面的 Promise 对象后面添加一个 catch 方法。

```javascript
async function f() {
  // 失败也能继续执行后面的异步操作
  await Promise.reject('出错了').catch(e => console.log(e))
  return await Promise.resolve('hello world')
}
```

#### 错误处理

如果 await 后面的异步操作出错，那么等同于 async 函数返回的 Promise 对象被 reject。如果有多个 await 命令，则可以统一放在 try...catch 结构中。

```javascript
// 使用 try...catch 实现多次重复尝试
const NUM_RETRIES = 3
async function test() {
  for (let i = 0; i < NUM_RETRIES; ++i) {
    try {
      await fetch('http://google.com/this-throws-an-error')
      // 如果请求成功，则跳出循环，否则继续重试直至三次
      break
    } catch (err) {}
  }
}
```

#### 注意点

在使用 await 命令时，有几个注意点：

1. 最好将 await 命令放在 try...catch 代码块中。
2. 多个 await 命令如果不存在继发关系，最好同时触发。

```javascript
// 写法一
let [foo, bar] = await Promise.all([getFoo(), getBar()])

// 写法二
let fooPromise = getFoo()
let barPromise = getBar()
let foo = await fooPromise
let bar = await barPromise
```

#### forEach 陷阱

**如果使用 forEach 循环执行异步操作，此时多个异步操作是并发执行的**：

```javascript
function func() {
  list.forEach(async url => {
    // 并发执行
    await fetch(url)
  })
}
```

正确的写法是采用 for 循环或 for of 循环：

```javascript
async function func() {
  for (let url of list) {
    // 相继执行
    await fetch(url)
  }
}
```

为什么使用 forEach 和 for 循环执行多个异步操作会有不同表现，翻阅一些网上资料，找到 forEach 的 polyfill 实现如下：

```javascript
Array.prototype.forEach = function(callback) {
  // this represents our array
  for (let index = 0; index < this.length; index++) {
    // We call the callback for each entry
    callback(this[index], index, this)
  }
}
```

可以看出相当于 for 循环执行了这个异步函数，但是却是并发执行的，因为 callback 函数并没有进行异步执行。我们可以改造一个异步执行的 forEach 函数：

```javascript
async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}
```

则可以改造上面的 forEach 异步操作代码：

```javascript
asyncForEach(list, async url => {
  await fetch(url)
})
```

实际开发中经常遇到一组异步操作，需要按照顺序完成。比如，依次远程读取一组 URL，然后按照读取的顺序输出结果。分别使用 Promise 和 async 实现如下：

```javascript
// Promise 实现
function logInOrder(urls) {
  // 远程读取所有 URL
  const textPromises = urls.map(url => {
    return fetch(url).then(response => response.text())
  })

  // 按次序输出
  textPromise.reduce((chain, textPrimose) => {
    return chain.then(() => textPromise).then(text => console.log(text))
  }, Promise.resolve())
}

// async 实现
function logInOrder(urls) {
  // 并发读取所有 URL
  const textPromises = urls.map(async url => {
    const response = await fetch(url)
    return response.text()
  })

  // 按次序输出
  for (const textPromise of textPromisces) {
    console.log(await textPromise)
  }
}
```

关于异步操作的重要概念之一遍历器这里按下不表，等有需要再来重新回顾。
