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

Buffer 类的实例类似于整数数组，但 Buffer 的大小是固定的、且在 V8 堆外分配物理内存。Buffer 的大小在创建时确定，且无法改变。

Buffer 与字符串类似，除了可以用 .length 属性得到字节长度外，还可以用 [index] 方式读取指定位置的字节。

Buffer 与字符串能够互相转化，例如可以使用指定编码将二进制数据转化为字符串，或者将字符串转换为指定编码下的二进制数据：

```javascript
let bin = new Buffer.from([0x68, 0x65, 0x6c, 0x6c, 0x6f])
console.log('bin.length:', bin.length) // 5
let str = bin.toString('utf-8')
console.log('str:', str) // hello

let bin2 = new Buffer('hello', 'utf-8')
//<Buffer 68 65 6c 6c 6f>
```

Buffer 与字符串有一个重要区别。字符串是只读的，并且对字符串的任何修改得到的都是一个新字符串，原字符串保持不变。至于 Buffer 可以用[index]方式直接修改某个位置的字节。

而 .slice 方法也不是返回一个新的 Buffer，而更像是返回了指向原 Buffer 中间的某个位置的指针，因此对 .slice 方法返回的 Buffer 的修改会作用于原 Buffer。

```javascript
let bin = new Buffer.from([0x68, 0x65, 0x6c, 0x6c, 0x6f])
let sub = bin.slice(2)

sub[0] = 0x65
console.log('bin', bin) // <Buffer 68 65 65 6c 6f>
```

因此拷贝 Buffer 得首先创建一个新的 Buffer，并通过 .copy 方法把原 Buffer 中的数据复制过去。类似于申请一块新的内存，并把已有内存中的数据复制过去。

```javascript
let bin = new Buffer.from([0x68, 0x65, 0x6c, 0x6c, 0x6f])
let dup = new Buffer.alloc(bin.length)
bin.copy(dup)
dup[0] = 0x48
console.log(bin) // => <Buffer 68 65 6c 6c 6f>
console.log(dup) // => <Buffer 48 65 65 6c 6f>
```

#### Stream 数据流

流（stream）是 Node.js 中处理流式数据的抽象接口。stream 模块提供了一些 API，用于构建实现了流接口的对象。Node.js 提供了多种流对象。例如，HTTP 服务器的请求和 process.stdout 都是流的实例。

> 流可以是可读的、可写的、或者可读可写的。 Stream 基于事件机制工作，所有的流都是 EventEmitter 的实例。

这里已文件拷贝为例，创建一个只读数据流：

```javascript
let rs = fs.createReadStream(src)

rs.on('data', function(chunk) {
  rs.pause()
  doSomething(chunk, function() {
    rs.resume()
  })
})

rs.on('end', function() {
  cleanUp()
})
```

代码中 data 事件会源源不断地被触发，为了避免 doSomething 函数无法及时处理，处理数据前暂停数据读取，并在处理数据后通过回调函数继续读取数据。

此外，也可以为数据目标创建一个只写数据流：

```javascript
let rs = fs.createReadStream(src)
let ws = fs.createWriteStream(dst)

rs.on('data', function(chunk) {
  if (ws.write(chunk) === false) {
    rs.pause()
  }
})

rs.on('end', function() {
  ws.end()
})

ws.on('drain', function() {
  rs.resume()
})
```

以上代码实现了数据从只读数据流到只写数据流的搬运，并包括了防爆仓控制。因为这种使用场景很多，例如上边的大文件拷贝程序，NodeJS 直接提供了 .pipe 方法来做这件事情，其内部实现方式与上边的代码类似。

#### File System 文件系统

NodeJS 通过 fs 内置模块提供对文件的操作。fs 模块提供的 API 基本上可以分为以下三类：

- 文件属性读写：其中常用的有 fs.stat、fs.chmod、fs.chown 等；
- 文件内容读写：其中常用的有 fs.readFile、fs.readdir、fs.writeFile、fs.mkdir 等；
- 底层文件操作：其中常用的有 fs.open、fs.read、fs.write、fs.close 等。

所有的文件系统操作都有同步和异步两种形式。异步形式的最后一个参数是完成时的回调函数。传给回调函数的参数取决于具体方法，但第一个参数会保留给异常。如果操作成功完成，则第一个参数会是 null 或 undefined。

#### Path 路径

path 模块用于处理文件与目录的路径，常用 API 如下：

- path.normalize：将传入的路径转换为标准路径，能去掉多余的斜杠；
- path.join：将传入的多个路径拼接为标准路径，能在不同系统下正确使用相应的路径分隔符；
- path.extname：获取文件扩展名。

> 标准化之后的路径里的斜杠在 Windows 系统下是 \，而在 Linux 系统下是 /。如果想保证任何系统下都使用 / 作为路径分隔符的话，需要用 `.replace(/\\/g, '/')` 再替换一下标准路径。

### 遍历目录

遍历目录时一般使用递归算法，否则就难以编写出简洁的代码。递归算法与数学归纳法类似，通过不断缩小问题的规模来解决问题。

> 使用递归算法编写的代码虽然简洁，但由于每递归一次就产生一次函数调用，在需要优先考虑性能时，需要把递归算法转换为循环算法，以减少函数调用次数。

