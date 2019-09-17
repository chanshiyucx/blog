# Java Stream

## Stream 总览

Stream 是 Java 8 新增加的类，用来补充集合类。

Stream 代表数据流，流中的数据元素的数量可能是有限的，也可能是无限的。

Stream 和其它集合类的区别在于：其它集合类主要关注与有限数量的数据的访问和有效管理（增删改），而 Stream 并没有提供访问和管理元素的方式，而是通过声明数据源的方式，利用可计算的操作在数据源上执行。

Stream 不是集合元素，它不是数据结构并不保存数据，它是有关算法和计算的，它更像一个高级版本的 Iterator。而和迭代器又不同的是，Stream 可以并行化操作，迭代器只能命令式地、串行化操作。顾名思义，当使用串行方式去遍历时，每个 item 读完后再读下一个 item。而使用并行去遍历时，数据会被分成多个段，其中每一个都在不同的线程中处理，然后将结果一起输出。

流和其它集合具体的区别：

- **不存储数据**：流是基于数据源的对象，它本身不存储数据元素，而是通过管道将数据源的元素传递给操作。
- **函数式编程**：流的操作不会修改数据源，例如 `filter` 不会将数据源中的数据删除。
- **延迟操作**：流的很多操作如 `filter，map` 等中间操作是延迟执行的，只有到终点操作才会将操作顺序执行。
- **可以解绑**：对于无限数量的流，有些操作是可以在有限的时间完成的，比如 `limit(n)` 或 `findFirst()`，这些操作可是实现"短路"，访问到有限的元素后就可以返回。
- **纯消费**：流的元素只能访问一次，类似 Iterator，操作没有回头路，如果你想从头重新访问流的元素，对不起，你得重新生成一个新的流。

流的操作是以管道的方式串起来的。流管道包含一个数据源，接着包含零到 N 个中间操作，最后以一个终点操作结束。

### 并行 Parallelism

所有的流操作都可以串行执行或者并行执行。除非显示地创建并行流，否则 Java 库中创建的都是串行流。`Collection.stream()` 为集合创建串行流而 `Collection.parallelStream()` 为集合创建并行流。`IntStream.range(int, int)` 创建的是串行流。通过 `parallel()` 方法可以将串行流转换成并行流，`sequential()` 方法将流转换成串行流。

除非方法指明了方法在并行执行的时候结果是不确定 **（比如 findAny、forEach）**，否则串行和并行执行的结果应该是一样的。

### 无状态 Stateless behaviors

大部分流的操作的参数都是函数式接口，可以使用 Lambda 表达式实现。它们用来描述用户的行为，称之为行为参数（behavioral parameters）。

如果这些行为参数有状态，则流的操作的结果可能是不确定的，如下的代码在**并行执行**时多次的执行结果可能是不同的。这是因为这个 lambda 表达式是有状态的：

```java
List<String> l = new ArrayList(Arrays.asList("one", "two", ……));
class State {
    boolean s;
}
final State state = new State();
Stream<String> sl = l.stream().map(e -> {
    if (state.s)
        return "OK";
    else {
        state.s = true;
        return e;
    }
});
sl.forEach(System.out::println);
```

### 副作用 Side-effects

有副作用的行为参数是被不鼓励使用的。副作用指的是行为参数在执行的时候有输入输入，比如网络输入输出等。这是因为 Java 不保证这些副作用对其它线程可见，也不保证相同流管道上的同样的元素的不同的操作运行在同一个线程中。很多有副作用的行为参数可以被转换成无副作用的实现。

```java
// 副作用代码
ArrayList<String> results = new ArrayList<>();
stream.filter(s -> pattern.matcher(s).matches())
      .forEach(s -> results.add(s));

// 无副作用
List<String>results = stream.filter(s -> pattern.matcher(s).matches())
          .collect(Collectors.toList());
```

## 创建 Stream

常用的创建流的几种方式：

1. 使用流的静态方法，如 `Stream.of(Object[])`
2. 通过 `Arrays.stream(Object[])` 方法
3. 通过集合的 `stream()` 方法或者 `parallelStream()`

```java
// 1. Individual values
Stream stream = Stream.of("a", "b", "c");

// 2. Arrays
String [] strArray = new String[] {"a", "b", "c"};
stream = Stream.of(strArray);
stream = Arrays.stream(strArray);

// 3. Collections
List<String> list = Arrays.asList(strArray);
stream = list.stream();
```

