---
title: Cross Fade
date: 2025-09-06 09:12:12
tags:
  - Snippet/CSS
---

## Description

Uses the `cross-fade()` CSS function to blend two or more images at defined transparency levels. This function allows you to create smooth transitions and overlay effects by specifying opacity percentages for each image in the blend.

## Syntax

```css
cross-fade(url(white.png) 0%, url(black.png) 100%); /* fully black */
cross-fade(url(white.png) 25%, url(black.png) 75%); /* 25% white, 75% black */
cross-fade(url(white.png) 50%, url(black.png) 50%); /* 50% white, 50% black */
cross-fade(url(white.png) 75%, url(black.png) 25%); /* 75% white, 25% black */
cross-fade(url(white.png) 100%, url(black.png) 0%); /* fully white */
cross-fade(url(green.png) 75%, url(red.png) 75%); /* both green and red at 75% */
```

## Usage

This CSS function is useful for creating image blend effects, background opacity control, and smooth transitions between different images without JavaScript.

```css
body {
    --transparent: url(data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==);
    background-size: cover;
    background-image: cross-fade(
        var(--transparent),
        url("./images/bg.jpg"),
        50%
    );
    background-image: -webkit-cross-fade(
        var(--transparent),
        url("./images/bg.jpg"),
        50%
    );
}      
```
