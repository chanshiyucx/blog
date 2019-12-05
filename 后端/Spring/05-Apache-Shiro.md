# Apache Shiro

## 整体架构

![Apache Shiro 整体架构](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/Apache-Shiro/Apache_Shiro_整体结构.png)

## 认证授权

![Shiro 认证](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/Apache-Shiro/Shiro认证.png)

![Shiro 授权](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/Apache-Shiro/Shiro授权.png)

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

添加依赖：

```xml
<dependencies>
    <!-- shiro 相关 -->
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-context</artifactId>
        <version>4.3.5.RELEASE</version>
    </dependency>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-webmvc</artifactId>
        <version>4.3.5.RELEASE</version>
    </dependency>
    <dependency>
        <groupId>org.apache.shiro</groupId>
        <artifactId>shiro-core</artifactId>
        <version>1.4.0</version>
    </dependency>
    <dependency>
        <groupId>org.apache.shiro</groupId>
        <artifactId>shiro-spring</artifactId>
        <version>1.4.0</version>
    </dependency>
    <dependency>
        <groupId>org.apache.shiro</groupId>
        <artifactId>shiro-web</artifactId>
        <version>1.4.0</version>
    </dependency>

    <!-- mysql 与 jdbc -->
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
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-jdbc</artifactId>
        <version>4.3.5.RELEASE</version>
    </dependency>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-context</artifactId>
        <version>4.3.5.RELEASE</version>
    </dependency>
</dependencies>
```

