### 001 React / Vue 项目时为什么要在列表组件中写 key，其作用是什么？

key 的作用就是更新组件时**判断两个节点是否相同**。相同就复用，不相同就重新创建。以避免“原地复用”带来的副作用。

### 002 函数节流和函数防抖？

函数节流（throttle）与函数防抖（debounce）核心思想都是通过限制函数调用来实现性能优化，但两者概念却有不同：

- 函数节流：函数按指定间隔调用，限制函数调用频率
- 函数防抖：一定时间段连续的函数调用，只让其执行一次

两者的使用场景也有不同：

- 函数节流：页面滚动事件监听（scroll）、DOM 元素拖拽（mousemove）、键盘事件（keydown）
- 函数防抖：文本输入验证发送请求、窗口缩放（resize）

### 003 Set、Map、WeakSet 和 WeakMap 的区别？

- Set 类似于数组，但是成员的值都是唯一的，可以遍历。
- WeakSet 成员都是对象，且都是弱引用，可以用来保存 DOM 节点，不容易造成内存泄漏，不能遍历。
- Map 本质上是健值对的集合，可以遍历。
- WeakMap 只接受对象作为健名（null 除外），不接受其他类型的值作为健名，健名所指向的对象，不计入垃圾回收机制，不能遍历。

### 004 setTimeout、Promise、Async/Await 的区别?

1. setTimeout

```js
console.log('script start')
setTimeout(function () {
  console.log('settimeout')
})
console.log('script end')
// 输出顺序：script start->script end->settimeout
```

2. Promise

```js
console.log('script start')
let promise1 = new Promise(function (resolve) {
  console.log('promise1')
  resolve()
  console.log('promise1 end')
}).then(function () {
  console.log('promise2')
})
setTimeout(function () {
  console.log('settimeout')
})
console.log('script end')
// 输出顺序: script start->promise1->promise1 end->script end->promise2->settimeout
```

Promise 本身是**同步的立即执行函数**。

- promise.then() 的回调是一个 task，promise 是 resolved 或 rejected，这个 task 就会放入**当前事件循环回合的 microtask queue（微任务）**；promise 是 pending， 这个 task 就会放入事件循环的**未来的某个（可能下一个）回合的 microtask queue（微任务）**中。
- setTimeout 的回调也是个 task，它会被放入 **macrotask queue（宏任务）**。

3. async/await

```js
async function async1() {
  console.log('async1 start')
  await async2()
  console.log('async1 end')
}
async function async2() {
  console.log('async2')
}

console.log('script start')
async1()
console.log('script end')

// 输出顺序：script start->async1 start->async2->script end->async1 end
```

async 函数返回一个 Promise 对象，当函数执行的时候，一旦遇到 await 就会先返回，等到触发的异步操作完成，再执行函数体内后面的语句。可以理解为，是让出了线程，跳出了 async 函数体。

```js
async function async1() {
  console.log('async1 start') // 2
  await async2()
  console.log('async1 end') // 6
}
async function async2() {
  console.log('async2') // 3
}
console.log('script start') // 1
setTimeout(function () {
  console.log('setTimeout') // 8
}, 0)
async1()
new Promise(function (resolve) {
  console.log('promise1') // 4
  resolve()
}).then(function () {
  console.log('promise2') // 7
})
console.log('script end') // 5
```

### 005 Async/Await 如何通过同步的方式实现异步？

Async/Await 就是一个**自执行的 generate 函数**，是 Generator 的语法糖。利用 generate 函数的特性把异步的代码写成“同步”的形式。
Generator 之所以可以通过同步实现异步是它具有暂停执行和恢复执行的特性和函数体内外的数据交换和错误处理机制。

### 006 将数组扁平化并去除其中重复数据，最终得到一个升序且不重复的数组

```js
var arr = [[1, 2, 2], [3, 4, 5, 5], [6, 7, 8, 9, [11, 12, [12, 13, [14]]]], 10]
Array.from(new Set(arr.flat(Infinity))).sort((a, b) => {
  return a - b
})
```

### 007 JS 异步解决方案

- 回调函数，缺点：回调地狱，不能用 try catch 捕获错误，不能 return
- Promise，缺点：无法取消 Promise ，错误需要通过回调函数来捕获
- Generator，需要配合 co 库
- Async/await：代码清晰，不用像 Promise 写一大堆 then 链，处理了回调地狱的问题

### 008 Promise 构造函数是同步执行还是异步执行，那么 then 方法呢？

Promise 本身是**同步的立即执行函数**，Promise new 的时候会立即执行里面的代码，then 是微任务，会在本次任务执行完的时候执行，setTimeout 是宏任务 ，会在下次任务执行的时候执行。

### 009 简单讲解一下 http2 的多路复用

在 HTTP/1 中，每次请求都会建立一次 HTTP 连接，即 3 次握手 4 次挥手，这个过程在一次请求过程中占用了相当长的时间，即使开启了 Keep-Alive，解决了多次连接的问题，但是依然有两个效率上的问题：

1. 串行的文件传输。当请求 a 文件时，b 文件只能等待，等待 a 连接到服务器、服务器处理文件、服务器返回文件，这三个步骤。
2. 连接数过多。假设 Apache 设置了最大并发数为 300，因为浏览器限制，浏览器发起的最大请求数为 6，也就是服务器能承载的最高并发为 50，当第 51 个人访问时，就需要等待前面某个请求处理完成。

