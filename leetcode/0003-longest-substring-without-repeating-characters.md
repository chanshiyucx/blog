---
title: Longest Substring Without Repeating Characters
date: 2024-10-25 17:07:03
level: Medium
tags: Algorithm/HashSet
---

## Intuition

The problem asks us to find the length of the longest substring without repeating characters. A **sliding window** technique is well-suited for this problem.

We use two pointers to represent the window's boundaries and expand or shrink the window dynamically to maintain a set of unique characters. As the window grows, we track the maximum length of a substring with distinct characters.

## Approach

Below is the step-by-step breakdown of the approach:

1. **Initialization**:
	- Use a hash set to store the characters in the current sliding window.
	- Initialize two pointers: `left` to represent the start of the window and `right` to iterate over the string.
	- Use a variable `ans` to store the maximum length of the substring found.

2. **Sliding Window Process**:
	- Iterate over the string using the `right` pointer.
		- If the character at `right` already exists in the hash set, remove characters from the start (by moving the `left` pointer) until the duplicate is removed.
		- Add the current character at `right` to the hash set.
		- Update `ans` to be the maximum of the current `ans` and the window size (`right - left + 1`).

3. **Return the Result**:
	- After processing the string, return `ans` as the length of the longest substring with unique characters.

## Complexity

- **Time Complexity**: $O(n)$, where `n` is the length of the input string. Each character is processed at most twice—once by the `right` pointer and once by the `left` pointer.
- **Space Complexity**: $O(min(n, m))$, where `m` is the size of the character set. The hash set stores the characters in the current window.

## Code

```ts
function lengthOfLongestSubstring(s: string): number {
  const set = new Set<string>()
  let left = 0
  let ans = 0

  for (let right = 0; right < s.length; right++) {
    while (set.has(s[right])) {
      set.delete(s[left])
      left++
    }
    set.add(s[right])
    ans = Math.max(ans, right - left + 1)
  }

  return ans
}
```
