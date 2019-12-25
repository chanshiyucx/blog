# Snippets

## 001 全局跨域配置

```java
@Configuration
public class CorsConfig {

    /**
     * 允许跨域调用的过滤器
     */
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        // 允许跨越发送cookie
        config.setAllowCredentials(true);
        // 允许所有域名进行跨域调用
        config.addAllowedOrigin("*");
        // 放行全部原始头信息
        config.addAllowedHeader("*");
        // 允许所有请求方法跨域调用
        config.addAllowedMethod("*");
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }

}
```

## 002 获取泛型 class

```java
private Class<T> entityClass = (Class<T>) ((ParameterizedType) getClass().getGenericSuperclass()).getActualTypeArguments()[0];
```

## 003 ReflectionToStringBuilder

通过反射打印对象：

```java
System.out.println(ReflectionToStringBuilder.toString(umsAdmin, ToStringStyle.MULTI_LINE_STYLE));
```

## 004 赋值判断

`line = bufferedReader.readLine()) != null` 先赋值再比较，然后就可以使用变量输出 `System.out.println(line);`，不需要执行两次 `bufferedReader.readLine()`。

```java
String line;
while ((line = bufferedReader.readLine()) != null) {
    System.out.println(line);
}
```

## 005 日期清空时分秒

```java
private Date convertTime(Date date) {
    Calendar calendar = Calendar.getInstance();
    calendar.setTime(date);
    calendar.set(Calendar.MINUTE, 0);
    calendar.set(Calendar.SECOND, 0);
    calendar.set(Calendar.MILLISECOND, 0);
    return calendar.getTime();
}
```

## 006 HttpServletRequest

```java
@GetMapping("{id}")
public String reg(HttpServletRequest request, @PathVariable long id) {
    System.out.println("url" + request.getRequestURI());
    TbUser tbUser = tbUserMapper.selectByPrimaryKey(id);
    return tbUser.getUsername();
}
```

## 007 HashMap to List

```java
HashMap<String, OrderAmount> OrderAmountHashMap = new HashMap<>();
List<String> axis = OrderAmountHashMap.keySet().stream().sorted().collect(Collectors.toList());
List<OrderAmount> list = new ArrayList<OrderAmount>(OrderAmountHashMap.values());
```

### 008 List Stream 索引下标

```java
List<Date> dateList = getDateListOfDay();
List<String> axis = IntStream.range(0, dateList.size())
        .mapToObj(i -> DateFormat.format(dateList.get(i)))
        .collect(Collectors.toList());
```
