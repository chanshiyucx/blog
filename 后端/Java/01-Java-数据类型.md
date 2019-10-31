# Java 数据类型

## 基本类型

Java 中有 8 种基本数据类型，分为三大类：

- 字符型：char
- 布尔型：boolean
- 数值型：
  - 整型：byte、short、int、long
  - 浮点型：float、double

| 数据类型 | 默认值  | 位数 |
| -------- | ------- | ---- |
| char     | 'u0000' | 16   |
| boolean  | false   | ~    |
| byte     | 0       | 8    |
| short    | 0       | 16   |
| int      | 0       | 32   |
| long     | 0L      | 64   |
| float    | 0.0f    | 32   |
| double   | 0.0d    | 64   |

boolean 只有两个值：true、false，可以使用 1 bit 来存储，但是具体大小没有明确规定。JVM 会在编译时期将 boolean 类型的数据转换为 int，使用 1 来表示 true，0 表示 false。JVM 支持 boolean 数组，但是是通过读写 byte 数组来实现的。

## 包装类型

基本类型都有对应的包装类型，基本类型与其对应的包装类型之间的赋值使用自动装箱与拆箱完成。

```java
Integer x = 2;     // 装箱 调用了 Integer.valueOf(2)
int y = x;         // 拆箱 调用了 X.intValue()
```

## 缓存池

new Integer(123) 与 Integer.valueOf(123) 的区别在于：

- new Integer(123) 每次都会新建一个对象；
- Integer.valueOf(123) 会使用缓存池中的对象，多次调用会取得同一个对象的引用。

```java
Integer x = new Integer(123);
Integer y = new Integer(123);
System.out.println(x == y);    // false
Integer z = Integer.valueOf(123);
Integer k = Integer.valueOf(123);
System.out.println(z == k);   // true
```

valueOf() 方法的实现比较简单，就是先判断值是否在缓存池中，如果在的话就直接返回缓存池的内容。

```java
public static Integer valueOf(int i) {
  if (i >= IntegerCache.low && i <= IntegerCache.high)
  return IntegerCache.cache[i + (-IntegerCache.low)];
  return new Integer(i);
}
```

在 Java 8 中，Integer 缓存池的大小默认为 -128~127。
