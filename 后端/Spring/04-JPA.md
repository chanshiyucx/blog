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

有两种方式使类属性与数据表字段建立映射关系：一是在属性的 getter 方法上添加 `@Column` 注解（如上所示）；二是直接在类属性上添加注解。

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

在同一个实体层次结构中必须保持同一种使用注解的方式，即一个实体及其子类中必须保证注解方式的一致性。但可以使用注解 `@Access` 来指明这一个特定的子类使用了另一种不同的注解方式来注解其字段和方法。

```java
@Entity
@Table(name = "T_GEEK")
@Access(AccessType.PROPERTY)
public class Geek extends Person {}
```

上面示例告诉 JPA 这个类在方法层面使用注解，即使它的父类有可能在字段层面使用了注解。

## 继承（Inheritance）

实体类可以继承，这里新建子类 Geek 继承上例的 Person，并添加一个新字段：

```java
@Entity
@Table(name = "T_GEEK")
public class Geek extends Person {
    private String favouriteProgrammingLanguage;
    private List<Project> projects = new ArrayList<Project>();

    @Column(name = "FAV_PROG_LANG")
    public String getFavouriteProgrammingLanguage() {
            return favouriteProgrammingLanguage;
    }

    public void setFavouriteProgrammingLanguage(String favouriteProgrammingLanguage) {
        this.favouriteProgrammingLanguage = favouriteProgrammingLanguage;
    }
}
```

这样会让两个实体共用一张表，并新增名为 DTYPE 的列用于存储标志位，标识存储的是 Person 还是 Geek，示例如下：

```
DTYPE  | ID | FIRST_NAME | LAST_NAME | FAV_PROG_LANG
Person | 1  | Homer      | Simpson   | null
Geek   | 2  | Gavin      | Coffee    | Java
Geek   | 3  | Thomas     | Micro     | C#
Geek   | 4  | Christian  | Cup       | Java
```

当然也可以通过注解更改名字和类型，如下：

```java
@DiscriminatorColumn(name="PERSON_TYPE", discriminatorType = DiscriminatorType.INTEGER)
```

之后数据表结构更新为：

```
PERSON_TYPE | ID | FIRST_NAME | LAST_NAME | FAV_PROG_LANG
-1907849355 | 1  | Homer      | Simpson   | null
2215460     | 2  | Gavin      | Coffee    | Java
2215460     | 3  | Thomas     | Micro     | C#
2215460     | 4  | Christian  | Cup       | Java
```

并不是在所有情况下你都会想在同一张表中存储所有不同类型的实体数据，特别是当不同的实体类型含有很多的不同列时。因此 JPA 允许指定如何布局不同的列，有三种选项可供选择：

- **SINGLE_TABLE**：这种策略映射所有的类到一个单一的表。其结果是，每一行都含有所有类型的所有列；如果有空列的话，数据库就需要额外的存储空间。另一方面来看这种策略所带来的优点是：所有的查询都不需要使用连接，从而可以更快的运行。
- **JOINED**：这种策略为每种类型创建一个单独的表。因此每个表只包含它所映射的实体的状态。加载实体时，JPA 需要从当前实体映射的所有表中加载相应的数据。这种方法减少了存储空间，但从另一方面来看它引入了连接查询，这会显著降低查询速度。
- **TABLE_PER_CLASS**: 和 JOINED 策略类似，这个策略为每种实体类型创建单独的表。但与 JOINED 策略相反的是，这些表包含了所有与当前实体相关的信息。因此加载这些实体时不需要引入连接查询，但它带来的新问题是：在不知道具体的子类时，需要使用另外的 SQL 查询来确定它的信息。

要更改实现类使用策略，只需要在**基类**中添加注解：

```java
@Inheritance(strategy = InheritanceType.JOINED)
```

## 实体关系（Relationships）

除了子类和其父类之间的扩展关系（extends）外，不同实体间也存在各种模型关系，JPA 为建模中涉及到的实体/表提供了多种关系：

- `OneToOne`：在这种关系中每个实体只含有一个明确的对其它实体的引用；反之亦然。
- `OneToMany/ManyToOne`：在这种关系中，一个实体可以有多个子实体，每个子实体只属于一个父实体。
- `ManyToMany`：在这种关系中，一种类型的多个实体，可以含有其它类型实体的多个引用。
- `Embedded`：在这种关系中，其它实体是和其父实体存储在同一个表中（即，每一个表都有两个实体）。
- `ElementCollection`：这种关系类似于 OneToMany 关系，但不同的是，它的引用实体是 Embedded 实体。这样就可以在简单对象上定义 OneToMany 关系，而不必定义在另外的表中使用的“普通” Embedded 关系。

