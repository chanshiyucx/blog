# Java fail fast

> 本文为个人学习摘要笔记。  
> 原文地址：[Java，你告诉我 fail-fast 是什么鬼？](http://www.justdojava.com/2019/10/12/java-fail-fast/)

什么是 Java fail fast，通过一段说明来解释：

> In systems design, a fail-fast system is one which immediately reports at its interface any condition that is likely to indicate a failure. Fail-fast systems are usually designed to stop normal operation rather than attempt to continue a possibly flawed process. Such designs often check the system’s state at several points in an operation, so any failures can be detected early. The responsibility of a fail-fast module is detecting errors, then letting the next-highest level of the system handle them.

在系统设计中，快速故障系统是一种立即在其接口上报告任何可能指示故障情况的系统。快速故障系统通常旨在停止正常运行，而不是尝试继续可能存在缺陷的过程。这样的设计通常会在操作的几个点检查系统状态，因此可以及早发现任何故障。快速故障模块的职责是检测错误，然后让系统的下一个最高级别处理错误。

其实，这是一种理念，说白了就是在做系统设计的时候先考虑异常情况，一旦发生异常，直接停止并上报。

举个栗子：

```java
public int divide(int divisor,int dividend){
    if(dividend == 0){
        throw new RuntimeException("dividend can't be null");
    }
    return divisor/dividend;
}
```

上面的代码是一个对两个整数做除法的方法，在 divide 方法中，我们对被除数做了个简单的检查，如果其值为 0，那么就直接抛出一个异常，并明确提示异常原因。这其实就是 fail-fast 理念的实际应用。

这样做的好处就是可以预先识别出一些错误情况，一方面可以避免执行复杂的其他代码，另外一方面，这种异常情况被识别之后也可以针对性的做一些单独处理。

## 异常复现

在 Java 中，如果在 foreach 循环里对某些集合元素进行元素的 `remove/add` 操作的时候，就会触发 fail-fast 机制，进而抛出 `ConcurrentModificationException`。

举个栗子：

```java
List<String> list = new ArrayList<>();
list.add("沉默王二");
list.add("沉默王三");
list.add("一个文章真特么有趣的程序员");

for (String str : list) {
    if ("沉默王二".equals(str)) {
        list.remove(str);
    }
}

System.out.println(list);
```

运行错误：

```
Exception in thread "main" java.util.ConcurrentModificationException
    at java.util.ArrayList$Itr.checkForComodification(ArrayList.java:909)
    at java.util.ArrayList$Itr.next(ArrayList.java:859)
    at com.cmower.java_demo.str.Cmower3.main(Cmower3.java:14)
```

## 异常原理

分析 ArrayList.java 的 909 行源码：

```java
final void checkForComodification() {
    if (modCount != expectedModCount)
        throw new ConcurrentModificationException();
}
```

也就是说，`remove` 的时候执行了 `checkForComodification` 方法，该方法对 `modCount` 和 `expectedModCount` 进行了比较，发现两者不等，就抛出了 `ConcurrentModificationException` 异常。

那么 `modCount` 和 `expectedModCount` 是什么？是什么原因导致他们的值不想等的呢？

`modCount` 是 ArrayList 中的一个成员变量，它表示该集合实际被修改的次数，初始值为 0。

`expectedModCount` 是 ArrayList 中的一个内部类——Itr 中的成员变量。它表示这个迭代器预期该集合被修改的次数。其值随着 Itr 被创建而初始化。只有通过迭代器对集合进行操作，该值才会改变。

可为什么会执行 `checkForComodification` 方法呢？这就需要反编译一下 for each 那段代码了。

```java
List<String> list = new ArrayList();
list.add("沉默王二");
list.add("沉默王三");
list.add("一个文章真特么有趣的程序员");
Iterator var3 = list.iterator();

while (var3.hasNext()) {
    String str = (String) var3.next();
    if ("沉默王二".equals(str)) {
        list.remove(str);
    }
}

System.out.println(list);
```

可以发现原来 for each 是通过迭代器 Iterator 配合 while 循环实现的。`ArrayList.iterator()` 返回的 Iterator 其实是 ArrayList 的一个内部类 Itr。

```java
public Iterator<E> iterator() {
    return new Itr();
}
```

Itr 实现了 Iterator 接口：

```java
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
        Object[] elementData = ArrayList.this.elementData;
        if (i >= elementData.length)
            throw new ConcurrentModificationException();
        cursor = i + 1;
        return (E) elementData[lastRet = i];
    }
}
```

也就是说 `new Itr()` 的时候 `expectedModCount` 被赋值为 `modCount`，而 `modCount` 是 List 的一个成员变量，表示集合被修改的次数。由于 list 此前执行了 3 次 add 方法，所以 `modCount` 的值为 3；`expectedModCount` 的值也为 3。

可当执行 `list.remove(str)`，会调用 `fastRemove` 方法，`modCount` 的值变成了 4，但它只修改了 `modCount`，并没有对`expectedModCount` 做任何操作。

```java
private void fastRemove(int index) {
    modCount++;
    int numMoved = size - index - 1;
    if (numMoved > 0)
        System.arraycopy(elementData, index+1, elementData, index,
                         numMoved);
    elementData[--size] = null; // clear to let GC do its work
}
```

之后下一次循环执行到 `String str = (String) var3.next();` 的时候，就会调用 `checkForComodification` 方法，此时一个为 3，一个为 4，就只好抛出异常 `ConcurrentModificationException` 了。

![fastRemove](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/Java-fail-fast/java-fail-fast.png)

总结：在 for each 循环中，集合遍历其实是通过迭代器 Iterator 配合 while 循环实现的，但是元素的 `remove` 却直接使用的集合类自身的方法。这就导致 Iterator 在遍历的时候，会发现元素在自己不知情的情况下被修改了，它觉得很难接受，就抛出了异常。

这里 Iterator 使用了 fail-fast 的保护机制。

## 避开 fail-fast 保护机制

通过上面的分析，相信大家都明白为什么不能在 for each 循环里进行元素的 `remove` 了。那怎么避开 fail-fast 保护机制呢？毕竟删除元素是常规操作，咱不能因噎废食啊。

我们可以使用 Iterator 的 `remove` 方法就可以避开 fail-fast 保护机制：

```java
List<String> list = new ArrayList<>();
list.add("沉默王二");
list.add("沉默王三");
list.add("一个文章真特么有趣的程序员");

Iterator<String> itr = list.iterator();

while (itr.hasNext()) {
    String str = itr.next();
    if ("沉默王二".equals(str)) {
        itr.remove();
    }
}
```

为什么使用 Iterator 的 remove 方法就可以避开 fail-fast 保护机制呢？看一下 remove 的源码就明白了：

```java
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
```

虽然删除元素依然使用的是 ArrayList 的 `remove` 方法，但是删除完会执行 `expectedModCount = modCount`，保证了 `expectedModCount` 与 `modCount` 的同步。

## 总结

在 Java 中，fail-fast 从狭义上讲是针对多线程情况下的集合迭代器而言的。

`ConcurrentModificationException` 异常可能由于检测到对象在并发情况下被修改而抛出的，而这种修改是不允许的。比如说一个线程在修改集合，而另一个线程在迭代它。这种情况下，迭代的结果是不确定的。如果检测到这种行为，一些 Iterator（比如说 ArrayList 的内部类 Itr）就会选择抛出该异常。这样的迭代器被称为 fail-fast 迭代器，因为尽早的失败比未来出现不确定的风险更好。
