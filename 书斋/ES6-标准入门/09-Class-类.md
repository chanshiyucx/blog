# Class 类

直至 ES6，JavaScript 终于有了“类”的概念，它简化了之前直接操作原型的语法，也是我最喜欢的新特性之一，但此类非彼类，它不同于熟知的如 Java 中的类，它本质上只是一颗语法糖。

## Class 的基本语法

### 简介

ES6 的类完全可以看作构造函数的另一种写法，类的所有方法都定义在类的 prototype 属性上，**类的数据类型就是函数，类本身就指向构造函数**。

```javascript
class Point {
  constructor() {}
  toString() {}
}

typeof Point // function
Point === Point.prototype.constructor // true

// 等同于
Point.prorotype = {
  constructor() {},
  toString() {}
}
```

在类的实例上调用方法，其实就是调用原型上的方法。使用 `Object.assign` 方法可以方便向类添加多个方法。**类的内部定义的方法都是不可枚举的（non-enumerable）**，这点与 ES5 表现不一致。

```javascript
class Point {}
let p = new Point()
p.constructor === Point.prototype.constructor // true

Object.assign(Point.prototype, {
  toString()
})
```

### constructor

constructor 方法默认返回实例对象（即 this），不过完全可以指定返回另外一个对象。**实例的属性除非显式定义在其本身（即 this 对象）上，否则都是定义在原型上**。

```javascript
class Foo {
  constructor() {
    return Object.create(null)
  }
}
new Foo() instanceof Foo // false

class Point {
  constructor(x) {
    this.x = x
  }
  toString() {}
}
const p = new Point(1)
p.hasOwnProperty('x') // true
p.hasOwnProperty('toString') // false
p.__proto__.hasOwnProperty('toString') // true
```

> **proto** 是浏览器厂商添加的私有属性，应避免使用，在生产环境中，可以使用 `Object.getPrototypeOf` 方法来获取实例对象的原型。

### Class 表达式

Class 可以使用表达式形式定义：

```javascript
const MyClass = class Me {
  getClassName() {
    return Me.name
  }
}

const inst = new MyClass()
inst.getClassName() // Me
Me.name // ReferenceError: Me is not defined
```

需要注意：**上面定义的类的名字是 MyClass 而不是 Me，Me 只在 Class 的内部代码可用，指代当前类**。如果 Class 内部没有用到 Me，则可以省略。同时，也可以写出立即执行 Class。

```javascript
// 省略 Me
const MyClass = class {}

// 立即执行 Class
const p = new (class {})()
```

### 不存在变量提升

类不存在变量提升（hoist），这点与 ES5 完全不同。这与类的继承有关，因为要确保父类在子类之前定义，如果出现变量提升，则会出错。

```javascript
// 确保父类在子类之前定义
const Foo = class {}
class Bar extends Foo {}
```

### 私有方法

利用 Symbol 值的唯一性将私有方法的名字命名为一个 Symbol 值，从而实现私有方法。

```javascript
const bar = Symbol('bar')

class Point {
  foo() {
    this[bar]()
  }

  [bar]() {}
}
```

### this 指向

类的方法内部如果含有 this，它将默认指向类的实例。但是，必须非常小心，一旦单独使用该方法，很可能会报错。

```javascript
class Logger {
  printName() {
    this.print()
  }
  print() {
    console.log('Hello')
  }
}
const logger = new Logger()
const { printName } = logger
printName() // TypeError: Cannot read property 'print' of undefined
```

一种解决办法是在 constructor 里绑定 this。

```javascript
class Logger {
  constructor {
    this.printName = this.printName.bind(this)
  }
}
```

更巧妙的方式是使用 Proxy，在获取方法时自动绑定 this。

```javascript
function selfish(target) {
  const cache = new WeakMap()
  const handler = {
    get(target, key) {
      const value = Reflect.get(target, key)
      if (typeof value !== 'function') return value
      if (!cache.has(value)) cache.set(value, value.bind(target))
      return cache.get(value)
    }
  }
  return new Proxy(target, handler)
}
const logger = selfish(new Logger())
```

### new.target

