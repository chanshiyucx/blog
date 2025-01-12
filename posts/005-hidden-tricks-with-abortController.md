---
title: Hidden Tricks with AbortController
date: 2025-01-11 22:44:14
tags:
  - Web/JavaScript
---
Today, I'd like to talk about one of the standard JavaScript APIs you are likely sleeping on. It's called [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).

## What is AbortController?

The **`AbortController`** interface represents a controller object that allows you to abort anything when desired.

Here's how you use it:

```javascript
const controller = new AbortController()

controller.signal
controller.abort()
```

Once you create a controller instance, you get two things:

- `AbortController.signal`: an instance of [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal), which can be used to communicate with, or to abort, an asynchronous operation.
- `AbortController.abort()`: aborts an asynchronous operation before it has completed. When called, triggers the abort event on the `signal`. It also updates the signal to be marked as aborted.

So far so good. But where is the actual abort logic? That's the beauty—it's defined by the consumer. The abort handling comes down to listening to the `abort` event and implementing the abort in whichever way is suitable for the logic:

```javascript
controller.signal.addEventListener("abort", () => {
  // Implement the abort logic.
})
```

Let's explore the standard JavaScript APIs that support `AbortSignal` out of the box.

## Usage

### Event listeners

You can provide an abort `signal` when adding an event listener for it to be automatically removed once the abort happens.

```javascript
const controller = new AbortController()

window.addEventListener("resize", listener, { signal: controller.signal })

controller.abort()
```

### Fetch requests

### Streams

## Making anything abortable

### Abort error handling

## Conclusion
