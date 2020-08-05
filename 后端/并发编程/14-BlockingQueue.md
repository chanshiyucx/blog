# BlockingQueue

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

## 插入元素

- `add(E e)`：往队列插入数据，当队列满时，插入元素时会抛出 IllegalStateException 异常；
- `offer(E e)`：当往队列插入数据时，插入成功返回 true，否则则返回 false，当队列满时不会抛出异常；
- `offer(E e, long timeout, TimeUnit unit)`：若阻塞队列已经满时，同样会阻塞插入数据的线程，直至阻塞队列已经有空余的地方，与 put 方法不同的是，该方法会有一个超时时间，若超过当前给定的超时时间，插入数据的线程会退出；
- `put(E e)`：当阻塞队列容量已经满时，往阻塞队列插入数据的线程会被阻塞，直至阻塞队列已经有空余的容量可供使用。

## 删除元素

- `remove(E e)`：从队列中删除数据，成功则返回 true，否则为 false；
- `poll()`：删除数据，当队列为空时，返回 null；
- `poll(long timeout, TimeUnit unit)`：当阻塞队列为空时，获取数据的线程会被阻塞，如果被阻塞的线程超过了给定的时长，该线程会退出；
  `take()`：当阻塞队列为空时，获取队头数据的线程会被阻塞。

## 查看元素

- `element()`：获取队头元素，如果队列为空时则抛出 NoSuchElementException 异常；
- `peek()`：获取队头元素，如果队列为空则抛出 NoSuchElementException 异常。
