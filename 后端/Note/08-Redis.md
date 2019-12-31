# Redis

## 引入

- pom.xml 引入相关依赖
- 资源文件对 redis 进行配置

引入依赖：

```xml
<dependency>
    <groupId>org.apache.commons</groupId>
    <artifactId>commons-pool2</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

配置文件：

```yml
spring:
  redis:
    database: 0 # 数据库索引（默认为 0）
    host: 127.0.0.1 # 服务器地址
    port: 6379 # 服务器连接端口
    password: # 服务器连接密码（默认为空）
    timeout: 15000 # 连接超时时间（毫秒）
    jedis:
      pool:
        max-active: 8 # 连接池最大连接数（负数表示没有限制）
        max-wait: -1 # 连接池最大阻塞等待时间（负数表示没有限制）
        max-idle: 8 # 连接池最大空闲连接
        min-idle: 0 # 连接池最小空闲连接
```

配置类：

```java
@EnableCaching
@Configuration
@AutoConfigureAfter(RedisAutoConfiguration.class)
public class RedisConfig {

    /**
     * 配置自定义redisTemplate
     * @param redisConnectionFactory
     * @return
     */
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory redisConnectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(redisConnectionFactory);

        // StringRedisSerializer序列化和反序列化redis的key值
        template.setKeySerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());
        // Jackson2JsonRedisSerializer序列化和反序列化redis的value值
        template.setValueSerializer(jackson2JsonRedisSerializer());
        template.setHashValueSerializer(jackson2JsonRedisSerializer());
        template.afterPropertiesSet();
        return template;
    }

    /**
     * json序列化
     * @return
     */
    @Bean
    @SuppressWarnings("unchecked")
    public RedisSerializer<Object> jackson2JsonRedisSerializer() {
        Jackson2JsonRedisSerializer serializer = new Jackson2JsonRedisSerializer(Object.class);

        ObjectMapper mapper = new ObjectMapper();
        mapper.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY);
        mapper.enableDefaultTyping(ObjectMapper.DefaultTyping.NON_FINAL);
        serializer.setObjectMapper(mapper);
        return serializer;
    }

    /**
     * 配置缓存管理器
     * @param redisConnectionFactory
     * @return
     */
    @Bean
    public CacheManager cacheManager(RedisConnectionFactory redisConnectionFactory) {
        // 生成一个默认配置，通过config对象即可对缓存进行自定义配置
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig();
        // 设置缓存的默认过期时间，也是使用Duration设置
        config = config.entryTtl(Duration.ofMinutes(1))
                // 设置key为string序列化
                .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                // 设置value为json序列化
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(jackson2JsonRedisSerializer()))
                // 不缓存空值
                .disableCachingNullValues();

        // 设置一个初始化的缓存空间set集合
        Set<String> cacheNames = new HashSet<>();
        cacheNames.add("timeGroup");
        cacheNames.add("user");

        // 对每个缓存空间应用不同的配置
        Map<String, RedisCacheConfiguration> configMap = new HashMap<>();
        configMap.put("timeGroup", config);
        configMap.put("user", config.entryTtl(Duration.ofSeconds(120)));

        // 使用自定义的缓存配置初始化一个cacheManager
        return RedisCacheManager.builder(redisConnectionFactory)
                .initialCacheNames(cacheNames)
                .withInitialCacheConfigurations(configMap)
                .build();
    }

}
```

注解说明：

- `@Configuration` 代表这个类是一个配置类
- `@AutoConfigureAfter(RedisAutoConfiguration.class)` 是让这个配置类在内置的配置类之后在配置，这样就保证我们的配置类生效，并且不会被覆盖配置。

[RedisUtil](https://github.com/whvcse/RedisUtil/blob/master/RedisUtil.java) 工具类：

```java
@SuppressWarnings("unchecked")
@Component
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class RedisUtil {

    private final RedisTemplate redisTemplate;

    //=============================common============================

    /**
     * 指定缓存失效时间
     * @param key 键
     * @param time 时间(秒)
     * @return boolean
     */
    public boolean expire(String key, long time) {
        try {
            if(time > 0) {
                redisTemplate.expire(key, time, TimeUnit.SECONDS);
            }
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 根据key获取过期时间
     * @param key 键 不能为null
     * @return 时间(秒) 返回0代表为永久有效
     */
    public long getExpire(String key) {
        return redisTemplate.getExpire(key, TimeUnit.SECONDS);
    }

    /**
     * 判断key是否存在
     * @param key 键
     * @return true存在 false不存在
     */
    public boolean hasKey(String key) {
        try {
            return redisTemplate.hasKey(key);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 删除缓存
     * @param key 可以传一个值 或多个
     */
    public void del(String ...key){
        if(key != null && key.length > 0){
            if (key.length == 1) {
                redisTemplate.delete(key[0]);
            } else {
                redisTemplate.delete(CollectionUtils.arrayToList(key));
            }
        }
    }

    //============================String=============================

    /**
     * 普通缓存获取
     * @param key 键
     * @return 值
     */
    public Object get(String key) {
        return key == null ? null : redisTemplate.opsForValue().get(key);
    }

    /**
     * 普通缓存放入
     * @param key 键
     * @param value 值
     * @return true成功 false失败
     */
    public boolean set(String key, Object value) {
        try {
            redisTemplate.opsForValue().set(key, value);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 普通缓存放入并设置时间
     * @param key 键
     * @param value 值
     * @param time 时间(秒) time要大于0 如果time小于等于0 将设置无限期
     * @return true成功 false 失败
     */
    public boolean set(String key, Object value, long time) {
        try {
            if(time > 0) {
                redisTemplate.opsForValue().set(key, value, time, TimeUnit.SECONDS);
            } else {
                set(key, value);
            }
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

}
```

## Tips

### 计数增减

错误用法：

```java
// 读取登录已失败次数
String redisKey = String.format(RedisAttributes.LOGIN_FAILED_COUNT, username);
String redisVal = redisService.get(redisKey);
int count = redisVal == null ? 0 : Integer.parseInt(redisVal);
// 失败五次进行封号处理，否则将失败次数加一
if (count + 1 < MAX_LOGIN_FAILED_COUNT) {
    redisService.set(redisKey, String.valueOf(count + 1));
} else {
    /* ... */
    // 删除redis缓存
    redisService.del(redisKey);
}
```

正确用法：

```java
// 读取登录已失败次数
Long count = redisService.incr(redisKey);
// 失败五次进行封号处理
if (count + 1 > MAX_LOGIN_FAILED_COUNT) {
    Users user = new Users();
    user.setId(db.getId());
    user.setState(AccountStatusAttributes.disabled);
    this.usersService.update(user);
    // 删除redis缓存
    redisService.del(redisKey);
}
```

### 模糊查询

```java
/**
    * 获取所有支付订单
    * @return
    */
public List<PayOrderBean> getAllOrder() {
    Set<String> keys = redisOperatorService.keys(TAG + "PAY_ORDER_*");
    if (CollectionUtils.isEmpty(keys)) {
        return new ArrayList<>();
    }
    List<PayOrderBean> payOrderBeans = new ArrayList<>();
    for (String orderKey : keys) {
        PayOrderBean payOrderBean = (PayOrderBean) redisOperatorService.getObByKey(orderKey);
        if (payOrderBean != null) {
            payOrderBeans.add(payOrderBean);
        }
    }
    return payOrderBeans;
}
```

参考文章：  
[SpringBoot 之 redis 使用（Lettuce 版本）](https://www.jianshu.com/p/feef1421ab0b)  
[Springboot 集成 redis 及其工具类](http://blog.beifengtz.com/article/39)
