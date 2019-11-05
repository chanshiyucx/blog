Code is Long, Life is Short.

まだ五里霧中です。

## 001 灵光一闪

`line = bufferedReader.readLine()) != null` 先赋值再比较，然后就可以使用变量输出 `System.out.println(line);`，不需要执行两次 `bufferedReader.readLine()`。

```java
String line;
while ((line = bufferedReader.readLine()) != null) {
    System.out.println(line);
}
```
