# Task 定时任务

- 使用注解 `@EnableScheduling` 开启定时任务
- 定义 `@Component` 作为组件被容器扫描

定义启动类：

```java
@SpringBootApplication
@EnableScheduling
public class SpringDemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpringDemoApplication.class, args);
    }

}
```

定义任务类：

```java
@Component
public class TestTask {

    /** 定义每过3秒执行任务 */
    @Scheduled(fixedRate = 3000)
    public void reportCurrentTime() {
        System.out.println("现在时间：" + new Date());
    }

}
```