HTTP/2 的多路复用就是为了解决上述的两个性能问题。 在 HTTP/2 中，有两个非常重要的概念，分别是**帧（frame）和流（stream）**。帧代表着最小的数据单位，每个帧会标识出该帧属于哪个流，流也就是多个帧组成的数据流。多路复用，就是在一个 TCP 连接中可以存在多条流。换句话说，也就是可以发送多个请求，对端可以通过帧中的标识知道属于哪个请求。通过这个技术，可以避免 HTTP 旧版本中的队头阻塞问题，极大的提高传输性能。

### 010 谈谈你对 TCP 三次握手和四次挥手

三次握手之所以是三次是保证 client 和 server 均让对方知道自己的接收和发送能力没问题而保证的最小次数。
第一次 client => server 只能 server 判断出 client 具备发送能力
第二次 server => client client 就可以判断出 server 具备发送和接受能力
第三次 client => server 双方均保证了自己的接收和发送能力没有问题
三次是最少的安全次数，两次不安全，四次浪费资源。

为什么要四次挥手？
TCP 是全双工信道，何为全双工就是客户端与服务端建立两条通道，通道 1:客户端的输出连接服务端的输入；通道 2:客户端的输入连接服务端的输出。两个通道可以同时工作，所以关闭双通道的时候就是这样：
客户端：我要关闭输入通道了。 服务端：好的，你关闭吧，我这边也关闭这个通道。
服务端：我也要关闭输入通道了。 客户端：好的你关闭吧，我也把这个通道关闭。

### 011 介绍 HTTPS 握手过程

1. 客户端使用 https 的 url 访问 web 服务器，要求与服务器建立 ssl 连接
2. web 服务器收到客户端请求后, 会将网站的证书（包含公钥）传送一份给客户端
3. 客户端收到网站证书后会检查证书的颁发机构以及过期时间, 如果没有问题就随机产生一个秘钥
4. 客户端利用公钥将会话秘钥加密, 并传送给服务端, 服务端利用自己的私钥解密出会话秘钥
5. 之后服务器与客户端使用秘钥加密传输

### 012 vue 渲染大量数据时应该怎么优化？

1. 使用虚拟列表
2. 对于固定的非响应式的数据，Object.freeze 冻结对象
3. 利用服务器渲染 SSR，在服务端渲染组件

### 013 Redux 和 Vuex 的设计思想

共同点：首先两者都是处理全局状态的工具库，大致实现思想都是：全局 state 保存状态---->dispatch(action)---->reducer(vuex 里的 mutation)----> 生成 newState，整个状态为同步操作。
区别：最大的区别在于处理异步的不同，vuex 里面多了一步 commit 操作，在 action 之后 commit(mutation) 之前处理异步，而 redux 里面则是通过中间件处理

### 014 ES5/ES6 的继承除了写法以外还有什么区别？

1. class 声明会提升，但不会初始化赋值。Foo 进入暂时性死区，类似于 let、const 声明变量。

```js
const bar = new Bar() // it's ok
function Bar() {
  this.bar = 42
}

const foo = new Foo() // ReferenceError: Foo is not defined
class Foo {
  constructor() {
    this.foo = 42
  }
}
```

2. class 声明内部会启用严格模式。

```js
// 引用一个未声明的变量
function Bar() {
  baz = 42 // it's ok
}
const bar = new Bar()

class Foo {
  constructor() {
    fol = 42 // ReferenceError: fol is not defined
  }
}
const foo = new Foo()
```

3. class 的所有方法（包括静态方法和实例方法）都是不可枚举的。

```js
// 引用一个未声明的变量
function Bar() {
  this.bar = 42
}
Bar.answer = function () {
  return 42
}
Bar.prototype.print = function () {
  console.log(this.bar)
}
const barKeys = Object.keys(Bar) // ['answer']
const barProtoKeys = Object.keys(Bar.prototype) // ['print']

class Foo {
  constructor() {
    this.foo = 42
  }
  static answer() {
    return 42
  }
  print() {
    console.log(this.foo)
  }
}
const fooKeys = Object.keys(Foo) // []
const fooProtoKeys = Object.keys(Foo.prototype) // []
```

4. class 的所有方法（包括静态方法和实例方法）都没有原型对象 prototype，所以也没有[[construct]]，不能使用 new 来调用。

```js
function Bar() {
  this.bar = 42
}
Bar.prototype.print = function () {
  console.log(this.bar)
}

const bar = new Bar()
const barPrint = new bar.print() // it's ok

class Foo {
  constructor() {
    this.foo = 42
  }
  print() {
    console.log(this.foo)
  }
}
const foo = new Foo()
const fooPrint = new foo.print() // TypeError: foo.print is not a constructor
```

5. 必须使用 new 调用 class。

```js
function Bar() {
  this.bar = 42
}
const bar = Bar() // it's ok

class Foo {
  constructor() {
    this.foo = 42
  }
}
const foo = Foo() // TypeError: Class constructor Foo cannot be invoked without 'new'
```

6. class 内部无法重写类名。

```js
function Bar() {
  Bar = 'Baz' // it's ok
  this.bar = 42
}
const bar = new Bar()
// Bar: 'Baz'
// bar: Bar {bar: 42}

class Foo {
  constructor() {
    this.foo = 42
    Foo = 'Fol' // TypeError: Assignment to constant variable
  }
}
const foo = new Foo()
Foo = 'Fol' // it's ok
```

### 015 3 个判断数组的方法，请分别介绍它们之间的区别和优劣 Object.prototype.toString.call() 、 instanceof 以及 Array.isArray()

