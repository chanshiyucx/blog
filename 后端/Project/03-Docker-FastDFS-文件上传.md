# Docker FastDFS 文件上传

## FastDFS 文件服务器

FastDFS 是一个开源的轻量级分布式文件系统，它对文件进行管理，功能包括：文件存储、文件同步、文件访问（文件上传、文件下载）等，解决了大容量存储和负载均衡的问题。

FastDFS 为互联网量身定制，充分考虑了冗余备份、负载均衡、线性扩容等机制，并注重高可用、高性能等指标，使用 FastDFS 很容易搭建一套高性能的文件服务器集群提供文件上传、下载等服务。

FastDFS 服务端有两个角色：跟踪器（tracker）和存储节点（storage）。跟踪器主要做调度工作，在访问上起负载均衡的作用。

存储节点存储文件，完成文件管理的所有功能：就是这样的存储、同步和提供存取接口，FastDFS 同时对文件的 metadata 进行管理。所谓文件的 meta data 就是文件的相关属性，以键值对（key valuepair）方式表示，如：width=1024，其中的 key 为 width，value 为 1024。文件 metadata 是文件属性列表，可以包含多个键值对。

跟踪器和存储节点都可以由一台或多台服务器构成。跟踪器和存储节点中的服务器均可以随时增加或下线而不会影响线上服务。其中跟踪器中的所有服务器都是对等的，可以根据服务器的压力情况随时增加或减少。

### 上传交互过程

- client 询问 tracker 上传到的 storage，不需要附加参数
- tracker 返回一台可用的 storage
- client 直接和 storage 通讯完成文件上传

### 下载交互过程

- client 询问 tracker 下载文件的 storage，参数为文件标识（卷名和文件名）
- tracker 返回一台可用的 storage
- client 直接和 storage 通讯完成文件下载

