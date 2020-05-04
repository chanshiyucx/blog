# Spring Boot 异步编程

## Future 模式

异步编程在处理耗时操作以及多任务处理的场景下非常有用，可以提高 CPU 和内存的利用率。多线程设计模式有很多种，Future 模式是多线程开发中非常常见的一种设计模式，本文也是基于这种模式来说明 SpringBoot 对于异步编程的知识。

Future 模式的核心思想是**异步调用**。当我们执行一个方法时，假如这个方法中有多个耗时的任务需要同时去做，而且又不着急等待这个结果时可以让客户端立即返回然后，后台慢慢去计算任务。当然你也可以选择等这些任务都执行完了，再返回给客户端。这两种方式在 Java 中都有很好的支持，在后面的示例程序中会详细对比这两种方式的区别。

## 异步编程

如果需要在 SpringBoot 实现异步编程的话，需要使用 Spring 提供的两个注解。

- `@EnableAsync`：通过在配置类或者 Main 类上加 `@EnableAsync` 开启对异步方法的支持。
- `@Async`：可以作用在类上或者方法上，作用在类上代表这个类的所有方法都是异步方法。

异步任务有一个重要的概念 `TaskExecutor`，`TaskExecutor` 是任务的执行者，它领导执行着线程来处理任务，就像司令官一样，而我们的线程就好比一只只军队一样，这些军队可以异步对敌人进行打击。

Spring 提供了 `TaskExecutor` 接口作为任务执行者的抽象，它和 `java.util.concurrent` 包下的 `Executor` 接口很像。稍微不同的 `TaskExecutor` 接口用到了 Java 8 的语法 `@FunctionalInterface` 声明这个接口是一个函数式接口。

`org.springframework.core.task.TaskExecutor`：

```java
@FunctionalInterface
public interface TaskExecutor extends Executor {
    void execute(Runnable var1);
}
```

![TaskExecutor](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/SpringBoot-异步编程/TaskExecutor.png)

如果没有自定义 `Executor`, Spring 将创建一个 `SimpleAsyncTaskExecutor` 并使用它。

```java
@Configuration
@EnableAsync
public class AsyncConfig implements AsyncConfigurer {

    private static final int CORE_POOL_SIZE = 6;
    private static final int MAX_POOL_SIZE = 10;
    private static final int QUEUE_CAPACITY = 100;

    @Bean
    public Executor taskExecutor() {
        // Spring 默认配置是核心线程数大小为1，最大线程容量大小不受限制，队列容量也不受限制。
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        // 核心线程数
        executor.setCorePoolSize(CORE_POOL_SIZE);
        // 最大线程数
        executor.setMaxPoolSize(MAX_POOL_SIZE);
        // 队列大小
        executor.setQueueCapacity(QUEUE_CAPACITY);
        // 当最大池已满时，此策略保证不会丢失任务请求，但是可能会影响应用程序整体性能。
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.setThreadNamePrefix("async-task-");
        executor.initialize();
        return executor;
    }

}
```

或者也可以使用在 `application.yml` 中设置线程池：

```yml
spring:
  task:
    execution:
      pool:
        # 最大线程数
        max-size: 6
        # 核心线程数
        core-size: 10
        # 存活时间
        keep-alive: 10s
        # 队列大小
        queue-capacity: 100
        # 是否允许核心线程超时
        allow-core-thread-timeout: true
      # 线程名称前缀
      thread-name-prefix: async-task-
```

`ThreadPoolTaskExecutor` 常见概念：

- `Core Pool Size`：核心线程数定义了最小可以同时运行的线程数量。
- `Maximum Pool Size`：当队列中存放的任务达到队列容量的时候，当前可以同时运行的线程数量变为最大线程数。
- `Queue Capacity`：当新任务来的时候会先判断当前运行的线程数量是否达到核心线程数，如果达到的话，新任务就会被存放在队列中。

一般情况下不会将队列大小设为 `Integer.MAX_VALUE`，也不会将核心线程数和最大线程数设为同样的大小，这样的话最大线程数的设置都没什么意义了，你也无法确定当前 CPU 和内存利用率具体情况如何。

**如果队列已满并且当前同时运行的线程数达到最大线程数的时候，如果再有新任务过来会发生什么呢？**

Spring 默认使用的是 `ThreadPoolExecutor.AbortPolicy`。在默认情况下，`ThreadPoolExecutor` 将抛出 `RejectedExecutionException` 来拒绝新来的任务，这代表你将丢失对这个任务的处理。对于可伸缩的应用程序，建议使用 `ThreadPoolExecutor.CallerRunsPolicy`，当最大池被填满时，此策略为我们提供可伸缩队列。

`ThreadPoolTaskExecutor` 饱和策略定义:

- `ThreadPoolExecutor.AbortPolicy`：抛出 `RejectedExecutionException` 来拒绝新任务的处理。
- `ThreadPoolExecutor.CallerRunsPolicy`：调用执行自己的线程运行任务。但是这种策略会降低对于新任务提交速度，影响程序的整体性能。另外，这个策略喜欢增加队列容量。如果应用程序可以承受此延迟并且不能丢弃任何一个任务请求的话，可以选择这个策略。
- `ThreadPoolExecutor.DiscardPolicy`：不处理新任务，直接丢弃掉。
- `ThreadPoolExecutor.DiscardOldestPolicy`：此策略将丢弃最早的未处理的任务请求。

