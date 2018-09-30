建站之初为了美化博客主题，采用了大量背景图片，由于动态背景图片渲染占用大量资源，导致页面快速滚动时总感觉一丝卡顿，故网上查阅解决方案对此加以优化，提升用户浏览体验。<!-- more -->

## 调整背景图片

首先调整背景图片 CSS 属性如下：  
调整前：

```css
body {
  background-image: url('...');
  background-repeat: no-repeat;
  background-position: top right;
  background-size: cover;
  background-attachment: fixed;
}
```  

调整后：

```css
body::before {
  content: '';
  position: fixed; /* 代替 background-attachment */
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  will-change: transform; /* 加入 will-change */
  z-index: -1;
  background-image: url('...');
  background-repeat: no-repeat;
  background-position: top right;
  background-size: cover;
}
```  

对比会发现只做了三点调整：

1. 将背景图由原来的 `body` 元素调整到了 `::before` 伪元素；
2. 使用 `position: fixed` 代替 `background-attachment: fixed`；
3. 使用 `will-change` 属性；

调整前后性能对比：  
调整前：  
![样式调整前](https://dn-coding-net-production-pp.qbox.me/53696b96-f525-4d21-81fb-de62dd0d72c5.png)

调整后：
![样式调整后](https://dn-coding-net-production-pp.qbox.me/a35140d0-2da7-4496-8d8b-758c4c353e5a.png)

图中两个曲线图上下分别是帧数 FPS 与 CPU 占用，由图可以发现帧数确实有所提升，CPU 占用也明显降低。

## background-attachment

CSS 属性 `background-attachment` 会导致页面重绘，在 Safari 浏览器上已被禁用。至于原因 [Stack Overflow]((//stackoverflow.com/questions/19045364/fixed-body-background-scrolls-with-the-page-on-ios7)) 上有提到：
> Fixed-backgrounds have huge repaint cost and decimate scrolling performance, which is, I believe, why it was disabled.

所以使用 `position: fixed` 代替 `background-attachment: fixed` 避免了重绘。

## will-change

CSS 属性 `will-change` 可以提前启用 GPU 加速，优化页面的滚动。页面滚动触发大面积绘制的时候，浏览器往往是没有准备的，只能被动使用 CPU 去计算与重绘，由于没有准备无法应付大量渲染，于是出现掉帧和卡顿，而 `will-change` 则会在行为触发之前告知浏览器，让浏览器做好准备处理接下来的绘制。

此属性为 web 开发者提供了一种告知浏览器该元素会有哪些变化的方法，这样浏览器可以在元素属性真正发生变化之前提前做好对应的优化准备工作。这种优化可以将一部分复杂的计算工作提前准备好，使页面的反应更为快速灵敏。`will-change` 属性值有 `auto`、`scroll-position`、`contents` 等。一般常用为 `transform`。具体各属性值效果可以查阅 [MDN will-change](//developer.mozilla.org/zh-CN/docs/Web/CSS/will-change)。

应当注意在 Safari 浏览器上，即使设置了 `background-size: cover;`，背景图也会填充到整个文档容器而不是窗口，就会把背景图扩展到非常大，只能看到一角，调整后直接就修复了这个问题，可谓是一举两得。目前除 IE 和 Edge 外其余主流浏览器都支持此属性，可放心使用。

![Can I use will-change](https://dn-coding-net-production-pp.qbox.me/6fc0b2ed-851f-4997-9003-bef7310c5125.png)

Just enjoy it ฅ●ω●ฅ

参考文章：  
[使用 CSS3 will-change 提高页面滚动、动画等渲染性能](//www.zhangxinxu.com/wordpress/2015/11/css3-will-change-improve-paint/)  
[Fix scrolling performance with CSS will-change property](//www.fourkitchens.com/blog/article/fix-scrolling-performance-css-will-change-property/)
<!--stackedit_data:
eyJoaXN0b3J5IjpbLTEwOTA1NTQ3MDZdfQ==
-->