1. Object.prototype.toString.call()

每一个继承 Object 的对象都有 toString 方法，如果 toString 方法没有重写的话，会返回 [Object type]，其中 type 为对象的类型。但当除了 Object 类型的对象外，其他类型直接使用 toString 方法时，会直接返回都是内容的字符串，所以我们需要使用 call 或者 apply 方法来改变 toString 方法的执行上下文。

```js
const an = ['Hello', 'An']
an.toString() // "Hello,An"
Object.prototype.toString.call(an) // "[object Array]"
```

这种方法对于所有基本的数据类型都能进行判断，即使是 null 和 undefined。

```js
Object.prototype.toString.call('An') // "[object String]"
Object.prototype.toString.call(1) // "[object Number]"
Object.prototype.toString.call(Symbol(1)) // "[object Symbol]"
Object.prototype.toString.call(null) // "[object Null]"
Object.prototype.toString.call(undefined) // "[object Undefined]"
Object.prototype.toString.call(function () {}) // "[object Function]"
Object.prototype.toString.call({ name: 'An' }) // "[object Object]"
```

Object.prototype.toString.call() 常用于判断浏览器内置对象时。

2. instanceof

instanceof 的内部机制是通过判断对象的原型链中是不是能找到类型的 prototype。
使用 instanceof 判断一个对象是否为数组，instanceof 会判断这个对象的原型链上是否会找到对应的 Array 的原型，找到返回 true，否则返回 false。

```js
;[] instanceof Array // true
```

但 instanceof 只能用来判断对象类型，原始类型不可以。并且所有对象类型 instanceof Object 都是 true。

```js
;[] instanceof Object // true 3. Array.isArray()
```

3. Array.isArray()

功能：用来判断对象是否为数组，当检测 Array 实例时，Array.isArray 优于 instanceof，因为 Array.isArray 可以检测出 iframes。

```js
var iframe = document.createElement('iframe')
document.body.appendChild(iframe)
xArray = window.frames[window.frames.length - 1].Array
var arr = new xArray(1, 2, 3) // [1,2,3]

// Correctly checking for Array
Array.isArray(arr) // true
Object.prototype.toString.call(arr) // true
// Considered harmful, because doesn't work though iframes
arr instanceof Array // false
```

Array.isArray()是 ES5 新增的方法，当不存在 Array.isArray()，可以用 Object.prototype.toString.call() 实现。

```js
if (!Array.isArray) {
  Array.isArray = function (arg) {
    return Object.prototype.toString.call(arg) === '[object Array]'
  }
}
```

### 016 介绍下重绘和回流（Repaint & Reflow），以及如何进行优化

1. 浏览器渲染机制

浏览器采用流式布局模型（Flow Based Layout）。浏览器会把 HTML 解析成 DOM，把 CSS 解析成 CSSOM，DOM 和 CSSOM 合并就产生了渲染树（Render Tree）。有了 RenderTree，我们就知道了所有节点的样式，然后计算他们在页面上的大小和位置，最后把节点绘制到页面上。

由于浏览器使用流式布局，对 Render Tree 的计算通常只需要遍历一次就可以完成，但 table 及其内部元素除外，他们可能需要多次计算，通常要花 3 倍于同等元素的时间，这也是为什么要避免使用 table 布局的原因之一。

2. 重绘

由于节点的几何属性发生改变或者由于样式发生改变而不会影响布局的，称为重绘，例如 outline, visibility, color、background-color 等，重绘的代价是高昂的，因为浏览器必须验证 DOM 树上其他节点元素的可见性。

3. 回流

回流是布局或者几何属性需要改变就称为回流。回流是影响浏览器性能的关键因素，因为其变化涉及到页面的布局更新。一个元素的回流可能会导致了其所有子元素以及 DOM 中紧随其后的节点、祖先节点元素的回流。

**回流必定会发生重绘，重绘不一定会引发回流。**

4. 浏览器优化

现代浏览器大多都是通过队列机制来批量更新布局，浏览器会把修改操作放在队列中，至少一个浏览器刷新（即 16.6ms）才会清空队列，但当你获取布局信息的时候，队列中可能有会影响这些属性或方法返回值的操作，即使没有，浏览器也会强制清空队列，触发回流与重绘来确保返回正确的值。

主要包括以下属性或方法：

offsetTop、offsetLeft、offsetWidth、offsetHeight
scrollTop、scrollLeft、scrollWidth、scrollHeight
clientTop、clientLeft、clientWidth、clientHeight
width、height
getComputedStyle()
getBoundingClientRect()

所以，我们应该避免频繁的使用上述的属性，他们都会强制渲染刷新队列。

5. 减少重绘与回流

CSS

