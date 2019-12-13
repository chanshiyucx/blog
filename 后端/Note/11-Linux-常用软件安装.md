# Linux 常用软件安装

## Java

### 下载

```shell
# 解压
tar -zxvf jdk-8u152-linux-x64.tar.gz

# 创建目录
mkdir -p /usr/local/java

# 移动安装包
mv jdk1.8.0_152/ /usr/local/java/

# 设置所有者
chown -R root:root /usr/local/java/
```

### 配置环境变量

配置系统环境变量 `/etc/profile`，添加后面三句即可：

```
PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games"
export JAVA_HOME=/usr/local/java/jdk1.8.0_152
export JRE_HOME=/usr/local/java/jdk1.8.0_152/jre
export CLASSPATH=$CLASSPATH:$JAVA_HOME/lib:$JAVA_HOME/jre/lib
```

配置用户环境变量 `/etc/profile`，注意将添加的环境变量放在中间：

```
if [ "$PS1" ]; then
  if [ "$BASH" ] && [ "$BASH" != "/bin/sh" ]; then
    # The file bash.bashrc already sets the default PS1.
    # PS1='\h:\w\$ '
    if [ -f /etc/bash.bashrc ]; then
      . /etc/bash.bashrc
    fi
  else
    if [ "`id -u`" -eq 0 ]; then
      PS1='# '
    else
      PS1='$ '
    fi
  fi
fi

export JAVA_HOME=/usr/local/java/jdk1.8.0_152
export JRE_HOME=/usr/local/java/jdk1.8.0_152/jre
export CLASSPATH=$CLASSPATH:$JAVA_HOME/lib:$JAVA_HOME/jre/lib
export PATH=$JAVA_HOME/bin:$JAVA_HOME/jre/bin:$PATH:$HOME/bin

if [ -d /etc/profile.d ]; then
  for i in /etc/profile.d/*.sh; do
    if [ -r $i ]; then
      . $i
    fi
  done
  unset i
fi
```

### 使用户环境变量生效

```shell
source /etc/profile
```

### 测试是否安装成功

```shell
java -version
```

### 为其他用户更新用户环境变量

```shell
su lusifer
source /etc/profile
```

## Tomcat

### 下载

```shell
# 解压
tar -zxvf apache-tomcat-8.5.23.tar.gz

# 变更目录名
mv apache-tomcat-8.5.23 tomcat

# 移动目录
mv tomcat/ /usr/local/
```

### 运行

```shell
# 启动
/usr/local/tomcat/bin/startup.sh

# 停止
/usr/local/tomcat/bin/shutdown.sh
```

## Maven

### 下载

```java
# 下载
wget http://apache.communilink.net/maven/maven-3/3.6.2/binaries/apache-maven-3.6.2-bin.tar.gz

# 解压
tar -zxvf apache-maven-3.6.2-bin.tar.gz
```

### 配置环境变量

配置系统环境变量 `/etc/profile`，添加后面两句即可：

```
vim /etc/profile

export MAVEN_HOME=/usr/local/apache-maven-3.6.2
export PATH=$MAVEN_HOME/bin/:$PATH
```

### 生效

```
source /etc/profile
```

### 验证

```shell
mvn -version
```
