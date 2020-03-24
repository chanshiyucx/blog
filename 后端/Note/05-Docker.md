# Docker

Docker 属于 Linux 容器的一种封装，它是目前最流行的容器解决方案。容器有点像虚拟机，提供虚拟化的环境。Docker 本身并不是容器，它是创建容器的工具，是应用容器引擎。

## 关于 Docker

### Docker 概念

> Build, Ship and Run. Build once，Run anywhere.

Docker 的主要用途，目前有三大类：

1. **提供一次性的环境**：比如，本地测试他人的软件、持续集成的时候提供单元测试和构建的环境。
2. **提供弹性的云服务**：因为 Docker 容器可以随开随关，很适合动态扩容和缩容。
3. **组建微服务架构**：通过多个容器，一台机器可以跑多个服务，因此在本机就可以模拟出微服务架构。

在 Docker 中，有两大核心概念 image（镜像）和 container（容器）。Docker 把应用程序及其依赖打包在 image 文件里面。只有通过这个文件，才能生成 container。

我们以编程语言中的类和实例的关系来类比 image 和 container。其中 image 好比一个 Class 类文件，container 就是类的实例，image 是创建 container 的模板，image 可以“继承”自其他 image 文件，每个 container 容器都是由一个 image 生成，同一个 image 文件，可以生成多个同时运行的 container 实例。

image 镜像生成的 conatiner 实例，本身也是一个文件，称为容器文件。所以一旦容器生成，就会同时存在两个文件：image 文件和 container 文件。关闭容器并不会删除容器文件，只是容器停止运行而已。

### 传统虚拟化方式区别

Docker 和传统虚拟化方式区别：传统虚拟机技术是虚拟出一套硬件后，在其上运行一个完整操作系统，在该系统上再运行所需应用进程；而容器内的应用进程直接运行于宿主的内核，容器内没有自己的内核，而且也没有进行硬件虚拟。因此容器要比传统虚拟机更为轻便。

Docker 跟传统的虚拟化方式相比具有众多的优势：

- **更高效的利用系统资源**：容器不需要进行硬件虚拟以及运行完整操作系统等额外开销，Docker 对系统资源的利用率更高。
- **更快速的启动时间**：Docker 容器应用，由于直接运行于宿主内核，无需启动完整的操作系统，因此可以做到秒级、甚至毫秒级的启动时间。
- **一致的运行环境**：Docker 的镜像提供了除内核外完整的运行时环境，确保了应用运行环境一致性。
- **持续交付和部署**：Docker 可以通过定制应用镜像来实现持续集成、持续交付、部署。
- **更轻松的迁移**：Docker 确保了执行环境的一致性，使得应用的迁移更加容易。
- **更轻松的维护和扩展**：Docker 使用的分层存储以及镜像的技术，使得应用重复部分的复用更为容易，也使得应用的维护更新更加简单。

### Docker 引擎

Docker 使用客户端-服务器 (C/S) 架构模式，使用远程 API 来管理和创建 Docker 容器。通过 `docker version` 命令查看可以看到 docker 包含一个客户端和服务端的程序：

```
Client: Docker Engine - Community
 Version:           19.03.1
 API version:       1.40
 Go version:        go1.12.5
 Git commit:        74b1e89
 Built:             Thu Jul 25 21:21:07 2019
 OS/Arch:           linux/amd64
 Experimental:      false

Server: Docker Engine - Community
 Engine:
  Version:          19.03.1
  API version:      1.40 (minimum version 1.12)
  Go version:       go1.12.5
  Git commit:       74b1e89
  Built:            Thu Jul 25 21:19:36 2019
  OS/Arch:          linux/amd64
  Experimental:     false
 containerd:
  Version:          1.2.6
  GitCommit:        894b81a4b802e4eb2a91d1ce216b8817763c29fb
 runc:
  Version:          1.0.0-rc8
  GitCommit:        425e105d5a03fabd737a126ad93d62a9eeede87f
 docker-init:
  Version:          0.18.0
  GitCommit:        fec3683
```

Docker 引擎是一个包含以下主要组件的客户端服务器应用程序：

