---
title: Create 2D Array
date: 2025-01-06 20:14:44
tags:
  - TypeScript/Array
---
A 2D array is also known as a matrix. It's arranged in a table-like structure that consists of rows and columns. In TypeScript, we can create 2D arrays in several ways, `Array.from()` being one of the most elegant solutions.

The `Array.from()` method creates a shallow-copied array from an array-like or iterable object. It accepts two main parameters:

- An iterable or array-like object to convert
- A optional mapping function that transforms each element

```typescript
Array.from(arrayLike, mapFn)
```

Here's a utility function that creates a 2D array with specified dimensions and initial values:

```typescript
function create2DArray<T>(rows: number, cols: number, initialValue: T): T[][] {
  return Array.from({ length: rows }, () => Array(cols).fill(initialValue))
}

const array = create2DArray<number>(3, 4, 0)
console.table(array) // [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
```

Debugging Tips: When working with 2D arrays, use `console.table()` for better visualization.

Ref: [Array.from()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from)
