---
title: Remove Element
date: 2024-11-17 09:31:52
level: Easy
tags:  
  - Algorithm/TwoPointers
---

## Intuition

The task is to remove all occurrences of a specific value (val) from an array in-place while minimizing extra space usage. The solution must return the new length of the modified array without creating a new array. Using the **two-pointer technique**, we can efficiently traverse the array while overwriting elements that match the target value, ensuring valid elements are preserved in the process.

## Approach

1. **Two Pointers**:
	- fast: Scans through the array, checking each element.
	- slow: Tracks where the next valid (non-val) element should be written.
	- If the fast pointer encounters an element equal to val, it simply skips it. Otherwise, it copies the valid element to the position tracked by the slow pointer and increments slow.

2. **Modify the Array**:
	- Valid elements are compacted at the start of the array, while elements beyond the slow pointer are irrelevant after the operation.

3. **Return the Result**:
	- The slow pointer represents the length of the modified array since it tracks the index of the last valid element written +1.

## Complexity

- **Time Complexity**: $O(n)$, the array is traversed once with the fast pointer. Each operation is constant time.
- **Space Complexity**: $O(1)$, only two pointers (fast and slow) are used, requiring no additional space.

## Code

```ts
function removeElement(nums: number[], val: number): number {
  let fast = 0
  let slow = 0

  while (fast < nums.length) {
    if (nums[fast] !== val) {
      nums[slow] = nums[fast]
      slow++
    }
    fast++
  }

  return slow
}
```
