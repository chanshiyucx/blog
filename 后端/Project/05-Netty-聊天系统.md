# Netty 聊天系统

## 引入依赖

该聊天项目是一个标准的多模块 spring boot 项目，只需要引入四个基本的依赖包。

netty 提供易于使用的 API 客户端/服务器框架，disruptor 高性能无锁队列进行消息生产和消费，fastjson 进行消息序列和反序列化，bcprov 提供加解密。

```xml
<!-- netty -->
<dependency>
    <groupId>io.netty</groupId>
    <artifactId>netty-all</artifactId>
    <version>${netty.version}</version>
</dependency>
<!-- disruptor -->
<dependency>
    <groupId>com.lmax</groupId>
    <artifactId>disruptor</artifactId>
    <version>3.4.2</version>
</dependency>
<!-- alibaba fastjson -->
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>fastjson</artifactId>
    <version>1.2.55</version>
</dependency>
 <!-- 加解密服务 -->
<dependency>
    <groupId>org.bouncycastle</groupId>
    <artifactId>bcprov-jdk16</artifactId>
    <version>1.46</version>
</dependency>
```

## 启动服务器

### NettyWebSocketServer

NettyWebSocketServer 服务器构建一对主从线程组，并且绑定端口。

```java
@Slf4j
@Component
public class NettyWebSocketServer {

    /**
     * 端口号
     */
    @Value("${netty.websocket.port}")
    private int port;

    /**
     * 启动服务器
     */
    public void run() {
        // 主线程组，用于接收客户端连接，不做任何处理
        NioEventLoopGroup bossGroup = new NioEventLoopGroup();
        // 从线程组，专门处理主线程组的任务
        NioEventLoopGroup workerGroup = new NioEventLoopGroup();

        final ServerBootstrap serverBootstrap = new ServerBootstrap();
        serverBootstrap
                .group(bossGroup, workerGroup)         // 设置主从线程组
                .channel(NioServerSocketChannel.class) // 设置 nio 的双向通道
                .childHandler(new WebSocketChannelInitializer()); // 子处理器
        // 监听端口
        bind(serverBootstrap, port);
    }

    /**
     * 监听端口
     */
    private void bind(final ServerBootstrap serverBootstrap, final int port) {
        serverBootstrap.bind(port).addListener(future -> {
            if (future.isSuccess()) {
                log.info("{}: 端口[{}]绑定成功!", new Date(), port);
            } else {
                log.error("端口[{}]绑定失败!", port);
            }
        });
    }
}
```

### WebSocketChannelInitializer

WebSocketChannelInitializer 初始化器注册 channelhandler，里面的初始化方法会被执行。

主要需要注册下面几个 channelhandler：

```java
pipeline.addLast(ConnectionCountHandler.INSTANCE);    // 链接检查
pipeline.addLast(IMIdleStateHandler.INSTANCE);        // 心跳检查
pipeline.addLast(PacketCodecHandler.INSTANCE);        // 编解码
pipeline.addLast(HeartBeatRequestHandler.INSTANCE);   // 心跳包
pipeline.addLast(LoginRequestHandler.INSTANCE);       // 登录
pipeline.addLast(AuthHandler.INSTANCE);               // 认证
pipeline.addLast(IMHandler.INSTANCE);                 // 处理业务
```

具体实现：

```java
public class WebSocketChannelInitializer extends ChannelInitializer<NioSocketChannel> {

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
        pipeline.addLast(new HttpObjectAggregator(1024 * 64));

        /**
         * ============================================================================
         *                            websocket 服务器处理协议l
         * 处理握手动作：handshaking(close, ping, pong) ping + pong = 心跳
         * 对于 websokcet 来讲，都是以 frames 进行传输的，不同的数据类型对应不同的 frames 也不同
         * ============================================================================
         */
        pipeline.addLast(new WebSocketServerProtocolHandler("/chat"));
        pipeline.addLast(ConnectionCountHandler.INSTANCE);    // 链接检查
        pipeline.addLast(IMIdleStateHandler.INSTANCE);        // 心跳检查
        pipeline.addLast(PacketCodecHandler.INSTANCE);        // 编解码
        pipeline.addLast(HeartBeatRequestHandler.INSTANCE);   // 心跳包
        pipeline.addLast(LoginRequestHandler.INSTANCE);       // 登录
        pipeline.addLast(AuthHandler.INSTANCE);               // 认证
        pipeline.addLast(IMHandler.INSTANCE);                 // 处理业务
    }

}
```

