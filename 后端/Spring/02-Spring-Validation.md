# Spring Validation

Spring 为了给开发者提供便捷，对 hibernate validation 进行了二次封装，显示校验 validated bean 时，可以使用 spring validation 或者 hibernate validation。

## 注解

JSR 提供的校验注解：

| 注解                        | 说明                                                     |
| --------------------------- | -------------------------------------------------------- |
| @Null                       | 被注释的元素必须为 null                                  |
| @NotNull                    | 被注释的元素必须不为 null                                |
| @AssertTrue                 | 被注释的元素必须为 true                                  |
| @AssertFalse                | 被注释的元素必须为 false                                 |
| @Min(value)                 | 被注释的元素必须是一个数字，其值必须大于等于指定的最小值 |
| @Max(value)                 | 被注释的元素必须是一个数字，其值必须小于等于指定的最大值 |
| @DecimalMin(value)          | 被注释的元素必须是一个数字，其值必须大于等于指定的最小值 |
| @DecimalMax(value)          | 被注释的元素必须是一个数字，其值必须小于等于指定的最大值 |
| @Size(max=, min=)           | 被注释的元素的大小必须在指定的范围内                     |
| @Digits (integer, fraction) | 被注释的元素必须是一个数字，其值必须在可接受的范围内     |
| @Past                       | 被注释的元素必须是一个过去的日期                         |
| @Future                     | 被注释的元素必须是一个将来的日期                         |
| @Pattern(regex=,flag=)      | 被注释的元素必须符合指定的正则表达式                     |

Hibernate Validator 提供的校验注解：

| 注解                       | 说明                                   |
| -------------------------- | -------------------------------------- |
| @NotBlank()                | 验证字符串非 null，且长度必须大于 0    |
| @Email                     | 被注释的元素必须是电子邮箱地址         |
| @Length(min=,max=)         | 被注释的字符串的大小必须在指定的范围内 |
| @NotEmpty                  | 被注释的字符串的必须非空               |
| @Range(min=,max=,message=) | 被注释的元素必须在合适的范围内         |

首先定义 validated bean：

```java
@Data
public class User {

    @NotBlank(message = "用户名不能为空")
    private String name;

    @Min(value = 20, message = "年龄不能小于20")
    private Integer age;

    @NotBlank(message = "住址不能为空")
    private String address;

    @Email(message = "邮箱格式错误")
    private String eamil;

    @Pattern(regexp = "^1(3|4|5|7|8)\\d{9}$",message = "手机号码格式错误")
    @NotBlank(message = "手机号码不能为空")
    private String telphone;
}
```

在 Controller 中使用：

- @Validated：可以用在类型、方法和方法参数上。但是不能用在成员属性（字段）上，且提供分组功能
- @Valid：可以用在方法、构造函数、方法参数和成员属性（字段）上

```java
@RestController
@Slf4j
public class UserController {

    @PostMapping("/register")
    public void register(@Valid @RequestBody User user, BindingResult bindingResult) {
        if(bindingResult.hasErrors()) {
            log.error("【注册用户】参数不正确，user={}, msg={}", user, bindingResult.getFieldError().getDefaultMessage());
        }
    }
}
```

如果有多个参数需要校验，形式可以如下，即一个校验类对应一个校验结果：

```java
foo(@Validated Foo foo, BindingResult fooBindingResult ，@Validated Bar bar, BindingResult barBindingResult);
```

## 分组校验

如果同一个类，在不同的使用场景下有不同的校验规则，那么可以使用分组校验。

```java
@Data
public class User {

    @Min(value = 20, message = "年龄不能小于20", groups = {Adult.class})
    private Integer age;

    public interface Adult{}

    public interface Minor{}
}
```

在 Controller 中使用，注意使用分组功能必须使用 `@Validated` 注解：

```java
@RestController
@Slf4j
public class UserController {

    @PostMapping("/drink")
    public void drink(@Validated({User.Adult.class}) @RequestBody User user, BindingResult bindingResult) {
        if(bindingResult.hasErrors()) {
            log.error("参数不正确，user={}, msg={}", user, bindingResult.getFieldError().getDefaultMessage());
        }
    }

    @PostMapping("/live")
    public void live(@Validated @RequestBody User user, BindingResult bindingResult) {
        if(bindingResult.hasErrors()) {
            log.error("参数不正确，user={}, msg={}", user, bindingResult.getFieldError().getDefaultMessage());
        }
    }
}
```

## 验证方式

### 验证请求体

验证请求体（RequestBody），需要验证的参数上加上了 `@Valid` 注解，如果验证失败，它将抛出 `MethodArgumentNotValidException`。默认情况下，Spring 会将此异常转换为 HTTP Status 400（错误请求）。

