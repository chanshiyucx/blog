# Swagger

Swagger 提供了一套通过代码和注解自动生成文档的方法。

## 添加依赖

```xml
<!-- 自动生成描述 API 的 json 文件 -->
<dependency>
    <groupId>io.springfox</groupId>
    <artifactId>springfox-swagger2</artifactId>
    <version>2.9.2</version>
</dependency>

<!-- 将 json 文件解析出来，用一种更友好的方式呈现 -->
<dependency>
    <groupId>io.springfox</groupId>
    <artifactId>springfox-swagger-ui</artifactId>
    <version>2.9.2</version>
</dependency>
```

## 配置参数

```yml
swagger:
  title: API标题
  description: API描述
  version: 1.0.0
  terms-of-service-url: https://chanshiyu.com/
  base-package: com.chanshiyu
  contact:
    name: 蝉時雨
    url: https://chanshiyu.com/
    email: me@chanshiyu.com
```

## 配置类

`@Profile({"dev", "test"})` 只在开发和测试环境启用 swagger。

```java
@Profile({"dev", "test"})
@Configuration
@EnableSwagger2
@Data
@ConfigurationProperties(prefix = "swagger")
public class SwaggerConfig {

    /** API页面标题 */
    private String title;

    /** API描述 */
    private String description;

    /** API版本号 */
    private String version;

    /** API接口包路径 */
    private String basePackage;

    /** 服务条款地址 */
    private String termsOfServiceUrl;

    /** 联系人 */
    private Contact contact;

    @Bean
    public Docket api() {
        return new Docket(DocumentationType.SWAGGER_2)
                .apiInfo(apiInfo())
                .select()
                .apis(RequestHandlerSelectors.basePackage(basePackage))
                .paths(PathSelectors.any())
                .build()
                // 添加登录认证
                .securitySchemes(securitySchemes())
                .securityContexts(securityContexts());
    }

    private ApiInfo apiInfo() {
        return new ApiInfoBuilder()
                .title(title)
                .description(description)
                .termsOfServiceUrl(termsOfServiceUrl)
                .version(version)
                .contact(contact)
                .build();
    }

    private List<ApiKey> securitySchemes() {
        // 设置请求头信息
        List<ApiKey> result = new ArrayList<>();
        ApiKey apiKey = new ApiKey("Authorization", "Authorization", "header");
        result.add(apiKey);
        return result;
    }

    private List<SecurityContext> securityContexts() {
        // 设置需要登录认证的路径
        List<SecurityContext> result = new ArrayList<>();
        result.add(getContextByPath("/.*"));
        return result;
    }

    private SecurityContext getContextByPath(String pathRegex){
        return SecurityContext.builder()
                .securityReferences(defaultAuth())
                .forPaths(PathSelectors.regex(pathRegex))
                .build();
    }

    private List<SecurityReference> defaultAuth() {
        AuthorizationScope authorizationScope = new AuthorizationScope("global", "accessEverything");
        AuthorizationScope[] authorizationScopes = new AuthorizationScope[1];
        authorizationScopes[0] = authorizationScope;
        List<SecurityReference> result = new ArrayList<>();
        result.add(new SecurityReference("Authorization", authorizationScopes));
        return result;
    }

}
```

## 使用

| 注解名称           | 使用说明               |
| ------------------ | ---------------------- |
| @Api               | 描述一个 API 类        |
| @ApiImplicitParam  | 描述一个请求参数       |
| @ApiImplicitParams | 描述一组请求参数       |
| @ApiModel          | 描述一个返回的对象     |
| @ApiModelProperty  | 描述一个返回的对象参数 |
| @ApiOperation      | 描述一个 API 方法      |
| @ApiParam          | 描述一个方法的参数     |
| @ApiResponse       | 描述一个请求响应       |
| @ApiResponses      | 描述一组请求响应       |
| @ApiIgnore         | 表示忽略               |

`ApiImplicitParam` 与 `ApiParam` 的区别：

- 对 Servlets 或者非 JAX-RS 的环境，只能使用 `ApiImplicitParam`。
- 在使用上，`ApiImplicitParam` 比 `ApiParam` 具有更少的代码侵入性，只要写在方法上就可以了，但是需要提供具体的属性才能配合 swagger ui 解析使用。
- `ApiParam` 只需要较少的属性，与 swagger ui 配合更好。

