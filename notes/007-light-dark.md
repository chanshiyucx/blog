---
title: Light Dark
date: 2025-01-24 16:17:27
tags:
  - Web/CSS
---

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
