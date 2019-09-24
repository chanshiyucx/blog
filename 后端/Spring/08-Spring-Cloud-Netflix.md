# Spring Cloud Netflix

目前市场上主流的第一套微服务架构解决方案：Spring Boot + Spring Cloud Netflix。

## 创建统一的依赖管理

Spring Cloud 项目都是基于 Spring Boot 进行开发，并且都是使用 Maven 做项目管理工具。在实际开发中，一般都会创建一个依赖管理项目作为 Maven 的 Parent 项目使用，方便对 Jar 包版本的统一管理。

创建一个工程名为 `spring-cloud-dependencies` 的项目，pom.xml 配置文件如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.1.7.RELEASE</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>
    <groupId>com.chanshiyu</groupId>
    <artifactId>spring-cloud-dependencies</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <name>spring-cloud-dependencies</name>
    <description>Demo project for Spring Boot</description>
    <!-- 项目打包类型，默认为 jar -->
    <packaging>pom</packaging>

    <properties>
        <!-- Environment Settings -->
        <java.version>1.8</java.version>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>

        <!-- Spring Settings -->
        <spring-cloud.version>Finchley.RELEASE</spring-cloud.version>
    </properties>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>${spring-cloud.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <build>
        <plugins>
            <!-- Compiler 插件, 设定 JDK 版本 -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <configuration>
                    <showWarnings>true</showWarnings>
                </configuration>
            </plugin>

            <!-- 打包 jar 文件时，配置 manifest 文件，加入 lib 包的 jar 依赖 -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-jar-plugin</artifactId>
                <configuration>
                    <archive>
                        <addMavenDescriptor>false</addMavenDescriptor>
                    </archive>
                </configuration>
                <executions>
                    <execution>
                        <configuration>
                            <archive>
                                <manifest>
                                    <!-- Add directory entries -->
                                    <addDefaultImplementationEntries>true</addDefaultImplementationEntries>
                                    <addDefaultSpecificationEntries>true</addDefaultSpecificationEntries>
                                    <addClasspath>true</addClasspath>
                                </manifest>
                            </archive>
                        </configuration>
                    </execution>
                </executions>
            </plugin>

            <!-- resource -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-resources-plugin</artifactId>
            </plugin>

            <!-- install -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-install-plugin</artifactId>
            </plugin>

            <!-- clean -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-clean-plugin</artifactId>
            </plugin>

            <!-- ant -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-antrun-plugin</artifactId>
            </plugin>

            <!-- dependency -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-dependency-plugin</artifactId>
            </plugin>
        </plugins>

        <!-- 资源文件配置 -->
        <resources>
            <resource>
                <directory>src/main/java</directory>
                <excludes>
                    <exclude>**/*.java</exclude>
                </excludes>
            </resource>
            <resource>
                <directory>src/main/resources</directory>
            </resource>
        </resources>

    </build>

    <repositories>
        <repository>
            <id>aliyun-repos</id>
            <name>Aliyun Repository</name>
            <url>http://maven.aliyun.com/nexus/content/groups/public</url>
            <releases>
                <enabled>true</enabled>
            </releases>
            <snapshots>
                <enabled>false</enabled>
            </snapshots>
        </repository>
        <repository>
            <id>sonatype-repos</id>
            <name>Sonatype Repository</name>
            <url>https://oss.sonatype.org/content/groups/public</url>
            <releases>
                <enabled>true</enabled>
            </releases>
            <snapshots>
                <enabled>false</enabled>
            </snapshots>
        </repository>
        <repository>
            <id>sonatype-repos-s</id>
            <name>Sonatype Repository</name>
            <url>https://oss.sonatype.org/content/repositories/snapshots</url>
            <releases>
                <enabled>false</enabled>
            </releases>
            <snapshots>
                <enabled>true</enabled>
            </snapshots>
        </repository>
        <repository>
            <id>spring-snapshots</id>
            <name>Spring Snapshots</name>
            <url>https://repo.spring.io/snapshot</url>
            <snapshots>
                <enabled>true</enabled>
            </snapshots>
        </repository>
        <repository>
            <id>spring-milestones</id>
            <name>Spring Milestones</name>
            <url>https://repo.spring.io/milestone</url>
            <snapshots>
                <enabled>false</enabled>
            </snapshots>
        </repository>
    </repositories>

    <pluginRepositories>
        <pluginRepository>
            <id>aliyun-repos</id>
            <name>Aliyun Repository</name>
            <url>http://maven.aliyun.com/nexus/content/groups/public</url>
            <releases>
                <enabled>true</enabled>
            </releases>
            <snapshots>
                <enabled>false</enabled>
            </snapshots>
        </pluginRepository>
    </pluginRepositories>

</project>
```

- `parent`：继承了 Spring Boot 的 Parent，表示这一个 Spring Boot 工程
- `package`：pom，表示该项目仅当做依赖项目，没有具体的实现代码
- `spring-cloud-dependencies`：Spring Cloud 版本号
- `build`：配置了项目所需的各种插件
- `repositories`：配置项目下载依赖时的第三方库

在实际开发中，所有的项目都会依赖这个 dependencies 项目，整个项目周期中的所有第三方依赖的版本也都由该项目进行管理。

## 服务注册与发现

服务注册与发现使用的是 Spring Cloud Netflix 的 Eureka 模块。

### 创建服务注册中心

创建一个工程名为 `spring-cloud-eureka` 的项目，pom.xml 配置文件如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.chanshiyu</groupId>
        <artifactId>spring-cloud-dependencies</artifactId>
        <version>1.0.0-SNAPSHOT</version>
        <relativePath>../spring-cloud-dependencies/pom.xml</relativePath>
    </parent>
    <groupId>com.chanshiyu</groupId>
    <artifactId>spring-cloud-eureka</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <name>spring-cloud-eureka</name>
    <description>Demo project for Spring Boot</description>
    <packaging>jar</packaging>

    <properties>
        <java.version>1.8</java.version>
    </properties>

    <dependencies>
        <!-- Spring Boot Begin -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>

        <!-- Spring Cloud Begin -->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <!-- 配置启动入口 -->
                <configuration>
                    <mainClass>com.chanshiyu.springcloudeureka.EurekaApplication</mainClass>
                </configuration>
            </plugin>
        </plugins>
    </build>

</project>
```

### Application

通过注解 `@EnableEurekaServer` 启动一个服务注册中心：

```java
@SpringBootApplication
@EnableEurekaServer
public class EurekaApplication {

    public static void main(String[] args) {
        SpringApplication.run(EurekaApplication.class, args);
    }

}
```

### application.yml

Eureka 是一个高可用的组件，它没有后端缓存，每一个实例注册之后需要向注册中心发送心跳（因此可以在内存中完成），在默认情况下 Erureka Server 也是一个 Eureka Client，必须要指定一个 Server。

```yml
spring:
  application:
    name: spring-cloud-eureka

server:
  port: 8761

eureka:
  instance:
    hostname: localhost
  client:
    registerWithEureka: false
    fetchRegistry: false
    serviceUrl:
      defaultZone: http://${eureka.instance.hostname}:${server.port}/eureka/
```

通过 `eureka.client.registerWithEureka:false` 和 `fetchRegistry:false` 来表明自己是一个 Eureka Server。

### 启动

和普通 Spring Boot 项目一样启动后，界面如下：

![spring cloud eureka](https://raw.githubusercontent.com/chanshiyucx/poi/master/2019/spring-cloud-eureka.png)

## 服务提供者

当 Client 向 Server 注册时，它会提供一些元数据，例如主机和端口，URL，主页等。Eureka Server 从每个 Client 实例接收心跳消息。 如果心跳超时，则通常将该实例从注册 Server 中删除。

### 创建服务提供者

创建一个工程名为 `spring-cloud-service-hello` 的项目，pom.xml 配置文件如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.chanshiyu</groupId>
        <artifactId>spring-cloud-dependencies</artifactId>
        <version>1.0.0-SNAPSHOT</version>
        <relativePath>../spring-cloud-dependencies/pom.xml</relativePath>
    </parent>
    <groupId>com.chanshiyu</groupId>
    <artifactId>spring-cloud-service-hello</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <name>spring-cloud-service-hello</name>
    <description>Demo project for Spring Boot</description>
    <packaging>jar</packaging>

    <properties>
        <java.version>1.8</java.version>
    </properties>

    <dependencies>
        <!-- Spring Boot Begin -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>

        <!-- Spring Cloud Begin -->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <!-- 配置启动入口 -->
                <configuration>
                    <mainClass>com.chanshiyu.springcloudservicehello.ServiceHelloApplication</mainClass>
                </configuration>
            </plugin>
        </plugins>
    </build>

</project>
```

### Application

通过注解 `@EnableEurekaClient` 表明自己是一个 Eureka Client：

```java
@SpringBootApplication
@EnableEurekaClient
public class ServiceHelloApplication {

    public static void main(String[] args) {
        SpringApplication.run(ServiceHelloApplication.class, args);
    }

}
```

### application.yml

```yml
spring:
  application:
    name: spring-cloud-service-hello

server:
  port: 8762

eureka:
  client:
    serviceUrl:
      defaultZone: http://localhost:8761/eureka/
```

需要注意必须指明 `spring.application.name`，这个很重要，以后的服务与服务之间通过这个 name 来相互调用。

### 添加服务

服务提供者需要提供服务，这里举个简单栗子：

```java
@RestController
public class HelloController {

    @Value("${server.port}")
    private String port;

    @GetMapping("say")
    public String hello(String message) {
        return String.format("Your message is: %s , port: %s", message, port);
    }

}
```

访问 `http://localhost:8762/say?message=11` 结果：

```
Your message is: 11, port: 8762
```

## 服务消费者（Ribbon）

在微服务架构中，业务都会被拆分成一个独立的服务，服务与服务的通讯是基于 `http restful` 的。Spring cloud 有两种服务调用方式，一种是 `ribbon + restTemplate`，另一种是 `feign`。

Ribbon 是一个负载均衡客户端，可以很好的控制 http 和 tcp 的一些行为。

### 创建服务提供者

创建一个工程名为 `spring-cloud-web-hello-ribbon` 的项目，pom.xml 配置文件如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.chanshiyu</groupId>
        <artifactId>spring-cloud-dependencies</artifactId>
        <version>1.0.0-SNAPSHOT</version>
        <relativePath>../spring-cloud-dependencies/pom.xml</relativePath>
    </parent>
    <groupId>com.chanshiyu</groupId>
    <artifactId>spring-cloud-web-hello</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <name>spring-cloud-web-hello-ribbon</name>
    <description>Demo project for Spring Boot</description>
    <packaging>jar</packaging>

    <properties>
        <java.version>1.8</java.version>
    </properties>

    <dependencies>
        <!-- Spring Boot Begin -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>

        <!-- Spring Cloud Begin -->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-ribbon</artifactId>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <!-- 配置启动入口 -->
                <configuration>
                    <mainClass>com.chanshiyu.springcloudwebhello.WebHelloRibbonApplication</mainClass>
                </configuration>
            </plugin>
        </plugins>
    </build>

</project>
```

主要是增加了 Ribbon 的依赖：

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-ribbon</artifactId>
</dependency>
```

### Application

通过注解 `@EnableDiscoveryClient` 注册到服务中心：

```java
@SpringBootApplication
@EnableDiscoveryClient
public class WebHelloRibbonApplication {

    public static void main(String[] args) {
        SpringApplication.run(WebHelloRibbonApplication.class, args);
    }

}
```

### application.yml

```yml
spring:
  application:
    name: spring-cloud-web-hello-ribbon

server:
  port: 8764

eureka:
  client:
    serviceUrl:
      defaultZone: http://localhost:8761/eureka/
```

### Configuration

添加一个配置文件，配置注入 `RestTemplate` 的 Bean，并通过 `@LoadBalanced` 注解表明开启负载均衡功能：

```java
@Configuration
public class RestTemplateConfiguration {

    @Bean
    @LoadBalanced
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

}
```

### 测试服务

之后进行调用服务提供者的服务进行测试。

创建一个 `HelloService`：

```java
@Service
public class HelloService {

    @Autowired
    private RestTemplate restTemplate;

    public String sayHi(String message) {
        return restTemplate.getForObject("http://spring-cloud-service-hello/say?message=" + message, String.class);
    }

}
```

创建一个 `HelloController`：

```java
@RestController
public class HelloController {

    @Autowired
    private HelloService helloService;

    @GetMapping("/say")
    public String sayHi(@RequestParam String message) {
        return helloService.sayHi(message);
    }

}
```

先启动服务提供者 `spring-cloud-service-hello` 两个实例，端口分别为 8762 和 8763。再启动服务消费者，访问 `http://localhost:8764/say?message=11` 结果会在两个端口之间交替显示，表示已经成功实现了负载均衡功能来访问不同端口的实例：

```
Your message is: 11, port: 8762
Your message is: 11, port: 8763
```

此时架构图（service-admin 对应 service-hello，web-admin 对应 web-hello）：

![服务注册发现](https://raw.githubusercontent.com/chanshiyucx/poi/master/2019/%E6%9C%8D%E5%8A%A1%E6%B3%A8%E5%86%8C%E5%8F%91%E7%8E%B0.png)

- Eureka Server：服务注册与发现中心，端口号为：8761
- service-hello：服务提供者，工程运行了两个实例，端口号分别为：8762，8763
- web-hello-ribbon：服务消费者，工程端口号为：8764

web-hello-ribbon 通过 RestTemplate 调用 service-hello 接口时因为启用了负载均衡功能故会轮流调用它的 8762 和 8763 端口。

## 服务消费者（Feign）

Feign 是一个声明式的伪 Http 客户端，它使得写 Http 客户端变得更简单。Feign 默认集成了 Ribbon，并和 Eureka 结合，默认实现了负载均衡的效果。

- Feign 采用的是基于接口的注解
- Feign 整合了 ribbon

### 创建服务消费者

创建一个工程名为 `spring-cloud-web-hello-feign` 的项目，pom.xml 配置文件如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.chanshiyu</groupId>
        <artifactId>spring-cloud-dependencies</artifactId>
        <version>1.0.0-SNAPSHOT</version>
        <relativePath>../spring-cloud-dependencies/pom.xml</relativePath>
    </parent>
    <groupId>com.chanshiyu</groupId>
    <artifactId>spring-cloud-web-hello-feign</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <name>spring-cloud-web-hello</name>
    <description>Demo project for Spring Boot</description>
    <packaging>jar</packaging>

    <properties>
        <java.version>1.8</java.version>
    </properties>

    <dependencies>
        <!-- Spring Boot Begin -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>

        <!-- Spring Cloud Begin -->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-openfeign</artifactId>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <!-- 配置启动入口 -->
                <configuration>
                    <mainClass>com.chanshiyu.springcloudwebhellofeign.WebHelloFeignApplication</mainClass>
                </configuration>
            </plugin>
        </plugins>
    </build>

</project>
```

主要是增加了 Feign 的依赖：

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
</dependency>
```

### Application

通过注解 `@EnableFeignClients` 开启 Feign 功能：

```java
@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
public class WebHelloFeignApplication {

    public static void main(String[] args) {
        SpringApplication.run(WebHelloFeignApplication.class, args);
    }

}
```

### application.yml

```yml
spring:
  application:
    name: spring-cloud-web-hello-feign

server:
  port: 8765

feign:
  hystrix:
    enabled: true

eureka:
  client:
    serviceUrl:
      defaultZone: http://localhost:8761/eureka/
```

### 测试服务

不同于 Ribbon 直接创建 `class service`，Feign 创建 `interface service`，通过 `@FeignClient("服务名")` 注解来指定调用哪个服务：

```java
@FeignClient(value = "spring-cloud-service-hello")
public interface HelloService {

    @GetMapping("say")
    public String sayHi(@RequestParam(value = "message") String message);

}
```

创建一个 `HelloController`：

```java
@RestController
public class HelloController {

    @Autowired
    private HelloService helloService;

    @GetMapping("/say")
    public String sayHi(@RequestParam String message) {
        return helloService.sayHi(message);
    }

}
```

启动后访问结果和 Ribbon 一致。
