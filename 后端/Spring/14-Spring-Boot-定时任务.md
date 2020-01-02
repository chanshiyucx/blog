# Spring Boot 定时任务

## @EnableScheduling

首先在 SpringBoot 启动类加上 `@EnableScheduling` 启用定时任务。

```java
@SpringBootApplication
@EnableScheduling
public class DemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}
```

## 创建 scheduled task

使用 `@Scheduled` 注解就能很方便地创建一个定时任务，下面的代码中涵盖了 `@Scheduled` 的常见用法，包括：固定速率执行、固定延迟执行、初始延迟执行、使用 Cron 表达式执行定时任务。

[在线 Cron 表达式生成器](http://cron.qqe2.com/)

```java
@Slf4j
@Component
public class ScheduledTasks {
    private static final SimpleDateFormat dateFormat = new SimpleDateFormat("HH:mm:ss");

    /**
     * fixedRate：固定速率执行。每5秒执行一次。
     */
    @Scheduled(fixedRate = 5000)
    public void reportCurrentTimeWithFixedRate() {
        log.info("Current Thread : {}", Thread.currentThread().getName());
        log.info("Fixed Rate Task : The time is now {}", dateFormat.format(new Date()));
    }

    /**
     * fixedDelay：固定延迟执行。距离上一次调用成功后2秒才执。
     */
    @Scheduled(fixedDelay = 2000)
    public void reportCurrentTimeWithFixedDelay() {
        try {
            TimeUnit.SECONDS.sleep(3);
            log.info("Fixed Delay Task : The time is now {}", dateFormat.format(new Date()));
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

    /**
     * initialDelay:初始延迟。任务的第一次执行将延迟5秒，然后将以5秒的固定间隔执行。
     */
    @Scheduled(initialDelay = 5000, fixedRate = 5000)
    public void reportCurrentTimeWithInitialDelay() {
        log.info("Fixed Rate Task with Initial Delay : The time is now {}", dateFormat.format(new Date()));
    }

    /**
     * cron：使用Cron表达式。　每分钟的1，2秒运行
     */
    @Scheduled(cron = "1-2 * * * * ? ")
    public void reportCurrentTimeWithCronExpression() {
        log.info("Cron Expression: The time is now {}", dateFormat.format(new Date()));
    }
}
```

注意 `fixedRate` 模式有个小坑，假如有这样一种情况：某个方法的定时器设定的固定速率是每 5 秒执行一次。这个方法现在要执行下面四个任务，四个任务的耗时是：6 s、6s、2s、3s，请问这些任务默认情况下（单线程）将如何被执行？程序验证：

```java
@Component
@Slf4j
public class ScheduledTasks {
    private static final SimpleDateFormat dateFormat = new SimpleDateFormat("HH:mm:ss");

    private List<Integer> index = Arrays.asList(6, 6, 2, 3);

    int i = 0;

    @Scheduled(fixedRate = 5000)
    public void reportCurrentTimeWithFixedRate() {
        if (i == 0) {
            log.info("Start time is {}", dateFormat.format(new Date()));
        }
        if (i < 5) {
            try {
                TimeUnit.SECONDS.sleep(index.get(i));
                log.info("Fixed Rate Task : The time is now {}", dateFormat.format(new Date()));
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            i++;
        }
    }
}
```

运行程序输出如下：

```
Start time is 09:26:41
Fixed Rate Task : The time is now 09:26:47
Fixed Rate Task : The time is now 09:26:53
Fixed Rate Task : The time is now 09:26:55
Fixed Rate Task : The time is now 09:26:59
```

示意图：

![fixedRate](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/SpringBoot-定时任务/fixedRate.png)

## 自定义线程池

默认情况下，`@Scheduled` 任务都在 Spring 创建的大小为 1 的默认线程池中执行，你可以通过在加了 `@Scheduled` 注解的方法里加上下面这段代码来验证。

```java
log.info("Current Thread : {}", Thread.currentThread().getName());
```

每次运行都会输出：

```
Current Thread : scheduling-1
```

如果需要自定义线程池执行话只需要新加一个实现 `SchedulingConfigurer` 接口的 `configureTasks` 的类即可，这个类需要加上 `@Configuration` 注解。

```java
@Configuration
public class SchedulerConfig implements SchedulingConfigurer {
    private final int POOL_SIZE = 10;

    @Override
    public void configureTasks(ScheduledTaskRegistrar scheduledTaskRegistrar) {
        ThreadPoolTaskScheduler threadPoolTaskScheduler = new ThreadPoolTaskScheduler();

        threadPoolTaskScheduler.setPoolSize(POOL_SIZE);
        threadPoolTaskScheduler.setThreadNamePrefix("my-scheduled-task-pool-");
        threadPoolTaskScheduler.initialize();

        scheduledTaskRegistrar.setTaskScheduler(threadPoolTaskScheduler);
    }
}
```

## 并发执行

测试代码：

```java
@Slf4j
@Component
public class ScheduledTasks {
    private static final SimpleDateFormat dateFormat = new SimpleDateFormat("HH:mm:ss");

    @Scheduled(fixedDelay = 2000)
    public void reportCurrentTimeWithFixedDelay() {
        try {
            TimeUnit.SECONDS.sleep(3);
            log.info("Fixed Delay Task : The time is now {}", dateFormat.format(new Date()));
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

`reportCurrentTimeWithFixedDelay()` 方法会每 5 秒执行一次，执行代码输出如下：

```
[scheduling-1] : Fixed Delay Task : The time is now 09:45:12
[scheduling-1] : Fixed Delay Task : The time is now 09:45:17
[scheduling-1] : Fixed Delay Task : The time is now 09:45:22
[scheduling-1] : Fixed Delay Task : The time is now 09:45:27
[scheduling-1] : Fixed Delay Task : The time is now 09:45:32
[scheduling-1] : Fixed Delay Task : The time is now 09:45:37
```

添加 `@EnableAsync` 和 `@Async` 这两个注解让任务并行执行：

```java
@Slf4j
@EnableAsync
@Component
public class ScheduledTasks {
    private static final SimpleDateFormat dateFormat = new SimpleDateFormat("HH:mm:ss");

    @Async
    @Scheduled(fixedDelay = 2000)
    public void reportCurrentTimeWithFixedDelay() {
        /* .... */
    }
}
```

`reportCurrentTimeWithFixedDelay()` 方法上加上 `@Async` 注解后会每 2 秒执行一次，执行代码输出如下：

```
[lTaskExecutor-1] : Fixed Delay Task : The time is now 09:44:04
[lTaskExecutor-2] : Fixed Delay Task : The time is now 09:44:06
[lTaskExecutor-3] : Fixed Delay Task : The time is now 09:44:08
[lTaskExecutor-4] : Fixed Delay Task : The time is now 09:44:10
[lTaskExecutor-5] : Fixed Delay Task : The time is now 09:44:12
[lTaskExecutor-6] : Fixed Delay Task : The time is now 09:44:14
```
