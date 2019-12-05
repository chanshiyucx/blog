# Docker RocketMQ

## RocketMQ 简介

Message Queue（MQ，消息队列中间件）作为高并发系统的核心组件之一，能够帮助业务系统解构提升开发效率和系统稳定性。主要具有以下优势：

- 削峰填谷：主要解决瞬时写压力大于应用服务能力导致消息丢失、系统奔溃等问题
- 系统解耦：解决不同重要程度、不同能力级别系统之间依赖导致一死全死
- 提升性能：当存在一对多调用时，可以发一条消息给消息系统，让消息系统通知相关系统
- 蓄流压测：线上有些链路不好压测，可以通过堆积一定量消息再放开来压测

消息中间件中有两个角色：消息生产者和消息消费者。RocketMQ 里同样有这两个概念，消息生产者负责创建消息并发送到 RocketMQ 服务器，RocketMQ 服务器会将消息持久化到磁盘，消息消费者从 RocketMQ 服务器拉取消息并提交给应用消费。

RocketMQ 是一款分布式、队列模型的消息中间件，具有以下特点：

- 支持严格的消息顺序
- 支持 Topic 与 Queue 两种模式
- 亿级消息堆积能力
- 比较友好的分布式特性
- 同时支持 Push 与 Pull 方式消费消息

RocketMQ 优势：

- 支持事务型消息（消息发送和 DB 操作保持两方的最终一致性，RabbitMQ 和 Kafka 不支持）
- 支持结合 RocketMQ 的多个系统之间数据最终一致性（多方事务，二方事务是前提）
- 支持 18 个级别的延迟消息（RabbitMQ 和 Kafka 不支持）
- 支持指定次数和时间间隔的失败消息重发（Kafka 不支持，RabbitMQ 需要手动确认）
- 支持 Consumer 端 Tag 过滤，减少不必要的网络传输（RabbitMQ 和 Kafka 不支持）
- 支持重复消费（RabbitMQ 不支持，Kafka 支持）

RocketMQ 有 namesrv 和 broker 组成。

namesrv 的功能如下：

- 接收 broker 的请求注册 broker 路由信息（master 和 slave）
- 接收 client 的请求根据某个 topic 获取所有到 broker 的路由信息

broker 则是 RocketMQ 真正存储消息的地方，broker 消息存储主要包括 3 个部分，分别 commitLog 的存储、consumeQueue 的存储、index 的存储。

Producer 和 Consumer 都是通过 namesrv 获取 broker 路由信息，连接到 broker 生产消费消息，namesrv 和 broker 可以分别集群部署，生产者消费者同样可以分别集群部署，物理部署架构图如下：

![RocketMQ](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/Docker-RocketMQ/RocketMQ.jpg)

## Docker 安装 RocketMQ

### docker-compose.yml

```yml
version: '3.5'
services:
  rmqnamesrv:
    image: foxiswho/rocketmq:server
    container_name: rmqnamesrv
    ports:
      - 9876:9876
    volumes:
      - ./data/logs:/opt/logs
      - ./data/store:/opt/store
    networks:
      rmq:
        aliases:
          - rmqnamesrv

  rmqbroker:
    image: foxiswho/rocketmq:broker
    container_name: rmqbroker
    ports:
      - 10909:10909
      - 10911:10911
    volumes:
      - ./data/logs:/opt/logs
      - ./data/store:/opt/store
      - ./data/brokerconf/broker.conf:/etc/rocketmq/broker.conf
    environment:
      NAMESRV_ADDR: 'rmqnamesrv:9876'
      JAVA_OPTS: ' -Duser.home=/opt'
      JAVA_OPT_EXT: '-server -Xms128m -Xmx128m -Xmn128m'
    command: mqbroker -c /etc/rocketmq/broker.conf
    depends_on:
      - rmqnamesrv
    networks:
      rmq:
        aliases:
          - rmqbroker

  rmqconsole:
    image: styletang/rocketmq-console-ng
    container_name: rmqconsole
    ports:
      - 8080:8080
    environment:
      JAVA_OPTS: '-Drocketmq.namesrv.addr=rmqnamesrv:9876 -Dcom.rocketmq.sendMessageWithVIPChannel=false'
    depends_on:
      - rmqnamesrv
    networks:
      rmq:
        aliases:
          - rmqconsole

networks:
  rmq:
    name: rmq
    driver: bridge
```

需要注意 rocketmq-broker 与 rokcetmq-console 都需要与 rokcetmq-nameserver 连接，需要知道 nameserver ip。使用 docker-compose 之后，上面三个 docker 容器将会一起编排，**可以直接使用容器名代替容器 ip，如这里 nameserver 容器名 rmqnamesrv**。

### broker.conf

RocketMQ Broker 需要一个配置文件，按照上面的 Compose 配置，在 `./data/brokerconf/` 目录下创建一个名为 `broker.conf` 的配置文件，内容如下：

