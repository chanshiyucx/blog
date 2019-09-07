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

## FastDFS 文件服务器

FastDFS 是一个开源的轻量级分布式文件系统，它对文件进行管理，功能包括：文件存储、文件同步、文件访问（文件上传、文件下载）等，解决了大容量存储和负载均衡的问题。

FastDFS 为互联网量身定制，充分考虑了冗余备份、负载均衡、线性扩容等机制，并注重高可用、高性能等指标，使用 FastDFS 很容易搭建一套高性能的文件服务器集群提供文件上传、下载等服务。

FastDFS 服务端有两个角色：跟踪器（tracker）和存储节点（storage）。跟踪器主要做调度工作，在访问上起负载均衡的作用。

存储节点存储文件，完成文件管理的所有功能：就是这样的存储、同步和提供存取接口，FastDFS 同时对文件的 metadata 进行管理。所谓文件的 meta data 就是文件的相关属性，以键值对（key valuepair）方式表示，如：width=1024，其中的 key 为 width，value 为 1024。文件 metadata 是文件属性列表，可以包含多个键值对。

跟踪器和存储节点都可以由一台或多台服务器构成。跟踪器和存储节点中的服务器均可以随时增加或下线而不会影响线上服务。其中跟踪器中的所有服务器都是对等的，可以根据服务器的压力情况随时增加或减少。

### 上传交互过程

- client 询问 tracker 上传到的 storage，不需要附加参数
- tracker 返回一台可用的 storage
- client 直接和 storage 通讯完成文件上传

### 下载交互过程

- client 询问 tracker 下载文件的 storage，参数为文件标识（卷名和文件名）
- tracker 返回一台可用的 storage
- client 直接和 storage 通讯完成文件下载

![fastdfs](https://raw.githubusercontent.com/chanshiyucx/poi/master/2019/Java%E4%BB%BF%E5%BE%AE%E4%BF%A1%E5%85%A8%E6%A0%88/12_fastdfs.jpg)
