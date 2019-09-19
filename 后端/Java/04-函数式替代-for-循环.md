# 函数式替代 for 循环

## 举个栗子

以一个简单的循环打印为例：

```java
for(int i = 1; i < 4; i++) {
    System.out.print(i + "...");
}

IntStream.range(1, 4)
        .forEach(i -> System.out.print(i + "..."));
```

虽然使用 `range` 没有显著减少代码量，但降低了它的复杂性，这么做的两个重要原因：

- 不同于 `for`，`range` 不会强迫我们初始化某个可变变量。
- 迭代会自动执行，所以我们不需要像循环索引一样定义增量。

## 可变变量与参数

`for` 循环中定义的变量 i 是单个变量，它会在每次对循环执行迭代时发生改变。`range` 示例中的变量 i 是拉姆达表达式的参数，所以它在每次迭代中都是一个全新的变量。

如果想在循环中的一个内部类中使用索引变量，若使用传统 `for` 循环，每次新的迭代都需要创建一个局部临时变量 `temp`，它是索引变量的一个副本：

```java
ExecutorService executorService = Executors.newFixedThreadPool(10);

// 传统 for 循环
for(int i = 0; i < 5; i++) {
    int temp = i;
    executorService.submit(() -> System.out.println("Running task " + temp));
}

// IntStream range
IntStream.range(0, 5)
        .forEach(i -> executorService.submit(() -> System.out.println("Running task " + i)));

executorService.shutdown();
```

对于相对简单的迭代，使用 `range` 代替 `for` 具有一定优势，但 `for` 的特殊价值体现在于它能处理更复杂的迭代场景。

## 封闭范围

IntStream rangeClosed 可以创建一个封闭范围：

```java
for(int i = 0; i <= 5; i++) {}

IntStream.rangeClosed(0, 5)
```

## 跳过值

对于基本循环，`range` 和 `rangeClosed` 方法是 for 的更简单、更优雅的替代方法。对于需要跳过值，两者比较：

```java
for(int i = 1; i <= 100; i = i + 3) {}

IntStream.iterate(1, e -> e + 3)
        .limit(34)
        .sum()
```

IntStream iterate 方法需要两个参数；第一个是开始迭代的初始值，第二参数传入的拉姆达表达式决定了迭代中的下一个值。**但是它有个弊端：iterate 没有参数来限制方法何时停止迭代**。解决这个问题需要提前计算迭代次数，这里使用 `limit` 方法，这种方式容易出问题。

Java 9 中引入的 `takeWhile` 新方法使得执行有限制的迭代变得更容易，可以直接表明只要满足想要的条件，迭代就应该继续执行：

```java
IntStream.iterate(1, e -> e + 3)
        .takeWhile(i -> i <= 100)
        .sum()
```

与 `takeWhile` 方法相反的是 `dropWhile`，它跳过满足给定条件前的值。`takeWhile` 方法类似于 `break`，而 `dropWhile` 则类似于 `continue`。

参考文章：  
[传统 for 循环的函数式替代方案](https://www.ibm.com/developerworks/cn/java/j-java8idioms3/index.html)
