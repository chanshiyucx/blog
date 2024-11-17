---
title: Add Two Numbers
date: 2024-08-06 17:38:48
level: Medium
tags: Algorithm/LinkedList
---

## Intuition

This problem involves adding two non-negative integers, where each integer is represented as a linked list with digits stored in reverse order. The challenge is to simulate elementary addition digit by digit, while managing carry-over. Since the lists are in reverse order, the least significant digit comes first, making it easier to add corresponding digits from both lists as we traverse them.

## Approach

Below is the step-by-step breakdown of the approach:

1. **Initialize Variables**:
	- Use a dummy head node to simplify code and avoid edge case handling.
	- Initialize a `current` pointer to track the current position in the result list.
	- Initialize a `carry` variable to manage carry-over from previous additions.

2. **Traverse the Lists**:
	- Use a while loop to iterate through both lists until both `l1` and `l2` are exhausted.
	- At each step:
		- Calculate the sum of the current digits from `l1` and `l2` (or 0 if a list is exhausted), plus the `carry`.
		- Create a new node with the value `sum % 10` and attach it to the result list.
		- Update `carry` to `Math.floor(sum / 10)` for the next iteration.
		- Move `current`, `l1`, and `l2` to their respective next nodes.

3. **Handle Remaining Carry**:
	- After the loop, if any `carry` remains, add a new node with its value to the result list.

4. **Return the Result**:
	- Return the next node of the dummy head, which is the head of the resultant linked list.

## Complexity

- **Time complexity**: $O(max(m,n))$, we traverse both linked lists once, where `m` and `n` are the lengths of the two lists.
- **Space complexity**: $O(max(m,n))$, the result list can have at most one extra node beyond the longer of the two input lists to store the carry.

## Code

```ts
class ListNode {
  val: number
  next: ListNode | null
  constructor(val?: number, next?: ListNode | null) {
    this.val = val === undefined ? 0 : val
    this.next = next === undefined ? null : next
  }
}

function addTwoNumbers(
  l1: ListNode | null,
  l2: ListNode | null
): ListNode | null {
  let dummyHead = new ListNode()
  let current = dummyHead 
  let carry = 0
  while (l1 || l2) {
    const sum = carry + (l1?.val ?? 0) + (l2?.val ?? 0)
    current.next = new ListNode(sum % 10)
    carry = Math.floor(sum / 10)
    current = current.next
    l1 = l1?.next
    l2 = l2?.next
  }
  if (carry) {
    current.next = new ListNode(carry)
  }
  return dummyHead.next
}
```
