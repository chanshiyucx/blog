# BlockingQueue

> 本文为个人学习摘要笔记。  
> 官方文档：[Oracle BlockingQueue](https://docs.oracle.com/javase/7/docs/api/java/util/concurrent/BlockingQueue.html)

BlockingQueue，即阻塞队列被广泛使用在“生产者-消费者”问题中，其原因是 BlockingQueue 提供了可阻塞的插入和移除的方法。当队列容器已满，生产者线程会被阻塞，直到队列未满；当队列容器为空时，消费者线程会被阻塞，直至队列非空时为止。

## BlockingQueue API

BlockingQueue 有 4 种不同的方法来插入、删除和检查队列中的元素。每一组方法的行为都是不同的，以防被请求的操作不能立即执行。以下是 4 种方法的具体分类：

|  操作   | Throws Exception |  特殊值  |            超时             |  阻塞  |
| :-----: | :--------------: | :------: | :-------------------------: | :----: |
| Insert  |      add(e)      | offer(e) | offer(e, timeout, timeunit) | put(e) |
| Remove  |    remove(e)     |  poll()  |   poll(timeout, timeunit)   | take() |
| Examine |    element()     |  peek()  |              -              |   -    |

这四种不同的行为方式意思：

- Throws Exception：如果尝试的操作不可能立即发生，则抛出一个异常；
- 特殊值：如果尝试的操作不能立即执行，则会返回一个特殊值（是否成功 true/false 或者移除/取出的元素）；
- 超时：如果尝试的操作不可能立即执行，则该方法调用将阻塞，但不会超过给定的超时，最终返回与特殊值一样；
- 阻塞：如果尝试的操作不可能立即执行，那么该方法将阻塞。

无法将 null 插入到 BlockingQueue 中。如果尝试插入 null，则 BlockingQueue 将引发 NullPointerException。

### 插入元素

- `add(E e)`：往队列插入数据，当队列满时，插入元素时会抛出 IllegalStateException 异常；
- `offer(E e)`：当往队列插入数据时，插入成功返回 true，否则则返回 false，当队列满时不会抛出异常；
- `offer(E e, long timeout, TimeUnit unit)`：若阻塞队列已经满时，同样会阻塞插入数据的线程，直至阻塞队列已经有空余的地方，与 put 方法不同的是，该方法会有一个超时时间，若超过当前给定的超时时间，插入数据的线程会退出；
- `put(E e)`：当阻塞队列容量已经满时，往阻塞队列插入数据的线程会被阻塞，直至阻塞队列已经有空余的容量可供使用。

### 删除元素

- `remove(E e)`：从队列中删除数据，成功则返回 true，否则为 false；
- `poll()`：删除数据，当队列为空时，返回 null；
- `poll(long timeout, TimeUnit unit)`：当阻塞队列为空时，获取数据的线程会被阻塞，如果被阻塞的线程超过了给定的时长，该线程会退出；
  `take()`：当阻塞队列为空时，获取队头数据的线程会被阻塞。

### 查看元素

- `element()`：获取队头元素，如果队列为空时则抛出 NoSuchElementException 异常；
- `peek()`：获取队头元素，当队列为空时，返回 null；

## 常用的 BlockingQueue

### ArrayBlockingQueue

ArrayBlockingQueue 是由数组实现的有界阻塞队列。队列元素 FIFO（先进先出），因此，队头元素是存在时间最长的元素，而队尾数据则是最新的元素。

ArrayBlockingQueue 一旦创建，容量不能改变。当队列容量满时，尝试将元素放入队列将导致操作阻塞；尝试从一个空队列中取一个元素也会同样阻塞。

ArrayBlockingQueue 默认情况下**不能保证线程访问队列的公平性**，所谓公平性是指严格按照线程等待的绝对时间顺序访问，即最先等待的线程能够最先访问到队列。ArrayBlockingQueue 不能保证公平性则是指访问队列的顺序不是遵守严格的时间顺序，所以有可能存在长时间阻塞的线程依然无法访问到队列。如果保证公平性，通常会降低吞吐量。如果需要获得公平性的 ArrayBlockingQueue，可采用如下代码：

```java
private static ArrayBlockingQueue<Integer> blockingQueue = new ArrayBlockingQueue<Integer>(10, true);
```

### LinkedBlockingQueue

LinkedBlockingQueue 是用链表实现的有界阻塞队列，同样满足 FIFO 的特性，与 ArrayBlockingQueue 相比起来具有更高的吞吐量，为了防止 LinkedBlockingQueue 容量迅速增，损耗大量内存。通常在创建 LinkedBlockingQueue 对象时，会指定其大小，如果未指定，容量等于 Integer.MAX_VALUE。

### PriorityBlockingQueue

PriorityBlockingQueue 是一个支持优先级的无界阻塞队列。默认情况下元素采用自然顺序进行排序，也可以通过自定义类实现 `compareTo()` 方法来指定元素排序规则，或者初始化时通过构造器参数 Comparator 来指定排序规则。

### SynchronousQueue

SynchronousQueue 队列容量为 0，每个插入操作必须等待另一个线程进行相应的删除操作，因此，SynchronousQueue 实际上没有存储任何数据元素，因为只有线程在删除数据时，其他线程才能插入数据，同样的，如果当前有线程在插入数据时，线程才能删除数据。SynchronousQueue 也可以通过构造器参数来为其指定公平性，线程池中的 CachedThreadPool 就是使用 SynchronousQueue。
