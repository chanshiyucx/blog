# Netty 获取客户端 IP

近期在后端摸鱼无聊，索性找个练手的项目，最终决定摸一个基于 netty 实现的 WEB IM（在线聊天项目）。项目不大，技术力也不高，期间依旧也踩了不少坑，毕竟咱还是太菜力 😹。

其中一个大坑就是获取 IM 中当前在线用户连接的 IP，这个看起来简单的功能咱着实折腾了好久。

Sping 中获取客户端 IP 很简单，前面咱也写文章介绍过 [Spring 获取请求 IP 地址](https://chanshiyu.com/#/post/100)。不过从 netty 中获取远端连接的 IP 着实让咱有点小捉急，虽然 netty 官方原生提供了获取客户端 IP 的方法，但是如果服务器使用了 nginx 代理转发的话，原生提供的方法获取的却是服务器 IP 而非客户端真实 IP。

Google 查阅了不少资料，很多文章都是使用官方默认 IP 获取方式，与咱情况不符，很好奇他们真是这么用的嘛，不使用 nginx 反代？？？喵喵喵？？？

最后在 netty github 官方 issues 找到一个方案 [Can't get websocket IP address through amazon ELB](https://github.com/netty/netty/issues/7856)，用各种姿势尝试后摸索出一条解决方案。其实这个方法咱一开始就尝试了，但是食用姿势不对，给自己埋了坑，到后面第二次研究时才摸索出正确的解决方式。

## 获取 IP

首先新增 IP 处理 handler，之前就是因为 handler 顺序搞错了，食用姿势不对，折腾了很久。

> You will need to put the handler in front of your upgrade handler.

```java
public class WebSocketChannelInitializer extends ChannelInitializer<NioSocketChannel> {

    @Override
    protected void initChannel(NioSocketChannel ch) {
        // websocket 基于http协议，所以要有http编解码器
        ch.pipeline().addLast(new HttpServerCodec());
        // 对写大数据流的支持
        ch.pipeline().addLast(new ChunkedWriteHandler());
         // IP处理
        ch.pipeline().addLast(IPHandler.INSTANCE);
        // 对httpMessaHeartBeatHandlerge进行聚合，聚合成FullHttpRequest或FullHttpResponse
        ch.pipeline().addLast(new HttpObjectAggregator(1024 * 64));
        // 其他业务处理 handler...
    }
}
```

IPHandler 实现：

```java
@Slf4j
@ChannelHandler.Sharable
public class IPHandler extends SimpleChannelInboundHandler<HttpObject> {
    public static final IPHandler INSTANCE = new IPHandler();

    @Override
    public void channelRead0(ChannelHandlerContext ctx, HttpObject msg) {
        if (msg instanceof HttpRequest) {
            HttpRequest mReq = (HttpRequest) msg;
            // 从请求头获取 nginx 反代设置的客户端真实 IP
            String clientIP = mReq.headers().get("X-Real-IP");
            // 如果为空则使用 netty 默认获取的客户端 IP
            if (clientIP == null) {
                InetSocketAddress insocket = (InetSocketAddress) ctx.channel().remoteAddress();
                clientIP = insocket.getAddress().getHostAddress();
            }
            ctx.channel().attr(Attributes.IP).set(clientIP);
        }
        // 传递给下一个 handler
        ctx.fireChannelRead(msg);
    }
}
```

需要注意 `SimpleChannelInboundHandler` 的匹配规则，它会判断消息体类型，如果匹配则调用 `channelRead0(ctx, msg)` 处理消息，不会向下一个 handler 传递，否则的话需要调用 `ctx.fireChannelRead(msg)` 传递数据给下一个 handler。

## Nginx 配置

上述方案还需要 nginx 配合，在 nginx 配置中加上客户端真实 IP `proxy_set_header X-Real-IP $remote_addr;`。

```conf
server {
    listen 80;
    server_name moechat.com;

    location / {
        proxy_connect_timeout 300s;
        proxy_send_timeout   300s;
        proxy_read_timeout   300s;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_http_version 1.1;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
        proxy_pass http://api:8080;
        proxy_redirect http:// https://;
        client_max_body_size 300M;
    }

    location /chat {
        access_log off;
        proxy_pass http://api:7002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header X-Real-IP $remote_addr;
        proxy_connect_timeout 1d;
        proxy_send_timeout 1d;
        proxy_read_timeout 1d;
    }

}
```
