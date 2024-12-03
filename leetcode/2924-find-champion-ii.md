---
title: Find Champion Ii
date: 2024-11-26 20:30:02
level: Medium
tags: 
  - Algorithm/Graph
---

## Intuition

In a directed graph, a "champion" can be identified as a node that does not have any incoming edges. The task is to determine if there exists exactly one such node. If there is no such node or there are multiple such nodes, the result should be -1.

This can be solved efficiently by leveraging an array to track which nodes have incoming edges.

## Approach

1. **Initialize Tracking Array**:
	- Use an array isWeak of size n to record whether each node has incoming edges. Each entry starts as false (no incoming edges).

2. **Process the Edges**:
	- For every directed edge `[u, v]`, mark `isWeak[v] = true` since node v has at least one incoming edge.

3. **Find the Candidate Champion**:
	- Iterate through all nodes to find the one that has no incoming edges.
	- If more than one node meets this condition, return -1.

4. **Return the Result**:
	- If exactly one node without incoming edges is found, return its index.
	- Otherwise, return -1.

## Complexity

- **Time Complexity**: $O(n + m)$, processing all edges takes $O(m)$, where m is the number of edges. Iterating through all nodes to check their status takes $O(n)$.
- **Space Complexity**: $O(n)$, the isWeak array requires $O(n)$ space.

## Code

```ts
function findChampion(n: number, edges: number[][]): number {
  // Tracks if a node has incoming edges
  const isWeak = new Array(n).fill(false) 

  // Step 1: Process all edges
  for (const [_, v] of edges) {
    isWeak[v] = true
  }

  // Step 2: Find the candidate champion
  let result = -1
  for (let i = 0; i < n; i++) {
    if (isWeak[i]) continue // Node has incoming edges, skip it
    if (result !== -1) return -1 // More than one node without incoming edges
    result = i
  }

  // Step 3: Return the result
  return result
}
```