- 一种服务器，它是一种称为守护进程并且长时间运行的程序
- REST API 用于指定程序可以用来与守护进程通信的接口，并指示它做什么
- 一个有命令行界面 (CLI) 工具的客户端

![Docker_引擎](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/Docker/Docker_引擎.png)

### Docker 系统架构

![Docker_系统架构](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/Docker/Docker_系统架构.png)

| 标题            | 说明                                                                          |
| --------------- | ----------------------------------------------------------------------------- |
| 镜像(Images)    | Docker 镜像是用于创建 Docker 容器的模板。                                     |
| 容器(Container) | 容器是独立运行的一个或一组应用。                                              |
| 客户端(Client)  | Docker 客户端通过命令行或者其他工具使用 Docker API 与 Docker 的守护进程通信。 |
| 主机(Host)      | 一个物理或者虚拟的机器用于执行 Docker 守护进程和容器。                        |
| 仓库(Registry)  | Docker 仓库用来保存镜像，可以理解为代码控制中的代码仓库。                     |
| Docker Machine  | Docker Machine 是一个简化 Docker 安装的命令行工具。                           |

## Docker 命令

Docker 命令分管理命令 `Management Commands` 和命令 `Commands`。Docker 1.13+ 引入了管理命令来帮助组织一堆 Docker 命令。两个命令都做同样的事情，管理命令有助于对所有命令进行分类，并使命令本身更加一致。所以推荐使用管理命令，虽然多敲了几个字符，但是语义更清晰。

```shell
docker images                       # 查看现有镜像
docker image ls                     # 查看现有镜像，和上面等同
# docker image ls -f dangling=true  # 查看虚悬镜像，-f 即 --filter，过滤镜像
docker image pull [imageName]       # 拉取镜像
docker image rm [imageName]         # 删除镜像，等同 docker rmi
docker image prune                  # 删除虚悬镜像

docker container ls [-a]            # 列出正在运行的容器，等同于 docker ps，-a 可查看所有容器
docker container run [hello-world]  # 运行容器
docker container exec [containerID] # 进入容器内部
docker container start              # 启动已经生成、已经停止运行的容器文件
docker container stop [containerID] # 终止容器运行
docker container kill [containID]   # 手动杀死终止容器运行
docker container rm [containerID]   # 删除容器，等同 docker rm
docker container logs [containerID] # 查看 docker 容器的输出
docker container cp [containID]:[/path/to/file] . # 从正在运行的 Docker 容器里面，将文件拷贝到本机
docker container prune              # 删除所有停止运行的容器

docker rmi `docker images -q`       # 直接删除所有镜像
docker rm `docker ps -aq`           # 直接删除所有容器
docker rmi `docker images | grep xxxxx | awk '{print $3}'` # 按条件筛选之后删除镜像
docker rm `docker ps -a | grep xxxxx | awk '{print $1}'` # 按条件筛选之后删除容器

docker ps [-a]                      # 查看所有正在运行的容器，-a 可查看所有容器
docker stop [containerID]           # 终止容器运行
docker system df                    # 查看镜像、容器、数据卷所占用的空间

docker volume ls                    # 查看数据卷
docker volume prune                 # 删除无主数据卷

docker inspect [containerID]        # 查看容器状态
```

示例：

```shell
docker rum -it --rm [imageName] bash  # 以交互方式启动容器，停止后自动移除
docker exec -it [containerID] bash    # 以交互方式进入容器
```

需要注意：

1. `docker container run` 命令具有自动抓取 image 文件的功能。如果发现本地没有指定的 image 文件，就会从仓库自动抓取。因此，前面的 `docker image pull` 命令并不是必需的步骤。
2. `docker container run` 是新建容器，每运行一次生成一个容器文件，注意要避免重复执行。可以使用 `docker container start` 启动已生成的容器。
3. `docker container kill` 向容器内主进程发出 SIGKILL 信号来终止容器运行。`docker container stop` 先向主进程发出 SIGTERM 信号，然后过一段时间再发出 SIGKILL 信号。这两个信号的差别是，应用程序收到 SIGTERM 信号以后，可以自行进行收尾清理工作，但也可以不理会这个信号。如果收到 SIGKILL 信号，就会强行立即终止，那些正在进行中的操作会全部丢失。
4. `docker container logs` 查看 docker 容器的输出，即容器里面 Shell 的标准输出。如果 `docker run` 命令运行容器的时候，没有使用 `-it参数`，就要用这个命令查看输出。
5. `docker container exec` 进入容器内部。如果 `docker run` 命令运行容器的时候，没有使用 `-it参数`，就要用这个命令进入容器内部。

