# Handler 对比

## 业务常见 handler

| 类名                           | 说明                                                                                                                  |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| IdleStateHandler               | 空闲检测                                                                                                              |
| FixedLengthFrameDecoder        | 固定长度的拆包器                                                                                                      |
| MessageToMessageCodec          | 将编解码操作放到一个类实现                                                                                            |
| HttpServerCodec                | http 编解码器                                                                                                         |
| ChunkedWriteHandler            | 处理大文件传输的情形                                                                                                  |
| HttpObjectAggregator           | 对 httpMessaHeartBeatHandlerge 进行聚合，聚合成 FullHttpRequest 或 FullHttpResponse                                   |
| WebSocketServerProtocolHandler | 根据 WebSockets 规范的要求，处理 WebSocket 升级握手，PingWebSocketFrames、PongWebSocketFrames 和 CloseWebSocketFrames |
| TextWebSocketFrameHandler      | 处理 TextWebSocketFrames 和握手完成事件                                                                               |

## ChannelInboundHandlerAdapter

`ChannelInboundHandlerAdapter` 是 `ChannelInboundHandler` 的一个简单实现，默认情况下不会做任何处理，只是简单的调用 `fireChannelRead(msg)` 方法传递到 `ChannelPipeline` 中的下一个 `ChannelHandler` 去处理。

```java
public class ChannelInboundHandlerAdapter extends ChannelHandlerAdapter implements ChannelInboundHandler {
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        ctx.fireChannelRead(msg);
    }
}
```

需要注意的是信息经过 `channelRead` 方法处理之后不会自动释放（因为信息不会被自动释放所以才能将消息传递给下一个 `ChannelHandler` 处理）。

## SimpleChannelInboundHandler

`SimpleChannelInboundHandler` 支持泛型的消息处理，默认情况下消息处理完将会被自动释放，无法提供 `fireChannelRead(msg)` 方法传递给 `ChannelPipeline` 中的下一个 `ChannelHandler`，如果想要传递给下一个 `ChannelHandler` 需要调用 `ReferenceCountUtil#retain` 方法。

`SimpleChannelInboundHandler` 匹配规则，它会判断消息体类型，如果匹配则调用 `channelRead0(ctx, msg)` 处理消息，不会向下一个 handler 传递，否则的话调用 `ctx.fireChannelRead(msg)` 传递数据给下一个 handler。

> 在客户端，当 `channelRead0()` 方法完成时，你已经有了传入消息，并且已经处理完它了。当该方法返回时，`SimpleChannelInboundHandler` 负责释放指向保存该消息的 ByteBuf 的内存引用。 --《Netty In Action》

```java
public abstract class SimpleChannelInboundHandler<I> extends ChannelInboundHandlerAdapter {
    /** 省略一些细节 **/

    public boolean acceptInboundMessage(Object msg) throws Exception {
        return this.matcher.match(msg);
    }

    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        boolean release = true;

        try {
            if (this.acceptInboundMessage(msg)) {
                this.channelRead0(ctx, msg);
            } else {
                release = false;
                ctx.fireChannelRead(msg);
            }
        } finally {
            if (this.autoRelease && release) {
                ReferenceCountUtil.release(msg);
            }

        }

    }
}
```

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
