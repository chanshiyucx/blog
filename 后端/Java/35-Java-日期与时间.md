# Java 日期与时间

## 本地化

在计算机中，通常使用 `Locale` 表示一个国家或地区的日期、时间、数字、货币等格式。`Locale` 由 `语言_国家` 的字母缩写构成，例如，`zh_CN` 表示中文+中国，`en_US` 表示英文+美国。语言使用小写，国家使用大写。

对于日期来说，不同的 `Locale` 会有不同的表示方式，例如，中国和美国的表示方式如下：

```
zh_CN：2016-11-30
en_US：11/30/2016
```

计算机用 `Locale` 在日期、时间、货币和字符串之间进行转换。

## Epoch Time

`Epoch Time` 即我们常说的时间戳，是计算从 1970 年 1 月 1 日零点（格林威治时区／GMT+00:00）到现在所经历的秒数。在不同的编程语言中，会有几种存储方式：

- 以秒为单位的整数：1574208900，缺点是精度只能到秒；
- 以毫秒为单位的整数：1574208900123，最后 3 位表示毫秒数；
- 以秒为单位的浮点数：1574208900.123，小数点后面表示零点几秒。

在 Java 程序中，时间戳通常是用 long 表示的毫秒数：

```java
long t = 1574208900123L;
```

要获取当前时间戳，可以使用 `System.currentTimeMillis()`，这是 Java 程序获取时间戳最常用的方法

## 标准库 API

Java 标准库有两套处理日期和时间的 API：

- 一套定义在 `java.util` 这个包里面，主要包括 `Date`、`Calendar` 和 `TimeZone` 这几个类；
- 一套新的 API 是在 Java 8 引入的，定义在 `java.time` 这个包里面，主要包括 `LocalDateTime`、`ZonedDateTime`、`ZoneId` 等。

为什么会有新旧两套 API 呢？因为历史遗留原因，旧的 API 存在很多问题，所以引入了新的 API。因为很多遗留代码仍然使用旧的 API，所以目前仍然需要对旧的 API 有一定了解，很多时候还需要在新旧两种对象之间进行转换。

## Date

`java.util.Date` 是用于表示一个日期和时间的对象，注意与 `java.sql.Date` 区分，后者用在数据库中。如果观察 Date 的源码，可以发现它实际上存储了一个 long 类型的以毫秒表示的时间戳：

```java
public class Date implements Serializable, Cloneable, Comparable<Date> {

    private transient long fastTime;

}
```

`Date` 的基本用法：

```java
public class MainTest {

    public static void main(String[] args) {
        // 获取当前时间:
        Date date = new Date();
        System.out.println(date.getYear() + 1900); // 必须加上1900
        System.out.println(date.getMonth() + 1); // 0~11，必须加上1
        System.out.println(date.getDate()); // 1~31，不能加1
        // 转换为String:
        System.out.println(date.toString());
        // 转换为GMT时区:
        System.out.println(date.toGMTString());
        // 转换为本地时区:
        System.out.println(date.toLocaleString());
    }

}
```

执行输入：

```
2019
12
26
Thu Dec 26 09:36:41 ICT 2019
26 Dec 2019 02:36:41 GMT
2019-12-26 9:36:41
```

注意 `getYear()` 返回的年份必须加上 `1900`，`getMonth()` 返回的月份是 `0~11` 分别表示 1~12 月，所以要加 1，而 `getDate()` 返回的日期范围是 `1~31`，又不能加 1。

打印本地时区表示的日期和时间时，不同的计算机可能会有不同的结果。如果我们想要针对用户的偏好精确地控制日期和时间的格式，就可以使用 `SimpleDateFormat` 对一个 Date 进行转换。它用预定义的字符串表示格式化：

- yyyy：年
- MM：月
- dd：日
- HH：小时（0-23）
- mm：分钟
- ss：秒
- kk：小时（1-24）

更多格式参考 [JDK 文档](https://docs.oracle.com/en/java/javase/12/docs/api/java.base/java/text/SimpleDateFormat.html)。

自定义格式输出：

```java
SimpleDateFormat sdf1 = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
SimpleDateFormat sdf2 =  new SimpleDateFormat("E MMM dd, yyyy");
System.out.println(sdf1.format(date)); // 2019-12-26 10:38:31
System.out.println(sdf2.format(date)); // 星期四 十二月 26, 2019
```

`Date` 对象有几个严重的问题：它不能转换时区，除了 `toGMTString()` 可以按 `GMT+0:00` 输出外，`Date` 总是以当前计算机系统的默认时区为基础进行输出。此外，我们也很难对日期和时间进行加减，计算两个日期相差多少天，计算某个月第一个星期一的日期等。
