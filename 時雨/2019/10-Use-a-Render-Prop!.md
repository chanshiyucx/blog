# Use a Render Prop!

在 Vue 中，可以使用 mixins 混入的方式实现代码复用，而在 React 中，代码复用经历从 mixins 到 HOC，然后到 render props 的演变，对于这几种方案的曲折这里梳理下。

## Mixins

在 React 早期版本中可以使用 `React.createClass` 来创建组件，通过 `mixins` 来复用代码：

```javascript
import React from 'react'

// 可以将样板代码放入到一个 mixin 中，让其他组件共享这些代码
const MouseMixin = {
  getInitialState() {
    return { x: 0, y: 0 }
  },

  handleMouseMove(event) {
    this.setState({
      x: event.clientX,
      y: event.clientY
    })
  }
}

const App = React.createClass({
  // 使用 mixin！
  mixins: [MouseMixin],

  render() {
    const { x, y } = this.state

    return (
      <div onMouseMove={this.handleMouseMove}>
        <h1>
          The mouse position is ({x}, {y})
        </h1>
      </div>
    )
  }
})
```

上面代码中，将获取鼠标坐标位置的代码提取封装为 `MouseMixin`，然后在 `createClass` 创建组件时通过 `mixins` 混入到组件中，这样这个新的组件就有了获取鼠标坐标位置的功能。

这和 Vue 的 `mixins` 使用方法类似，在 React 后来的版本中废弃了 `createClass` API，使用 ES6 原生 class 来创建组件，然而这样就存在一个问题 **ES6 class 不支持 mixin**，当然 `mixins` 存在的问题不止这一个，总结如下：

1. **ES6 class 不支持 mixins**
2. **不够直接**：minxins 改变了 state，导致难以追查 state 的来源，尤其是存在多个 mixins 的时候
3. **名字冲突**：如果多个 mixins 要更新同一个 state，可能会相互覆盖

所以为了代替 `mixins`，React 社区决定使用 `HOC（高阶组件）` 来实现代码复用。

## HOC

可以把 HOC 当成一个范式，在这个范式下，代码通过一个类似于`装饰器（decorator）`的技术进行共享。可以将它想象为高阶函数，当然 React 本身也有函数式组件，高阶函数是接收一个函数并返回一个包装后的函数，高阶组件也是同理，接收一个组件然后返回一个包装后的组件。这和 `mixins` 的重要区别是：**HOC 在 `装饰` 组件，而不是 `混入` 需要的行为！**。

通过高阶组件可以改写上面的代码如下：

```javascript
import React from 'react'

// 接收组件返回包装后的组件
const withMouse = Component => {
  return class extends React.Component {
    state = { x: 0, y: 0 }

    handleMouseMove = event => {
      this.setState({
        x: event.clientX,
        y: event.clientY
      })
    }

    render() {
      return (
        <div onMouseMove={this.handleMouseMove}>
          {/* 传入鼠标坐标 prop */}
          <Component {...this.props} mouse={this.state} />
        </div>
      )
    }
  }
}

class App extends React.Component {
  render() {
    // 这里可以得到鼠标位置的 prop，而不再需要维护自己的 state
    const { x, y } = this.props.mouse

    return (
      <div>
        <h1>
          The mouse position is ({x}, {y})
        </h1>
      </div>
    )
  }
}

// 只需要用 withMouse 包裹组件，它就能获得 mouse prop
const AppWithMouse = withMouse(App)

export default AppWithMouse
```

在 ES6 class 的新时代下，HOC 的确是一个能够优雅地解决代码重用问题方案，React 社区也广泛采用。但是它虽然解决了在 ES6 class 中不能使用 `mixins` 的问题，但是仍有两个问题尚未解决：

1. **不够直接**：同 `mixins` 一样，即使采用了 HOC，这个问题依旧存在，在 mixin 中不知道 state 从何而来，在 HOC 中不知道 props 从何而来
2. **名字冲突**：同 `mixins` 一样，两个使用了同名 prop 的 HOC 将会覆盖且没有任何错误提示

另一个 HOC 和 mixin 都有的问题就是，二者使用的是**静态组合**而不是**动态组合**。在 HOC 的范式下，当组件类（如上例中的 AppWithMouse）被创建后，发生了一次静态组合。

我们无法在 render 方法中使用 mixin 或者 HOC，而这恰是 React 动态组合模型的关键。当你在 render 中完成了组合，就可以利用到所有 React 生命期的优势了。

除了上述缺陷，由于 HOC 的实质是包裹组件并创建了一个混入现有组件的 mixin 替代，从 HOC 中返回的组件需要表现得和它包裹的组件尽可能一样，因此会产生非常的的模板代码（boilerplate code）。

