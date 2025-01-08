---
title: Generate Parentheses
date: 2024-11-06 17:03:54
level: Medium
tags:  
  - Algorithm/Backtracking
---

## Intuition

The problem asks us to generate all valid combinations of `n` pairs of parentheses. This is a classic **backtracking** problem where we build solutions by adding either an opening `(` or a closing `)` bracket at each step, ensuring that each combination remains valid.

## Approach

Below is the step-by-step breakdown of the approach:

1. **Backtracking with Constraints**:
	- Start with an empty string and two counters for open and close parentheses remaining.
	- For each recursive call, if both counters are zero, the string is complete and valid, so add it to the results.
	- If there are open parentheses left, add an open parenthesis and decrease the open counter.
	- If there are fewer open than close parentheses, add a closing parenthesis and decrease the close counter. This ensures parentheses are balanced.

2. **Return Result**:
	- Initiate backtracking from an empty string and `n` open and close parentheses.
	- Return the list of valid combinations collected during the recursive calls.

## Complexity

- **Time complexity**: $O(4^n / \sqrt{n})$, where n is the number of pairs. This follows from Catalan number growth in generating balanced parentheses.
- **Space complexity**: $O(n)$ for recursion depth.

## Code

```typescript
function backtrack(
  str: string,
  openRemaining: number,
  closeRemaining: number,
  results: string[]
) {
  if (openRemaining === 0 && closeRemaining === 0) {
    results.push(str)
    return
  }
  if (openRemaining > 0) {
    backtrack(str + "(", openRemaining - 1, closeRemaining, results)
  }
  if (openRemaining < closeRemaining) {
    backtrack(str + ")", openRemaining, closeRemaining - 1, results)
  }
}

function generateParenthesis(n: number): string[] {
  const results: string[] = []
  backtrack("", n, n, results)
  return results
}
```