## 中间操作 intermediate operations

中间操作会返回一个新的流，并且操作是延迟执行的（lazy），它不会修改原始的数据源，而且是由在终点操作开始的时候才真正开始执行。

### distinct

`distinct` 保证输出的流中包含唯一的元素，它是通过 `Object.equals(Object)` 来检查是否包含相同的元素。

```java
List<String> l = Stream.of("a","b","c","b")
              .distinct()
              .collect(Collectors.toList());
System.out.println(l); //[a, b, c]
```

### filter

`filter` 返回的流中只包含满足断言（predicate）的数据。

```java
List<Integer> l = IntStream.range(1,10)
              .filter( i -> i % 2 == 0)
              .boxed()
              .collect(Collectors.toList());
System.out.println(l); // [2, 4, 6, 8]
```

### map

`map` 方法将流中的元素映射成另外的值，新的值类型可以和原来的元素的类型不同。

```java
 List<Integer> l = Stream.of('a','b','c')
                .map(Object::hashCode)
                .collect(Collectors.toList());
System.out.println(l); // [97, 98, 99]
```

### flatmap

`flatmap` 方法混合了 `map + flattern` 的功能，**它将映射后的流的元素全部放入到一个新的流中**。

```java
String poetry = "Where, before me, are the ages that have gone?\n" +
        "And where, behind me, are the coming generations?\n" +
        "I think of heaven and earth, without limit, without end,\n" +
        "And I am all alone and my tears fall down.";
Stream<String> lines = Arrays.stream(poetry.split("\n"));
Stream<String> words = lines.flatMap(line -> Arrays.stream(line.split(" ")));
List<String> l = words.map( w -> {
    if (w.endsWith(",") || w.endsWith(".") || w.endsWith("?"))
        return w.substring(0,w.length() -1).trim().toLowerCase();
    else
        return w.trim().toLowerCase();
}).distinct().sorted().collect(Collectors.toList());
System.out.println(l);
// [ages, all, alone, am, and, are, before, behind, coming, down, earth, end, fall, generations, gone, have, heaven, i, limit, me, my, of, tears, that, the, think, where, without]
```

### limit

`limit` 方法指定数量的元素的流。

```java
List<Integer> l = IntStream.range(1,100).limit(5)
                .boxed()
                .collect(Collectors.toList());
System.out.println(l); // [1, 2, 3, 4, 5]
```

### skip

`skip` 返回丢弃了前 n 个元素的流，如果流中的元素小于或者等于 n，则返回空的流。

```java
List<Integer> l = IntStream.range(1,100).skip(95)
                .boxed()
                .collect(Collectors.toList());
        System.out.println(l); // [96, 97, 98, 99]
```

### peek

`peek` 对每个元素执行操作并返回一个新的 Stream。

```java
String[] arr = new String[]{"a","b","c","d"};
Arrays.stream(arr)
        .peek(System.out::println) // a,b,c,d
        .count();
```

### sorted

`sorted` 将流中的元素按照自然排序方式进行排序，如果元素没有实现 `Comparable`，则终点操作执行时会抛出异常。`sorted(Comparator<? super T> comparator)` 可以指定排序的方式。对于有序流，排序是稳定的。对于非有序流，不保证排序稳定。

```java
String[] arr = new String[]{"b_123","c+342","b#632","d_123"};
List<String> l  = Arrays.stream(arr)
        .sorted((s1,s2) -> {
            if (s1.charAt(0) == s2.charAt(0))
                return s1.substring(2).compareTo(s2.substring(2));
            else
                return s1.charAt(0) - s2.charAt(0);
        })
        .collect(Collectors.toList());
System.out.println(l); // [b_123, b#632, c+342, d_123]
```

参考文章：  
![Java Stream 详解](https://colobu.com/2016/03/02/Java-Stream/#%E4%BB%8B%E7%BB%8D)
![Java 8之基本类型优化](https://irusist.github.io/2016/01/02/Java-8%E4%B9%8B%E5%9F%BA%E6%9C%AC%E7%B1%BB%E5%9E%8B%E4%BC%98%E5%8C%96/)
