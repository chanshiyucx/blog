# React Props Children 传值

背景是在使用 umijs 框架时，它提供一个根节点 layout。我想在根节点传值到 Route 组件中却不得其法，后来查阅 issues 得到解答。

## props.children 属性

在 React 中 `props.children` 是一个特殊的存在，它表示该组件的所有节点。组件中 `props.children` 的值存在三种可能性：

- 如果当前组件没有子节点，值类型为 `undefined`
- 如果当前组件只有一个子节点，值类型为 `object`
- 如果当前组件有多个子节点，值类型为 `array`

在 umijs 中，layout 根节点也是通过 `props.children` 来引用 Route 页面组件，所以在给 Route 传值时遇到了盲点。

## props.children 传值

在一般的 React 组件中，可以很方便的通过 props 传值，但是在 `props.children` 中如何实现传值呢，也就是怎么样在父组件中对不确定的子组件进行 props 传递呢？

React 提供一个工具方法 `React.Children` 来处理 `props.children`。它提供一些有用的方法来处理 `props.children`：

- `React.Children.map`：用来遍历子节点，而不用担心 `props.children` 的数据类型是 `undefined` 还是 `object`。
- `React.Children.forEach`：同 `React.Children.map`，用来遍历子节点，但不返回对象。
- `React.Children.count`：返回 children 当中的组件总数，和传递给 map 或者 forEach 的回调函数的调用次数一致。
- `React.Children.only`：返回 children 中仅有的子级，否则抛出异常。

同时 React 提供 `React.cloneElement` 方法用来克隆并返回一个新的 ReactElement（内部子元素也会跟着克隆），新返回的元素会保留有旧元素的 props、ref、key，也会集成新的 props。

我们将上面两者配合就能实现 `props.children` 传值：

```javascript
const App = props => {
  const childrenWithProps = React.Children.map(props.children, child => {
    return React.cloneElement(child, { test: 'test' })
  })
  return <>{childrenWithProps}</>
}
```

## 多层传值

在 umijs 中，Layout 与 Route 组件之间隔了两层，所以在 Layout 里传值的话需要 clone 两级，因为第一级是 Switch，然后才是 Route。

```javascript
React.Children.map(children, child => {
  return React.cloneElement(
    child,
    null,
    React.Children.map(child.props.children, child => {
      return React.cloneElement(child, { test: 'test' })
    })
  )
})
```

参考文章：  
[support pass props from layouts to child routes](https://github.com/umijs/umi/pull/1282)
