# AOP

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
