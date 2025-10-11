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

### CORS

> What is CORS and why is it necessary?

CORS, or Cross-Origin Resource Sharing, is a security mechanism that allows servers to specify which origins can access their resources. It's built on top of the same-origin policy, which by default blocks cross-origin requests from JavaScript.

When a browser makes a cross-origin request, it sends an `Origin` header. The server responds with CORS headers like `Access-Control-Allow-Origin` to indicate whether the request is permitted:

```text
Access-Control-Allow-Origin: https://example.com
Access-Control-Allow-Methods: GET, POST
Access-Control-Allow-Headers: Content-Type
```

For simple requests like GET or POST with standard headers, the browser makes the request directly. For complex requests with custom headers or methods like PUT or DELETE, the browser sends a preflight OPTIONS request first to check permissions.

CORS is necessary because without it, malicious websites could make requests to other sites using your cookies and credentials, potentially accessing sensitive data. It's a common issue in development when your frontend and backend are on different ports. The solution is configuring the server to include appropriate CORS headers, or using a proxy in development.

### Same-Origin Policy

> What is the same-origin policy and why does it exist?

The same-origin policy is a critical security mechanism that restricts how documents or scripts from one origin can interact with resources from another origin. Two URLs have the same origin only if they share the same **protocol, domain, and port**. This policy exists to prevent malicious scripts on one site from accessing sensitive data on another site through the user's browser.

> What resources are actually restricted by same-origin policy?

The policy primarily restricts JavaScript access to cross-origin resources. You cannot read responses from `fetch` or `XMLHttpRequest` to different origins without CORS headers. You cannot access the DOM of cross-origin iframes or windows, and JavaScript cannot directly read data belonging to other origins, such as their localStorage or cookies. However, some things are allowed: embedding resources like images, stylesheets, and scripts from different origins works fine, which is why CDNs function. Form submissions to different origins are also allowed. The key distinction is that you can load cross-origin resources, but JavaScript cannot read their content without explicit permission.

> What are the main ways to work around same-origin policy restrictions when you need cross-origin communication?

There are several legitimate approaches.

CORS, or Cross-Origin Resource Sharing, is the standard solution where the server explicitly allows cross-origin requests through specific HTTP headers like `Access-Control-Allow-Origin`.

JSONP was a legacy workaround using script tags, but it is now largely obsolete and insecure.

For controlled communication between windows or iframes, `postMessage` API allows secure cross-origin messaging. Proxying requests through your own server is another option where your backend makes the request instead of the browser.

Modern applications primarily rely on CORS for API calls and `postMessage` for iframe communication.

### Local Storage, Session Storage

> What's the difference between Local Storage and Session Storage?

Both are browser storage mechanisms that store key-value pairs as strings, but they differ in persistence and scope.

Local Storage persists data permanently until explicitly deleted. Data remains even after closing the browser or restarting the computer. It's shared across all tabs and windows from the same origin.

Session Storage only persists for the duration of the page session. Data is cleared when the tab or window is closed, and it's isolated to that specific tab - other tabs don't share the data even from the same origin.

Both have a storage limit of around 5-10MB per origin and store data as strings, so you need to use `JSON.stringify()` and `JSON.parse()` for objects.

Use Local Storage for data that should persist across sessions like user preferences or themes, and Session Storage for temporary data like form inputs or navigation state within a single session

### Web Workers

> What are Web Workers and when would you use them?

Web Workers allow you to run JavaScript in background threads separate from the main browser thread, enabling true parallel execution without blocking the UI. This is crucial because JavaScript is normally single-threaded.

You create a worker by instantiating it with a separate script file:

```javascript
const worker = new Worker('worker.js')

worker.postMessage({ data: 'hello' })

worker.onmessage = (event) => {
  console.log('Result:', event.data)
}
```

Workers communicate with the main thread through message passing using `postMessage()` and `onmessage`. They have their own global scope and cannot access the DOM, window object, or most browser APIs.

