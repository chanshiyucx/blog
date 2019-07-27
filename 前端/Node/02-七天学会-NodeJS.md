# 七天学会 NodeJS

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

> process 是一个全局变量，可通过 process.argv 获得命令行参数。由于 argv\[0\] 固定等于 NodeJS 执行程序的绝对路径，argv\[1\] 固定等于主模块的绝对路径，因此第一个命令行参数从 argv\[2\] 这个位置开始。

#### 大文件拷贝

对于大文件拷贝，如果一次性把所有文件内容都读取到内存中后再一次性写入磁盘的方式可能会造成内存爆仓。所以对于大文件，只能读一点写一点，直到完成拷贝。

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

Buffer 与字符串类似，除了可以用 .length 属性得到字节长度外，还可以用 \[index\] 方式读取指定位置的字节。

Buffer 与字符串能够互相转化，例如可以使用指定编码将二进制数据转化为字符串，或者将字符串转换为指定编码下的二进制数据：

```javascript
let bin = new Buffer.from([0x68, 0x65, 0x6c, 0x6c, 0x6f])
console.log('bin.length:', bin.length) // 5
let str = bin.toString('utf-8')
console.log('str:', str) // hello

let bin2 = new Buffer('hello', 'utf-8')
//<Buffer 68 65 6c 6c 6f>
```

Buffer 与字符串有一个重要区别。字符串是只读的，并且对字符串的任何修改得到的都是一个新字符串，原字符串保持不变。至于 Buffer 可以用\[index\]方式直接修改某个位置的字节。

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

### 小结

NodeJS 操作文件小结如下：

- 如果不是很在意性能，尽量使用同步 API；
- 需要对文件读写做到字节级别的精细控制时，请使用 fs 模块的文件底层操作 API；
- 不要使用拼接字符串的方式来处理路径，使用 path 模块。

## 网络操作

### http 模块

NodeJS 内置的 http 模块来处理网络操作。

http 模块提供两种使用方式：

- 作为服务端使用时，创建一个 HTTP 服务器，监听 HTTP 客户端请求并返回响应。
- 作为客户端使用时，发起一个 HTTP 客户端请求，获取服务端响应。

HTTP 请求本质上是一个数据流，由请求头（headers）和请求体（body）组成。例如以下是一个完整的 HTTP 请求数据内容。

```http
POST / HTTP/1.1
User-Agent: curl/7.26.0
Host: localhost
Accept: */*
Content-Length: 11
Content-Type: application/x-www-form-urlencoded

Hello World
```

可以看到，空行之上是请求头，之下是请求体。HTTP 请求在发送给服务器时，可以认为是按照从头到尾的顺序一个字节一个字节地以数据流方式发送的。

而 http 模块创建的 HTTP 服务器在接收到完整的请求头后，就会调用回调函数。在回调函数中，除了可以使用 request 对象访问请求头数据外，还能把 request 对象当作一个只读数据流来访问请求体数据。

下面代码中服务端原样将客户端请求的请求体数据返回给客户端：

```javascript
const http = require('http')

http
  .createServer(function(request, response) {
    response.writeHead(200, { 'Content-Type': 'text/plain' })

    request.on('data', function(chunk) {
      response.write(chunk)
    })

    request.on('end', function() {
      response.end()
    })
  })
  .listen(8124)
```

#### https 模块

https 模块与 http 模块极为类似，区别在于 https 模块需要额外处理 SSL 证书。

在服务端模式下，创建一个 HTTPS 服务器的示例如下：

```javascript
const http = require('http')

const options = {
  key: fs.readFileSync('./ssl/default.key'),
  cert: fs.readFileSync('./ssl/default.cer')
}

const server = https.createServer(options, function(request, response) {
  // ...
})
```

可以看到，与创建 HTTP 服务器相比，多了一个 options 对象，通过 key 和 cert 字段指定了 HTTPS 服务器使用的私钥和公钥。

另外，NodeJS 支持 SNI 技术，可以根据 HTTPS 客户端请求使用的域名动态使用不同的证书，因此同一个 HTTPS 服务器可以使用多个域名提供服务。

```javascript
server.addContext('foo.com', {
  key: fs.readFileSync('./ssl/foo.com.key'),
  cert: fs.readFileSync('./ssl/foo.com.cer')
})

server.addContext('bar.com', {
  key: fs.readFileSync('./ssl/bar.com.key'),
  cert: fs.readFileSync('./ssl/bar.com.cer')
})
```

