# Spring Boot Aspect

AOP 是一种与语言无关的程序思想、编程范式。项目业务逻辑中，将通用的模块以水平切割的方式进行分离统一处理，常用于日志、权限控制、异常处理等业务中。

## AOP 注解

- `@Aspect`：切面，这个注解标注在类上表示为一个切面
- `@Joinpoint`：连接点，被 AOP 拦截的类或者方法
- `@Pointcut`：切入点，从哪里开始切入
- Advice：通知的几种类型
  - `@Before`：前置通知，在目标方法调用前调用通知功能；
  - `@After`：后置通知，在目标方法调用之后调用通知功能，不关心方法的返回结果；
  - `@AfterReturning`：返回通知，在目标方法成功执行之后调用通知功能；
  - `@AfterThrowing`：异常通知，在目标方法抛出异常后调用通知功能；
  - `@Around`：环绕通知，通知包裹了目标方法，在目标方法调用之前和之后执行自定义的行为

## 示例

伪代码表示通知顺序：

```java
try {
    // @Before 执行前通知

    // @Around 执行环绕通知 成功走finall，失败走catch
} finally {
    // @After 执行后置通知

    // @AfterReturning 执行返回后通知
} catch(e) {
    // @AfterThrowing 抛出异常通知
}
```

实际代码例子：

```java
@Aspect
@Component
@Slf4j
public class LogAspect {

    /**
     * 切入点
     */
    @Pointcut("execution(* com.chanshiyu.moemall.admin.controller.*.*(..))")
    public void log() {}

    /**
     * 前置通知
     * @param joinPoint
     * @throws Throwable
     */
    @Before("log()")
    public void doBefore(JoinPoint joinPoint) throws Throwable {
        // 开始打印请求日志
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        HttpServletRequest request = attributes.getRequest();

        // 打印请求相关参数
        log.info("========================================== Start ==========================================");
        // 打印请求 url
        log.info("URL            : {}", request.getRequestURL().toString());
        // 打印 Http method
        log.info("HTTP Method    : {}", request.getMethod());
        // 打印调用 controller 的全路径以及执行方法
        log.info("Class Method   : {}.{}", joinPoint.getSignature().getDeclaringTypeName(), joinPoint.getSignature().getName());
        // 打印请求的 IP
        log.info("IP             : {}", request.getRemoteAddr());
        // 打印请求入参
        log.info("Request Args   : {}", JSONUtil.parse(joinPoint.getArgs()));
    }

    /**
     * 后置通知
     * @throws Throwable
     */
    @After("log()")
    public void doAfter() throws Throwable {
        log.info("=========================================== End ===========================================");
    }

    /**
     * 环绕通知
     * @param proceedingJoinPoint
     * @return
     * @throws Throwable
     */
    @Around("log()")
    public Object doAround(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();
        Object result = proceedingJoinPoint.proceed();
        // 打印出参
        log.info("Response Args  : {}", JSONUtil.parse(result));
        // 执行耗时
        log.info("Time-Consuming : {} ms", System.currentTimeMillis() - startTime);
        return result;
    }

    /**
     * 返回后通知
     * @param object
     */
    @AfterReturning(returning = "object", pointcut = "log()")
    public void doAfterReturning(Object object) {
        log.info("RESPONSE       : {}", object.toString());
    }

    /**
     * 异常通知
     */
    @AfterThrowing(pointcut = "log()")
    public void doAfterThrowing() {
        log.error("doAfterThrowing: {}", " 异常情况!");
    }


}
```

![LogAspect](https://cdn.jsdelivr.net/gh/chanshiyucx/poi/2019/LogAspect.png)

参考文章：  
[Spring Boot 实战系列 AOP 面向切面编程](https://juejin.im/post/5be0dd17e51d45304c3c7a75)
