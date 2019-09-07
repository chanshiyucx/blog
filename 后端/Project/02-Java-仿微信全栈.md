# Java 仿微信全栈

## Netty 介绍

Netty 是一个提供了易于使用的 API 客户端/服务器框架。特性：

- 高并发 - NIO（非阻塞 IO）
- 传输快 - 零拷贝

阻塞与非阻塞：线程访问资源，该资源是否准备就绪的一种处理方式。阻塞会一直等待资源就绪，而非阻塞会立即响应结果，先处理其他资源。

同步和异步：访问数据的一种机制。

### BIO、NIO、AIO

![阻塞与非阻塞](https://raw.githubusercontent.com/chanshiyucx/poi/master/2019/Java%E4%BB%BF%E5%BE%AE%E4%BF%A1%E5%85%A8%E6%A0%88/01_%E9%98%BB%E5%A1%9E%E4%B8%8E%E9%9D%9E%E9%98%BB%E5%A1%9E.png)

![同步与异步](https://raw.githubusercontent.com/chanshiyucx/poi/master/2019/Java%E4%BB%BF%E5%BE%AE%E4%BF%A1%E5%85%A8%E6%A0%88/02_%E5%90%8C%E6%AD%A5%E4%B8%8E%E5%BC%82%E6%AD%A5.png)

![BIO](https://raw.githubusercontent.com/chanshiyucx/poi/master/2019/Java%E4%BB%BF%E5%BE%AE%E4%BF%A1%E5%85%A8%E6%A0%88/03_BIO.png)

![NIO](https://raw.githubusercontent.com/chanshiyucx/poi/master/2019/Java%E4%BB%BF%E5%BE%AE%E4%BF%A1%E5%85%A8%E6%A0%88/04_NIO.png)

![AIO](https://raw.githubusercontent.com/chanshiyucx/poi/master/2019/Java%E4%BB%BF%E5%BE%AE%E4%BF%A1%E5%85%A8%E6%A0%88/05_AIO.png)

![生活实例](https://raw.githubusercontent.com/chanshiyucx/poi/master/2019/Java%E4%BB%BF%E5%BE%AE%E4%BF%A1%E5%85%A8%E6%A0%88/06_%E7%94%9F%E6%B4%BB%E5%AE%9E%E4%BE%8B.png)

![三者区别](https://raw.githubusercontent.com/chanshiyucx/poi/master/2019/Java%E4%BB%BF%E5%BE%AE%E4%BF%A1%E5%85%A8%E6%A0%88/07_%E4%B8%89%E8%80%85%E5%8C%BA%E5%88%AB.png)

### Reactor 线程模型

![单线程模型](https://raw.githubusercontent.com/chanshiyucx/poi/master/2019/Java%E4%BB%BF%E5%BE%AE%E4%BF%A1%E5%85%A8%E6%A0%88/08_%E5%8D%95%E7%BA%BF%E7%A8%8B%E6%A8%A1%E5%9E%8B.png)

![多线程模型](https://raw.githubusercontent.com/chanshiyucx/poi/master/2019/Java%E4%BB%BF%E5%BE%AE%E4%BF%A1%E5%85%A8%E6%A0%88/09_%E5%A4%9A%E7%BA%BF%E7%A8%8B%E6%A8%A1%E5%9E%8B.png)

![主从线程模型](https://raw.githubusercontent.com/chanshiyucx/poi/master/2019/Java%E4%BB%BF%E5%BE%AE%E4%BF%A1%E5%85%A8%E6%A0%88/10_%E4%B8%BB%E4%BB%8E%E7%BA%BF%E7%A8%8B%E6%A8%A1%E5%9E%8B.png)

## Netty 服务器

Netty 服务器流程

- 构建一对主从线程组
- 定义服务器启动类
- 为服务器设置 Channel
- 设置处理从线程池的助手类初始化器
- 监听启动和关闭服务器

![channel 初始化器](https://raw.githubusercontent.com/chanshiyucx/poi/master/2019/Java%E4%BB%BF%E5%BE%AE%E4%BF%A1%E5%85%A8%E6%A0%88/11_channel%20%E5%88%9D%E5%A7%8B%E5%8C%96%E5%99%A8.png)
