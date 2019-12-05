# Handler 执行顺序

## ChannelInboundHandler 和 ChannelOutboundHandler

`ChannelHandler` 有两个子类 `ChannelInboundHandler` 和 `ChannelOutboundHandler`，这两个类对应了两个数据流向，如果数据是从外部流入应用程序，就看做是 `inbound`，相反便是 `outbound`。一个 `ChannelHandler` 处理完接收到的数据会传给下一个 Handler，或者什么不处理，直接传递给下一个。

一个 `ChannelPipeline` 可以把 `ChannelInboundHandler` 和 `ChannelOutboundHandler` 混合在一起，当一个数据流进入 `ChannelPipeline` 时，它会从管道头部开始传给第一个 `ChannelInboundHandler`，当第一个处理完后再传给下一个，一直传递到管道的尾部。与之相对应的是，当数据被写出时，它会从管道的尾部开始，先经过管道尾部的最后一个 `ChannelOutboundHandler`，当它处理完成后会传递给前一个 `ChannelOutboundHandler`。

![channelpipeline](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/Handler-执行顺序/channelpipeline.png)

数据在各个 Handler 之间传递，这需要调用方法中传递的 `ChanneHandlerContext` 来操作，在 netty 的 API 中提供了两个基类分 `ChannelInboundHandlerAdapter` 和 `ChannelOutboundHandlerAdapter`，他们仅仅实现了调用 `ChanneHandlerContext` 来把消息传递给下一个 Handler，因为我们只关心处理数据，因此在程序中可以继承这两个基类，而我们仅需实现处理数据的部分即可。

`ChannelInboundHandler` 和 `ChannelOutboundHandler` 在 `ChannelPipeline` 中是混合在一起的，那么它们如何区分彼此呢？其实很容易，因为它们各自实现的是不同的接口，对于 `inbound event`，Netty 会自动跳过 `ChannelOutboundHandler`，相反若是 `outbound event`，`ChannelInboundHandler` 会被忽略掉。

当一个 `ChannelHandler` 被加入到 `ChannelPipeline` 中时，它便会获得一个 `ChannelHandlerContext` 的引用，而 `ChannelHandlerContext` 可以用来读写 Netty 中的数据流。因此，现在可以有两种方式来发送数据：

1. 把数据直接写入 `Channel`
2. 把数据写入 `ChannelHandlerContext`

它们的区别是写入 Channel 的话，数据流会从 Channel 的头开始传递，而如果写入 `ChannelHandlerContext` 的话，数据流会流入管道中的下一个 Handler。

## 总结

1. `ChannelInboundHandler` 之间的传递，通过调用 `ctx.fireChannelRead(msg)` 实现；调用 `ctx.write(msg)` 将传递到 `ChannelOutboundHandler`。
2. `ctx.write()` 方法执行后，需要调用 `flush()` 方法才能令它立即执行。
3. `ChannelOutboundHandler` 在注册的时候需要放在最后一个 `ChannelInboundHandler` 之前，否则将无法传递到 `ChannelOutboundHandler`（**流水线 pipeline 中 outhander 不能放到最后，否则不生效**）。
4. Handler 的消费处理放在最后一个处理。

参考文章：  
[Handler 的执行顺序](https://www.jianshu.com/p/0f28121fdecb)
