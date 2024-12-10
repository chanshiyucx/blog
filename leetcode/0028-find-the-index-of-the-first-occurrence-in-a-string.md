---
title: Find The Index Of The First Occurrence In A String
date: 2024-11-17 10:17:26
level: Easy
tags:  
  - Algorithm/String
---

## Intuition

The problem requires finding the first occurrence of needle in haystack. This can be solved by iterating through haystack and checking substrings of length equal to needle. If a match is found, return the starting index. If no match is found, return -1.

## Approach

1. **Edge Cases**:
	- If needle is an empty string, return 0.
	- If needle's length exceeds haystack's length, it is impossible for needle to exist in haystack; return -1.

2. **Iterate Through haystack**:
	- Use a loop to traverse haystack.
	- For each index i, check if the substring haystack.substring(i, i + needle.length) equals needle.

3. **Early Exit**:
	- Break the loop as soon as a match is found and return the starting index i.
	- If the loop completes without finding a match, return -1.

## Complexity

- **Time Complexity**: $O(n \cdot k)$, where $n$ is the length of haystack.
- **Space Complexity**: $O(1)$, as no extra space is used beyond a few variables.

## Code

```typescript
function strStr(haystack: string, needle: string): number {
  if (needle.length === 0) return 0
  if (needle.length > haystack.length) return -1

  for (let i = 0; i <= haystack.length - needle.length; i++) {
    if (haystack.substring(i, i + needle.length) === needle) {
      return i
    }
  }

  return -1
}
```
