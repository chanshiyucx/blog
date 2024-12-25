---
title: Match Chinese Characters
date: 2024-12-25 15:39:53
tags:
  - Web/JavaScript
  - JavaScript/RegExp
---
When you need to detect if a string contains Chinese characters, you would commonly think about doing it will RegExp, or grab a ready-to-use package on npm.

Fortunately, I found [a much simpler solution](https://stackoverflow.com/a/61151122) today:

```typescript
/\p{Script=Han}/u
```

```typescript
!!'你好'.match(/\p{Script=Han}/u) // true
```

It's called [Unicode property escapes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Unicode_Property_Escapes) and already available in [Chrome 64, Firefox 78, Safari 11.1 and Node.js 10](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Unicode_character_class_escape#browser_compatibility).

Ref:
- [Unicode character class escape](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Unicode_character_class_escape)
- [Unicode Regular Expressions](https://www.regular-expressions.info/unicode.html)
