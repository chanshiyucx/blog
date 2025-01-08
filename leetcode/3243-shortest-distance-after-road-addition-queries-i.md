---
title: Shortest Distance After Road Addition Queries I
date: 2024-11-27 20:07:33
level: Medium
tags:
  - Algorighm/Graph
  - Algorithm/DP
---

## Intuition

The problem involves determining the shortest distance from city 0 to city n-1 after processing each query. Each query adds a new one-way road between cities u and v, which can potentially update the shortest path. This requires recalculating the shortest path dynamically after every query.

## Approach

Below is the step-by-step breakdown of the approach:

1. **Dynamic Programming Array (dp)**:
	- Use `dp[i]` to store the shortest distance from city 0 to city i.
	- Initially, the shortest distance to city i is i.

2. **Predecessor Tracking (prev)**:
	- Use `prev[i]` to maintain a list of cities that have direct roads leading to city i.
	- Initially, only city i-1 can reach city i for i > 0.

3. **Processing Queries**:
	- For each query `[u, v]`, a new road is added from city u to city v.
	- Add u to the list of predecessors for city v in `prev[v]`.

4. **Recomputing Distances**:
	- For each city i starting from v, check all its predecessors in `prev[i]`.
	- Update `dp[i]` to the minimum of its current value and `dp[j] + 1`, where j is a predecessor.

5. **Store Results**:
	- After recalculating distances for all cities, store the shortest distance to city n-1 (`dp[n-1]`) in the result array.

## Complexity

- **Time Complexity**: $O(n \times q)$, setting up the `dp[]` and prev arrays takes $O(n)$. For each query, updating the shortest path and checking all predecessors takes $O(n \times q)$, where q is the number of queries and n is the number of cities.
- **Space Complexity**: $O(n^2)$, dynamic Programming Array $O(n)$, predecessor Array $O(n^2)$ in the worst case, if every city has roads from all others.

## Code

```typescript
function shortestDistanceAfterQueries(
  n: number,
  queries: number[][],
): number[] {
  // dp[i] records the shortest distance from 0 to i
  const dp: number[] = Array.from({ length: n }, (_, i) => i)

  // prev[i] records all cities that can reach city i
  const prev: number[][] = Array.from({ length: n }, () => [])
  for (let i = 1; i < n; i++) {
    prev[i].push(i - 1)
  }

  const result: number[] = []

  for (const [u, v] of queries) {
    // Add a new road from u to v
    prev[v].push(u)

    // Update dp array starting from city v
    for (let i = v; i < n; i++) {
      for (const j of prev[i]) {
        dp[i] = Math.min(dp[i], dp[j] + 1)
      }
    }

    // Store the shortest distance to city n-1
    result.push(dp[n - 1])
  }

  return result
}
```
