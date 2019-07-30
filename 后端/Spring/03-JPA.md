# JPA

JPA 即 Java 持久化 API（Java Persistence API），是一个用于映射 Java 对象和关系型数据库表的规范。此规范使得开发者可以不依赖特定数据库，也能很好地 CRUD（创建、读取、更新、删除）。

JPA 的三个组件：

- **实体（Entities）**：实体是普通 Java 对象（POJO）。
- **对象-关系型元数据（Object-relational metadata）**：开发者需要设定 Java 类和它们的属性与数据库中的表和列的映射关系。有两种设定方式：通过特定的配置文件建立映射；或者使用注解。
- **Java 持久化查询语句（Java Persistence Query Language - JPQL）**：JPA 旨在建立不依赖于特定的数据库的抽象层，所以它提供了一种专有查询语言来代替 SQL，即 JPQL。它提供了支持不同数据库方言的特性，使开发者实现查询逻辑时不需要考虑特定的数据库类型。

## 基础知识

### 持久化单元（Persistence Unit）

几乎所有与 JPA 交互的操作都是通过 EntityManager 完成的。要获得一个 EntityManager 的实例，首先需要创建一个 EntityManagerFactory 的实例。通常情况下在每个应用中的“持久化单元”只需要一个 EntityManagerFactory。持久化单元是通过数据库配置文件归集到一起的一组 JPA 类（不求甚解）。

```java
public class Main {
    private static final Logger LOGGER = Logger.getLogger("JPA");

    public static void main(String[] args) {
        Main main = new Main();
        main.run();
    }

    public void run() {
        EntityManagerFactory factory = null;
        EntityManager entityManager = null;
        try {
            factory = Persistence.createEntityManagerFactory("PersistenceUnit");
            entityManager = factory.createEntityManager();
            persistPerson(entityManager);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, e.getMessage(), e);
            e.printStackTrace();
        } finally {
            if (entityManager != null) {
                entityManager.close();
            }
            if (factory != null) {
                factory.close();
            }
        }
    }
}
```

### 事务（Transactions）

EntityManager 代表一个持久化单元，一个持久化单元就是一个缓存，用于存储那些数据库中所存储的各实体的状态。存储数据至数据库时，将它传递给 EntityManager，随后传递给下层的缓存。如果想在数据库中插入一条新数据，可以调用 EntityManager 的 `persist()` 方法。

```java
private void persistPerson(EntityManager entityManager) {
    EntityTransaction transaction = entityManager.getTransaction();
    try {
        transaction.begin();
        Person person = new Person();
        person.setFirstName("Homer");
        person.setLastName("Simpson");
        entityManager.persist(person);
        transaction.commit();
    } catch (Exception e) {
        if (transaction.isActive()) {
            transaction.rollback();
        }
    }
}
```

需要注意：调用 `persist()` 方法之前，需要调用 Transaction 对象的 `transaction.begin()` 方法开启一个新事务。调用`persist()` 方法后，需要提交事务，即发送数据到数据库并存储。如果有异常抛出，必须回滚之前开启的事务。由于只能回滚活动的事务，所以在回滚前需要检查当前事务是否已在运行，因为所发生的异常有可能是在调用 `transaction.begin()` 时发生的。

通过注解 `@Transactional` 实现事物回滚会更方便。在测试环境下，该注解不会向数据库插入测试数据，在生产环境下，则按照正常的逻辑回滚。

### 数据库表（Tables）

通过注解 `@Entity`，将类映射到数据库表：

```java
@Entity
@Table(name = "T_PERSON")
public class Person {
    private Long id;
    private String firstName;
    private String lastName;

    @Id
    @GeneratedValue
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @Column(name = "FIRST_NAME")
    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    @Column(name = "LAST_NAME")
    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
}
```

注解 `@Table` 是可选的，如果类名和数据表名不一致的情况下使用来指定表名。JPA 会为 Java 类中所有具有 setter 和 getter 方法的属性创建数据库列，唯一的例外是具有显式 `@Transient` 注解声明的属性。另外可以使用 `@Column` 注解提供的其它属性为每个列指定更多的信息：