关于配置 SpringWeb 这部分掠过，可以查看源码 [Spring Shiro Resource](https://github.com/chanshiyucx/hello-java/tree/master/shiro/shiro-spring/src/main/resources)。

我们将上面的 JDBCUtil 工具类访问数据库改造成使用 JdbcTemplate 访问：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">

    <!-- 配置数据源 -->
    <bean id="dataSource" class="com.alibaba.druid.pool.DruidDataSource">
        <property name="driverClassName" value="com.mysql.jdbc.Driver"/>
        <property name="username" value="root"/>
        <property name="password" value="1124chanshiyu"/>
        <property name="url" value="jdbc:mysql:///shiro"/>
    </bean>

    <bean id="jdbcTemplate" class="org.springframework.jdbc.core.JdbcTemplate">
        <property name="dataSource" ref="dataSource"/>
    </bean>
</beans>
```

修改 CustomRealm：

```java
public class CustomRealm extends AuthorizingRealm {

    private final String customRealmName = "customRealm";

    @Resource
    private UserService userService;

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
        User user = userService.getUserByUsername(username);
        if (user == null) {
            return null;
        }

        SimpleAuthenticationInfo info = new SimpleAuthenticationInfo(username, user.getPassword(), customRealmName);
        info.setCredentialsSalt(ByteSource.Util.bytes("shiro"));
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
        try {
            // 2.通过用户名获取角色
            Set<String> roleNames = getRoleNamesForUser(username);

            // 3. 通过角色获取权限
            Set<String> permissions = getPermissions(roleNames);

            info = new SimpleAuthorizationInfo(roleNames);
            info.setStringPermissions(permissions);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return info;
    }

    /**
     * 获取角色
     */
    private Set<String> getRoleNamesForUser(String username) throws SQLException {
        List<String> roles = userService.getRoleByUsername(username);
        LinkedHashSet sets = new LinkedHashSet(roles);
        return sets;
    }

    /**
     * 获取权限
     */
    private Set<String> getPermissions(Set<String> roles) throws SQLException {
        List<String> permissions = userService.getPermissionByRole(roles);
        LinkedHashSet sets = new LinkedHashSet(permissions);
        return sets;
    }
}
```

Service 实现类：

```java
@Component
public class UserServiceImpl implements UserService {

    @Resource
    private JdbcTemplate jdbcTemplate;

    public User getUserByUsername(String username) {
        String sql = "select id, username, password from users where username = ?";

        List<User> users = jdbcTemplate.query(sql, new String[]{username}, new RowMapper<User>() {
            public User mapRow(ResultSet resultSet, int i) throws SQLException {
                String username = resultSet.getString("username");
                String password = resultSet.getString("password");
                User user = new User();
                user.setUsername(username);
                user.setPassword(password);
                return user;
            }
        });

        if (CollectionUtils.isEmpty(users)) {
            return null;
        }

        return users.get(0);
    }

    public List<String> getRoleByUsername(String username) {
        String sql ="select role_name from user_roles where username = ?";
        List<String> roles = jdbcTemplate.query(sql, new String[]{username}, new RowMapper<String>() {
            public String mapRow(ResultSet resultSet, int i) throws SQLException {
                String role = resultSet.getString("role_name");
                return role;
            }
        });
        return roles;
    }

    public List<String> getPermissionByRole(Set<String> roles) {
        NamedParameterJdbcTemplate jdbc = new NamedParameterJdbcTemplate(jdbcTemplate);

        MapSqlParameterSource parameters = new MapSqlParameterSource();
        parameters.addValue("roles", roles);

        String sql ="select permission from roles_permissions where role_name in (:roles)";
        List<String> permissions = jdbc.query(sql, parameters, new RowMapper<String>() {
            public String mapRow(ResultSet resultSet, int i) throws SQLException {
                String permission = resultSet.getString("permission");
                return permission;
            }
        });
        return permissions;
    }
}
```

### 通过注解方式鉴权

添加依赖：

```xml
<dependency>
    <groupId>org.aspectj</groupId>
    <artifactId>aspectjweaver</artifactId>
    <version>1.8.9</version>
</dependency>
```

修改 spring-mvc.xml：

```xml
<!-- 开启AoP -->
<aop:config proxy-target-class="true"/>

<!-- 保证 Shiro内部生命周期 -->
<bean class="org.apache.shiro.spring.LifecycleBeanPostProcessor"></bean>

<!-- 开启Shiro授权生效 -->
<bean class="org.apache.shiro.spring.security.interceptor.AuthorizationAttributeSourceAdvisor"></bean>
```

在 Controller 注解鉴权：

```java
// 验证角色
@RequiresRoles("admin")
@RequestMapping(value="/testRoles", method=RequestMethod.GET)
@ResponseBody
public String testRole() {
    return "test roles success";
}

// 验证权限
@RequiresPermissions(("user:delete"))
@RequestMapping(value="/testPerms", method=RequestMethod.GET)
@ResponseBody
public String testPerms() {
    return "test permissions success";
}
```

### 过滤器

除了通过注解，还可以通过过滤器来鉴权：

```xml
<property name="filterChainDefinitions">
    <value>
        /login.html = anon
        /subLogin = anon
        /testRoles = roles["admin"]
        /testRoles1 = roles["admin","admin1"]
        /testPerms = perms["user:delete"]
        /testPerms1 = perms["user:delete","user:update"]
        /* = authc
    </value>
</property>
```

Controller 实现：

```java
@RequestMapping(value="/testRoles", method=RequestMethod.GET)
@ResponseBody
public String testRole() {
    return "test roles success";
}

@RequestMapping(value="/testRoles1", method=RequestMethod.GET)
@ResponseBody
public String testRole1() {
    return "test roles success";
}

@RequestMapping(value="/testPerms", method=RequestMethod.GET)
@ResponseBody
public String testPerms() {
    return "test permissions success";
}

@RequestMapping(value="/testPerms1", method=RequestMethod.GET)
@ResponseBody
public String testPerms1() {
    return "test permissions1 success";
}
```

也可以自定义过滤器：

```java
public class RolesOrFilter extends AuthorizationFilter {

    @Override
    protected boolean isAccessAllowed(ServletRequest req,
                                      ServletResponse resp, Object object) throws Exception {

        Subject subject = getSubject(req, resp);

        String[] roles = (String[]) object;

        if (roles == null || roles.length == 0) {
            return true;
        }

        for (String role : roles) {
            if (subject.hasRole(role)) {
                return true;
            }
        }

        return false;
    }
}
```

依旧引入：

```xml
<bean id="shiroFilter" class="org.apache.shiro.spring.web.ShiroFilterFactoryBean">
    <property name="securityManager" ref="securityManager" />
    <property name="loginUrl" value="login.html" />
    <property name="unauthorizedUrl" value="403.html" />
    <property name="filterChainDefinitions">
        <value>
            /login.html = anon
            /subLogin = anon
            /testRolesOr = rolesOr["admin", "user"]
            /* = authc
        </value>
    </property>
    <property name="filters">
        <util:map>
            <entry key="rolesOr" value-ref="rolesOrFilter" />
        </util:map>
    </property>
</bean>

<bean class="com.chanshiyu.filter.RolesOrFilter" id="rolesOrFilter" />
```

## 会话与缓存管理

添加 redis 的管理工具依赖 jedis:

```xml
<dependency>
    <groupId>redis.clients</groupId>
    <artifactId>jedis</artifactId>
    <version>2.8.0</version>
</dependency>
```

jedis 配置 spring-redis.xml：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
       http://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean class="redis.clients.jedis.JedisPool" id="jedisPool">
        <constructor-arg name="poolConfig" ref="jedisPoolConfig"/>
        <constructor-arg name="host" value="127.0.0.1"/>
        <constructor-arg name="port" value="6379"/>
    </bean>

    <bean class="redis.clients.jedis.JedisPoolConfig" id="jedisPoolConfig"/>
</beans>
```

新建 jedis 工具类：

```java
@Component
public class JedisUtil {

    // 通过 Jedis 连接池来获取 redis 连接
    @Autowired
    private JedisPool jedisPool;

    private Jedis getResource() {
        return jedisPool.getResource();
    }

    public byte[] set(byte[] key, byte[] value) {
        Jedis jedis = getResource();
        try {
            jedis.set(key, value);
            return value;
        } finally {
            jedis.close();
        }
    }

    public void expire(byte[] key, int i) {
        Jedis jedis = getResource();
        try {
            jedis.expire(key, i);
        } finally {
            jedis.close();
        }
    }

    public byte[] get(byte[] key) {
        Jedis jedis = getResource();
        try {
            return jedis.get(key);
        } finally {
            jedis.close();
        }
    }

    public void del(byte[] key) {
        Jedis jedis = getResource();
        try {
            jedis.del(key);
        } finally {
            jedis.close();
        }
    }

    public Set<byte[]> keys(String SHIRO_SESSION_PREFIX) {
        Jedis jedis = getResource();
        try {
            return jedis.keys((SHIRO_SESSION_PREFIX + "*").getBytes());
        } finally {
            jedis.close();
        }
    }
}
```

### 会话管理

session 管理类：

```java
public class RedisSessionDao extends AbstractSessionDAO {

    @Resource
    private JedisUtil jedisUtil;

    private final String SHIRO_SESSION_PREFIX = "shiro-session";

    private byte[] getKey(String key) {
        return (SHIRO_SESSION_PREFIX + key).getBytes();
    }

    /**
     * 保存Session
     * @param session
     */
    private void saveSession(Session session) {
        if (session != null && session.getId() != null) {
            byte[] key = getKey(session.getId().toString());
            byte[] value = SerializationUtils.serialize(session);
            jedisUtil.set(key, value);
            jedisUtil.expire(key, 600);
        }
    }

    @Override
    protected Serializable doCreate(Session session) {
        Serializable sessionId = generateSessionId(session);
        assignSessionId(session, sessionId);
        saveSession(session);
        return sessionId;
    }

    @Override
    protected Session doReadSession(Serializable sessionId) {
        if (sessionId == null) {
            return null;
        }
        byte[] key = getKey(sessionId.toString());
        byte[] value = jedisUtil.get(key);
        return (Session) SerializationUtils.deserialize(value);
    }

    public void update(Session session) throws UnknownSessionException {
        saveSession(session);
    }

    public void delete(Session session) {
        if (session == null || session.getId() == null) {
            return;
        }
        byte[] key = getKey(session.getId().toString());
        jedisUtil.del(key);
    }

    public Collection<Session> getActiveSessions() {
        Set<byte[]> keys = jedisUtil.keys(SHIRO_SESSION_PREFIX);
        Set<Session> sessions = new HashSet<Session>();
        if (CollectionUtils.isEmpty(keys)) {
            return sessions;
        }
        for (byte[] key : keys) {
            Session session = (Session) SerializationUtils.deserialize(jedisUtil.get(key));
            sessions.add(session);
        }
        return sessions;
    }
}
```

由于默认的 sessionManager 会每次都访问 redis 中缓存的 session，所以需要自定义 session 访问 manager：

```java
public class CustomSessionManage extends DefaultWebSessionManager {