但如果目标服务器使用的 SSL 证书是自制的，不是从颁发机构购买的，默认情况下 https 模块会拒绝连接，提示说有证书安全问题。在 options 里加入 `rejectUnauthorized: false` 字段可以禁用对证书有效性的检查，从而允许 https 模块请求开发环境下使用自制证书的 HTTPS 服务器。

### URL

处理 HTTP 请求时会使用 url 模块，该模块允许解析、生成以及拼接 URL。一个完整的 URL 的组成如下：

```text
                            href
 -----------------------------------------------------------------
                            host              path
                      --------------- ----------------------------
 http: // user:pass @ host.com : 8080 /p/a/t/h ?query=string #hash
 -----    ---------   --------   ---- -------- ------------- -----
protocol     auth     hostname   port pathname     search     hash
                                                ------------
                                                   query
```

可以使用 `.parse` 方法来将一个 URL 字符串转换为 URL 对象，示例如下：

```javascript
const url = require('url')

const obj = url.parse('http://user:pass@host.com:8080/p/a/t/h?query=string#hash')
console.log(obj)

/**
 * Url {
 *   protocol: 'http:',
 *   slashes: true,
 *   auth: 'user:pass',
 *   host: 'host.com:8080',
 *   port: '8080',
 *   hostname: 'host.com',
 *   hash: '#hash',
 *   search: '?query=string',
 *   query: 'query=string',
 *   pathname: '/p/a/t/h',
 *   path: '/p/a/t/h?query=string',
 *   href: 'http://user:pass@host.com:8080/p/a/t/h?query=string#hash'
 * }
 **/
```

传给 `.parse` 方法的不一定要是一个完整的 URL，例如在 HTTP 服务器回调函数中，request.url 不包含协议头和域名，但同样可以用 `.parse` 方法解析。

`.parse` 方法还支持第二个和第三个布尔类型可选参数。第二个参数等于 true 时，该方法返回的 URL 对象中，query 字段不再是一个字符串，而是一个经过 querystring 模块转换后的参数对象。第三个参数等于 true 时，该方法可以正确解析不带协议头的 URL，例如 `//www.example.com/foo/bar`。

反过来，`.format` 方法允许将一个 URL 对象转换为 URL 字符串。另外，`.resolve` 方法可以用于拼接 URL。

```javascript
const url = require('url')

url.resolve('http://www.example.com/foo/bar', '../baz')
// http://www.example.com/baz
```

#### Query String

querystring 模块用于实现 URL 参数字符串与参数对象的互相转换，示例如下：

```javascript
const querystring = require('querystring')

querystring.parse('foo=bar&baz=qux&baz=quux&corge')
// { foo: 'bar', baz: ['qux', 'quux'], corge: '' }

querystring.stringify({ foo: 'bar', baz: ['qux', 'quux'], corge: '' })
// 'foo=bar&baz=qux&baz=quux&corge='
```

#### Zlib

zlib 模块提供通过 Gzip 和 Deflate/Inflate 实现压缩和解压功能。

通过判断客户端是否支持 gzip，并在支持的情况下使用 zlib 模块返回 gzip 之后的响应体数据：

```javascript
const http = require('http')

http
  .createServer(function(request, response) {
    let i = 1024,
      data = ''

    while (i--) {
      data += '.'
    }

    if ((request.headers['accept-encoding'] || '').indexOf('gzip') !== -1) {
      zlib.gzip(data, function(err, data) {
        response.writeHead(200, {
          'Content-Type': 'text/plain',
          'Content-Encoding': 'gzip'
        })
        response.end(data)
      })
    } else {
      response.writeHead(200, {
        'Content-Type': 'text/plain'
      })
      response.end(data)
    }
  })
  .listen(80)
```

同时，通过判断服务端响应是否使用 gzip 压缩，并在压缩的情况下使用 zlib 模块解压响应体数据：

```javascript
const http = require('http')

const options = {
  hostname: 'www.example.com',
  port: 80,
  path: '/',
  method: 'GET',
  headers: {
    'Accept-Encoding': 'gzip, deflate'
  }
}

http
  .request(options, function(response) {
    let body = []

    response.on('data', function(chunk) {
      body.push(chunk)
    })

    response.on('end', function() {
      body = Buffer.concat(body)

      if (response.headers['content-encoding'] === 'gzip') {
        zlib.gunzip(body, function(err, data) {
          console.log(data.toString())
        })
      } else {
        console.log(data.toString())
      }
    })
  })
  .end()
```

