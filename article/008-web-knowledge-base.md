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

### Same-Origin Policy

> What is the same-origin policy and why does it exist?

The same-origin policy is a critical security mechanism that restricts how documents or scripts from one origin can interact with resources from another origin. Two URLs have the same origin only if they share the same protocol, domain, and port. This policy exists to prevent malicious scripts on one site from accessing sensitive data on another site through the user's browser.

> What resources are actually restricted by same-origin policy?

The policy primarily restricts JavaScript access to cross-origin resources. You cannot read responses from `fetch` or `XMLHttpRequest` to different origins without CORS headers. You cannot access the DOM of cross-origin iframes or windows, and JavaScript cannot directly read data belonging to other origins, such as their localStorage or cookies. However, some things are allowed: embedding resources like images, stylesheets, and scripts from different origins works fine, which is why CDNs function. Form submissions to different origins are also allowed. The key distinction is that you can load cross-origin resources, but JavaScript cannot read their content without explicit permission.

> What are the main ways to work around same-origin policy restrictions when you need cross-origin communication?

There are several legitimate approaches.

CORS, or Cross-Origin Resource Sharing, is the standard solution where the server explicitly allows cross-origin requests through specific HTTP headers like `Access-Control-Allow-Origin`.

JSONP was a legacy workaround using script tags, but it is now largely obsolete and insecure.

For controlled communication between windows or iframes, `postMessage` API allows secure cross-origin messaging. Proxying requests through your own server is another option where your backend makes the request instead of the browser.

Modern applications primarily rely on CORS for API calls and `postMessage` for iframe communication.

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

> Can you explain the Event Delegation?

Event delegation is a technique where you attach an event listener to a parent element rather than individual descendant elements. The listener fires whenever the event is triggered on descendants due to event bubbling up the DOM.

The benefits are:

- Reduced memory footprint - only one handler is needed on the parent rather than multiple handlers on each descendant.
- Automatic handling of dynamic content - no need to bind listeners when elements are added or unbind them when removed.

> Can you explain event bubbling and how it works?

Event bubbling is the process where an event triggered on a DOM element propagates upward through its ancestors in the DOM tree. When an event occurs on an element, it first runs handlers on that element, then on its parent, then on its grandparent, and so on up to the document root.

For example, if you click a button inside a div inside a form, the click event fires first on the button, then bubbles up to the div, then to the form, and continues up the tree. Each ancestor with a listener for that event will have its handler executed. You can stop this propagation using `event.stopPropagation()` if needed. This bubbling behavior is what makes event delegation possible, allowing you to attach one listener to a parent instead of many listeners to individual children.

### Prototypal Inheritance

> Explain how prototypal inheritance works

Prototypal inheritance works through the prototype chain. Every object has an internal prototype reference. When accessing a property, if it's not found on the object itself, JavaScript traverses up the prototype chain until it finds the property or reaches `null`.

Unlike classical inheritance where classes copy behavior, JavaScript objects delegate to their prototypes at runtime. This means multiple objects can share methods through a common prototype without duplicating them in memory, which is both memory-efficient and flexible.

### call, apply, bind

> What's the difference between `.call` and `.apply`?

Both `.call` and `.apply` invoke a function and set its `this` context to the first parameter. The difference is how they handle additional arguments: `.call` takes arguments individually, while `.apply` takes them as an array.

```javascript
function add(a, b) {
  return a + b
}

console.log(add.call(null, 1, 2)) // 3
console.log(add.apply(null, [1, 2])) // 3
```

> What does `.bind` do and how is it different from `.call` and `.apply`?

`.bind` creates a new function with a permanently bound `this` context and optionally pre-set arguments.

Unlike `.call` and `.apply` which invoke the function immediately, `.bind` returns a new function that you can call later. The bound `this` value cannot be changed, even if you try to use `.call` or `.apply` on the bound function. This makes it useful for event handlers, callbacks, and partial application where you need to preserve context.

```javascript
function multiply(a, b) {
  return a * b
}

const double = multiply.bind(null, 2)
console.log(double(5))  // 10
console.log(double(10)) // 20
```

Here, `2` is permanently bound as the first argument, so `double` only needs one argument. This is useful for creating specialized functions from generic ones, though modern JavaScript developers often use arrow functions or currying for the same purpose.

### var, let, const

> What are the main differences between `var`, `let`, and `const`?

The key distinctions revolve around **scope, hoisting behavior, and immutability**.

First, `var` is function-scoped, while `let` and `const` are block-scoped, restricting their existence to the nearest enclosing curly braces.

Second, regarding hoisting, `var` declarations are hoisted and initialized with `undefined`, whereas `let` and `const` are also hoisted but remain uninitialized in the Temporal Dead Zone (TDZ) until their execution flow reaches the declaration, preventing accidental early access.

Finally, concerning immutability, `const` requires an initial value and prevents the variable itself from being reassigned to a new value, although its contents (if an object or array) can be modified; `let` allows reassignment; and `var` is fully mutable.

