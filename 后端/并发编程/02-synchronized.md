# synchronized 关键字

`synchronized` 关键字采用对**代码块/方法体**加锁的方式解决 Java 中多线程访问同一个资源时，引起的资源冲突问题。

一句话总结：`synchronized` 能够保证同一时刻最多只有一个线程执行某段代码，以达到保证并发安全的效果。

## 使用方式

`synchronized` 同步锁分对象锁和类锁：

- 对象锁：对单个实例对象的独享内存的部分区域加锁
- 类锁：对整个类的共享内存的部分区域加锁

`synchronized` 关键字最主要的三种使用方式：

1. 修饰实例方法
2. 修饰静态方法
3. 修饰代码块

**对象锁，修饰代码块/实例方法**

```java
public class T {

    private int count = 10;

    private Object o = new Object();

    private void m1() {
        // 任何线程需要执行下面代码，需要拿到 o 的锁
        synchronized (o) {
            count--;
            System.out.println(Thread.currentThread().getName() + " count = " + count);
        }
    }

     private void m2() {
        // 使用 this 对象，而不需要手动创建 o 对象
        // 任何线程需要执行下面代码，需要拿到 this 的锁
        synchronized (this) {
            count--;
            System.out.println(Thread.currentThread().getName() + " count = " + count);
        }
    }

    // 等同于 synchronized (this)
    private synchronized void m3() {
        count--;
        System.out.println(Thread.currentThread().getName() + " count = " + count);
    }

}
```

**类锁，修饰代码块/静态方法**

```java
public class T {

    private static int count = 10;

    public static void m1() {
        synchronized (T.class) {
            count--;
            System.out.println(Thread.currentThread().getName() + " count = " + count);
        }
    }

    // 等同于 包名.T.class
    private synchronized static void m2() {
        count--;
        System.out.println(Thread.currentThread().getName() + " count = " + count);
    }

}
```

`synchronized` 是原子操作，原子操作不可分。

## 一些栗子

### 0x01 丢失的请求数

```java
public class T implements Runnable {

    private int count = 10;

    @Override
    public /* synchronized */ void run() {
        count--;
        System.out.println(Thread.currentThread().getName() + " count = " + count);
    }

    public static void main(String[] args) {
        T t = new T();
        for (int i = 0; i < 5; i++) {
            new Thread(t, "Thread" + i).start();
        }
    }

}
```

### 0x02 脏读

业务写方法加锁，读方法不加锁，产生脏读问题：

```java
public class Account {

    private String name;

    private double balance;

    public synchronized void set(String name, double balance) {
        this.name = name;

        try {
            TimeUnit.SECONDS.sleep(3);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        this.balance = balance;
    }

    // 读方法也加锁后，脏读不出现
    private /* synchronized */ double get(String name) {
        return this.balance;
    }

    public static void main(String[] args) {
        Account a = new Account();

        new Thread(() -> a.set("shiyu", 100)).start();

        try {
            TimeUnit.SECONDS.sleep(1);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        System.out.println("balance: " + a.get("shiyu"));


        try {
            TimeUnit.SECONDS.sleep(3);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        System.out.println("balance: " + a.get("shiyu"));

    }

}
```

```
balance: 0.0
balance: 100.0
```

### 0x03 同步与非同步方法同时调用

```java
public class T {

    public synchronized void m1() {
        System.out.println(Thread.currentThread().getName() + " m1 start");
        try {
            Thread.sleep(6000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println(Thread.currentThread().getName() + " m1 end");
    }

    public void m2() {
        try {
            Thread.sleep(3000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println(Thread.currentThread().getName() + " m2 end");
    }

    public static void main(String[] args) {
        T t = new T();

        new Thread(t::m1, "t1").start();
        new Thread(t::m2, "t2").start();
    }
}
```

```
t1 m1 start
t2 m2 end
t1 m1 end
```

### 0x04 同步方法调用

一个同步方法可以调用另一个同步方法，一个线程已经拥有了某个对象的锁，再次申请的时候仍然会得到该对象的锁，即 **`synchronied` 同步锁可重入**，可重入的粒度是线程级。

可重入的好处：

1. 避免死锁
2. 提升封装性，避免重复的加锁和释放锁

> `synchronied` 的两大特性：可重入和不可中断。

