# Blob Url And Data Url

## Blob

### 什么是 Blob

Blob（binary large object），二进制大型对象，是一个可以存储二进制文件的“容器”。

Blob 对象表示一个不可变、原始数据的类文件对象。File 接口基于 Blob，继承了 blob 的功能并将其扩展使其支持用户系统上的文件。前端页面经常使用 `input` 标签选择本地文件上传，得到的 `file` 对象就是继承自 `blob`。

```markup
<input type="file" id="avatar" accept="image/png" @change="readFile" />
<!--
File {
  lastModified: 1557995456923
  lastModifiedDate: Thu May 16 2019 15:30:56 GMT+0700 (GMT+07:00) {}
  name: "5c14f38ccd4fd.jpg"
  size: 7958
  type: "image/jpeg"
  webkitRelativePath: ""
}
-->
```

Blob 的一些方式与属性：

- `Blob(blobParts[, options])`：构造函数，返回一个新创建的 Blob 对象，其内容由参数中给定的数组串联组成。
- `Blob.size`：Blob 对象中所包含数据的大小（字节）。
- `Blob.type`：一个字符串，表明该 Blob 对象所包含数据的 MIME 类型。如果类型未知，则该值为空字符串。
- `Blob.slice([start,[ end ,[contentType]]])`：返回一个新的 Blob 对象，包含了源 Blob 对象中指定范围内的数据，类似于数组的 `slice` 方法。

```javascript
const obj = { hello: 'world' }
const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' })
// Blob {size: 22, type: "application/json"}
```

File 对象是特殊类型的 Blob，且可以用在任意的 Blob 类型的 context 中。比如说， `FileReader`, `URL.createObjectURL()`, `createImageBitmap()`, 及 `XMLHttpRequest.send()` 都能处理 Blob 和 File。

### Blob 的作用

使用 Blob 可以让你在浏览器生成一个临时文件，使用 `URL.createObjectURL()` 获取它的链接，即 blob url，你就能像服务器文件一样使用它。

```javascript
const blob = new Blob(['chanshiyu'])
URL.createObjectURL(blob)
// "blob:http://localhost:9528/9afae43c-b849-49bf-aed6-fc876d743303"
```

在创建这个临时文件后，只要不关闭当前页面，这个文件就会一直存在于内存，**你需要主动运行 `URL.revokeObjectURL(url)` 删除引用**。

canvas 提供 `toBlob` 方法将其转换为 blob：

```javascript
// 使用 回调获取 blob
canvasElem.toBlob(blob => {
  // blob ready, download it
  let link = document.createElement('a')
  link.download = 'example.png'

  link.href = URL.createObjectURL(blob)
  link.click()

  // delete the internal blob reference, to let the browser clear memory from it
  URL.revokeObjectURL(link.href)
}, 'image/png')

// 或者使用 async 获取 blob
const blob = await new Promise(resolve => canvasElem.toBlob(resolve, 'image/png'))
```

上面提到很多方法可以同时处理 File 对象和 Blob 对象，借助 `FileReader`，你可以把 Blob 读取为 Buffer。

```javascript
const blob = new Blob(['chanshiyu'])
const reader = new FileReader()
reader.addEventListener('loadend', () => {
  console.log('reader.result:', reader.result)
  /**
   * reader.result 包含转化为类型数组的 blob
   * ArrayBuffer(9)
   * [[Int8Array]]: Int8Array(9) [99, 104, 97, 110, 115, 104, 105, 121, 117]
   * [[Uint8Array]]: Uint8Array(9) [99, 104, 97, 110, 115, 104, 105, 121, 117]
   * byteLength: 9
   */
})
reader.readAsArrayBuffer(blob)
```

### ArrayBuffer

ArrayBuffer 的设计之初与 WebGL 有关，所谓 WebGL，就是指浏览器与显卡之间的通信接口，为了满足 JavaScript 与显卡之间大量的、实时的数据交换，通过 ArrayBuffer 二进制流来传输数据。

`ArrayBuffer` 对象、`TypedArray` 视图和 `DataView` 视图是 JavaScript 操作二进制数据的一个接口。`ArrayBuffer` 对象代表原始的二进制数据，`TypedArray` 视图用来读写简单类型的二进制数据，`DataView` 视图用来读写复杂类型的二进制数据。

`TypedArray` 视图支持的数据类型一共有 9 种，`DataView` 视图支持除 Uint8C 以外的其他 8 种。