目录是一个树状结构，在遍历时一般使用**深度优先+先序遍历算法**。深度优先，意味着到达一个节点后，首先接着遍历子节点而不是邻居节点。先序遍历，意味着首次到达了某节点就算遍历完成，而不是最后一次返回某节点才算数。

实现同步遍历算法如下：

```javascript
const fs = require('fs')
const path = require('path')

function travel(dir, callback) {
  fs.readdirSync(dir).forEach(file => {
    let pathname = path.join(dir, file)
    if (fs.statSync(pathname).isDirectory()) {
      travel(pathname, callback)
    } else {
      callback(file)
    }
  })
}
```

该函数以某个目录作为遍历的起点。遇到一个子目录时，就先接着遍历子目录。遇到一个文件时，就把文件的绝对路径传给回调函数。回调函数拿到文件路径后，就可以做各种判断和处理。

### 文本编码

NodeJS 操作文本时需要处理文件编码问题，常用的文本编码有 UTF8 和 GBK 两种，并且 UTF8 文件还可能带有 BOM。在读取不同编码的文本文件时，需要将文件内容转换为 JS 使用的 UTF8 编码字符串后才能正常处理。

#### BOM 移除

BOM 用于标记一个文本文件使用 Unicode 编码，其本身是一个 Unicode 字符 "\uFEFF"，位于文本文件头部。在不同的 Unicode 编码下，BOM 字符对应的二进制字节如下：

|  Bytes   | Encoding |
| :------: | :------: |
|  FE FF   | UTF16BE  |
|  FF FE   | UTF16LE  |
| EF BB BF |   UTF8   |

因此，可以根据文本文件头几个字节来判断文件是否包含 BOM，以及使用哪种 Unicode 编码。但是，BOM 字符虽然起到了标记文件编码的作用，其本身却不属于文件内容的一部分，如果读取文本文件时不去掉 BOM，在某些使用场景下就会有问题。

例如把几个 JS 文件合并成一个文件后，如果文件中间含有 BOM 字符，就会导致浏览器 JS 语法错误。因此，使用 NodeJS 读取文本文件时，一般需要去掉 BOM。例如，以下代码实现了识别和去除 UTF8 BOM 的功能：

```javascript
function readText(pathname) {
  let bin = fs.readFileSync(pathname)

  if (bin[0] === 0xef && bin[1] === 0xbb && bin[2] === 0xbf) {
    bin = bin.slice(3)
  }

  return bin.toString('utf-8')
}
```

#### GBK 转 UTF8

NodeJS 支持在读取文本文件时，或者在 Buffer 转换为字符串时指定文本编码，但 GBK 编码不在 NodeJS 自身支持范围内。因此，一般借助[iconv-lite](https://github.com/ashtuchkin/iconv-lite)这个三方包来转换编码。使用它可以按下边方式编写一个读取 GBK 文本文件的函数：

```javascript
const iconv = require('iconv-lite')

function readGBKText(pathname) {
  let bin = fs.readFileSync(pathname)
  return iconv.decode(bin, 'gbk')
}
```

#### 单字节编码

有时无法预知读取的文件采用哪种编码，因此也就无法指定正确的编码。虽然可以一定程度可以根据文件的字节内容猜测出文本编码，但有局限，这里介绍一种简单方式。

如果一个文本文件只包含英文字符，比如 Hello World，那无论用 GBK 编码或是 UTF8 编码读取这个文件都没问题。这是因为在这些编码下，ASCII0~128 范围内字符都使用相同的单字节编码。

反过来讲，即使一个文本文件中有中文等字符，如果需要处理的字符仅在 ASCII0~128 范围内，比如除了注释和字符串以外的 JS 代码，就可以统一使用单字节编码来读取文件，不用关心文件的实际编码是 GBK 还是 UTF8。以下示例说明了这种方法：

```javascript
//1. GBK编码源文件内容：
let foo = '中文'
//2. 对应字节：
76 61 72 20 66 6F 6F 20 3D 20 27 D6 D0 CE C4 27 3B
//3. 使用单字节编码读取后得到的内容：
let foo = '{乱码}{乱码}{乱码}{乱码}'
//4. 替换内容：
let bar = '{乱码}{乱码}{乱码}{乱码}'
//5. 使用单字节编码保存后对应字节：
76 61 72 20 62 61 72 20 3D 20 27 D6 D0 CE C4 27 3B
//6. 使用GBK编码读取后得到内容：
let bar = '中文'
```

该方法的核心在于不管大于 0xEF 的单个字节在单字节编码下被解析成什么乱码字符，使用同样的单字节编码保存这些乱码字符时，背后对应的字节保持不变。

NodeJS 中自带了一种 binary 编码可以用来实现这个方法：

```javascript
function replace(pathname) {
  let str = fs.readFileSync(pathname, 'binary')
  str = str.replace('foo', 'bar')
  fs.writeFileSync(pathname, str, 'binary')
}
```

### 小结

NodeJS 操作文件小结如下：

- 如果不是很在意性能，尽量使用同步 API；
- 需要对文件读写做到字节级别的精细控制时，请使用 fs 模块的文件底层操作 API；
- 不要使用拼接字符串的方式来处理路径，使用 path 模块。

## 网络操作

## 进程管理

## 异步编程

## 项目示例

参考文章：  
[七天学会 NodeJS](//nqdeng.github.io/7-days-nodejs/)
