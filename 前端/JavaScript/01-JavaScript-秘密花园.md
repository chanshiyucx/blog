# JavaScript 秘密花园

JavaScript 秘密花园由两位 Stack Overflow 用户伊沃·韦特泽尔（写作）和张易江（设计）完成，由三生石上翻译完成，内容短小精炼。这次温故知新，做一番总结。

## 对象

### 对象使用和属性

JavaScript 中所有变量都是对象，除了两个例外 `null` 和 `undefined`。

JavaScript 解析器错误，试图将点操作符解析为浮点数字值的一部分。

```javascript
2.toString()    // SyntaxError

2..toString()   // 第二个点号可以正常解析
2 .toString()   // 添加空格
;(2).toString() // 2 先被计算
```

### 删除属性

删除属性的唯一方法是使用 `delete` 操作符，设置属性为 `undefined` 或者 `null` 并不能真正的删除属性，而仅仅是移除属性和值的关联。

### 原型

实现传统的类继承模型很简单，但是实现 JavaScript 中的原型继承则困难的多。

> It is for example fairly trivial to build a classic model on top of it, while the other way around is a far more difficult task.

```javascript
function Foo() {
  this.value = 42
}

Foo.prototype = {
  method: function() {}
}

function Bar() {}

// 设置 Bar.prototype 属性为 Foo 的实例对象
Bar.prototype = new Foo()
Bar.prototype.foo = 'Hello World'

// 修正 Bar.prototype.constructor 为 Bar 本身
Bar.prototype.constructor = Bar

/**
 * test [Bar的实例]
 *     Bar.prototype [Foo的实例]
 *       { foo: 'Hello World' }
 *       Foo.prototype
 *           { method: ... }
 *           Object.prototype
 *               { toString:... }
 **/
```

![继承与原型链](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/JavaScript-秘密花园/prototype.png)

> 当谈到继承时，JavaScript 只有一种结构：对象。每个实例对象（object）都有一个私有属性（称之为 proto）指向它的原型对象（prototype）。该原型对象也有一个自己的原型对象，层层向上直到一个对象的原型对象为 null。根据定义，null 没有原型，并作为这个原型链中的最后一个环节。

`someObject.[[Prototype]]` 符号是用于指向 someObject 的原型。从 ECMAScript6 开始，`[[Prototype]]` 可以通过 `Object.getPrototypeOf()` 和 `Object.setPrototypeOf()` 访问器来访问。这个等同于 JavaScript 的非标准但许多浏览器实现的属性 `__proto__`。

但它不应该与构造函数 func 的 `prototype` 属性相混淆。被构造函数创建的实例对象的 `[[prototype]]` 指向 func 的 `prototype` 属性。 `Object.prototype` 属性表示 object 的原型对象。

### hasOwnProperty 函数

`hasOwnProperty` 是 JavaScript 中处理属性并且不会遍历原型链的方法之一(另一种方法: `Object.keys()`)。当检查对象某个属性是否存在时，`hasOwnProperty` 是唯一可用的方法。同时在使用 for in loop 遍历对象时，推荐总使用 `hasOwnProperty` 方法。

## 函数

### 函数声明与表达式

函数声明会被提前解析（hoisted），但函数表达式不会。

```javascript
// 函数声明
foo()
function foo() {}

// 函数表达式
bar // undefined
bar() // TypeError
const bar = function() {}
```

### 命名函数的赋值表达式

函数名在函数内总是可见的。

```javascript
const foo = function bar() {
  bar() // 正常运行
}
bar() // 出错：ReferenceError
```

上面代码中，bar 函数声明外是不可见的，这是因为已经把函数赋值给了 foo；然而在 bar 内部依然可见。这是由于 JavaScript 的命名处理所致，函数名在函数内总是可见的。

### this 的工作原理

JavaScript 有一套完全不同于其它语言的对 this 的处理机制。在 5 种不同的情况下，this 指向的各不相同。

- 全局范围内：this 指向全局对象。但在严格模式下，不存在全局变量，this 将会是 undefined。
- 函数调用：this 指向全局对象。

```javascript
foo() // this 指向全局对象
```

- 方法调用：this 指向调用方法的对象。

```javascript
test.foo() // this 指向 test 对象
```

- 调用构造函数：在构造函数内部，this 指向新创建的对象。

```javascript
new foo() // this 指向返回的新对象
```

- 显示设置 this：调用 call 或者 apply 方法时，函数内 this 将会被显式设置为函数调用的第一个参数。

```javascript
Foo.method = function() {
  function test() {
    // this 将会被设置为全局对象
  }
  test()
}
```

为了在 test 中获取对 Foo 对象的引用，需要在 method 函数内部创建一个局部变量指向 Foo 对象。因为 JavaScript 中不可以对作用域进行引用或赋值，所以不可以在外部访问私有变量。

```javascript
Foo.method = function() {
  const that = this
  function test() {
    // 使用 that 来指向 Foo 对象
  }
  test()
}
```

### arguments 对象

