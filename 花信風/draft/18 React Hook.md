[pixiv: 67109373]: # "https://chanshiyu.com/poi/2019/44.jpg"

作为 React 入坑的前端，至今快有一年没有用 React 写过项目了，自从上了 Vue 这条船就一直停不下来。一年来 React 已经更新了多个版本，新增了许多新特性，是时候重新上船了。

React Hook 是 React 16.8 的新增特性。它可以让你在不编写 class 的情况下使用 state 以及其他的 React 特性。

## 拥抱 React Hook

### 什么是 Hook？

Hook 是一些可以让你在函数组件里“钩入” React state 及生命周期等特性的函数。Hook 不能在 class 组件中使用。

### 什么时候使用 Hook？

如果你在编写函数组件并意识到需要向其添加一些 state，以前的做法是必须将其它转化为 class，而现在你可以在现有的函数组件中使用 Hook。

## State Hook

State Hook 是允许你在 React 函数组件中添加 state 的 Hook。在 class 中，可以通过在构造函数中设置 this.state 来初始化 state，但是在函数组件中，我们没有 this，所以不能分配或读取 this.state，我们直接在组件中调用 `useState`，举个栗子：

```javascript
import React, { useState } from 'react'

export default function Hello(prop) {
  const [name, setName] = useState('chanshiyu)
  const handleChange = e => setName(e.target.value)

  return (
    <div>
      <Input placeholder="Your name" value={name} onChange={handleChange} />
    </div>
  )
}
```

`useState` 是 react 提供的新方法，这是一种在函数调用时保存变量的方式，它与 class 里面的 this.state 提供的功能完全相同。一般来说，在函数退出后变量就就会”消失”，而 state 中的变量会被 React 保留。

`useState` 方法里面唯一的参数就是初始 state。不同于 class 初始 state 必须是对象类型，`useState` 的参数可以是数字或者字符串等类型而不一定是对象。如果初始 state 需要通过复杂计算获得，则可以传入一个函数，在函数中计算并返回初始的 state，此函数只在初始渲染时被调用。

`useState` 调用后会返回当前 state 以及更新 state 的函数，可以通过数组的解构赋值来获取。**不像 class 中的 this.setState，更新 state 变量总是替换它而不是合并它**。

当然，如果存在多个表单域，最好的实现方式是将 Hook 提取出复用的函数：

```javascript
import React, { useState } from "react"

export default function Hello(prop) {
  const name = useFormInput("chanshiyu")
  const age = useFormInput("24")

  return (
    <div>
      <Input placeholder="Your name" value={name.value} onChange={name.onChange} />
      <Input placeholder="Your age" value={age.value} onChange={age.onChange} />
    </div>
  )
}

function useFormInput(initialValue) {
  const [value, setValue] = useState(initialValue)
  const handleChange = e => setValue(e.target.value)

  return {
    value,
    onChange: handleChange
  }
}
```

## Effect Hook

Effect Hook 可以让你在函数组件中执行副作用操作。**数据获取，设置订阅以及手动更改 React 组件中的 DOM 都属于副作用**。React 组件中常见副作用一般分不需要清除和需要清除两种类型。

### 不需要清除的 Effect

这里先举个不需要清除副作用的栗子，我们根据表单输入内容来动态改变页面标签标题：

```javascript
import React, { useState, useEffect } from "react"

export default function Hello(prop) {
  const name = useFormInput("chanshiyu")

  const title = `Hello, ${name.value}`
  useDocumentTitle(title)

  return (
    <div>
      <Input placeholder="Your name" value={name.value} onChange={name.onChange} />
    </div>
  )
}

function useFormInput(initialValue) {
  const [value, setValue] = useState(initialValue)
  const handleChange = e => setValue(e.target.value)

  return {
    value,
    onChange: handleChange
  }
}

function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title
  })
}
```

`useEffect` 可以告诉 React 组件需要在渲染后执行某些操作。**React 会保存你传递的函数（我们将它称之为 “effect”），并且在执行 DOM 更新之后调用它**。在上面例子的 effect 中，传递的函数设置了 document 的 title 属性，每次 DOM 更新后都会调用该函数。

将 `useEffect` 放在组件内部让我们可以在 effect 中直接访问 state 变量或其他 props。**Hook 使用了 JavaScript 的闭包机制，将它保存在函数作用域中。**。

**默认情况，`useEffect` 会在每次渲染后执行**。当然也可以通过跳过 Effect 进行性能优化，这部分接下来细说。

传递给 `useEffect` 的函数在每次渲染中都会有所不同，这是刻意为之的。**每次重新渲染，都会生成新的 effect，替换掉之前的。某种意义上讲，effect 更像是渲染结果的一部分 —— 每个 effect “属于”一次特定的渲染**。

> 如果你熟悉 React class 的生命周期函数，你可以把 useEffect Hook 看做 componentDidMount，componentDidUpdate 和 componentWillUnmount 这三个函数的组合。
> 与 componentDidMount 或 componentDidUpdate 不同，使用 useEffect 调度的 effect 不会阻塞浏览器更新屏幕，这让你的应用看起来响应更快。大多数情况下，effect 不需要同步地执行。

