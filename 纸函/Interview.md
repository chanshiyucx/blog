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

1. 客户端使用 https 的 url 访问 web 服务器,要求与服务器建立 ssl 连接
2. web 服务器收到客户端请求后, 会将网站的证书(包含公钥)传送一份给客户端
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
