---
title: Shuffle
date: 2025-09-05 20:57:58
tags:
  - Snippet/JavaScript
---

## Description

Shuffles an array in-place using the [Fisher-Yates shuffle](https://bost.ocks.org/mike/shuffle/) algorithm. This function randomly rearranges the elements of an array and returns the same array (mutated). It provides a uniform distribution, meaning each possible permutation has an equal probability of occurring.

## Code

```typescript
export const shuffle = <T>(arr: T[]): T[] => {
  let i = arr.length
  let j
  while (i) {
    j = Math.floor(Math.random() * i--)
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
```

## Usage

```typescript
const numbers = [1, 2, 3, 4, 5]
const shuffled = shuffle(numbers)
console.log(shuffled) [3, 1, 5, 2, 4]
console.log(numbers === shuffled) // true (same array reference)
```
