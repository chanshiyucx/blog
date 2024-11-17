---
title: Integer To Roman
date: 2024-10-30 17:10:21
level: Medium
tags:  
  - Algorithm/HashTable
---

## Intuition

The goal is to convert a given integer into a Roman numeral. We can achieve this by matching the integer with corresponding Roman numeral values, starting from the largest symbol and working downwards. This **greedy approach** ensures that we construct the numeral efficiently.

## Approach

Below is the step-by-step breakdown of the approach:

1. **Predefined Roman Numeral Map**:
	- Use a list of tuples containing Roman numerals and their integer values, sorted in descending order.

2. **Iterate Over the List**:
	- For each numeral-value pair, determine how many times the current value fits into the input number.
	- Append the numeral to the result string that many times and update the input number to the remainder.
	- If the remainder becomes 0, exit the loop to avoid unnecessary iterations.

3. **Return the Result**:
	- After iterating through all the value-symbol pairs, return the `result` string.

## Complexity

- **Time Complexity**: O(1), there are always 13 numeral-value pairs, so the loop runs in constant time.
- **Space Complexity**: O(1), the space used does not grow with the size of the input.

## Code

```ts
function intToRoman(num: number): string {
  const map: [number, string][] = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ]

  let ans = "";
  for (const [value, symbol] of map) {
    const times = Math.floor(num / value)
    ans += symbol.repeat(times)
    num %= value
    if (num === 0) break
  }
  return ans
}
```