### 一对一（OneToOne）

以上例 Person 实体为例，每个 Person 都有一个身份卡，现在新添加一个实体 IdCard：

```java
@Entity
@Table(name = "T_ID_CARD")
public class IdCard {
    private Long id;
    private String idNumber;
    private Date issueDate;

    @Id
    @GeneratedValue
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @Column(name = "ID_NUMBER")
    public String getIdNumber() {
        return idNumber;
    }

    public void setIdNumber(String idNumber) {
        this.idNumber = idNumber;
    }

    @Column(name = "ISSUE_DATE")
    @Temporal(TemporalType.TIMESTAMP)
    public Date getIssueDate() {
        return issueDate;
    }

    public void setIssueDate(Date issueDate) {
        this.issueDate = issueDate;
    }
}
```

Tips：**可以使用注解 `@Temporal` 告诉 JPA 如何序列化 Date 信息到数据库中。根据底层数据库产品的不同，这个列映射为一个相应的日期/时间戳类型。这个注解的可能值是：TIMESTAMP, TIME 和 DATE**。

然后在 Person 实体中添加新字段引用 IdCard：

```java
@Entity
@Table(name = "T_PERSON")
public class Person {
    private IdCard idCard;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_CARD_ID")
    public IdCard getIdCard() {
        return idCard;
    }
}
```

可以定义何时加载 IDCard 的实体，在注解 `@OneToOne` 中增加属性 fetch：

```java
@OneToOne(fetch = FetchType.EAGER)
@OneToOne(fetch = FetchType.LAZY)
```

- `FetchType.EAGER` 是默认值，它表示每次加载一个 Person 时也要同时加载 IdCard。
- `FetchType.LAZY` 设置其加载方式为当通过 person.getIdCard() 访问时才加载它。

必须谨慎使用懒加载，因为在加载很多 person 数据时它会导致数以百计的额外的查询请求，而且要牢记需要单独加载每个 IDCard。

### 一对多（OneToMany）

以上例 Person 实体为例，每个 Person 都有一个或多个手机，现在新添加一个实体 Phone：

```java
@Entity
@Table(name = "T_PHONE")
public class Phone {
    private Long id;
    private String number;
    private Person person;

    @Id
    @GeneratedValue
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @Column(name = "NUMBER")
    public String getNumber() {
        return number;
    }

    public void setNumber(String number) {
        this.number = number;
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PERSON_ID")
    public Person getPerson() {
        return person;
    }

    public void setPerson(Person person) {
        this.person = person;
    }
}
```

Phone 上指明一个 `@ManyToOne` 的关系，因为一个 Person 可能拥有多个 Phone。注解 `@JoinColumn` 用于指明表 T_PHONE 中用来存储对应 Person 表外键的列。

此外，需要在 Person 中添加一个 Phone 对象的集合（List），并且在它的 getter 方法上加上注解 `@OneToMany`，因为一个 Person 可能拥有多个 Phone：

```java
@Entity
@Table(name = "T_PERSON")
public class Person {
    private List<Phone> phones = new ArrayList<>();

    @OneToMany(mappedBy = "person", fetch = FetchType.LAZY)
    public List<Phone> getPhones() {
        return phones;
    }
}
```

属性 mappedBy 的值告诉 JPA 这个注解在关系的另一端（这里是 Phone.person）所引用的集合。在 OneToMany 的模式下，`FetchType.LAZY` 是默认值。

### 多对多（ManyToMany）

一个 Geek 可以加入很多项目（Project）而且一个 Project 包含着很多 Geek，所以建模 Project 和 Geek 之间关系时设定为 `@ManyToMany`。

```java
@Entity
@Table(name = "T_PROJECT")
public class Project {
    private Long id;
    private String title;
    private List<Geek> geeks = new ArrayList<Geek>();

    @Id
    @GeneratedValue
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @Column(name = "TITLE")
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    @ManyToMany(mappedBy="projects")
    public List<Geek> getGeeks() {
        return geeks;
    }

    public void setGeeks(List<Geek> geeks) {
        this.geeks = geeks;
    }
}
```

属性 mappedBy 的值告诉 JPA 这个关系的另一端关联的类的成员。类 Geek 如下获取 Project 集合：

```java
private List<Project> projects = new ArrayList<>();

@ManyToMany
@JoinTable(
        name="T_GEEK_PROJECT",
        joinColumns={@JoinColumn(name="GEEK_ID", referencedColumnName="ID")},
        inverseJoinColumns={@JoinColumn(name="PROJECT_ID", referencedColumnName="ID")})
public List<Project> getProjects() {
    return projects;
}
```

