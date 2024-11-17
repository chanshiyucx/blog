---
title: String To Integer Atoi
date: 2024-10-30 11:05:52
level: Medium
tags:  
  - Algorithm/String
---

## Intuition

The task is to implement a function that converts a string to a 32-bit signed integer. This requires handling leading spaces, optional signs (`+` or `-`), numeric characters, and discarding invalid characters after the valid integer part. Additionally, the resulting integer should be clamped within the 32-bit signed integer range.

## Approach

Below is the step-by-step breakdown of the approach:

1. **Trim Leading Spaces**:
	- Use a regular expression to match the valid pattern for the integer conversion. The pattern looks for:
		- Any leading whitespace (`^\s*`).
		- An optional sign (`[-+]?`).
		- A sequence of digits (`\d+`).

2. **Parse the Matched Integer**:
	- If the input string matches the pattern, extract the numeric part and convert it to an integer.
	- Check the sign captured from the match. If the sign is negative, multiply the number by `-1`.

3. **Clamp the Result within 32-bit Range**:
	- The integer should be clamped between **`-2^31`** and **`2^31 - 1`**, use `Math.max()` and `Math.min()` to enforce this constraint.

4. **Return the Result**:
	- If the input string doesn't match the pattern, return `0`.
	- Otherwise, return the clamped integer.

## Complexity

- **Time Complexity**: $O(1)$, the regular expression match and numeric operations are constant time.
- **Space Complexity**: $O(1)$, we only store a few variables and constants.

## Code

```ts
function myAtoi(s: string): number {
  let n = 0
  const match = s.match(/^\s*([-+]?)(\d+)/);
  if (match) {
    n = Number(match[2])
    if (match[1] === "-") {
      n *= -1
    }
    n = Math.max(Math.pow(-2, 31), Math.min(Math.pow(2, 31) - 1, n))
  }
  return n
}
```
