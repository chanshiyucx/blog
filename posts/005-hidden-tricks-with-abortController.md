---
title: Hidden Tricks with AbortController
date: 2025-01-11 22:44:14
tags:
  - Web/JavaScript
---

<!--Today, I'd like to talk about one of the standard JavaScript APIs you are likely sleeping on. It's called [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).-->

Let's explore a powerful yet often overlooked JavaScript API called [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) that can greatly improve how you handle cancellations in your code.

## What is AbortController?

<!--The **`AbortController`** interface represents a controller object that allows you to abort anything when desired.-->

The **`AbortController`** is a simple yet versatile interface that lets you cancel operations at any time - whether they're network requests, event listeners, or streams.

Here's how you use it:

```javascript
const controller = new AbortController()

controller.signal
controller.abort()
```

When you create an AbortController, you get two essential pieces:

- `AbortController.signal`: An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) object that acts as a communication channel for cancellation.
- `AbortController.abort()`: A method to trigger cancellation. When called, it fires an abort event through the signal and marks it as aborted.

<!--You might wonder where the actual abort logic resides. Here's the elegant part—you define it! Simply listen for the `abort` event and implement your cancellation logic as needed:-->

The beauty of AbortController lies in its flexibility - you decide what happens when something is aborted by listening to the `abort` event:

```javascript
controller.signal.addEventListener("abort", () => {
  // Implement the abort logic.
})
```

## Usage

### Event listeners

<!--You can provide an abort `signal` when adding an event listener for it to be automatically removed once the abort happens.-->

One of the cleanest ways to remove event listeners is by passing an abort `signal` when adding them. When aborted, the listeners are automatically cleaned up.

<!--For example, calling `controller.abort()` removes the `resize` listener from the window. That is an extremely elegant way of handling event listeners because you no longer need to abstract the listener function just so you can provide it to `.removeEventListener()`.-->

Here's a simple example: calling `controller.abort()` removes the window's `resize` listener automatically. This elegant approach eliminates the need to store listener references just for removal purposes.

<!--An `AbortController` instance is also much nicer to pass around if a different part of your application is responsible for removing the listener.-->

This pattern is especially useful when different parts of your application need to manage listener cleanup, as passing around an AbortController instance is much cleaner than sharing function references.

<!--A great "aha" moment for me was when I realized you can use a single `signal` to remove multiple event listeners!-->

One of the most powerful features is the ability to use a single signal to manage multiple event listeners simultaneously!

<!--In the example above, I'm adding a `useEffect()` hook that introduces a bunch of event listeners with different purpose and logic. Notice how in the clean up function I can remove all of the added listeners by calling `controller.abort()` once!-->

The example above demonstrates how a single `useEffect()` hook can manage multiple event listeners with different purposes. The cleanup is beautifully simple - one call to `controller.abort()` removes all listeners at once!

### Fetch requests

<!--The `fetch()` function supports `AbortSignal` as well! Once the `abort` event on the signal is emitted, the request promise returned from the `fetch()` function will reject, aborting the pending request.-->

The `fetch()` API also integrates seamlessly with AbortSignal. When an abort event is triggered, any pending request will be cancelled, and its promise will reject.

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

<!--Here, the `uploadFile()` function initiates a `POST /upload` request, returning the associated `response` promise but also a `controller` reference to abort that request at any point. This is handy if I need to cancel that pending upload, for example, when the user clicks on a "Cancel" button.-->

In this example, `uploadFile()` starts a file upload and returns both the response promise and the controller. This makes it easy to cancel uploads when needed, such as when users click a "Cancel" button.

<!--The `AbortSignal` class also comes with a few static methods to simplify request handling in JavaScript.-->

AbortSignal provides several convenient static methods that make request handling even easier.

#### `AbortSignal.timeout`

<!--You can use the `AbortSignal.timeout()` static method as a shorthand to create a signal that dispatches the abort event after a certain timeout duration has passed. No need to create an `AbortController` if all you want is to cancel a request after it exceeds a timeout:-->

The `AbortSignal.timeout()` method offers a concise way to create time-limited operations. It automatically aborts after the specified duration - perfect for adding request timeouts without manual AbortController setup:

```javascript
fetch(url, {
  // Abort this request automatically if it takes
  // more than 3000ms to complete.
  signal: AbortSignal.timeout(3000),
})
```

#### `AbortSignal.any`

<!--Similar to how you can use `Promise.race()` to handle multiple promises on a first-come-first-served basis, you can utilize the `AbortSignal.any()` static method to group multiple abort signals into one.-->

Just as `Promise.race()` works with promises, `AbortSignal.any()` lets you combine multiple abort signals into one. The first signal to abort triggers the combined signal.

<!--In the example above, I am introducing two abort controllers. The public one is exposed to the consumer of my code, allowing them to trigger aborts, resulting in the `message` event listener being removed. The internal one, however, allows me to also remove that listener without interfering with the public abort controller.-->

This example shows two controllers working together: a public one that lets code consumers trigger aborts, and an internal one for our own cleanup needs. Either controller can remove the message listener independently.

<!--If any of the abort signals provided to the `AbortSignal.any()` dispatch the abort event, that parent signal will also dispatch the abort event. Any other abort events past that point are ignored.-->

When any signal provided to `AbortSignal.any()` aborts, it triggers the combined signal to abort as well. Once aborted, subsequent abort events from other signals are ignored.

### Streams

<!--You can use `AbortController` and `AbortSignal` to cancel streams as well.-->

AbortController's cancellation powers extend to streams too, giving you fine-grained control over stream processing.

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

<!--The `WritableStream` controller exposes the `signal` property, which is the same old `AbortSignal`. That way, I can call `writer.abort()`, which will bubble up to the abort event on `controller.signal` in the `write()` method in the stream.-->

The `WritableStream` controller provides a signal property that works just like any other AbortSignal. Calling `writer.abort()` triggers the abort event on this signal, allowing for clean stream cancellation.

## Abort error handling

<!--Every abort event is accompanied with the reason for that abort. That yields even more customizability as you can react to different abort reasons differently.-->

Each abort event can carry a custom reason, enabling you to handle different cancellation scenarios in distinct ways.

<!--The abort reason is an optional argument to the `controller.abort()` method. You can access the abort reason in the `reason` property of any `AbortSignal` instance.-->

You can provide an optional abort  reason when calling `controller.abort()`, and later access it through the signal's `reason` property to determine why the operation was cancelled.

```javascript
const controller = new AbortController()

controller.signal.addEventListener("abort", () => {
  console.log(controller.signal.reason) // "user cancellation"
})

// Provide a custom reason to this abort.
controller.abort("user cancellation")
```

The `reason` argument can be any JavaScript value so you can pass strings, errors, or even objects.

Ref: [MDN AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)