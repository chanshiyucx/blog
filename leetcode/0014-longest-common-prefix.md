---
title: Longest Common Prefix
date: 2024-10-31 15:19:01
level: Easy
tags:  
  - Algorithm/String
---

## Intuition

The task is to find the longest common prefix shared by an array of strings. We can use a character-by-character comparison across all strings. By checking each character position in all strings, we can quickly find the prefix shared by all.

## Approach

Below is the step-by-step breakdown of the approach:

1. **Initialize a Pointer**:
	- Start with a pointer `left` at 0, which will track the length of the common prefix.
	
2. **Character-by-Character Comparison**:
	- For each character position `left` in the first string, check if it matches the character at the same position in all other strings using `Array.every()`.
	- If all strings have the same character at position `left`, increment `left` to continue checking the next character.
	- If any string has a different character at position `left`, break out of the loop.
	
3. **Return the Result**:
	- Return the substring from the start up to `left` in `strs[0]`, representing the longest common prefix.

## Complexity

- **Time complexity**: $O(n * m)$, `n` is the number of strings, and `m` is the length of the shortest string in the array.
  
- **Space complexity**: $O(1)$ , no additional space is used aside from a few variables.

## Code

```typescript
function longestCommonPrefix(strs: string[]): string {
  let left = 0
  while (left < strs[0].length) {
    const isSame = strs.every((str) => str[left] === strs[0][left])
    if (!isSame) break
    left++
  }
  return strs[0].slice(0, left)
}
```