## 实战

模拟一个查找对应字符开头电影的方法，我们给这个方法加上了 `@Async` 注解来告诉 Spring 它是一个异步的方法。

### 等待结果返回

方法的返回值 `CompletableFuture.completedFuture(results)` 这代表我们需要返回结果，也就是说程序必须把任务执行完成之后再返回给用户。

```java
@Service
@Slf4j
public class AsyncService {

    private List<String> movies =
            new ArrayList<>(
                    Arrays.asList(
                            "Forrest Gump",
                            "Titanic",
                            "Spirited Away",
                            "The Shawshank Redemption",
                            "Zootopia",
                            "Farewell ",
                            "Joker",
                            "Crawl"));

    /**
     * 示范使用：找到特定字符/字符串开头的电影
     */
    @Async
    public CompletableFuture<List<String>> completableFutureTask(String start) {
        // 打印日志
        log.warn(Thread.currentThread().getName() + "start this task!");
        // 找到特定字符/字符串开头的电影
        List<String> results =
                movies.stream().filter(movie -> movie.startsWith(start)).collect(Collectors.toList());
        // 模拟这是一个耗时的任务
        try {
            Thread.sleep(1000L);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        //返回一个已经用给定值完成的新的CompletableFuture。
        return CompletableFuture.completedFuture(results);
    }

}
```

Controller：

```java
@RestController
@RequestMapping("/async")
@Slf4j
public class AsyncController {

    @Autowired
    AsyncService asyncService;

    @GetMapping("/movies")
    public String completableFutureTask() throws ExecutionException, InterruptedException {
        //开始时间
        long start = System.currentTimeMillis();
        // 开始执行大量的异步任务
        List<String> words = Arrays.asList("F", "T", "S", "Z", "J", "C");
        List<CompletableFuture<List<String>>> completableFutureList =
                words.stream()
                        .map(word -> asyncService.completableFutureTask(word))
                        .collect(Collectors.toList());
        // CompletableFuture.join（）方法可以获取他们的结果并将结果连接起来
        List<List<String>> results = completableFutureList.stream().map(CompletableFuture::join).collect(Collectors.toList());
        // 打印结果以及运行程序运行花费时间
        log.info("Elapsed time: {}", System.currentTimeMillis() - start);
        return results.toString();
    }

}
```

请求接口，控制台打印出下面的内容：

```
[lTaskExecutor-1] : My ThreadPoolTaskExecutor-1start this task!
[lTaskExecutor-5] : My ThreadPoolTaskExecutor-5start this task!
[lTaskExecutor-2] : My ThreadPoolTaskExecutor-2start this task!
[lTaskExecutor-4] : My ThreadPoolTaskExecutor-4start this task!
[lTaskExecutor-6] : My ThreadPoolTaskExecutor-6start this task!
[lTaskExecutor-3] : My ThreadPoolTaskExecutor-3start this task!
[nio-8090-exec-1] : Elapsed time: 1004
```

可以看到处理所有任务花费的时间大概是 1s。这与我们自定义的 `ThreadPoolTaskExecutor` 有关，我们配置的核心线程数是 6，然后通过通过下面的代码模拟分配了 6 个任务给系统执行。这样每个线程都会被分配到一个任务，每个任务执行花费时间是 1s，所以处理 6 个任务的总花费时间是 1s。如果把核心线程数的数量改为 3，再次请求这个接口你会发现处理所有任务花费的时间大概是 2s。

### 不等待结果返回

将 `completableFutureTask` 方法变为 void 类型：

```java
@Async
public void completableFutureTask(String start) {
    // 打印日志
    log.warn(Thread.currentThread().getName() + "start this task!");
    // 找到特定字符/字符串开头的电影
    List<String> results =
            movies.stream().filter(movie -> movie.startsWith(start)).collect(Collectors.toList());
    // 模拟这是一个耗时的任务
    try {
        Thread.sleep(1000L);
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
}
```

Controller：

```java
@RestController
@RequestMapping("/async")
@Slf4j
public class AsyncController {

    @Autowired
    AsyncService asyncService;

    @GetMapping("/movies")
    public String completableFutureTask() throws ExecutionException, InterruptedException {
        //开始时间
        long start = System.currentTimeMillis();
        // 开始执行大量的异步任务
        List<String> words = Arrays.asList("F", "T", "S", "Z", "J", "C");
        words.forEach(word -> asyncService.completableFutureTask(word));
        // 打印结果以及运行程序运行花费时间
        log.info("Elapsed time: {}", System.currentTimeMillis() - start);
        return "OK";
    }

}
```

请求接口，控制台打印出下面的内容：

```
[nio-8090-exec-3] : Elapsed time: 2
[lTaskExecutor-6] : My ThreadPoolTaskExecutor-6start this task!
[lTaskExecutor-1] : My ThreadPoolTaskExecutor-1start this task!
[lTaskExecutor-4] : My ThreadPoolTaskExecutor-4start this task!
[lTaskExecutor-5] : My ThreadPoolTaskExecutor-5start this task!
[lTaskExecutor-3] : My ThreadPoolTaskExecutor-3start this task!
[lTaskExecutor-2] : My ThreadPoolTaskExecutor-2start this task!
```

### 并发执行

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
