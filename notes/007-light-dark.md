---
title: Light Dark
date: 2025-01-24 16:17:27
tags:
  - Web/CSS
---
Most modern operating systems let us control the preferred color theme. Luckily for us web developers, you can simply adjust the look of our sites by using the `light-dark()` function.

This function allows you to define two colors for a property, in which your browser automatically show the appropriate value based on your preferences.

To enable support for the `light-dark()` color function, the `color-scheme` must have a value of `light dark`, usually set on the `:root` pseudo-class.

```css
:root {
  color-scheme: light dark;
}
  
body {
  --color-base: light-dark(hsl(32deg 57% 95%), hsl(249deg 22% 12%));
  --color-surface: light-dark(hsl(35deg 100% 98%), hsl(247deg 23% 15%));
  --color-overlay: light-dark(hsl(33deg 43% 91%), hsl(248deg 25% 18%));
}
```

Ref: [light-dark()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark)
