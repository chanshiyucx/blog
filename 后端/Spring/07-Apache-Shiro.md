# Apache Shiro

## 整体架构

![Apache Shiro 整体架构](https://raw.githubusercontent.com/chanshiyucx/poi/master/2019/Apache_Shiro_%E6%95%B4%E4%BD%93%E7%BB%93%E6%9E%84.png)

## 认证授权

![Shiro 认证](https://raw.githubusercontent.com/chanshiyucx/poi/master/2019/Shiro%E8%AE%A4%E8%AF%81.png)

![Shiro 授权](https://raw.githubusercontent.com/chanshiyucx/poi/master/2019/Shiro%E6%8E%88%E6%9D%83.png)

引入依赖：

```xml
<dependency>
    <groupId>org.apache.shiro</groupId>
    <artifactId>shiro-core</artifactId>
    <version>1.4.0</version>
</dependency>
```

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

新建 `user.ini` 文件：

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

### JdbcRealm

引入依赖：

```xml
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>5.1.38</version>
</dependency>
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>druid</artifactId>
    <version>1.1.6</version>
</dependency>
```

JdbcRealm 默认的 sql 查询语句为：

```java
protected static final String DEFAULT_AUTHENTICATION_QUERY = "select password from users where username = ?";
protected static final String DEFAULT_SALTED_AUTHENTICATION_QUERY = "select password, password_salt from users where username = ?";
protected static final String DEFAULT_USER_ROLES_QUERY = "select role_name from user_roles where username = ?";
protected static final String DEFAULT_PERMISSIONS_QUERY = "select permission from roles_permissions where role_name = ?";
```

也可以设置自己的 sql 语句：

```java
jdbcRealm.setAuthenticationQuery();
jdbcRealm.setUserRolesQuery();
jdbcRealm.setPermissionsQuery();
```

```java
public class JdbcRealmTest {

    private DruidDataSource dataSource = new DruidDataSource();

    {
        dataSource.setUrl("jdbc:mysql://127.0.0.1:3306/shiro?characterEncoding=utf-8&useSSL=false&serverTimezone=UTC");
        dataSource.setUsername("root");
        dataSource.setPassword("1124chanshiyu");
    }

    @Test
    public void testAuthentication() {
        JdbcRealm jdbcRealm = new JdbcRealm();
        jdbcRealm.setDataSource(dataSource);
        // 注意启用权限查询
        jdbcRealm.setPermissionsLookupEnabled(true);

        // 1.构建 SecurityManager 环境
        DefaultSecurityManager defaultSecurityManager = new DefaultSecurityManager();
        defaultSecurityManager.setRealm(jdbcRealm);

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

### CustomReal

数据库配置 `db.properties`：

```
jdbc.url = jdbc:mysql://127.0.0.1:3306/shiro?characterEncoding=utf-8&useSSL=false&serverTimezone=UTC
jdbc.user = root
jdbc.password = 1124chanshiyu
jdbc.dirverClass = com.mysql.jdbc.Driver
```

工具类：

```java
/**
 * JDBC工具类
 * 1) 获取 Connnection
 * 2) 释放资源
 */
public class JDBCUtil {

    private static DruidDataSource druidDataSource = null;

    static {
        try {
            InputStream inputStream =JDBCUtil.class.getClassLoader().getResourceAsStream("db.properties");
            Properties properties = new Properties();
            properties.load(inputStream);

            String url = properties.getProperty("jdbc.url");
            String user = properties.getProperty("jdbc.user");
            String password = properties.getProperty("jdbc.password");
            String dirverClass = properties.getProperty("jdbc.dirverClass");

            druidDataSource = new DruidDataSource();
            druidDataSource.setDriverClassName(dirverClass);
            druidDataSource.setUrl(url);
            druidDataSource.setUsername(user);
            druidDataSource.setPassword(password);
            druidDataSource.setInitialSize(5);
            druidDataSource.setMinIdle(1);
            druidDataSource.setMaxActive(10);
            druidDataSource.setPoolPreparedStatements(false);
        } catch (Exception e){
            e.printStackTrace();
        }
    }

    /**
     * 获取 Connection
     */
    public static synchronized Connection getConnection(){
        Connection conn = null;
        try {
            conn = druidDataSource.getConnection();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return conn;
    }

    /**
     * 释放 DB 相关的资源
     */
    public static void release(ResultSet resultSet, Statement statement, Connection connection) {
        if (resultSet != null) {
            try {
                resultSet.close();
            }catch (Exception e) {
                e.printStackTrace();
            }
        }

        if (statement != null) {
            try {
                statement.close();
            }catch (Exception e) {
                e.printStackTrace();
            }
        }

        if (connection != null) {
            try {
                connection.close();
            }catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}
```

自定义 `CustomRealm` 可以参考 `JdbcRealm`：

```java
public class CustomRealm extends AuthorizingRealm {

    private final String customRealmName = "customRealm";

    {
        super.setName(customRealmName);
    }

    /**
     * 认证
     */
    @Override
    protected AuthenticationInfo doGetAuthenticationInfo(AuthenticationToken authenticationToken) throws AuthenticationException {
        // 1.从主体传过来的认证信息获取用户名
        UsernamePasswordToken upToken = (UsernamePasswordToken)authenticationToken;
        String username = upToken.getUsername();
        if (username == null) {
            throw new AccountException("Null usernames are not allowed by this realm.");
        }

        // 2.通过用户名从数据库中获取凭证
        SimpleAuthenticationInfo info = null;
        Connection connection = null;
        PreparedStatement preparedStatement = null;
        ResultSet resultSet = null;
        String sql ="select id, username, password from users where username = ?";
        try {
            connection = JDBCUtil.getConnection();
            preparedStatement = connection.prepareStatement(sql);
            preparedStatement.setString(1, username);
            resultSet = preparedStatement.executeQuery();

            String password = null;
            for(boolean foundResult = false; resultSet.next(); foundResult = true) {
                if (foundResult) {
                    throw new AuthenticationException("More than one user row found for user [" + username + "]. Usernames must be unique.");
                }
                password = resultSet.getString("password");
            }
            if (password == null) {
                return null;
            }

            info = new SimpleAuthenticationInfo(username, password, customRealmName);
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            JDBCUtil.release(resultSet, preparedStatement, connection);
        }

        return info;
    }

    /**
     * 授权
     */
    @Override
    protected AuthorizationInfo doGetAuthorizationInfo(PrincipalCollection principalCollection) {
        // 1.获取用户名
        String username = (String) principalCollection.getPrimaryPrincipal();

        SimpleAuthorizationInfo info = null;
        Connection conn = null;
        try {
            // 2.通过用户名获取角色
            conn = JDBCUtil.getConnection();
            Set<String> roleNames = getRoleNamesForUser(conn, username);

            // 3. 通过角色获取权限
            Set permissions = getPermissions(conn, username, roleNames);

             info = new SimpleAuthorizationInfo(roleNames);
            info.setStringPermissions(permissions);
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            JDBCUtil.release(null, null, conn);
        }
        return info;
    }

    /**
     * 获取角色
     */
    private Set<String> getRoleNamesForUser(Connection conn, String username) throws SQLException {
        PreparedStatement ps = null;
        ResultSet rs = null;
        LinkedHashSet roleNames = new LinkedHashSet();
        String sql ="select role_name from user_roles where username = ?";

        try {
            ps = conn.prepareStatement(sql);
            ps.setString(1, username);
            rs = ps.executeQuery();

            while(rs.next()) {
                String roleName = rs.getString(1);
                if (roleName != null) {
                    roleNames.add(roleName);
                } else {
                    System.out.println("Null role name found while retrieving role names for user [" + username + "]");
                }
            }
        } finally {
            JDBCUtil.release(rs, ps, null);
        }

        return roleNames;
    }

    /**
     * 获取权限
     */
    private Set<String> getPermissions(Connection conn, String username, Collection<String> roleNames) throws SQLException {
        PreparedStatement ps = null;
        LinkedHashSet permissions = new LinkedHashSet();
        String sql ="select permission from roles_permissions where role_name = ?";

        try {
            ps = conn.prepareStatement(sql);
            Iterator roleIt = roleNames.iterator();

            while(roleIt.hasNext()) {
                String roleName = (String)roleIt.next();
                ps.setString(1, roleName);
                ResultSet rs = null;

                try {
                    rs = ps.executeQuery();
                    while(rs.next()) {
                        String permissionString = rs.getString(1);
                        permissions.add(permissionString);
                    }
                } finally {
                    JDBCUtil.release(rs, null, null);
                }
            }
        } finally {
            JDBCUtil.release(null, ps, null);
        }

        return permissions;
    }
}
```

### 加密

MD5 计算方法：

```java
Md5Hash md5Hash = new Md5Hash("123456");
System.out.println("md5Hash: " + md5Hash.toString());
```

数据库保存 MD5 加密后的密码，然后进行 Shiro 认证的时候设置加密方法和加密次数：

```java
@Test
public void testAuthentication() {
    CustomRealm customRealm = new CustomRealm();

    DefaultSecurityManager defaultSecurityManager = new DefaultSecurityManager();
    defaultSecurityManager.setRealm(customRealm);

    HashedCredentialsMatcher matcher = new HashedCredentialsMatcher();
    matcher.setHashAlgorithmName("md5");
    matcher.setHashIterations(1);
    customRealm.setCredentialsMatcher(matcher);
}
```

可以给 MD5 加盐：

```java
Md5Hash md5Hash = new Md5Hash("123456", "shiro");
```

然后在我们自定的 `CustomRealm` 的认证方法返回的认证信息中加入盐：

```java
info = new SimpleAuthenticationInfo(username, password, customRealmName);
info.setCredentialsSalt(ByteSource.Util.bytes("shiro"));
```

## 集成 Spring
