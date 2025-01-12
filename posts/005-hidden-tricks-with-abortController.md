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

For example, Calling `controller.abort()` removes the `resize` listener from the window. That is an extremely elegant way of handling event listeners because you no longer need to abstract the listener function just so you can provide it to `.removeEventListener()`.

```javascript
const listener = () => {}

// window.addEventListener('resize', listener)
// window.removeEventListener('resize', listener)

const controller = new AbortController()
window.addEventListener('resize', listener, { signal: controller.signal })
controller.abort()
```

An `AbortController` instance is also much nicer to pass around if a different part of your application is responsible for removing the listener.

A great "aha" moment for me was when I realized you can use a single `signal` to remove multiple event listeners!

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

In the example above, I'm adding a `useEffect()` hook that introduces a bunch of event listeners with different purpose and logic. Notice how in the clean up function I can remove all of the added listeners by calling `controller.abort()` once. Neat!

### Fetch requests

The `fetch()` function supports `AbortSignal` as well! Once the `abort` event on the signal is emitted, the request promise returned from the `fetch()` function will reject, aborting the pending request.

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

Here, the `uploadFile()` function initiates a `POST /upload` request, returning the associated `response` promise but also a `controller` reference to abort that request at any point. This is handy if I need to cancel that pending upload, for example, when the user clicks on a "Cancel" button.

The `AbortSignal` class also comes with a few static methods to simplify request handling in JavaScript.

#### `AbortSignal.timeout`

You can use the `AbortSignal.timeout()` static method as a shorthand to create a signal that dispatches the abort event after a certain timeout duration has passed. No need to create an `AbortController` if all you want is to cancel a request after it exceeds a timeout:

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

In the example above, I am introducing two abort controllers. The public one is exposed to the consumer of my code, allowing them to trigger aborts, resulting in the `message` event listener being removed. The internal one, however, allows me to also remove that listener without interfering with the public abort controller.

If any of the abort signals provided to the `AbortSignal.any()` dispatch the abort event, that parent signal will also dispatch the abort event. Any other abort events past that point are ignored.

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

The `WritableStream` controller exposes the `signal` property, which is the same old `AbortSignal`. That way, I can call `writer.abort()`, which will bubble up to the abort event on `controller.signal` in the `write()` method in the stream.

## Abort error handling

Every abort event is accompanied with the reason for that abort. That yields even more customizability as you can react to different abort reasons differently.

The abort reason is an optional argument to the `controller.abort()` method. You can access the abort reason in the `reason` property of any `AbortSignal` instance.

```javascript
const controller = new AbortController()

controller.signal.addEventListener("abort", () => {
  console.log(controller.signal.reason) // "user cancellation"
})

// Provide a custom reason to this abort.
controller.abort("user cancellation")
```

> The `reason` argument can be any JavaScript value so you can pass strings, errors, or even objects.
