---
title: Swap Nodes In Pairs
date: 2024-11-07 09:00:01
level: Medium
tags:  
  - Algorithm/LinkedList
---

## Intuition

The problem requires swapping every two adjacent nodes in a linked list. Using recursion, we can perform this swap and handle the rest of the list in the same manner, making it an elegant approach for this type of problem.

## Approach

Below is the step-by-step breakdown of the approach:

1. **Base Case**:
	- If the list is empty or has only one node, return the head as there are no pairs to swap.

2. **Recursive Swapping**:
	- Identify the first two nodes as `first` and `second`.
	- Update `first.next` to point to the result of `swapPairs(second.next)`, effectively skipping to the pair after `second`.
	- Link `second.next` to `first` to complete the swap for the current pair.

3. **Return Result**:
	- Return `second` as the new head of the swapped pair.

## Complexity

- **Time complexity**: $O(n)$, where n is the number of nodes, since we process each pair of nodes once.
- **Space complexity**: $O(n)$ due to recursion depth in the call stack.

## Code

```typescript
function swapPairs(head: ListNode | null): ListNode | null {
  if (!head || !head.next) return head
  let first = head
  let second = head.next
  first.next = swapPairs(second.next)
  second.next = first
  return second
}
```