1. 使用 transform 替代 top
2. 使用 visibility 替换 display: none ，因为前者只会引起重绘，后者会引发回流（改变了布局
3. 避免使用 table 布局，可能很小的一个小改动会造成整个 table 的重新布局。
4. 尽可能在 DOM 树的最末端改变 class，回流是不可避免的，但可以减少其影响。尽可能在 DOM 树的最末端改变 class，可以限制了回流的范围，使其影响尽可能少的节点。
5. 避免设置多层内联样式，CSS 选择符从右往左匹配查找，避免节点层级过多。
6. 应该尽可能的避免写过于具体的 CSS 选择器，然后对于 HTML 来说也尽量少的添加无意义标签，保证层级扁平。
7. 将动画效果应用到 position 属性为 absolute 或 fixed 的元素上，避免影响其他元素的布局，这样只是一个重绘，而不是回流，同时，控制动画速度可以选择 requestAnimationFrame
8. 避免使用 CSS 表达式，可能会引发回流。
9. 将频繁重绘或者回流的节点设置为图层，图层能够阻止该节点的渲染行为影响别的节点，例如 will-change、video、iframe 等标签，浏览器会自动将该节点变为图层。
10. CSS3 硬件加速（GPU 加速），使用 css3 硬件加速，可以让 transform、opacity、filters 这些动画不会引起回流重绘 。但是对于动画的其它属性，比如 background-color 这些，还是会引起回流重绘的，不过它还是可以提升这些动画的性能。

JavaScript

1. 避免频繁操作样式，最好一次性重写 style 属性，或者将样式列表定义为 class 并一次性更改 class 属性。
2. 避免频繁操作 DOM，创建一个 documentFragment，在它上面应用所有 DOM 操作，最后再把它添加到文档中。
3. 避免频繁读取会引发回流/重绘的属性，如果确实需要多次使用，就用一个变量缓存起来。
4. 对具有复杂动画的元素使用绝对定位，使它脱离文档流，否则会引起父元素及后续元素频繁回流。

### 017 观察者模式和订阅-发布模式的区别，各自适用于什么场景

观察者模式中主体和观察者是互相感知的，发布-订阅模式是借助第三方来实现调度的，发布者和订阅者之间互不感知。
区别：

- 观察者模式里，只有两个角色 —— 观察者 + 被观察者
- 发布订阅模式里，却不仅仅只有发布者和订阅者两个角色，还有一个管理并执行消息队列的“经纪人 Broker”

观察者和被观察者，是松耦合的关系，发布者和订阅者，则完全不存在耦合。
可以理解为观察者模式没中间商赚差价，发布订阅模式有中间商赚差价。

### 018 cookie 和 token 都存放在 header 中，为什么不会劫持 token？

- xss：跨站脚本攻击，用攻击者通过各种方式将恶意代码注入到其他用户的页面中。就可以通过脚本获取信息，发起请求之类的操作。
- csrf：跨站请求伪造，简单地说，是攻击者通过一些技术手段欺骗用户的浏览器去访问一个自己曾经认证过的网站并运行一些操作（如发邮件，发消息，甚至财产操作如转账和购买商品）。由于浏览器曾经认证过，所以被访问的网站会认为是真正的用户操作而去运行。这利用了 web 中用户身份验证的一个漏洞：简单的身份验证只能保证请求发自某个用户的浏览器，却不能保证请求本身是用户自愿发出的。csrf 并不能够拿到用户的任何信息，它只是欺骗用户浏览器，让其以用户的名义进行操作。

上面的两种攻击方式，如果被 xss 攻击了，不管是 token 还是 cookie，都能被拿到，**所以对于 xss 攻击来说，cookie 和 token 没有什么区别**。但是对于 csrf 来说就有区别了。
以上面的 csrf 攻击为例：

- cookie：用户点击了链接，cookie 未失效，导致发起请求后后端以为是用户正常操作，于是进行扣款操作。
- token：用户点击链接，由于浏览器不会自动带上 token，所以即使发了请求，后端的 token 验证不会通过，所以不会进行扣款操作。

这是个人理解的为什么只劫持 cookie 不劫持 token 的原因。

### 019 Vue 的双向数据绑定，Model 如何改变 View，View 又是如何改变 Model 的

Model 改变 View 的过程：依赖于 ES5 的 object.defindeProperty，通过 defineProperty 实现的数据劫持，getter 收集依赖，setter 调用更新回调（不同于观察者模式，是发布订阅 + 中介）。

View 改变 Model 的过程：依赖于 v-model ,该语法糖实现是在单向数据绑定的基础上，增加事件监听并赋值给对应的 Model。

### 020 改造下面的代码，使之输出 0 - 9

```js
for (var i = 0; i < 10; i++) {
  setTimeout(() => {
    console.log(i)
  }, 1000)
}
```

解法一：利用 let 变量的特性，在每一次 for 循环的过程中，let 声明的变量会在当前的块级作用域里面（for 循环的 body 体，也即两个花括号之间的内容区域）创建一个文法环境（Lexical Environment），该环境里面包括了当前 for 循环过程中的 i，

```js
for (let i = 0; i < 10; i++) {
  setTimeout(() => {
    console.log(i)
  }, 1000)
}
```

解法二：利用函数自执行的方式，把当前 for 循环过程中的 i 传递进去，构建出块级作用域。IIFE 其实并不属于闭包的范畴。

```js
for (var i = 0; i < 10; i++) {
  ;((i) => {
    setTimeout(() => {
      console.log(i)
    }, 1000)
  })(i)
}
```

### 021 下面的代码打印什么内容？

```js
var b = 10
;(function b() {
  b = 20
  console.log(b)
})()
```

打印内容：

```
ƒ b() {
  b = 20;
  console.log(b)
}
```

原因：一个声明在函数体内都是可见的，函数声明优先于变量声明；**在非匿名自执行函数中，函数变量为只读状态无法修改**。

- 函数表达式与函数声明不同，函数名只在该函数内部有效，并且此绑定是常量绑定。
- IIFE 中的函数是函数表达式，而不是函数声明。

改造使其分别打印 10 和 20：

