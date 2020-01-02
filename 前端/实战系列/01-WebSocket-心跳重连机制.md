# WebSocket 心跳重连机制

WebSocket 是一种网络通信协议，它使得客户端和服务器之间的数据交换变得更加简单。最近在项目中使用 WebSocket 实现了一个简单在线聊天室功能，在此探究下心跳重连的机制。

## WebSocket

WebSocket 允许服务端主动向客户端推送数据。之前很多网站为了实现推送技术，采用的技术都是轮询，不仅效率低，也浪费了很多带宽等资源。HTML5 定义了 WebSocket 协议，能更好的节省服务器资源和带宽，并且能够更实时地进行通讯。

WebSocket 的优势：

- 较少的控制开销
- 更强的实时性
- 保持连接状态
- 更好的二进制支持
- 可以支持扩展
- 更好的压缩效果

WebSocket 最大的优势就是能够保持前后端消息的长连接，但是在某些情况下，长连接失效并不会得到及时的反馈，前端并不知道连接已断开。例如用户网络断开，并不会触发 websocket 的任何事件函数，这个时候如果发送消息，消息便无法发送出去，浏览器会立刻或者一定短时间后（不同浏览器或者浏览器版本可能表现不同）触发 onclose 函数。

为了避免这种情况，保证连接的稳定性，前端需要进行一定的优化处理，一般采用的方案就是心跳重连。前后端约定，前端按一定间隔发送一个心跳包，后端接收到心跳包后返回一个响应包，告知前端连接正常。如果一定时间内未接收到消息，则认为连接断开，前端进行重连。

## 心跳重连

通过以上分析，可以得到实现心跳重连的关键是按时发送心跳消息和检测响应消息并判断是否进行重连，所以首先设置 4 个小目标：

- 可以按一定间隔发送心跳包
- 连接错误或者关闭时能够自动重连
- 若在一定时间间隔内未接收消息，则视为断连，自动进行重连
- 可以自定义心跳消息并设置最大重连次数

### 0x01 初始化

为了方便复用，这里决定将 WebSocket 管理封装为一个工具类 WebsocketHB，通过传入配置对象来自定义心跳重连机制。

```javascript
class WebsocketHB {
  constructor({
    url, // 连接客户端地址
    pingTimeout = 8000, // 发送心跳包间隔，默认 8000 毫秒
    pongTimeout = 15000, // 最长未接收消息的间隔，默认 15000 毫秒
    reconnectTimeout = 4000, // 每次重连间隔
    reconnectLimit = 15, // 最大重连次数
    pingMsg // 心跳包的消息内容
  }) {
    // 初始化配置
    this.url = url
    this.pingTimeout = pingTimeout
    this.pongTimeout = pongTimeout
    this.reconnectTimeout = reconnectTimeout
    this.reconnectLimit = reconnectLimit
    this.pingMsg = pingMsg

    this.ws = null
    this.createWebSocket()
  }

  // 创建 WS
  createWebSocket() {
    try {
      this.ws = new WebSocket(this.url)
      this.ws.onclose = () => {
        this.onclose()
      }
      this.ws.onerror = () => {
        this.onerror()
      }
      this.ws.onopen = () => {
        this.onopen()
      }
      this.ws.onmessage = event => {
        this.onmessage(event)
      }
    } catch (error) {
      console.error('websocket 连接失败!', error)
      throw error
    }
  }

  // 发送消息
  send(msg) {
    this.ws.send(msg)
  }
}
```

食用方式：

```javascript
const ws = new WebsocketHB({
  url: 'ws://xxx'
})

ws.onopen = () => {
  console.log('connect success')
}
ws.onmessage = e => {
  console.log(`onmessage: ${e.data}`)
}
ws.onerror = () => {
  console.log('connect onerror')
}
ws.onclose = () => {
  console.log('connect onclose')
}
ws.send('Hello, chanshiyu!')
```

### 0x02 发送心跳包与重连

这里使用 `setTimeout` 模拟 `setInterval` 定时发送心跳包，避免定时器队列阻塞，并且限制最大重连次数。需要注意的是每次进行重连时加锁，避免进行无效重连，同时在每次接收消息时，清除最长间隔消息重连定时器，能接收消息说明连接正常，不需要重连。

