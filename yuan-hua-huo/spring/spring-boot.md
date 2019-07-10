# Spring Boot

## 初遇 Spring Boot

Spring Boot 的角色：Spring Framework -> Spring Boot -> Spring Cloud

Spring Boot 的三大特性：

1. 组件自动装配：Web MVC、Web Flux、JDBC 等
2. 嵌入式 Web 容器：Tomcat、Jetty 以及 Undertow
3. 生产准备特性：指标、健康检查、外部化配置等

### 组件自动装配

1. 激活：`@EnableAutoConfiguration`
2. 配置：`/META-INF/spring.factories`
3. 实现：`XXXAutoConfiguration`

### 嵌入式 Web 容器

1. Web Servlet：Tomcat、Jetty 和 Undertow
2. Web Reactive：Netty Web Serve

### 生产准备特性

1. 指标：/actuator/metrics
2. 健康检查：/actuator/health
3. 外部化配置：/actuator/configprops

## Jackson

```java
// 忽视字段
@JsonIgnore

// 日期格式化
@JsonFormat(pattern = "yyyy-MM-dd hh:mm:ss a", locale = "zh", timezone = "GMT+8")

// 忽略空值
@JsonInclude(JsonInclude.Include.NON_NULL)
```
