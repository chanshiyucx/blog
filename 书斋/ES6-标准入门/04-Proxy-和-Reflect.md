# Proxy 和 Reflect

ES6 新增 Proxy 和 Reflect，两者相辅相成，功能颇为强大，但工作中基本未被提及，这里略微学习一下，不求甚解，待到 coding 时遇到再温故知新。

## Proxy

### Proxy 概述

Proxy 用于修改某些操作的默认行为，属于一种“元编程”（meta programming），即对编程语言进行编程。

Proxy 可以理解成在目标对象前架设一个“拦截”层，外界对该对象的访问都必须先通过这层拦截，因此提供了一种机制可以对外界的访问进行过滤和改写。

```javascript
let obj = {}

let proxy = new Proxy(obj, {
  get(target, key, receiver) {
    console.log('get--> target:', target, 'key:', key, 'receiver:', receiver)
    return Reflect.get(target, key, receiver)
  },
  set(target, key, value, receiver) {
    console.log('set--> target:', target, 'key:', key, 'value:', value)
    return Reflect.set(target, key, value, receiver)
  }
})

proxy.count = 1
// set--> target: {} key: count value: 1

++proxy.count
// get--> target: {count: 1} key: count receiver: Proxy {count: 1}
// set--> target: {count: 1} key: count value: 2

obj // {count: 2}
```

上面的代码说明，Proxy 实际上重载（overload）了点运算符，即用自己的定义覆盖了语言的原始定义。

ES6 原生提供 Proxy 构造函数，用于生成 Proxy 实例：

```javascript
let proxy = new Proxy(target, handler)
```

Proxy 对象的所有用法基本一致，不同的只是 handler 参数的写法。其中，new Proxy() 表示生成一个 Proxy 实例，target 参数表示所要拦截的目标对象，handler 参数也是一个对象，用来定制拦截行为。

如果 handler 没有设置任何拦截，那就等同于直接通向原对象。

Proxy 实例也可以作为其他对象的原型对象。

```javascript
let proxy = new Proxy(
  {},
  {
    get(target, key, receiver) {
      return 42
    }
  }
)

let obj = Object.create(proxy)
obj.a // 42
```

### Proxy 实例方法

下面是 Proxy 支持的所有拦截操作:

