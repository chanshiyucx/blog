# 优雅实现 BackTop

BackTop 即滚动到页面顶部，是很多网站都会用到的基础功能，实现方法很多，Github 上也有许多优秀的三方库，如 [smooth-scroll](https://github.com/cferdinandi/smooth-scroll)，但如何优雅实现也是一门学问。

## 事件绑定和解绑

滚动到页面顶部的按钮一般位于页面角落，并且只有在需要的时候才显示出来。所以首先需要监听页面滚动事件，直到滚动到一定距离后显示 BackTop 按钮。

监听页面滚动最简单的实现方式是使用 `addEventListener` 监听 scroll 事件，并在页面卸载时解除监听，代码如下：

```javascript
window.addEventListener('scroll', handleScroll, false)
window.removeEventListener('scroll', handleScroll, false)
```

但既然称为最优雅的实现方式，为了兼任各种浏览器，可以将绑定和解绑事件提取出公共方法，并作兼容优化，代码如下：

```javascript
/**
 * @description 绑定事件 on(element, event, handler)
 */
export const on = (function() {
  if (document.addEventListener) {
    return function(element, event, handler) {
      if (element && event && handler) {
        element.addEventListener(event, handler, false)
      }
    }
  } else {
    return function(element, event, handler) {
      if (element && event && handler) {
        element.attachEvent('on' + event, handler)
      }
    }
  }
})()

/**
 * @description 解绑事件 off(element, event, handler)
 */
export const off = (function() {
  if (document.removeEventListener) {
    return function(element, event, handler) {
      if (element && event) {
        element.removeEventListener(event, handler, false)
      }
    }
  } else {
    return function(element, event, handler) {
      if (element && event) {
        element.detachEvent('on' + event, handler)
      }
    }
  }
})()
```

调用方式：

```javascript
on(window, 'scroll', handleScroll)
off(window, 'scroll', handleScroll)

function handleScroll() {
  console.log(window.pageYOffset)
}
```

## 回到顶部动画

`window.requestAnimationFrame()` 方法请求浏览器在下一次重绘之前调用指定的函数来更新动画。该方法使用一个回调函数作为参数，这个回调函数会在浏览器重绘之前调用。回调的次数通常是每秒 60 次。由于兼容问题，在不同浏览器需要带上前缀，并且在浏览器不支持时使用 setTimeout 模拟。

> requestAnimationFrame 目的是为了让各种网页动画效果（DOM 动画、Canvas 动画、SVG 动画、WebGL 动画）能够有一个统一的刷新机制，从而节省系统资源，提高系统性能，改善视觉效果。

使用 `requestAnimationFrame` 来实现滚动到页面顶部的动画，核心是按帧来滚动小段距离来实现平滑滚动的效果，代码如下：

```javascript
// scrollTop animation
export function scrollTop(el, from = 0, to, duration = 500, endCallback) {
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame =
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function(callback) {
        return window.setTimeout(callback, 1000 / 60)
      }
  }
  const difference = Math.abs(from - to)
  const step = Math.ceil((difference / duration) * 50)

  function scroll(start, end, step) {
    if (start === end) {
      endCallback && endCallback()
      return
    }

    let d = start + step > end ? end : start + step
    if (start > end) {
      d = start - step < end ? end : start - step
    }

    if (el === window) {
      window.scrollTo(d, d)
    } else {
      el.scrollTop = d
    }
    window.requestAnimationFrame(() => scroll(d, end, step))
  }
  scroll(from, to, step)
}
```

调用方式：

```javascript
function backTop() {
  const sTop = document.documentElement.scrollTop || document.body.scrollTop
  scrollTop(window, sTop, 0, 2000)
}
```

扩展：该 API 还提供 `cancelAnimationFrame` 方法用来取消重绘，参数是 `requestAnimationFrame` 返回的一个代表任务 ID 的整数值，使用如下：

```javascript
const requestID = window.requestAnimationFrame(() => scroll(d, end, step))
window.cancelAnimationFrame(requestID)
```

如果不需要考虑浏览器兼容性，在 Chrome、Firefox 浏览器上，`window.scrollTo` 还支持第二种参数形式，传入参数 `options` 是一个包含三个属性的对象：

- top 等同于 y-coord，代表纵轴坐标
- left 等同于 x-coord，代表横轴坐标
- behavior 类型 String，表示滚动行为，支持参数 smooth\(平滑滚动\)，instant\(瞬间滚动\)，默认值 auto，效果等同于 instant

```javascript
window.scrollTo({
  top: 0,
  behavior: 'smooth'
})
```

此方法简单高效，可惜 Edge、IE、Safari 皆不支持。
