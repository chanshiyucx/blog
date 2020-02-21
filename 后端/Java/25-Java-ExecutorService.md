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
Runnable runnable = () -> {
    try {
        TimeUnit.MILLISECONDS.sleep(300);
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
};

Callable<String> callable = () -> {
    TimeUnit.MILLISECONDS.sleep(300);
    return "Hello world";
};

// 外层括号建立了一个 ArrayList 的匿名子类，内层括号定义了一个该匿名子类的构造块（构造对象时会自动执行的代码块）
List<Callable<String>> callableList = new ArrayList<Callable<String>>() {
    {
        add(callable);
    }
};
```