In modern JavaScript, `const` is preferred by default, use `let` when reassignment is needed, and `var` is largely obsolete.

### null, undefined

> What's the difference between `null` and `undefined` in JavaScript?

Both represent absence of value, but they differ in meaning and usage.
  
`undefined` is JavaScript's default state for uninitialized variables, function arguments not passed, or functions that implicitly return nothing. `null` is an intentional assignment representing 'no value' or 'empty'. You explicitly set something to `null` to indicate it's empty.

In terms of type, `typeof undefined` returns `'undefined'`, while `typeof null` returns `'object'`, which is actually a legacy bug in JavaScript.

In practice, use `undefined` to check if something hasn't been initialized, and use `null` when you want to explicitly clear or reset a value.

### `==` vs `===`

> What's the difference between `==` and `===` in JavaScript?

The key difference is type coercion. `==` is the abstract equality operator while `===` is the strict equality operator. `==` performs loose equality comparison with type coercion, meaning it converts operands to the same type before comparing. `===` performs strict equality without type coercion, requiring both value and type to be identical.

Best practice is to always use `===` to avoid unexpected behavior from type coercion, unless you specifically need the coercion behavior, which is rare.

### Promise

> What are the pros and cons of using Promises instead of callbacks?

Using Promises makes asynchronous code cleaner and easier to read by avoiding deeply nested callback structures. They provide consistent error handling through `.catch()`, and compose well with features like `.then()` chains or `Promise.all()`, which is useful for running multiple tasks in parallel. They also integrate seamlessly with `async/await`, making async code look almost synchronous.

On the downside, Promises can still become hard to follow if you chain too many `.then()` calls, and if you forget to add `.catch()`, errors might be silently ignored. For very simple cases, they may introduce a bit of overhead compared to plain callbacks.

### Arrow Function

> What are arrow functions and how do they differ from regular functions?

Arrow functions are a concise ES6 syntax for writing functions. The key difference is `this` binding - arrow functions don't have their own `this`, they inherit it lexically from the surrounding scope. Regular functions have their own `this` that depends on how they're called.

This makes arrow functions ideal for callbacks where you want to preserve context, like in array methods or event handlers. However, they can't be used as constructors with `new` and don't have their own `arguments` object.

In practice, I use arrow functions for most cases, especially callbacks, but use regular functions when I need dynamic `this` or constructor functionality.

### Higher-Order Function

> What is a higher-order function?

A higher-order function is a function that either takes one or more functions as arguments, returns a function, or both. This is a core concept in functional programming.

Common examples include array methods like `map`, `filter`, and `reduce`, which all accept callback functions. For instance, map is a higher-order function because it takes a function as an argument. Function factories are another example, like a function that returns a customized function based on parameters.

Higher-order functions enable code reuse, composition, and abstraction. They're fundamental to functional programming patterns and are widely used in modern JavaScript for data transformation and creating reusable logic.

## CSS

### Visibility

> What is the difference between `visibility: hidden` and `display: none` properties in CSS?

The core difference lies in their impact on the document layout and flow.

`visibility: hidden` hides the element but preserves its space in the layout, preventing other elements from shifting. It remains in the DOM, is fully accessible to screen readers, and retains event capacity for user actions like clicks. This is generally preferred for temporary toggles where maintaining the layout structure is necessary.

`display: none` completely removes the element from the document flow, reclaiming its space. It's not rendered, is inaccessible to screen readers, and ignores all events. This is the standard choice when you need to reclaim layout space, though toggling its state triggers a costly reflow, which is a significant performance consideration.

### BFC

> What is BFC (Block Formatting Context) and when is it useful?

BFC, or Block Formatting Context, is an isolated rendering region in CSS where block-level boxes are laid out according to specific rules. Elements inside a BFC don't affect the layout of elements outside it.

A BFC is created by elements with specific properties: non-visible `overflow` values, `position: absolute` or `fixed`, `float` values, or modern methods like `display: flow-root`, flex, or grid containers.

BFC is useful for solving common layout issues. It prevents margin collapse between a parent and its first/last child, clears floats by containing floated children, and prevents text wrapping around floated elements.

In modern CSS, `display: flow-root` is the cleanest way to create a BFC without side effects.

## React

## Vue

## Workflow

### Debugging

> What tools and techniques do you use for debugging JavaScript code?

I primarily use browser DevTools, especially Chrome DevTools. The Source panel with breakpoints is essential for stepping through code and inspecting the call stack and variable states. I use console methods for quick logging and tracing.

For framework-specific debugging, I use React DevTools and Redux DevTools to inspect component hierarchies and state changes. When working with Vue, I use Vue DevTools to inspect components, props, and Vuex state, which is especially helpful for pinpointing reactivity issues in complex SPAs.

I also use the Network tab for API debugging and the Performance tab to profile execution and identify rendering bottlenecks. For production issues, I use error tracking tools like Sentry with source maps to debug minified code and capture user context.
