---
title: Longest Palindromic Substring
date: 2024-10-28 17:05:46
level: Medium
tags:  
  - Algorithm/TwoPointers
---

## Intuition

The task is to find the longest palindromic substring in a given string. A palindrome reads the same forward and backward, and it can be centered either at a single character (odd-length) or between two characters (even-length).

We use a **center-expansion** technique to explore all possible palindromes by expanding outward from each character or character-pair in the string. This method ensures we efficiently find the longest palindrome by exploring all potential centers.

## Approach

Below is the step-by-step breakdown of the approach:

1. **Helper Function – `expand`**:
	- Define a helper function `expand` that expands outward from a given center (or pair of centers).
	- The function continues expanding as long as the characters at the `left` and `right` indices are equal and within bounds.
	- It returns the palindrome substring between the final valid indices.
	
2. **Iterate through the String**:
	- For each index `i` in the string:
		- Call the `expand` function with `(i, i)` to find the longest **odd-length** palindrome centered at `i`.
		- Call the `expand` function with `(i, i + 1)` to find the longest **even-length** palindrome between `i` and `i + 1`.
	- Compare the lengths of the two palindromes and update the result if a longer palindrome is found.
	
3. **Return the Result**:
	- After iterating through the string, return the longest palindrome found.

## Complexity

- **Time Complexity**: $O(n²)$, where `n` is the length of the input string. For each character, we expand outward, which takes linear time in the worst case.
- **Space Complexity**: $O(1)$, as we only store a few variables and substrings during the process.

## Code

```typescript
function expand(s: string, left: number, right: number): string {
  while (left >= 0 && right < s.length && s[left] === s[right]) {
    left--
    right++
  }
  return s.substring(left + 1, right)
}

function longestPalindrome(s: string): string {
  let ans = ""
  for (let i = 0; i < s.length; i++) {
    const odd = expand(s, i, i)
    const even = expand(s, i, i + 1)
    if (odd.length > ans.length) {
      ans = odd
    }
    if (even.length > ans.length) {
      ans = even
    }
  }
  return ans
}
```
