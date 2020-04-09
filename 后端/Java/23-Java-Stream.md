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

流的操作类型分为两种：

- `Intermediate`：一个流可以后面跟随零个或多个 `intermediate` 操作。其目的主要是打开流，做出某种程度的数据映射/过滤，然后返回一个新的流，交给下一个操作使用。这类操作都是惰性化的（lazy），就是说，仅仅调用到这类方法，并没有真正开始流的遍历。
- `Terminal`：一个流只能有一个 `terminal` 操作，当这个操作执行后，流就被使用“光”了，无法再被操作。所以这必定是流的最后一个操作。Terminal 操作的执行，才会真正开始流的遍历，并且会生成一个结果，或者一个 side effect。

还有一种操作被称为 `short-circuiting`，用以指：

- 对于一个 `intermediate` 操作，如果它接受的是一个无限大的 Stream，但返回一个有限的新 Stream。
- 对于一个 `terminal` 操作，如果它接受的是一个无限大的 Stream，但能在有限的时间计算出结果。

**简单说，对 Stream 的使用就是实现一个 `filter-map-reduce` 过程，产生一个最终结果，或者导致一个副作用（side effect）。**

### 并行 Parallelism

所有的流操作都可以串行执行或者并行执行。除非显示地创建并行流，否则 Java 库中创建的都是串行流。`Collection.stream()` 为集合创建串行流而 `Collection.parallelStream()` 为集合创建并行流。`IntStream.range(int, int)` 创建的是串行流。通过 `parallel()` 方法可以将串行流转换成并行流，`sequential()` 方法将流转换成串行流。

除非方法指明了方法在并行执行的时候结果是不确定 **（比如 findAny、forEach）**，否则串行和并行执行的结果应该是一样的。

### 无状态 Stateless behaviors

大部分流的操作的参数都是函数式接口，可以使用 Lambda 表达式实现。它们用来描述用户的行为，称之为行为参数（behavioral parameters）。

如果这些行为参数有状态，则流的操作的结果可能是不确定的，如下的代码在**并行执行**时多次的执行结果可能是不同的。这是因为这个 lambda 表达式是有状态的：

```java
List<String> l = new ArrayList(Arrays.asList("one", "two"));
class State {
    boolean s;
}
final State state = new State();
Stream<String> sl = l.stream().map(e -> {
    if (state.s) {
        return "OK";
    } else {
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

## 流构造与转换

### 流的构造

常用的构造流的几种方式：

1. 使用流的静态方法，如 `Stream.of(Object[])`
2. 通过 `Arrays.stream(Object[])` 方法
3. 通过集合的 `stream()` 方法或者 `parallelStream()` 方法

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

### 流的转换

```java
// 1. Array
String[] strArray = stream.toArray(String[]::new);

// 2. Collection
List<String> list1 = stream.collect(Collectors.toList());
List<String> list2 = stream.collect(Collectors.toCollection(ArrayList::new));
Set set = stream.collect(Collectors.toSet());
Stack stack = stream.collect(Collectors.toCollection(Stack::new));

// 3. String
String str = stream.collect(Collectors.joining()).toString();
```

需要注意：**一个 Stream 只可以使用一次，上面的代码为了简洁而重复使用了数次**。

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

`flatmap` 方法混合了 `map + flattern` 的功能，**它将映射后的流的元素全部放入到一个新的流中**。flatMap 把 Stream 中的层级结构扁平化。

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

## 终点操作 terminal operations

### Match

一组方法用来检查流中的元素是否满足断言：

- `allMatch` 只有在所有的元素都满足断言时才返回 true，否则 flase，流为空时总是返回 true
- `anyMatch` 只有在任意一个元素满足断言时就返回 true，否则 flase
- `noneMatch` 只有在所有的元素都不满足断言时才返回 true，否则 flase

```java
System.out.println(Stream.of(1,2,3,4,5).allMatch(i -> i > 0)); //true
System.out.println(Stream.of(1,2,3,4,5).anyMatch(i -> i > 0)); //true
System.out.println(Stream.of(1,2,3,4,5).noneMatch(i -> i > 0)); //false

System.out.println(Stream.<Integer>empty().allMatch(i -> i > 0)); //true
System.out.println(Stream.<Integer>empty().anyMatch(i -> i > 0)); //false
System.out.println(Stream.<Integer>empty().noneMatch(i -> i > 0)); //true
```

### count

`count` 方法返回流中的元素的数量。

```java
System.out.println(Stream.of(1,2,3,4,5).count());

