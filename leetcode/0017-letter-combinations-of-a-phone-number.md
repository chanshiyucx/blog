---
title: Letter Combinations Of A Phone Number
date: 2024-11-05 17:56:50
level: Medium
tags:  
  - Algorithm/HashTable
---

## Intuition

The task is to find all possible letter combinations that a sequence of digits could represent on a phone keypad. This problem can be solved by recursively building combinations of letters using backtracking, as each digit has a predefined set of possible letters.

## Approach

1. **Define the Map**:
   - Create a map of digit-to-letter mappings, following the layout of a phone keypad.

2. **Backtracking Function**:
   - Use a helper function `backtrack` to build combinations by appending each letter corresponding to the current digit and recursively processing the next digit.
   - When all digits have been processed, add the completed combination to the results array.

3. **Recursive Process**:
   - Start with an empty combination string and the full `digits` string.
   - For each recursive call, take the letters corresponding to the current digit, appending each letter to the current combination and proceeding with the next digit.

4. **Return the Result**:
   - Once all possible combinations are generated, return the results array.

## Complexity

- **Time complexity**: $O(3^n*4^m)$, where `n` is the number of digits with 3 corresponding letters (2, 3, 4, 5, 6, 8) and `m` is the number of digits with 4 corresponding letters (7, 9).
- **Space complexity**: $O(3^n*4^m)$, for storing the output and recursive call stack.

## Code

```typescript
const map: Map<string, string[]> = new Map([
  ["2", ["a", "b", "c"]],
  ["3", ["d", "e", "f"]],
  ["4", ["g", "h", "i"]],
  ["5", ["j", "k", "l"]],
  ["6", ["m", "n", "o"]],
  ["7", ["p", "q", "r", "s"]],
  ["8", ["t", "u", "v"]],
  ["9", ["w", "x", "y", "z"]],
])

function backtrack(combination: string, nextDigits: string, results: string[]) {
  if (nextDigits.length === 0) {
    results.push(combination)
  } else {
    const chars = map.get(nextDigits[0])!
    for (const char of chars) {
      backtrack(combination + char, nextDigits.slice(1), results)
    }
  }
}

function letterCombinations(digits: string): string[] {
  if (!digits) return []
  const results: string[] = []
  backtrack("", digits, results)
  return results
}
```
