# [useCallback 的正确使用方式](https://juejin.cn/post/6847902217261809671)

> 只有当子组件是一个昂贵组件的时候，传给子组件的方法才有必要用 useCallBack 包裹一下；只有当要使用的对象比较复杂的时候才需要用 useMemo 包裹起来。

产生误区的原因是 useCallback 的设计初衷并非解决组件内部函数多次创建的问题，而是减少子组件的不必要重复渲染。实际上在 React 体系下，优化思路主要有两种：

1. 减少重新 render 的次数。因为 React 最耗费性能的就是调和过程（reconciliation），只要不 render 就不会触发 reconciliation；
2. 减少计算量，这个自然不必多说。

```javascript
import React, { useState } from 'react'

function Comp() {
  const [dataA, setDataA] = useState(0)
  const [dataB, setDataB] = useState(0)

  const onClickA = () => {
    setDataA((o) => o + 1)
  }

  const onClickB = () => {
    setDataB((o) => o + 1)
  }

  return (
    <div>
      <Cheap onClick={onClickA}>组件Cheap：{dataA}</div>
      <Expensive onClick={onClickB}>组件Expensive：{dataB}</Expensive>
    </div>
  )
}
```

Expensive 是一个渲染成本非常高的组件，但点击 Cheap 组件也会导致 Expensive 重新渲染，即使 dataB 并未发生改变。原因就是 onClickB 被重新定义，导致 React 在 diff 新旧组件时，判定组件发生了变化。这时候 useCabllback 和 memo 就发挥了作用：

```javascript
import React, { useState, memo, useCallback } from 'react'

function Expensive({ onClick, name }) {
  console.log('Expensive 渲染')
  return <div onClick={onClick}>{name}</div>
}

const MemoExpensive = memo(Expensive)

function Cheap({ onClick, name }) {
  console.log('cheap 渲染')
  return <div onClick={onClick}>{name}</div>
}

export default function Comp() {
  const [dataA, setDataA] = useState(0)
  const [dataB, setDataB] = useState(0)

  const onClickA = () => {
    setDataA((o) => o + 1)
  }

  const onClickB = useCallback(() => {
    setDataB((o) => o + 1)
  }, [])

  return (
    <div>
      <Cheap onClick={onClickA} name={`组件Cheap：${dataA}`} />
      <MemoExpensive onClick={onClickB} name={`组件Expensive：${dataB}`} />
    </div>
  )
}
```

memo 是 React v16.6.0 新增的方法，与 PureComponent 类似，前者负责 Function Component 的优化，后者负责 Class Component。它们都会对传入组件的新旧数据进行浅比较，如果相同则不会触发渲染。

所以 useCallback 保证了 onClickB 不发生变化，此时点击 Cheap 组件不会触发 Expensive 组件的刷新，只有点击 Expensive 组件才会触发。
