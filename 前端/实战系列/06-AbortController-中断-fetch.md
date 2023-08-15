# AbortController 中断 fetch

AbortController 可以用来终止一个或多个 Web 请求。

## 基础用法

```javascript
// 创建 AbortController 的实例
const controller = new AbortController()
const signal = controller.signal

// 监听 abort 事件，在 controller.abort() 执行后执行回调打印
signal.addEventListener('abort', () => {
  console.log(signal.aborted) // true
})

// 触发中断
controller.abort()
```

## 演示

fetch 接受 `AbortSignal` 作为第二个参数的一部分：

```javascript
const controller = new AbortController()
const signal = controller.signal

fetch('https://slowmo.glitch.me/5000', { signal })
  .then((r) => r.json())
  .then((response) => console.log(response))
  .catch((err) => {
    if (err.name === 'AbortError') {
      console.log('Fetch was aborted')
    } else {
      console.log('Error', err)
    }
  })

// 在 2s 后中断请求，将触发 'AbortError'
setTimeout(() => controller.abort(), 2000)
```

## axios 中使用

```javascript
const controller = new AbortController()

axios
  .get('/foo/bar', {
    signal: controller.signal,
  })
  .then(function (response) {
    //...
  })
// 取消当前请求
controller.abort()
```
