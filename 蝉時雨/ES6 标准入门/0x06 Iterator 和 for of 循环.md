JavaScript 有四种表示“集合”和数据结构，分别是 Array、Object 和 ES6 新增的 Set、Map，遍历器（Iterator）就是为各种不同的数据结构提供统一访问机制的接口。<!-- more -->

## Iterator

### Iterator 概念

任何数据结构，只要部署 Iterator 接口，就可以完成遍历操作。

Iterator 的作用有 3 个：

1. 为各种数据结构提供一个统一的、简便的访问接口；
2. 使得数据结构的成员能够按某种次序排列；
3. ES6 创造了一种新的遍历命令——for...of 循环，Iterator 接口主要供 for...of 消费。

Iterator 的遍历过程如下：

1. 创建一个指针对象，指向当前数据结构的起始位置。也就是说，遍历器对象本质上就是一个指针对象。
2. 第一次调用指针对象的 next 方法，可以将指针指向数据结构的第一个成员。
3. 第二次调用指针对象的 next 方法，指针就指向数据结构的第二个成员。
4. 不断调用指针对象的 next 方法，直到它指向数据结构的结束位置。

### 默认 Iterator 接口

数据结构只要部署了 Iterator 接口，就称这种数据结构为“可遍历”（iterable）的。

ES6 规定，默认的 Iterator 接口部署在数据结构的 Symbol.iterator 属性，或者说，一个数据结构只要具有 Symbol.iterator 属性，就可以认为是“可遍历的”（iterable）。调用 Symbol.iterator 方法，会得到当前数据结构默认的遍历器生成函数。

原生具备 Iterator 接口的数据结构有：Array、Map、Set、String、TypedArray、函数的 arguments 对象、NodeList 对象。

```javascript
let arr = ['a', 'b', 'c']
let iter = arr[Symbol.iterator]()
iter.next() // { value: 'a', done: false }
```

对象（Object）之所以没有默认部署 Iterator 接口，是因为对象属性的遍历先后顺序是不确定的，需要开发者手动指定。**本质上，遍历器是一种线性处理，对于任何非线性的数据结构，部署遍历器接口就等于部署一种线性转换**。

可以手动给对象部署遍历器接口：

```javascript
class RangeIterator {
  constructor(start, stop) {
    this.value = start
    this.stop = stop
  }
  [Symbol.iterator]() {
    return this
  }
  next() {
    let value = this.value
    if (value < this.stop) {
      this.value++
      return { done: false, value: value }
    }
    return { done: true, value: undefined }
  }
}
function range(start, stop) {
  return new RangeIterator(start, stop)
}
for (let value of range(0, 3)) {
  console.log(value) // 0, 1, 2
}
```

对于类似数组的对象，部署 Iterator 接口有一个简便方法，即使用 Symbol.iterator 方法直接引用数组的 Iterator 接口：

```javascript
let iterable = {
  0: 'a',
  1: 'b',
  2: 'c',
  length: 3,
  [Symbol.iterator]: Array.prototype[Symbol.iterator]
}
```

### 调用的场合

有一些场合会默认调用 Iterator 接口（即 Symbol.iterator 方法）。

#### 解构赋值

对数组和 Set 结构进行解构赋值时，会默认调用 Symbol.iterator 方法。

```javascript
let set = new Set()
  .add('a')
  .add('b')
  .add('c')
let [x, y] = set // x='a'; y='b'
```

#### 扩展运算符

扩展运算符（...）也会调用默认的 Iterator 接口。

```javascript
let str = 'hello'
;[...str] //  ['h','e','l','l','o']
```

#### yield\*

yield\*后面跟的是一个可遍历的结构，它会调用该结构的遍历器接口。

```javascript
let generator = function*() {
  yield 1
  yield* [2, 3, 4]
  yield 5
}
let iterator = generator()
iterator.next() // { value: 1, done: false }
iterator.next() // { value: 2, done: false }
iterator.next() // { value: 3, done: false }
iterator.next() // { value: 4, done: false }
iterator.next() // { value: 5, done: false }
iterator.next() // { value: undefined, done: true }
```

#### 其他场合

由于数组的遍历会调用遍历器接口，所以任何接受数组作为参数的场合其实都调用了遍历器接口：

- for...of
- Array.from()
- Map()、Set()、WeakMap() 和 WeakSet()
- Promise.all()
- Promise.race()

### for of 循环

一个数据结构只要部署了 Symbol.iterator 属性，就被视为具有 iterator 接口，就可以用 for...of 循环遍历它的成员。

for...of 循环可以使用的范围包括数组、Set 和 Map 结构、某些类似数组的对象（比如 arguments 对象、DOM NodeList 对象）、后文的 Generator 对象，以及字符串。

#### 数组

JavaScript 原有的 for...in 循环只能获得对象的键名，不能直接获取键值。ES6 提供的 for...of 循环允许遍历获得键值。

```javascript
let arr = ['a', 'b', 'c', 'd']
arr.foo = 'hello'

for (let a in arr) {
  console.log(a) // 0 1 2 3 foo
}
for (let a of arr) {
  console.log(a) // a b c d
}
```

上面的代码中，for...of 循环不会返回数组 arr 的 foo 属性。

#### 对象

对于普通的对象，for...in 循环可以遍历键名，for...of 循环会报错。

一种解决方法是，使用 Object.keys 方法将对象的键名生成一个数组，然后遍历这个数组：

```javascript
for (var key of Object.keys(someObject)) {
  console.log(key + ': ' + someObject[key])
}
```

另一个方法是使用 Generator 函数将对象重新包装一下：

```javascript
function* entries(obj) {
  for (let key of Object.keys(obj)) {
    yield [key, obj[key]]
  }
}
for (let [key, value] of entries(obj)) {
  console.log(key, '->', value)
}
// a -> 1
// b -> 2
// c -> 3
```
