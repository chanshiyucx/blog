# TypeScript 映射类型

## 只读类型 Readonly<T>

定义：用于将 `T` 类型的所有属性设置为只读状态。

```typescript
type Readonly<T> = {
  readonly [P in keyof T]: T[P]
}
```

用法：

```typescript
interface Person {
  name: string
  age: number
}

const person: Readonly<Person> = {
  name: 'Lucy',
  age: 22,
}

// 会报错：Cannot assign to 'name' because it is a read-only property
person.name = 'Lily'
```

> `readonly` 只读， 被 `readonly` 标记的属性**只能在声明时或类的构造函数中赋值**，之后将不可改（即只读属性）。

## 只读数组 ReadonlyArray<T>

定义：用于将 `T` 类型的数组设置为只读状态。只能在数组初始化时为变量赋值，之后数组无法修改。

```typescript
interface ReadonlyArray<T> {
  [Symbol.iterator](): IterableIterator<T>
  entries(): IterableIterator<[number, T]>
  keys(): IterableIterator<number>
  values(): IterableIterator<T>
}
```

用法：

```typescript
interface Person {
  name: string
}

const personList: ReadonlyArray<Person> = [{ name: 'Jack' }, { name: 'Rose' }]

// 会报错：Property 'push' does not exist on type 'readonly Person[]'
// personList.push({ name: 'Lucy' })

// 但是内部元素如果是引用类型，元素自身是可以进行修改的
personList[0].name = 'Lily'
```

## 可选类型 Partial<T>

定义：用于将 `T` 类型的所有属性设置为可选状态，首先通过 `keyof T`，取出类型 `T` 的所有属性，然后通过 `in` 操作符进行遍历，最后在属性后加上 `?`，将属性变为可选属性。

```typescript
type Partial<T> = {
  [P in keyof T]?: T[P]
}
```

用法：

```typescript
interface Organization {
  id: number
  name: string
  address: string
  type: string
  nationality: string
}

const params: Partial<Organization> = {
  address: '...new address',
}

// 和上面 Partial 效果一样
const params: Pick<Organization, 'address'> = {
  address: '...new address',
}
```

## 必选类型 Required<T>

定义：和 `Partial<T>` 作用相反，用于将 `T` 类型的所有属性设置为必选状态，首先通过 `keyof T`，取出类型 `T` 的所有属性， 然后通过 `in` 操作符进行遍历，最后在属性后的 `?` 前加上 `-`，将属性变为必选属性。

```typescript
type Required<T> = {
  [P in keyof T]-?: T[P]
}
```

用法：

```typescript
interface Person {
  name?: string
  age?: number
}

// 使用 Required 映射后返回的新类型，name 和 age 都变成了必选属性
// 会报错：Type '{}' is missing the following properties from type 'Required<Person>': name, age
let person: Required<Person> = {}
```

## 提取属性 Pick<T>

定义：从 `T` 类型中提取部分属性，作为新的返回类型。

```typescript
type Pick<T, K extends keyof T> = {
  [P in K]: T[P]
}
```

用法：

```typescript
interface Goods {
  type: string
  goodsName: string
  price: number
}

// type RequestGoodsParams = {
//     goodsName: string;
//     price: number;
// }
type RequestGoodsParams = Pick<Goods, 'goodsName' | 'price'>

const params: RequestGoodsParams = {
  goodsName: '',
  price: 10,
}
```

## 排除属性 Omit<T>

定义：和 `Pick` 作用相反，用于从 `T` 类型中，排除部分属性，然后返回一个新类型。

```typescript
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
```

用法：

```typescript
interface Rectangular {
  length: number
  height: number
  width: number
}

// type Square = {
//     length: number;
// }
type Square = Omit<Rectangular, 'height' | 'width'>
```

`Omit` 推导过程：

```typescript
type Person = {
  name: string
  age: string
  location: string
}

type PersonWithoutLocation = Omit<Person, 'location'>
// 推导
type PersonWithoutLocation = Pick<Person, Exclude<'name' | 'age' | 'location', 'location'>>
// 推导
type PersonWithoutLocation = Pick<
  Person,
  ('name' extends 'location' ? never : 'name') | ('age' extends 'location' ? never : 'age') | ('location' extends 'location' ? never : 'location')
>
// 推导
type PersonWithoutLocation = Pick<Person, 'name' | 'age' | never>
// 推导
type PersonWithoutLocation = Pick<Person, 'name' | 'age'>
// 推导
type PersonWithoutLocation = {
  [p in 'name' | 'age']: Person[p]
}
// 推导
type PersonWithoutLocation = {
  name: string
  age: string
}
```

## 摘取类型 Extract<T,U>

定义：提取 `T` 中可以赋值给 `U` 的类型。

```typescript
type Extract<T, U> = T extends U ? T : never
```

用法：

```typescript
type T01 = Extract<'a' | 'b' | 'c' | 'd', 'a' | 'c' | 'f'> // 'a' | 'c'

type T02 = Extract<string | number | (() => void), Function> // () => void
```

## 排除类型 Exclude<T,U>

定义：与 `Extract` 用法相反，从 `T` 中剔除可以赋值给 `U` 的类型。

```typescript
type Exclude<T, U> = T extends U ? never : T
```

用法：

