---
title: Shortest Subarray To Be Removed To Make Array Sorted
date: 2024-11-15 16:31:50
level: Medium
tags:  
  - Algorithm/TwoPointers
---

## Intuition

The problem asks us to find the shortest subarray that, if removed, allows the remaining elements to be in non-decreasing order. To solve this, we can leverage the sorted segments at the beginning and end of the array and try merging them by removing the middle section.

## Approach

1. **Find Left Sorted Segment**:
	- Traverse from the start to identify the longest initial non-decreasing segment (left pointer).
	- If the entire array is sorted, return 0.

2. **Find Right Sorted Segment**:
	- Traverse from the end to identify the longest final non-decreasing segment (right pointer).

3. **Calculate Minimum Removal**:
	- Consider removing either all elements after left or before right.
	- Attempt to merge the left and right segments by checking overlapping conditions between the two sorted subarrays.

4. **Iterate to Find Overlap**:
	- Use two pointers (i for left and j for right) to find the minimal overlap that satisfies the sorted condition.

## Complexity

- **Time complexity**: $O(n)$, where  is the length of the array, due to a single pass for left and right subarrays and a two-pointer traversal for merging.
- **Space complexity**: $O(1)$, as the solution uses constant additional space.

## Code

```ts
function findLengthOfShortestSubarray(arr: number[]): number {
  let n = arr.length

  // Step 1: Find the left non-decreasing subarray
  let left = 0
  while (left + 1 < n && arr[left] <= arr[left + 1]) {
    left++
  }
  // If the entire array is already sorted
  if (left === n - 1) {
    return 0
  }

  // Step 2: Find the right non-decreasing subarray
  let right = n - 1
  while (right > 0 && arr[right - 1] <= arr[right]) {
    right--
  }

  // Step 3: Try removing the middle part and merging left and right
  // Remove all on one side
  let result = Math.min(n - left - 1, right)

  let i = 0,
    j = right
  while (i <= left && j < n) {
    if (arr[i] <= arr[j]) {
      result = Math.min(result, j - i - 1)
      i++
    } else {
      j++
    }
  }

  return result
}
```
