## 准备工作

### 创建项目并添加数据库依赖

```xml
 <dependencies>
  <dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>5.1.38</version>
  </dependency>
  <dependency>
    <groupId>junit</groupId>
    <artifactId>junit</artifactId>
    <version>4.11</version>
    <scope>test</scope>
  </dependency>
</dependencies>
```

### 创建数据库

```sql
create database spring_data;

use spring_data;

create table student (
  id int not null auto_increment,
  name varchar(32) not null,
  age int not null,
  primary key(id)
);

insert into student (name, age) values ("张三", 22);
```

### 创建实体类和访问接口

新增实体类 `Student`：

```java
@Data
public class Student {

    private int id;

    private String name;

    private int age;
}
```

新增访问接口 `StudentDAO`：

```java
public interface StudentDAO {

    public List<Student> query();

    public void save(Student student);
}
```

## 传统方式访问数据库 JDBC

- Connection
- Statement
- ResultSet
- Test Case

### 配置文件 db.properties

配置文件 `db.properties`：

```properties
jdbc.url = jdbc:mysql:///spring_data
jdbc.user = root
jdbc.password = 1124chanshiyu
jdbc.dirverClass = com.mysql.jdbc.Driver
```

### 开发 JDBCUtil 工具类

工具类：获取 Connection，关闭 Connection、Statement、ResultSet。

```java
/**
 * JDBC 工具类
 * 1) 获取 Connnection
 * 2) 释放资源
 */
public class JDBCUtil {

    /**
     * 获取 Connection
     * @return 所获得的 JDBC 的 Connection
     */
    public static Connection getConnection() throws Exception {
        InputStream inputStream =JDBCUtil.class.getClassLoader().getResourceAsStream("db.properties");
        Properties properties = new Properties();
        properties.load(inputStream);

        String url = properties.getProperty("jdbc.url");
        String user = properties.getProperty("jdbc.user");
        String password = properties.getProperty("jdbc.password");
        String dirverClass = properties.getProperty("jdbc.dirverClass");

        Class.forName(dirverClass);
        Connection connection = DriverManager.getConnection(url, user, password);
        return connection;
    }

    /**
     * 释放 DB 相关的资源
     * @param resultSet
     * @param statement
     * @param connection
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

### 实现访问接口

实现访问接口 `StudentDAOImpl`：

```java
public class StudentDAOImpl implements StudentDAO {

    @Override
    public List<Student> query() {
        List<Student> students = new ArrayList<Student>();

        Connection connection = null;
        PreparedStatement preparedStatement = null;
        ResultSet resultSet = null;
        String sql ="select id, name, age from student";

        try {
            connection = JDBCUtil.getConnection();
            preparedStatement = connection.prepareStatement(sql);
            resultSet = preparedStatement.executeQuery();

            Student student;
            while (resultSet.next()) {
                int id = resultSet.getInt("id");
                String name = resultSet.getString("name");
                int age = resultSet.getInt("age");

                student = new Student();
                student.setId(id);
                student.setName(name);
                student.setAge(age);

                students.add(student);
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            JDBCUtil.release(resultSet, preparedStatement, connection);
        }

        return students;
    }

    @Override
    public void save(Student student) {
        Connection connection = null;
        PreparedStatement preparedStatement = null;
        ResultSet resultSet = null;
        String sql ="insert into student(name, age) values(?,?)";

        try {
            connection = JDBCUtil.getConnection();
            preparedStatement = connection.prepareStatement(sql);
            preparedStatement.setString(1, student.getName());
            preparedStatement.setInt(2, student.getAge());
            preparedStatement.executeUpdate();
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            JDBCUtil.release(resultSet, preparedStatement, connection);
        }
    }
}
```

原始的通过 JDBC 访问数据库太复杂，模板代码太大太冗余。

## Spring JdbcTemplate

### 引入依赖

```xml
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
```

### 配置文件 beans.xml

配置文件 `beans.xml`：

```xml
<?xml version="1.0" encoding="UTF-8"?>

<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
       http://www.springframework.org/schema/beans/spring-beans.xsd">

    <!-- 配置数据源 -->
    <bean id="dataSource" class="org.springframework.jdbc.datasource.DriverManagerDataSource">
        <property name="driverClassName" value="com.mysql.jdbc.Driver"/>
        <property name="username" value="root"/>
        <property name="password" value="1124chanshiyu"/>
        <property name="url" value="jdbc:mysql:///spring_data"/>
    </bean>

    <bean id="jdbcTemplate" class="org.springframework.jdbc.core.JdbcTemplate">
        <property name="dataSource" ref="dataSource"/>
    </bean>

    <bean id="studentDAO" class="com.chanshiyu.dao.impl.StudentDAOSpringJdbcImpl">
        <property name="jdbcTemplate" ref="jdbcTemplate"/>
    </bean>
</beans>
```

### 实现访问接口

实现访问接口 `StudentDAOSpringJdbcImpl`：

```java
@Data
public class StudentDAOSpringJdbcImpl implements StudentDAO {

    private JdbcTemplate jdbcTemplate;

