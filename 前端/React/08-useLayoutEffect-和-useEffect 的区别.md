## [useLayoutEffect 和 useEffect 的区别](https://zhuanlan.zhihu.com/p/348701319)

### 差异

- useEffect 是异步执行的，而 useLayoutEffect 是同步执行的。
- useEffect 的执行时机是浏览器完成渲染之后，而 useLayoutEffect 的执行时机是浏览器把内容真正渲染到界面之前，和 componentDidMount、componentDidUpdate 等价。

## 具体表现

```jsx
import React, { useEffect, useLayoutEffect, useState } from 'react'

function App() {
  const [state, setState] = useState('hello world')

  // 使用 useEffect 有闪烁现象，换成 useLayoutEffect 则无
  useEffect(() => {
    let i = 0
    while (i <= 100000000) {
      i++
    }
    setState('world hello')
  }, [])

  return (
    <>
      <div>{state}</div>
    </>
  )
}

export default App
```

![具体表现](/IMAGES/2023/useLayoutEffect-和-useEffect-的区别/具体表现.webp)

因为 useEffect 是渲染完之后异步执行的，所以会导致 hello world 先被渲染到了屏幕上，再变成 world hello，就会出现闪烁现象。而 useLayoutEffect 是渲染之前同步执行的，所以会等它执行完再渲染上去，就避免了闪烁现象。也就是说我们最好把操作 dom 的相关操作放到 useLayouteEffect 中去，避免导致闪烁。

### ssr

useLayoutEffect 不会在服务端执行，所以就有可能导致 ssr 渲染出来的内容和实际的首屏内容并不一致。

而解决这个问题也很简单：

- 放弃使用 useLayoutEffect，使用 useEffect 代替
- 如果你明确知道 useLayouteffect 对于首屏渲染并没有影响，但是后续会需要，你可以这样写：

```javascript
import { useEffect, useLayoutEffect } from 'react'

export const useCustomLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect
```

### 总结

- 优先使用 useEffect，因为它是异步执行的，不会阻塞渲染。
- 会影响到渲染的操作尽量放到 useLayoutEffect 中去，避免出现闪烁问题。
- useLayoutEffect 和 componentDidMount、componentDidUpdate 是等价的，会同步调用，阻塞渲染。
- useLayoutEffect 在服务端渲染的时候使用会有一个 warning，因为它可能导致首屏实际内容和服务端渲染出来的内容不一致。
