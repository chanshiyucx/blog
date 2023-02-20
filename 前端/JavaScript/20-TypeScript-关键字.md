# TypeScript 关键字

## 类型约束 extends

语法：`T extends K`，这里的 `extends` 不是类、接口的继承，而是对于类型的判断和约束，意思是判断 `T` 能否赋值给 `K`。

判断 `T` 是否可以赋值给 `U`，可以的话返回 `T`，否则返回 `never`：

```typescript
type Exclude<T, U> = T extends U ? T : never
```

## 类型映射 in

遍历指定接口的 key 或者是遍历联合类型：

```typescript
interface Person {
  name: string
  age: number
  gender: number
}

// 将 T 的所有属性转换为只读类型
type ReadOnlyType<T> = {
  readonly [P in keyof T]: T[P]
}

// type ReadOnlyPerson = {
//   readonly name: string
//   readonly age: number
//   readonly gender: number
// }
type ReadOnlyPerson = ReadOnlyType<Person>
```

## 类型谓词 is

TypeScript 里有类型保护机制。要定义一个类型保护，我们只要简单地定义一个函数，它的返回值是一个**类型谓词**：

```typescript
function isString(test: any): test is string {
  return typeof test === 'string'
}
```

上述写法与写一个返回值为 boolean 值函数的区别在哪里呢？

```typescript
function isString(test: any): boolean {
  return typeof test === 'string'
}
```

当使用 is 类型保护：

```typescript
function isString(test: any): test is string {
  return typeof test === 'string'
}

function example(foo: any) {
  if (isString(foo)) {
    console.log('it is a string' + foo)
    console.log(foo.length) // string function
    // 如下代码编译时会出错，运行时也会出错，因为 foo 是 string 不存在 toExponential 方法
    console.log(foo.toExponential(2))
  }
  // 编译不会出错，但是运行时出错
  console.log(foo.toExponential(2))
}
example('hello world')
```

当返回值为 boolean：

```typescript
function isString(test: any): boolean {
  return typeof test === 'string'
}

function example(foo: any) {
  if (isString(foo)) {
    console.log('it is a string' + foo)
    console.log(foo.length) // string function
    // foo 为 any，编译正常。但是运行时会出错，因为 foo 是 string 不存在 toExponential 方法
    console.log(foo.toExponential(2))
  }
}
example('hello world')
```

总结：

- 在使用类型保护时，TS 会进一步缩小变量的类型。例子中，将类型从 any 缩小至了 string；
- 类型保护的作用域仅仅在 if 后的块级作用域中生效。

实战：

```typescript
function isAxiosError(error: any): error is AxiosError {
  return error.isAxiosError
}

if (isAxiosError(err)) {
  code = `Axios-${err.code}`
}
```

## 待推断类型 infer

可以用 `infer P` 来标记一个泛型，表示这个泛型是一个待推断的类型，并且可以直接使用。

获取函数参数类型：

```typescript
type ParamType<T> = T extends (param: infer P) => any ? P : T

type FunctionType = (value: number) => boolean

type Param = ParamType<FunctionType> // type Param = number

type OtherParam = ParamType<symbol> // type Param = symbol
```

判断 `T` 是否能赋值给 `(param: infer P) => any`，并且将参数推断为泛型 `P`，如果可以赋值，则返回参数类型 `P`，否则返回传入的类型。

获取函数返回类型：

```typescript
type ReturnValueType<T> = T extends (param: any) => infer U ? U : T

type FunctionType = (value: number) => boolean

type Return = ReturnValueType<FunctionType> // type Return = boolean

type OtherReturn = ReturnValueType<number> // type OtherReturn = number
```

判断 `T` 是否能赋值给 `(param: any) => infer U`，并且将返回值类型推断为泛型 `U`，如果可以赋值，则返回返回值类型 `P`，否则返回传入的类型。

## 原始类型保护 typeof

语法：`typeof v === 'typename'` 或 `typeof v !== 'typename'`，用来判断数据的类型是否是某个原始类型（`number`、`string`、`boolean`、`symbol`）并进行类型保护。

