# ArrayList 和 LinkedList

> 本文为个人学习摘要笔记。  
> 原文地址：[List 中的 ArrayList 和 LinkedList 源码分析](http://www.justdojava.com/2019/04/05/java-List/)

List 是单列集合 Collection 下的一个实现类，List 的实现接口又有几个，一个是 ArrayList，还有一个是 LinkedList，还有 Vector，这次研究下这三个类的源码。

## ArrayList

ArrayList 是我们在开发中最常用的数据存储容器，它的底层是通过数组来实现的。我们在集合里面可以存储任何类型的数据，而且他是一个顺序容器，存放的数据顺序就是和我们放入的顺序是一致的，而且他还允许我们放入 null 元素，我们可以画个图理解一下。

![ArrayList](https://cdn.jsdelivr.net/gh/chanshiyucx/poi/2019/ArrayList.jpg)

上图数组里面存放的元素的引用，再分析下源码。

### 源码分析

```java
/**
 * Default initial capacity.
 * 默认初始容量
 */
private static final int DEFAULT_CAPACITY = 10;

/**
 * Shared empty array instance used for empty instances.
 * 如果是数组刚初始化就会用这个空数组替代它，这是自定义容量为0的时候。
 */
private static final Object[] EMPTY_ELEMENTDATA = {};

/**
 * 未自定义容量，数组刚初始化就会用这个空数组替代它
 */
private static final Object[] DEFAULTCAPACITY_EMPTY_ELEMENTDATA = {};

/**
 * 这个elementDate就是底层使用的数组
 */
transient Object[] elementData; // non-private to simplify nested class access

/**
 * 实际ArrayList集合大小 也就是实际元素的个数
 */
private int size;
```

`DEFAULT_CAPACITY` 是默认的初始容量，容量是 10，`EMPTY_ELEMENTDATA` 这代表的是一个空的初始化数组。 `DEFAULTCAPACITY_EMPTY_ELEMENTDATA` 区别上边，他是自定义容量为 0 的时候的空数组。

空的初始化数组 `EMPTY_ELEMENTDATA` 与自定义容量为 0 的时候的空数组 `DEFAULTCAPACITY_EMPTY_ELEMENTDATA` 区别在哪？通过他的构造函数了解下。

### 构造

```java
/**
 * Constructs an empty list with an initial capacity of ten.
 * 这个地方就会构造一个初始容量为10的数组
 */
public ArrayList() {
    this.elementData = DEFAULTCAPACITY_EMPTY_ELEMENTDATA;
}

public ArrayList(int initialCapacity) {
    if (initialCapacity > 0) {
        this.elementData = new Object[initialCapacity];
    } else if (initialCapacity == 0) {
        this.elementData = EMPTY_ELEMENTDATA;
    } else {
        throw new IllegalArgumentException("Illegal Capacity: "+
                                           initialCapacity);
    }
}
```

无参构造器构造一个初始容量为 10 的数组，但是构造函数只是给 elementDate 赋值了一个空数组，其实就是在我们添加元素的时候，容量自动扩充为 10。

总结：如果是使用无参构造时，是把 `DEFAULTCAPACITY_EMPTY_ELEMENTDATA` 给了 elementDate ，当 initialCapacity 为 0 的时候，就把 `EMPTY_ELEMENTDATA` 赋值给了 elementDate，如果 initialCapacity 大于 0，就会初始化一个 initialCapacity 长度的数组给 elementDate。

### 迭代器

使用过 ArrayList 的人一般都知道，在执行 for 循环的时候一般情况是不会去执行 remove 的操作的，因为 remove 的操作会改变这个集合的大小， 所以会有可能出现数组角标越界异常。
