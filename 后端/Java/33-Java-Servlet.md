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

![Servlet-规范](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2020/Java-Servlet/Servlet-规范.png)

要点：

- Servlet 接口和 Servlet 容器这一整套规范叫作 Servlet 规范；
- Servlet 接口和 Servlet 容器的出现，达到了 HTTP 服务器与业务类解耦的目的；
- HTTP 服务器不直接跟业务类打交道，而是把请求交给 Servlet 容器去处理，Servlet 容器会将请求转发到具体的 Servlet，如果这个 Servlet 还没创建，就加载并实例化这个 Servlet，然后调用这个 Servlet 的接口方法；
- Servlet 接口其实是 Servlet 容器跟具体业务类之间的接口，具体业务类只需实现 Servlet 接口；
- Servlet 接口和 Servlet 容器这一整套规范叫作 Servlet 规范。Tomcat 和 Jetty 都按照 Servlet 规范的要求实现了 Servlet 容器，同时它们也具有 HTTP 服务器的功能。作为 Java 程序员，如果我们要实现新的业务功能，只需要实现一个 Servlet，并把它注册到 Tomcat（Servlet 容器）中，剩下的事情就由 Tomcat 帮我们处理了。
