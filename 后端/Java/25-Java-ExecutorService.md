# Java ExecutorService

> 本文为个人学习摘要笔记。  
> 原文地址：[一文秒懂 Java ExecutorService](https://www.twle.cn/c/yufei/javatm/javatm-basic-executorservice.html)

`ExecutorService` 是 `Java java.util.concurrent` 包的重要组成部分，是 Java JDK 提供的框架，用于简化异步模式下任务的执行。

一般来说，`ExecutorService` 会自动提供一个线程池和相关 API，用于为其分配任务。

## 实例化 ExecutorService

实例化 `ExecutorService` 的方式有两种：一种是工厂方法，另一种是直接创建。

创建 `ExecutorService` 实例的最简单方法是使用 `Executors` 类的提供的工厂方法。比如：

```java
ExecutorService executorService = Executors.newFixedThreadPool(10);
```

当然还有其它很多工厂方法，每种工厂方法都可以创建满足特定用例的预定义实例。你所需要做的就是从 [Oracle 的 JDK 官方文档](https://docs.oracle.com/javase/7/docs/api/java/util/concurrent/Executors.html)找到自己想要的合适的方法。

另外也可以直接创建 `ExecutorService` 的实例，`ExecutorService` 只是一个接口，`java.util.concurrent` 包已经预定义了几种实现可供我们选择，或者你也可以创建自己的实现。

例如，`ThreadPoolExecutor` 类实现了 `ExecutorService` 接口并提供了一些构造函数用于配置执行程序服务及其内部池。

```java
ExecutorService executorService = new ThreadPoolExecutor(1, 1, 0L, TimeUnit.MILLISECONDS,
    new LinkedBlockingQueue<Runnable>()
);
```

## ExecutorService 分配任务

`ExecutorService` 可以执行 `Runnable` 和 `Callable` 任务。

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

`ExecutorService` 有多种方法进行任务分配，比如 `execute()`、`submit()`、`invokeAny()` 和 `invokeAll()` 等方法，这些方法都继承自 `Executor` 接口。

### execute()

该方法返回值为空（`void`），因此使用该方法无法获得任务执行结果或检查任务的状态（是正在运行（`running`）还是执行完毕（`executed`））。

```java
executorService.execute(runnable);
```

### submit()

`submit()` 方法会将一个 `Callable` 或 `Runnable` 任务提交给 `ExecutorService` 并返回 `Future` 类型的结果。

```java
Future<String> future = executorService.submit(callable);
```

### invokeAny()

`invokeAny()` 方法将一组任务分配给 `ExecutorService`，使每个任务执行，并返回任意一个成功执行的任务的结果。

```java
Future<String> result = executorService.submit(callable);
```

### invokeAll()

`invokeAll()` 方法将一组任务分配给 `ExecutorService` ，使每个任务执行，并以 `Future` 类型的对象列表的形式返回所有任务执行的结果。

```java
List<Future<String>> futureList = executorService.invokeAll(callableList);
```

## 关闭 ExecutorService

一般情况下，`ExecutorService` 并不会自动关闭，即使所有任务都执行完毕，或者没有要处理的任务，也不会自动销毁 `ExecutorService`。它会一直出于等待状态，等待给它分配新的工作。

这种机制，在某些情况下是非常有用的，比如，应用程序需要处理不定期出现的任务，或者在编译时不知道这些任务的数量。

但另一方面，这也带来了副作用：即使应用程序可能已经到达它的终点，但并不会被停止，因为等待的 `ExecutorService` 将导致 JVM 继续运行。这样，我们就需要主动关闭 `ExecutorService`。

要正确的关闭 `ExecutorService`，可以调用实例的 `shutdown()` 或 `shutdownNow()` 方法。

### shutdown()

`shutdown()` 方法并不会立即销毁 `ExecutorService` 实例，而是首先让 `ExecutorService` 停止接受新任务，并在所有正在运行的线程完成当前工作后关闭：

```java
executorService.shutdown();
```

### shutdownNow()

`shutdownNow()` 方法会尝试立即销毁 `ExecutorService` 实例，所以并不能保证所有正在运行的线程将同时停止。该方法会返回等待处理的任务列表，由开发人员自行决定如何处理这些任务。

```java
List<Runnable> notExecutedTasks = executorService.shutDownNow();
```

### 最佳实践

关闭 `ExecutorService` 实例的最佳实战是同时使用这两种方法并结合 `awaitTermination()` 方法。使用这种方式 `ExecutorService` 首先停止执行新任务，等待指定的时间段完成所有任务，如果该时间到期，则立即停止执行。

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

Future 接口提供了一个特殊的阻塞方法 `get()`，**它返回 `Callable` 任务执行的实际结果，但如果是 `Runnable` 任务，则只会返回 `null`**。

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

```java
boolean isDone = future.isDone();
boolean canceled = future.cancel(true);
boolean isCancelled = future.isCancelled();
```
