---
title: Stagger Animation
date: 2025-09-25 20:17:45
tags:
  - CSS/Animation
---
在重新设计博客时，我为所有页面添加了 stagger 渐入动画。在 Framer Motion 中，stagger 动画是一种让一组子元素依次带有延迟地播放动画的方式。简单来说，就是当一个容器开始动画时，它内部的子元素不会同时执行动画，而是一个接一个地按设定的时间间隔（stagger delay）触发，从而形成 " 错落有致 " 的动画效果。

然后我在找博客设计灵感时，看到 [Paco Coursey](https://paco.me/) 博客和 [Rosé Pine](https://rosepinetheme.com/) 官方网站的页面 stagger 渐入动画更加丝滑流畅，所以我研究了下它们的源码。

## 实现原理

研究源码后，发现其实实现原理很简单。

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

然后在 HTML 中，使用方法如下：

```html
<p style="--stagger: 1" data-animate>Hello, I'm Shiyu.</p>
<p style="--stagger: 2" data-animate>A curious soul with big dreams.</p>
<p style="--stagger: 3" data-animate>Full-Stack Developer</p>
```

TODO: 简单解释下上面的源码，结合源码说一下动画效果。

因为这个方案使用的是 CSS 原生动画，所以体验上比 Framer Motion 的 stagger 动画更加丝滑，我果断拥抱原生方案。

## 简化方案

在改造实施新的动画时我发现，为每个元素添加 `data-animate` 并设置 `--stagger` 其实很繁琐，甚至如果为第三方组件渲染的内容添加动画，比如 MDX 组件，需要破坏性改动，所以我再思考没有没更简单的方案。

与 Framer Motion 的 stagger 动画最相似的就是 `CSS Counters` ，它可以让变量根据使用次数递增，从而实现 `--stagger` 自增，甚至不一定需要为子组件。

但是理想很美好，现实很骨感。到目前为止，`CSS Counters` 定义的变量不能参与 `calc` 方法的计算，因为变量类型为字符串。

就在我要放弃的时候，我在一条 [github issues](https://github.com/w3c/csswg-drafts/issues/1026) 中，发现 `sibling-index()` 函数，该函数返回一个整数，表示当前元素在 DOM 树中相对于其所有同级元素的位置。返回值是上下文子元素在父元素内所有同级元素中的索引号。最重要的是，返回值可以参与 `calc` 计算。

所以上面的代码可以简化如下：

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

效果完美，我们只需要简短为父元素添加 `animate-auto`，所有子元素都会获得动画效果。唯一不足的是，不能跨越层级添加动画，不过现在效果我已经很满意了，还能奢求什么呢？

现在，也可以尝试给你的博客也添加时流畅的渐入阶梯动画吧！
