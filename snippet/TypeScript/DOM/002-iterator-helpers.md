---
title: Iterator Helpers
date: 2025-09-06 09:26:56
tags:
  - Snippet/TypeScript
references:
  - https://web.dev/blog/baseline-iterator-helpers
---

## Description

Iterator helpers are exposed by defining new methods on the `Iterator` object's `prototype`. These methods align with many functional programming methods you're used to using, such as `map`, `filter`, `reduce`, and other similar methods.

## Usage

You could use an iterator helper on the `filter` method to filter list items by the contents of their `innerText` property for a collection of DOM nodes, which you can then use later in a `for` loop:

```javascript
const posts = document
  .querySelectorAll('ul#specific-list > li')
  .values()
  .filter((item) => item.textContent.includes('kiwi'))

// For-of loops can only be used on iterables, which `posts` is!
for (const post of posts) {
  console.log(post.textContent)
}
```
