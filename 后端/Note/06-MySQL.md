# MySQL

## 常用 SQL

```sql
-- 查看 MySQL 版本
select version();

-- 查看所有数据库：
show databases;

-- 应用某个数据库：
use databaseName;

-- 查看所有数据表：
show tables;

-- 查看数据表结构：
describe tableName;

-- 创建数据库：
create database databaseName;

-- 创建数据表：
create table tableName;

-- 删除数据库：
drop database databaseName;

-- 删除数据表：
drop table tableName;

-- 插入表数据：
insert into student (name, age) values ("张三", 22);

-- 查看表数据：
select * from student;
```

## 配置远程访问

修改配置文件 `/etc/mysql/mysql.conf.d/mysqld.cnf`，将 `bind-address` 改为 `0.0.0.0`：

```
# bind-address = 127.0.0.1
bind-address = 0.0.0.0
```

授权：

```bash
# 重启
service mysql restart

# 登录
mysql -u root -p

# 授权 root 用户允许所有人连接
grant all privileges on *.* to 'root'@'%' identified by '你的 mysql root 账户密码';
```

## 配置字符集

在 `[mysqld]` 节点上增加如下配置：

```
[client]
default-character-set=utf8
```

在 `[mysqld]` 节点底部增加如下配置：

```
default-storage-engine=INNODB
character-set-server=utf8
collation-server=utf8_general_ci
```

## 配置忽略数据库大小写敏感

在 `[mysqld]` 节点底部增加如下配置

```
lower-case-table-names = 1
```

## 配置密码口令

查看和设置密码安全级别：

```
select @@validate_password_policy;
set global validate_password_policy=0;
```

查看和设置密码长度限制：

```
select @@validate_password_length;
set global validate_password_length=1;
```