总而言之，**使用 ES6 class 创建的 HOC 仍然会遇到和使用 `createClass` 时一样的问题，它只能算一次重构**。

## Render Props

Render Props 是指一种在 React 组件之间使用一个值为函数的 prop 在 React 组件间共享代码的简单技术。

带有 render prop 的组件带有一个返回一个 React 元素的函数并调用该函数而不是实现自己的渲染逻辑，顾名思义就是一个类型为函数的 prop，它让组件知道该渲染什么。

更通俗的说法是：不同于通过 `混入` 或者 `装饰` 来共享组件行为，一个普通组件只需要一个函数 prop 就能够进行一些 state 共享。

其代码实现示例如下：

```javascript
<DataProvider render={data => <h1>Hello {data.target}</h1>} />
```

我们通过 render prop 再改写上面获取鼠标坐标的例子：

```javascript
import React from 'react'
import PropTypes from 'prop-types'

// 与 HOC 不同，我们可以使用具有 render prop 的普通组件来共享代码
class Mouse extends React.Component {
  // 声明 render 是一个函数类型
  static propTypes = {
    render: PropTypes.func.isRequired
  }

  state = { x: 0, y: 0 }

  handleMouseMove = event => {
    this.setState({
      x: event.clientX,
      y: event.clientY
    })
  }

  render() {
    // 通过调用 props.render 函数来实现渲染逻辑
    return <div onMouseMove={this.handleMouseMove}>{this.props.render(this.state)}</div>
  }
}

class App extends React.Component {
  render() {
    return (
      <div>
        <Mouse
          render={({ x, y }) => (
            // render prop 给了我们所需要的 state 来渲染我们想要的
            <h1>
              The mouse position is ({x}, {y})
            </h1>
          )}
        />
      </div>
    )
  }
}

export default App
```

上面例子中，`<Mouse>` 组件实际上是调用了它的 render 方法来将它的 state 暴露给 `<App>` 组件，因此，`<App>` 可以随便按自己的想法使用这个 state。

当然，并非真正需要将 render prop 添加在 JSX 元素的 “attributes” 列表上，也可以嵌套在组件元素的内部，用 `children prop` 替代 `render prop`。这与 **`“children as a function”` 是完全相同的概念**，只是将 `children prop` 当作数据而不是视图来渲染。

这里描述的 render prop 并不是在强调一个名叫 render 的 prop，而是在强调你使用一个函数 prop 去进行渲染的概念。当在设计一个类似的 render props api 时，最好在 propTypes 里声明 `children/render` 应为一个函数类型：

```javascript
class Mouse extends React.Component {
  static propTypes = {
    render: PropTypes.func.isRequired
  }
}
```

使用 render prop 规避了 mixin 和 HOC 中问题：

1. 不够直接：不必再担心 state 或者 props 来自哪里，可以看到通过 render prop 的参数列表看到有哪些 state 或者 props 可供使用
2. 名字冲突：不会有任何的自动属性名称合并

并且，render prop 也不会引入模板代码，因为它不会包裹和装饰其他的组件，它仅仅是一个函数！

另外，这里的组合模型是动态的！每次组合都发生在 render 内部，因此，我们就能利用到 React 生命周期以及自然流动的 props 和 state 带来的优势。使用这个模式，可以将任何 HOC 替换一个具有 render prop 的一般组件。

render prop 远比 HOC 更加强大，任何 HOC 都能使用 render prop 替代，反之则不然。这里使用具有 render prop 的 `<Mouse>` 组件来实现的 `withMouse HOC`：

```javascript
const withMouse = Component => {
  return class extends React.Component {
    render() {
      return <Mouse render={mouse => <Component {...this.props} mouse={mouse} />} />
    }
  }
}
```

使用 render prop 时需要注意：如果你在 render 方法里创建函数，那么使用 render prop 会抵消使用 `React.PureComponent` 带来的优势。这是因为浅 prop 比较对于新 props 总会返回 false，并且在这种情况下每一个 render 对于 render prop 将会生成一个新的值。

如下所示，即使 `<Mouse>` 组件继承自 `React.PureComponent`，但是 `<App>` 每次渲染时都会产生一个新的函数作为 `<Mouse>` 的 render prop，因此抵消了继承自 `React.PureComponent` 的效果。

```javascript
class Mouse extends React.PureComponent {
  /* 省略细节代码 */
}

class App extends React.Component {
  render() {
    return (
      <div>
        <Mouse
          render={({ x, y }) => (
            <h1>
              The mouse position is ({x}, {y})
            </h1>
          )}
        />
      </div>
    )
  }
}
```

参考文章：  
[Use a Render Prop!](https://cdb.reacttraining.com/use-a-render-prop-50de598f11ce)
