---
title: Find Longest Special Substring That Occurs Thrice I
date: 2024-12-10 22:45:43
level: Medium
tags: 
  - Algoright/BinarySearch
---

## Intuition

To solve the problem, we can uses **binary search** over the possible values of x, combined with a validation function to check the constraints.

## Approach

Below is the step-by-step breakdown of the approach:

1. **Binary Search Setup**:
	- The range of x is from 0 to n (length of the string).
	- We perform binary search to find the maximum x that satisfies the condition.

2. **Validate Possible**:
	- Checks whether there exists a character in s that appears consecutively at least x times.

3. **Update the Binary Search Range**:
	- If `check(mid)` returns true, it means mid satisfies the condition, and we move the lower bound l to mid.
	- Otherwise, move the upper bound r to `mid - 1`.

4. **Return Result**:
	- If l is 0, it means no valid satisfies the condition, so return -1. Otherwise, return l.

## Complexity

- **Time Complexity**: $O(nlogn)$, binary search has $O(logn)$ iterations, each call to check involves a linear traversal of the string cause $O(n)$.
- **Space Complexity**: $O(1)$, the `cnt` array has a constant size of 26.

## Code

```typescript
function maximumLength(s: string): number {
  const n = s.length
  let [l, r] = [0, n]

  // Validate if the length x is possible
  const check = (x: number): boolean => {
    const cnt: number[] = new Array(26).fill(0)
    for (let i = 0; i < n; ) {
      let j = i + 1
      while (j < n && s[i] === s[j]) {
        j++
      }
      const k = s[i].charCodeAt(0) - 'a'.charCodeAt(0)
      cnt[k] += Math.max(0, j - i - x + 1)
      if (cnt[k] >= 3) return true 
      i = j
    }
    return false
  }

  // Perform binary search
  while (l < r) {
    const mid = (l + r + 1) >>> 1
    if (check(mid)) {
      l = mid
    } else {
      r = mid - 1
    }
  }

  return l === 0 ? -1 : l
}
  ```