Web Workers are ideal for CPU-intensive tasks like complex calculations, data processing, image manipulation, or parsing large datasets. For example, processing a large CSV file, performing heavy algorithms, or real-time data analysis. This keeps the main thread responsive and prevents UI freezing.

There's also Service Workers for network request interception and offline functionality, and Shared Workers for communication between multiple tabs, but regular Web Workers are most common for computation offloading.

### Strong Cache, Negotiated Cache

> What's the difference between strong cache and negotiated cache?

These are two HTTP caching strategies that determine how browsers handle cached resources.

Strong cache means the browser uses cached resources directly without asking the server. During the cache period, the browser doesn't send any request to the server, making it the fastest option. It's controlled by `Cache-Control` and `Expires` headers:

```text
Cache-Control: max-age=31536000
Expires: Wed, 21 Oct 2025 07:28:00 GMT
```

Negotiated cache means the browser asks the server if the cached version is still valid. It uses `ETag` or `Last-Modified` headers:

```text
ETag: "abc123"
Last-Modified: Wed, 21 Oct 2024 07:28:00 GMT
```

The browser sends a conditional request with `If-None-Match` or `If-Modified-Since`. If unchanged, the server returns `304 Not Modified` with no body, saving bandwidth. If changed, it returns `200 OK` with new content.

In practice, combine both: use strong cache with long expiration for versioned assets, and negotiated cache for resources that change unpredictably like HTML files.

> Can you explain the overall browser caching flow?

When the browser requests a resource, it follows this flow:

If there's no cache, the browser makes a normal request and receives `200 OK` with the resource, then caches it based on the response headers.

On subsequent requests, the browser first checks if a strong cache exists and is still valid based on `Cache-Control` or `Expires`. If valid, it uses the cached version directly without asking the server.

If the strong cache has expired, the browser checks for negotiated cache validators like `ETag` or `Last-Modified`. It sends a conditional request with `If-None-Match` or `If-Modified-Since` headers.

The server compares the validators. If unchanged, it responds with `304 Not Modified` and no body - the browser uses its cached version. If changed, it responds with `200 OK` and the new content, which replaces the cache.

This flow optimizes performance by eliminating requests when possible, reducing bandwidth when content hasn't changed, and only transferring full content when necessary.

## HTML

### Semantic HTML

> What is semantic HTML and why is it important?

