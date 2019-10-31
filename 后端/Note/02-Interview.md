# Interview

## 001 Spring Boot 最大的优势是什么呢？

Spring Boot 的最大的优势是“约定优于配置”。“约定优于配置”是一种软件设计范式，开发人员按照约定的方式来进行编程，可以减少软件开发人员需做决定的数量，获得简单的好处，而又不失灵活性。

## 002 Spring Boot 中 “约定优于配置“的具体产品体现在哪里？

Spring Boot Starter、Spring Boot Jpa 都是“约定优于配置”的一种体现。都是通过“约定优于配置”的设计思路来设计的，Spring Boot Starter 在启动的过程中会根据约定的信息对资源进行初始化；Spring Boot Jpa 通过约定的方式来自动生成 Sql，避免大量无效代码编写。

## 003 Spring Boot Starter 的工作原理是什么？

Spring Boot 在启动的时候会干这几件事情：

1. Spring Boot 在启动时会去依赖的 Starter 包中寻找 `resources/META-INF/spring.factories` 文件，然后根据文件中配置的 Jar 包去扫描项目所依赖的 Jar 包。
2. 根据 `spring.factories` 配置加载 `AutoConfigure` 类。
3. 根据 `@Conditional` 注解的条件，进行自动配置并将 Bean 注入 Spring Context。

总结一下，其实就是 Spring Boot 在启动的时候，按照约定去读取 Spring Boot Starter 的配置信息，再根据配置信息对资源进行初始化，并注入到 Spring 容器中。这样 Spring Boot 启动完毕后，就已经准备好了一切资源，使用过程中直接注入对应 Bean 资源即可。

## 004 Spring Boot 的自动配置是如何实现的？

Spring Boot 项目的启动注解是：`@SpringBootApplication`，其实它就是由下面三个注解组成的：

- @Configuration
- @ComponentScan
- @EnableAutoConfiguration

其中 `@EnableAutoConfiguration` 是实现自动配置的入口，该注解又通过 `@Import` 注解导入了`AutoConfigurationImportSelector`，在该类中加载 `META-INF/spring.factories` 的配置信息。然后筛选出以 `EnableAutoConfiguration` 为 key 的数据，加载到 IOC 容器中，实现自动配置功能。

## 005 JPA 和 Hibernate 有哪些区别？JPA 可以支持动态 SQL 吗？

JPA 本身是一种规范，它的本质是一种 ORM 规范（不是 ORM 框架，因为 JPA 并未提供 ORM 实现，只是制定了规范），因为 JPA 是一种规范，所以只是提供了一些相关的接口，但是接口并不能直接使用，JPA 底层需要某种 JPA 实现，Hibernate 是 JPA 的一个实现集。

JPA 是根据实体类的注解来创建对应的表和字段，如果需要动态创建表或者字段，需要动态构建对应的实体类，再重新调用 Jpa 刷新整个 Entity。动态 SQL，mybatis 支持的最好，jpa 也可以支持，但是没有 Mybatis 那么灵活。

## 006 SSM 概念

SSM：Spring + Spring MVC + MyBatis

- Spring 是一个轻量级的控制反转（IoC）和面向切面（AOP）的容器框架。
- SpringMVC 分离了控制器、模型对象、分派器以及处理程序对象的角色，这种分离让它们更容易进行定制。
- MyBatis 是一个支持普通 SQL 查询，存储过程和高级映射的优秀持久层框架。

## 007 Java 变量

Java 中共有三种变量，分别是类变量、成员变量和局部变量。他们分别存放在 JVM 的方法区、堆内存和栈内存中。

```java
public class Variables {
    /**
      * 类变量
      */
    private static int a;

    /**
      * 成员变量
      */
    private int b;

    /**
      * 局部变量
      */
    public void test(int c){
        int d;
    }
}
```

上面定义的三个变量中，变量 a 就是类变量，变量 b 就是成员变量，而变量 c 和 d 是局部变量。

## 008 REST 和 RPC

- REST（representational state transfer，表现层状态转移）：使用 HTTP 协议，应用层，可以跨防火墙，在不同局域网之间通信
- RPC（remote procedure call，远程过程调用）：使用 TCP 协议，传输层，速度快，但不可跨防火墙，仅支持局域网通信

结论：**对内 RPC，对外 REST**。
