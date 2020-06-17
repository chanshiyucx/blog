# Java 枚举

> 本文为个人学习摘要笔记。  
> 原文地址：[恕我直言，我怀疑你没怎么用过枚举](https://juejin.im/post/5e702e66f265da5770144f22)

## 为什么需要枚举

相比于使用接口或者常量类，枚举具有**一个明确性的约束**。

```java
public class VideoStatus {
    public static final int Draft = 1; //草稿
    public static final int Review = 2; //审核
    public static final int Published = 3; //发布
}

void judgeVideoStatus(int status) {
    // status 可以为任意值，编译器也不会提出任何警告
}
```

但是在枚举类型出现之后，上面这种情况就可以用枚举严谨地去约束，比如用枚举去定义视频状态就非常简洁了：

```java
public enum VideoStatus {
    Draft, Review, Published
}

void judgeVideoStatus(VideoStatus status) {
    // status 有明确类型约束，编译器会检查从而规避潜在问题
}
```

## 枚举的所有基本用法

以后台管理系统中用户角色枚举为例：

```java
public enum UserRole {
    ROLE_ROOT_ADMIN,  // 系统管理员
    ROLE_ORDER_ADMIN, // 订单管理员
    ROLE_NORMAL       // 普通用户
}
```

枚举的所有基本用法：

```java
// values()方法：返回所有枚举常量的数组集合
for (UserRole role : UserRole.values()) {
    System.out.println(role);
}
// ROLE_ROOT_ADMIN
// ROLE_ORDER_ADMIN
// ROLE_NORMAL

UserRole role1 = UserRole.ROLE_ROOT_ADMIN;
UserRole role2 = UserRole.ROLE_ORDER_ADMIN;
UserRole role3 = UserRole.ROLE_NORMAL;

// ordinal()方法：返回枚举常量的序数，注意从0开始
System.out.println(role1.ordinal()); // 0
System.out.println(role2.ordinal()); // 1
System.out.println(role3.ordinal()); // 2

// compareTo()方法：枚举常量间的比较
System.out.println(role1.compareTo(role2)); // -1
System.out.println(role2.compareTo(role3)); // -1
System.out.println(role1.compareTo(role3)); // -2

// name()方法：获得枚举常量的名称
System.out.println(role1.name()); // ROLE_ROOT_ADMIN
System.out.println(role2.name()); // ROLE_ORDER_ADMIN
System.out.println(role3.name()); // ROLE_NORMAL

// valueOf()方法：返回指定名称的枚举常量
System.out.println(UserRole.valueOf("ROLE_ROOT_ADMIN")); // ROLE_ROOT_ADMIN
System.out.println(UserRole.valueOf("ROLE_ORDER_ADMIN")); // ROLE_ORDER_ADMIN
System.out.println(UserRole.valueOf("ROLE_NORMAL")); // ROLE_NORMAL
```

除此之外，枚举还可以用于 switch 语句中，而且意义更加明确：

```java
UserRole userRole = UserRole.ROLE_ORDER_ADMIN;
switch (userRole) {
    case ROLE_ROOT_ADMIN:  // 比如此处的意义就非常清晰了，比1，2，3这种数字好！
        System.out.println("这是系统管理员角色");
        break;
    case ROLE_ORDER_ADMIN:
        System.out.println("这是订单管理员角色");
        break;
    case ROLE_NORMAL:
        System.out.println("这是普通用户角色");
        break;
}
```

## 自定义扩充枚举

```java
public enum UserRole {
    ROLE_ROOT_ADMIN("系统管理员", 100000),
    ROLE_ORDER_ADMIN("订单管理员", 200000),
    ROLE_NORMAL("普通用户", 300000),
    ;

    // 以下为自定义属性
    private String roleName;  // 角色名称

    private Integer roleCode; // 角色编码

    // 以下为自定义构造函数
    UserRole(String roleName, Integer roleCode) {
        this.roleName = roleName;
        this.roleCode = roleCode;
    }

    // 以下为自定义方法
    public String getRoleName() {
        return this.roleName;
    }

    public Integer getRoleCode() {
        return this.roleCode;
    }

    public static Integer getRoleCodeByRoleName(String roleName) {
        for (UserRole enums : UserRole.values()) {
            if (enums.getRoleName().equals(roleName)) {
                return enums.getRoleCode();
            }
        }
        return null;
    }

}
```

## 枚举 + 接口

```java
// 定义接口
public interface RoleOperation {

    String op();  // 表示某个角色可以做哪些op操作

}

// 枚举实现接口
public enum UserRole implements RoleOperation {

    // 系统管理员(有A操作权限)
    ROLE_ROOT_ADMIN {
        @Override
        public String op() {
            return "ROLE_ROOT_ADMIN:" + " has AAA permission";
        }
    },

    // 订单管理员(有B操作权限)
    ROLE_ORDER_ADMIN {
        @Override
        public String op() {
            return "ROLE_ORDER_ADMIN:" + " has BBB permission";
        }
    },

    // 普通用户(有C操作权限)
    ROLE_NORMAL {
        @Override
        public String op() {
            return "ROLE_NORMAL:" + " has CCC permission";
        }
    }

}

void test {
    UserRole role1 = UserRole.ROLE_ROOT_ADMIN;
    UserRole role2 = UserRole.ROLE_ORDER_ADMIN;
    UserRole role3 = UserRole.ROLE_NORMAL;
    System.out.println(role1.op()); // ROLE_ROOT_ADMIN: has AAA permission
    System.out.println(role2.op()); // ROLE_ORDER_ADMIN: has BBB permission
    System.out.println(role3.op()); // ROLE_NORMAL: has CCC permission
}
```

## 设计模式

### 单例模式

```java
public class Singleton {
    // 构造函数私有化，避免外部创建实例
    private Singleton() {}

    //定义一个内部枚举
    public enum SingletonEnum {

        SEED;  // 唯一一个枚举对象，我们称它为“种子选手”！

        private Singleton singleton;

        SingletonEnum() {
            singleton = new Singleton(); //真正的对象创建隐蔽在此！
        }

        public Singleton getInstance() {
            return singleton;
        }
    }

    // 故意外露的对象获取方法，也是外面获取实例的唯一入口
    public static Singleton getInstance() {
        return SingletonEnum.SEED.getInstance();
    }

}
```

### 策略模式

```java
public class Test {

    public enum Calculator {

        ADDITION {
            public Double execute(Double x, Double y) {
                return x + y; // 加法
            }
        },

        SUBTRACTION {
            public Double execute(Double x, Double y) {
                return x - y; // 减法
            }
        },

        MULTIPLICATION {
            public Double execute(Double x, Double y) {
                return x * y; // 乘法
            }
        },


        DIVISION {
            public Double execute(Double x, Double y) {
                return x / y;  // 除法
            }
        };

        // 可以定义一个接口
        public abstract Double execute(Double x, Double y);

    }

    public static void main(String[] args) {
        System.out.println(Calculator.ADDITION.execute(4.0, 2.0)); // 6.0
        System.out.println(Calculator.SUBTRACTION.execute(4.0, 2.0)); // 2.0
        System.out.println(Calculator.MULTIPLICATION.execute(4.0, 2.0)); // 8.0
        System.out.println(Calculator.DIVISION.execute(4.0, 2.0)); // 2.0
    }

}
```

## 枚举集合类

JDK5.0 中在增加 Enum 类的同时，也增加了两个工具类 `EnumSet` 和 `EnumMap`，这两个类都放在 java.util 包中。

### EnumSet

`EnumSet` 是专门为盛放枚举类型所设计的 Set 类型。依旧以角色枚举为例，比如系统里来了一批人，我们需要查看他是不是某个角色中的一个：

```java
// 判断某个进来的用户是不是管理员
Boolean isAdmin(UserRole role) {
    // 定义一个管理员角色的专属集合
    EnumSet<UserRole> userRoles
            = EnumSet.of(
            UserRole.ROLE_ROOT_ADMIN,
            UserRole.ROLE_ORDER_ADMIN
    );
    return userRoles.contains(role);
}
```

也可以进行范围遍历：

```java
for(UserRole role : EnumSet.range(UserRole.ROLE_ROOT_ADMIN, UserRole.ROLE_ORDER_ADMIN)) {
    System.out.println(role);
}
```

### EnumMap

`EnumMap` 则是用来专门盛放枚举类型为 key 的 Map 类型。同上举例，系统里来了一批人，需要统计每个角色的人数：

```java
Map<UserRole, Integer> userStatisticMap = new EnumMap<>(UserRole.class);
for (User user : userList) {
    userStatisticMap.merge(user.getUserRole(), 1, Integer::sum);
}
```

扩展阅读：  
[Java 语言中 Enum 类型的使用介绍](https://www.ibm.com/developerworks/cn/java/j-lo-enum/index.html)
