## 文件操作

### 文件拷贝

NodeJS 提供了基本的文件操作 API，却没有提供文件拷贝的高级功能。

#### 小文件拷贝

```javascript
const fs = require('fs')

function copy(src, dst) {
  fs.writeFileSync(dst, fs.readFileSync(src))
}

function main(argv) {
  copy(argv[0], argv[1])
}

main(process.argv.slice(2))
```

以上程序使用 fs.readFileSync 从源路径读取文件内容，并使用 fs.writeFileSync 将文件内容写入目标路径。

> process 是一个全局变量，可通过 process.argv 获得命令行参数。由于 argv[0] 固定等于 NodeJS 执行程序的绝对路径，argv[1] 固定等于主模块的绝对路径，因此第一个命令行参数从 argv[2] 这个位置开始。

#### 大文件拷贝

对于大文件拷贝，如果一次性把所有文件内容都读取到内存中后再一次性写入磁盘的方式可能会造成内存爆仓。所以对于大文件，只能读一点写一点，直到完成拷贝。因此上边的程序需要改造如下：

```javascript
const fs = require('fs')

function copy(src, dst) {
  fs.createReadStream(src).pipe(fs.createWriteStream(dst))
}

function main(argv) {
  copy(argv[0], argv[1])
}

main(process.argv.slice(2))
```

以上程序使用 fs.createReadStream 创建了一个源文件的只读数据流，并使用 fs.createWriteStream 创建了一个目标文件的只写数据流，并且用 pipe 方法把两个数据流连接了起来。抽象类比的话类似水顺着水管从一个桶流到了另一个桶。

### API 简介

NodeJS 提供了一些文件操作有关的 API，这里作简要介绍。

#### Buffer 数据块

#### Stream 数据流

#### File System 文件系统

#### Path 路径

### 遍历目录

### 文本编码

### 小结

## 网络操作

## 进程管理

## 异步编程

## 项目示例
