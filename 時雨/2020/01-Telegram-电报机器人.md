# Telegram 电报机器人

在木子的博客看到一篇 [VPS 安全加固之用户登陆后向 telegram 发送登录信息](https://blog.502.li/archives/linux-login-alarm-telegram.html)的文章，之前见过公司后端大佬玩过电报机器人，早就跃跃欲试，这次按着教程又解锁了一个新玩具。

Telegram 账号咱早就有了，玩得却不多，其实对于微信、QQ 等众多即时聊天工具咱也很少打开，毕竟平时没事就是个透明人，也没人来找咱聊天，自己也乐得清静。

所以这里直接跳过 telegram 账号注册，直接从注册电报机器人开始。

## 注册 bot

### 1. 搜索 @BotFather 并对话

![@BotFather](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2020/Telegram-电报机器人/@BotFather.png)

### 2. 发送/start 开始会话

![start](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2020/Telegram-电报机器人/start.png)

### 3. 发送/newbot 创建机器人

![newbot](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2020/Telegram-电报机器人/newbot.png)

输入机器人的 `name` 和 `username`，创建完成返回 token，之后发送消息需要用到它。

### 4. 搜索 @GetIDsBot 获取 chat ID

Telegram 中每个用户、频道、群组都会有一个 chat ID，机器人发送消息需要指定 chat ID 来将消息发送到指定用户。

![@GetIDsBot](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2020/Telegram-电报机器人/@GetIDsBot.png)
![chatID](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2020/Telegram-电报机器人/chatID.png)

## 发送消息

机器人注册完成，可以发送消息，官方接口文档参考 [Telegram Bot API](https://core.telegram.org/bots/api)，发送消息参考以下格式：

```
https://api.telegram.org/bot${token}/sendMessage?chat_id=${chat_id}&text=hello
```

通过浏览器或者通过 `curl` 请求这个地址即可发送消息。

```json
{
  "ok": true,
  "result": {
    "message_id": 6,
    "from": {
      "id": 1010000036,
      "is_bot": true,
      "first_name": "chanshiyubot",
      "username": "chanshiyu_bot"
    },
    "chat": {
      "id": 98000006,
      "first_name": "蝉",
      "last_name": "时雨",
      "type": "private"
    },
    "date": 1578035550,
    "text": "text"
  }
}
```

大功告成，消息发送 OK！之后就可以发挥自己的奇思妙想做一些有趣的事情啦。

Just enjoy it 😃!
