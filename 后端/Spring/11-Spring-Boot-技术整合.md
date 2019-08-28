# Spring Boot 技术整合

## 定时任务

- 使用注解 `@EnableScheduling` 开启定时任务
- 定义 `@Component`、`@Scheduled` 作为组件被容器扫描

```java
@Component
public class TestTask {

    private static final SimpleDateFormat dateFormate = new SimpleDateFormat("HH:mm:ss");

    /** 定义每过3秒执行任务 */
    @Scheduled(fixedRate = 3000)
    public void reportCurrentTime() {
        System.out.println("现在时间：" + dateFormate.format(new Date()));
    }

    /** 每分钟10-30秒执行 */
    @Scheduled(cron = "10-30 * * * * ? ")
    public void reportCron() {
        System.out.println("cron：" + dateFormate.format(new Date()));
    }

}
```

![Cron 表达式](http://cron.qqe2.com/)

## 异步任务

- 使用注解 `@EnableAsync` 开启定时任务
- 定义 `@Component`、`@Async` 作为组件被容器扫描

```java
@Component
public class AsyncTask {

    @Async
    public Future<Boolean> doTask1() throws Exception {
        long start = System.currentTimeMillis();
        Thread.sleep(1000);
        long end = System.currentTimeMillis();
        System.out.println("任务1耗时：" + (end - start) + "毫秒");
        return new AsyncResult<>(true);
    }

    @Async
    public Future<Boolean> doTask2() throws Exception {
        long start = System.currentTimeMillis();
        Thread.sleep(600);
        long end = System.currentTimeMillis();
        System.out.println("任务2耗时：" + (end - start) + "毫秒");
        return new AsyncResult<>(true);
    }

    @Async
    public Future<Boolean> doTask3() throws Exception {
        long start = System.currentTimeMillis();
        Thread.sleep(300);
        long end = System.currentTimeMillis();
        System.out.println("任务3耗时：" + (end - start) + "毫秒");
        return new AsyncResult<>(true);
    }

}
```

使用：

```java
long start = System.currentTimeMillis();

Future<Boolean> a = asyncTask.doTask1();
Future<Boolean> b = asyncTask.doTask2();
Future<Boolean> c = asyncTask.doTask3();

while (!a.isDone() || !b.isDone() || !c.isDone()) {
    if (a.isDone() && b.isDone() && c.isDone()) {
        break;
    }
}

long end = System.currentTimeMillis();
System.out.println("总耗时：" + (end - start) + "毫秒");
```

使用异步任务时，总耗时为所有任务中最长耗时的任务，如果去除 `@Async` 注解，总耗时为所有任务耗时累加。

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
