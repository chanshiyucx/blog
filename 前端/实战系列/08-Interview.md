## 001 React / Vue 项目时为什么要在列表组件中写 key，其作用是什么？

key 的作用就是更新组件时**判断两个节点是否相同**。相同就复用，不相同就重新创建。以避免“原地复用”带来的副作用。

## 002 函数节流和函数防抖？

函数节流（throttle）与函数防抖（debounce）核心思想都是通过限制函数调用来实现性能优化，但两者概念却有不同：

- 函数节流：函数按指定间隔调用，限制函数调用频率
- 函数防抖：一定时间段连续的函数调用，只让其执行一次

两者的使用场景也有不同：

- 函数节流：页面滚动事件监听（scroll）、DOM 元素拖拽（mousemove）、键盘事件（keydown）
- 函数防抖：文本输入验证发送请求、窗口缩放（resize）

## 003 Set、Map、WeakSet 和 WeakMap 的区别？

- Set 类似于数组，但是成员的值都是唯一的，可以遍历。
- WeakSet 成员都是对象，且都是弱引用，可以用来保存 DOM 节点，不容易造成内存泄漏，不能遍历。
- Map 本质上是健值对的集合，可以遍历。
- WeakMap 只接受对象作为健名（null 除外），不接受其他类型的值作为健名，健名所指向的对象，不能遍历。

## 004 Async/Await 如何通过同步的方式实现异步？

Async/Await 就是一个**自执行的 generate 函数**，是 Generator 的语法糖。利用 generate 函数的特性把异步的代码写成“同步”的形式。
Generator 之所以可以通过同步实现异步是它具有暂停执行和恢复执行的特性和函数体内外的数据交换和错误处理机制。

## 005 JS 异步解决方案

- 回调函数，缺点：回调地狱，不能用 try catch 捕获错误，不能 return
- Promise，缺点：无法取消 Promise ，错误需要通过回调函数来捕获
- Generator，需要配合 co 库
- Async/await：代码清晰，不用像 Promise 写一大堆 then 链，处理了回调地狱的问题

## 006 简单讲解一下 Http2 的多路复用

在 HTTP/1 中，每次请求都会建立一次 HTTP 连接，即 3 次握手 4 次挥手，这个过程在一次请求过程中占用了相当长的时间，即使开启了 Keep-Alive，解决了多次连接的问题，但是依然有两个效率上的问题：

1. 串行的文件传输。当请求 a 文件时，b 文件只能等待，等待 a 连接到服务器、服务器处理文件、服务器返回文件，这三个步骤。
2. 连接数过多。假设服务的设置了最大并发数为 300，因为浏览器限制，浏览器发起的最大请求数为 6，也就是服务器能承载的最高并发为 50，当第 51 个人访问时，就需要等待前面某个请求处理完成。

HTTP/2 的多路复用就是为了解决上述的两个性能问题。在 HTTP/2 中，有两个非常重要的概念，分别是**帧（frame）和流（stream）**。帧代表着最小的数据单位，每个帧会标识出该帧属于哪个流，流也就是多个帧组成的数据流。多路复用，就是在一个 TCP 连接中可以存在多条流，也就是可以发送多个请求，对端可以通过帧中的标识知道属于哪个请求。通过这个技术，可以避免 HTTP 旧版本中的队头阻塞问题，极大的提高传输性能。

## 007 谈谈你对 TCP 三次握手和四次挥手

三次握手是保证 client 和 server 均让对方知道自己的接收和发送能力没问题的最小次数。

- 第一次 client => server，只能 server 判断出 client 具备发送能力
- 第二次 server => client，client 就可以判断出 server 具备发送和接受能力
- 第三次 client => server，双方均保证了自己的接收和发送能力没有问题

四次挥手是因为 TCP 是全双工信道，即客户端与服务端建立两条通道：

- 通道 1：客户端的输出连接服务端的输入
- 通道 2：客户端的输入连接服务端的输出

两个通道可以同时工作，所以关闭双通道时需要四次挥手：

- 客户端关闭输入通道，服务端关闭输出通道
- 服务端关闭输入通道，客户端关闭输出通道

## 008 TCP/IP 协议体系结构四层分别是什么?

四层：应用层、传输层、网络层、数据链路层。

HTTP、TCP、IP 分别在应用层、传输层、网络层。

## 009 从 URL 输入到页面展现到底发生什么？

1. DNS 解析：将域名解析成 IP 地址
2. TCP 连接：TCP 三次握手
3. 发送 HTTP 请求
4. 服务器处理请求并返回 HTTP 报文
5. 浏览器解析渲染页面
6. 断开连接：TCP 四次挥手

## 010 介绍 HTTPS 握手过程与中间人攻击

HTTPS 握手过程：

1. 客户端使用 https 的 url 访问 web 服务器，要求与服务器建立 ssl 连接
2. web 服务器收到客户端请求后，会将网站的证书（包含公钥）传送一份给客户端
3. 客户端收到网站证书后会检查证书的颁发机构以及过期时间，如果没有问题就随机产生一个秘钥
4. 客户端利用公钥将会话秘钥加密并传送给服务端，服务端利用自己的私钥解密出会话秘钥
5. 之后服务器与客户端使用秘钥加密传输

HTTPS 中间人攻击：

1. 服务器向客户端发送公钥。
2. 攻击者截获公钥，保留在自己手上。
3. 然后攻击者自己生成一个【伪造的】公钥，发给客户端。
4. 客户端收到伪造的公钥后，将密钥加密发给服务器。
5. 攻击者获得加密密钥，用自己的私钥解密获得真秘钥。
6. 同时生成假的加密密钥，发给服务器。
7. 服务器用私钥解密获得假秘钥。
8. 服务器用加秘钥加密传输信息。

防范方法：服务端在发送浏览器的公钥中加入 CA 证书，浏览器可以验证 CA 证书的有效性

## 011 Http 与 Https 有什么区别？

Http：超文本传输协议，明文传输，数据未加密，安全性较差，用的是 80 端口
Https：安全套接字超文本传输协议，有 ssl/tsl 证书，数据传输过程是加密，安全性较好，用的 443 端口，而且要比较 Http 更耗费服务器资源