    @Override
    protected Session retrieveSession(SessionKey sessionKey) throws UnknownSessionException {
        Serializable sessionId = getSessionId(sessionKey);
        ServletRequest request = null;
        if (sessionKey instanceof WebSessionKey) {
            request = ((WebSessionKey) sessionKey).getServletRequest();
        }

        // 从 request 中获取 session
        if (request != null && sessionId != null) {
            Session session = (Session) request.getAttribute(sessionId.toString());
            if (session != null) {
                return session;
            }
        }

        // 从 redis 中获取 session
        Session session = super.retrieveSession(sessionKey);
        if (request != null && sessionId != null) {
            request.setAttribute(sessionId.toString(), session);
        }
        return session;
    }
}
```

然后在 spring.xml 中引入：

```xml
<bean id="securityManager" class="org.apache.shiro.web.mgt.DefaultWebSecurityManager">
    <!-- ... -->
    <property name="sessionManager" ref="sessionManager"/>
</bean>

<bean class="com.chanshiyu.session.CustomSessionManage" id="sessionManager" >
    <property name="sessionDAO" ref="redisSessionDao" />
</bean>
<bean class="com.chanshiyu.session.RedisSessionDao" id="redisSessionDao"/>
```

### 缓存管理

主要缓存角色数据和权限数据，不用每次从数据库中读取角色和权限信息，提升程序性能。

cache 管理类 RedisCacheManager：

```java
public class RedisCacheManager implements CacheManager {

