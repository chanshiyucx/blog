作为进入新公司接手的第一个 RN 项目，同时也算是自己独立完成的第二个 RN App，开发期间踩了不少坑，掌握了一些之前不为所知新技巧，目前项目已近尾声，故在此做番总结。<!-- more -->

## InteractionManager callback 不执行

在 React Native 中，Interactionmanager 可以将一些耗时较长的工作安排到所有互动或动画完成之后再进行。这样可以保证 JavaScript 动画的流畅运行。

```javascript
InteractionManager.runAfterInteractions(() => {
  // ...耗时较长的同步执行的任务...
})
```

但是在项目中偶尔出现 callback 不执行的情况，最后采用 [官方 issues 特别解决方法](//github.com/facebook/react-native/issues/8624#issuecomment-231040370)。

```javascript
import { InteractionManager } from 'react-native'
export default {
  ...InteractionManager,
  runAfterInteractions:  f => {
    // ensure f get called, timeout at 500ms
    // @gre workaround //github.com/facebook/react-native/issues/8624
    let called = false;
    const timeout = setTimeout(() => { called = true; f() }, 500)
    InteractionManager.runAfterInteractions(() => {
      if (called) return
      clearTimeout(timeout)
      f()
    })
  }
}
```

## 数组对象深拷贝

项目采用 Dva 管理状态，为了启动时 initState 和页面卸载时 resetState，将页面状态单独抽取变量 defaultState，之后初始化和重置状态时直接深拷贝一次即可。

```javascript
const deepCopy = source => {
  if (!source || typeof source !== 'object') {
    throw new Error('error arguments', 'shallowClone')
  }
  const targetObj = source.constructor === Array ? [] : {}
  for (let keys in source) {
    if (source.hasOwnProperty(keys)) {
      if (source[keys] && typeof source[keys] === 'object') {
        targetObj[keys] = deepCopy(source[keys])
      } else {
        targetObj[keys] = source[keys]
      }
    }
  }
  return targetObj
}

// 默认 state
const defaultState = { ... }

export default {
  namespace: 'home',
  state: deepCopy(defaultState),
  reducers: {
    resetState(state) {
      return deepCopy(defaultState)
    },
  }
}
```

## 日期格式化

在项目中使用了一个下拉刷新组件，刷新时需要保存刷新时间并显示在头部，特别使用了一个日期格式化函数。

```javascript
const dateFormat = (dateTime, format) => {
  const date = new Date(dateTime)
  let fmt = format || 'yyyy-MM-dd hh:mm'
  const o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds(),
    'q+': Math.floor((date.getMonth() + 3) / 3),
    S: date.getMilliseconds(),
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (`${date.getFullYear()}`).substr(4 - RegExp.$1.length))
  }
  for (const k in o) {
    if (new RegExp(`(${k})`).test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : ((`00${o[k]}`).substr((`${o[k]}`).length)))
    }
  }
  return fmt
}
```

特别查阅了下日期格式字符串的一般形式 `yyyy-MM-dd HH:mm:ss` 代表 `年-月-日 时:分:秒`，其中月 MM 为大写，时可以大写 HH 也可以小写 hh，其它为小写。HH 与 hh 是大小写为了区分 24 小时制与 12 小时制，双位 HH 和单位 h 代表是否需要前导 0，如凌晨1点2分，HH:mm 显示为 01:02，H:m 显示为1:2。一些示例如下：

- yyyy/yyy/yy/y 显示为 2014/2014/14/4，3 个 y 与 4 个 y 是一样的，为了便于理解多写成 4 个 y；
- MMMM/MMM/MM/M 显示为 一月/一月/01/1，4 个 M 显示全称，3 个 M 显示缩写，不过中文显示是一样的，英文就是 January 和 Jan；
- dddd/ddd/dd/d 显示为 星期三/周三/01/1，在英文中同 M 一样，4 个 d 是全称，3 个是简称；
- HH/H/hh/h 显示为 01/1/01 AM/1 AM；
<!--stackedit_data:
eyJoaXN0b3J5IjpbMTkzNTE5ODQ0NV19
-->