每个 ManyToMany 关系都需要一个额外的表。这个额外的表需要注解为 `@JoinTable`，其内容在于描述用来存储 Geek 和不同 Project 的关联的表的具体信息。此处表名为 GEEK_PROJECT，其列 GEEK_ID 用于存储 geek 的 id，其列 PROJECT_ID 用于存储 project 的 id。Geek 和 Project 的关联引用列都是 ID。

关系 `@ManyToMany` 通常也是按照默认方式进行懒加载，因为在大部分情况下，不希望在加载某个单独 Geek 时同时加载它对应的所有 Project 信息。

`@ManyToMany` 关系在两边的设置是对等的，需要在两个类中进行对调的对集合引用的注解。

### Embedded / ElementCollection

假设需要比数据库模型更加精细的构建 Java 模型。例如：建模一个 Period 类，用来指代在开始和结束日期之间的时间。然后，在每个需要建模 Period 时间的实体内，都可以重用 Period 类，这样也就避免了在每个实体内拷贝这两个类字段 startDate 和 endDate。

基于这种情形，JPA 提供了嵌入式建模实体的功能。这些实体作为独立的 Java 类建模，同时注解为 `@Embeddable`：

```java
@Embeddable
public class Period {
    private Date startDate;
    private Date endDate;

    @Column(name ="START_DATE")
    public Date getStartDate() {
        return startDate;
    }

    public void setStartDate(Date startDate) {
        this.startDate = startDate;
    }

    @Column(name ="END_DATE")
    public Date getEndDate() {
        return endDate;
    }

    public void setEndDate(Date endDate) {
        this.endDate = endDate;
    }
}
```

然后这个实体可以被 Project 实体引用：

```java
private Period projectPeriod;

@Embedded
public Period getProjectPeriod() {
    return projectPeriod;
}

public void setProjectPeriod(Period projectPeriod) {
    this.projectPeriod = projectPeriod;
}
```

引用 Peroid 实体后，Hibernate 会在表 T_PROJECT 中创建两个列 START_DATE 和 END_DATE：

```sql
create table T_PROJECT (
    id bigint generated by default as identity,
    END_DATE timestamp,
    START_DATE timestamp,
    projectType varchar(255),
    TITLE varchar(255),
    primary key (id)
)
```

从 JPA v2.0 开始甚至可以在一对多关系中使用 `@Embeddable` 实体，主要借助于两个新的注解 `@ElementCollection` 和 `@CollectionTable`。由于 Peroid 是一个 `@Embeddable` 实体，这里不能直接使用普通的 `@OneToMany` 关系。下面看看 Project 类中示例代码：

```java
private List<Period> billingPeriods = new ArrayList<Period>();

@ElementCollection
@CollectionTable(
        name="T_BILLING_PERIOD",
        joinColumns=@JoinColumn(name="PROJECT_ID")
)
public List<Period> getBillingPeriods() {
    return billingPeriods;
}

public void setBillingPeriods(List<Period> billingPeriods) {
    this.billingPeriods = billingPeriods;
}
```

## 数据类型和转换器（Converters）

下表展示了 Java 类型是如何映射到不同的数据库类型的：

| Java type                                                                            | Database type                              |
| ------------------------------------------------------------------------------------ | ------------------------------------------ |
| String (char, char[])                                                                | VARCHAR (CHAR, VARCHAR2, CLOB, TEXT)       |
| Number (BigDecimal, BigInteger, Integer, Double, Long, Float, Short, Byte)           | NUMERIC (NUMBER, INT, LONG, FLOAT, DOUBLE) |
| int, long, float, double, short, byte                                                | NUMERIC (NUMBER, INT, LONG, FLOAT, DOUBLE) |
| byte[]                                                                               | VARBINARY (BINARY, BLOB)                   |
| boolean (Boolean)                                                                    | BOOLEAN (BIT, SMALLINT, INT, NUMBER)       |
| java.util.Date, java.sql.Date, java.sql.Time, java.sql.Timestamp, java.util.Calendar | TIMESTAMP (DATE, DATETIME)                 |
| java.lang.Enum                                                                       | NUMERIC (VARCHAR, CHAR)                    |
| java.util.Serializable                                                               | VARBINARY (BINARY, BLOB)                   |

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
[JPA 入门教程 – 终极指南](https://www.javacodegeeks.com/2015/04/jpa%E5%85%A5%E9%97%A8%E6%95%99%E7%A8%8B.html)
