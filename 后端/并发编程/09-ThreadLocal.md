# ThreadLocal

> 本文为个人学习摘要笔记。  
> 原文地址：[廖雪峰 Java 教程 - 使用 ThreadLocal](https://www.liaoxuefeng.com/wiki/1252599548343744/1306581251653666)

对于多任务，Java 标准库提供的线程池可以方便地执行这些任务，同时复用线程。那么如何在一个线程内传递状态？

如下栗子，一个内部需要调用若干其他方法，同时传递参数 user。

```java
public void process(User user) {
    checkPermission(user);
    doWork(user);
    saveStatus(user);
    sendResponse(user);
}
```

这种在一个线程中，横跨若干方法调用，需要传递的对象，我们通常称之为上下文（Context），它是一种状态，可以是用户身份、任务信息等。

给每个方法增加一个 context 参数非常麻烦，而且有些时候，如果调用链有无法修改源码的第三方库，User 对象就传不进去了。

Java 标准库提供了一个特殊的 `ThreadLocal`，它可以在一个线程中传递同一个对象。

`ThreadLocal` 实例通常总是以静态字段初始化如下：

```java
static ThreadLocal<String> threadLocalUser = new ThreadLocal<>();
```

使用方式：

```java
void processUser(user) {
    try {
        threadLocalUser.set(user);
        step1();
        step2();
    } finally {
        threadLocalUser.remove();
    }
}

void step1() {
    User u = threadLocalUser.get();
    printUser();
}

void step2() {
    User u = threadLocalUser.get();
    checkUser(u.id);
}
```

注意到**普通的方法调用一定是同一个线程执行的**，所以，`step1()`、`step2()` 方法内，`threadLocalUser.get()` 获取的 User 对象是同一个实例。

实际上，可以把 `ThreadLocal` 看成一个全局 `Map<Thread, Object>`，每个线程获取 `ThreadLocal` 变量时，总是使用 Thread 自身作为 key：

```java
Object threadLocalValue = threadLocalMap.get(Thread.currentThread());
```

因此，`ThreadLocal` 相当于给每个线程都开辟了一个独立的存储空间，各个线程的 `ThreadLocal` 关联的实例互不干扰。

最后，特别注意 **ThreadLocal 一定要在 finally 中清除**。这是因为当前线程执行完相关代码后，很可能会被重新放入线程池中，如果 `ThreadLocal` 没有被清除，该线程执行其他代码时，会把上一次的状态带进去。

为了保证能释放 `ThreadLocal` 关联的实例，我们可以通过 `AutoCloseable` 接口配合 `try (resource) {...}` 结构，让编译器自动为我们关闭。例如，一个保存了当前用户名的 `ThreadLocal` 可以封装为一个 `UserContext` 对象：

```java
public class UserContext implements AutoCloseable {

    static final ThreadLocal<String> ctx = new ThreadLocal<>();

    public UserContext(String user) {
        ctx.set(user);
    }

    public static String currentUser() {
        return ctx.get();
    }

    @Override
    public void close() {
        ctx.remove();
    }
}
```

使用方式：

```java
try (var ctx = new UserContext("Bob")) {
    // 可任意调用UserContext.currentUser():
    String currentUser = UserContext.currentUser();
} // 在此自动调用UserContext.close()方法释放ThreadLocal关联对象
```

这样就在 `UserContext` 中完全封装了 `ThreadLocal`，外部代码在 `try (resource) {...}` 内部可以随时调用 `UserContext.currentUser()` 获取当前线程绑定的用户名。

## 小结

`ThreadLocal` 空间换时间，`synchronized` 时间换空间。

- `ThreadLocal` 表示线程的“局部变量”，它确保每个线程的 `ThreadLocal` 变量都是各自独立的；
- `ThreadLocal` 适合在一个线程的处理流程中保持上下文（避免了同一参数在所有方法中传递）；
- 使用 `ThreadLocal` 要用 `try ... finally` 结构，并在 `finally` 中清除。

## DEMO

### ThreadLocal SimpleDateFormat

```java
/**
 * 10 个线程执行 1000 次打印格式化日期，每个线程有自己的格式化对象
 */
public class ThreadLocalNormalUsage03 {

    private static ExecutorService threadPool = Executors.newFixedThreadPool(10);

    private static ThreadLocal<SimpleDateFormat> dateFormatThreadLocal = ThreadLocal.withInitial(() -> new SimpleDateFormat("yyyy-MM-dd HH:mm:ss"));

    public static void main(String[] args) {
        for (int i = 0; i < 1000; i++) {
            int finalI = i;
            threadPool.submit(() -> {
                String date = new ThreadLocalNormalUsage03().date(finalI);
                System.out.println(date);
            });
        }
        threadPool.shutdown();
    }

    private String date(int seconds) {
        Date date = new Date(1000 * seconds);
        SimpleDateFormat simpleDateFormat = dateFormatThreadLocal.get();
        return simpleDateFormat.format(date);
    }
}
```
