# HashMap 面试大全

关于 HashMap 参考前文 [Java HashMap](https://chanshiyu.gitbook.io/blog/hou-duan/java/14-java-hashmap)

## 001 HashMap 的结构

二维结构，第一维是数组，第二维是链表。

## 002 Get 方法的流程

先调用 Key 的 hashcode 方法拿到对象的 hash 值，然后用 hash 值对第一维数组的长度进行取模，得到数组的下标。这个数组下标所在的元素就是第二维链表的表头。然后遍历这个链表，使用 Key 的 equals 同链表元素进行比较，匹配成功即返回链表元素里存放的值。

## 003 Get 方法的时间复杂度

O(1)，虽然 Get 方法的流程里需要遍历链表，但链表的长度很短，相比总元素的个数可以忽略不计，所以不是 O(n) 而是 O(1)。

## 004 为什么红黑树来代替链表

关键在于如果 Key 的 hashcode 不是随机的，而是人为特殊构造的话，那么第二维链表可能会无比的长，而且分布极为不均匀，这个时候就会出现性能问题。比如我们把对象的 hashcode 都统一返回一个常量，最终的结果就是 hashmap 会退化为一维链表，Get 方法的性能巨降为 O(n)，使用红黑树可以将性能提升到 O(log(n))。

## 005 参数 loadFactor 作用

loadFactor 表示 HashMap 的拥挤程度，影响 hash 操作到同一个数组位置的概率。默认 loadFactor 等于 0.75，当 HashMap 里面容纳的元素已经达到 HashMap 数组长度的 75% 时，表示 HashMap 太挤了，需要扩容，在 HashMap 的构造器中可以定制 loadFactor。

## 006 HashMap 是否线程安全

当然不是，线程安全的 HashMap 是 ConcurrentHashMap。