```js
var b = 10
;(function b() {
  var b = 20
  console.log(this.b) // 10
  console.log(b) // 20
})()
```

### 022 浏览器的缓存机制

从缓存位置上来说分为四种，并且各自有优先级，当依次查找缓存且都没有命中的时候，才会去请求网络。

1. Service Worker
2. Memory Cache
3. Disk Cache
4. Push Cache

Service Worker 是运行在浏览器背后的独立线程。使用 Service Worker 的话，传输协议必须为 HTTPS。因为 Service Worker 中涉及到请求拦截，所以必须使用 HTTPS 协议来保障安全。Service Worker 的缓存与浏览器其他内建的缓存机制不同，它可以让我们自由控制缓存哪些文件、如何匹配缓存、如何读取缓存，并且缓存是持续性的。

Service Worker 实现缓存功能一般分为三个步骤：首先需要先注册 Service Worker，然后监听到 install 事件以后就可以缓存需要的文件，那么在下次用户访问的时候就可以通过拦截请求的方式查询是否存在缓存，存在缓存的话就可以直接读取缓存文件，否则就去请求数据。

Memory Cache 也就是内存中的缓存，主要包含的是当前中页面中已经抓取到的资源,例如页面上已经下载的样式、脚本、图片等。读取内存中的数据肯定比磁盘快，内存缓存虽然读取高效，可是缓存持续性很短，会随着进程的释放而释放。一旦我们关闭 Tab 页面，内存中的缓存也就被释放了。

内存缓存中有一块重要的缓存资源是 preloader 相关指令（例如 `<link rel="prefetch">`）下载的资源。总所周知 preloader 的相关指令已经是页面优化的常见手段之一，它可以一边解析 js/css 文件，一边网络请求下一个资源。

Disk Cache 也就是存储在硬盘中的缓存，读取速度慢点，但是什么都能存储到磁盘中，比之 Memory Cache 胜在容量和存储时效性上。绝大部分的缓存都来自 Disk Cache。

浏览器会把哪些文件丢进内存中？哪些丢进硬盘中？关于这点，网上说法不一，不过以下观点比较靠得住：

- 对于大文件来说，大概率是不存储在内存中的，反之优先；
- 当前系统内存使用率高的话，文件优先存储进硬盘。

Push Cache（推送缓存）是 HTTP/2 中的内容，当以上三种缓存都没有命中时，它才会被使用。它只在会话（Session）中存在，一旦会话结束就被释放，并且缓存时间也很短暂，在 Chrome 浏览器中只有 5 分钟左右，同时它也并非严格执行 HTTP 头中的缓存指令。

### 023 使用迭代的方式实现 flatten 函数

```js
let arr = [1, 2, [3, 4, 5, [6, 7], 8], 9, 10, [11, [12, 13]]]

// 迭代
const flatten = (arr) => {
  while (arr.some((item) => Array.isArray(item))) {
    arr = [].concat(...arr)
  }
  return arr
}

// 递归
const flatten = (arr) => arr.reduce((acc, cur) => (Array.isArray(cur) ? [...acc, ...flatten(cur)] : [...acc, cur]), [])
```

### 024 为什么 Vuex 的 mutation 和 Redux 的 reducer 中不能做异步操作

因为更改 state 的函数必须是纯函数，**纯函数既是统一输入就会统一输出**，没有任何副作用；如果是异步则会引入额外的副作用，导致更改后的 state 不可预测。

因为异步操作是成功还是失败不可预测，什么时候进行异步操作也不可预测；当异步操作成功或失败时，如果不 commit(mutation) 或者 dispatch(action)，Vuex 和 Redux 就不能捕获到异步的结果从而进行相应的操作。

### 025 代码中 a 在什么情况下会打印 1？

```js
var a = ?;
if(a == 1 && a == 2 && a == 3){
 	console.log(1);
}
```

**因为 == 会进行隐式类型转换**，所以重写 toString 方法就可以了：

```js
var a = {
  i: 1,
  toString() {
    return a.i++
  },
}

if (a == 1 && a == 2 && a == 3) {
  console.log(1)
}
```

### 026 介绍下 BFC 及其应用

BFC（Formatting context）就是块级格式上下文，是页面盒模型布局中的一种 CSS 渲染模式，相当于一个独立的容器，里面的元素和外部的元素相互不影响。创建 BFC 的方式有：

1. html 根元素
2. float 浮动
3. 绝对定位
4. display 为表格布局或者弹性布局
5. overflow 不为 visiable

BFC 主要的作用是：

1. 清除浮动
2. 防止同一 BFC 容器中的相邻元素间的外边距重叠问题

### 027 在 Vue 中，子组件为何不可以修改父组件传递的 Prop？

为了保证数据的单向流动，便于对数据进行追踪，避免数据混乱。

### 028 下面代码输出什么？

```js
var a = 10
;(function () {
  console.log(a) // undefined
  a = 5
  console.log(window.a) // 10
  var a = 20
  console.log(a) // 20
})()
```

在立即执行函数中，`var a = 20` 语句定义了一个局部变量 a，由于变量声明提升机制，局部变量 a 的声明会被提升至立即执行函数的函数体最上方，且由于这样的提升并不包括赋值，因此第一条打印语句会打印 undefined，最后一条语句会打印 20。

由于变量声明提升，`a = 5` 这条语句执行时，局部的变量 a 已经声明，因此它产生的效果是对局部的变量 a 赋值，此时 window.a 依旧是最开始赋值的 10。

### 029 实现一个 sleep 函数

