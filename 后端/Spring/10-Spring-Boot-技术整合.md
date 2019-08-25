# Spring Boot 技术整合

## Spring Boot Redis

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
  redis:
    database: 1 # 数据库索引（默认为 0）
    host: 127.0.0.1 # 服务器地址
    port: 6397 # 服务器连接端口
    password: # 服务器连接密码（默认为空）
    jedis:
      pool:
        max-active: 1000 # 连接池最大连接数（负数表示没有限制）
        max-wait: -1 # 连接池最大阻塞等待时间（负数表示没有限制）
        max-idle: 10 # 连接池最大空闲连接
        min-idle: 2 # 连接池最小空闲连接
    timeout: 0 # 连接超时时间（毫秒）
```
