---
title: Count Prefix and Suffix Pairs I
date: 2025-01-08 20:12:09
level: Easy
tags:
  - Algorithm/String
---

## Intuition

The problem can be solved with a brute-force approach where we iterate over all possible pairs and check the condition for each.

## Approach

Below is the step-by-step breakdown of the approach:

1. **Helper Function**:
	- Define a helper function `isPrefixAndSuffix`, using `startsWith` and `endsWith` to check if one string is both a prefix and a suffix of another string.
	- Return false early if the first string is longer than the second string, since it can't be a valid prefix or suffix.

2. **Iterate Over Pairs**:
	- Use two nested loops to iterate over all possible pairs of words in the array, ensuring  i < j  to avoid redundant checks.
	- For each pair, use the helper function to determine if the condition is met, and increment the count accordingly.

3. **Return the Count**:
	- After iterating through all pairs, return the total count of valid prefix-suffix pairs.

## Complexity

- **Time Complexity**: $O(n^2·L)$,
	- The brute-force approach involves  $O(n^2)$  pair comparisons, where  `n`  is the number of words.
	- For each pair, the `isPrefixAndSuffix` function has a worst-case complexity of  $O(L)$ , where  `L`  is the average length of the words.
- **Space Complexity**: $O(1)$ , as the function uses constant extra space.

## Code

```typescript
function countPrefixSuffixPairs(words: string[]): number {
  const isPrefixAndSuffix = (str1: string, str2: string): boolean => {
    if (str1.length > str2.length) return false
    return str2.startsWith(str1) && str2.endsWith(str1)
  }

  let count = 0
  const n = words.length
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      if (isPrefixAndSuffix(words[i], words[j])) {
        count++
      }
    }
  }

  return count
}
```