### Net

net 模块可用于创建 Socket 服务器或 Socket 客户端。

下面使用 net 模块创建一个 HTTP 服务器：

```javascript
const net = require('net')

net
  .createServer(function(conn) {
    conn.on('data', function(data) {
      conn.write(
        ['HTTP/1.1 200 OK', 'Content-Type: text/plain', 'Content-Length: 11', '', 'Hello World'].join('\n')
      )
    })
  })
  .listen(80)
```

再创建一个客户端：

```javascript
let options = {
  port: 80,
  host: 'www.example.com'
}

let client = net.connect(options, function() {
  client.write(
    ['GET / HTTP/1.1', 'User-Agent: curl/7.26.0', 'Host: www.baidu.com', 'Accept: */*', '', ''].join('\n')
  )
})

client.on('data', function(data) {
  console.log(data.toString())
  client.end()
})
```

#### 小结

本章介绍了使用 NodeJS 操作网络时需要的 API 以及一些坑回避技巧，总结起来有以下几点：

- http 和 https 模块支持服务端模式和客户端模式两种使用方式；
- request 和 response 对象除了用于读写头数据外，都可以当作数据流来操作；
- url.parse 方法加上 request.url 属性是处理 HTTP 请求时的固定搭配；
- 使用 zlib 模块可以减少使用 HTTP 协议时的数据传输量；
- 通过 net 模块的 Socket 服务器与客户端可对 HTTP 协议做底层操作。

## 进程管理

NodeJS 可以感知和控制自身进程的运行环境和状态，也可以创建子进程并与其协同工作，这使得 NodeJS 可以把多个程序组合在一起共同完成某项工作，并在其中充当胶水和调度器的作用。

### 调用终端命令

在第一章里实现了文件拷贝的功能，但终端下的 cp 命令比较好用，一条 `cp -r source/* target` 命令就能搞定目录拷贝：

```javascript
const child_process = require('child_process')
const util = require('util')

function copy(source, target, callback) {
  child_process.exec(util.format('cp -r %s/* %s', source, target), callback)
}

function main(argv) {
  copy(argv[0], argv[1], function(err) {
    console.log(err)
  })
}

main(process.argv.slice(2))
```

### 退出程序

通常一个程序执行完成正常退出，这时程序的退出状态码为 0。或者一个程序运行时发生了异常后就挂了，这时程序的退出状态码不等于 0。如果在代码中捕获了某个异常，但是觉得程序不应该继续运行下去，需要立即退出，并且需要把退出状态码设置为指定数字，就可以按照以下方式：

```javascript
try {
  // ...
} catch (err) {
  // ...
  process.exit(1)
}
```

### 创建子进程

以下是一个创建 NodeJS 子进程的例子：

```javascript
const child_process = require('child_process')

let child = child_process.spawn('node', ['xxx.js'])

child.stdout.on('data', function(data) {
  console.log('stdout: ' + data)
})

child.stderr.on('data', function(data) {
  console.log('stderr: ' + data)
})

child.on('close', function(code) {
  console.log('child process exited with code ' + code)
})
```

上例中使用了 `.spawn(exec, args, options)` 方法，该方法支持三个参数。第一个参数是执行文件路径，可以是执行文件的相对或绝对路径，也可以是根据 PATH 环境变量能找到的执行文件名。第二个参数中，数组中的每个成员都按顺序对应一个命令行参数。第三个参数可选，用于配置子进程的执行环境与行为。

### 进程间通信

进程间可以互相通信：

```javascript
const child_process = require('child_process')

/* parent.js */
let child = child_process.spawn('node', ['child.js'])

child.kill('SIGTERM')

/* child.js */
process.on('SIGTERM', function() {
  cleanUp()
  process.exit(0)
})
```

上面代码中，父进程通过 `.kill` 方法向子进程发送 SIGTERM 信号，子进程监听 process 对象的 SIGTERM 事件响应信号。`.kill` 方法本质上是用来给进程发送信号的，进程收到信号后具体要做啥，完全取决于信号的种类和进程自身的代码。

另外，如果父子进程都是 NodeJS 进程，就可以通过 IPC（进程间通讯）双向传递数据。

