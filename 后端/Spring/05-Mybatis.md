# Mybatis

## resultMap

resultMap 中的标签如下：

| 元素名称    | 描述                             |
| ----------- | -------------------------------- |
| result      | 字段映射                         |
| constructor | 实例化类时，注入结果到构造方法中 |
| association | 关联一个对象                     |
| collection  | 关联多个对象                     |

### result

result 用于字段映射,给定一个实体类：

```java
@Data
public class User {
    private String id;
    private String username;
    private String password;
    private String address;
    private String email;
}
```

假若数据库别名为 `uid`，则查询语句：

```xml
<resultMap id="getUserByIdMap" type="User">
  <result property="id" column="uid"></result>
</resultMap>

<select id="getUsers" resultType="User">
  SELECT
    u.id as uid,
    u.username,
    u.password,
    u.address,
    u.email
  FROM USER u
  WHERE u.id=#{id}
</select>
```

### constructor

使用 `constructor` 元素将结果注入构造方法里,先给 User 添加构造方法：

```java
public User(String id, String name) {
  this.id = id + "--------";
  this.username = name + "--------";
}
```

```xml
<resultMap id="getUserByIdMap" type="User">
  <constructor>
    <idArg column="id" name="id" javaType="string"></idArg>
    <arg column="username" name="name" javaType="string"></arg>
  </constructor>
</resultMap>
```

其中 column 代表数据库字段名称或者别名；name 则是构造方法中的参数名称；javaType 指定了参数的类型。

这样之后，结果集中的 id 和 username 属性都会发生变化：

```json
{
  "id": "1001--------",
  "username": "后羿--------",
  "password": "123456",
  "address": "北京市海淀区",
  "email": "510273027@qq.com"
}
```

### association

给 User 类添加角色：

```java
@Data
public class User {
    private Role role;
}
```

查询用户时查询角色：

```xml
<resultMap id="userMap" type="User">
  <id property="id" column="id"></id>
  <result property="username" column="username"></result>
  <result property="password" column="password"></result>
  <result property="address" column="address"></result>
  <result property="email" column="email"></result>

  <association property="role" javaType="Role">
    <id property="id" column="role_id"></id>
    <result property="name" column="role_name"></result>
  </association>
</resultMap>

<select id="getUserById" resultType="User">
    SELECT
        u.id,
        u.username,
        u.password,
        u.address,
        u.email,
        r.id as 'role_id',
        r.name as 'role_name'
    FROM
        USER u
            LEFT JOIN user_roles ur ON u.id = ur.user_id
            LEFT JOIN role r ON r.id = ur.role_id
    where u.id=#{id}
</select>
```

最后展示信息：

```
{
    "id": "1001",
    "username": "后羿",
    "password": "123456",
    "address": "北京市海淀区",
    "email": "510273027@qq.com",
    "role": {
        "id": "3",
        "name": "射手"
    }
}
```

### collection

#### 嵌套结果映射

如果用户有多个角色，可以使用 `collection` 来返回角色列表：

```java
@Data
public class User {
    private List<Role> roles;
}
```

修改 `resultMap` 返回结果：

```xml
<resultMap id="userMap" type="User">
  <id property="id" column="id"></id>
  <result property="username" column="username"></result>
  <result property="password" column="password"></result>
  <result property="address" column="address"></result>
  <result property="email" column="email"></result>

  <collection property="roles" ofType="Role">
    <id property="id" column="role_id"></id>
    <result property="name" column="role_name"></result>
  </collection>
</resultMap>
```

最后展示信息：

```
{
    "id": "1003",
    "username": "貂蝉",
    "password": "123456",
    "address": "北京市东城区",
    "email": "510273027@qq.com",
    "roles": [
        {
            "id": "1",
            "name": "中单"
        },
        {
            "id": "2",
            "name": "打野"
        }
    ]
}
```

#### 嵌套 Select 查询

假设这么一张表：

| id   | name     | url             | parent_id |
| ---- | -------- | --------------- | --------- |
| 1    | 系统管理 |                 | 0         |
| 1001 | 用户管理 | /user           | 1         |
| 1002 | 角色管理 | /role           | 1         |
| 1003 | 单位管理 | /employer       | 1         |
| 2    | 系统管理 |                 | 0         |
| 2001 | 系统管理 | /system/monitor | 2         |
| 2002 | 数据管理 | /data/monitor   | 2         |

需要将表的数据分成两级菜单返回，而不是平铺展示，新建 `Menu` 实体类：

```java
@Data
public class Menu {
    private String id;
    private String name;
    private String url;
    private String parent_id;
    private List<Menu> childMenu;
}
```

这里使用 `childMenu` 来展示二级菜单。然后来写 SQL 语句，如果没有传入 `parent_id` 字段，则查询一级菜单：

```xml
<select id="getMenus" resultMap="menusMap">
  SELECT
    m.id,
    m.name,
    m.url,
    m.parent_id
  FROM
    m_menu m
  where 1=1
  <choose>
    <when test="parent_id!=null">
      and m.parent_id = #{parent_id}
    </when>
    <otherwise>
      and m.parent_id = '0'
    </otherwise>
  </choose>
</select>
```

