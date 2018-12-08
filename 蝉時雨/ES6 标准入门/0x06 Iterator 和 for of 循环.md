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

### 调用的场合

### 字符串的 Iterator 接口

### Iterator 接口和 Generator 函数

### 遍历器对象的 return() 和 throw()

### for of 循环