## 查看日志

```shell
# 查看日志
$ docker logs [OPTIONS] CONTAINER
  Options:
        --details        显示更多的信息
    -f, --follow         跟踪实时日志
        --since string   显示自某个timestamp之后的日志，或相对时间，如42m（即42分钟）
        --tail string    从日志末尾显示多少行日志， 默认是all
    -t, --timestamps     显示时间戳
        --until string   显示自某个timestamp之前的日志，或相对时间，如42m（即42分钟）

# 查看指定时间后的日志，只显示最后100行
docker logs -f -t --since="2018-02-08" --tail=100 [containID]
# 查看最近30分钟的日志
docker logs --since 30m [containID]
# 查看某时间之后的日志
docker logs -t --since="2018-02-08T13:23:37" [containID]
# 查看某时间段日志
docker logs -t --since="2018-02-08T13:23:37" --until "2018-02-09T12:23:37" [containID]
```

## Docker 容器制作

### 编写 Dockerfile 文件

Dockerfile 文件是一个文本文件，用于配置 image，生成自己的 image 镜像。在配置 Dockerfile 文件之前，需要先添加一个文本文件 `.dockerignore`，用于排除不需要打包进入 image 镜像的文件路径。

```
.git
node_modules
npm-debug.log
```

之后创建 Dockerfile 文本文件，配置如下（摘取自[阮一峰博客 Docker 入门教程](http://www.ruanyifeng.com/blog/2018/02/docker-tutorial.html)）：

```
FROM node:8.4         // 该 image 镜像继承官方 node 8.4 版本的 image
MAINTAINER chanshiyu  // 标明作者
COPY . /app           // 将除 .dockerignore 排除文件外的所有文件 copy 到 /app 目录
WORKDIR /app          // 指定接下来的工作目录为 /app
RUN npm install       // 安装依赖，安装后的所有依赖都将打包到 image 文件
EXPOSE 3000           // 暴露 3000 端口，允许外部连接这个端口
```

### 创建 image 镜像

配置好 Dockerfile 文件之后，即可创建自己的 image 镜像文件：

```shell
# docker image build -t [username]/[repository]:[tag] .
docker image build -t koa-demo:0.0.1 .
```

参数详解： `-t` 用来指定 image 文件的名字，名字后面冒号指定标签，如果不指定默认的标签为 `latest`。最后的参数指定 Dockerfile 文件所在的路径，上例中 Dockerfile 在当前路径，所以为点号 `.`。

### 生成容器

```shell
docker container run --rm -p 8000:3000 -it koa-demo:0.0.1 /bin/bash
```

参数详解：

- `--rm 参数`：容器停止运行时自动删除容器文件
- `-p 参数`：容器的 3000 端口映射到本机的 8000 端口。
- `-it 参数`：容器的 Shell 映射到当前的 Shell，然后你在本机窗口输入的命令，就会传入容器。
- `koa-demo:0.0.1`：image 文件的名字（如果有标签，还需要提供标签，默认是 latest 标签）。
- `/bin/bash`：附加命令，容器启动以后，内部第一个执行的命令。这里是启动 Bash，保证用户可以使用 Shell。

### CMD 命令

上例容器启动之后，需要手动在命令窗口执行 `node index.js` 来运行服务，通过 `CMD 命令` 可以自动执行。我们在 Dockerfile 里添加：

```
FROM node:8.4         // 该 image 镜像继承官方 node 8.4 版本的 image
MAINTAINER chanshiyu  // 标明作者
COPY . /app           // 将除 .dockerignore 排除文件外的所有文件 copy 到 /app 目录
WORKDIR /app          // 指定接下来的工作目录为 /app
RUN npm install       // 安装依赖，安装后的所有依赖都将打包到 image 文件
EXPOSE 3000           // 暴露 3000 端口，允许外部连接这个端口
CMD node demos/01.js  // 容器启动后自动执行
```

需要注意：**添加了 `CMD 命令` 后，启动容器时后面便不能附加命令 `/bin/bash` 了，否则会覆盖 `CMD 命令`** 。

`RUN 命令` 与 `CMD 命令` 的区别：

- `RUN 命令` 在 image 文件的构建阶段执行，执行结果都会打包进入 image 文件；`CMD 命令`则是在容器启动后执行。
- 一个 Dockerfile 可以包含多个 `RUN 命令`，但是只能有一个 `CMD 命令`。

### 发布 image 镜像

```shell
docker login

# docker image tag [imageName] [username]/[repository]:[tag]
docker image tag koa-demos:0.0.1 chanshiyu/koa-demos:0.0.1

docker image push [username]/[repository]:[tag]
```

可以在创建 image 镜像或者发布 image 镜像时标注用户名。

## ENTRYPOINT 与 CMD

ENTRYPOINT 与 CMD 的关系：

- 如果没有定义 ENTRYPOINT，CMD 将作为它的 ENTRYPOINT
- 定义了 ENTRYPOINT 的话，CMD 只为 ENTRYPOINT 提供参数
- CMD 可由 docker run [imageName] 后的命令覆盖，同时覆盖参数

## 问题

### docker 无权限

```shell
sudo chmod 666 /var/run/docker.sock
```

### 打包推送脚本

build.sh：

```shell
#!/usr/bin/env bash

./mvnw clean package -Dmaven.test.skip=true

docker build -t docker.tgnb.cc/live/api-service:2.8.4 .
docker push docker.tgnb.cc/live/api-service:2.8.4
```

Dockerfile

```
FROM openjdk:8-jre
MAINTAINER tg tg@gmail.com

COPY api/target/api-1.0.RELEASE.jar /api-service.jar

ENTRYPOINT ["java","-jar","/api-service.jar", "-Xms6.5g", "-Xmx6.5g","-xx:NewSize=5.5g","-xx:MaxNewSize=5.5g","-XX:MaxDirectMemorySize=1g"]
```

### docker 未启动

```shell
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

```shell
sudo chmod 400 local.cnf
```

重新启动，问题解决！

### docker push 无法推送

报错：

```
denied: requested access to the resource is denied
```

需要修改 tag，然后再推送：

```shell
# 修改 tag
docker tag spring-mybatis:0.0.1 chanshiyu/spring-mybatis:0.0.1

# 推送镜像
docker push chanshiyu/spring-mybatis:0.0.1
```

### docker push 无权限

docker push 时报错：

```
denied: requested access to the resource is denied
```

解决方式：删除客户端配置文件 `~/.docker/config.json`，然后在登录 docker 后即可推送成功。

### sh 脚本无法运行

Linux 执行.sh 文件，提示 `No such file or directory` 的问题，可能是平台之间权限兼容的问题。

首先用 vim 打开该 sh 文件，输入 `:set ff`，回车显示文件编码为 `fileformat=dos`。所以需要重新设置下脚本文件格式，vim 输入 `:set ff=unix`，保存后退出再执行即可。

需要注意：**使用 vagrant 虚拟机进行 maven 打包的时候，需要配置 mvnw 文件编码**。

### x509: certificate signed by unknown authority.

docker 登录报错， `x509: certificate signed by unknown authority.`：

```shell
docker login -u admin -p xxx https://docker.xx.cc
```

### docker-compose: command not found

> Note: If the command docker-compose fails after installation, check your path. You can also create a symbolic link to /usr/bin or any other directory in your path.

For example:

```shell
sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
```

[Install Compose on Linux systems](https://docs.docker.com/compose/install/#install-compose-on-linux-systems)

新增或编辑 `/etc/docker/daemon.json` 文件：

```json
{
  "insecure-registries": ["docker.tgnb.cc"]
}
```

重启 docker：

```shell
sudo service docker restart
```

## 一些文档

[centos docker 安装](https://docs.docker.com/install/linux/docker-ce/centos/)  
[Docker 命令手册](https://www.kancloud.cn/woshigrey/docker/945794)
