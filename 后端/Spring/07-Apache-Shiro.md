# Apache Shiro

## 整体架构

![Apache Shiro 整体架构](https://raw.githubusercontent.com/chanshiyucx/poi/master/2019/Apache_Shiro_%E6%95%B4%E4%BD%93%E7%BB%93%E6%9E%84.png)

## 认证授权

引入依赖：

```xml
<dependency>
    <groupId>org.apache.shiro</groupId>
    <artifactId>shiro-core</artifactId>
    <version>1.4.0</version>
</dependency>
```

### Shiro 认证

![Shiro 认证](https://raw.githubusercontent.com/chanshiyucx/poi/master/2019/Shiro%E8%AE%A4%E8%AF%81.png)

```java
public class AuthenticationTest {

    private SimpleAccountRealm simpleAccountRealm = new SimpleAccountRealm();

    @Before
    public void addUser() {
        simpleAccountRealm.addAccount("shiyu", "123456");
    }

    /**
     * shiro 认证
     */
    @Test
    public void testAuthentication() {
        // 1.构建 SecurityManager 环境
        DefaultSecurityManager defaultSecurityManager = new DefaultSecurityManager();
        defaultSecurityManager.setRealm(simpleAccountRealm);

        // 2.主题提交认证请求
        SecurityUtils.setSecurityManager(defaultSecurityManager);
        Subject subject = SecurityUtils.getSubject();

        UsernamePasswordToken token = new UsernamePasswordToken("shiyu", "123456");
        subject.login(token);
        System.out.println("isAuthentication:" + subject.isAuthenticated());
    }
}
```

### Shiro 授权

## 集成 Spring
