# Interview

## 001 Spring Boot 最大的优势是什么呢？

Spring Boot 的最大的优势是“约定优于配置”。“约定优于配置”是一种软件设计范式，开发人员按照约定的方式来进行编程，可以减少软件开发人员需做决定的数量，获得简单的好处，而又不失灵活性。

## 002 Spring Boot 中 “约定优于配置“的具体产品体现在哪里？

Spring Boot Starter、Spring Boot Jpa 都是“约定优于配置”的一种体现。都是通过“约定优于配置”的设计思路来设计的，Spring Boot Starter 在启动的过程中会根据约定的信息对资源进行初始化；Spring Boot Jpa 通过约定的方式来自动生成 Sql，避免大量无效代码编写。

## 003 Spring Boot Starter 的工作原理是什么？

Spring Boot 在启动的时候会干这几件事情：

- Spring Boot 在启动时会去依赖的 Starter 包中寻找 `resources/META-INF/spring.factories` 文件，然后根据文件中配置的 Jar 包去扫描项目所依赖的 Jar 包。
- 根据 `spring.factories` 配置加载 `AutoConfigure` 类。
- 根据 `@Conditional` 注解的条件，进行自动配置并将 Bean 注入 Spring Context。

总结一下，其实就是 Spring Boot 在启动的时候，按照约定去读取 Spring Boot Starter 的配置信息，再根据配置信息对资源进行初始化，并注入到 Spring 容器中。这样 Spring Boot 启动完毕后，就已经准备好了一切资源，使用过程中直接注入对应 Bean 资源即可。

## 004 Spring Boot 的自动配置是如何实现的？

Spring Boot 项目的启动注解是：`@SpringBootApplication`，其实它就是由下面三个注解组成的：

- @Configuration
- @ComponentScan
- @EnableAutoConfiguration

其中 `@EnableAutoConfiguration` 是实现自动配置的入口，该注解又通过 `@Import` 注解导入了`AutoConfigurationImportSelector`，在该类中加载 `META-INF/spring.factories` 的配置信息。然后筛选出以 `EnableAutoConfiguration` 为 key 的数据，加载到 IOC 容器中，实现自动配置功能。

## JPA 和 Hibernate 有哪些区别？JPA 可以支持动态 SQL 吗？

JPA 本身是一种规范，它的本质是一种 ORM 规范（不是 ORM 框架，因为 JPA 并未提供 ORM 实现，只是制定了规范），因为 JPA 是一种规范，所以只是提供了一些相关的接口，但是接口并不能直接使用，JPA 底层需要某种 JPA 实现，Hibernate 是 JPA 的一个实现集。

JPA 是根据实体类的注解来创建对应的表和字段，如果需要动态创建表或者字段，需要动态构建对应的实体类，再重新调用 Jpa 刷新整个 Entity。动态 SQL，mybatis 支持的最好，jpa 也可以支持，但是没有 Mybatis 那么灵活。
