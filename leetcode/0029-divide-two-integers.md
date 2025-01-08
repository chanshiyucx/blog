---
title: Divide Two Integers
date: 2024-11-28 22:52:26
level: Medium
tags: 
  - Algorithm/Math
---

## Intuition

The goal of this problem is to divide two integers without using the division operator. We should return the result of the division truncated toward zero. In addition, edge cases like overflow should be handled.

To solve this efficiently:

- **Sign Management**: We first track the sign of the result using the product of the signs of the dividend and divisor.
- **Bitwise Operations**: We use bitwise shifts to efficiently subtract multiples of the divisor from the dividend. This reduces the problem size in logarithmic time.
- **Handling Overflow**: We handle the potential overflow case where the result exceeds the 32-bit integer range.

## Approach

Below is the step-by-step breakdown of the approach:

1. **Sign Handling**:
	- We store the sign of the result based on the signs of dividend and divisor. The sign will be positive if both numbers have the same sign, otherwise, it will be negative.

2. **Abs of Dividend and Divisor**:  
	- Convert both the dividend and divisor to their absolute values to simplify the calculation.

3. **Bitwise Division**:
	- Use a **bitwise doubling technique**: repeatedly double the divisor `(tb = tb + tb)` while it's smaller than or equal to the dividend. This is akin to performing division by subtraction in logarithmic steps.
	- For each valid multiple, subtract it from the dividend, and add the corresponding multiple to the result.

4. **Final Adjustment**:  
	Ensure that the result is between -(2^31) and 2^31 - 1.

## Complexity

- **Time Complexity**: **O(log(n))** , where n is the magnitude of the dividend. This is because we are doubling the divisor each time and reducing the size of the dividend logarithmically.
- **Space Complexity**: **O(1)**, as we are using only a constant amount of extra space to store variables.

## Code

```typescript
function divide(dividend: number, divisor: number): number {
  // Determine the sign of the result
  const signal = Math.sign(dividend) * Math.sign(divisor)

  // Work with absolute values of dividend and divisor
  let a = Math.abs(dividend)
  let b = Math.abs(divisor)
  let result = 0

  // Perform bitwise division
  while (a >= b) {
    let c = 1
    let tb = b
    // Double the divisor as long as it is less than or equal to the remaining dividend
    while (a >= tb + tb) {
      c += c
      tb += tb
    }
    a -= tb  // Subtract the largest multiple of divisor from dividend
    result += c
  }

  // Adjust the result's sign and clamp it within 32-bit signed integer bounds
  result = Math.max(-(2 ** 31), Math.min(result * signal, 2 ** 31 - 1))

  return result
}
```
