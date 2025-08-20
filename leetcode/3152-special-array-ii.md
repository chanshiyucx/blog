---
title: Special Array II
date: 2024-12-09 22:11:05
level: Medium
tags:
  - Algorithm/PrefixSum
---

## Intuition

This problem involves determining whether all adjacent elements in a given subarray have the same parity (odd or even). We can us a prefix sum array to optimize the calculation.

## Approach

Below is the step-by-step breakdown of the approach:

1. **Precompute Special Parities**:
	- Create a prefix sum array sum, `sum[i]` represents the count of indices up to i where adjacent elements have the same parity.
	- Iterate through the array, comparing each pair of adjacent elements, if they have the same parity, increment the count.

2. **Query Evaluation**:
	- For a given query `[from, to]`, check whether `sum[from] === sum[to]`.
	- This equality ensures that the number of same-parity pairs in the range `[from, to]` is zero, meaning all adjacent elements in this subarray have consistent parity.

## Complexity

- **Time Complexity**: $O(n+q)$, where n is the length of the `nums` array and q is the length of the queries length.
- **Space Complexity**: $O(n+q)$ for the sum array and result array.

## Code

 ```typescript
 function isArraySpecial(nums: number[], queries: number[][]): boolean[] {
  const sum: number[] = Array(nums.length).fill(0)

  // Build the prefix sum array for parity consistency
  for (let i = 1; i < nums.length; i++) {
    sum[i] = sum[i - 1] + (nums[i - 1] % 2 === nums[i] % 2 ? 1 : 0)
  }

  // Process queries using the prefix sum array
  return queries.map(([from, to]) => sum[from] === sum[to])
}
 ```
