# Spring Boot 跨域解决方式

要解释跨域，先要了解同源策略，所谓同源策略就是在浏览器端出于安全考量，向服务端发起请求必须满足：**协议相同、Host（ip）相同、端口相同**，否则访问将被禁止，该访问也就被称为跨域访问。

## 跨域访问解决方案

### 前端解决

前端一些资源引用的标签不受同源策略的限制：

- html 的 script 标签
- html 的 link 标签
- html 的 img 标签
- html 的 iframe 标签

### 使用代理

实际上对跨域访问的支持在服务端实现起来更加容易，最常用的方法就是通过代理的方式，如：

- nginx 或 haproxy 代理跨域
- nodejs 中间件代理跨域

代理跨域的原理：就是在不同的资源服务如 js 资源、html 资源、css 资源、接口数据资源服务的前端搭建一个中间层，所有的浏览器及客户端访问都通过代理转发。所以在浏览器、客户端看来，它们访问的都是同一个 ip、同一个端口的资源，从而符合同源策略实现跨域访问。

### CORS

跨域资源共享（CORS）：通过修改 Http 协议 header 的方式，实现跨域。说的简单点就是，通过设置 HTTP 的响应头信息，告知浏览器哪些情况在不符合同源策略的条件下也可以跨域访问，浏览器通过解析 Http 协议中的 Header 执行具体判断。具体的 Header 如下：

CROS 跨域常用 header：

- `Access-Control-Allow-Origin`：允许哪些 ip 或域名可以跨域访问
- `Access-Control-Max-Age`：表示在多少秒之内不需要重复校验该请求的跨域访问权限
- `Access-Control-Allow-Methods`：表示允许跨域请求的 HTTP 方法，如：GET、POST、PUT、DELETE
- `Access-Control-Allow-Headers`：表示访问请求中允许携带哪些 Header 信息，如：`Accept`、`Accept-Language`、`Content-Language`、`Content-Type`

## SpringBoot 下实现 CORS 的四种方式

SpringBoot 下常用四种实现 CORS 的方法，两种是全局配置，两种是局部接口生效的配置。一般来说，SpringBoot 项目采用其中一种方式实现 CORS 即可。

### 使用 CorsFilter 进行全局跨域配置

```java
@Configuration
public class CorsConfig {

      /**
     * 允许跨域调用的过滤器
     */
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        // 允许所有域名进行跨域调用
        config.addAllowedOrigin("*");
        // 允许跨越发送cookie
        config.setAllowCredentials(true);
        // 允许所有请求方法跨域调用
        config.addAllowedMethod("*");
        // 放行全部原始头信息
        config.addAllowedHeader("*");
        // 添加映射路径，“/**” 表示对所有的路径实行全局跨域访问权限的设置
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }

}
```

### 重写 WebMvcConfigurer

重写 `WebMvcConfigurer` 的 `addCorsMappings` 方法实现全局跨域配置：

```java
@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")      // 添加映射路径，“/**”表示对所有的路径实行全局跨域访问权限的设置
                        .allowedOrigins("*")    // 允许所有域名进行跨域调用
                        .allowCredentials(true) // 允许跨越发送cookie
                        .allowedMethods("*")    // 允许所有请求方法跨域调用
                        .allowedHeaders("*")    // 放行全部原始头信息
                        .exposedHeaders("*");   // 暴露哪些头部信息（因为跨域访问默认不能获取全部头部信息）
            }
        };
    }

}
```

### 使用 CrossOrigin 注解

使用 `CrossOrigin` 注解实现局部跨域配置：

- 将 `CrossOrigin` 注解加在 `Controller` 层的方法上，该方法定义的 `RequestMapping` 端点将支持跨域访问
- 将 `CrossOrigin` 注解加在 `Controller` 层的类定义处，整个类所有的方法对应的 `RequestMapping` 端点都将支持跨域访问

```java
@RequestMapping("/cors")
@ResponseBody
@CrossOrigin(origins = "*", maxAge = 3600)
public String cors( ){
    return "cors";
}
```

### 使用 HttpServletResponse

使用 HttpServletResponse 设置响应头实现局部跨域配置，此方式略显繁琐，不建议使用：

```java
@RequestMapping("/cors")
@ResponseBody
public String cors(HttpServletResponse response){
    // 使用HttpServletResponse定义HTTP请求头，最原始的方法也是最通用的方法
    response.addHeader("Access-Control-Allow-Origin", "*");
    return "cors";
}
```