| 数据类型 | 字节长度 |               含义               |
| :------: | :------: | :------------------------------: |
|   Int8   |    1     |          8 位带符号整数          |
|  Uint8   |    1     |         8 位不带符号整数         |
|  Uint8C  |    1     | 8 位不带符号整数（自动过滤溢出） |
|  Int16   |    2     |         16 位带符号整数          |
|  Uint16  |    2     |        16 位不带符号整数         |
|  Int32   |    4     |         32 位带符号整数          |
|  Uint32  |    4     |       32 位不带符号的整数        |
| Float32  |    4     |       32 位不带符号的整数        |
| Float64  |    8     |        64 位浮点数 double        |

`ArrayBuffer` 对象代表储存二进制数据的一段内存，它不能直接读写，只能通过视图（`TypedArray`视图和`DataView`视图）来读写，视图的作用是以指定格式解读二进制数据。

ArrayBuffer 也是一个构造函数，可以分配一段可以存放数据的连续内存区域。需要读取其中内容，需要为它指定视图。

```javascript
// 生成了一段 32 字节的内存区域，每个字节的值默认都是 0
const buf = new ArrayBuffer(32)

// 指定 DataView 视图读取内容
const dataView = new DataView(buf)
// 以不带符号的 8 位整数格式，从头读取 8 位二进制数据
dataView.getUint8(0) // 0

// 指定 TypedArray 视图读取内容
const x1 = new Int32Array(buf)
x1[0] = 1
const x2 = new Uint8Array(buf)
x2[0] = 2
// 由于共享内存，所以一个视图的修改会影响到另一个视图
// x1[0] = 2
```

## Data Url

Data URLs，即前缀为 `data:` 协议的的 URL，其允许内容创建者向文档中嵌入小文件。Data URLs 由四个部分组成：前缀（data:）、指示数据类型的 MIME 类型、如果非文本则为可选的 base64 标记、数据本身：`data:[<mediatype>][;base64],<data>`。

`mediatype` 是个 MIME 类型的字符串，例如 `image/jpeg` 表示 JPEG 图像文件。如果被省略，则默认值为 `text/plain;charset=US-ASCII`。

如果数据是文本类型，你可以直接将文本嵌入，如果是二进制数据，你可以将数据进行 base64 编码之后再进行嵌入。以下是一些示例：

- `data:,Hello%2C%20World!`：简单的 text/plain 类型数据
- `data:text/plain;base64,SGVsbG8sIFdvcmxkIQ%3D%3D`：上一条示例的 base64 编码版本
- `data:text/html,%3Ch1%3EHello%2C%20World!%3C%2Fh1%3E`：一个 HTML 文档源代码 `<h1>Hello, World</h1>`
- `data:text/html,<script>alert('hi');</script>`：一个会执行 JavaScript alert 的 HTML 文档

### base64

Base64 是一种基于 64 个可打印字符来表示二进制数据的表示方法。它将每 3 个 8bit 字符转换为 4 个 6Bit 字符（由于 2^6 = 64，由此得名），由于使用的是可打印字符，所以不会出现奇怪的空白字符。

由于是 3 个字符变 4 个，那么很明显了，**base64 编码后，编码对象的体积会变成原来的 4/3 倍**。如果 bit 数不能被 3 整除，需要在末尾添加 1 或 2 个 byte（8 或 16bit），并且末尾的 0 不使用 A 而使用 =，这就是为什么 base64 有的编码结果后面会有一或两个等号。

通过 `FileReader` 可以将文本转换为 base64 编码：

```javascript
const blob = new Blob(['chanshiyu'], { type: 'text/plain' })
const reader = new FileReader()
reader.addEventListener('loadend', () => {
  console.log('reader.result:', reader.result)
  /**
   * reader.result 包含转化为 base64 的blob
   * data:text/plain;base64,Y2hhbnNoaXl1
   */
})
reader.readAsDataURL(blob)
```

对于同一段文本文件，我们可以使用 blob url，也可以装换位 data url，但是使用 blob url 会更加高效。

> Both ways of making an URL of a blob are usable. But usually URL.createObjectURL\(blob\) is simpler and faster.

## Blob url 与 Data Url 对比

Blob url：

- 不需要做编码，省了运算资源
- 大小也不会改变
- 在不使用时需要手动删除引用
- 关闭页面链接自动废弃

Data Url：

- 需要编码，且体积变大 4/3 倍
- 容易删除
- 链接不变，保存了可以以后使用
