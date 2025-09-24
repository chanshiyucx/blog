---
title: Light Dark
date: 2025-09-06 09:22:27
tags:
  - CSS/Effects
---

## Description

Uses the `light-dark()` CSS function to automatically switch between light and dark color values based on the user's system preference or color scheme setting. This modern CSS feature eliminates the need for complex media queries when implementing dark mode support.

## Syntax

```css
/* Named color values */
color: light-dark(black, white);

/* RGB color values */
color: light-dark(rgb(0 0 0), rgb(255 255 255));

/* Custom properties */
color: light-dark(var(--light), var(--dark));
```

## Usage

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
