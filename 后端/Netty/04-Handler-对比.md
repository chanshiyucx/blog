# Handler 对比

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
