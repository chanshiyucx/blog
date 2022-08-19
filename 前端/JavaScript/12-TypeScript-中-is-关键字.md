# TypeScript 中 is 关键字

> 本文为个人学习摘要笔记。  
> 原文地址：[TypeScript 中的 is](https://segmentfault.com/a/1190000022883470)

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

## 使用 is 类型保护

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

## 返回值为 boolean

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

## 总结

- 在使用类型保护时，TS 会进一步缩小变量的类型。例子中，将类型从 any 缩小至了 string；
- 类型保护的作用域仅仅在 if 后的块级作用域中生效。