```java
@RestController
@RequestMapping("/user")
@Api(tags = "1.0.0-SNAPSHOT", description = "用户管理", value = "用户管理")
@Slf4j
public class UserController {

    @GetMapping("/list")
    @ApiOperation(value = "类目列表", notes = "类目列表")
    public List<User> list(@ApiParam("页码") @RequestParam(value = "pageNum", defaultValue = "1") Integer pageNum,
                           @ApiParam("每页数量") @RequestParam(value = "pageSize", defaultValue = "10") Integer pageSize) {
        return new ArrayList<>();
    }

    @GetMapping
    @ApiOperation(value = "条件查询（DONE）", notes = "备注")
    @ApiImplicitParams({@ApiImplicitParam(name = "username", value = "用户名", dataType = DataType.STRING, paramType = ParamType.QUERY, defaultValue = "xxx")})
    public ApiResponse<User> getByUserName(String username) {
        log.info("多个参数用  @ApiImplicitParams");
        return ApiResponse.<User>builder().code(200)
                .message("操作成功")
                .data(new User(1, username, "JAVA"))
                .build();
    }

    @GetMapping("/{id}")
    @ApiOperation(value = "主键查询（DONE）", notes = "备注")
    @ApiImplicitParams({@ApiImplicitParam(name = "id", value = "用户编号", dataType = DataType.INT, paramType = ParamType.PATH)})
    public ApiResponse<User> get(@PathVariable Integer id) {
        log.info("单个参数用  @ApiImplicitParam");
        return ApiResponse.<User>builder().code(200)
                .message("操作成功")
                .data(new User(id, "u1", "p1"))
                .build();
    }

    @DeleteMapping("/{id}")
    @ApiOperation(value = "删除用户（DONE）", notes = "备注")
    @ApiImplicitParam(name = "id", value = "用户编号", dataType = DataType.INT, paramType = ParamType.PATH)
    public void delete(@PathVariable Integer id) {
        log.info("单个参数用 ApiImplicitParam");
    }

    @PostMapping
    @ApiOperation(value = "添加用户（DONE）")
    public User post(@RequestBody User user) {
        log.info("如果是 POST PUT 这种带 @RequestBody 的可以不用写 @ApiImplicitParam");
        return user;
    }

    @PostMapping("/multipar")
    @ApiOperation(value = "添加用户（DONE）")
    public List<User> multipar(@RequestBody List<User> user) {
        log.info("如果是 POST PUT 这种带 @RequestBody 的可以不用写 @ApiImplicitParam");
        return user;
    }

    @PostMapping("/array")
    @ApiOperation(value = "添加用户（DONE）")
    public User[] array(@RequestBody User[] user) {
        log.info("如果是 POST PUT 这种带 @RequestBody 的可以不用写 @ApiImplicitParam");
        return user;
    }

    @PutMapping("/{id}")
    @ApiOperation(value = "修改用户（DONE）")
    public void put(@PathVariable Long id, @RequestBody User user) {
        log.info("如果你不想写 @ApiImplicitParam 那么 swagger 也会使用默认的参数名作为描述信息 ");
    }

    @PostMapping("/{id}/file")
    @ApiOperation(value = "文件上传（DONE）")
    public String file(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        log.info(file.getContentType());
        log.info(file.getName());
        log.info(file.getOriginalFilename());
        return file.getOriginalFilename();
    }

}
```

```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ApiModel(value = "通用PI接口返回", description = "Common Api Response")
public class ApiResponse<T> implements Serializable {

    private static final long serialVersionUID = -8987146499044811408L;
    /**
     * 通用返回状态
     */
    @ApiModelProperty(value = "通用返回状态", required = true)
    private Integer code;
    /**
     * 通用返回信息
     */
    @ApiModelProperty(value = "通用返回信息", required = true)
    private String message;
    /**
     * 通用返回数据
     */
    @ApiModelProperty(value = "通用返回数据", required = true)
    private T data;

}
```

启动项目访问路径查看文档：`http://192.168.51.242:8080/swagger-ui.html#/`。

## Cannot resolve configuration property

解决步骤：

- 添加依赖 `spring-boot-configuration-processor` 依赖
- 添加 `src/main/resources/META-INF/spring-configuration-metadata.json` 文件

首先添加 `spring-boot-configuration-processor` 依赖：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-configuration-processor</artifactId>
    <optional>true</optional>
</dependency>
```

之后添加 `src/main/resources/META-INF/spring-configuration-metadata.json` 文件：

```json
{
  "properties": [
    {
      "name": "swagger.title",
      "type": "java.lang.String"
    },
    {
      "name": "swagger.description",
      "type": "java.lang.String"
    },
    {
      "name": "swagger.version",
      "type": "java.lang.String"
    },
    {
      "name": "swagger.terms-of-service-url",
      "type": "java.lang.String"
    },
    {
      "name": "swagger.base-package",
      "type": "java.lang.String"
    },
    {
      "name": "swagger.contact.name",
      "type": "java.lang.String"
    },
    {
      "name": "swagger.contact.url",
      "type": "java.lang.String"
    },
    {
      "name": "swagger.contact.email",
      "type": "java.lang.String"
    }
  ]
}
```

参考文章：  
[在 Spring Boot 项目中使用 Swagger 文档](https://www.ibm.com/developerworks/cn/java/j-using-swagger-in-a-spring-boot-project/index.html)
