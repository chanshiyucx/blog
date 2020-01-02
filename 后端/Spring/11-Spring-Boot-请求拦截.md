# Spring Boot 请求拦截

在 Spring Boot 中，请求拦截有如下三种方式：

- 过滤器（Filter）
- 拦截器（Interceptor）
- 切片（Aspect）

三种方式的请求拦截顺序：

![请求拦截模型](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/SpringBoot-请求拦截/请求拦截模型.png)

## AOP

AOP（面向切面编程）不是一种具体的技术，而是一种编程思想。

- AOP，Aspect Oriented Programing，面向切面
- OOP，Object Oriented Programing，面向对象
- POP，Procedure Oriented Programming，面向过程

在面向对象编程的过程中，我们很容易通过继承、多态来解决纵向扩展。但是对于横向的功能，比如，在所有的 service 方法中开启事务，或者统一记录日志等功能，面向对象的是无法解决的。所以 AOP 其实是面向对象编程思想的一个补充。而过滤器和拦截器都属于面向切面编程的具体实现。

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

需要注意：`@WebFilter` 这个注解并没有指定执行顺序的属性，其执行顺序依赖于 Filter 的名称，是根据 Filter 类名（注意不是配置的 filter 的名字）的字母顺序倒序排列。

## 拦截器

拦截器需要实现 `HandlerInterceptor` 这个接口，该接口包含三个方法：

- `preHandle` 是请求执行前执行
- `postHandler` 是请求成功执行，如果接口方法抛出异常不会执行，且只有 `preHandle` 方法返回 true 的时候才会执行，
- `afterCompletion` 是请求结束才执行，无论请求成功或失败都会执行，同样需要 `preHandle` 返回 true，该方法通常用于清理资源等工作

```java
@Component
public class TimeInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        System.out.println("请求执行之前");
        System.out.println(((HandlerMethod) handler).getBean().getClass().getName()); // com.chanshiyu.moemall.admin.controller.TestController
        System.out.println(((HandlerMethod) handler).getMethod().getName()); // test
        request.setAttribute("startTime", new Date().getTime());
        return true;
    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
        System.out.println("请求执行成功");
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        Long start = (Long) request.getAttribute("startTime");
        System.out.println("请求执行完毕，总耗时：" + (new Date().getTime() - start));
    }

}
```

拦截器除了使用 `@Component` 注解外还需要引入：

```java
@Configuration
public class WebConfig extends WebMvcConfigurationSupport {

    @Autowired TimeInterceptor timeInterceptor;

    @Override
    protected void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(timeInterceptor).addPathPatterns("/**");
        super.addInterceptors(registry);
    }

}
```

拦截器相比过滤器，能拿到控制器类和方法，但是依旧无法拿到请求参数。

## 切片

```java
@Aspect
@Component
public class TimeAspect {

    @Around("execution(* com.chanshiyu.moemall.admin.controller.*.*(..))")
    public Object handleControllerMethod(ProceedingJoinPoint pjp) throws Throwable {
        System.out.println("Time Aspect Start");
        Object[] args = pjp.getArgs();
        for (Object arg : args) {
            System.out.println("arg: " + arg);
        }

        TimeInterval timer = DateUtil.timer();
        Object object = pjp.proceed();

        System.out.println("总耗时：" + timer.interval());
        return object;
    }

}
```

参考文章：  
[Spring Boot 实战：拦截器与过滤器](https://www.cnblogs.com/paddix/p/8365558.html)
