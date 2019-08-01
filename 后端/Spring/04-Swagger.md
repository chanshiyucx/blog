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
    name: Chanshiyu
    url: https://chanshiyu.com/
    email: me@chanshiyu.com
```

## 配置类

```java
/**
 * conf.SwaggerConfig.java
 * @Configuration 告诉 Spring Boot 需要加载这个配置类
 * @EnableSwagger2 启用 Swagger2
 */
@Configuration
@EnableSwagger2
@ConditionalOnClass(EnableSwagger2.class)
@Data
@Component
@ConfigurationProperties(prefix = "swagger")
public class SwaggerConfig {

    /**
     * API页面标题
     */
    private String title;

    /**
     * API描述
     */
    private String description;

    /**
     * API版本号
     */
    private String version;

    /**
     * API接口包路径
     */
    private String basePackage;

    /**
     * 服务条款地址
     */
    private String termsOfServiceUrl;

    /**
     * 联系人
     */
    private Contact contact;

    @Bean
    public Docket api() {
        return new Docket(DocumentationType.SWAGGER_2)
                .apiInfo(apiInfo())
                .select()
                .apis(RequestHandlerSelectors.basePackage(basePackage))
                .paths(PathSelectors.any())
                .build();
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

```java
@Api(tags = "买家商品", description = "买家商品相关 Rest API")
public class BuyerOrderController {
    @ApiOperation(value="订单详情")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "openid", value = "买家 openid", required = true, dataType = "String"),
            @ApiImplicitParam(name = "orderId", value = "订单 ID", required = true, dataType = "String")
    })
    @GetMapping("/detail")
    public ResultVO<OrderDTO> detail(@RequestParam("openid") String openid,
                                     @RequestParam("orderId") String orderId) {
        OrderDTO orderDTO = buyerService.findOrderOne(openid, orderId);
        return ResultVOUtil.success(orderDTO);
    }
}
```

```java
/**
 * 商品信息
 */
@Data
@ApiModel("商品类目详情")
public class ProductVO {

    @ApiModelProperty("类目名称")
    @JsonProperty("name")
    private String categoryName;

    @ApiModelProperty("类目类型")
    @JsonProperty("type")
    private Integer categoryType;

    @ApiModelProperty("商品列表")
    @JsonProperty("list")
    private List<ProductInfoVO> productInfoVOList;
}
```

启动项目访问路径查看文档：`http://192.168.51.242:8080/swagger-ui.html#/`。

参考文章：  
[在 Spring Boot 项目中使用 Swagger 文档](https://www.ibm.com/developerworks/cn/java/j-using-swagger-in-a-spring-boot-project/index.html)
