---
title: Theming My Blog With Rosé Pine
date: 2026-02-13 11:53:12
tags:
  - Web/CSS
---
When I rebuilt my blog theme [Zero](https://github.com/chanshiyucx/zero) from scratch, I went with [Rosé Pine](https://rosepinetheme.com/) as the color scheme. Their design philosophy really resonates with me:

> Something beautiful  
> All natural pine, faux fur and a bit of soho vibes for the classy minimalist.

Natural, restrained, with a touch of warmth—exactly what I was after. I've switched everything over to Rosé Pine now: VSCode, Antigravity, Obsidian, and naturally, my blog.

## The Palette

Rosé Pine uses semantic color naming where each color has a clear purpose:

|Variable|Purpose|
|---|---|
|`base`|Primary background|
|`surface`|Secondary background atop base|
|`overlay`|Tertiary background atop surface|
|`muted`|Low contrast foreground|
|`subtle`|Medium contrast foreground|
|`text`|High contrast foreground|
|`love`|Per favore ama tutti|
|`gold`|Lemon tea on a summer morning|
|`rose`|A beautiful yet cautious blossom|
|`pine`|Fresh winter greenery|
|`foam`|Saltwater tidepools|
|`iris`|Smells of groundedness|

You can find the full color values on their [palette](https://rosepinetheme.com/palette/ingredients/). With this palette, my theme definition stays incredibly clean—one line per color variable, with light and dark modes all in one place:

```css
/* https://rosepinetheme.com/palette/ingredients/ */
:root {
  --color-base: light-dark(hsl(32deg 57% 95%), hsl(246deg, 24%, 17%));
  --color-surface: light-dark(hsl(35deg 100% 98%), hsl(248deg, 24%, 20%));
  --color-overlay: light-dark(hsl(33deg 43% 91%), hsl(248deg, 21%, 26%));
  --color-muted: light-dark(hsl(257deg 9% 61%), hsl(249deg, 12%, 47%));
  --color-subtle: light-dark(hsl(248deg 12% 52%), hsl(248deg, 15%, 61%));
  --color-text: light-dark(hsl(248deg 19% 40%), hsl(245deg, 50%, 91%));
  --color-love: light-dark(hsl(343deg 35% 55%), hsl(343deg, 76%, 68%));
  --color-gold: light-dark(hsl(35deg 81% 56%), hsl(35deg, 88%, 72%));
  --color-rose: light-dark(hsl(3deg 53% 67%), hsl(2deg, 66%, 75%));
  --color-pine: light-dark(hsl(197deg 53% 34%), hsl(197deg, 48%, 47%));
  --color-foam: light-dark(hsl(189deg 30% 48%), hsl(189deg, 43%, 73%));
  --color-iris: light-dark(hsl(268deg 21% 57%), hsl(267deg, 57%, 78%));
}
```

## Theme Switching

The traditional approach to light/dark themes requires media queries or class names, maintaining separate color declarations:

```css
/* The old way: define each variable twice */
:root {
  --color-base: hsl(32deg 57% 95%);
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-base: hsl(246deg 24% 17%);
  }
}
```

This works, but when you have lots of color variables, maintenance becomes a pain.

The `light-dark()` function was introduced in CSS Color Module Level 5. It takes two parameters for light and dark mode values:

```css
/* Basic syntax */
color: light-dark(<light-value>, <dark-value>);

/* Works with various color formats */
color: light-dark(black, white);
color: light-dark(rgb(0 0 0), rgb(255 255 255));
color: light-dark(var(--light), var(--dark));
```

Before using it, you need to declare `color-scheme` to tell the browser which color schemes your page supports:

```css
:root {
  color-scheme: light dark;
}
```

Compared to the traditional approach, `light-dark()` keeps both colors on the same line—less code and the relationship is immediately clear. Since 2024, major browsers have all shipped support, so it's production-ready.

If you look closely, you'll notice my site's favicon uses a gradient from Love to Gold—warm and cozy, which is exactly the feeling I'm going for.
