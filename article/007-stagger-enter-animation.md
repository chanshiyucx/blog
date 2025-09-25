---
title: Stagger Enter Animation
date: 2025-09-25 20:17:45
tags:
  - CSS/Animation
---

Recently I was redesigning my blog, I added stagger enter animations to all pages using Framer Motion.

A stagger animation makes child elements animate one after another with a delay. Instead of all animating at once, each element appears in sequence, creating a smooth, rhythmic effect.

While looking for blog design inspiration, I noticed that [Paco Coursey](https://paco.me/) blog and the [Rosé Pine](https://rosepinetheme.com/) official website had much smoother stagger enter animations. So I dove into their source code to see how they implemented it.

## How It Works

After studying the source code, I found the implementation is pretty simple. The core idea is using CSS variables and animation delays to control when each element enters.

```css
[data-animate] {
    --stagger: 0;
    --delay: 120ms;
    --start: 0ms;
    animation: enter 0.6s both;
    animation-delay: calc(var(--stagger) * var(--delay) + var(--start));
}

@keyframes enter {
    0% {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: none;
    }
}
```

Then in HTML, you use it like this:

```html
<p style="--stagger: 1" data-animate>Hello, I'm Shiyu.</p>
<p style="--stagger: 2" data-animate>A curious soul with big dreams.</p>
<p style="--stagger: 3" data-animate>Full-Stack Developer</p>
```

The core principle is calculating different delay times for each element. Each element has a `--stagger` value representing its position in the sequence. When multiplied by a fixed delay interval, elements play their enter and upward slide animations in order.

Since this approach uses native CSS animations, it performs much better and feels smoother than Framer Motion's stagger animations. I immediately switched to this native solution.

## Automation Approach

While implementing the new animations, I realized that manually adding `data-animate` and setting `--stagger` values for every element was a real pain. It gets even worse when you need to add animations to content rendered by third-party components, like MDX components, which requires invasive modifications. So I started looking for simpler automation approaches.

My first thought was `CSS Counters`, which can automatically increment variables based on usage count, achieving auto-incrementing `--stagger` values that can even work across element hierarchies—similar to how Framer Motion works.

But reality hit hard. As of now, variables defined by `CSS Counters` can't participate in `calc()` method calculations because counter values are treated as string types and can't be used in mathematical operations.

Just when I was about to give up, I discovered the `sibling-index()` function in a [GitHub issue](https://github.com/w3c/csswg-drafts/issues/1026). It returns the current element's index within its parent element, and this value can directly participate in mathematical operations.

This allows the code above to be greatly simplified:

```css

.animate-auto {
	--delay: 120ms;
	--start: 0ms;
}

.animate-auto > p {
	--stagger: sibling-index();
	animation: enter 0.6s both;
	animation-delay: calc(var(--stagger) * var(--delay) + var(--start));
}
```

All you have to do is add `animate-auto` to the parent element, and all child elements automatically get the animation effect. The only limitation is that it can only calculate sibling element indices, so it can't add animations across hierarchical levels. But I'm already quite satisfied with the current effect—what more could I ask for?

If you also want to add this kind of smooth stagger animation to your website, give this approach a try!
