---
title: Valid Parentheses
date: 2024-11-06 15:09:51
level: Easy
tags: Algorithm/Stack
---

## Intuition

The problem requires checking if an input string containing only brackets is valid. A valid string has properly closed and nested pairs of brackets. To solve this, we can use a stack structure to ensure that each opening bracket has a matching and correctly positioned closing bracket.

## Approach

1. **Quick Length Check**:
   - If the length of `s` is odd, it cannot be balanced, so we return `false`.

2. **Mapping Brackets**:
   - Create a map of closing brackets to their corresponding opening brackets for easy lookup.

3. **Traverse the String**:
   - Use a stack to track unmatched opening brackets.
   - For each character in `s`:
	 - If it's a closing bracket, check if it matches the last item in the stack:
	   - If it matches, pop the stack.
	   - If not, return `false` as it's invalid.
	 - If it's an opening bracket, push it onto the stack.

4. **Return Result**:
   - If the stack is empty after traversal, all brackets were matched; otherwise, return `false`.

## Complexity

- **Time complexity**: $O(n)$, where \(n\) is the length of `s`, as we process each character once.
- **Space complexity**: $O(n)$ for the stack in the worst case, if all characters are opening brackets.

## Code

```ts
function isValid(s: string): boolean {
  if ((s.length & 1) === 1) return false
  const map: Map<string, string> = new Map([
    [")", "("],
    ["}", "{"],
    ["]", "["],
  ])
  const stack: string[] = []
  for (const char of s) {
    const last = stack[stack.length - 1]
    if (map.has(char)) {
      if (last === map.get(char)) {
        stack.pop()
      } else {
        return false
      }
    } else {
      stack.push(char)
    }
  }
  return stack.length === 0
}
```
