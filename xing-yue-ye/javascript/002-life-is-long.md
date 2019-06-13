# 002 Life is Long

## 0x01 判断是否重复操作

```javascript
export const isRepeat = (function() {
  const reData = {}
  return function(name = 'default', time = 300) {
    const i = new Date()
    const re = i - (isNaN(reData[name]) ? 0 : reData[name])
    reData[name] = i
    return re <= time
  }
})()
```
