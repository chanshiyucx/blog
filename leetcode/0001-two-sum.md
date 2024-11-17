---
title: Two Sum
date: 2024-08-06 17:38:02
level: Easy
tags: Algorithm/HashTable
---

## Intuition

The problem asks us to find two indices in an array such that the sum of their elements equals a given target. To solve this efficiently, we can leverage a **hash map** to store elements as we iterate through the array. This allows us to look up complements in constant time, avoiding the need for a nested loop.

## Approach

Below is the step-by-step breakdown of the approach:

1. **Initialize a Hash Map**:
	- Use a hash map to store elements as keys and their indices as values.
   
2. **Traverse the Array**:
	- For each element `nums[i]`, calculate its complement: `diff = target - nums[i]`.
	- Check if `diff` exists in the hash map:
		- If yes, return the pair of indices: `[map.get(diff), i]`.
		- If not, store the current element and its index in the map.
   
3. **Return Result**:
	- As the problem guarantees exactly one solution, the function will return as soon as a valid pair is found.

## Complexity

- **Time complexity**: $O(n)$, we traverse the array once, and each hash map operation takes $O(1)$ on average.
- **Space complexity**: $O(n)$, in the worst case, we store all elements in the map.

## Code

```ts
function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>()
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i]
    if (map.has(diff)) {
      return [map.get(diff)!, i]
    } 
    map.set(nums[i], i)
  }
}
```