```java
public class T {

    public synchronized void m1() {
        System.out.println("m1 start");
        try {
            TimeUnit.SECONDS.sleep(1);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        m2();
    }

    public synchronized void m2() {
        try {
            TimeUnit.SECONDS.sleep(1);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println("m2 end");
    }

}
```

### 0x05 子类调用父类同步锁

下面栗子中子类和父类的锁对象是同一个，是 `new TT()` 子类对象，因为 `synchronized` 修饰的方法锁的是 `this` 对象，而这里 `this` 就是指向子类对象。

```java
public class T {

    public synchronized void m() {
        System.out.println("m start");
        try {
            TimeUnit.SECONDS.sleep(1);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println("m end");
    }

    public static void main(String[] args) {
        new TT().m();
    }

}

class TT extends T {
    @Override
    public synchronized void m() {
        System.out.println("child m start");
        super.m();
        System.out.println("child m end");
    }
}
```

```
child m start
m start
m end
child m end
```

### 0x06 异常释放锁

**程序在执行过程中，如果出现异常，默认情况下锁会被释放**。所以，在并发处理过程中，有异常要多加小心，不然可能会发生不一致的情况。

比如第一个线程出现异常，锁被释放，其他线程进入同步代码区，有可能会访问到异常产生时的数据。

```java
public class T {

    private int count = 0;

    public synchronized void m() {
        System.out.println(Thread.currentThread().getName() + " start");
        while (true) {
            count++;
            System.out.println(Thread.currentThread().getName() + " count = " + count);
            try {
                TimeUnit.SECONDS.sleep(1);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }

            // 此处抛出异常，锁将被释放，如果不想释放锁，需要进行异常捕获
            if (count == 5) {
                int i = 1 / 0;
            }
        }
    }

    public static void main(String[] args) {
        T t = new T();
        new Thread(t::m, "t1").start();
        try {
            TimeUnit.SECONDS.sleep(3);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        // 理论上 t2 线程永远抢不到锁，因为 t1 线程一直在执行，但是由于 t1 线程抛出异常，锁被释放，所以 t2 线程能够执行
        new Thread(t::m, "t2").start();
    }

}
```

```
t1 start
t1 count = 1
t1 count = 2
t1 count = 3
t1 count = 4
t1 count = 5
Exception in thread "t1" t2 start
t2 count = 6
java.lang.ArithmeticException: / by zero
  at s007.T.m(T.java:27)
  at java.lang.Thread.run(Thread.java:748)
t2 count = 7
t2 count = 8
t2 count = 9
```

## 语句优化

synchronized 同步代码块中的语句越少越好。比较下面 m1 和 m2。

```java
public class T {

    private int count = 0;

    public synchronized void m1() {
        // do sth need not sync
        try {
            TimeUnit.SECONDS.sleep(1);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        // 业务逻辑中只有下面这句需要 sync，这时不应该给整个方法上锁
        count++;
    }

    public void m2() {
        try {
            TimeUnit.SECONDS.sleep(1);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        // 采用细粒度的锁，可以使线程争用时间变短，从而提高效率
        synchronized (this) {
            count++;
        }
    }

}
```

## 锁对象改变

锁定某对象 o，如果 o 属性发生变化，不影响锁的使用。但是如果 o 引用了新的一个对象，则锁定的对象发生改变。应该避免将锁定对象的引用变成另外的对象。

```java
public class T {

    private Object o = new Object();

    public void m() {
        synchronized (o) {
            while (true) {
                try {
                    TimeUnit.SECONDS.sleep(1);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                System.out.println(Thread.currentThread().getName());
            }
        }
    }

    public static void main(String[] args) {
        T t = new T();

        // 启动第一个线程
        new Thread(t::m, "t1").start();

        try {
            TimeUnit.SECONDS.sleep(3);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        // 创建第二个线程
        new Thread(t::m, "t2").start();

        // 锁对象发生改变，所以 t2 线程得以启动，如果注释这句，t2 线程永远无法启动
        t.o = new Object();
    }

}
```

## 避免字符串作为锁对象

不要以字符串常量作为锁对象，在下面栗子中，m1 和 m2 其实锁定的是同一个对象。

