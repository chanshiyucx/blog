Async 函数是 ES2017 标准提供的改进版异步编程解决方案，它比 Generator 函数更加优雅方便。Async 函数就是隧道尽头的亮光，很多人认为它是异步操作的终极解决方案。<!-- more -->

异步操作是 JavaScript 编程的麻烦事，从最早的回调函数，到 Promise 对象，再到 Generator 函数，每次都有所改进，但又让人觉得不彻底。它们都有额外的复杂性，都需要理解抽象的底层运行机制。

> 异步编程的最高境界，就是根本不用关心它是不是异步。

## async 函数

### 含义

总体来讲，async 函数是 Generatot 函数的语法糖，但是相比之有 4 点改进：

1. 内置执行器：Generator 函数执行必须靠执行器，而 async 函数自带执行器。
2. 更好的语义：async 和 await 相比星号和 yield，语义更清晰。
3. 更广的适用性：yield 命令后面只能是 Thunk 函数或 Promise 对象，而 await 命令后面可以是 Promise 对象或原始值。
4. 返回值是 Promise：async 函数返回值是 Promise 对象，而 Generator 函数返回值是 Iterator 对象。

async 函数可以看作由多个异步操作包装成的一个 Promise 对象，而 await 命令就是内部 then 命令的语法糖。

### 用法
