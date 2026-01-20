---
title: Create 2d Array
date: 2025-09-06 09:02:55
tags:
  - Snippet/JavaScript
---

## Description

Creates a 2D array (matrix) with specified dimensions and initial values using `Array.from()`. This utility function provides a clean and type-safe way to generate matrix-like data structures.

## Code

```typescript
function create2DArray<T>(rows: number, cols: number, initialValue: T): T[][] {
  return Array.from({ length: rows }, () => Array(cols).fill(initialValue))
}
```

## Usage

```typescript
const matrix = create2DArray<number>(3, 4, 0)
console.table(matrix) // [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
```
