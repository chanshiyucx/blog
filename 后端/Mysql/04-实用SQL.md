# 实用 SQL

## 聚合函数

| 函数 | 说明                                   |
| ---- | -------------------------------------- |
| SUM  | 计算某一列的合计值，该列必须为数值类型 |
| AVG  | 计算某一列的平均值，该列必须为数值类型 |
| MAX  | 计算某一列的最大值                     |
| MIN  | 计算某一列的最小值                     |

注意：`MAX()` 和 `MIN()` 函数并不限于数值类型。如果是字符类型，`MAX()` 和 `MIN()` 会返回排序最后和排序最前的字符。

使用聚合查询计算男生平均成绩：

```sql
SELECT AVG(score) average FROM students WHERE gender = 'M';
```

## 分组聚合

将全部学生按 class_id 分组并统计总数：

```sql
SELECT class_id, COUNT(*) num FROM students GROUP BY class_id;
```

| class_id | num |
| -------- | --- |
| 1        | 4   |
| 2        | 3   |
| 3        | 3   |

也可以使用多个列进行分组，例如，我们想统计各班的男生和女生人数：

| class_id | gender | num |
| -------- | ------ | --- |
| 1        | M      | 2   |
| 1        | F      | 2   |
| 2        | F      | 1   |
| 2        | M      | 2   |
| 3        | F      | 2   |
| 3        | M      | 1   |

## 连接查询

```sql
SELECT s.id, s.name, s.class_id, c.name class_name, s.gender, s.score
FROM students s
INNER JOIN classes c
ON s.class_id = c.id;
```

- `INNER JOIN` 只返回同时存在于两张表的行数据，由于 `students` 表的 `class_id` 包含 1，2，3，`classes` 表的 id 包含 1，2，3，4，所以，`INNER JOIN` 根据条件 `s.class_id = c.id` 返回的结果集仅包含 1，2，3；
- `RIGHT OUTER JOIN` 返回右表都存在的行。如果某一行仅在右表存在，那么结果集就会以 `NULL` 填充剩下的字段；
- `LEFT OUTER JOIN` 则返回左表都存在的行。如果我们给 `students` 表增加一行，并添加 `class_id=5`，由于 `classes` 表并不存在 id=5 的行，所以，`LEFT OUTER JOIN` 的结果会增加一行，对应的 `class_name` 是 `NULL`；
- `FULL OUTER JOIN` 会把两张表的所有记录全部选择出来，并且，自动把对方不存在的列填充为 `NULL`。

注意三种外连接的 `OUTER` 可以省略。

```
<join_type> ::=
    [ { INNER | { { LEFT | RIGHT | FULL } [ OUTER ] } } [ <join_hint> ] ]
    JOIN
```

## 插入或替换

如果我们希望插入一条新记录（INSERT），但如果记录已经存在，就先删除原记录，再插入新记录。此时，可以使用 `REPLACE` 语句，这样就不必先查询，再决定是否先删除再插入：

```sql
REPLACE INTO students (id, class_id, name, gender, score) VALUES (1, 1, '小明', 'F', 99);
```

若 id=1 的记录不存在，`REPLACE` 语句将插入新记录，否则，当前 id=1 的记录将被删除，然后再插入新记录。

## 插入或更新

如果我们希望插入一条新记录（INSERT），但如果记录已经存在，就更新该记录，此时，可以使用 `INSERT INTO ... ON DUPLICATE KEY UPDATE ...` 语句：

```sql
INSERT INTO students (id, class_id, name, gender, score) VALUES (1, 1, '小明', 'F', 99) ON DUPLICATE KEY UPDATE name='小明', gender='F', score=99;
```

若 id=1 的记录不存在，`INSERT` 语句将插入新记录，否则，当前 id=1 的记录将被更新，更新的字段由 `UPDATE` 指定。

## 插入或忽略

如果我们希望插入一条新记录（INSERT），但如果记录已经存在，就啥事也不干直接忽略，此时，可以使用 `INSERT IGNORE INTO ...` 语句：

```sql
INSERT IGNORE INTO students (id, class_id, name, gender, score) VALUES (1, 1, '小明', 'F', 99);
```

若 id=1 的记录不存在，`INSERT` 语句将插入新记录，否则，不执行任何操作。

## 快照

如果想要对一个表进行快照，即复制一份当前表的数据到一个新表，可以结合 `CREATE TABLE` 和 `SELECT`：

```sql
-- 对 class_id=1 的记录进行快照，并存储为新表 students_of_class1:
CREATE TABLE students_of_class1 SELECT * FROM students WHERE class_id=1;
```

新创建的表结构和 `SELECT` 使用的表结构完全一致。

## 写入查询结果集

例如，创建一个统计成绩的表 `statistics`，记录各班的平均成绩：

```sql
CREATE TABLE statistics (
id BIGINT NOT NULL AUTO_INCREMENT,
class_id BIGINT NOT NULL,
average DOUBLE NOT NULL,
PRIMARY KEY (id)
);
```

然后，我们就可以用一条语句写入各班的平均成绩：

```sql
INSERT INTO statistics (class_id, average) SELECT class_id, AVG(score) FROM students GROUP BY class_id;
```
