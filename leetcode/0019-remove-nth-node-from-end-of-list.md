---
title: Remove Nth Node From End Of List
date: 2024-11-06 14:22:18
level: Medium
tags:  
  - Algorithm/TwoPointers
---

## Intuition

To remove the nth node from the end of a linked list, we can use the **two-pointer** technique. By moving one pointer ahead by `n` nodes and then moving both pointers simultaneously, we can position the second pointer at the node just before the one we need to remove.

## Approach

Below is the step-by-step breakdown of the approach:

1. **Initialize Dummy Node**:
	- Create a `dummyHead` node that points to the `head` of the list. This helps simplify edge cases, such as when the node to remove is the first node.

2. **Advance the Fast Pointer**:
	- Move the `fast` pointer `n` steps forward. This ensures that when `fast` reaches the end, the `slow` pointer will be exactly at the node before the target.

3. **Move Both Pointers**:
	- Move `fast` and `slow` pointers one step at a time until `fast` reaches the end of the list.

4. **Remove the Target Node**:
	- Adjust the `next` pointer of the `slow` node to skip over the target node.

5. **Return the Result**:
	- The `dummyHead.next` is the new head of the list, which we return as the final result.

## Complexity

- **Time complexity**: $O(L)$, where $L$ is the length of the linked list. We traverse the list twice: once to advance `fast` and once to find the target.
- **Space complexity**: $O(1)$, as only pointers are used for traversal.

## Code

```typescript
function removeNthFromEnd(head: ListNode | null, n: number): ListNode | null {
  const dummyHead = new ListNode(0, head)
  let fast: ListNode | null = dummyHead
  let slow: ListNode | null = dummyHead

  while (n > 0) {
    fast = fast ? fast.next : null
    n--
  }

  while (fast && fast.next) {
    fast = fast.next
    slow = slow.next!
  }

  if (slow && slow.next) {
    slow.next = slow.next.next
  }

  return dummyHead.next
}
```
