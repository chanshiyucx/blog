# Atom 原子类

在 Java 并发编程中，经常通过 `synchronized` 进行控制来达到线程安全的目的。但是由于 `synchronized` 是采用的是**悲观锁**策略，并不是特别高效的一种解决方案。实际上，在 J.U.C 下的 atomic 包提供了一系列的操作简单、性能高效、并能保证线程安全的类去更新基本类型变量、数组元素、引用类型以及更新对象中的字段类型。atomic 包下的这些类都是采用的是**乐观锁**策略去原子更新数据，在 java 中则是使用 CAS 操作具体实现。

## CAS 操作

### 什么是 CAS

CAS（compare and swap）， 比较并交换。使用锁时，线程获取锁是一种悲观锁策略，即假设每一次执行临界区代码都会产生冲突，所以当前线程获取到锁的时候同时也会阻塞其他线程获取该锁。而 CAS 操作（又称无锁操作）是一种乐观锁策略，它假设所有线程访问共享资源的时候不会出现冲突，既然不会出现冲突自然而然就不会阻塞其他线程的操作。因此，线程就不会出现阻塞停顿的状态。那么，如果出现冲突了怎么办？无锁操作是使用 CAS 又叫做比较交换来鉴别线程是否出现冲突，出现冲突就重试当前操作直到没有冲突为止。

### CAS 的操作过程

CAS 比较交换的过程可以通俗的理解为 CAS(V,O,N)，包含三个值分别为：V 内存地址存放的实际值；O 预期的值（旧值）；N 更新的新值。当 V 和 O 相同时，也就是说旧值和内存中实际的值相同表明该值没有被其他线程更改过，即该旧值 O 就是目前来说最新的值了，自然而然可以将新值 N 赋值给 V。反之，V 和 O 不相同，表明该值已经被其他线程改过了则该旧值 O 不是最新版本的值了，所以不能将新值 N 赋给 V，返回 V 即可。当多个线程使用 CAS 操作一个变量是，只有一个线程会成功，并成功更新，其余会失败。失败的线程会重新尝试，当然也可以选择挂起线程。

### Synchronized VS CAS

`synchronized` 在存在线程竞争的情况下会出现线程阻塞和唤醒锁带来的性能问题，因为这是一种**互斥同步**。而 CAS 并不是武断的间线程挂起，当 CAS 操作失败后会进行一定的尝试，而非进行耗时的挂起唤醒的操作，因此也叫做**非互斥同步**。这是两者主要的区别。

### CAS 存在的问题

**1. ABA 问题**

因为 CAS 会检查旧值有没有变化，这里存在这样一个有意思的问题。比如一个旧值 A 变为了成 B，然后再变成 A，刚好在做 CAS 时检查发现旧值并没有变化依然为 A，但是实际上的确发生了变化。解决方案可以沿袭数据库中常用的乐观锁方式，添加一个版本号可以解决。原来的变化路径 A->B->A 就变成了 1A->2B->3C。

**2.自旋时间过长**

使用 CAS 时非阻塞同步，也就是说不会将线程挂起，会自旋（无非就是一个死循环）进行下一次尝试，如果这里自旋时间过长对性能是很大的消耗。

## 原子更新基本类型

atomic 包提高原子更新基本类型的工具类有：

- AtomicBoolean：以原子更新的方式更新 Boolean；
- AtomicInteger：以原子更新的方式更新 Integer；
- AtomicLong：以原子更新的方式更新 Long。

这几个类的用法基本一致，这里以 AtomicInteger 为例总结常用的方法：

- `addAndGet(int delta)`：以原子方式将输入的数值与实例中原本的值相加，并返回最后的结果；
- `incrementAndGet()`：以原子的方式将实例中的原值进行加 1 操作，并返回最终相加后的结果；
- `getAndIncrement()`：以原子的方式将实例中的原值加 1，返回的是自增前的旧值；
- `getAndSet(int newValue)`：将实例中的值更新为新值，并返回旧值。

为了能够弄懂 AtomicInteger 的实现原理，以 `getAndIncrement` 方法为例，来看下源码：

```java
public final int getAndIncrement() {
    return unsafe.getAndAddInt(this, valueOffset, 1);
}
```