```javascript
const child_process = require('child_process')

/* parent.js */
let child = child_process.spawn('node', ['child.js'], {
  stdio: [0, 1, 2, 'ipc']
})

child.on('message', function(msg) {
  console.log(msg)
})

child.send({ hello: 'hello' })

/* child.js */
process.on('message', function(msg) {
  msg.hello = msg.hello.toUpperCase()
  process.send(msg)
})
```

可以看到，父进程在创建子进程时，在 `options.stdio` 字段中通过 ipc 开启了一条 IPC 通道，之后就可以监听子进程对象的 message 事件接收来自子进程的消息，并通过 .send 方法给子进程发送消息。在子进程这边，可以在 process 对象上监听 message 事件接收来自父进程的消息，并通过 .send 方法向父进程发送消息。数据在传递过程中，会先在发送端使用 JSON.stringify 方法序列化，再在接收端使用 JSON.parse 方法反序列化。

### 守护子进程

守护进程一般用于监控工作进程的运行状态，在工作进程不正常退出时重启工作进程，保障工作进程不间断运行：

```javascript
const child_process = require('child_process')

function spawn(mainModule) {
  let worker = child_process.spawn('node', [mainModule])

  worker.on('exit', function(code) {
    if (code !== 0) {
      spawn(mainModule)
    }
  })
}

spawn('worker.js')
```

## 大项目

最后以一个大项目作为总结，项目开发的是一个简单的静态文件合并服务器，该服务器需要支持类似以下格式的 JS 或 CSS 文件合并请求：

```text
http://assets.example.com/foo/??bar.js,baz.js
```

在以上 URL 中，?? 是一个分隔符，之前是需要合并的多个文件的 URL 的公共部分，之后是使用 , 分隔的差异部分。因此服务器处理这个 URL 时，返回的是以下两个文件按顺序合并后的内容：

```text
/foo/bar.js
/foo/baz.js
```

此外，服务器也同时支持普通的 JS 或 CSS 文件请求：

```text
http://assets.example.com/foo/bar.js
```

### 第一次迭代

设计方案：

```text
           +---------+   +-----------+   +----------+
request -->|  parse  |-->|  combine  |-->|  output  |--> response
           +---------+   +-----------+   +----------+
```

服务器会首先分析 URL，得到请求的文件的路径和类型（MIME）。然后，服务器会读取请求的文件，并按顺序合并文件内容。最后，服务器返回响应，完成对一次请求的处理。

另外，服务器在读取文件时的根目录和服务器监听的 HTTP 端口可以配置。

设计实现：

```javascript
const fs = require('fs')
const path = require('path')
const http = require('http')

const MIME = {
  '.css': 'text/css',
  '.js': 'application/javascript'
}

function combineFiles(pathnames, callback) {
  let output = []
  ;(function next(i, len) {
    if (i < len) {
      fs.readFile(pathnames[i], (err, data) => {
        if (err) {
          callback(err)
        } else {
          output.push(data)
          next(i + 1, len)
        }
      })
    } else {
      callback(null, Buffer.concat(output))
    }
  })(0, pathnames.length)
}

function parseURL(root, url) {
  let base, parts, pathnames
  if (!url.includes('??')) {
    url = url.replace('/', '/??')
  }
  parts = url.split('??')
  base = parts[0]
  pathnames = parts[1].split(',').map(val => {
    return path.join(root, base, val)
  })
  return {
    mine: MIME[path.extname(pathnames[0])] || 'text/plain',
    pathnames
  }
}

function main(argv) {
  // 读取配置文件 config.json
  const config = JSON.parse(fs.readFileSync(argv[0], 'utf-8'))
  // 根目录和端口号
  const { root = '.', port = 80 } = config

  http
    .createServer((request, response) => {
      let urlInfo = parseURL(root, request.url)

      combineFiles(urlInfo.pathnames, (err, data) => {
        if (err) {
          response.writeHead(400)
          response.end(err.message)
        } else {
          response.writeHead(200, {
            'Content-Type': urlInfo.mine
          })
          response.end(data)
        }
      })
    })
    .listen(port)
}

main(process.argv.slice(2))
```

### 第二次迭代

第一次迭代的请求分析：

```text
发送请求       等待服务端响应         接收响应
---------+----------------------+------------->
         --                                        解析请求
           ------                                  读取a.js
                 ------                            读取b.js
                       ------                      读取c.js
                             --                    合并数据
                               --                  输出响应
```

可以看到，第一版代码依次把请求的文件读取到内存中之后，再合并数据和输出响应。这会导致以下两个问题：

