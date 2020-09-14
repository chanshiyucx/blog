# Java BiFunction 和 BinaryOperator

> 本文为个人学习摘要笔记。  
> 原文地址：  
> [Java8 函数式接口 BiFunction 使用教程](http://www.subquery.cn/java/java8/functional-interface-bi-function/)  
> [Java8 函数式接口 BinaryOperator 使用教程](http://www.subquery.cn/java/java8/functional-interface-binary-operator/)

Java 常用函数接口：

| name           | type             | description                       |
| -------------- | ---------------- | --------------------------------- |
| Consumer       | Consumer< T >    | 接收 T 对象，不返回值             |
| Predicate      | Predicate< T >   | 接收 T 对象并返回 boolean         |
| Function       | Function< T, R > | 接收 T 对象，返回 R 对象          |
| Supplier       | Supplier< T >    | 提供 T 对象（例如工厂），不接收值 |
| UnaryOperator  | UnaryOperator    | 接收 T 对象，返回 T 对象          |
| BinaryOperator | BinaryOperator   | 接收两个 T 对象，返回 T 对象      |

## BiFunction

[BiFunction](https://docs.oracle.com/javase/8/docs/api/java/util/function/BiFunction.html) 可以接受两个参数并返回一个结果。

```java
@FunctionalInterface
public interface BiFunction<T, U, R> {
    R apply(T t, U u);
}
```

- T – 第一个参数的类型；
- U – 第二个参数的类型；
- R – 返回结果的类型。

### 基本用法

```java
// 两数相加
BiFunction<Integer, Integer, Integer> addFunc = Integer::sum;
System.out.println(addFunc.apply(1, 2)); // 3

// 两数取幂
BiFunction<Integer, Integer, Double> powFunc = Math::pow;
System.out.println(powFunc.apply(2, 3)); // 8.0

// 两数之和转 List
BiFunction<Integer, Integer, List<Integer>> listFunc = (x1, x2) -> Collections.singletonList(x1 + x2);
System.out.println(listFunc.apply(4, 6)); // [10]
```

### 串联 Function<T, R>

```java
// 两数相加
BiFunction<Integer, Integer, Integer> addFunc = Integer::sum;

// Integer to String
Function<Integer, String> int2strFunc = String::valueOf;

System.out.println(addFunc.andThen(int2strFunc).apply(1, 2)); // 3
```

封装：

```java
public static void main(String[] args) {
    String result = convert(1, 2, Integer::sum, String::valueOf);
    System.out.println(result); // 3
}

private static <A1, A2, R1, R2> R2 convert(A1 a1, A2 a2, BiFunction<A1, A2, R1> func, Function<R1, R2> func2) {
    return func.andThen(func2).apply(a1, a2);
}
```

### 工厂模式

```java
public class Java8BiFunction1 {

    public static void main(String[] args) {
        GPS gps = factory("40.741895", "-73.989308", GPS::new);
        System.out.println(gps);
    }

    public static <R extends GPS> R factory(String Latitude, String Longitude,
                                            BiFunction<String, String, R> func) {
        return func.apply(Latitude, Longitude);
    }
}

class GPS {
    private String Latitude;
    private String Longitude;

    GPS(String latitude, String longitude) {
        Latitude = latitude;
        Longitude = longitude;
    }

    @Override
    public String toString() {
        return "GPS{" +
                "Latitude='" + Latitude + '\'' +
                ", Longitude='" + Longitude + '\'' +
                '}';
    }
}
```

## BinaryOperator

在 Java8 中 BinaryOperator 继承自 BiFunction，同样也是一个函数式接口。BinaryOperator 可以接受两个类型为 T 的参数，返回一个类型为 T 的结果。

```java
@FunctionalInterface
public interface BinaryOperator<T> extends BiFunction<T, T, T> {}
```

### 替换 BiFunction

当 BiFunction 的两个参数类型与返回值类型都是同一类型的时候，我们可以使用 BinaryOperator 替换 BiFunction，比如可以用 `BinaryOperator<Integer>` 替换 `BiFunction<Integer, Integer, Integer>`。

```java
// BiFunction 和 BinaryOperator 两者等价
BiFunction<Integer, Integer, Integer> func = Integer::sum;
BinaryOperator<Integer> func2 = Integer::sum;
```

### 计算最大/最小值

BinaryOperator 提供两个方法比较大小：

- `maxBy()` 方法可以返回两个参数中较大的值，它的实现相当于三目表达式：`a > b ? a : b`；
- `minBy()` 方法可以返回两个参数中较小的值，它的实现相当于三目表达式：`a < b ? a : b`。

如果将 `maxBy()` 和 `minBy()` 用于对象的比较还需要实现一个自定义的 Comparator 接口。

```java
public class Java8BiFunction1 {

    public static void main(String[] args) {
        Developer dev1 = new Developer("jordan", BigDecimal.valueOf(9999));
        Developer dev2 = new Developer("jack", BigDecimal.valueOf(8888));
        Developer dev3 = new Developer("jaden", BigDecimal.valueOf(10000));
        Developer dev4 = new Developer("ali", BigDecimal.valueOf(2000));
        Developer dev5 = new Developer("myexample", BigDecimal.valueOf(1));
        List<Developer> list = Arrays.asList(dev1, dev2, dev3, dev4, dev5);

        // 1. 创建一个Comparator，使用码农的工资作为排序
        Comparator<Developer> comparing = Comparator.comparing(Developer::getSalary);
        // 2. 使用maxBy方法创建一个BinaryOperator用于返回两参数中较大的值
        BinaryOperator<Developer> bo = BinaryOperator.maxBy(comparing);

        Developer result = find(list, bo);
        System.out.println(result);     // Developer{name='jaden', salary=10000}

        // 合并在一起
        // 寻找工资最高的程序员
        Developer developer = find(list, BinaryOperator.maxBy(Comparator.comparing(Developer::getSalary)));
        System.out.println(developer);  // Developer{name='jaden', salary=10000}
        // 寻找工资最低的程序员
        Developer developer2 = find(list, BinaryOperator.minBy(Comparator.comparing(Developer::getSalary)));
        System.out.println(developer2); // Developer{name='myexample', salary=1}
    }

    private static Developer find(List<Developer> list, BinaryOperator<Developer> accumulator) {
        Developer result = null;
        for (Developer t : list) {
            if (result == null) {
                result = t;
            } else {
                result = accumulator.apply(result, t);
            }
        }
        return result;
    }
}

class Developer {
    private String name;
    private BigDecimal salary;

    public Developer(String name, BigDecimal salary) {
        this.name = name;
        this.salary = salary;
    }

    public BigDecimal getSalary() {
        return salary;
    }
}
```
