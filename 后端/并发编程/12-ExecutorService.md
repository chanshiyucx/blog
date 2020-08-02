# ExecutorService

> 本文为个人学习摘要笔记。  
> 原文地址：[一文秒懂 Java ExecutorService](https://www.twle.cn/c/yufei/javatm/javatm-basic-executorservice.html)

ExecutorService 是 java.util.concurrent 包的重要组成部分，是 Java JDK 提供的框架，用于简化异步模式下任务的执行。

一般来说，ExecutorService 会自动提供一个线程池和相关 API，用于为其分配任务。

ExecutorService 只是接口，Java 标准库提供的几个常用实现类有：

- `FixedThreadPool`：线程数固定的线程池；
- `CachedThreadPool`：线程数根据任务动态调整的线程池；
- `SingleThreadExecutor`：仅单线程执行的线程池；
- `ScheduledThreadPool`：以用来处理延时任务或者定时任务。

他们内部实现依旧是调用 ThreadPoolExecutor，构造方法如下：

```java
public ThreadPoolExecutor(
    int corePoolSize,
    int maximumPoolSize,
    long keepAliveTime,
    TimeUnit unit,
    BlockingQueue<Runnable> workQueue,
    ThreadFactory threadFactory,
    RejectedExecutionHandler handler)

// FixedThreadPool
public static ExecutorService newFixedThreadPool(int nThreads) {
    return new ThreadPoolExecutor(nThreads, nThreads,
                                    0L, TimeUnit.MILLISECONDS,
                                    new LinkedBlockingQueue<Runnable>());
}

// CachedThreadPool
public static ExecutorService newCachedThreadPool() {
    return new ThreadPoolExecutor(0, Integer.MAX_VALUE,
                                    60L, TimeUnit.SECONDS,
                                    new SynchronousQueue<Runnable>());
}

// SingleThreadExecutor
public static ExecutorService newSingleThreadExecutor() {
    return new FinalizableDelegatedExecutorService
        (new ThreadPoolExecutor(1, 1,
                                0L, TimeUnit.MILLISECONDS,
                                new LinkedBlockingQueue<Runnable>()));
}

// ScheduledThreadPool
public static ScheduledExecutorService newScheduledThreadPool(int corePoolSize) {
    return new ScheduledThreadPoolExecutor(corePoolSize);
}

public ScheduledThreadPoolExecutor(int corePoolSize) {
    super(corePoolSize, Integer.MAX_VALUE, 0, NANOSECONDS,
            new DelayedWorkQueue());
}
```

## 实例化 ExecutorService

实例化 ExecutorService 的方式有两种：一种是工厂方法，另一种是直接创建。

创建 ExecutorService 实例的最简单方法是使用 Executors 类的提供的工厂方法。比如：

```java
ExecutorService executorService = Executors.newFixedThreadPool(10);
```

当然还有其它很多工厂方法，每种工厂方法都可以创建满足特定用例的预定义实例。你所需要做的就是从 [Oracle 的 JDK 官方文档](https://docs.oracle.com/javase/7/docs/api/java/util/concurrent/Executors.html)找到自己想要的合适的方法。

另外也可以直接创建 ExecutorService 的实例，`java.util.concurrent` 包已经预定义了几种实现可供我们选择，或者你也可以创建自己的实现。

## ExecutorService 分配任务

ExecutorService 可以执行 Runnable 和 Callable 任务。

```java
public class T {

    public static void main(String[] args) throws ExecutionException, InterruptedException{
        Runnable runnable = () -> {
            System.out.println("runnable start");
            try {
                TimeUnit.MILLISECONDS.sleep(300);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        };

        Callable<String> callable = () -> {
            System.out.println("callable start");
            TimeUnit.MILLISECONDS.sleep(300);
            return "Hello world";
        };

        // 外层括号建立了一个 ArrayList 的匿名子类，内层括号定义了一个该匿名子类的构造块（构造对象时会自动执行的代码块）
        List<Callable<String>> callableList = new ArrayList<Callable<String>>() {
            {
                add(callable);
                add(callable);
                add(callable);
            }
        };

        // execute
        ExecutorService executorService = Executors.newFixedThreadPool(10);
        executorService.execute(runnable);

        // submit
        Future<String> future = executorService.submit(callable);
        System.out.println("result: " + future.get());

        // invokeAny
        String result = executorService.invokeAny(callableList);
        System.out.println("result: " + result);

        // invokeAll
        List<Future<String>> futureList = executorService.invokeAll(callableList);

        // 关闭 ExecutorService
        executorService.shutdown();
        try {
            if (!executorService.awaitTermination(800, TimeUnit.MILLISECONDS)) {
                executorService.shutdownNow();
            }
        } catch (InterruptedException e) {
            executorService.shutdownNow();
        }
    }

}
```

`isShutdown()` 可以判断是否线程池是否已经执行停止方法，`isTerminated()` 可以判断线程池是否真正停止运行。

ExecutorService 有多种方法进行任务分配，比如 `execute()`、`submit()`、`invokeAny()` 和 `invokeAll()` 等方法，这些方法都继承自 Executor 接口。

### execute()

该方法返回值为空，因此使用该方法无法获得任务执行结果或检查任务的状态（是正在运行（running）还是执行完毕（executed））。

```java
executorService.execute(runnable);
```

### submit()

`submit()` 方法会将一个 Callable 或 Runnable 任务提交给 ExecutorService 并返回 Future 类型的结果。

```java
Future<String> future = executorService.submit(callable);
```

### invokeAny()

`invokeAny()` 方法将一组任务分配给 ExecutorService，使每个任务执行，并返回任意一个成功执行的任务的结果。

```java
String result = executorService.invokeAny(callableList);
```

### invokeAll()

`invokeAll()` 方法将一组任务分配给 ExecutorService ，使每个任务执行，并以 Future 类型的对象列表的形式返回所有任务执行的结果。

```java
List<Future<String>> futureList = executorService.invokeAll(callableList);
```

## 关闭 ExecutorService

一般情况下，ExecutorService 并不会自动关闭，即使所有任务都执行完毕，或者没有要处理的任务，也不会自动销毁 ExecutorService。它会一直出于等待状态，等待给它分配新的工作。

这种机制，在某些情况下是非常有用的，比如，应用程序需要处理不定期出现的任务，或者在编译时不知道这些任务的数量。

但另一方面，这也带来了副作用：即使应用程序可能已经到达它的终点，但并不会被停止，因为等待的 ExecutorService 将导致 JVM 继续运行。这样，我们就需要主动关闭 ExecutorService。

要正确的关闭 ExecutorService，可以调用实例的 `shutdown()` 或 `shutdownNow()` 方法。

### shutdown()

`shutdown()` 方法并不会立即销毁 ExecutorService 实例，而是首先让 ExecutorService 停止接受新任务，并在所有正在运行的线程完成当前工作后关闭：

```java
executorService.shutdown();
```

### shutdownNow()

`shutdownNow()` 方法会尝试立即销毁 ExecutorService 实例，所以并不能保证所有正在运行的线程将同时停止。该方法会返回等待处理的任务列表，由开发人员自行决定如何处理这些任务。

```java
List<Runnable> notExecutedTasks = executorService.shutDownNow();
```

### 最佳实践

关闭 ExecutorService 实例的最佳实战是同时使用这两种方法并结合 `awaitTermination()` 方法。使用这种方式 ExecutorService 首先停止执行新任务，等待指定的时间段完成所有任务，如果该时间到期，则立即停止执行。

```java
executorService.shutdown();
try {
    if (!executorService.awaitTermination(800, TimeUnit.MILLISECONDS)) {
        executorService.shutdownNow();
    }
} catch (InterruptedException e) {
    executorService.shutdownNow();
}
```

## Future 接口

上面栗子中提到，`submit()` 方法和 `invokeAll()` 方法返回一个 Future 接口的对象或 Future 类型的对象集合。这些 Future 接口的对象允许我们获取任务执行的结果或检查任务的状态（正在运行还是执行完毕）。

Future 接口提供了一个特殊的阻塞方法 `get()`，**它返回 Callable 任务执行的实际结果，但如果是 Runnable 任务，则只会返回 `null`**。

因为 `get()` 方法是阻塞的。如果调用 `get()` 方法时任务仍在运行，那么调用将会一直被执阻塞，直到任务正确执行完毕并且结果可用时才返回。

而且更重要的是，正在被执行的任务随时都可能抛出异常或中断执行。因此要将 `get()` 调用放在 `try catch` 语句块中，并捕捉 `InterruptedException` 或 `ExecutionException` 异常。

```java
Future<String> future = executorService.submit(callable);
String result = null;
try {
    result = future.get();
} catch (InterruptedException | ExecutionException e) {
    e.printStackTrace();
}
```

因为 `get()` 方法是阻塞的，而且并不知道要阻塞多长时间。因此可能导致应用程序的性能降低。如果结果数据并不重要，那么我们可以使用超时机制来避免长时间阻塞。

```java
String result = future.get(200, TimeUnit.MILLISECONDS);
```

这个 `get()` 的重载，第一个参数为超时的时间，第二个参数为时间的单位。上面的实例所表示就的就是等待 200 毫秒。注意，这个 `get()` 重载方法，如果在超时时间内正常结束，那么返回的是 Future 类型的结果，如果超时了还没结束，那么将抛出 TimeoutException 异常。

除了 `get()` 方法之外，Future 还提供了其它很多方法，下面是几个重要的方法：

| 方法          | 说明                       |
| ------------- | -------------------------- |
| isDone()      | 检查已分配的任务是否已处理 |
| cancel()      | 取消任务执行               |
| isCancelled() | 检查任务是否已取消         |

此外，也可以包装 Callable 成 FutureTask 直接交给线程执行：

```java
FutureTask<String> futureTask = new FutureTask<>(() -> "Hello");
new Thread(futureTask).start();
System.out.println(futureTask.get());
```

```java
boolean isDone = future.isDone();
boolean canceled = future.cancel(true);
boolean isCancelled = future.isCancelled();
```

## ScheduledExecutorService

ScheduledExecutorService 接口用于在一些预定义的延迟之后运行任务或定期运行任务。同样的，实例化 ScheduledExecutorService 的最佳方式是使用 Executors 类的工厂方法。比如，要在固定延迟后安排单个任务的执行，可以使用 ScheduledExecutorService 实例的 `scheduled()` 方法：

```java
ScheduledExecutorService executorService = Executors.newSingleThreadScheduledExecutor();
// 在执行 callable 之前延迟了一秒钟
Future<String> resultFuture = executorService.schedule(callable, 1, TimeUnit.SECONDS);
String result = null;
try {
    result = resultFuture.get();
    System.out.println("result: " + result);
} catch (InterruptedException | ExecutionException e) {
    e.printStackTrace();
}
```

另外，ScheduledExecutorService 实例还提供了另一个重要方法 `scheduleAtFixedRate()`，它允许在固定延迟后定期执行任务。

```java
executorService.scheduleAtFixedRate(commod, initialDelay, period, unit);
```

`initialDelay` 是说系统启动后，需要等待多久才开始执行。`period` 为固定周期时间，按照一定频率来重复执行任务。

- 如果 period 设置的是 3s，任务执行要 5s，那么等上一次任务执行完就立即执行，也就是任务与任务之间的差异是 5s；
- 如果 period 设置的是 3s，任务执行要 2s，那么需要等到 3s 后再次执行下一次任务。

```java
// 100 毫秒的初始延迟后执行任务，之后，它将每 450 毫秒执行相同的任务
executorService.scheduleAtFixedRate(runnable, 100, 450, TimeUnit.MILLISECONDS);
```

如果任务迭代之间必须具有固定长度的延迟，那么可以使用 `scheduleWithFixedDelay()` 方法。例如，以下代码将保证当前执行结束与另一个执行结束之间的间隔时间为 150 毫秒。

```java
executorService.scheduleWithFixedDelay(task, 100, 150, TimeUnit.MILLISECONDS);
```

## 总结

尽管 ExecutorService 相对简单，但仍有一些常见的陷阱。

1. 未能正确关闭 ExecutorService
2. 使用固定长度的线程池时设置了错误的线程池容量。使用 ExecutorService 最重要的一件事，就是确定应用程序有效执行任务所需的线程数
   - 太大的线程池只会产生不必要的开销，只会创建大多数处于等待模式的线程。
   - 太少的线程池会让应用程序看起来没有响应，因为队列中的任务等待时间很长。
3. 在取消任务后调用 Future 的 `get()` 方法。尝试获取已取消任务的结果将触发 CancellationException 异常。
4. 使用 Future 的 `get()` 方法意外地阻塞了很长时间。应该使用超时来避免意外的等待。