```js
const sleep = (time) => {
  return new Promise((resolve) => setTimeout(resolve, time))
}

sleep(1000).then(() => {
  // 这里写你的骚操作
})
```

### 030 使用 sort() 对数组 [3, 15, 8, 29, 102, 22] 进行排序，输出结果

sort 函数，可以接收一个函数，返回值是比较两个数的相对顺序的值

1. 默认没有函数，默认的排序方法会将数组元素转换为字符串，然后比较字符串中字符的 UTF-16 编码顺序来进行排序

```js
;[3, 15, 8, 29, 102, 22].sort()

// [102, 15, 22, 29, 3, 8]
```

2. 带函数的比较

```js
;[3, 15, 8, 29, 102, 22].sort((a, b) => {
  return a - b
})
```

- 返回值大于 0 即 a-b > 0，a 和 b 交换位置
- 返回值大于 0 即 a-b < 0，a 和 b 位置不变
- 返回值等于 0 即 a-b = 0，a 和 b 位置不变

更方便记忆：**a-b 输出从小到大排序，b-a 输出从大到小排序**。

### 031 输出以下代码执行的结果并解释为什么

```js
var obj = {
  2: 3,
  3: 4,
  length: 2,
  splice: Array.prototype.splice,
  push: Array.prototype.push,
}
obj.push(1)
obj.push(2)
console.log(obj) // [,,1,2]
```

push 方法应该是根据数组的 length 来根据参数给数组创建一个下标为 length 的属性。

1. 使用第一次 push，obj 对象的 push 方法设置 obj[2]=1;obj.length+=1
2. 使用第二次 push，obj 对象的 push 方法设置 obj[3]=2;obj.length+=1
3. 使用 console.log 输出的时候，因为 obj 具有 length 属性和 splice 方法，故将其作为数组进行打印
4. 打印时因为数组未设置下标为 0 1 处的值，故打印为 empty，主动 obj[0] 获取为 undefined

### 032 双向绑定和 vuex 是否冲突

在严格模式中使用 Vuex，当用户输入时，v-model 会试图直接修改属性值，但这个修改不是在 mutation 中修改的，所以会抛出一个错误。当需要在组件中使用 vuex 中的 state 时，有 2 种解决方案：

1. 在 input 中绑定 value(vuex 中的 state)，然后监听 input 的 change 或者 input 事件，在事件回调中调用 mutation 修改 state 的值
2. 使用带有 setter 的双向绑定计算属性。

```js
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

### 033 call 和 apply 的区别是什么，哪个性能更好一些

Function.prototype.apply 和 Function.prototype.call 的作用是一样的，区别在于传入参数的不同：

- 第一个参数都是，指定函数体内 this 的指向；
- 第二个参数开始不同，apply 是传入带下标的集合，数组或者类数组，apply 把它传给函数作为参数，call 从第二个开始传入的参数是不固定的，都会传给函数作为参数。

call 比 apply 的性能要好，因为内部少了一次将 apply 第二个参数解构的操作。

在 es6 引入了延展操作符后，即使参数是数组，可以使用 call：

```js
let params = [1, 2, 3, 4]
xx.call(obj, ...params)
```

### 034 为什么通常在发送数据埋点请求的时候使用的是 1x1 像素的透明 gif 图片？

1. 没有跨域问题，一般这种上报数据，代码要写通用的（排除 ajax）
2. 不会阻塞页面加载，影响用户的体验，只要 new Image 对象就好了（排除 JS/CSS 文件资源方式上报）
3. 在所有图片中，体积最小（比较 PNG/JPG）

### 035 实现 (5).add(3).minus(2) 功能

```js
Number.prototype.add = function (n) {
  return this.valueOf() + n
}
Number.prototype.minus = function (n) {
  return this.valueOf() - n
}
```

### 036 Vue 的响应式原理中 Object.defineProperty 有什么缺陷？为什么在 Vue3.0 采用了 Proxy，抛弃了 Object.defineProperty？

1. Object.defineProperty 无法监控到数组下标的变化，导致通过数组下标添加元素，不能实时响应；
2. Object.defineProperty 只能劫持对象的属性，从而需要对每个对象每个属性进行遍历，如果属性值是对象，还需要深度遍历。Proxy 可以劫持整个对象，并返回一个新的对象。
3. Proxy 不仅可以代理对象，还可以代理数组。还可以代理动态增加的属性。

### 037 怎么让一个 div 水平垂直居中

```html
<div class="parent">
  <div class="child"></div>
