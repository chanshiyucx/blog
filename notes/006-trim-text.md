---
title: Trim Text
date: 2025-01-07 14:14:50
tags:
  - TypeScript/String
---
Many text truncation implementations often cut words abruptly in the middle, resulting in poor readability. The code below offers an elegant solution by ensuring the truncation occurs at word boundaries and adds ellipsis appropriately. It returns a tuple containing both the processed text and a flag indicating whether truncation was performed.

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
