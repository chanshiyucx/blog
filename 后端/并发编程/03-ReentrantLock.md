# ReentrantLock

> 本文为个人学习摘要笔记。  
> 原文地址：[廖雪峰 Java 教程 - 使用 ReentrantLock](https://www.liaoxuefeng.com/wiki/1252599548343744/1306580960149538)

从 Java 5 开始，引入了一个高级的处理并发的 `java.util.concurrent` 包，它提供了大量更高级的并发功能，能大大简化多线程程序的编写。

我们知道 `synchronized` 关键字用于加锁，但这种锁一是很重，二是获取时必须一直等待，没有额外的尝试机制。`java.util.concurrent.locks` 包提供的 `ReentrantLock` 用于替代 `synchronized` 加锁。

```java
public class T {

    Lock lock = new ReentrantLock();

    private void m1() {
        System.out.println("m1 start");
        lock.lock(); // 等同于 synchronized(this)
        try {
            for (int i = 0; i < 10; i++) {
                TimeUnit.SECONDS.sleep(1);
            }
        } catch (InterruptedException e) {
            e.printStackTrace();
        } finally {
            lock.unlock();
        }
    }

    private void m2() {
        lock.lock();
        System.out.println("m2 start");
        lock.unlock();
    }

    public static void main(String[] args) {
        T t = new T();
        new Thread(t::m1, "t1").start();

        try {
            TimeUnit.SECONDS.sleep(1);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        new Thread(t::m2, "t2").start();
    }

}
```

因为 `synchronized` 是 Java 语言层面提供的语法，所以我们不需要考虑异常，而 `ReentrantLock` 是 Java 代码实现的锁，我们就必须先获取锁，然后在 `finally` 中正确释放锁。

顾名思义，`ReentrantLock` 是可重入锁，它和 `synchronized` 一样，一个线程可以多次获取同一个锁。

和 `synchronized` 不同的是，`ReentrantLock` 可以尝试获取锁：

```java
if (lock.tryLock(1, TimeUnit.SECONDS)) {
    try {
        ...
    } finally {
        lock.unlock();
    }
}
```

上述代码在尝试获取锁的时候，最多等待 1 秒。如果 1 秒后仍未获取到锁，`tryLock()` 返回 false，程序就可以做一些额外处理，而不是无限等待下去。

所以，使用 `ReentrantLock` 比直接使用 `synchronized` 更安全，线程在 `tryLock()` 失败的时候不会导致死锁。

## 小结

- `ReentrantLock` 可以替代 `synchronized` 进行同步；
- `ReentrantLock` 获取锁更安全；
- 必须先获取到锁，再进入 `try {...}` 代码块，最后使用 `finally` 保证释放锁；
- 可以使用 `tryLock()` 尝试获取锁。
