# Position 定位

> 本文为个人学习摘要笔记。  
> 原文地址：[CSS 定位详解](http://www.ruanyifeng.com/blog/2019/11/css-position.html)

position 属性用来指定一个元素在网页上的位置，一共有 5 种定位方式：

- static
- relative
- fixed
- absolute
- sticky

## static

`static` 是 position 属性的默认值。如果省略 position 属性，浏览器就认为该元素是 `static` 定位。

这时，浏览器会按照源码的顺序，决定每个元素的位置，这称为"正常的页面流"（normal flow）。每个块级元素占据自己的区块（block），元素与元素之间不产生重叠，这个位置就是元素的默认位置。

注意：**`static` 定位所导致的元素位置，是浏览器自主决定的，所以这时 top、bottom、left、right 这四个属性无效**。

![static](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/Position-定位/static.jpg)

## relative，absolute，fixed

`relative`、`absolute`、`fixed` 这三个属性值有一个共同点，都是相对于某个基点的定位，不同之处仅仅在于基点不同。

这三种定位都不会对其他元素的位置产生影响，因此元素之间可能产生重叠。

### relative

`relative` 表示，相对于默认位置（即 `static` 时的位置）进行偏移，即定位基点是元素的默认位置。

![relative](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/Position-定位/relative.jpg)

**`relative` 定位必须搭配 top、bottom、left、right 这四个属性一起使用，用来指定偏移的方向和距离。**

![relative](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/Position-定位/relative1.jpg)

```css
div {
  position: relative;
  top: 20px;
}
```

代码中，div 元素从默认位置向下偏移 20px（即距离顶部 20px）。

### absolute

`absolute` 表示，相对于上级元素（一般是父元素）进行偏移，即定位基点是父元素。

它有一个重要的限制条件：定位基点（一般是父元素）不能是 `static` 定位，否则定位基点就会变成整个网页的根元素 html。

**`absolute` 定位也必须搭配 top、bottom、left、right 这四个属性一起使用。**

![absolute](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/Position-定位/absolute.jpg)

```css
#father {
  positon: relative;
}
#son {
  position: absolute;
  top: 20px;
}
```

上面代码中，父元素是 `relative` 定位，子元素是 `absolute` 定位，所以子元素的定位基点是父元素，相对于父元素的顶部向下偏移 20px。如果父元素是 `static` 定位，上例的子元素就是距离网页的顶部向下偏移 20px。

`注意，absolute` 定位的元素会被"正常页面流"忽略，即在"正常页面流"中，该元素所占空间为零，周边元素不受影响。

### fixed

`fixed` 表示，相对于视口（viewport，浏览器窗口）进行偏移，即定位基点是浏览器窗口。这会导致元素的位置不随页面滚动而变化，好像固定在网页上一样。

![fixed](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/Position-定位/fixed.jpg)

**它如果搭配 top、bottom、left、right 这四个属性一起使用，表示元素的初始位置是基于视口计算的，否则初始位置就是元素的默认位置。**

```css
div {
  position: fixed;
  top: 0;
}
```

上面代码中，div 元素始终在视口顶部，不随网页滚动而变化。

### sticky

`sticky` 跟前面四个属性值都不一样，它会产生动态效果，很像 `relative` 和 `fixed` 的结合：一些时候是 `relative` 定位（定位基点是自身默认位置），另一些时候自动变成 `fixed` 定位（定位基点是视口）。

**`sticky` 生效的前提是，必须搭配 top、bottom、left、right 这四个属性一起使用，不能省略，否则等同于 `relative` 定位，不产生"动态固定"的效果。**原因是这四个属性用来定义"偏移距离"，浏览器把它当作 `sticky` 的生效门槛。

它的具体规则是，当页面滚动，父元素开始脱离视口时（即部分不可见），只要与 `sticky` 元素的距离达到生效门槛，`relative` 定位自动切换为 `fixed` 定位；等到父元素完全脱离视口时（即完全不可见），`fixed` 定位自动切换回 `relative` 定位。

请看下面的示例代码。（注意，除了已被淘汰的 IE 以外，其他浏览器目前都支持 `sticky`。但是，Safari 浏览器需要加上浏览器前缀-webkit-。）

```css
#toolbar {
  position: -webkit-sticky; /* safari 浏览器 */
  position: sticky; /* 其他浏览器 */
  top: 20px;
}
```

上面代码中，页面向下滚动时，`#toolbar` 的父元素开始脱离视口，一旦视口的顶部与 `#toolbar` 的距离小于 20px（门槛值），`#toolbar` 就自动变为 `fixed` 定位，保持与视口顶部 20px 的距离。页面继续向下滚动，父元素彻底离开视口（即整个父元素完全不可见），`#toolbar` 恢复成 `relative` 定位。

`sticky` 应用：

```html
<section class="stacking-slide">
  <h2>Section 1</h2>
</section>
<section class="stacking-slide">
  <h2>Section 2</h2>
</section>
<section class="stacking-slide">
  <h2>Section 3</h2>
</section>
<section class="stacking-slide">
  <h2>Section 4</h2>
</section>
<section class="stacking-slide">
  <h2>Section 5</h2>
</section>
```

```css
.stacking-slide {
  height: 100vh;
  width: 100%;
  position: sticky;
  top: 0;
}
```

![scroll-gif](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/Position-定位/scroll-gif.gif)
