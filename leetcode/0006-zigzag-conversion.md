---
title: Zigzag Conversion  
date: 2024-10-28 17:43:51  
level: Medium  
tags:  
  - Algorithm/String

## Intuition

The problem involves rearranging a string into a zigzag pattern across a given number of rows and then reading the pattern row by row. To efficiently build the zigzag pattern, we simulate the row traversal by switching direction between top-to-bottom and bottom-to-top. Each character is placed in the appropriate row during traversal, and the rows are later joined to form the final result.

## Approach

Below is the step-by-step breakdown of the approach:

1. **Edge Case Handling**:  
	- If the number of rows is 1 or greater than the string length, return the input string directly as no transformation is needed.

2. **Initialize Data Structures**:  
	- Create an array `record` of size `numRows`, with each element initialized to an empty string. This array will store the characters for each row.  
	- Use a boolean flag `ascending` to track the direction of movement (either down or up the rows).  
	- Initialize a `curRow` variable to keep track of the current row being filled.

3. **Iterate Through the Characters**:  
	- Traverse the input string, placing each character in the appropriate row of `record` based on the current direction.  
	- Adjust the `curRow` value:  
		- If moving down, increment `curRow`.  
		- If moving up, decrement `curRow`.  
	- Switch directions whenever the first row (`curRow === 0`) or the last row (`curRow === numRows - 1`) is reached.

4. **Join the Rows**:  
	- After all characters are placed, concatenate all rows from `record` to form the final result string.

## Complexity

- **Time Complexity**: $O(n)$, where `n` is the length of the input string. Each character is processed exactly once.  
- **Space Complexity**: $O(n)$, since we store all characters in the `record` array.

## Code

```ts
function convert(s: string, numRows: number): string {
  if (numRows <= 1) {
    return s
  }
  const record: string[] = new Array(numRows).fill("");
  let ascending = true
  let curRow = -1
  for (const char of s) {
    curRow += ascending ? 1 : -1
    record[curRow] += char
    if (curRow === 0) {
      ascending = true
    } else if (curRow === numRows - 1) {
      ascending = false
    }
  }
  return record.join("")
}
```
