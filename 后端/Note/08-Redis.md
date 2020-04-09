# Redis

## 介绍

关于 jedis 跟 lettuce 的区别：

- Lettuce 和 Jedis 的定位都是 redis client，所以他们当然可以直接连接 redis server。
- Jedis 在实现上是直接连接的 redis server，如果在多线程环境下是非线程安全的，这个时候只有使用连接池，为每个 Jedis 实例增加物理连接。
- Lettuce 的连接是基于 Netty 的，连接实例（StatefulRedisConnection）可以在多个线程间并发访问，因为 StatefulRedisConnection 是线程安全的，所以一个连接实例（StatefulRedisConnection）就可以满足多线程环境下的并发访问，当然这个也是可伸缩的设计，一个连接实例不够的情况也可以按需增加连接实例。

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
    timeout: 10000ms # 连接超时时间（毫秒）
    lettuce:
      pool:
        max-active: 8 # 连接池最大连接数（负数表示没有限制）
        max-wait: -1ms # 连接池最大阻塞等待时间（负数表示没有限制）
        max-idle: 8 # 连接池最大空闲连接
        min-idle: 0 # 连接池最小空闲连接
```

配置类：

```java
@Configuration
@EnableCaching
@AutoConfigureAfter(RedisAutoConfiguration.class)
public class RedisConfig {

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory redisConnectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(redisConnectionFactory);
        RedisSerializer<Object> serializer = jackson2JsonRedisSerializer();
        template.setKeySerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(serializer);
        template.setHashValueSerializer(serializer);
        template.afterPropertiesSet();
        return template;
    }

    @Bean
    public RedisSerializer<Object> jackson2JsonRedisSerializer() {
        Jackson2JsonRedisSerializer<Object> serializer = new Jackson2JsonRedisSerializer<>(Object.class);
        ObjectMapper mapper = new ObjectMapper();
        mapper.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY);
        mapper.enableDefaultTyping(ObjectMapper.DefaultTyping.NON_FINAL);
        serializer.setObjectMapper(mapper);
        return serializer;
    }

    @Bean
    public CacheManager cacheManager(RedisConnectionFactory redisConnectionFactory) {
        RedisCacheWriter redisCacheWriter = RedisCacheWriter.nonLockingRedisCacheWriter(redisConnectionFactory);
        RedisCacheConfiguration redisCacheConfiguration = RedisCacheConfiguration.defaultCacheConfig()
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(jackson2JsonRedisSerializer()))
                .entryTtl(Duration.ofDays(1));
        return new RedisCacheManager(redisCacheWriter, redisCacheConfiguration);
    }

}
```

注解说明：

- `@Configuration` 代表这个类是一个配置类
- `@AutoConfigureAfter(RedisAutoConfiguration.class)` 是让这个配置类在内置的配置类之后在配置，这样就保证我们的配置类生效，并且不会被覆盖配置。

[RedisService](https://github.com/macrozheng/mall/blob/master/mall-security/src/main/java/com/macro/mall/security/service/RedisService.java)：

```java
/**
 * @author SHIYU
 * @description Redis 操作 Service
 * @since 2020/4/9 11:06
 */
public interface RedisService {

    /**
     * 保存属性
     */
    void set(String key, Object value, long time);

    /**
     * 保存属性
     */
    void set(String key, Object value);

    /**
     * 获取属性
     */
    Object get(String key);

    /**
     * 删除属性
     */
    Boolean del(String key);

    /**
     * 批量删除属性
     */
    Long del(List<String> keys);

    /**
     * 设置过期时间
     */
    Boolean expire(String key, long time);

    /**
     * 获取过期时间
     */
    Long getExpire(String key);

    /**
     * 判断是否有该属性
     */
    Boolean hasKey(String key);

    /**
     * 按delta递增
     */
    Long incr(String key, long delta);

    /**
     * 按delta递减
     */
    Long decr(String key, long delta);

    /**
     * 获取Hash结构中的属性
     */
    Object hGet(String key, String hashKey);

    /**
     * 向Hash结构中放入一个属性
     */
    Boolean hSet(String key, String hashKey, Object value, long time);

    /**
     * 向Hash结构中放入一个属性
     */
    void hSet(String key, String hashKey, Object value);

    /**
     * 直接获取整个Hash结构
     */
    Map<Object, Object> hGetAll(String key);

    /**
     * 直接设置整个Hash结构
     */
    Boolean hSetAll(String key, Map<String, Object> map, long time);

    /**
     * 直接设置整个Hash结构
     */
    void hSetAll(String key, Map<String, Object> map);

    /**
     * 删除Hash结构中的属性
     */
    void hDel(String key, Object... hashKey);

    /**
     * 判断Hash结构中是否有该属性
     */
    Boolean hHasKey(String key, String hashKey);

    /**
     * Hash结构中属性递增
     */
    Long hIncr(String key, String hashKey, Long delta);

    /**
     * Hash结构中属性递减
     */
    Long hDecr(String key, String hashKey, Long delta);

    /**
     * 获取Set结构
     */
    Set<Object> sMembers(String key);

    /**
     * 向Set结构中添加属性
     */
    Long sAdd(String key, Object... values);

    /**
     * 向Set结构中添加属性
     */
    Long sAdd(String key, long time, Object... values);

    /**
     * 是否为Set中的属性
     */
    Boolean sIsMember(String key, Object value);

    /**
     * 获取Set结构的长度
     */
    Long sSize(String key);

    /**
     * 删除Set结构中的属性
     */
    Long sRemove(String key, Object... values);

