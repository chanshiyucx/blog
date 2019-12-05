# React 和 Vue 中 key 的作用

## virtual dom

virtual dom，即虚拟 dom，虚拟 dom 对应的是真实 dom，使用 `document.CreateElement` 和 `document.CreateTextNode` 创建的就是真实节点。

为什么需要虚拟 dom？**其目的是通过简单对象来代替复杂的真实 dom 对象**。我们可新建一个真实 dom 并打印其属性，会发现真实 dom 上绑定了太多属性，如果每次都重新生成新的元素，对性能是巨大的浪费。

```javascript
const mydiv = document.createElement('div')
// 真实 dom 上实现了太多标准
for (const k in mydiv) {
  console.log(k)
}
```

虚拟 dom 上存储了真实 dom 上的一些重要属性，在改变 dom 之前，会先比较相应虚拟 dom 的数据，如果需要改变，才会将改变应用到真实 dom 上，这样能大大提升性能。在 vue 中，一个虚拟节点模型如下：

```javascript
{
  el:  div  // 对真实的节点的引用
  tag: 'DIV',   // 节点的标签
  sel: 'div#v.classA'  // 节点的选择器
  data: null,       // 一个存储节点属性的对象，对应节点的 el[prop] 属性，例如 onclick , style
  children: [], // 存储子节点的数组，每个子节点也是 vnode 结构
  text: null,    // 如果是文本节点，对应文本节点的 textContent，否则为 null
}
```

需要注意的是：**virtual dom 很多时候都不是最优的操作，但它具有普适性，在效率、可维护性之间达平衡**。通过手工优化 dom 或许会比 virtual dom 效率高，但是花费大量时间且维护性不高，virtual dom 只是效率与性能两者间的一种权衡。

virtual dom 另一个重大意义就是提供一个中间层，通过 js 去写 ui，而 ios 安卓之类的负责渲染，就像 RN 一样。

## diff 算法

**比较只会在同层级进行, 不会跨层级比较**，以下图为例，了解下 diff 过程中的 dom 比较流程：

![DOM_树的比较](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/React-和-Vue-中-key-的作用/key-DOM树的比较.jpg)

```markup
<!-- 层级1 -->
<div>
  <!-- 层级2 -->
  <p>
    <!-- 层级3 -->
    <b> aoy </b>
    <span>diff</span>
  </p>
</div>

<!-- 层级1 -->
<div>
  <!-- 层级2 -->
  <p>
    <!-- 层级3 -->
    <b> aoy </b>
  </p>
  <span>diff</span>
</div>
```

上面例子中，我们期望是将层级 3 的 `<span>` 移动到层级 2 的 `<p>` 之后，但实际上并不会如此操作，diff 算法会移除掉之前的 `<span>` 并新建一个 `<span>` 插入到 `<p>` 之后，而不会直接复用，因为**比较只会在同层进行，不会跨层级比较**。

