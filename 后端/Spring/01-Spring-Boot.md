# Spring Boot

## 初遇 Spring Boot

Spring Boot 是 Spring MVC 的升级版，两者没有必然联系。

Spring Boot 的角色：Spring Framework -> Spring Boot -> Spring Cloud。

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

## 启动方式

1. mvn 启动：

```bash
mvn spring-boot:run
```

2. 打成 jar 包启动：

```bash
# 打包
mvn clean package

# 启动
java -jar target/luckymoney-0.0.1-SNAPSHOT.jar
```

## 配置

### 基本配置

```yml
# 启动端口和路径
server:
  port: 3000
  servlet:
    context-path: /luckymoney

# 数据库和JPA
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    username: root
    password: 1124chanshiyu
    url: jdbc:mysql://127.0.0.1:3306/sell?characterEncoding=utf-8&useSSL=false&serverTimezone=UTC
  jpa:
    show-sql: true
```

### 自定义配置

1. 单个引入

```yml
# 自定义配置
minMoney: 1
description: 最少金额${minMoney}元
```

在程序中引用自定义的配置参数：

```java
@RestController
public class HelloController {

    @Value("${minMoney}")
    private BigDecimal minMoney;

    @Value("${description}")
    private String description;

    @GetMapping("/hello")
    public String sayHello() {
        return description;
    }
}
```

2. 多个引入

```yml
limit:
  minMoney: 1
  maxMoney: 10
  description: 最少金额${limit.minMoney}元，最大金额${limit.maxMoney}元
```

提取配置：

```java
@Data
@Component
@ConfigurationProperties(prefix = "limit")
public class LimitConfig {

    private BigDecimal minMoney;

    private BigDecimal maxMoney;

    private String description;
}
```

引入配置：

```java
@RestController
public class HelloController {

    @Autowired
    private LimitConfig limitConfig;

    @GetMapping("/hello")
    public String sayHello() {
        return limitConfig.getDescription();
    }
}
```

3. 区分开发与生产环境

将 `application.yml` 复制两份文件 `application-dev.yml` 和 `application-prod.yml`，然后再在 `application.yml` 中引入：

```yml
spring:
  profiles:
    active: dev
```

开发环境使用 dev，发布到线上时不需要更改，只需启动时加入参数启动：

```bash
java -jar -Dspring.profiles.active=prod target/luckymoney-0.0.1-SNAPSHOT.jar
```

## 注解

### @RestController

> @RestController = @Controller + @ResponseBody

`@RestController` 注解相当于 `@Controller` 与 `@ResponseBody` 这两个注解的结合。

在使用 SpringMVC 框架的时候，在处理 json 的时候需要注解 `@ResponseBody` 或者 `@RestController`，这两个注解都会处理返回的数据格式，使用了该类型注解后返回的不再是视图，不会进行转跳，而是返回 json 或 xml 数据格式，输出在页面上。

所以在定义 Controller 的时候如果需要返回 jsp 界面就用 `@Controller` 注解，只需要返回 string 或 json 的时候就用 `@RestController` 注解。

两者区别：

`@ResponseBody`： 一般是使用在单独的方法上的，需要哪个方法返回 json 数据格式，就在哪个方法上使用，具有针对性。
`@RestController`：一般是使用在类上的，它相当于 `@Controller` 与 `@ResponseBody` 这两个注解的结合，本质相当于在该类的所有方法上都统一使用了 `@ResponseBody` 注解。

### @GetMapping

注解 `@GetMapping` 支持数组，多个路径可以访问同一个接口：

```java
@GetMapping({"/hello", "/hi"})
```

获取路由参数有两种方式，一种是 `/hello/200` 路径，另外一种是 `/hello?id=200` 路径，方式分别如下：

```java
// /hello/200
@GetMapping("/hello/{id}")
public String sayHello(@PathVariable("id") Integer id) {
    return "id:" + id;
}

// /hello?id=200
@GetMapping("/hello")
public String sayHello(@RequestParam("id") Integer id) {
    return "id:" + id;
}
```

更细致控制非必传和默认值：

```java
@GetMapping("/hello")
public String sayHello(@RequestParam(value = "id", required = false, defaultValue = "0") Integer id) {
    return "id:" + id;
}
```

`@RequestParam` 注解可以兼容 `@PostMapping`

```java
@PostMapping("/hello")
public String sayHello(@RequestParam(value = "id", required = false, defaultValue = "0") Integer id) {
    return "id:" + id;
}
```

### Spring WebFlux

Spring5.x 是 Java 界首个支持响应式的 Web 框架，新增 `Spring WebFlux` 模块。

`Spring WebFlux` 同时支持使用旧的 `Spring MVC` 注解声明 `Reactive Controller`。和传统的 `MVC Controller` 不同，`Reactive Controller` 操作的是**非阻塞**的 `ServerHttpRequest` 和 `ServerHttpResponse`，而不再是 Spring MVC 里的 `HttpServletRequest` 和 `HttpServletResponse`。