```java
public class T {

    private String s1 = "Hello";

    private String s2 = "Hello";

    public void m1() {
        synchronized (s1) {
            System.out.println("m1 start");
            while (true) {
                try {
                    TimeUnit.SECONDS.sleep(1);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    public void m2() {
        synchronized (s2) {
            System.out.println("m2 start");
        }
    }

    public static void main(String[] args) {
        T t = new T();
        // 只有 t1 启动，t2 无法启动
        new Thread(t::m1, "t1").start();
        new Thread(t::m2, "t2").start();
    }

}
```

## 面试题

### 0x01 元素监听

实现一个容器，提供两个方法 add 和 size。写两个线程，线程 1 添加 10 个元素到容器中，线程 2 实现监控元素的个数，当个数到 5 时，线程 2 给出提示并结束。

初步实现：

```java
public class T {

    // 添加 volatile，使 t2 能够得到通知
    private volatile List<Object> list = new ArrayList<>();

    public void add(Object o) {
        list.add(o);
    }

    private int size() {
        return list.size();
    }

    public static void main(String[] args) {
        T t = new T();
        new Thread(() -> {
            for (int i = 0; i < 10; i++) {
                t.add(new Object());
                System.out.println("add " + i);
                try {
                    TimeUnit.SECONDS.sleep(1);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }).start();

        new Thread(() -> {
            // 虽然可以实现，但是浪费 cpu，且不够精确
            while (true) {
                if(t.size() == 5) {
                    break;
                }
            }
            System.out.println("t2 end");
        }).start();
    }
}
```

上面方法有两个缺点，一是循环判断浪费 cpu，二是判断时依旧可能会新增元素，不够精确。

进阶优化版：

```java
public class T {

    private volatile List<Object> list = new ArrayList<>();

    public void add(Object o) {
        list.add(o);
    }

    private int size() {
        return list.size();
    }

    public static void main(String[] args) {
        T t = new T();
        final Object LOCK = new Object();

        new Thread(() -> {
            synchronized (LOCK) {
                System.out.println("t2 start");
                if (t.size() != 5) {
                    try {
                        LOCK.wait();
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
                System.out.println("t2 end");
                // 让 t2 继续执行
                LOCK.notify();
            }
        }, "t2").start();


        try {
            TimeUnit.SECONDS.sleep(1);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        new Thread(() -> {
            synchronized (LOCK) {
                System.out.println("t1 start");
                for (int i = 0; i < 10; i++) {
                    t.add(new Object());
                    System.out.println("add " + i);

                    if (t.size() == 5) {
                        LOCK.notify();
                        // 释放锁，让 t1 继续执行
                        try {
                            LOCK.wait();
                        } catch (InterruptedException e) {
                            e.printStackTrace();
                        }
                    }

                    try {
                        TimeUnit.SECONDS.sleep(1);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
            }
        }, "t1").start();
    }
}
```

需要注意的是 `wait` 会释放锁，而 `notify` 不会释放锁。需要让 t2 监听线程先执行，然后等待，t1 线程添加元素到 5 个时通知 t2，同时 t1 自己 `wait` 释放锁，不然 t2 无法执行，等到 t2 执行完毕，再通知 t1 执行。t1、t2 线程交替执行，通信过程比较繁琐。

最终优化版，使用门闩 `CountDownLatch` 代替 `wait` 和 `notify`，`CountDownLatch` 不涉及到锁定：

```java
public class T {

    private volatile List<Object> list = new ArrayList<>();

    public void add(Object o) {
        list.add(o);
    }

    private int size() {
        return list.size();
    }

    public static void main(String[] args) {
        T t = new T();
        CountDownLatch latch = new CountDownLatch(1);

        new Thread(() -> {
            System.out.println("t2 start");
            if (t.size() != 5) {
                try {
                    latch.await();
                    // 也可以指定时间
                    // latch.await(1000,TimeUnit.MILLISECONDS);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
            System.out.println("t2 end");
        }, "t2").start();


        try {
            TimeUnit.SECONDS.sleep(1);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        new Thread(() -> {
            System.out.println("t1 start");
            for (int i = 0; i < 10; i++) {
                t.add(new Object());
                System.out.println("add " + i);

                if (t.size() == 5) {
                    latch.countDown();
                }

                try {
                    TimeUnit.SECONDS.sleep(1);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }, "t1").start();
    }
}
```

当不涉及同步，只是涉及线程通信的时候，用 `synchorized + wait/notify` 显得太重了。
