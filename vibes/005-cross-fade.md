---
title: Cross Fade
date: 2025-01-06 23:30:54
tags:
  - Web/CSS
---
The **`cross-fade()`** CSS function can be used to blend two or more images at a defined transparency.

The `cross-fade()` function takes a list of images with a percentage defining how much of each image is retained in terms of opacity when it is blended with the other images.

```css
cross-fade(url(white.png) 0%, url(black.png) 100%); /* fully black */
cross-fade(url(white.png) 25%, url(black.png) 75%); /* 25% white, 75% black */
cross-fade(url(white.png) 50%, url(black.png) 50%); /* 50% white, 50% black */
cross-fade(url(white.png) 75%, url(black.png) 25%); /* 75% white, 25% black */
cross-fade(url(white.png) 100%, url(black.png) 0%); /* fully white */
cross-fade(url(green.png) 75%, url(red.png) 75%); /* both green and red at 75% */
```

So we can use `cross-fade()` to achieve the background image translucency effect.

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

Ref: [cross-fade()](https://developer.mozilla.org/en-US/docs/Web/CSS/cross-fade)
