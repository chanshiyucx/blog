# TypeScript 操作符

## keyof

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

## Partial 和 Pick

```typescript
interface Organization {
  id: number
  name: string
  address: string
  type: string
  nationality: string
}
const url: string = 'https://...some-server-url.com'

const params: Partial<Organization> = {
  address: '...new address',
}

// 和上面 Partial 效果一样
const params: Pick<Organization, 'address'> = {
  address: '...new address',
}
```
