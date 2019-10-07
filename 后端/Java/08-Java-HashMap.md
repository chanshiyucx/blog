# Java HashMap

> 本文为个人学习摘要笔记。  
> 原文地址：[Java8 系列之重新认识 HashMap](<https://mp.weixin.qq.com/s?__biz=MjM5NjQ5MTI5OA==&mid=2651745258&idx=1&sn=df5ffe0fd505a290d49095b3d794ae7a&mpshare=1&scene=1&srcid=0602KPwDM6cb3PTVMdtZ0oX1&key=807bd2816f4e789364526e7bba50ceab7c749cfaca8f63fc1c6b02b65966062194edbc2e5311116c053ad5807fa33c366a23664f76b0b440a62a3d40ec12e7e72973b0481d559380178671cc3771a0db&ascene=0&uin=NjkzMTg2NDA%3D&devicetype=iMac+MacBookPro11%2C2+OSX+OSX+10.12.5+build(16F73)&version=12020810&nettype=WIFI&fontScale=100&pass_ticket=ebineaMbB8BVIeUpnUZjBm8%2BZice%2Bhba5IDsVDpufNY%3D>)

## 摘要

HashMap 是 Java 使用频率最高的用于映射（键值对）处理的数据类型。JDK1.8 对 HashMap 底层的实现进行了优化，例如引入红黑树的数据结构和扩容的优化等。

Java 为数据结构中的映射定义了一个接口 `java.util.Map`，此接口主要有四个常用的实现类，分别是 `HashMap、Hashtable、LinkedHashMap` 和 `TreeMap`，类继承关系如下图所示：

![java.util.Map](https://raw.githubusercontent.com/chanshiyucx/poi/master/2019/java.util.Map.jpg)

下面针对各个实现类的特点说明：

- `HashMap`：它根据键的 hashCode 值存储数据，大多数情况下可以直接定位到它的值，因而具有很快的访问速度，但遍历顺序却是不确定的。`HashMap` 最多只允许一条记录的键为 null，允许多条记录的值为 null。`HashMap` 非线程安全，即任一时刻可以有多个线程同时写 `HashMap`，可能会导致数据的不一致。如果需要满足线程安全，可以用 `Collections` 的 `synchronizedMap` 方法使 `HashMap` 具有线程安全的能力，或者使用 `ConcurrentHashMap`。
- `Hashtable`：`Hashtable` 是遗留类，很多映射的常用功能与 `HashMap` 类似，不同的是它承自 `Dictionary` 类，并且是线程安全的，任一时间只有一个线程能写 `Hashtable`，并发性不如 `ConcurrentHashMap`，因为 `ConcurrentHashMap` 引入了分段锁。**`Hashtable` 不建议在新代码中使用**，不需要线程安全的场合可以用 `HashMap` 替换，需要线程安全的场合可以用 `ConcurrentHashMap` 替换。
- `LinkedHashMap`：`LinkedHashMap` 是 `HashMap` 的一个子类，保存了记录的插入顺序，在用 Iterator 遍历 `LinkedHashMap` 时，先得到的记录肯定是先插入的，也可以在构造时带参数，按照访问次序排序。
- `TreeMap`：`TreeMap` 实现 `SortedMap` 接口，能够把它保存的记录根据键排序，默认是按键值的升序排序，也可以指定排序的比较器，当用 Iterator 遍历 `TreeMap` 时，得到的记录是排过序的。如果使用排序的映射，建议使用 `TreeMap`。在使用 `TreeMap` 时，key 必须实现 Comparable 接口或者在构造 `TreeMap` 传入自定义的 Comparator，否则会在运行时抛出 `java.lang.ClassCastException` 类型的异常。

对于上述四种 Map 类型的类，**要求映射中的 key 是不可变对象**。不可变对象是该对象在创建后它的哈希值不会被改变。如果对象的哈希值发生变化，Map 对象很可能就定位不到映射的位置了。
