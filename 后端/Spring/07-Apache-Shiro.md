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

### 认证与授权

![Shiro 认证](https://raw.githubusercontent.com/chanshiyucx/poi/master/2019/Shiro%E8%AE%A4%E8%AF%81.png)

![Shiro 授权](https://raw.githubusercontent.com/chanshiyucx/poi/master/2019/Shiro%E6%8E%88%E6%9D%83.png)

### SimpleAccountRealm

```java
public class AuthenticationTest {

    private SimpleAccountRealm simpleAccountRealm = new SimpleAccountRealm();

    @Before
    public void addUser() {
        simpleAccountRealm.addAccount("shiyu", "123456", "admin", "user");
    }

    /**
     * 认证与授权
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

        // 3.登录
        subject.login(token);
        System.out.println("isAuthentication:" + subject.isAuthenticated()); // true

        // 4.角色检查
        subject.checkRole("admin");
        subject.checkRoles("admin", "user");

        // 5.退出
        subject.logout();
        System.out.println("isAuthentication:" + subject.isAuthenticated()); // false
    }
}
```

### IniRealm

新建 `user.ini` 文件:

```ini
[users]
shiyu=123456,admin,user
[roles]
admin=user:delete
```

```java
public class IniRealmTest {

    @Test
    public void testAuthentication() {
        IniRealm iniRealm = new IniRealm("classpath:user.ini");

        // 1.构建 SecurityManager 环境
        DefaultSecurityManager defaultSecurityManager = new DefaultSecurityManager();
        defaultSecurityManager.setRealm(iniRealm);

        // 2.主题提交认证请求
        SecurityUtils.setSecurityManager(defaultSecurityManager);
        Subject subject = SecurityUtils.getSubject();
        UsernamePasswordToken token = new UsernamePasswordToken("shiyu", "123456");

        // 3.登录
        subject.login(token);
        System.out.println("isAuthentication:" + subject.isAuthenticated()); // true

        // 4.角色权限检查
        subject.checkRole("admin");
        subject.checkRoles("admin", "user");
        subject.checkPermission("user:delete");

        // 5.退出
        subject.logout();
        System.out.println("isAuthentication:" + subject.isAuthenticated()); // false
    }
}
```

## 集成 Spring