## 012 介绍下重绘和回流（Repaint & Reflow），以及如何进行优化

浏览器渲染机制

浏览器采用流式布局模型。浏览器会把 HTML 解析成 DOM，把 CSS 解析成 CSSOM，DOM 和 CSSOM 合并就产生了渲染树（Render Tree）。有了 RenderTree，就知道了所有节点的样式，然后计算他们在页面上的大小和位置，最后把节点绘制到页面上。

重绘

由于节点的几何属性发生改变或者由于样式发生改变而不会影响布局的，称为重绘，例如 outline、visibility、color、background-color 等。

回流

回流是布局或者几何属性需要改变就称为回流。回流是影响浏览器性能的关键因素，因为其变化涉及到页面的布局更新。一个元素的回流可能会导致了其所有子元素以及紧随其后的节点、祖先节点元素的回流。

**回流必定会发生重绘，重绘不一定会引发回流。**

减少重绘与回流方式

CSS

1. 使用 transform 替代 top/left
2. 使用 visibility 替换 display: none，因为前者只会引起重绘，后者会引发回流（改变了布局）
3. 避免使用 table 布局，可能很小的一个小改动会造成整个 table 的重新布局。
4. 避免设置多层内联样式，避免节点层级过多。
5. 应该尽可能的避免写过于具体的 CSS 选择器。
6. 将动画效果应用到 position 属性为 absolute 或 fixed 的元素上，避免影响其他元素的布局，这样只是一个重绘，而不是回流。
7. 避免使用 CSS 表达式，可能会引发回流。
8. 将频繁重绘或者回流的节点设置为图层，图层能够阻止该节点的渲染行为影响别的节点，例如 will-change、video、iframe 等标签，浏览器会自动将该节点变为图层。
9. CSS3 硬件加速（GPU 加速），可以让 transform、opacity 这些动画不会引起回流重绘。

JavaScript

1. 避免频繁操作样式，最好一次性重写 style 属性，或者将样式列表定义为 class 并一次性更改 class 属性。
2. 避免频繁操作 DOM，创建一个 documentFragment，在它上面应用所有 DOM 操作，最后再把它添加到文档中。
3. 避免频繁读取会引发回流/重绘的属性，如果确实需要多次使用，就用一个变量缓存起来。
4. 对具有复杂动画的元素使用绝对定位，使它脱离文档流，否则会引起父元素及后续元素频繁回流。

## 013 opacity: 0、visibility: hidden、display: none 优劣和适用场景

- opacity: 0 重建图层，性能较高
- visibility: hidden 会造成重绘，比回流性能高一些
- display: none 会造成回流，性能开销较大，回流可能会重新计算其所有子元素以及紧随其后的节点、祖先节点元素的位置、属性

## 014 什么是同源策略？如何解决跨域？

所谓同源是指"协议+域名+端口"三者相同。

解决跨域的方式：

1. CORS（跨域资源共享）
2. Nginx 反向代理
3. JSONP：JSONP 主要就是利用了 script 标签没有跨域限制的这个特性来完成的，仅支持 GET 方法。

## 015 cookie 和 token 都存放在 header 中，为什么不会劫持 token？

- XSS：跨站脚本攻击，用攻击者通过各种方式将恶意代码注入到其他用户的页面中。就可以通过脚本获取信息，发起请求之类的操作。
- CSRF：跨站请求伪造，简单地说，是攻击者通过一些技术手段欺骗用户的浏览器去访问一个自己曾经认证过的网站并运行一些操作（如发邮件，发消息，甚至财产操作如转账和购买商品）。由于浏览器曾经认证过，所以被访问的网站会认为是真正的用户操作而去运行。CSRF 并不能够拿到用户的任何信息，它只是欺骗用户浏览器，让其以用户的名义进行操作。

上面的两种攻击方式，如果被 XSS 攻击了，不管是 token 还是 cookie，都能被拿到，**所以对于 XSS 攻击来说，cookie 和 token 没有什么区别**。但是对于 CSRF 来说就有区别了。

以上面的 CSRF 攻击为例：

- cookie：用户点击了链接，cookie 未失效，导致发起请求后后端以为是用户正常操作，于是进行扣款操作。
- token：用户点击链接，由于浏览器不会自动带上 token，所以即使发了请求，后端的 token 验证不会通过，所以不会进行扣款操作。

这就是为什么只劫持 cookie 不劫持 token 的原因。

扩展：如何防护？

XSS：所有可输入的地方没有对输入数据进行处理的话，都会存在 XSS 漏洞，防御 XSS 攻击最简单直接的方法，就是过滤用户的输入

CSRF：

1. 验证码
2. 验证 HTTP Referer 字段
3. 添加 token，而不是 cookie

## 016 常用操作 dom 方法有哪些？

`getetElementById`、`getElementsByClassName`、`getElementsByTagName`、`getElementsByName`、`querySelector`、`querySelectorAll`、`getAttribute`、`setAttribute`

## 017 浏览器的缓存机制

从缓存位置上来说分为四种，并且各自有优先级，当依次查找缓存且都没有命中的时候，才会去请求网络。

1. Service Worker
2. Memory Cache
3. Disk Cache
4. Push Cache

Service Worker 是运行在浏览器背后的独立线程。使用 Service Worker 的话，传输协议必须为 HTTPS。因为 Service Worker 中涉及到请求拦截，所以必须使用 HTTPS 协议来保障安全。Service Worker 的缓存与浏览器其他内建的缓存机制不同，它可以让我们自由控制缓存哪些文件、如何匹配缓存、如何读取缓存，并且缓存是持续性的。

Service Worker 实现缓存功能一般分为三个步骤：首先需要先注册 Service Worker，然后监听到 install 事件以后就可以缓存需要的文件，那么在下次用户访问的时候就可以通过拦截请求的方式查询是否存在缓存，存在缓存的话就可以直接读取缓存文件，否则就去请求数据。

