# React Hook 定时器

前段时间学习了 React 新发布的 Hook 新功能，学完立马就爱上了这个新 API，用起来感觉比 class 组件爽多了。但 hook 虽然看似简单，但是要能熟练运用还是得花上一段时间。

## 随机间隔计数器

目标：实现一个计数器，通过输入框输入计数器每次计数的时间（ms），按输入的时间间隔每次增一

### class 版本

如果熟悉 React class 组件模式，这个功能实现不难。但是这样有两个弊端：

1. 会有大量模板代码，我们不得不通过多个生命周期来实现一个功能
2. 同一个功能逻辑代码却分布在不同地方，比如创建定时器和清除定时器放在两个不同的生命周期

```javascript
import React from 'react'

class ClassVersion extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      count: 0,
      delay: 1000
    }
  }

  componentDidMount() {
    this.timer = setInterval(this.tick, this.state.delay)
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.delay !== this.state.delay) {
      clearInterval(this.timer)
      this.timer = setInterval(this.tick, this.state.delay)
    }
  }

  componentWillUnmount() {
    clearInterval(this.timer)
  }

  handelDelayChange = e => {
    this.setState({
      delay: +e.target.value
    })
  }

  tick = () => {
    this.setState({
      count: this.state.count + 1
    })
  }

  render() {
    const { count, delay } = this.state

    return (
      <>
        <h1>Class 版本定时器</h1>
        <Input onChange={this.handelDelayChange} defaultValue={delay} />
        <div>
          Count: {count} Delay: {delay}ms
        </div>
      </>
    )
  }
}
```

### Hook 版本

通过 Hook 实现计数器，代码更加已读，而且功能逻辑代码集中，创建计数器和清空计数器的代码集中一起。

```javascript
import React, { useState, useEffect } from 'react'

function HookVersion() {
  const [count, setCount] = useState(0)
  const [delay, setDelay] = useState(1000)

  useEffect(() => {
    const timer = setInterval(() => {
      setCount(c => c + 1)
    }, delay)
    return () => clearInterval(timer)
  }, [delay])

  const handelDelayChange = e => setDelay(+e.target.value)

  return (
    <>
      <h1>Hook 版本定时器</h1>
      <Input onChange={handelDelayChange} defaultValue={delay} />
      <div>
        Count: {count} Delay: {delay}ms
      </div>
    </>
  )
}
```

上面的 Hook 代码能够正常运行，可以注意到我们在每次计数器新增的时候调用的是 `setCount(c => c + 1)`，传入的参数是一个函数 `c => c + 1`，也就是接收之前的值然后每次增一，而不是 `setCount(count + 1)`，可以明确的是如果传入 `count + 1` 是无法正常工作的，`count` 会被固定为 0，所以计数器增加到 1 的时候就是停止不动，每次都是计数为 1。

`count` 被固定的原因是在 `delay` 不发生改变的情况下 `effect` 并不会重复执行，定时器每次 `setCount` 读取到的都是初始值。

虽然通过传入函数而不是固定值可以解决 `count` 被固定的问题，但是却无法读取每次渲染时期的 `props`。如何解决呢？可以通过在每次计数的时候不改变定时器，但是动态指向定时器的回调。

**useRef() 返回了一个字面量，持有一个可变的 current 属性，在每一次渲染之间共享**。可以将 Ref Hook 看作是一个容器，`.current` 属性可以指向任何值，类似于 class 组件的 `this`。通过使用 ref 来保存每次定时器回调函数。

React 组件的 props 和 state 会变化时，都会被重新渲染，并且把之前的渲染结果“忘记”的一干二净。两次渲染之间，是互不相干的。

useEffect() Hook 同样会“遗忘”之前的结果。它清理上一个 effect 并且设置新的 effect。新的 effect 获取到了新的 props 和 state。

但是 setInterval() 不会 “忘记”。 它会一直引用着旧的 props 和 state，除非把它换了。但是只要把它换了，就不得不重新设置时间。

但是通过 ref 我们可以做到只更换定时器的回调而不改变定时器的时间：

1. 设置计时器 `setInterval(fn, delay)`，其中 fn 调用 cb 回调。
2. 第一次渲染，设置回调为 cb1
3. 第二次渲染，设置回调为 cb2

```javascript
import React, { useState, useEffect, useRef } from 'react'

function HookVersion() {
  const [count, setCount] = useState(0)
  const [delay, setDelay] = useState(1000)

  useInterval(() => {
    setCount(count + 1)
  }, delay)

  function handelDelayChange(e) {
    setDelay(+e.target.value)
  }

  return (
    <>
      <h1>Hook 版本定时器</h1>
      <Input onChange={handelDelayChange} defaultValue={delay} />
      <div>
        Count: {count} Delay: {delay}ms
      </div>
    </>
  )
}

function useInterval(cb, delay) {
  const ref = useRef()

  useEffect(() => {
    ref.current = cb
  })

  useEffect(() => {
    const timer = setInterval(() => ref.current(), delay)
    return () => clearInterval(timer)
  }, [delay])
}
```

这里获取提取出可复用的定时器 Hook 会更加优雅，而且 `useInterval` 与 `setInterval` 使用方式一样：

```javascript
setInterval(fn, delay)

useInterval(fn, delay)
```
