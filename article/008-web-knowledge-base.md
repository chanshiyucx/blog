---
title: Web Knowledge Base
date: 2025-09-29 16:56:11
tags:
  - Web/Writing
---

## Browser

### Event Loop

> Can you explain how the JavaScript Event Loop works? What's the difference between microtasks and macrotasks?

The JavaScript Event Loop enables asynchronous execution in its single-threaded environment. It continuously checks the Call Stack, and when empty, processes tasks from two queues: the Microtask Queue and the Macrotask Queue.

The Microtask Queue has higher priority and handles tasks like `Promise callbacks`, `queueMicrotask`, and `MutationObserver`. The Event Loop processes all microtasks before moving to the next macrotask.

The Macrotask Queue handles tasks like `setTimeout`, `setInterval`, I/O operations, or UI rendering, executing one task per loop iteration.

> Can you predict the output of this code?

```javascript
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');
```

The output will be 1, 4, 3, 2. First, '1' and '4' execute synchronously as they're in the main call stack. Then the Promise callback printing '3' goes into the microtask queue, while the setTimeout callback printing '2' goes into the macrotask queue. After synchronous code finishes, the event loop processes microtasks before macrotasks, so '3' prints before '2'.
