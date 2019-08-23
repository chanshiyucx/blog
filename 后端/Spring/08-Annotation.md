# Annotation

记录项目中常见的一些注解。

## Lombok

### @Builder

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