arguments 对象为其内部属性以及函数形式参数创建 getter 和 setter 方法。因此，改变形参的值会影响到 arguments 对象的值，反之亦然。

```javascript
function foo(a, b, c) {
  arguments[0] = 2
  console.log(a) // 2

  b = 4
  console.log(arguments[1]) // 4

  var d = c
  d = 9
  console.log(c) // 3
}
foo(1, 2, 3)
```

### 命名空间

只有一个全局作用域导致的常见错误是命名冲突。在 JavaScript 中，这可以通过匿名包装器轻松解决。

```javascript
;(function() {
  // 小括号内的函数首先被执行, 并且返回函数对象
  // 函数创建一个命名空间
  window.foo = function() {
    // 对外公开的函数，创建了闭包
  }
})() // 立即执行此匿名函数, 也就是函数对象

// 另外两种方式
;+(function() {})()
;(function() {})()
```

## 数组

### 数组遍历与属性

由于 for in 循环会枚举原型链上的所有属性，唯一过滤这些属性的方式是使用 `hasOwnProperty` 函数， 因此会比普通的 for 循环慢上好多倍。为了达到遍历数组的最佳性能，推荐使用经典的 for 循环。

### length 属性

length 属性的 getter 方式会简单的返回数组的长度，而 setter 方式会截断数组。

```javascript
var foo = [1, 2, 3, 4, 5, 6]
foo.length = 3
foo // [1, 2, 3]
```

## 类型

### 相等与比较

JavaScript 是弱类型语言，这就意味着等于操作符会为了比较两个值而进行强制类型转换。

```javascript
'' == '0' // false
0 == '' // true
0 == '0' // true
false == 'false' // false
false == '0' // true
false == undefined // false
false == null // false
null == undefined // true
' \t\r\n' == 0 // true
```

### typeof 操作符

typeof 操作符（和 instanceof 一起）或许是 JavaScript 中最大的设计缺陷，因为几乎不可能从它们那里得到想要的结果。

尽管 instanceof 还有一些极少数的应用场景，typeof 只有一个实际的应用，那便是用来检测一个对象是否已经定义或者是否已经赋值，而这个应用却不是用来检查对象的类型。

```javascript
typeof foo !== 'undefined'
```

上面代码会检测 foo 是否已经定义，如果没有定义而直接使用会导致 ReferenceError 的异常。 这是 typeof 唯一有用的地方。除非为了检测一个变量是否已经定义，应尽量避免使用 typeof 操作符。

### JavaScript 类型表格

|       Value        |  Class   |   Type   |
| :----------------: | :------: | :------: |
|       'foo'        |  String  |  string  |
| new String('foo')  |  String  |  object  |
|        1.2         |  Number  |  number  |
|  new Number(1.2)   |  Number  |  object  |
|        true        | Boolean  | boolean  |
| new Boolean(true)  | Boolean  |  object  |
|     new Date()     |   Date   |  object  |
|    new Error()     |  Error   |  object  |
|      [1,2,3]       |  Array   |  object  |
| new Array(1, 2, 3) |  Array   |  object  |
|  new Function('')  | Function | function |
|       /abc/g       |  RegExp  |  object  |
| new RegExp('meow') |  RegExp  |  object  |
|         {}         |  Object  |  object  |
|    new Object()    |  Object  |  object  |

上面表格中，**Type** 一列表示 typeof 操作符的运算结果。可以看到，这个值在大多数情况下都返回 **object**。

**Class** 一列表示对象的内部属性 **[[Class]]** 的值。

JavaScript 标准文档只给出了一种获取 **[[Class]]** 值的方法，那就是使用 `Object.prototype.toString`。

```javascript
function is(type, obj) {
  var clas = Object.prototype.toString.call(obj).slice(8, -1)
  return obj !== undefined && obj !== null && clas === type
}

is('String', 'test') // true
is('String', new String('test')) // true
```

为了检测一个对象类型，推荐使 `Object.prototype.toString` 方法，因为这是唯一一个可依赖的方式。

### instanceof 操作符

instanceof 操作符用来比较两个操作数的构造函数。只有在比较自定义的对象时才有意义，如果用来比较内置类型，将会和 typeof 操作符一样用处不大。

```javascript
function Foo() {}
function Bar() {}
Bar.prototype = new Foo()

new Bar() instanceof Bar // true
new Bar() instanceof Foo // true

// 如果仅仅设置 Bar.prototype 为函数 Foo 本身，而不是 Foo 构造函数的一个实例
Bar.prototype = Foo
new Bar() instanceof Foo // false

// instanceof 比较内置类型
new String('foo') instanceof String // true
new String('foo') instanceof Object // true
'foo' instanceof String // false
'foo' instanceof Object // false
```

需要注意：instanceof 用来比较属于不同 JavaScript 上下文的对象（比如浏览器中不同的文档结构）时将会出错，因为它们的构造函数不会是同一个对象。

instanceof 操作符应该仅仅用来比较来自同一个 JavaScript 上下文的自定义对象。正如 typeof 操作符一样，任何其它的用法都应该是避免的。
