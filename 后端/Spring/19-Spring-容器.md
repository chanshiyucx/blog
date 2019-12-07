# Spring 容器

![Spring 注解驱动开发](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/spring-容器/Spring-注解驱动开发.png)

Spring 有两个核心接口：`BeanFactory` 和 `ApplicationContext`，其中 `ApplicationContext` 是 `BeanFactory` 的子接口。他们都可代表 Spring 容器，Spring 容器是生成 Bean 实例的工厂，并且管理容器中的 Bean，包括整个的生命周期的管理——创建、装配、销毁。

Bean 是 Spring 管理的基本单位，在基于 Spring 的 Java EE 应用中，**所有的组件都被当成 Bean 处理**，包括数据源、Hibernate 的 SessionFactory、事务管理器等。在 Spring 中，Bean 的是一个非常广义的概念，任何的 Java 对象、Java 组件都被当成 Bean 处理。

应用中的所有组件，都被 Spring 以 Bean 的方式管理，Spring 负责创建 Bean 实例，并管理他们的生命周期。Bean 在 Spring 容器中运行，无须感受 Spring 容器的存在，一样可以接受 Spring 的依赖注入，包括 Bean 属性的注入、协作者的注入、依赖关系的注入等。

Spring 容器负责创建 Bean 实例，所以需要知道每个 Bean 的实现类，Java 程序面向接口编程，无须关心 Bean 实例的实现类；**但是 Spring 容器必须能够精确知道每个 Bean 实例的实现类**，因此 Spring 配置文件必须精确配置 Bean 实例的实现类。

## BeanFactor

Spring 容器最基本的接口就是 `BeanFactory`。`BeanFactory` 负责配置、创建、管理 Bean，`ApplicationContext` 是它的子接口，因此也称之为 Spring 上下文。Spring 容器负责管理 Bean 与 Bean 之间的依赖关系。

`BeanFactory` 接口包含以下几个基本方法：

- `Boolean containBean(String name)`：判断 Spring 容器是否包含 id 为 name 的 Bean 实例。
- `Object getBean(String name)`：返回 Spring 容器中 id 为 name 的 Bean 实例。
- `<T> getBean(Class<T> requiredType)`：获取 Spring 容器中属于 requiredType 类型的唯一的 Bean 实例。
- `<T> T getBean(String name, Class requiredType)`：返回容器中 id 为 name，并且类型为 requiredType 的 Bean
- `Class <?> getType(String name)`：返回容器中指定 Bean 实例的类型。

调用者只需使用 `getBean()` 方法即可获得指定 Bean 的引用，无须关心 Bean 的实例化过程，即 Bean 实例的创建过程完全透明。