```typescript
type T00 = Exclude<'a' | 'b' | 'c' | 'd', 'a' | 'c' | 'f'> // 'b' | 'd'

type T01 = Exclude<string | number | (() => void), Function> // string | number
```

## 属性映射 Record<K,T>

定义：接收两个泛型，`K` 必须可以是可以赋值给 `string | number | symbol` 的类型，通过 `in` 操作符对 `K` 进行遍历，每一个属性的类型都必须是 `T` 类型。

```typescript
type Record<K extends string | number | symbol, T> = {
  [P in K]: T
}
```

`Record` 是 TypeScript 中一个很实用的范型类型。它需要两个具体的参数类型，`Record<K, V>` 用于指定一个对象的类型。其中，对象的所有 key 都是 K 类型的，而这些 key 对应的值则都是 V 类型的。如果不使用 `Record` 类型，可能需要用如下的方法来达到同等的效果：

```typescript
type RecordExample = Record<string, number>

// 等价于
interface EquivalentExample {
  [key: string]: number
}
```

用法一：将 `Person` 类型的数组转化成对象映射：

```typescript
interface Person {
  name: string
  age: number
}

const personList = [
  { name: 'Jack', age: 26 },
  { name: 'Lucy', age: 22 },
  { name: 'Rose', age: 18 },
]

const personMap: Record<string, Person> = {}

personList.forEach((person) => {
  personMap[person.name] = person
})
```

用法二：传递参数时，希望参数是一个对象，但是不确定具体的类型，就可以使用 `Record` 作为参数类型：

```typescript
function doSomething(obj: Record<string, any>) {}
```

用法三：写一个函数，可以将参数对象中所有的值都转化成对应的数字，保证输入和输出的对象有相同的 key：

```typescript
type Input = Record<string, string>
function transform<T extends Input>(input: T): Record<keyof T, number> {
  const keys: (keyof T)[] = Object.keys(input)
  return keys.reduce((acc, key) => {
    acc[key] = +input[key]
    return acc
  }, {} as Record<keyof T, number>)
}
```

然而，需要注意的一点是，在使用联合类型的时候 `Record` 本身也存在局限性（这一点本身是 TypeScript 的局限性）。还是以上面的 `'apple' | 'banana' | 'orange'` 为例，如果这么写，那么下面的代码将是错误的：

```typescript
type Fruit = 'apple' | 'banana' | 'orange'
type Price = Record<Fruit, number>
// type error
const prices: Price = {
  apple: 20,
}
```

`Record` 天然并不能解决可选 key 的情况。`Record<'A' | 'B', number>` 的含义是 A 和 B 都需要是这个类型的 key，而不是说只需要有 A 或 B 一个做 key 就可以了。对于这种需要可选的情况，可以再套上一层 `Partial` 来满足需求：

```typescript
type Price = Partial<Record<Fruit, number>>
// correct
const prices: Price = {
  apple: 20,
}
```

## 不可为空类型 NonNullable<T>

定义：从 `T` 中剔除 `null`、`undefined`、`never` 类型，不会剔除 `void`、`unknow` 类型。

```typescript
type NonNullable<T> = T extends null | undefined ? never : T
```

用法：

```typescript
type T01 = NonNullable<string | number | undefined> // string | number

type T02 = NonNullable<(() => string) | string[] | null | undefined> // (() => string) | string[]

type T03 = NonNullable<{ name?: string; age: number } | string[] | null | undefined> // {name?: string, age: number} | string[]
```

## 构造函数参数类型 ConstructorParameters<typeof T>

定义：返回 class 中构造函数参数类型组成的**元组类型**。

```typescript
type ConstructorParameters<T extends new (...args: any) => any> = T extends new (...args: infer P) => any ? P : never
```

用法：

```typescript
class Person {
  name: string
  age: number
  gender: 'man' | 'women'

  constructor(name: string, age: number, gender: 'man' | 'women') {
    this.name = name
    this.age = age
    this.gender = gender
  }
}

type ConstructorType = ConstructorParameters<typeof Person> //  [name: string, age: number, gender: 'man' | 'women']

const params: ConstructorType = ['Jack', 20, 'man']
```

## 实例类型 InstanceType<T>

定义：获取 `class` 构造函数的返回类型。

```typescript
type InstanceType<T extends new (...args: any) => any> = T extends new (...args: any) => infer R ? R : any
```

用法：

```typescript
class Person {
  name: string
  age: number
  gender: 'man' | 'women'

  constructor(name: string, age: number, gender: 'man' | 'women') {
    this.name = name
    this.age = age
    this.gender = gender
  }
}

type Instance = InstanceType<typeof Person> // Person

const params: Instance = {
  name: 'Jack',
  age: 20,
  gender: 'man',
}
```

## 函数参数类型 Parameters<T>

定义：获取函数的参数类型组成的**元组类型**。

```typescript
type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never
```

用法：

```typescript
type FunctionType = (name: string, age: number) => boolean

type FunctionParamsType = Parameters<FunctionType> // [name: string, age: number]

const params: FunctionParamsType = ['Jack', 20]
```

## 函数返回值类型 ReturnType<T>

定义：获取函数的返回值类型。

```typescript
type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any
```

使用：

```typescript
type FunctionType = (name: string, age: number) => boolean | string

type FunctionReturnType = ReturnType<FunctionType> // boolean | string
```
