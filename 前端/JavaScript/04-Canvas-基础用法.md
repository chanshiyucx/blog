# Canvas 基础用法

## 基础用法

### 属性介绍

`<canvas>` 标签只有两个可选的属性 `width` 和 `height`。当没有设置宽度和高度的时候，canvas 会初始化宽度为 300 像素和高度为 150 像素。宽高属性会自动忽略单位，以像素展示，所以使用 em 或 rem 等单位无效。

在视觉表现上，CSS 的宽高属性权重要高于 `<canvas>` 标签的宽高权重。可以将 `<canvas>` 看作 `<img>` 元素，主要区别是 `<canvas>` 的等比例特性是强制的，会忽略 HTML 属性的设置，但 `<img>` 不会。

```markup
<img src="1.jpg" width="300" height="150" style="height:100px;" />
<canvas width="300" height="150" style="height:100px;"></canvas>
```

如上代码所示，此时 `<img>` 宽度不会随高度缩放，最终以 `300x100` 尺寸显示，而 `<canvas>` 宽度会按高度等比例缩放，以 `200x100` 尺寸显示。

需要注意：在使用 Canvas API 绘制图像时，是以 HTML 的宽高属性为原点，与 CSS 属性无关。

可以在 `<canvas>` 标签中提供替换内容。不支持的浏览器将会忽略容器并在其中渲染后备内容。

```markup
<canvas width="150" height="150">
  你的浏览器不支持 canvas，请升级你的浏览器
</canvas>
```

### 渲染上下文

`<canvas>` 标签创建画布，并公开渲染上下文（The rendering context），用来绘制内容。使用方法 `getContext()` 可以获取渲染上下文对象，该方法接受一个参数表示上下文格式，一般传入 `2d`，当然还有 `3d` 模式，这里不细谈。

```javascript
const canvas = document.getElementById('yoo')
const ctx = canvas.getContext('2d')
```

### 绘制图形

#### 绘制矩形

原生 canvas 只支持一种图形绘制：矩形。所有其他的图形的绘制都至少需要生成一条路径。canvas 提供了三种方法绘制矩形：

- `fillRect(x, y, width, height)`： 绘制一个填充矩形
- `strokeRect(x, y, width, height)`： 绘制一个矩形边框
- `clearRect(x, y, width, height)`： 清除指定矩形区域，使之变透明

三种方式示例如下：

```javascript
ctx.fillStyle = '#fb618d'
ctx.fillRect(50, 50, 200, 200)
ctx.clearRect(70, 70, 160, 160)
ctx.strokeRect(90, 90, 120, 120)
```

![三种方式绘制矩形](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/Canvas-基础用法/三种方式绘制矩形.png)

#### 绘制路径

图形的基本元素是路径，使用路径绘制图形的步骤如下：

1. 创建路径起始点
2. 画出路径
3. 将路径封闭
4. 描边或填充路径区域

整个步骤需要使用一下函数：

1. `beginPath()`：新建一条新路径
2. `closePath()`：闭合路径
3. `stroke()`：通过线条来绘制图形轮廓
4. `fill()`：通过填充路径的内容区域生成实心图形
5. `moveTo(x, y)`：移动笔触到指定坐标
6. `lineTo(x, y)`：绘制一条从当前位置到指定坐标的直线
7. `arc(x, y, radius, startAngle, endAngle, anticlockwise)`：绘制圆弧，`anticlockwise` 为 true 时逆时针，默认为顺时针。

当 canvas 初始化或者 `beginPath()` 调用后，通常会使用 `moveTo()` 函数设置起点。或者使用该方法绘制不连续的路径。

示例 1：绘制三角形

```javascript
// 填充三角形
ctx.beginPath()
ctx.moveTo(40, 40)
ctx.lineTo(220, 40)
ctx.lineTo(40, 220)
ctx.fill()

// 描边三角形
ctx.beginPath()
ctx.moveTo(260, 260)
ctx.lineTo(260, 80)
ctx.lineTo(80, 260)
ctx.closePath()
ctx.stroke()
```

注意到填充三角形和描边三角形有些不同，当路径使用填充 `fill()` 时会自动闭合，而使用描边 `stroke()` 时则不会闭合路径，所以需要调用 `closePath()` 方法。

![绘制三角形](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/Canvas-基础用法/绘制三角形.png)

示例 2：绘制笑脸

```javascript
ctx.beginPath()
ctx.moveTo(260, 150)
ctx.arc(150, 150, 110, 0, Math.PI * 2, true) // 脸
ctx.moveTo(220, 150)
ctx.arc(150, 150, 70, 0, Math.PI, false) // 嘴
ctx.moveTo(120, 110)
ctx.arc(110, 110, 10, 0, Math.PI * 2, false) // 左眼
ctx.moveTo(200, 110)
ctx.arc(190, 110, 10, 0, Math.PI * 2, false) // 右眼
ctx.stroke()
```

![笑脸](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/Canvas-基础用法/笑脸.png)

### 贝塞尔曲线

canvas 里使用二次贝塞尔曲线和三次贝塞尔曲线可以用来绘制复杂的图形。

canvas API `quadraticCurveTo(cp1x, cp1y, x, y)`，用来绘制二次贝塞尔曲线，`cp1x,cp1y` 为控制点，`x,y` 为结束点。

![二次贝塞尔曲线](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/Canvas-基础用法/二次贝塞尔曲线.gif)

canvas API `bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y)`，用来绘制三次贝塞尔曲线，`cp1x,cp1y` 为控制点一，`cp2x,cp2y` 为控制点二，`x,y` 为结束点。

![三次贝塞尔曲线](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/Canvas-基础用法/三次贝塞尔曲线.gif)

关于贝塞尔曲线的使用，这里不再细研究~~（看得头痛）~~，下次如有机会再说。

### Path2D

之前所介绍的 canvas API 都是使用路径和绘画命令来把对象“画”在画布上，不能复用命令。较新的浏览器支持 Path2D 对象，用来缓存或记录绘画命令，这样可以复用路径，简化代码和优化性能。

`Path2D()` 会返回一个新初始化的 Path2D 对象，可能将某一个路径作为变量——创建一个它的副本，或者将一个包含 SVG path 数据的字符串作为变量。

```javascript
new Path2D() // 空的Path对象
new Path2D(path) // 克隆Path对象
new Path2D('M10 10 h 80 v 80 h -80 Z') // 从SVG建立Path对象
```

之前介绍的所有 canvas API 都可以在生成的 Path2D 对象上使用。

```javascript
const rectangle = new Path2D()
rectangle.rect(10, 10, 50, 50)

const circle = new Path2D()
circle.moveTo(125, 35)
circle.arc(100, 35, 25, 0, 2 * Math.PI)

ctx.stroke(rectangle)
ctx.fill(circle)
```
