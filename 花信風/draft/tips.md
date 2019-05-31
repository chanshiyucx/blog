## 分割字符串

将字符串按指定长度分割：

```javascript
const str = '12345678901234567890123456789'
const strArr = str.replace(/(.{6})/g, '$1,').split(',')
// ["123456", "789012", "345678", "901234", "56789"]
```

## 高阶函数判断数据类型

```javascript
const isType = type => target => Object.prototype.toString.call(target) === `[object ${type}]`

isType('Array')([])
isType('String')('123')
isType('Number')(123)
```
