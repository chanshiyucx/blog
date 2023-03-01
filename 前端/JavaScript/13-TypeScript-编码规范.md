# TypeScript 编码规范

TypeScript 是一种由微软开发的自由和开源的编程语言。它是 JavaScript 的一个超集，而且本质上向这个语言添加了可选的静态类型和基于类的面向对象编程。

- [Coding guidelines](https://github.com/microsoft/TypeScript/wiki/Coding-guidelines)
- [Google TypeScript 风格指南](https://zh-google-styleguide.readthedocs.io/en/latest/google-typescript-styleguide/contents/)
- [TypeScript 中文手册](https://typescript.bootcss.com/declaration-files/do-s-and-don-ts.html)

## 命名

1. 使用 PascalCase 为类型命名，包括接口 interface、类型别名 type、类 class。

```typescript
// Bad
interface foo {}
type bar = {}
class baz {}

// Good
interface Foo {}
type Bar = {}
class Baz {}
```

2. 不要使用 `I` 做为接口名前缀，接口成员使用 camelCase 方式命名。

```typescript
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
>
> 1. I 前缀违反了封装原则：在 TypeScript 中，类可以实现接口，接口可以继承接口，接口可以继承类。类和接口都是某种意义上的抽象和封装，继承时不需要关心它是一个接口还是一个类。如果用 I 前缀，当一个变量的类型更改了，比如由接口变成了类，那变量名称就必须同步更改。
> 2. 防止不恰当的命名：禁止使用 I 前缀可以迫使程序员为接口取一个合适的、带有语义、便于和其他同类型变量区分的名字，而不仅是用前缀区分。
> 3. 匈牙利命名的时代已经过时：匈牙利命名法由类型前缀加实际的变量名组成，用这种方法命名的变量，看到变量名，可以立即知道其类型。但它的缺点远大于它带来的好处，比如使变量名变得冗长，使相同主体名但类型不同的变量有歧义。

示例：

```typescript
interface IFoo {}
class Point {}
type Baz = IFoo & Point
```

其实我们关心的是这是否是一个「类型」，不论它是 `interface` 或 `class` 或 `type`，都作为「类型」，其它的都不加前缀，没必要给 `interface` 加个前缀去独立出来。

延申：不同于 Java 等静态类型语言，TypeScript 考虑到 JavaScript 本身的灵活特性，采用的是 Structural Type System。**TypeScript 比较的并不是类型定义本身，而是类型定义的形状（Shape），即各种约束条件。**

示例一：

```typescript
interface Foo {
  name: string
}

type Bar = {
  name: string
}

const foo: Foo = { name: 'shiyu' }
const bar: Bar = foo // Okay.
```

示例二：

```typescript
class Foo {
  say(input: string): number {}
}

class Bar {
  say(input: string): number {}
}

const foo: Foo = new Foo() // Okay.
const bar: Bar = new Foo() // Okay.
```

> 1. [Prohibition against prefixing interfaces with "I"](https://github.com/microsoft/TypeScript-Handbook/issues/121)
> 2. [Confused about the Interface and Class coding guidelines for TypeScript](https://stackoverflow.com/questions/31876947/confused-about-the-interface-and-class-coding-guidelines-for-typescript)

4. 使用 PascalCase 为枚举对象本身和枚举成员命名。

```typescript
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

```typescript
// Bad
const DiskInfo
function GetDiskInfo() {}

// Good
const diskInfo
function getDiskInfo() {}
```

6. 使用 PascalCase 为类命名，类成员使用 camelCase 方式命名。

```typescript
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

7. 导入模块的命名空间时使用 camelCase 命名法。

```typescript
import * as fooBar from './foo_bar'
```

8. 不要为私有属性或方法名添加下划线 `_` 前缀或后缀。
9. 尽可能使用完整的单词拼写命名，命名应当具有描述性且易于理解。不要使用对项目以外的用户而言含糊不清或并不熟悉的缩写，不要通过删减单词中的字母来强行创造缩写。

总结：

| 命名法                              | 分类                                       |
| ----------------------------------- | ------------------------------------------ |
| 帕斯卡命名法（PascalCase）          | 类、接口、类型别名、枚举、枚举值、类型参数 |
| 驼峰式命名法（camelCase）           | 变量、参数、函数、方法、属性、模块别名     |
| 全大写下划线命名法（CONSTANT_CASE） | 全局常量                                   |

## 模块

### 导入

TypeScript 代码必须使用路径进行导入。这里的路径既可以是相对路径，以 `.` 或 `..` 开头，也可以是从项目根目录开始的绝对路径，如 `root/path/to/file`。

在引用逻辑上属于同一项目的文件时，应使用相对路径 `./foo`，不要使用绝对路径 `path/to/foo`。

应尽可能地限制父层级的数量（避免出现诸如 `../../../` 的路径），过多的层级会导致模块和路径结构难以理解，当路径层级过多时建议使用路径别名。

```typescript
import { Symbol1 } from '../parent/file'
import { Symbol2 } from './sibling'
import { Symbol3 } from '@/utils/sibling'
```

在 ES6 和 TypeScript 中，导入语句共有四种变体：

| 导入类型 | 示例                              | 用途                                       |
| -------- | --------------------------------- | ------------------------------------------ |
| 模块     | `import * as foo from 'foo'`      | TypeScript 导入方式                        |
| 解构     | `import { SomeThing } from 'foo'` | TypeScript 导入方式                        |
| 默认     | `import SomeThing from 'foo'`     | 只用于外部代码的特殊需求                   |
| 副作用   | `import 'foo'`                    | 只用于加载某些库的副作用（例如自定义元素） |

```typescript
// 应当这样做！从这两种变体中选择较合适的一种（见下文）。
import * as ng from '@angular/core'
import { Foo } from './foo'

// 只在有需要时使用默认导入。
import Button from 'Button'

// 有时导入某些库是为了其代码执行时的副作用。
import 'jasmine'
import '@polymer/paper-button'
```

#### 模块导入和解构导入

根据使用场景的不同，模块导入和解构导入分别有其各自的优势。

模块导入：

1. 模块导入语句为整个模块提供了一个名称，模块中的所有符号都通过这个名称进行访问，这为代码提供了更好的可读性，同时令模块中的所有符号可以进行自动补全。
2. 模块导入减少了导入语句的数量，降低了命名冲突的出现几率，同时还允许为被导入的模块提供一个简洁的名称。

解构导入语句则为每一个被导入的符号提供一个局部的名称，这样在使用被导入的符号时，代码可以更简洁。

模块导入的例子：

```typescript
// Bad，不要这样做！无意义地使用命名空间中的名称使得导入语句过于冗长。
import { TableViewItem, TableViewHeader, TableViewRow, TableViewModel, TableViewRenderer } from './tableview'
let item: TableViewItem

// Good，应当这样做！使用模块作为命名空间。
import * as tableview from './tableview'
let item: tableview.Item
```

解构导入的例子：

```typescript
import * as testing from './testing'

// 所有的测试都只会重复地使用相同的三个函数。考虑使用解构导入语句直接导入这几个符号
testing.describe('foo', () => {
  testing.it('bar', () => {
    testing.expect()
    testing.expect()
  })
})
```

建议：

```typescript
// 这样做更好！为这几个常用的函数提供局部变量名。
import { describe, it, expect } from './testing'

describe('foo', () => {
  it('bar', () => {
    expect()
    expect()
  })
})
```

#### 重命名导入

在代码中，可以使用重命名导入解决命名冲突：

```typescript
import { SomeThing as SomeOtherThing } from './foo'
```

在以下几种情况下，重命名导入可能较为有用：

1. 避免与其它导入的符号产生命名冲突。
2. 被导入符号的名称是自动生成的。
3. 被导入符号的名称不能清晰地描述其自身，需要通过重命名提高代码的可读性，如将 RxJS 的 from 函数重命名为 observableFrom。

### 导出

代码中必须使用具名的导出声明。不要使用默认导出，这样能保证所有的导入语句都遵循统一的范式。

```typescript
// Use named exports:
export class Foo {}

// X 不要这样做！不要使用默认导出！
export default class Foo {}
```

为什么？因为默认导出并不为被导出的符号提供一个标准的名称，这增加了维护的难度和降低可读性的风险，同时并未带来明显的益处。

```typescript
// foo.ts 采用默认导出
export default class Foo {}

// 在其他文件导入时，会造成如下的弊端
import Foo from './foo' // 这个语句是合法的。
import Bar from './foo' // 这个语句也是合法的。
```

具名导出的一个优势是，当代码中试图导入一个并未被导出的符号时，上面这段代码会报错。

假设在 `foo.ts` 中有如下的导出声明：

```typescript
// 不要这样做！
const foo = 'something'
export default foo
```

如果在 `bar.ts` 中采用解构导入：

```typescript
// 编译错误！
import { bar } from './foo'
```

会导致编译错误： `error TS2614: Module '"./foo"' has no exported member 'bar'`。反之，如果在 `bar.ts` 中的导入语句为：

```typescript
// 不要这样做！这定义了一个多余的变量 bar！
import bar from './foo'
```

结果是 `bar === foo`，这往往不符合预期，且难以调试。

## 类型

### 声明规范

1. 除非类型/函数需要在多个组件中共享，否则不要导出
2. 在文件中，类型定义应该放在最前面

### 自动类型推断

在进行类型声明时应尽量依靠 TypeScript 的自动类型推断功能，如果能够推断出正确类型尽量不要再手动声明。

1. 基础类型变量不需要手动声明类型。

```typescript
let foo = 'foo'
let bar = 2
let baz = false
```

2. 引用类型变量应该保证类型正确，不正确的需要手动声明。

```typescript
// 自动推断
let foo = [1, 2] // number[]

// 显示声明
// Bad
let bar = [] // any[]

// Good
let bar: number[] = []
```

### 拆箱类型

**在任何情况下，都不应该使用装箱类型**。不要使用如下类型 `Number，String，Boolean，Object`，这些类型指的是**装箱类型**，该使用类型 `number，string，boolean，object`，这些类型指的是**拆箱类型**。

```typescript
// Bad
function reverse(s: String): String

// Good
function reverse(s: string): string
```

以 `String` 为例，它包括 `undefined、null、void`，以及代表的拆箱类型 `string`，但并不包括其他装箱类型对应的拆箱类型，我们看以下的代码：

```typescript
// 以下代码成立
const tmp1: String = undefined
const tmp2: String = null
const tmp3: String = void 0
const tmp4: String = 'linbudu'

// 以下代码不成立，因为不是字符串类型的拆箱类型
const tmp5: String = 599
const tmp6: String = { name: 'linbudu' }
const tmp7: String = () => {}
const tmp8: String = []
```

### null 还是 undefined？

TypeScript 代码中可以使用 `undefined` 或者 `null` 标记缺少的值，这里并无通用的规则约定应当使用其中的某一种。许多 JavaScript API 使用 `undefined`（例如 `Map.get`），然而 DOM 则更多地使用 `null`（例如 `Element.getAttribute`），因此，对于 `null` 和 `undefined` 的选择取决于当前的上下文。

1. 可空/未定义类型别名

**不允许为包括 `|null` 或 `|undefined` 的联合类型创建类型别名**。这种可空的别名通常意味着空值在应用中会被层层传递，并且它掩盖了导致空值出现的源头。另外，这种别名也让类或接口中的某个值何时有可能为空变得不确定。

因此，代码必须在使用别名时才允许添加 `|null` 或者 `|undefined`。同时，代码应当在空值出现位置的附近对其进行处理。

```typescript
// 不要这样做！不要在创建别名的时候包含 undefined ！
type CoffeeResponse = Latte | Americano | undefined

class CoffeeService {
  getLatte(): CoffeeResponse {}
}
```

正确的做法：

```typescript
// 应当这样做！在使用别名的时候联合 undefined ！
type CoffeeResponse = Latte | Americano

class CoffeeService {
  // 代码应当在空值出现位置的附近对其进行处理
  getLatte(): CoffeeResponse | undefined {}
}
```

2. 可选参数/可选字段优先

TypeScript 支持使用创建可选参数和可选字段，例如：

```typescript
interface CoffeeOrder {
  sugarCubes: number
  milk?: Whole | LowFat | HalfHalf
}

function pourCoffee(volume?: Milliliter) {}
```

可选参数实际上隐式地向类型中联合了 `|undefined`。应当使用可选字段（对于类或者接口）和可选参数而非联合 `|undefined` 类型。

### interface 还是 type？

1. interface：接口是 TypeScript 设计出来用于定义对象类型的，可以对对象的形状进行描述。
2. type：类型别名用于给各种类型定义别名，它并不是一个类型，只是一个别名而已。

相同点：

1. 都可以描述一个对象或者函数。

```typescript
// interface
interface User {
  name: string
  age: number
}

interface SetUser {
  (name: string, age: number): void
}

// type
type User = {
  name: string
  age: number
}

type SetUser = (name: string, age: number) => void
```

2. 都允许继承

interface 和 type 都可以继承，并且两者并不是相互独立的，也就是说 interface 可以 extends type, type 也可以 extends interface。虽然效果差不多，但是两者语法不同。

```typescript
// interface extends interface
interface Name {
  name: string
}
interface User extends Name {
  age: number
}

// type extends type
type Name = {
  name: string
}
type User = Name & { age: number }

// interface extends type
type Name = {
  name: string
}
interface User extends Name {
  age: number
}

// type extends interface
interface Name {
  name: string
}
type User = Name & {
  age: number
}
```

不同点：

1. type 可以声明基本类型别名、联合类型、交叉类型、元组等类型，而 interface 不行。

```typescript
// 基本类型别名
type Name = string

// 联合类型
interface Dog {
  wong()
}
interface Cat {
  miao()
}
type Pet = Dog | Cat

//  元组类型，具体定义数组每个位置的类型
type PetList = [Dog, Pet]
```

2. type 语句中还可以使用 typeof 获取实例的 类型进行赋值。

```typescript
// 当你想获取一个变量的类型时，使用 typeof
const div = document.createElement('div')
type B = typeof div
```

3. interface 能够声明合并，重复声明 type 会报错。

```typescript
interface User {
  name: string
  age: number
}

interface User {
  sex: string
}

/*
User 接口为 {
  name: string
  age: number
  sex: string
}
*/
```

总结：

- 如果使用联合类型、交叉类型、元组等类型的时候，用 type 类型别名
- 如果需要使用 extends 进行类型继承时，使用 interface
- 其他类型定义能使用 interface，优先使用 interface

所以，当需要声明用于对象的类型时，应当使用接口，而非对象字面量表达式的类型别名：

```typescript
// 应当这样做！
interface User {
  firstName: string
  lastName: string
}

// 不要这样做！
type User = {
  firstName: string
  lastName: string
}
```

为什么？这两种形式是几乎等价的，因此，基于从两个形式中只选择其中一种以避免项目中出现变种的原则，这里选择了更常见的接口形式。相关技术原因 [TypeScript: Prefer Interfaces](https://ncjamieson.com/prefer-interfaces/)。

> TypeScript 团队负责人的话：“老实说，我个人的意见是对于任何可以建模的对象都应当使用接口。相比之下，使用类型别名没有任何优势，尤其是类型别名有许多的显示和性能问题”。

### 绕过类型检测

1. 鸭子类型

> 当看到一只鸟走起来像鸭子、游泳起来像鸭子、叫起来也像鸭子，那么这只鸟就可以被称为鸭子。

鸭子类型放在 TypeScript 里来说就是我们可以在鸟上构建走路、游泳、叫等方法，创建一只像鸭子的鸟，来绕开对鸭子的类型检测。

```typescript
interface Param {
  field1: string
}

const func = (param: Param) => param

func({ field1: '111', field2: 2 }) // Error

const param1 = { field1: '111', field2: 2 }
func(param1) // success
```

在这里构造了一个函数 func 接受参数为 Param，当直接调用 func 传参时，相当于是赋值给变量 param，此时会严格按照参数校验进行，因此会报错。

而如果使用一个临时变量存储，再将变量传递给 func，此时则会应用鸭子类型的特性，因为 param1 中 包含 field1，TypeScript 会认为 param1 已经完全实现了 Param，可以认为 param1 对应的类型是 Param 的子类，这个时候则可以绕开对多余的 field2 的检测。

2. 类型断言

```typescript
interface Param {
  field1: string
}

const func = (param: Param) => param
func({ field1: '111', field2: 2 } as Param) // success
```

### any 类型

TypeScript 的 `any` 类型是所有其它类型的超类，又是所有其它类型的子类，同时还允许解引用一切属性。因此，使用 `any` 十分危险，它会掩盖严重的程序错误，并且它从根本上破坏了对应的值“具有静态属性”的原则。

**尽可能不要使用 `any`**。如果出现了需要使用 `any` 的场景，可以考虑下列的解决方案：

1. 缩小 any 的影响范围

```typescript
function f1() {
  const x: any = expressionReturningFoo() // 不建议，后续的 x 都是 any 了
  processBar(x)
}

function f2() {
  const x = expressionReturningFoo()
  processBar(x as any) // 建议，只有这里是 any
}
```

2. 使用更细化的 any

```typescript
const numArgsBad = (...args: any) => args.length // Return any 不推荐
const numArgs = (...args: any[]) => args.length // Return number 推荐
```

让剩余参数从 `any` 范围缩小到 `any[]`，从而可以读取调用数组上属性和方法。

3. any 的自动推断

TypeScript 中的 any 并不是一成不变的，会随着用户的操作，TypeScript 会猜测更加合理的类型。

```typescript
const output = [] // any[]
output.push(1) // number[]
output.push('2') // (number|string)[]
```

4. 优先使用 unknown 而非 any

`any` 类型的值可以赋给其它任何类型，还可以对其解引用任意属性。一般来说，这个行为不是必需的，也不符合期望，此时代码试图表达的内容其实是“该类型是未知的”。在这种情况下，应当使用内建的 `unknown` 类型。它能够表达相同的语义，并且，因为 `unknown` 不能解引用任意属性，它较 `any` 而言更为安全。一个 `unknown` 类型的变量可以再次赋值为任意其它类型。

### 类型断言

1. 谨慎使用类型断言和非空断言

类型断言（x as SomeType）和非空断言（y!）是不安全的。这两种语法只能够绕过编译器，而并不添加任何运行时断言检查，因此有可能导致程序在运行时崩溃。因此，**除非有明显或确切的理由，否则不应使用类型断言和非空断言**。

```typescript
// 不要这样做！
;(x as Foo).foo()

y!.bar()
```

如果希望对类型和非空条件进行断言，最好的做法是显式地编写运行时检查。

```typescript
// 应当这样做！
// 这里假定 Foo 是一个类。
if (x instanceof Foo) {
  x.foo()
}

if (y) {
  y.bar()
}
```

有时根据代码中的上下文可以确定某个断言必然是安全的。在这种情况下，应当添加注释详细地解释为什么这一不安全的行为可以被接受，如果使用断言的理由很明显，注释就不是必需的。

```typescript
// 可以这样做！
// x 是一个 Foo 类型的示例，因为……
;(x as Foo).foo()

// y 不可能是 null，因为……
y!.bar()
```

2. 类型断言必须使用 `as` 语法，不要使用尖括号语法，这样能强制保证在断言外必须使用括号。

```typescript
// 不要这样做！
const x = (<Foo>z).length
const y = <Foo>z.length

// 应当这样做！
const x = (z as Foo).length
```

3. 使用类型标记（`: Foo`）而非类型断言（`as Foo`）标明对象字面量的类型。在日后对接口的字段类型进行修改时，前者能够帮助程序员发现 Bug。

```typescript
interface Foo {
  bar: number
  baz?: string // 这个字段曾经的名称是“bam”，后来改名为“baz”。
}

const a: Foo = {
  bar: 123,
  bam: 'abc', // 如果使用类型标记，改名之后这里会报错！对象字面量只能指定已知属性，并且“bam”不在类型“Foo”中
}

const b = {
  bar: 123,
  bam: 'abc', // 如果使用类型断言，改名之后这里并不会报错！
} as Foo
```

## 枚举

**使用枚举代替对象设置常量集合**。使用对象定义的普通的常量集合修改时不会提示错误，除非使用 `as const` 修饰符。

```typescript
// Bad
const Status = {
  Success: 'success',
}

// Good
enum Status {
  Success = 'success',
}
```

还可以通过 `const enum` 声明常量枚举：

```typescript
const enum Status {
  Success = 'success',
}
```

常量枚举和普通枚举的差异主要在访问性与编译产物。对于常量枚举，你只能通过枚举成员访问枚举值（而不能通过值访问成员）。同时，在编译产物中并不会存在一个额外的辅助对象，对枚举成员的访问会被直接内联替换为枚举的值。

**对于枚举类型，必须使用 `enum` 关键字，但不要使用 `const enum`（常量枚举）。TypeScript 的枚举类型本身就是不可变的**。

扩展：`as const` 修饰符用在变量声明或表达式的类型上时，它会强制 TypeScript 将变量或表达式的类型视为不可变的（immutable）。这意味着，如果你尝试对变量或表达式进行修改，TypeScript 会报错。

```typescript
const foo = ['a', 'b'] as const
foo.push('c') // 报错，因为 foo 类型被声明为不可变的

const bar = { x: 1, y: 2 } as const
bar.x = 3 // 报错，因为 bar 类型被声明为不可变的
```

## 数组

- 对于简单类型，应当使用数组的语法糖 `T[]`
- 对于其它复杂的类型，则应当使用较长的 `Array<T>`

这条规则也适用于 `readonly T[]` 和 `ReadonlyArray<T>`。

```typescript
// 应当这样做！
const a: string[]
const b: readonly string[]
const c: MyObj[]
const d: Array<string | number>
const e: ReadonlyArray<string | number>

// 不要这样做！
const f: Array<string> // 语法糖写法更短
const g: ReadonlyArray<string>
const h: { n: number; s: string }[] // 大括号和中括号让这行代码难以阅读
const i: (string | number)[]
const j: readonly (string | number)[]
```

## 函数

1. 不要为返回值被忽略的回调函数设置一个 `any` 类型的返回值类型，可以使用 `void`：

```typescript
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

```typescript
function fn(x: () => void) {
  const k = x() // oops! meant to do something else
  k.doSomething() // error, but would be OK if the return type had been 'any'
}
```

2. 函数重载应该排序，令具体的排在模糊的之前，因为 TypeScript 会选择第一个匹配到的重载，当位于前面的重载比后面的更”模糊“，那么后面的会被隐藏且不会被选用：

```typescript
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

```typescript
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

```typescript
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

## 类

1. 没有必要提供一个空的或者仅仅调用父类构造函数的构造函数。

如果没有为类显式地提供构造函数，编译器会提供一个默认的构造函数。但是，含有参数属性、访问修饰符或参数装饰器的构造函数即使函数体为空也不能省略。

```typescript
// 不要这样做！没有必要声明一个空的构造函数！
class UnnecessaryConstructor {
  constructor() {}
}

// 不要这样做！没有必要声明一个仅仅调用基类构造函数的构造函数！
class UnnecessaryConstructorOverride extends Base {
  constructor(value: number) {
    super(value)
  }
}

// 应当这样做！默认构造函数由编译器提供即可！
class DefaultConstructor {}

// 应当这样做！含有参数属性的构造函数不能省略！
class ParameterProperties {
  constructor(private myService) {}
}
```

2. 不要 #private 语法

不要使用 `#private` 私有字段（又称私有标识符）语法声明私有成员。而应当使用 TypeScript 的访问修饰符。

```typescript
// 不要这样做！
class Clazz {
  #ident = 1
}

// 应当这样做！
class Clazz {
  private ident = 1
}
```

为什么？因为私有字段语法会导致 TypeScript 在编译为 JavaScript 时出现体积和性能问题。同时，ES2015 之前的标准都不支持私有字段语法，因此它限制了 TypeScript 最低只能被编译至 ES2015。另外，在进行静态类型和可见性检查时，私有字段语法相比访问修饰符并无明显优势。

3. 用 readonly

对于不会在构造函数以外进行赋值的属性，应使用 `readonly` 修饰符标记。这些属性并不需要具有深层不可变性。

4. 参数属性

不要在构造函数中显式地对类成员进行初始化。应当使用 TypeScript 的参数属性语法。直接在构造函数的参数前面加上修饰符或 readonly 等同于在类中定义该属性同时给该属性赋值，使代码更简洁。

```typescript
// 不要这样做！重复的代码太多了！
class Foo {
  private readonly barService: BarService
  constructor(barService: BarService) {
    this.barService = barService
  }
}

// 应当这样做！简洁明了！
class Foo {
  constructor(private readonly barService: BarService) {}
}
```

5. 字段初始化

如果某个成员并非参数属性，应当在声明时就对其进行初始化，这样有时可以完全省略掉构造函数。

```typescript
// 不要这样做！没有必要单独把初始化语句放在构造函数里！
class Foo {
  private readonly userList: string[]
  constructor() {
    this.userList = []
  }
}

// 应当这样做！省略了构造函数！
class Foo {
  private readonly userList: string[] = []
}
```

6. 子类继承父类时，如果需要重写父类方法，需要加上 `override` 修辞符

```typescript
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

## 风格与语言特性

### 变量申明

1. 必须使用 `const` 或 `let` 声明变量。尽可能地使用 `const`，除非这个变量需要被重新赋值。禁止使用 `var`。

```typescript
const foo = otherValue // 如果 foo 不可变，就使用 const。
let bar = someValue // 如果 bar 在之后会被重新赋值，就使用 let

// 不要这么做！
var foo = someValue
```

2. 每个变量声明语句只声明一个变量：

```typescript
// Good
let a = 1
let b = 2

// Bad
let c = 1,
  d = 2
```

### 箭头函数

1. 使用箭头函数代替匿名函数表达式。

```typescript
// Good
bar(() => {
  this.doSomething()
})

// Bad
bar(function () {})
```

只有当函数需要动态地重新绑定 `this` 时，才能使用 `function` 关键字声明函数表达式，但是通常情况下代码中不应当重新绑定 `this`。

2. 使用箭头函数时，应当根据具体情况选择表达式或者代码块作为函数体。

```typescript
// 使用函数声明的顶层函数。
function someFunction() {
  // 代码块函数体
  const receipts = books.map((b: Book) => {
    const receipt = payMoney(b.price)
    return receipt
  })

  // 表达式函数体
  const longThings = myValues.filter((v) => v.length > 1000).map((v) => String(v))
}
```

如果不需要函数返回值的话，应当使用代码块函数体：

```typescript
// 不要这样做！如果不需要函数返回值的话，应当使用代码块函数体。
myPromise.then((v) => console.log(v))

// 应当这样做！使用代码块函数体。
myPromise.then((v) => {
  console.log(v)
})
```

3. 只要需要的时候才把箭头函数的参数括起来。 比如，`(x) => x + x` 是错误的，下面是正确的做法：
   1. `x => x + x`
   2. `(x,y) => x + y`
   3. `<T>(x: T, y: T) => x === y`

### 控制流语句/语句块

多行控制流语句必须使用大括号。

```typescript
// 应当这样做！
for (let i = 0; i < x; i++) {
  doSomethingWith(i)
  andSomeMore()
}
if (x) {
  doSomethingWithALongMethodName(x)
}
```

不要这么做：

```typescript
// 不要这样做！
if (x)
    x.doFoo(...)
for (let i = 0; i < x; i++)
    doSomethingWithALongMethodName(i)
```

这条规则的例外时，能够写在同一行的 `if` 语句可以省略大括号。

```typescript
// 可以这样做！
if (x) x.doFoo()
```

### switch 语句

所有的 `switch` 语句都必须包含一个 `default` 分支，即使这个分支里没有任何代码。

```typescript
// 应当这样做！
switch (x) {
  case Y:
    doSomethingElse()
    break
  default:
  // 什么也不做。
}
```

非空语句组不允许越过分支向下执行：

```typescript
// 不能这样做！
switch (x) {
  case X:
    doSomething()
  // 不允许向下执行！
  case Y:
  // ...
}
```

空语句组可以这样做：

```typescript
// 可以这样做！
switch (x) {
  case X:
  case Y:
    doSomething()
    break
  default: // 什么也不做。
}
```

### 相等性判断

**相等性判断必须使用三等号（===）和对应的不等号（!==），禁止使用两等号（==）和对应的不等号（!=）**。两等号会在比较的过程中进行类型转换，这非常容易导致难以理解的错误。并且在 JavaScript 虚拟机上，两等号的运行速度比三等号慢。

```typescript
// 不要这样做！
if (foo == 'bar' || baz != bam) {
  // 由于发生了类型转换，会导致难以理解的行为。
}

// 应当这样做！
if (foo === 'bar' || baz !== bam) {
  // 一切都很好！
}
```

[JavaScript 相等表](https://dorey.github.io/JavaScript-Equality-Table/#three-equals)。

### 异常

在实例化异常对象时，必须使用 `new Error()` 语法而非调用 `Error()` 函数。虽然这两种方法都能够创建一个异常实例，但是使用 `new` 能够与代码中其它的对象实例化在形式上保持更好的一致性。

```typescript
// 应当这样做！
throw new Error('Foo is not a valid bar.')

// 不要这样做！
throw Error('Foo is not a valid bar.')
```

### 对象迭代

对对象使用 `for in` 语法进行迭代很容易出错，因为它同时包括了对象从原型链中继承得来的属性。因此，禁止使用裸的 `for in` 语句。

```typescript
// 不要这样做！
for (const x in someObj) {
  // x 可能包括 someObj 从原型中继承得到的属性。
}
```

在对对象进行迭代时，必须使用 `hasOwnProperty` 语句对对象的属性进行过滤，或者使用 `Object.keys()` 和 `Object.entries()`：

```typescript
// 应当这样做！
for (const x in someObj) {
  if (!someObj.hasOwnProperty(x)) continue
}

// 应当这样做！这里使用 for of 语法
for (const x of Object.keys(someObj)) {
}

// 应当这样做！
for (const [key, value] of Object.entries(someObj)) {
}
```

### 数组迭代

不要在数组上使用 `for in` 进行迭代。这是一个违反直觉的操作，因为它是对数组的下标而非元素进行迭代，还会将其强制转换为 `string` 类型。

```typescript
// 不要这样做！
for (const x in someArray) {
  // 这里的 x 是数组的下标！(还是 string 类型的！)
}
```

如果要在数组上进行迭代，应当使用 `for of` 语句或者传统的 `for` 循环语句。

```typescript
// 应当这样做！
for (const x of someArr) {
  // 这里的 x 是数组的元素
}

// 应当这样做！
for (let i = 0; i < someArr.length; i++) {
  // 如果需要使用下标，就对下标进行迭代，否则就使用 for/of 循环。
  const x = someArr[i]
}

// 应当这样做！返回的是索引和值
for (const [i, x] of someArr.entries()) {
}
```

### 空格

小括号里开始不要有空白。逗号，冒号，分号后要有一个空格。比如：

```typescript
for (let i = 0, n = str.length; i < 10; i++) {}

if (x < 10) {
}

function f(x: number, y: string): void {}
```

> 「有研究显示，写代码不喜欢英文加空格的人，感情路都走得很辛苦，有七成的比例会在 34 岁的时候跟自己不爱的人结婚，而其余三成的人最后只能把遗产留给自己的猫。毕竟爱情跟书写都需要适时地留白。
> 与大家共勉之。」

## 参考资料

1. [Coding guidelines](https://github.com/microsoft/TypeScript/wiki/Coding-guidelines)
2. [TypeScript 手册](https://bosens-china.github.io/Typescript-manual/download/zh/wiki/coding_guidelines.html)
3. [TypeScript 中文手册](https://typescript.bootcss.com/declaration-files/do-s-and-don-ts.html)
4. [Google TypeScript 风格指南](https://zh-google-styleguide.readthedocs.io/en/latest/google-typescript-styleguide/contents/)
5. [Prohibition against prefixing interfaces with "I"](https://github.com/microsoft/TypeScript-Handbook/issues/121)
6. [Confused about the Interface and Class coding guidelines for TypeScript](https://stackoverflow.com/questions/31876947/confused-about-the-interface-and-class-coding-guidelines-for-typescript)
7. [Typescript 开发规范](https://juejin.cn/post/7047843645273145358)
8. [TypeScript 中 as const 是什么](https://juejin.cn/post/7181833448464580645)
9. [TypeScript: Prefer Interfaces](https://ncjamieson.com/prefer-interfaces/)
10. [TypeScript 中 interface 和 type 究竟有什么区别？](https://juejin.cn/post/7063521133340917773)
11. [Typescript 声明文件-第三方类型扩展](https://segmentfault.com/a/1190000022842783)
12. [Effective Typescript：使用 Typescript 的 n 个技巧](https://zhuanlan.zhihu.com/p/104311029)
13. [JavaScript 相等表](https://dorey.github.io/JavaScript-Equality-Table/#three-equals)