Memory Cache 也就是内存中的缓存，主要包含的是当前中页面中已经抓取到的资源，例如页面上已经下载的样式、脚本、图片等。读取内存中的数据肯定比磁盘快，内存缓存虽然读取高效，可是缓存持续性很短，会随着进程的释放而释放。一旦我们关闭 Tab 页面，内存中的缓存也就被释放了。

Disk Cache 也就是存储在硬盘中的缓存，读取速度慢点，但是什么都能存储到磁盘中，比之 Memory Cache 胜在容量和存储时效性上。绝大部分的缓存都来自 Disk Cache。

Push Cache（推送缓存）是 HTTP/2 中的内容，当以上三种缓存都没有命中时，它才会被使用。它只在会话（Session）中存在，一旦会话结束就被释放，并且缓存时间也很短暂，在 Chrome 浏览器中只有 5 分钟左右，同时它也并非严格执行 HTTP 头中的缓存指令。

## 018 call 和 apply 的区别是什么，哪个性能更好一些

Function.prototype.apply 和 Function.prototype.call 的作用是一样的，区别在于传入参数的不同：

- 第一个参数都是，指定函数体内 this 的指向；
- 第二个参数开始不同，apply 是传入带下标的集合，数组或者类数组，apply 把它传给函数作为参数，call 从第二个开始传入的参数是不固定的，都会传给函数作为参数。

call 比 apply 的性能要好，因为内部少了一次将 apply 第二个参数解构的操作。

在 es6 引入了延展操作符后，即使参数是数组，可以使用 call：

```javascript
let params = [1, 2, 3, 4]
xx.call(obj, ...params)
```

## 019 为什么通常在发送数据埋点请求的时候使用的是 1x1 像素的透明 gif 图片？

1. 没有跨域问题
2. 不会阻塞页面加载，影响用户的体验（排除 JS/CSS 文件资源方式上报）
3. 在所有图片中，体积最小（比较 PNG/JPG）

## 020 JS 多少种数据类型？

七种：Number、String、Boolean、Object、Null、Undefined、Symbol

## 021 Symbol 使用场景？

1. 消除魔法字符
2. Symbol 值作为属性名避免被覆盖
3. 模拟类的私有方法：ES6 中的类是没有 private 关键字来声明类的私有方法和私有变量的，但是可以利用 Symbol 的唯一性来模拟。

```javascript
const speak = Symbol();
class Person {
    [speak]() {
        ...
    }
}
```

## 022 HTTP 常见状态码

HTTP 状态码共分为 5 种类型：

| 分类  | 分类描述                                       |
| ----- | ---------------------------------------------- |
| `1**` | 信息，服务器收到请求，需要请求者继续执行操作   |
| `2**` | 成功，操作被成功接收并处理                     |
| `3**` | 重定向，需要进一步的操作以完成请求             |
| `4**` | 客户端错误，请求包含语法错误或无法完成请求     |
| `5**` | 服务器错误，服务器在处理请求的过程中发生了错误 |

## 023 什么是媒体查询？响应式设计与自适应设计的区别？

### 媒体查询

媒体查询能在不同的条件下使用不同的样式，使页面在不同在终端设备下达到不同的渲染效果。

原理：允许添加表达式用以媒体查询（包括 媒体类型 和 媒体特性），以此来选择不同的样式表，从而自动适应不同的屏幕分辨率。

1. 媒体类型：将不同的设备划分为不同的类型

- all （所有的设备）
- print （打印设备）
- screen （电脑屏幕，平板电脑，智能手机）

2. 媒体特性：用来描述设备的特点，比如宽度和高度等

- width 网页显示区域完全等于设置的宽度
- height 网页显示区域完全等于设置的高度
- max-width / max-height 网页显示区域小于等于设置的宽度
- min-width / min-width 网页显示区域大于等于设置的宽度
- orientation: portrait (竖屏模式) | landscape (横屏模式)

### 响应式设计与自适应设计

1. 响应式设计与自适应设计的区别？

- 响应式设计：响应式开发一套界面，通过检测视口分辨率，针对不同客户端在客户端做代码处理，来展现不同的布局和内容。
- 自适应设计：自适应需要开发多套界面，通过检测视口分辨率，来判断当前访问的设备是 PC 端、平板还是手机，从而返回不同的页面。

2. 响应式设计与自适应设计如何选取？

- 页面不是太复杂的情况下，采用响应式布局的方式
- 页面中信息较多，布局较为复杂的情况，采用自适应布局的方式

3. 响应式设计与自适应设计的优缺点？

响应式布局
优点：灵活性强，能够快捷解决多设备显示适用问题
缺点：效率较低，兼容各设备工作量大；代码较为累赘，加载时间可能会加长；在一定程度上改变了网站原有的布局结构

自适应布局
优点：对网站复杂程度兼容更大，代码更高效
缺点：同一个网站需要为不同的设备开发不同的页面，增加的开发的成本

## 024 介绍下 BFC 及其应用

BFC（Formatting context）就是块级格式上下文，是页面盒模型布局中的一种 CSS 渲染模式，相当于一个独立的容器，里面的元素和外部的元素相互不影响。

创建 BFC 的方式有：

1. float 浮动
2. position 为 absolute 或 fixed
3. display 为表格布局或者弹性布局
4. overflow 除了 visible 以外的值（hidden，auto，scroll）

BFC 的特性：

1. 内部的 Box 会在垂直方向上一个接一个的放置。
2. 垂直方向上的距离由 margin 决定
3. BFC 的区域不会与 float 的元素区域重叠。
4. 计算 BFC 的高度时，浮动元素也参与计算
5. BFC 就是页面上的一个独立容器，容器里面的子元素不会影响外面元素。

BFC 主要的作用是：

1. 清除浮动
2. 防止同一 BFC 容器中的相邻元素间的外边距重叠问题

## 025 Event Loop 概述？

Event Loop 即事件循环，是指浏览器或 Node 的一种解决 JS 单线程运行时不会阻塞的一种机制，也就是我们经常使用异步的原理。

在 JS 中，任务被分为两种，一种宏任务（MacroTask），一种叫微任务（MicroTask）。

MacroTask（宏任务）：setTimeout、setInterval、setImmediate、I/O、UI Rendering。
MicroTask（微任务）：Promise、MutationObserver、Process.nextTick（Node 独有）