</div>
```

1.

```css
div.parent {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

2.

```css
div.parent {
  position: relative;
}
div.child {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

3.

```css
div.parent {
  position: relative;
}
div.child {
  width: 50px;
  height: 10px;
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  margin: auto;
}
```

4.

```css
div.parent {
  display: grid;
}
div.child {
  justify-self: center;
  align-self: center;
}
```

### 038 输出以下代码的执行结果并解释为什么

```js
var a = { n: 1 }
var b = a
a.x = a = { n: 2 }

console.log(a.x) // undefined
console.log(b.x) // {n:2}
```

`a.x = a = {n: 2};` 这一行比较复杂。先获取等号左侧的 a.x，但 a.x 并不存在，于是 JS 为（堆内存中的）对象创建一个新成员 x，这个成员的初始值为 undefined，（这也是为什么直接引用一个未定义的变量会报错，但是直接引用一个对象的不存在的成员时，会返回 undefined）

创建完成后，目标指针已经指向了这个新成员 x，并会先挂起，单等等号右侧的内容有结果了，便完成赋值。接着执行赋值语句的右侧，发现 a={n:2} 是个简单的赋值操作，于是 a 的新值等于了{n:2}。这里特别注意，这个 a 已经不是开头的那个 a，而是一个全新的 a，这个新 a 指针已经不是指向原来的值的那个堆内存，而是分配了一个新的堆内存。但是原来旧的堆内存因为还有 b 在占用，所以并未被回收。然后将这个新的对象 a 的堆内存指针，赋值给了刚才挂起的新成员 x，此时，对象成员 x 便等于了新的对象 a。所以，现在 `b={n:1,x:{n:2}}; a={n:2};`。

### 039 冒泡排序如何实现，时间复杂度是多少？

时间复杂度：O(n^2)

```js
const arr = [8, 94, 15, 88, 55, 76, 21, 39]

function bubbleSort(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        const temp = arr[j]
        arr[j] = arr[j + 1]
        arr[j + 1] = temp
      }
    }
  }
  console.log(arr)
}
```

- 当 i=0 的时候，里面的循环完整执行，从 j=0 执行到 j=6,这也就是第一遍排序，结果是将最大的数排到了最后，这一遍循环结束后的结果应该是 [8,15,88,55,76,21,39,94]
- 当 i=1 的时候，里面的循环再次完整执行，由于最大的数已经在最后了，没有必要去比较数组的最后两项，这也是 `j<arr.length-1-i` 的巧妙之处，结果是 [8,15,55,76,21,39,88,94]

### 040 某公司 1 到 12 月份的销售额存在一个对象里面

如下：{1:222, 2:123, 5:888}，请把数据处理为如下结构：[222, 123, null, null, 888, null, null, null, null, null, null, null]。

```js
let obj = { 1: 222, 2: 123, 5: 888 }
const result = Array.from({ length: 12 }).map((_, index) => obj[index + 1] || null)
console.log(result)
```

### 041 要求设计 LazyMan 类，实现以下功能。

```js
LazyMan('Tony')
// Hi I am Tony

LazyMan('Tony').sleep(10).eat('lunch')
// Hi I am Tony
// 等待了10秒...
// I am eating lunch

LazyMan('Tony').eat('lunch').sleep(10).eat('dinner')
// Hi I am Tony
// I am eating lunch
// 等待了10秒...
// I am eating diner

LazyMan('Tony').eat('lunch').eat('dinner').sleepFirst(5).sleep(10).eat('junk food')
// Hi I am Tony
// 等待了5秒...
// I am eating lunch
// I am eating dinner
// 等待了10秒...
// I am eating junk food
```

实现：

```js
class LazyManClass {
  constructor(name) {
    console.log(`Hi I am ${name}`)
    this.taskList = []
    setTimeout(() => {
      this.next()
    }, 0)
  }

  eat(name) {
    const task = () => {
      console.log(`I am eating ${name}`)
      this.next()
    }
    this.taskList.push(task)
    return this
  }

  sleep(time) {
    const task = () => {
      setTimeout(() => this.next(), time * 1000)
    }
    this.taskList.push(task)
    return this
  }

  sleepFirst(time) {
    const task = () => {
      setTimeout(() => this.next(), time * 1000)
    }
    this.taskList.unshift(task)
    return this
  }

  next() {
    const task = this.taskList.shift()
    task && task()
  }
}

function LazyMan(name) {
  return new LazyManClass(name)
}
```

### 042 opacity: 0、visibility: hidden、display: none 优劣和适用场景

- display: none 会回流操作 性能开销较大，回流会计算相邻元素甚至组先级元素的位置、属性等
- visibility: hidden 是重绘操作 比回流操作性能高一些
- opacity: 0 重建图层，性能较高

### 043 箭头函数与普通函数（function）的区别是什么？构造函数（function）可以使用 new 生成实例，那么箭头函数可以吗？为什么？

箭头函数是和普通函数相比，有以下几点差异：

1. 函数体内的 this 对象，就是定义时所在的对象，而不是使用时所在的对象。
2. 不可以使用 arguments 对象，该对象在函数体内不存在。如果要用，可以用 rest 参数代替。
3. 不可以使用 yield 命令，因此箭头函数不能用作 Generator 函数。
4. 不可以使用 new 命令，因为：
   - 没有自己的 this，无法调用 call，apply。
   - 没有 prototype 属性 ，而 new 命令在执行时需要将构造函数的 prototype 赋值给新的对象的 **proto**

### 044 给定两个数组，写一个方法来计算它们的交集

给定 nums1 = [1, 2, 2, 1]，nums2 = [2, 2]，返回 [2, 2]。

这道题不是工程题，是道算法题。求的是~~两个数组的最长公共子序列~~ (子序列要求顺序，交集不需要），列如：

```js
var nums1 = [1]
var nums2 = [1, 1]
```

交集应该是 [1]。

这道题两种思路，空间换时间，或者不用额外空间就提升时间复杂度。

1. 空间换时间的思路是用个 Hash 表来存数组 1 的元素以及出现的个数（此处需要遍历 n 次，并存一个 n 级别的空间）。遍历数组 2，发现数组 2 里有 Hash 表里的值就存到 Result 数组里，并把 Hash 表内该值次数减一（为 0 之后就 Delete）。如果不存在 Hash 表里，就跳过。这样时间复杂度就是(m+n)。

2. 不用额外空间，就用遍历 n 的时候，判断值在不在 m 里，如果在，把 m 里的该值 push 到 Result 数组里，并将该值从 m 数组里删掉（用 splice）。这样就是不用额外空间，但是提高了时间复杂度。

思路 1 的解法：

```js
const intersect = (nums1, nums2) => {
  const map = {}
  const res = []
  for (let n of nums1) {
    if (map[n]) {
      map[n]++
    } else {
      map[n] = 1
    }
  }
  for (let n of nums2) {
    if (map[n] > 0) {
      res.push(n)
      map[n]--
    }
  }
  return res
}
```

### 045 已知如下代码，如何修改才能让图片宽度为 300px?

```html
<img src="1.jpg" style="width:480px!important;”>
```

有两种方式：

```css
/* 方式一 */
max-width: 300px;