    /**
     * 获取List结构中的属性
     */
    List<Object> lRange(String key, long start, long end);

    /**
     * 获取List结构的长度
     */
    Long lSize(String key);

    /**
     * 根据索引获取List中的属性
     */
    Object lIndex(String key, long index);

    /**
     * 向List结构中添加属性
     */
    Long lPush(String key, Object value);

    /**
     * 向List结构中添加属性
     */
    Long lPush(String key, Object value, long time);

    /**
     * 向List结构中批量添加属性
     */
    Long lPushAll(String key, Object... values);

    /**
     * 向List结构中批量添加属性
     */
    Long lPushAll(String key, Long time, Object... values);

    /**
     * 从List结构中移除属性
     */
    Long lRemove(String key, long count, Object value);

}
```

实现类：

```java
/**
 * @author SHIYU
 * @description Redis 操作实现类
 * @since 2020/4/9 11:07
 */
@Service
public class RedisServiceImpl implements RedisService {

    private final RedisTemplate<String, Object> redisTemplate;

    public RedisServiceImpl(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    public void set(String key, Object value, long time) {
        redisTemplate.opsForValue().set(key, value, time, TimeUnit.SECONDS);
    }

    @Override
    public void set(String key, Object value) {
        redisTemplate.opsForValue().set(key, value);
    }

    @Override
    public Object get(String key) {
        return redisTemplate.opsForValue().get(key);
    }

    @Override
    public Boolean del(String key) {
        return redisTemplate.delete(key);
    }

    @Override
    public Long del(List<String> keys) {
        return redisTemplate.delete(keys);
    }

    @Override
    public Boolean expire(String key, long time) {
        return redisTemplate.expire(key, time, TimeUnit.SECONDS);
    }

    @Override
    public Long getExpire(String key) {
        return redisTemplate.getExpire(key, TimeUnit.SECONDS);
    }

    @Override
    public Boolean hasKey(String key) {
        return redisTemplate.hasKey(key);
    }

    @Override
    public Long incr(String key, long delta) {
        return redisTemplate.opsForValue().increment(key, delta);
    }

    @Override
    public Long decr(String key, long delta) {
        return redisTemplate.opsForValue().increment(key, -delta);
    }

    @Override
    public Object hGet(String key, String hashKey) {
        return redisTemplate.opsForHash().get(key, hashKey);
    }

    @Override
    public Boolean hSet(String key, String hashKey, Object value, long time) {
        redisTemplate.opsForHash().put(key, hashKey, value);
        return expire(key, time);
    }

    @Override
    public void hSet(String key, String hashKey, Object value) {
        redisTemplate.opsForHash().put(key, hashKey, value);
    }

    @Override
    public Map<Object, Object> hGetAll(String key) {
        return redisTemplate.opsForHash().entries(key);
    }

    @Override
    public Boolean hSetAll(String key, Map<String, Object> map, long time) {
        redisTemplate.opsForHash().putAll(key, map);
        return expire(key, time);
    }

    @Override
    public void hSetAll(String key, Map<String, Object> map) {
        redisTemplate.opsForHash().putAll(key, map);
    }

    @Override
    public void hDel(String key, Object... hashKey) {
        redisTemplate.opsForHash().delete(key, hashKey);
    }

    @Override
    public Boolean hHasKey(String key, String hashKey) {
        return redisTemplate.opsForHash().hasKey(key, hashKey);
    }

    @Override
    public Long hIncr(String key, String hashKey, Long delta) {
        return redisTemplate.opsForHash().increment(key, hashKey, delta);
    }

    @Override
    public Long hDecr(String key, String hashKey, Long delta) {
        return redisTemplate.opsForHash().increment(key, hashKey, -delta);
    }

    @Override
    public Set<Object> sMembers(String key) {
        return redisTemplate.opsForSet().members(key);
    }

    @Override
    public Long sAdd(String key, Object... values) {
        return redisTemplate.opsForSet().add(key, values);
    }

    @Override
    public Long sAdd(String key, long time, Object... values) {
        Long count = redisTemplate.opsForSet().add(key, values);
        expire(key, time);
        return count;
    }

    @Override
    public Boolean sIsMember(String key, Object value) {
        return redisTemplate.opsForSet().isMember(key, value);
    }

    @Override
    public Long sSize(String key) {
        return redisTemplate.opsForSet().size(key);
    }

    @Override
    public Long sRemove(String key, Object... values) {
        return redisTemplate.opsForSet().remove(key, values);
    }

    @Override
    public List<Object> lRange(String key, long start, long end) {
        return redisTemplate.opsForList().range(key, start, end);
    }

    @Override
    public Long lSize(String key) {
        return redisTemplate.opsForList().size(key);
    }

    @Override
    public Object lIndex(String key, long index) {
        return redisTemplate.opsForList().index(key, index);
    }

    @Override
    public Long lPush(String key, Object value) {
        return redisTemplate.opsForList().rightPush(key, value);
    }

    @Override
    public Long lPush(String key, Object value, long time) {
        Long index = redisTemplate.opsForList().rightPush(key, value);
        expire(key, time);
        return index;
    }

    @Override
    public Long lPushAll(String key, Object... values) {
        return redisTemplate.opsForList().rightPushAll(key, values);
    }

    @Override
    public Long lPushAll(String key, Long time, Object... values) {
        Long count = redisTemplate.opsForList().rightPushAll(key, values);
        expire(key, time);
        return count;
    }

    @Override
    public Long lRemove(String key, long count, Object value) {
        return redisTemplate.opsForList().remove(key, count, value);
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
