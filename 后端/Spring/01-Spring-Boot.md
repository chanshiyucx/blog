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
java -jar -Dspring.profiles.active=prod target\luckymoney-0.0.1-SNAPSHOT.jar
```
