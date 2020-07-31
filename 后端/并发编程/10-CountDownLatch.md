# CountDownLatch

> 本文为个人学习摘要笔记。  
> 原文地址：[CountDownLatch 详解](https://www.jianshu.com/p/128476015902)

`CountDownLatch` 中 count down 是倒数的意思，latch 则是门闩的含义。整体含义可以理解为倒数的门栓，似乎有一点“三二一，芝麻开门”的感觉。

在构造 `CountDownLatch` 的时候需要传入一个整数 n，在这个整数“倒数”到 0 之前，主线程需要等待在门口，而这个“倒数”过程则是由各个执行线程驱动的，每个线程执行完一个任务“倒数”一次。

总结来说，`CountDownLatch` 的作用就是等待其他的线程都执行完任务，必要时可以对各个任务的执行结果进行汇总，然后主线程才继续往下执行。

`CountDownLatch` 类只提供了一个构造器和三个主要方法：

```java
public CountDownLatch(int count) {};  // 参数 count 为计数值

public void await() throws InterruptedException {};   // 调用 await() 方法的线程会被挂起，它会等待直到 count 值为 0 才继续执行
public boolean await(long timeout, TimeUnit unit) throws InterruptedException {};  // 和 await() 类似，只不过等待一定的时间后 count 值还没变为 0 的话就会继续执行
public void countDown() {};  // 将 count 值减 1
```

`countDown()` 方法用于使计数器减一，一般是执行任务的线程调用，`await()` 方法则使调用该方法的线程处于等待状态，一般是主线程调用。直到某个线程将计数器倒数至 0，其就会唤醒在 `await()` 方法中等待的线程。

这里需要注意的是，`countDown()` 方法并没有规定一个线程只能调用一次，当同一个线程调用多次 `countDown()` 方法时，每次都会使计数器减一；另外，`await()` 方法也并没有规定只能有一个线程执行该方法，如果多个线程同时执行 `await()` 方法，那么这几个线程都将处于等待状态，并且以共享模式享有同一个锁。

举个栗子：

```java
public class T {

    public static void main(String[] args) throws InterruptedException {
        final int size = 5;
        CountDownLatch countDownLatch = new CountDownLatch(size);
        for (int i = 0; i < size; i++) {
            new Thread(() -> {
                System.out.println(Thread.currentThread().getName() + " start");
                try {
                    TimeUnit.SECONDS.sleep(3);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                System.out.println(Thread.currentThread().getName() + " end");
                countDownLatch.countDown();
            }, "Thread" + i).start();
        }
        System.out.println("main thread await");
        countDownLatch.await();
        System.out.println("main thread finishes await");
    }

}
```

```
Thread0 start
Thread2 start
Thread1 start
Thread3 start
Thread4 start
main thread await
Thread1 end
Thread4 end
Thread2 end
Thread3 end
Thread0 end
main thread finishes await
```

将上面栗子改造下，使用 `try...finally` 结构，保证创建的线程发生异常时 `CountDownLatch.countDown()` 方法也会执行，也就保证了主线程不会一直处于等待状态。

```java
public class T {

    private CountDownLatch latch;

    private T(CountDownLatch latch) {
        this.latch = latch;
    }

    private void sleep(int second) {
        try {
            TimeUnit.SECONDS.sleep(second);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

    private void exec() {
        // 保证 countDown 会被执行
        try {
            System.out.println(Thread.currentThread().getName() + " start");
            sleep(3);
            System.out.println(Thread.currentThread().getName() + " end");
        } finally {
            latch.countDown();
        }
    }

    public static void main(String[] args) throws InterruptedException {
        final int size = 5;
        CountDownLatch countDownLatch = new CountDownLatch(size);
        T t = new T(countDownLatch);
        for (int i = 0; i < size; i++) {
            new Thread(t::exec, "Thread" + i).start();
        }
        System.out.println("main thread await");
        countDownLatch.await();
        System.out.println("main thread finishes await");
    }

}
```

`CountDownLatch` 非常适合于对任务进行拆分，使其并行执行，比如某个任务执行 2s，其对数据的请求可以分为五个部分，那么就可以将这个任务拆分为 5 个子任务，分别交由五个线程执行，执行完成之后再由主线程进行汇总，此时，总的执行时间将决定于执行最慢的任务，平均来看，还是大大减少了总的执行时间。

另外一种比较合适使用 `CountDownLatch` 的地方是使用某些外部链接请求数据的时候，比如批量获取图片，如果使用单个线程顺序获取，那么等待时间将会极长，此时就可以使用 `CountDownLatch` 对获取图片的操作进行拆分，并行的获取图片，这样也就缩短了总的获取时间。
