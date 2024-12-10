---
title: Container With Most Water
date: 2024-10-30 14:23:51
level: Medium
tags:  
  - Algorithm/TwoPointers
---

## Intuition

The task is to find the maximum amount of water that can be held between two lines from the given array `height`. This problem can be efficiently solved using the **two-pointer** approach.

By starting with two pointers at the ends of the array, we try to maximize the area by moving the pointers towards each other based on the heights of the lines.

## Approach

Below is the step-by-step breakdown of the approach:

1. **Initialize Two Pointers:**  
	- `left` pointer starts at the beginning of the array.
	- `right` pointer starts at the end of the array.

2. **Calculate Area:**  
	- In each iteration, compute the area between the lines at `left` and `right`.
	- Use `Math.min(height[left], height[right])` to determine the height of the container since the water level is constrained by the shorter line.

3. **Update Maximum Area:**  
	- Compare the current area with the previously stored maximum (`ans`) and update if the current area is larger.

4. **Move the Pointers:**  
	- Move the pointer pointing to the **shorter line** since a taller line might create a larger area when paired with future lines.

5. **Return the Maximum Area:**  
	- When the two pointers meet, we have checked all possible containers, and `ans` will hold the largest area.

## Complexity

- **Time Complexity:** $O(n)$, where `n` is the length of the `height` array. Each element is visited at most once.
- **Space Complexity:** $O(1)$, as only a constant amount of extra space is used.

## Code

```typescript
function maxArea(height: number[]): number {
  let ans = 0
  let left = 0
  let right = height.length - 1

  while (left < right) {
    const currentArea = Math.min(height[left], height[right]) * (right - left)
    ans = Math.max(ans, currentArea)

    if (height[left] > height[right]) {
      right--
    } else {
      left++
    }
  }
  
  return ans
}
```