// 等价于
System.out.println(Stream.of(1,2,3,4,5).mapToLong(e -> 1L).sum());
```

### find

- `findAny()` 返回任意一个元素，如果流为空，返回空的 Optional，对于并行流来说，它只需要返回任意一个元素即可，所以性能可能要好于 findFirst()，但是有可能多次执行的时候返回的结果不一样。
- `findFirst()` 返回第一个元素，如果流为空，返回空的 Optional。

```java
System.out.println(Stream.of(1,2,3,4,5).findAny());
System.out.println(Stream.of(1,2,3,4,5).findFirst());
```

这里需要注意返回值类型：`Optional`。它作为一个容器，可能含有某值，或者不包含。使用它的目的是尽可能避免 `NullPointerException`。

### forEach

`forEach` 遍历流的每一个元素，执行指定的 action。**它是一个终点操作，因此它执行后，Stream 的元素就被“消费”掉了，你无法对一个 Stream 进行两次 terminal 运算，这和 `peek` 方法不同**。这个方法不担保按照流的`encounter order` 顺序执行，如果对于有序流按照它的 `encounter order` 顺序执行，可以使用 `forEachOrdered` 方法。

```java
Stream.of(1,2,3,4,5).forEach(System.out::println); // 1,2,3,4,5
```

### max、min

`max` 返回流中的最大值，`min` 返回流中的最小值。

```java
System.out.println(IntStream.of(1, 2, 3, 4, 5).min().getAsInt()); // 1
System.out.println(IntStream.of(1, 2, 3, 4, 5).max().getAsInt()); // 5
```

### reduce

`reduce` 使用流中的第一个值作为初始值，后面两个方法则使用一个提供的初始值。

```java
System.out.println(Stream.of(1,2,3,4,5).reduce(0, Integer::sum)); // 15
System.out.println(Stream.of("A", "B", "C", "D").reduce("", String::concat)); // ABCD
```

## 基本类型

Java 8 提供了一些专门针对基本类型优化的 API，如 `IntStream, LongStream, DoubleStream`，当然也可以用 `Stream<Integer>、Stream<Long>、Stream<Double>`，但是 boxing 和 unboxing 会很耗时，所以特别为这三种基本数值型提供了对应的 Stream， 应该优先使用它们。

以 `IntStream` 为例：

```java
// 创建一个空的 IntStream
IntStream empty = IntStream.empty();

// 创建包含基本类型 1，2，3 的 IntStream
IntStream intStream = IntStream.of(1, 2, 3);

// 创建一个包含 1 到 9 的 IntStream
IntStream range = IntStream.range(1, 10);

// 创建一个包含 1 到 10 的 IntStream
IntStream rangeClosed = IntStream.rangeClosed(1, 10);

// 创建一个包含 3 的 IntStream
IntStream generated = IntStream.generate(() -> 3);

// 得到一个无限循环的 IntStream, 值为 1, 3, 5, 7 ...
IntStream infinite = IntStream.iterate(1, operand -> operand + 2);
```

### mapToObj、mapToLong

- `mapToObj` 方法主要是将 Stream 中的元素进行装箱操作，转换成一个引用类型的值
- `mapToLong` 方法是将 Stream 中的 元素转换成基本类型 long
- `mapToDouble` 方法是将 Stream 中的 元素转换成基本类型 double

```java
IntStream.of(1, 2, 3, 4, 5).mapToObj(elem -> "a" + elem).forEach(System.out::println); // a1,a2,a3,a4,a5
IntStream.of(1, 2, 3, 4, 5).mapToLong(elem -> elem * 100L).forEach(System.out::println); // 100,200,300,400,500
IntStream.of(1, 2, 3, 4, 5).mapToDouble(elem -> elem + 0.1).forEach(System.out::println); // 1.1,2.1,3.1,4.1,5.1
```

### summaryStatistics

`summaryStatistics` 方法主要是获取 Stream 中元素的统计信息。

```java
IntSummaryStatistics summary = IntStream.of(1, 2, 3, 4, 5).summaryStatistics();
System.out.println(summary.getMin()); // 1
System.out.println(summary.getMax()); // 5
System.out.println(summary.getSum()); // 15
System.out.println(summary.getCount()); // 5
System.out.println(summary.getAverage()); // 3.0
```

## 收集器

`collect` 应该说是 Stream 中最强大的终端操作了，使用其几乎能得到你想要的任意数据的聚合，下面好好分析该工具的用法。

预备类：

```java
/**
 * 性别
 */
enum Gender {
    MALE, FEMALE
}

/**
 * 年纪
 */
enum Grade {
    ONE, TWO, THREE, FOUR;
}