    @Override
    public List<Student> query() {
        List<Student> students = new ArrayList<Student>();
        String sql = "select id, name, age from student";

        jdbcTemplate.query(sql, new RowCallbackHandler() {
            @Override
            public void processRow(ResultSet resultSet) throws SQLException {
                int id = resultSet.getInt("id");
                String name = resultSet.getString("name");
                int age = resultSet.getInt("age");

                Student student = new Student();
                student.setId(id);
                student.setName(name);
                student.setAge(age);

                students.add(student);
            }
        });

        return students;
    }

    @Override
    public void save(Student student) {
        String sql ="insert into student(name, age) values(?,?)";
        jdbcTemplate.update(sql, new Object[]{student.getName(), student.getAge()});
    }
}
```

### 测试用例

```java
public class StudentDAOSpringJdbcImplTest {

    private ApplicationContext ctx;

    private  StudentDAO studentDAO;

    @Before
    public void setup() {
        ctx = new ClassPathXmlApplicationContext("beans.xml");
        studentDAO = (StudentDAO) ctx.getBean("studentDAO");
    }

    @After
    public void tearDown() {
        ctx = null;
    }

    @Test
    public void queryTest() {
        List<Student> students = studentDAO.query();
        Assert.assertNotEquals(0, students.size());
    }

    @Test
    public void saveTest() {
        Student student = new Student();
        student.setName("chan");
        student.setAge(20);
        studentDAO.save(student);
    }
}
```

## Spring Data

### 引入依赖

```xml
<dependency>
    <groupId>org.springframework.data</groupId>
    <artifactId>spring-data-jpa</artifactId>
    <version>1.8.0.RELEASE</version>
</dependency>

<dependency>
    <groupId>org.hibernate</groupId>
    <artifactId>hibernate-entitymanager</artifactId>
    <version>4.3.6.Final</version>
</dependency>
```

### 配置文件 beans.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>

<beans  xmlns="http://www.springframework.org/schema/beans"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:context="http://www.springframework.org/schema/context"
        xmlns:tx="http://www.springframework.org/schema/tx"
        xmlns:jpa="http://www.springframework.org/schema/data/jpa"
        xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/data/jpa http://www.springframework.org/schema/data/jpa/spring-jpa-1.3.xsd
        http://www.springframework.org/schema/tx http://www.springframework.org/schema/tx/spring-tx-4.0.xsd
        http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context-4.0.xsd">

    <!-- 配置数据源 -->
    <bean id="dataSource" class="org.springframework.jdbc.datasource.DriverManagerDataSource">
        <property name="driverClassName" value="com.mysql.jdbc.Driver"/>
        <property name="username" value="root"/>
        <property name="password" value="1124chanshiyu"/>
        <property name="url" value="jdbc:mysql:///spring_boot"/>
    </bean>

    <!-- 配置EntityManagerFactory -->
    <bean id="entityManagerFactory" class="org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean">
        <property name="dataSource" ref="dataSource"/>
        <property name="jpaVendorAdapter">
            <bean class="org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter"/>
        </property>
        <property name="packagesToScan" value="com.chanshiyu"/>

        <property name="jpaProperties">
            <props>
                <prop key="hibernate.ejb.naming_strategy">org.hibernate.cfg.ImprovedNamingStrategy</prop>
                <prop key="hibernate.dialect">org.hibernate.dialect.MySQL5InnoDBDialect</prop>
                <prop key="hibernate.show_sql">true</prop>
                <prop key="hibernate.format_sql">true</prop>
                <prop key="hibernate.hbm2ddl.auto">update</prop>
            </props>
        </property>
    </bean>

    <!-- 配置事务管理器 -->
    <bean id="transactionManager" class="org.springframework.orm.jpa.JpaTransactionManager">
        <property name="entityManagerFactory" ref="entityManagerFactory"/>
    </bean>

    <!-- 配置支持注解的事务 -->
    <tx:annotation-driven transaction-manager="transactionManager"/>

    <!-- 配置spring data -->
    <jpa:repositories base-package="com.chanshiyu" entity-manager-factory-ref="entityManagerFactory"/>

    <context:component-scan base-package="com.chanshiyu"/>
</beans>
```

### 创建实体类

上面传统方式是先建数据表，这里是创建实体类后自动生成数据表，注意对比这里使用的是包装类型 `Integer` 而之前是基本类型 `int`。

```java
/**
 * 先创建实体类，再自动生成数据表
 */
@Entity
@Data
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(length = 20, nullable = false)
    private String name;

    @Column(length = 20, nullable = false)
    private Integer age;
}
```

### Repository

创建 `EmployeeRepository`：

```java
public interface EmployeeRepository extends Repository<Employee, Integer> {

    public Employee findByName(String name);
}
```

### 测试用例

```java
public class EmployeeRepositoryTest {

    private ApplicationContext ctx;

    private EmployeeRepository employeeRepository;

    @Before
    public void setup() {
        ctx = new ClassPathXmlApplicationContext("beans-new.xml");
        employeeRepository = ctx.getBean(EmployeeRepository.class);
    }

    @After
    public void tearDown() {
        ctx = null;
    }

    @Test
    public void findByNameTest() {
        Employee employee = employeeRepository.findByName("shiyu");
        Assert.assertNotNull(employee);
    }
}
```

### Repository Hierarchy

- CrudRepository
- PagingAndSortingRepository
- JpaRepository
