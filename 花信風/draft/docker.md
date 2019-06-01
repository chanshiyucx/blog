[【WSL+Docker】新手 Win10 下的 WSL Ubuntu18 并安装使用 Docker](https://zhuanlan.zhihu.com/p/61542198)

## wsl 启动 SSH

```bash
sudo service ssh start             #启动 SSH 服务
sudo service ssh status            #检查状态
sudo systemctl enable ssh          #开机自动启动 SSH 命令
```

## 使用 Jupyter 进行远程交互

```bash
sudo apt install python-pip # 安装的 python2 的 pip
sudo apt install python3-pip # 安装的 python3 的 pip
sudo pip3 install jupyter # 用 python2 安装 jupyter
pip3 install ipykernel # 使得 jupyter 内核可以同时拥有 python2 和 python3
jupyter notebook --allow-root
```

## SSH 连接

```bash
ssh root@127.0.0.1:8022

# user: root pw: root
# user: chanshiyu pw: 1124chanshiyu
```

## 启动 docker

```bash
sudo service docker start # 开启 docker 服务
sudo service docker status # 查看 docker 状态
```

## docker 操作

Docker 命令分管理命令 `Management Commands` 和命令 `Commands`。Docker 1.13+ 引入了管理命令来帮助组织一堆 Docker 命令。两个命令都做同样的事情。管理命令有助于对所有命令进行分类，并使命令本身更加一致。

```bash
docker images ls # 查看现有镜像
docker image rm [imageName] # 删除镜像
docker container ls # 列出正在运行的容器 等同于 docker ps
docker container ls --al # 列出本机所有容器，包括终止运行的容器
docker container run [hello-world] # 运行容器
docker container kill [containID] # 手动终止容器运行
docker container rm [containerID] # 删除容器
```

**image 文件生成的容器实例，本身也是一个文件，称为容器文件**。也就是说，一旦容器生成，就会同时存在两个文件： image 文件和容器文件。而且关闭容器并不会删除容器文件，只是容器停止运行而已。如果容器不再使用，需要手动删除。
