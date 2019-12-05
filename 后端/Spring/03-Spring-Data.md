# Spring Data

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
        InputStream inputStream = JDBCUtil.class.getClassLoader().getResourceAsStream("db.properties");
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

### 创建实体类和仓储

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
        ctx = new ClassPathXmlApplicationContext("beans.xml");
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

### Repository 查询方法定义规则

Repository 类的定义：

```java
public interface Repository<T, ID extends Serializable> {}
```

Repository 是一个空接口，也是标记接口，即没有任何方法声明的接口。继承这个接口后就会被纳入 spring 管理。

除了使用继承方式外，还可以使用注解：

```java
@RepositoryDefinition(domainClass = Employee.class, idClass = Integer.class)
public interface EmployeeRepository {

    public Employee findByName(String name);
}
```

Repository 子接口：

- CrudRepository：继承 Repository，实现 CRUD 相关方法
- PagingAndSortingRepository：继承 CrudRepository，实现分页排序相关方法
- JpaRepository：继承 CrudRepository，实现 JPA 相关方法

Repository 查询方法定义规则：

![Spring Data 查询方法定义规则](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/Spring-Data/spring_data_jpa.jpg)

示例：

```java
public interface EmployeeRepository extends Repository<Employee, Integer> {

    // where name like ?% and age <?
    public List<Employee> findByNameStartingWithAndAgeLessThan(String name, Integer age);

    // where name like %? and age <?
    public List<Employee> findByNameEndingWithAndAgeLessThan(String name, Integer age);

    // where name in (?, ?...) or age <?
    public List<Employee> findByNameInOrAgeLessThan(List<String> names, Integer age);
}
```

对于按照方法命名规则来使用的话，有弊端：

1. 方法名会比较长：约定大于配置
2. 对于一些复杂的查询，很难实现

### Query 注解

不需要遵循查询方法命名规则。

```java
public interface EmployeeRepository extends Repository<Employee, Integer> {

    // 找出 id 最大的员工
    @Query("select o from Employee o where id=(select max(id) from Employee t1)")
    public Employee getEmployeeByMaxId();

    // 查询参数占位符
    @Query("select o from Employee o where o.name=?1 and o.age=?2")
    public List<Employee> getEmployeeByNameAndAge1(String name, Integer age);

    // 查询参数命名参数
    @Query("select o from Employee o where o.name=:name and o.age=:age")
    public List<Employee> getEmployeeByNameAndAge2(@Param("name")String name, @Param("age")Integer age);

    // 模糊查询
    @Query("select o from Employee o where o.name like %?1%")
    public List<Employee> getEmployeeByNameLike(String name);

    @Query("select o from Employee o where o.name like %:name%")
    public List<Employee> getEmployeeByNameLike1(@Param("name")String name);

    // 查询记录总数，这里 employee 是表名
    @Query(nativeQuery = true, value = "select count(1) from employee")
    public long getCount();

    // 更新 age，注解 @Modifying 需要和 @Transactional 配合使用
    @Modifying
    @Query("update Employee o set o.age = :age where o.id = :id")
    public void updateAgeById(@Param("id")Integer id,@Param("age")Integer age);
}
```

排序：

```java
Sort.Order order = new Sort.Order(Sort.Direction.DESC, "id");
Sort sort = new Sort(order);
PageRequest pageRequest = new PageRequest(0, 10, sort);
Page<Employee> employeePage = employeeJpaRepository.findAll(pageRequest);
```

### JpaSpecificationExecutor

Srping Data 中 Repository 可以多继承，实现更复杂的查询：

```java
public interface EmployeeJpaRepository extends JpaRepository<Employee, Integer>, JpaSpecificationExecutor<Employee> {}
```

示例，找出 age > 22 的员工分页列表，且按 id 降序排序：

```java
@Test
public void sortTest() {
    Specification<Employee> specification = new Specification<Employee>() {
        @Override
        public Predicate toPredicate(Root<Employee> root, CriteriaQuery<?> criteriaQuery, CriteriaBuilder criteriaBuilder) {
            Path path = root.get("age");
            return criteriaBuilder.gt(path, 22);
        }
    };

    Sort.Order order = new Sort.Order(Sort.Direction.DESC, "id");
    Sort sort = new Sort(order);
    PageRequest pageRequest = new PageRequest(0, 10, sort);
    Page<Employee> employeePage = employeeJpaRepository.findAll(specification, pageRequest);
}
```