diff 的过程就是调用 patch 函数，就像打补丁一样修改真实 dom。我们可以查看 [vue/patch.js](https://github.com/vuejs/vue/blob/dev/src/core/vdom/patch.js#L715)，精简如下：

```javascript
function patch(oldVnode, vnode) {
  if (sameVnode(oldVnode, vnode)) {
    patchVnode(oldVnode, vnode)
  } else {
    const oEl = oldVnode.el
    let parentEle = api.parentNode(oEl)
    createEle(vnode)
    if (parentEle !== null) {
      api.insertBefore(parentEle, vnode.el, api.nextSibling(oEl))
      api.removeChild(parentEle, oldVnode.el)
      oldVnode = null
    }
  }
  return vnode
}
```

`patch` 函数的两个参数 `oldVnode`、`vnode` 分别代表新旧两个虚拟节点。在进行 `patch` 之前，`vnode` 还没有对应的真实 dom，所以其 `el` 属性为 null。

在 `patch` 时候，先比较新旧两个节点是否值得比较：

```javascript
if (sameVnode(oldVnode, vnode)) {
  patchVnode(oldVnode, vnode)
}

// Vue 真实的 sameVnode 函数
function sameVnode(a, b) {
  return (
    a.key === b.key &&
    ((a.tag === b.tag && a.isComment === b.isComment && isDef(a.data) === isDef(b.data) && sameInputType(a, b)) ||
      (isTrue(a.isAsyncPlaceholder) && a.asyncFactory === b.asyncFactory && isUndef(b.asyncFactory.error)))
  )
}
```

在 [Vue/patch.js\#sameVnode](https://github.com/vuejs/vue/blob/dev/src/core/vdom/patch.js#L35) 中判断是否同一个节点会比较节点的 key、tag 等值，对于 input 标签还会比较 type 等属性，这里不做详细分析。

如果 `sameVnode(a, b)` 返回 false，即新旧两个节点不值得比较的话，会进行节点替换：

```javascript
if (sameVnode(oldVnode, vnode)) {
  /* 值得比较，执行 patchVnode */
  patchVnode(oldVnode, vnode)
} else {
  /* 不值得比较 */
  const oEl = oldVnode.el
  // 取得父节点
  let parentEle = api.parentNode(oEl)
  // 创建真实 dom
  createEle(vnode)
  if (parentEle !== null) {
    // 插入新节点，移除旧节点
    api.insertBefore(parentEle, vnode.el, api.nextSibling(oEl))
    api.removeChild(parentEle, oldVnode.el)
    oldVnode = null
  }
}

return vnode
```

过程如下：

- 取得 `oldvnode.el` 的父节点，`parentEle` 是真实 dom
- `createEle(vnode)` 会为 vnode 创建它的真实 dom，令 `vnode.el` 对应真实 dom
- `parentEle` 将新的 dom 插入，移除旧的 dom，**当不值得比较时，新节点直接把老节点整个替换了**

在 `patch` 之后，会返回 `vnode`，此时 `vnode` 得 `el` 属性已经绑定上了真实 dom 了，而在 `patch` 之前其值为 null。

现在具体分析在新旧节点值得比较时候的执行 `patchVnode` 内的逻辑：

```javascript
function patchVnode(oldVnode, vnode) {
  // 让 vnode.el 引用到现在的真实 dom，两者同步更新
  const el = (vnode.el = oldVnode.el)
  let i,
    oldCh = oldVnode.children,
    ch = vnode.children
  // 1. 相同引用认为没变化
  if (oldVnode === vnode) return
  // 2. 比较文本节点，如果不相等则设置新的文本节点
  if (oldVnode.text !== null && vnode.text !== null && oldVnode.text !== vnode.text) {
    api.setTextContent(el, vnode.text)
  } else {
    updateEle(el, vnode, oldVnode)
    if (oldCh && ch && oldCh !== ch) {
      // 3. 更新子节点
      updateChildren(el, oldCh, ch)
    } else if (ch) {
      // 4. 只有新节点有子节点
      createEle(vnode)
    } else if (oldCh) {
      // 5. 只有旧节点有子节点
      api.removeChildren(el)
    }
  }
}
```

节点的比较有 5 种情况：

1. `if (oldVnode === vnode)`，他们的引用一致，可以认为没有变化。
2. `if(oldVnode.text !== null && vnode.text !== null && oldVnode.text !== vnode.text)`，文本节点的比较，需要修改，则会调用 `Node.textContent = vnode.text`。
3. `if( oldCh && ch && oldCh !== ch )`, 两个节点都有子节点，而且它们不一样，这样会调用 `updateChildren` 函数比较子节点。
4. `else if (ch)`，只有新的节点有子节点，调用 `createEle(vnode)`，`vnode.el` 已经引用了老的 dom 节点，`createEle` 函数会在老 dom 节点上添加子节点。
5. `else if (oldCh)`，新节点没有子节点，老节点有子节点，直接删除老节点。

上面第 3 步进行子节点比较 `updateChildren` 采用的是 `头尾交叉对比`，大致就是 `oldCh` 和 `newCh` 各有两个头尾的变量 `StartIdx` 和 `EndIdx`，它们的 2 个变量相互比较，一共有 4 种比较方式。如果 4 种比较都没匹配，如果设置了 key，就会用 key 进行比较，在比较的过程中，变量会往中间靠，一旦 `StartIdx>EndIdx` 表明 `oldCh` 和 `newCh` 至少有一个已经遍历完了，就会结束比较。交叉对比源码参考 [Vue/patch.js](https://github.com/vuejs/vue/blob/dev/src/core/vdom/patch.js#L424)。

![头尾交叉比较](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/React-和-Vue-中-key-的作用/key-diff2.png)

## key 的作用

这里终于点题了，React/Vue 中 key 的作用是什么呢？根据上面关于 diff 算法描述可以解释，设置 key 和不设置 key 的区别：**不设 key，newCh 和 oldCh 只会进行头尾两端的相互比较，设 key 后，除了头尾两端的比较外，还会从用 key 生成的对象 oldKeyToIdx 中查找匹配的节点，所以为节点设置 key 可以更高效的利用 dom。**

> key 的特殊属性主要用在 Vue 的虚拟 DOM 算法，在新旧 nodes 对比时辨识 VNodes。如果不使用 key，Vue 会使用一种最大限度减少动态元素并且尽可能的尝试修复/再利用相同类型元素的算法。使用 key，它会基于 key 的变化重新排列元素顺序，并且会移除 key 不存在的元素。

参考文章：  
[解析 vue2.0 的 diff 算法](https://github.com/aooy/blog/issues/2)  
[写 React / Vue 项目时为什么要在列表组件中写 key，其作用是什么？](https://github.com/Advanced-Frontend/Daily-Interview-Question/issues/1)
