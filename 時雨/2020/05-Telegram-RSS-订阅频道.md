# Telegram RSS 订阅频道

垂涎木子的 Telegram K8S 订阅频道 [RSS Kubernetes](https://t.me/rss_kubernetes) 已经很久了，今天才想起来为何不自己搞一个，在木子的友情帮助下，非常轻松地将服务搭建起来了，特此安利一下。

## 部署

在木子的安利下，发现 Github 已有开源的 Telegram RSS 订阅服务工具了，中文 Telegram RSS 机器人 [RSSBot](https://github.com/iovxw/rssbot/)。同时也有 docker 移植版 [NodeRSSBot](https://github.com/fengkx/NodeRSSBot)。因为更喜欢隔离性更好的 docker 部署方式，所以这里时雨采用的是 NodeRSSBot。

整个订阅流程：

1. 准备一个 Teletram Bot，并将其拉入自建 RSS Channel
2. 获取 Telegram Bot Token
3. 部署 NodeRSSBot，配置上面获取的 Token，启动服务
4. 在 Telegram 中执行订阅命令

前两步可以参考时雨之前的文章 [Telegram 电报机器人](https://chanshiyu.com/#/post/108)，这里不再累述。直接从部署 NodeRSSBot 说起，按照官方 README 文档，先拉取 docker 镜像：

```sh
docker pull fengkx/node_rssbot
```

因为想要更方便地配置参数和启动服务，所以时雨更倾向于使用 docker-compose 启动而不是官方文档推荐的 docker 命令启动。编写一个简易的 docker-compose.yml 文件：

```yml
version: '3.1'

services:
  rssbot:
    image: fengkx/node_rssbot
    container_name: node_rssbot
    restart: always
    volumes:
      - ./data:/app/data/
    ports:
      - 3306:3306
    environment:
      RSSBOT_TOKEN: 123456:ACEYzXbuuaxxxxxxxxxxxxxxtrvmdq8
    networks:
      - my-bridge

networks:
  my-bridge:
    driver: bridge
```

其它一些参数说明：

| 设置项             | 环境变量            | 默认/必填               | 描述                      |
| ------------------ | ------------------- | ----------------------- | ------------------------- |
| token              | RSSBOT_TOKEN        | require                 | telegram bot token        |
| db_path            | RSSBOT_DB_PATH      | data/database.db        | 数据库文件路径            |
| lang               | RSSBOT_LANG         | zh-cn                   | 语言                      |
| item_num           | RSSBOT_ITEM_NUM     | 10                      | 发送最新几条信息          |
| fetch_gap          | RSSBOT_FETCH_GAP    | 5m                      | 抓取间隔                  |
| notify_error_count | NOTIFY_ERR_COUNT    | 5                       | 发出通知的错误次数        |
| view_all           | RSSBOT_VIEW_ALL     | false                   | 是否开启                  |
| UA                 | RSSBOT_UA           | 'Mozilla/5.0 NodeRSSBot | 请求的 user-agent         |
| cocurrency         | RSSBOT_CONCURRENCY  | 200                     |                           |
| proxy.protocool    | PROXY_PROTOCOL      | null                    | 代理协议 http/https/socks |
| proxy.host         | PROXY_HOST          | null                    | 代理地址                  |
| proxy.port         | PROXY_PORT          | null                    | 代理端口                  |
| resptimeout        | RSSBOT_RESP_TIMEOUT | 40(s)                   | proxy port                |

## 订阅

NodeRSSBot 支持的操作命令：

```sh
/rss       - 显示订阅列表，加 `raw`显示链接
/sub       - 订阅 RSS: /sub http://example.com/feed.xml 支持自动检测 RSS feed
/unsub     - 退订 RSS: /unsub http://example.com/feed.xml 或者通过键盘
/unsubthis - 回复一个 RSS 发来的消息退订该 RSS
/allunsub  - 退订所有源
/export    - 导出订阅到opml文件
/viewall   - 查看所有订阅和订阅人数 需要在设置中打开
/import    - 回复此消息 opml 文件导入订阅(群组)
/lang      - 更改语言
/heath      - 展示活跃订阅源的健康程度
```

首先用木子的博客做一下尝试吧！在 Telegram 中对机器人发送订阅命令 `/sub @频道名 RSSURL`：

```sh
/sub @rss_chanshiyu https://blog.k8s.li/atom.xml
```

![订阅RSS](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2020/Telegram-RSS-订阅频道/订阅RSS.png)

![订阅大成功](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2020/Telegram-RSS-订阅频道/订阅大成功.png)

最终成果点击 [RSS 時雨](https://t.me/rss_chanshiyu)，大家一起来玩呀，今天又发现了一个有意思的小玩具，咱对 Telegram 真是越来越爱了。

Just enjoy it 😃! Bless Bless.
