# MySQL

## 常用 SQL

```sql
-- 登录
mysql -u root -p

-- 指定ip和端口登录
mysql -h 127.0.0.1 -u root -p -P 3306

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

-- 导出建表语句
show create table tableName;

-- 插入表数据：
insert into student (name, age) values ("张三", 22);

-- 查看表数据：
select * from student;

-- 查看编码方式
show variables like 'char%';
show variables like 'character%';

-- 设置编码
SET NAMES 'utf8';
-- 它相当于下面的三句指令：
SET character_set_client = utf8;
SET character_set_results = utf8;
SET character_set_connection = utf8;

-- 查询某一列为空或不为空的记录
select * from pay_order where ip IS NULL;
select * from pay_order where ip IS NOT NULL;

-- 插入列
alter table clients
add column `reception_mode` tinyint(2) NOT NULL DEFAULT 0 COMMENT '接待模式（0 轮询，1 平均）'
after `auto_reception`;

-- 修改字段长度
alter table `iptables` modify column `white_ip` varchar(1024);

-- 显示正在运行的线程
show processlist;
```

## 配置 mysql.cnf

```
[client]
default-character-set=utf8mb4

[mysql]
default-character-set=utf8mb4

[mysqld]
character-set-client-handshake=FALSE
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_ci
init_connect='SET NAMES utf8mb4'
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

## 解决 docker mysql 不能输入中文

```sh
docker exec -it CONTAINER env LANG=C.UTF-8 bash
```