![fastdfs](https://raw.githubusercontent.com/chanshiyucx/poi/master/2019/Java%E4%BB%BF%E5%BE%AE%E4%BF%A1%E5%85%A8%E6%A0%88/12_fastdfs.jpg)

## 准备依赖

首先下载依赖包：

- [fastdfs-5.11.tar.gz](https://github.com/happyfish100/fastdfs)
- [fastdfs-nginx-module.tar.gz](https://github.com/happyfish100/fastdfs-nginx-module)
- [libfastcommon-1.0.39.tar.gz](https://github.com/happyfish100/libfastcommon)
- [nginx-1.15.4.tar.gz](http://nginx.org/download/nginx-1.15.4.tar.gz)

需要注意：`fastdfs-nginx-module.tar.gz` 这个包从 github release 下载下来会多压缩一层目录，先解压处理后再压缩。

## 配置文件

![fastdfs_文件上传](https://raw.githubusercontent.com/chanshiyucx/poi/master/2019/Java%E4%BB%BF%E5%BE%AE%E4%BF%A1%E5%85%A8%E6%A0%88/fastdfs_%E6%96%87%E4%BB%B6%E4%B8%8A%E4%BC%A0.png)

### docker-compose.yml

```
version: "3.1"

services:
  fastdfs:
    build: environment
    restart: always
    container_name: shiyu-fastdfs
    volumes:
      - ./storage:/fastdfs/storage
    network_mode: host
```

### Dockerfile

```
FROM ubuntu:xenial
MAINTAINER me@chanshiyu.com

# 更新数据源
WORKDIR /etc/apt
RUN echo 'deb http://mirrors.aliyun.com/ubuntu/ xenial main restricted universe multiverse' > sources.list
RUN echo 'deb http://mirrors.aliyun.com/ubuntu/ xenial-security main restricted universe multiverse' >> sources.list
RUN echo 'deb http://mirrors.aliyun.com/ubuntu/ xenial-updates main restricted universe multiverse' >> sources.list
RUN echo 'deb http://mirrors.aliyun.com/ubuntu/ xenial-backports main restricted universe multiverse' >> sources.list
RUN apt-get update

# 安装依赖
RUN apt-get install make gcc libpcre3-dev zlib1g-dev --assume-yes

# 复制工具包
ADD fastdfs-5.11.tar.gz /usr/local/src
ADD fastdfs-nginx-module.tar.gz /usr/local/src
ADD libfastcommon-1.0.39.tar.gz /usr/local/src
ADD nginx-1.15.4.tar.gz /usr/local/src

# 安装 libfastcommon
WORKDIR /usr/local/src/libfastcommon-1.0.39
RUN ./make.sh && ./make.sh install

# 安装 FastDFS
WORKDIR /usr/local/src/fastdfs-5.11
RUN ./make.sh && ./make.sh install

# 配置 FastDFS 跟踪器
ADD tracker.conf /etc/fdfs
RUN mkdir -p /fastdfs/tracker

# 配置 FastDFS 存储
ADD storage.conf /etc/fdfs
RUN mkdir -p /fastdfs/storage

# 配置 FastDFS 客户端
ADD client.conf /etc/fdfs

# 配置 fastdfs-nginx-module
ADD config /usr/local/src/fastdfs-nginx-module/src

# FastDFS 与 Nginx 集成
WORKDIR /usr/local/src/nginx-1.15.4
RUN ./configure --add-module=/usr/local/src/fastdfs-nginx-module/src
RUN make && make install
ADD mod_fastdfs.conf /etc/fdfs

WORKDIR /usr/local/src/fastdfs-5.11/conf
RUN cp http.conf mime.types /etc/fdfs/

# 配置 Nginx
ADD nginx.conf /usr/local/nginx/conf

COPY entrypoint.sh /usr/local/bin/
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

WORKDIR /
EXPOSE 8888
CMD ["/bin/bash"]FROM ubuntu:xenial
MAINTAINER me@chanshiyu.com

# 更新数据源
WORKDIR /etc/apt
RUN echo 'deb http://mirrors.aliyun.com/ubuntu/ xenial main restricted universe multiverse' > sources.list
RUN echo 'deb http://mirrors.aliyun.com/ubuntu/ xenial-security main restricted universe multiverse' >> sources.list
RUN echo 'deb http://mirrors.aliyun.com/ubuntu/ xenial-updates main restricted universe multiverse' >> sources.list
RUN echo 'deb http://mirrors.aliyun.com/ubuntu/ xenial-backports main restricted universe multiverse' >> sources.list
RUN apt-get update

# 安装依赖
RUN apt-get install make gcc libpcre3-dev zlib1g-dev --assume-yes

# 复制工具包
ADD fastdfs-5.11.tar.gz /usr/local/src
ADD fastdfs-nginx-module.tar.gz /usr/local/src
ADD libfastcommon-1.0.39.tar.gz /usr/local/src
ADD nginx-1.15.4.tar.gz /usr/local/src

# 安装 libfastcommon
WORKDIR /usr/local/src/libfastcommon-1.0.39
RUN ./make.sh && ./make.sh install

# 安装 FastDFS
WORKDIR /usr/local/src/fastdfs-5.11
RUN ./make.sh && ./make.sh install

# 配置 FastDFS 跟踪器
ADD tracker.conf /etc/fdfs
RUN mkdir -p /fastdfs/tracker

# 配置 FastDFS 存储
ADD storage.conf /etc/fdfs
RUN mkdir -p /fastdfs/storage

# 配置 FastDFS 客户端
ADD client.conf /etc/fdfs

# 配置 fastdfs-nginx-module
ADD config /usr/local/src/fastdfs-nginx-module/src

# FastDFS 与 Nginx 集成
WORKDIR /usr/local/src/nginx-1.15.4
RUN ./configure --add-module=/usr/local/src/fastdfs-nginx-module/src
RUN make && make install
ADD mod_fastdfs.conf /etc/fdfs

WORKDIR /usr/local/src/fastdfs-5.11/conf
RUN cp http.conf mime.types /etc/fdfs/

# 配置 Nginx
ADD nginx.conf /usr/local/nginx/conf

COPY entrypoint.sh /usr/local/bin/
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

WORKDIR /
EXPOSE 8888
CMD ["/bin/bash"]FROM ubuntu:xenial
MAINTAINER me@chanshiyu.com

# 更新数据源
WORKDIR /etc/apt
RUN echo 'deb http://mirrors.aliyun.com/ubuntu/ xenial main restricted universe multiverse' > sources.list
RUN echo 'deb http://mirrors.aliyun.com/ubuntu/ xenial-security main restricted universe multiverse' >> sources.list
RUN echo 'deb http://mirrors.aliyun.com/ubuntu/ xenial-updates main restricted universe multiverse' >> sources.list
RUN echo 'deb http://mirrors.aliyun.com/ubuntu/ xenial-backports main restricted universe multiverse' >> sources.list
RUN apt-get update

# 安装依赖
RUN apt-get install make gcc libpcre3-dev zlib1g-dev --assume-yes

# 复制工具包
ADD fastdfs-5.11.tar.gz /usr/local/src
ADD fastdfs-nginx-module.tar.gz /usr/local/src
ADD libfastcommon-1.0.39.tar.gz /usr/local/src
ADD nginx-1.15.4.tar.gz /usr/local/src

# 安装 libfastcommon
WORKDIR /usr/local/src/libfastcommon-1.0.39
RUN ./make.sh && ./make.sh install

# 安装 FastDFS
WORKDIR /usr/local/src/fastdfs-5.11
RUN ./make.sh && ./make.sh install

# 配置 FastDFS 跟踪器
ADD tracker.conf /etc/fdfs
RUN mkdir -p /fastdfs/tracker

# 配置 FastDFS 存储
ADD storage.conf /etc/fdfs
RUN mkdir -p /fastdfs/storage

# 配置 FastDFS 客户端
ADD client.conf /etc/fdfs

# 配置 fastdfs-nginx-module
ADD config /usr/local/src/fastdfs-nginx-module/src

# FastDFS 与 Nginx 集成
WORKDIR /usr/local/src/nginx-1.15.4
RUN ./configure --add-module=/usr/local/src/fastdfs-nginx-module/src
RUN make && make install
ADD mod_fastdfs.conf /etc/fdfs

WORKDIR /usr/local/src/fastdfs-5.11/conf
RUN cp http.conf mime.types /etc/fdfs/

# 配置 Nginx
ADD nginx.conf /usr/local/nginx/conf

COPY entrypoint.sh /usr/local/bin/
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

WORKDIR /
EXPOSE 8888
CMD ["/bin/bash"]
```

### entrypoint.sh

Shell 创建后是无法直接使用的，需要赋予执行的权限，使用 `chmod +x entrypoint.sh` 命令。

```
#!/bin/sh
/etc/init.d/fdfs_trackerd start
/etc/init.d/fdfs_storaged start
/usr/local/nginx/sbin/nginx -g 'daemon off;'
```

### tracker.conf

FastDFS 跟踪器配置，容器中路径为：/etc/fdfs，修改为：

```
base_path=/fastdfs/tracker
```

### storage.conf

FastDFS 存储配置，容器中路径为：/etc/fdfs，修改为：

```
base_path=/fastdfs/storage
store_path0=/fastdfs/storage
tracker_server=192.168.205.10:22122
http.server_port=8888
```

### client.conf

FastDFS 客户端配置，容器中路径为：/etc/fdfs，修改为：

```
base_path=/fastdfs/tracker
tracker_server=192.168.205.10:22122
```

### config

fastdfs-nginx-module 配置文件，容器中路径为：/usr/local/src/fastdfs-nginx-module/src，修改为：

```
CORE_INCS="$CORE_INCS /usr/include/fastdfs /usr/include/fastcommon/"
CORE_LIBS="$CORE_LIBS -L/usr/lib -lfastcommon -lfdfsclient"
```

### mod_fastdfs.conf

fastdfs-nginx-module 配置文件，容器中路径为：/usr/local/src/fastdfs-nginx-module/src，修改为：

```
connect_timeout=10
tracker_server=192.168.205.10:22122
url_have_group_name = true
store_path0=/fastdfs/storage
```

### nginx.conf

Nginx 配置文件，容器中路径为：/usr/local/src/nginx-1.13.6/conf，修改为：

```
user  root;
worker_processes  1;

events {
    worker_connections  1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;

    sendfile        on;

    keepalive_timeout  65;

    server {
        listen       8888;
        server_name  localhost;

        location ~/group([0-9])/M00 {
            ngx_fastdfs_module;
        }

        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }
    }
}
```

## 启动容器并测试

```bash
# 启动容器
docker-compose up -d

# 进入容器
docker exec -it fastdfs /bin/bash

# 上传文件
/usr/bin/fdfs_upload_file /etc/fdfs/client.conf /usr/local/src/fastdfs-5.11/INSTALL
```

上传成功返回文件路径 `group1/M00/00/00/wKjNCl1zlSCAF-5lAAAeS70IE2U2766292`，加上主机 ip 即可访问 `http://192.168.205.10:8888/group1/M00/00/00/wKjNCl1zlSCAF-5lAAAeS70IE2U2766292`。

参考文章：  
[fastdfs wiki](https://github.com/happyfish100/fastdfs/wiki)  
[基于 Docker 安装 FastDFS](https://www.funtl.com/zh/apache-dubbo-codeing/FastDFS-安装.html)