可以看出，该方法实际上是调用了 unsafe 实例的 `getAndAddInt` 方法，unsafe 实例的获取时通过 UnSafe 类的静态方法 `getUnsafe` 获取：

```java
private static final Unsafe unsafe = Unsafe.getUnsafe();
```

Unsafe 类在 sun.misc 包下，Unsafer 类提供了一些底层操作，atomic 包下的原子操作类的也主要是通过 Unsafe 类提供的 `compareAndSwapInt`，`compareAndSwapLong` 等一系列提供 CAS 操作的方法来进行实现，并且由于 CAS 是采用乐观锁策略，因此，这种数据更新的方法也具有高效性。

AtomicLong 的实现原理和 AtomicInteger 一致，只不过一个针对的是 long 变量，一个针对的是 int 变量。而 boolean 变量的更新类 AtomicBoolean 类是怎样实现更新的呢？核心方法是 `compareAndSet` 方法，其源码如下：

```java
public final boolean compareAndSet(boolean expect, boolean update) {
    int e = expect ? 1 : 0;
    int u = update ? 1 : 0;
    return unsafe.compareAndSwapInt(this, valueOffset, e, u);
}
```

可以看出，`compareAndSet` 方法的实际上也是先转换成 0,1 的整型变量，然后是通过针对 int 型变量的原子更新方法 `compareAndSwapInt` 来实现的。

## 原子更新数组类型

atomic 包下提供能原子更新数组中元素的类有：

- AtomicIntegerArray：原子更新整型数组中的元素；
- AtomicLongArray：原子更新长整型数组中的元素；
- AtomicReferenceArray：原子更新引用类型数组中的元素。

这几个类的用法一致，就以 AtomicIntegerArray 来总结下常用的方法：

- `addAndGet(int i, int delta)`：以原子更新的方式将数组中索引为 i 的元素与输入值相加；
- `getAndIncrement(int i)`：以原子更新的方式将数组中索引为 i 的元素自增加 1；
- `compareAndSet(int i, int expect, int update)`：将数组中索引为 i 的位置的元素进行更新。

可以看出，AtomicIntegerArray 与 AtomicInteger 的方法基本一致，只不过在 AtomicIntegerArray 的方法中会多一个指定数组索引位 i。

## 原子更新引用类型

如果需要原子更新引用类型变量的话，为了保证线程安全，atomic 也提供了相关的类：

- AtomicReference：原子更新引用类型；
- AtomicReferenceFieldUpdater：原子更新引用类型里的字段；
- AtomicMarkableReference：原子更新带有标记位的引用类型。

```java
public class AtomicDemo {
    private static AtomicReference reference = new AtomicReference();

    public static void main(String[] args) {
        User user1 = new User("a", 1);
        reference.set(user1);
        User user2 = new User("b",2);
        User user = reference.getAndSet(user2);
        System.out.println(user); // User{userName='a', age=1}
        System.out.println(reference.get()); // User{userName='b', age=2}
    }

    static class User {
        private String userName;
        private int age;

    public User(String userName, int age) {
        this.userName = userName;
        this.age = age;
    }
}
```

## 原子更新字段类型

如果需要更新对象的某个字段，并在多线程的情况下，能够保证线程安全，atomic 同样也提供了相应的原子操作类：

- AtomicIntegeFieldUpdater：原子更新整型字段类；
- AtomicLongFieldUpdater：原子更新长整型字段类；
- AtomicStampedReference：原子更新引用类型，这种更新方式会带有版本号。而为什么在更新的时候会带有版本号，是为了解决 CAS 的 ABA 问题。

要想使用原子更新字段需要两步操作：

- 原子更新字段类都是抽象类，只能通过静态方法 newUpdater 来创建一个更新器，并且需要设置想要更新的类和属性；
- 更新类的属性必须使用 public volatile 进行修饰，不能使用 static 或 final 关键字修饰。

这几个类提供的方法基本一致，以 AtomicIntegerFieldUpdater 为例来看看具体的使用：

