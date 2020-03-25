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

那么又如何获取 channel/group chat id 呢，stackoverflow 有个回答 [Telegram Bot - how to get a group chat id?](https://stackoverflow.com/questions/32423837/telegram-bot-how-to-get-a-group-chat-id)

In order to get the group chat id, do as follows:

1. Add the Telegram BOT to the group.
2. Get the list of updates for your BOT.
3. Use the "id" of the "chat" object to send your messages.

```
https://api.telegram.org/bot${token}/getUpdates
```

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

## spring 集成

使用 github 开源服务 [java-telegram-bot-api](https://github.com/pengrad/java-telegram-bot-api)。

Java library for interacting with Telegram Bot API

- Full support of all Bot API 4.6 methods
- Telegram Passport and Decryption API
- Bot Payments
- Gaming Platform

### 添加依赖并配置 token

```xml
<dependency>
    <groupId>com.github.pengrad</groupId>
    <artifactId>java-telegram-bot-api</artifactId>
    <version>4.6.0</version>
</dependency>
```

配置 token：

```yml
telegram-bot:
  token: ${your_bot_token}
```

### 注册服务

```java
@Slf4j
@Service
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class TelegramBotService implements UpdatesListener {

    /**
     * token
     */
    @Value("${telegram-bot.token}")
    private String telegramBotToken;

    /**
     * bot
     */
    private TelegramBot bot;

    @Override
    public int process(List<Update> updates) {
        updates.forEach(update -> {
            log.info("机器人收到消息 -> {}", update);
        });
        return UpdatesListener.CONFIRMED_UPDATES_ALL;
    }

    public void run() {
        // Create your bot passing the token received from @BotFather
        this.bot = new TelegramBot(this.telegramBotToken);
        // Register for updates
        this.bot.setUpdatesListener(this);
    }

    /**
     * 发送消息
     *
     * @param type   消息类型
     * @param chatId 会话ID
     * @param text   消息内容
     */
    public void sendMessage(Byte type, long chatId, String text) {
        SendResponse response;
        if (type == 1) {
            // 图片
            response = bot.execute(new SendPhoto(chatId, text));
        } else {
            // 文本
            response = bot.execute(new SendMessage(chatId, text));
        }
        log.info("发送消息 -> {}", response);
    }

    public void close() {
        this.bot.removeGetUpdatesListener();
    }

}
```

### 启动机器人

```java
@Component
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class TelegramStartedBootstrap implements ApplicationListener<ContextRefreshedEvent> {

    private final TelegramBotService telegramBotService;

    @Override
    public void onApplicationEvent(ContextRefreshedEvent contextRefreshedEvent) {
        telegramBotService.run();
    }
}
```

![收发消息](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2020/Telegram-电报机器人/收发消息.png)

大功告成，消息发送 OK！之后就可以发挥自己的奇思妙想做一些有趣的事情啦。

Just enjoy it 😃!
