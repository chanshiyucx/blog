---
title: Is Valid Color
date: 2025-09-05 22:03:38
tags:
  - Snippet/TypeScript
---

## Description

Validates whether a given string is a valid CSS color value. Uses the browser's `CSS: supports()` API to check color validity and provides an option to allow or disallow CSS special values like `inherit`, `transparent`, `currentcolor`, etc.

## Code

```typescript
const isValidColor = (
  color: string,
  allowSpecialValues = true, 
): boolean => {
  const trimmedColor = color.trim()
  if (!trimmedColor) return false

  const SPECIAL_COLORS = /^(unset|initial|inherit|currentcolor|transparent)$/i
  if (SPECIAL_COLORS.test(trimmedColor)) {
    return allowSpecialValues
  }

  return CSS.supports('color', trimmedColor)
}
```

## Usage

This function is useful for validating user input, form validation, or ensuring color values are correct before applying them to CSS properties.

Basic Examples:

```typescript
// Standard color validation
console.log(isValidColor('red'))           // true
console.log(isValidColor('#FF5733'))       // true  
console.log(isValidColor('rgba(0,0,0,0.5)')) // true
console.log(isValidColor('   #FFF   '))    // true 
console.log(isValidColor('invalid-color')) // false
console.log(isValidColor('#12345'))        // false 
```

Special Values Handling:

```typescript
// Allow special CSS values (default behavior)
console.log(isValidColor('transparent'))     // true
console.log(isValidColor('inherit'))         // true
console.log(isValidColor('currentcolor'))    // true

// Disallow special CSS values
console.log(isValidColor('transparent', false))  // false
console.log(isValidColor('inherit', false))      // false
console.log(isValidColor('currentcolor', false)) // false
```
