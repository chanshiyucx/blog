在 JavaScript 中数组乱序与去重可以说是最为常见的功能需求之一，其实现方式众多，一些常用第三方库如 loadsh 也提供了乱序方法，但如何最优雅简洁地代码实现也是一门学问。<!-- more -->

## 数组乱序

起源于知乎问题[如何将一个 JavaScript 数组打乱顺序？](//www.zhihu.com/question/68330851)观后所悟颇多，故记之。

### sort 方法

最简单的便是使用 sort 函数，代码如下：

```javascript
const shuffle = arr => {
  arr.sort(() => Math.random() > .5)
  return arr
}
```

在一般场景中以上代码实现便可满足功能需求，但仅是使用 sort 函数的乱序方式并不完美，出于 v8 引擎的底层原因，它对长短数组采用不同的排序方式，并不能真正随机打乱数组排序，简而言之就是最后得到的数组不能足够乱。

> 由于 v8 引擎出于对性能的考虑，sort 函数对短数组（长度小于10）使用的是插入排序，对长数组则使用了快速排序。其实不管用什么排序方法，大多数排序算法的时间复杂度介于 O(n) 到 O(n2) 之间，元素之间的比较次数通常情况下要远小于 n(n-1)/2，也就意味着有一些元素之间根本就没机会相比较（也就没有了随机交换的可能），这使 sort 随机排序的算法自然也不能真正随机。通俗的说，其实我们使用 array.sort 进行乱序，理想的方案或者说纯乱序的方案是：数组中每两个元素都要进行比较，这个比较有 50% 的交换位置概率。如此一来，总共比较次数一定为 n(n-1)。而在 sort 排序算法中，大多数情况都不会满足这样的条件。因而当然不是完全随机的结果了。  

### Fisher–Yates Shuffle 洗牌算法

Fisher–Yates Shuffle 洗牌算法是目前业界最著名的数组乱序算法之一，并且能够使数组足够乱，实现如下：

```javascript
const shuffle = arr => {
  let i = arr.length, j
  while (i) {
    j = Math.floor(Math.random() * i--)
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
```

参考文章：  
[关于 JavaScript 的数组随机排序](//blog.oldj.net/2017/01/23/shuffle-an-array-in-javascript/)  
[Fisher–Yates Shuffle](//bost.ocks.org/mike/shuffle/)

## 数组去重

起源于知乎问题[求一个 JavaScript 数组去重方法？](//www.zhihu.com/question/29558082)闲做摘要。

### filter 方法

```javascript
const unique = arr => {
  const seen = new Map()
  return arr.filter((a) => !seen.has(a) && seen.set(a, 1))
}
```

### Set 构造函数

ES6 提供了新的数据结构 Set。它类似于数组，但是成员的值都是唯一的，没有重复的值。Set 本身是一个构造函数，用来生成 Set 数据结构。Set 函数可以接受一个数组（或者具有 iterable 接口的其他数据结构）作为参数，用来初始化并去除数组重复成员。

`Array.from` 方法用于将两类对象转为真正的数组：类似数组的对象（array-like object）和可遍历（iterable）的对象（包括 ES6 新增的数据结构 Set 和 Map）。所以可以先使用 Set 构造函数去除数组重复成员，再使用 `Array.from` 方法将其转换为数组。

```javascript
const unique = arr => {
  return Array.from(new Set(arr))
}
```

使用扩展运算符（...）也可以将某些数据结构转为数组，扩展运算符背后调用的是遍历器接口（Symbol.iterator），如果一个对象没有部署这个接口，就无法转换。

```javascript
const unique = arr => {
  return [...(new Set(arr))]
}
```
<!--stackedit_data:
eyJoaXN0b3J5IjpbMTAzNzM1OTIxOV19
-->