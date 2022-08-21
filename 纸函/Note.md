## 01 触发自定义事件

```js
window.addEventListener('resize', function () {
  console.log('当前页面缩放比例应该是：' + Math.round(1000 * (outerWidth / innerWidth)) / 10 + '%')
})
window.dispatchEvent(new CustomEvent('resize'))
```
