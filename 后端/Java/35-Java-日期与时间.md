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

## Calendar

`Calendar` 可以用于获取并设置年、月、日、时、分、秒，它和 Date 比，主要多了一个可以做简单的日期和时间运算的功能。

```java
Calendar c = Calendar.getInstance();
int y = c.get(Calendar.YEAR);
int m = c.get(Calendar.MONTH) + 1;
int d = c.get(Calendar.DAY_OF_MONTH);
int w = c.get(Calendar.DAY_OF_WEEK);
int hh = c.get(Calendar.HOUR_OF_DAY);
int mm = c.get(Calendar.MINUTE);
int ss = c.get(Calendar.SECOND);
int ms = c.get(Calendar.MILLISECOND);
System.out.println(y + "-" + m + "-" + d + " " + w + " " + hh + ":" + mm + ":" + ss + "." + ms);
// 2019-12-27 6 10:11:10.657
```

`Calendar` 获取年月日这些信息变成了 `get(int field)`，**返回的年份不必转换，返回的月份仍然要加 1**，返回的星期要特别注意，1~7 分别表示周日、周一至周六。

`Calendar` 只有一种方式获取，即 `Calendar.getInstance()`，而且一获取到就是当前时间。如果我们想给它设置成特定的一个日期和时间，就必须先清除所有字段。

```java
// 当前时间
Calendar c = Calendar.getInstance();
// 清除所有
c.clear();
// 设置年月日，注意月份8表示9月
c.set(Calendar.YEAR, 2019);
c.set(Calendar.MONTH, 8);
c.set(Calendar.DATE, 2);
// 设置时间
c.set(Calendar.HOUR_OF_DAY, 21);
c.set(Calendar.MINUTE, 22);
c.set(Calendar.SECOND, 23);
System.out.println(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(c.getTime()));
// 2019-09-02 21:22:23
```

利用 `Calendar.getTime()` 可以将一个 `Calendar` 对象转换成 `Date` 对象，然后就可以用 `SimpleDateFormat` 进行格式化了。

## TimeZone

`Calendar` 和 `Date` 相比，它提供了时区转换的功能。时区用 `TimeZone` 对象表示：

```java
TimeZone tzDefault = TimeZone.getDefault(); // 当前时区
TimeZone tzGMT9 = TimeZone.getTimeZone("GMT+09:00"); // GMT+9:00时区
TimeZone tzNY = TimeZone.getTimeZone("America/New_York"); // 纽约时区
System.out.println(tzDefault.getID()); // Asia/Shanghai
System.out.println(tzGMT9.getID()); // GMT+09:00
System.out.println(tzNY.getID()); // America/New_York
```

时区的唯一标识是以字符串表示的 ID，我们获取指定 `TimeZone` 对象也是以这个 ID 为参数获取，`GMT+09:00`、`Asia/Shanghai` 都是有效的时区 ID。使用 `TimeZone.getAvailableIDs()` 可以列出系统支持的所有 ID。

利用时区就可以对指定时间进行转换。利用 Calendar 进行时区转换的步骤是：

1. 清除所有字段；
2. 设定指定时区；
3. 设定日期和时间；
4. 创建 `SimpleDateFormat`并设定目标时区；
5. 格式化获取的 `Date` 对象。

**注意 `Date` 对象无时区信息，时区信息存储在 `SimpleDateFormat` 中**，本质上时区转换只能通过 `SimpleDateFormat` 在显示的时候完成。

下面的例子演示了如何将北京时间 `2019-11-20 8:15:00` 转换为纽约时间：

```java
// 当前时间
Calendar c = Calendar.getInstance();
// 清除所有
c.clear();
// 设置为北京时区
c.setTimeZone(TimeZone.getTimeZone("Asia/Shanghai"));
// 设置年月日时分秒
c.set(2019, 10, 20, 8, 15, 0);
// 显示时间
SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
sdf.setTimeZone(TimeZone.getTimeZone("America/New_York"));
System.out.println(sdf.format(c.getTime()));
// 2019-11-19 19:15:0
```

`Calendar` 也可以对日期和时间进行简单的加减：

```java
// 当前时间
Calendar c = Calendar.getInstance();
// 清除所有
c.clear();
// 设置年月日时分秒
c.set(2019, 10, 20, 8, 15, 0);
// 加5天并减去2小时
c.add(Calendar.DAY_OF_MONTH, 5);
c.add(Calendar.HOUR_OF_DAY, -2);
// 显示时间
SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
Date d = c.getTime();
System.out.println(sdf.format(d));
// 2019-11-25 6:15:00
```
