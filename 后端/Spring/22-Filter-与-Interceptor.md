[Filter 与 Interceptor](http://www.zimug.com/other/springboot/spring-%e9%87%8c%e9%82%a3%e4%b9%88%e5%a4%9a%e7%a7%8d-cors-%e7%9a%84%e9%85%8d%e7%bd%ae%e6%96%b9%e5%bc%8f%ef%bc%8c%e5%88%b0%e5%ba%95%e6%9c%89%e4%bb%80%e4%b9%88%e5%8c%ba%e5%88%ab/.html)

上图很形象的说明了 Filter 与 Interceptor 的区别，一个作用在 DispatcherServlet 调用前，一个作用在调用后。

但实际上，它们本身并没有任何关系，是完全独立的概念。

Filter 由 Servlet 标准定义，要求 Filter 需要在 Servlet 被调用之前调用，作用顾名思义，就是用来过滤请求。在 Spring Web 应用中，DispatcherServlet 就是唯一的 Servlet 实现。

Interceptor 由 Spring 自己定义，由 DispatcherServlet 调用，可以定义在 Handler 调用前后的行为。这里的 Handler，在多数情况下，就是我们的 Controller 中对应的方法。
