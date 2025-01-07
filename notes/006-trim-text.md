---
title: Trim Text
date: 2025-01-07 14:14:50
tags:
  - TypeScript/String
---
A lot of bad text trimming code around usually cuts off a word mid-way through, which just looks bad. This code below aligns the ellipses with the start and end of words. It returns a tuple. This approach can obviously be used in any language.

```typescript
const trimText = (
  input: string,
  length: number = 80,
): [text: string, trimmed: boolean] => {
  const trimmed = input.length >= length
  const text = trimmed
    ? `${input.slice(0, input.lastIndexOf(' ', length))}…`
    : input

  return [text, trimmed]
}

trimText(
  'This is some trimmed text that will not cut off half way through a word.',
  35,
)
// => ['This is some trimmed text that will…', true]
```

Ref: [trimText](https://www.lloydatkinson.net/notes/3/)
