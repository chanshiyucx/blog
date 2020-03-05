# volatile 关键字

**`volatile` 关键字使一个变量在多个线程间可见**。

A、B 线程都有用到一个变量，java 默认是 A 线程缓冲区保留一份 copy，这样如果 B 线程修改了变量，则 A 线程未必知道。使用 `volatile` 关键字，当 B 线程修改了变量的值，会告知 A 线程缓冲区的变量已过期，A 线程就会刷新缓冲区，从主内存中读到变量的修改值（修改 -> 通知 -> 刷新）。

```java
public class T {

    // 不加 volatile，程序永远不会停下
    /* volatile */ boolean running = true;

    public void m() {
        System.out.println("m start");
        while (running) {
            System.out.println("running");
            try {
                TimeUnit.SECONDS.sleep(1);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
        System.out.println("m end");
    }

    public static void main(String[] args) {
        T t = new T();

        /*
          需要注意，如果直接执行 t.m() 而不是另起线程，那么无论是否加 volatile，程序都不会停下，循环判断中的 running 一直为 true
        */
        new Thread(t::m).start();

        try {
            TimeUnit.SECONDS.sleep(5);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        t.running = false;
        System.out.println(t.running);
    }

}
```

`volatile` 并不能保证多个线程共同修改 running 变量时所带来的不一致问题，因为 `volatile` 只保证了可见性，并不保证原子性，所以 `volatile` 并不能替代 `synchronized`。

以下栗子可以看出区别，当不加 `synchronized` 时，最终结果远小于 100000，其错误原因：假设当前值 count 为 100，两个线程 A、B 同时读到的值都是 100（保证了可见性），这时 A、B 线程都执行了 +1 操作，先后覆盖写入 count 值 101，他们不会去检查 count 是否已经是 101，所以两次 +1 操作只实现了一次效果。

```java
public class T {

    volatile private int count = 0;

    // 不加 synchronized，最终结果远小于 10 * 10000
    public /* synchronized */ void m() {
        for (int i = 0; i < 10000; i++) {
            count++;
        }
    }

    public static void main(String[] args) {
        T t = new T();

        List<Thread> threadList = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            threadList.add(new Thread(t::m, "Thread" + i));
        }
        threadList.forEach(Thread::start);
        threadList.forEach(thread -> {
            try {
                thread.join();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        });

        System.out.println("count: " + t.count);
    }

}
```

其实，除了上面 `synchronized` 解决方法外，java 提供的 `AtomicInteger` 相关类也可以解决。因为 `count.getAndIncrement()` 是一个原子操作，而 `count++` 不是。

```java
public class T {

    private AtomicInteger count = new AtomicInteger(0);

    public void m() {
        for (int i = 0; i < 10000; i++) {
            count.getAndIncrement();
        }
    }

    public static void main(String[] args) {
        T t = new T();

        List<Thread> threadList = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            threadList.add(new Thread(t::m, "Thread" + i));
        }
        threadList.forEach(Thread::start);
        threadList.forEach(thread -> {
            try {
                thread.join();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        });

        System.out.println("count: " + t.count.get());
    }

}
```

不过需要注意的是 `AtomicInteger` 本身方法是原子性的，但不能保证多个方法的连续调用是原子性的。再举个栗子，我们将上面栗子稍微修改一下，加一个判断，我们预期最后 count 值为 1000，但是实际结果却会大于 1000，因为虽然 `count.get()` 和 `count.getAndIncrement()` 都是原子操作，但是两者之间却不是，所以会出现当前 count 值为 999，A 线程 `count.get() < 1000` 判断为真进入循环后，此时 B 线程执行加一操作后值为 1000，A 线程依旧执行加一操作，导致最终结果偏大。

```java
public void m() {
    for (int i = 0; i < 10000; i++) {
        if (count.get() < 1000) {
            count.getAndIncrement();
        }
    }
}
```