```conf
censed to the Apache Software Foundation (ASF) under one or more
# contributor license agreements.  See the NOTICE file distributed with
# this work for additional information regarding copyright ownership.
# The ASF licenses this file to You under the Apache License, Version 2.0
# (the "License"); you may not use this file except in compliance with
# the License.  You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.


# 所属集群名字
brokerClusterName=DefaultCluster

# broker 名字，注意此处不同的配置文件填写的不一样，如果在 broker-a.properties 使用: broker-a,
# 在 broker-b.properties 使用: broker-b
brokerName=broker-a

# 0 表示 Master，> 0 表示 Slave
brokerId=0

# nameServer地址，分号分割
# namesrvAddr=rocketmq-nameserver1:9876;rocketmq-nameserver2:9876

# 启动IP,如果 docker 报 com.alibaba.rocketmq.remoting.exception.RemotingConnectException: connect to <192.168.0.120:10909> failed
# 解决方式1 加上一句 producer.setVipChannelEnabled(false);，解决方式2 brokerIP1 设置宿主机IP，不要使用docker 内部IP
brokerIP1=192.168.205.10

# 在发送消息时，自动创建服务器不存在的topic，默认创建的队列数
defaultTopicQueueNums=4

# 是否允许 Broker 自动创建 Topic，建议线下开启，线上关闭 ！！！这里仔细看是 false，false，false
autoCreateTopicEnable=true

# 是否允许 Broker 自动创建订阅组，建议线下开启，线上关闭
autoCreateSubscriptionGroup=true

# Broker 对外服务的监听端口
listenPort=10911

# 删除文件时间点，默认凌晨4点
deleteWhen=04

# 文件保留时间，默认48小时
fileReservedTime=120

# commitLog 每个文件的大小默认1G
mapedFileSizeCommitLog=1073741824

# ConsumeQueue 每个文件默认存 30W 条，根据业务情况调整
mapedFileSizeConsumeQueue=300000

# destroyMapedFileIntervalForcibly=120000
# redeleteHangedFileInterval=120000
# 检测物理文件磁盘空间
diskMaxUsedSpaceRatio=88
# 存储路径
# storePathRootDir=/home/ztztdata/rocketmq-all-4.1.0-incubating/store
# commitLog 存储路径
# storePathCommitLog=/home/ztztdata/rocketmq-all-4.1.0-incubating/store/commitlog
# 消费队列存储
# storePathConsumeQueue=/home/ztztdata/rocketmq-all-4.1.0-incubating/store/consumequeue
# 消息索引存储路径
# storePathIndex=/home/ztztdata/rocketmq-all-4.1.0-incubating/store/index
# checkpoint 文件存储路径
# storeCheckpoint=/home/ztztdata/rocketmq-all-4.1.0-incubating/store/checkpoint
# abort 文件存储路径
# abortFile=/home/ztztdata/rocketmq-all-4.1.0-incubating/store/abort
# 限制的消息大小
maxMessageSize=65536

# flushCommitLogLeastPages=4
# flushConsumeQueueLeastPages=2
# flushCommitLogThoroughInterval=10000
# flushConsumeQueueThoroughInterval=60000

# Broker 的角色
# - ASYNC_MASTER 异步复制Master
# - SYNC_MASTER 同步双写Master
# - SLAVE
brokerRole=ASYNC_MASTER

# 刷盘方式
# - ASYNC_FLUSH 异步刷盘
# - SYNC_FLUSH 同步刷盘
flushDiskType=ASYNC_FLUSH

# 发消息线程池数量
# sendMessageThreadPoolNums=128
# 拉消息线程池数量
# pullMessageThreadPoolNums=128
```

精简配置文件：

```
brokerClusterName = DefaultCluster
brokerName = broker-a
brokerId = 0
deleteWhen = 04
fileReservedTime = 48
brokerRole = ASYNC_MASTER
flushDiskType = ASYNC_FLUSH
brokerIP1=192.168.205.10
```

配置完成，启动：

```bash
docker-compose up -d
```

访问 `http://rmqIP:8080` 进入控制台。

![RocketMQ控制台](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/Docker-RocketMQ/RocketMQ控制台.png)

## Spring Cloud Stream

Spring Cloud Stream 是一个用于构建基于消息的微服务应用框架。它基于 SpringBoot 来创建具有生产级别的单机 Spring 应用，并且使用 `Spring Integration` 与 Broker 进行连接。

Spring Cloud Stream 提供了消息中间件配置的统一抽象，推出了 publish-subscribe、consumer groups、partition 这些统一的概念（Kafka、RabbitMQ、RocketMQ 都是消息中间件）。

Spring Cloud Stream 内部有两个概念：`Binder` 和 `Binding`。

**Binder: 跟外部消息中间件集成的组件，用来创建 Binding，各消息中间件都有自己的 Binder 实现。**

比如 Kafka 的实现 KafkaMessageChannelBinder，RabbitMQ 的实现 RabbitMessageChannelBinder 以及 RocketMQ 的实现 RocketMQMessageChannelBinder。

