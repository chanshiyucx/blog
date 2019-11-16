# Spring Boot 技术整合

## 拦截器

- 使用注解 `@Configuration` 配置拦截器
- 实现 `WebMvcConfigurer` 接口
- 重写 `addInterceptors` 添加需要的拦截器地址

```java
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new TwoInterceptor()).addPathPatterns("/category/**");
        registry.addInterceptor(new OneInterceptor()).addPathPatterns("/category/**");
    }

}
```

拦截器 `OneInterceptor`：

```java
public class OneInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        System.out.println("被 OneInterceptor 拦截，放行...");
        return true;
    }

}
```

拦截器 `TwoInterceptor`：

```java
public class TwoInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        System.out.println("被 TwoInterceptor 拦截，阻拦");
        return false;
    }

}
```

需要注意：拦截器按其被添加的顺序执行，如果先被拦截后未放行，则不会执行后续的拦截器。

## AOP

AOP 是一种编程范式，与语言无关，是一种程序设计思想。

- AOP，Aspect Oriented Programing，面向切面
- OOP，Object Oriented Programing，面向对象
- POP，Procedure Oriented Programming，面向过程

```java
@Aspect
@Component
@Slf4j
public class HttpAspect {

    @Pointcut("execution(public * com.chanshiyu.controller.Buyer.BuyerProductController.*(..))")
    public void log() {
    }

    @Before("log()")
    public void doBefore(JoinPoint joinPoint) {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        HttpServletRequest request = attributes.getRequest();

        // url
        log.info("url={}", request.getRequestURL());

        // method
        log.info("method={}", request.getMethod());

        // ip
        log.info("ip={}", request.getRemoteAddr());

        // 类方法
        log.info("class_path={}", joinPoint.getSignature().getDeclaringTypeName() + "." + joinPoint.getSignature().getName());

        // 参数
        log.info("args={}", joinPoint.getArgs());
    }

    @After("log()")
    public void doAfter() {
        log.info("doAfter");
    }

    @AfterReturning(returning = "object", pointcut = "log()")
    public void afterReturning(Object object) {
        log.info("response={}", object);
    }
}
```
