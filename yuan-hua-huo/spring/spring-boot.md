# Spring Boot

- SSM：Spring MVC + spring + MyBatis

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

## 分层领域模型

分层领域模型规约：

- DO（Data Object）：与数据库表结构一一对应，通过 DAO 层向上传输数据源对象。
- DTO（Data Transfer Object）：数据传输对象，Service 或 Manager 向外传输的对象。
- BO（Business Object）：业务对象，由 Service 层输出的封装业务逻辑的对象。
- AO（Application Object）：应用对象，在 Web 层与 Service 层之间抽象的复用对象模型，极为贴近展示层，复用度不高。
- VO（View Object）：显示层对象，通常是 Web 向模板渲染引擎层传输的对象。
- POJO（Plain Ordinary Java Object）：POJO 专指只有 setter/getter/toString 的简单类，包括 DO/DTO/BO/VO 等。
- Query：数据查询对象，各层接收上层的查询请求。注意超过 2 个参数的查询封装，禁止使用 Map 类来传输。

领域模型命名规约：

- 数据对象：xxxDO，xxx 即为数据表名。
- 数据传输对象：xxxDTO，xxx 为业务领域相关的名称。
- 展示对象：xxxVO，xxx 一般为网页名称。
- POJO 是 DO/DTO/BO/VO 的统称，禁止命名成 xxxPOJO。