宏任务会被放入宏任务队列中，微任务会被放入微任务队列中。

JS 有一个主线程和调用栈，所有的任务都会被放到调用栈等待主线程执行。

JS 调用栈采用的是后进先出的规则，当任务执行的时候，会被添加到栈的顶部，当执行栈执行完成后，就会从栈顶移出，直到栈内被清空。

JS 代码的具体流程：

1. 执行全局 Script 同步代码，这些同步代码有一些是同步语句，有一些是异步语句；
2. 全局 Script 代码执行完毕后，调用栈会清空；
3. 从微任务队列中取出位于队首的回调任务，放入调用栈中执行，执行完后从栈顶移出，队列长度减 1；
4. 继续取出位于队首的任务，放入调用栈中执行，以此类推，直到直到把微任务队列中的所有任务都执行完毕。如果在执行微任务的过程中，又产生了新的微任务，那么会加入到队列的末尾，也会在这个周期被调用执行；
5. 微任务队列中的所有任务都执行完毕，此时微任务队列为空队列，调用栈也为空；
6. 取出宏任务队列中位于队首的任务，放入中执行；
7. 执行完毕后，调用栈为空；
8. 重复执行微任务队列中的任务，再执行宏任务队列的任务；

重点：

1. 微任务队列中所有的任务都会被依次取出来执行，知道队列长度为空；
2. 宏任务队列一次只从队列中取一个任务执行，执行完后就去执行微任务队列中的任务；

## 026 如何提高首屏加载速度？

1. 对代码进行压缩，减小代码体积
2. 路由懒加载
3. 第三方库由 CDN 引入，可以减小代码的体积，从而提高首屏加载速度
4. SSR 服务器渲染

## 027 对称加密和非对称加密？

对称密码体制使用相同的密钥对消息进行加解密，系统的保密性主要由密钥的安全性决定，而与算法是否保密无关。

非对称密码体制使用公钥加密，使用私钥来解密。使用非对称密码体制可增强通信的安全性。

常用的对称加密算法有：DES、AES。
非对称加密算法：RSA。

hash 算是加密吗？不算，hash 是不可逆的，加密应该是可以根据加密后的数据还原的。

## 028 webpack 中 loader 和 plugin 的区别是什么？

loader，它是一个转换器，将 A 文件进行编译成 B 文件，比如：将 A.less 转换为 A.css，单纯的文件转换过程。

plugin 是一个扩展器，它丰富了 webpack 本身，针对是 loader 结束后，webpack 打包的整个过程，它并不直接操作文件，而是基于事件机制工作，会监听 webpack 打包过程中的某些节点，执行广泛的任务。

## 029 弹性盒子中 flex: 0 1 auto 表示什么意思？并求 left、right 盒子宽度？

三个参数分别对应的是 flex-grow, flex-shrink 和 flex-basis，默认值为 0 1 auto。

1. flex-grow 属性定义项目的放大比例，默认为 0，即如果存在剩余空间，也不放大。
2. flex-shrink 属性定义了项目的缩小比例，默认为 1，即如果空间不足，该项目将缩小。
3. flex-basis 属性定义了在分配多余空间之前，项目占据的主轴空间（main size）。

问题一，考察 flex-shrink：求最终 left、right 的宽度

```html
<div class="container">
  <div class="left"></div>
  <div class="right"></div>
</div>

<style>
  * {
    padding: 0;
    margin: 0;
  }
  .container {
    width: 600px;
    height: 300px;
    display: flex;
  }
  .left {
    flex: 1 2 500px;
    background: red;
  }
  .right {
    flex: 2 1 400px;
    background: blue;
  }
</style>
```

对应题目：

- 子项溢出空间的宽度为：`500 + 400 - 600 = 300`
- left 收缩比例：`(500 * 2) / (500 * 2 + 400 * 1) = 0.7143`
- right 收缩比例：`(400 * 1) / (500 * 2 + 400 * 1) = 0.2857`

对应的：

- left 收缩宽度：`0.7143 * 300 = 214.29`
- right 收缩宽度：`0.2857 * 300 = 85.71`

所以：

- left 最终宽度：`500 - 214.29 = 285.71`
- right 最终宽度：`400 - 85.71 = 314.29`

问题二，考察 flex-grow left、right 的宽度

```html
<div class="container">
  <div class="left"></div>
  <div class="right"></div>
</div>

<style>
  * {
    padding: 0;
    margin: 0;
  }
  .container {
    width: 600px;
    height: 300px;
    display: flex;
  }
  .left {
    flex: 1 2 300px;
    background: red;
  }
  .right {
    flex: 2 1 200px;
    background: blue;
  }
</style>
```

剩余的空间：`600 - (300 + 200) = 100`
子元素的 flex-grow 的值分别为 1 和 2，剩余空间用 3 等分来分：`100 / 3 = 33.3333333`

所以：

- left 最终宽度：`300 + 1 * 33.33 = 333.33`
- right 最终宽度：`200 + 2 * 33.33 = 266.67`

扩展：`flex:1` 到底代表什么？ 等同于 `flex:1 1 0%`。

## 030 require 和 import 的区别？

- import 是 es6 的一个语法标准，require 是 AMD 规范引入方式。
- import 在代码编译时被加载，所以必须放在文件开头，require 在代码运行时被加载，所以 require 理论上可以运用在代码的任何地方，所以 import 性能更好。
- import 引入的对象被修改时，源对象也会被修改，相当于浅拷贝，require 引入的对象被修改时，源对象不会被修改，官网称值拷贝，可以理解为深拷贝。
- import 有利于 tree-shaking（移除 JavaScript 上下文中未引用的代码），require 对 tree-shaking 不友好。
- import 会触发代码分割（把代码分离到不同的 bundle 中，然后可以按需加载或者并行加载这些文件），require 不会触发。

目前所有的引擎都还没有实现 import，import 最终都会被转码为 require，在 webpack 打包中，import 和 require 都会变为*webpack_require*。

## 031 H5 拥有 6 种新特性？