### 需要清除的 Effect

上面的动态修改标签页标题的副作用属于不需要清除的副作用，而事件监听器属于需要清除的副作用。为了防止引起内存泄露，在 class 组件中，会在 `componentDidMount` 添加的事件监听，然后在 `componentWillUnmount` 生命周期中移除事件监听，**但这样会让处理同一个功能逻辑的代码分布在两个不同的地方，即使这两部分代码都作用于相同的副作用**。

而在函数组件中 `useEffect` 的处理方式就高明许多，`useEffect` 设计是让属于同一副作用的代码在同一个地方执行。**如果你的 effect 返回一个函数，React 将会在执行清除操作时调用它**。这里再举个栗子说明，现在我们要让组件加载时设置监听窗口缩放的事件，组件销毁时移除：

```javascript
import React, { useState, useEffect } from "react"

export default function Hello(prop) {
  const width = useWindowWidth()

  return (
    <div>
      <div>Width: {width}</div>
    </div>
  )
}

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth)
  const handleWindowResize = () => setWidth(window.innerWidth)

  useEffect(() => {
    window.addEventListener("resize", handleWindowResize, false)
    // 这里返回一个函数，React 将会在执行清除操作时调用它
    return () => window.removeEventListener("resize", handleWindowResize)
  })

  return width
}
```

为什么要在 effect 中返回一个函数？ 这是 effect 可选的清除机制。**每个 effect 都可以返回一个清除函数**。如此可以将添加和移除订阅的逻辑放在一起，它们都属于 effect 的一部分。

### Effect 关注点

使用 Effect Hook 其中一个目的就是要解决 class 中生命周期函数经常包含不相关的逻辑，但又把相关逻辑分离到了几个不同方法中的问题。

**Hook 允许我们按照代码的用途分离他们，而不是像生命周期函数那样**。React 将按照 effect 声明的顺序依次调用组件中的每一个 effect。**它会在调用一个新的 effect 之前对前一个 effect 进行清理。**

在某些情况下，每次渲染后都执行清理或者执行 effect 可能会导致性能问题。在 class 组件中，我们可以通过在 `componentDidUpdate` 中添加对 `prevProps` 或 `prevState` 的比较逻辑解决。

```javascript
componentDidUpdate(prevProps, prevState) {
  if (prevState.name !== this.state.name) {
    document.title = `Hello, ${this.state.name}`
  }
}
```

在 Effect Hook 中，判断是否需要重新执行的逻辑更为简单，它被内置到了 `useEffect` 的 Hook API 中。**只要传递数组作为 `useEffect` 的第二个可选参数，React 会判断数组中的值在两次渲染之间有没有发生变化，来决定是否跳过对 effect 的调用，从而实现性能优化**。如果数组中有多个元素，即使只有一个元素发生变化，React 也会执行 effect。

```javascript
useEffect(() => {
  document.title = `Hello, ${this.state.name}`
}, [name])
```

需要注意：**如果要使用此优化方式，请确保数组中包含了所有外部作用域中会随时间变化并且在 effect 中使用的变量，否则你的代码会引用到先前渲染中的旧变量。**

如果想执行只运行一次的 effect（仅在组件挂载和卸载时执行），可以传递一个空数组（[]）作为第二个参数。这就告诉 React 你的 effect 不依赖于 props 或 state 中的任何值，所以它永远都不需要重复执行。

如果你传入了一个空数组（[]），effect 内部的 props 和 state 就会一直拥有其初始值。

> React 会等待浏览器完成画面渲染之后才会延迟调用 useEffect。

## Context Hook

`useContext` 接收一个 context 对象（React.createContext 的返回值）并返回该 context 的当前值。`useContext` 的参数必须是 context 对象本身。

`useContext(MyContext)` 相当于 class 组件中的 `static contextType = MyContext` 或者 `<MyContext.Consumer>`。

当前的 context 值由上层组件中距离当前组件最近的 `<MyContext.Provider>` 的 value prop 决定。调用了 `useContext` 的组件总会在 context 值变化时重新渲染。

```javascript
import React, { useContext } from "react"
import GlobalContext from "../../context"

export default function Hello(prop) {
  const local = useContext(GlobalContext)

  return (
    <div>
      <div>Language: {local}</div>
    </div>
  )
}
```

## Reducer Hook

在之前的 State Hook 介绍中，我们将多个表单的 `useState` 提取出单独的函数来处理：

```javascript
function useFormInput(initialValue) {
  const [value, setValue] = useState(initialValue)
  const handleChange = e => setValue(e.target.value)

  return {
    value,
    onChange: handleChange
  }
}
```

这是 `useReducer` 的雏形，React 内置了 `useReducer` 用来管理状态。它接收一个形如 `(state, action) => newState` 的 reducer，并返回当前的 `state` 以及与其配套的 `dispatch` 方法。

