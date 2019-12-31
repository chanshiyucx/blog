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

## 标准库

Java 标准库有两套处理日期和时间的 API：

- 一套定义在 `java.util` 这个包里面，主要包括 `Date`、`Calendar` 和 `TimeZone` 这几个类；
- 一套新的 API 是在 Java 8 引入的，定义在 `java.time` 这个包里面，主要包括 `LocalDateTime`、`ZonedDateTime`、`ZoneId` 等。

为什么会有新旧两套 API 呢？因为历史遗留原因，旧的 API 存在很多问题，所以引入了新的 API。因为很多遗留代码仍然使用旧的 API，所以目前仍然需要对旧的 API 有一定了解，很多时候还需要在新旧两种对象之间进行转换。

## Date 和 Calendar

### Date

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

### Calendar

`Calendar` 可以用于获取并设置年、月、日、时、分、秒，它和 `Date` 比，主要多了一个可以做简单的日期和时间运算的功能。

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

### TimeZone

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

## LocalDateTime

从 Java 8 开始，`java.time` 包提供了新的日期和时间 API，主要涉及的类型有：

- 本地日期和时间：`LocalDateTime`，`LocalDate`，`LocalTime`；
- 带时区的日期和时间：`ZonedDateTime`；
- 时刻：`Instant`；
- 时区：`ZoneId`，`ZoneOffset`；
- 时间间隔：`Duration`。
- 以及一套新的用于取代 `SimpleDateFormat` 的格式化类型 `DateTimeFormatter`。

和旧的 API 相比，新 API 严格区分了时刻、本地日期、本地时间和带时区的日期时间，并且，对日期和时间进行运算更加方便。

此外，新 API 修正了旧 API 不合理的常量设计：

- Month 的范围用 1~12 表示 1 月到 12 月；
- Week 的范围用 1~7 表示周一到周日。

最后，新 API 的类型几乎全部是不变类型（和 String 类似），可以放心使用不必担心被修改。

### LocalDateTime

`LocalDateTime` 表示一个本地日期和时间，本地日期和时间通过 `now()` 获取，且总是以当前默认时区返回，和旧 API 不同，`LocalDateTime`、`LocalDate` 和 `LocalTime` 默认严格按照 ISO 8601 规定的日期和时间格式进行打印。

```java
LocalDate d = LocalDate.now(); // 当前日期
LocalTime t = LocalTime.now(); // 当前时间
LocalDateTime dt = LocalDateTime.now(); // 当前日期和时间
System.out.println(d); // 2019-12-31
System.out.println(t); // 10:38:55.839
System.out.println(dt); // 2019-12-31T10:38:55.839
```

在上面栗子中，在获取 3 个类型的时候，由于执行一行代码总会消耗一点时间，因此，3 个类型的日期和时间很可能对不上（毫秒数不同）。为了保证获取到同一时刻的日期和时间，可以通过互相转换来获取一个相同的时刻：

```java
LocalDateTime dt = LocalDateTime.now(); // 当前日期和时间
LocalDate d = dt.toLocalDate(); // 转换到当前日期
LocalTime t = dt.toLocalTime(); // 转换到当前时间
```

同理，也可以反过来，通过指定的日期和时间创建 `LocalDateTime` 可以通过 `of()` 方法：

```java
LocalDate d2 = LocalDate.of(2019, 11, 30); // 2019-11-30
LocalTime t2 = LocalTime.of(15, 16, 17); // 15:16:17
LocalDateTime dt2 = LocalDateTime.of(2019, 11, 30, 15, 16, 17);
LocalDateTime dt3 = LocalDateTime.of(d2, t2);
```

因为严格按照 ISO 8601 的格式，因此，将字符串转换为 `LocalDateTime` 就可以传入标准格式：

```java
LocalDateTime dt = LocalDateTime.parse("2019-11-19T15:16:17");
LocalDate d = LocalDate.parse("2019-11-19");
LocalTime t = LocalTime.parse("15:16:17");
```

ISO 8601 规定的日期和时间分隔符是 `T`。标准格式如下：

- 日期：`yyyy-MM-dd`
- 时间：`HH:mm:ss`
- 带毫秒的时间：`HH:mm:ss.SSS`
- 日期和时间：`yyyy-MM-dd'T'HH:mm:ss`
- 带毫秒的日期和时间：`yyyy-MM-dd'T'HH:mm:ss.SSS`

LocalDateTime 提供了对日期和时间进行加减的非常简单的链式调用：

```java
LocalDateTime dt = LocalDateTime.of(2019, 10, 26, 20, 30, 59);
System.out.println(dt); // 2019-10-26T20:30:59
// 加5天减3小时
LocalDateTime dt2 = dt.plusDays(5).minusHours(3);
System.out.println(dt2); // 2019-10-31T17:30:59
// 减1月
LocalDateTime dt3 = dt2.minusMonths(1);
System.out.println(dt3); // 2019-09-30T17:30:59
```

