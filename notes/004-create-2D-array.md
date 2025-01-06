---
title: Create 2D Array
date: 2025-01-06 20:14:44
tags:
  - TypeScript/Array
---
The `Array.from()` method creates a shallow-copied array. It takes in an iterable or array-like object to convert to an array as its first argument. The optional second argument, `mapFn`, is a function that's called on every item of the array. Its return value is added to the array.

```typescript
function create2DArray<T>(rows: number, cols: number, initialValue: T): T[][] {
  return Array.from({ length: rows }, () => Array(cols).fill(initialValue))
}

const array = create2DArray<number>(3, 4, 0)
console.log(array) // [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
```

Ref: [Array.from()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from)
