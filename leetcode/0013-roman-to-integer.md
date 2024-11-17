---
title: Roman To Integer
date: 2024-10-30 19:52:31
level: Easy
tags: Algorithm/HashTable
---

## Intuition

The task is to convert a Roman numeral string into its corresponding integer value. The key to solving this problem efficiently is to traverse the input string and compare each symbol with the next to determine whether to add or subtract its value.

## Approach

Below is the step-by-step breakdown of the approach:

1. **Create a Hash Map**:
	- Store Roman numeral symbols as keys and their corresponding integer values as values for constant-time lookups.

2. **Traverse the String**:
	- Iterate through the string from left to right.
	- For each symbol `s[i]`, compare it with the next symbol `s[i + 1]`:
		- If `s[i]` is smaller than `s[i + 1]`, subtract its value from the result (e.g., `"IV"`).
		- Otherwise, add its value to the result.

3. **Return the Result**:
	- Once the traversal is complete, the accumulated result will be the integer value of the Roman numeral. Return the result.

## Complexity

- **Time complexity**: $O(n)$, we traverse the input string once, where `n` is the length of the string.
- **Space complexity**: $O(1)$, the hash map is of fixed size, and no additional space is required.

## Code

```ts
function romanToInt(s: string): number {
  const map: { [key: string]: number } = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000,
  }

  let ans = 0
  for (let i = 0; i < s.length; i++) {
    const curValue = map[s[i]]
    const nextValue = map[s[i + 1]] ?? 0 
    if (curValue < nextValue) {
      ans -= curValue
    } else {
      ans += curValue
    }
  }
  return ans
}
```