    @Resource
    private RedisCache redisCache;

    @Override
    public <K, V> Cache<K, V> getCache(String s) throws CacheException {
        return redisCache;
    }
}
```

具体实现：

```java
@SuppressWarnings("unchecked")
@Component
public class RedisCache<K, V> implements Cache<K, V> {

    @Autowired
    private JedisUtil jedisUtil;

    private final String CACHE_PREFIX = "shiro-cache";

    private byte[] getKey(K k) {
        if (k instanceof String) {
            return (CACHE_PREFIX + k).getBytes();
        }
        return SerializationUtils.serialize(k);
    }

    @Override
    public V get(K k) throws CacheException {
        byte[] value = jedisUtil.get(getKey(k));
        if (value != null) {
            return (V) SerializationUtils.deserialize(value);
        }
        return null;
    }

    @Override
    public V put(K k, V v) throws CacheException {
        byte[] key = getKey(k);
        byte[] value = SerializationUtils.serialize(v);
        jedisUtil.set(key, value);
        jedisUtil.expire(key, 600);
        return v;
    }

    @Override
    public V remove(K k) throws CacheException {
        byte[] key = getKey(k);
        byte[] value = SerializationUtils.serialize(key);
        jedisUtil.del(key);
        if (value != null) {
            return (V) SerializationUtils.deserialize(value);
        }
        return null;
    }

    @Override
    public void clear() throws CacheException {}

    @Override
    public int size() {
        return 0;
    }

    @Override
    public Set<K> keys() {
        return null;
    }

    @Override
    public Collection<V> values() {
        return null;
    }
}
```

然后在 spring.xml 中引入：

```xml
<bean id="securityManager" class="org.apache.shiro.web.mgt.DefaultWebSecurityManager">
    <!-- ... -->
    <property name="cacheManager" ref="cacheManager"/>
</bean>

<bean class="com.chanshiyu.cache.RedisCacheManager" id="cacheManager"/>
```

### 记住登录

修改 spring.xml：

```xml
<bean id="securityManager" class="org.apache.shiro.web.mgt.DefaultWebSecurityManager">
    <!-- ... -->
    <property name="rememberMeManager" ref="cookieRememberMeManager"/>
</bean>

<bean class="org.apache.shiro.web.mgt.CookieRememberMeManager" id="cookieRememberMeManager">
    <property name="cookie" ref="cookie"/>
</bean>
<bean class="org.apache.shiro.web.servlet.SimpleCookie" id="cookie">
    <constructor-arg name="name" value="rememberMe"/>
    <property name="maxAge" value="20000000"/>
</bean>
```

生成 token 时设置是否记住：

```java
token.setRememberMe(true);
```