当 state 逻辑较复杂且包含多个子值，或者下一个 state 依赖于之前的 state 时候，可以使用 `useReducer` 代替 `useState`。并且，使用 `useReducer` 还能给那些会触发深更新的组件做性能优化。

```javascript
function useReducer(reducer, initialState) {
  const [state, setState] = useState(initialState)

  function dispatch(action) {
    const nextState = reducer(state, action)
    setState(nextState)
  }

  return [state, dispatch]
}
```

调用方式：

```javascript
function todosReducer(state, action) {
  switch (action.type) {
    case "add":
      return [
        ...state,
        {
          text: action.text,
          completed: false
        }
      ]
    // ... other actions ...
    default:
      return state
  }
}

function Todos() {
  const [todos, dispatch] = useReducer(todosReducer, [])

  function handleAddClick(text) {
    dispatch({ type: "add", text })
  }
  // ...
}
```

## Callback Hook

`useCallback` 把内联回调函数及依赖项数组作为参数传入 `useCallback`，它将返回该回调函数的 memoized 版本，该回调函数仅在某个依赖项改变时才会更新。当你把回调函数传递给经过优化的并使用引用相等性去避免非必要渲染（例如 `shouldComponentUpdate`）的子组件时，它将非常有用。

```javascript
const memoizedCallback = useCallback(() => {
  doSomething(a, b)
}, [a, b])
```

`useCallback(fn, deps)` 相当于 `useMemo(() => fn, deps)`。

> 依赖项数组不会作为参数传给回调函数。虽然从概念上来说它表现为：所有回调函数中引用的值都应该出现在依赖项数组中。

## Memo Hook

`useMemo` 返回一个 memoized 值，把“创建”函数和依赖项数组作为参数传入 `useMemo`，它仅会在某个依赖项改变时才重新计算 memoized 值。这种优化有助于避免在每次渲染时都进行高开销的计算。如果没有提供依赖项数组，`useMemo` 在每次渲染时都会计算新的值。

传入 `useMemo` 的函数会在渲染期间执行。请不要在这个函数内部执行与渲染无关的操作，诸如副作用这类的操作属于 `useEffect` 的适用范畴，而不是 `useMemo`。

```javascript
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b])
```

## Ref Hook

`useRef` 返回一个可变的 ref 对象，其 `.current` 属性被初始化为传入的参数（initialValue）。**返回的 ref 对象在组件的整个生命周期内保持不变**。

```javascript
const refContainer = useRef(initialValue)
```

查看官方示例：

```javascript
function TextInputWithFocusButton() {
  const inputEl = useRef(null)
  const onButtonClick = () => {
    // `current` 指向已挂载到 DOM 上的文本输入元素
    inputEl.current.focus()
  }

  return (
    <>
      <input ref={inputEl} type="text" />
      <button onClick={onButtonClick}>Focus the input</button>
    </>
  )
}
```

`useRef()` 和自建一个 `{current: ...}` 对象的唯一区别是，**`useRef` 会在每次渲染时返回同一个 ref 对象**。

## ImperativeHandle Hook

`useImperativeHandle` 可以让你在使用 ref 时自定义暴露给父组件的实例值。`useImperativeHandle` 应当与 `forwardRef` 一起使用：

```javascript
function FancyInput(props, ref) {
  const inputRef = useRef()
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current.focus()
    }
  }))
  return <input ref={inputRef} />
}
FancyInput = forwardRef(FancyInput)
```

## LayoutEffect Hook

`useLayoutEffect` 与 `useEffect` 相同，**但它会在所有的 DOM 变更之后同步调用 effect**。可以使用它来读取 DOM 布局并同步触发重渲染。在浏览器执行绘制之前，`useLayoutEffect` 内部的更新计划将被同步刷新。**尽可能使用标准的 `useEffect` 以避免阻塞视觉更新**。

## DebugValue Hook

`useDebugValue` 可用于在 React 开发者工具中显示自定义 hook 的标签。

```javascript
// 在开发者工具中的这个 Hook 旁边显示标签
// e.g. "FriendStatus: Online"
useDebugValue(isOnline ? "Online" : "Offline")
```

## Hook 规则

Hook 本质就是 JavaScript 函数，但是在使用它时需要遵循两条规则：

1. **只在最顶层使用 Hook**。不要在循环、条件或嵌套函数中调用 Hook，确保 Hook 在每一次渲染中都按照同样的顺序被调用。这让 React 能够在多次的 `useState` 和 `useEffect` 调用之间保持 hook 状态的正确。
2. **只在 React 函数中调用 Hook**。不要在普通的 JavaScript 函数中调用 Hook。

React 依靠的是 Hook 调用的顺序来确定哪个 state 对应哪个 `useState`，所以一定要确保每次渲染时候的 Hook 顺序是一致的。只有 Hook 的调用顺序在每次渲染中都是相同的，React 才能正确地将内部 state 和对应的 Hook 进行关联，它才能够正常工作。
