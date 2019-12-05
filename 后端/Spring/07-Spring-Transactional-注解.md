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

参考文章：  
[透彻的掌握 Spring 中 @transactional 的使用](https://www.ibm.com/developerworks/cn/java/j-master-spring-transactional-use/index.html)
