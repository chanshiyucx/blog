# Spring Transactional 注解

事务管理是应用系统开发中必不可少的一部分。Spring 为事务管理提供了丰富的功能支持。

Spring 事务管理分为编码式和声明式的两种方式。编程式事务指的是通过编码方式实现事务；声明式事务基于 AOP，将具体业务逻辑与事务处理解耦。声明式事务管理使业务代码逻辑不受污染， 因此在实际使用中声明式事务用的比较多。声明式事务有两种方式，一种是在配置文件（xml）中做相关的事务规则声明，另一种是基于 `@Transactional` 注解的方式。

## 开启事务

使用 `@Transactional` 注解管理事务的实现步骤分为两步：

- `@EnableTransactionManagement` 注解开启事务
- `@Transactional` 注解添加到方法上

`@Transactional` 注解的属性信息：

| 属性名          | 说明                                                                                                 |
| --------------- | ---------------------------------------------------------------------------------------------------- |
| name            | 当在配置文件中有多个 `TransactionManager`，可以用该属性指定选择哪个事务管理器。                      |
| propagation     | 事务的传播行为，默认值为 `REQUIRED`。                                                                |
| isolation       | 事务的隔离度，默认值采用 `DEFAULT`。                                                                 |
| timeout         | 事务的超时时间，默认值为 -1。如果超过该时间限制但事务还没有完成，则自动回滚事务。                    |
| read-only       | 指定事务是否为只读事务，默认值为 false；为了忽略那些不需要事务的方法，可以设置 `read-only` 为 true。 |
| rollback-for    | 用于指定能够触发事务回滚的异常类型，如果有多个异常类型需要指定，各类型之间可以通过逗号分隔。         |
| no-rollback-for | 抛出 `no-rollback-for` 指定的异常类型，不回滚事务。                                                  |

`@Transactional` 注解也可以添加到类级别上。当把 `@Transactional` 注解放在类级别时，表示所有该类的公共方法都配置相同的事务属性信息。当类和方法上同时配置了事务属性，则优先以方法级别的事务属性信息来管理事务。

## 事务实现机制

在应用系统调用声明 `@Transactional` 的目标方法时，Spring Framework 默认使用 AOP 代理，在代码运行时生成一个代理对象，根据 `@Transactional` 的属性配置信息，这个代理对象决定该声明 `@Transactional` 的目标方法是否由拦截器 `TransactionInterceptor` 来使用拦截，在 `TransactionInterceptor` 拦截时，会在在目标方法开始执行之前创建并加入事务，并执行目标方法的逻辑， 最后根据执行情况是否出现异常，利用抽象事务管理器 `AbstractPlatformTransactionManager` 操作数据源 DataSource 提交或回滚事务。

![事务实现机制](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/Spring-Transactional-注解/事务实现机制.jpg)

## 注意事项

### 正确设置 propagation 属性

需要注意下面三种 propagation 可以不启动事务。本来期望目标方法进行事务管理，但若是错误的配置这三种 propagation，事务将不会发生回滚。

- `TransactionDefinition.PROPAGATION_SUPPORTS`：如果当前存在事务，则加入该事务；如果当前没有事务，则以非事务的方式继续运行。
- `TransactionDefinition.PROPAGATION_NOT_SUPPORTED`：以非事务方式运行，如果当前存在事务，则把当前事务挂起。
- `TransactionDefinition.PROPAGATION_NEVER`：以非事务方式运行，如果当前存在事务，则抛出异常。

### 正确设置 rollbackFor 属性

默认情况下，如果在事务中抛出了未检查异常（继承自 RuntimeException 的异常）或者 Error，则 Spring 将回滚事务；除此之外，Spring 不会回滚事务。如果在事务中抛出其他类型的异常，并期望 Spring 能够回滚事务，可以指定 rollbackFor。例：

```java
@Transactional(propagation= Propagation.REQUIRED,rollbackFor= MyException.class)
```

此外，若在目标方法中抛出的异常是 rollbackFor 指定的异常的子类，事务同样会回滚。

### public 方法才有效

** 只有 `@Transactional` 注解应用到 public 方法，才能进行事务管理。** 若不是 public，就不会获取 `@Transactional` 的属性配置信息，最终会造成不会用 `TransactionInterceptor` 来拦截该目标方法进行事务管理。

### 避免 AOP 自调用

