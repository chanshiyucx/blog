# TypeScript 小技巧

## 01 keyof

keyof 与 Object.keys 略有相似，只不过 keyof 取 interface 的键。

```ts
interface Point {
  x: number
  y: number
}

// type keys = "x" | "y"
type keys = keyof Point
```

假设有一个 object 如下所示，我们需要使用 typescript 实现一个 get 函数来获取它的属性值：

```ts
function get(o: object, name: string) {
  return o[name]
}
```

我们刚开始可能会这么写，不过它有很多缺点：

1. 无法确认返回类型：这将损失 ts 最大的类型校验功能；
2. 无法对 key 做约束：可能会犯拼写错误的问题。

这时可以使用 keyof 来加强 get 函数的类型功能：

```ts
function get<T extends object, K extends keyof T>(o: T, name: K): T[K] {
  return o[name]
}
```

## 02 TypeScript 中的 is

TypeScript 里有类型保护机制。要定义一个类型保护，我们只要简单地定义一个函数，它的返回值是一个类型谓词：

```ts
function isString(test: any): test is string {
  return typeof test === 'string'
}
```

上述写法与写一个返回值为 boolean 值函数的区别在哪里呢？

```ts
function isString(test: any): boolean {
  return typeof test === 'string'
}
```

当使用 is 类型保护时：

```ts
function isString(test: any): test is string {
  return typeof test === 'string'
}

function example(foo: any) {
  if (isString(foo)) {
    console.log('it is a string' + foo)
    console.log(foo.length) // string function
    // 如下代码编译时会出错，运行时也会出错
    // 因为 foo 是 string 不存在 toExponential 方法
    console.log(foo.toExponential(2))
  }
  // 编译不会出错，但是运行时出错
  console.log(foo.toExponential(2))
}
example('hello world')
```

当返回值为 boolean 时：

```ts
function isString(test: any): boolean {
  return typeof test === 'string'
}

function example(foo: any) {
  if (isString(foo)) {
    console.log('it is a string' + foo)
    console.log(foo.length) // string function
    // foo 为 any，编译正常。
    // 但是运行时会出错，因为 foo 是 string 不存在 toExponential 方法
    console.log(foo.toExponential(2))
  }
}
example('hello world')
```

总结：

1. 在使用类型保护时，TS 会进一步缩小变量的类型。例子中，将类型从 any 缩小至了 string；
2. 类型保护的作用域仅仅在 if 后的块级作用域中生效。

实战：

```ts
function isAxiosError(error: any): error is AxiosError {
  return error.isAxiosError
}

if (isAxiosError(err)) {
  code = `Axios-${err.code}`
}
```

## 03 JSX.Element vs ReactNode vs ReactElement

When to use JSX.Element vs ReactNode vs ReactElement?

```js
<p> // <- ReactElement = JSX.Element
  <Custom> // <- ReactElement = JSX.Element
     {true && "test"} // <- ReactNode
  </Custom>
</p>
```

A ReactElement is an object with a type and props.

```ts
type Key = string | number

interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
  type: T
  props: P
  key: Key | null
}
```

A ReactNode is a ReactElement, a ReactFragment, a string, a number or an array of ReactNodes, or null, or undefined, or a boolean.

```ts
type ReactText = string | number
type ReactChild = ReactElement | ReactText

interface ReactNodeArray extends Array<ReactNode> {}
type ReactFragment = {} | ReactNodeArray

type ReactNode = ReactChild | ReactFragment | ReactPortal | boolean | null | undefined
```

JSX.Element is a ReactElement, with the generic type for props and type being any. so they are more or less the same.

```ts
declare global {
  namespace JSX {
    interface Element extends React.ReactElement<any, any> {}
  }
}
```

Components return:

```ts
render(): ReactNode;
```

And functions are "stateless components":

```ts
interface StatelessComponent<P = {}> {
  (props: P & { children?: ReactNode }, context?: any): ReactElement | null
  // ... doesn't matter
}
```

- TS class component: returns ReactNode with render(), more permissive than React/JS
- TS function component: returns JSX.Element | null, more restrictive than React/JS