Controller：

```java
@RestController
@RequestMapping("/api")
public class PersonController {

    @PostMapping("/person")
    public ResponseEntity<Person> getPerson(@RequestBody @Valid Person person) {
        return ResponseEntity.ok().body(person);
    }
}
```

ExceptionHandler：

```java
@ControllerAdvice(assignableTypes = {PersonController.class})
public class GlobalExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(
            MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
    }
}
```

### 验证请求参数

**一定一定不要忘记在类上加上 `Validated` 注解了，这个参数可以告诉 Spring 去校验方法参数。**

Controller：

```java
@RestController
@RequestMapping("/api")
@Validated
public class PersonController {

    @GetMapping("/person/{id}")
    public ResponseEntity<Integer> getPersonByID(@Valid @PathVariable("id") @Max(value = 5,message = "超过 id 的范围了") Integer id) {
        return ResponseEntity.ok().body(id);
    }

    @PutMapping("/person")
    public ResponseEntity<String> getPersonByName(@Valid @RequestParam("name") @Size(max = 6,message = "超过 name 的范围了") String name) {
        return ResponseEntity.ok().body(name);
    }
}
```

ExceptionHandler：

```java
@ControllerAdvice(assignableTypes = {PersonController.class})
public class GlobalExceptionHandler {
    @ExceptionHandler(ConstraintViolationException.class)
    ResponseEntity<String> handleConstraintViolationException(ConstraintViolationException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
    }
}
```

### 验证 Service 方法

此外还可以验证任何 Spring 组件的输入，而不是验证控制器级别的输入，我们可以使用 `@Validated` 和 `@Valid` 注释的组合来实现这一需求。

**一定一定不要忘记在类上加上 Validated 注解了，这个参数可以告诉 Spring 去校验方法参数。**

```java
@Service
@Validated
public class PersonService {

    public void validatePerson(@Valid Person person){
        // do something
    }
}
```

## 自定义 Validator

### 验证枚举值

主要实现：

- `Flag`
- `FlagValidator`

```java
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Constraint(validatedBy = FlagValidator.class)
public @interface Flag {
    String[] value() default {};

    String message() default "flag is not found";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
```

```java
public class FlagValidator implements ConstraintValidator<Flag, Integer> {
    private String[] values;

    @Override
    public void initialize(Flag flag) {
        this.values = flag.value();
    }

    @Override
    public boolean isValid(Integer value, ConstraintValidatorContext constraintValidatorContext) {
        boolean isValid = false;
        if (value == null) {
            // 当状态为空时使用默认值
            return true;
        }
        for (String val : values) {
            if (val.equals(String.valueOf(value))) {
                isValid = true;
                break;
            }
        }
        return isValid;
    }
}
```

使用：

```java
@ApiModelProperty(value = "是否进行显示", required = true)
@Flag(value = {"0","1"}, message = "显示状态不正确")
private Integer showStatus;
```

### 验证范围值

需求：Person 类有一个 region 字段，region 字段只能是 China、China-Taiwan、China-HongKong 这三个中的一个。

```java
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Constraint(validatedBy = RegionValidator.class)
public @interface Region {
    String[] value() default {};

    String message() default "Region 值不在可选范围内";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
```

```java
public class RegionValidator implements ConstraintValidator<Region, String> {

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        HashSet<Object> regions = new HashSet<>();
        regions.add("China");
        regions.add("China-Taiwan");
        regions.add("China-HongKong");
        return regions.contains(value);
    }
}
```

使用：

```java
@Region
private String region;
```

### 校验电话号码

```java
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Constraint(validatedBy = PhoneNumberValidator.class)
public @interface PhoneNumber {
    String[] value() default {};

    String message() default "Invalid phone number";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
```

```java
public class PhoneNumberValidator implements ConstraintValidator<PhoneNumber,String> {

    @Override
    public boolean isValid(String phoneField, ConstraintValidatorContext context) {
        if (phoneField == null) {
            // can be null
            return true;
        }
        return phoneField.matches("^1(3[0-9]|4[57]|5[0-35-9]|8[0-9]|70)\\d{8}$") && phoneField.length() > 8 && phoneField.length() < 14;
    }
}
```

使用：

```java
@PhoneNumber(message = "phoneNumber 格式不正确")
@NotNull(message = "phoneNumber 不能为空")
private String phoneNumber;
```

参考文章：  
[使用 spring validation 完成数据后端校验](https://www.cnkirito.moe/spring-validation/)  
[spring-bean-validation](https://github.com/Snailclimb/springboot-guide/blob/master/docs/advanced/spring-bean-validation.md)
