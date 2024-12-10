---
title: 3sum Closest
date: 2024-11-05 16:41:32
level: Medium
tags:  
  - Algorithm/TwoPointers
---

## Intuition

The goal is to find a triplet in `nums` whose sum is closest to a given `target`. We can leverage a similar two-pointer approach as in the "3Sum" problem, but instead of looking for a sum of exactly zero, we aim to find the sum closest to the `target`.

## Approach

1. **Sort the Array**:
   - First, sort `nums` in ascending order, which allows us to use two pointers effectively for summing values.

2. **Initialize Closest Sum**:
   - Set `ans` as the sum of the first three numbers, as an initial closest sum.
   - Calculate the initial difference, `diff`, between `ans` and `target`.

3. **Iterate with Fixed Pointer**:
   - For each index `left`, treat `nums[left]` as the first number of the triplet.

4. **Two-Pointer Technique**:
   - Set `middle` to `left + 1` and `right` to `nums.length - 1`.
   - Calculate `sum = nums[left] + nums[middle] + nums[right]`.
	 - If `sum` equals `target`, return `sum`, as it's the closest possible.
	 - Otherwise, calculate the difference, `tempDiff`, between `sum` and `target`.
	   - If `tempDiff` is smaller than `diff`, update `ans` with `sum` and `diff` with `tempDiff`.
	 - If `sum` is greater than `target`, move `right` to decrease the sum.
	 - If `sum` is less than `target`, move `middle` to increase the sum.

5. **Return the Result**:
   - After finding the closest sum in all iterations, return `ans`.

## Complexity

- **Time complexity**: $O(n²)$, sorting takes O(n log n), and the two-pointer traversal for each element takes O(n), making it O(n²) overall.
- **Space complexity**: $O(1)$ for extra space (excluding the result variable).

## Code

```typescript
function threeSumClosest(nums: number[], target: number): number {
  nums = nums.sort((a, b) => a - b)
  let ans = nums[0] + nums[1] + nums[2]
  let diff = Math.abs(ans - target)

  for (let left = 0; left < nums.length - 2; left++) {
    let middle = left + 1
    let right = nums.length - 1

    while (middle < right) {
      const sum = nums[left] + nums[middle] + nums[right]
      if (sum === target) {
        return sum
      }
      const tempDiff = Math.abs(sum - target)
      if (tempDiff < diff) {
        ans = sum
        diff = tempDiff
      }
      if (sum > target) {
        right--
      } else {
        middle++
      }
    }
  }

  return ans
}
```