```javascript
class WebsocketHB {
  constructor() {
    // ...
    // 实例变量
    this.ws = null
    this.pingTimer = null // 心跳包定时器
    this.pongTimer = null // 接收消息定时器
    this.reconnectTimer = null // 重连定时器
    this.reconnectCount = 0 // 当前的重连次数
    this.lockReconnect = false // 锁定重连
    this.lockReconnectTask = false // 锁定重连任务队列

    this.createWebSocket()
  }

  createWebSocket() {
    // ...
    this.ws = new WebSocket(this.url)
    this.ws.onclose = () => {
      this.onclose()
      this.readyReconnect()
    }
    this.ws.onerror = () => {
      this.onerror()
      this.readyReconnect()
    }
    this.ws.onopen = () => {
      this.onopen()

      this.clearAllTimer()
      this.heartBeat()
      this.reconnectCount = 0
      // 解锁，可以重连
      this.lockReconnect = false
    }
    this.ws.onmessage = event => {
      this.onmessage(event)

      // 超时定时器
      clearTimeout(this.pongTimer)
      this.pongTimer = setTimeout(() => {
        this.readyReconnect()
      }, this.pongTimeout)
    }
  }

  // 发送心跳包
  heartBeat() {
    this.pingTimer = setTimeout(() => {
      this.send(this.pingMsg)
      this.heartBeat()
    }, this.pingTimeout)
  }

  // 准备重连
  readyReconnect() {
    // 避免循环重连，当一个重连任务进行时，不进行重连
    if (this.lockReconnectTask) return
    this.lockReconnectTask = true
    this.clearAllTimer()
    this.reconnect()
  }

  // 重连
  reconnect() {
    if (this.lockReconnect) return
    if (this.reconnectCount > this.reconnectLimit) return

    // 加锁，禁止重连
    this.lockReconnect = true
    this.reconnectCount += 1
    this.createWebSocket()
    this.reconnectTimer = setTimeout(() => {
      // 解锁，可以重连
      this.lockReconnect = false
      this.reconnect()
    }, this.reconnectTimeout)
  }}

  // 清空所有定时器
  clearAllTimer() {
    clearTimeout(this.pingTimer)
    clearTimeout(this.pongTimer)
    clearTimeout(this.reconnectTimer)
  }
}
```

### 0x03 实例销毁

最后给工具类加一个销毁方法，在实例销毁的时候设置一个禁止重连锁，避免销毁的时候还在尝试重连，并且清空所有定时器，关闭长连接。

```javascript
class WebsocketHB {
  // 重连
  reconnect() {
    if (this.forbidReconnect) return
    //...
  }

  // 销毁 ws
  destroyed() {
    // 如果手动关闭连接，不再重连
    this.forbidReconnect = true
    this.clearAllTimer()
    this.ws && this.ws.close()
  }
}
```

## 封装 npm 包

到这里，WebSocket 工具类心跳重连功能基本封装完成，可以尝试开始食用。这里将最终完成代码上传到 Github，详见 [websocket-heartbeat](https://github.com/chanshiyucx/websocket-heartbeat)。并将其封装上传到 npm 以便今后在项目中使用, 有兴趣可以尝试一下 [websockethb](https://www.npmjs.com/package/websockethb) 。

### 安装

```bash
npm install websockethb
```

### 引入与使用

```javascript
import WebsocketHB from 'websockethb'

const ws = new WebsocketHB({
  url: 'ws://xxx'
})

ws.onopen = () => {
  console.log('connect success')
}
ws.onmessage = e => {
  console.log(`onmessage: ${e.data}`)
}
ws.onerror = () => {
  console.log('connect onerror')
}
ws.onclose = () => {
  console.log('connect onclose')
}
```

### 属性

| 属性             | 必填  | 类型   | 默认值      | 描述                                  |
| :--------------- | :---- | :----- | :---------- | :------------------------------------ |
| url              | true  | string | none        | websocket 服务端接口地址              |
| pingTimeout      | false | number | 8000        | 心跳包发送间隔                        |
| pongTimeout      | false | number | 15000       | 15 秒内没收到后端消息便会认为连接断开 |
| reconnectTimeout | false | number | 4000        | 尝试重连的间隔时间                    |
| reconnectLimit   | false | number | 15          | 重连尝试次数                          |
| pingMsg          | false | string | "heartbeat" | 心跳包消息                            |

```javascript
const opts = {
  url: 'ws://xxx',
  pingTimeout: 8000, // 发送心跳包间隔，默认 8000 毫秒
  pongTimeout: 15000, // 最长未接收消息的间隔，默认 15000 毫秒
  reconnectTimeout: 4000, // 每次重连间隔
  reconnectLimit: 15, // 最大重连次数
  pingMsg: 'heartbeat' // 心跳包的消息内容
}
const ws = new WebsocketHB(opts)
```

### 发送消息

```javascript
ws.send('Hello World')
```

### 断开连接

```javascript
ws.destroyed()
```

Just enjoy it ฅ●ω●ฅ