**Binding: 包括 Input Binding 和 Output Binding。**

Binding 在消息中间件与应用程序提供的 Provider 和 Consumer 之间提供了一个桥梁，实现了开发者只需使用应用程序的 Provider 或 Consumer 生产或消费数据即可，屏蔽了开发者与底层消息中间件的接触。

![RocketMQ中间件](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/Docker-RocketMQ/RocketMQ中间件.png)

## 使用

这里只展示最简单 Demo，更多栗子可以参考 [spring cloud alibaba rocketmq](https://github.com/alibaba/spring-cloud-alibaba/blob/master/spring-cloud-alibaba-examples/rocketmq-example/rocketmq-produce-example/src/main/java/com/alibaba/cloud/examples/RocketMQProduceApplication.java)

### 接入

1. 首先，修改 pom.xml 文件，引入 RocketMQ Stream Starter。

```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-stream-rocketmq</artifactId>
</dependency>
```

2. 配置 Input 和 Output 的 Binding 信息并配合 `@EnableBinding` 注解使其生效

```yml
spring:
  cloud:
    stream:
      # 配置 rocketmq 的 nameserver 地址
      rocketmq:
        binder:
          name-server: 192.168.205.4:9876
      # 配置 input 和 output binding
      bindings:
        input:
          content-type: text/plain
          destination: test-topic
          group: test-group
        output:
          content-type: text/plain
          destination: test-topic
```

```java
@SpringBootApplication
@EnableBinding({ Source.class, Sink.class })
public class AdminApplication {
    public static void main(String[] args) {
        SpringApplication.run(RocketMQApplication.class, args);
    }
}
```

### 消息生产者

消息发送服务 SenderService：

```java
@Service
public class SenderService {

    @Autowired
    private MessageChannel output;

    public void send(String msg) throws Exception {
        output.send(MessageBuilder.withPayload(msg).build());
    }

    public <T> void sendWithTags(T msg, String tag) throws Exception {
        Message message = MessageBuilder.createMessage(msg,
                new MessageHeaders(Stream.of(tag).collect(Collectors
                        .toMap(str -> MessageConst.PROPERTY_TAGS, String::toString))));
        output.send(message);
    }

    public <T> void sendObject(T msg, String tag) throws Exception {
        Message message = MessageBuilder.withPayload(msg)
                .setHeader(MessageConst.PROPERTY_TAGS, tag)
                .setHeader(MessageHeaders.CONTENT_TYPE, MimeTypeUtils.APPLICATION_JSON)
                .build();
        output.send(message);
    }

    public <T> void sendTransactionalMsg(T msg, int num) throws Exception {
        MessageBuilder builder = MessageBuilder.withPayload(msg)
                .setHeader(MessageHeaders.CONTENT_TYPE, MimeTypeUtils.APPLICATION_JSON);
        builder.setHeader("test", String.valueOf(num));
        builder.setHeader(RocketMQHeaders.TAGS, "binder");
        Message message = builder.build();
        output.send(message);
    }
}
```

发送消息：

```java
@Bean
public CustomRunner customRunner() {
    return new CustomRunner("output");
}

public static class CustomRunner implements CommandLineRunner {

    private final String bindingName;

    public CustomRunner(String bindingName) {
        this.bindingName = bindingName;
    }

    @Autowired
    private SenderService senderService;

    @Override
    public void run(String... args) throws Exception {
        if (this.bindingName.equals("output")) {
            int count = 5;
            for (int index = 1; index <= count; index++) {
                String msgContent = "msg-" + index;
                if (index % 3 == 0) {
                    senderService.send(msgContent);
                }
                else if (index % 3 == 1) {
                    senderService.sendWithTags(msgContent, "tagStr");
                }
                else {
                    senderService.sendObject(new Foo(index, "foo"), "tagObj");
                }
            }
        }
    }
}

@Data
public static class Foo {
    private Integer inx;
    private String msg;

    Foo(Integer inx, String msg) {
        this.inx = inx;
        this.msg = msg;
    }
}
```

### 消息消费者

消息接收服务 ReceiveService：

```java
@Service
public class ReceiveService {

    @StreamListener("input")
    public void receiveInput1(String receiveMsg) {
        System.out.println("input receive: " + receiveMsg);
    }
}
```

参考文章：  
[基于 Docker 安装 RocketMQ](https://www.funtl.com/zh/spring-cloud-alibaba/%E5%9F%BA%E4%BA%8E-Docker-%E5%AE%89%E8%A3%85-RocketMQ.html)  
[rocketmq 部署启动指南-Docker 版](http://www.justdojava.com/2019/08/26/rocketmq-creator/)  
[Spring Alibaba RocketMQ](https://github.com/alibaba/spring-cloud-alibaba/blob/master/spring-cloud-alibaba-examples/rocketmq-example/readme-zh.md)
