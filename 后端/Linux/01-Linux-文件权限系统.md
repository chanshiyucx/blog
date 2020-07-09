# Linux

## 文件系统

![Linux的目录结构](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/Linux/Linux的目录结构.png)

| 目录 | 说明                                                                     |
| ---- | ------------------------------------------------------------------------ |
| bin  | 存放二进制可执行文件                                                     |
| sbin | 存放二进制可执行文件，只有 root 才能访问                                 |
| boot | 存放用于系统引导时使用的各种文件                                         |
| dev  | 用于存放设备文件                                                         |
| etc  | 存放系统配置文件                                                         |
| root | 超级用户目录                                                             |
| home | 存放所有用户文件的根目录                                                 |
| lib  | 存放跟文件系统中的程序运行所需要的共享库及内核模块                       |
| mnt  | 系统管理员安装临时文件系统的安装点                                       |
| opt  | 额外安装的可选应用程序包所放置的位置                                     |
| proc | 虚拟文件系统，存放当前内存的映射                                         |
| tmp  | 用于存放各种临时文件                                                     |
| usr  | 用于存放系统应用程序，比较重要的目录 `/usr/local` 本地管理员软件安装目录 |
| var  | 用于存放运行时需要改变数据的文件                                         |

## 常见命令

### 命令基本格式

`[chan@localhost ~]$` 命令提示符：

- `chan` 表示当前登录用户，`root` 是超级管理员
- `localhost` 表示主机名
- `~` 表示当前目录（家目录），其中超级管理员家目录为 `/root`，普通用户家目录为 `/home/chan`
- `$` 表示普通用户提示符，`#` 表示超级管理员提示符

Linux 命令格式：`命令 [选项] [参数]`，需要注意：个别命令不遵守此规则，选项可以简化，如一些命令 `-a` 等同于 `--all`。

### 登录

```shell
# ssh -i [pem.file] [user]@[ip]
ssh -i LightsailDefaultKey-ap-southeast-1.pem centos@18.141.12.215
```

### 文件传输

```shell
scp -rp -i yourfile.pem ~/local_directory username@instance_url:directory
```

### 系统管理命令

| 命令     | 说明                                          |
| -------- | --------------------------------------------- |
| stat     | 显示指定文件的相关信息,比 ls 命令显示内容更多 |
| who      | 显示在线登录用户                              |
| hostname | 显示主机名称                                  |
| uname    | 显示系统信息                                  |
| top      | 显示当前系统中耗费资源最多的进程              |
| ps       | 显示瞬间的进程状态                            |
| du       | 显示指定的文件（目录）已使用的磁盘空间的总量  |
| df       | 显示文件系统磁盘空间的使用情况                |
| free     | 显示当前内存和交换空间的使用情况              |
| ifconfig | 显示网络接口信息                              |
| ping     | 测试网络的连通性                              |
| netstat  | 显示网络状态信息                              |
| clear    | 清屏                                          |
| kill     | 杀死一个进程                                  |

### 文件目录命令

| 命令  | 说明                         | 语法                                  | 参数 | 参数说明                           |
| ----- | ---------------------------- | ------------------------------------- | ---- | ---------------------------------- |
| ls    | 显示文件和目录列表           | ls                                    |      |                                    |
|       |                              |                                       | -l   | 列出文件的详细信息                 |
|       |                              |                                       | -a   | 列出当前目录所有文件，包含隐藏文件 |
| mkdir | 创建目录                     | mkdir [-p] dirName                    |      |                                    |
|       |                              |                                       | -p   | 嵌套生成目录                       |
| cd    | 切换目录                     |                                       |      |                                    |
| touch | 生成一个空文件               |                                       |      |                                    |
| echo  | 生成一个带内容文件           | echo abcd > 1.txt，echo 1234 >> 1.txt |      |                                    |
| cat   | 显示文本文件内容             | cat                                   |      |                                    |
| cp    | 复制文件或目录               | cp [options] source dest              |      |                                    |
| rm    | 删除文件                     | rm [options] name                     |      |                                    |
|       |                              |                                       | -f   | 强制删除文件或目录                 |
|       |                              |                                       | -r   | 同时删除该目录下的所有文件         |
| mv    | 移动文件或目录               | mv [options] source dest              |      |                                    |
| find  | 查找指定的文件               |                                       |      |                                    |
| grep  | 在文本文件中查找指定的字符串 |                                       |      |                                    |
| tree  | 以树状图列出目录的内容       |                                       |      |                                    |
| pwd   | 显示当前工作目录             |                                       |      |                                    |
| ln    | 建立软链接                   |                                       |      |                                    |
| more  | 分页显示文本文件内容         |                                       |      |                                    |
| head  | 显示文件开头内容             |                                       |      |                                    |
| tail  | 显示文件结尾内容             |                                       |      |                                    |
|       |                              |                                       | -f   | 跟踪输出                           |

### 文件压缩命令