1. 语义化标签，例如 header，footer，section，article 等语义化标签的作用：提升页面的阅读性(结构性增强)，更有利于 SEO，对于使用屏幕阅读器的人来说会更友好。
2. 新增媒体元素，audio 和 video 标签能够很容易的输出音频或视频流，提供便利的获取文件信息的 API。
3. 用于绘画的 canvas 属性，Canvas API 提供了一个通过 JavaScript 和 HTML 的 canvas 元素来绘制图形的方式。它可以用于动画、游戏画面、数据可视化、图片编辑以及实时视频处理等方面。
4. 新增本地存储方式：sessionStorage、localStorage。sessionStorage 用于存储会话级别的数据，会话关闭，数据消失，不可设置过期时间。localStorage 用于存储需要进行持久化存储的数据，只要不主动删除，数据不会消失。
5. 新的技术：webworker、websocket。 webworker：用于多线程编程，websocket：客户端与服务端双向数据通信协议。
6. 新增的表单控件：calendar、date、time、email、url、search。

## 032 CSS3 有哪些新特性？

- 选择器
- 边框与圆角
- 背景与渐变
- 过渡
- 变换
- 动画

## 033 ES6 有哪些新特性？

- 变量声明：const 和 let
- 模板字符串
- 箭头函数
- 函数的参数默认值
- 扩展运算符
- 对象和数组解构
- 数据类型 Symbol
- 数据结构 Set 和 Map
- Proxy 代理和 Reflect 反射
- Promise 对象
- Iterator 遍历器
- Generator 函数
- Async/Await
- Class 类继承
- Module 的语法 import/export

## 034 合并对象的有哪些方式？

1. 扩展运算符：`const newObj = { ...obj1, ...obj2 };`
2. `Object.assign()`：`const newObj = Object.assign(obj1, obj2);`

区别：扩展运算符返回一个新对象，而 `Object.assign()` 函数却修改其第一个传入对象。

## 035 e.target 与 e.currentTarget？

e.target 指触发事件的对象的引用，是事件触发的元素。

e.currentTarget 是指向事件绑定的元素。

## 036 箭头函数与普通函数（function）的区别是什么？构造函数（function）可以使用 new 生成实例，那么箭头函数可以吗？为什么？

箭头函数是和普通函数相比，有以下几点差异：

1. 函数体内的 this 对象，就是定义时所在的对象，而不是使用时所在的对象。
2. 不可以使用 arguments 对象，该对象在函数体内不存在。如果要用，可以用 rest 参数代替。
3. 不可以使用 yield 命令，因此箭头函数不能用作 Generator 函数。
4. 不可以使用 new 命令，因为：
   - 没有自己的 this，无法调用 call，apply。
   - 没有 prototype 属性 ，而 new 命令在执行时需要将构造函数的 prototype 赋值给新的对象的 **proto**

## 037 var、let 和 const 区别的实现原理是什么

var 和 let/const 的区别：

- 块级作用域：var 声明的变量，不存在块级作用域，在全局范围内都有效，let/const 声明的，只在它所在的代码块内有效
- 不存在变量提升：var 定义变量可以先使用，后声明，而 let/const 只可先声明，后使用
- 暂时性死区：let/const 声明的变量存在暂时性死区，即只要块级作用域中存在，那么它所声明的变量就绑定了这个区域，不再受外部的影响
- 不可重复声明: let/const 不允许在相同作用域内，重复声明同一个变量
- let/const 声明的全局变量不会挂在顶层对象下面

const:

- const 声明之后必须马上赋值，否则会报错
- const 简单类型一旦声明就不能再更改，复杂类型（数组、对象等）指针指向的地址不能更改，内部数据可以更改

let 一般用来声明变量，const 声明常量 函数

## 038 如何设计实现无缝轮播

无限轮播基本插件都可以做到，不过要使用原生代码实现无缝滚动的话我可以提点思路，因为轮播图基本都在 ul 盒子里面的 li 元素。

1. 首先获取第一个 li 元素和最后一个 li 元素,
2. 克隆第一个 li 元素，和最后一个 li 元素，
3. 分别插入到 lastli 的后面和 firstli 的前面，
4. 然后监听滚动事件，如果滑动距离超过 x 或-x，让其实现跳转下一张图或者跳转上一张，(此处最好设置滑动距离)，
5. 然后在滑动最后一张实现最后一张和克隆第一张的无缝转换，当到克隆的第一张的时候停下的时候，让其切入真的第一张，则实现无线滑动，向前滑动同理

## 039 ES6 代码转成 ES5 代码的实现思路是什么？

ES6 代码转成 ES5 代码，可以参考 Babel 的实现方式。那么 Babel 是如何把 ES6 转成 ES5 呢，其大致分为三步：

1. 将代码字符串解析成抽象语法树，即所谓的 AST
2. 对 AST 进行处理，在这个阶段可以对 ES6 代码进行相应转换，即转成 ES5 代码
3. 根据处理后的 AST 再生成代码字符串

## 040 改变 this 的指向的方法以及区别？

三种方式：call、apply、bind

call 与 apply 的区别：接收的参数不同，call 和 apply 第一个参数都是函数运行的作用域 this，call 方法后续传参逐个列举，apply 方法第二个是参数数组。

bind 与 call 和 apply 的区别：bind 的返回值是一个函数，而 call 和 apply 是立即调用。

## 041 如何解决移动端 Retina 屏 1px 像素问题

1. 伪元素 + transform scaleY(.5)
2. border-image
3. background-image
4. box-shadow

## 042 数组里面有 10 万个数据，取第一个元素和第 10 万个元素的时间相差多少

数组可以直接根据索引取的对应的元素，所以不管取哪个位置的元素的时间复杂度都是 O(1)

得出结论：**消耗时间几乎一致，差异可以忽略不计**

## 043 for in 和 for of 的区别

它们两者都可以用于遍历，不过 for in 遍历的是数组的索引（index），而 for of 遍历的是数组元素值（value）。

for in 更适合遍历对象，当然也可以遍历数组，但是会存在一些问题，比如：