/* 方式二 */
transform: scale(0.625, 0.625);
```

### 046 redux 为什么要把 reducer 设计成纯函数？

redux 的设计思想就是不产生副作用，数据更改的状态可回溯，所以 redux 中处处都是纯函数

### 047 如何设计实现无缝轮播

无限轮播基本插件都可以做到，不过要使用原生代码实现无缝滚动的话我可以提点思路，因为轮播图基本都在 ul 盒子里面的 li 元素。

1. 首先获取第一个 li 元素和最后一个 li 元素,
2. 克隆第一个 li 元素，和最后一个 li 元素，
3. 分别插入到 lastli 的后面和 firstli 的前面，
4. 然后监听滚动事件，如果滑动距离超过 x 或-x，让其实现跳转下一张图或者跳转上一张，(此处最好设置滑动距离)，
5. 然后在滑动最后一张实现最后一张和克隆第一张的无缝转换，当到克隆的第一张的时候停下的时候，让其切入真的第一张，则实现无线滑动，向前滑动同理

### 048 [模拟实现一个 Promise.finally](https://github.com/Advanced-Frontend/Daily-Interview-Question/issues/109)

```js
Promise.prototype.finally = function (callback) {
  let P = this.constructor // 获取当前实例构造函数的引用
  return this.then(
    (value) => P.resolve(callback()).then(() => value), // 接受状态：返回数据
    (reason) =>
      P.resolve(callback()).then(() => {
        throw reason
      }) // 拒绝状态：抛出错误
  )
}
```

测试：

```js
/*********************** 测试 ***********************/
const p = new Promise((resolve, reject) => {
  console.info('starting...')

  setTimeout(() => {
    Math.random() > 0.5 ? resolve('success') : reject('fail')
  }, 1000)
})

// 正常顺序测试
p.then((data) => {
  console.log(`%c resolve: ${data}`, 'color: green')
})
  .catch((err) => {
    console.log(`%c catch: ${err}`, 'color: red')
  })
  .finally(() => {
    console.info('finally: completed')
  })

// finally 前置测试
p.finally(() => {
  console.info('finally: completed')
})
  .then((data) => {
    console.log(`%c resolve: ${data}`, 'color: green')
  })
  .catch((err) => {
    console.log(`%c catch: ${err}`, 'color: red')
  })
```

### 049 ES6 代码转成 ES5 代码的实现思路是什么？

ES6 代码转成 ES5 代码，可以参考 Babel 的实现方式。那么 Babel 是如何把 ES6 转成 ES5 呢，其大致分为三步：

1. 将代码字符串解析成抽象语法树，即所谓的 AST
2. 对 AST 进行处理，在这个阶段可以对 ES6 代码进行相应转换，即转成 ES5 代码
3. 根据处理后的 AST 再生成代码字符串

### 050 如何解决移动端 Retina 屏 1px 像素问题

1. 伪元素 + transform scaleY(.5)
2. border-image
3. background-image
4. box-shadow

### 051 如何把一个字符串的大小写取反（大写变小写小写变大写），例如 ’AbC' 变成 'aBc'

方案一

```js
const processString = (str) =>
  str
    .split('')
    .map((s) => (s === s.toUpperCase() ? s.toLowerCase() : s.toUpperCase()))
    .join('')
```

方案二

```js
const processString = (str) => str.replace(/[a-zA-Z]/g, (s) => (/[a-z]/.test(s) ? s.toUpperCase() : s.toLowerCase()))
```

### 052 绍下 webpack 热更新原理，是如何做到在不刷新浏览器的前提下更新页面？

1. 当修改了一个或多个文件，文件系统接收更改并通知 webpack；
2. webpack 重新编译构建一个或多个模块，并通知 HMR 服务器进行更新；
3. HMR Server 使用 webSocket 通知 HMR runtime 需要更新，HMR 运行时通过 HTTP 请求更新 jsonp；
4. HMR 运行时替换更新中的模块，如果确定这些模块无法更新，则触发整个页面刷新。

### 053 实现一个字符串匹配算法，从长度为 n 的字符串 S 中，查找是否存在字符串 T，T 的长度是 m，若存在返回所在位置。

```js
// 因为 T 的 length 是一定的，所以在循环S的的时候 ，循环当前项 i 后面至少还有 T.length 个元素
const find = (S, T) => {
  if (S.length < T.length) return -1
  for (let i = 0; i < S.length - T.length; i++) {
    if (S.substr(i, T.length) === T) return i
  }
  return -1
}
```

或者使用正则：

```js
// 方法一：
const find = (S, T) => S.search(T)

// 方法二：
const find = (S, T) => {
  const matched = S.match(T)
  return matched ? matched.index : -1
}
```
