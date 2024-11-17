---
title: Reverse Integer
date: 2024-10-30 10:20:38
level: Medium
tags:  
  - Algorithm/Math
---

## Intuition

The task is to reverse the digits of an integer. However, we need to ensure that the reversed integer fits within the 32-bit signed integer range. If it overflows, we return 0. To achieve this efficiently, we repeatedly extract the last digit of the input number, build the reversed number step-by-step, and check for overflow during each step.

## **Approach**

Below is the step-by-step breakdown of the approach:

1. **Initialize Variables**:
	- Create a variable `n` initialized to 0 to store the reversed number.
   
2. **Extract and Reverse Digits**:
	- Use a while loop that runs until the input integer `x` becomes 0.
	- In each iteration:
		- Extract the last digit of `x` using `x % 10`.
		- Append this digit to `n` by calculating `n * 10 + (x % 10)`.
		- Update `x` to remove its last digit by performing integer division using `~~(x / 10)`.
3. **Check for Overflow**:
	- Before continuing to the next iteration, ensure that `n` stays within the 32-bit signed integer range:
		- If `n` is smaller than `-2^31` or larger than `2^31 - 1`, return 0 immediately.

4. **Return the Result**:
	- If the entire process completes without overflow, return the final value of `n`.

## Complexity

- **Time Complexity**: $O(log₁₀(x))$, where `x` is the absolute value of the input integer. We process each digit exactly once.
- **Space Complexity**: $O(1)$, since we only use a constant amount of extra space.

## Code

```ts
function reverse(x: number): number {
  let n = 0
  while (x !== 0) {
    n = n * 10 + (x % 10)
    x = ~~(x / 10)
    if (n < Math.pow(-2, 31) || n > Math.pow(2, 31) - 1) {
      return 0
    }
  }
  return n
}
```
