# Spring Boot 技术整合

## Mysql

- pom.xml 引入相关依赖
- 资源文件对 mysql 进行配置

引入依赖：

```xml
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
```

配置文件：

```yml
spring:
  datasource:
    url: jdbc:mysql://127.0.0.1:3306/sell?characterEncoding=utf-8&useSSL=false&serverTimezone=UTC
    hikari:
      username: root
      password: 1124chanshiyu
      driver-class-name: com.mysql.cj.jdbc.Driver
```

## Redis

- pom.xml 引入相关依赖
- 资源文件对 redis 进行配置

引入依赖：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

配置文件：

```yml
spring:
  lettuce:
    database: 0 # 数据库索引（默认为 0）
    host: 127.0.0.1 # 服务器地址
    port: 6397 # 服务器连接端口
    password: # 服务器连接密码（默认为空）
    timeout: 0 # 连接超时时间（毫秒）
    jedis:
      pool:
        max-active: 8 # 连接池最大连接数（负数表示没有限制）
        max-wait: -1 # 连接池最大阻塞等待时间（负数表示没有限制）
        max-idle: 8 # 连接池最大空闲连接
        min-idle: 0 # 连接池最小空闲连接
```
