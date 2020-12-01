# MySQL 查看数据库表详情

## 查看所有数据库容量大小

```sql
select
table_schema as '数据库',
sum(table_rows) as '记录数',
sum(truncate(data_length/1024/1024, 2)) as '数据容量(MB)',
sum(truncate(index_length/1024/1024, 2)) as '索引容量(MB)'
from information_schema.tables
group by table_schema
order by sum(data_length) desc, sum(index_length) desc;
```

| 数据库             | 记录数  | 数据容量(MB) | 索引容量(MB) |
| ------------------ | ------- | ------------ | ------------ |
| mysql              | 141892  | 7.36         | 0.17         |
| tool_center        | 9288    | 1.56         | 0.01         |
| liveservice-dev    | 605     | 0.30         | 0.04         |
| information_schema |         | 0.10         | 0.00         |
| domain_center      | 0       | 0.07         | 0.02         |
| moechat            | 2       | 0.06         | 0.00         |
| yuko               | 0       | 0.06         | 0.00         |
| account_center     | 21      | 0.04         | 0.00         |
| storage_center     | 9       | 0.03         | 0.00         |
| sys                | 6       | 0.01         | 0.00         |
| performance_schema | 1331048 | 0.00         | 0.00         |

## 查看指定数据库容量大小

```sql
select
table_schema as '数据库',
sum(table_rows) as '记录数',
sum(truncate(data_length/1024/1024, 2)) as '数据容量(MB)',
sum(truncate(index_length/1024/1024, 2)) as '索引容量(MB)'
from information_schema.tables
where table_schema='liveservice-dev';
```

| 数据库          | 记录数 | 数据容量(MB) | 索引容量(MB) |
| --------------- | ------ | ------------ | ------------ |
| liveservice-dev | 605    | 0.30         | 0.04         |

## 查看指定数据库各表容量大小

```sql
select
table_schema as '数据库',
table_name as '表名',
table_rows as '记录数',
truncate(data_length/1024/1024, 2) as '数据容量(MB)',
truncate(index_length/1024/1024, 2) as '索引容量(MB)'
from information_schema.tables
where table_schema='liveservice-dev'
order by data_length desc, index_length desc;
```

| 数据库          | 表名        | 记录数 | 数据容量(MB) | 索引容量(MB) |
| --------------- | ----------- | ------ | ------------ | ------------ |
| liveservice-dev | chat_msg    | 281    | 0.06         | 0.00         |
| liveservice-dev | account     | 6      | 0.01         | 0.03         |
| liveservice-dev | firewall    | 3      | 0.01         | 0.01         |
| liveservice-dev | orders      | 51     | 0.01         | 0.00         |
| liveservice-dev | iptables    | 0      | 0.01         | 0.00         |
| liveservice-dev | users_group | 2      | 0.01         | 0.00         |
| liveservice-dev | users_black | 0      | 0.01         | 0.00         |

## 数据表优化

在 mysql 中，使用 delete 命令删除数据后，会发现这张表的数据文件和索引文件却奇怪的没有变小。这是因为 delete 操作并不会真的把数据删除，mysql 实际上只是给删除的数据打了个标记，标记为删除，因此你使用 delete 删除表中的数据，表文件在磁盘上所占空间不会变小，我们这里暂且称之为假删除。

假删除会留下许多的数据空洞，这些空洞会占据原来数据的空间，所以文件的大小没有改变。这些空洞在以后插入数据的时候可能会被再度利用起来，当然也有可能一直存在。这种空洞不仅额外增加了存储代价，同时也因为数据碎片化降低了表的扫描效率。

使用场景：当一个数据表在经过大量频繁的增删改之后，难免会产生数据空洞，浪费空间并影响查询效率，通常在生产环境中会直接表现为原本很快的查询会变得越来越慢。对于这种情况，可以使用以下命令来重新利用未使用的空间，解决数据空洞问题。

```sql
-- 命令一
optimize table t

-- 命令二（推荐）
alter table t engine=InnoDB
```

`optimize table` 原理是重建表，就是建立一个临时表 B，然后把表 A（存在数据空洞的表）中的所有数据查询出来，接着把数据全部重新插入到临时表 B 中，最后再用临时表 B 替换表 A 即可，这就是重建表的过程。

`optimize table` 只对 MyISAM，BDB 和 InnoDB 表起作用。对于 BDB 表，`optimize table` 目前被映射到 `analyze table` 上。对于 InnoDB 表，`optimize table` 被映射到 `alter table` 上，这会重建表。重建操作能更新索引统计数据并释放成簇索引中的未使用的空间。**注意：在 `optimize table` 运行过程中，MySQL 会锁定表，所以要在空闲时段执行。**

对于 MyISAM 可以直接使用 `optimize table t`，当是 InnoDB 引擎时，会报 Table does not support optimize, doing recreate + analyze instead，一般情况下，由 myisam 转成 innodb，会用 `alter table t engine='innodb'` 进行转换，优化也可以用这个。所以当是 InnoDB 引擎时我们就用 `alter table t engine='innodb'` 来代替 optimize 做优化就可以。

查看前后效果可以使用 `show table status` 命令，返回结果中的 `data_free` 即为空洞所占据的存储空间。

```sql
show table status from `liveservice-dev` like 'chat_msg';
```

| Name    | Engine | Version | Row_format | Rows | Avg_row_length | Data_length | Max_data_length | Index_length | Data_free | Auto_increment | Create_time         | Update_time         | Check_time | Collation       | Checksum | Create_options | Comment |
| ------- | ------ | ------- | ---------- | ---- | -------------- | ----------- | --------------- | ------------ | --------- | -------------- | ------------------- | ------------------- | ---------- | --------------- | -------- | -------------- | ------- |
| problem | InnoDB | 10      | Dynamic    | 4    | 4096           | 16384       | 0               | 0            | 0         | 9              | 2020-12-01 06:49:52 | 2020-12-01 07:31:16 |            | utf8_general_ci |          |                |         |
