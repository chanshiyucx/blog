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

## 配置

Vagrantfile：

```
Vagrant.require_version ">= 1.6.0"

boxes = [
    {
        :name => "docker-demo",
        :eth1 => "192.168.205.10",
        :mem => "1024",
        :cpu => "1"
    }
]

Vagrant.configure(2) do |config|

  config.vm.box = "centos/7"

  boxes.each do |opts|
      config.vm.define opts[:name] do |config|
        config.vm.hostname = opts[:name]
        config.vm.provider "vmware_fusion" do |v|
          v.vmx["memsize"] = opts[:mem]
          v.vmx["numvcpus"] = opts[:cpu]
        end

        config.vm.provider "virtualbox" do |v|
          v.customize ["modifyvm", :id, "--memory", opts[:mem]]
          v.customize ["modifyvm", :id, "--cpus", opts[:cpu]]
        end

        config.vm.network :private_network, ip: opts[:eth1]
      end
  end

  config.vm.synced_folder "./labs", "/home/vagrant/labs"
  config.vm.provision "shell", privileged: true, path: "./setup.sh"

end
```

setup.sh：

```shell
#/bin/sh

# install some tools
sudo yum install -y git vim gcc glibc-static telnet bridge-utils

# install docker
curl -fsSL get.docker.com -o get-docker.sh
sh get-docker.sh

# start docker service
sudo groupadd docker
sudo usermod -aG docker vagrant
sudo systemctl start docker

rm -rf get-docker.sh
```

## 问题

### docker 未启动

```bash
systemctl daemon-reload
service docker restart
service docker status
```

### docker-compose 无法启动 mysql

报错：

```
shiyu-mysql | 2019-09-02T08:07:06.346042Z 0 [Warning] TIMESTAMP with implicit DEFAULT value is deprecated. Please use --explicit_defaults_for_timestamp server option (see documentation for more details).
shiyu-mysql | 2019-09-02T08:07:06.350661Z 0 [Warning] Setting lower_case_table_names=2 because file system for /var/lib/mysql/ is case insensitive
shiyu-mysql | 2019-09-02T08:07:06.467170Z 0 [ERROR] InnoDB: Operating system error number 95 in a file operation.
shiyu-mysql | 2019-09-02T08:07:06.467192Z 0 [ERROR] InnoDB: Error number 95 means 'Operation not supported'
shiyu-mysql | 2019-09-02T08:07:06.467201Z 0 [ERROR] InnoDB: File ./ib_logfile101: 'Linux aio' returned OS error 195. Cannot continue operation
shiyu-mysql | 2019-09-02T08:07:06.467206Z 0 [ERROR] InnoDB: Cannot continue operation.
```

首先在 `docker-compose.yml` 添加配置文件：

```yml
volumes:
  - ./mysql/conf:/etc/mysql/conf.d
```

在 `./mysql/conf` 文件夹下添加一个本地配置文件 `local.cnf`：

```cnf
[mysqld]
innodb_use_native_aio=0
```

给文件授权：

```bash
sudo chmod 400 local.cnf
```

重新启动，问题解决！