@Data
@AllArgsConstructor
class Student {
    private String name;
    private int age;
    private Gender gender;
    private Grade grade;
}
```

测试数据：

```java
List<Student> students = Arrays.asList(
            new Student("小明", 10, Gender.MALE, Grade.ONE),
            new Student("大明", 9, Gender.MALE, Grade.THREE),
            new Student("小白", 8, Gender.FEMALE, Grade.TWO),
            new Student("小黑", 13, Gender.FEMALE, Grade.FOUR),
            new Student("小红", 7, Gender.FEMALE, Grade.THREE),
            new Student("小黄", 13, Gender.MALE, Grade.ONE),
            new Student("小青", 13, Gender.FEMALE, Grade.THREE),
            new Student("小紫", 9, Gender.FEMALE, Grade.TWO),
            new Student("小王", 6, Gender.MALE, Grade.ONE),
            new Student("小李", 6, Gender.MALE, Grade.ONE),
            new Student("小马", 14, Gender.FEMALE, Grade.FOUR),
            new Student("小刘", 13, Gender.MALE, Grade.FOUR));
```

```java
public static void main(String[] args) {
    Set<Integer> ages = students.stream()
            .map(Student::getAge)
            .collect(Collectors.toCollection(TreeSet::new));
    System.out.println("所有学生的年龄：" + ages);

    // 统计汇总信息 {个数，总数，最小，平均值，最大值}
    IntSummaryStatistics agesSummaryStatistics = students.stream()
            .collect(Collectors.summarizingInt(Student::getAge));
    System.out.println("年龄汇总信息：" + agesSummaryStatistics);

    // 分块
    Map<Boolean, List<Student>> genders = students.stream()
            .collect(Collectors.partitioningBy(s -> s.getGender() == Gender.MALE));
    System.out.println("男学生列表：" + genders.get(true));
    System.out.println("女学生列表：" + genders.get(false));

    // 分组
    Map<Grade, List<Student>> grades = students.stream()
            .collect(Collectors.groupingBy(Student::getGrade));
    System.out.println("学生班级列表：" + grades);

    Map<Grade, Long> gradesCount = students.stream()
            .collect(Collectors.groupingBy(Student::getGrade, Collectors.counting()));
    System.out.println("每个班级学生个数列表：" + gradesCount);
}
```

```
所有学生的年龄：[6, 7, 8, 9, 10, 13, 14]

年龄汇总信息：IntSummaryStatistics{count=12, sum=121, min=6, average=10.083333, max=14}

男学生列表：[Student(name=小明, age=10, gender=MALE, grade=ONE), Student(name=大明, age=9, gender=MALE, grade=THREE), Student(name=小黄, age=13, gender=MALE, grade=ONE), Student(name=小王, age=6, gender=MALE, grade=ONE), Student(name=小李, age=6, gender=MALE, grade=ONE), Student(name=小刘, age=13, gender=MALE, grade=FOUR)]
女学生列表：[Student(name=小白, age=8, gender=FEMALE, grade=TWO), Student(name=小黑, age=13, gender=FEMALE, grade=FOUR), Student(name=小红, age=7, gender=FEMALE, grade=THREE), Student(name=小青, age=13, gender=FEMALE, grade=THREE), Student(name=小紫, age=9, gender=FEMALE, grade=TWO), Student(name=小马, age=14, gender=FEMALE, grade=FOUR)]

学生班级列表：{FOUR=[Student(name=小黑, age=13, gender=FEMALE, grade=FOUR), Student(name=小马, age=14, gender=FEMALE, grade=FOUR), Student(name=小刘, age=13, gender=MALE, grade=FOUR)], THREE=[Student(name=大明, age=9, gender=MALE, grade=THREE), Student(name=小红, age=7, gender=FEMALE, grade=THREE), Student(name=小青, age=13, gender=FEMALE, grade=THREE)], TWO=[Student(name=小白, age=8, gender=FEMALE, grade=TWO), Student(name=小紫, age=9, gender=FEMALE, grade=TWO)], ONE=[Student(name=小明, age=10, gender=MALE, grade=ONE), Student(name=小黄, age=13, gender=MALE, grade=ONE), Student(name=小王, age=6, gender=MALE, grade=ONE), Student(name=小李, age=6, gender=MALE, grade=ONE)]}

每个班级学生个数列表：{FOUR=3, THREE=3, TWO=2, ONE=4}
```

扩展 List to Map：

```java
// 将权限列表以id为key，以权限对象为值转换成map
Map<Long, UmsPermission> permissionMap = permissionList.stream()
    .collect(Collectors.toMap(permission -> permission.getId(), permission -> permission));
```

参考文章：  
[Java Stream 详解](https://colobu.com/2016/03/02/Java-Stream/#%E4%BB%8B%E7%BB%8D)  
[Java 8 之基本类型优化](https://irusist.github.io/2016/01/02/Java-8%E4%B9%8B%E5%9F%BA%E6%9C%AC%E7%B1%BB%E5%9E%8B%E4%BC%98%E5%8C%96/)
