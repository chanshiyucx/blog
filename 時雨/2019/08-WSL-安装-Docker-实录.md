# WSL 安装 Docker 实录

WSL（Windows Subsystem for Linux）是 win10 自带的适用于 Linux 的子系统。相比于虚拟机更为轻巧。启用 WSL 后配合 Win10 商店自带的 Ubuntu，便可在 Win10 上运行 Linux 系统。

Docker 属于 Linux 容器的一种封装，提供简单易用的容器使用接口。它是目前最流行的 Linux 容器解决方案。

Docker 将应用程序与该程序的依赖，打包在一个文件里面。运行这个文件，就会生成一个虚拟容器。程序在这个虚拟容器里运行，就好像在真实的物理机上运行一样。有了 Docker，就不用担心环境问题。

本文是在自己在 Win10 WSL 环境下安装 Docker 的实录。

## WSL 环境安装

### 启用 WSL

**控制面板&gt;程序和功能&gt;启用或关闭 window 功能&gt;勾选“适用于 Linux 的 Windows 子系统”**，之后重启系统。

![启用 WSL](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/WSL-安装-Docker-实录/wsl-启用.png)

### 安装 Ubuntu

在 Microsoft Store 搜索 Ubuntu 并安装：

![安装 Ubuntu](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/WSL-安装-Docker-实录/wsl-安装Ubuntu.png)

安装完成查看基本信息：

```bash
# 查看linux内核版本
uname -r

# 查看系统版本
cat /etc/lsb-release

# 查看本地磁盘内存情况
df -h
```

### 更新软件源（阿里云源）并更新软件

```bash
# 使用 root 权限登录，后续输入密码
sudo -i

# 接下来备份当前源，输入以下命令
cp /etc/apt/sources.list /etc/apt/sources.list.old

# 这个 sources.list 文件就是源文件，删除该文件，重新写一个
rm /etc/apt/sources.list
vim /etc/apt/sources.list
```

将以下内容 copy 过去并保存退出：

```text
# deb cdrom:[Ubuntu 16.04 LTS _Xenial Xerus_ - Release amd64 (20160420.1)]/ xenial main restricted
deb-src http://archive.ubuntu.com/ubuntu xenial main restricted #Added by software-properties
deb http://mirrors.aliyun.com/ubuntu/ xenial main restricted
deb-src http://mirrors.aliyun.com/ubuntu/ xenial main restricted multiverse universe #Added by software-properties
deb http://mirrors.aliyun.com/ubuntu/ xenial-updates main restricted
deb-src http://mirrors.aliyun.com/ubuntu/ xenial-updates main restricted multiverse universe #Added by software-properties
deb http://mirrors.aliyun.com/ubuntu/ xenial universe
deb http://mirrors.aliyun.com/ubuntu/ xenial-updates universe
deb http://mirrors.aliyun.com/ubuntu/ xenial multiverse
deb http://mirrors.aliyun.com/ubuntu/ xenial-updates multiverse
deb http://mirrors.aliyun.com/ubuntu/ xenial-backports main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ xenial-backports main restricted universe multiverse #Added by software-properties
deb http://archive.canonical.com/ubuntu xenial partner
deb-src http://archive.canonical.com/ubuntu xenial partner
deb http://mirrors.aliyun.com/ubuntu/ xenial-security main restricted
deb-src http://mirrors.aliyun.com/ubuntu/ xenial-security main restricted multiverse universe #Added by software-properties
deb http://mirrors.aliyun.com/ubuntu/ xenial-security universe
deb http://mirrors.aliyun.com/ubuntu/ xenial-security multiverse
```

之后可以开始更新软件镜像源和软件包：

```bash
sudo apt update   # 更新软件源
sudo apt upgrade  # 更新软件包
```

### 安装必要工具

之后我们先安装一些必要的工具：

```bash
sudo apt-get update
sudo apt-get install apt-transport-https ca-certificates curl software-properties-common
```

## 准备工作

### vim 美化

修改 vim 配色为 `molokai`：

```bash
mkdir .vim
cd .vim
git clone https://github.com/tomasr/molokai.git
cp -rf molokai/colors/ ./colors
vim vimrc
colorscheme molokai
```

### 启动 SSH

之后我们会在 win10 桌面上通过 SSH 远程连接 Ubuntu，所以先安装配置 SSH 服务：

