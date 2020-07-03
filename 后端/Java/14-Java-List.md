# Java List

> 本文为个人学习摘要笔记。  
> 原文地址：[List 中的 ArrayList 和 LinkedList 源码分析](http://www.justdojava.com/2019/04/05/java-List/)

List 是单列集合 Collection 下的一个实现类，List 的实现接口又有几个，一个是 ArrayList，还有一个是 LinkedList，还有 Vector，这次研究下这三个类的源码。

## ArrayList

ArrayList 是我们在开发中最常用的数据存储容器，它的底层是通过数组来实现的。我们在集合里面可以存储任何类型的数据，而且他是一个顺序容器，存放的数据顺序就是和我们放入的顺序是一致的，而且他还允许我们放入 null 元素，我们可以画个图理解一下。

![ArrayList](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/ArrayList-和-LinkedList/ArrayList.jpg)

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

`DEFAULT_CAPACITY` 是默认的初始容量，容量是 10，`EMPTY_ELEMENTDATA` 这代表的是一个空的初始化数组（自定义容量为 0）。 `DEFAULTCAPACITY_EMPTY_ELEMENTDATA` 区别上边，他是未自定义容量的空数组。

`EMPTY_ELEMENTDATA` 与 `DEFAULTCAPACITY_EMPTY_ELEMENTDATA` 区别在哪？通过他的构造函数了解下。

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

具体详情可以参考：[18 Java fail fast](https://chanshiyu.gitbook.io/blog/hou-duan/java/18-java-fail-fast)

这里再次分析下源码：

```java
public Iterator<E> iterator() {
    return new Itr();
}

private class Itr implements Iterator<E> {
    int cursor;       // index of next element to return
    int lastRet = -1; // index of last element returned; -1 if no such
    int expectedModCount = modCount;

    Itr() {}

    public boolean hasNext() {
        return cursor != size;
    }

    @SuppressWarnings("unchecked")
    public E next() {
        checkForComodification();
        int i = cursor;
        if (i >= size)
            throw new NoSuchElementException();
        Object[] elementData = ArrayList.this.elementData;
        if (i >= elementData.length)
            throw new ConcurrentModificationException();
        cursor = i + 1;
        return (E) elementData[lastRet = i];
    }

    public void remove() {
        if (lastRet < 0)
            throw new IllegalStateException();
        checkForComodification();

        try {
            ArrayList.this.remove(lastRet);
            cursor = lastRet;
            lastRet = -1;
            expectedModCount = modCount;
        } catch (IndexOutOfBoundsException ex) {
            throw new ConcurrentModificationException();
        }
    }
}
```

在这个方法内部 next 是最主要的一个方法，他首先去判断了 `expectedModCount` 和 `modCount` 是否一样，然后去看 cursor，是不是超过集合的大小和数组的长度，然后去把 cursor 的值给 lastRet，返回的是下标 lastRet 的元素，最后 cursor 加 1，这样就是说每调用一次 next 方法，cursor 和 lastRet 都会加 1。

当我们在调用 remove 方法的时候，他会去判断 lastRet 是否小于 0，然后去判断 `expectedModCount` 和 `modCount` 是否一样，然后他去调用 `ArrayList.remove()` 方法去删除下标是 lastRet 的元素，然后把 lastRet 赋值给 cursor，然后初始化 `lastRet = -1`，最后把 `modCount` 重新赋值给 `expectedModCount`。

## LinkedList

LinkedList 的底层是一个双向链表的结构，它可以进行高效的插入和移除的操作。

![LinkedList 节点](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/ArrayList-和-LinkedList/LinkedList1.jpg)

LinkedList 是由很多个这样的节点组成的：

- prev 是存储的上一个节点的引用
- element 是存储的具体的内容
- next 是存储的下一个节点的引用

整体结构：

![LinkedList 整体结构](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/ArrayList-和-LinkedList/LinkedList2.jpg)

图解中可以看出 LinkedList 有好多的 Node，并且还有 first 和 last 这两个变量保存头部和尾部节点的信息。

需要注意：**LinkedList 不是一个循环的双向链表，因为他前后都是 null**。

### 源码分析

#### 变量

```java
/**
* 集合元素的数量
*/
transient int size = 0;

/**
 * Pointer to first node.
 * Invariant: (first == null && last == null) ||
 *            (first.prev == null && first.item != null)
 * 指向第一个节点的指针
 */
transient Node<E> first;

/**
 * Pointer to last node.
 * Invariant: (first == null && last == null) ||
 *            (last.next == null && last.item != null)
 * 指向最后一个节点的指针
 */
transient Node<E> last;
```

#### 构造方法

```java

/**
 * Constructs an empty list.
 * 无参构造
 */
public LinkedList() {
}

/**
 * 将集合C中的所有的元素都插入到链表中
 * @param  c the collection whose elements are to be placed into this list
 * @throws NullPointerException if the specified collection is null
 */
public LinkedList(Collection<? extends E> c) {
    this();
    addAll(c);
}
```

#### Node 节点

```java
private static class Node<E> {
    // 值
    E item;

    //后继 指向下一个的引用
    Node<E> next;

    //前驱 指向前一个的引用
    Node<E> prev;

    Node(Node<E> prev, E element, Node<E> next) {
        this.item = element;
        this.next = next;
        this.prev = prev;
    }
}
```

### addAll

```java

/**
 * 将集合插入到链表的尾部
 */
public boolean addAll(Collection<? extends E> c) {
    return addAll(size, c);
}

public boolean addAll(int index, Collection<? extends E> c) {
    checkPositionIndex(index);

    // 获取目标集合转为数组
    Object[] a = c.toArray();
    // 新增元素的数量
    int numNew = a.length;
    // 如果新增元素为0，则不添加，并且返回false
    if (numNew == 0)
        return false;

    // 定义index节点的前置节点，后置节点
    Node<E> pred, succ;

    // 判断是不是链表的尾部，如果是，那么就在链表尾部追加数据
    // 尾部的后置节点一定是null，前置节点是队尾
    if (index == size) {
        succ = null;
        pred = last;
    } else {
        // 如果不是在链表的末尾而是在中间位置的话，
        // 取出index节点，作为后继节点
        succ = node(index);
        // index节点的前节点，作为前驱的节点
        pred = succ.prev;
    }

    // 链表批量的增加，去循环遍历原数组，依次去插入节点的操作
    for (Object o : a) {
        @SuppressWarnings("unchecked")
        // 类型转换
        E e = (E) o;
        // 前置节点为pred，后置节点为null，当前节点值为e的节点newNode
        Node<E> newNode = new Node<>(pred, e, null);
        // 如果前置节点为空， 则newNode为头节点，否则为pred的next节点
        if (pred == null)
            first = newNode;
        else
            pred.next = newNode;
        // 将新节点标记为前置节点，之后在此节点后添加新节点
        pred = newNode;
    }
    // 循环结束后，如果后置节点是null，说明此时是在队尾追加的
    if (succ == null) {
        last = pred;
    } else {
        // 否则是在队中插入的节点 ，更新前置节点 后置节点
        pred.next = succ;
        succ.prev = pred;
    }
    // 修改数量size
    size += numNew;
    // 修改modCount
    modCount++;
    return true;
}
```

### addFist

将 e 元素添加到链表并且设置其为头节点 Fist：

```java
public void addFirst(E e) {
    linkFirst(e);
}

/**
 * Links e as first element.
 * 将e元素弄成链接列表的第一个元素
 */
private void linkFirst(E e) {
    final Node<E> f = first;

    // 链表开头前驱为空，值为e，后继为f
    final Node<E> newNode = new Node<>(null, e, f);
    first = newNode;

    // 若f为空，则表明列表中还没有元素，last也应该指向newNode
    if (f == null)
        last = newNode;
    else
        // 否则，前first的前驱指向newNode
        f.prev = newNode;
    size++;
    modCount++;
}
```

### addLast

将元素添加到链表，并且设置为尾部的节点 next：

```java
public void addLast(E e) {
    linkLast(e);
}

/**
 * Links e as last element.
 * 将e元素弄成链接列表的last元素
 */
void linkLast(E e) {
    final Node<E> l = last;

    // 前驱为前last，值为e，后继为null
    final Node<E> newNode = new Node<>(l, e, null);
    last = newNode;

    // 最后一个节点为空，说明列表中无元素
    if (l == null)
        // first同样指向此节点
        first = newNode;
    else
        // 否则，前last的后继指向当前节点
        l.next = newNode;
    size++;
    modCount++;
}
```

需要注意：**ArrayList 和 LinkedList 都是线程不安全的，因为，他内部的方法都没有进行方法同步，或者说是加锁**。

## Vector

Vector 并不常用，他是一个可实现自动增长的数组，同时也是一个线程安全的数组。

```java
// 它底层也是个数组 但是他的修饰符确实protected的而ArrayList是一个transient的。
protected Object[] elementData;

// 它的方法都是通过synchronized关键字来修饰的
public synchronized void addElement(E obj) {
    modCount++;
    ensureCapacityHelper(elementCount + 1);
    elementData[elementCount++] = obj;
}
```

`synchronized` 关键字表面的意思是：当有两个并发线程同时访问一个对象代码块的时候，在同一个时刻，只能有一个线程得到执行，而另外的一个线程受到阻塞，必须等待当前线程的代码执行完这个代码块之后才能执行该代码。

也就是说在执行 `synchronized` 代码块的时候会锁定当前的对象，只有执行完改代码块之后才能释放锁，下一个线程开始锁定对象执行。

## 总结

List 实现类：

- ArrayList–>数组结构–>线程不安全，效率高–>查询快，增删慢–>容量不够扩容，当前容量长度\*1.5+1；默认长度为 10，第一次扩充后的长度为 16，第二次扩充后的长度为 25，第三次扩从后的长度为 38.5，不取用四舍五入，为 38； 但是要注意，JDk1.7 是 1.5+1；而 JDK8 是 1.5，所以视情况而定
- LinkedList–>双向链表结构–>线程不安全，效率高–>查询慢，增删快–>链表直接在头部尾部新增都可以，所以没有倍数；
- Vector–>数组结构–>线程安全，效率低–>查询快，增删慢–>扩容长度是：当前容量长度\*2；