然后定义返回结果：

```xml
<resultMap id="menusMap" type="Menu">
  <id property="id" column="id"></id>
  <result property="name" column="name"></result>
  <result property="url" column="url"></result>
  <result property="m_desc" column="m_desc"></result>
  <result property="parent_id" column="parent_id"></result>

  <collection property="childMenu" ofType="Menu" select="getMenus"  column="{parent_id=id}"></collection>
</resultMap>
```

`collection` 元素含义：

- `property="childMenu"` 对应的是菜单中的子级菜单列表
- `ofType="Menu"` 对应返回数据的类型
- `select="getMenus"` 指定了 SELECT 语句的 id
- `column="{parent_id=id}"` 则是参数的表达式

整体含义为：通过 getMenus 这个 SELECT 语句来获取一级菜单中的 childMenu 属性结果；在上面的 SELECT 语句中，需要传递一个 parent_id 参数；这个参数的值就是一级菜单中的 id。

最终结果展示信息：

```
[
    {
        "id": "1",
        "name": "系统管理",
        "parent_id": "0",
        "childMenu": [
            {
                "id": "1001",
                "name": "用户管理",
                "url": "/user",
                "parent_id": "1"
            },
            {
                "id": "1002",
                "name": "角色管理",
                "url": "/role",
                "parent_id": "1"
            },
            {
                "id": "1003",
                "name": "单位管理",
                "url": "/employer",
                "parent_id": "1"
            }
        ]
    },
    {
        "id": "2",
        "name": "平台监控",
        "parent_id": "0",
        "childMenu": [
            {
                "id": "2001",
                "name": "系统监控",
                "url": "/system/monitor",
                "parent_id": "2"
            },
            {
                "id": "2002",
                "name": "数据监控",
                "url": "/data/monitor",
                "parent_id": "2"
            }
        ]
    }
]
```

### 自动填充关联对象

在 Mybatis 解析返回值的时候，第一步是获取返回值类型，拿到 Class 对象，然后获取构造器，设置可访问并返回实例，然后又把它包装成 MetaObject 对象。

从数据库 rs 中拿到结果之后，会调用 `MetaObject.setValue(String name, Object value)` 来填充对象。在这过程中，它会以 `.` 来分隔这个 name 属性。如果 name 属性中包含 `.` 符号，就找到 `.` 符号之前的属性名称，把它当做一个实体对象来。

还是以上面获取用户角色为例，在该 SQL 语句：

```xml
<select id="getUserList" resultType="User">
  SELECT
    u.id,
    u.username,
    u.password,
    u.address,
    u.email,
    r.id as 'role.id',
    r.name as 'role.name'
  FROM
    USER u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN role r ON r.id = ur.role_id
</select>
```

## join

- left join（左联接）：返回包括左表中的所有记录和右表中联结字段相等的记录
- right join（右联接）：返回包括右表中的所有记录和左表中联结字段相等的记录
- inner join（内连接）：只返回两个表中联结字段相等的行
- outer join（全连接）：只要左表和右表其中一个表中存在匹配，则返回

假若有两张表 A 和 B，分别如下：

| aID |   aNum    |
| :-: | :-------: |
|  1  | a20050111 |
|  2  | a20050112 |
|  3  | a20050113 |
|  4  | a20050114 |
|  5  | a20050115 |

| bID |   bName    |
| :-: | :--------: |
|  1  | 2006032401 |
|  2  | 2006032402 |
|  3  | 2006032403 |
|  4  | 2006032404 |
|  8  | 2006032408 |

### left join

```sql
select * from A
left join B on A.aID = B.bID
```

结果如下：

| aID |   aNum    | 　 bID |  　 bName  |
| :-: | :-------: | :----: | :--------: |
|  1  | a20050111 |   1    | 2006032401 |
|  2  | a20050112 |   2    | 2006032402 |
|  3  | a20050113 |   3    | 2006032403 |
|  4  | a20050114 |   4    | 2006032404 |
|  5  | a20050115 |  NULL  |    NULL    |

left join 是以 A 表的记录为基础的，A 可以看成左表，B 可以看成右表，left join 是以左表为准的。换句话说，左表 A 的记录将会全部表示出来，而右表 B 只会显示符合搜索条件的记录（例子中为: A.aID = B.bID），B 表记录不足的地方均为 NULL。

### right join

```sql
select * from A
right join B on A.aID = B.bID
```

结果如下：

| aID  |   aNum    | 　 bID |  　 bName  |
| :--: | :-------: | :----: | :--------: |
|  1   | a20050111 |   1    | 2006032401 |
|  2   | a20050112 |   2    | 2006032402 |
|  3   | a20050113 |   3    | 2006032403 |
|  4   | a20050114 |   4    | 2006032404 |
| NULL |   NULL    |   8    | 2006032408 |

