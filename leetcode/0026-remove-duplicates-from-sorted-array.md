---
title: Remove Duplicates From Sorted Array
date: 2024-11-07 10:32:29
level: Easy
tags:  
  - Algorithm/TwoPointers
---

## Intuition

The problem requires removing duplicates from a sorted array in place. Since the array is sorted, duplicates will appear consecutively, making it straightforward to detect and skip them by comparing each element with the previous one.

## Approach

1. **Initialize an Index Pointer**:
   - Use an `index` pointer to keep track of the next position for unique elements. Start from `1` since the first element is always unique.

2. **Traverse the Array**:
   - For each element, compare it to the previous one.
   - If they differ, it means we found a unique element. Place it at the `index` position and increment `index`.

3. **Return Result**:
   - After traversal, `index` represents the length of the modified array with unique elements.

## Complexity

- **Time complexity**: $O(n)$, where \(n\) is the number of elements in the array, as we only make a single pass through the array.
- **Space complexity**: $O(1)$, since we modify the array in place without using additional storage.

## Code

```ts
function removeDuplicates(nums: number[]): number {
  let index = 1
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] !== nums[i - 1]) {
      nums[index] = nums[i]
      index++
    }
  }
  return index
}
```