| 命令 | 语法                                        | 参数 | 参数说明                        |
| ---- | ------------------------------------------- | ---- | ------------------------------- |
| tar  | tar [-cxzjvf] 压缩打包文档的名称 欲打包目录 |      |                                 |
|      |                                             | -c   | 建立一个归档文件的参数指令      |
|      |                                             | -x   | 解开一个归档文件的参数指令      |
|      |                                             | -z   | 是否需要用 gzip 压缩            |
|      |                                             | -j   | 是否需要用 bzip2 压缩           |
|      |                                             | -v   | 压缩的过程中显示文件            |
|      |                                             | -f   | 使用档名，在 f 之后要立即接档名 |
|      |                                             | -tf  | 查看归档文件里面的文件          |

例子：

压缩文件夹：`tar -czvf test.tar.gz test\`  
解压文件夹：`tar -xzvf test.tar.gz`

### 文件搜索命令

- `locate`：在后台数据库搜索文件
- `updatedb`：更新后台数据库
- `whereis`：搜索系统命令所在位置
- `which`：搜索命令所在路径及别名
- `find`：搜索文件或文件夹

## 用户和组

**Linux 操作系统是一个多用户操作系统，它允许多用户同时登录到系统上并使用资源**。系统会根据账户来区分每个用户的文件，进程，任务和工作环境，使得每个用户工作都不受干扰。

### Root 账户

```bash
# 设置 Root 账户密码
sudo passwd root

# 切换到 Root
su
```

### 允许远程登录 Root

需要编辑 ssh 配置文件并重启服务：

```bash
vi /etc/ssh/sshd_config
```

```conf
LoginGraceTime 120
PermitRootLogin yes
StrictModes yes
```

最后重启服务：

```bash
service ssh restart
```

### 账户管理

```bash
# 增加用户
useradd 用户名
useradd -u (UID号)
useradd -p (口令)
useradd -g (分组)
useradd -s (SHELL)
useradd -d (用户目录)

# 修改用户
usermod -u (新UID)
usermod -d (用户目录)
usermod -g (组名)
usermod -s (SHELL)
usermod -p (新口令)
usermod -l (新登录名)
usermod -L (锁定用户账号密码)
usermod -U (解锁用户账号)

# 删除用户
userdel 用户名 (删除用户账号)
userdel -r 删除账号时同时删除目录

# 口令维护
passwd 用户账户名 (设置用户口令)
passwd -l 用户账户名 (锁定用户账户)
passwd -u 用户账户名 (解锁用户账户)
passwd -d 用户账户名 (删除账户口令)
gpasswd -a 用户账户名 组账户名 (将指定用户添加到指定组)
gpasswd -d 用户账户名 组账户名 (将用户从指定组中删除)
gpasswd -A 用户账户名 组账户名 (将用户指定为组的管理员)

# 组账户维护
groupadd 组账户名 (创建新组)
groupadd -g 指定组GID
groupmod -g 更改组的GID
groupmod -n 更改组账户名
groupdel 组账户名 (删除指定组账户)

# 用户和组状态
su 用户名(切换用户账户)
id 用户名(显示用户的UID，GID)
whoami (显示当前用户名称)
groups (显示用户所属组)
```

## 权限管理

### 查看文件和目录的权限

```
-rwxrwxrwx. 1 vagrant vagrant 1170 Sep 12 11:06 docker-compose.yml
```

说明：

- -：文档类型，- 为普通文件
- rwx：说明用户 vagrant 可读可写可运行
- rwx：表示用户组 vagrant 可读可写可运行
- rwx：其他用户可读可写可运行

### 更改权限

#### chown

change owner 的意思，主要作用就是改变文件或者目录所有者，所有者包含用户和用户组。

- chown [-R] 用户名称 文件或者目录
- chown [-R] 用户名称 用户组名称 文件或目录

-R：进行递归式的权限更改，将目录下的所有文件、子目录更新为指定用户组权限

#### chmod

改变访问权限。

- chmod [who][+ | - | =] [mode] 文件名

参数说明：

- who：表示操作对象可以是以下字母的一个或者组合
  - u：用户 user
  - g：用户组 group
  - o：表示其他用户
  - a：表示所有用户是系统默认的
- 操作符号：需要进行的权限操作
  - +：表示添加某个权限
  - -：表示取消某个权限
  - =：赋予给定的权限，取消文档以前的所有权限
- mode：表示可执行的权限，可以是 r、w、x
- 文件名：文件名可以使空格分开的文件列表

示例：

```bash
chmod u=rwx,g+r,o+r test.txt
```

#### 数字设定法

数字设定法中数字表示的含义：

- 0 表示没有任何权限
- 1 表示有可执行权限 = x
- 2 表示有可写权限 = w
- 4 表示有可读权限 = r

简单示例：

```bash
chmod 755 file_name
```

755 具体含义如下：

| r w x | r – x | r - x  |
| ----- | ----- | ------ |
| 4 2 1 | 4 - 1 | 4 - 1  |
| user  | group | others |

## 常用命令

```sh
# 查看空间占用
df -h

# 查看文件大小
du -sh ./*

# 清空文件
> access.log
```
