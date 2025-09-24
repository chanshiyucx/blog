---
title: Convert String to Html
date: 2025-09-06 08:51:04
tags:
  - JavaScript/DOM
references:
  - https://dev.to/melvin2016/how-to-convert-an-html-string-into-real-html-or-dom-using-javascript-5992
---

## Description

Converts an HTML string into real HTML DOM elements using the `DOMParser` Web API. This function safely parses HTML strings and returns the first element from the parsed content, with proper error handling for malformed HTML.

## Code

```typescript
const convertStringToHTML = (htmlString: string): Element | null => {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlString, "text/html")

    const parseError = doc.querySelector("parsererror")
    if (parseError) {
      throw new Error("HTML parsing failed")
    }

    const element = doc.body.firstElementChild
    return element
  } catch (error) {
    throw new Error(`Failed to convert HTML string: ${error.message}`)
  }
}
```

## Usage

```typescript
const htmlString = '<div class="card"><h2>Title</h2><p>Content</p></div>'
const element = convertStringToHTML(htmlString)

if (element) {
  document.body.appendChild(element)
}
```