在 Spring 的 AOP 代理下，只有目标方法由外部调用，目标方法才由 Spring 生成的代理对象来管理，这会造成自调用问题。若同一类中的其他没有 `@Transactional` 注解的方法内部调用有 `@Transactional` 注解的方法，有 `@Transactional` 注解的方法的事务被忽略，不会发生回滚。

### 错误使用

> 对声明式事务管理，Spring 提供了基于 Transactional 注解的实现方式，使用简单，减少了很多复杂的配置。但是，正因为它的简单，很多开发人员在使用的时候，随手就是一个 `@Transactional`，以为这样就把事务的问题解决了，何不知这样的使用方式很可能留下了很大的性能隐患。

当下对数据库连接的使用基本上都用连接池技术，每个应用会根据环境和自身需求设置一些合适的连接池配置，如果每个连接都一直被长时间占用，会导致数据库连接数不够用、系统各项压力指标不断攀升、系统缓慢等问题，所以说连接池中的每一个连接都是很昂贵的。那么问题就来了，**只要需要事务就需要占用一个数据库连接**，如果在需要开启事务的方法里进行一些 IO 操作、网络通讯等需要长时间处理的操作，这个数据库连接就一直被占用着，直到方法执行结束后自动提交事务或执行过程中发生异常回滚事务，这个数据库连接才会被释放掉。这个过程中还有一个很可怕的问题，如果在需要开启事务的方法里进行了网络通讯操作，而这个操作没有设置网络超时时间，那这个数据库连接就会被一直占用着。上述问题，在流量很大的情况下简直就是灾难，会直接导致应用系统挂掉。

综上，正确的使用 `@Transactional` 注解要做到如下三点：

1. 不要在类上标注 `Transactional` 注解，要在需要的方法上标注。即使类的每个方法都需要事务也不要在类上标注，因为有可能你或别人新添加的方法根本不需要事务。
2. 标注了 `Transactional` 注解的方法体中不要涉及耗时很久的操作，如 IO 操作、网络通信等。
3. 根据业务需要设置合适的事务参数，如是否需要新事务、超时时间等。

## TransactionalEventListener

在项目中，往往需要执行数据库操作后，发送消息或事件来异步调用其他组件执行相应的操作，例如：用户注册后发送激活码、配置修改后发送更新事件等。但是，数据库的操作如果还未完成，此时异步调用的方法查询数据库发现没有数据，这就会出现问题。例如下面这个可能存在问题的栗子：

```java
void saveUser(User u) {
    //保存用户信息
    userDao.save(u);
    //触发保存用户事件
    applicationContext.publishEvent(new SaveUserEvent(u.getId()));
}

@EventListener
void onSaveUserEvent(SaveUserEvent event) {
    //获取事件中的信息（用户id）
    Integer id = event.getEventData();
    //查询数据库，获取用户（此时如果用户还未插入数据库，则返回空）
    User u = userDao.getUserById(id);
    //这里可能报空指针异常！
    String phone = u.getPhoneNumber();
    MessageUtils.sendMessage(phone);
}
```

为了解决上述问题，Spring 为我们提供了两种方式：

1. `@TransactionalEventListener` 注解
2. 事务同步管理器 `TransactionSynchronizationManager`

### @TransactionalEventListener

```java
@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
void onSaveUserEvent(SaveUserEvent event) {
    Integer id = event.getEventData();
    User u = userDao.getUserById(id);
    String phone = u.getPhoneNumber();
    MessageUtils.sendMessage(phone);
}
```

这样，只有当前事务提交之后，才会执行事件监听器的方法。其中参数 phase 默认为 `AFTER_COMMIT`，共有四个枚举：`BEFORE_COMMIT`、`AFTER_COMMIT`、`AFTER_ROLLBACK`、`AFTER_COMPLETION`。

### TransactionSynchronizationManager

```java
@EventListener
void onSaveUserEvent(SaveUserEvent event) {
    TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronizationAdapter() {
        @Override
        public void afterCommit() {
            Integer id = event.getEventData();
            User u = userDao.getUserById(id);
            String phone = u.getPhoneNumber();
            MessageUtils.sendMessage(phone);
        }
    });
}
```

参考文章：  
[透彻的掌握 Spring 中 @Transactional 的使用](https://www.ibm.com/developerworks/cn/java/j-master-spring-transactional-use/index.html)  
[Spring 事务注解 Transactional 的正确使用姿势](https://juejin.im/post/5a76961a6fb9a063417b0488)  
[TransactionalEventListener 注解](https://www.jianshu.com/p/6f9cc1384cdf)
