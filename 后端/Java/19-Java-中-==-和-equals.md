# Java 中 == 和 equals

> 本文为个人学习摘要笔记。  
> 原文地址：[面试必问之：Java 中 == 和 equals 的区别你知道吗](http://www.justdojava.com/2019/03/21/Java-and-equals/)

## == 是什么

在《java 核心技术卷 1》中将 `==` 归类于关系运算符。

`==` 常用于相同的基本数据类型之间的比较，也可用于相同类型的对象之间的比较：

- 如果 `==` 比较的是基本数据类型，那么比较的是两个基本数据类型的值是否相等；
- 如果 `==` 是比较的两个对象，那么比较的是两个对象的引用，也就是两个对象是否为同一个对象，并不是比较的对象的内容；

## equals 是什么

在《java 核心技术卷 1》中对 Object 类的描述：Object 类是 java 中所有类的始祖，在 java 中每个类都是由 Object 类扩展而来；每个类都默认继承 Object 类，所以每一个类都有 Object 类中的方法；从而每一个类都有 `equals` 方法。

`equals` 方法主要用于两个对象之间，检测一个对象是否等于另一个对象，查看 Object 类中 `equals` 方法的源码：

```java
public boolean equals(Object obj) {
    return (this == obj);
}
```

可以看出来 Object 类中的 `equals` 方法用的还是 `==`，也就是比较的两个对象的引用是否相等，并不是根据对象中的属性来判断两个对象是否相等的；也就是说我们自己定义的类中，如果没有重写 `equals` 方法，实际上还是用的 `==` 来比较的两个对象，用 `equals` 方法比较的结果与用 `==` 比较的结果是一样的。

java 语言规范要求 `equals` 方法具有以下特性：

- 自反性：对于任意不为 null 的引用值 x，`x.equals(x)` 一定是 true。
- 对称性：对于任意不为 null 的引用值 x 和 y，当且仅当 `x.equals(y)` 是 true 时，`y.equals(x)` 也是 true。
- 传递性：对于任意不为 null 的引用值 x、y 和 z，如果 `x.equals(y)` 是 true，同时 `y.equals(z)` 是 true，那么 `x.equals(z)` 一定是 true。
- 一致性：对于任意不为 null 的引用值 x 和 y，如果用于 equals 比较的对象信息没有被修改的话，多次调用时 `x.equals(y)` 要么一致地返回 true 要么一致地返回 false。
- 对于任意不为 null 的引用值 x，`x.equals(null)` 返回 false。

## hashCode 作用

> Hash，是把任意长度的输入（又叫做预映射 pre-image）通过散列算法变换成固定长度的输出，该输出就是散列值。这种转换是一种压缩映射，也就是，散列值的空间通常远小于输入的空间，不同的输入可能会散列成相同的输出，所以不可能从散列值来确定唯一的输入值。简单的说就是一种将任意长度的消息压缩到某一固定长度的消息摘要的函数。

散列函数能使对一个数据序列的访问过程更加迅速有效，通过散列函数，数据元素将被更快地定位。

Java 对于 `eqauls` 方法和 `hashCode` 方法是这样规定的：

- 如果两个对象相同，那么它们的 `hashCode` 值一定要相同；
- 如果两个对象的 `hashCode` 相同，它们并不一定相同。
- `equals()` 相等的两个对象，`hashcode()` 一定相等；`equals()` 不相等的两个对象，却并不能证明他们的 `hashcode()` 不相等。

Hashcode 值主要用于基于散列的集合，如 HashMap、HashSet、HashTable 等等。这些集合都使用到了 hashCode，想象一下，这些集合中存有大量的数据，我们向其中插入或取出一条数据，插入时如何判断插入的数据已经存在？取出时如何取出相同的数据？难道一个一个去比较？这时候，hashCode 就提现出它的价值了，大大的减少了处理时间，这个有点类似于 MySQL 的索引。

举个栗子，String 类重写了 `equals` 和 `hashCode` 方法：

```java
public class Test {
    public static void main(String[] args){
        // 未重写hashCode的类
        User userOne = new User("aa","11");
        User userTwo = new User("aa","11");
        System.out.println(userOne.hashCode()); // 752848266
        System.out.println(userTwo.hashCode()); // 815033865
        // 重写hashCode的类
        String a = new String("string");
        String b = new String("string");
        System.out.println(a.hashCode()); // -891985903
        System.out.println(b.hashCode()); // -891985903
    }
}
```
