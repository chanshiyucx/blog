## Record

> 本文为个人学习摘要笔记。  
> 原文地址：[Record in TypeScript](https://laysent.com/til/2019-06-19_record-in-typescript)

`Record` 是 TypeScript 中一个很实用的范型类型。它需要两个具体的参数类型，`Record<K, V>` 用于指定一个对象的类型。其中，对象的所有 key 都是 K 类型的，而这些 key 对应的值则都是 V 类型的。如果不使用 `Record` 类型，可能需要用如下的方法来达到同等的效果：

```typescript
type RecordExample = Record<string, number>

// 等价于
interface EquivalentExample {
  [key: string]: number
}
```

当然，对于 JavaScript 来说，对象的属性其实只能是 string 类型的。虽然有时候也会直接使用 number 作为值，但是其实在用作 key 的时候，会经过一步 toString 的转化。

```typescript
const obj = { key: 'value' }
const key = {
  toString() {
    return 'key'
  },
}
console.log(obj[key]) // output: value
```

这么看起来，`Record` 的应用场景似乎非常有限，只有 `Record<string, xxx>` 或者 `Record<number, xxx>` 两种可能性。然而，TypeScript 中除了可以使用一些泛用的类型之外，也可以对类型做更进一步的限定。比如，指定类型只能是 `'apple' | 'banana' | 'orange'`。如此一来，`Record` 就有了更多的应用场景。

举例来说，如果希望写一个函数，可以将参数对象中所有的值都转化成对应的数字，就可以这么写，就可以保证输入和输出的对象，有相同的 key：

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