### NettyBootstrap

NettyBootstrap 同时启动 netty 服务器和 disruptor 消息队列。

```java
@Component
public class NettyBootstrap implements ApplicationListener<ContextRefreshedEvent> {

    private NettyWebSocketServer mNettyWebSocketServer;

    @Autowired
    public NettyBootstrap(NettyWebSocketServer nettyWebSocketServer) {
        mNettyWebSocketServer = nettyWebSocketServer;
    }

    @Override
    public void onApplicationEvent(ContextRefreshedEvent contextRefreshedEvent) {
        if (contextRefreshedEvent.getApplicationContext().getParent() == null) {
            try {
                // 启动 disruptor
                MessageConsumer[] consumers = new MessageConsumer[16];
                for (int i = 0; i < consumers.length; i++) {
                    MessageConsumer messageConsumer = new MessageConsumerImpl();
                    consumers[i] = messageConsumer;
                }
                RingBufferWorkerPoolFactory factory = SpringUtil.getBean(RingBufferWorkerPoolFactory.class);
                factory.initAndStart(consumers);

                // 启动 netty server
                mNettyWebSocketServer.run();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}
```

## 消息队列

### 等待策略配置

```java
@Configuration
public class DisruptorWaitStrategyConfig {
    @Bean
    @ConditionalOnMissingBean(WaitStrategy.class)
    public WaitStrategy getWaitStrategy() {
        // 如果 CPU 比较叼的话，可以用 YieldingWaitStrategy
        return new BlockingWaitStrategy();
    }
}
```

### 构造工厂

```java
@Component
public class RingBufferWorkerPoolFactory {

    @Value("${disruptor.buffer.size}")
    private int mBufferSize;

    @Autowired
    private WaitStrategy mWaitStrategy;

    private Map<Integer, MessageProducer> producers = new ConcurrentHashMap<>();

    private RingBuffer<TranslatorDataWrapper> ringBuffer;

    public void initAndStart(MessageConsumer[] messageConsumers) {
        // 1. 构建 ringBuffer 对象
        this.ringBuffer = RingBuffer.create(ProducerType.MULTI,
                TranslatorDataWrapper::new,
                mBufferSize,
                mWaitStrategy);
        // 2. 通过 ringBuffer 创建一个屏障
        SequenceBarrier sequenceBarrier = this.ringBuffer.newBarrier();
        // 3. 创建多个消费者数组
        WorkerPool<TranslatorDataWrapper> workerPool = new WorkerPool<>(
                this.ringBuffer,
                sequenceBarrier,
                new EventExceptionHandler(),
                messageConsumers);
        // 4. 设置多个消费者的 sequence 序号 用于单独统计消费进度，并且设置到 ringBuffer 中
        this.ringBuffer.addGatingSequences(workerPool.getWorkerSequences());
        // 5. 启动我们的工作池
        workerPool.start(Executors.newFixedThreadPool(16));
    }

    public MessageProducer getMessageProducer(Integer commandId) {
        MessageProducer messageProducer = producers.get(commandId);
        if (messageProducer == null) {
            messageProducer = new MessageProducerImpl(commandId, this.ringBuffer);
            producers.put(commandId, messageProducer);
        }
        return messageProducer;
    }

    /**
     * 异常静态类
     *
     * @author Alienware
     */
    @Slf4j
    static class EventExceptionHandler implements ExceptionHandler<TranslatorDataWrapper> {
        @Override
        public void handleEventException(Throwable ex, long sequence, TranslatorDataWrapper event) {
            log.error("handleEventException -> ex:{} sequence:{} event:{}", ex.getMessage(), sequence, event.getClass().toString());
            ex.printStackTrace();
        }

        @Override
        public void handleOnStartException(Throwable ex) {
            log.error("handleOnStartException -> ex:{}", ex.getMessage());
            ex.printStackTrace();
        }

        @Override
        public void handleOnShutdownException(Throwable ex) {
            log.error("handleOnShutdownException -> ex:{}", ex.getMessage());
            ex.printStackTrace();
        }
    }

}
```

### 消息包体

```java
@Data
public class TranslatorDataWrapper {
    private Packet packet;
    private ChannelHandlerContext ctx;
}
```

### 消息生产者

