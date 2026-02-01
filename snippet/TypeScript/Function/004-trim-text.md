---
title: Trim Text
date: 2025-09-06 09:17:56
tags:
  - Snippet/TypeScript
references:
  - https://www.lloydatkinson.net/notes/3/
---

## Description

Intelligently truncates text at word boundaries to maintain readability. Unlike basic string truncation that cuts words mid-character, this function finds the last complete word within the specified length and adds ellipsis appropriately. Returns both the processed text and a boolean indicating whether truncation occurred.

## Code

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
```

## Usage

```typescript
trimText(
  'This is some trimmed text that will not cut off half way through a word.',
  35,
)
// => ['This is some trimmed text that will…', true]
```
