直至 ES6，JavaScript 终于有了“类”的概念，它简化了之前直接操作原型的语法，这也是我最喜欢的 ES6 新特性之一，但此类非彼类，它不同于我们熟悉的如 Java 中的类，它本质上只是一颗语法糖。<!-- more -->

## Class 的基本语法

### 简介

ES6 的类完全可以看作构造函数的另一种写法。

```javascript
class Point {}

typeof Point // function
Point === Point.prototype.constructor // true
```

上面代码表明：**类的数据类型就是函数，类本身就指向构造函数**。

类的所有方法都定义在类的 prototype 属性上：

```javascript
class Point {
  constructor() {}
  toString() {}
}

// 等同于
Point.prorotype = {
  constructor() {},
  toString() {}
}
```

在类的实例上调用方法，其实就是调用原型上的方法。

```javascript
class Point {}
let p = new Point()
p.constructor === Point.prototype.constructor // true
```

使用 Object.assign 方法可以方便向类添加多个方法：

```javascript
Object.assign(Point.prototype, {
  toString()
})
```

需要注意：**类的内部定义的方法都是不可枚举的（non-enumerable）**，这点与 ES5 表现不一致。

### constructor

constructor 方法默认返回实例对象（即 this），不过完全可以指定返回另外一个对象。

```javascript
class Foo {
  constructor() {
    return Object.create(null)
  }
}
new Foo() instanceof Foo // false
```

需要注意：**实例的属性除非显式定义在其本身（即 this 对象）上，否则都是定义在原型上。**

```javascript
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

> **proto** 是浏览器厂商添加的私有属性，应避免使用，在生产环境中，可以使用 Object.getPrototypeOf 方法来获取实例对象的原型。

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

需要注意：**上面定义的类的名字是 MyClass 而不是 Me，Me 只在 Class 的内部代码可用，指代当前类**。

如果 Class 内部没有用到 Me，则可以省略。同时，也可以写出立即执行 Class。

```javascript
// 省略 Me
const MyClass = class {}

// 立即执行 Class
const p = new class {}()
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

ES6 为 new 命令引入了 new.target 属性，返回 new 命令所作用的构造函数。

```javascript
function Person(name) {
  if (new.target === Person) {
    this.name = name
  } else {
    throw new Error('必须使用 new 生成实例')
  }
}
```

需要注意：子类继承父类时 new.target 会返回子类。利用这个特点，可以写出不能独立独立使用而必须继承后才能使用的类。

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