```java
public class AtomicDemo {
  private static AtomicIntegerFieldUpdater updater = AtomicIntegerFieldUpdater.newUpdater(User.class,"age");

  public static void main(String[] args) {
      User user = new User("a", 1);
      int oldValue = updater.getAndAdd(user, 5);
      System.out.println(oldValue); // 1
      System.out.println(updater.get(user)); // 6
  }

  static class User {
      private String userName;
      public volatile int age;

      public User(String userName, int age) {
          this.userName = userName;
          this.age = age;
      }
  }
}
```

## LongAdder

```java
public class AtomicLongDemo {

    public static void main(String[] args) {
        AtomicLong counter = new AtomicLong(0);
        ExecutorService service = Executors.newFixedThreadPool(20);
        long start = System.currentTimeMillis();
        for (int i = 0; i < 10000; i++) {
            service.submit(new Task(counter));
        }
        service.shutdown();
        while (!service.isTerminated()) {

        }
        long end = System.currentTimeMillis();
        System.out.println("AtomicLong 运算结果：" + counter.get() + "，耗时：" + (end - start));
    }

    private static class Task implements Runnable {

        private AtomicLong counter;

        Task(AtomicLong counter) {
            this.counter = counter;
        }

        @Override
        public void run() {
            for (int i = 0; i < 10000; i++) {
                counter.incrementAndGet();
            }
        }
    }
}
```

```
AtomicLong 运算结果：100000000，耗时：1916
```

```java
public class LongAdderDemo {

    public static void main(String[] args) {
        LongAdder counter = new LongAdder();
        ExecutorService service = Executors.newFixedThreadPool(20);
        long start = System.currentTimeMillis();
        for (int i = 0; i < 10000; i++) {
            service.submit(new Task(counter));
        }
        service.shutdown();
        while (!service.isTerminated()) {
        }
        long end = System.currentTimeMillis();
        System.out.println("LongAdder 运算结果：" + counter.sum() + "，耗时：" + (end - start));
    }

    private static class Task implements Runnable {
        private LongAdder counter;

        Task(LongAdder counter) {
            this.counter = counter;
        }

        @Override
        public void run() {
            for (int i = 0; i < 10000; i++) {
                counter.increment();
            }
        }
    }
}
```

```
LongAdder 运算结果：100000000，耗时：133
```

运行速度提升不止十倍！在小并发的环境下，论更新的效率，两者都差不多。但是高并发的场景下，LongAdder 有着明显更高的吞吐量，但是有着更高的空间复杂度（以空间换时间）。当我们的场景是为了统计计数，而不是为了更细粒度的同步控制时，并且是在多线程更新的场景时，LongAdder 类比 AtomicLong 更好用。

虽然高并发下 LongAdder 效率远高于 AtomicLong，但 LongAdder 并不能完全替代 AtomicLong，LongAdder 适合的场景是统计求和计数的场景，而且 LongAdder 基本只提供了 add 方法，而 AtomicLong 还具有 CAS 方法。

## LongAccumulator

LongAdder 类是 LongAccumulator 的一个特例，LongAccumulator 提供了比 LongAdder 更强大的功能，如下构造函数根据输入的两个参数返回一个计算值，identity 则是 LongAccumulator 累加器的初始值。

```java
public class LongAccumulatorDemo {

    public static void main(String[] args) {
        LongAccumulator accumulator = new LongAccumulator((x, y) -> 2 + x * y, 1);
        ExecutorService executor = Executors.newFixedThreadPool(8);
        IntStream.range(1, 10).forEach(i -> executor.submit(() -> accumulator.accumulate(i)));
        executor.shutdown();
        while (!executor.isTerminated()) {
        }
        System.out.println(accumulator.getThenReset());
    }
}
```

LongAdder 其实是 LongAccumulator 的一个特例，`new LongAdder()` 的调用相当于 `new LongAccumulator((x, y) -> x + y, 0)`。前者初始值只能默认为 0，后者可以指定累加规则比如不是累加而是相乘，只需要构造 LongAccumulator 时候传入自定义双面运算器就 OK，前者则内置累加的规则。

> LongAccumulator will work correctly if we supply it with a commutative function where the order of accumulation does not matter.

只有不在乎执行顺序时才适合使用 LongAccumulator。
