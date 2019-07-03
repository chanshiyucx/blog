# 26 Docker 小本本

Docker 属于 Linux 容器的一种封装，它是目前最流行的容器解决方案。容器有点像虚拟机，提供虚拟化的环境。Docker 本身并不是容器，它是创建容器的工具，是应用容器引擎。

## 关于 Docker

> Build, Ship and Run. Build once，Run anywhere.

Docker 的主要用途，目前有三大类：

1. `提供一次性的环境`：比如，本地测试他人的软件、持续集成的时候提供单元测试和构建的环境。
2. `提供弹性的云服务`：因为 Docker 容器可以随开随关，很适合动态扩容和缩容。
3. `组建微服务架构`：通过多个容器，一台机器可以跑多个服务，因此在本机就可以模拟出微服务架构。

在 Docker 中，有两大核心概念 image（镜像）和 container（容器）。Docker 把应用程序及其依赖打包在 image 文件里面。只有通过这个文件，才能生成 container。

我们以编程语言中的类和实例的关系来类比 image 和 container。其中 image 好比一个 Class 类文件，container 就是类的实例，image 是创建 container 的模板，image 可以“继承”自其他 image 文件，每个 container 容器都是由一个 image 生成，同一个 image 文件，可以生成多个同时运行的 container 实例。

image 镜像生成的 conatiner 实例，本身也是一个文件，称为容器文件。所以一旦容器生成，就会同时存在两个文件：image 文件和 container 文件。关闭容器并不会删除容器文件，只是容器停止运行而已。

## Docker 容器制作

### 编写 Dockerfile 文件

Dockerfile 文件是一个文本文件，用于配置 image，生成自己的 image 镜像。在配置 Dockerfile 文件之前，需要先添加一个文本文件 `.dockerignore`，用于排除不需要打包进入 image 镜像的文件路径。

```text
.git
node_modules
npm-debug.log
```

之后创建 Dockerfile 文本文件，配置如下（摘取自[阮一峰博客 Docker 入门教程](http://www.ruanyifeng.com/blog/2018/02/docker-tutorial.html)）：

```text
FROM node:8.4         // 该 image 镜像继承官方 node 8.4 版本的 image
MAINTAINER chanshiyu  // 标明作者
COPY . /app           // 将除 .dockerignore 排除文件外的所有文件 copy 到 /app 目录
WORKDIR /app          // 指定接下来的工作目录为 /app
RUN npm install       // 安装依赖，安装后的所有依赖都将打包到 image 文件
EXPOSE 3000           // 暴露 3000 端口，允许外部连接这个端口
```

### 创建 image 镜像

配置好 Dockerfile 文件之后，即可创建自己的 image 镜像文件：

```bash
# docker image build -t [username]/[repository]:[tag] .
docker image build -t koa-demo:0.0.1 .
```

参数详解： `-t` 用来指定 image 文件的名字，名字后面冒号指定标签，如果不指定默认的标签为 `latest`。最后的参数指定 Dockerfile 文件所在的路径，上例中 Dockerfile 在当前路径，所以为点号 `.`。

### 生成容器

```bash
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

```text
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

```bash
docker login

# docker image tag [imageName] [username]/[repository]:[tag]
docker image tag koa-demos:0.0.1 chanshiyu/koa-demos:0.0.1

docker image push [username]/[repository]:[tag]
```

可以在创建 image 镜像或者发布 image 镜像时标注用户名。

## Docker 命令

Docker 命令分管理命令 `Management Commands` 和命令 `Commands`。Docker 1.13+ 引入了管理命令来帮助组织一堆 Docker 命令。两个命令都做同样的事情，管理命令有助于对所有命令进行分类，并使命令本身更加一致。所以推荐使用管理命令，虽然多敲了几个字符，但是语义更清晰。

```bash
docker images ls                    # 查看现有镜像
docker image pull [imageName]       # 拉取镜像
docker image rm [imageName]         # 删除镜像

docker container ls                 # 列出正在运行的容器 等同于 docker ps
docker container ls --al            # 列出本机所有容器，包括终止运行的容器
docker container run [hello-world]  # 运行容器
docker container start              # 启动已经生成、已经停止运行的容器文件
docker container stop [containerID] # 终止容器运行
docker container kill [containID]   # 手动杀死终止容器运行
docker container rm [containerID]   # 删除容器
docker container logs [containerID] # 查看 docker 容器的输出
docker container exec [containerID] # 进入容器内部
docker container cp [containID]:[/path/to/file] . # 从正在运行的 Docker 容器里面，将文件拷贝到本机
```

需要注意：

1. `docker container run` 命令具有自动抓取 image 文件的功能。如果发现本地没有指定的 image 文件，就会从仓库自动抓取。因此，前面的 `docker image pull` 命令并不是必需的步骤。
2. `docker container run` 是新建容器，每运行一次生成一个容器文件，注意要避免重复执行。可以使用 `docker container start` 启动已生成的容器。
3. `docker container kill` 向容器内主进程发出 SIGKILL 信号来终止容器运行。`docker container stop` 先向主进程发出 SIGTERM 信号，然后过一段时间再发出 SIGKILL 信号。这两个信号的差别是，应用程序收到 SIGTERM 信号以后，可以自行进行收尾清理工作，但也可以不理会这个信号。如果收到 SIGKILL 信号，就会强行立即终止，那些正在进行中的操作会全部丢失。
4. `docker container logs` 查看 docker 容器的输出，即容器里面 Shell 的标准输出。如果 `docker run` 命令运行容器的时候，没有使用 `-it参数`，就要用这个命令查看输出。
5. `docker container exec` 进入容器内部。如果 `docker run` 命令运行容器的时候，没有使用 `-it参数`，就要用这个命令进入容器内部。
