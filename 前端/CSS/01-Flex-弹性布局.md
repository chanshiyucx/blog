# Flex 弹性布局

Flex（Flexible Box）即为“弹性布局” ，它是一种一维的布局模型。采用 Flex 布局的元素，称为 Flex 容器（flex container）。它的所有子元素自动成为容器成员，称为 Flex 项目（flex item）。

Flex 容器有两根轴线：水平的主轴（main axis）和垂直的交叉轴（cross axis）。主轴的起终点分别为 `main start`和`main end`；交叉轴的起终点分别为`cross start`和`cross end`。项目沿主轴排列，单个项目占据的主轴空间为`main size`，占据的交叉轴空间为`cross size`。

一张图说明 Flex Box 模型：

![Flex Box](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/Flex-弹性布局/flex_box.png)

当前主流浏览器对 Flex 布局都能良好兼容，可以放心使用：

![Can I Use Flex](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/Flex-弹性布局/Can_I_Use_Flex.png)

## 容器的属性

Flex 容器可设置 6 个属性:

- flex-direction：决定主轴的方向
- flex-wrap：子项目是否可换行
- flex-flow：属于 flex-direction 属性和 flex-wrap 属性的简写形式
- justify-content：定义了项目在主轴上的对齐方式
- align-items：定义项目在交叉轴上如何对齐
- align-content：定义了多根轴线的对齐方式

### flex-direction

flex-direction 属性决定主轴的方向，可选值：`row | row-reverse | column | column-reverse`，各值表现如下：

```css
.box {
  flex-direction: row | row-reverse | column | column-reverse;
}
```

![flex-direction](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/Flex-弹性布局/flex-direction.png)

### flex-wrap

flex-wrap 属性定义子项目是否可换行，可选值：`nowrap | wrap | wrap-reverse`，各值表现如下：

```css
.box {
  flex-wrap: nowrap | wrap | wrap-reverse;
}
```

![flex-wrap](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/Flex-弹性布局/flex-wrap.png)

### flex-flow

flex-flow 属性属于 flex-direction 属性和 flex-wrap 属性的简写形式，默认值 `row nowrap`。

### justify-content

justify-content：属性定义了项目在主轴上的对齐方式，可选值：`flex-start | flex-end | center | space-between | space-around`，各值表现如下：

```css
.box {
  justify-content: flex-start | flex-end | center | space-between | space-around;
}
```

![justify-content](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/Flex-弹性布局/justify-content.png)

### align-items

align-items 属性定义项目在交叉轴上如何对齐，可选值 `flex-start | flex-end | center | baseline | stretch`，各值表现如下：

```css
.box {
  align-items: flex-start | flex-end | center | baseline | stretch;
}
```

![align-items](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/Flex-弹性布局/align-items.png)

### align-content

align-content 属性定义多根轴线的对齐方式，如果项目只有一根轴线，该属性不起作用，可选值`flex-start | flex-end | center | space-between | space-around | stretch`，各值表现如下：

```css
.box {
  align-content: flex-start | flex-end | center | space-between | space-around | stretch;
}
```

![align-content](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/Flex-弹性布局/align-content.png)

## 项目的属性

Flex 项目可设置 6 个属性:

- order：定义项目的排列顺序
- flex-grow：定义项目的放大比例
- flex-shrink：定义了项目的缩小比例
- flex-basis：定义了在分配多余空间之前，项目占据的主轴空间
- flex：属于 flex-grow, flex-shrink 和 flex-basis 的简写形式
- align-self：允许单个项目有与其他项目不一样的对齐方式，可覆盖 align-items 属性

### order

order 属性定义项目的排列顺序，数值越小，排列越靠前，默认为 0，具体表现如下：

```css
.item {
  order: 0;
}
```

![order](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/Flex-弹性布局/order.png)

### flex-grow

flex-grow 属性定义项目的放大比例，默认为 0，即如果存在剩余空间，也不放大，具体表现如下：

```css
.item {
  flex-grow: 0;
}
```

![flex-grow](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/Flex-弹性布局/flex-grow.png)

### flex-shrink

flex-shrink 属性定义了项目的缩小比例，默认为 1，即如果空间不足，该项目将缩小，具体表现如下：

```css
.item {
  flex-shrink: 1;
}
```

![flex-shrink](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/Flex-弹性布局/flex-shrink.png)

### flex-basis

flex-basis 属性定义了在分配多余空间之前，项目占据的主轴空间（main size），默认值为 auto，即项目的本来大小，浏览器根据这个属性计算主轴是否有多余空间。

```css
.item {
  flex-basis: auto;
}
```

### flex

flex 属性是 flex-grow, flex-shrink 和 flex-basis 的简写，默认值为 `0 1 auto`，后两个值可选，不设置则为默认值。该属性有两个快捷值：`auto (1 1 auto)` 和 `none (0 0 auto)`。

```css
.item {
  flex: none;
}
```

### align-self

align-self 属性允许单个项目有与其他项目不一样的对齐方式，可覆盖 align-items 属性。默认值为 auto，表示继承父元素的 align-items 属性，如果没有父元素，则等同于 stretch。

![align-self](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/Flex-弹性布局/align-self.png)