这些方法可以参考之前的笔记 [18 Spring Boot 管理 bean](https://chanshiyu.gitbook.io/blog/hou-duan/spring/18-Spring-Boot-管理-bean)。

创建 Spring 容器实例时，必须提供 Spring 容器管理的 Bean 的详细配置信息。Spring 的配置信息通常采用 xml 配置文件来设置，因此，创建 `BeanFactory` 实例时，应该提供 XML 配置文件作为参数。

XML 配置文件通常使用 Resource 对象传入。Resource 接口是 Spring 提供的资源访问接口，通过使用该接口，Spring 能够以简单、透明的方式访问磁盘、类路径以及网络上的资源。一般使用如下方式实例化 `BeanFactory`：

```java
// 搜索当前文件路径下的bean.xml文件创建Resource对象
InputStreamSource isr = new FileSystemResource("bean.xml");
// 以Resource对象作为参数创建BeanFactory实例
XmlBeanFactory factory = new XmlBeanFactory((Resource) isr);

// 搜索类加载路径下的bean.xml文件创建Resource对象
ClassPathResource res = new ClassPathResource("bean.xml");
XmlBeanFactory factory = new XmlBeanFactory(res);
```

在使用 `BeanFactory` 接口时，我们一般都是使用这个实现类：`org.springframework.beans.factory.xml.XmlBeanFactory`。然而 `ApplicationContext` 作为 `BeanFactory` 的子接口，使用它作为 Spring 容器会更加方便。它的实现类有：

- `FileSystemXmlApplicationContext`：以基于文件系统的 XML 配置文件创建 `ApplicationContext` 实例。
- `ClassPathXmlApplicationContext`：以类加载路径下的 XML 配置文件创建 `ApplicationContext` 实例。
- `XmlWebApplicationContext`：以 web 应用下的 XML 配置文件创建 `ApplicationContext` 实例。
- `AnnotationConfigApplicationContext`：以 java 的配置类创建 `ApplicationContext` 实例。

食用方式：

```java
// 搜索CLASSPATH路径，以classpath路径下的bean.xml、service.xml文件创建applicationContext
ApplicationContext ctx = new ClassPathXmlApplicationContext(new String[]{"bean.xml","service.xml"});

// 以指定路径下的bean.xml、service.xml文件创建applicationContext
ApplicationContext ctx1 = new FileSystemXmlApplicationContext(new String[]{"bean.xml","service.xml"});
```

## 注解驱动开发

我们举个栗子，比较传统的 xml 配置文件注册 bean 和注解方式注册 bean 两种方式。

![Spring Context依赖](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/spring-容器/Spring-Context依赖.png)

### 注册 bean

1. **使用 xml 配置文件**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
                        http://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean id="person" class="com.chanshiyu.bean.Person">
        <property name="name" value="zhangsan"/>
        <property name="age" value="18"/>
    </bean>
</beans>
```

然后通过 `ClassPathXmlApplicationContext` 引入类路径下的配置文件来注册 bean：

```java
ApplicationContext applicationContext = new ClassPathXmlApplicationContext("beans.xml");
Person bean = (Person) applicationContext.getBean("person");
System.out.println(bean);
```

2. **使用注解方式**

```java
// 配置类 == 配置文件
@Configuration
public class MainConfig {

    // 给容器中注册一个 bean; 类型为返回值类型，id 默认为方法名
    @Bean
    public Person person() {
        return new Person("lisi", 20);
    }

}
```

然后通过 `AnnotationConfigApplicationContext` 引入注解配置文件来注册 bean：

```java
ApplicationContext applicationContext = new AnnotationConfigApplicationContext(MainConfig.class);
Person bean = applicationContext.getBean(Person.class);
System.out.println(bean);
```

需要注意：**`@Bean` 注册 Bean，类型为返回值类型，id 默认为方法名，`@Bean(name)` 可以指定 bean id**。

### 包扫描

包扫描、只要标注了 `@Controller`、`@Service`、`@Repository`、`@Component` 注解的类都可以被自动注册为 bean。

1. **使用 xml 配置文件**

在 `beans.xml` 中加入：

```xml
<context:component-scan base-package="com.chanshiyu"></context:component-scan>
```

2. **使用注解方式**

```java
@Configuration
@ComponentScan(value = "com.chanshiyu")
public class MainConfig {}
```

包扫描规则：

```java
/**
 * @ComponentScan  value:指定要扫描的包
 * excludeFilters = Filter[]：指定扫描的时候按照什么规则排除那些组件
 * includeFilters = Filter[]：指定扫描的时候只需要包含哪些组件
 * FilterType.ANNOTATION：按照注解
 * FilterType.ASSIGNABLE_TYPE：按照给定的类型
 * FilterType.ASPECTJ：使用ASPECTJ表达式
 * FilterType.REGEX：使用正则指定
 * FilterType.CUSTOM：使用自定义规则
 */
@ComponentScan(value = "com.chanshiyu", excludeFilters = {
        @ComponentScan.Filter(type = FilterType.ANNOTATION, classes = {Controller.class, Service.class}),
        @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = {BookService.class})
})
```

这里重点介绍一下 `FilterType.CUSTOM` 自定义过滤规则，先自定义自己的规则类：

```java
public class MyTypeFilter implements TypeFilter {

    /**
     * metadataReader：读取到的当前正在扫描的类的信息
     * metadataReaderFactory: 可以获取到其他任何类信息的工厂
     */
    public boolean match(MetadataReader metadataReader, MetadataReaderFactory metadataReaderFactory) throws IOException {
        //获取当前类注解的信息
        AnnotationMetadata annotationMetadata = metadataReader.getAnnotationMetadata();
        //获取当前正在扫描的类的类信息
        ClassMetadata classMetadata = metadataReader.getClassMetadata();
        //获取当前类资源（类的路径）
        Resource resource = metadataReader.getResource();
        String className = classMetadata.getClassName();
        // 所有类名包含 Controller 的类都可以被扫描到
        return className.contains("Controller");
    }
}
```

食用自定义规则：

```java
@Configuration
@ComponentScan(value = "com.chanshiyu", includeFilters = {
        @ComponentScan.Filter(type = FilterType.CUSTOM, classes = {MyTypeFilter.class})
}, useDefaultFilters = false)
```

使用包扫描的两个注意点：

1. 注意 `includeFilters` 需要配合 `useDefaultFilters` 一起使用，禁用默认的过滤规则，因为默认的规则就是扫描所有的组件。

```xml
<context:component-scan base-package="com.chanshiyu" use-default-filters="false"/>
```

```java
@ComponentScan(value = "com.chanshiyu", includeFilters = {
        @ComponentScan.Filter(type = FilterType.ANNOTATION, classes = {Controller.class, Service.class}),
}, useDefaultFilters = false)
```

2. 如果使用的 jdk8 版本以上，`@ComponentScan` 可以重复使用，即可以多次使用该注解定义规则。如果版本在 jdk8 以下，可以使用 `@ComponentScans` 注解定义多个扫描规则。

```java
@ComponentScans(value = {
        @ComponentScan(value = "com.chanshiyu", includeFilters = {
                @ComponentScan.Filter(type = FilterType.ANNOTATION, classes = {Controller.class}),
        }, useDefaultFilters = false)
})
```

## Tips

### 打印所有被 spring 托管的 bean

```java
ApplicationContext applicationContext = new AnnotationConfigApplicationContext(MainConfig.class);
String[] beanDefinitionNames = applicationContext.getBeanDefinitionNames();
for (String beanDefinitionName : beanDefinitionNames) {
    System.out.println(beanDefinitionName);
}
```