Semantic HTML uses elements that clearly describe their meaning and content, rather than generic containers like `<div>` or `<span>`. Examples include `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, and `<footer>`.

It's important for several reasons. First, it improves accessibility - screen readers can better understand page structure and navigate more effectively. Second, it benefits SEO because search engines can better understand content hierarchy and importance. Third, it makes code more readable and maintainable for developers. Using semantic HTML is a best practice that improves overall web quality with minimal extra effort.

### script: async vs defer

> What's the difference between `<script>`, `<script async>`, and `<script defer>`?

The key difference is how they affect HTML parsing and script execution timing.

Regular `<script>` blocks HTML parsing. When the browser encounters it, it stops parsing, downloads the script, executes it immediately, then continues parsing. This can slow down page load if scripts are large or in the `<head>`.

`<script async>` downloads the script in parallel with HTML parsing without blocking, but executes immediately once downloaded, which pauses parsing during execution. Scripts execute in whatever order they finish downloading, not in the order they appear in HTML. This is ideal for independent scripts like analytics that don't depend on other scripts or the DOM.

`<script defer>` also downloads in parallel without blocking, but waits to execute until HTML parsing is complete. Scripts execute in the order they appear in the document, right before `DOMContentLoaded` fires. This is best for scripts that need the full DOM or have dependencies on other scripts.

In practice, I use `defer` for most scripts that manipulate the DOM, `async` for independent third-party scripts like analytics, and place regular scripts at the end of `<body>` if neither attribute is suitable.

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

### Pseudo Elements vs Pseudo Classes

> What are pseudo-elements and how do they differ from pseudo-classes?

Pseudo-elements allow you to style specific parts of an element without adding extra HTML. They use double colons `::` like `::before`, `::after`, `::first-line`, and `::first-letter`. The most common use is `::before` and `::after`, which insert content before or after an element's actual content. They're useful for decorative elements, icons, or styling effects without cluttering the HTML.

Pseudo-classes target elements based on their state or position, using a single colon `:` like `:hover`, `:focus`, `:active`, or `:nth-child()`. They style elements when they're in a particular condition.

The key difference: pseudo-elements create and style virtual elements that are parts of existing elements, while pseudo-classes select existing elements based on their state.

### Layout

> Can you explain how Flexbox works and its key properties?

Flexbox is a one-dimensional layout system that arranges items along a main axis. You enable it by setting `display: flex` on a container, which makes its direct children flex items.

Key container properties include `flex-direction` which sets the main axis direction (row or column), `justify-content` for alignment along the main axis, `align-items` for alignment along the cross axis, and `flex-wrap` to control whether items wrap to new lines.

For flex items, the most important property is `flex`, which is shorthand for three properties: `flex-grow` determines how much an item grows relative to others, `flex-shrink` controls shrinking when space is limited, and `flex-basis` sets the initial size before growing or shrinking.

Common patterns include `flex: 1` to make items grow equally, `flex: 0 0 auto` to prevent growing or shrinking, and using `align-items: center` with `justify-content: center` to perfectly center content.

> Can you explain how CSS Grid works and its key properties?

CSS Grid is a two-dimensional layout system that divides space into rows and columns. You enable it with `display: grid` on a container, making its direct children grid items.

Key container properties include `grid-template-columns` and `grid-template-rows` to define the grid structure, `gap` for spacing between cells, and `grid-template-areas` for naming regions. For example:

```css
.container {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  grid-template-rows: auto 1fr auto;
  gap: 20px;
}
```

The `fr` unit represents a fraction of available space, making responsive layouts easier.

For grid items, you can position them using `grid-column` and `grid-row` to span multiple cells, or use `grid-area` to place items in named regions. Auto-placement handles items automatically if not explicitly positioned.

Common patterns include using `repeat()` for repetitive columns like `grid-template-columns: repeat(3, 1fr)`, `minmax()` for responsive sizing, and `auto-fit` or `auto-fill` for automatically adjusting column count based on available space.

> What are the differences between Flexbox and CSS Grid, and when would you use each?

The key difference is dimensionality: Flexbox works along a single axis, while Grid works with both axes at once. In practice, they complement each other - Grid for the overall page layout, Flexbox for components within those grid areas. For example, you might use Grid to create a page with header, sidebar, and main content, then use Flexbox within each section to arrange individual elements.

### Responsive Design

> What is responsive design and how to implement it?

 Responsive design is an approach where websites adapt their layout and content to different screen sizes and devices, providing an optimal viewing experience across desktops, tablets, and mobile phones.

The core technique is using CSS media queries to apply different styles based on viewport width.

Beyond media queries, key techniques include fluid layouts with relative units like percentages or `fr` units instead of fixed pixels, flexible images with `max-width: 100%` to prevent overflow, and responsive typography using `clamp()` or viewport units like `vw`.

Modern approaches include using Flexbox and Grid for inherently flexible layouts, mobile-first design where styles start with mobile and progressively enhance for larger screens, and CSS container queries for component-level responsiveness. The viewport meta tag is also essential to ensure proper scaling on mobile devices.

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

### Higher-Order Function

> What is a higher-order function?

A higher-order function is a function that either takes one or more functions as arguments, returns a function, or both. This is a core concept in functional programming.

Common examples include array methods like `map`, `filter`, and `reduce`, which all accept callback functions. For instance, map is a higher-order function because it takes a function as an argument. Function factories are another example, like a function that returns a customized function based on parameters.

Higher-order functions enable code reuse, composition, and abstraction. They're fundamental to functional programming patterns and are widely used in modern JavaScript for data transformation and creating reusable logic.

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

### Map, Set, WeakMap, WeakSet

> Can you explain Map, Set, WeakMap, and WeakSet in JavaScript?

These are data structures introduced in ES6 that offer alternatives to objects and arrays.

Map is a key-value collection where keys can be any type, not just strings.

Set stores unique values of any type, automatically removing duplicates.

WeakMap is similar to Map but only accepts objects as keys and holds weak references, meaning if there are no other references to the key object, it can be garbage collected. It doesn't prevent memory leaks and has no iteration methods.

WeakSet is like Set but only stores objects with weak references, also allowing garbage collection.

Use Map for general key-value storage with non-string keys, Set for unique collections, WeakMap for storing metadata about objects without preventing garbage collection, and WeakSet for tracking object presence without memory leaks.

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

### Spread & Rest Operators

> What are spread syntax and rest syntax, and how do they differ?

Both spread and rest syntax use the three-dot `…` operator but serve opposite purposes. Spread syntax expands an array or object into individual elements, while rest syntax collects multiple elements into an array.

Spread is used when calling functions or creating new arrays and objects. It's useful for copying arrays, merging objects, and passing array elements as function arguments.

```javascript
Math.max(...[1, 2, 3])
const newObj = {...obj1, ...obj2}
```

Rest syntax collects remaining arguments into an array, used in function parameters and destructuring.

```javascript
function sum(...numbers) { }
const [first, ...rest] = array
```

The key distinction: spread expands, rest collects. They look identical but their context determines their behavior.

### Destructuring

> What is destructuring in JavaScript?

Destructuring is a syntax for extracting values from arrays or properties from objects into distinct variables in a concise way. It makes code cleaner and more readable.

Destructuring is particularly useful in function parameters to extract only needed properties, in React for props, and when working with API responses. It reduces repetitive code and makes variable extraction more explicit and declarative.

For arrays, you extract values by position:

```javascript
const [first, second] = [1, 2, 3]
const [a, , c] = [1, 2, 3] // skip elements
```

For objects, you extract properties by name:

```javascript
const { name, age } = { name: 'John', age: 30 }
const { name: userName } = user // rename variable
```

You can also use default values, nested destructuring, and combine it with rest syntax:

```javascript
const { name = 'Anonymous', ...rest } = user
const [first, ...remaining] = array
```

### Debounce & Throttle

> What's the difference between debouncing and throttling?

Both are techniques to limit how often a function executes, but they work differently. In summary: debouncing waits for silence, throttling ensures regular intervals.

Debouncing delays function execution until after a specified time has passed since the last invocation. If the function is called again before the delay expires, the timer resets. It's like waiting for a pause in activity, This is ideal for search inputs where you only want to query after the user stops typing.

```javascript
function debounce(func, delay) {
  let timeoutId
  return function(...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(this, args), delay)
  }
}

