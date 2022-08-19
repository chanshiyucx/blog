# Interview

## 001 用递归算法实现，数组长度为 5 且元素的随机数在 2-32 间不重复的值

核心是生成随机数算法，`Math.random()` 函数返回一个随机浮点数，浮点数范围为左闭右开区间 `[0, 1)`。

```javascript
function rand(arr = [], length = 5, min = 2, max = 32) {
  if (arr.length < length) {
    const num = Math.floor(Math.random() * (max - min + 1)) + min
    if (!arr.includes(num)) {
      arr.push(num)
    }
    return rand(arr)
  }
  return arr
}
```

## 002 去除字符串中的空格，根据传入不同的类型分别能去掉前、后、前后、中间的空格

算法难点：

1. 通过 `Symbol()` 来生成枚举类型
2. 正则分组去除中间空格

```javascript
const POSITION = Object.freeze({
  left: Symbol(),
  right: Symbol(),
  both: Symbol(),
  center: Symbol(),
  all: Symbol(),
})

function trim(str, position = POSITION.both) {
  switch (position) {
    case POSITION.left:
      str = str.replace(/^\s+/, '')
      break
    case POSITION.right:
      str = str.replace(/\s+$/, '')
      break
    case POSITION.both:
      str = str.replace(/^\s+|\s+$/g, '')
      break
    case POSITION.center:
      while (str.match(/\w\s+\w/)) {
        str = str.replace(/(\w)(\s+)(\w)/, '$1$3')
      }
      break
    case POSITION.all:
      str = str.replace(/\s/g, '')
      break
    default:
      break
  }
  return str
}
```

## 003 去除字符串中最后一个指定的字符

```javascript
function delLast(str, char) {
  if (!str) return false
  if (!char) return str
  const index = str.lastIndexOf(char)
  return str.substring(0, index) + str.substring(index + 1)
}
```

## 004 设计实现 Promise.finally

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

## 005 设计实现 Promise.race

`Promise.race(iterable)` 方法返回一个 promise，一旦迭代器中的某个 promise 解决或拒绝，返回的 promise 就会解决或拒绝。

```js
Promise._race = (promises) =>
  new Promise((resolve, reject) => {
    promises.forEach((promise) => {
      promise.then(resolve, reject)
    })
  })
```

基本和上面的例子差不多，不同点是每个传入值使用 Promise.resolve 转为 Promise 对象，兼容非 Promise 对象。

```js
const _race = (p) => {
  return new Promise((resolve, reject) => {
    p.forEach((item) => {
      Promise.resolve(item).then(resolve, reject)
    })
  })
}
```

## 006 子字符串匹配算法

从长度为 n 的字符串 S 中，查找是否存在字符串 T，T 的长度是 m，若存在返回所在位置

```js
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

## 007 add(1)(2, 3) 链式调用函数

```js
add(1);  // 1
add(1)(2);  // 3
add(1)(2)(3)； // 6
add(1)(2, 3);  // 6
add(1, 2, 3);  // 6
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

## 008 如何快速从一个巨大的数组中随机获取部分元素

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

## 009 实现一个批量请求函数 multiRequest(urls, maxNum)

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

## 010 实现 Promise.retry，成功后 resolve 结果，失败后重试，尝试超过一定次数才真正的 reject

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

## 011 自增 ID

```js
const genId = (() => {
  let count = 0
  return () => {
    return ++count
  }
})()
```
