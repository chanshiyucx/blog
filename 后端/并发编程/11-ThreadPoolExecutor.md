# ThreadPoolExecutor

> 本文为个人学习摘要笔记。  
> 原文地址：[ThreadPoolExecutor 参数解析](https://juejin.im/post/6844903554986049543)

ThreadPoolExecutor 作为 java.util.concurrent 包对外提供基础实现，以内部线程池的形式对外提供管理任务执行、线程调度、线程池管理等等服务。

ThreadPoolExecutor 是一个可被继承的线程池实现，包含了用于微调的许多参数和钩子。Executors 方法提供的线程服务，都是通过参数设置来实现不同的线程池机制。

![关系](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2020/ThreadPoolExecutor/关系.png)

## 核心构造方法

```java
public ThreadPoolExecutor(
    int corePoolSize,
    int maximumPoolSize,
    long keepAliveTime,
    TimeUnit unit,
    BlockingQueue<Runnable> workQueue,
    ThreadFactory threadFactory,
    RejectedExecutionHandler handler)
```

参数说明：

**corePoolSize 核心线程数量**

- 即使没有任务执行，核心线程也会一直存活；
- 线程数小于核心线程时，即使有空闲线程，线程池也会创建新线程执行任务；
- 设置 `allowCoreThreadTimeout=true` 时，核心线程会超时关闭。

**maximumPoolSize 最大线程数**

- 当所有核心线程都在执行任务，且任务队列已满时，线程池会创建新线程执行任务；
- 当线程数等于 maxPoolSize，且任务队列已满，此时添加任务时会触发 RejectedExecutionHandler 进行处理。

**keepAliveTime TimeUnit 线程空闲时间**

- 如果线程数大于 corePoolSize，且有线程空闲时间达到 keepAliveTime 时，线程会销毁，直到线程数量等于 corePoolSize；
- 如果设置 `allowCoreThreadTimeout=true` 时，核心线程执行完任务也会销毁直到数量为 0。

**workQueue 任务队列**

- ArrayBlockingQueue 有界队列，需要指定队列大小；
- LinkedBlockingQueue 若指定大小则和 ArrayBlockingQueue 类似，若不指定大小则默认能存储 Integer.MAX_VALUE 个任务，相当于无界队列，此时 maximumPoolSize 值其实是无意义的；
- SynchronousQueue 同步阻塞队列，当有任务添加进来后，必须有线程从队列中取出，当前线程才会被释放，相当于一个没有容量的队列，newCachedThreadPool 就使用这种队列。

**ThreadFactory 创建线程的工厂**

通过他可以创建线程时做一些想做的事，比如自定义线程名称。

**RejectedExecutionHandler**

线程数和队列都满的情况下，对新添加的任务的处理方式：

- AbortPolicy 直接抛出异常
- CallerRunsPolicy 直接调用新添加 runnable.run 函数执行任务
- DiscardPolicy 直接抛弃任务，什么也不干
- DiscardOldestPolicy 抛弃队列中最先加入的任务，然后再添加新任务

下面是自定义实现，相当于 DiscardPolicy，只打印异常信息：

```java
private static class CustomRejectedExecutionHandler implements RejectedExecutionHandler {
    private CustomRejectedExecutionHandler() {
    }

    @Override
    public void rejectedExecution(Runnable r, ThreadPoolExecutor e) {
        Log.e("umeweb", "Task " + r.toString() + " rejected from " + e.toString());
    }
}
```

## 简单线程沲实现

```java
private final ThreadPoolExecutor mExecutor;

    private ThreadPoolManager() {
        final int cpu = Runtime.getRuntime().availableProcessors();
        final int corePoolSize = cpu + 1;
        final int maximumPoolSize = cpu * 2 + 1;
        final long keepAliveTime = 1L;
        final TimeUnit timeUnit = TimeUnit.SECONDS;
        final int maxQueueNum = 128;

        mExecutor = new ThreadPoolExecutor(
                corePoolSize,
                maximumPoolSize,
                keepAliveTime,
                timeUnit,
                new LinkedBlockingQueue<Runnable>(maxQueueNum),
                new CustomThreadFactory(),
                new CustomRejectedExecutionHandler());
    }

    public void executor(@NonNull Runnable runnable) {
        mExecutor.execute(runnable);
    }
}
```

## 最佳实践

阿里巴巴 Java 开发手册中强制规定：【强制】线程池不允许使用 Executors 去创建，而是通过 ThreadPoolExecutor 的方式，这
样的处理方式让写的同学更加明确线程池的运行规则，规避资源耗尽的风险。

说明：Executors 返回的线程池对象的弊端如下：

1. FixedThreadPool 和 SingleThreadPool：允许的请求队列长度为 Integer.MAX_VALUE，可能会堆积大量的请求，从而导致 OOM；
2. CachedThreadPool 和 ScheduledThreadPool：允许的创建线程数量为 Integer.MAX_VALUE，可能会创建大量的线程，从而导致 OOM。

## DEMO

### 可暂停恢复的线程池

```java
/**
 * 描述：     演示每个任务执行前后放钩子函数
 */
public class PauseableThreadPool extends ThreadPoolExecutor {
    private final ReentrantLock lock = new ReentrantLock();
    private Condition unpaused = lock.newCondition();
    private boolean isPaused;

    public PauseableThreadPool(int corePoolSize, int maximumPoolSize, long keepAliveTime,
            TimeUnit unit,
            BlockingQueue<Runnable> workQueue) {
        super(corePoolSize, maximumPoolSize, keepAliveTime, unit, workQueue);
    }

    public PauseableThreadPool(int corePoolSize, int maximumPoolSize, long keepAliveTime,
            TimeUnit unit, BlockingQueue<Runnable> workQueue,
            ThreadFactory threadFactory) {
        super(corePoolSize, maximumPoolSize, keepAliveTime, unit, workQueue, threadFactory);
    }

    public PauseableThreadPool(int corePoolSize, int maximumPoolSize, long keepAliveTime,
            TimeUnit unit, BlockingQueue<Runnable> workQueue,
            RejectedExecutionHandler handler) {
        super(corePoolSize, maximumPoolSize, keepAliveTime, unit, workQueue, handler);
    }

    public PauseableThreadPool(int corePoolSize, int maximumPoolSize, long keepAliveTime,
            TimeUnit unit, BlockingQueue<Runnable> workQueue,
            ThreadFactory threadFactory, RejectedExecutionHandler handler) {
        super(corePoolSize, maximumPoolSize, keepAliveTime, unit, workQueue, threadFactory,
                handler);
    }

    @Override
    protected void beforeExecute(Thread t, Runnable r) {
        super.beforeExecute(t, r);
        lock.lock();
        try {
            while (isPaused) {
                unpaused.await();
            }
        } catch (InterruptedException e) {
            e.printStackTrace();
        } finally {
            lock.unlock();
        }
    }

    private void pause() {
        lock.lock();
        try {
            isPaused = true;
        } finally {
            lock.unlock();
        }
    }

    public void resume() {
        lock.lock();
        try {
            isPaused = false;
            unpaused.signalAll();
        } finally {
            lock.unlock();
        }
    }

    public static void main(String[] args) throws InterruptedException {
        PauseableThreadPool pauseableThreadPool = new PauseableThreadPool(10, 20, 10L, TimeUnit.SECONDS, new LinkedBlockingQueue<>());
        Runnable runnable = () -> {
            System.out.println("我被执行");
            try {
                Thread.sleep(10);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        };
        for (int i = 0; i < 10000; i++) {
            pauseableThreadPool.execute(runnable);
        }
        Thread.sleep(1500);
        pauseableThreadPool.pause();
        System.out.println("线程池被暂停了");
        Thread.sleep(1500);
        pauseableThreadPool.resume();
        System.out.println("线程池被恢复了");
    }
}
```
