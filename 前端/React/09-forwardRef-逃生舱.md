# [forwardRef 逃生舱](https://www.zhihu.com/question/521311581/answer/2530942394)

## 为什么是逃生舱？

先思考一个问题：为什么 ref、effect 被归类到「逃生舱」中？

这是因为二者操作的都是 **「脱离 React 控制的因素」**。

effect 中处理的是 **「副作用」**。比如：

- 在 useEffect 中修改了 `document.title`。而 `document.title` 不属于 React 中的状态，React 无法感知他的变化，所以被归类到 effect 中。
- 「使 DOM 聚焦」需要调用 `element.focus()`，直接执行 DOM API 也是不受 React 控制的。

虽然他们是 **「脱离 React 控制的因素」**，但为了保证应用的健壮，React 也要尽可能防止他们失控。

## 失控的 Ref

对于 Ref，什么叫失控呢？

首先来看「不失控」的情况：

- 执行 `ref.current` 的 focus、blur 等方法
- 执行 `ref.current.scrollIntoView` 使 element 滚动到视野内
- 执行 `ref.current.getBoundingClientRect` 测量 DOM 尺寸

这些情况下，虽然我们操作了 DOM，但涉及的都是 **「React 控制范围外的因素」**，所以不算失控。

再来看「失控」的情况：

- 执行 `ref.current.remove` 移除 DOM
- 执行 `ref.current.appendChild` 插入子节点

同样是操作 DOM，但这些属于 **「React 控制范围内的因素」**，通过 ref 执行这些操作就属于失控的情况。

## 演示

下面这个示例就是 **「使用 Ref 操作 DOM 造成的失控情况」**。

```jsx
export default function Counter() {
  const [show, setShow] = useState(true)
  const ref = useRef(null)

  return (
    <div>
      <button
        onClick={() => {
          setShow(!show)
        }}
      >
        Toggle with setState
      </button>
      <button
        onClick={() => {
          ref.current.remove()
        }}
      >
        Remove from the DOM
      </button>
      {show && <p ref={ref}>Hello world</p>}
    </div>
  )
}
```

示例中两个按钮：

- 「按钮 1」通过 React 控制的方式移除 P 节点。
- 「按钮 2」直接操作 DOM 移除 P 节点。

如果这两种「移除 P 节点」的方式混用，那么先点击「按钮 1」再点击「按钮 2」就会报错：

![ref失控](/IMAGES/forwardRef-逃生舱/ref失控.png)

## 如何限制失控

现在问题来了，既然叫「失控」了，那就是 React 没法控制的（React 总不能限制开发者不能使用 DOM API 吧？），那如何限制失控呢？

在 React 中，组件可以分为：高阶组件和低阶组件。

其中「低阶组件」指那些 **「基于 DOM 封装的组件」**，在「低阶组件」中，是可以直接将 ref 指向 DOM 的，比如下面的组件，直接基于 input 节点封装：

```jsx
function MyInput(props) {
  const ref = useRef(null)
  return <input ref={ref} {...props} />
}
```

「高阶组件」指那些 **「基于低阶组件封装的组件」**，比如下面的 Form 组件，基于 Input 组件封装：

```jsx
function Form() {
  return (
    <>
      <MyInput />
    </>
  )
}
```

**「高阶组件」无法直接将 ref 指向 DOM**，这一限制就将「ref 失控」的范围控制在单个组件内，不会出现跨越组件的「ref 失控」。

以下为例，如果我们想在 Form 组件中点击按钮，操作 input 聚焦，点击后会报错：：

```jsx
function MyInput(props) {
  return <input {...props} />
}

function Form() {
  const inputRef = useRef(null)

  function handleClick() {
    inputRef.current.focus()
  }

  return (
    <>
      <MyInput ref={inputRef} />
      <button onClick={handleClick}>input聚焦</button>
    </>
  )
}
```

![input聚焦](/IMAGES/forwardRef-逃生舱/input聚焦.png)

这是因为在 Form 组件中向 MyInput 传递 ref 失败了，`inputRef.current` 并没有指向 input 节点。

究其原因，就是上面说的 **「为了将 ref 失控的范围控制在单个组件内，React 默认情况下不支持跨组件传递 ref」**。

## 人为取消限制

如果一定要取消这个限制，可以使用 `forwardRef`（forward 在这里是「传递」的意思）显式传递 ref：

```jsx
const MyInput = forwardRef((props, ref) => {
  return <input {...props} ref={ref} />
})

function Form() {
  const inputRef = useRef(null)

  function handleClick() {
    inputRef.current.focus()
  }

  return (
    <>
      <MyInput ref={inputRef} />
      <button onClick={handleClick}>Focus the input</button>
    </>
  )
}
```

使用 forwardRef 后，就能跨组件传递 ref。在例子中，我们将 inputRef 从 Form 跨组件传递到 MyInput 中，并与 input 产生关联。

从「ref 失控」的角度看，forwardRef 的意图就很明显了：既然开发者手动调用 forwardRef 破除「防止 ref 失控的限制」，那他应该知道自己在做什么，也应该自己承担相应的风险。同时，有了 forwardRef 的存在，发生「ref 相关错误」后也更容易定位错误。

## useImperativeHandle

除了 **「限制跨组件传递 ref」** 外，还有一种「防止 ref 失控的措施」，那就是 `useImperativeHandle`，他的逻辑是这样的：既然「ref 失控」是由于「使用了不该被使用的 DOM 方法」（比如 appendChild），那我可以限制 **「ref 中只存在可以被使用的方法」**。

> `useImperativeHandle` 可以让你在使用 ref 时自定义暴露给父组件的实例值。useImperativeHandle 应当与 forwardRef 一起使用：

用 `useImperativeHandle` 修改我们的 MyInput 组件：

```jsx
const MyInput = forwardRef((props, ref) => {
  const realInputRef = useRef(null)
  useImperativeHandle(ref, () => ({
    focus() {
      realInputRef.current.focus()
    },
  }))
  return <input {...props} ref={realInputRef} />
})
```

现在，Form 组件中通过 `inputRef.current` 只能取到如下数据结构：

```js
{
  focus() {
    realInputRef.current.focus();
  },
}
```

就杜绝了 **「开发者通过 ref 取到 DOM 后，执行不该被使用的 API，出现 ref 失控」** 的情况。

## 总结

- 正常情况，ref 的使用比较少，他是作为「逃生舱」而存在的。
- 为了防止错用/滥用导致 ref 失控，React 限制「默认情况下，不能跨组件传递 ref」。
- 为了破除这种限制，可以使用 `forwardRef`。
- 为了减少 ref 对 DOM 的滥用，可以使用 `useImperativeHandle` 限制 ref 传递的数据结构。
