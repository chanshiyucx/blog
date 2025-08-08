---
title: Is Valid Color
date: 2025-08-08 13:28:38
tags:
  - Web/TypeScript
---
The `CSS.supports()` static method returns a boolean value indicating if the browser supports a given CSS feature, or not. We can use it to verify if a color value is valid.

Strings like `unset`, `initial`, `inherit`, `currentcolor`, `transparent` are also valid values, so if you want to exclude these strings, just change the function a bit:

```typescript
const isValidColor = (color: string): boolean => {
  const trimmedColor = color.trim()
  if (!trimmedColor) return false

  const SPECIAL_COLORS = /^(unset|initial|inherit|currentcolor|transparent)$/i
  if (SPECIAL_COLORS.test(trimmedColor)) return false

  return CSS.supports('color', trimmedColor)
}

console.log(isValidColor('red')) // true
console.log(isValidColor('#FF5733')) // true
console.log(isValidColor('rgba(0,0,0,0.5)')) // true
console.log(isValidColor('   #FFF ')) // true 
console.log(isValidColor('invalid-color')) // false
console.log(isValidColor('#12345')) // false
console.log(isValidColor('inherit')) // false 
console.log(isValidColor('transparent')) // false 
```

Ref: [CSS: supports() static method](https://developer.mozilla.org/en-US/docs/Web/API/CSS/supports_static)
