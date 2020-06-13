# 高性能无锁队列 Disruptor

Disruptor 是英国外汇交易公司 LMAX 开发的一个高性能队列，研发的初衷是解决内存队列的延迟问题，因其出色的性能表现获得 2011 Duke’s 程序框架创新奖。

> A High Performance Inter-Thread Messaging Library
> 项目地址：[LMAX Disruptor](https://github.com/LMAX-Exchange/disruptor)

## 介绍

从数据结构上来看，Disruptor 是一个支持**生产者/消费者模式的环形队列**。能够在无锁的条件下进行并行消费，也可以根据消费者之间的依赖关系进行先后消费次序。

Disruptor 高效原理：

1. Disruptor 使用了一个 RingBuffer 替代队列，用生产者消费者指针替代锁。
2. 生产者消费者指针使用 CPU 支持的整数自增，无需加锁并且速度很快。Java 的实现在 Unsafe package 中。

### 消费者的等待策略

| 名称                        | 措施                      | 适用场景                                                                                      |
| --------------------------- | ------------------------- | --------------------------------------------------------------------------------------------- |
| BlockingWaitStrategy        | 加锁                      | CPU 资源紧缺，吞吐量和延迟并不重要的场景                                                      |
| BusySpinWaitStrategy        | 自旋                      | 通过不断重试，减少切换线程导致的系统调用，而降低延迟。推荐在线程绑定到固定的 CPU 的场景下使用 |
| PhasedBackoffWaitStrategy   | 自旋 + yield + 自定义策略 | CPU 资源紧缺，吞吐量和延迟并不重要的场景                                                      |
| SleepingWaitStrategy        | 自旋 + yield + sleep      | 性能和 CPU 资源之间有很好的折中。延迟不均匀                                                   |
| TimeoutBlockingWaitStrategy | 加锁，有超时限制          | CPU 资源紧缺，吞吐量和延迟并不重要的场景                                                      |
| YieldingWaitStrategy        | 自旋 + yield + 自旋       | 性能和 CPU 资源之间有很好的折中。延迟比较均匀                                                 |

| 名称                        | 适用场景                                                                                      |
| --------------------------- | --------------------------------------------------------------------------------------------- |
| BlockingWaitStrategy        | CPU 资源紧缺，吞吐量和延迟并不重要的场景                                                      |
| BusySpinWaitStrategy        | 通过不断重试，减少切换线程导致的系统调用，而降低延迟。推荐在线程绑定到固定的 CPU 的场景下使用 |
| PhasedBackoffWaitStrategy   | CPU 资源紧缺，吞吐量和延迟并不重要的场景                                                      |
| SleepingWaitStrategy        | 性能和 CPU 资源之间有很好的折中。延迟不均匀                                                   |
| TimeoutBlockingWaitStrategy | CPU 资源紧缺，吞吐量和延迟并不重要的场景                                                      |
| YieldingWaitStrategy        | 性能和 CPU 资源之间有很好的折中。延迟比较均匀                                                 |

## 食用方式

### 引入依赖

```xml
<dependency>
    <groupId>com.lmax</groupId>
    <artifactId>disruptor</artifactId>
    <version>3.4.2</version>
</dependency>
```

### 命令字和数据包

```java
/**
 * @author SHIYU
 * @description 无锁队列命令字
 * @since 2020-06-13
 */
public interface IDisruptorCommand {

    /**
     * 测试消息 hello
     */
    int CHECK_MSG_HELLO = 1;

    /**
     * 测试消息 hi
     */
    int CHECK_MSG_HI = 2;

}
```

```java
/**
 * @author SHIYU
 * @description 传输的数据
 * @since 2020-06-13
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TranslatorDataWrapper {

    private int command;

    private Object target;

}
```

### 轮询策略

```java
/**
 * @author SHIYU
 * @description 轮询策略
 * @since 2020-06-13
 */
@Configuration
public class DisruptorWaitStrategyConfiguration {

    @Bean
    @ConditionalOnMissingBean(WaitStrategy.class)
    public WaitStrategy getWaitStrategy() {
        // 如果 CPU 比较叼的话，可以用 YieldingWaitStrategy
        return new BlockingWaitStrategy();
    }

}
```

### 生成者和消费者

```java
/**
 * @author SHIYU
 * @description 消息生产者
 * @since 2020-06-13
 */
@Data
@Slf4j
@AllArgsConstructor
public class MessageProducer {

    private RingBuffer<TranslatorDataWrapper> ringBuffer;

    /**
     * 发布事件
     *
     * @param command 命令字
     * @param object 数据
     */
    public void publish(int command, Object object) {
        long sequence = ringBuffer.next();
        try {
            TranslatorDataWrapper wrapper = ringBuffer.get(sequence);
            wrapper.setCommand(command);
            wrapper.setTarget(object);
        } finally {
            ringBuffer.publish(sequence);
        }
    }

}
```

```java
/**
 * 消息消费者
 *
 * @author nk
 */
@Slf4j
public class MessageConsumer implements WorkHandler<TranslatorDataWrapper> {

    @Override
    public void onEvent(TranslatorDataWrapper wrapper) {
        int command = wrapper.getCommand();
        switch (command) {
            case IDisruptorCommand.CHECK_MSG_HELLO:
                log.info("消费消息 =============== hello");
                break;
            case IDisruptorCommand.CHECK_MSG_HI:
                log.info("消费消息 =============== hi");
                break;
            default:
                break;
        }
    }

}
```

### 构造工厂

`disruptor.buffer.size` 这里设置为 1024 \* 1024 即 1048576。

```yml
disruptor:
  buffer:
    size: 1048576
```

```java
/**
 * @author SHIYU
 * @description 环型无锁队列
 * @since 2020-06-13
 */
@Slf4j
@Component
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class RingBufferWorkerPoolFactory {

    @Value("${disruptor.buffer.size}")
    private int mBufferSize;

    private final WaitStrategy mWaitStrategy;

    private Map<Integer, MessageProducer> producers = new ConcurrentHashMap<>();

    private RingBuffer<TranslatorDataWrapper> ringBuffer;

    public void initAndStart(MessageConsumer[] messageConsumers) {
        // 1.构建 ringBuffer 对象
        this.ringBuffer = RingBuffer.create(ProducerType.MULTI,
                TranslatorDataWrapper::new,
                mBufferSize,
                mWaitStrategy);
        // 2.通过 ringBuffer 创建一个屏障
        SequenceBarrier sequenceBarrier = this.ringBuffer.newBarrier();
        // 3.创建多个消费者数组
        WorkerPool<TranslatorDataWrapper> workerPool = new WorkerPool<>(
                this.ringBuffer,
                sequenceBarrier,
                new EventExceptionHandler(),
                messageConsumers);
        // 4.设置多个消费者的 sequence 序号，用于单独统计消费进度，并且设置到 ringBuffer 中
        this.ringBuffer.addGatingSequences(workerPool.getWorkerSequences());
        // 5.启动工作池
        int processorsCount = Runtime.getRuntime().availableProcessors();
        log.info("进程数 -> {}", processorsCount);
        workerPool.start(Executors.newFixedThreadPool(processorsCount));
    }

    public MessageProducer getMessageProducer(int command) {
        MessageProducer messageProducer = producers.get(command);
        if (messageProducer == null) {
            messageProducer = new MessageProducer(this.ringBuffer);
            producers.put(command, messageProducer);
        }
        return messageProducer;
    }

    /**
     * 异常静态类
     */
    @Slf4j
    static class EventExceptionHandler implements ExceptionHandler<TranslatorDataWrapper> {

        @Override
        public void handleEventException(Throwable ex, long sequence, TranslatorDataWrapper event) {
            log.error("handleEventException -> ex:{}  sequence:{} event:{}", ex.getMessage(), sequence, event.getClass().toString());
            ex.printStackTrace();
        }

        @Override
        public void handleOnStartException(Throwable ex) {
            log.error("handleOnStartException -> ex:{}", ex.getMessage());
            ex.printStackTrace();
        }

        @Override
        public void handleOnShutdownException(Throwable ex) {
            log.error("handleOnShutdownException -> ex:{} ", ex.getMessage());
            ex.printStackTrace();
        }
    }

}
```

```java
public Disruptor(
        final EventFactory<T> eventFactory,
        final int ringBufferSize,
        final ThreadFactory threadFactory,
        final ProducerType producerType,
        final WaitStrategy waitStrategy)
{
    this(
        RingBuffer.create(producerType, eventFactory, ringBufferSize, waitStrategy),
        new BasicExecutor(threadFactory));
}
```

- `eventFactory`：在环形缓冲区中创建事件的 factory；
- `ringBufferSize`：环形缓冲区的大小，必须是 2 的幂；
- `threadFactory`：用于为处理器创建线程；
- `producerType`：生成器类型以支持使用正确的 `sequencer` 和 `publisher` 创建 `RingBuffer`；枚举类型，`SINGLE`、`MULTI` 两个项。对应于 `SingleProducerSequencer` 和 `MultiProducerSequencer` 两种 `Sequencer`；
- `waitStrategy`：等待策略；

### 启动

```java
public static void main(String[] args) {
    SpringApplication.run(YukoApplication.class, args);

    // 启动 disruptor
    MessageConsumer[] consumers = new MessageConsumer[8];
    for (int i = 0; i < consumers.length; i++) {
        MessageConsumer messageConsumer = new MessageConsumer();
        consumers[i] = messageConsumer;
    }
    RingBufferWorkerPoolFactory factory = SpringUtil.getBean(RingBufferWorkerPoolFactory.class);
    factory.initAndStart(consumers);
}
```

### 测试消息生产消费

```java
private RingBufferWorkerPoolFactory getWorkerPoolFactory() {
    return SpringUtil.getBean(RingBufferWorkerPoolFactory.class);
}

@Scheduled(fixedDelay = 1000, initialDelay = 3000)
private void msg() {
    IntStream.range(1, 9).forEach(i -> {
        int command = i % 2 == 0 ? IDisruptorCommand.CHECK_MSG_HELLO : IDisruptorCommand.CHECK_MSG_HI;
        TranslatorDataWrapper wrapper = new TranslatorDataWrapper(command, "WORLD");
        MessageProducer messageProducer = getWorkerPoolFactory().getMessageProducer(command);
        messageProducer.publish(command, wrapper);
    });
}
```

```
2020-06-13 09:45:09.404  INFO 21580 --- [pool-1-thread-1] c.c.y.d.consumer.MessageConsumer  : 消费消息 =============== hello
2020-06-13 09:45:09.404  INFO 21580 --- [pool-1-thread-7] c.c.y.d.consumer.MessageConsumer  : 消费消息 =============== hi
2020-06-13 09:45:09.404  INFO 21580 --- [pool-1-thread-6] c.c.y.d.consumer.MessageConsumer  : 消费消息 =============== hello
2020-06-13 09:45:09.404  INFO 21580 --- [pool-1-thread-3] c.c.y.d.consumer.MessageConsumer  : 消费消息 =============== hi
2020-06-13 09:45:09.404  INFO 21580 --- [pool-1-thread-2] c.c.y.d.consumer.MessageConsumer  : 消费消息 =============== hello
2020-06-13 09:45:09.404  INFO 21580 --- [pool-1-thread-4] c.c.y.d.consumer.MessageConsumer  : 消费消息 =============== hi
2020-06-13 09:45:09.404  INFO 21580 --- [pool-1-thread-5] c.c.y.d.consumer.MessageConsumer  : 消费消息 =============== hello
```

## 一些方案

### 规避数据覆盖

使用 Disruptor，首先需要构建一个 RingBuffer，并指定一个大小，注意如果 RingBuffer 里面数据超过了这个大小则会覆盖旧数据。这可能是一个风险，但 Disruptor 提供了检查 RingBuffer 是否写满的机制用于规避这个问题。

```java
// if capacity less than 10%, don't use ringbuffer anymore
if(ringBuffer.remainingCapacity() < RING_SIZE * 0.1) {
    log.warn("disruptor:ringbuffer avaliable capacity is less than 10 %");
    return;
}
// Publishers claim events in sequence
long sequence = ringBuffer.next();
try {
    TranslatorDataWrapper wrapper = ringBuffer.get(sequence);
    wrapper.setCommand(command);
    wrapper.setTarget(object);
} finally {
    ringBuffer.publish(sequence);
}
```

Bless Bless!

参考文章：  
[高性能队列 Disruptor 的使用](https://www.jianshu.com/p/8473bbb556af)  
[蚂蚁金服分布式链路跟踪组件 SOFATracer 中 Disruptor 实践](https://www.sofastack.tech/blog/sofa-trcaer-disruptor-practice/)