```java
@Column(name = "FIRST_NAME", length = 100, nullable = false, unique = false)
```

上面示例：限制这个字符串长度为 100 个字符；该列不能包含空值（null）；不必是唯一的。如果试图将空值（null）作为 first name 插入数据库表的话，就会触发数据库约束冲突，进而导致当前事务回滚。

有两种方式使类属性与数据表字段建立映射关系：一是在属性的 getter 方法上添加 `@Column` 注解（如上所示）；二是直接在类属性上添加注解。但在同一个实体层次结构中必须保持同一种使用注解的方式，即一个实体及其子类中必须保证注解方式的一致性。

```java
@Entity
@Table(name = "T_PERSON")
public class Person {
    @Id
    @GeneratedValue
    private Long id;

    @Column(name = "FIRST_NAME")
    private String firstName;

    @Column(name = "LAST_NAME")
    private String lastName;
}
```

两种方式基本是等价的，唯一的不同是当需要在子类中覆写父类某些字段的注解时有区别。由于实体类可以继承，同时扩展其字段。如果在字段级别定义了 JPA 注解的话，就不能通过覆写它的对应 getter 方法来达到覆写它的目的。

## 序列（Sequences）

注解 `@GeneratedValue` 可以设置这个唯一值将会如何分配给每个实体。JPA 提供了如下三种不同的方法：

- **TABLE**：这种策略会创建一个单独的表，其中为每个实体保存一条记录。这条记录包含实体的名字和 id 列的当前值；每次有新的 id 值请求时，就更新此表中相应的行。
- **SEQUENCE**：如果数据库支持**序列**的话，这个策略可以通过数据库序列获得唯一值。
- **IDENTITY**：如果数据库支持**标识列**的话，这个策略就可以使用这种数据库原生支持的列。

TABLE 策略需要提供用来做序列管理的表的具体信息给 JPA 提供商：

```java
@Id
@GeneratedValue(strategy = GenerationType.TABLE, generator = "TABLE_GENERATOR")
@TableGenerator(name = "TABLE_GENERATOR", table="T_SEQUENCES", pkColumnName = "SEQ_NAME", valueColumnName = "SEQ_VALUE", pkColumnValue = "PHONE")
public Long getId() {
    return id;
}
```

注解 @TableGenerator 告诉 JPA 提供商这里设定的表名为 T_SEQUENCES、有两个列 SEQ_NAME 和 SEQ_VALUE。这个表中的这个序列的名字是 PHONE：

```bash
sql> select * from t_sequences;
SEQ_NAME | SEQ_VALUE
PHONE    | 1
```

SEQUENCE 策略使用：

```java
@Id
@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "S_PROJECT")
@SequenceGenerator(name = "S_PROJECT", sequenceName = "S_PROJECT", allocationSize = 100)
public Long getId() {
    return id;
}
```

使用注解 @SequenceGenerator，告诉 JPA 提供商使用到的序列名是 S_PROJECT，指定了分配大小（这里是 100），即有多少值应预先分配。属性 generator 和 name 用来关联这两个注解。这个策略使用的是一个单独的表，当系统中有大量序列值请求时，它很容易成为性能瓶颈，因此 JPA 支持预定义大小，以使不用频繁请求数据库。

DENTITY 策略，只需设置相应的 strategy 属性：

```java
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
public Long getId() {
    return id;
}
```

如果当前数据库支持**标识列**的话，对应的表就会创建如下：

```sql
create table T_ID_CARD (
    id bigint generated by default as identity,
    ID_NUMBER varchar(255),
    ISSUE_DATE timestamp,
    VALID integer,
    primary key (id)
)
```

参考文章：  
[JPA 入门教程 – 终极指南](https://www.javacodegeeks.com/2015/04/jpa%E5%85%A5%E9%97%A8%E6%95%99%E7%A8%8B.html#relationships_onetoone)
