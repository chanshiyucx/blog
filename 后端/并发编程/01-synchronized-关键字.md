# synchronized 关键字

`synchronized` 关键字采用对**代码块/方法体**加锁的方式解决 Java 中多线程访问同一个资源时，引起的资源冲突问题。

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

### 0x01 数据共享导致线程安全问题

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

### 0x02 同步与非同步方法同时调用

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

### 0x03 脏读

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

### 0x04 同步方法调用

一个同步方法可以调用另一个同步方法，一个线程已经拥有了某个对象的锁，再次申请的时候仍然会得到该对象的锁，即 **`synchronied` 同步锁可重入**。

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
