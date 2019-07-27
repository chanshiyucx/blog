# Interview

## 001 页面导入样式时，使用 link 和@import 有什么区别？

1. link 是 HTML 标签，@import 属于 CSS 范畴。
2. link 引入的样式页面加载时同时加载，@import 引入的样式需等页面加载完成后再加载。
3. link 没有兼容性问题，@import 不兼容 ie5 以下。
4. link 可以通过 js 操作 DOM 动态引入样式表改变样式，而 @import 不可以。

## 002 用递归算法实现，数组长度为 5 且元素的随机数在 2-32 间不重复的值

核心是生成随机数算法，`Math.random()` 函数返回一个随机浮点数，浮点数范围为左闭右开区间 `[0, 1)`。

```javascript
function rand(arr = [], length = 5, min = 2, max = 32) {
  if (arr.length < length) {
    const num = Math.floor(Math.random() * (max - min + 1)) + min
    if (!arr.includes(num)) {
      arr.push(num)
    }
    return rand(arr)
  }
  return arr
}
```

## 003 去除字符串中的空格，根据传入不同的类型分别能去掉前、后、前后、中间的空格

算法难点：

1. 通过 `Symbol()` 来生成枚举类型
2. 正则分组去除中间空格

```javascript
const POSITION = Object.freeze({
  left: Symbol(),
  right: Symbol(),
  both: Symbol(),
  center: Symbol(),
  all: Symbol()
})

function trim(str, position = POSITION.both) {
  switch (position) {
    case POSITION.left:
      str = str.replace(/^\s+/, '')
      break
    case POSITION.right:
      str = str.replace(/\s+$/, '')
      break
    case POSITION.both:
      str = str.replace(/^\s+|\s+$/g, '')
      break
    case POSITION.center:
      while (str.match(/\w\s+\w/)) {
        str = str.replace(/(\w)(\s+)(\w)/, '$1$3')
      }
      break
    case POSITION.all:
      str = str.replace(/\s/g, '')
      break
    default:
      break
  }
  return str
}

const str = ' s t r '
const result = trim(str, POSITION.left)
```

## 004 去除字符串中最后一个指定的字符

```javascript
function delLast(str, char) {
  if (!str) return false
  if (!char) return str
  const index = str.lastIndexOf(char)
  return str.substring(0, index) + str.substring(index + 1)
}
```