1. index 索引为字符串型数字，不能直接进行几何运算
2. 遍历顺序有可能不是按照实际数组的内部顺序
3. **使用 for in 会遍历数组所有的可枚举属性、包括原型**，如果不想遍历原型方法和属性的话，可以在循环内部判断一下，使用 hasOwnProperty() 方法可以判断某属性是不是该对象的实例属性

```javascript
for (let index in arr) {
  if (arr.hasOwnProperty(index)) {
  }
}
```

for of 遍历的是数组元素值，而且 for of 遍历的只是数组内的元素，不包括原型属性和索引。

总结：

1. for in 遍历的是数组的索引（即键名），而 for of 遍历的是数组元素值
2. for in 总是得到对象的 key 或数组、字符串的下标
3. for of 总是得到对象的 value 或数组、字符串的值

## 044 什么是闭包？使用闭包应该注意什么？

对于 JavaScrip 而言，函数内部可以直接读取全局变量，在函数外部无法读取函数内的局部变量。而闭包便是指 有权访问另外一个函数作用域中的变量的函数，也就是能够读取其他函数内部变量的函数。

使用闭包应该注意什么？

1. 代码难以维护：闭包内部是可以访问上级作用域，改变上级作用域的私有变量，使用一定要小心，不要随便改变上级作用域私有变量的值。
2. 内存泄漏：由于闭包会使得函数中的变量都保存在内存中，内存消耗很大，所以不能滥用闭包，不再用到的内存，没有及时释放，易造成内存泄漏。
3. this 指向：闭包的 this 指向的是 window。

闭包应用场景：回调、IIFE、函数防抖、节流、柯里化、模块化。

## 045 react-router 里的 `<Link>` 标签和 `<a>` 标签有什么区别

从最终渲染的 DOM 来看，这两者都是链接，都是 `<a>` 标签，区别是：

- `<Link>` 是 react-router 里实现路由跳转的链接，一般配合 `<Route>` 使用，react-router 接管了其默认的链接跳转行为，区别于传统的页面跳转，`<Link>` 的“跳转”行为只会触发相匹配的 `<Route>` 对应的页面内容更新，而不会刷新整个页面。
- 而 `<a>` 标签就是普通的超链接了，用于从当前页面跳转到 href 指向的另一个页面（非锚点情况）。

## 046 如何实现懒加载？

路由懒加载：对于 React/Vue 这类 SPA（单页应用程序）来说，当打包构建应用时，JS 包会变得非常大，影响页面加载。路由懒加载能把不同路由对应的组件分割成不同的代码块，然后当路由被访问的时候才加载对应组件，这样就会更加高效。

Vue 路由懒加载的实现：

对于 Vue 来说，Vue Router 支持动态导入，可以用动态导入代替静态导入。

```javascript
// import UserDetails from './views/UserDetails'
// 替换成
const UserDetails = () => import('./views/UserDetails')
```

把组件按组分块，有时候想把某个路由下的所有组件都打包在同个异步块（chunk）中。只需要使用命名 chunk，一个特殊的注释语法来提供 chunk name (需要 Webpack > 2.4)，webpack 会将任何一个异步模块与相同的块名称组合到相同的异步块中。

```javascript
const UserDetails = () => import(/* webpackChunkName: "group-user" */ './UserDetails.vue')
const UserDashboard = () => import(/* webpackChunkName: "group-user" */ './UserDashboard.vue')
const UserProfileEdit = () => import(/* webpackChunkName: "group-user" */ './UserProfileEdit.vue')
```

React 实现路由懒加载：

- 通过 `React.lzay() + Suspense` 实现组件的动态加载
- `import()` 拆包

## 047 什么是 MVVM？

MVVM 是 Model-View-ViewModel 缩写，也就是把 MVC 中的 Controller 演变成 ViewModel。Model 层代表数据模型，View 代表 UI 组件，ViewModel 是 View 和 Model 层的桥梁，数据会绑定到 viewModel 层并自动将数据渲染到页面中，视图变化的时候会通知 viewModel 层更新数据。

## 048 Vue 的父组件和子组件生命周期钩子执行顺序是什么

1. 加载渲染过程：父 beforeCreate -> 父 created -> 父 beforeMount -> 子 beforeCreate -> 子 created -> 子 beforeMount -> 子 mounted -> 父 mounted
2. 子组件更新过程：父 beforeUpdate -> 子 beforeUpdate -> 子 updated -> 父 updated
3. 父组件更新过程：父 beforeUpdate -> 父 updated
4. 销毁过程：父 beforeDestroy -> 子 beforeDestroy -> 子 destroyed -> 父 destroyed

## 049 为什么 Vuex 的 mutation 和 Redux 的 reducer 中不能做异步操作

因为更改 state 的函数必须是纯函数，**纯函数既是统一输入就会统一输出**，没有任何副作用；如果是异步则会引入额外的副作用，导致更改后的 state 不可预测。

因为异步操作是成功还是失败不可预测，什么时候进行异步操作也不可预测；当异步操作成功或失败时，如果不 commit(mutation) 或者 dispatch(action)，Vuex 和 Redux 就不能捕获到异步的结果从而进行相应的操作。

扩展：redux 为什么要把 reducer 设计成纯函数？

答：纯函数既是统一输入就会统一输出，没有任何副作用。redux 的设计思想就是不产生副作用，数据更改的状态可回溯，所以 redux 中处处都是纯函数。

## 050 在 Vue 中，子组件为何不可以修改父组件传递的 Prop？

为了保证数据的单向流动，便于对数据进行追踪，避免数据混乱。

## 051 双向绑定和 vuex 是否冲突

在严格模式中使用 Vuex，当用户输入时，v-model 会试图直接修改属性值，但这个修改不是在 mutation 中修改的，所以会抛出一个错误。当需要在组件中使用 vuex 中的 state 时，有 2 种解决方案：

1. 在 input 中绑定 value(vuex 中的 state)，然后监听 input 的 change 或者 input 事件，在事件回调中调用 mutation 修改 state 的值
2. 使用带有 setter 的双向绑定计算属性。

```javascript
<input v-model="message" />

computed: {
    message: {
        get () {
            return this.$store.state.obj.message
        },
        set (value) {
            this.$store.dispatch('updateMessage', value);
        }
    }
}
mutations: {
    UPDATE_MESSAGE (state, v) {
        state.obj.message = v;
    }
}
actions: {
    update_message ({ commit }, v) {
        commit('UPDATE_MESSAGE', v);
    }
}
```