const handleSearch = debounce(searchAPI, 300)
```

Throttling ensures a function executes at most once per specified time interval, regardless of how many times it's called. It guarantees regular execution. This is perfect for scroll or resize handlers where you want updates but not on every single event.

```javascript
function throttle(func, limit) {
  let inThrottle = false
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}
```

## React

### Virtual DOM

> What is Virtual DOM and why is it useful?

Virtual DOM is a lightweight JavaScript representation of the actual DOM. It's an in-memory tree structure that mirrors the real DOM but is much faster to manipulate.

The process works in three steps: when state changes, a new Virtual DOM tree is created. The framework diffs it against the previous version to identify changes, then applies only necessary updates to the real DOM in an optimized batch.

This is efficient because direct DOM manipulation is expensive - it triggers reflows and repaints. The Virtual DOM minimizes actual DOM operations by calculating the minimal set of changes needed, keeping most work in fast JavaScript memory operations.

Frameworks like React use it to improve performance and enable a declarative programming model where you describe what the UI should look like, and the framework handles efficient updates.

### CSR vs SSR

> What's the difference between CSR and SSR?

CSR renders content in the browser using JavaScript. The server sends minimal HTML and a JavaScript bundle that builds the UI client-side. This means faster subsequent navigation but slower initial load and potential SEO issues.

SSR renders HTML on the server and sends fully formed pages to the browser. Users see content immediately, then JavaScript hydrates for interactivity. This provides better initial load performance and SEO, but increases server load.

Modern frameworks often combine both - SSR for initial page load, then CSR for navigation. The choice depends on priorities: use SSR for content-heavy sites needing SEO, CSR for highly interactive applications.

### React Hooks

> What are React Hooks and why were they introduced?

React Hooks are functions that let you use state and other React features in functional components without writing classes. They were introduced in React 16.8 to solve problems with class components like complex lifecycle methods, difficulty reusing stateful logic, and confusion around `this` binding.

The most common hooks are `useState` for managing component state and `useEffect` for side effects like data fetching or subscriptions:

Other important hooks include `useContext` for consuming context, `useRef` for accessing DOM elements or persisting values, `useMemo` and `useCallback` for performance optimization, and `useReducer` for complex state logic.

Hooks follow specific rules: they must be called at the top level, not inside loops or conditions, and only in functional components or custom hooks. Custom hooks enable reusable stateful logic by extracting hook-based code into separate functions, promoting code reuse without wrapper components."

## Vue

### Reactivity

> Can you explain the difference between Vue 2 and Vue 3's reactivity systems?

Vue 2 uses `Object.defineProperty()` to implement reactivity. It intercepts getter and setter operations on object properties to track dependencies and trigger updates. When you access a property, it collects dependencies, and when you modify it, it notifies watchers to re-render.

Vue 3 uses the Proxy API for reactivity. Proxies intercept operations at the object level rather than the property level, providing more comprehensive tracking of changes including property addition, deletion, and array modifications.

The key difference is that Vue 2 requires properties to exist at initialization for reactivity to work, while Vue 3 can detect new properties automatically. Vue 3's approach is more powerful and eliminates many of the limitations of Vue 2.

> What are the limitations of Vue 2's reactivity system? How does Vue 3's Proxy-based reactivity solve these problems?

Vue 2 has several limitations because `Object.defineProperty()` operates at the property level and can only track properties that were defined when the reactivity system was initialized.

1. **Property Addition/Deletion**: It cannot detect property addition or deletion. Adding a new property won't trigger reactivity - you need `Vue.set()`.
2. **Array Modifications**: It cannot detect array modifications by index like `arr[0] = value` or length changes like `arr.length = 0`. You must use array methods like `push`, `splice`, or `Vue.set()`.
3. **Initialization Performance**: It requires recursively walking through all properties at initialization to make them reactive, which has performance overhead for deeply nested objects.

Vue 3's Proxy resolves these issues by intercepting operations at the object level:

1. **Property Addition/Deletion**: Proxy can detect when new properties are added or removed through its traps. Therefore, adding or deleting properties works automatically without needing special methods like `Vue.set()`.
2. **Array Modifications**: Proxy intercepts all operations, including index access and length modifications, making operations like `arr[0] = value` and `arr.length = 0` fully reactive.
3. **Performance**: Vue 3 implements lazy reactivity. It only makes nested objects reactive when they're actually accessed, not upfront during initialization. This significantly improves initialization performance for complex data structures.
4. **Completeness**: Proxies enable better TypeScript support and allow Vue 3 to track more operation types like `has`, `deleteProperty`, and `ownKeys`, making the reactivity system more complete and predictable.

> Are there any drawbacks to Vue 3's Proxy-based approach?

 The primary drawback is **browser compatibility**. Since the Proxy API is a language-level feature introduced in ES6, it cannot be fully polyfilled in older browsers like IE11. This is why Vue 3 doesn't support IE11, while Vue 2 does.

Another consideration involves **handling primitive values**. Proxies can only intercept operations on objects, not primitives (like strings, numbers, or booleans). This is why Vue 3 introduced `ref()` to wrap primitives in an object with a `.value` property, adding a small syntax overhead compared to Vue 2's plain values.

### Vite

> What is Vite and what's its core philosophy?

Vite is a modern build tool that leverages native browser ES module support. Its core philosophy is leveraging native ES modules in the browser during development to achieve instant server start and lightning-fast Hot Module Replacement.

During development, it uses esbuild for dependency pre-bundling. For production, it uses Rollup for optimized bundling. This approach provides fast development experience while maintaining production performance.

> Why does Vite start so fast compared to traditional bundlers?

Vite starts fast because it doesn't bundle the entire project upfront like Webpack. Instead, it serves source code based on native browser ES modules with on-demand loading.

It uses esbuild, written in Go, for dependency pre-bundling, which is 10-100x faster than JavaScript-based bundlers. This means startup time remains constant regardless of project size.

> What is Vite's build process?

Vite has two distinct modes:

- Development mode: esbuild pre-bundles dependencies in `node_modules`, the browser loads source code directly via ES module imports, and when files change, Vite only recompiles affected modules through HMR.
- Production mode: Rollup bundles the code into optimized static assets with automatic code splitting and tree-shaking.

This dual strategy optimizes for both developer experience in development and performance in production.

> How does Vite's HMR work?

Vite's HMR is built on native ES modules with WebSocket communication. When a file changes, Vite's file watcher detects it and pushes only the updated module to the browser via WebSocket.

The browser receives the update and reloads only the changed module without refreshing the entire page. This module-level granularity makes updates nearly instantaneous, unlike bundle-level HMR in traditional bundlers.

### Vue Router

> What are the different types of route guards in Vue Router and their practical use cases?

Vue Router has three levels of route guards:

**Global guards** apply to all routes. `beforeEach` runs before every navigation and is commonly used for authentication checks and permission validation. `beforeResolve` runs after all in-component guards but before navigation is confirmed. `afterEach` runs after navigation completes and is useful for analytics tracking or resetting scroll position.

**Per-route guards** are defined in route configuration. `beforeEnter` is attached to specific routes and useful for role-based access control, like restricting admin pages to admin users only.

**In-component guards** are defined inside components. `beforeRouteEnter` runs before the component is created, useful for fetching data before rendering. `beforeRouteUpdate` handles changes within the same component, like updating data when route params change. `beforeRouteLeave` runs before leaving the component, commonly used for unsaved changes warnings.

### Vuex

> What is Vuex, its core concepts, and how do you use it?

Vuex is Vue's official state management library for managing shared state across components. It provides a centralized store that follows a predictable state mutation pattern, making state changes trackable and debuggable.

Common use cases include managing user authentication state, sharing data between unrelated components, and handling complex application state that doesn't fit component props and events.

The core concepts are: **State** holds the application data. **Getters** are computed properties for the store, useful for derived state. **Mutations** are synchronous functions that directly modify state - they're the only way to change state. **Actions** handle asynchronous operations and commit mutations. **Modules** allow splitting the store into namespaced sections for large applications.

The data flow is unidirectional: components dispatch actions, actions commit mutations, mutations modify state, and state changes trigger component updates. For cleaner code, helpers like `mapGetters`, `mapActions`, and `mapMutations` are used in components.

## Workflow

### Debugging

> What tools and techniques do you use for debugging JavaScript code?

I primarily use browser DevTools, especially Chrome DevTools. The Source panel with breakpoints is essential for stepping through code and inspecting the call stack and variable states. I use console methods for quick logging and tracing.

For framework-specific debugging, I use React DevTools and Redux DevTools to inspect component hierarchies and state changes. When working with Vue, I use Vue DevTools to inspect components, props, and Vuex state, which is especially helpful for pinpointing reactivity issues in complex SPAs.

I also use the Network tab for API debugging and the Performance tab to profile execution and identify rendering bottlenecks. For production issues, I use error tracking tools like Sentry with source maps to debug minified code and capture user context.