月份加减会自动调整日期，例如从 `2019-10-31` 减去 1 个月得到的结果是 `2019-09-30`，因为 9 月没有 31 日。

对日期和时间进行调整则使用 `withXxx()` 方法，例如：`withHour(15)` 会把 `10:11:12` 变为 `15:11:12`。

- 调整年：`withYear()`
- 调整月：`withMonth()`
- 调整日：`withDayOfMonth()`
- 调整时：`withHour()`
- 调整分：`withMinute()`
- 调整秒：`withSecond()`

```java
LocalDateTime dt = LocalDateTime.of(2019, 10, 26, 20, 30, 59);
System.out.println(dt); // 2019-10-26T20:30:59
// 日期变为31日
LocalDateTime dt2 = dt.withDayOfMonth(31);
System.out.println(dt2); // 2019-10-31T20:30:59
// 月份变为9，日期自动变为30日
LocalDateTime dt3 = dt2.withMonth(9);
System.out.println(dt3); // 2019-09-30T20:30:59
```

`LocalDateTime` 还有一个通用的 `with()` 方法允许我们做更复杂的运算：

```java
// 本月第一天0:00时刻
LocalDateTime firstDay = LocalDate.now().withDayOfMonth(1).atStartOfDay();
System.out.println(firstDay); // 2019-12-01T00:00

// 本月最后1天
LocalDate lastDay = LocalDate.now().with(TemporalAdjusters.lastDayOfMonth());
System.out.println(lastDay); // 2019-12-31

// 下月第1天
LocalDate nextMonthFirstDay = LocalDate.now().with(TemporalAdjusters.firstDayOfNextMonth());
System.out.println(nextMonthFirstDay); // 2020-01-01

// 本月第1个周一
LocalDate firstWeekday = LocalDate.now().with(TemporalAdjusters.firstInMonth(DayOfWeek.MONDAY));
System.out.println(firstWeekday); // 2019-12-02
```

要判断两个 `LocalDateTime` 的先后，可以使用 `isBefore()`、`isAfter()` 方法，对于 `LocalDate` 和 `LocalTime` 类似：

```java
LocalDateTime now = LocalDateTime.now();
LocalDateTime target = LocalDateTime.of(2019, 11, 19, 8, 15, 0);
System.out.println(now.isBefore(target)); // false
System.out.println(LocalDate.now().isBefore(LocalDate.of(2019, 11, 19))); // false
System.out.println(LocalTime.now().isAfter(LocalTime.parse("08:15:00"))); // true
```

### DateTimeFormatter

`DateTimeFormatter` 可以自定义输出的格式，或者要把一个非 ISO 8601 格式的字符串解析成 `LocalDateTime`。

```java
// 自定义格式化
DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm:ss");
System.out.println(dtf.format(LocalDateTime.now())); // 2019/12/31 16:26:58

// 用自定义格式解析
LocalDateTime dt2 = LocalDateTime.parse("2019/11/30 15:16:17", dtf);
System.out.println(dt2); // 2019-11-30T15:16:17
```

注意到 `LocalDateTime` 无法与时间戳进行转换，因为 `LocalDateTime` 没有时区，无法确定某一时刻。后面我们要介绍的 `ZonedDateTime` 相当于 `LocalDateTime` 加时区的组合，它具有时区，可以与 long 表示的时间戳进行转换。

### Duration 和 Period

`Duration` 表示两个时刻之间的时间间隔。另一个类似的 `Period` 表示两个日期之间的天数：

```java
LocalDateTime start = LocalDateTime.of(2019, 11, 19, 8, 15, 0);
LocalDateTime end = LocalDateTime.of(2020, 1, 9, 19, 25, 30);
Duration d = Duration.between(start, end);
System.out.println(d); // PT1235H10M30S

Period p = LocalDate.of(2019, 11, 19).until(LocalDate.of(2020, 1, 9));
System.out.println(p); // P1M21D
```

注意到两个 `LocalDateTime` 之间的差值使用 `Duration` 表示，类似 `PT1235H10M30S`，表示 1235 小时 10 分钟 30 秒。而两个 `LocalDate` 之间的差值用 `Period` 表示，类似 `P1M21D`，表示 1 个月 21 天。

`Duration` 和 `Period` 的表示方法也符合 ISO 8601 的格式，它以 `P...T...` 的形式表示，`P...T` 之间表示日期间隔，`T` 后面表示时间间隔。如果是 `PT...` 的格式表示仅有时间间隔。

利用 `ofXxx()` 或者 `parse()` 方法也可以直接创建 `Duration`：

```java
Duration d1 = Duration.ofHours(10); // 10 hours
Duration d2 = Duration.parse("P1DT2H3M"); // 1 day, 2 hours, 3 minutes
```
