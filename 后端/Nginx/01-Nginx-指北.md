# Nginx 指北

> 本文为个人学习摘要笔记。  
> 原文地址：[关于 Nginx，你还在背诵那些培训机构教给你的内容么？](http://www.justdojava.com/2019/09/16/java-Nginx/)

## 什么是 Nginx

Nginx 是一个高性能的 HTTP 和反向代理 web 服务器，同时也提供了 IMAP/POP3/SMTP 服务。其特点是占有内存少，并发能力强。

总结下来就几点内容：

- HTTP 和反向代理 web 服务器
- IMAP/POP3/SMTP 服务

Nginx 优点：

- Nginx 使用基于事件驱动架构，使得其可以支持数以百万级别的 TCP 连接
- 高度的模块化和自由软件许可证使得第三方模块层出不穷
- Nginx 是一个跨平台服务器，可以运行在 Linux、Windows、Mac OS 等操作系统上

## Nginx 的代理

所谓代理，就是一个代表、一个渠道，代理过程涉及到两个角色，一个是被代理角色，一个是目标角色，被代理角色通过这个代理访问目标角色完成一些任务的过程称为代理操作过程。

代理又分为了 2 种，一种是正向代理，一种是反向代理。

### 正向代理

最经典的正向代理莫过于翻墙，我们访问国外的网站的时候，是没有办法进行访问的，这时候就得需要一个代理服务器，我们把请求发给代理服务器，代理服务器去访问国外的网站，然后将访问到的数据传递给我们！

这种代理模式称为正向代理，正向代理最大的特点是客户端非常明确要访问的服务器地址；服务器只清楚请求来自哪个代理服务器，而不清楚来自哪个具体的客户端；正向代理模式屏蔽或者隐藏了真实客户端信息。

正向代理的用途：

- 访问原来无法访问的资源，如 Google
- 可以做缓存，加速访问资源
- 对客户端访问授权，上网进行认证
- 代理可以记录用户访问记录（上网行为管理），对外隐藏用户信息

### 反向代理

反向代理最经典的应用即分布式，通过部署多台服务器来解决访问人数限制的问题。

反向代理的用途：

- 保证内网的安全，通常将反向代理作为公网访问地址，Web 服务器是内网
- 负载均衡，通过反向代理服务器来优化网站的负载

## Nginx 配置

配置文件详解：

| 文件       | 作用                                |
| ---------- | ----------------------------------- |
| nginx.conf | nginx 的基本配置文件                |
| mime.types | 与 fastcgi 相关的配置               |
| proxy.conf | 与 proxy 相关的配置                 |
| sites.conf | 配置 nginx 提供的网站，包括虚拟主机 |

这里主要讲解 `nginx.conf` 文件，`nginx.conf` 配置文件主要分成四个部分：

- main：全局设置，影响其它部分所有设置
- server：主机服务相关设置，主要用于指定虚拟主机域名、IP 和端口
- location：URL 匹配特定位置后的设置，反向代理、内容篡改相关设置
- upstream：上游服务器设置，负载均衡相关配置

他们之间的关系式：**server 继承 main，location 继承 server；upstream 既不会继承指令也不会被继承**。

通用配置说明：

```conf
# 定义nginx运行的用户和用户组，默认由nobody账号运行
user nobody;

# 允许生成的进程数，建议设置为等于CPU总核心数，可以和worker_cpu_affinity配合
worker_processes 1;

# 制定日志路径，级别 [ debug | info | notice | warn | error | crit ]，这个设置可以放入全局块，http块，server块
#error_log logs/error.log;
#error_log logs/error.log notice;
#error_log logs/error.log info;

# 指定nginx进程运行文件存放地址
#pid        logs/nginx.pid;

# 一个nginx进程打开的最多文件描述符(句柄)数目，理论值应该是最多打开文件数（系统的值ulimit -n）与nginx进程数相除，
# 但是nginx分配请求并不均匀，所以建议与ulimit -n的值保持一致。
worker_rlimit_nofile 65535;

# 工作模式与连接数上限
events {
    # 设置网路连接序列化，防止惊群现象发生，默认为on
    accept_mutex on;
    # 设置一个进程是否同时接受多个网络连接，默认为off
    multi_accept on;
    # 事件驱动模型，use [ kqueue | rtsig | epoll | /dev/poll | select | poll ];
    use epoll;
    # 每个进程允许的最多连接数
    connections 20000;
    # 单个进程最大连接数（最大连接数=连接数*进程数）该值受系统进程最大打开文件数限制，需要使用命令ulimit -n 查看当前设置，默认为512
    worker_connections 65535;
}

# 设定http服务器
http {
    # 文件扩展名与文件类型映射表，include 是个主模块指令，可以将配置文件拆分并引用，可以减少主配置文件的复杂度
    include mime.types;
    # 默认文件类型，默认为text/plain
    default_type application/octet-stream;
    # charset utf-8; #默认编码

    # 定义虚拟主机日志的格式
    # log_format main '$remote_addr - $remote_user [$time_local] "$request" '
    #                 '$status $body_bytes_sent "$http_referer" '
    #                 '"$http_user_agent" "$http_x_forwarded_for"';

    # 定义虚拟主机访问日志
    #access_log logs/access.log main;

    # 开启高效文件传输模式
    sendfile on;
    # 开启目录列表访问，合适下载服务器，默认关闭。
    # autoindex on;

    # 防止网络阻塞
    # tcp_nopush on;

    # 长连接超时时间，单位是秒，默认为0
    keepalive_timeout 65;

    # gzip压缩功能设置
    gzip on; # 开启gzip压缩输出
    gzip_min_length 1k; # 最小压缩文件大小
    gzip_buffers 4 16k; # 压缩缓冲区
    gzip_http_version 1.0; # 压缩版本（默认1.1，前端如果是squid2.5请使用1.0）
    gzip_comp_level 6; # 压缩等级
    # 压缩类型，默认就已经包含text/html，所以下面就不用再写了，写上去也不会有问题，但是会有一个warn。
    gzip_types text/plain text/css text/javascript application/json application/javascript application/x-javascript application/xml;
    gzip_vary on; //和http头有关系，加个vary头，给代理服务器用的，有的浏览器支持压缩，有的不支持，所以避免浪费不支持的也压缩，所以根据客户端的HTTP头来判断，是否需要压缩
    # limit_zone crawler $binary_remote_addr 10m; # 开启限制IP连接数的时候需要使用

    # http_proxy服务全局设置
    client_max_body_size 10m;
    client_body_buffer_size 128k;
    proxy_connect_timeout 75;
    proxy_send_timeout 75;
    proxy_read_timeout 75;
    proxy_buffer_size 4k;
    proxy_buffers 4 32k;
    proxy_busy_buffers_size 64k;
    proxy_temp_file_write_size 64k;
    proxy_temp_path /usr/local/nginx/proxy_temp 1 2;

    # 设定负载均衡后台服务器列表
    upstream backend.com  {
        # ip_hash; # 指定支持的调度算法
        # upstream 的负载均衡，weight 是权重，可以根据机器配置定义权重。weigth 参数表示权值，权值越高被分配到的几率越大。
        server 192.168.10.100:8080 max_fails=2 fail_timeout=30s ;
        server 192.168.10.101:8080 max_fails=2 fail_timeout=30s ;
    }

    # 虚拟主机的配置
    server {
        # 监听端口
        listen       80;
        # 域名可以有多个，用空格隔开
        server_name  localhost fontend.com;
        # Server Side Include，通常称为服务器端嵌入
        # ssi on;
        # 默认编码
        # charset utf-8;
        # 定义本虚拟主机的访问日志
        # access_log  logs/host.access.log  main;

        # 因为所有的地址都以 / 开头，所以这条规则将匹配到所有请求
        location / {
            root   html;
            index  index.html index.htm;
        }

        # error_page  404              /404.html;

        # redirect server error pages to the static page /50x.html
        #
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }

       # 图片缓存时间设置
       location ~ .*.(gif|jpg|jpeg|png|bmp|swf)$ {
          expires 10d;
       }

       # JS和CSS缓存时间设置
       location ~ .*.(js|css)?$ {
          expires 1h;
       }
    }
}
```

## 使用 Nginx 过滤网络爬虫

Nginx 可以非常容易地根据 `User-Agent` 过滤请求，我们只需要在需要 URL 入口位置通过一个简单的正则表达式就可以过滤不符合要求的爬虫请求：

```conf
location / {
    if ($http_user_agent ~* "python|curl|java|wget|httpclient|okhttp") {
        return 503;
    }
    # 正常处理
    ...
}
```

变量 `$http_user_agent` 是一个可以直接在 `location` 中引用的 Nginx 变量。`~*` 表示不区分大小写的正则匹配，通过 python 就可以过滤掉 80% 的 Python 爬虫。
