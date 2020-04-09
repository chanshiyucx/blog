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

实际代码例子，统一日志处理切面 [`WebLogAspect.java`](https://github.com/macrozheng/mall/blob/master/mall-admin/src/main/java/com/macro/mall/component/WebLogAspect.java)：

```java
@Slf4j
@Aspect
@Component
@Order(1)
public class WebLogAspect {

    // *.*(..) 表示任何类的任何方法的任何参数
    @Pointcut("execution(public * com.chanshiyu.moemall.admin.controller.*.*(..))")
    public void webLog() {}

    @Before("webLog()")
    public void doBefore(JoinPoint joinPoint) throws Throwable {}

    @AfterReturning(value = "webLog()", returning = "ret")
    public void doAfterReturning(Object ret) throws Throwable {}

    @Around("webLog()")
    public Object doAround(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();
        // 获取当前请求对象
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        assert attributes != null;
        HttpServletRequest request = attributes.getRequest();
        // 记录请求信息
        WebLog webLog = new WebLog();
        Object result = joinPoint.proceed();
        Signature signature = joinPoint.getSignature();
        MethodSignature methodSignature = (MethodSignature) signature;
        Method method = methodSignature.getMethod();
        if (method.isAnnotationPresent(ApiOperation.class)) {
            ApiOperation log = method.getAnnotation(ApiOperation.class);
            webLog.setDescription(log.value());
        }
        long endTime = System.currentTimeMillis();
        String urlStr = request.getRequestURL().toString();
        webLog.setBasePath(StrUtil.removeSuffix(urlStr, URLUtil.url(urlStr).getPath()));
        webLog.setIp(request.getRemoteAddr());
        webLog.setMethod(request.getMethod());
        webLog.setParameter(getParameter(method, joinPoint.getArgs()));
        webLog.setResult(result);
        webLog.setStartTime(DateUtil.date(startTime).toString());
        webLog.setSpendTime((int) (endTime - startTime));
        webLog.setUri(request.getRequestURI());
        webLog.setUrl(request.getRequestURL().toString());
        log.info("请求日志: {}", JSONUtil.parse(webLog).toString());
        return result;
    }

    /**
     * 根据方法和传入的参数获取请求参数
     */
    private Object getParameter(Method method, Object[] args) {
        List<Object> argList = new ArrayList<>();
        Parameter[] parameters = method.getParameters();
        for (int i = 0; i < parameters.length; i++) {
            // 将RequestBody注解修饰的参数作为请求参数
            RequestBody requestBody = parameters[i].getAnnotation(RequestBody.class);
            if (requestBody != null) {
                argList.add(args[i]);
            }
            // 将RequestParam注解修饰的参数作为请求参数
            RequestParam requestParam = parameters[i].getAnnotation(RequestParam.class);
            if (requestParam != null) {
                Map<String, Object> map = new HashMap<>();
                String key = parameters[i].getName();
                if (!StringUtils.isEmpty(requestParam.value())) {
                    key = requestParam.value();
                }
                map.put(key, args[i]);
                argList.add(map);
            }
        }
        if (argList.size() == 0) {
            return null;
        } else if (argList.size() == 1) {
            return argList.get(0);
        } else {
            return argList;
        }
    }

}
```

参考文章：  
[SpringBoot 应用中使用 AOP 记录接口访问日志](http://www.macrozheng.com/#/technology/aop_log)
[Spring Boot 实战系列 AOP 面向切面编程](https://juejin.im/post/5be0dd17e51d45304c3c7a75)