```bash
# 设置 root 的口令（密码），用作后续登陆使用
sudo passwd root

# 安装 openssh-server（似乎 ubuntu 自带已安装）
sudo apt install openssh-server

# 备份很重要
sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak

# 使用 vim 进行编辑
sudo vim /etc/ssh/sshd_config

# 在 vim 中分别找到并对应修改四处，具体如下：
Port 8022
ListenAddress 0.0.0.0        # 如果需要指定监听的 IP 则去除最左侧的井号，并配置对应 IP，默认即监听 PC 所有 IP
PermitRootLogin yes           # 如果你需要用 root 直接登录系统则此处改为 yes
PasswordAuthentication yes    # 将 no 改为 yes 表示使用帐号密码方式登录
```

![SSH配置](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/WSL-安装-Docker-实录/wsl-ssh.png)

之后启动 SSH 并检查状态，输出 running 即正确：

```bash
sudo service ssh start             # 启动 SSH 服务
sudo service ssh status            # 检查状态
sudo systemctl enable ssh          # 开机自动启动 SSH 命令
```

之后便可在 win10 系统上通过 SSH 远程连接：

```bash
ssh root@127.0.0.1 -p 8022
```

可能会出现连接被拒绝 `Connection closed by 192.168.50.179 port 8022`，应该是之前启动 SSH 时未生成 key：

```bash
sudo service ssh start # 启动 SSH 报下面提示则说明 key 未生成
# * Starting OpenBSD Secure Shell server sshd                                                                         # Could not load host key: /etc/ssh/ssh_host_rsa_key
# Could not load host key: /etc/ssh/ssh_host_ecdsa_key
# Could not load host key: /etc/ssh/ssh_host_ed25519_key
```

需要执行以下命令，之后便可连接成功：

```bash
sudo dpkg-reconfigure openssh-server
```

### 使用 Jupyter 进行远程交互

通过远程交互，可以在浏览器上实现 win10 与 Ubuntu 文件共享：

```bash
sudo apt install python-pip # 安装的 python2 的 pip
sudo apt install python3-pip # 安装的 python3 的 pip
sudo pip3 install jupyter # 用 python2 安装 jupyter
pip3 install ipykernel # 使得 jupyter 内核可以同时拥有 python2 和 python3
jupyter notebook --allow-root
```

安装过程报错 `ImportError: cannot import name 'sysconfig'`，按以下流程修复，之后重走上面安装流程即可：

```bash
# 修改 sources.list 源文件
vim /etc/apt/sources.list

# 添加以下内容
deb http://cn.archive.ubuntu.com/ubuntu bionic main multiverse restricted universe
deb http://cn.archive.ubuntu.com/ubuntu bionic-updates main multiverse restricted universe
deb http://cn.archive.ubuntu.com/ubuntu bionic-security main multiverse restricted universe
deb http://cn.archive.ubuntu.com/ubuntu bionic-proposed main multiverse restricted universe

# 更新软件源
sudo apt update
# 更新软件包
sudo apt upgrade
```

安装过程报错 `ImportError “No Module named Setuptools”`，解决方式：

```bash
sudo apt-get install python-setuptools
sudo apt-get install python3-setuptools
```

## Docker 安装

通过上面我们知道 docker 的架构设计分为三个组件：一个客户端，一个 REST API 和一个服务器（守护进程）。

这里我们守护进程使用 docker for windows，客户端在 ubuntu 安装。

### 安装 docker for windows

必须勾选最后一项，否则将不能在 wsl 中使用 docker。

![docker for windows](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/WSL-安装-Docker-实录/docker-for-windows.png)

### 安装 docker 客户端

```shell
apt install docker.io
```

### 配置 WSL

```shell
echo "export DOCKER_HOST='tcp://0.0.0.0:2375'" >> ~/.bashrc
source ~/.bashrc # 更新环境变量
```

### 文件共享

通过 docker for windows 可以实现共享磁盘 💽，以 c 盘为例，挂载后在 wsl 中路径为 `/mnt/c`。

以上就是自己在 WSL 里安装启用 Docker 的全流程。Just enjoy it.

参考文章：  
[【WSL+Docker】新手 Win10 下的 WSL Ubuntu18 并安装使用 Docker](https://zhuanlan.zhihu.com/p/61542198)  
[Windows 10 bash & Windows docker 問題處理](https://blog.caesarchi.com/2017/05/15/windows-10-bash-windows-docker-intergrate_problem_solve/)