right join 和 left join 的结果刚好相反，这次是以右表 B 为基础的，A 表不足的地方用 NULL 填充。

### inner join

```sql
select * from A
inner join B on A.aID = B.bID
```

结果如下：

| aID |   aNum    | 　 bID |  　 bName  |
| :-: | :-------: | :----: | :--------: |
|  1  | a20050111 |   1    | 2006032401 |
|  2  | a20050112 |   2    | 2006032402 |
|  3  | a20050113 |   3    | 2006032403 |
|  4  | a20050114 |   4    | 2006032404 |

inner join 产生左表（A）和右表（B）的交集。

### outer join

```sql
select * from A
outer join B on A.aID = B.bID
```

结果如下：

| aID  |   aNum    | 　 bID |  　 bName  |
| :--: | :-------: | :----: | :--------: |
|  1   | a20050111 |   1    | 2006032401 |
|  2   | a20050112 |   2    | 2006032402 |
|  3   | a20050113 |   3    | 2006032403 |
|  4   | a20050114 |   4    | 2006032404 |
|  5   | a20050115 |  NULL  |    NULL    |
| NULL |   NULL    |   8    | 2006032408 |

outer join 产生左表（A）和右表（B）的并集。

### 实际用例

已之前写过的 Netty 聊天系统为例，用户查询好友添加请求和自己的好友列表，查询语句如下：

```xml
<select id="queryFriendRequestList" parameterType="String" resultType="com.chanshiyu.pojo.vo.UsersVO">
  select u.id, u.username, u.nickname, u.avatar
  from friends_request f
  left join users u
  on f.send_user_id = u.id
  where f.accept_user_id = #{acceptUserId}
</select>

<select id="queryFriendList" parameterType="String" resultType="com.chanshiyu.pojo.vo.UsersVO">
  select u.id, u.username, u.nickname, u.avatar
  from my_friends m
  left join users u
  on m.my_friend_user_id = u.id
  where m.my_user_id = #{myUserId}
</select>
```

## 通用 Mapper

通用 Mapper 就是为了解决单表增删改查，基于 Mybatis 的插件。开发人员不需要编写 SQL，不需要在 DAO 中增加方法，只要写好实体类，就能支持相应的增删改查方法。

### Select

方法：`List<T> select(T record);`  
说明：根据实体中的属性值进行查询，查询条件使用等号。

方法：`T selectByPrimaryKey(Object key);`  
说明：根据主键字段进行查询，方法参数必须包含完整的主键属性，查询条件使用等号。

方法：`List<T> selectAll();`  
说明：查询全部结果，`select(null)` 方法能达到同样的效果。

方法：`T selectOne(T record);`  
说明：根据实体中的属性进行查询，只能有一个返回值，有多个结果是抛出异常，查询条件使用等号。

方法：`int selectCount(T record);`  
说明：根据实体中的属性查询总数，查询条件使用等号。

### Insert

方法：`int insert(T record);`  
说明：保存一个实体，null 的属性也会保存，不会使用数据库默认值。

方法：`int insertSelective(T record);`  
说明：保存一个实体，null 的属性不会保存，会使用数据库默认值。

### Update

方法：`int updateByPrimaryKey(T record);`  
说明：根据主键更新实体全部字段，null 值会被更新。

方法：`int updateByPrimaryKeySelective(T record);`  
说明：根据主键更新属性不为 null 的值。

### Delete

方法：`int delete(T record);`
说明：根据实体属性作为条件进行删除，查询条件使用等号。

方法：`int deleteByPrimaryKey(Object key);`
说明：根据主键字段进行删除，方法参数必须包含完整的主键属性。

### Example

方法：`List<T> selectByExample(Object example);`
说明：根据 Example 条件进行查询
重点：这个查询支持通过 Example 类指定查询列，通过 selectProperties 方法指定查询列。

方法：`int selectCountByExample(Object example);`
说明：根据 Example 条件进行查询总数。

方法：`int updateByExample(@Param("record") T record, @Param("example") Object example);`
说明：根据 Example 条件更新实体 record 包含的全部属性，null 值会被更新。

方法：`int updateByExampleSelective(@Param("record") T record, @Param("example") Object example);`
说明：根据 Example 条件更新实体 record 包含的不是 null 的属性值。

方法：`int deleteByExample(Object example);`
说明：根据 Example 条件删除数据。

## Example 查询

### 基本使用

```java
@Transactional(propagation = Propagation.SUPPORTS)
@Override
public Users queryUserByUsername(String username) {
    Example example = new Example(Users.class);
    Example.Criteria criteria = example.createCriteria();
    criteria.andEqualTo("username", username);
    return usersMapper.selectOneByExample(example);
}
```

### 更多用例

```java
Example example = new Example(Users.class);
Example.Criteria criteria = example.createCriteria();

// example 条件
example.setOrderByClause("age DESC");  // 排序
example.setDistinct(false);            // 不去重

// criteria 条件
criteria.andEqualTo("name", "时雨");    // 相等
criteria.andNameEqualTo("时雨");
```
