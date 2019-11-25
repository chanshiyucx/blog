# Netty

Netty 是一个提供了易于使用的 API 客户端/服务器框架。特性：

- 高并发 - NIO（非阻塞 IO）
- 传输快 - 零拷贝

## BIO、NIO、AIO

阻塞与非阻塞：线程访问资源，该资源是否准备就绪的一种处理方式。阻塞会一直等待资源就绪，而非阻塞会立即响应结果，先处理其他资源。

同步和异步：访问数据的一种机制。

![阻塞与非阻塞](https://cdn.jsdelivr.net/gh/chanshiyucx/yoi/2019/01_阻塞与非阻塞.png)

![同步与异步](https://cdn.jsdelivr.net/gh/chanshiyucx/yoi/2019/02_同步与异步.png)

![BIO](https://cdn.jsdelivr.net/gh/chanshiyucx/yoi/2019/03_BIO.png)

![NIO](https://cdn.jsdelivr.net/gh/chanshiyucx/yoi/2019/04_NIO.png)

![AIO](https://cdn.jsdelivr.net/gh/chanshiyucx/yoi/2019/05_AIO.png)

![生活实例](https://cdn.jsdelivr.net/gh/chanshiyucx/yoi/2019/06_生活实例.png)

![三者区别](https://cdn.jsdelivr.net/gh/chanshiyucx/yoi/2019/07_三者区别.png)

### Reactor 线程模型

![单线程模型](https://cdn.jsdelivr.net/gh/chanshiyucx/yoi/2019/08_单线程模型.png)

![多线程模型](https://cdn.jsdelivr.net/gh/chanshiyucx/yoi/2019/09_多线程模型.png)

![主从线程模型](https://cdn.jsdelivr.net/gh/chanshiyucx/yoi/2019/10_主从线程模型.png)

## Netty 服务器

Netty 服务器流程

- 构建一对主从线程组
- 定义服务器启动类
- 为服务器设置 Channel
- 设置处理从线程池的助手类初始化器
- 监听启动和关闭服务器

![channel 初始化器](https://cdn.jsdelivr.net/gh/chanshiyucx/yoi/2019/11_channel_初始化器.png)

### Netty Server

```java
@Component
public class WSServer {

    private EventLoopGroup mainGroup;

    private EventLoopGroup subGroup;

    private  ServerBootstrap server;

    private ChannelFuture channelFuture;

    private static class SingletionWSServer {
        static final WSServer instance = new WSServer();
    }

    public static WSServer getInstance() {
        return SingletionWSServer.instance;
    }

    public WSServer() {
        // 主线程组，用于接收客户端连接，不做任何处理
        mainGroup = new NioEventLoopGroup();
        // 从线程组，专门处理主线程组的任务
        subGroup = new NioEventLoopGroup();
        // netty 服务器
        server = new ServerBootstrap();
        server.group(mainGroup, subGroup)                 // 设置主从线程组
                .channel(NioServerSocketChannel.class)    // 设置 nio 的双向通道
                .childHandler(new WSServerInitializer()); // 子处理器，用于处理 subGroup
    }

    public void start() {
        this.channelFuture = server.bind(8088);
        System.out.println("netty websocket server 启动完毕...");
    }

}
```

### Netty Server Initializer

```java
public class WSServerInitializer extends ChannelInitializer<NioSocketChannel> {

    @Override
    protected void initChannel(NioSocketChannel nioSocketChannel) throws Exception {
        // 通过 SocketChannel 去获得对应的管道，通过管道添加 handler
        ChannelPipeline pipeline = nioSocketChannel.pipeline();

        /**
         * ==========================================================================
         *                             以下用于支持 http 协议
         * ==========================================================================
         */

        // HttpServerCodec 是由 netty 提供的助手类，可以理解为拦截器，当请求到服务端做解码，响应到客户端做编码
        // websocket 基于 http 协议，所以要有 http 编解码器
        pipeline.addLast(new HttpServerCodec());
        // 对写大数据流的支持
        pipeline.addLast(new ChunkedWriteHandler());
        // 对 httpMessage 进行聚合，聚合成 FullHttpRequest 或 FullHttpResponse，几乎在 netty 中的编程，都会使用到此 handler
        pipeline.addLast(new HttpObjectAggregator(1024*64));

        /**
         * ============================================================================
         *                            websocket 服务器处理协议
         * 对于 websokcet 来讲，都是以 frames 进行传输的，不同的数据类型对应不同的 frames 也不同
         * ============================================================================
         */
        pipeline.addLast(new WebSocketServerProtocolHandler("/ws"));
        pipeline.addLast(new ChatHandler());     // 消息测试
    }

}
```

### ChatHandler

```java
public class ChatHandler extends SimpleChannelInboundHandler<TextWebSocketFrame> {

    // 用于记录和管理所有客户端的 channel
    private static ChannelGroup clients = new DefaultChannelGroup(GlobalEventExecutor.INSTANCE);

    @Override
    protected void channelRead0(ChannelHandlerContext channelHandlerContext, TextWebSocketFrame textWebSocketFrame) throws Exception {
        // 获取客户端传输过来的消息
        String content = textWebSocketFrame.text();
        System.out.println("接受数据消息：" + content);

        // 此方法给全部 channel 刷入消息
        clients.writeAndFlush(new TextWebSocketFrame("[接收消息" + LocalDateTime.now() + "] " + content));
    }

    /**
     * 当客户端连接服务器之后（打开连接）
     * 获取客户端的 channel，并且放到 ChannelGroup 中去管理
     * @param ctx
     * @throws Exception
     */
    @Override
    public void handlerAdded(ChannelHandlerContext ctx) throws Exception {
        clients.add(ctx.channel());
    }

    @Override
    public void handlerRemoved(ChannelHandlerContext ctx) throws Exception {
        // 当触发 handlerRemoved 时，ChannelGroup 会自动移除对应客户端的 channel，无需手动移除
        // clients.remove(ctx.channel());
        System.out.println("客户端断开连接，channel 对应的长 id 为：" + ctx.channel().id().asLongText());
    }
}
```

### Netty Booter

```java
@Component
public class NettyBooter implements ApplicationListener<ContextRefreshedEvent> {

    @Override
    public void onApplicationEvent(ContextRefreshedEvent contextRefreshedEvent) {
        if (contextRefreshedEvent.getApplicationContext().getParent() == null) {
            try {
                WSServer.getInstance().start();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

}
```
