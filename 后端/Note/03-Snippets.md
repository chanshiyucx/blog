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
