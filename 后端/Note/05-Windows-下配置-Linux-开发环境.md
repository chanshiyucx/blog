# Windows 下配置 Linux 开发环境

## 安装虚拟机

- 下载 [vagrant](https://www.vagrantup.com/)
- 下载 [virtualbox](https://www.virtualbox.org/wiki/Downloads)

## 初始化

```bash
vagrant --help
# 创建目录
mkdir DockerProject
cd DockerProject

# 创建 centos-7 Vagrantfile
vagrant init centos/7

# 查看描述文件
more Vagrantfile

# 安装
vagrant up
```

## 操作

```bash
# 安装/启动
vagrant up

# 重启
vagrant reload

# 停止
vagrant halt

# 删除
vagrant destroy

# 恢复
vagrant resume

# ssh 登陆
vagrant ssh

# 查看状态
vagrant status
```

如果是打开多个，选定主机：

```bash
# ssh 登陆
vagrant ssh docker-demo
```
