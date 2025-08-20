---
title: Defuse the Bomb
date: 2024-11-18 16:40:35
level: Easy
tags:
  - Algorithm/SlidingWindow
---

## Intuition

The task requires us to decrypt a given code by computing a sliding window sum, with the window defined by k. The window either slides from left to right (when k > 0) or right to left (when k < 0). We can use a **sliding window technique** to efficiently calculate the sums without recomputing each sum from scratch.

## Approach

Below is the step-by-step breakdown of the approach:

1. **Handle Edge Case for** k = 0:
	- If k = 0, we return an array of zeros since no values need to be modified.

2. **Initialize the Sliding Window**:
	- We compute the sum of the first window (segment) of elements from code. The window's start and end positions depend on whether k > 0 (slide to the right) or k < 0 (slide to the left).
	- The start pointer indicates the left boundary, and end pointer indicates the right boundary of the window.

3. **Sliding Window**:
	- Assign the current window sum to the result array.
	- Slide the window by removing the element at the start and adding the element at the end + 1 position (taking care of the circular nature using modulo).

4. **Modulo Operation**:
	- Since the array code is circular, when moving past the end of the array, we wrap around to the beginning using the modulo operation (% n).

## Complexity

- **Time Complexity**: $O(n)$, the sliding window approach processes each element once.
- **Space Complexity**: $O(n)$, as we use an additional array to store the result.

## Code

```typescript
function decrypt(code: number[], k: number): number[] {
  const n = code.length
  const result = new Array(n).fill(0)

  if (k === 0) return result

  // Initialize the window for the first segment
  let w = 0
  let start = k > 0 ? 1 : n + k // Left pointer of the window
  let end = k > 0 ? k : n - 1 // Right pointer of the window

  // Calculate the initial sum of the window
  for (let i = start; i <= end; i++) {
    w += code[i % n]
  }

  // Sliding window over the array to compute the result
  for (let i = 0; i < n; i++) {
    result[i] = w
    w -= code[start % n] // Remove the value at the start
    w += code[(end + 1) % n] // Add the next value at the end
    start++
    end++
  }

  return result
}
```