## 052 Vue 的响应式原理中 Object.defineProperty 有什么缺陷？为什么在 Vue3.0 采用了 Proxy，抛弃了 Object.defineProperty？

1. Object.defineProperty 无法监控到数组下标的变化，导致通过数组下标添加元素，不能实时响应；
2. Object.defineProperty 只能劫持对象的属性，从而需要对每个对象每个属性进行遍历，如果属性值是对象，还需要深度遍历。Proxy 可以劫持整个对象，并返回一个新的对象。
3. Proxy 不仅可以代理对象，还可以代理数组，还可以代理动态增加的属性。

## 053 Vue 中的 computed 是如何实现的？

computed 本身是通过代理的方式代理到组件实例上的，所以读取计算属性的时候，执行的是一个内部的 getter，而不是用户定义的方法。

computed 内部实现了一个惰性的 watcher，在实例化的时候不会去求值，其内部通过 dirty 属性标记计算属性是否需要重新求值。当 computed 依赖的任一状态发生变化，都会通知这个惰性 watcher，让它把 dirty 属性设置为 true。所以，当再次读取这个计算属性的时候，就会重新去求值。

惰性 watcher/计算属性在创建时是不会去求值的，是在使用的时候去求值的。

## 054 Vue 中的 computed 和 watch 的区别在哪里

computed：计算属性，是由 data 中的已知值，得到的一个新值。这个新值只会根据已知值的变化而变化，其他不相关的数据的变化不会影响该新值。计算属性不在 data 中。别人变化影响我自己。

watch：侦听器，监听数据的变化，监听的数据就是 data 中的已知值，我的变化影响别人。

1. watch 擅长处理的场景：一个数据影响多个数据
2. computed 擅长处理的场景：一个数据受多个数据影响

## 055 v-if、v-show、v-html 的原理是什么，它是如何封装的？

- v-if 会调用 addIfCondition 方法，生成 vnode 的时候会忽略对应节点，render 的时候就不会渲染；
- v-show 会生成 vnode，render 的时候也会渲染成真实节点，只是在 render 过程中会在节点的属性中修改 show 属性值，也就是 display；
- v-html 会先移除节点下的所有节点，调用 html 方法，通过 addProp 添加 innerHTML 属性，归根结底还是设置 innerHTML 为 v-html 的值；

## 056 v-show 和 v-if 指令的共同点和不同点？

共同点：都能控制元素的显示和隐藏
不同点：实现本质方法不同，v-show 本质就是通过控制 css 中的 display 设置为 none，控制隐藏，只会编译一次；v-if 是动态的向 DOM 树内添加或者删除 DOM 元素，若初始值为 false ，就不会编译了，而且 v-if 不停的销毁和创建比较消耗性能。

总结：如果要频繁切换某节点，使用 v-show (切换开销比较小，初始开销较大)。如果不需要频繁切换某节点使用 v-if（初始渲染开销较小，切换开销比较大）。

## 057 Vue 组件之间有哪几种通信方式？

- 父子通信：父向子传递数据是通过 props，子向父是通过 $emit；通过 $parent（父组件实例）/ $children（子组件实例）通信；$ref 也可以访问组件实例；provide/inject；$attrs/$listeners；
- 兄弟通信：Event Bus、Vuex
- 跨级通信：Event Bus、Vuex；provide/inject； $attrs/$listeners；

## 058 如何实现浏览器多标签页之间通信？

1. localStorage 实现通信

```javascript
window.addEventListener('storage', (e) => {
  console.info('localStorage发生变化：', e)
})
```

2. websocket

原理比较简单，假如 pageA 和 pageB 都与服务器建立了 websocket 连接，那么两个页面都可以实时接收服务端发来的消息，也可以实时向服务端发送消息。如果 pageA 更改了数据，那么向服务端发送一条消息，服务端再将这条消息发送给 pageB 即可，这样就简单实现了两个标签页之间的通信。

3. SharedWorker

sharedWorker 就是 webWorker 中的一种，它可以由所有同源页面共享，利用这个特性，就可以使用它来进行多标签页之前的通信。

它和 webSocket 实现多页面通讯的原理很类似，都是发送数据和接收数据这样的步骤，shardWorker 就好比的 webSocket 服务器。

```javascript
// worker.js
const set = new Set()
onconnect = (event) => {
  const port = event.ports[0]
  set.add(port)

  // 接收信息
  port.onmessage = (e) => {
    // 广播信息
    set.forEach((p) => {
      p.postMessage(e.data)
    })
  }

  // 发送信息
  port.postMessage('worker广播信息')
}

// pageA
const worker = new SharedWorker('./worker.js')
worker.port.onmessage = (e) => {
  console.info('pageA收到消息', e.data)
}

// pageB
const worker = new SharedWorker('./worker.js')
worker.port.postMessage(`客户端B发送的消息:HELLO`)
```

4. cookie + setInterval

原理是在需要接收消息的页面不断轮询去查询 cookie，然后发送消息的页面将数据存储在 cookie 中，这样就实现了简单的数据共享。

```javascript
setInterval(() => {
  //加入定时器，让函数每一秒就调用一次，实现页面刷新
  console.log('cookie', document.cookie)
}, 1000)
```

## 059 事件代理的原理以及优缺点是什么？

什么是事件代理：由于事件会在冒泡阶段向上传播到父节点，因此可以把子节点的监听函数统一处理。指定一个事件处理程序，就可以管理某一类型的所有事件，这就叫事件代理。

原理：利用事件冒泡机制  
优点：

1. 可以大量节省内存占用，减少事件注册
2. 可以实现当新增子对象时，无需再对其进行事件绑定，对于动态内容部分尤为适合

缺点：

1. 事件代理的实现依靠的冒泡，因此不支持事件冒泡的事件就不适合使用事件代理
2. 不是所有的事件绑定都适合使用事件代理，不恰当使用反而可能导致不需要绑定事件的元素也被绑定上了事件

