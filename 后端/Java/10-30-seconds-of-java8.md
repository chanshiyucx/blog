# 30 seconds of java8

## Array

### chunk

将数组分割成特定大小的小数组：

```java
public static int[][] chunk(int[] numbers, int size) {
    return IntStream.iterate(0, i -> i + size)
            .limit((long) Math.ceil((double) numbers.length / size))
            .mapToObj(cur -> Arrays.copyOfRange(numbers, cur, Math.min(cur + size, numbers.length)))
            .toArray(int[][]::new);
}
```

### concat

两个数组合并：

```java
public static <T> T[] concat(T[] first, T[] second) {
    return Stream.concat(Stream.of(first), Stream.of(second))
            .toArray(i -> (T[]) Arrays.copyOf(new Object[0], i, first.getClass()));
}
```

### countOccurrences

计算数组中某个值出现的次数：

```java
public static long countOccurrences(int[] numbers, int value) {
    return Arrays.stream(numbers)
            .filter(e -> e == value)
            .count();
}
```

### deepFlatten

数组扁平化：

```java
public static int[] deepFlatten(Object[] elements) {
    return Arrays.stream(elements)
            .flatMapToInt(e -> {
              if (e instanceof Object[]) {
                  return Arrays.stream(deepFlatten(((Object[]) e)));
              }
              return IntStream.of((Integer) e);
            }).toArray();
}
```

### difference

求两个数组中的差集，同时也可以演变成求两个数组的交集：

```java
public static int[] difference(int[] first, int[] second) {
    Set<Integer> set = Arrays.stream(second).boxed().collect(Collectors.toSet());
    return Arrays.stream(first)
            .filter(e -> !set.contains(e))
            .toArray();
}
```

### distinctValuesOfArray

