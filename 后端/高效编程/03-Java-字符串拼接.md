# Java 字符串拼接

> 本文为个人学习摘要笔记。  
> 原文地址：[羞，Java 字符串拼接竟然有这么多姿势](http://www.justdojava.com/2019/10/10/java-string-join/)

Java 字符串拼接常用有 6 种方式：

1. “+”号操作符
2. StringBuilder
3. StringBuffer
4. String 类的 concat 方法
5. String 类的 join 方法
6. StringUtils.join

## “+”号操作符

举个栗子：

```java
String chenmo = "沉默";
String wanger = "王二";

System.out.println(chenmo + wanger);
```

将这段代码使用反编译一下：

```java
String chenmo = "\u6C89\u9ED8"; // 沉默
String wanger = "\u738B\u4E8C"; // 王二
System.out.println((new StringBuilder(String.valueOf(chenmo))).append(wanger).toString());
```

编译的时候把“+”号操作符替换成了 `StringBuilder` 的 `append` 方法。也就是说，“+”号操作符在拼接字符串的时候只是一种形式主义，让开发者使用起来比较简便，代码看起来比较简洁，读起来比较顺畅。算是 Java 的一种语法糖。

## StringBuilder

先来看一下 `StringBuilder` 类的 `append` 方法的源码：

```java
public StringBuilder append(String str) {
    super.append(str);
    return this;
}
```

父类 `AbstractStringBuilder` 的 `append` 方法：

```java
public AbstractStringBuilder append(String str) {
    if (str == null)
        // 1.判断拼接的字符串是不是 null
        return appendNull();
    int len = str.length();
    // 2.判断是否需要扩容
    ensureCapacityInternal(count + len);
    // 3.将拼接的字符串复制到目标数组
    str.getChars(0, len, value, count);
    count += len;
    return this;
}
```

`append` 方法里有三步个操作：

1. 判断拼接的字符串是不是 null，如果是，当做字符串“null”来处理。`appendNull` 方法实现。
2. 拼接后的字符数组长度是否超过当前值，如果超过，进行扩容并复制。`ensureCapacityInternal` 方法实现。
3. 将拼接的字符串 str 复制到目标数组 value 中。

`appendNull` 方法的源码如下：

```java
private AbstractStringBuilder appendNull() {
    int c = count;
    ensureCapacityInternal(c + 4);
    final char[] value = this.value;
    value[c++] = 'n';
    value[c++] = 'u';
    value[c++] = 'l';
    value[c++] = 'l';
    count = c;
    return this;
}
```

`ensureCapacityInternal` 方法的源码如下：

```java
private void ensureCapacityInternal(int minimumCapacity) {
    // overflow-conscious code
    if (minimumCapacity - value.length > 0) {
        value = Arrays.copyOf(value,
                newCapacity(minimumCapacity));
    }
}
```

## StringBuffer

先有 `StringBuffer` 后有 `StringBuilder`，两者就像是孪生双胞胎，该有的都有，**区别是`StringBuffer` 线程安全的**。

```java
public synchronized StringBuffer append(String str) {
    toStringCache = null;
    super.append(str);
    return this;
}
```

`StringBuffer` 类的 `append` 方法比 `StringBuilder` 多了一个关键字 `synchronized`。`synchronized` 是一种同步锁，它修饰的方法被称为同步方法，是线程安全的。

## String 类的 concat 方法

单就姿势上来看，String 类的 `concat` 方法就好像 `StringBuilder` 类的 `append`。

```java
String chenmo = "沉默";
String wanger = "王二";

System.out.println(chenmo.concat(wanger));
```

那它们之间究竟有多大的差别呢，以下举个栗子：

```java
chenmo += wanger
chenmo = chenmo.concat(wanger)
```

其中 `chenmo += wanger` 实际上相当于 `(new StringBuilder(String.valueOf(chenmo))).append(wanger).toString()`。要探究“+”号操作符和 `concat` 之间的差别，实际上要看 `append` 方法和 `concat` 方法之间的差别。

查看 `concat` 方法的源码：

```java
public String concat(String str) {
    int otherLen = str.length();
    // 1.如果拼接的字符串的长度为 0 则返回当之前字符串
    if (otherLen == 0) {
        return this;
    }
    int len = value.length;
    // 2.复制原字符串的字符数组
    char buf[] = Arrays.copyOf(value, len + otherLen);
    // 3.将拼接的字符串复制到目标数组
    str.getChars(buf, len);
    return new String(buf, true);
}
```

`concat` 方法里有三步个操作：

1. 如果拼接的字符串的长度为 0，那么返回拼接前的字符串。
2. 将原字符串的字符数组 value 复制到变量 buf 数组中。
3. 把拼接的字符串 str 复制到字符数组 buf 中，并返回新的字符串对象。

综上可得结论：

1. 如果拼接的字符串是 null，`concat` 时候就会抛出 `NullPointerException`，“+”号操作符会当做是“null”字符串来处理。
2. 如果拼接的字符串是一个空字符串（”“），那么 `concat` 的效率要更高一点。毕竟不需要 new StringBuilder 对象。
3. 如果拼接的字符串非常多，`concat` 的效率就会下降，因为创建的字符串对象越多，开销就越大。

## String 类的 join 方法

JDK 1.8 提供了一种新的字符串拼接姿势：String 类增加了一个静态方法 `join`：

```java
String chenmo = "沉默";
String wanger = "王二";
String cmower = String.join("", chenmo, wanger);
```

## StringUtils.join

`StringUtils.join` 属于 `org.apache.commons.lang3.StringUtils`，使用方式：

```java
String chenmo = "沉默";
String wanger = "王二";

StringUtils.join(chenmo, wanger);
```

该方法更善于拼接数组中的字符串，并且不用担心 `NullPointerException`：

```java
StringUtils.join(null)            = null
StringUtils.join([])              = ""
StringUtils.join([null])          = ""
StringUtils.join(["a", "b", "c"]) = "abc"
StringUtils.join([null, "", "a"]) = "a"
```

其源码内部使用的仍然是 `StringBuilder`。

## 比较

阿里巴巴 Java 开发手册》上有一段内容说：循环体内，拼接字符串最好使用 `StringBuilder` 的 `append` 方法，而不是 + 号操作符。

举个栗子，在 for 循环中拼接字符串：

```java
// 1. 使用 + 号拼接
String result = "";
for (int i = 0; i < 100000; i++) {
    result += "六六六";
}

// 2. 使用 append
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 100000; i++) {
    sb.append("六六六");
}
```

实践结果第二段代码执行时间远比第一段代码要快得多，原因是第一段的 for 循环中创建了大量的 `StringBuilder` 对象，而第二段代码至始至终只有一个 `StringBuilder` 对象。
