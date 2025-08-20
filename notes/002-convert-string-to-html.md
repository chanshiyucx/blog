---
title: Convert String to Html
date: 2024-12-20 15:46:45
tags:
  - Web/HTML
---
To convert an HTML string into real HTML or DOM, we can use the `DOMParser` Web API using JavaScript. The `DOMParser` helps us to parse HTML or XML string into real Document or DOM nodes.

```typescript {3-4}
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

There are other mime types we can use such as:
- `text/html`
- `text/xml`
- `application/xml`
- `application/xhtml+xml`
- `image/svg+xml`

Ref:
- [How to convert an HTML string into real HTML or DOM using JavaScript?](https://dev.to/melvin2016/how-to-convert-an-html-string-into-real-html-or-dom-using-javascript-5992)
- [DOMParser: parseFromString() method](https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString)