求两个数组的并集并去重，见 [union](###union) ：

```java
public static int[] distinctValuesOfArray(int[] first, int[] second) {
    return IntStream.concat(IntStream.of(first), IntStream.of(second))
            .distinct()
            .toArray();
}
```

### everyNth

返回数组中的每个第 n 个元素：

```java
public static int[] everyNth(int[] elements, int nth) {
    return IntStream.range(0, elements.length)
            .filter(i -> i % nth == nth - 1)
            .map(i -> elements[i])
            .toArray();
}
```

### indexOf

查找数组中元素的索引，在不存在元素的情况下返回-1：

```java
public static int indexOf(int[] elements, int value) {
    return IntStream.range(0, elements.length)
            .filter(i -> elements[i] == value)
            .findFirst()
            .orElse(-1);
}
```

### lastIndexOf

查找数组中元素的最后索引，在不存在元素的情况下返回-1：

```java
public static int lastIndexOf(int[] elements, int value) {
    return IntStream.iterate(elements.length - 1, i -> i - 1)
            .limit(elements.length)
            .filter(i -> elements[i] == value)
            .findFirst()
            .orElse(-1);
}
```

### filterNonUnique

筛选出数组中的非唯一值：

```java
public static int[] filterNonUnique(int[] elements) {
    return Arrays.stream(elements)
            .filter(e -> indexOf(elements, e) == lastIndexOf(elements, e))
            .toArray();
}
```

### initializeArrayWithRange

初始化一个数组，该数组包含在指定范围内的数字，传入 start 和 end：

```java
public static int[] initializeArrayWithRange(int start, int end) {
    return IntStream.rangeClosed(start, end).toArray();
}
```

### initializeArrayWithValues

使用指定的值初始化并填充数组：

```java
public static int[] initializeArrayWithValues(int n, int value) {
    return IntStream.generate(() -> value).limit(n).toArray();
}
```

### intersection

返回两个数组的交集，[difference](###difference) 微调，和 [similarity](###similarity) 作用大同小异：

```java
public static int[] intersection(int[] first, int[] second) {
    Set<Integer> set = Arrays.stream(second).boxed().collect(Collectors.toSet());
    return Arrays.stream(first)
            .filter(set::contains)
            .toArray();
}
```

### nthElement

返回数组的第 n 个元素：

```java
public static <T> T nthElement(T[] arr, int n) {
    if (n > 0) {
        return Arrays.copyOfRange(arr, n, arr.length)[0];
    }
    return Arrays.copyOfRange(arr, arr.length + n, arr.length)[0];
}
```

### pick

从对象中选择与给定键对应的键值对：

```java
public static <T, R> Map<T, R> pick(Map<T, R> obj, T[] arr) {
    return Arrays.stream(arr)
            .filter(obj::containsKey)
            .collect(Collectors.toMap(k -> k, obj::get));
}
```

### sample

从数组中返回一个随机元素：

```java
public static <T> T sample(T[] arr) {
    return arr[(int) Math.floor(Math.random() * arr.length)];
}
```

### shuffle

数组乱序，使用洗牌算法：

```java
public static <T> T[] shuffle(T[] input) {
    T[] arr = Arrays.copyOf(input, input.length);
    int length = arr.length;
    int m = length;
    while (m > 0) {
        int i = (int) Math.floor(Math.random() * m--);
        T tmp = arr[i];
        arr[i] = arr[m];
        arr[m] = tmp;
    }
    return arr;
}
```

### sampleSize

从数组中获取 n 个随机元素，思路是先乱序再抽取 n 个元素：

```java
public static <T> T[] sampleSize(T[] input, int n) {
    T[] arr = shuffle(input);
    return Arrays.copyOfRange(arr, 0, n > arr.length ? arr.length : n);
}
```

### similarity

返回出现在两个数组中的元素数组，见 [intersection](###intersection)：

```java
public static <T> T[] similarity(T[] first, T[] second) {
    return Arrays.stream(first)
            .filter(a -> Arrays.stream(second).anyMatch(b -> Objects.equals(a, b)))
            .toArray(i -> (T[]) Arrays.copyOf(new Object[0], i, first.getClass()));
}
```

### symmetricDifference

返回两个数组之间的差集：

```java
public static <T> T[] symmetricDifference(T[] first, T[] second) {
    Set<T> sA = new HashSet<>(Arrays.asList(first));
    Set<T> sB = new HashSet<>(Arrays.asList(second));

    return Stream.concat(
            Arrays.stream(first).filter(a -> !sB.contains(a)),
            Arrays.stream(second).filter(b -> !sA.contains(b))
    ).toArray(i -> (T[]) Arrays.copyOf(new Object[0], i, first.getClass()));
}
```

### union

返回两个数组的并集，见 [distinctValuesOfArray](###distinctValuesOfArray) ：

```java
public static <T> T[] union(T[] first, T[] second) {
    Set<T> set = new HashSet<>(Arrays.asList(first));
    set.addAll(Arrays.asList(second));
    return set.toArray((T[]) Arrays.copyOf(new Object[0], 0, first.getClass()));
}
```

### without

筛选出具有指定值之一的数组的元素：

```java
public static <T> T[] without(T[] arr, T... elements) {
    List<T> excludeElements = Arrays.asList(elements);
    return Arrays.stream(arr)
            .filter(el -> !excludeElements.contains(el))
            .toArray(i -> (T[]) Arrays.copyOf(new Object[0], i, arr.getClass()));
}
```

## Maths

### average

求数组平均值：

```java
public static double average(int[] arr) {
    return IntStream.of(arr)
            .average()
            .orElseThrow(() -> new IllegalArgumentException("Array is empty"));
}
```

### isEven

检查数字是否是偶数。这个方法使用按位运算符，`0b1` 是 1 的二进制表示。数字为偶数时，`＆` 运算符将返回 0。例如，`IsEven(4)` 会转换成 `100 & 001`，结果将是 000。

```java
public static boolean isEven(final int value) {
    return (value & 0b1) == 0;
}
```

### generateRandomInt

生成一个介于 `Integer.MIN_VALUE` 和 `Integer.MAX_VALUE` 之间的随机数：

```java
public static int generateRandomInt() {
    return ThreadLocalRandom.current().nextInt();
}
```

## String

### anagrams

一个字符串的所有可能排列组合：

```java
public static List<String> anagrams(String input) {
    if (input.length() <= 2) {
        return input.length() == 2
                ? Arrays.asList(input, input.substring(1) + input.substring(0, 1))
                : Collections.singletonList(input);
    }
    return IntStream.range(0, input.length())
            .mapToObj(i -> new AbstractMap.SimpleEntry<>(i, input.substring(i, i + 1)))
            .flatMap(entry ->
                    anagrams(input.substring(0, entry.getKey()) + input.substring(entry.getKey() + 1))
                            .stream()
                            .map(s -> entry.getValue() + s))
            .collect(Collectors.toList());
}
```

### isNumeric

检查字符串是否为数字：

```java
public static boolean isNumeric(final String input) {
    return IntStream.range(0, input.length())
            .allMatch(i -> Character.isDigit(input.charAt(i)));
}
```

### reverseString

反转字符串：

```java
public static String reverseString(String input) {
    return new StringBuilder(input).reverse().toString();
}
```

### splitLines

将多行字符串拆分为行数组：

```java
public static String[] splitLines(String input) {
    return input.split("\\r?\\n");
}
```

### stringToIntegers

将由空格分隔的数字字符串转换为 int 数组：

```java
public static int[] stringToIntegers(String numbers) {
    return Arrays.stream(numbers.split(" ")).mapToInt(Integer::parseInt).toArray();
}
```

## Enum

### getEnumMap

将枚举转换为 Map，其中 key 是枚举名，value 是枚举本身：

```java
public static <E extends Enum<E>> Map<String, E> getEnumMap(final Class<E> enumClass) {
    return Arrays.stream(enumClass.getEnumConstants())
            .collect(Collectors.toMap(Enum::name, Function.identity()));
}
```

## IO

### readFileAsString

将文件内容读入字符串：

```java
public String readFileAsString(Path path) throws IOException {
    return new String(Files.readAllBytes(path));
}
```

### getCurrentWorkingDirectoryPath

获取当前工作目录：

```java
public static String getCurrentWorkingDirectoryPath() {
    return FileSystems.getDefault().getPath("").toAbsolutePath().toString();
}
```

### stackTraceAsString

将异常堆栈跟踪转换为字符串：

```java
public static String stackTraceAsString(final Throwable throwable) {
    final StringWriter sw = new StringWriter();
    throwable.printStackTrace(new PrintWriter(sw));
    return sw.toString();
}
```

参考文章：  
[30 seconds of java8](https://github.com/biezhi/30-seconds-of-java8)
