---
title: Minimum Number Of Operations To Sort A Binary Tree By Level
date: 2024-12-23 20:23:24
level: Medium
tags: 
  - Algorithm/BFS
---

## Intuition

The key insight to solving this problem lies in two main concepts:

1. Level-order traversal to get values at each level
2. Calculate minimum swaps needed to sort each level

## Approach

The solution can be broken down into two main steps:

### Level-order Traversal

We first use BFS (Breadth-First Search) to traverse the tree level by level, collecting values at each level into separate arrays.

### Minimum Swaps to Sort

For each level's array, we need to:
1. Create pairs of `[value, originalIndex]`
2. Sort by value to get target positions
3. Use cycle detection to find minimum swaps needed

The key insight is that for a cycle of size k, we need (k-1) swaps to put all elements in their correct positions.

Let's break down the cycle detection intuition with an example:

```text
Original array: [3, 1, 2, 4]
After creating [value, index] pairs and sorting by value:
[1,1], [2,2], [3,0], [4,3]

This tells us:
- Value 1 should be at index 0, but it's at index 1
- Value 2 should be at index 1, but it's at index 2
- Value 3 should be at index 2, but it's at index 0

This forms a cycle: 0 -> 1 -> 2 -> 0
```

Visualizing the cycle:

```text
Index: 0  1  2  3
Value: 3  1  2  4
      ↙  ↙  ↙
      1  2  3
```

The brilliant insight is that a cycle of length N requires (N-1) swaps to resolve. This is because:
- Each element in the cycle needs to move to its correct position
- The last element will automatically be in place after we move all others

For example, to sort `[3,1,2]`:
1. First swap: 3↔1 → `[1,3,2]`
2. Second swap: 3↔2 → `[1,2,3]`

This cycle detection approach gives us the theoretical minimum number of swaps needed, which is exactly what the problem asks for.

This is much more efficient than trying to simulate actual adjacent swaps, as it directly gives us the minimum operations needed without having to try different combinations of swaps.

## Complexity

- Time Complexity: $O(N * K * log K)$, where:
  - N is the number of nodes in the tree
  - K is the maximum number of nodes at any level
  - The log K factor comes from sorting at each level
- Space Complexity: $O(N)$ to store the level arrays and queue

## Code

```typescript
function minimumOperations(root: TreeNode | null): number {
  if (!root) return 0
  const levels: number[][] = []
  const queue: TreeNode[] = [root]

  // Perform level-order traversal to get values at each level
  while (queue.length > 0) {
    const level: number[] = []
    const len = queue.length
    for (let i = 0; i < len; i++) {
      const node = queue.shift()!
      level.push(node.val)
      if (node.left) queue.push(node.left)
      if (node.right) queue.push(node.right)
    }
    levels.push(level)
  }


  // Calculate minimum swaps needed to sort an array
  const minSwapsToSort = (arr: number[]): number => {
    const n = arr.length
    // Create array of [value, originalIndex] pairs and sort by value
    const indexedArr: [number, number][] = arr.map((v, i) => [v, i])
    indexedArr.sort((a, b) => a[0] - b[0])

    const visited = new Array(n).fill(false)
    let swaps = 0

    // Find cycles and calculate minimum swaps needed
    for (let i = 0; i < n; i++) {
      // Skip if already visited or in correct position
      if (visited[i] || indexedArr[i][1] === i) continue

      let x = i
      let cycleSize = 0
      // Follow the cycle until we return to a visited position
      while (!visited[x]) {
        visited[x] = true
        x = indexedArr[x][1]
        cycleSize++
      }
      // For each cycle, we need (cycleSize - 1) swaps
      if (cycleSize > 1) {
        swaps += cycleSize - 1
      }
    }
    return swaps
  }

  // Calculate total swaps needed for all levels
  let result = 0
  for (const level of levels) {
    result += minSwapsToSort(level)
  }

  return result
}
```
