---
title: Merge Sorted Array
date: 2024-11-26 21:08:20
level: Easy
tags: 
  - Algorithm/TwoPointers
---

## Intuition

The goal is to merge two sorted arrays into a single sorted array. The solution merges the arrays in-place and without needing extra space.

## Approach

Below is the step-by-step breakdown of the approach:

1. **Two Pointers (from the end)**:  
	- Use two pointers, i and j, to iterate through `nums1` and `nums2` from the end of each valid part .
	- Use a third pointer k to place elements into the correct position in `nums1`. This pointer starts from the last index (k = m + n - 1).

2. **Merge Process**:
	- Compare elements from `nums1[i]` and `nums2[j]`. Place the larger element at `nums1[k]`.
	- Decrement the corresponding pointer (i, j, or k) after placing an element.
	- Continue the comparison until all elements from `nums2` have been merged into `nums1`.

3. **Remaining Elements**:
	- If `nums2` has remaining elements, directly copy them to `nums1`.
	- If `nums1` still has remaining elements, they are already in place, so no further action is needed.

## Complexity

- **Time Complexity**:$O(m+n)$, the merging process requires iterating through all elements in `nums1` and `nums2`.
- **Space Complexity**: $O(1)$, the solution uses only a constant amount of extra space apart from the input arrays.

## Code

```typescript
function merge(nums1: number[], m: number, nums2: number[], n: number): void {
  let i = m - 1  // Pointer for the last element in nums1
  let j = n - 1  // Pointer for the last element in nums2
  let k = m + n - 1  // Pointer for the last position in nums1
  
  // While there are elements to be processed in nums2
  while (j >= 0) {
    // If nums1[i] is larger, place it at the end of nums1
    if (i >= 0 && nums1[i] >= nums2[j]) {
      nums1[k] = nums1[i]
      i--
    } else {
      // Otherwise, place nums2[j] at the end of nums1
      nums1[k] = nums2[j]
      j--
    }
    k--  // Move the position pointer in nums1
  }
}
```