1. 当请求的文件比较多比较大时，串行读取文件会比较耗时，从而拉长了服务端响应等待时间。
2. 由于每次响应输出的数据都需要先完整地缓存在内存里，当服务器请求并发数较大时，会有较大的内存开销。

对于问题一，很容易想到把读取文件的方式从串行改为并行。但是别这样做，**因为对于机械磁盘而言，因为只有一个磁头，尝试并行读取文件只会造成磁头频繁抖动，反而降低 IO 效率。而对于固态硬盘，虽然的确存在多个并行 IO 通道，但是对于服务器并行处理的多个请求而言，硬盘已经在做并行 IO 了，对单个请求采用并行 IO 无异于拆东墙补西墙。**因此，正确的做法不是改用并行 IO，而是一边读取文件一边输出响应，把响应输出时机提前至读取第一个文件的时刻。

这样调整后，整个请求处理过程变成下边这样：

```text
发送请求 等待服务端响应 接收响应
---------+----+------------------------------->
         --                                        解析请求
           --                                      检查文件是否存在
             --                                    输出响应头
               ------                              读取和输出a.js
                     ------                        读取和输出b.js
                           ------                  读取和输出c.js
```

设计实现：

```javascript
function outputFiles(pathnames, write) {
  ;(function next(i, len) {
    if (i < len) {
      let reader = fs.createReadStream(pathnames[i])
      reader.pipe(
        write,
        { end: false }
      )
      reader.on('end', function() {
        next(i + 1, len)
      })
    } else {
      write.end()
    }
  })(0, pathnames.length)
}

function validateFiles(pathnames, callback) {
  ;(function next(i, len) {
    if (i < len) {
      fs.stat(pathnames[i], (err, stat) => {
        if (err) {
          callback(err)
        } else if (!stat.isFile()) {
          callback(new Error())
        } else {
          next(i + 1, len)
        }
      })
    } else {
      callback(null, pathnames)
    }
  })(0, pathnames.length)
}

function main(argv) {
  // 读取配置文件 config.json
  const config = JSON.parse(fs.readFileSync(argv[0], 'utf-8'))
  // 根目录和端口号
  const { root = '.', port = 80 } = config

  http
    .createServer((request, response) => {
      let urlInfo = parseURL(root, request.url)

      validateFiles(urlInfo.pathnames, (err, pathnames) => {
        if (err) {
          response.writeHead(400)
          response.end(err.message)
        } else {
          // 在检查完文件后立即输出请求头
          response.writeHead(200, {
            'Content-Type': urlInfo.mine
          })
          outputFiles(pathnames, response)
        }
      })
    })
    .listen(port)
}
```

可以看到，第二版代码在检查了请求的所有文件是否有效之后，立即就输出了响应头，并接着一边按顺序读取文件一边输出响应内容。并且在读取文件时，使用了只读数据流来简化代码。

### 第三次迭代

从工程角度上讲，没有绝对可靠的系统。即使代码没有 BUG，也可能因为操作系统，甚至是硬件导致服务器程序在某一天挂掉。因此一般生产环境下的服务器程序都配有一个守护进程，在服务挂掉的时候立即重启服务。一般守护进程的代码会远比服务进程的代码简单，从概率上可以保证守护进程更难挂掉。甚至守护进程自身可以在自己挂掉时重启自己，从而实现双保险。

可以利用 NodeJS 的进程管理机制，将守护进程作为父进程，将服务器程序作为子进程，并让父进程监控子进程的运行状态，在其异常退出时重启子进程。

```javascript
// daemon.js
const cp = require('child_process')

let worker

function spawn(server, config) {
  worker = cp.spawn('node', [server, config])
  worker.on('exit', code => {
    if (code !== 0) {
      spawn(server, config)
    }
  })
}

function main(argv) {
  spawn('server.js', argv[0])
  process.on('SIGTERM', () => {
    worker.kill()
    process.exit(0)
  })
}

main(process.argv.slice(2))

// server.js
process.on('SIGTERM', () => {
  server.close(() => {
    process.exit(0)
  })
})
```

可以把守护进程的代码保存为 daemon.js，之后可以通过 `node daemon.js config.json` 启动服务，而守护进程会进一步启动和监控服务器进程。

此外，为了能够正常终止服务，让守护进程在接收到 SIGTERM 信号时终止服务器进程。而在服务器进程这一端，同样在收到 SIGTERM 信号时先停掉 HTTP 服务再正常退出。
