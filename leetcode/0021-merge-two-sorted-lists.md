---
title: Merge Two Sorted Lists
date: 2024-11-06 15:54:47
level: Easy
tags: Algorithm/LinkedList
---

## Intuition

The task is to merge two sorted linked lists into a single sorted linked list. Since both input lists are already sorted, we can efficiently merge them by comparing their current nodes step-by-step and building a new list in sorted order.

## Approach

1. **Initialize a Dummy Node**:
   - Create a `dummyHead` node, which serves as the starting point for our result list.
   - Use a `current` pointer to track the end of the merged list as we build it.

2. **Merge Lists**:
   - Traverse through both lists until one becomes empty:
	 - Compare the values at the current nodes of `list1` and `list2`.
	 - Attach the smaller node to `current.next`, and move that list's pointer forward.
	 - Advance `current` to `current.next` to continue building the merged list.

3. **Attach Remaining Nodes**:
   - Once we reach the end of one list, directly link `current.next` to the remaining non-empty list, as it's already sorted.

4. **Return Result**:
   - Return `dummyHead.next`, which points to the head of the merged list.

## Complexity

- **Time complexity**: $O(m + n)$, where m and n are the lengths of `list1` and `list2`. We iterate through both lists once.
- **Space complexity**: $O(1)$ for the merged list since we're modifying pointers directly, resulting in an in-place merge.

## Code

```ts
function mergeTwoLists(
  list1: ListNode | null,
  list2: ListNode | null
): ListNode | null {
  const dummyHead = new ListNode()
  let current = dummyHead
  while (list1 && list2) {
    if (list1.val < list2.val) {
      current.next = list1
      list1 = list1.next
    } else {
      current.next = list2
      list2 = list2.next
    }
    current = current.next
  }
  current.next = list1 ?? list2
  return dummyHead.next
}
```
