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