```java
@Slf4j
public class MessageProducer {
    /**
     * 发布事件
     *
     * @param packet 应用包
     * @param ctx    上下文
     */
    public void publish(Packet packet, ChannelHandlerContext ctx) {
        log.info("生成消息 -> {}", packet.getCommand());
    }
}
```

实现类：

```java
@Data
@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
public class MessageProducerImpl extends MessageProducer {
    private Integer commandId;

    private RingBuffer<TranslatorDataWrapper> ringBuffer;

    /**
     * 发布事件
     *
     * @param packet 应用包
     * @param ctx    上下文
     */
    @Override
    public void publish(Packet packet, ChannelHandlerContext ctx) {
        super.publish(packet, ctx);
        // 取盘
        long sequence = ringBuffer.next();
        try {
            TranslatorDataWrapper wrapper = ringBuffer.get(sequence);
            wrapper.setPacket(packet);
            wrapper.setCtx(ctx);
        } finally {
            ringBuffer.publish(sequence);
        }
    }
}
```

### 消息消费者

```java
@Slf4j
public class MessageConsumer implements WorkHandler<TranslatorDataWrapper> {
    @Override
    public void onEvent(TranslatorDataWrapper wrapper) throws Exception {
        log.info("消费消息 -> {}", wrapper.getPacket().getCommand());
    }
}
```

实现类：

```java
@Slf4j
public class MessageConsumerImpl extends MessageConsumer {
    @Override
    public void onEvent(TranslatorDataWrapper wrapper) throws Exception {
        super.onEvent(wrapper);
        Packet packet = wrapper.getPacket();
        ChannelHandlerContext ctx = wrapper.getCtx();
        Channel channel = ctx.channel();
        Integer command = packet.getCommand();
        log.info("开始消息处理 -> {}", command);
        switch (command) {
            case Command.LOGIN_REQUEST:
                // 登陆处理
                try {
                    login(ctx, (LoginRequestPacket) packet);
                } catch (Exception e) {
                    e.printStackTrace();
                }
                break;
        }
    }

    /**
     * 登录处理
     *
     * @param ctx
     * @param packet
     * @throws Exception
     */
    private void login(ChannelHandlerContext ctx, LoginRequestPacket packet) throws Exception {
        log.info("登录 -> 绑定 session");
        // 绑定会话
        Session session = new Session(packet.getId(), packet.getUsername(), packet.getNickname());
        SessionUtil.bindSession(session, ctx.channel());
    }
}
```

## 消息加解密

`ApiApplication` 启动时导入加解密依赖包：

```java
// 导入支持AES/CBC/PKCS7Padding的Provider
Security.addProvider(new BouncyCastleProvider());
```

加解密工具类：

```java
public class CryptoAesUtil {

    private static final Base64.Decoder decoder = Base64.getDecoder();

    private static final Base64.Encoder encoder = Base64.getEncoder();

    public static String encrypt(String data, String key, String iv) throws Exception {
        String baseData = encoder.encodeToString(data.getBytes());
        byte[] result = handleMsg(baseData, key, iv, Cipher.ENCRYPT_MODE);
        return encoder.encodeToString(result);
    }

    public static String decrypt(String data, String key, String iv) throws Exception {
        byte[] result = handleMsg(data, key, iv, Cipher.DECRYPT_MODE);
        return new String(result);
    }

    private static byte[] handleMsg(String data, String key, String iv, int mode) throws Exception {
        log.info("data: {}, key: {}, iv: {}, mode: {}", data, key, iv, mode);
        String baseKey = encoder.encodeToString(key.getBytes());
        String baseIv = encoder.encodeToString(iv.getBytes());
        // 从 Base64 格式还原到原始格式
        byte[] dataByte = decoder.decode(data);
        byte[] keyByte = decoder.decode(baseKey);
        byte[] ivByte = decoder.decode(baseIv);
        // 指定算法，模式，填充方法 创建一个 Cipher 实例
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS7Padding", "BC");
        // 生成 Key 对象
        Key sKeySpec = new SecretKeySpec(keyByte, "AES");
        // 把向量初始化到算法参数
        AlgorithmParameters params = AlgorithmParameters.getInstance("AES");
        params.init(new IvParameterSpec(ivByte));
        // 指定模式、密钥、参数，初始化 Cipher 对象
        cipher.init(mode, sKeySpec, params);
        // 执行加解密
        return cipher.doFinal(dataByte);
    }

}
```
