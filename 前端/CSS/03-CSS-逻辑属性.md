## [CSS 逻辑属性](https://www.zhangxinxu.com/wordpress/2022/12/css-logic-property-for-write/)

所谓逻辑属性，指的是诸如类似 margin-inline-start，padding-block-end 这类包含 inline/block 和 start/end 关键字的 CSS 属性。

**其中 inline 和 block 表示方向， start 和 end 表示起止方位。**在中文和英文网页环境中，inline 元素默认是从左往右水平排列的；block 元素默认是从上往下垂直排列的。因此，margin-inline-start 就表示内联元素排列方向的起始位置，就是“左侧”，margin-inline-end 就表示内联元素排列方向的终止位置，就是“右侧”。

margin：

```css
/* 四方位 */
margin-top
margin-right
margin-bottom
margin-left

/* 水平与垂直 */
margin-inline
margin-block
```

border-block：样式布局同时设置上下边框的场景

```css
/* 过去 1 */
border: solid #ddd;
border-width: 1px 0;

/* 过去 2 */
border-top: 1px solid #ddd;
border-bottom: 1px solid #ddd;

/* 现在 */
border-block: 1px solid #ddd;
```

inset 及其相关属性是 left/top/right/bottom 属性的缩写。一种全局覆盖层的情景如下：

```css
/* 过去 */
.overlay {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
}

/* 现在 */
.overlay {
  position: fixed;
  inset: 0;
}
```

如果是水平方向的拉伸，则也不需要 left: 0; right: 0，可以使用 inset-inline 属性进行设置：

```css
.header-bar {
  inset-inline: 0;
}
```

CSS 逻辑属性的兼容性已经可以放心使用。
