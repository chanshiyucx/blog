# Netty 服务器

Netty 是一个提供了易于使用的 API 客户端/服务器框架。特性：

- 高并发 - NIO（非阻塞 IO）
- 传输快 - 零拷贝

Netty 服务器流程：

- 构建一对主从线程组
- 定义服务器启动类
- 为服务器设置 Channel
- 设置处理从线程池的助手类初始化器
- 监听启动和关闭服务器

![channel 初始化器](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/Netty-服务器/11_channel_初始化器.png)

## Netty Server

```java
@Component
public class WSServer {

    private EventLoopGroup mainGroup;

    private EventLoopGroup subGroup;

    private ServerBootstrap server;

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

## Netty Server Initializer

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

## ChatHandler

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

## Netty Booter

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

## 概念

### ChannelInboundHandlerAdapter vs SimpleChannelInboundHandler

`SimpleChannelInboundHandler是有泛型参数的`，可以指定一个具体的类型参数，通过 decoder 配合使用，非常方便。`ChannelInboundHandlerAdapter` 则是直接操作 byte 数组的。

类的关系：

```java
ChannelInboundHandlerAdapter extends ChannelHandlerAdapter implements ChannelInboundHandler

SimpleChannelInboundHandler<I> extends ChannelInboundHandlerAdapter
```

可以看出 `SimpleChannelInboundHandler` 是继承 `ChannelInboundHandlerAdapter` 的，也就是说 `SimpleChannelInboundHandler` 也拥有 `ChannelInboundHandlerAdapter` 的方法。

一般而言业务代码 `SimpleChannelInboundHandler` 写在 `channelRead0` 方法中，而 `ChannelInboundHandlerAdapter` 写在 `channelRead` 方法中，注意后面有 0 后缀区别。

**`SimpleChannelInboundHandler` 对 `channelRead` 的重写：**

```java
public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
    boolean release = true;
    try {
        if (acceptInboundMessage(msg)) { //类型匹配
            I imsg = (I) msg;
            channelRead0(ctx, imsg);
        } else {
            release = false;
            ctx.fireChannelRead(msg);
        }
    } finally {
        if (autoRelease && release) {
            ReferenceCountUtil.release(msg); //释放引用
        }
    }
}
```

`SimpleChannelInboundHandler` 的 `channelRead` 相比 `ChannelInboundHandlerAdapter` 而言，主要做了类型匹配以及用完之后释放指向保存该消息的 ByteBuf 的内存引用。

如果说 channelRead 都是同步操作的话，`SimpleChannelInboundHandler` 是不错的选择，如果操作是异步的话，那他的逻辑就有点麻烦了，例如你把数据交给另外的线程处理了，还没处理就会释放了，这时候 `ChannelInboundHandlerAdapter` 处理自由的优点也就提现出来了，可以更好的处理更多的特定场景。

`SimpleChannelInboundHandler` 的好处是可以处理不同的类型对象，并且可以做释放。`ChannelInboundHandlerAdapter` 的好处则是更自由，在异步的场景下更适合。

参考文章：  
[从零开始学 netty](https://www.imooc.com/article/27677)
