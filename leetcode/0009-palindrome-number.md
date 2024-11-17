---
title: Palindrome Number
date: 2024-10-30 11:33:03
level: Easy
tags:  
  - Algorithm/Math
---

## Intuition

The problem requires checking if a given integer is a palindrome. A number is a palindrome if it reads the same backward as forward. For negative numbers, the answer is always `false` since the negative sign is only at the front.

The core idea is to reverse the given number and compare it with the original value. If they are equal, the number is a palindrome.

## Approach

Below is the step-by-step breakdown of the approach:

1. **Handle Negative Numbers:**  
	- If the input number is negative, return `false` immediately, as negative numbers can't be palindromes.

2. **Reverse the Number:**  
	- Use a variable `y` to store the reversed number.
	- Use a variable `n` to store a copy the of original input number.  
	- In a while loop:
		- Extract the last digit of `n` using the modulus operation (`n % 10`).
		- Append it to `y` after shifting its digits left (multiply `n` by 10).
		- Remove the last digit from `n` using integer division (`~~(n / 10)`).

3. **Compare the Reversed Number:**  
	- If the reversed number `y` matches the original number `x`, return `true`; otherwise, return `false`.

## Complexity

- **Time Complexity:** $O(d)$, where `d` is the number of digits in the input number. Each digit is processed once during the reversal.
- **Space Complexity:** $O(1)$, since only a few variables are used.

## Code

```ts
function isPalindrome(x: number): boolean {
  if (x < 0) {
    return false
  }
  let y = 0
  let n = x
  while (n > 0) {
    y = y * 10 + (n % 10)
    n = ~~(n / 10)
  }
  return y === x
}
```
