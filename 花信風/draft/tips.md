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

## image beacon

这种采用 1x1 像素半透明 gif 图片进行数据埋点的方式叫做 **image beacon**。主要应用于只需要向服务器发送数据（日志数据）的场合，且无需服务器有消息体回应。比如收集访问者的统计信息。

Image Beacon 的优势：

- 没有跨域问题（排除 ajax）
- 执行过程无阻塞，只要 new Image 对象（排除 JS/CSS 文件资源方式上报）
- 在所有图片中，体积最小（比较 PNG/JPG）
- 图片请求不占用 Ajax 请求限额
- 服务器不需要做出消息体响应

> GIF 的最低合法体积最小（最小的 BMP 文件需要 74 个字节，PNG 需要 67 个字节，而合法的 GIF，只需要 43 个字节）

```javascript
const href = location.href
const referringPage = document.referrer ? document.referrer : 'none'
const beacon = new Image()
beacon.src =
  'http://www.example.com/logger/beacon.gif?page=' + encodeURI(href) + '&ref=' + encodeURI(referringPage)
```

参考文章：  
[为什么通常在发送数据埋点请求的时候使用的是 1x1 像素的透明 gif 图片？](https://github.com/Advanced-Frontend/Daily-Interview-Question/issues/87)

## 字符串数组排序

```javascript
const list = ['chan', 'shi', 'yu', 'hello', 'world']
list.sort((a, b) => {
  return a.localeCompare(b)
})
//  ["chan", "hello", "shi", "world", "yu"]
```
