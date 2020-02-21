# Java-Servlet

## Web 容器是什么？

早期的 Web 应用主要用于浏览新闻等静态页面，HTTP 服务器（比如 Apache、Nginx）向浏览器返回静态 HTML，浏览器负责解析 HTML，将结果呈现给用户。

随着互联网的发展，我们已经不满足于仅仅浏览静态页面，还希望通过一些交互操作，来获取动态结果，因此也就需要一些扩展机制能够让 HTTP 服务器调用服务端程序。

于是 Sun 公司推出了 Servlet 技术。你可以把 Servlet 简单理解为运行在服务端的 Java 小程序，但是 Servlet 没有 main 方法，不能独立运行，因此必须把它部署到 Servlet 容器中，由容器来实例化并调用 Servlet。

Tomcat 和 Jetty 就是一个 Servlet 容器。为了方便使用，它们也具有 HTTP 服务器的功能，因此 Tomcat 或者 Jetty 就是一个“HTTP 服务器 + Servlet 容器”，我们也叫它们 Web 容器。

## Tomcat 与 Jetty 的区别

单纯比较 Tomcat 和 Jetty 的性能意义不是很大，只能说在某些使用场景下它们的表现各有差异，因为它们面向的使用场景不尽相同。

| 容器   | 说明                                                                                                                                  |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| Tomcat | 从架构上来看 Tomcat 在处理少数非常繁忙的连接上更有优势，也就是连接的生命周期如果比较短，Tomcat 的性能比较优                           |
| Jetty  | 可以同时处理大量链接并且长时间的保持这些链接，一些 Web 聊天应用非常适合用 Jetty 服务器，淘宝的 Web 旺旺就是用 Jetty 作为 Servlet 引擎 |

## Servlet 规范和 Servlet 容器

左边：HTTP 服务器直接调用具体业务类，它们是紧耦合的
右边：HTTP 服务器不直接调用业务类，而是把请求交给容器来处理，容器通过 Servlet 接口调用业务类

![Servlet-规范](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2020/Java-Servlet/Servlet-规范.jpg)

要点：

- Servlet 接口和 Servlet 容器这一整套规范叫作 Servlet 规范；
- Servlet 接口和 Servlet 容器的出现，达到了 HTTP 服务器与业务类解耦的目的；
- HTTP 服务器不直接跟业务类打交道，而是把请求交给 Servlet 容器去处理，Servlet 容器会将请求转发到具体的 Servlet，如果这个 Servlet 还没创建，就加载并实例化这个 Servlet，然后调用这个 Servlet 的接口方法；
- Servlet 接口其实是 Servlet 容器跟具体业务类之间的接口，具体业务类只需实现 Servlet 接口；
- Tomcat 和 Jetty 都按照 Servlet 规范的要求实现了 Servlet 容器，同时它们也具有 HTTP 服务器的功能。作为 Java 程序员，如果我们要实现新的业务功能，只需要实现一个 Servlet，并把它注册到 Tomcat（Servlet 容器）中，剩下的事情就由 Tomcat 帮我们处理了。

### 工作流程

当客户请求某个资源时，HTTP 服务器会用一个 ServletRequest 对象把客户的请求信息封装起来，然后调用 Servlet 容器的 service 方法，Servlet 容器拿到请求后，根据请求的 URL 和 Servlet 的映射关系，找到相应的 Servlet，如果 Servlet 还没有被加载，就用反射机制创建这个 Servlet，并调用 Servlet 的 init 方法来完成初始化，接着调用 Servlet 的 service 方法来处理请求，把 ServletResponse 对象返回给 HTTP 服务器，HTTP 服务器会把响应发送给客户端。

### Servlet 接口

```java
public interface Servlet {
    void init(ServletConfig config) throws ServletException;

    ServletConfig getServletConfig();

    void service(ServletRequest req, ServletResponse res）throws ServletException, IOException;

    String getServletInfo();

    void destroy();
}
```

其中最重要是的 service 方法，具体业务类在这个方法里实现处理逻辑。

本质上以下这两个类是对通信协议的封装：

| 参数            | 说明                                                                           |
| --------------- | ------------------------------------------------------------------------------ |
| ServletRequest  | 用来封装请求信息，可以用来创建获取 Session                                     |
| ServletResponse | 用来封装 HTTP 响应信息，比如通过 set\-cookie 将 sessionId 放在 http 的响应头里 |

