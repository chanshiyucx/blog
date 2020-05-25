# Note

## Vim

![Vim 常用命令](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/note/Vim常用命令.jpg)

![Vim 键盘图](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/note/Vim键盘图.jpg)

## 整站下载资源

```bash
wget -c -r -np -k -L -p https://chanshiyu.com/
```

## Window10 端口占用

```bash
netstat -ano | findstr <端口号>
taskkill -PID <进程号> -F
```

## ConfigurableApplicationContext

微服务中读取配置信息，为什么不用 `@Value` 注解，因为 `@Value` 读取是一次性的，`ConfigurableApplicationContext` 可以动态刷新。

```java
private final ConfigurableApplicationContext applicationContext;
applicationContext.getEnvironment().getProperty("user");
```

## 全局时钟

在微服务中，不同服务部署在不同机器上，获取时间戳不能使用 Date，因为不统一，需要一个专门的服务 `service-date` 来获取时间。时间可以不准但是必须统一。

## 编程范式

编程范式主要以下几大类：

- AOP（Aspect Oriented Programming）面向切面编程
- OOP（Object Oriented Programming）面向对象编程
- POP（Procedure Oriented Programming）面向过程编程
- FP（Functional Programming）面向函数编程