## 060 Vue 在 v-for 时给每项元素绑定事件需要用事件代理吗？为什么？

首先我们需要知道事件代理主要有什么作用？

- 事件代理能够避免我们逐个的去给元素新增和删除事件
- 事件代理比每一个元素都绑定一个事件性能要更好

从 vue 的角度上来看上面两点

- 在 v-for 中，我们直接用一个 for 循环就能在模板中将每个元素都绑定上事件，并且当组件销毁时，vue 也会自动给我们将所有的事件处理器都移除掉。所以事件代理能做到的第一点 vue 已经给我们做到了
- 在 v-for 中，给元素绑定的都是相同的事件，所以除非上千行的元素需要加上事件，其实和使用事件代理的性能差别不大，所以也没必要用事件代理

## 061 Proxy 与 Object.defineProperty 的优劣对比？

- Proxy 可以直接监听对象而非属性
- Proxy 可以直接监听数组的变化
- Proxy 有多达 13 种拦截方法，不限于 apply、ownKeys、deleteProperty、has 等等是 Object.defineProperty 不具备的
- Proxy 返回的是一个新对象，我们可以只操作新的对象达到目的，而 Object.defineProperty 只能遍历对象属性直接修改
- Proxy 作为新标准将受到浏览器厂商重点持续的性能优化，也就是传说中的新标准的性能红利
- Object.defineProperty 兼容 IE

## 062 Vue 如何实现数据的双向绑定？

Vue 是基于数据劫持实现的双向绑定，Vue 2.0 使用的是 Object.defineProperty，Vue 3.0 使用的是 ES6 中新增的 Proxy。

什么是数据劫持：利用 Object.defineProperty 劫持对象的访问器，在属性值发生变化时我们可以获取变化，从而进行进一步操作。

数据劫持的优势：

1. 无需显示调用：例如 Vue 运用数据劫持+发布订阅，直接可以通知变化并驱动视图更新
2. 可精确得知变化数据：劫持了属性的 setter，当属性值改变，可以精确获知变化的内容

基于数据劫持双向绑定的实现思想：

1. 利用 Proxy 或 Object.defineProperty 生成的 Observer 针对对象/对象的属性进行"劫持"，在属性发生变化后通知订阅者
2. 解析器 Compile 解析模板中的 Directive（指令），收集指令所依赖的方法和数据，等待数据变化然后进行渲染
3. Watcher 属于 Observer 和 Compile 桥梁，它将接收到的 Observer 产生的数据变化，并根据 Compile 提供的指令进行视图渲染，使得数据变化促使视图变化

## 063 Vue 的双向数据绑定，Model 如何改变 View，View 又是如何改变 Model？

Model 改变 View 的过程：依赖于 ES5 的 object.defindeProperty，通过 defineProperty 实现的数据劫持，getter 收集依赖，setter 调用更新回调。

View 改变 Model 的过程：依赖于 v-model，该语法糖实现是在单向数据绑定的基础上，增加事件监听并赋值给对应的 Model。

## 064 Vue 渲染大量数据时应该怎么优化？

1. 使用虚拟列表
2. 对于固定的非响应式的数据，Object.freeze 冻结对象
3. 利用服务器渲染 SSR，在服务端渲染组件

## 065 Vue 如何让 CSS 只在当前组件中起作用？

在组件中的 style 前面加上 scoped。

## 066 keep-alive 的作用是什么？

keep-alive 是 Vue 内置的一个组件，可以使被包含的组件保留状态，或避免重新渲染。

## 067 vue-loader 是什么？使用它的用途有哪些？

vue 文件的一个加载器，将 template/js/style 转换成 js 模块。
用途：js 可以写 es6、 style 样式可以 scss 或 less、 template 可以加 jade 等。

## 068 v-on 可以监听多个方法吗？

可以，栗子：

```javascript
<input type="text" v-on="{ input:onInput,focus:onFocus,blur:onBlur }">
```

## 069 Vue 组件中 data 为什么必须是一个函数？

在 component 中，data 必须以函数的形式存在，不可以是对象。组件中的 data 写成一个函数，数据以函数返回值的形式定义，这样每次复用组件的时候，都会返回一份新的 data，相当于每个组件实例都有自己私有的数据空间，它们只负责各自维护的数据，不会造成混乱。而单纯的写成对象形式，就是所有的组件实例共用了一个 data，这样改一个全都改了。

## 070 v-if 和 v-for 的优先级？

当 v-if 与 v-for 一起使用时，v-for 具有比 v-if 更高的优先级，这意味着 v-if 将分别重复运行于每个 v-for 循环中。所以，不推荐 v-if 和 v-for 同时使用。如果 v-if 和 v-for 一起用的话，vue 中的的会自动提示 v-if 应该放到外层去。

## 071 Vue 中注册在 router-link 上事件无效解决方法？

使用 `@click.native`。原因：router-link 会阻止 click 事件，`.native` 指直接监听一个原生事件。

## 072 params 和 query 的区别？

用法：query 要用 path 来引入，params 要用 name 来引入，接收参数都是类似的。query 在浏览器地址栏中显示参数，params 则不显示。

注意点：query 刷新不会丢失数据，params 刷新会丢失数据。

## 073 vuex 有哪几种属性？

五种，分别是 State、Getter、Mutation 、Action、Module

state => 基本数据(数据源存放地)
getters => 从基本数据派生出来的数据
mutations => 提交更改数据的方法，同步！
actions => 像一个装饰器，包裹 mutations，使之可以异步。
modules => 模块化 Vuex

## 074 路由导航守卫有哪些？

全局：beforeEach、beforeResolve、afterEach
路由独享：beforeEnter
组件内：beforeRouteEnter、beforeRouteUpdate、beforeRouteLeave

## 075 Vue 事件修饰符及其作用？

- `.stop`：等同于 `event.stopPropagation()`，防止事件冒泡
- `.prevent`：等同于 `event.preventDefault()`，防止执行预设的行为
- `.capture`：当元素发生冒泡时，先触发带有该修饰符的元素
- `.self`：只会触发自己范围内的事件，不包含子元素
- `.once`：只会触发一次
