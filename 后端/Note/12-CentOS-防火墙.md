# CentOS 防火墙

> 本文为个人学习摘要笔记。  
> 原文地址：[Linux 防火墙 Firewall 和 Iptables 的使用](https://macrozheng.github.io/mall-learning/#/reference/linux_firewall)

Linux 中有两种防火墙软件，ConterOS7.0 以上使用的是 firewall，ConterOS7.0 以下使用的是 iptables，本文将分别介绍两种防火墙软件的使用。

## Firewall

```shell
# 开启防火墙
systemctl start firewalld

# 关闭防火墙
systemctl stop firewalld

# 查看防火墙状态
systemctl status firewalld

# 设置开机启动
systemctl enable firewalld

# 禁用开机启动
systemctl disable firewalld

# 重启防火墙
firewall-cmd --reload

# 开放端口（修改后需要重启防火墙方可生效）
firewall-cmd --zone=public --add-port=8080/tcp --permanent

# 关闭端口
firewall-cmd --zone=public --remove-port=8080/tcp --permanent

# 查看开放的端口
firewall-cmd --list-ports
```

## Iptables

由于 CenterOS7.0 以上版本并没有预装 Iptables，需要自行装。

```shell
# 安装iptables
yum install iptables

# 安装iptables-services
yum install iptables-services
```

使用：

```shell
# 开启防火墙
systemctl start iptables.service

# 关闭防火墙
systemctl stop iptables.service

# 查看防火墙状态
systemctl status iptables.service

# 设置开机启动
systemctl enable iptables.service

# 禁用开机启动
systemctl disable iptables.service
```

规则：

```shell
# 查看filter表的几条链规则(INPUT链可以看出开放了哪些端口)
iptables -L -n

# 查看NAT表的链规则
iptables -t nat -L -n

# 清除防火墙所有规则
iptables -F
iptables -X
iptables -Z

# 给INPUT链添加规则（开放8080端口）
iptables -I INPUT -p tcp --dport 8080 -j ACCEPT

# 根据行号删除过滤规则（关闭8080端口）
iptables -D INPUT 1

# 查找规则所在行号
iptables -L INPUT --line-numbers -n
```
