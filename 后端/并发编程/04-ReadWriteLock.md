# ReadWriteLock

> 本文为个人学习摘要笔记。  
> 原文地址：[廖雪峰 Java 教程 - 使用 ReadWriteLock](https://www.liaoxuefeng.com/wiki/1252599548343744/1306581002092578)

前面讲到的 `ReentrantLock` 保证了只有一个线程可以执行临界区代码：

```java
public class Counter {
    private final Lock lock = new ReentrantLock();
    private int[] counts = new int[10];

    public void inc(int index) {
        lock.lock();
        try {
            counts[index] += 1;
        } finally {
            lock.unlock();
        }
    }

    public int[] get() {
        lock.lock();
        try {
            return Arrays.copyOf(counts, counts.length);
        } finally {
            lock.unlock();
        }
    }
}
```

但是有些时候，这种保护有点过头。因为任何时刻，只允许一个线程修改，也就是调用 `inc()` 方法是必须获取锁，但是，`get()` 方法只读取数据，不修改数据，它实际上允许多个线程同时调用。实际上我们想要的是：**允许多个线程同时读，但只要有一个线程在写，其他线程就必须等待**。

使用 `ReadWriteLock` 可以解决这个问题，它保证：

- 只允许一个线程写入（其他线程既不能写入也不能读取）；
- 没有写入时，多个线程允许同时读（提高性能）；
- 有线程读取时，其他线程不能写入。

|     | 读     | 写     |
| --- | ------ | ------ |
| 读  | 允许   | 不允许 |
| 写  | 不允许 | 不允许 |

用 `ReadWriteLock` 实现这个功能十分容易。我们需要创建一个 `ReadWriteLock` 实例，然后分别获取读锁和写锁：

```java
public class T {

    private final ReadWriteLock readWriteLock = new ReentrantReadWriteLock();

    private final Lock rLock = readWriteLock.readLock();

    private final Lock wLock = readWriteLock.writeLock();

    private int count = 0;

    public void add() {
        wLock.lock();
        try {
            count += 1;
        } finally {
            wLock.unlock();
        }
    }

    public int get() {
        rLock.lock();
        try {
            return count;
        } finally {
            rLock.unlock();
        }
    }

}
```

把读写操作分别用读锁和写锁来加锁，在读取时，多个线程可以同时获得读锁，这样就大大提高了并发读的执行效率。使用 `ReadWriteLock` 时，适用条件是同一个数据，有大量线程读取，但仅有少数线程修改。例如，一个论坛的帖子，回复可以看做写入操作，它是不频繁的，但是，浏览可以看做读取操作，是非常频繁的，这种情况就可以使用 `ReadWriteLock`。

## 小结

- `ReadWriteLock` 可以提高读取效率：
- `ReadWriteLock` 只允许一个线程写入；
- `ReadWriteLock` 允许多个线程在没有写入时同时读取；
- `ReadWriteLock` 适合读多写少的场景。