- **get(target, propKey, receiver)**：拦截对象属性的读取，最后一个参数 receiver 是一个可选对象。
- **set(target, propKey, value, receiver)**：拦截对象属性的设置，返回一个布尔值。
- **has(target, propKey)**：拦截 propKey in proxy 的操作，返回一个布尔值。
- **deleteProperty(target, propKey)**：拦截 delete proxy[propKey]的操作，返回一个布尔值。
- **ownKeys(target)**：拦截 Object.getOwnPropertyNames(proxy)、Object.getOwnPropertySymbols (proxy)、Object.keys(proxy)，返回一个数组。该方法返回目标对象所有自身属性的属性名，而 Object.keys() 的返回结果仅包括目标对象自身的可遍历属性。
- **getOwnPropertyDescriptor(target, propKey)**：拦截 Object.getOwnPropertyDescriptor(proxy, prop-Key)，返回属性的描述对象。
- **defineProperty(target, propKey, propDesc)**：拦截 Object.defineProperty(proxy, propKey, propDesc）、Object.define Properties(proxy, propDescs)，返回一个布尔值。
- **preventExtensions(target)**：拦截 Object.preventExtensions(proxy)，返回一个布尔值。
- **getPrototypeOf(target)**：拦截 Object.getPrototypeOf(proxy)，返回一个对象。
- **isExtensible(target)**：拦截 Object.isExtensible(proxy)，返回一个布尔值。
- **setPrototypeOf(target, proto)**：拦截 Object.setPrototypeOf(proxy, proto)，返回一个布尔值。如果目标对象是函数，那么还有两种额外操作可以拦截。
- **apply(target, object, args)**：拦截 Proxy 实例，并将其作为函数调用的操作。
- **construct(target, args)**：拦截 Proxy 实例作为构造函数调用的操作，比如 newproxy(...args)。

具体方法介绍这里不在累述，详见《ES6 标准入门》。

### Proxy.revocable()

Proxy.revocable 方法返回一个可取消的 Proxy 实例。

```javascript
let target = {}
let handler = {}
let { proxy, revoke } = Proxy.revocable(target, handler)
proxy.foo = 123
proxy.foo // 123
revoke()
proxy.foo // TypeError: Revoked
```

Proxy.revocable 方法返回一个对象，其 proxy 属性是 Proxy 实例，revoke 属性是一个函数，可以取消 Proxy 实例。上面的代码中，当执行 revoke 函数后再访问 Proxy 实例，就会抛出一个错误。

Proxy.revocable 的一个使用场景是，目标对象不允许直接访问，必须通过代理访问，一旦访问结束，就收回代理权，不允许再次访问。

### this 问题

虽然 Proxy 可以代理针对目标对象的访问，但它不是目标对象的透明代理，即不做任何拦截的情况下也无法保证与目标对象的行为一致。**主要原因就是在 Proxy 代理的情况下，目标对象内部的 this 关键字会指向 Proxy 代理**。

```javascript
const target = {
  m: function() {
    console.log(this === proxy)
  }
}
const handler = {}
const proxy = new Proxy(target, handler)
target.m() // false
proxy.m() // true
```

上面的代码中，一旦 proxy 代理 target.m，后者内部的 this 就指向 proxy，而不是 target。

此外，有些原生对象的内部属性只有通过正确的 this 才能获取，所以 Proxy 也无法代理这些原生对象的属性。

```javascript
const target = new Date()
const handler = {}
const proxy = new Proxy(target, handler)
proxy.getDate() // TypeError: this is not a Date object.
```

通过 Proxy 可以拦截网络请求或者实现数据库的 ORM 层。

## Reflect

### Proxy 概述

Reflect 对象与 Proxy 对象一样，也是 ES6 为了操作对象而提供的新的 API，Reflect 对象的设计目的：

1. 将 Object 对象的一些明显属于语言内部的方法（比如 Object.defineProperty）放到 Reflect 对象上。现阶段，某些方法同时在 Object 和 Reflect 对象上部署，未来的新方法将只在 Reflect 对象上部署。
2. 修改某些 Object 方法的返回结果，让其变得更合理。比如，Object.defineProperty(obj, name, desc) 在无法定义属性时会抛出一个错误，而 Reflect.defineProperty(obj, name,desc) 则会返回 false。
3. 让 Object 操作都变成函数行为。某些 Object 操作是命令式，比如 name in obj 和 delete obj[name]，而 Reflect.has(obj, name) 和 Reflect.deleteProperty (obj, name) 让它们变成了函数行为。
4. Reflect 对象的方法与 Proxy 对象的方法一一对应，只要是 Proxy 对象的方法，就能在 Reflect 对象上找到对应的方法。这就使 Proxy 对象可以方便地调用对应的 Reflect 方法来完成默认行为，作为修改行为的基础。

每一个 Proxy 对象的拦截操作内部都应调用对应的 Reflect 方法，保证原生行为能够正常执行。

Reflect 对象一共有 13 个静态方法，与 Proxy 一一对应，这里不再累述，详见《ES6 标准入门》。

### 观察者模式

观察者模式（Observer mode）指的是函数自动观察数据对象的模式，一旦对象有变化，函数就会自动执行。

```javascript
const quenedObserves = new Set()
const observe = fn => quenedObserves.add(fn)
const observable = obj => new Proxy(obj, { set })

function set(target, key, value, receiver) {
  const result = Reflect.set(target, key, value, receiver)
  quenedObserves.forEach(observe => observe())
  return result
}

const person = observable({
  name: '张三'
})
observe(() => console.log('name:', person.name))
person.name = '李四'
```

上面的代码先定义了一个 Set 集合，所有观察者函数都放进这个集合中。然后，observable 函数返回原始对象的代理，拦截赋值操作。拦截函数 set 会自动执行所有观察者。
