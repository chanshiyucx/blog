# Lombok

记录 Lombok 中常见的一些注解。

## @Builder

Java 建造者模式：

```java
@Data
public class User {
    private Integer id;
    private String name;
    private String address;

    private User() {
    }

    private User(User origin) {
        this.id = origin.id;
        this.name = origin.name;
        this.address = origin.address;
    }

    public static class Builder {
        private User target;

        public Builder() {
            this.target = new User();
        }

        public Builder id(Integer id) {
            target.id = id;
            return this;
        }

        public Builder name(String name) {
            target.name = name;
            return this;
        }

        public Builder address(String address) {
            target.address = address;
            return this;
        }

        public User build() {
            return new User(target);
        }
    }
}
```

使用方式：

```java
User user = new User.Builder().id(1).name("shiyu").address("chan").build();
```

使用 `@Builder` 注解可以很方便实现建造者模式：

```java
@Data
@Builder
public class User {
    private Integer id;
    private String name;
    private String address;
}
```

使用方式：

```java
User user = User.builder().id(1).name("shiyu").address("chan").build();
```

如果属性字段有默认值，需要加上 `@Builder.Default` 注解：

```java
@Builder.Default
private String name = "shiyu1";
```

## @AllArgsConstructor、@NoArgsConstructor、@RequiredArgsConstructor(staticName = "of")

如果要给实体类生成构造方法：

- `@AllArgsConstructor` 用来指定全参数构造器
- `@NoArgsConstructor` 用来指定无参数构造器
- `@RequiredArgsConstructor` 给所有带有 `@NonNull` 注解的或者带有 `final` 修饰的成员变量生成对应的构造方法，使用静态方法调用

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
@RequiredArgsConstructor(staticName = "of")
public class User {
    private Integer id;
    private String name;
    @NonNull private String address;
}
```

使用方式：

```java
User user1 =new User(); // 无参构造器
User user2 =new User(1, "shiyu", "chan"); // 全参构造器
User user3 = User.of("chan"); // `@NonNull` 和 `final` 参数构造器
```

使用 `@RequiredArgsConstructor(onConstructor = @__(@Autowired))` 注解可以给所有 `private final` 字段提供自动注入。

## @Accessors

使用 `@Accessors(chain = true)` 注解实现链式调用：

```java
@Data
@Accessors(chain = true)
public class User {
    private Integer id;
    private String name;
    private String address;
}
```

使用方式：

```java
User user = new User().setId(2).setName("shiyu").setAddress("chan");
```

也可以配合上面的 `@RequiredArgsConstructor` 使用：

```java
@Data
@Accessors(chain = true)
@RequiredArgsConstructor(staticName = "of")
public class User {
    private Integer id;
    private String name;
    @NonNull private String address;
}
```

使用方式：

```java
User user = User.of("chan").setId(2).setName("shiyu");
```

## @Data

`@Data` 注解是 `@ToString`、`@EqualsAndHashCode`、`@Getter`、`@Setter` 和 `@RequiredArgsConstructor` 注解的集合。代替 `RequiredArgsConstructor` 使用时：

```java
@Data
@Data(staticConstructor="of")
public class User {
    private Integer id;
    private String name;
    @NonNull private String address;
}
```

## @NonNull

注解在属性上，会自动产生一个关于此参数的非空检查，如果参数为空，则抛出一个空指针异常。

## @Cleanup

这个注解用在变量前面，可以保证此变量代表的资源会被自动关闭，默认是调用资源的 `close()` 方法，如果该资源有其它关闭方法，可使用 `@Cleanup(“methodName”)` 来指定要调用的方法，也会生成默认的构造方法

```java
public static void main(String[] args) throws IOException {

    @Cleanup InputStream in = new FileInputStream(args[0]);
}
```

## @ToString(callSuper = true)

解决子类 `toString` 方法不打印父类属性：

```java
@ToString(callSuper = true)
```
