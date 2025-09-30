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

### XSS & CSRF

> Can you explain what XSS and CSRF are, and the key difference between them?

XSS, or Cross-Site Scripting, is when an attacker injects malicious scripts into a trusted website, which then executes in other users' browsers. The attacker exploits the trust a user has in a particular site.

CSRF, or Cross-Site Request Forgery, is when an attacker tricks a user's browser into making unwanted requests to a site where the user is authenticated. The attacker exploits the trust a site has in the user's browser.

The key difference is the direction of attack: XSS injects malicious code into the target site, while CSRF sends malicious requests from the user to the target site.

> How do you protect against XSS attacks?

There are three main types: Stored XSS, where malicious scripts are permanently stored on the server like in a database; Reflected XSS, where the script is reflected off a web server through URL parameters or form inputs; and DOM-based XSS, where the vulnerability exists in client-side code that improperly handles user input.

Prevention includes sanitizing and validating all user input, encoding output data based on context, implementing Content Security Policy headers, using HTTPOnly flags on cookies to prevent JavaScript access, and avoiding dangerous functions like `innerHTML` or `eval` with user-controlled data. Modern frameworks like React help by escaping content by default.

> How do you protect against CSRF attacks?

The most common defense is using CSRF tokens, which are random values generated per session or per request that must be included in state-changing requests. The server validates this token before processing the request. Other defenses include SameSite cookie attribute which prevents cookies from being sent in cross-site requests, validating the Origin and Referer headers, and requiring re-authentication for sensitive operations. For modern applications, using SameSite cookies combined with CSRF tokens provides strong protection.

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

A common pitfall occurs when using `var` in a loop to create closures, like event handlers. Since `var` is function-scoped, all closures share the same variable, leading to unexpected results.

The solution is to use `let` which creates a new binding for each iteration, or create an IIFE to capture the current value. Modern JavaScript with `let` and `const` largely solves this problem since they're block-scoped.

### Event Delegation

> Can you explain the Event Delegation

Event delegation is a technique where you attach an event listener to a parent element rather than individual descendant elements. The listener fires whenever the event is triggered on descendants due to event bubbling up the DOM.

The benefits are:

- Reduced memory footprint - only one handler is needed on the parent rather than multiple handlers on each descendant.
- Automatic handling of dynamic content - no need to bind listeners when elements are added or unbind them when removed.

### Prototype

> Explain how prototypal inheritance works

Prototypal inheritance works through the prototype chain. Every object has an internal prototype reference. When accessing a property, if it's not found on the object itself, JavaScript traverses up the prototype chain until it finds the property or reaches `null`.

Unlike classical inheritance where classes copy behavior, JavaScript objects delegate to their prototypes at runtime. This means multiple objects can share methods through a common prototype without duplicating them in memory, which is both memory-efficient and flexible.

### `.call` & `.apply`

> What's the difference between `.call` and `.apply`?

Both `.call` and `.apply` invoke a function and set its `this` context to the first parameter. The difference is how they handle additional arguments: `.call` takes arguments individually, while `.apply` takes them as an array.

```javascript
function add(a, b) {
  return a + b
}

console.log(add.call(null, 1, 2)) // 3
console.log(add.apply(null, [1, 2])) // 3
```

## CSS

### Visibility

> What is the difference between `visibility: hidden` and `display: none` properties in CSS?

The core difference lies in their impact on the document layout and flow.

`visibility: hidden` hides the element but preserves its space in the layout, preventing other elements from shifting. It remains in the DOM, is fully accessible to screen readers, and retains event capacity for user actions like clicks. This is generally preferred for temporary toggles where maintaining the layout structure is necessary.

`display: none` completely removes the element from the document flow, reclaiming its space. It's not rendered, is inaccessible to screen readers, and ignores all events. This is the standard choice when you need to reclaim layout space, though toggling its state triggers a costly reflow, which is a significant performance consideration.

## React
