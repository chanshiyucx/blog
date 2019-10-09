# Spring Boot 请求拦截

在 Spring Boot 中，请求拦截有如下三种方式：

- 过滤器（Filter）
- 拦截器（Interceptor）
- 切片（Aspect）

## AOP

AOP（面向切面编程）不是一种具体的技术，而是一种编程思想。在面向对象编程的过程中，我们很容易通过继承、多态来解决纵向扩展。但是对于横向的功能，比如，在所有的 service 方法中开启事务，或者统一记录日志等功能，面向对象的是无法解决的。所以 AOP 其实是面向对象编程思想的一个补充。而过滤器和拦截器都属于面向切面编程的具体实现。

过滤器和拦截器，这两者在功能方面很类似，但是在具体技术实现方面，差距还是比较大的。两者的主要区别包括以下几个方面：

1. Filter 是依赖于 Servlet 容器，属于 Servlet 规范的一部分，而拦截器则是独立存在的，可以在任何情况下使用。
2. Filter 的执行由 Servlet 容器回调完成，而拦截器通常通过动态代理的方式来执行。
3. Filter 的生命周期由 Servlet 容器管理，而拦截器则可以通过 IoC 容器来管理，因此可以通过注入等方式来获取其他 Bean 的实例，因此使用会更方便。

## 过滤器

```java
@Component
public class TimeFilter implements Filter {
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        System.out.println("Timer Filter Init");
    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        TimeInterval timer = DateUtil.timer();
        filterChain.doFilter(servletRequest, servletResponse);
        System.out.println("总耗时：" + timer.interval());
    }

    @Override
    public void destroy() {
        System.out.println("Timer Filter Destroy");
    }
}
```

这里通过 `@Component` 注解注入了 `TimeFilter` 过滤器，在项目中我们可能会引用第三方的过滤器，如果第三方过滤器没有使用 `@Component` 注解，就需要我们手动引入：

```java
@Configuration
public class WebConfig {

    @Bean
    public FilterRegistrationBean timeFilter() {
        FilterRegistrationBean registrationBean = new FilterRegistrationBean();
        TimeFilter timeFilter = new TimeFilter();
        registrationBean.setFilter(timeFilter);

        // 设置url匹配路径、名称和执行顺序
        List<String> urls= new ArrayList<>();
        urls.add("/*");
        registrationBean.setUrlPatterns(urls);
        registrationBean.setName("TimeFilter");
        registrationBean.setOrder(1);

        return registrationBean;
    }

}
```

再或者也可以使用 Servlet 提供的注解启动。先在启动类里添加 `@ServletComponetScan` 指定扫描的包：

```java
@ServletComponentScan("com.pandy.blog.filters")
```

再使用 `@WebFilter` 注解添加 Filter：

```java
@WebFilter(urlPatterns = "/*", filterName = "TimeFilter")
public class TimeFilter implements Filter {
    /* ... */
}
```
