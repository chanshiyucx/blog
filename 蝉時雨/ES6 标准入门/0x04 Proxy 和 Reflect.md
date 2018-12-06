## Proxy

### 概述

Proxy 用于修改某些操作的默认行为，等同于在语言层面做出修改，所以属于一种“元编程”（meta programming），即对编程语言进行编程。

Proxy 可以理解成在目标对象前架设一个“拦截”层，外界对该对象的访问都必须先通过这层拦截，因此提供了一种机制可以对外界的访问进行过滤和改写。Proxy 这个词的原意是代理，用在这里表示由它来“代理”某些操作，可以译为“代理器”。

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
// get--> target: {count: 1} key: count receiver: Proxy {count: 1}
// set--> target: {count: 1} key: count value: 2

obj // {count: 2}
```

上面的代码说明，Proxy 实际上重载（overload）了点运算符，即用自己的定义覆盖了语言的原始定义。

ES6 原生提供 Proxy 构造函数，用于生成 Proxy 实例：

```javascript
let proxy = new Proxy(target, handler)
```

Proxy 对象的所有用法都是上面这种形式，不同的只是 handler 参数的写法。其中，new Proxy()表示生成一个 Proxy 实例，target 参数表示所要拦截的目标对象，handler 参数也是一个对象，用来定制拦截行为。

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

- get(target, propKey, receiver)：拦截对象属性的读取，最后一个参数 receiver 是一个可选对象。
- set(target, propKey, value, receiver)：拦截对象属性的设置，返回一个布尔值。
- has(target, propKey)：拦截 propKey in proxy 的操作，返回一个布尔值。
- deleteProperty(target, propKey)：拦截 delete proxy[propKey]的操作，返回一个布尔值。
- ownKeys(target)：拦截 Object.getOwnPropertyNames(proxy)、Object.getOwnPropertySymbols (proxy)、Object.keys(proxy)，返回一个数组。该方法返回目标对象所有自身属性的属性名，而 Object.keys() 的返回结果仅包括目标对象自身的可遍历属性。
- getOwnPropertyDescriptor(target, propKey)：拦截 Object.getOwnPropertyDescriptor(proxy, prop-Key)，返回属性的描述对象。
- defineProperty(target, propKey, propDesc)：拦截 Object.defineProperty(proxy, propKey, propDesc）、Object.define Properties(proxy, propDescs)，返回一个布尔值。
- preventExtensions(target)：拦截 Object.preventExtensions(proxy)，返回一个布尔值。
- getPrototypeOf(target)：拦截 Object.getPrototypeOf(proxy)，返回一个对象。
- isExtensible(target)：拦截 Object.isExtensible(proxy)，返回一个布尔值。
- setPrototypeOf(target, proto)：拦截 Object.setPrototypeOf(proxy, proto)，返回一个布尔值。如果目标对象是函数，那么还有两种额外操作可以拦截。
- apply(target, object, args)：拦截 Proxy 实例，并将其作为函数调用的操作。
- construct(target, args)：拦截 Proxy 实例作为构造函数调用的操作，比如 newproxy(...args)。

具体方法介绍这里不在累述，详见《ES6 标准入门》。

## Reflect
