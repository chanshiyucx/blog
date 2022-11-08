# TypeScript 学习之 Omit

Omit 是 TypeScript3.5 新增的一个辅助类型，它的作用主要是：**以一个类型为基础支持剔除某些属性，然后返回一个新类型。**

```ts
type Person = {
  name: string
  age: string
  location: string
}

type PersonWithoutLocation = Omit<Person, 'location'>

// PersonWithoutLocation equal to QuantumPerson
type QuantumPerson = {
  name: string
  age: string
}
```

Omit 定义：

```ts
/**
 * Construct a type with the properties of T except for those in type K.
 */
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>
```

## keyof 运算符

keyof 诞生于 TypeScript2.1 版本，它的作用是：**帮助我们获取某种类型的所有键，返回的是一个联合类型。**

```ts
function getProperty<T, K extends keyof T>(obj: T, key: K) {
  return obj[key] // Inferred type is T[K]
}

function setProperty<T, K extends keyof T>(obj: T, key: K, value: T[K]) {
  obj[key] = value
}
```

## Exclude

Exclude 就是数学集合中找出 Type 的“差集”，就是将类型 A 与 B 对比，返回 A 中独有的类型。用法：`Exclude<Type, ExcludedUnion>`。

Exclude 定义：

```ts
/**
 * Exclude from T those types that are assignable to U
 */
type Exclude<T, U> = T extends U ? never : T
```

示例：

```ts
type T0 = Exclude<'a' | 'b' | 'c', 'a'> // type T0 = 'b' | 'c'
```

## Extends

Extends 指的是条件类型。用法：`T extends U ? never : T`。

```ts
type A = 'a' | 'b' | 'c'
type B = 'a'

type C = Exclude<A, B> // 'b' | 'c';

// 上面等价于
type C = ('a' extends B ? never : 'a') | ('b' extends B ? never : 'b') | ('c' extends B ? never : 'c') // 'b' | 'c';
```

## Pick

`Pick<Type, Keys>`，顾名思义：拣选属性，将 Type 的部分类型 Keys 挑出来，返回这部分类型。

Pick 定义：

```ts
/**
 * From T, pick a set of properties whose keys are in the union K
 */
type Pick<T, K extends keyof T> = {
  [P in K]: T[P]
}
```

## Omit 推导过程

根据上面提到的几种概念，就可以实现 Omit 的推导过程：

```ts
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
