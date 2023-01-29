# TypeScript 小技巧

## 01 keyof

keyof 与 Object.keys 略有相似，只不过 keyof 取 interface 的键。

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

## 02 JSX.Element vs ReactNode vs ReactElement

When to use JSX.Element vs ReactNode vs ReactElement?

```javascript
<p> // <- ReactElement = JSX.Element
  <Custom> // <- ReactElement = JSX.Element
     {true && "test"} // <- ReactNode
  </Custom>
</p>
```

A ReactElement is an object with a type and props.

```typescript
type Key = string | number

interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
  type: T
  props: P
  key: Key | null
}
```

A ReactNode is a ReactElement, a ReactFragment, a string, a number or an array of ReactNodes, or null, or undefined, or a boolean.

```typescript
type ReactText = string | number
type ReactChild = ReactElement | ReactText

interface ReactNodeArray extends Array<ReactNode> {}
type ReactFragment = {} | ReactNodeArray

type ReactNode = ReactChild | ReactFragment | ReactPortal | boolean | null | undefined
```

JSX.Element is a ReactElement, with the generic type for props and type being any. so they are more or less the same.

```typescript
declare global {
  namespace JSX {
    interface Element extends React.ReactElement<any, any> {}
  }
}
```

Components return:

```typescript
render(): ReactNode;
```

And functions are "stateless components":

```typescript
interface StatelessComponent<P = {}> {
  (props: P & { children?: ReactNode }, context?: any): ReactElement | null
  // ... doesn't matter
}
```

- **TS class component: returns ReactNode with render(), more permissive than React/JS**
- **TS function component: returns JSX.Element | null, more restrictive than React/JS**
