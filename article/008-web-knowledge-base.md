---
title: Web Knowledge Base
date: 2025-09-29 16:56:11
tags:
  - Web/Interview
---

## Browser

### Event Loop

> Can you explain how the JavaScript Event Loop works? What's the difference between microtasks and macrotasks?

The JavaScript Event Loop enables asynchronous execution in its single-threaded environment. It continuously checks the Call Stack, and when empty, processes tasks from two queues: the Microtask Queue and the Macrotask Queue.

The Microtask Queue has higher priority and handles tasks like `Promise callbacks`, `queueMicrotask`, and `MutationObserver`. The Event Loop processes all microtasks before moving to the next macrotask.

The Macrotask Queue handles tasks like `setTimeout`, `setInterval`, I/O operations, or UI rendering, executing one task per loop iteration.

> Can you predict the output of this code?

```javascript
console.log('1')
setTimeout(() => console.log('2'), 0)
Promise.resolve().then(() => console.log('3'))
console.log('4')
```

The output will be 1, 4, 3, 2. First, '1' and '4' execute synchronously on the Call Stack. Then the Promise callback printing '3' goes into the Microtask Queue, while the setTimeout callback printing '2' goes into the Macrotask Queue. After synchronous code finishes, the Event Loop processes all microtasks before macrotasks, so '3' prints before '2'.

## JavaScript

### JS Closures

> What is a closure in JavaScript and how does it work?

A closure is a function that retains access to variables from its outer lexical scope, even after the outer function has finished executing. This works because JavaScript maintains a reference to the outer scope's variables in memory. Closures are created every time a function is defined inside another function, allowing the inner function to 'remember' the environment in which it was created.

> Can you give me a practical use case where closures are beneficial?

One common use case is data encapsulation and creating private variables. For example, you can use closures to implement a counter where the count variable is private and can only be modified through exposed methods. Another practical use is in event handlers or callbacks where you need to preserve access to specific variables from the outer scope. Closures are also fundamental to higher-order functions and functional programming patterns like currying and partial application.

```javascript
function createCounter() {
  let count = 0 
  return {
    increment: function () {
      count++
      return count
    },
    getCount: function () {
      return count
    },
  }
}

const counter = createCounter()
console.log(counter.increment()) // 1
console.log(counter.getCount()) // 1
```

Here, `increment` and `getCount` are closures that retain access to the `count` variable, even after `createCounter` has executed. This allows us to encapsulate `count`, making it private and only accessible through the returned methods.

> What's a common pitfall with closures?

A classic issue occurs when creating closures inside loops with `var`. For example, if you create multiple event handlers in a loop using `var i`, all handlers will reference the same variable `i`, which ends up with the final loop value. This happens because `var` is function-scoped, not block-scoped. The solution is to use `let` which creates a new binding for each iteration, or create an IIFE to capture the current value. Modern JavaScript with `let` and `const` largely solves this problem since they're block-scoped.

## CSS

### Visibility

> What is the difference between `visibility: hidden` and `display: none` properties in CSS?

The key difference is how they affect layout.

The `visibility: hidden` property hides the element but preserves its space in the layout, so surrounding elements don't shift. The element remains in the DOM but is hidden from users and screen readers, and won't respond to events. This is preferred when you need to maintain layout structure.

The `display: none` property completely removes the element from the document flow, freeing its space for other elements. It's not rendered and inaccessible to screen readers. It's the standard choice when you need to reclaim layout space, though toggling it triggers reflow, which can impact performance.

## React