ES6 为 new 命令引入了 `new.target` 属性，返回 new 命令所作用的构造函数。

```javascript
function Person(name) {
  if (new.target === Person) {
    this.name = name
  } else {
    throw new Error('必须使用 new 生成实例')
  }
}
```

需要注意：子类继承父类时 `new.target` 会返回子类。利用这个特点，可以写出不能独立独立使用而必须继承后才能使用的类。

```javascript
class Shape {
  constructor() {
    if (new.target === Shape) {
      throw new Error('本类不能实例化')
    }
  }
}

class Rectangle extends Shape {
  constructor(length, width) {
    super()
  }
}
```

## Class 的继承

### 简介

Class 可以通过 extends 关键字实现继承，子类必须在 constructor 方法中调用 super 方法，否则新建实例时会报错。**这是因为子类没有自己的 this 对象，而是继承父类的 this 对象，然后对其进行加工**。如果不调用 super 方法，子类就得不到 this 对象。

```javascript
class Point {}
class ColorPoint extends Point {
  constructor() {}
}
const cp = new ColorPoint() // ReferenceError
```

ES5 的继承实质是先创造子类的实例对象 this，然后再将父类的方法添加到 this 上面（`Parent.apply(this)`）。

ES6 的继承机制完全不同，实质是先创造父类的实例对象 this（所以必须先调用 super 方法），然后再用子类的构造函数修改 this。如果子类没有定义 constructor 方法，则会被默认添加。**且只有调用 super 之后才能使用 this 关键字**。

```javascript
class ColorPoint extends Point {}

// 等同于
class ColorPoint extends Point {
  constructor(...args) {
    super(...args)
  }
}
```

### Object.getPrototypeOf()

`Object.getPrototypeOf` 方法可以用来从子类上获取父类。因此，可以使用这个方法来判断一个类是否继承了另一个类。

```javascript
Object.getPrototypeOf(ColorPoint) === Ponit // true
```

### super 关键字

super 这个关键字既可以当作函数使用，也可以当作对象使用。在这两种情况下，它的用法完全不同。

第一种情况，super 作为函数调用时代表父类的构造函数。需要注意，super 虽然代表了父类的构造函数，但返回的是子类的实例，即 super 内部的 this 指向的是 ColorPoint，此时 super() 相当与 `Point.prototype.constructor.call(this)`。

```javascript
class A {
  constructor() {
    console.log(new.target.name)
  }
}

class B extends A {
  constructor() {
    super()
  }
}

new A() // A
new B() // B
```

上面的代码中，`new.target` 指向当前正在执行的函数，在 super 函数执行时，它指向的是子类的构造函数，即 super() 内部的 this 指向的是 B。

第二种情况，super 作为对象时在普通方法中指向父类的原型对象，在静态方法中指向父类。需要注意，**由于普通方法中 super 指向父类的原型对象，所以定义在父类实例上的方法或属性是无法通过 super 调用的**。

```javascript
class Parent {
  static myMethod(msg) {
    console.log('static', msg)
  }
  myMethod(msg) {
    console.log('instance', msg)
  }
}

class Child extends Parent {
  static myMethod(msg) {
    super.myMethod(msg)
  }
  myMethod(msg) {
    super.myMethod(msg)
  }
}

Child.myMethod(1) // static 1
const child = new Child()
child.myMethod(2) // instance 2

class A {
  constructor() {
    // 无法获得
    this.p = 2
  }
}
// 可以获得
A.prototype.p = 2
```

作为普通方法调用时，super 指向 A.prototype，所以 `super.func()` 相当于 `A.prototype.func()`。同时 super 会绑定子类的 this，`super.func()` 相当于 `super.func.call(this)`。

由于绑定子类的 this，因此如果通过 super 对某个属性赋值，这时 super 就是 this，赋值的属性会变成子类实例的属性。

```javascript
class A {
  constructor() {
    this.x = 1
  }
}
class B extends A {
  constructor() {
    super()
    this.x = 2
    super.x = 3
    console.log(super.x) // undefined
    console.log(this.x) // 3
  }
}
```

