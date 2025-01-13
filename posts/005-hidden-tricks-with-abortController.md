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

Creating a controller instance provides you with two key components:

- `AbortController.signal`: an instance of [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal), which can be used to communicate with, or to abort, an asynchronous operation.
- `AbortController.abort()`: aborts an asynchronous operation before it has completed. When called, triggers the abort event on the `signal`. It also updates the signal to be marked as aborted.

You might wonder where the actual abort logic resides. Here's the elegant part—you define it! Simply listen for the `abort` event and implement your cancellation logic as needed:

```javascript
controller.signal.addEventListener("abort", () => {
  // Implement the abort logic.
})
```

Now, let's explore which standard JavaScript APIs have built-in support for `AbortSignal`.

## Usage

### Event listeners

You can provide an abort `signal` when adding an event listener for it to be automatically removed once the abort happens.

For example, calling `controller.abort()` removes the `resize` listener from the window. That is an extremely elegant way of handling event listeners because you no longer need to separately define the listener function for later removal with `.removeEventListener()`.

```javascript
const listener = () => {}

// window.addEventListener('resize', listener)
// window.removeEventListener('resize', listener)

const controller = new AbortController()
window.addEventListener('resize', listener, { signal: controller.signal })
controller.abort()
```

This pattern is especially useful when different parts of your application need to manage listener cleanup, as passing around an `AbortController` instance is much cleaner than sharing function references.

One of the most powerful features is the ability to use a single signal to manage multiple event listeners simultaneously!

```javascript
useEffect(() => {
  const controller = new AbortController()

  window.addEventListener("resize", handleResize, {
    signal: controller.signal,
  })
  window.addEventListener("hashchange", handleHashChange, {
    signal: controller.signal,
  })
  window.addEventListener("storage", handleStorageChange, {
    signal: controller.signal,
  })

  return () => {
    // Calling `.abort()` removes ALL event listeners
    // associated with `controller.signal`. Gone!
    controller.abort()
  }
}, [])
```

The example above demonstrates how a single `useEffect()` hook can manage multiple event listeners with different purposes. The cleanup is beautifully simple - one call to `controller.abort()` removes all listeners at once!

### Fetch requests

The `fetch()` API also integrates seamlessly with `AbortSignal`. When an abort event is triggered, any pending request will be cancelled, and its promise will reject.

```javascript
function uploadFile(file: File) {
  const controller = new AbortController()

  // Provide the abort signal to this fetch request
  // so it can be aborted anytime be calling `controller.abort()`.
  const response = fetch("/upload", {
    method: "POST",
    body: file,
    signal: controller.signal,
  })

  return { response, controller }
}
```

In this example, `uploadFile()` starts a file upload and returns both the response promise and the controller. This makes it easy to cancel uploads when needed, such as when users click a "Cancel" button.

`AbortSignal` provides several convenient static methods that make request handling even easier.

#### `AbortSignal.timeout`

The `AbortSignal.timeout()` method offers a concise way to create time-limited operations. It automatically aborts after the specified duration - perfect for adding request timeouts without manual `AbortController` setup:

```javascript
fetch(url, {
  // Abort this request automatically if it takes
  // more than 3000ms to complete.
  signal: AbortSignal.timeout(3000),
})
```

#### `AbortSignal.any`

Similar to how you can use `Promise.race()` to handle multiple promises on a first-come-first-served basis, you can utilize the `AbortSignal.any()` static method to group multiple abort signals into one.

```javascript
const publicController = new AbortController()
const internalController = new AbortController()

channel.addEventListener("message", handleMessage, {
  signal: AbortSignal.any([publicController.signal, internalController.signal]),
})
```

The example above shows two controllers working together: a public one that lets code consumers trigger aborts, and an internal one for our own cleanup needs. Either controller can remove the message listener independently.

When any signal provided to `AbortSignal.any()` aborts, it triggers the combined signal to abort as well. Once aborted, subsequent abort events from other signals are ignored.

### Streams

You can use `AbortController` and `AbortSignal` to cancel streams as well.

```javascript
const stream = new WritableStream({
  write(chunk, controller) {
    controller.signal.addEventListener('abort', () => {
      // Handle stream abort here.
    })
  },
})

const writer = stream.getWriter()
await writer.abort()
```

The `WritableStream` controller provides a `signal` property that works just like any other `AbortSignal`. Calling `writer.abort()` triggers the abort event on this signal, allowing for clean stream cancellation.

## Abort error handling

Each abort event can carry a custom reason, enabling you to handle different cancellation scenarios in distinct ways.

You can provide an abort reason when calling `controller.abort()`, and later access it through the signal's `reason` property to determine why the operation was cancelled.

```javascript
const controller = new AbortController()

controller.signal.addEventListener("abort", () => {
  console.log(controller.signal.reason) // "user cancellation"
})

// Provide a custom reason to this abort.
controller.abort("user cancellation")
```

The `reason` argument can be any JavaScript value so you can pass strings, errors, or even objects.

Ref:
- [MDN AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
- [Don't Sleep on AbortController](https://kettanaito.com/blog/dont-sleep-on-abort-controller)
