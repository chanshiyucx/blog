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