上面的代码中，super.x 被赋值为 3，等同于对 this.x 赋值为 3。当读取 `super.x` 时，相当于读取的是 `A.prototype.x`，所以返回 undefined。

### prototype 和 **proto**

在 ES5 中，每一个对象都有 `__proto__` 属性，指向对应的构造函数的 prototype 属性。Class 作为构造函数的语法糖，同时有 prototype 属性和 `__proto__` 属性，因此同时存在两条继承链。

- 子类的 `__proto__` 属性表示构造函数的继承，总是指向父类。
- 子类的 prototype 属性的 `__proto__` 属性表示方法的继承，总是指向父类的 prototype 属性。

```javascript
class A {}
class B extends A {}
B.__proto__ === A // true
B.prototype.__proto__ === A.prototype // true
```

造成这样的结果是因为类的继承是按照下面的模式实现的：

```javascript
// B 的实例继承 A 的实例
Object.setPrototypeOf(B.prototype, A.prototype)
// B 的实例继承 A 的静态属性
Object.setPrototypeOf(B, A)
```

其中 `Object.setPrototypeOf` 的实现如下：

```javascript
Object.setPrototypeOf = function(obj, proto) {
  obj.__proto__ = proto
  return obj
}
```

所以上面的代码等同如下：

```javascript
Object.setPrototypeOf(B.prototype, A.prototype)
// 等同于
B.prototype.__proto__ = A.prototype

Object.setPrototypeOf(B, A)
// 等同于
B.__proto__ = A
```

两条原型链理解如下：**作为一个对象，子类（B）的原型（`__proto__` 属性）是父类（A）；作为一个构造函数，子类（B）的原型（prototype 属性）是父类的实例**。

#### extends 的继承目标

下面讨论三种特殊的继承情况。

第一种特殊情况，子类继承 Object 类：

```javascript
class A extends Object {}
A.__proto__ === Object // true
A.prototype.__proto__ === Object.prototype // true
```

这种情况下，A 其实就是构造函数 Object 的复制，A 的实例就是 Object 的实例。

第二种特殊情况，不存在任何继承：

```javascript
class A {}
A.__proto__ === Function.prototype // true
A.prototype.__proto__ === Object.prototype // true
```

这种情况下，A 作为一个基类（即不存在任何继承）就是一个普通函数，所以直接继承 Function.prototype。但是，A 调用后返回一个空对象（即 Object 实例），所以 `A.prototype.__proto__` 指向构造函数（Object）的 prototype 属性。

第三种特殊情况，子类继承 null：

```javascript
class A extends null {}
A.__proto__ === Function.prototype // true
A.prototype.__proto__ === undefined // true
```

这与第二种情况非常像。A 也是一个普通函数，所以直接继承 Function. prototype。但是，A 调用后返回的对象不继承任何方法，所以它的 \_\_proto\_\_ 指向 Function.prototype。

#### 实例的 \_\_proto\_\_

子类实例的 `__proto__` 属性的 `__proto__` 属性指向父类实例的 `__proto__` 属性。也就是说，子类的原型的原型是父类的原型。

```javascript
const p1 = new Point(2, 3)
const p2 = new ColorPoint(2, 3, 'red')
p2.__proto__ === p1.__proto__ // false
p2.__proto__.__proto__ === p1.__proto__ // true
```

### Mixin 模式

Mixin 模式指的是将多个类的接口“混入”（mixin）另一个类，在 ES6 中的实现如下：

```javascript
function mix(...mixins) {
  class Mix {}
  for (let mixin of mixins) {
    copyProperties(Mix, mixin)
    copyProperties(Mix.prototype, mixin.prototype)
  }
  return Mix
}
function copyProperties(target, source) {
  for (let key of Reflect.ownKeys(source)) {
    if (key !== 'constructor' && key !== 'prototype' && key !== 'name') {
      let desc = Object.getOwnPropertyDescriptor(source, key)
      Object.defineProperty(target, key, desc)
    }
  }
}
```

上面代码中的 mix 函数可以将多个对象合成为一个类。使用的时候，只要继承这个类即可。

```javascript
class DistributedEdit extends mix(Loggable, Serializable) {
  // ...
}
```