声明周期相关：

| 方法                       | 说明                                      |
| -------------------------- | ----------------------------------------- |
| init(ServletConfig config) | Servlet 容器在加载 Servlet 类的时候会调用 |
| destroy()                  | 卸载的时候会调用                          |

### Web 应用

Servlet 容器会实例化和调用 Servlet，那 Servlet 是怎么注册到 Servlet 容器中的呢？一般来说，我们是以 Web 应用程序的方式来部署 Servlet 的，而根据 Servlet 规范，Web 应用程序有一定的目录结构，在这个目录下分别放置了 Servlet 的类文件、配置文件以及静态资源，Servlet 容器通过读取配置文件，就能找到并加载 Servlet。Web 应用的目录结构大概是下面这样的：

```
| -  MyWebApp
      | -  WEB-INF/web.xml        -- 配置文件，用来配置Servlet等
      | -  WEB-INF/lib/           -- 存放Web应用所需各种JAR包
      | -  WEB-INF/classes/       -- 存放你的应用类，比如Servlet类
      | -  META-INF/              -- 目录存放工程的一些信息
```

Servlet 规范里定义了 `ServletContext` 这个接口来对应一个 Web 应用。Web 应用部署好后，Servlet 容器在启动时会加载 Web 应用，并为每个 Web 应用创建唯一的 `ServletContext` 对象。你可以把 `ServletContext` 看成是一个全局对象，一个 Web 应用可能有多个 Servlet，这些 Servlet 可以通过全局的 `ServletContext` 来共享数据，这些数据包括 Web 应用的初始化参数、Web 应用目录下的文件资源等。由于 `ServletContext` 持有所有 Servlet 实例，你还可以通过它来实现 Servlet 请求的转发。

### 扩展机制

Servlet 规范提供了两种扩展机制：`Filter` 和 `Listener`：

- `Filter` 是过滤器，这个接口允许你对请求和响应做一些统一的定制化处理，比如你可以根据请求的频率来限制访问，或者根据国家地区的不同来修改响应内容。过滤器的工作原理是这样的：Web 应用部署完成后，Servlet 容器需要实例化 `Filter` 并把 `Filter` 链接成一个 `FilterChain`。当请求进来时，获取第一个 `Filter` 并调用 `doFilter` 方法，`doFilter` 方法负责调用这个 `FilterChain` 中的下一个 `Filter`。
- `Listener` 是监听器，这是另一种扩展机制。当 Web 应用在 Servlet 容器中运行时，Servlet 容器内部会不断的发生各种事件，如 Web 应用的启动和停止、用户请求到达等。Servlet 容器提供了一些默认的监听器来监听这些事件，当事件发生时，Servlet 容器会负责调用监听器的方法。当然，你可以定义自己的监听器去监听你感兴趣的事件，将监听器配置在 web.xml 中。比如 Spring 就实现了自己的监听器，来监听 `ServletContext` 的启动事件，目的是当 Servlet 容器启动时，创建并初始化全局的 Spring 容器。

`Filter` 和 `Listener` 的本质区别：

| 本质     | 区别                                                       |
| -------- | ---------------------------------------------------------- |
| Filter   | 是干预过程的，它是过程的一部分，是基于过程行为的           |
| Listener | 是基于状态的，任何行为改变同一个状态，触发的事件是一致的。 |

## 总结

- Servlet 接口和 Servlet 容器这一整套规范叫作 Servlet 规范；
- 引入 Servlet 规范后，不需要关心 Socket 网络通信、不需要关心 HTTP 协议，也不需要关心你的业务类是如何被实例化和调用的，因为这些都被 Servlet 规范标准化了，你只要关心怎么实现的你的业务逻辑；
- Servlet 规范里定义了 `ServletContext` 这个接口来对应一个 Web 应用，可以看成一个全局对象，Servlet 可以通过全局的 Servlet 来共享数据；
- 由于 `ServletContext` 持有所有 Servlet 实例，你还可以通过它来实现 Servlet 请求的转发；
- Servlet 规范使得程序员可以专注业务逻辑的开发，同时 Servlet 规范也给开发者提供了扩展的机制 `Filter` 和 `Listener`。
