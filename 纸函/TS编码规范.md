# TS/JS 编码规范

## TypeScript 是什么

TypeScript 是一种由微软开发的自由和开源的编程语言。它是 JavaScript 的一个超集，而且本质上向这个语言添加了可选的静态类型和基于类的面向对象编程。

TypeScript 扩展了 JavaScript 的句法，所以任何现有的 JavaScript 程序可以不加改变的在 TypeScript 下工作。TypeScript 是为大型应用之开发而设计，而编译时它产生 JavaScript 以确保兼容性。

## TS 编码规范

TypeScript 微软官方编码规范：[Coding guidelines](https://github.com/microsoft/TypeScript/wiki/Coding-guidelines)

中文版：[TypeScript 手册](https://bosens-china.github.io/Typescript-manual/download/zh/wiki/coding_guidelines.html)

### 命名

1. 使用 PascalCase 为类型命名。
2. 不要使用 `I` 做为接口名前缀，接口成员使用 camelCase 方式命名。

```ts
// Bad
interface IFoo {
  Bar: number
  Baz(): number
}

// Good
interface Foo {
  bar: number
  baz(): number
}
```

> 为什么不使用 I 前缀命名接口？
> I 前缀违反了封装原则，在 TS 中，类可以实现接口，接口可以继承接口，接口可以继承类。类和接口都是某种意义上的抽象和封装，继承时不需要关心它是一个接口还是一个类。如果用 I 前缀，当一个变量的类型更改了，比如由接口变成了类，那变量名称就必须同步更改。

```ts
interface IFoo {}
class Point {}
type Baz = IFoo & Point
```

其实我们关心的是这是否是一个「类型」，不论它是 interface 或 class 或 type，都作为「类型」，其它的都不加前缀，没必要给 interface 加个前缀去独立出来。

> 1. [Prohibition against prefixing interfaces with "I"](https://github.com/microsoft/TypeScript-Handbook/issues/121)
> 2. [Confused about the Interface and Class coding guidelines for TypeScript](https://stackoverflow.com/questions/31876947/confused-about-the-interface-and-class-coding-guidelines-for-typescript)
> 3. [为什么不建议 TypeScript 中的接口名以 I 开头？](https://www.zhihu.com/question/484266650)

4. 使用 PascalCase 为枚举对象本身和枚举成员命名。

```ts
// Bad
enum color {
  red,
}

// Good
enum Color {
  Red,
}
```

4. 使用 camelCase 为函数命名。
5. 使用 camelCase 为属性或本地变量命名。

```ts
// Bad
const DiskInfo
function GetDiskInfo() {}

// Good
const diskInfo
function getDiskInfo() {}
```

6. 使用 PascalCase 为类命名，类成员使用 camelCase 方式命名。

```ts
// Bad
class foo {}

// Good
class Foo {}

// Bad
class Foo {
  Bar: number
  Baz(): number {}
}

// Good
class Foo {
  bar: number
  baz(): number {}
}
```

7. 不要为私有属性名添加 `_` 前缀。
8. 尽可能使用完整的单词拼写命名。

### 类型

1. 除非类型/函数需要在多个组件中共享，否则不要导出
2. 不要在全局命名空间内定义类型/值
3. 在文件中，类型定义应该放在最前面

### 类型声明规范

在进行类型声明时应尽量依靠 TS 的自动类型推断功能，如果能够推断出正确类型尽量不要再手动声明。

1. 基础类型变量不需要手动声明类型。

```ts
let foo = 'foo'
let bar = 2
let baz = false
```

2. 引用类型变量应该保证类型正确，不正确的需要手动声明。

```ts
// 自动推断
let foo = [1, 2] // number[]

// 显示声明
// Bad
let bar = [] // any[]

// Good
let bar: number[] = []
```

### 普通类型

不要使用如下类型 `Number，String，Boolean，Object`，这些类型指的是非原始的装盒对象，该使用类型 `number，string，boolean，object`。

```ts
// Bad
function reverse(s: String): String

// Good
function reverse(s: string): string
```

### 数组

声明数组时使用 `diskList:Dist[]` 而不是 `diskList:Array<Disk>`，便于阅读。

### 函数

1. 不要为返回值被忽略的回调函数设置一个 `any` 类型的返回值类型，可以使用 `void`：

```ts
// Bad
function fn(x: () => any) {
  x()
}

// Good
function fn(x: () => void) {
  x()
}
```

使用 `void` 相对安全，因为它防止了你不小心使用 x 的返回值：

```ts
function fn(x: () => void) {
  const k = x() // oops! meant to do something else
  k.doSomething() // error, but would be OK if the return type had been 'any'
}
```

2. 函数重载应该排序，令具体的排在模糊的之前，因为 TS 会选择第一个匹配到的重载，当位于前面的重载比后面的更”模糊“，那么后面的会被隐藏且不会被选用：

```ts
// Bad
declare function fn(x: any): any
declare function fn(x: HTMLElement): number
declare function fn(x: HTMLDivElement): string

let myElem: HTMLDivElement
let x = fn(myElem) // x: any, wat?

// Good
declare function fn(x: HTMLDivElement): string
declare function fn(x: HTMLElement): number
declare function fn(x: any): any

let myElem: HTMLDivElement
let x = fn(myElem) // x: string, :)
```

3. 优先使用使用可选参数，而不是重载：

```ts
// Bad
interface Example {
  diff(one: string): number
  diff(one: string, two: string): number
  diff(one: string, two: string, three: boolean): number
}

// Good
interface Example {
  diff(one: string, two?: string, three?: boolean): number
}
```

4. 使用联合类型，不要为仅在某个位置上的参数类型不同的情况下定义重载：

```ts
// Bad
interface Moment {
  utcOffset(): number
  utcOffset(b: number): Moment
  utcOffset(b: string): Moment
}

// Good
interface Moment {
  utcOffset(): number
  utcOffset(b: number | string): Moment
}
```

### 类

1. 类成员声明时除了 `public` 成员，其余成员都应该显式加上作用域修辞符。

```ts
// Bad
class Foo {
  foo = 'foo'
  bar = 'bar'
  getFoo() {
    return this.foo
  }
}
const foo = new Foo()
foo.foo
foo.bar

// Good
class Foo {
  private foo = 'foo'
  bar = 'bar'
  getFoo() {
    return this.foo
  }
}
const foo = new Foo()
foo.getFoo()
foo.bar
```

2. 子类继承父类时，如果需要重写父类方法，需要加上 `override` 修辞符。

```ts
class Animal {
  eat() {
    console.log('food')
  }
}

// Bad
class Dog extends Animal {
  eat() {
    console.log('bone')
  }
}

// Good
class Dog extends Animal {
  override eat() {
    console.log('bone')
  }
}
```

### 枚举

使用枚举代替对象设置常量集合。使用对象定义的普通的常量集合修改时不会提示错误，除非使用 `as const` 修饰符。

```ts
// Bad
const Status = {
  Success: 'success',
}

// Good
enum Status {
  Success = 'success',
}
```

`as const` 修饰符用在变量声明或表达式的类型上时，它会强制 TS 将变量或表达式的类型视为不可变的（immutable）。这意味着，如果你尝试对变量或表达式进行修改，TS 会报错。

```ts
const foo = ['a', 'b'] as const
foo.push('c') // 报错，因为 foo 类型被声明为不可变的

const bar = { x: 1, y: 2 } as const
bar.x = 3 // 报错，因为 bar 类型被声明为不可变的
```

### 风格

1. 使用 arrow 函数代替匿名函数表达式。
2. 只要需要的时候才把 arrow 函数的参数括起来。 比如，`(x) => x + x` 是错误的，下面是正确的做法：
   1. `x => x + x`
   2. `(x,y) => x + y`
   3. `<T>(x: T, y: T) => x === y`
3. 总是使用 `{}` 把循环体和条件语句括起来。
4. 小括号里开始不要有空白。逗号，冒号，分号后要有一个空格。比如：
   1. `for (let i = 0, n = str.length; i < 10; i++) {}`
   2. `if (x < 10) {}`
   3. `function f(x: number, y: string): void {}`
5. 每个变量声明语句只声明一个变量 （比如使用 `let x = 1; let y = 2;` 而不是 `let x = 1, y = 2;`）。
6. 如果函数没有返回值，最好使用 `void`

## 参考资料

1. [Coding guidelines](https://github.com/microsoft/TypeScript/wiki/Coding-guidelines)
2. [TypeScript 手册](https://bosens-china.github.io/Typescript-manual/download/zh/wiki/coding_guidelines.html)
3. [TypeScript 中文手册](https://typescript.bootcss.com/declaration-files/do-s-and-don-ts.html)
4. [Prohibition against prefixing interfaces with "I"](https://github.com/microsoft/TypeScript-Handbook/issues/121)
5. [Confused about the Interface and Class coding guidelines for TypeScript](https://stackoverflow.com/questions/31876947/confused-about-the-interface-and-class-coding-guidelines-for-typescript)
6. [为什么不建议 TypeScript 中的接口名以 I 开头？](https://www.zhihu.com/question/484266650)
7. [Typescript 开发规范](https://juejin.cn/post/7047843645273145358)
8. [TypeScript 中 as const 是什么](https://juejin.cn/post/7181833448464580645)

Typescript 中 interface 和 type 区别
https://chanshiyu.gitbook.io/blog/qian-duan/javascript/11typescript-zhong-interface-he-type-qu-bie