**typename 必须是 `number`、`string`、`boolean`、`symbol`**。 但是 TypeScript 并不会阻止你与其它字符串比较，语言不会把那些表达式识别为类型保护。

示例：print 函数会根据参数类型打印不同的结果，那如何判断参数是 `string` 还是 `number` 呢？

```typescript
function print(value: number | string) {
  // 如果是 string 类型
  // console.log(value.split('').join(', '))
  // 如果是 number 类型
  // console.log(value.toFixed(2))
}
```

两种常用的判断方式：

1. 根据是否包含 `split` 属性判断是 `string` 类型，是否包含 `toFixed` 方法判断是 `number` 类型。弊端：不论是判断还是调用都要进行类型转换。
2. 使用类型谓词 `is`。弊端：每次都要去写一个工具函数，太麻烦。

故这里可以使用 `typeof`：

```typescript
function print(value: number | string) {
  if (typeof value === 'string') {
    console.log(value.split('').join(', '))
  } else {
    console.log(value.toFixed(2))
  }
}
```

**使用 `typeof` 进行类型判断后，TypeScript 会将变量缩减为那个具体的类型，只要这个类型与变量的原始类型是兼容的。**

## 类型保护 instanceof

与 `typeof` 类似，不过作用方式不同，`instanceof` 类型保护是通过构造函数来细化类型的一种方式。
`instanceof` 的右侧要求是一个构造函数，TypeScript 将细化为：

- 此构造函数的 `prototype` 属性的类型，如果它的类型不为 `any` 的话
- 构造签名所返回的类型的联合

```typescript
class Bird {
  fly() {
    console.log('Bird flying')
  }
  layEggs() {
    console.log('Bird layEggs')
  }
}

class Fish {
  swim() {
    console.log('Fish swimming')
  }
  layEggs() {
    console.log('Fish layEggs')
  }
}

const bird = new Bird()
const fish = new Fish()

function start(pet: Bird | Fish) {
  // 调用 layEggs 没问题，因为 Bird 或者 Fish 都有 layEggs 方法
  pet.layEggs()

  if (pet instanceof Bird) {
    pet.fly()
  } else {
    pet.swim()
  }

  // 等同于下面
  // if ((pet as Bird).fly) {
  //   (pet as Bird).fly();
  // } else if ((pet as Fish).swim) {
  //   (pet as Fish).swim();
  // }
}
```

## 索引类型查询操作符 keyof

语法：`keyof T`，对于任何类型 `T`， `keyof T` 的结果为 `T` 上已知的公共属性名的联合。

`keyof` 与 Object.keys 略有相似，只不过 keyof 取 interface 的键。

```typescript
interface Point {
  x: number
  y: number
}

// type keys = "x" | "y"
type keys = keyof Point
```

假设有一个 object 如下所示，我们需要使用 typescript 实现一个 get 函数来获取它的属性值：

```typescript
function get(o: object, name: string) {
  return o[name]
}
```

我们刚开始可能会这么写，不过它有很多缺点：

1. 无法确认返回类型：这将损失 ts 最大的类型校验功能；
2. 无法对 key 做约束：可能会犯拼写错误的问题。

这时可以使用 keyof 来加强 get 函数的类型功能：

```typescript
function get<T extends object, K extends keyof T>(o: T, name: K): T[K] {
  return o[name]
}
```

需要注意，**`keyof` 只能返回类型上已知的公共属性名**：

```typescript
class Animal {
  type: string
  weight: number
  private speed: number
}

type AnimalProps = keyof Animal // 'type' | 'weight'
```

当需要获取对象的某个属性值，但是不确定是哪个属性，这个时候可以使用 `extends` 配合 `typeof` 对属性名进行限制，限制传入的参数只能是对象的属性名：

```typescript
const person = {
  name: 'Jack',
  age: 20,
}

function getPersonValue<T extends keyof typeof person>(fieldName: keyof typeof person) {
  return person[fieldName]
}

const nameValue = getPersonValue('name')
const ageValue = getPersonValue('age')
```
