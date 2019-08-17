## 传统方式访问数据库 JDBC

- Connection
- Statement
- ResultSet
- Test Case

### 创建项目并添加依赖

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
create database spring_boot;

use spring_boot;

create table student (
  id int not null auto_increment,
  name varchar(32) not null,
  age int not null,
  primary key(id)
);

insert into student (name, age) values ("张三", 22);
```

### 开发 JDBCUtil 工具类

配置文件 `db.properties`：

```properties
jdbc.url = jdbc:mysql:///spring_boot
jdbc.user = root
jdbc.password = 1124chanshiyu
jdbc.dirverClass = com.mysql.jdbc.Driver
```

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

### 实现 DAO

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
