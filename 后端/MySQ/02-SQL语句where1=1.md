# SQL 语句 where 1=1

在 mall 项目中，看到这样的 sql 语句：

```sql
select * from user where 1=1
```

其中这个 `where 1=1` 是有特殊意义的，包含以下两种情境：**动态 SQL 拼接**和**查询表结构**。

## 动态 SQL 拼接

适合多条件搜索，当要构造动态 sql 语句时为了防止 sql 语句结构不当,所以加上 `where 1=1`，这样 sql 语句不会报错，例如：

```java
String sql="select * from table_name where 1=1";
if (conditon 1) {
  sql=sql+" and var2=value2";
}
if (conditon 2) {
  sql=sql+" and var3=value3";
}
```

sql 语句加上 `where 1=1`，只是为了满足多条件查询页面中不确定的各种因素而采用的一种构造一条正确能运行的动态 SQL 语句的一种方法。

当然，在 mybatis 中有更简单的方式处理 sql 拼接：

```xml
<select id="findActiveBlogLike"
     resultType="Blog">
  SELECT * FROM BLOG
  <where>
    <if test="state != null">
         state = #{state}
    </if>
    <if test="title != null">
        AND title like #{title}
    </if>
    <if test="author != null and author.name != null">
        AND author_name like #{author.name}
    </if>
  </where>
</select>
```

where 元素只会在至少有一个子元素的条件返回 sql 子句的情况下才去插入“WHERE”子句。而且，若语句的开头为“AND”或“OR”，where 元素也会将它们去除。

## 查询表结构

优点：数据库开销小。

`where 1=1` 是 sql 语句条件逻辑判断表达式，由于 1=1 成立，恒为真，该表达式 1=1 将始终返回"真"，这种写法实际目的是为了获取逻辑值"True"。

```sql
-- 例 1
select * from t1 where 1=1;
-- 实际等效于select * from t1 where true;-- 语句将返回t1中所有的记录行

-- 例 2
select * from t1 where 1<>1;
-- 实际等效于 select * from t1 where false;-- 语句将返回空记录集
```

例 1 实际上等同于不加任何筛选条件，有些画蛇添足，`where 1=1` 的实际意义不如 `where 1<>1`或者 `where 1=0` 来得有用，当我们**只需要获取表的字段结构信息，而不需要理会实际保存的记录时，例 2）的写法将是非常可取的**，因为系统仅会读取结构信息，而不会将具体的表记录读入内存中，这无疑节省了系统开销。

参考文章：  
[SQL 语句中 where 1=1 的意义](https://cloud.tencent.com/developer/article/1455831)
[动态 SQL](https://mybatis.org/mybatis-3/zh/dynamic-sql.html)
