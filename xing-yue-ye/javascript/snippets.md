# Snippets

## 001 Fisher–Yates Shuffle 洗牌算法

```javascript
export const shuffle = arr => {
  let i = arr.length
  let j
  while (i) {
    j = Math.floor(Math.random() * i--)
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
```

## 002 数字千分位格式化

```javascript
export const toThousandFilter = num => {
  return (+num || 0).toString().replace(/^-?\d+/g, m => m.replace(/(?=(?!\b)(\d{3})+$)/g, ','))
}
```

## 003 日期格式化

```javascript
export const parseTime = (time, format = '{y}-{m}-{d} {h}:{i}:{s}') => {
  if (arguments.length === 0) return null
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if (typeof time === 'string' && /^[0-9]+$/.test(time)) {
      time = parseInt(time)
    }
    if (typeof time === 'number' && time.toString().length === 10) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') {
      return ['日', '一', '二', '三', '四', '五', '六'][value]
    }
    if (result.length > 0 && value < 10) {
      value = '0' + value
    }
    return value || 0
  })
  return time_str
}
```

## 004 动态加载 JS 文件

```javascript
const loadJS = url => {
  return new Promise(resolve => {
    const recaptchaScript = document.createElement('script')
    recaptchaScript.setAttribute('src', url)
    recaptchaScript.async = true
    recaptchaScript.onload = () => resolve()
    document.head.appendChild(recaptchaScript)
  })
}

const loadAssets = async () => {
  const assets = [
    'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.0/jquery.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js'
  ]

  for (const url of assets) {
    await loadJS(url)
  }
}
```

## 005 动态下载文件

```javascript
export const downloadFile = file => {
  fetch(file.url).then(res =>
    res.blob().then(blob => {
      const a = document.createElement('a')
      const url = window.URL.createObjectURL(blob)
      a.href = url
      a.download = file.name
      a.click()
      window.URL.revokeObjectURL(url)
    })
  )
}
```

## 006 获取文件扩展名

```javascript
export const getFileExt = filename => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2)
}
```

## 007 创建独一无二字符串

```javascript
export const createUniqueString = () => {
  const timestamp = +new Date() + ''
  const randomNum = parseInt((1 + Math.random()) * 65536) + ''
  return (+(randomNum + timestamp)).toString(32)
}
```

## 008 事件绑定与解绑

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

## 009 获取视频时长

```javascript
export const getVideoDuration = () => {
  const fileObj = this.$refs.file.files[0]
  const video = document.createElement('video')
  video.preload = 'metadata'
  video.onloadedmetadata = () => {
    window.URL.revokeObjectURL(video.src)
    const duration = video.duration
  }
  video.src = URL.createObjectURL(fileObj)
}
```

## 010 判断是否重复操作

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
