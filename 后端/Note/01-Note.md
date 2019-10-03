# Note

## 001 IDEA 常用快捷键

| 快捷键           | 描述         |
| :--------------- | :----------- |
| Ctrl+Shift+Alt+N | 查找类名     |
| Ctrl+Alt+O       | 移除未使用包 |
| Ctrl+Shift+Enter | 换行         |
| Ctrl+Shift+U     | 大小写转换   |
| Ctrl+Alt+T       | 语句快捷键   |

## 002 Vim

![Vim 常用命令](https://raw.githubusercontent.com/chanshiyucx/poi/master/2019/vim%E5%B8%B8%E7%94%A8%E5%91%BD%E4%BB%A4.jpg)

![Vim 键盘图](https://raw.githubusercontent.com/chanshiyucx/poi/master/2019/vim%E9%94%AE%E7%9B%98%E5%9B%BE.jpg)

## REST 和 RPC

- REST（representational state transfer，表现层状态转移）：使用 HTTP 协议，应用层，可以跨防火墙，在不同局域网之间通信
- RPC（remote procedure call，远程过程调用）：使用 TCP 协议，传输层，速度快，但不可跨防火墙，仅支持局域网通信

结论：**对内 RPC，对外 REST**。

## 整站下载资源

```bash
wget -c -r -np -k -L -p https://chanshiyu.com/
```

## IDEA 启用 Run Dashboard

修改 `.idea/workspace.xml`，找到 `RunDashboard` 添加下面配置：

```xml
<component name="RunDashboard">
    <option name="configurationTypes">
      <set>
        <option value="SpringBootApplicationConfigurationType" />
      </set>
    </option>
   <!-- ... -->
  </component>
```

## Window10 端口占用

```bash
netstat -ano | findstr <端口号>
taskkill -PID <进程号> -F
```

## HttpServletRequest

```java
@GetMapping("{id}")
public String reg(HttpServletRequest request, @PathVariable long id) {
    System.out.println("url" + request.getRequestURI());
    TbUser tbUser = tbUserMapper.selectByPrimaryKey(id);
    return tbUser.getUsername();
}
```

## ConfigurableApplicationContext

微服务中读取配置信息，为什么不用 `@Value` 注解，因为 `@Value` 读取是一次性的，`ConfigurableApplicationContext` 可以动态刷新。

```java
private final ConfigurableApplicationContext applicationContext;
applicationContext.getEnvironment().getProperty("user");
```

## 双重锁机制

双重锁机制保证单例模式：

```java
public class BaseResultFactory {

  private static BaseResultFactory baseResultFactory;

  private BaseResultFactory() {}

  public static BaseResultFactory getInstance() {
      if (baseResultFactory == null) {
          synchronized (BaseResultFactory.class) {
              if (baseResultFactory == null) {
                  baseResultFactory = new BaseResultFactory();
              }
          }
      }

      return baseResultFactory;
  }

}
```
